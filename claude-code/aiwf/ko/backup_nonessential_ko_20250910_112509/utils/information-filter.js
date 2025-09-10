import { ImportanceClassifier } from './importance-classifier.js';
import { TokenCounter } from './token-counter.js';

/**
 * 선택적 정보 필터링 시스템
 */
export class InformationFilter {
  constructor() {
    this.classifier = new ImportanceClassifier();
    this.tokenCounter = new TokenCounter();
    this.initializeFilters();
  }

  /**
   * 필터를 초기화합니다
   */
  initializeFilters() {
    // 필터 타입 정의
    this.filterTypes = {
      importance: {
        name: 'Importance Filter',
        description: '중요도 기반 필터링',
        levels: ['critical', 'high', 'medium', 'low']
      },
      content: {
        name: 'Content Filter',
        description: '콘텐츠 타입 기반 필터링',
        types: ['headers', 'lists', 'text', 'code', 'links', 'images']
      },
      temporal: {
        name: 'Temporal Filter',
        description: '시간 기반 필터링',
        periods: ['recent', 'current', 'old', 'archived']
      },
      structural: {
        name: 'Structural Filter',
        description: '구조 기반 필터링',
        elements: ['sections', 'subsections', 'paragraphs', 'sentences']
      },
      keyword: {
        name: 'Keyword Filter',
        description: '키워드 기반 필터링',
        modes: ['include', 'exclude', 'highlight']
      }
    };

    // 기본 필터 규칙
    this.defaultRules = {
      preserve: {
        importance: ['critical', 'high'],
        content: ['headers', 'lists'],
        keywords: ['goal', 'requirement', 'task', 'milestone', '목표', '요구사항', '태스크'],
        patterns: [/^\s*[-*+]\s+\[.\]/] // 체크박스 항목
      },
      compress: {
        importance: ['medium'],
        content: ['text'],
        maxLength: 200
      },
      remove: {
        importance: ['low'],
        content: ['old_logs', 'examples'],
        keywords: ['deprecated', 'obsolete', 'old', '구식', '폐기'],
        patterns: [/\[completed\]/i, /\[archived\]/i]
      }
    };

    // 필터 통계
    this.stats = {
      processed: 0,
      preserved: 0,
      compressed: 0,
      removed: 0,
      tokensOriginal: 0,
      tokensFiltered: 0
    };
  }

  /**
   * 콘텐츠를 필터링합니다
   * @param {string} content - 필터링할 콘텐츠
   * @param {Object} options - 필터링 옵션
   * @returns {Object} 필터링 결과
   */
  filter(content, options = {}) {
    const startTime = Date.now();
    
    const {
      minImportance = 'medium',
      maxTokens = null,
      preserveStructure = true,
      customRules = {},
      includeMetadata = true
    } = options;

    // 통계 초기화
    this.stats.tokensOriginal = this.tokenCounter.countTokens(content);
    this.stats.processed = 0;
    this.stats.preserved = 0;
    this.stats.compressed = 0;
    this.stats.removed = 0;

    // 규칙 병합
    const rules = this.mergeRules(this.defaultRules, customRules);

    // 1. 중요도 분석
    const importanceResult = this.classifier.analyzeImportance(content);
    const sections = importanceResult.sections;

    // 2. 섹션별 필터링
    const filteredSections = this.filterSections(sections, minImportance, rules);

    // 3. 토큰 제한 적용
    const tokenLimitedSections = maxTokens 
      ? this.applyTokenLimit(filteredSections, maxTokens)
      : filteredSections;

    // 4. 구조 재구성
    const filteredContent = preserveStructure 
      ? this.reconstructStructure(tokenLimitedSections)
      : this.reconstructFlat(tokenLimitedSections);

    // 5. 후처리
    const finalContent = this.postProcess(filteredContent, rules);

    // 통계 업데이트
    this.stats.tokensFiltered = this.tokenCounter.countTokens(finalContent);

    const result = {
      original: content,
      filtered: finalContent,
      compressionRatio: this.calculateCompressionRatio(content, finalContent),
      sectionsProcessed: sections.length,
      sectionsPreserved: this.stats.preserved,
      sectionsCompressed: this.stats.compressed,
      sectionsRemoved: this.stats.removed,
      processingTime: Date.now() - startTime
    };

    if (includeMetadata) {
      result.metadata = this.generateFilterMetadata(sections, filteredSections, rules);
    }

    return result;
  }

  /**
   * 규칙을 병합합니다
   * @param {Object} defaultRules - 기본 규칙
   * @param {Object} customRules - 사용자 규칙
   * @returns {Object} 병합된 규칙
   */
  mergeRules(defaultRules, customRules) {
    const merged = JSON.parse(JSON.stringify(defaultRules));

    // 사용자 규칙 적용
    for (const [category, rules] of Object.entries(customRules)) {
      if (merged[category]) {
        merged[category] = { ...merged[category], ...rules };
      } else {
        merged[category] = rules;
      }
    }

    return merged;
  }

  /**
   * 섹션들을 필터링합니다
   * @param {Array<Object>} sections - 섹션 배열
   * @param {string} minImportance - 최소 중요도
   * @param {Object} rules - 필터링 규칙
   * @returns {Array<Object>} 필터링된 섹션 배열
   */
  filterSections(sections, minImportance, rules) {
    const filtered = [];
    const importanceOrder = ['critical', 'high', 'medium', 'low'];
    const minIndex = importanceOrder.indexOf(minImportance);

    for (const section of sections) {
      this.stats.processed++;

      const decision = this.makeFilterDecision(section, minImportance, rules);
      
      switch (decision.action) {
        case 'preserve':
          filtered.push({
            ...section,
            filterAction: 'preserve',
            filterReason: decision.reason
          });
          this.stats.preserved++;
          break;

        case 'compress':
          const compressed = this.compressSection(section, rules.compress);
          filtered.push({
            ...compressed,
            filterAction: 'compress',
            filterReason: decision.reason
          });
          this.stats.compressed++;
          break;

        case 'remove':
          // 섹션 제거 (필터링된 배열에 추가하지 않음)
          this.stats.removed++;
          break;

        default:
          // 기본적으로 보존
          filtered.push(section);
          this.stats.preserved++;
      }
    }

    return filtered;
  }

  /**
   * 섹션에 대한 필터링 결정을 내립니다
   * @param {Object} section - 섹션 객체
   * @param {string} minImportance - 최소 중요도
   * @param {Object} rules - 필터링 규칙
   * @returns {Object} 필터링 결정
   */
  makeFilterDecision(section, minImportance, rules) {
    const importance = section.importance;
    const content = section.content;
    const name = section.name;

    // 1. 보존 규칙 확인
    if (this.matchesPreserveRules(section, rules.preserve)) {
      return { action: 'preserve', reason: 'matches_preserve_rules' };
    }

    // 2. 제거 규칙 확인
    if (this.matchesRemoveRules(section, rules.remove)) {
      return { action: 'remove', reason: 'matches_remove_rules' };
    }

    // 3. 중요도 기반 결정
    const importanceOrder = ['critical', 'high', 'medium', 'low'];
    const sectionIndex = importanceOrder.indexOf(importance);
    const minIndex = importanceOrder.indexOf(minImportance);

    if (sectionIndex <= minIndex) {
      // 4. 압축 규칙 확인
      if (this.matchesCompressRules(section, rules.compress)) {
        return { action: 'compress', reason: 'matches_compress_rules' };
      }
      return { action: 'preserve', reason: 'meets_importance_threshold' };
    } else {
      return { action: 'remove', reason: 'below_importance_threshold' };
    }
  }

  /**
   * 보존 규칙과 매치되는지 확인합니다
   * @param {Object} section - 섹션 객체
   * @param {Object} preserveRules - 보존 규칙
   * @returns {boolean} 매치 여부
   */
  matchesPreserveRules(section, preserveRules) {
    // 중요도 확인
    if (preserveRules.importance && preserveRules.importance.includes(section.importance)) {
      return true;
    }

    // 키워드 확인
    if (preserveRules.keywords) {
      const content = section.content.toLowerCase();
      const name = section.name.toLowerCase();
      
      for (const keyword of preserveRules.keywords) {
        if (content.includes(keyword.toLowerCase()) || name.includes(keyword.toLowerCase())) {
          return true;
        }
      }
    }

    // 패턴 확인
    if (preserveRules.patterns) {
      for (const pattern of preserveRules.patterns) {
        if (pattern.test(section.content)) {
          return true;
        }
      }
    }

    // 콘텐츠 타입 확인
    if (preserveRules.content) {
      const contentType = this.identifyContentType(section.content);
      if (preserveRules.content.includes(contentType)) {
        return true;
      }
    }

    return false;
  }

  /**
   * 제거 규칙과 매치되는지 확인합니다
   * @param {Object} section - 섹션 객체
   * @param {Object} removeRules - 제거 규칙
   * @returns {boolean} 매치 여부
   */
  matchesRemoveRules(section, removeRules) {
    // 중요도 확인
    if (removeRules.importance && removeRules.importance.includes(section.importance)) {
      return true;
    }

    // 키워드 확인
    if (removeRules.keywords) {
      const content = section.content.toLowerCase();
      const name = section.name.toLowerCase();
      
      for (const keyword of removeRules.keywords) {
        if (content.includes(keyword.toLowerCase()) || name.includes(keyword.toLowerCase())) {
          return true;
        }
      }
    }

    // 패턴 확인
    if (removeRules.patterns) {
      for (const pattern of removeRules.patterns) {
        if (pattern.test(section.content)) {
          return true;
        }
      }
    }

    // 오래된 로그 확인
    if (this.isOldLog(section.content)) {
      return true;
    }

    return false;
  }

  /**
   * 압축 규칙과 매치되는지 확인합니다
   * @param {Object} section - 섹션 객체
   * @param {Object} compressRules - 압축 규칙
   * @returns {boolean} 매치 여부
   */
  matchesCompressRules(section, compressRules) {
    // 중요도 확인
    if (compressRules.importance && compressRules.importance.includes(section.importance)) {
      return true;
    }

    // 길이 확인
    if (compressRules.maxLength && section.content.length > compressRules.maxLength) {
      return true;
    }

    // 콘텐츠 타입 확인
    if (compressRules.content) {
      const contentType = this.identifyContentType(section.content);
      if (compressRules.content.includes(contentType)) {
        return true;
      }
    }

    return false;
  }

  /**
   * 콘텐츠 타입을 식별합니다
   * @param {string} content - 콘텐츠
   * @returns {string} 콘텐츠 타입
   */
  identifyContentType(content) {
    // 헤더
    if (content.match(/^#{1,6}\s+/)) {
      return 'headers';
    }

    // 목록
    if (content.match(/^\s*[-*+]\s+/) || content.match(/^\s*\d+\.\s+/)) {
      return 'lists';
    }

    // 코드 블록
    if (content.match(/```[\s\S]*?```/) || content.match(/`[^`]+`/)) {
      return 'code';
    }

    // 링크
    if (content.match(/\[([^\]]+)\]\(([^)]+)\)/)) {
      return 'links';
    }

    // 이미지
    if (content.match(/!\[([^\]]*)\]\(([^)]+)\)/)) {
      return 'images';
    }

    // 일반 텍스트
    return 'text';
  }

  /**
   * 오래된 로그인지 확인합니다
   * @param {string} content - 콘텐츠
   * @returns {boolean} 오래된 로그 여부
   */
  isOldLog(content) {
    const datePattern = /\[(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})\]/;
    const match = content.match(datePattern);
    
    if (match) {
      const logDate = new Date(match[1]);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 7); // 7일 전
      
      return logDate < cutoffDate;
    }
    
    return false;
  }

  /**
   * 섹션을 압축합니다
   * @param {Object} section - 섹션 객체
   * @param {Object} compressRules - 압축 규칙
   * @returns {Object} 압축된 섹션
   */
  compressSection(section, compressRules) {
    let compressed = section.content;
    
    // 긴 문단 요약
    if (compressRules.maxLength && compressed.length > compressRules.maxLength) {
      compressed = this.summarizeLongText(compressed, compressRules.maxLength);
    }

    // 중복 제거
    compressed = this.removeDuplicateLines(compressed);

    // 불필요한 공백 제거
    compressed = this.normalizeWhitespace(compressed);

    return {
      ...section,
      content: compressed,
      originalLength: section.content.length,
      compressedLength: compressed.length,
      compressionRatio: ((section.content.length - compressed.length) / section.content.length) * 100
    };
  }

  /**
   * 긴 텍스트를 요약합니다
   * @param {string} text - 요약할 텍스트
   * @param {number} maxLength - 최대 길이
   * @returns {string} 요약된 텍스트
   */
  summarizeLongText(text, maxLength) {
    if (text.length <= maxLength) return text;

    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    if (sentences.length <= 2) {
      return text.substring(0, maxLength) + '...';
    }

    // 첫 번째와 마지막 문장 유지
    const firstSentence = sentences[0].trim();
    const lastSentence = sentences[sentences.length - 1].trim();
    const summary = `${firstSentence}. ... ${lastSentence}.`;

    return summary.length > maxLength 
      ? text.substring(0, maxLength) + '...'
      : summary;
  }

  /**
   * 중복된 라인을 제거합니다
   * @param {string} content - 콘텐츠
   * @returns {string} 중복이 제거된 콘텐츠
   */
  removeDuplicateLines(content) {
    const lines = content.split('\n');
    const uniqueLines = [];
    const seenLines = new Set();

    for (const line of lines) {
      const normalizedLine = line.trim().toLowerCase();
      
      if (normalizedLine === '' || !seenLines.has(normalizedLine)) {
        seenLines.add(normalizedLine);
        uniqueLines.push(line);
      }
    }

    return uniqueLines.join('\n');
  }

  /**
   * 공백을 정규화합니다
   * @param {string} content - 콘텐츠
   * @returns {string} 정규화된 콘텐츠
   */
  normalizeWhitespace(content) {
    return content
      .replace(/[ \t]+$/gm, '') // 줄 끝 공백 제거
      .replace(/\n{3,}/g, '\n\n') // 연속된 빈 줄 제거
      .replace(/^\s+|\s+$/g, ''); // 시작/끝 공백 제거
  }

  /**
   * 토큰 제한을 적용합니다
   * @param {Array<Object>} sections - 섹션 배열
   * @param {number} maxTokens - 최대 토큰 수
   * @returns {Array<Object>} 토큰 제한이 적용된 섹션 배열
   */
  applyTokenLimit(sections, maxTokens) {
    const result = [];
    let currentTokens = 0;

    // 중요도 순으로 정렬
    const sortedSections = [...sections].sort((a, b) => {
      const importanceOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return importanceOrder[a.importance] - importanceOrder[b.importance];
    });

    for (const section of sortedSections) {
      const sectionTokens = this.tokenCounter.countTokens(section.content);
      
      if (currentTokens + sectionTokens <= maxTokens) {
        result.push(section);
        currentTokens += sectionTokens;
      } else {
        // 남은 토큰으로 섹션 압축 시도
        const remainingTokens = maxTokens - currentTokens;
        if (remainingTokens > 50) { // 최소 50토큰 필요
          const compressedSection = this.compressSectionToTokenLimit(section, remainingTokens);
          if (compressedSection) {
            result.push(compressedSection);
            currentTokens += this.tokenCounter.countTokens(compressedSection.content);
          }
        }
        break;
      }
    }

    return result;
  }

  /**
   * 섹션을 토큰 제한에 맞춰 압축합니다
   * @param {Object} section - 섹션 객체
   * @param {number} targetTokens - 목표 토큰 수
   * @returns {Object|null} 압축된 섹션 또는 null
   */
  compressSectionToTokenLimit(section, targetTokens) {
    const content = section.content;
    const currentTokens = this.tokenCounter.countTokens(content);
    
    if (currentTokens <= targetTokens) {
      return section;
    }

    // 비율 계산
    const ratio = targetTokens / currentTokens;
    const targetLength = Math.floor(content.length * ratio);
    
    // 텍스트 압축
    const compressed = this.summarizeLongText(content, targetLength);
    const compressedTokens = this.tokenCounter.countTokens(compressed);
    
    if (compressedTokens <= targetTokens) {
      return {
        ...section,
        content: compressed,
        compressedForTokenLimit: true,
        originalTokens: currentTokens,
        compressedTokens: compressedTokens
      };
    }

    return null;
  }

  /**
   * 구조를 보존하여 재구성합니다
   * @param {Array<Object>} sections - 섹션 배열
   * @returns {string} 재구성된 콘텐츠
   */
  reconstructStructure(sections) {
    const sortedSections = sections.sort((a, b) => (a.startLine || 0) - (b.startLine || 0));
    return sortedSections.map(section => section.content).join('\n\n');
  }

  /**
   * 플랫한 구조로 재구성합니다
   * @param {Array<Object>} sections - 섹션 배열
   * @returns {string} 재구성된 콘텐츠
   */
  reconstructFlat(sections) {
    const importanceOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    const sortedSections = sections.sort((a, b) => {
      return importanceOrder[a.importance] - importanceOrder[b.importance];
    });
    
    return sortedSections.map(section => section.content).join('\n\n');
  }

  /**
   * 후처리를 수행합니다
   * @param {string} content - 콘텐츠
   * @param {Object} rules - 규칙
   * @returns {string} 후처리된 콘텐츠
   */
  postProcess(content, rules) {
    let processed = content;

    // 최종 정리
    processed = this.normalizeWhitespace(processed);

    // 빈 섹션 제거
    processed = processed.replace(/^#{1,6}\s+.*$\n\n(?=^#{1,6}\s+.*$)/gm, '');

    // 연속된 구분선 제거
    processed = processed.replace(/---+\n---+/g, '---');

    return processed;
  }

  /**
   * 압축률을 계산합니다
   * @param {string} original - 원본 콘텐츠
   * @param {string} filtered - 필터링된 콘텐츠
   * @returns {number} 압축률 (백분율)
   */
  calculateCompressionRatio(original, filtered) {
    const originalTokens = this.tokenCounter.countTokens(original);
    const filteredTokens = this.tokenCounter.countTokens(filtered);
    
    if (originalTokens === 0) return 0;
    return ((originalTokens - filteredTokens) / originalTokens) * 100;
  }

  /**
   * 필터 메타데이터를 생성합니다
   * @param {Array<Object>} originalSections - 원본 섹션 배열
   * @param {Array<Object>} filteredSections - 필터링된 섹션 배열
   * @param {Object} rules - 적용된 규칙
   * @returns {Object} 메타데이터
   */
  generateFilterMetadata(originalSections, filteredSections, rules) {
    return {
      filteringDate: new Date().toISOString(),
      appliedRules: rules,
      statistics: {
        ...this.stats,
        preservationRate: (this.stats.preserved / this.stats.processed) * 100,
        compressionRate: (this.stats.compressed / this.stats.processed) * 100,
        removalRate: (this.stats.removed / this.stats.processed) * 100,
        tokenSavings: this.stats.tokensOriginal - this.stats.tokensFiltered
      },
      sectionAnalysis: {
        originalCount: originalSections.length,
        filteredCount: filteredSections.length,
        preservedSections: filteredSections.filter(s => s.filterAction === 'preserve').length,
        compressedSections: filteredSections.filter(s => s.filterAction === 'compress').length,
        removedSections: originalSections.length - filteredSections.length
      }
    };
  }

  /**
   * 필터 통계를 반환합니다
   * @returns {Object} 필터 통계
   */
  getStatistics() {
    return { ...this.stats };
  }

  /**
   * 필터를 재설정합니다
   */
  reset() {
    this.stats = {
      processed: 0,
      preserved: 0,
      compressed: 0,
      removed: 0,
      tokensOriginal: 0,
      tokensFiltered: 0
    };
  }

  /**
   * 리소스를 정리합니다
   */
  cleanup() {
    if (this.classifier) {
      this.classifier.cleanup();
    }
    if (this.tokenCounter) {
      this.tokenCounter.cleanup();
    }
  }
}

export default InformationFilter;