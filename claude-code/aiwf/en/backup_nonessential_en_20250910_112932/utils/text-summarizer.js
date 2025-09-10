import { TokenCounter } from './token-counter.js';

/**
 * Text summarization algorithm prototype
 */
export class TextSummarizer {
  constructor() {
    this.tokenCounter = new TokenCounter();
  }

  /**
   * Summarize text
   * @param {string} text - Text to summarize
   * @param {Object} options - Summarization options
   * @returns {Object} Summarization result
   */
  summarize(text, options = {}) {
    const {
      targetRatio = 0.3, // Target compression ratio (30%)
      strategy = 'extractive', // 'extractive' or 'abstractive'
      preserveStructure = true, // Whether to preserve structure
      minSentenceLength = 20, // Minimum sentence length
      maxSentenceLength = 200 // Maximum sentence length
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
   * Extractive summarization (select important sentences)
   * @param {string} text - Text to summarize
   * @param {number} targetRatio - Target compression ratio
   * @param {Object} options - Options
   * @returns {Object} Summarization result
   */
  extractiveSummarization(text, targetRatio, options) {
    // 1. Split text into sentences
    const sentences = this.splitIntoSentences(text);
    
    // 2. Calculate importance score for each sentence
    const scoredSentences = this.scoreSentences(sentences);
    
    // 3. Sort by importance score
    const sortedSentences = scoredSentences.sort((a, b) => b.score - a.score);
    
    // 4. Select top sentences according to target ratio
    const targetSentenceCount = Math.ceil(sentences.length * targetRatio);
    const selectedSentences = sortedSentences.slice(0, targetSentenceCount);
    
    // 5. Rearrange in original order
    const finalSentences = selectedSentences.sort((a, b) => a.index - b.index);
    
    // 6. Generate summary text
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
   * Abstractive summarization (reconstruct content)
   * @param {string} text - Text to summarize
   * @param {number} targetRatio - Target compression ratio
   * @param {Object} options - Options
   * @returns {Object} Summarization result
   */
  abstractiveSummarization(text, targetRatio, options) {
    // 1. Extract key concepts
    const concepts = this.extractConcepts(text);
    
    // 2. Identify key information
    const keyInfo = this.identifyKeyInformation(text);
    
    // 3. Analyze structure
    const structure = this.analyzeStructure(text);
    
    // 4. Generate summary
    const summaryText = this.generateAbstractSummary(concepts, keyInfo, structure, targetRatio);
    
    return {
      content: summaryText,
      compressionRatio: this.calculateCompressionRatio(text, summaryText),
      keyPoints: concepts.slice(0, 5), // Top 5 concepts
      metadata: {
        strategy: 'abstractive',
        conceptCount: concepts.length,
        keyInfoCount: keyInfo.length,
        structureElements: structure.length
      }
    };
  }

  /**
   * Split text into sentences
   * @param {string} text - Text to split
   * @returns {Array<string>} Sentence array
   */
  splitIntoSentences(text) {
    // Split sentences while preserving markdown structure
    const sentences = [];
    const lines = text.split('\n');
    
    for (const line of lines) {
      if (line.trim() === '') continue;
      
      // Keep headers and list items as is
      if (line.match(/^#{1,6}\s+/) || line.match(/^\s*[-*+]\s+/) || line.match(/^\s*\d+\.\s+/)) {
        sentences.push(line.trim());
      } else {
        // Split regular text into sentences
        const lineSentences = line.split(/[.!?]+/).filter(s => s.trim().length > 0);
        sentences.push(...lineSentences.map(s => s.trim() + '.'));
      }
    }
    
    return sentences.filter(s => s.length > 10); // Remove sentences that are too short
  }

  /**
   * Calculate importance scores for sentences
   * @param {Array<string>} sentences - Sentence array
   * @returns {Array<Object>} Scored sentence array
   */
  scoreSentences(sentences) {
    const scoredSentences = [];
    
    // Calculate keyword frequency
    const wordFreq = this.calculateWordFrequency(sentences.join(' '));
    
    // Define important keywords
    const importantKeywords = [
      'goal', 'objective', 'requirement', 'critical', 'important', 'key', 'main',
      'primary', 'essential', 'must', 'should', 'need', 'implement', 'develop',
      'create', 'build', 'design', 'task', 'subtask', 'acceptance', 'criteria',
      'purpose', 'core', 'mandatory', 'execute', 'generate', 'construct', 'architecture', 'work', 'sub', 'approval', 'standard'
    ];
    
    sentences.forEach((sentence, index) => {
      let score = 0;
      
      // 1. Sentence length score (penalty for too short or long sentences)
      const length = sentence.length;
      if (length >= 30 && length <= 150) {
        score += 1;
      } else if (length < 30) {
        score -= 0.5;
      }
      
      // 2. Important keyword score
      const lowerSentence = sentence.toLowerCase();
      importantKeywords.forEach(keyword => {
        if (lowerSentence.includes(keyword.toLowerCase())) {
          score += 2;
        }
      });
      
      // 3. Word frequency score
      const words = sentence.toLowerCase().split(/\s+/);
      words.forEach(word => {
        if (wordFreq[word] && wordFreq[word] > 1) {
          score += Math.log(wordFreq[word]);
        }
      });
      
      // 4. Position score (higher score for beginning and end sentences)
      if (index < sentences.length * 0.3) {
        score += 1; // Beginning part
      }
      if (index > sentences.length * 0.7) {
        score += 0.5; // End part
      }
      
      // 5. Structural importance (headers, list items)
      if (sentence.match(/^#{1,6}\s+/) || sentence.match(/^\s*[-*+]\s+/)) {
        score += 3;
      }
      
      // 6. Number inclusion score (statistics, metrics, etc.)
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
   * Calculate word frequency
   * @param {string} text - Text to analyze
   * @returns {Object} Word frequency object
   */
  calculateWordFrequency(text) {
    const words = text.toLowerCase().split(/\s+/);
    const frequency = {};
    
    // Remove stop words
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of',
      'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before',
      'after', 'above', 'below', 'between', 'among', 'is', 'are', 'was', 'were',
      'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
      'would', 'should', 'could', 'can', 'may', 'might', 'must', 'this', 'that',
      'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him',
      'her', 'us', 'them', 'my', 'your', 'his', 'its', 'our', 'their',
      // Korean stop words removed for English-only version
    ]);
    
    words.forEach(word => {
      const cleanWord = word.replace(/[^\w]/g, '');
      if (cleanWord.length > 2 && !stopWords.has(cleanWord)) {
        frequency[cleanWord] = (frequency[cleanWord] || 0) + 1;
      }
    });
    
    return frequency;
  }

  /**
   * Extract key points
   * @param {Array<Object>} sentences - Selected sentences
   * @returns {Array<string>} Key points array
   */
  extractKeyPoints(sentences) {
    const keyPoints = [];
    
    sentences.forEach(sentence => {
      const text = sentence.text;
      
      // Extract key information such as goals, requirements, criteria
      if (text.includes('goal') || text.includes('objective') || text.includes('purpose')) {
        keyPoints.push(`Goal: ${text.replace(/^[#\s*-]+/, '').trim()}`);
      } else if (text.includes('requirement') || text.includes('condition')) {
        keyPoints.push(`Requirement: ${text.replace(/^[#\s*-]+/, '').trim()}`);
      } else if (text.includes('criteria') || text.includes('standard')) {
        keyPoints.push(`Criteria: ${text.replace(/^[#\s*-]+/, '').trim()}`);
      } else if (text.includes('task') || text.includes('work')) {
        keyPoints.push(`Task: ${text.replace(/^[#\s*-]+/, '').trim()}`);
      }
    });
    
    return keyPoints.slice(0, 5); // Return top 5 only
  }

  /**
   * Extract key concepts
   * @param {string} text - Text to analyze
   * @returns {Array<Object>} Concept array
   */
  extractConcepts(text) {
    const concepts = [];
    const lines = text.split('\n');
    
    for (const line of lines) {
      // Extract concepts from headers
      const headerMatch = line.match(/^#{1,6}\s+(.+)$/);
      if (headerMatch) {
        concepts.push({
          text: headerMatch[1],
          type: 'header',
          importance: 6 - line.indexOf('#')
        });
      }
      
      // Extract concepts from list items
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
   * Identify key information
   * @param {string} text - Text to analyze
   * @returns {Array<Object>} Key information array
   */
  identifyKeyInformation(text) {
    const keyInfo = [];
    const sentences = this.splitIntoSentences(text);
    
    const keyPatterns = [
      /goal|objective|purpose/i,
      /requirement|condition/i,
      /criteria|standard/i,
      /task|work/i,
      /deadline|due/i,
      /important|key|core/i,
      /critical|severe|fatal/i,
      /must|essential|mandatory/i
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
   * Analyze structure
   * @param {string} text - Text to analyze
   * @returns {Array<Object>} Structure element array
   */
  analyzeStructure(text) {
    const structure = [];
    const lines = text.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Header structure
      const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
      if (headerMatch) {
        structure.push({
          type: 'header',
          level: headerMatch[1].length,
          text: headerMatch[2],
          line: i
        });
      }
      
      // List structure
      const listMatch = line.match(/^\s*([-*+]|\d+\.)\s+(.+)$/);
      if (listMatch) {
        structure.push({
          type: 'list',
          marker: listMatch[1],
          text: listMatch[2],
          line: i
        });
      }
      
      // Code block
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
   * Generate abstractive summary
   * @param {Array<Object>} concepts - Concept array
   * @param {Array<Object>} keyInfo - Key information array
   * @param {Array<Object>} structure - Structure array
   * @param {number} targetRatio - Target ratio
   * @returns {string} Summary text
   */
  generateAbstractSummary(concepts, keyInfo, structure, targetRatio) {
    const summary = [];
    
    // 1. Key concept summary
    const topConcepts = concepts.slice(0, Math.ceil(concepts.length * targetRatio));
    summary.push('## Key Concepts');
    topConcepts.forEach(concept => {
      summary.push(`- ${concept.text}`);
    });
    
    // 2. Key information summary
    const topKeyInfo = keyInfo.slice(0, Math.ceil(keyInfo.length * targetRatio));
    if (topKeyInfo.length > 0) {
      summary.push('\n## Key Information');
      topKeyInfo.forEach(info => {
        summary.push(`- ${info.text}`);
      });
    }
    
    // 3. Structural summary
    const headers = structure.filter(s => s.type === 'header' && s.level <= 3);
    if (headers.length > 0) {
      summary.push('\n## Structure');
      headers.forEach(header => {
        summary.push(`${'#'.repeat(header.level + 1)} ${header.text}`);
      });
    }
    
    return summary.join('\n');
  }

  /**
   * Calculate importance score
   * @param {string} text - Text to analyze
   * @returns {number} Importance score
   */
  calculateImportanceScore(text) {
    let score = 0;
    const lowerText = text.toLowerCase();
    
    // Keyword-based score
    const keywordWeights = {
      'critical': 5, 'important': 4, 'key': 3, 'main': 3, 'primary': 3,
      'essential': 4, 'must': 4, 'should': 3, 'need': 2, 'goal': 4,
      'objective': 4, 'requirement': 4, 'criteria': 3, 'task': 2,
      'important': 4, 'core': 4, 'main': 3, 'essential': 4, 'goal': 4, 'purpose': 4,
      'requirement': 4, 'criteria': 3, 'task': 2, 'mandatory': 4
    };
    
    Object.entries(keywordWeights).forEach(([keyword, weight]) => {
      if (lowerText.includes(keyword)) {
        score += weight;
      }
    });
    
    // Length-based score
    if (text.length > 50 && text.length < 200) {
      score += 1;
    }
    
    // Punctuation-based score
    if (text.includes('!') || text.includes('?')) {
      score += 1;
    }
    
    return score;
  }

  /**
   * Calculate compression ratio
   * @param {string} original - Original text
   * @param {string} compressed - Compressed text
   * @returns {number} Compression ratio (percentage)
   */
  calculateCompressionRatio(original, compressed) {
    const originalTokens = this.tokenCounter.countTokens(original);
    const compressedTokens = this.tokenCounter.countTokens(compressed);
    
    if (originalTokens === 0) return 0;
    return ((originalTokens - compressedTokens) / originalTokens) * 100;
  }

  /**
   * Clean up resources
   */
  cleanup() {
    if (this.tokenCounter) {
      this.tokenCounter.cleanup();
    }
  }
}

export default TextSummarizer;