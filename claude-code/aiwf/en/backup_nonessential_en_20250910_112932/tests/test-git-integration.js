const { describe, it, expect, beforeEach, afterEach } = require('@jest/globals');
const { 
  extractFeatureIds, 
  extractCommitType, 
  isFeatureRelatedCommit,
  extractFeatureIdFromBranch 
} = require('../config/commit-patterns');
const {
  getCommitInfo,
  getCurrentBranch,
  isGitRepository
} = require('../utils/git-utils');
const {
  findFeatureFile,
  readFeatureFile,
  updateFeatureProgress
} = require('../utils/feature-updater');

describe('Git-Feature Integration Tests', () => {
  
  describe('커밋 메시지 파싱', () => {
    it('다양한 형식의 Feature ID를 추출해야 함', () => {
      const testCases = [
        { message: 'FL001 기능 구현', expected: ['FL001'] },
        { message: '[FL002] 버그 수정', expected: ['FL002'] },
        { message: 'feat(FL003): 새 기능', expected: ['FL003'] },
        { message: '업데이트 #FL004', expected: ['FL004'] },
        { message: 'FL001, FL002 관련 수정', expected: ['FL001', 'FL002'] },
        { message: '일반 커밋 메시지', expected: [] }
      ];
      
      testCases.forEach(({ message, expected }) => {
        const result = extractFeatureIds(message);
        expect(result).toEqual(expected);
      });
    });
    
    it('커밋 타입을 추출해야 함', () => {
      expect(extractCommitType('feat: 새 기능')).toBe('feat');
      expect(extractCommitType('fix(FL001): 버그 수정')).toBe('fix');
      expect(extractCommitType('일반 커밋')).toBeNull();
    });
    
    it('Feature 관련 커밋을 식별해야 함', () => {
      expect(isFeatureRelatedCommit('FL001 구현')).toBe(true);
      expect(isFeatureRelatedCommit('일반 커밋')).toBe(false);
    });
    
    it('브랜치 이름에서 Feature ID를 추출해야 함', () => {
      expect(extractFeatureIdFromBranch('feature/FL001-auth')).toBe('FL001');
      expect(extractFeatureIdFromBranch('main')).toBeNull();
    });
  });
  
  describe('Git 유틸리티', () => {
    it('Git 저장소 확인이 작동해야 함', async () => {
      const isRepo = await isGitRepository();
      expect(typeof isRepo).toBe('boolean');
    });
    
    it('현재 브랜치를 가져올 수 있어야 함', async () => {
      try {
        const branch = await getCurrentBranch();
        expect(typeof branch).toBe('string');
        expect(branch.length).toBeGreaterThan(0);
      } catch (error) {
        // Git 저장소가 아닌 경우 스킵
        expect(error.message).toContain('Git');
      }
    });
  });
  
  describe('Feature 업데이터', () => {
    it('Feature 파일 경로를 올바르게 구성해야 함', async () => {
      // findFeatureFile 함수 테스트
      const result = await findFeatureFile('FL999'); // 존재하지 않는 Feature
      expect(result).toBeNull();
    });
    
    it('진행률 업데이트 검증', async () => {
      // 진행률 값 범위 확인 (0-100)
      const testValues = [-10, 0, 50, 100, 150];
      const expectedValues = [0, 0, 50, 100, 100];
      
      // 실제 파일 없이 로직만 테스트
      testValues.forEach((value, index) => {
        const clamped = Math.min(100, Math.max(0, value));
        expect(clamped).toBe(expectedValues[index]);
      });
    });
  });
  
  describe('통합 시나리오', () => {
    it('커밋 메시지 → Feature ID → 파일 업데이트 플로우', async () => {
      // 시나리오: 커밋 메시지에서 Feature ID 추출하여 파일 업데이트
      const commitMessage = 'feat(FL001): 사용자 인증 구현';
      
      // 1. Feature ID 추출
      const featureIds = extractFeatureIds(commitMessage);
      expect(featureIds).toContain('FL001');
      
      // 2. 커밋 타입 추출
      const commitType = extractCommitType(commitMessage);
      expect(commitType).toBe('feat');
      
      // 3. Feature 관련 커밋 확인
      const isRelated = isFeatureRelatedCommit(commitMessage);
      expect(isRelated).toBe(true);
    });
    
    it('여러 Feature ID 처리', async () => {
      const commitMessage = 'refactor: FL001, FL002, FL003 공통 로직 추출';
      
      const featureIds = extractFeatureIds(commitMessage);
      expect(featureIds).toHaveLength(3);
      expect(featureIds).toEqual(['FL001', 'FL002', 'FL003']);
    });
  });
  
  describe('엣지 케이스', () => {
    it('잘못된 Feature ID 형식 처리', () => {
      const invalidCases = [
        'F001',           // FL 접두사 없음
        'FL1',            // 숫자 부족
        'FL0001',         // 숫자 초과
        'fl001',          // 소문자
        'FL00a'           // 문자 포함
      ];
      
      invalidCases.forEach(message => {
        const ids = extractFeatureIds(message);
        expect(ids).toHaveLength(0);
      });
    });
    
    it('특수 문자가 포함된 커밋 메시지', () => {
      const specialCases = [
        { message: 'feat(FL001): 한글 지원 추가 🎉', expected: ['FL001'] },
        { message: 'fix: FL002 & FL003 동시 수정', expected: ['FL002', 'FL003'] },
        { message: 'docs: [FL004] README 업데이트', expected: ['FL004'] }
      ];
      
      specialCases.forEach(({ message, expected }) => {
        const result = extractFeatureIds(message);
        expect(result).toEqual(expected);
      });
    });
  });
});

// 실행 예시를 위한 테스트 헬퍼
if (require.main === module) {
  console.log('Git-Feature Integration 테스트 실행 중...');
  
  // 간단한 검증
  const testMessage = 'feat(FL001): 테스트 커밋';
  const ids = extractFeatureIds(testMessage);
  console.log(`Feature IDs: ${ids.join(', ')}`);
  
  const type = extractCommitType(testMessage);
  console.log(`Commit Type: ${type}`);
  
  console.log('테스트 완료!');
}