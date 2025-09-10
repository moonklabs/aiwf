/**
 * 페르소나 인식 컨텍스트 압축기
 * 현재 활성화된 페르소나에 따라 압축 전략을 조정합니다
 */

import { ContextCompressor } from './context-compressor.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class PersonaAwareCompressor extends ContextCompressor {
  constructor(mode = 'balanced') {
    super(mode);
    this.currentPersona = null;
    this.personaStrategies = this.initializePersonaStrategies();
  }

  /**
   * 페르소나별 압축 전략 초기화
   */
  initializePersonaStrategies() {
    return {
      architect: {
        preservePatterns: [
          '시스템', '아키텍처', '설계', '구조', '패턴', '확장성',
          'API', 'interface', 'component', 'module', 'layer'
        ],
        focusAreas: ['system_design', 'architecture', 'patterns'],
        compressionWeights: {
          implementation_details: 0.3,  // 구현 세부사항은 적게
          design_concepts: 0.9,         // 설계 개념은 많이 보존
          code_examples: 0.5,           // 코드 예제는 중간
          theoretical_content: 0.8      // 이론적 내용은 많이 보존
        },
        summarizationFocus: 'high-level structure and design patterns'
      },
      
      security: {
        preservePatterns: [
          '보안', '취약점', '위협', '암호화', '인증', '권한',
          'vulnerability', 'threat', 'attack', 'defense', 'exploit'
        ],
        focusAreas: ['security_threats', 'vulnerabilities', 'mitigation'],
        compressionWeights: {
          security_warnings: 1.0,       // 보안 경고는 모두 보존
          vulnerability_details: 1.0,   // 취약점 세부사항 모두 보존
          general_info: 0.4,           // 일반 정보는 압축
          examples: 0.6                // 예제는 중간 정도 보존
        },
        summarizationFocus: 'security implications and mitigation strategies'
      },
      
      frontend: {
        preservePatterns: [
          'UI', 'UX', '사용자', '화면', '컴포넌트', '스타일',
          'react', 'vue', 'component', 'style', 'responsive', 'accessibility'
        ],
        focusAreas: ['user_interface', 'user_experience', 'visual_design'],
        compressionWeights: {
          visual_descriptions: 0.8,     // 시각적 설명 많이 보존
          code_snippets: 0.7,          // 코드 스니펫 보존
          backend_details: 0.2,        // 백엔드 세부사항은 압축
          styling_info: 0.9            // 스타일링 정보 많이 보존
        },
        summarizationFocus: 'UI components and user interaction flows'
      },
      
      backend: {
        preservePatterns: [
          'API', '데이터베이스', '서버', '성능', '트랜잭션', '캐시',
          'endpoint', 'database', 'query', 'performance', 'optimization'
        ],
        focusAreas: ['api_design', 'data_processing', 'performance'],
        compressionWeights: {
          api_specifications: 0.9,      // API 명세 많이 보존
          database_schemas: 0.8,        // DB 스키마 보존
          frontend_details: 0.2,        // 프론트엔드 세부사항 압축
          performance_metrics: 0.9      // 성능 지표 많이 보존
        },
        summarizationFocus: 'API endpoints and data flow'
      },
      
      data_analyst: {
        preservePatterns: [
          '데이터', '분석', '통계', '지표', '시각화', '인사이트',
          'data', 'analysis', 'statistics', 'metrics', 'visualization'
        ],
        focusAreas: ['data_analysis', 'insights', 'visualization'],
        compressionWeights: {
          data_descriptions: 0.9,       // 데이터 설명 많이 보존
          analysis_methods: 0.8,        // 분석 방법 보존
          raw_data: 0.3,               // 원시 데이터는 압축
          insights: 1.0,               // 인사이트는 모두 보존
          visualizations: 0.7          // 시각화 정보 보존
        },
        summarizationFocus: 'data patterns and analytical insights'
      }
    };
  }

  /**
   * 현재 페르소나 로드
   */
  loadCurrentPersona() {
    try {
      const projectRoot = this.findProjectRoot();
      const personaPath = path.join(projectRoot, '.aiwf', 'current_persona.json');
      
      if (fs.existsSync(personaPath)) {
        const personaData = JSON.parse(fs.readFileSync(personaPath, 'utf8'));
        this.currentPersona = personaData.persona;
        return personaData;
      }
    } catch (error) {
      console.warn('페르소나 정보를 로드할 수 없습니다:', error.message);
    }
    
    return null;
  }

  /**
   * 프로젝트 루트 찾기
   */
  findProjectRoot() {
    let currentDir = process.cwd();
    
    while (currentDir !== path.dirname(currentDir)) {
      if (fs.existsSync(path.join(currentDir, '.aiwf'))) {
        return currentDir;
      }
      currentDir = path.dirname(currentDir);
    }
    
    return process.cwd();
  }

  /**
   * 페르소나 인식 압축 수행
   */
  async compress(content, options = {}) {
    // 현재 페르소나 로드
    const personaData = this.loadCurrentPersona();
    
    if (!personaData || !this.personaStrategies[personaData.persona]) {
      // 페르소나가 없으면 기본 압축 수행
      return super.compress(content, options);
    }

    // 페르소나별 전략 적용
    const strategy = this.personaStrategies[personaData.persona];
    const enhancedOptions = {
      ...options,
      personaStrategy: strategy,
      currentPersona: personaData.persona,
      preservePatterns: [
        ...(options.preservePatterns || []),
        ...strategy.preservePatterns
      ]
    };

    // 압축 수행
    const result = await this.performPersonaAwareCompression(content, enhancedOptions);
    
    // 페르소나 메타데이터 추가
    if (result.success) {
      result.metadata = {
        ...result.metadata,
        persona: personaData.persona,
        personaStrategy: {
          focusAreas: strategy.focusAreas,
          summarizationFocus: strategy.summarizationFocus
        }
      };
    }
    
    return result;
  }

  /**
   * 페르소나 인식 압축 수행
   */
  async performPersonaAwareCompression(content, options) {
    const { personaStrategy, currentPersona } = options;
    
    try {
      // 1. 컨텐츠 분석
      const contentAnalysis = this.analyzeContent(content, personaStrategy);
      
      // 2. 페르소나별 중요도 점수 계산
      const importanceScores = this.calculateImportanceScores(
        contentAnalysis,
        personaStrategy
      );
      
      // 3. 선택적 압축
      let compressed = content;
      
      // 섹션별 압축
      if (contentAnalysis.sections.length > 0) {
        compressed = this.compressSectionsByImportance(
          contentAnalysis.sections,
          importanceScores,
          personaStrategy
        );
      }
      
      // 4. 페르소나 특화 요약
      if (options.strategy === 'aggressive') {
        const summary = await this.generatePersonaFocusedSummary(
          compressed,
          personaStrategy
        );
        
        if (summary) {
          compressed = this.integratePersonaSummary(compressed, summary, currentPersona);
        }
      }
      
      // 5. 토큰 수 계산
      const originalTokens = this.tokenCounter.countTokens(content);
      const compressedTokens = this.tokenCounter.countTokens(compressed);
      
      return {
        success: true,
        original: content,
        compressed: compressed,
        originalTokens: originalTokens,
        compressedTokens: compressedTokens,
        compressionRatio: ((originalTokens - compressedTokens) / originalTokens * 100).toFixed(1),
        metadata: {
          validation: this.validateCompression(content, compressed),
          contentAnalysis: contentAnalysis,
          importanceScores: importanceScores,
          personaFocus: personaStrategy.summarizationFocus
        }
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        original: content,
        compressed: content
      };
    }
  }

  /**
   * 컨텐츠 분석
   */
  analyzeContent(content, strategy) {
    const lines = content.split('\n');
    const sections = [];
    let currentSection = null;
    
    lines.forEach((line, index) => {
      // 섹션 헤더 감지
      if (line.match(/^#+\s/)) {
        if (currentSection) {
          sections.push(currentSection);
        }
        currentSection = {
          header: line,
          startLine: index,
          content: [],
          relevanceScore: 0
        };
      } else if (currentSection) {
        currentSection.content.push(line);
      }
    });
    
    if (currentSection) {
      sections.push(currentSection);
    }
    
    // 각 섹션의 관련성 점수 계산
    sections.forEach(section => {
      section.relevanceScore = this.calculateSectionRelevance(
        section,
        strategy
      );
    });
    
    return {
      sections,
      totalLines: lines.length,
      hasCode: content.includes('```'),
      hasTables: content.includes('|'),
      hasLists: /^[-*]\s/.test(content)
    };
  }

  /**
   * 섹션 관련성 점수 계산
   */
  calculateSectionRelevance(section, strategy) {
    const fullText = section.header + '\n' + section.content.join('\n');
    let score = 0;
    
    // 보존 패턴 매칭
    strategy.preservePatterns.forEach(pattern => {
      const regex = new RegExp(pattern, 'gi');
      const matches = fullText.match(regex);
      if (matches) {
        score += matches.length * 2;
      }
    });
    
    // 포커스 영역 확인
    strategy.focusAreas.forEach(area => {
      if (fullText.toLowerCase().includes(area.replace('_', ' '))) {
        score += 5;
      }
    });
    
    // 섹션 헤더 레벨에 따른 가중치
    const headerLevel = (section.header.match(/^#+/) || [''])[0].length;
    score *= (5 - Math.min(headerLevel, 4)) / 4;
    
    return score;
  }

  /**
   * 중요도 점수 계산
   */
  calculateImportanceScores(analysis, strategy) {
    const scores = {};
    
    analysis.sections.forEach((section, index) => {
      // 기본 점수
      let importance = section.relevanceScore;
      
      // 컨텐츠 타입별 가중치 적용
      const sectionText = section.content.join('\n');
      
      if (sectionText.includes('```') && strategy.compressionWeights.code_examples) {
        importance *= strategy.compressionWeights.code_examples;
      }
      
      if (section.header.toLowerCase().includes('security') && 
          strategy.compressionWeights.security_warnings) {
        importance *= strategy.compressionWeights.security_warnings;
      }
      
      scores[index] = importance;
    });
    
    return scores;
  }

  /**
   * 중요도에 따른 섹션 압축
   */
  compressSectionsByImportance(sections, importanceScores, strategy) {
    const compressed = [];
    
    // 중요도 순으로 정렬
    const sortedIndices = Object.keys(importanceScores)
      .sort((a, b) => importanceScores[b] - importanceScores[a]);
    
    // 평균 중요도 계산
    const avgImportance = Object.values(importanceScores)
      .reduce((sum, score) => sum + score, 0) / Object.keys(importanceScores).length;
    
    sections.forEach((section, index) => {
      const importance = importanceScores[index];
      
      // 중요도가 평균 이상이면 전체 보존
      if (importance >= avgImportance * 1.2) {
        compressed.push(section.header);
        compressed.push(...section.content);
      }
      // 중요도가 낮으면 요약
      else if (importance < avgImportance * 0.5) {
        compressed.push(section.header);
        compressed.push(this.summarizeSection(section, strategy));
      }
      // 중간이면 부분 압축
      else {
        compressed.push(section.header);
        const compressedContent = this.partiallyCompressSection(section, strategy);
        compressed.push(...compressedContent);
      }
      
      compressed.push(''); // 섹션 구분
    });
    
    return compressed.join('\n');
  }

  /**
   * 섹션 요약
   */
  summarizeSection(section, strategy) {
    const content = section.content.join(' ');
    const sentences = content.split(/[.!?]+/).filter(s => s.trim());
    
    if (sentences.length <= 2) {
      return content;
    }
    
    // 페르소나 관련 문장 우선 선택
    const relevantSentences = sentences.filter(sentence => {
      return strategy.preservePatterns.some(pattern => 
        sentence.toLowerCase().includes(pattern.toLowerCase())
      );
    });
    
    if (relevantSentences.length > 0) {
      return `[요약] ${relevantSentences.slice(0, 2).join('. ')}.`;
    }
    
    // 첫 문장과 마지막 문장
    return `[요약] ${sentences[0]}... ${sentences[sentences.length - 1]}.`;
  }

  /**
   * 부분 압축
   */
  partiallyCompressSection(section, strategy) {
    const compressed = [];
    let skipNext = false;
    
    section.content.forEach((line, index) => {
      // 빈 줄은 유지
      if (!line.trim()) {
        compressed.push(line);
        return;
      }
      
      // 중요 패턴이 포함된 줄은 유지
      const hasImportantPattern = strategy.preservePatterns.some(pattern =>
        line.toLowerCase().includes(pattern.toLowerCase())
      );
      
      if (hasImportantPattern) {
        compressed.push(line);
        skipNext = false;
      } else if (!skipNext) {
        // 일반 줄은 2줄 중 1줄만 유지
        compressed.push(line);
        skipNext = true;
      } else {
        skipNext = false;
      }
    });
    
    return compressed;
  }

  /**
   * 페르소나 중심 요약 생성
   */
  async generatePersonaFocusedSummary(content, strategy) {
    try {
      // 여기서는 간단한 추출 기반 요약 구현
      // 실제로는 AI 기반 요약을 사용할 수 있습니다
      
      const sentences = content.split(/[.!?]+/).filter(s => s.trim());
      const scoredSentences = [];
      
      sentences.forEach(sentence => {
        let score = 0;
        
        // 페르소나 패턴 점수
        strategy.preservePatterns.forEach(pattern => {
          if (sentence.toLowerCase().includes(pattern.toLowerCase())) {
            score += 3;
          }
        });
        
        // 포커스 영역 점수
        strategy.focusAreas.forEach(area => {
          if (sentence.toLowerCase().includes(area.replace('_', ' '))) {
            score += 2;
          }
        });
        
        if (score > 0) {
          scoredSentences.push({ sentence, score });
        }
      });
      
      // 점수 순으로 정렬하고 상위 문장 선택
      const topSentences = scoredSentences
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map(item => item.sentence);
      
      if (topSentences.length > 0) {
        return `주요 내용 (${strategy.summarizationFocus}):\n` +
               topSentences.map(s => `- ${s.trim()}`).join('\n');
      }
      
      return null;
      
    } catch (error) {
      console.error('요약 생성 실패:', error);
      return null;
    }
  }

  /**
   * 페르소나 요약 통합
   */
  integratePersonaSummary(content, summary, persona) {
    const personaNames = {
      architect: 'Architect',
      security: 'Security Expert',
      frontend: 'Frontend Developer',
      backend: 'Backend Developer',
      data_analyst: 'Data Analyst'
    };
    
    const header = `\n\n---\n### ${personaNames[persona]} 관점 요약\n\n`;
    
    return content + header + summary + '\n---\n';
  }

  /**
   * 압축 결과 검증
   */
  validateCompression(original, compressed) {
    const validation = super.validateCompression(original, compressed);
    
    // 페르소나별 추가 검증
    if (this.currentPersona) {
      const strategy = this.personaStrategies[this.currentPersona];
      
      // 중요 패턴 보존율 확인
      let preservedPatterns = 0;
      let totalPatterns = 0;
      
      strategy.preservePatterns.forEach(pattern => {
        const originalCount = (original.match(new RegExp(pattern, 'gi')) || []).length;
        const compressedCount = (compressed.match(new RegExp(pattern, 'gi')) || []).length;
        
        totalPatterns += originalCount;
        preservedPatterns += Math.min(originalCount, compressedCount);
      });
      
      validation.patternPreservationRate = totalPatterns > 0 
        ? (preservedPatterns / totalPatterns * 100).toFixed(1)
        : 100;
      
      validation.personaAligned = validation.patternPreservationRate > 70;
    }
    
    return validation;
  }

  /**
   * 페르소나별 압축 통계
   */
  getPersonaCompressionStats() {
    return {
      currentPersona: this.currentPersona,
      strategy: this.currentPersona ? this.personaStrategies[this.currentPersona] : null,
      compressionHistory: this.compressionHistory || [],
      averageRatioByPersona: this.calculateAverageRatioByPersona()
    };
  }

  /**
   * 페르소나별 평균 압축률 계산
   */
  calculateAverageRatioByPersona() {
    if (!this.compressionHistory || this.compressionHistory.length === 0) {
      return {};
    }
    
    const ratiosByPersona = {};
    
    this.compressionHistory.forEach(record => {
      const persona = record.metadata?.persona || 'unknown';
      
      if (!ratiosByPersona[persona]) {
        ratiosByPersona[persona] = [];
      }
      
      ratiosByPersona[persona].push(parseFloat(record.compressionRatio));
    });
    
    const averages = {};
    Object.keys(ratiosByPersona).forEach(persona => {
      const ratios = ratiosByPersona[persona];
      averages[persona] = (ratios.reduce((sum, r) => sum + r, 0) / ratios.length).toFixed(1);
    });
    
    return averages;
  }
}

export default PersonaAwareCompressor;