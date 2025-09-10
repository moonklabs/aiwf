/**
 * Pattern definitions for parsing Feature IDs from Git commit messages
 * 
 * Supported formats:
 * - FL### - Direct reference
 * - [FL###] - Bracket reference
 * - (FL###) - Parenthesis reference
 * - feat(FL###): - Conventional Commit format
 * - fix(FL###): - Bug fix format
 * - #FL### - Hash reference
 */

const FEATURE_ID_PATTERNS = {
  // Basic Feature ID pattern (FL + 3-digit number)
  DIRECT: /\bFL\d{3}\b/g,
  
  // Feature ID in brackets
  BRACKETED: /\[FL\d{3}\]/g,
  
  // Feature ID in parentheses
  PARENTHETICAL: /\(FL\d{3}\)/g,
  
  // Conventional Commit format
  CONVENTIONAL: /(?:feat|fix|docs|style|refactor|perf|test|chore)\(FL\d{3}\):/g,
  
  // Hash reference format
  HASH: /#FL\d{3}\b/g,
  
  // Master pattern combining all patterns
  MASTER: /(?:\b|#|\[|\()FL\d{3}(?:\]|\)|\b)|(?:feat|fix|docs|style|refactor|perf|test|chore)\(FL\d{3}\):/g
};

/**
 * Commit type definitions
 */
const COMMIT_TYPES = {
  feat: 'New feature',
  fix: 'Bug fix',
  docs: 'Documentation changes',
  style: 'Code style changes',
  refactor: 'Refactoring',
  perf: 'Performance improvements',
  test: 'Test additions/modifications',
  chore: 'Build process or tool changes'
};

/**
 * Extract Feature IDs from commit message
 * @param {string} message - Commit message
 * @returns {Array<string>} - Extracted Feature ID array (duplicates removed)
 */
function extractFeatureIds(message) {
  const matches = message.match(FEATURE_ID_PATTERNS.MASTER) || [];
  
  // Extract only Feature IDs and remove duplicates
  const featureIds = matches.map(match => {
    // Extract only FL### part from pattern
    const idMatch = match.match(/FL\d{3}/);
    return idMatch ? idMatch[0] : null;
  }).filter(Boolean);
  
  // Remove duplicates
  return [...new Set(featureIds)];
}

/**
 * Extract commit type from commit message
 * @param {string} message - Commit message
 * @returns {string|null} - Commit type or null
 */
function extractCommitType(message) {
  const conventionalMatch = message.match(/^(feat|fix|docs|style|refactor|perf|test|chore)(?:\(.*?\))?:/);
  return conventionalMatch ? conventionalMatch[1] : null;
}

/**
 * Check if commit message is Feature-related
 * @param {string} message - Commit message
 * @returns {boolean}
 */
function isFeatureRelatedCommit(message) {
  return FEATURE_ID_PATTERNS.MASTER.test(message);
}

/**
 * Extract Feature ID from branch name
 * @param {string} branchName - Branch name
 * @returns {string|null} - Feature ID or null
 */
function extractFeatureIdFromBranch(branchName) {
  // Support feature/FL###-description format
  const match = branchName.match(/feature\/FL(\d{3})/);
  return match ? `FL${match[1]}` : null;
}

module.exports = {
  FEATURE_ID_PATTERNS,
  COMMIT_TYPES,
  extractFeatureIds,
  extractCommitType,
  isFeatureRelatedCommit,
  extractFeatureIdFromBranch
};