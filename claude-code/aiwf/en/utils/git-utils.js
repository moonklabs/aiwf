const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
const path = require('path');
const { extractFeatureIds, extractFeatureIdFromBranch } = require('../config/commit-patterns');

/**
 * Git 커밋 정보를 추출하는 유틸리티 모듈
 */

/**
 * Git 명령어 실행
 * @param {string} command - 실행할 git 명령어
 * @param {string} cwd - 작업 디렉토리 (선택사항)
 * @returns {Promise<string>} - 명령어 출력
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
 * 현재 브랜치 이름 가져오기
 * @returns {Promise<string>} - 브랜치 이름
 */
async function getCurrentBranch() {
  return await runGitCommand('rev-parse --abbrev-ref HEAD');
}

/**
 * 커밋 정보 객체 구조
 * @typedef {Object} CommitInfo
 * @property {string} hash - 커밋 해시
 * @property {string} author - 작성자
 * @property {string} date - 커밋 날짜
 * @property {string} message - 커밋 메시지
 * @property {Array<string>} featureIds - 관련 Feature ID 목록
 */

/**
 * 특정 커밋의 상세 정보 가져오기
 * @param {string} commitHash - 커밋 해시
 * @returns {Promise<CommitInfo>} - 커밋 정보
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
 * 커밋 범위에서 Feature 관련 커밋 찾기
 * @param {string} since - 시작 날짜 (예: '2025-01-01')
 * @param {string} until - 종료 날짜 (선택사항)
 * @returns {Promise<Array<CommitInfo>>} - Feature 관련 커밋 목록
 */
async function getFeatureRelatedCommits(since, until = 'HEAD') {
  try {
    // git log 명령어 구성
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
 * 특정 Feature ID와 관련된 모든 커밋 찾기
 * @param {string} featureId - Feature ID (예: 'FL001')
 * @returns {Promise<Array<CommitInfo>>} - 해당 Feature의 커밋 목록
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
 * 현재 브랜치의 Feature ID 추출
 * @returns {Promise<string|null>} - Feature ID 또는 null
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
 * 최근 N개의 커밋에서 Feature 관련 커밋 찾기
 * @param {number} count - 확인할 커밋 수
 * @returns {Promise<Array<CommitInfo>>} - Feature 관련 커밋 목록
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
 * Git 저장소인지 확인
 * @param {string} dir - 확인할 디렉토리
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
 * 변경된 파일 목록 가져오기
 * @returns {Promise<Array<string>>} - 변경된 파일 경로 목록
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