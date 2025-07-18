/**
 * 인스톨러 기능 테스트
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('AIWF 인스톨러 기능', () => {
  let tempDir;

  beforeEach(() => {
    // 임시 테스트 디렉토리 생성
    tempDir = path.join(__dirname, '../temp-test-installer');
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
    fs.mkdirSync(tempDir, { recursive: true });
  });

  afterEach(() => {
    // 테스트 후 정리
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  test('버전 명령어가 올바르게 작동한다', () => {
    const result = execSync('node src/cli/index.js --version', { 
      cwd: path.join(__dirname, '..'),
      encoding: 'utf8',
      timeout: 5000
    });
    expect(result.trim()).toMatch(/\d+\.\d+\.\d+/);
  });

  test('도움말 명령어가 올바르게 작동한다', () => {
    const result = execSync('node src/cli/index.js --help', { 
      cwd: path.join(__dirname, '..'),
      encoding: 'utf8',
      timeout: 5000
    });
    expect(result).toContain('AIWF Installer');
    expect(result).toContain('Options:');
    expect(result).toContain('--force');
  });

  test('명령어 파일들이 올바른 형식인지 검증한다', () => {
    const koCommandsDir = path.join(__dirname, '../claude-code/aiwf/ko/.claude/commands/aiwf');
    const enCommandsDir = path.join(__dirname, '../claude-code/aiwf/en/.claude/commands/aiwf');
    
    expect(fs.existsSync(koCommandsDir)).toBe(true);
    expect(fs.existsSync(enCommandsDir)).toBe(true);
    
    // 한국어 명령어 파일 검증
    const koFiles = fs.readdirSync(koCommandsDir).filter(f => f.endsWith('.md'));
    expect(koFiles.length).toBeGreaterThan(0);
    
    // 영어 명령어 파일 검증
    const enFiles = fs.readdirSync(enCommandsDir).filter(f => f.endsWith('.md'));
    expect(enFiles.length).toBeGreaterThan(0);
    
    // 최소한 몇 개의 핵심 명령어가 존재하는지 확인
    const coreCommands = ['aiwf_initialize', 'aiwf_prime', 'aiwf_test'];
    coreCommands.forEach(cmd => {
      const koFile = path.join(koCommandsDir, `${cmd}.md`);
      const enFile = path.join(enCommandsDir, `${cmd}.md`);
      
      expect(fs.existsSync(koFile) || fs.existsSync(enFile)).toBe(true);
    });
  });

  test('AIWF 템플릿 구조가 올바르게 구성되어 있다', () => {
    const koTemplatesDir = path.join(__dirname, '../claude-code/aiwf/ko/.aiwf');
    const enTemplatesDir = path.join(__dirname, '../claude-code/aiwf/en/.aiwf');
    
    expect(fs.existsSync(koTemplatesDir)).toBe(true);
    expect(fs.existsSync(enTemplatesDir)).toBe(true);
    
    // 필수 템플릿 디렉토리들 확인
    const requiredDirs = ['99_TEMPLATES', '98_PROMPTS'];
    
    requiredDirs.forEach(dir => {
      const koDir = path.join(koTemplatesDir, dir);
      const enDir = path.join(enTemplatesDir, dir);
      
      expect(fs.existsSync(koDir) || fs.existsSync(enDir)).toBe(true);
    });
  });
});

describe('프로젝트 문서화', () => {
  test('필수 문서 파일들이 존재한다', () => {
    const requiredDocs = [
      'README.md',
      'README.ko.md',
      'CLAUDE.md',
      'docs/COMMANDS_GUIDE.md',
      'docs/COMMANDS_GUIDE.ko.md'
    ];
    
    requiredDocs.forEach(doc => {
      const docPath = path.join(__dirname, '..', doc);
      expect(fs.existsSync(docPath)).toBe(true);
    });
  });

  test('다국어 지원이 일관되게 구현되어 있다', () => {
    const koDir = path.join(__dirname, '../claude-code/aiwf/ko');
    const enDir = path.join(__dirname, '../claude-code/aiwf/en');
    
    expect(fs.existsSync(koDir)).toBe(true);
    expect(fs.existsSync(enDir)).toBe(true);
    
    // 각 언어 버전에 필수 구조가 있는지 확인
    ['ko', 'en'].forEach(lang => {
      const langDir = path.join(__dirname, `../claude-code/aiwf/${lang}`);
      const claudeDir = path.join(langDir, '.claude/commands/aiwf');
      const aiwfDir = path.join(langDir, '.aiwf');
      
      expect(fs.existsSync(claudeDir)).toBe(true);
      expect(fs.existsSync(aiwfDir)).toBe(true);
    });
  });
});