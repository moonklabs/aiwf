#!/usr/bin/env node

/**
 * 통합 테스트 실행 자동화 스크립트
 */

import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 색상 출력을 위한 헬퍼
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}[INFO]${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}[SUCCESS]${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}[WARNING]${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}[ERROR]${colors.reset} ${msg}`),
  header: (msg) => console.log(`${colors.bright}${colors.cyan}${msg}${colors.reset}`)
};

async function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve(code);
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    child.on('error', reject);
  });
}

async function checkTestEnvironment() {
  log.info('테스트 환경 확인 중...');
  
  // Node.js 버전 확인
  const nodeVersion = process.version;
  log.info(`Node.js 버전: ${nodeVersion}`);
  
  // 필요한 디렉토리 확인
  const requiredDirs = [
    'tests',
    'tests/integration'
  ];
  
  for (const dir of requiredDirs) {
    const dirPath = path.join(__dirname, '..', dir);
    try {
      await fs.access(dirPath);
      log.success(`디렉토리 확인: ${dir}`);
    } catch {
      log.error(`디렉토리 누락: ${dir}`);
      return false;
    }
  }
  
  return true;
}

async function runBasicTests() {
  log.header('=== 기본 테스트 실행 ===');
  
  try {
    await runCommand('npm', ['test', '--', '--testPathPattern=tests/(?!integration).*\\.test\\.js$']);
    log.success('기본 테스트 완료');
    return true;
  } catch (error) {
    log.error('기본 테스트 실패');
    return false;
  }
}

async function runIntegrationTests() {
  log.header('=== 통합 테스트 실행 ===');
  
  try {
    await runCommand('npm', ['test', '--', '--testPathPattern=tests/integration/.*\\.test\\.js$']);
    log.success('통합 테스트 완료');
    return true;
  } catch (error) {
    log.error('통합 테스트 실패');
    return false;
  }
}

async function runCoverageReport() {
  log.header('=== 커버리지 리포트 생성 ===');
  
  try {
    await runCommand('npm', ['test', '--', '--coverage']);
    log.success('커버리지 리포트 생성 완료');
    
    // 커버리지 결과 파일 확인
    const coverageFile = path.join(__dirname, '..', 'coverage', 'coverage-summary.json');
    try {
      const coverageData = JSON.parse(await fs.readFile(coverageFile, 'utf8'));
      const total = coverageData.total;
      
      log.info(`커버리지 결과:`);
      log.info(`  - Lines: ${total.lines.pct}%`);
      log.info(`  - Functions: ${total.functions.pct}%`);
      log.info(`  - Branches: ${total.branches.pct}%`);
      log.info(`  - Statements: ${total.statements.pct}%`);
      
      // 80% 이상 커버리지 확인
      const threshold = 80;
      const coverageOK = total.lines.pct >= threshold && 
                        total.functions.pct >= threshold && 
                        total.branches.pct >= threshold && 
                        total.statements.pct >= threshold;
      
      if (coverageOK) {
        log.success(`커버리지 목표 달성 (${threshold}% 이상)`);
      } else {
        log.warning(`커버리지 목표 미달성 (${threshold}% 미만)`);
      }
      
      return coverageOK;
    } catch (error) {
      log.warning('커버리지 결과 파일을 읽을 수 없습니다.');
      return false;
    }
  } catch (error) {
    log.error('커버리지 리포트 생성 실패');
    return false;
  }
}

async function generateTestReport() {
  log.header('=== 테스트 리포트 생성 ===');
  
  const reportData = {
    timestamp: new Date().toISOString(),
    testSuites: {
      basic: { executed: false, passed: false },
      integration: { executed: false, passed: false },
      coverage: { executed: false, passed: false }
    },
    summary: {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      coverageThreshold: '80%'
    }
  };
  
  // 테스트 결과 수집
  try {
    const testResults = await runCommand('npm', ['test', '--', '--json', '--outputFile=test-results.json'], {
      stdio: 'pipe'
    });
    
    try {
      const resultsFile = path.join(__dirname, '..', 'test-results.json');
      const results = JSON.parse(await fs.readFile(resultsFile, 'utf8'));
      
      reportData.summary.totalTests = results.numTotalTests;
      reportData.summary.passedTests = results.numPassedTests;
      reportData.summary.failedTests = results.numFailedTests;
      
      // 임시 파일 정리
      await fs.unlink(resultsFile);
    } catch (error) {
      log.warning('테스트 결과 파일을 읽을 수 없습니다.');
    }
  } catch (error) {
    log.warning('테스트 결과 수집 중 오류가 발생했습니다.');
  }
  
  // 리포트 파일 생성
  const reportPath = path.join(__dirname, '..', 'test-report.json');
  await fs.writeFile(reportPath, JSON.stringify(reportData, null, 2));
  
  log.success(`테스트 리포트 생성: ${reportPath}`);
  return true;
}

async function cleanupTestFiles() {
  log.info('테스트 임시 파일 정리 중...');
  
  const tempDirs = [
    path.join(__dirname, '..', 'tmp'),
    path.join(__dirname, '..', 'coverage')
  ];
  
  for (const dir of tempDirs) {
    try {
      await fs.rm(dir, { recursive: true, force: true });
      log.success(`정리 완료: ${dir}`);
    } catch (error) {
      // 디렉토리가 존재하지 않는 경우는 무시
    }
  }
}

async function main() {
  log.header('🧪 AIWF 통합 테스트 Suite 실행');
  
  const startTime = Date.now();
  let allTestsPassed = true;
  
  try {
    // 1. 테스트 환경 확인
    if (!await checkTestEnvironment()) {
      log.error('테스트 환경 확인 실패');
      process.exit(1);
    }
    
    // 2. 기본 테스트 실행
    const basicTestsOK = await runBasicTests();
    if (!basicTestsOK) {
      allTestsPassed = false;
    }
    
    // 3. 통합 테스트 실행
    const integrationTestsOK = await runIntegrationTests();
    if (!integrationTestsOK) {
      allTestsPassed = false;
    }
    
    // 4. 커버리지 리포트 생성
    const coverageOK = await runCoverageReport();
    if (!coverageOK) {
      allTestsPassed = false;
    }
    
    // 5. 테스트 리포트 생성
    await generateTestReport();
    
    // 6. 정리
    await cleanupTestFiles();
    
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);
    
    log.header('=== 테스트 실행 완료 ===');
    log.info(`총 실행 시간: ${duration}초`);
    
    if (allTestsPassed) {
      log.success('모든 테스트가 성공적으로 완료되었습니다! 🎉');
      process.exit(0);
    } else {
      log.error('일부 테스트가 실패했습니다. 자세한 내용을 확인해 주세요.');
      process.exit(1);
    }
    
  } catch (error) {
    log.error(`테스트 실행 중 오류 발생: ${error.message}`);
    process.exit(1);
  }
}

// 명령줄 인수 처리
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
AIWF 통합 테스트 Suite 실행 스크립트

사용법:
  node scripts/run-integration-tests.js [옵션]

옵션:
  --help, -h        이 도움말 표시
  --basic-only      기본 테스트만 실행
  --integration-only 통합 테스트만 실행
  --coverage-only   커버리지 리포트만 생성
  --no-cleanup      테스트 후 정리 작업 생략

예시:
  node scripts/run-integration-tests.js
  node scripts/run-integration-tests.js --basic-only
  node scripts/run-integration-tests.js --coverage-only
`);
  process.exit(0);
}

// 개별 테스트 실행 옵션
if (args.includes('--basic-only')) {
  (async () => {
    await checkTestEnvironment();
    await runBasicTests();
  })();
} else if (args.includes('--integration-only')) {
  (async () => {
    await checkTestEnvironment();
    await runIntegrationTests();
  })();
} else if (args.includes('--coverage-only')) {
  (async () => {
    await checkTestEnvironment();
    await runCoverageReport();
  })();
} else {
  main();
}