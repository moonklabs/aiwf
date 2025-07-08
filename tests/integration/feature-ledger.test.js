/**
 * Feature Ledger 시스템 통합 테스트
 */

import { testUtils, testFixtures } from './setup.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Feature Ledger 시스템 통합 테스트', () => {
  let testProjectDir;
  let featureLedgerDir;

  beforeEach(async () => {
    testProjectDir = await testUtils.createTempDir('feature-ledger-');
    const aiwfDir = await testUtils.createTestProjectStructure(testProjectDir);
    featureLedgerDir = path.join(aiwfDir, '06_FEATURE_LEDGERS');
  });

  afterEach(async () => {
    await testUtils.cleanupTempDir(testProjectDir);
  });

  describe('Feature Ledger CRUD 기능 테스트', () => {
    test('Feature Ledger 생성 테스트', async () => {
      const feature = testFixtures.featureLedger;
      const featureFilePath = path.join(featureLedgerDir, `${feature.id}.md`);
      
      // Feature Ledger 파일 생성
      const content = `---
id: ${feature.id}
title: ${feature.title}
description: ${feature.description}
status: ${feature.status}
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

## Priority
${feature.priority}
`;

      await fs.writeFile(featureFilePath, content);
      
      // 파일 생성 확인
      expect(await testUtils.fileExists(featureFilePath)).toBe(true);
      
      // 파일 내용 검증
      const parsedContent = await testUtils.parseMarkdownFile(featureFilePath);
      expect(parsedContent.metadata.id).toBe(feature.id);
      expect(parsedContent.metadata.title).toBe(feature.title);
      expect(parsedContent.metadata.status).toBe(feature.status);
    });

    test('Feature Ledger 읽기 테스트', async () => {
      const feature = testFixtures.featureLedger;
      const featureFilePath = path.join(featureLedgerDir, `${feature.id}.md`);
      
      // 테스트 데이터 생성
      const content = `---
id: ${feature.id}
title: ${feature.title}
status: ${feature.status}
---

# Feature: ${feature.title}
`;

      await fs.writeFile(featureFilePath, content);
      
      // 파일 읽기 및 파싱
      const parsedContent = await testUtils.parseMarkdownFile(featureFilePath);
      
      expect(parsedContent.metadata.id).toBe(feature.id);
      expect(parsedContent.metadata.title).toBe(feature.title);
      expect(parsedContent.metadata.status).toBe(feature.status);
      expect(parsedContent.body).toContain(`# Feature: ${feature.title}`);
    });

    test('Feature Ledger 업데이트 테스트', async () => {
      const feature = testFixtures.featureLedger;
      const featureFilePath = path.join(featureLedgerDir, `${feature.id}.md`);
      
      // 초기 파일 생성
      const initialContent = `---
id: ${feature.id}
title: ${feature.title}
status: planned
---

# Feature: ${feature.title}
`;

      await fs.writeFile(featureFilePath, initialContent);
      
      // 상태 업데이트
      const updatedContent = `---
id: ${feature.id}
title: ${feature.title}
status: in_progress
---

# Feature: ${feature.title}
`;

      await fs.writeFile(featureFilePath, updatedContent);
      
      // 업데이트 검증
      const parsedContent = await testUtils.parseMarkdownFile(featureFilePath);
      expect(parsedContent.metadata.status).toBe('in_progress');
    });

    test('Feature Ledger 삭제 테스트', async () => {
      const feature = testFixtures.featureLedger;
      const featureFilePath = path.join(featureLedgerDir, `${feature.id}.md`);
      
      // 파일 생성
      await fs.writeFile(featureFilePath, `---
id: ${feature.id}
title: ${feature.title}
---

# Feature: ${feature.title}
`);
      
      // 파일 존재 확인
      expect(await testUtils.fileExists(featureFilePath)).toBe(true);
      
      // 파일 삭제
      await fs.unlink(featureFilePath);
      
      // 삭제 확인
      expect(await testUtils.fileExists(featureFilePath)).toBe(false);
    });
  });

  describe('Feature Ledger 디렉토리 구조 테스트', () => {
    test('Feature Ledger 디렉토리 존재 확인', async () => {
      expect(await testUtils.dirExists(featureLedgerDir)).toBe(true);
    });

    test('Feature Ledger 목록 조회 테스트', async () => {
      // 여러 Feature Ledger 파일 생성
      const features = [
        { ...testFixtures.featureLedger, id: 'FEATURE_001' },
        { ...testFixtures.featureLedger, id: 'FEATURE_002' },
        { ...testFixtures.featureLedger, id: 'FEATURE_003' }
      ];

      for (const feature of features) {
        const featureFilePath = path.join(featureLedgerDir, `${feature.id}.md`);
        await fs.writeFile(featureFilePath, `---
id: ${feature.id}
title: ${feature.title}
---

# Feature: ${feature.title}
`);
      }

      // 디렉토리 목록 조회
      const files = await fs.readdir(featureLedgerDir);
      const mdFiles = files.filter(file => file.endsWith('.md'));
      
      expect(mdFiles.length).toBe(3);
      expect(mdFiles).toContain('FEATURE_001.md');
      expect(mdFiles).toContain('FEATURE_002.md');
      expect(mdFiles).toContain('FEATURE_003.md');
    });
  });

  describe('Feature Ledger 데이터 무결성 테스트', () => {
    test('잘못된 형식의 Feature Ledger 파일 처리', async () => {
      const invalidFeaturePath = path.join(featureLedgerDir, 'invalid_feature.md');
      
      // 잘못된 형식의 파일 생성
      const invalidContent = `
# Invalid Feature

This is not a valid feature ledger format.
`;

      await fs.writeFile(invalidFeaturePath, invalidContent);
      
      // 파싱 시도
      const parsedContent = await testUtils.parseMarkdownFile(invalidFeaturePath);
      
      // 메타데이터가 비어있어야 함
      expect(Object.keys(parsedContent.metadata)).toHaveLength(0);
      expect(parsedContent.body).toContain('# Invalid Feature');
    });

    test('필수 필드 누락 검증', async () => {
      const incompleteFeaturePath = path.join(featureLedgerDir, 'incomplete_feature.md');
      
      // 필수 필드가 누락된 파일
      const incompleteContent = `---
title: Incomplete Feature
---

# Feature: Incomplete Feature
`;

      await fs.writeFile(incompleteFeaturePath, incompleteContent);
      
      const parsedContent = await testUtils.parseMarkdownFile(incompleteFeaturePath);
      
      // id 필드가 없어야 함
      expect(parsedContent.metadata.id).toBeUndefined();
      expect(parsedContent.metadata.title).toBe('Incomplete Feature');
    });
  });
});