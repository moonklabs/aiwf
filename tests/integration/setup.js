/**
 * 통합 테스트 환경 설정
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 테스트 유틸리티 함수들
export const testUtils = {
  /**
   * 테스트용 임시 디렉토리 생성
   */
  async createTempDir(prefix = 'test-') {
    const tempDir = path.join(__dirname, '../../tmp', `${prefix}${Date.now()}`);
    await fs.mkdir(tempDir, { recursive: true });
    return tempDir;
  },

  /**
   * 테스트용 임시 디렉토리 정리
   */
  async cleanupTempDir(tempDir) {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (error) {
      console.warn(`Failed to cleanup temp dir: ${tempDir}`, error);
    }
  },

  /**
   * 테스트용 AIWF 프로젝트 구조 생성
   */
  async createTestProjectStructure(baseDir) {
    const aiwfDir = path.join(baseDir, '.aiwf');
    const dirs = [
      '00_PROJECT_MANIFEST.md',
      '01_PROJECT',
      '02_REQUIREMENTS', 
      '03_SPRINTS',
      '04_GENERAL_TASKS',
      '05_DOCUMENTATION',
      '06_FEATURE_LEDGERS',
      '07_BUG_REPORTS',
      '08_ADR',
      '09_AI_TOOLS',
      '10_PERSONAS',
      '11_CONTEXT_COMPRESSION',
      '99_TEMPLATES'
    ];

    await fs.mkdir(aiwfDir, { recursive: true });
    
    // 디렉토리 생성
    for (const dir of dirs) {
      if (!dir.endsWith('.md')) {
        await fs.mkdir(path.join(aiwfDir, dir), { recursive: true });
      }
    }

    // 기본 매니페스트 파일 생성
    await fs.writeFile(
      path.join(aiwfDir, '00_PROJECT_MANIFEST.md'),
      `# Test Project Manifest
프로젝트명: Test Project
생성일: ${new Date().toISOString().split('T')[0]}
`
    );

    return aiwfDir;
  },

  /**
   * 파일 존재 여부 확인
   */
  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * 디렉토리 존재 여부 확인
   */
  async dirExists(dirPath) {
    try {
      const stats = await fs.stat(dirPath);
      return stats.isDirectory();
    } catch {
      return false;
    }
  },

  /**
   * JSON 파일 읽기
   */
  async readJsonFile(filePath) {
    const content = await fs.readFile(filePath, 'utf8');
    return JSON.parse(content);
  },

  /**
   * 마크다운 파일 파싱 (간단한 프론트매터 파싱)
   */
  async parseMarkdownFile(filePath) {
    const content = await fs.readFile(filePath, 'utf8');
    const lines = content.split('\n');
    
    if (lines[0] === '---') {
      const endIndex = lines.slice(1).indexOf('---') + 1;
      if (endIndex > 0) {
        const frontMatter = lines.slice(1, endIndex).join('\n');
        const body = lines.slice(endIndex + 1).join('\n');
        
        // 간단한 YAML 파싱 (key: value 형태만)
        const metadata = {};
        frontMatter.split('\n').forEach(line => {
          const match = line.match(/^(\w+):\s*(.*)$/);
          if (match) {
            metadata[match[1]] = match[2];
          }
        });
        
        return { metadata, body };
      }
    }
    
    return { metadata: {}, body: content };
  }
};

// 테스트 픽스처 데이터
export const testFixtures = {
  featureLedger: {
    id: 'TEST_FEATURE_001',
    title: 'Test Feature',
    description: 'Test feature description',
    status: 'planned',
    priority: 'medium',
    milestone: 'M01',
    created_at: '2025-07-09T02:55:00Z',
    updated_at: '2025-07-09T02:55:00Z'
  },

  persona: {
    id: 'architect',
    name: 'Software Architect',
    description: 'AI 페르소나 for software architecture',
    context: 'You are an expert software architect...',
    commands: ['design', 'review', 'optimize']
  },

  taskTemplate: {
    task_id: 'TEST_TASK_001',
    sprint_sequence_id: 'S01',
    status: 'open',
    complexity: 'Medium',
    title: 'Test Task',
    description: 'Test task description'
  }
};

// 테스트 전역 설정
export const testConfig = {
  timeout: 30000,
  tempDirPrefix: 'aiwf-test-',
  testDataDir: path.join(__dirname, 'data')
};