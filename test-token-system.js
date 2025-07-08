import { TokenCounter } from './claude-code/aiwf/ko/utils/token-counter.js';
import { TokenTracker } from './claude-code/aiwf/ko/utils/token-tracker.js';
import { TokenTrackingCommands } from './claude-code/aiwf/ko/commands/token-tracking.js';

/**
 * 토큰 추적 시스템 기본 테스트
 */
async function testTokenTrackingSystem() {
  console.log('=== 토큰 추적 시스템 테스트 시작 ===');
  
  try {
    // 1. 토큰 카운터 테스트
    console.log('\n1. 토큰 카운터 테스트...');
    const counter = new TokenCounter();
    
    const testText = 'Hello, world! This is a test of the token counting system.';
    const tokens = counter.countTokens(testText);
    console.log(`테스트 텍스트: "${testText}"`);
    console.log(`토큰 수: ${tokens}`);
    console.log(`문자 수: ${testText.length}`);
    console.log(`토큰/문자 비율: ${(tokens / testText.length).toFixed(3)}`);
    
    // 2. 토큰 추적 테스트
    console.log('\n2. 토큰 추적 테스트...');
    const tracker = new TokenTracker();
    
    const commandResult = tracker.trackCommand('test-command', 'input text', 'output text');
    console.log('명령어 추적 결과:', commandResult);
    
    // 3. 압축 추적 테스트
    console.log('\n3. 압축 추적 테스트...');
    tracker.trackCompression(1000, 600);
    console.log('압축 통계:', tracker.usage);
    
    // 4. 세션 보고서 생성
    console.log('\n4. 세션 보고서 생성...');
    const sessionReport = tracker.generateReport();
    console.log('세션 보고서:', {
      sessionId: sessionReport.sessionId,
      totalCommands: sessionReport.totalCommands,
      totalTokens: sessionReport.totalTokens,
      compressionStats: sessionReport.compressionStats
    });
    
    // 5. 명령어 인터페이스 테스트
    console.log('\n5. 명령어 인터페이스 테스트...');
    const commands = new TokenTrackingCommands();
    
    const countResult = await commands.countTokens({ text: testText });
    console.log('명령어 인터페이스 토큰 카운트:', countResult);
    
    const trackResult = await commands.trackCommand({
      command: 'interface-test',
      input: 'interface input',
      output: 'interface output'
    });
    console.log('명령어 인터페이스 추적 결과:', trackResult);
    
    // 6. 성능 테스트
    console.log('\n6. 성능 테스트...');
    const largeText = 'This is a performance test. '.repeat(1000);
    
    const startTime = performance.now();
    const largeTokens = counter.countTokens(largeText);
    const endTime = performance.now();
    
    console.log(`대용량 텍스트 토큰 수: ${largeTokens.toLocaleString()}`);
    console.log(`처리 시간: ${(endTime - startTime).toFixed(2)}ms`);
    console.log(`처리 속도: ${(largeTokens / ((endTime - startTime) / 1000)).toFixed(0)} tokens/sec`);
    
    // 정리
    counter.cleanup();
    tracker.cleanup();
    commands.cleanup();
    
    console.log('\n=== 테스트 완료 ===');
    console.log('✅ 모든 테스트가 성공적으로 완료되었습니다.');
    
  } catch (error) {
    console.error('\n❌ 테스트 중 오류 발생:', error);
    process.exit(1);
  }
}

// 테스트 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  testTokenTrackingSystem();
}