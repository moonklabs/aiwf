/**
 * Git 커밋 메시지에서 Feature ID를 파싱하기 위한 패턴 정의
 * 
 * 지원하는 형식:
 * - FL### - 직접 참조
 * - [FL###] - 대괄호 참조
 * - (FL###) - 괄호 참조
 * - feat(FL###): - Conventional Commit 형식
 * - fix(FL###): - 버그 수정 형식
 * - #FL### - 해시 참조
 */

const FEATURE_ID_PATTERNS = {
  // 기본 Feature ID 패턴 (FL + 3자리 숫자)
  DIRECT: /\bFL\d{3}\b/g,
  
  // 대괄호 안의 Feature ID
  BRACKETED: /\[FL\d{3}\]/g,
  
  // 괄호 안의 Feature ID
  PARENTHETICAL: /\(FL\d{3}\)/g,
  
  // Conventional Commit 형식
  CONVENTIONAL: /(?:feat|fix|docs|style|refactor|perf|test|chore)\(FL\d{3}\):/g,
  
  // 해시 참조 형식
  HASH: /#FL\d{3}\b/g,
  
  // 모든 패턴을 통합한 마스터 패턴
  MASTER: /(?:\b|#|\[|\()FL\d{3}(?:\]|\)|\b)|(?:feat|fix|docs|style|refactor|perf|test|chore)\(FL\d{3}\):/g
};

/**
 * 커밋 타입 정의
 */
const COMMIT_TYPES = {
  feat: '새로운 기능',
  fix: '버그 수정',
  docs: '문서 변경',
  style: '코드 스타일 변경',
  refactor: '리팩토링',
  perf: '성능 개선',
  test: '테스트 추가/수정',
  chore: '빌드 프로세스 또는 도구 변경'
};

/**
 * 커밋 메시지에서 Feature ID 추출
 * @param {string} message - 커밋 메시지
 * @returns {Array<string>} - 추출된 Feature ID 배열 (중복 제거)
 */
function extractFeatureIds(message) {
  const matches = message.match(FEATURE_ID_PATTERNS.MASTER) || [];
  
  // Feature ID만 추출하고 중복 제거
  const featureIds = matches.map(match => {
    // 패턴에서 FL### 부분만 추출
    const idMatch = match.match(/FL\d{3}/);
    return idMatch ? idMatch[0] : null;
  }).filter(Boolean);
  
  // 중복 제거
  return [...new Set(featureIds)];
}

/**
 * 커밋 메시지에서 커밋 타입 추출
 * @param {string} message - 커밋 메시지
 * @returns {string|null} - 커밋 타입 또는 null
 */
function extractCommitType(message) {
  const conventionalMatch = message.match(/^(feat|fix|docs|style|refactor|perf|test|chore)(?:\(.*?\))?:/);
  return conventionalMatch ? conventionalMatch[1] : null;
}

/**
 * 커밋 메시지가 Feature 관련인지 확인
 * @param {string} message - 커밋 메시지
 * @returns {boolean}
 */
function isFeatureRelatedCommit(message) {
  return FEATURE_ID_PATTERNS.MASTER.test(message);
}

/**
 * 브랜치 이름에서 Feature ID 추출
 * @param {string} branchName - 브랜치 이름
 * @returns {string|null} - Feature ID 또는 null
 */
function extractFeatureIdFromBranch(branchName) {
  // feature/FL###-description 형식 지원
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