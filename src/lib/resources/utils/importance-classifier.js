import { TokenCounter } from './token-counter.js';

/**
 * 중요도 분류 및 점수 계산 시스템
 */
export class ImportanceClassifier {
  constructor() {
    this.tokenCounter = new TokenCounter();
    this.initializeWeights();
  }

  /**
   * 가중치 및 기준을 초기화합니다
   */
  initializeWeights() {
    // 중요도 레벨 정의
    this.importanceLevels = {
      critical: { weight: 1.0, threshold: 8 },
      high: { weight: 0.8, threshold: 5 },
      medium: { weight: 0.6, threshold: 3 },
      low: { weight: 0.4, threshold: 0 }
    };

    // 키워드 가중치
    this.keywordWeights = {
      critical: {
        keywords: ['urgent', 'critical', 'blocking', 'error', 'failed', 'must', 'required', 'essential'],
        weight: 5,
        multiplier: 1.5
      },
      high: {
        keywords: ['important', 'priority', 'deadline', 'milestone', 'goal', 'objective', 'key', 'main'],
        weight: 4,
        multiplier: 1.3
      },
      medium: {
        keywords: ['enhancement', 'improvement', 'optimize', 'should', 'planned', 'task', 'feature'],
        weight: 3,
        multiplier: 1.1
      },
      low: {
        keywords: ['nice-to-have', 'future', 'consider', 'optional', 'example', 'note'],
        weight: 2,
        multiplier: 1.0
      }
    };

    // 한국어 키워드 가중치
    this.koreanKeywordWeights = {
      critical: {
        keywords: ['긴급', '중대', '차단', '오류', '실패', '필수', '요구', '필수적'],
        weight: 5,
        multiplier: 1.5
      },
      high: {
        keywords: ['중요', '우선순위', '마감일', '마일스톤', '목표', '목적', '핵심', '주요'],
        weight: 4,
        multiplier: 1.3
      },
      medium: {
        keywords: ['개선', '향상', '최적화', '해야', '계획된', '태스크', '기능'],
        weight: 3,
        multiplier: 1.1
      },
      low: {
        keywords: ['좋으면', '미래', '고려', '선택적', '예시', '참고'],
        weight: 2,
        multiplier: 1.0
      }
    };

    // 섹션 타입 가중치
    this.sectionWeights = {
      critical: {
        sections: ['subtasks', 'acceptance criteria', 'requirements', 'goal', 'objectives', 'current sprint', 'active tasks'],
        weight: 5
      },
      high: {
        sections: ['description', 'specifications', 'architecture', 'implementation', 'planned tasks'],
        weight: 4
      },
      medium: {
        sections: ['testing', 'documentation', 'notes', 'examples', 'guidelines'],
        weight: 3
      },
      low: {
        sections: ['output log', 'history', 'templates', 'completed tasks', 'old logs'],
        weight: 2
      }
    };

    // 구조적 가중치
    this.structuralWeights = {
      header: {
        levels: {
          1: 5, // # 메인 헤더
          2: 4, // ## 섹션 헤더
          3: 3, // ### 서브섹션
          4: 2, // #### 세부사항
          5: 1, // ##### 최하위
          6: 1  // ###### 최하위
        }
      },
      list: {
        checkbox_unchecked: 4, // - [ ] 미완료 체크박스
        checkbox_checked: 2,   // - [x] 완료 체크박스
        bullet: 2,             // - 불릿 포인트
        numbered: 2            // 1. 번호 목록
      },
      emphasis: {
        bold: 2,      // **굵게**
        italic: 1,    // *기울임*
        code: 1,      // `코드`
        link: 1       // [링크]
      }
    };

    // 위치 가중치
    this.positionWeights = {
      start: 1.2,   // 문서 시작 부분
      middle: 1.0,  // 문서 중간 부분
      end: 0.8      // 문서 끝 부분
    };

    // 길이 가중치
    this.lengthWeights = {
      optimal: { min: 30, max: 150, weight: 1.2 },
      acceptable: { min: 15, max: 300, weight: 1.0 },
      penalty: { min: 0, max: 500, weight: 0.8 }
    };
  }

  /**
   * 콘텐츠의 중요도를 분석합니다
   * @param {string} content - 분석할 콘텐츠
   * @param {Object} options - 분석 옵션
   * @returns {Object} 중요도 분석 결과
   */
  analyzeImportance(content, options = {}) {
    const {
      preserveStructure = true,
      includeMetadata = true,
      detailedScoring = false
    } = options;

    const sections = this.parseContentSections(content);
    const analyzedSections = sections.map((section, index) => {
      const score = this.calculateSectionScore(section, index, sections.length);
      const importance = this.scoreToImportance(score);
      
      return {
        ...section,
        score,
        importance,
        tokens: this.tokenCounter.countTokens(section.content),
        ...(detailedScoring && { scoreBreakdown: this.getScoreBreakdown(section, index, sections.length) })
      };
    });

    // 중요도별 정렬
    const sortedSections = analyzedSections.sort((a, b) => b.score - a.score);

    const result = {
      sections: preserveStructure ? analyzedSections : sortedSections,
      summary: this.generateImportanceSummary(analyzedSections),
      recommendations: this.generateRecommendations(analyzedSections)
    };

    if (includeMetadata) {
      result.metadata = this.generateMetadata(analyzedSections, content);
    }

    return result;
  }

  /**
   * 콘텐츠를 섹션으로 파싱합니다
   * @param {string} content - 파싱할 콘텐츠
   * @returns {Array<Object>} 섹션 배열
   */
  parseContentSections(content) {
    const sections = [];
    const lines = content.split('\n');
    let currentSection = null;
    let currentContent = [];
    let currentLevel = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
      
      if (headerMatch) {
        // 이전 섹션 저장
        if (currentSection) {
          sections.push({
            name: currentSection,
            level: currentLevel,
            content: currentContent.join('\n').trim(),
            type: this.identifySectionType(currentSection),
            startLine: i - currentContent.length,
            endLine: i - 1
          });
        }
        
        // 새 섹션 시작
        currentLevel = headerMatch[1].length;
        currentSection = headerMatch[2].trim();
        currentContent = [line];
      } else {
        if (currentSection) {
          currentContent.push(line);
        } else {
          // 헤더가 없는 초기 콘텐츠
          if (line.trim()) {
            if (!currentSection) {
              currentSection = 'Introduction';
              currentLevel = 1;
              currentContent = [];
            }
            currentContent.push(line);
          }
        }
      }
    }
    
    // 마지막 섹션 저장
    if (currentSection) {
      sections.push({
        name: currentSection,
        level: currentLevel,
        content: currentContent.join('\n').trim(),
        type: this.identifySectionType(currentSection),
        startLine: lines.length - currentContent.length,
        endLine: lines.length - 1
      });
    }

    return sections;
  }

  /**
   * 섹션 타입을 식별합니다
   * @param {string} sectionName - 섹션 이름
   * @returns {string} 섹션 타입
   */
  identifySectionType(sectionName) {
    const lowerName = sectionName.toLowerCase();
    
    for (const [importance, config] of Object.entries(this.sectionWeights)) {
      for (const sectionType of config.sections) {
        if (lowerName.includes(sectionType.toLowerCase())) {
          return sectionType;
        }
      }
    }
    
    return 'general';
  }

  /**
   * 섹션의 점수를 계산합니다
   * @param {Object} section - 섹션 객체
   * @param {number} index - 섹션 인덱스
   * @param {number} totalSections - 전체 섹션 수
   * @returns {number} 점수
   */
  calculateSectionScore(section, index, totalSections) {
    let score = 0;
    const content = section.content;
    const lowerContent = content.toLowerCase();

    // 1. 키워드 기반 점수
    score += this.calculateKeywordScore(lowerContent);

    // 2. 섹션 타입 기반 점수
    score += this.calculateSectionTypeScore(section.type);

    // 3. 구조적 점수
    score += this.calculateStructuralScore(content);

    // 4. 위치 기반 점수
    score += this.calculatePositionScore(index, totalSections);

    // 5. 길이 기반 점수
    score += this.calculateLengthScore(content);

    // 6. 헤더 레벨 점수
    score += this.calculateHeaderLevelScore(section.level);

    // 7. 특수 패턴 점수
    score += this.calculateSpecialPatternScore(content);

    return Math.max(0, score);
  }

  /**
   * 키워드 기반 점수를 계산합니다
   * @param {string} content - 콘텐츠
   * @returns {number} 키워드 점수
   */
  calculateKeywordScore(content) {
    let score = 0;
    
    // 영어 키워드 점수
    for (const [level, config] of Object.entries(this.keywordWeights)) {
      for (const keyword of config.keywords) {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = content.match(regex);
        if (matches) {
          score += matches.length * config.weight * config.multiplier;
        }
      }
    }

    // 한국어 키워드 점수
    for (const [level, config] of Object.entries(this.koreanKeywordWeights)) {
      for (const keyword of config.keywords) {
        const regex = new RegExp(keyword, 'gi');
        const matches = content.match(regex);
        if (matches) {
          score += matches.length * config.weight * config.multiplier;
        }
      }
    }

    return score;
  }

  /**
   * 섹션 타입 기반 점수를 계산합니다
   * @param {string} sectionType - 섹션 타입
   * @returns {number} 섹션 타입 점수
   */
  calculateSectionTypeScore(sectionType) {
    for (const [importance, config] of Object.entries(this.sectionWeights)) {
      if (config.sections.includes(sectionType)) {
        return config.weight;
      }
    }
    return 1; // 기본 점수
  }

  /**
   * 구조적 점수를 계산합니다
   * @param {string} content - 콘텐츠
   * @returns {number} 구조적 점수
   */
  calculateStructuralScore(content) {
    let score = 0;

    // 체크박스 점수
    const uncheckedCheckboxes = content.match(/- \[ \]/g);
    if (uncheckedCheckboxes) {
      score += uncheckedCheckboxes.length * this.structuralWeights.list.checkbox_unchecked;
    }

    const checkedCheckboxes = content.match(/- \[x\]/gi);
    if (checkedCheckboxes) {
      score += checkedCheckboxes.length * this.structuralWeights.list.checkbox_checked;
    }

    // 불릿 포인트 점수
    const bulletPoints = content.match(/^\s*[-*+]\s+/gm);
    if (bulletPoints) {
      score += bulletPoints.length * this.structuralWeights.list.bullet;
    }

    // 번호 목록 점수
    const numberedLists = content.match(/^\s*\d+\.\s+/gm);
    if (numberedLists) {
      score += numberedLists.length * this.structuralWeights.list.numbered;
    }

    // 강조 표시 점수
    const boldText = content.match(/\*\*[^*]+\*\*/g);
    if (boldText) {
      score += boldText.length * this.structuralWeights.emphasis.bold;
    }

    const italicText = content.match(/\*[^*]+\*/g);
    if (italicText) {
      score += italicText.length * this.structuralWeights.emphasis.italic;
    }

    const codeText = content.match(/`[^`]+`/g);
    if (codeText) {
      score += codeText.length * this.structuralWeights.emphasis.code;
    }

    const links = content.match(/\[[^\]]+\]\([^)]+\)/g);
    if (links) {
      score += links.length * this.structuralWeights.emphasis.link;
    }

    return score;
  }

  /**
   * 위치 기반 점수를 계산합니다
   * @param {number} index - 섹션 인덱스
   * @param {number} totalSections - 전체 섹션 수
   * @returns {number} 위치 점수
   */
  calculatePositionScore(index, totalSections) {
    const relativePosition = index / totalSections;
    
    if (relativePosition < 0.3) {
      return this.positionWeights.start;
    } else if (relativePosition > 0.7) {
      return this.positionWeights.end;
    } else {
      return this.positionWeights.middle;
    }
  }

  /**
   * 길이 기반 점수를 계산합니다
   * @param {string} content - 콘텐츠
   * @returns {number} 길이 점수
   */
  calculateLengthScore(content) {
    const length = content.length;
    
    if (length >= this.lengthWeights.optimal.min && length <= this.lengthWeights.optimal.max) {
      return this.lengthWeights.optimal.weight;
    } else if (length >= this.lengthWeights.acceptable.min && length <= this.lengthWeights.acceptable.max) {
      return this.lengthWeights.acceptable.weight;
    } else {
      return this.lengthWeights.penalty.weight;
    }
  }

  /**
   * 헤더 레벨 점수를 계산합니다
   * @param {number} level - 헤더 레벨
   * @returns {number} 헤더 레벨 점수
   */
  calculateHeaderLevelScore(level) {
    return this.structuralWeights.header.levels[level] || 1;
  }

  /**
   * 특수 패턴 점수를 계산합니다
   * @param {string} content - 콘텐츠
   * @returns {number} 특수 패턴 점수
   */
  calculateSpecialPatternScore(content) {
    let score = 0;

    // 날짜 패턴 (최신성)
    const recentDates = content.match(/2025-\d{2}-\d{2}/g);
    if (recentDates) {
      score += recentDates.length * 2;
    }

    // 상태 패턴
    const statusPatterns = {
      'in_progress': 4,
      'pending': 3,
      'completed': 1,
      'planned': 2,
      'blocked': 5
    };

    for (const [status, weight] of Object.entries(statusPatterns)) {
      if (content.includes(status)) {
        score += weight;
      }
    }

    // 수치 패턴 (메트릭, 통계)
    const numberPatterns = content.match(/\d+%|\d+\/\d+|\d+\.\d+/g);
    if (numberPatterns) {
      score += Math.min(numberPatterns.length * 0.5, 3); // 최대 3점
    }

    // 질문 패턴
    const questions = content.match(/\?/g);
    if (questions) {
      score += questions.length * 0.5;
    }

    return score;
  }

  /**
   * 점수를 중요도 레벨로 변환합니다
   * @param {number} score - 점수
   * @returns {string} 중요도 레벨
   */
  scoreToImportance(score) {
    if (score >= this.importanceLevels.critical.threshold) {
      return 'critical';
    } else if (score >= this.importanceLevels.high.threshold) {
      return 'high';
    } else if (score >= this.importanceLevels.medium.threshold) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * 점수 세부 분석을 제공합니다
   * @param {Object} section - 섹션 객체
   * @param {number} index - 섹션 인덱스
   * @param {number} totalSections - 전체 섹션 수
   * @returns {Object} 점수 세부 분석
   */
  getScoreBreakdown(section, index, totalSections) {
    const content = section.content;
    const lowerContent = content.toLowerCase();

    return {
      keyword: this.calculateKeywordScore(lowerContent),
      sectionType: this.calculateSectionTypeScore(section.type),
      structural: this.calculateStructuralScore(content),
      position: this.calculatePositionScore(index, totalSections),
      length: this.calculateLengthScore(content),
      headerLevel: this.calculateHeaderLevelScore(section.level),
      specialPattern: this.calculateSpecialPatternScore(content)
    };
  }

  /**
   * 중요도 요약을 생성합니다
   * @param {Array<Object>} sections - 분석된 섹션 배열
   * @returns {Object} 중요도 요약
   */
  generateImportanceSummary(sections) {
    const summary = {
      total: sections.length,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      averageScore: 0,
      maxScore: 0,
      minScore: Infinity,
      totalTokens: 0
    };

    let totalScore = 0;

    sections.forEach(section => {
      summary[section.importance]++;
      summary.totalTokens += section.tokens;
      totalScore += section.score;
      summary.maxScore = Math.max(summary.maxScore, section.score);
      summary.minScore = Math.min(summary.minScore, section.score);
    });

    summary.averageScore = totalScore / sections.length;
    summary.minScore = summary.minScore === Infinity ? 0 : summary.minScore;

    // 백분율 계산
    summary.percentages = {
      critical: (summary.critical / summary.total) * 100,
      high: (summary.high / summary.total) * 100,
      medium: (summary.medium / summary.total) * 100,
      low: (summary.low / summary.total) * 100
    };

    return summary;
  }

  /**
   * 압축 권장사항을 생성합니다
   * @param {Array<Object>} sections - 분석된 섹션 배열
   * @returns {Object} 압축 권장사항
   */
  generateRecommendations(sections) {
    const recommendations = {
      compressionStrategy: '',
      preserveSections: [],
      removeSections: [],
      compressSections: [],
      estimatedSavings: 0
    };

    const criticalSections = sections.filter(s => s.importance === 'critical');
    const highSections = sections.filter(s => s.importance === 'high');
    const mediumSections = sections.filter(s => s.importance === 'medium');
    const lowSections = sections.filter(s => s.importance === 'low');

    // 압축 전략 결정
    const totalTokens = sections.reduce((sum, s) => sum + s.tokens, 0);
    const lowTokens = lowSections.reduce((sum, s) => sum + s.tokens, 0);
    const mediumTokens = mediumSections.reduce((sum, s) => sum + s.tokens, 0);

    if (lowTokens / totalTokens > 0.4) {
      recommendations.compressionStrategy = 'aggressive';
      recommendations.preserveSections = [...criticalSections, ...highSections];
      recommendations.removeSections = lowSections;
      recommendations.compressSections = mediumSections;
      recommendations.estimatedSavings = (lowTokens + mediumTokens * 0.5) / totalTokens * 100;
    } else if (lowTokens / totalTokens > 0.2) {
      recommendations.compressionStrategy = 'balanced';
      recommendations.preserveSections = [...criticalSections, ...highSections, ...mediumSections];
      recommendations.removeSections = lowSections;
      recommendations.compressSections = [];
      recommendations.estimatedSavings = lowTokens / totalTokens * 100;
    } else {
      recommendations.compressionStrategy = 'minimal';
      recommendations.preserveSections = sections;
      recommendations.removeSections = [];
      recommendations.compressSections = [];
      recommendations.estimatedSavings = 10; // 기본 포맷 정리
    }

    return recommendations;
  }

  /**
   * 메타데이터를 생성합니다
   * @param {Array<Object>} sections - 분석된 섹션 배열
   * @param {string} content - 원본 콘텐츠
   * @returns {Object} 메타데이터
   */
  generateMetadata(sections, content) {
    return {
      analysisDate: new Date().toISOString(),
      totalSections: sections.length,
      totalTokens: this.tokenCounter.countTokens(content),
      averageScore: sections.reduce((sum, s) => sum + s.score, 0) / sections.length,
      scoreRange: {
        min: Math.min(...sections.map(s => s.score)),
        max: Math.max(...sections.map(s => s.score))
      },
      importanceDistribution: this.generateImportanceSummary(sections),
      processingTime: Date.now() - this.startTime || 0
    };
  }

  /**
   * 리소스를 정리합니다
   */
  cleanup() {
    if (this.tokenCounter) {
      this.tokenCounter.cleanup();
    }
  }
}

export default ImportanceClassifier;