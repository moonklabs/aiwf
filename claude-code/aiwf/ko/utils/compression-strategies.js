import { TokenCounter } from './token-counter.js';

/**
 * 압축 전략의 기본 인터페이스
 */
export class CompressionStrategy {
  constructor(name) {
    this.name = name;
    this.tokenCounter = new TokenCounter();
  }

  /**
   * 콘텐츠를 압축합니다
   * @param {string} content - 압축할 콘텐츠
   * @param {Object} options - 압축 옵션
   * @returns {Object} 압축 결과
   */
  compress(content, options = {}) {
    throw new Error('compress method must be implemented');
  }

  /**
   * 압축된 콘텐츠를 복원합니다
   * @param {string} compressed - 압축된 콘텐츠
   * @param {Object} metadata - 복원 메타데이터
   * @returns {string} 복원된 콘텐츠
   */
  decompress(compressed, metadata) {
    throw new Error('decompress method must be implemented');
  }

  /**
   * 압축률을 계산합니다
   * @param {string} original - 원본 콘텐츠
   * @param {string} compressed - 압축된 콘텐츠
   * @returns {number} 압축률 (백분율)
   */
  calculateCompressionRatio(original, compressed) {
    const originalTokens = this.tokenCounter.countTokens(original);
    const compressedTokens = this.tokenCounter.countTokens(compressed);
    
    if (originalTokens === 0) return 0;
    return ((originalTokens - compressedTokens) / originalTokens) * 100;
  }

  /**
   * 마크다운 콘텐츠를 섹션으로 파싱합니다
   * @param {string} content - 마크다운 콘텐츠
   * @returns {Array<Object>} 섹션 배열
   */
  parseMarkdownSections(content) {
    const sections = [];
    const lines = content.split('\n');
    let currentSection = null;
    let currentContent = [];
    let currentLevel = 0;

    for (const line of lines) {
      const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
      
      if (headerMatch) {
        // 이전 섹션 저장
        if (currentSection) {
          sections.push({
            name: currentSection,
            level: currentLevel,
            content: currentContent.join('\n').trim(),
            tokens: this.tokenCounter.countTokens(currentContent.join('\n').trim())
          });
        }
        
        // 새 섹션 시작
        currentLevel = headerMatch[1].length;
        currentSection = headerMatch[2];
        currentContent = [line];
      } else {
        if (currentSection) {
          currentContent.push(line);
        }
      }
    }
    
    // 마지막 섹션 저장
    if (currentSection) {
      sections.push({
        name: currentSection,
        level: currentLevel,
        content: currentContent.join('\n').trim(),
        tokens: this.tokenCounter.countTokens(currentContent.join('\n').trim())
      });
    }

    return sections;
  }

  /**
   * 중요도를 기반으로 섹션을 분류합니다
   * @param {Array<Object>} sections - 섹션 배열
   * @returns {Array<Object>} 중요도가 추가된 섹션 배열
   */
  classifyImportance(sections) {
    const importanceKeywords = {
      critical: ['urgent', 'critical', 'blocking', 'error', 'failed', 'in_progress', 'active'],
      high: ['important', 'priority', 'deadline', 'milestone', 'requirements', 'goal'],
      medium: ['enhancement', 'improvement', 'optimize', 'planned', 'task'],
      low: ['note', 'example', 'history', 'log', 'template', 'completed']
    };

    const importanceSections = {
      critical: ['subtasks', 'acceptance criteria', 'goal', 'objectives', 'current sprint'],
      high: ['description', 'requirements', 'architecture', 'specifications'],
      medium: ['implementation', 'testing', 'documentation', 'notes'],
      low: ['output log', 'history', 'examples', 'templates']
    };

    return sections.map(section => {
      let importance = 'low';
      let score = 0;

      // 키워드 기반 점수 계산
      for (const [level, keywords] of Object.entries(importanceKeywords)) {
        const matches = keywords.filter(keyword => 
          section.content.toLowerCase().includes(keyword.toLowerCase())
        ).length;
        
        if (matches > 0) {
          switch (level) {
            case 'critical': score += matches * 4; break;
            case 'high': score += matches * 3; break;
            case 'medium': score += matches * 2; break;
            case 'low': score += matches * 1; break;
          }
        }
      }

      // 섹션 타입 기반 점수 계산
      for (const [level, sectionTypes] of Object.entries(importanceSections)) {
        const isImportantSection = sectionTypes.some(type => 
          section.name.toLowerCase().includes(type.toLowerCase())
        );
        
        if (isImportantSection) {
          switch (level) {
            case 'critical': score += 5; break;
            case 'high': score += 4; break;
            case 'medium': score += 3; break;
            case 'low': score += 1; break;
          }
        }
      }

      // 점수를 카테고리로 변환
      if (score >= 8) importance = 'critical';
      else if (score >= 5) importance = 'high';
      else if (score >= 3) importance = 'medium';
      else importance = 'low';

      return {
        ...section,
        importance,
        score
      };
    });
  }

  /**
   * 반복적인 콘텐츠를 식별합니다
   * @param {string} content - 콘텐츠
   * @returns {Array<Object>} 반복 패턴 배열
   */
  identifyRepetitiveContent(content) {
    const repetitivePatterns = [
      /---\n[\s\S]*?\n---/g, // Front matter
      /\*\*.*?\*\*:/g, // Bold labels
      /\[.*?\]\(.*?\)/g, // Markdown links
      /```[\s\S]*?```/g, // Code blocks
      /^\s*[-*+]\s+/gm, // List items
      /^\s*\d+\.\s+/gm, // Numbered lists
      /#{1,6}\s+/g, // Headers
    ];

    const patterns = [];
    
    for (const pattern of repetitivePatterns) {
      const matches = content.match(pattern);
      if (matches && matches.length > 3) {
        patterns.push({
          pattern: pattern.source,
          occurrences: matches.length,
          examples: matches.slice(0, 3)
        });
      }
    }

    return patterns;
  }

  /**
   * 오래된 로그를 식별합니다
   * @param {string} content - 콘텐츠
   * @returns {Array<string>} 오래된 로그 라인
   */
  identifyOldLogs(content) {
    const lines = content.split('\n');
    const oldLogs = [];
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 7); // 7일 전

    for (const line of lines) {
      // 날짜 패턴 매칭
      const dateMatch = line.match(/\[(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})\]/);
      if (dateMatch) {
        const logDate = new Date(dateMatch[1]);
        if (logDate < cutoffDate) {
          oldLogs.push(line);
        }
      }
    }

    return oldLogs;
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

/**
 * 적극적 압축 전략 (50-70% 압축)
 */
export class AggressiveCompressionStrategy extends CompressionStrategy {
  constructor() {
    super('aggressive');
  }

  compress(content, options = {}) {
    let compressed = content;
    const metadata = {
      strategy: 'aggressive',
      removedSections: [],
      compressionLevel: 'high',
      preservedSections: []
    };

    // 1. 섹션 분석
    const sections = this.parseMarkdownSections(content);
    const classifiedSections = this.classifyImportance(sections);

    // 2. 중요도 기반 필터링 (high, critical만 유지)
    const filteredSections = classifiedSections.filter(section => {
      if (section.importance === 'critical' || section.importance === 'high') {
        metadata.preservedSections.push(section.name);
        return true;
      } else {
        metadata.removedSections.push(section.name);
        return false;
      }
    });

    // 3. 반복 콘텐츠 제거
    compressed = this.removeRepetitiveContent(compressed);

    // 4. 오래된 로그 제거
    compressed = this.removeOldLogs(compressed);

    // 5. 상세 설명 요약
    compressed = this.summarizeDescriptions(compressed);

    // 6. 필터링된 섹션으로 재구성
    compressed = this.reconstructContent(filteredSections);

    return {
      content: compressed,
      metadata
    };
  }

  /**
   * 반복 콘텐츠를 제거합니다
   */
  removeRepetitiveContent(content) {
    // 중복된 헤더 제거
    const lines = content.split('\n');
    const uniqueLines = [];
    const seenHeaders = new Set();

    for (const line of lines) {
      const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
      if (headerMatch) {
        const headerText = headerMatch[2];
        if (!seenHeaders.has(headerText)) {
          seenHeaders.add(headerText);
          uniqueLines.push(line);
        }
      } else {
        uniqueLines.push(line);
      }
    }

    return uniqueLines.join('\n');
  }

  /**
   * 오래된 로그를 제거합니다
   */
  removeOldLogs(content) {
    const oldLogs = this.identifyOldLogs(content);
    let filtered = content;
    
    for (const log of oldLogs) {
      filtered = filtered.replace(log + '\n', '');
    }
    
    return filtered;
  }

  /**
   * 상세 설명을 요약합니다
   */
  summarizeDescriptions(content) {
    // 긴 단락을 요약
    const paragraphs = content.split('\n\n');
    const summarized = paragraphs.map(paragraph => {
      if (paragraph.length > 500) {
        // 첫 번째와 마지막 문장만 유지
        const sentences = paragraph.split('. ');
        if (sentences.length > 2) {
          return sentences[0] + '. ... ' + sentences[sentences.length - 1];
        }
      }
      return paragraph;
    });

    return summarized.join('\n\n');
  }

  /**
   * 필터링된 섹션으로 콘텐츠를 재구성합니다
   */
  reconstructContent(sections) {
    return sections.map(section => section.content).join('\n\n');
  }
}

/**
 * 균형 압축 전략 (30-50% 압축)
 */
export class BalancedCompressionStrategy extends CompressionStrategy {
  constructor() {
    super('balanced');
  }

  compress(content, options = {}) {
    let compressed = content;
    const metadata = {
      strategy: 'balanced',
      removedSections: [],
      compressionLevel: 'medium',
      preservedSections: []
    };

    // 1. 섹션 분석
    const sections = this.parseMarkdownSections(content);
    const classifiedSections = this.classifyImportance(sections);

    // 2. 중요도 기반 필터링 (medium 이상 유지)
    const filteredSections = classifiedSections.filter(section => {
      if (section.importance !== 'low') {
        metadata.preservedSections.push(section.name);
        return true;
      } else {
        metadata.removedSections.push(section.name);
        return false;
      }
    });

    // 3. 반복 콘텐츠 축약
    compressed = this.condenseRepetitiveContent(compressed);

    // 4. 오래된 로그 제거
    compressed = this.removeOldLogs(compressed);

    // 5. 장문 설명 압축
    compressed = this.compressLongDescriptions(compressed);

    // 6. 필터링된 섹션으로 재구성
    compressed = this.reconstructContent(filteredSections);

    return {
      content: compressed,
      metadata
    };
  }

  /**
   * 반복 콘텐츠를 축약합니다
   */
  condenseRepetitiveContent(content) {
    // 연속된 빈 줄 제거
    content = content.replace(/\n{3,}/g, '\n\n');
    
    // 중복된 목록 항목 제거
    const lines = content.split('\n');
    const condensed = [];
    const seenListItems = new Set();

    for (const line of lines) {
      const listMatch = line.match(/^\s*[-*+]\s+(.+)$/);
      if (listMatch) {
        const listText = listMatch[1];
        if (!seenListItems.has(listText)) {
          seenListItems.add(listText);
          condensed.push(line);
        }
      } else {
        condensed.push(line);
      }
    }

    return condensed.join('\n');
  }

  /**
   * 장문 설명을 압축합니다
   */
  compressLongDescriptions(content) {
    const paragraphs = content.split('\n\n');
    const compressed = paragraphs.map(paragraph => {
      if (paragraph.length > 300) {
        // 핵심 문장만 유지
        const sentences = paragraph.split('. ');
        if (sentences.length > 3) {
          return sentences.slice(0, 2).join('. ') + '. [압축됨]';
        }
      }
      return paragraph;
    });

    return compressed.join('\n\n');
  }

  /**
   * 필터링된 섹션으로 콘텐츠를 재구성합니다
   */
  reconstructContent(sections) {
    return sections.map(section => section.content).join('\n\n');
  }
}

/**
 * 최소 압축 전략 (10-30% 압축)
 */
export class MinimalCompressionStrategy extends CompressionStrategy {
  constructor() {
    super('minimal');
  }

  compress(content, options = {}) {
    let compressed = content;
    const metadata = {
      strategy: 'minimal',
      removedSections: [],
      compressionLevel: 'low',
      preservedSections: []
    };

    // 1. 포맷팅 최적화
    compressed = this.optimizeFormatting(compressed);

    // 2. 오래된 로그만 제거
    compressed = this.removeOldLogs(compressed);

    // 3. 기본 정리
    compressed = this.basicCleanup(compressed);

    return {
      content: compressed,
      metadata
    };
  }

  /**
   * 포맷팅을 최적화합니다
   */
  optimizeFormatting(content) {
    // 불필요한 공백 제거
    content = content.replace(/[ \t]+$/gm, ''); // 줄 끝 공백
    content = content.replace(/\n{4,}/g, '\n\n\n'); // 과도한 빈 줄
    content = content.replace(/^\n+/, ''); // 시작 빈 줄
    content = content.replace(/\n+$/, '\n'); // 끝 빈 줄

    return content;
  }

  /**
   * 기본 정리를 수행합니다
   */
  basicCleanup(content) {
    // 중복된 구분선 제거
    content = content.replace(/---+/g, '---');
    
    // 불필요한 마크다운 태그 정리
    content = content.replace(/\*\*\s*\*\*/g, ''); // 빈 bold 태그
    content = content.replace(/\*\s*\*/g, ''); // 빈 italic 태그
    
    return content;
  }
}

export default {
  CompressionStrategy,
  AggressiveCompressionStrategy,
  BalancedCompressionStrategy,
  MinimalCompressionStrategy
};