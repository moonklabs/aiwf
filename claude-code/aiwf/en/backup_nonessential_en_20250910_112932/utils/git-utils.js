const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
const path = require('path');
const { extractFeatureIds, extractFeatureIdFromBranch } = require('../config/commit-patterns');

/**
 * Utility module for extracting Git commit information
 */

/**
 * Execute Git command
 * @param {string} command - Git command to execute
 * @param {string} cwd - Working directory (optional)
 * @returns {Promise<string>} - Command output
 */
async function runGitCommand(command, cwd = process.cwd()) {
  try {
    const { stdout, stderr } = await execAsync(`git ${command}`, { cwd });
    if (stderr && !stderr.includes('warning:')) {
      throw new Error(`Git command failed: ${stderr}`);
    }
    return stdout.trim();
  } catch (error) {
    throw new Error(`Git command execution failed: ${error.message}`);
  }
}

/**
 * Get current branch name
 * @returns {Promise<string>} - Branch name
 */
async function getCurrentBranch() {
  return await runGitCommand('rev-parse --abbrev-ref HEAD');
}

/**
 * Commit information object structure
 * @typedef {Object} CommitInfo
 * @property {string} hash - Commit hash
 * @property {string} author - Author
 * @property {string} date - Commit date
 * @property {string} message - Commit message
 * @property {Array<string>} featureIds - Related Feature ID list
 */

/**
 * Get detailed information for a specific commit
 * @param {string} commitHash - Commit hash
 * @returns {Promise<CommitInfo>} - Commit information
 */
async function getCommitInfo(commitHash) {
  const format = '%H%n%an%n%aI%n%s%n%b';
  const output = await runGitCommand(`show -s --format="${format}" ${commitHash}`);
  const lines = output.split('\n');
  
  const message = lines.slice(3).join('\n').trim();
  const featureIds = extractFeatureIds(message);
  
  return {
    hash: lines[0],
    author: lines[1],
    date: lines[2],
    message: message,
    featureIds: featureIds
  };
}

/**
 * Find Feature-related commits in a date range
 * @param {string} since - Start date (e.g., '2025-01-01')
 * @param {string} until - End date (optional)
 * @returns {Promise<Array<CommitInfo>>} - Feature-related commit list
 */
async function getFeatureRelatedCommits(since, until = 'HEAD') {
  try {
    // Construct git log command
    let command = `log --since="${since}"`;
    if (until !== 'HEAD') {
      command += ` --until="${until}"`;
    }
    command += ' --pretty=format:"%H" --grep="FL[0-9]\\{3\\}"';
    
    const output = await runGitCommand(command);
    if (!output) {
      return [];
    }
    
    const commitHashes = output.split('\n').filter(Boolean);
    const commits = [];
    
    for (const hash of commitHashes) {
      const commitInfo = await getCommitInfo(hash);
      if (commitInfo.featureIds.length > 0) {
        commits.push(commitInfo);
      }
    }
    
    return commits;
  } catch (error) {
    console.error('Error getting feature related commits:', error);
    return [];
  }
}

/**
 * Find all commits related to a specific Feature ID
 * @param {string} featureId - Feature ID (e.g., 'FL001')
 * @returns {Promise<Array<CommitInfo>>} - Commit list for the Feature
 */
async function getCommitsByFeatureId(featureId) {
  try {
    const command = `log --pretty=format:"%H" --grep="${featureId}"`;
    const output = await runGitCommand(command);
    
    if (!output) {
      return [];
    }
    
    const commitHashes = output.split('\n').filter(Boolean);
    const commits = [];
    
    for (const hash of commitHashes) {
      const commitInfo = await getCommitInfo(hash);
      if (commitInfo.featureIds.includes(featureId)) {
        commits.push(commitInfo);
      }
    }
    
    return commits;
  } catch (error) {
    console.error(`Error getting commits for feature ${featureId}:`, error);
    return [];
  }
}

/**
 * Extract Feature ID from current branch
 * @returns {Promise<string|null>} - Feature ID or null
 */
async function getCurrentFeatureId() {
  try {
    const branch = await getCurrentBranch();
    return extractFeatureIdFromBranch(branch);
  } catch (error) {
    console.error('Error getting current feature ID:', error);
    return null;
  }
}

/**
 * Find Feature-related commits from recent N commits
 * @param {number} count - Number of commits to check
 * @returns {Promise<Array<CommitInfo>>} - Feature-related commit list
 */
async function getRecentFeatureCommits(count = 10) {
  try {
    const command = `log -${count} --pretty=format:"%H"`;
    const output = await runGitCommand(command);
    
    if (!output) {
      return [];
    }
    
    const commitHashes = output.split('\n').filter(Boolean);
    const featureCommits = [];
    
    for (const hash of commitHashes) {
      const commitInfo = await getCommitInfo(hash);
      if (commitInfo.featureIds.length > 0) {
        featureCommits.push(commitInfo);
      }
    }
    
    return featureCommits;
  } catch (error) {
    console.error('Error getting recent feature commits:', error);
    return [];
  }
}

/**
 * Check if directory is a Git repository
 * @param {string} dir - Directory to check
 * @returns {Promise<boolean>}
 */
async function isGitRepository(dir = process.cwd()) {
  try {
    await runGitCommand('rev-parse --git-dir', dir);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get list of changed files
 * @returns {Promise<Array<string>>} - List of changed file paths
 */
async function getChangedFiles() {
  try {
    const output = await runGitCommand('diff --name-only HEAD');
    return output ? output.split('\n').filter(Boolean) : [];
  } catch (error) {
    console.error('Error getting changed files:', error);
    return [];
  }
}

module.exports = {
  runGitCommand,
  getCurrentBranch,
  getCommitInfo,
  getFeatureRelatedCommits,
  getCommitsByFeatureId,
  getCurrentFeatureId,
  getRecentFeatureCommits,
  isGitRepository,
  getChangedFiles
};