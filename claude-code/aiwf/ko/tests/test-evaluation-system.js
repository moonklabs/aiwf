#!/usr/bin/env node

/**
 * 페르소나 평가 시스템 테스트
 */

import chalk from 'chalk';
import PersonaQualityEvaluator from '../utils/persona-quality-evaluator.js';
import PersonaBehaviorValidator from '../utils/persona-behavior-validator.js';

console.log(chalk.cyan('🧪 페르소나 평가 시스템 테스트'));
console.log(chalk.gray('━'.repeat(50)));

// 테스트 데이터
const testCases = {
  architect: {
    prompt: "마이크로서비스 아키텍처에서 데이터 일관성을 어떻게 보장할 수 있나요?",
    goodResponse: `마이크로서비스 아키텍처에서 데이터 일관성을 보장하는 것은 중요한 도전 과제입니다. 다음과 같은 접근 방식을 고려할 수 있습니다:

1. **이벤트 소싱 패턴**: 모든 상태 변경을 이벤트로 저장하여 시스템의 전체 히스토리를 추적하고 재구성할 수 있습니다.

2. **Saga 패턴**: 분산 트랜잭션을 여러 개의 로컬 트랜잭션으로 분해하고, 실패 시 보상 트랜잭션을 실행합니다.

3. **CQRS (Command Query Responsibility Segregation)**: 명령과 조회를 분리하여 각각 최적화된 모델을 사용합니다.

4. **최종 일관성 (Eventual Consistency)**: 즉각적인 일관성 대신 시간이 지나면 일관성이 보장되는 방식을 채택합니다.

각 서비스는 자체 데이터베이스를 가지며, 서비스 간 통신은 API나 메시지 큐를 통해 이루어집니다. 이는 확장성과 독립성을 높이지만 복잡성도 증가시킵니다.`,
    
    poorResponse: "데이터베이스를 공유하면 됩니다."
  },
  
  security: {
    prompt: "웹 애플리케이션의 주요 보안 취약점은 무엇인가요?",
    goodResponse: `웹 애플리케이션의 주요 보안 취약점은 OWASP Top 10을 기준으로 다음과 같습니다:

1. **Injection (인젝션)**: SQL, NoSQL, LDAP 인젝션 등
   - 방어: 파라미터화된 쿼리, 입력 검증

2. **Broken Authentication (인증 취약점)**: 세션 관리 문제
   - 방어: MFA, 강력한 패스워드 정책

3. **Sensitive Data Exposure (민감 데이터 노출)**: 암호화 미적용
   - 방어: TLS 사용, 데이터 암호화

4. **XML External Entities (XXE)**: XML 파서 취약점
   - 방어: XML 파서 보안 설정

5. **Broken Access Control (접근 제어 취약점)**: 권한 검증 부재
   - 방어: 최소 권한 원칙, RBAC

각 취약점에 대해 정기적인 보안 감사와 침투 테스트를 수행해야 합니다.`,
    
    poorResponse: "해킹 조심하세요."
  }
};

// 테스트 실행
async function runTests() {
  const evaluator = new PersonaQualityEvaluator();
  const validator = new PersonaBehaviorValidator();
  
  console.log(chalk.yellow('\n1. 품질 평가 테스트'));
  console.log(chalk.gray('─'.repeat(40)));
  
  // Architect 페르소나 테스트
  console.log(chalk.cyan('\n[Architect - Good Response]'));
  const architectGoodEval = await evaluator.evaluateResponse({
    prompt: testCases.architect.prompt,
    response: testCases.architect.goodResponse,
    personaName: 'architect',
    context: {
      analysis_approach: '시스템 설계 중심',
      communication_style: '구조적이고 논리적',
      design_principles: ['확장성', '유지보수성', '성능']
    }
  });
  
  console.log(`최종 점수: ${(architectGoodEval.scores.final * 100).toFixed(1)}%`);
  console.log(`품질 수준: ${architectGoodEval.quality}`);
  
  console.log(chalk.cyan('\n[Architect - Poor Response]'));
  const architectPoorEval = await evaluator.evaluateResponse({
    prompt: testCases.architect.prompt,
    response: testCases.architect.poorResponse,
    personaName: 'architect',
    context: {
      analysis_approach: '시스템 설계 중심',
      communication_style: '구조적이고 논리적',
      design_principles: ['확장성', '유지보수성', '성능']
    }
  });
  
  console.log(`최종 점수: ${(architectPoorEval.scores.final * 100).toFixed(1)}%`);
  console.log(`품질 수준: ${architectPoorEval.quality}`);
  
  console.log(chalk.yellow('\n2. 행동 검증 테스트'));
  console.log(chalk.gray('─'.repeat(40)));
  
  // Security 페르소나 테스트
  console.log(chalk.cyan('\n[Security - Good Response]'));
  const securityGoodValidation = validator.validateResponse(
    testCases.security.goodResponse,
    'security',
    testCases.security.prompt
  );
  
  console.log(`유효성: ${securityGoodValidation.valid ? '✅ 유효' : '❌ 무효'}`);
  console.log(`전체 점수: ${(securityGoodValidation.overallScore * 100).toFixed(1)}%`);
  
  console.log(chalk.cyan('\n[Security - Poor Response]'));
  const securityPoorValidation = validator.validateResponse(
    testCases.security.poorResponse,
    'security',
    testCases.security.prompt
  );
  
  console.log(`유효성: ${securityPoorValidation.valid ? '✅ 유효' : '❌ 무효'}`);
  console.log(`전체 점수: ${(securityPoorValidation.overallScore * 100).toFixed(1)}%`);
  
  console.log(chalk.yellow('\n3. 페르소나 비교 테스트'));
  console.log(chalk.gray('─'.repeat(40)));
  
  const comparisonPrompt = "사용자 인증을 구현하는 방법을 설명해주세요.";
  const responses = [
    {
      personaName: 'architect',
      response: "인증 시스템은 전체 아키텍처의 핵심 컴포넌트입니다. JWT 기반의 stateless 인증을 권장하며, 인증 서비스를 별도 마이크로서비스로 분리하여 확장성을 확보합니다.",
      context: { analysis_approach: '시스템 설계 중심' }
    },
    {
      personaName: 'security',
      response: "인증 구현 시 OWASP 가이드라인을 준수해야 합니다. bcrypt로 패스워드를 해싱하고, MFA를 구현하며, 세션 고정 공격과 CSRF를 방어해야 합니다.",
      context: { analysis_approach: '보안 취약점 중심' }
    },
    {
      personaName: 'backend',
      response: "Node.js와 Express를 사용하여 passport.js 미들웨어로 인증을 구현합니다. Redis로 세션을 관리하고, PostgreSQL에 사용자 정보를 저장합니다.",
      context: { analysis_approach: 'API 및 데이터 처리 중심' }
    }
  ];
  
  const comparison = await evaluator.comparePersonaResponses(responses, comparisonPrompt);
  
  console.log('\n순위:');
  comparison.ranking.forEach((item, index) => {
    console.log(`${index + 1}. ${item.persona}: ${(item.score * 100).toFixed(1)}%`);
  });
  
  console.log(chalk.green('\n✅ 테스트 완료!'));
}

// 테스트 실행
runTests().catch(error => {
  console.error(chalk.red(`테스트 실패: ${error.message}`));
  process.exit(1);
});