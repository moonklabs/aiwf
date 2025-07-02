/**
 * AIWF 명령어 파일 테스트
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('AIWF 명령어 검증', () => {
  test('명령어 디렉토리 구조가 올바르다', async () => {
    const koDir = path.join(__dirname, '../claude-code/aiwf/ko/.claude/commands/aiwf');
    const enDir = path.join(__dirname, '../claude-code/aiwf/en/.claude/commands/aiwf');
    
    const koFiles = await fs.readdir(koDir);
    const enFiles = await fs.readdir(enDir);
    
    expect(koFiles.length).toBeGreaterThan(20);
    expect(enFiles.length).toBeGreaterThan(20);
    
    // 한국어가 영어보다 파일이 많을 수 있음 (한국어 전용 명령어)
    expect(koFiles.length).toBeGreaterThanOrEqual(enFiles.length);
  });

  test('한국어 명령어 디렉토리가 존재한다', async () => {
    const koDir = path.join(__dirname, '../claude-code/aiwf/ko/.claude/commands/aiwf');
    const stats = await fs.stat(koDir);
    expect(stats.isDirectory()).toBe(true);
  });

  test('영어 명령어 디렉토리가 존재한다', async () => {
    const enDir = path.join(__dirname, '../claude-code/aiwf/en/.claude/commands/aiwf');
    const stats = await fs.stat(enDir);
    expect(stats.isDirectory()).toBe(true);
  });

  test('필수 명령어 파일들이 존재한다', async () => {
    const requiredCommands = [
      'aiwf_initialize.md',
      'aiwf_test.md',
      'aiwf_prime.md',
      'aiwf_do_task.md'
    ];

    const koDir = path.join(__dirname, '../claude-code/aiwf/ko/.claude/commands/aiwf');
    const enDir = path.join(__dirname, '../claude-code/aiwf/en/.claude/commands/aiwf');

    for (const command of requiredCommands) {
      const koPath = path.join(koDir, command);
      const enPath = path.join(enDir, command);
      
      const koExists = await fs.access(koPath).then(() => true).catch(() => false);
      const enExists = await fs.access(enPath).then(() => true).catch(() => false);
      
      expect(koExists).toBe(true);
      expect(enExists).toBe(true);
    }
  });

  test('명령어 파일들이 유효한 마크다운 구조를 가진다', async () => {
    const koDir = path.join(__dirname, '../claude-code/aiwf/ko/.claude/commands/aiwf');
    const files = await fs.readdir(koDir);
    const mdFiles = files.filter(file => file.endsWith('.md'));
    
    expect(mdFiles.length).toBeGreaterThan(0);
    
    // 첫 번째 파일만 샘플 테스트
    const sampleFile = path.join(koDir, mdFiles[0]);
    const content = await fs.readFile(sampleFile, 'utf-8');
    
    // 마크다운 파일은 최소한 하나의 헤더를 가져야 함
    expect(content).toMatch(/^#\s+.+/m);
  });

  test('한국어 전용 명령어 파일 존재 검증', async () => {
    const koDir = path.join(__dirname, '../claude-code/aiwf/ko/.claude/commands/aiwf');
    const enDir = path.join(__dirname, '../claude-code/aiwf/en/.claude/commands/aiwf');
    
    const koFiles = await fs.readdir(koDir);
    const enFiles = await fs.readdir(enDir);
    
    // aiwf_update_docs_kr.md는 한국어 전용이어야 함
    const krSpecificFile = 'aiwf_update_docs_kr.md';
    expect(koFiles).toContain(krSpecificFile);
    
    // 영어 버전에는 없어야 함 - 이 테스트는 실패할 것임
    expect(enFiles).not.toContain(krSpecificFile);
  });

  test('한국어 명령어가 영어 명령어보다 많거나 같아야 함', async () => {
    const koDir = path.join(__dirname, '../claude-code/aiwf/ko/.claude/commands/aiwf');
    const enDir = path.join(__dirname, '../claude-code/aiwf/en/.claude/commands/aiwf');
    
    const koFiles = await fs.readdir(koDir);
    const enFiles = await fs.readdir(enDir);
    
    // 한국어 버전이 영어보다 더 많은 명령어를 가질 수 있음 (한국어 전용 명령어)
    expect(koFiles.length).toBeGreaterThanOrEqual(enFiles.length);
  });

  test('핵심 명령어들이 존재하는지 검증', async () => {
    const koDir = path.join(__dirname, '../claude-code/aiwf/ko/.claude/commands/aiwf');
    const coreCommands = ['aiwf_initialize.md', 'aiwf_prime.md', 'aiwf_test.md', 'aiwf_do_task.md'];
    
    const koFiles = await fs.readdir(koDir);
    
    coreCommands.forEach(command => {
      expect(koFiles).toContain(command);
    });
  });

  test('존재하지 않는 명령어 파일 테스트', async () => {
    const nonExistentPath = path.join(__dirname, '../claude-code/aiwf/ko/.claude/commands/aiwf/non_existent_command.md');
    
    const exists = await fs.access(nonExistentPath).then(() => true).catch(() => false);
    expect(exists).toBe(false);
  });

  test('잘못된 디렉토리 경로 테스트', async () => {
    const invalidDir = path.join(__dirname, '../invalid/directory/path');
    
    const dirExists = await fs.access(invalidDir).then(() => true).catch(() => false);
    expect(dirExists).toBe(false);
  });
});