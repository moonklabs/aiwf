import { AggressiveCompressionStrategy, BalancedCompressionStrategy, MinimalCompressionStrategy } from './compression-strategies.js';
import { TextSummarizer } from './text-summarizer.js';
import { ContentNormalizer } from './content-normalizer.js';
import { ImportanceClassifier } from './importance-classifier.js';
import { InformationFilter } from './information-filter.js';
import { TokenCounter } from './token-counter.js';
import { TokenTracker } from './token-tracker.js';

/**
 * Integrated Context Compression System
 */
export class ContextCompressor {
  constructor(mode = 'balanced') {
    this.mode = mode;
    this.tokenCounter = new TokenCounter();
    this.tokenTracker = new TokenTracker();
    this.initializeStrategies();
    this.initializeComponents();
  }

  /**
   * Initialize compression strategies
   */
  initializeStrategies() {
    this.strategies = {
      aggressive: new AggressiveCompressionStrategy(),
      balanced: new BalancedCompressionStrategy(),
      minimal: new MinimalCompressionStrategy()
    };
  }

  /**
   * Initialize components
   */
  initializeComponents() {
    this.summarizer = new TextSummarizer();
    this.normalizer = new ContentNormalizer();
    this.classifier = new ImportanceClassifier();
    this.filter = new InformationFilter();
  }

  /**
   * Compress content
   * @param {string} content - Content to compress
   * @param {Object} options - Compression options
   * @returns {Object} Compression result
   */
  async compress(content, options = {}) {
    const startTime = Date.now();
    
    const {
      strategy = this.mode,
      targetRatio = null,
      maxTokens = null,
      preserveStructure = true,
      enableSummarization = true,
      enableNormalization = true,
      enableFiltering = true,
      customFilters = {},
      generateMetadata = true
    } = options;

    try {
      // 원본 토큰 수 계산
      const originalTokens = this.tokenCounter.countTokens(content);
      
      // 압축 파이프라인 실행
      const pipeline = this.createCompressionPipeline(strategy, options);
      const result = await this.executePipeline(pipeline, content);

      // 압축 결과 구성
      const compressedTokens = this.tokenCounter.countTokens(result.content);
      const compressionRatio = ((originalTokens - compressedTokens) / originalTokens) * 100;

      // 토큰 추적
      this.tokenTracker.trackCompression(originalTokens, compressedTokens);

      const compressionResult = {
        original: content,
        compressed: result.content,
        originalTokens,
        compressedTokens,
        compressionRatio,
        tokensReduced: originalTokens - compressedTokens,
        strategy,
        processingTime: Date.now() - startTime,
        success: true
      };

      if (generateMetadata) {
        compressionResult.metadata = {
          ...result.metadata,
          compressionId: this.generateCompressionId(),
          timestamp: new Date().toISOString(),
          pipelineStages: result.stages,
          tokenTracker: this.tokenTracker.generateReport()
        };
      }

      return compressionResult;

    } catch (error) {
      console.error('압축 중 오류 발생:', error);
      return {
        original: content,
        compressed: content,
        originalTokens: this.tokenCounter.countTokens(content),
        compressedTokens: this.tokenCounter.countTokens(content),
        compressionRatio: 0,
        tokensReduced: 0,
        strategy,
        processingTime: Date.now() - startTime,
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 압축 파이프라인을 생성합니다
   * @param {string} strategy - 압축 전략
   * @param {Object} options - 옵션
   * @returns {Array<Object>} 파이프라인 스테이지
   */
  createCompressionPipeline(strategy, options) {
    const pipeline = [];

    // 1. 토큰 분석 스테이지
    pipeline.push({
      name: 'TokenAnalysis',
      processor: this.tokenAnalysisStage.bind(this),
      options: {}
    });

    // 2. 중요도 분석 스테이지
    pipeline.push({
      name: 'ImportanceAnalysis',
      processor: this.importanceAnalysisStage.bind(this),
      options: {}
    });

    // 3. 정규화 스테이지 (옵션)
    if (options.enableNormalization) {
      pipeline.push({
        name: 'Normalization',
        processor: this.normalizationStage.bind(this),
        options: {}
      });
    }

    // 4. 필터링 스테이지 (옵션)
    if (options.enableFiltering) {
      pipeline.push({
        name: 'Filtering',
        processor: this.filteringStage.bind(this),
        options: {
          customFilters: options.customFilters || {},
          maxTokens: options.maxTokens
        }
      });
    }

    // 5. 요약 스테이지 (옵션)
    if (options.enableSummarization) {
      pipeline.push({
        name: 'Summarization',
        processor: this.summarizationStage.bind(this),
        options: {
          targetRatio: options.targetRatio || 0.7
        }
      });
    }

    // 6. 전략 압축 스테이지
    pipeline.push({
      name: 'StrategyCompression',
      processor: this.strategyCompressionStage.bind(this),
      options: {
        strategy,
        preserveStructure: options.preserveStructure
      }
    });

    // 7. 검증 스테이지
    pipeline.push({
      name: 'Validation',
      processor: this.validationStage.bind(this),
      options: {}
    });

    return pipeline;
  }

  /**
   * 파이프라인을 실행합니다
   * @param {Array<Object>} pipeline - 파이프라인 스테이지
   * @param {string} content - 처리할 콘텐츠
   * @returns {Object} 파이프라인 결과
   */
  async executePipeline(pipeline, content) {
    let result = { content, metadata: {}, stages: [] };

    for (const stage of pipeline) {
      const stageStartTime = Date.now();
      
      try {
        const stageResult = await stage.processor(result, stage.options);
        result = {
          ...result,
          ...stageResult,
          stages: [...result.stages, {
            name: stage.name,
            duration: Date.now() - stageStartTime,
            success: true,
            tokensAfter: this.tokenCounter.countTokens(stageResult.content)
          }]
        };
      } catch (error) {
        console.error(`파이프라인 스테이지 ${stage.name}에서 오류 발생:`, error);
        result.stages.push({
          name: stage.name,
          duration: Date.now() - stageStartTime,
          success: false,
          error: error.message
        });
      }
    }

    return result;
  }

  /**
   * 토큰 분석 스테이지
   * @param {Object} input - 입력 데이터
   * @param {Object} options - 옵션
   * @returns {Object} 스테이지 결과
   */
  async tokenAnalysisStage(input, options) {
    const tokenAnalysis = this.tokenCounter.analyzeTokenDistribution(input.content);
    
    return {
      content: input.content,
      metadata: {
        ...input.metadata,
        tokenAnalysis,
        originalTokens: this.tokenCounter.countTokens(input.content)
      }
    };
  }

  /**
   * 중요도 분석 스테이지
   * @param {Object} input - 입력 데이터
   * @param {Object} options - 옵션
   * @returns {Object} 스테이지 결과
   */
  async importanceAnalysisStage(input, options) {
    const importanceResult = this.classifier.analyzeImportance(input.content);
    
    return {
      content: input.content,
      metadata: {
        ...input.metadata,
        importanceAnalysis: importanceResult
      }
    };
  }

  /**
   * 정규화 스테이지
   * @param {Object} input - 입력 데이터
   * @param {Object} options - 옵션
   * @returns {Object} 스테이지 결과
   */
  async normalizationStage(input, options) {
    const normalizeResult = this.normalizer.normalize(input.content);
    
    return {
      content: normalizeResult.normalized,
      metadata: {
        ...input.metadata,
        normalization: normalizeResult.metadata
      }
    };
  }

  /**
   * 필터링 스테이지
   * @param {Object} input - 입력 데이터
   * @param {Object} options - 옵션
   * @returns {Object} 스테이지 결과
   */
  async filteringStage(input, options) {
    const filterResult = this.filter.filter(input.content, {
      customRules: options.customFilters,
      maxTokens: options.maxTokens
    });
    
    return {
      content: filterResult.filtered,
      metadata: {
        ...input.metadata,
        filtering: filterResult.metadata
      }
    };
  }

  /**
   * 요약 스테이지
   * @param {Object} input - 입력 데이터
   * @param {Object} options - 옵션
   * @returns {Object} 스테이지 결과
   */
  async summarizationStage(input, options) {
    const summarizeResult = this.summarizer.summarize(input.content, {
      targetRatio: options.targetRatio
    });
    
    return {
      content: summarizeResult.summary,
      metadata: {
        ...input.metadata,
        summarization: summarizeResult.metadata
      }
    };
  }

  /**
   * 전략 압축 스테이지
   * @param {Object} input - 입력 데이터
   * @param {Object} options - 옵션
   * @returns {Object} 스테이지 결과
   */
  async strategyCompressionStage(input, options) {
    const strategy = this.strategies[options.strategy];
    if (!strategy) {
      throw new Error(`압축 전략을 찾을 수 없습니다: ${options.strategy}`);
    }

    const compressionResult = strategy.compress(input.content, {
      preserveStructure: options.preserveStructure
    });
    
    return {
      content: compressionResult.content,
      metadata: {
        ...input.metadata,
        strategyCompression: compressionResult.metadata
      }
    };
  }

  /**
   * 검증 스테이지
   * @param {Object} input - 입력 데이터
   * @param {Object} options - 옵션
   * @returns {Object} 스테이지 결과
   */
  async validationStage(input, options) {
    const validationResult = this.validateCompression(input.content, input.metadata);
    
    return {
      content: input.content,
      metadata: {
        ...input.metadata,
        validation: validationResult
      }
    };
  }

  /**
   * 압축 결과를 검증합니다
   * @param {string} content - 압축된 콘텐츠
   * @param {Object} metadata - 메타데이터
   * @returns {Object} 검증 결과
   */
  validateCompression(content, metadata) {
    const validation = {
      isValid: true,
      warnings: [],
      errors: [],
      qualityScore: 0
    };

    // 1. 콘텐츠 유효성 검증
    if (!content || content.trim().length === 0) {
      validation.isValid = false;
      validation.errors.push('압축된 콘텐츠가 비어있습니다.');
    }

    // 2. 압축률 검증
    if (metadata.originalTokens && metadata.originalTokens > 0) {
      const currentTokens = this.tokenCounter.countTokens(content);
      const compressionRatio = ((metadata.originalTokens - currentTokens) / metadata.originalTokens) * 100;
      
      if (compressionRatio < 5) {
        validation.warnings.push('압축률이 낮습니다 (5% 미만).');
      } else if (compressionRatio > 90) {
        validation.warnings.push('압축률이 너무 높습니다 (90% 초과). 중요한 정보가 손실될 수 있습니다.');
      }
      
      // 품질 점수 계산
      validation.qualityScore = this.calculateQualityScore(compressionRatio, metadata);
    }

    // 3. 구조 유지 검증
    if (metadata.importanceAnalysis) {
      const criticalSections = metadata.importanceAnalysis.sections.filter(s => s.importance === 'critical');
      const preservedCritical = criticalSections.filter(s => 
        content.includes(s.name) || content.includes(s.content.substring(0, 50))
      );
      
      if (preservedCritical.length < criticalSections.length) {
        validation.warnings.push('일부 중요한 섹션이 압축 과정에서 손실되었을 수 있습니다.');
      }
    }

    return validation;
  }

  /**
   * 품질 점수를 계산합니다
   * @param {number} compressionRatio - 압축률
   * @param {Object} metadata - 메타데이터
   * @returns {number} 품질 점수 (0-100)
   */
  calculateQualityScore(compressionRatio, metadata) {
    let score = 0;

    // 압축률 점수 (40점 만점)
    if (compressionRatio >= 20 && compressionRatio <= 70) {
      score += 40;
    } else if (compressionRatio >= 10 && compressionRatio <= 80) {
      score += 30;
    } else if (compressionRatio >= 5 && compressionRatio <= 90) {
      score += 20;
    } else {
      score += 10;
    }

    // 정보 보존 점수 (30점 만점)
    if (metadata.importanceAnalysis) {
      const preservedImportant = metadata.importanceAnalysis.sections.filter(s => 
        s.importance === 'critical' || s.importance === 'high'
      ).length;
      const totalImportant = metadata.importanceAnalysis.sections.filter(s => 
        s.importance === 'critical' || s.importance === 'high'
      ).length;
      
      if (totalImportant > 0) {
        score += (preservedImportant / totalImportant) * 30;
      } else {
        score += 30;
      }
    } else {
      score += 20; // 기본 점수
    }

    // 구조 유지 점수 (20점 만점)
    if (metadata.strategyCompression) {
      score += metadata.strategyCompression.preservedSections ? 20 : 10;
    } else {
      score += 15; // 기본 점수
    }

    // 성능 점수 (10점 만점)
    score += 10; // 기본 점수 (실제로는 처리 시간 등을 고려)

    return Math.min(100, Math.max(0, score));
  }

  /**
   * 압축된 콘텐츠를 복원합니다
   * @param {string} compressedContent - 압축된 콘텐츠
   * @param {Object} metadata - 복원 메타데이터
   * @returns {Object} 복원 결과
   */
  async decompress(compressedContent, metadata) {
    const startTime = Date.now();

    try {
      // 메타데이터에서 압축 정보 추출
      const compressionStrategy = metadata.strategyCompression?.strategy || 'balanced';
      const strategy = this.strategies[compressionStrategy];

      if (!strategy) {
        throw new Error(`복원 전략을 찾을 수 없습니다: ${compressionStrategy}`);
      }

      // 전략별 복원 수행
      const decompressed = strategy.decompress(compressedContent, metadata);

      const result = {
        compressed: compressedContent,
        decompressed,
        strategy: compressionStrategy,
        processingTime: Date.now() - startTime,
        success: true,
        metadata: {
          decompressionId: this.generateCompressionId(),
          timestamp: new Date().toISOString(),
          originalMetadata: metadata
        }
      };

      return result;

    } catch (error) {
      console.error('복원 중 오류 발생:', error);
      return {
        compressed: compressedContent,
        decompressed: compressedContent, // 복원 실패 시 압축된 콘텐츠 반환
        strategy: 'fallback',
        processingTime: Date.now() - startTime,
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 압축 ID를 생성합니다
   * @returns {string} 압축 ID
   */
  generateCompressionId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `comp_${timestamp}_${random}`;
  }

  /**
   * 압축 통계를 반환합니다
   * @returns {Object} 압축 통계
   */
  getStatistics() {
    return {
      tokenTracker: this.tokenTracker.getSessionStats(),
      filter: this.filter.getStatistics(),
      supportedStrategies: Object.keys(this.strategies),
      currentMode: this.mode
    };
  }

  /**
   * 모드를 변경합니다
   * @param {string} mode - 새로운 모드
   */
  setMode(mode) {
    if (this.strategies[mode]) {
      this.mode = mode;
    } else {
      throw new Error(`지원되지 않는 압축 모드: ${mode}`);
    }
  }

  /**
   * 사용자 정의 전략을 추가합니다
   * @param {string} name - 전략 이름
   * @param {Object} strategy - 전략 객체
   */
  addStrategy(name, strategy) {
    this.strategies[name] = strategy;
  }

  /**
   * 리소스를 정리합니다
   */
  cleanup() {
    if (this.tokenCounter) this.tokenCounter.cleanup();
    if (this.tokenTracker) this.tokenTracker.cleanup();
    if (this.summarizer) this.summarizer.cleanup();
    if (this.normalizer) this.normalizer.cleanup();
    if (this.classifier) this.classifier.cleanup();
    if (this.filter) this.filter.cleanup();
    
    // 전략들 정리
    Object.values(this.strategies).forEach(strategy => {
      if (strategy.cleanup) strategy.cleanup();
    });
  }
}

export default ContextCompressor;