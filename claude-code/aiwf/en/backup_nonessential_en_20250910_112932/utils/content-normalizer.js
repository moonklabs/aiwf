import { TokenCounter } from './token-counter.js';

/**
 * 콘텐츠 중복 제거 및 정규화 유틸리티
 */
export class ContentNormalizer {
  constructor() {
    this.tokenCounter = new TokenCounter();
  }

  /**
   * 콘텐츠를 정규화합니다
   * @param {string} content - 정규화할 콘텐츠
   * @param {Object} options - 정규화 옵션
   * @returns {Object} 정규화 결과
   */
  normalize(content, options = {}) {
    const {
      removeDuplicates = true,
      normalizeWhitespace = true,
      normalizeMarkdown = true,
      normalizeLinks = true,
      normalizeHeaders = true,
      preserveStructure = true
    } = options;

    let normalized = content;
    const metadata = {
      operations: [],
      originalTokens: this.tokenCounter.countTokens(content),
      removedDuplicates: 0,
      normalizedElements: 0
    };

    // 1. 중복 제거
    if (removeDuplicates) {
      const duplicateResult = this.removeDuplicates(normalized);
      normalized = duplicateResult.content;
      metadata.removedDuplicates = duplicateResult.removedCount;
      metadata.operations.push('duplicate_removal');
    }

    // 2. 공백 정규화
    if (normalizeWhitespace) {
      normalized = this.normalizeWhitespace(normalized);
      metadata.operations.push('whitespace_normalization');
    }

    // 3. 마크다운 정규화
    if (normalizeMarkdown) {
      normalized = this.normalizeMarkdown(normalized);
      metadata.operations.push('markdown_normalization');
    }

    // 4. 링크 정규화
    if (normalizeLinks) {
      normalized = this.normalizeLinks(normalized);
      metadata.operations.push('link_normalization');
    }

    // 5. 헤더 정규화
    if (normalizeHeaders) {
      normalized = this.normalizeHeaders(normalized);
      metadata.operations.push('header_normalization');
    }

    // 6. 구조 보존
    if (preserveStructure) {
      normalized = this.preserveStructure(normalized);
      metadata.operations.push('structure_preservation');
    }

    metadata.normalizedTokens = this.tokenCounter.countTokens(normalized);
    metadata.compressionRatio = this.calculateCompressionRatio(content, normalized);

    return {
      original: content,
      normalized,
      metadata
    };
  }

  /**
   * 중복 콘텐츠를 제거합니다
   * @param {string} content - 콘텐츠
   * @returns {Object} 중복 제거 결과
   */
  removeDuplicates(content) {
    const lines = content.split('\n');
    const uniqueLines = [];
    const seenLines = new Set();
    let removedCount = 0;

    // 1. 완전히 동일한 라인 제거
    for (const line of lines) {
      const normalizedLine = this.normalizeLineForComparison(line);
      
      if (normalizedLine.trim() === '') {
        uniqueLines.push(line); // 빈 라인은 유지
      } else if (!seenLines.has(normalizedLine)) {
        seenLines.add(normalizedLine);
        uniqueLines.push(line);
      } else {
        removedCount++;
      }
    }

    // 2. 비슷한 헤더 제거
    const dedupedHeaders = this.removeDuplicateHeaders(uniqueLines.join('\n'));
    const headerRemovedCount = uniqueLines.length - dedupedHeaders.split('\n').length;
    removedCount += headerRemovedCount;

    // 3. 중복 목록 항목 제거
    const dedupedLists = this.removeDuplicateListItems(dedupedHeaders);
    const listRemovedCount = dedupedHeaders.split('\n').length - dedupedLists.split('\n').length;
    removedCount += listRemovedCount;

    // 4. 반복되는 패턴 제거
    const dedupedPatterns = this.removeRepeatingPatterns(dedupedLists);
    const patternRemovedCount = dedupedLists.split('\n').length - dedupedPatterns.split('\n').length;
    removedCount += patternRemovedCount;

    return {
      content: dedupedPatterns,
      removedCount
    };
  }

  /**
   * 비교를 위해 라인을 정규화합니다
   * @param {string} line - 라인
   * @returns {string} 정규화된 라인
   */
  normalizeLineForComparison(line) {
    return line
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s가-힣]/g, '');
  }

  /**
   * 중복 헤더를 제거합니다
   * @param {string} content - 콘텐츠
   * @returns {string} 중복 헤더가 제거된 콘텐츠
   */
  removeDuplicateHeaders(content) {
    const lines = content.split('\n');
    const filteredLines = [];
    const seenHeaders = new Set();

    for (const line of lines) {
      const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
      
      if (headerMatch) {
        const headerLevel = headerMatch[1].length;
        const headerText = headerMatch[2].trim().toLowerCase();
        const headerKey = `${headerLevel}:${headerText}`;
        
        if (!seenHeaders.has(headerKey)) {
          seenHeaders.add(headerKey);
          filteredLines.push(line);
        }
      } else {
        filteredLines.push(line);
      }
    }

    return filteredLines.join('\n');
  }

  /**
   * 중복 목록 항목을 제거합니다
   * @param {string} content - 콘텐츠
   * @returns {string} 중복 목록 항목이 제거된 콘텐츠
   */
  removeDuplicateListItems(content) {
    const lines = content.split('\n');
    const filteredLines = [];
    const seenListItems = new Set();

    for (const line of lines) {
      const listMatch = line.match(/^\s*([-*+]|\d+\.)\s+(.+)$/);
      
      if (listMatch) {
        const itemText = listMatch[2].trim().toLowerCase();
        
        if (!seenListItems.has(itemText)) {
          seenListItems.add(itemText);
          filteredLines.push(line);
        }
      } else {
        filteredLines.push(line);
      }
    }

    return filteredLines.join('\n');
  }

  /**
   * 반복되는 패턴을 제거합니다
   * @param {string} content - 콘텐츠
   * @returns {string} 반복 패턴이 제거된 콘텐츠
   */
  removeRepeatingPatterns(content) {
    let processed = content;

    // 1. 연속된 동일한 문자열 제거
    processed = processed.replace(/(.{10,})\1{2,}/g, '$1');

    // 2. 반복되는 구분선 제거
    processed = processed.replace(/(-{3,})\n\1(\n\1)*/g, '$1');

    // 3. 반복되는 빈 줄 제거
    processed = processed.replace(/\n{4,}/g, '\n\n\n');

    // 4. 반복되는 마크다운 태그 제거
    processed = processed.replace(/(\*{1,3})\s*\1+/g, '$1');

    return processed;
  }

  /**
   * 공백을 정규화합니다
   * @param {string} content - 콘텐츠
   * @returns {string} 공백이 정규화된 콘텐츠
   */
  normalizeWhitespace(content) {
    return content
      // 탭을 스페이스로 변환
      .replace(/\t/g, '  ')
      // 줄 끝 공백 제거
      .replace(/[ \t]+$/gm, '')
      // 연속된 스페이스를 하나로 변환 (마크다운 구조 유지)
      .replace(/([^\n]) {3,}/g, '$1  ')
      // 과도한 빈 줄 제거
      .replace(/\n{4,}/g, '\n\n\n')
      // 시작과 끝의 불필요한 공백 제거
      .replace(/^\s+|\s+$/g, '');
  }

  /**
   * 마크다운을 정규화합니다
   * @param {string} content - 콘텐츠
   * @returns {string} 마크다운이 정규화된 콘텐츠
   */
  normalizeMarkdown(content) {
    return content
      // 헤더 스타일 통일
      .replace(/^(#{1,6})\s*(.+)\s*$/gm, '$1 $2')
      // 목록 스타일 통일
      .replace(/^\s*[*+]\s+/gm, '- ')
      // 강조 스타일 통일
      .replace(/\*\*([^*]+)\*\*/g, '**$1**')
      .replace(/\*([^*]+)\*/g, '*$1*')
      // 코드 블록 스타일 통일
      .replace(/```([^`]*?)```/gs, '```$1```')
      // 인라인 코드 스타일 통일
      .replace(/`([^`]+)`/g, '`$1`')
      // 인용구 스타일 통일
      .replace(/^\s*>\s*/gm, '> ')
      // 수평선 스타일 통일
      .replace(/^\s*[-*_]{3,}\s*$/gm, '---');
  }

  /**
   * 링크를 정규화합니다
   * @param {string} content - 콘텐츠
   * @returns {string} 링크가 정규화된 콘텐츠
   */
  normalizeLinks(content) {
    // 1. 중복 링크 제거
    const linkMap = new Map();
    let linkCounter = 0;

    return content
      // 마크다운 링크 정규화
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
        const normalizedUrl = url.trim();
        
        if (linkMap.has(normalizedUrl)) {
          return linkMap.get(normalizedUrl);
        } else {
          linkCounter++;
          const linkRef = `[${text}][${linkCounter}]`;
          linkMap.set(normalizedUrl, linkRef);
          return linkRef;
        }
      })
      // 링크 참조 섹션 추가
      + (linkMap.size > 0 ? '\n\n' + Array.from(linkMap.entries())
        .map(([url], index) => `[${index + 1}]: ${url}`)
        .join('\n') : '');
  }

  /**
   * 헤더를 정규화합니다
   * @param {string} content - 콘텐츠
   * @returns {string} 헤더가 정규화된 콘텐츠
   */
  normalizeHeaders(content) {
    const lines = content.split('\n');
    const normalizedLines = [];
    const headerHierarchy = new Map();

    for (const line of lines) {
      const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
      
      if (headerMatch) {
        const level = headerMatch[1].length;
        const text = headerMatch[2].trim();
        
        // 헤더 계층 구조 정규화
        if (level > 1) {
          let parentLevel = level - 1;
          while (parentLevel > 0 && !headerHierarchy.has(parentLevel)) {
            parentLevel--;
          }
          
          if (parentLevel === 0 && level > 2) {
            // 부모 헤더가 없는 경우 레벨 조정
            const adjustedLevel = Math.max(1, level - 1);
            normalizedLines.push(`${'#'.repeat(adjustedLevel)} ${text}`);
            headerHierarchy.set(adjustedLevel, text);
          } else {
            normalizedLines.push(line);
            headerHierarchy.set(level, text);
          }
        } else {
          normalizedLines.push(line);
          headerHierarchy.set(level, text);
        }
      } else {
        normalizedLines.push(line);
      }
    }

    return normalizedLines.join('\n');
  }

  /**
   * 구조를 보존합니다
   * @param {string} content - 콘텐츠
   * @returns {string} 구조가 보존된 콘텐츠
   */
  preserveStructure(content) {
    const lines = content.split('\n');
    const preservedLines = [];
    let inCodeBlock = false;
    let codeBlockType = '';

    for (const line of lines) {
      // 코드 블록 감지
      if (line.startsWith('```')) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeBlockType = line.substring(3);
        } else if (inCodeBlock && line === '```') {
          inCodeBlock = false;
          codeBlockType = '';
        }
      }

      // 코드 블록 내부는 그대로 유지
      if (inCodeBlock) {
        preservedLines.push(line);
      } else {
        // 일반 텍스트 처리
        if (line.trim() === '') {
          // 빈 줄은 컨텍스트에 따라 처리
          const lastLine = preservedLines[preservedLines.length - 1];
          const nextLineIndex = lines.indexOf(line) + 1;
          const nextLine = nextLineIndex < lines.length ? lines[nextLineIndex] : '';

          // 헤더 전후, 목록 전후에는 빈 줄 유지
          if (lastLine && (lastLine.match(/^#{1,6}\s+/) || lastLine.match(/^\s*[-*+]\s+/)) ||
              nextLine.match(/^#{1,6}\s+/) || nextLine.match(/^\s*[-*+]\s+/)) {
            preservedLines.push(line);
          } else if (preservedLines.length > 0 && preservedLines[preservedLines.length - 1] !== '') {
            preservedLines.push(line);
          }
        } else {
          preservedLines.push(line);
        }
      }
    }

    return preservedLines.join('\n');
  }

  /**
   * 텍스트 유사성을 계산합니다
   * @param {string} text1 - 첫 번째 텍스트
   * @param {string} text2 - 두 번째 텍스트
   * @returns {number} 유사성 점수 (0-1)
   */
  calculateTextSimilarity(text1, text2) {
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...words1].filter(word => words2.has(word)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }

  /**
   * 압축률을 계산합니다
   * @param {string} original - 원본 콘텐츠
   * @param {string} normalized - 정규화된 콘텐츠
   * @returns {number} 압축률 (백분율)
   */
  calculateCompressionRatio(original, normalized) {
    const originalTokens = this.tokenCounter.countTokens(original);
    const normalizedTokens = this.tokenCounter.countTokens(normalized);
    
    if (originalTokens === 0) return 0;
    return ((originalTokens - normalizedTokens) / originalTokens) * 100;
  }

  /**
   * 정규화 통계를 생성합니다
   * @param {string} original - 원본 콘텐츠
   * @param {string} normalized - 정규화된 콘텐츠
   * @returns {Object} 통계 정보
   */
  generateStats(original, normalized) {
    const originalLines = original.split('\n');
    const normalizedLines = normalized.split('\n');
    
    return {
      originalLines: originalLines.length,
      normalizedLines: normalizedLines.length,
      linesRemoved: originalLines.length - normalizedLines.length,
      originalTokens: this.tokenCounter.countTokens(original),
      normalizedTokens: this.tokenCounter.countTokens(normalized),
      tokensReduced: this.tokenCounter.countTokens(original) - this.tokenCounter.countTokens(normalized),
      compressionRatio: this.calculateCompressionRatio(original, normalized),
      originalSize: Buffer.byteLength(original, 'utf8'),
      normalizedSize: Buffer.byteLength(normalized, 'utf8'),
      sizeReduction: Buffer.byteLength(original, 'utf8') - Buffer.byteLength(normalized, 'utf8')
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

export default ContentNormalizer;