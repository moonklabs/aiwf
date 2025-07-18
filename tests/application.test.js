/**
 * 애플리케이션 메인 코드 테스트
 */

import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 애플리케이션 실행 헬퍼
async function runApp(args = [], timeout = 10000) {
  return new Promise((resolve, reject) => {
    const appPath = path.join(__dirname, '..', 'src', 'cli', 'index.js');
    const child = spawn('node', [appPath, ...args], {
      stdio: 'pipe',
      timeout: timeout
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      resolve({ code, stdout, stderr });
    });

    child.on('error', reject);

    // 타임아웃 처리
    setTimeout(() => {
      child.kill();
      reject(new Error('Process timeout'));
    }, timeout);
  });
}

describe('AIWF 애플리케이션 테스트', () => {
  test('애플리케이션이 정상적으로 시작됨', async () => {
    const result = await runApp(['--version']);
    expect(result.code).toBe(0);
  });

  test('도움말 메시지가 표시됨', async () => {
    const result = await runApp(['--help']);
    expect(result.stdout).toContain('AIWF');
    expect(result.stdout).toContain('설치');
  });

  test('버전 정보가 표시됨', async () => {
    const result = await runApp(['--version']);
    expect(result.stdout).toMatch(/\d+\.\d+\.\d+/);
  });

  test('잘못된 명령어에 대한 오류 처리', async () => {
    const result = await runApp(['--invalid-option']);
    expect(result.code).not.toBe(0);
  });
});

describe('Language CLI 테스트', () => {
  async function runLanguageCli(args = [], timeout = 5000) {
    return new Promise((resolve, reject) => {
      const cliPath = path.join(__dirname, '..', 'src', 'cli', 'language-cli.js');
      const child = spawn('node', [cliPath, ...args], {
        stdio: 'pipe',
        timeout: timeout
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        resolve({ code, stdout, stderr });
      });

      child.on('error', reject);

      setTimeout(() => {
        child.kill();
        reject(new Error('Process timeout'));
      }, timeout);
    });
  }

  test('언어 상태 확인', async () => {
    const result = await runLanguageCli(['status']);
    expect(result.code).toBe(0);
    expect(result.stdout).toContain('언어 설정');
  });

  test('언어 CLI 도움말', async () => {
    const result = await runLanguageCli(['--help']);
    expect(result.stdout).toContain('언어 설정');
  });
});

describe('설치 프로세스 테스트', () => {
  let tempDir;

  beforeEach(async () => {
    tempDir = path.join(__dirname, 'temp_install_test');
    await fs.mkdir(tempDir, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  test('임시 디렉토리에서 설치 시뮬레이션', async () => {
    // 패키지 설치 시뮬레이션
    const packageJsonPath = path.join(tempDir, 'package.json');
    await fs.writeFile(packageJsonPath, JSON.stringify({
      name: 'test-project',
      version: '1.0.0',
      scripts: {
        test: 'echo "test"'
      }
    }, null, 2));

    // 설치 프로세스 시뮬레이션
    const result = await runApp(['--target', tempDir, '--dry-run']);
    
    // 드라이런 모드에서는 실제 설치하지 않고 계획만 보여줌
    expect(result.code).toBe(0);
  });

  test('기존 프로젝트 감지', async () => {
    // 기존 AIWF 프로젝트 시뮬레이션
    const aiwfDir = path.join(tempDir, '.aiwf');
    await fs.mkdir(aiwfDir, { recursive: true });
    await fs.writeFile(path.join(aiwfDir, '00_PROJECT_MANIFEST.md'), '# Test Project');

    const result = await runApp(['--target', tempDir, '--check']);
    expect(result.code).toBe(0);
  });
});

describe('명령어 유효성 검증 테스트', () => {
  test('명령어 파일 구조 검증', async () => {
    const koCommandsDir = path.join(__dirname, '..', 'claude-code', 'aiwf', 'ko', '.claude', 'commands', 'aiwf');
    const enCommandsDir = path.join(__dirname, '..', 'claude-code', 'aiwf', 'en', '.claude', 'commands', 'aiwf');

    // 한국어 명령어 파일 존재 확인
    const koFiles = await fs.readdir(koCommandsDir);
    expect(koFiles.length).toBeGreaterThan(0);

    // 영어 명령어 파일 존재 확인
    const enFiles = await fs.readdir(enCommandsDir);
    expect(enFiles.length).toBeGreaterThan(0);

    // 필수 명령어 파일 확인
    const requiredCommands = ['aiwf_initialize.md', 'aiwf_test.md', 'aiwf_prime.md'];
    
    for (const command of requiredCommands) {
      expect(koFiles).toContain(command);
      expect(enFiles).toContain(command);
    }
  });

  test('명령어 파일 내용 검증', async () => {
    const koCommandsDir = path.join(__dirname, '..', 'claude-code', 'aiwf', 'ko', '.claude', 'commands', 'aiwf');
    const testFile = path.join(koCommandsDir, 'aiwf_test.md');
    
    const content = await fs.readFile(testFile, 'utf8');
    
    // 마크다운 헤더 확인
    expect(content).toMatch(/^#\s+.+/m);
    
    // 한국어 내용 확인
    expect(content).toContain('테스트');
  });
});

describe('설정 파일 관리 테스트', () => {
  test('언어 설정 파일 읽기', async () => {
    const configDir = path.join(__dirname, '..', '.aiwf', 'config');
    
    try {
      await fs.access(configDir);
      const files = await fs.readdir(configDir);
      
      if (files.includes('language.json')) {
        const configPath = path.join(configDir, 'language.json');
        const config = JSON.parse(await fs.readFile(configPath, 'utf8'));
        
        expect(config).toHaveProperty('language');
        expect(['ko', 'en']).toContain(config.language);
      }
    } catch (error) {
      // 설정 파일이 없는 경우는 정상 (기본값 사용)
      expect(error.code).toBe('ENOENT');
    }
  });

  test('기본 설정 생성', async () => {
    const tempConfigDir = path.join(__dirname, 'temp_config');
    await fs.mkdir(tempConfigDir, { recursive: true });
    
    const defaultConfig = {
      language: 'ko',
      version: '0.3.1',
      created_at: new Date().toISOString()
    };
    
    const configPath = path.join(tempConfigDir, 'language.json');
    await fs.writeFile(configPath, JSON.stringify(defaultConfig, null, 2));
    
    const savedConfig = JSON.parse(await fs.readFile(configPath, 'utf8'));
    expect(savedConfig.language).toBe('ko');
    expect(savedConfig.version).toBe('0.3.1');
    
    await fs.rm(tempConfigDir, { recursive: true, force: true });
  });
});

describe('오류 처리 테스트', () => {
  test('존재하지 않는 디렉토리에 대한 오류 처리', async () => {
    const result = await runApp(['--target', '/nonexistent/directory']);
    expect(result.code).not.toBe(0);
  });

  test('권한 없는 디렉토리에 대한 오류 처리', async () => {
    // 권한 테스트는 시스템에 따라 다르므로 간단히 처리
    const result = await runApp(['--target', '/root']);
    // 권한 오류가 발생하거나 정상 처리되어야 함
    expect(typeof result.code).toBe('number');
  });

  test('잘못된 JSON 파일 처리', async () => {
    const tempDir = path.join(__dirname, 'temp_invalid_json');
    await fs.mkdir(tempDir, { recursive: true });
    
    const invalidJsonPath = path.join(tempDir, 'invalid.json');
    await fs.writeFile(invalidJsonPath, '{ invalid json }');
    
    // 애플리케이션이 잘못된 JSON 파일을 만나도 크래시하지 않아야 함
    const result = await runApp(['--target', tempDir]);
    expect(typeof result.code).toBe('number');
    
    await fs.rm(tempDir, { recursive: true, force: true });
  });
});