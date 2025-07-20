import { TokenCounter } from './token-counter.js';

/**
 * 텍스트 요약 알고리즘 프로토타입
 */
export class TextSummarizer {
  constructor() {
    this.tokenCounter = new TokenCounter();
  }

  /**
   * 텍스트를 요약합니다
   * @param {string} text - 요약할 텍스트
   * @param {Object} options - 요약 옵션
   * @returns {Object} 요약 결과
   */
  summarize(text, options = {}) {
    const {
      targetRatio = 0.3, // 목표 압축률 (30%)
      strategy = 'extractive', // 'extractive' 또는 'abstractive'
      preserveStructure = true, // 구조 유지 여부
      minSentenceLength = 20, // 최소 문장 길이
      maxSentenceLength = 200 // 최대 문장 길이
    } = options;

    const summary = strategy === 'extractive' 
      ? this.extractiveSummarization(text, targetRatio, options)
      : this.abstractiveSummarization(text, targetRatio, options);

    return {
      original: text,
      summary: summary.content,
      originalTokens: this.tokenCounter.countTokens(text),
      summaryTokens: this.tokenCounter.countTokens(summary.content),
      compressionRatio: summary.compressionRatio,
      keyPoints: summary.keyPoints,
      metadata: summary.metadata
    };
  }

  /**
   * 추출적 요약 (중요한 문장들을 선택)
   * @param {string} text - 요약할 텍스트
   * @param {number} targetRatio - 목표 압축률
   * @param {Object} options - 옵션
   * @returns {Object} 요약 결과
   */
  extractiveSummarization(text, targetRatio, options) {
    // 1. 텍스트를 문장으로 분할
    const sentences = this.splitIntoSentences(text);
    
    // 2. 각 문장의 중요도 계산
    const scoredSentences = this.scoreSentences(sentences);
    
    // 3. 중요도에 따라 정렬
    const sortedSentences = scoredSentences.sort((a, b) => b.score - a.score);
    
    // 4. 목표 비율에 맞춰 상위 문장 선택
    const targetSentenceCount = Math.ceil(sentences.length * targetRatio);
    const selectedSentences = sortedSentences.slice(0, targetSentenceCount);
    
    // 5. 원본 순서대로 재배열
    const finalSentences = selectedSentences.sort((a, b) => a.index - b.index);
    
    // 6. 요약 텍스트 생성
    const summaryText = finalSentences.map(s => s.text).join(' ');
    
    return {
      content: summaryText,
      compressionRatio: this.calculateCompressionRatio(text, summaryText),
      keyPoints: this.extractKeyPoints(finalSentences),
      metadata: {
        strategy: 'extractive',
        originalSentences: sentences.length,
        selectedSentences: finalSentences.length,
        avgSentenceScore: finalSentences.reduce((sum, s) => sum + s.score, 0) / finalSentences.length
      }
    };
  }

  /**
   * 추상적 요약 (내용을 재구성)
   * @param {string} text - 요약할 텍스트
   * @param {number} targetRatio - 목표 압축률
   * @param {Object} options - 옵션
   * @returns {Object} 요약 결과
   */
  abstractiveSummarization(text, targetRatio, options) {
    // 1. 주요 개념 추출
    const concepts = this.extractConcepts(text);
    
    // 2. 핵심 정보 식별
    const keyInfo = this.identifyKeyInformation(text);
    
    // 3. 구조 분석
    const structure = this.analyzeStructure(text);
    
    // 4. 요약 생성
    const summaryText = this.generateAbstractSummary(concepts, keyInfo, structure, targetRatio);
    
    return {
      content: summaryText,
      compressionRatio: this.calculateCompressionRatio(text, summaryText),
      keyPoints: concepts.slice(0, 5), // 상위 5개 개념
      metadata: {
        strategy: 'abstractive',
        conceptCount: concepts.length,
        keyInfoCount: keyInfo.length,
        structureElements: structure.length
      }
    };
  }

  /**
   * 텍스트를 문장으로 분할합니다
   * @param {string} text - 분할할 텍스트
   * @returns {Array<string>} 문장 배열
   */
  splitIntoSentences(text) {
    // 마크다운 구조 유지하면서 문장 분할
    const sentences = [];
    const lines = text.split('\n');
    
    for (const line of lines) {
      if (line.trim() === '') continue;
      
      // 헤더, 목록 항목은 그대로 유지
      if (line.match(/^#{1,6}\s+/) || line.match(/^\s*[-*+]\s+/) || line.match(/^\s*\d+\.\s+/)) {
        sentences.push(line.trim());
      } else {
        // 일반 텍스트는 문장으로 분할
        const lineSentences = line.split(/[.!?]+/).filter(s => s.trim().length > 0);
        sentences.push(...lineSentences.map(s => s.trim() + '.'));
      }
    }
    
    return sentences.filter(s => s.length > 10); // 너무 짧은 문장 제거
  }

  /**
   * 문장들의 중요도를 계산합니다
   * @param {Array<string>} sentences - 문장 배열
   * @returns {Array<Object>} 점수가 매겨진 문장 배열
   */
  scoreSentences(sentences) {
    const scoredSentences = [];
    
    // 키워드 빈도 계산
    const wordFreq = this.calculateWordFrequency(sentences.join(' '));
    
    // 중요 키워드 정의
    const importantKeywords = [
      'goal', 'objective', 'requirement', 'critical', 'important', 'key', 'main',
      'primary', 'essential', 'must', 'should', 'need', 'implement', 'develop',
      'create', 'build', 'design', 'task', 'subtask', 'acceptance', 'criteria',
      '목표', '목적', '요구사항', '중요', '핵심', '주요', '필수', '구현', '개발',
      '생성', '구축', '설계', '태스크', '하위', '승인', '기준'
    ];
    
    sentences.forEach((sentence, index) => {
      let score = 0;
      
      // 1. 문장 길이 점수 (너무 짧거나 긴 문장 페널티)
      const length = sentence.length;
      if (length >= 30 && length <= 150) {
        score += 1;
      } else if (length < 30) {
        score -= 0.5;
      }
      
      // 2. 중요 키워드 점수
      const lowerSentence = sentence.toLowerCase();
      importantKeywords.forEach(keyword => {
        if (lowerSentence.includes(keyword.toLowerCase())) {
          score += 2;
        }
      });
      
      // 3. 단어 빈도 점수
      const words = sentence.toLowerCase().split(/\s+/);
      words.forEach(word => {
        if (wordFreq[word] && wordFreq[word] > 1) {
          score += Math.log(wordFreq[word]);
        }
      });
      
      // 4. 위치 점수 (시작과 끝 부분 문장에 높은 점수)
      if (index < sentences.length * 0.3) {
        score += 1; // 시작 부분
      }
      if (index > sentences.length * 0.7) {
        score += 0.5; // 끝 부분
      }
      
      // 5. 구조적 중요도 (헤더, 목록 항목)
      if (sentence.match(/^#{1,6}\s+/) || sentence.match(/^\s*[-*+]\s+/)) {
        score += 3;
      }
      
      // 6. 숫자 포함 점수 (통계, 메트릭 등)
      if (sentence.match(/\d+/)) {
        score += 0.5;
      }
      
      scoredSentences.push({
        text: sentence,
        score,
        index,
        length
      });
    });
    
    return scoredSentences;
  }

  /**
   * 단어 빈도를 계산합니다
   * @param {string} text - 분석할 텍스트
   * @returns {Object} 단어 빈도 객체
   */
  calculateWordFrequency(text) {
    const words = text.toLowerCase().split(/\s+/);
    const frequency = {};
    
    // 불용어 제거
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of',
      'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before',
      'after', 'above', 'below', 'between', 'among', 'is', 'are', 'was', 'were',
      'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
      'would', 'should', 'could', 'can', 'may', 'might', 'must', 'this', 'that',
      'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him',
      'her', 'us', 'them', 'my', 'your', 'his', 'its', 'our', 'their',
      '이', '그', '저', '이것', '그것', '저것', '이거', '그거', '저거', '여기',
      '거기', '저기', '이곳', '그곳', '저곳', '는', '은', '을', '를', '이',
      '가', '와', '과', '에', '에서', '으로', '로', '의', '도', '만', '부터',
      '까지', '처럼', '같이', '보다', '한테', '에게', '께', '한', '하나',
      '두', '세', '네', '다섯', '여섯', '일곱', '여덟', '아홉', '열'
    ]);
    
    words.forEach(word => {
      const cleanWord = word.replace(/[^\w가-힣]/g, '');
      if (cleanWord.length > 2 && !stopWords.has(cleanWord)) {
        frequency[cleanWord] = (frequency[cleanWord] || 0) + 1;
      }
    });
    
    return frequency;
  }

  /**
   * 핵심 포인트를 추출합니다
   * @param {Array<Object>} sentences - 선택된 문장들
   * @returns {Array<string>} 핵심 포인트 배열
   */
  extractKeyPoints(sentences) {
    const keyPoints = [];
    
    sentences.forEach(sentence => {
      const text = sentence.text;
      
      // 목표, 요구사항, 기준 등 핵심 정보 추출
      if (text.includes('goal') || text.includes('objective') || text.includes('목표')) {
        keyPoints.push(`목표: ${text.replace(/^[#\s*-]+/, '').trim()}`);
      } else if (text.includes('requirement') || text.includes('요구사항')) {
        keyPoints.push(`요구사항: ${text.replace(/^[#\s*-]+/, '').trim()}`);
      } else if (text.includes('criteria') || text.includes('기준')) {
        keyPoints.push(`기준: ${text.replace(/^[#\s*-]+/, '').trim()}`);
      } else if (text.includes('task') || text.includes('태스크')) {
        keyPoints.push(`태스크: ${text.replace(/^[#\s*-]+/, '').trim()}`);
      }
    });
    
    return keyPoints.slice(0, 5); // 상위 5개만 반환
  }

  /**
   * 주요 개념을 추출합니다
   * @param {string} text - 분석할 텍스트
   * @returns {Array<Object>} 개념 배열
   */
  extractConcepts(text) {
    const concepts = [];
    const lines = text.split('\n');
    
    for (const line of lines) {
      // 헤더에서 개념 추출
      const headerMatch = line.match(/^#{1,6}\s+(.+)$/);
      if (headerMatch) {
        concepts.push({
          text: headerMatch[1],
          type: 'header',
          importance: 6 - line.indexOf('#')
        });
      }
      
      // 목록 항목에서 개념 추출
      const listMatch = line.match(/^\s*[-*+]\s+(.+)$/);
      if (listMatch) {
        concepts.push({
          text: listMatch[1],
          type: 'list_item',
          importance: 2
        });
      }
    }
    
    return concepts.sort((a, b) => b.importance - a.importance);
  }

  /**
   * 핵심 정보를 식별합니다
   * @param {string} text - 분석할 텍스트
   * @returns {Array<Object>} 핵심 정보 배열
   */
  identifyKeyInformation(text) {
    const keyInfo = [];
    const sentences = this.splitIntoSentences(text);
    
    const keyPatterns = [
      /goal|objective|목표|목적/i,
      /requirement|요구사항|조건/i,
      /criteria|기준|조건/i,
      /task|태스크|작업/i,
      /deadline|마감일|기한/i,
      /important|중요|핵심/i,
      /critical|중대|치명적/i,
      /must|필수|반드시/i
    ];
    
    sentences.forEach(sentence => {
      keyPatterns.forEach(pattern => {
        if (pattern.test(sentence)) {
          keyInfo.push({
            text: sentence,
            pattern: pattern.source,
            importance: this.calculateImportanceScore(sentence)
          });
        }
      });
    });
    
    return keyInfo.sort((a, b) => b.importance - a.importance);
  }

  /**
   * 구조를 분석합니다
   * @param {string} text - 분석할 텍스트
   * @returns {Array<Object>} 구조 요소 배열
   */
  analyzeStructure(text) {
    const structure = [];
    const lines = text.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // 헤더 구조
      const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
      if (headerMatch) {
        structure.push({
          type: 'header',
          level: headerMatch[1].length,
          text: headerMatch[2],
          line: i
        });
      }
      
      // 목록 구조
      const listMatch = line.match(/^\s*([-*+]|\d+\.)\s+(.+)$/);
      if (listMatch) {
        structure.push({
          type: 'list',
          marker: listMatch[1],
          text: listMatch[2],
          line: i
        });
      }
      
      // 코드 블록
      if (line.match(/^```/)) {
        structure.push({
          type: 'code_block',
          line: i
        });
      }
    }
    
    return structure;
  }

  /**
   * 추상적 요약을 생성합니다
   * @param {Array<Object>} concepts - 개념 배열
   * @param {Array<Object>} keyInfo - 핵심 정보 배열
   * @param {Array<Object>} structure - 구조 배열
   * @param {number} targetRatio - 목표 비율
   * @returns {string} 요약 텍스트
   */
  generateAbstractSummary(concepts, keyInfo, structure, targetRatio) {
    const summary = [];
    
    // 1. 주요 개념 요약
    const topConcepts = concepts.slice(0, Math.ceil(concepts.length * targetRatio));
    summary.push('## 주요 개념');
    topConcepts.forEach(concept => {
      summary.push(`- ${concept.text}`);
    });
    
    // 2. 핵심 정보 요약
    const topKeyInfo = keyInfo.slice(0, Math.ceil(keyInfo.length * targetRatio));
    if (topKeyInfo.length > 0) {
      summary.push('\n## 핵심 정보');
      topKeyInfo.forEach(info => {
        summary.push(`- ${info.text}`);
      });
    }
    
    // 3. 구조적 요약
    const headers = structure.filter(s => s.type === 'header' && s.level <= 3);
    if (headers.length > 0) {
      summary.push('\n## 구조');
      headers.forEach(header => {
        summary.push(`${'#'.repeat(header.level + 1)} ${header.text}`);
      });
    }
    
    return summary.join('\n');
  }

  /**
   * 중요도 점수를 계산합니다
   * @param {string} text - 분석할 텍스트
   * @returns {number} 중요도 점수
   */
  calculateImportanceScore(text) {
    let score = 0;
    const lowerText = text.toLowerCase();
    
    // 키워드 기반 점수
    const keywordWeights = {
      'critical': 5, 'important': 4, 'key': 3, 'main': 3, 'primary': 3,
      'essential': 4, 'must': 4, 'should': 3, 'need': 2, 'goal': 4,
      'objective': 4, 'requirement': 4, 'criteria': 3, 'task': 2,
      '중요': 4, '핵심': 4, '주요': 3, '필수': 4, '목표': 4, '목적': 4,
      '요구사항': 4, '기준': 3, '태스크': 2, '반드시': 4
    };
    
    Object.entries(keywordWeights).forEach(([keyword, weight]) => {
      if (lowerText.includes(keyword)) {
        score += weight;
      }
    });
    
    // 길이 기반 점수
    if (text.length > 50 && text.length < 200) {
      score += 1;
    }
    
    // 구두점 기반 점수
    if (text.includes('!') || text.includes('?')) {
      score += 1;
    }
    
    return score;
  }

  /**
   * 압축률을 계산합니다
   * @param {string} original - 원본 텍스트
   * @param {string} compressed - 압축된 텍스트
   * @returns {number} 압축률 (백분율)
   */
  calculateCompressionRatio(original, compressed) {
    const originalTokens = this.tokenCounter.countTokens(original);
    const compressedTokens = this.tokenCounter.countTokens(compressed);
    
    if (originalTokens === 0) return 0;
    return ((originalTokens - compressedTokens) / originalTokens) * 100;
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

export default TextSummarizer;