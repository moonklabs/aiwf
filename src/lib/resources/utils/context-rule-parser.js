/**
 * 페르소나 컨텍스트 규칙 파서
 * AI 페르소나별 컨텍스트 규칙을 파싱하고 처리하는 모듈
 */

const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');

class ContextRuleParser {
  constructor() {
    this.cache = new Map();
    this.lastModifiedTimes = new Map();
  }

  /**
   * 페르소나 컨텍스트 규칙 파일 파싱
   * @param {string} personaName - 페르소나 이름
   * @returns {Object} 파싱된 컨텍스트 규칙
   */
  async parseContextRules(personaName) {
    const contextPath = path.join(
      process.cwd(),
      '.aiwf',
      '07_AI_PERSONAS',
      personaName,
      'context_rules.md'
    );

    try {
      // 캐시 확인
      const cached = await this.getCachedRules(contextPath);
      if (cached) return cached;

      // 파일 읽기
      const content = await fs.readFile(contextPath, 'utf-8');
      
      // YAML frontmatter와 마크다운 본문 분리
      const { frontmatter, body } = this.separateFrontmatter(content);
      
      // 컨텍스트 규칙 구조화
      const rules = {
        ...frontmatter,
        content: body,
        parsedAt: new Date().toISOString()
      };

      // 캐시 저장
      this.cache.set(contextPath, rules);
      
      return rules;
    } catch (error) {
      console.error(`컨텍스트 규칙 파싱 오류 (${personaName}):`, error.message);
      return this.getDefaultContext(personaName);
    }
  }

  /**
   * YAML frontmatter와 마크다운 본문 분리
   * @param {string} content - 전체 파일 내용
   * @returns {Object} frontmatter와 body
   */
  separateFrontmatter(content) {
    const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
    const match = content.match(frontmatterRegex);

    if (match) {
      try {
        const frontmatter = yaml.load(match[1]);
        const body = match[2].trim();
        return { frontmatter, body };
      } catch (error) {
        console.error('YAML 파싱 오류:', error);
        return { frontmatter: {}, body: content };
      }
    }

    return { frontmatter: {}, body: content };
  }

  /**
   * 캐시된 규칙 확인 및 반환
   * @param {string} filePath - 파일 경로
   * @returns {Object|null} 캐시된 규칙 또는 null
   */
  async getCachedRules(filePath) {
    try {
      const stats = await fs.stat(filePath);
      const lastModified = stats.mtimeMs;
      
      const cachedTime = this.lastModifiedTimes.get(filePath);
      if (cachedTime && cachedTime === lastModified) {
        return this.cache.get(filePath);
      }
      
      this.lastModifiedTimes.set(filePath, lastModified);
      return null;
    } catch {
      return null;
    }
  }

  /**
   * 기본 컨텍스트 규칙 반환
   * @param {string} personaName - 페르소나 이름
   * @returns {Object} 기본 컨텍스트 규칙
   */
  getDefaultContext(personaName) {
    const defaults = {
      architect: {
        persona_name: 'architect',
        analysis_approach: '시스템 설계 중심',
        design_principles: ['확장성', '유지보수성', '성능'],
        communication_style: '구조적이고 논리적',
        content: '아키텍트 페르소나는 시스템 전체 구조를 고려하여 설계합니다.'
      },
      frontend: {
        persona_name: 'frontend',
        analysis_approach: 'UI/UX 중심',
        design_principles: ['사용성', '접근성', '반응성'],
        communication_style: '시각적이고 직관적',
        content: '프론트엔드 페르소나는 사용자 경험을 최우선으로 고려합니다.'
      },
      backend: {
        persona_name: 'backend',
        analysis_approach: 'API 및 데이터 처리 중심',
        design_principles: ['보안', '효율성', '확장성'],
        communication_style: '기술적이고 정확함',
        content: '백엔드 페르소나는 서버 사이드 로직과 데이터 처리에 집중합니다.'
      },
      data_analyst: {
        persona_name: 'data_analyst',
        analysis_approach: '데이터 기반 의사결정',
        design_principles: ['정확성', '통찰력', '시각화'],
        communication_style: '분석적이고 통계적',
        content: '데이터 분석가 페르소나는 데이터를 통한 인사이트 도출에 집중합니다.'
      },
      security: {
        persona_name: 'security',
        analysis_approach: '보안 취약점 중심',
        design_principles: ['보안성', '무결성', '기밀성'],
        communication_style: '신중하고 방어적',
        content: '보안 페르소나는 시스템의 보안 측면을 최우선으로 고려합니다.'
      }
    };

    return defaults[personaName] || {
      persona_name: personaName,
      analysis_approach: '일반적 접근',
      design_principles: ['품질', '효율성'],
      communication_style: '표준적',
      content: '기본 페르소나 컨텍스트입니다.'
    };
  }

  /**
   * 모든 페르소나의 컨텍스트 규칙 로드
   * @returns {Object} 모든 페르소나의 컨텍스트 규칙
   */
  async loadAllPersonaContexts() {
    const personas = ['architect', 'frontend', 'backend', 'data_analyst', 'security'];
    const contexts = {};

    for (const persona of personas) {
      contexts[persona] = await this.parseContextRules(persona);
    }

    return contexts;
  }

  /**
   * 캐시 초기화
   */
  clearCache() {
    this.cache.clear();
    this.lastModifiedTimes.clear();
  }
}

module.exports = ContextRuleParser;