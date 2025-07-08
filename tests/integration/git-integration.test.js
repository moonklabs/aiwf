/**
 * Git 통합 Feature 추적 테스트
 */

import { testUtils, testFixtures } from './setup.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Git 통합 Feature 추적 테스트', () => {
  let testProjectDir;
  let aiwfDir;

  beforeEach(async () => {
    testProjectDir = await testUtils.createTempDir('git-integration-');
    aiwfDir = await testUtils.createTestProjectStructure(testProjectDir);
  });

  afterEach(async () => {
    await testUtils.cleanupTempDir(testProjectDir);
  });

  describe('Git 커밋 메시지 파싱 테스트', () => {
    test('Feature ID를 포함한 커밋 메시지 파싱', () => {
      const commitMessages = [
        'feat: Feature Ledger 시스템 구현 [FEATURE_001]',
        'fix: 버그 수정 [FEATURE_002]',
        'docs: 문서 업데이트 [FEATURE_003]',
        'refactor: 코드 리팩토링 [FEATURE_004]'
      ];

      const parseCommitMessage = (message) => {
        const match = message.match(/\[([A-Z_0-9]+)\]/);
        return match ? match[1] : null;
      };

      commitMessages.forEach(message => {
        const featureId = parseCommitMessage(message);
        expect(featureId).toBeTruthy();
        expect(featureId).toMatch(/^FEATURE_\d+$/);
      });
    });

    test('Feature ID가 없는 커밋 메시지 처리', () => {
      const commitMessages = [
        'feat: 새로운 기능 추가',
        'fix: 버그 수정',
        'docs: 문서 업데이트'
      ];

      const parseCommitMessage = (message) => {
        const match = message.match(/\[([A-Z_0-9]+)\]/);
        return match ? match[1] : null;
      };

      commitMessages.forEach(message => {
        const featureId = parseCommitMessage(message);
        expect(featureId).toBeNull();
      });
    });
  });

  describe('Git 브랜치와 Feature 연동 테스트', () => {
    test('Feature 브랜치 명명 규칙 검증', () => {
      const branchNames = [
        'feature/FEATURE_001_ledger_system',
        'feature/FEATURE_002_ai_persona',
        'feature/FEATURE_003_context_compression'
      ];

      const parseBranchName = (branchName) => {
        const match = branchName.match(/^feature\/([A-Z_0-9]+)_(.+)$/);
        return match ? { featureId: match[1], description: match[2] } : null;
      };

      branchNames.forEach(branchName => {
        const parsed = parseBranchName(branchName);
        expect(parsed).toBeTruthy();
        expect(parsed.featureId).toMatch(/^FEATURE_\d+$/);
        expect(parsed.description).toBeTruthy();
      });
    });

    test('잘못된 브랜치 명명 규칙 처리', () => {
      const invalidBranchNames = [
        'feature/invalid-branch',
        'bugfix/some-fix',
        'main',
        'develop'
      ];

      const parseBranchName = (branchName) => {
        const match = branchName.match(/^feature\/([A-Z_0-9]+)_(.+)$/);
        return match ? { featureId: match[1], description: match[2] } : null;
      };

      invalidBranchNames.forEach(branchName => {
        const parsed = parseBranchName(branchName);
        expect(parsed).toBeNull();
      });
    });
  });

  describe('Feature 진행 상태 추적 테스트', () => {
    test('Feature 상태 업데이트 시뮬레이션', async () => {
      const featureLedgerDir = path.join(aiwfDir, '06_FEATURE_LEDGERS');
      const feature = testFixtures.featureLedger;
      const featureFilePath = path.join(featureLedgerDir, `${feature.id}.md`);

      // 초기 Feature 생성
      await fs.writeFile(featureFilePath, `---
id: ${feature.id}
title: ${feature.title}
status: planned
priority: ${feature.priority}
milestone: ${feature.milestone}
created_at: ${feature.created_at}
updated_at: ${feature.updated_at}
---

# Feature: ${feature.title}

## Description
${feature.description}

## Status
${feature.status}
`);

      // Git 이벤트 시뮬레이션: 브랜치 생성 → 개발 시작
      const updateFeatureStatus = async (newStatus) => {
        const currentContent = await fs.readFile(featureFilePath, 'utf8');
        const updatedContent = currentContent.replace(
          /status: \w+/,
          `status: ${newStatus}`
        ).replace(
          /updated_at: .+/,
          `updated_at: ${new Date().toISOString()}`
        );
        await fs.writeFile(featureFilePath, updatedContent);
      };

      // 상태 변경 시뮬레이션
      await updateFeatureStatus('in_progress');
      let parsedContent = await testUtils.parseMarkdownFile(featureFilePath);
      expect(parsedContent.metadata.status).toBe('in_progress');

      await updateFeatureStatus('completed');
      parsedContent = await testUtils.parseMarkdownFile(featureFilePath);
      expect(parsedContent.metadata.status).toBe('completed');
    });

    test('Feature 진행률 계산 테스트', async () => {
      const featureLedgerDir = path.join(aiwfDir, '06_FEATURE_LEDGERS');
      
      // 여러 Feature 생성
      const features = [
        { ...testFixtures.featureLedger, id: 'FEATURE_001', status: 'completed' },
        { ...testFixtures.featureLedger, id: 'FEATURE_002', status: 'in_progress' },
        { ...testFixtures.featureLedger, id: 'FEATURE_003', status: 'planned' },
        { ...testFixtures.featureLedger, id: 'FEATURE_004', status: 'completed' }
      ];

      for (const feature of features) {
        const featureFilePath = path.join(featureLedgerDir, `${feature.id}.md`);
        await fs.writeFile(featureFilePath, `---
id: ${feature.id}
title: ${feature.title}
status: ${feature.status}
---

# Feature: ${feature.title}
`);
      }

      // Feature 진행률 계산
      const files = await fs.readdir(featureLedgerDir);
      const mdFiles = files.filter(file => file.endsWith('.md'));
      
      let statusCounts = {
        planned: 0,
        in_progress: 0,
        completed: 0
      };

      for (const file of mdFiles) {
        const filePath = path.join(featureLedgerDir, file);
        const parsedContent = await testUtils.parseMarkdownFile(filePath);
        const status = parsedContent.metadata.status;
        if (statusCounts.hasOwnProperty(status)) {
          statusCounts[status]++;
        }
      }

      const totalFeatures = mdFiles.length;
      const completedFeatures = statusCounts.completed;
      const progressPercentage = Math.round((completedFeatures / totalFeatures) * 100);

      expect(totalFeatures).toBe(4);
      expect(completedFeatures).toBe(2);
      expect(progressPercentage).toBe(50);
    });
  });

  describe('Git 훅 통합 테스트', () => {
    test('커밋 메시지 검증 시뮬레이션', () => {
      const validateCommitMessage = (message) => {
        const patterns = [
          /^feat:/,
          /^fix:/,
          /^docs:/,
          /^style:/,
          /^refactor:/,
          /^test:/,
          /^chore:/
        ];

        return patterns.some(pattern => pattern.test(message));
      };

      const validMessages = [
        'feat: 새로운 기능 추가',
        'fix: 버그 수정',
        'docs: 문서 업데이트',
        'refactor: 코드 리팩토링'
      ];

      const invalidMessages = [
        'add new feature',
        'bug fix',
        'update docs'
      ];

      validMessages.forEach(message => {
        expect(validateCommitMessage(message)).toBe(true);
      });

      invalidMessages.forEach(message => {
        expect(validateCommitMessage(message)).toBe(false);
      });
    });

    test('Feature ID와 커밋 메시지 연동 검증', async () => {
      const featureLedgerDir = path.join(aiwfDir, '06_FEATURE_LEDGERS');
      const feature = testFixtures.featureLedger;
      const featureFilePath = path.join(featureLedgerDir, `${feature.id}.md`);

      // Feature 생성
      await fs.writeFile(featureFilePath, `---
id: ${feature.id}
title: ${feature.title}
status: planned
---

# Feature: ${feature.title}
`);

      // 커밋 메시지에서 Feature ID 추출하고 검증
      const commitMessage = `feat: Feature Ledger 시스템 구현 [${feature.id}]`;
      const featureIdMatch = commitMessage.match(/\[([A-Z_0-9]+)\]/);
      
      expect(featureIdMatch).toBeTruthy();
      
      const extractedFeatureId = featureIdMatch[1];
      expect(extractedFeatureId).toBe(feature.id);
      
      // Feature 파일 존재 확인
      expect(await testUtils.fileExists(featureFilePath)).toBe(true);
    });
  });

  describe('Git 로그 분석 테스트', () => {
    test('Feature별 커밋 히스토리 추적', () => {
      const mockGitLog = [
        { message: 'feat: 초기 Feature Ledger 구조 생성 [FEATURE_001]', date: '2025-07-08' },
        { message: 'feat: Feature CRUD 명령어 구현 [FEATURE_001]', date: '2025-07-08' },
        { message: 'fix: Feature 상태 업데이트 버그 수정 [FEATURE_001]', date: '2025-07-09' },
        { message: 'docs: Feature Ledger 문서 업데이트 [FEATURE_001]', date: '2025-07-09' },
        { message: 'feat: AI 페르소나 시스템 구현 [FEATURE_002]', date: '2025-07-09' }
      ];

      const groupCommitsByFeature = (commits) => {
        const grouped = {};
        commits.forEach(commit => {
          const match = commit.message.match(/\[([A-Z_0-9]+)\]/);
          if (match) {
            const featureId = match[1];
            if (!grouped[featureId]) {
              grouped[featureId] = [];
            }
            grouped[featureId].push(commit);
          }
        });
        return grouped;
      };

      const groupedCommits = groupCommitsByFeature(mockGitLog);
      
      expect(groupedCommits['FEATURE_001']).toHaveLength(4);
      expect(groupedCommits['FEATURE_002']).toHaveLength(1);
      expect(Object.keys(groupedCommits)).toHaveLength(2);
    });
  });
});