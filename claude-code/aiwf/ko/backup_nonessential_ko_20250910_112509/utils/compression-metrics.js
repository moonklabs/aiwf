import { TokenCounter } from './token-counter.js';
import fs from 'fs';
import path from 'path';

/**
 * 압축률 측정 및 성능 분석 도구
 */
export class CompressionMetrics {
  constructor() {
    this.tokenCounter = new TokenCounter();
    this.measurements = new Map();
    this.benchmarks = new Map();
    this.initializeMetrics();
  }

  /**
   * 메트릭 시스템을 초기화합니다
   */
  initializeMetrics() {
    // 메트릭 타입 정의
    this.metricTypes = {
      compression: {
        name: 'Compression Metrics',
        description: '압축률 관련 메트릭',
        measurements: [
          'compression_ratio',
          'token_reduction',
          'size_reduction',
          'information_preservation'
        ]
      },
      performance: {
        name: 'Performance Metrics',
        description: '성능 관련 메트릭',
        measurements: [
          'compression_time',
          'decompression_time',
          'memory_usage',
          'throughput'
        ]
      },
      quality: {
        name: 'Quality Metrics',
        description: '품질 관련 메트릭',
        measurements: [
          'readability_score',
          'structure_preservation',
          'semantic_similarity',
          'information_loss'
        ]
      },
      efficiency: {
        name: 'Efficiency Metrics',
        description: '효율성 관련 메트릭',
        measurements: [
          'tokens_per_second',
          'compression_efficiency',
          'resource_utilization',
          'cost_effectiveness'
        ]
      }
    };

    // 벤치마크 기준점
    this.benchmarkThresholds = {
      compression_ratio: {
        excellent: 70,
        good: 50,
        acceptable: 30,
        poor: 10
      },
      compression_time: {
        excellent: 1000,   // 1초
        good: 3000,        // 3초
        acceptable: 5000,  // 5초
        poor: 10000        // 10초
      },
      information_preservation: {
        excellent: 90,
        good: 80,
        acceptable: 70,
        poor: 50
      },
      readability_score: {
        excellent: 90,
        good: 80,
        acceptable: 70,
        poor: 50
      }
    };

    // 측정 히스토리
    this.measurementHistory = [];
  }

  /**
   * 압축 결과를 측정합니다
   * @param {string} original - 원본 콘텐츠
   * @param {string} compressed - 압축된 콘텐츠
   * @param {Object} metadata - 압축 메타데이터
   * @returns {Object} 측정 결과
   */
  measureCompression(original, compressed, metadata = {}) {
    const measurementId = this.generateMeasurementId();
    const timestamp = Date.now();
    
    const measurement = {
      id: measurementId,
      timestamp,
      originalContent: original,
      compressedContent: compressed,
      metadata,
      metrics: {},
      analysis: {},
      benchmark: {}
    };

    // 1. 압축 메트릭 계산
    measurement.metrics.compression = this.calculateCompressionMetrics(original, compressed);

    // 2. 성능 메트릭 계산
    measurement.metrics.performance = this.calculatePerformanceMetrics(metadata);

    // 3. 품질 메트릭 계산
    measurement.metrics.quality = this.calculateQualityMetrics(original, compressed, metadata);

    // 4. 효율성 메트릭 계산
    measurement.metrics.efficiency = this.calculateEfficiencyMetrics(original, compressed, metadata);

    // 5. 벤치마크 분석
    measurement.benchmark = this.analyzeBenchmark(measurement.metrics);

    // 6. 종합 분석
    measurement.analysis = this.generateAnalysis(measurement.metrics, measurement.benchmark);

    // 측정 결과 저장
    this.measurements.set(measurementId, measurement);
    this.measurementHistory.push(measurement);

    return measurement;
  }

  /**
   * 압축 메트릭을 계산합니다
   * @param {string} original - 원본 콘텐츠
   * @param {string} compressed - 압축된 콘텐츠
   * @returns {Object} 압축 메트릭
   */
  calculateCompressionMetrics(original, compressed) {
    const originalTokens = this.tokenCounter.countTokens(original);
    const compressedTokens = this.tokenCounter.countTokens(compressed);
    const originalSize = Buffer.byteLength(original, 'utf8');
    const compressedSize = Buffer.byteLength(compressed, 'utf8');

    const tokenReduction = originalTokens - compressedTokens;
    const sizeReduction = originalSize - compressedSize;
    const compressionRatio = originalTokens > 0 ? (tokenReduction / originalTokens) * 100 : 0;
    const sizeCompressionRatio = originalSize > 0 ? (sizeReduction / originalSize) * 100 : 0;

    // 정보 보존률 계산
    const informationPreservation = this.calculateInformationPreservation(original, compressed);

    return {
      original_tokens: originalTokens,
      compressed_tokens: compressedTokens,
      token_reduction: tokenReduction,
      token_reduction_percentage: compressionRatio,
      original_size: originalSize,
      compressed_size: compressedSize,
      size_reduction: sizeReduction,
      size_reduction_percentage: sizeCompressionRatio,
      information_preservation: informationPreservation,
      compression_efficiency: this.calculateCompressionEfficiency(compressionRatio, informationPreservation)
    };
  }

  /**
   * 성능 메트릭을 계산합니다
   * @param {Object} metadata - 메타데이터
   * @returns {Object} 성능 메트릭
   */
  calculatePerformanceMetrics(metadata) {
    const performance = {
      compression_time: metadata.processingTime || 0,
      decompression_time: metadata.decompressionTime || 0,
      memory_usage: metadata.memoryUsage || 0,
      throughput: 0,
      tokens_per_second: 0
    };

    // 처리량 계산
    if (performance.compression_time > 0 && metadata.originalTokens) {
      performance.tokens_per_second = (metadata.originalTokens / performance.compression_time) * 1000;
      performance.throughput = (metadata.originalTokens / performance.compression_time) * 1000;
    }

    // 메모리 효율성 계산
    if (performance.memory_usage > 0 && metadata.originalTokens) {
      performance.memory_efficiency = metadata.originalTokens / performance.memory_usage;
    }

    // 파이프라인 성능 분석
    if (metadata.pipelineStages) {
      performance.pipeline_analysis = this.analyzePipelinePerformance(metadata.pipelineStages);
    }

    return performance;
  }

  /**
   * 품질 메트릭을 계산합니다
   * @param {string} original - 원본 콘텐츠
   * @param {string} compressed - 압축된 콘텐츠
   * @param {Object} metadata - 메타데이터
   * @returns {Object} 품질 메트릭
   */
  calculateQualityMetrics(original, compressed, metadata) {
    const quality = {
      readability_score: this.calculateReadabilityScore(compressed),
      structure_preservation: this.calculateStructurePreservation(original, compressed),
      semantic_similarity: this.calculateSemanticSimilarity(original, compressed),
      information_loss: this.calculateInformationLoss(original, compressed),
      coherence_score: this.calculateCoherenceScore(compressed),
      completeness_score: this.calculateCompletenessScore(original, compressed)
    };

    // 전체 품질 점수 계산
    quality.overall_quality = this.calculateOverallQuality(quality);

    return quality;
  }

  /**
   * 효율성 메트릭을 계산합니다
   * @param {string} original - 원본 콘텐츠
   * @param {string} compressed - 압축된 콘텐츠
   * @param {Object} metadata - 메타데이터
   * @returns {Object} 효율성 메트릭
   */
  calculateEfficiencyMetrics(original, compressed, metadata) {
    const originalTokens = this.tokenCounter.countTokens(original);
    const compressedTokens = this.tokenCounter.countTokens(compressed);
    const processingTime = metadata.processingTime || 1;

    const efficiency = {
      compression_efficiency: this.calculateCompressionEfficiency(
        ((originalTokens - compressedTokens) / originalTokens) * 100,
        this.calculateInformationPreservation(original, compressed)
      ),
      resource_utilization: this.calculateResourceUtilization(metadata),
      cost_effectiveness: this.calculateCostEffectiveness(originalTokens, compressedTokens, processingTime),
      energy_efficiency: this.calculateEnergyEfficiency(originalTokens, processingTime)
    };

    return efficiency;
  }

  /**
   * 정보 보존률을 계산합니다
   * @param {string} original - 원본 콘텐츠
   * @param {string} compressed - 압축된 콘텐츠
   * @returns {number} 정보 보존률 (0-100)
   */
  calculateInformationPreservation(original, compressed) {
    // 키워드 보존률 계산
    const originalKeywords = this.extractKeywords(original);
    const compressedKeywords = this.extractKeywords(compressed);
    
    const preservedKeywords = originalKeywords.filter(keyword => 
      compressedKeywords.includes(keyword)
    );
    
    const keywordPreservation = originalKeywords.length > 0 
      ? (preservedKeywords.length / originalKeywords.length) * 100 
      : 100;

    // 구조 보존률 계산
    const structurePreservation = this.calculateStructurePreservation(original, compressed);

    // 의미 보존률 계산
    const semanticPreservation = this.calculateSemanticSimilarity(original, compressed);

    // 가중 평균 계산
    return (keywordPreservation * 0.4 + structurePreservation * 0.3 + semanticPreservation * 0.3);
  }

  /**
   * 키워드를 추출합니다
   * @param {string} text - 텍스트
   * @returns {Array<string>} 키워드 배열
   */
  extractKeywords(text) {
    const keywords = [];
    const words = text.toLowerCase().split(/\s+/);
    
    // 중요한 키워드 패턴
    const keywordPatterns = [
      /\b(goal|objective|task|requirement|critical|important|key|main|primary|essential)\b/g,
      /\b(목표|목적|태스크|요구사항|중요|핵심|주요|필수|기본|우선)\b/g
    ];

    for (const pattern of keywordPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        keywords.push(...matches);
      }
    }

    // 고유 키워드만 반환
    return [...new Set(keywords)];
  }

  /**
   * 구조 보존률을 계산합니다
   * @param {string} original - 원본 콘텐츠
   * @param {string} compressed - 압축된 콘텐츠
   * @returns {number} 구조 보존률 (0-100)
   */
  calculateStructurePreservation(original, compressed) {
    const originalHeaders = (original.match(/^#{1,6}\s+.+$/gm) || []).length;
    const compressedHeaders = (compressed.match(/^#{1,6}\s+.+$/gm) || []).length;
    
    const originalLists = (original.match(/^\s*[-*+]\s+/gm) || []).length;
    const compressedLists = (compressed.match(/^\s*[-*+]\s+/gm) || []).length;
    
    const originalCodeBlocks = (original.match(/```[\s\S]*?```/g) || []).length;
    const compressedCodeBlocks = (compressed.match(/```[\s\S]*?```/g) || []).length;

    const headerPreservation = originalHeaders > 0 ? (compressedHeaders / originalHeaders) * 100 : 100;
    const listPreservation = originalLists > 0 ? (compressedLists / originalLists) * 100 : 100;
    const codePreservation = originalCodeBlocks > 0 ? (compressedCodeBlocks / originalCodeBlocks) * 100 : 100;

    return (headerPreservation + listPreservation + codePreservation) / 3;
  }

  /**
   * 의미 유사도를 계산합니다
   * @param {string} original - 원본 콘텐츠
   * @param {string} compressed - 압축된 콘텐츠
   * @returns {number} 의미 유사도 (0-100)
   */
  calculateSemanticSimilarity(original, compressed) {
    // 단순한 어휘 기반 유사도 계산
    const originalWords = new Set(original.toLowerCase().split(/\s+/));
    const compressedWords = new Set(compressed.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...originalWords].filter(word => compressedWords.has(word)));
    const union = new Set([...originalWords, ...compressedWords]);
    
    return union.size > 0 ? (intersection.size / union.size) * 100 : 0;
  }

  /**
   * 정보 손실률을 계산합니다
   * @param {string} original - 원본 콘텐츠
   * @param {string} compressed - 압축된 콘텐츠
   * @returns {number} 정보 손실률 (0-100)
   */
  calculateInformationLoss(original, compressed) {
    const preservation = this.calculateInformationPreservation(original, compressed);
    return 100 - preservation;
  }

  /**
   * 가독성 점수를 계산합니다
   * @param {string} text - 텍스트
   * @returns {number} 가독성 점수 (0-100)
   */
  calculateReadabilityScore(text) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/).filter(w => w.trim().length > 0);
    
    if (sentences.length === 0 || words.length === 0) return 0;
    
    const avgWordsPerSentence = words.length / sentences.length;
    const avgCharsPerWord = words.reduce((sum, word) => sum + word.length, 0) / words.length;
    
    // 단순한 가독성 점수 계산
    let score = 100;
    
    // 문장 길이 페널티
    if (avgWordsPerSentence > 20) score -= 20;
    else if (avgWordsPerSentence > 15) score -= 10;
    
    // 단어 길이 페널티
    if (avgCharsPerWord > 7) score -= 20;
    else if (avgCharsPerWord > 5) score -= 10;
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * 일관성 점수를 계산합니다
   * @param {string} text - 텍스트
   * @returns {number} 일관성 점수 (0-100)
   */
  calculateCoherenceScore(text) {
    // 단순한 일관성 점수 계산
    const lines = text.split('\n');
    let coherenceScore = 100;
    
    // 빈 줄 패턴 확인
    const emptyLinePattern = /^\s*$/;
    const consecutiveEmptyLines = lines.reduce((count, line, index) => {
      if (emptyLinePattern.test(line) && index > 0 && emptyLinePattern.test(lines[index - 1])) {
        return count + 1;
      }
      return count;
    }, 0);
    
    coherenceScore -= consecutiveEmptyLines * 2;
    
    // 헤더 계층 구조 확인
    const headers = lines.filter(line => line.match(/^#{1,6}\s+/));
    const headerLevels = headers.map(header => header.match(/^(#{1,6})/)[1].length);
    
    let previousLevel = 0;
    for (const level of headerLevels) {
      if (level - previousLevel > 1) {
        coherenceScore -= 5; // 헤더 레벨 건너뛰기 페널티
      }
      previousLevel = level;
    }
    
    return Math.max(0, Math.min(100, coherenceScore));
  }

  /**
   * 완성도 점수를 계산합니다
   * @param {string} original - 원본 콘텐츠
   * @param {string} compressed - 압축된 콘텐츠
   * @returns {number} 완성도 점수 (0-100)
   */
  calculateCompletenessScore(original, compressed) {
    // 중요한 섹션이 유지되었는지 확인
    const importantSections = [
      'goal', 'objective', 'requirement', 'task', 'subtask', 'acceptance criteria',
      '목표', '목적', '요구사항', '태스크', '하위', '승인 기준'
    ];
    
    let foundSections = 0;
    const lowerCompressed = compressed.toLowerCase();
    
    for (const section of importantSections) {
      if (lowerCompressed.includes(section.toLowerCase())) {
        foundSections++;
      }
    }
    
    const completenessRatio = foundSections / importantSections.length;
    return completenessRatio * 100;
  }

  /**
   * 압축 효율성을 계산합니다
   * @param {number} compressionRatio - 압축률
   * @param {number} informationPreservation - 정보 보존률
   * @returns {number} 압축 효율성 (0-100)
   */
  calculateCompressionEfficiency(compressionRatio, informationPreservation) {
    // 압축률과 정보 보존률의 균형을 고려한 효율성 계산
    const alpha = 0.6; // 압축률 가중치
    const beta = 0.4;  // 정보 보존률 가중치
    
    return (alpha * compressionRatio) + (beta * informationPreservation);
  }

  /**
   * 자원 사용률을 계산합니다
   * @param {Object} metadata - 메타데이터
   * @returns {number} 자원 사용률 (0-100)
   */
  calculateResourceUtilization(metadata) {
    // 메모리 사용량, 처리 시간 등을 고려한 자원 사용률
    const memoryScore = metadata.memoryUsage ? Math.min(100, 100 - (metadata.memoryUsage / 1024 / 1024)) : 100;
    const timeScore = metadata.processingTime ? Math.min(100, 100 - (metadata.processingTime / 1000)) : 100;
    
    return (memoryScore + timeScore) / 2;
  }

  /**
   * 비용 효율성을 계산합니다
   * @param {number} originalTokens - 원본 토큰 수
   * @param {number} compressedTokens - 압축된 토큰 수
   * @param {number} processingTime - 처리 시간
   * @returns {number} 비용 효율성 (0-100)
   */
  calculateCostEffectiveness(originalTokens, compressedTokens, processingTime) {
    const tokenSaved = originalTokens - compressedTokens;
    const processingTimeInSeconds = processingTime / 1000;
    
    if (processingTimeInSeconds === 0) return 0;
    
    // 초당 절약된 토큰 수
    const tokensPerSecond = tokenSaved / processingTimeInSeconds;
    
    // 정규화된 비용 효율성 (최대 100)
    return Math.min(100, tokensPerSecond);
  }

  /**
   * 에너지 효율성을 계산합니다
   * @param {number} originalTokens - 원본 토큰 수
   * @param {number} processingTime - 처리 시간
   * @returns {number} 에너지 효율성 (0-100)
   */
  calculateEnergyEfficiency(originalTokens, processingTime) {
    const processingTimeInSeconds = processingTime / 1000;
    
    if (processingTimeInSeconds === 0) return 0;
    
    // 초당 처리된 토큰 수
    const tokensPerSecond = originalTokens / processingTimeInSeconds;
    
    // 정규화된 에너지 효율성 (최대 100)
    return Math.min(100, tokensPerSecond / 10);
  }

  /**
   * 전체 품질 점수를 계산합니다
   * @param {Object} quality - 품질 메트릭
   * @returns {number} 전체 품질 점수 (0-100)
   */
  calculateOverallQuality(quality) {
    const weights = {
      readability_score: 0.2,
      structure_preservation: 0.25,
      semantic_similarity: 0.25,
      coherence_score: 0.15,
      completeness_score: 0.15
    };
    
    let totalScore = 0;
    let totalWeight = 0;
    
    for (const [metric, weight] of Object.entries(weights)) {
      if (quality[metric] !== undefined) {
        totalScore += quality[metric] * weight;
        totalWeight += weight;
      }
    }
    
    return totalWeight > 0 ? totalScore / totalWeight : 0;
  }

  /**
   * 파이프라인 성능을 분석합니다
   * @param {Array<Object>} stages - 파이프라인 스테이지
   * @returns {Object} 파이프라인 성능 분석
   */
  analyzePipelinePerformance(stages) {
    const analysis = {
      total_stages: stages.length,
      total_duration: stages.reduce((sum, stage) => sum + stage.duration, 0),
      average_duration: 0,
      slowest_stage: null,
      fastest_stage: null,
      stage_breakdown: []
    };
    
    if (stages.length > 0) {
      analysis.average_duration = analysis.total_duration / stages.length;
      
      // 가장 느린/빠른 스테이지 찾기
      let slowest = stages[0];
      let fastest = stages[0];
      
      for (const stage of stages) {
        if (stage.duration > slowest.duration) slowest = stage;
        if (stage.duration < fastest.duration) fastest = stage;
      }
      
      analysis.slowest_stage = { name: slowest.name, duration: slowest.duration };
      analysis.fastest_stage = { name: fastest.name, duration: fastest.duration };
      
      // 스테이지별 세부 분석
      analysis.stage_breakdown = stages.map(stage => ({
        name: stage.name,
        duration: stage.duration,
        percentage: (stage.duration / analysis.total_duration) * 100,
        success: stage.success
      }));
    }
    
    return analysis;
  }

  /**
   * 벤치마크 분석을 수행합니다
   * @param {Object} metrics - 메트릭 데이터
   * @returns {Object} 벤치마크 분석
   */
  analyzeBenchmark(metrics) {
    const benchmark = {
      overall_grade: 'C',
      overall_score: 0,
      category_grades: {},
      recommendations: []
    };
    
    let totalScore = 0;
    let categoryCount = 0;
    
    // 각 카테고리별 벤치마크 분석
    for (const [category, categoryMetrics] of Object.entries(metrics)) {
      const categoryGrade = this.gradeCategoryMetrics(categoryMetrics);
      benchmark.category_grades[category] = categoryGrade;
      totalScore += categoryGrade.score;
      categoryCount++;
    }
    
    // 전체 점수 계산
    benchmark.overall_score = categoryCount > 0 ? totalScore / categoryCount : 0;
    benchmark.overall_grade = this.scoreToGrade(benchmark.overall_score);
    
    // 권장사항 생성
    benchmark.recommendations = this.generateRecommendations(metrics, benchmark);
    
    return benchmark;
  }

  /**
   * 카테고리 메트릭을 평가합니다
   * @param {Object} categoryMetrics - 카테고리 메트릭
   * @returns {Object} 카테고리 평가
   */
  gradeCategoryMetrics(categoryMetrics) {
    const grade = {
      score: 0,
      grade: 'F',
      details: {}
    };
    
    let totalScore = 0;
    let metricCount = 0;
    
    for (const [metric, value] of Object.entries(categoryMetrics)) {
      if (typeof value === 'number' && this.benchmarkThresholds[metric]) {
        const metricGrade = this.gradeMetric(metric, value);
        grade.details[metric] = metricGrade;
        totalScore += metricGrade.score;
        metricCount++;
      }
    }
    
    if (metricCount > 0) {
      grade.score = totalScore / metricCount;
      grade.grade = this.scoreToGrade(grade.score);
    }
    
    return grade;
  }

  /**
   * 개별 메트릭을 평가합니다
   * @param {string} metric - 메트릭 이름
   * @param {number} value - 메트릭 값
   * @returns {Object} 메트릭 평가
   */
  gradeMetric(metric, value) {
    const thresholds = this.benchmarkThresholds[metric];
    if (!thresholds) return { score: 50, grade: 'C' };
    
    let score = 0;
    
    if (value >= thresholds.excellent) {
      score = 90;
    } else if (value >= thresholds.good) {
      score = 80;
    } else if (value >= thresholds.acceptable) {
      score = 70;
    } else if (value >= thresholds.poor) {
      score = 60;
    } else {
      score = 40;
    }
    
    return {
      score,
      grade: this.scoreToGrade(score),
      value,
      threshold: thresholds
    };
  }

  /**
   * 점수를 등급으로 변환합니다
   * @param {number} score - 점수 (0-100)
   * @returns {string} 등급 (A-F)
   */
  scoreToGrade(score) {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  /**
   * 분석 결과를 생성합니다
   * @param {Object} metrics - 메트릭 데이터
   * @param {Object} benchmark - 벤치마크 분석
   * @returns {Object} 분석 결과
   */
  generateAnalysis(metrics, benchmark) {
    return {
      summary: this.generateSummary(metrics),
      strengths: this.identifyStrengths(metrics, benchmark),
      weaknesses: this.identifyWeaknesses(metrics, benchmark),
      recommendations: this.generateRecommendations(metrics, benchmark),
      trend_analysis: this.analyzeTrends(),
      comparative_analysis: this.generateComparativeAnalysis(metrics)
    };
  }

  /**
   * 요약을 생성합니다
   * @param {Object} metrics - 메트릭 데이터
   * @returns {string} 요약
   */
  generateSummary(metrics) {
    const compressionRatio = metrics.compression?.token_reduction_percentage || 0;
    const informationPreservation = metrics.compression?.information_preservation || 0;
    const processingTime = metrics.performance?.compression_time || 0;
    
    return `압축률 ${compressionRatio.toFixed(1)}%로 ${informationPreservation.toFixed(1)}%의 정보를 보존하며 ${processingTime}ms 내에 처리되었습니다.`;
  }

  /**
   * 강점을 식별합니다
   * @param {Object} metrics - 메트릭 데이터
   * @param {Object} benchmark - 벤치마크 분석
   * @returns {Array<string>} 강점 목록
   */
  identifyStrengths(metrics, benchmark) {
    const strengths = [];
    
    for (const [category, grade] of Object.entries(benchmark.category_grades)) {
      if (grade.score >= 80) {
        strengths.push(`${category} 카테고리에서 우수한 성능을 보였습니다 (${grade.grade}등급)`);
      }
    }
    
    return strengths;
  }

  /**
   * 약점을 식별합니다
   * @param {Object} metrics - 메트릭 데이터
   * @param {Object} benchmark - 벤치마크 분석
   * @returns {Array<string>} 약점 목록
   */
  identifyWeaknesses(metrics, benchmark) {
    const weaknesses = [];
    
    for (const [category, grade] of Object.entries(benchmark.category_grades)) {
      if (grade.score < 60) {
        weaknesses.push(`${category} 카테고리에서 개선이 필요합니다 (${grade.grade}등급)`);
      }
    }
    
    return weaknesses;
  }

  /**
   * 권장사항을 생성합니다
   * @param {Object} metrics - 메트릭 데이터
   * @param {Object} benchmark - 벤치마크 분석
   * @returns {Array<string>} 권장사항 목록
   */
  generateRecommendations(metrics, benchmark) {
    const recommendations = [];
    
    // 압축률 기반 권장사항
    const compressionRatio = metrics.compression?.token_reduction_percentage || 0;
    if (compressionRatio < 30) {
      recommendations.push('압축률을 높이기 위해 더 적극적인 압축 전략을 고려하세요.');
    } else if (compressionRatio > 80) {
      recommendations.push('압축률이 너무 높습니다. 정보 손실을 방지하기 위해 덜 적극적인 압축을 고려하세요.');
    }
    
    // 성능 기반 권장사항
    const processingTime = metrics.performance?.compression_time || 0;
    if (processingTime > 5000) {
      recommendations.push('처리 시간이 오래 걸립니다. 성능 최적화를 고려하세요.');
    }
    
    // 품질 기반 권장사항
    const informationPreservation = metrics.compression?.information_preservation || 0;
    if (informationPreservation < 70) {
      recommendations.push('정보 보존률이 낮습니다. 중요한 정보를 더 잘 보존하는 방법을 고려하세요.');
    }
    
    return recommendations;
  }

  /**
   * 트렌드를 분석합니다
   * @returns {Object} 트렌드 분석
   */
  analyzeTrends() {
    if (this.measurementHistory.length < 2) {
      return { message: '트렌드 분석을 위한 충분한 데이터가 없습니다.' };
    }
    
    const recent = this.measurementHistory.slice(-5);
    const trends = {};
    
    // 압축률 트렌드
    const compressionRatios = recent.map(m => m.metrics.compression?.token_reduction_percentage || 0);
    trends.compression_ratio = this.calculateTrend(compressionRatios);
    
    // 처리 시간 트렌드
    const processingTimes = recent.map(m => m.metrics.performance?.compression_time || 0);
    trends.processing_time = this.calculateTrend(processingTimes);
    
    // 품질 트렌드
    const qualityScores = recent.map(m => m.metrics.quality?.overall_quality || 0);
    trends.quality = this.calculateTrend(qualityScores);
    
    return trends;
  }

  /**
   * 트렌드를 계산합니다
   * @param {Array<number>} values - 값 배열
   * @returns {Object} 트렌드 정보
   */
  calculateTrend(values) {
    if (values.length < 2) return { trend: 'stable', change: 0 };
    
    const first = values[0];
    const last = values[values.length - 1];
    const change = ((last - first) / first) * 100;
    
    let trend = 'stable';
    if (change > 5) trend = 'increasing';
    else if (change < -5) trend = 'decreasing';
    
    return { trend, change: change.toFixed(1) };
  }

  /**
   * 비교 분석을 생성합니다
   * @param {Object} metrics - 메트릭 데이터
   * @returns {Object} 비교 분석
   */
  generateComparativeAnalysis(metrics) {
    const analysis = {
      vs_previous: null,
      vs_average: null,
      vs_best: null
    };
    
    if (this.measurementHistory.length > 1) {
      const current = metrics;
      const previous = this.measurementHistory[this.measurementHistory.length - 2].metrics;
      
      analysis.vs_previous = {
        compression_ratio_change: this.calculateChange(
          previous.compression?.token_reduction_percentage || 0,
          current.compression?.token_reduction_percentage || 0
        ),
        quality_change: this.calculateChange(
          previous.quality?.overall_quality || 0,
          current.quality?.overall_quality || 0
        ),
        performance_change: this.calculateChange(
          previous.performance?.compression_time || 0,
          current.performance?.compression_time || 0
        )
      };
    }
    
    return analysis;
  }

  /**
   * 변화량을 계산합니다
   * @param {number} previous - 이전 값
   * @param {number} current - 현재 값
   * @returns {Object} 변화량 정보
   */
  calculateChange(previous, current) {
    const change = current - previous;
    const changePercentage = previous > 0 ? (change / previous) * 100 : 0;
    
    return {
      absolute: change,
      percentage: changePercentage.toFixed(1),
      direction: change > 0 ? 'increase' : change < 0 ? 'decrease' : 'stable'
    };
  }

  /**
   * 측정 ID를 생성합니다
   * @returns {string} 측정 ID
   */
  generateMeasurementId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `metric_${timestamp}_${random}`;
  }

  /**
   * 측정 결과를 내보냅니다
   * @param {string} measurementId - 측정 ID
   * @param {string} format - 내보내기 형식 ('json', 'csv', 'report')
   * @returns {string} 내보내기 결과
   */
  exportMeasurement(measurementId, format = 'json') {
    const measurement = this.measurements.get(measurementId);
    if (!measurement) {
      throw new Error(`측정 결과를 찾을 수 없습니다: ${measurementId}`);
    }
    
    switch (format) {
      case 'json':
        return JSON.stringify(measurement, null, 2);
      case 'csv':
        return this.convertToCSV(measurement);
      case 'report':
        return this.generateReport(measurement);
      default:
        throw new Error(`지원되지 않는 형식: ${format}`);
    }
  }

  /**
   * CSV 형식으로 변환합니다
   * @param {Object} measurement - 측정 결과
   * @returns {string} CSV 문자열
   */
  convertToCSV(measurement) {
    // 플랫한 구조로 변환
    const flatData = this.flattenObject(measurement.metrics);
    
    const headers = Object.keys(flatData);
    const values = Object.values(flatData);
    
    return [headers.join(','), values.join(',')].join('\n');
  }

  /**
   * 객체를 평면화합니다
   * @param {Object} obj - 객체
   * @param {string} prefix - 접두사
   * @returns {Object} 평면화된 객체
   */
  flattenObject(obj, prefix = '') {
    const flattened = {};
    
    for (const [key, value] of Object.entries(obj)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        Object.assign(flattened, this.flattenObject(value, newKey));
      } else {
        flattened[newKey] = value;
      }
    }
    
    return flattened;
  }

  /**
   * 보고서를 생성합니다
   * @param {Object} measurement - 측정 결과
   * @returns {string} 보고서
   */
  generateReport(measurement) {
    const report = [];
    
    report.push('# 압축 성능 보고서');
    report.push(`측정 ID: ${measurement.id}`);
    report.push(`측정 시간: ${new Date(measurement.timestamp).toLocaleString()}`);
    report.push('');
    
    // 요약
    report.push('## 요약');
    report.push(measurement.analysis.summary);
    report.push('');
    
    // 벤치마크 결과
    report.push('## 벤치마크 결과');
    report.push(`전체 등급: ${measurement.benchmark.overall_grade} (${measurement.benchmark.overall_score.toFixed(1)}점)`);
    report.push('');
    
    // 강점과 약점
    if (measurement.analysis.strengths.length > 0) {
      report.push('## 강점');
      measurement.analysis.strengths.forEach(strength => {
        report.push(`- ${strength}`);
      });
      report.push('');
    }
    
    if (measurement.analysis.weaknesses.length > 0) {
      report.push('## 약점');
      measurement.analysis.weaknesses.forEach(weakness => {
        report.push(`- ${weakness}`);
      });
      report.push('');
    }
    
    // 권장사항
    if (measurement.analysis.recommendations.length > 0) {
      report.push('## 권장사항');
      measurement.analysis.recommendations.forEach(rec => {
        report.push(`- ${rec}`);
      });
      report.push('');
    }
    
    return report.join('\n');
  }

  /**
   * 리소스를 정리합니다
   */
  cleanup() {
    if (this.tokenCounter) {
      this.tokenCounter.cleanup();
    }
    this.measurements.clear();
    this.benchmarks.clear();
    this.measurementHistory.length = 0;
  }
}

export default CompressionMetrics;