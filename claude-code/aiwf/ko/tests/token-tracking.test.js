/**
 * 토큰 추적 시스템 테스트 스위트
 */
import { TokenCounter } from '../utils/token-counter.js';
import { TokenTracker } from '../utils/token-tracker.js';
import { TokenStorage } from '../utils/token-storage.js';
import { TokenReporter } from '../utils/token-reporter.js';
import { TokenMonitor } from '../utils/token-monitor.js';
import { TokenTrackingCommands } from '../commands/token-tracking.js';
import fs from 'fs';
import path from 'path';

describe('Token Tracking System', () => {
  let testDir;
  let counter;
  let tracker;
  let storage;
  let reporter;
  let monitor;
  let commands;

  beforeEach(() => {
    // 테스트용 임시 디렉토리 생성
    testDir = path.join(process.cwd(), 'test-temp', Date.now().toString());
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
    
    // 테스트 인스턴스 생성
    counter = new TokenCounter();
    tracker = new TokenTracker(path.join(testDir, 'sessions'));
    storage = new TokenStorage(path.join(testDir, 'token-data'));
    reporter = new TokenReporter();
    monitor = new TokenMonitor();
    commands = new TokenTrackingCommands();
  });

  afterEach(() => {
    // 테스트 후 정리
    try {
      if (counter) counter.cleanup();
      if (tracker) tracker.cleanup();
      if (monitor) monitor.stopMonitoring();
      if (commands) commands.cleanup();
      
      // 임시 디렉토리 삭제
      if (fs.existsSync(testDir)) {
        fs.rmSync(testDir, { recursive: true, force: true });
      }
    } catch (error) {
      console.error('테스트 정리 중 오류:', error);
    }
  });

  describe('TokenCounter', () => {
    test('should count tokens correctly', () => {
      const testText = 'Hello, world! This is a test.';
      const tokens = counter.countTokens(testText);
      
      expect(tokens).toBeGreaterThan(0);
      expect(typeof tokens).toBe('number');
    });

    test('should handle empty text', () => {
      expect(counter.countTokens('')).toBe(0);
      expect(counter.countTokens(null)).toBe(0);
      expect(counter.countTokens(undefined)).toBe(0);
    });

    test('should count file tokens', () => {
      const testFile = path.join(testDir, 'test.md');
      const testContent = '# Test\n\nThis is a test file.';
      
      fs.writeFileSync(testFile, testContent);
      
      const tokens = counter.countFileTokens(testFile);
      expect(tokens).toBeGreaterThan(0);
    });

    test('should handle non-existent file', () => {
      const tokens = counter.countFileTokens('non-existent.md');
      expect(tokens).toBe(0);
    });

    test('should analyze token distribution', () => {
      const testContent = `# Section 1
This is the first section.

## Section 2
This is the second section.

### Section 3
This is the third section.`;

      const distribution = counter.analyzeTokenDistribution(testContent);
      
      expect(Array.isArray(distribution)).toBe(true);
      expect(distribution.length).toBeGreaterThan(0);
      
      distribution.forEach(section => {
        expect(section).toHaveProperty('name');
        expect(section).toHaveProperty('tokens');
        expect(section).toHaveProperty('percentage');
      });
    });
  });

  describe('TokenTracker', () => {
    test('should track command execution', () => {
      const result = tracker.trackCommand('test-command', 'input text', 'output text');
      
      expect(result).toBeTruthy();
      expect(result.command).toBe('test-command');
      expect(result.inputTokens).toBeGreaterThan(0);
      expect(result.outputTokens).toBeGreaterThan(0);
      expect(result.totalTokens).toBeGreaterThan(0);
    });

    test('should track compression', () => {
      const originalTokens = 1000;
      const compressedTokens = 600;
      
      tracker.trackCompression(originalTokens, compressedTokens);
      
      expect(tracker.usage.total).toBe(originalTokens);
      expect(tracker.usage.compressed).toBe(compressedTokens);
      expect(tracker.usage.saved).toBe(400);
      expect(tracker.usage.ratio).toBe(40);
    });

    test('should generate session report', () => {
      // 몇 개의 명령어 실행을 시뮬레이션
      tracker.trackCommand('cmd1', 'input1', 'output1');
      tracker.trackCommand('cmd2', 'input2', 'output2');
      tracker.trackCommand('cmd3', 'input3', 'output3');
      
      const report = tracker.generateReport();
      
      expect(report).toBeTruthy();
      expect(report.sessionId).toBeDefined();
      expect(report.totalCommands).toBe(3);
      expect(report.totalTokens).toBeGreaterThan(0);
    });

    test('should get session stats', () => {
      const stats = tracker.getSessionStats();
      
      expect(stats).toBeTruthy();
      expect(stats.sessionId).toBeDefined();
      expect(stats.totalTokens).toBeGreaterThanOrEqual(0);
      expect(stats.commandCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe('TokenStorage', () => {
    test('should record session usage', () => {
      const sessionData = {
        sessionId: 'test-session',
        totalTokens: 1000,
        commands: [
          { command: 'test-cmd', totalTokens: 500 },
          { command: 'test-cmd2', totalTokens: 500 }
        ],
        compressions: [
          { originalTokens: 1000, compressedTokens: 600, savedTokens: 400 }
        ]
      };
      
      storage.recordSessionUsage(sessionData);
      
      expect(storage.data.totalTokens).toBe(1000);
      expect(storage.data.sessionsCount).toBe(1);
    });

    test('should generate usage report', () => {
      // 테스트 데이터 설정
      const today = new Date().toISOString().split('T')[0];
      storage.data.dailyUsage[today] = {
        tokens: 1000,
        sessions: 5,
        commands: 20
      };
      
      const report = storage.generateUsageReport('daily');
      
      expect(report).toBeTruthy();
      expect(report.type).toBe('daily');
      expect(report.summary).toBeDefined();
      expect(report.dailyUsage).toBeDefined();
    });

    test('should check thresholds', () => {
      const thresholds = {
        dailyTokenLimit: 500,
        warningThreshold: 80
      };
      
      // 임계값을 초과하는 데이터 설정
      const today = new Date().toISOString().split('T')[0];
      storage.data.dailyUsage[today] = {
        tokens: 1000,
        sessions: 5
      };
      
      const violations = storage.checkThresholds(thresholds);
      
      expect(Array.isArray(violations)).toBe(true);
      expect(violations.length).toBeGreaterThan(0);
    });
  });

  describe('TokenReporter', () => {
    test('should generate project analysis report', () => {
      // 임시 프로젝트 구조 생성
      const projectDir = path.join(testDir, 'project');
      const aiwfDir = path.join(projectDir, '.aiwf', '03_SPRINTS');
      
      fs.mkdirSync(aiwfDir, { recursive: true });
      fs.writeFileSync(path.join(aiwfDir, 'test.md'), '# Test\n\nThis is a test file.');
      
      const report = reporter.generateProjectAnalysisReport(projectDir);
      
      expect(report).toBeTruthy();
      expect(report.analysis).toBeDefined();
      expect(report.analysis.totalTokens).toBeGreaterThan(0);
    });

    test('should identify compression opportunities', () => {
      const directoryBreakdown = {
        '.aiwf/03_SPRINTS': { tokens: 10000, files: [] },
        '.aiwf/05_COMPLETED_TASKS': { tokens: 5000, files: [] }
      };
      
      const opportunities = reporter.identifyCompressionOpportunities(directoryBreakdown);
      
      expect(Array.isArray(opportunities)).toBe(true);
      expect(opportunities.length).toBeGreaterThan(0);
    });
  });

  describe('TokenMonitor', () => {
    test('should enable/disable monitoring', () => {
      monitor.setEnabled(true);
      expect(monitor.isEnabled).toBe(true);
      
      monitor.setEnabled(false);
      expect(monitor.isEnabled).toBe(false);
    });

    test('should set thresholds', () => {
      const newThresholds = {
        dailyTokenLimit: 5000,
        warningThreshold: 75
      };
      
      monitor.setThresholds(newThresholds);
      
      expect(monitor.thresholds.dailyTokenLimit).toBe(5000);
      expect(monitor.thresholds.warningThreshold).toBe(75);
    });

    test('should create alerts', () => {
      const violation = {
        type: 'test_violation',
        message: 'Test violation message',
        threshold: 100,
        current: 150
      };
      
      monitor.createAlert(violation);
      
      expect(monitor.alerts.length).toBeGreaterThan(0);
      expect(monitor.alerts[0].type).toBe('test_violation');
    });

    test('should acknowledge alerts', () => {
      const violation = {
        type: 'test_violation',
        message: 'Test violation message',
        threshold: 100,
        current: 150
      };
      
      monitor.createAlert(violation);
      const alertId = monitor.alerts[0].id;
      
      monitor.acknowledgeAlert(alertId);
      
      expect(monitor.alerts[0].acknowledged).toBe(true);
    });
  });

  describe('TokenTrackingCommands', () => {
    test('should count tokens through command interface', async () => {
      const result = await commands.countTokens({ text: 'Hello, world!' });
      
      expect(result).toBeTruthy();
      expect(result.type).toBe('text');
      expect(result.tokens).toBeGreaterThan(0);
    });

    test('should track command execution', async () => {
      const result = await commands.trackCommand({
        command: 'test-command',
        input: 'input text',
        output: 'output text'
      });
      
      expect(result).toBeTruthy();
      expect(result.command).toBe('test-command');
      expect(result.totalTokens).toBeGreaterThan(0);
    });

    test('should generate session report', async () => {
      // 명령어 실행 시뮬레이션
      await commands.trackCommand({
        command: 'test-command',
        input: 'input',
        output: 'output'
      });
      
      const report = await commands.generateSessionReport();
      
      expect(report).toBeTruthy();
      expect(report.sessionId).toBeDefined();
      expect(report.totalCommands).toBeGreaterThan(0);
    });

    test('should track compression', async () => {
      const result = await commands.trackCompression({
        originalTokens: 1000,
        compressedTokens: 600
      });
      
      expect(result).toBeTruthy();
      expect(result.savedTokens).toBe(400);
      expect(result.compressionRatio).toBe('40.00');
    });

    test('should setup monitoring', async () => {
      const result = await commands.setupMonitoring({
        enable: true,
        thresholds: { dailyTokenLimit: 5000 }
      });
      
      expect(result.success).toBe(true);
      expect(result.status).toBeDefined();
    });

    test('should manage alerts', async () => {
      const result = await commands.manageAlerts({ action: 'list' });
      
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('Performance Tests', () => {
    test('should count tokens efficiently for large text', () => {
      const largeText = 'This is a test. '.repeat(1000);
      
      const startTime = performance.now();
      const tokens = counter.countTokens(largeText);
      const endTime = performance.now();
      
      expect(tokens).toBeGreaterThan(0);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    test('should handle multiple concurrent tracking operations', async () => {
      const operations = [];
      
      for (let i = 0; i < 100; i++) {
        operations.push(
          commands.trackCommand({
            command: `test-command-${i}`,
            input: `input ${i}`,
            output: `output ${i}`
          })
        );
      }
      
      const results = await Promise.all(operations);
      
      expect(results.length).toBe(100);
      results.forEach(result => {
        expect(result).toBeTruthy();
        expect(result.totalTokens).toBeGreaterThan(0);
      });
    });

    test('should compress large directory efficiently', () => {
      // 대용량 디렉토리 시뮬레이션
      const testFiles = [];
      for (let i = 0; i < 10; i++) {
        const fileName = path.join(testDir, `test-${i}.md`);
        const content = `# Test ${i}\n\n${'This is test content. '.repeat(100)}`;
        fs.writeFileSync(fileName, content);
        testFiles.push(fileName);
      }
      
      const startTime = performance.now();
      const tokens = counter.countDirectoryTokens(testDir);
      const endTime = performance.now();
      
      expect(tokens).toBeGreaterThan(0);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
      
      // 파일 정리
      testFiles.forEach(file => {
        if (fs.existsSync(file)) {
          fs.unlinkSync(file);
        }
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle file system errors gracefully', () => {
      const invalidPath = '/invalid/path/file.md';
      const tokens = counter.countFileTokens(invalidPath);
      
      expect(tokens).toBe(0);
    });

    test('should handle invalid token counting input', () => {
      expect(counter.countTokens(null)).toBe(0);
      expect(counter.countTokens(undefined)).toBe(0);
      expect(counter.countTokens(123)).toBe(0);
      expect(counter.countTokens({})).toBe(0);
    });

    test('should handle storage errors gracefully', () => {
      const invalidSessionData = null;
      
      expect(() => {
        storage.recordSessionUsage(invalidSessionData);
      }).not.toThrow();
    });

    test('should handle monitoring errors gracefully', () => {
      const invalidThresholds = null;
      
      expect(() => {
        monitor.setThresholds(invalidThresholds);
      }).not.toThrow();
    });
  });

  describe('Integration Tests', () => {
    test('should work end-to-end', async () => {
      // 1. 토큰 카운팅
      const countResult = await commands.countTokens({ text: 'Hello, world!' });
      expect(countResult).toBeTruthy();
      
      // 2. 명령어 추적
      const trackResult = await commands.trackCommand({
        command: 'test-command',
        input: 'input',
        output: 'output'
      });
      expect(trackResult).toBeTruthy();
      
      // 3. 압축 추적
      const compressionResult = await commands.trackCompression({
        originalTokens: 1000,
        compressedTokens: 600
      });
      expect(compressionResult).toBeTruthy();
      
      // 4. 세션 보고서 생성
      const sessionReport = await commands.generateSessionReport();
      expect(sessionReport).toBeTruthy();
      
      // 5. 모니터링 설정
      const monitoringResult = await commands.setupMonitoring({
        enable: true,
        thresholds: { dailyTokenLimit: 5000 }
      });
      expect(monitoringResult.success).toBe(true);
      
      // 6. 시스템 상태 확인
      const systemStatus = await commands.getSystemStatus();
      expect(systemStatus).toBeTruthy();
    });
  });
});

// 성능 벤치마크 함수
export function runPerformanceBenchmark() {
  console.log('=== Token Tracking System Performance Benchmark ===');
  
  const counter = new TokenCounter();
  const results = {
    tokenCounting: [],
    fileProcessing: [],
    directoryAnalysis: []
  };
  
  // 토큰 카운팅 성능 테스트
  const testTexts = [
    'Short text',
    'Medium length text. '.repeat(100),
    'Very long text. '.repeat(1000)
  ];
  
  testTexts.forEach((text, index) => {
    const startTime = performance.now();
    const tokens = counter.countTokens(text);
    const endTime = performance.now();
    
    results.tokenCounting.push({
      textLength: text.length,
      tokens,
      processingTime: endTime - startTime,
      tokensPerSecond: tokens / ((endTime - startTime) / 1000)
    });
  });
  
  // 결과 출력
  console.log('\n--- Token Counting Performance ---');
  results.tokenCounting.forEach((result, index) => {
    console.log(`Test ${index + 1}:`);
    console.log(`  Text Length: ${result.textLength.toLocaleString()} characters`);
    console.log(`  Tokens: ${result.tokens.toLocaleString()}`);
    console.log(`  Processing Time: ${result.processingTime.toFixed(2)}ms`);
    console.log(`  Tokens/Second: ${result.tokensPerSecond.toFixed(0)}`);
  });
  
  // 정리
  counter.cleanup();
  
  console.log('\n=== Benchmark Complete ===');
  
  return results;
}

export default runPerformanceBenchmark;