/**
 * 프롬프트 주입 메커니즘
 * 페르소나 컨텍스트를 프롬프트에 동적으로 주입하는 모듈
 */

const ContextRuleParser = require('./context-rule-parser');
const TokenCounter = require('./token-counter');

class PromptInjector {
  constructor() {
    this.contextParser = new ContextRuleParser();
    this.tokenCounter = new TokenCounter();
    this.activePersona = null;
    this.contextCache = new Map();
  }

  /**
   * 페르소나 컨텍스트를 프롬프트에 주입
   * @param {string} originalPrompt - 원본 프롬프트
   * @param {string} personaName - 적용할 페르소나 이름
   * @returns {Object} 주입된 프롬프트와 메타데이터
   */
  async injectContext(originalPrompt, personaName) {
    try {
      // 컨텍스트 규칙 로드
      const context = await this.contextParser.parseContextRules(personaName);
      
      // 프롬프트 템플릿 생성
      const injectedPrompt = this.buildInjectedPrompt(originalPrompt, context);
      
      // 토큰 사용량 계산
      const tokenMetrics = await this.calculateTokenMetrics(
        originalPrompt,
        injectedPrompt,
        context
      );

      // 결과 반환
      return {
        success: true,
        originalPrompt,
        injectedPrompt,
        personaName,
        context,
        tokenMetrics,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('프롬프트 주입 오류:', error);
      return {
        success: false,
        originalPrompt,
        injectedPrompt: originalPrompt,
        personaName,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 주입된 프롬프트 생성
   * @param {string} originalPrompt - 원본 프롬프트
   * @param {Object} context - 페르소나 컨텍스트
   * @returns {string} 주입된 프롬프트
   */
  buildInjectedPrompt(originalPrompt, context) {
    const contextSection = this.formatContextSection(context);
    
    // 프롬프트 템플릿
    const template = `
## AI 페르소나 컨텍스트
${contextSection}

## 사용자 요청
${originalPrompt}

## 응답 가이드라인
위의 페르소나 컨텍스트를 기반으로 응답해주세요. 특히 다음 사항을 고려하세요:
- 분석 접근법: ${context.analysis_approach}
- 소통 스타일: ${context.communication_style}
- 핵심 원칙: ${context.design_principles?.join(', ') || '해당 없음'}
`;

    return template.trim();
  }

  /**
   * 컨텍스트 섹션 포맷팅
   * @param {Object} context - 페르소나 컨텍스트
   * @returns {string} 포맷된 컨텍스트
   */
  formatContextSection(context) {
    const sections = [];

    // 페르소나 정보
    sections.push(`### 페르소나: ${context.persona_name}`);
    
    // 분석 접근법
    if (context.analysis_approach) {
      sections.push(`**분석 접근법**: ${context.analysis_approach}`);
    }

    // 설계 원칙
    if (context.design_principles && context.design_principles.length > 0) {
      sections.push(`**설계 원칙**:\n${context.design_principles.map(p => `- ${p}`).join('\n')}`);
    }

    // 소통 스타일
    if (context.communication_style) {
      sections.push(`**소통 스타일**: ${context.communication_style}`);
    }

    // 추가 컨텍스트
    if (context.content) {
      sections.push(`\n**상세 컨텍스트**:\n${context.content}`);
    }

    return sections.join('\n\n');
  }

  /**
   * 토큰 메트릭 계산
   * @param {string} original - 원본 프롬프트
   * @param {string} injected - 주입된 프롬프트
   * @param {Object} context - 컨텍스트
   * @returns {Object} 토큰 메트릭
   */
  async calculateTokenMetrics(original, injected, context) {
    const originalTokens = await this.tokenCounter.estimateTokens(original);
    const injectedTokens = await this.tokenCounter.estimateTokens(injected);
    const contextTokens = injectedTokens - originalTokens;

    return {
      originalTokens,
      injectedTokens,
      contextTokens,
      tokenIncrease: contextTokens,
      percentageIncrease: ((contextTokens / originalTokens) * 100).toFixed(2) + '%'
    };
  }

  /**
   * 페르소나 전환
   * @param {string} personaName - 새로운 페르소나 이름
   * @returns {Object} 전환 결과
   */
  async switchPersona(personaName) {
    const previousPersona = this.activePersona;
    this.activePersona = personaName;

    // 새 페르소나 컨텍스트 미리 로드
    const context = await this.contextParser.parseContextRules(personaName);
    this.contextCache.set(personaName, context);

    return {
      previousPersona,
      currentPersona: personaName,
      context,
      switchedAt: new Date().toISOString()
    };
  }

  /**
   * 현재 활성 페르소나 확인
   * @returns {string|null} 현재 페르소나 이름
   */
  getActivePersona() {
    return this.activePersona;
  }

  /**
   * 컨텍스트 압축 (토큰 한계 초과 시)
   * @param {Object} context - 원본 컨텍스트
   * @param {number} maxTokens - 최대 토큰 수
   * @returns {Object} 압축된 컨텍스트
   */
  async compressContext(context, maxTokens) {
    // 우선순위에 따라 컨텍스트 요소 선택
    const compressed = {
      persona_name: context.persona_name,
      analysis_approach: context.analysis_approach,
      communication_style: context.communication_style
    };

    // 토큰 수 확인하며 점진적으로 추가
    let currentTokens = await this.tokenCounter.estimateTokens(
      JSON.stringify(compressed)
    );

    if (currentTokens < maxTokens && context.design_principles) {
      compressed.design_principles = context.design_principles.slice(0, 3);
      currentTokens = await this.tokenCounter.estimateTokens(
        JSON.stringify(compressed)
      );
    }

    if (currentTokens < maxTokens && context.content) {
      const maxContentLength = Math.floor((maxTokens - currentTokens) * 4);
      compressed.content = context.content.substring(0, maxContentLength) + '...';
    }

    return compressed;
  }

  /**
   * 프롬프트 주입 품질 검증
   * @param {Object} injectionResult - 주입 결과
   * @returns {Object} 품질 검증 결과
   */
  validateInjection(injectionResult) {
    const validation = {
      valid: true,
      issues: []
    };

    // 기본 검증
    if (!injectionResult.success) {
      validation.valid = false;
      validation.issues.push('주입 실패');
    }

    // 토큰 증가율 검증
    const tokenIncrease = parseFloat(
      injectionResult.tokenMetrics?.percentageIncrease?.replace('%', '') || 0
    );
    if (tokenIncrease > 50) {
      validation.issues.push('토큰 증가율이 50%를 초과합니다');
    }

    // 컨텍스트 완전성 검증
    const context = injectionResult.context;
    if (!context || !context.persona_name) {
      validation.valid = false;
      validation.issues.push('페르소나 정보 누락');
    }

    return validation;
  }
}

module.exports = PromptInjector;