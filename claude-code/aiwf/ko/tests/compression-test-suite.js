import { ContextCompressor } from '../utils/context-compressor.js';
import { CompressionMetrics } from '../utils/compression-metrics.js';
import { TokenCounter } from '../utils/token-counter.js';
import fs from 'fs';
import path from 'path';

/**
 * 압축 알고리즘 테스트 스위트
 */
export class CompressionTestSuite {
  constructor() {
    this.compressor = new ContextCompressor();
    this.metrics = new CompressionMetrics();
    this.tokenCounter = new TokenCounter();
    this.testResults = [];
    this.initializeTestSuite();
  }

  /**
   * 테스트 스위트를 초기화합니다
   */
  initializeTestSuite() {
    // 테스트 카테고리 정의
    this.testCategories = {
      task_documents: {
        name: '태스크 문서',
        description: '태스크 파일 및 프로젝트 문서',
        files: [
          'task_files',
          'sprint_metadata',
          'project_manifest',
          'requirement_docs'
        ]
      },
      code_documentation: {
        name: '코드 문서',
        description: '코드 주석 및 API 문서',
        files: [
          'api_docs',
          'code_comments',
          'readme_files',
          'technical_specs'
        ]
      },
      meeting_notes: {
        name: '회의록',
        description: '회의 기록 및 논의 사항',
        files: [
          'meeting_minutes',
          'decision_records',
          'brainstorming_notes'
        ]
      },
      mixed_content: {
        name: '혼합 콘텐츠',
        description: '다양한 형태가 혼합된 콘텐츠',
        files: [
          'mixed_markdown',
          'structured_data',
          'multi_language'
        ]
      }
    };

    // 테스트 시나리오 정의
    this.testScenarios = {
      basic_compression: {
        name: '기본 압축',
        description: '기본 압축 기능 테스트',
        strategies: ['minimal', 'balanced', 'aggressive']
      },
      target_ratio: {
        name: '목표 압축률',
        description: '특정 압축률 달성 테스트',
        targets: [0.3, 0.5, 0.7]
      },
      token_limit: {
        name: '토큰 제한',
        description: '토큰 수 제한 테스트',
        limits: [1000, 2000, 5000]
      },
      quality_preservation: {
        name: '품질 보존',
        description: '정보 품질 보존 테스트',
        quality_thresholds: [0.7, 0.8, 0.9]
      },
      performance_benchmark: {
        name: '성능 벤치마크',
        description: '처리 성능 측정 테스트',
        content_sizes: ['small', 'medium', 'large']
      }
    };

    // 테스트 데이터 생성
    this.generateTestData();
  }

  /**
   * 테스트 데이터를 생성합니다
   */
  generateTestData() {
    this.testData = {
      task_files: {
        simple_task: this.generateSimpleTaskContent(),
        complex_task: this.generateComplexTaskContent(),
        korean_task: this.generateKoreanTaskContent()
      },
      sprint_metadata: {
        sprint_meta: this.generateSprintMetadata(),
        milestone_data: this.generateMilestoneData()
      },
      project_manifest: {
        project_manifest: this.generateProjectManifest()
      },
      requirement_docs: {
        prd_document: this.generatePRDDocument(),
        technical_specs: this.generateTechnicalSpecs()
      },
      api_docs: {
        api_reference: this.generateAPIReference(),
        code_examples: this.generateCodeExamples()
      },
      readme_files: {
        project_readme: this.generateProjectReadme(),
        installation_guide: this.generateInstallationGuide()
      },
      meeting_minutes: {
        team_meeting: this.generateTeamMeetingNotes(),
        design_review: this.generateDesignReviewNotes()
      },
      mixed_content: {
        mixed_markdown: this.generateMixedMarkdown(),
        structured_data: this.generateStructuredData()
      }
    };
  }

  /**
   * 전체 테스트 스위트를 실행합니다
   * @param {Object} options - 테스트 옵션
   * @returns {Object} 테스트 결과
   */
  async runFullTestSuite(options = {}) {
    const {
      categories = Object.keys(this.testCategories),
      scenarios = Object.keys(this.testScenarios),
      generateReport = true
    } = options;

    console.log('압축 알고리즘 테스트 스위트 시작...');
    const startTime = Date.now();

    this.testResults = [];

    // 카테고리별 테스트 실행
    for (const category of categories) {
      console.log(`\n=== ${this.testCategories[category].name} 테스트 시작 ===`);
      
      for (const scenario of scenarios) {
        await this.runCategoryScenarioTest(category, scenario);
      }
    }

    // 성능 벤치마크 테스트
    await this.runPerformanceBenchmark();

    // 스트레스 테스트
    await this.runStressTest();

    const totalTime = Date.now() - startTime;
    console.log(`\n테스트 완료. 총 소요시간: ${totalTime}ms`);

    // 결과 분석
    const analysis = this.analyzeTestResults();

    const results = {
      summary: {
        total_tests: this.testResults.length,
        passed: this.testResults.filter(r => r.success).length,
        failed: this.testResults.filter(r => !r.success).length,
        total_time: totalTime,
        average_time: totalTime / this.testResults.length
      },
      results: this.testResults,
      analysis,
      timestamp: new Date().toISOString()
    };

    // 보고서 생성
    if (generateReport) {
      const report = this.generateTestReport(results);
      await this.saveTestReport(report);
    }

    return results;
  }

  /**
   * 카테고리별 시나리오 테스트를 실행합니다
   * @param {string} category - 테스트 카테고리
   * @param {string} scenario - 테스트 시나리오
   */
  async runCategoryScenarioTest(category, scenario) {
    const categoryData = this.testCategories[category];
    const scenarioData = this.testScenarios[scenario];

    console.log(`  ${scenarioData.name} 테스트 실행 중...`);

    // 카테고리의 각 파일 타입에 대해 테스트
    for (const fileType of categoryData.files) {
      const testFiles = this.testData[fileType];
      
      if (!testFiles) continue;

      for (const [fileName, content] of Object.entries(testFiles)) {
        await this.runSingleTest({
          category,
          scenario,
          fileType,
          fileName,
          content,
          categoryData,
          scenarioData
        });
      }
    }
  }

  /**
   * 단일 테스트를 실행합니다
   * @param {Object} testConfig - 테스트 구성
   */
  async runSingleTest(testConfig) {
    const { category, scenario, fileType, fileName, content, scenarioData } = testConfig;
    
    const testId = `${category}_${scenario}_${fileType}_${fileName}`;
    const startTime = Date.now();

    try {
      let testResult = null;

      // 시나리오별 테스트 실행
      switch (scenario) {
        case 'basic_compression':
          testResult = await this.runBasicCompressionTest(content, scenarioData);
          break;
        case 'target_ratio':
          testResult = await this.runTargetRatioTest(content, scenarioData);
          break;
        case 'token_limit':
          testResult = await this.runTokenLimitTest(content, scenarioData);
          break;
        case 'quality_preservation':
          testResult = await this.runQualityPreservationTest(content, scenarioData);
          break;
        case 'performance_benchmark':
          testResult = await this.runPerformanceTest(content, scenarioData);
          break;
        default:
          throw new Error(`알 수 없는 시나리오: ${scenario}`);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // 메트릭 측정
      const metrics = this.metrics.measureCompression(
        content,
        testResult.compressed,
        { ...testResult.metadata, processingTime: duration }
      );

      this.testResults.push({
        id: testId,
        category,
        scenario,
        fileType,
        fileName,
        success: true,
        duration,
        compression: testResult,
        metrics: metrics.metrics,
        benchmark: metrics.benchmark,
        timestamp: new Date().toISOString()
      });

      console.log(`    ✓ ${testId} (${duration}ms)`);

    } catch (error) {
      console.error(`    ✗ ${testId} - 오류: ${error.message}`);
      
      this.testResults.push({
        id: testId,
        category,
        scenario,
        fileType,
        fileName,
        success: false,
        duration: Date.now() - startTime,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * 기본 압축 테스트를 실행합니다
   * @param {string} content - 테스트 콘텐츠
   * @param {Object} scenarioData - 시나리오 데이터
   * @returns {Object} 테스트 결과
   */
  async runBasicCompressionTest(content, scenarioData) {
    const results = [];

    for (const strategy of scenarioData.strategies) {
      this.compressor.setMode(strategy);
      const result = await this.compressor.compress(content);
      results.push({
        strategy,
        ...result
      });
    }

    return {
      test_type: 'basic_compression',
      results,
      compressed: results[0].compressed, // 첫 번째 결과를 대표로 사용
      metadata: { strategies_tested: scenarioData.strategies }
    };
  }

  /**
   * 목표 압축률 테스트를 실행합니다
   * @param {string} content - 테스트 콘텐츠
   * @param {Object} scenarioData - 시나리오 데이터
   * @returns {Object} 테스트 결과
   */
  async runTargetRatioTest(content, scenarioData) {
    const results = [];

    for (const targetRatio of scenarioData.targets) {
      const result = await this.compressor.compress(content, {
        targetRatio,
        enableSummarization: true
      });
      
      results.push({
        target_ratio: targetRatio,
        actual_ratio: result.compressionRatio,
        difference: Math.abs(targetRatio * 100 - result.compressionRatio),
        ...result
      });
    }

    return {
      test_type: 'target_ratio',
      results,
      compressed: results[0].compressed,
      metadata: { targets_tested: scenarioData.targets }
    };
  }

  /**
   * 토큰 제한 테스트를 실행합니다
   * @param {string} content - 테스트 콘텐츠
   * @param {Object} scenarioData - 시나리오 데이터
   * @returns {Object} 테스트 결과
   */
  async runTokenLimitTest(content, scenarioData) {
    const results = [];

    for (const limit of scenarioData.limits) {
      const result = await this.compressor.compress(content, {
        maxTokens: limit,
        enableFiltering: true
      });
      
      results.push({
        token_limit: limit,
        actual_tokens: result.compressedTokens,
        within_limit: result.compressedTokens <= limit,
        ...result
      });
    }

    return {
      test_type: 'token_limit',
      results,
      compressed: results[0].compressed,
      metadata: { limits_tested: scenarioData.limits }
    };
  }

  /**
   * 품질 보존 테스트를 실행합니다
   * @param {string} content - 테스트 콘텐츠
   * @param {Object} scenarioData - 시나리오 데이터
   * @returns {Object} 테스트 결과
   */
  async runQualityPreservationTest(content, scenarioData) {
    const results = [];

    for (const threshold of scenarioData.quality_thresholds) {
      const result = await this.compressor.compress(content, {
        preserveStructure: true,
        enableFiltering: true,
        customFilters: {
          preserve: {
            importance: threshold >= 0.9 ? ['critical', 'high'] : ['critical']
          }
        }
      });
      
      // 품질 점수 계산
      const qualityScore = this.calculateQualityScore(content, result.compressed);
      
      results.push({
        quality_threshold: threshold,
        actual_quality: qualityScore,
        meets_threshold: qualityScore >= threshold,
        ...result
      });
    }

    return {
      test_type: 'quality_preservation',
      results,
      compressed: results[0].compressed,
      metadata: { thresholds_tested: scenarioData.quality_thresholds }
    };
  }

  /**
   * 성능 테스트를 실행합니다
   * @param {string} content - 테스트 콘텐츠
   * @param {Object} scenarioData - 시나리오 데이터
   * @returns {Object} 테스트 결과
   */
  async runPerformanceTest(content, scenarioData) {
    const results = [];

    // 다양한 크기의 콘텐츠로 테스트
    for (const size of scenarioData.content_sizes) {
      const testContent = this.generateContentBySize(content, size);
      const iterations = size === 'large' ? 1 : size === 'medium' ? 3 : 5;
      
      const iterationResults = [];
      
      for (let i = 0; i < iterations; i++) {
        const startTime = Date.now();
        const result = await this.compressor.compress(testContent);
        const endTime = Date.now();
        
        iterationResults.push({
          iteration: i + 1,
          processing_time: endTime - startTime,
          tokens_per_second: result.originalTokens / ((endTime - startTime) / 1000),
          ...result
        });
      }
      
      results.push({
        content_size: size,
        iterations,
        results: iterationResults,
        average_time: iterationResults.reduce((sum, r) => sum + r.processing_time, 0) / iterations,
        average_tokens_per_second: iterationResults.reduce((sum, r) => sum + r.tokens_per_second, 0) / iterations
      });
    }

    return {
      test_type: 'performance_benchmark',
      results,
      compressed: results[0].results[0].compressed,
      metadata: { sizes_tested: scenarioData.content_sizes }
    };
  }

  /**
   * 성능 벤치마크를 실행합니다
   */
  async runPerformanceBenchmark() {
    console.log('\n=== 성능 벤치마크 테스트 시작 ===');
    
    const benchmarkData = {
      small: this.generateContentBySize('', 'small'),
      medium: this.generateContentBySize('', 'medium'),
      large: this.generateContentBySize('', 'large')
    };

    for (const [size, content] of Object.entries(benchmarkData)) {
      const startTime = Date.now();
      
      try {
        const result = await this.compressor.compress(content);
        const endTime = Date.now();
        
        console.log(`  ${size} 콘텐츠 처리 완료 (${endTime - startTime}ms)`);
        
        this.testResults.push({
          id: `performance_benchmark_${size}`,
          category: 'performance',
          scenario: 'benchmark',
          fileType: 'generated',
          fileName: size,
          success: true,
          duration: endTime - startTime,
          compression: result,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error(`  ${size} 콘텐츠 처리 실패: ${error.message}`);
      }
    }
  }

  /**
   * 스트레스 테스트를 실행합니다
   */
  async runStressTest() {
    console.log('\n=== 스트레스 테스트 시작 ===');
    
    const stressContent = this.generateContentBySize('', 'xlarge');
    const strategies = ['minimal', 'balanced', 'aggressive'];
    
    for (const strategy of strategies) {
      console.log(`  ${strategy} 전략 스트레스 테스트 중...`);
      
      const startTime = Date.now();
      
      try {
        this.compressor.setMode(strategy);
        const result = await this.compressor.compress(stressContent);
        const endTime = Date.now();
        
        console.log(`    완료 (${endTime - startTime}ms)`);
        
        this.testResults.push({
          id: `stress_test_${strategy}`,
          category: 'stress',
          scenario: 'stress',
          fileType: 'generated',
          fileName: 'xlarge',
          success: true,
          duration: endTime - startTime,
          compression: result,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error(`    실패: ${error.message}`);
        
        this.testResults.push({
          id: `stress_test_${strategy}`,
          category: 'stress',
          scenario: 'stress',
          fileType: 'generated',
          fileName: 'xlarge',
          success: false,
          duration: Date.now() - startTime,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  /**
   * 테스트 결과를 분석합니다
   * @returns {Object} 분석 결과
   */
  analyzeTestResults() {
    const analysis = {
      overall_success_rate: 0,
      average_compression_ratio: 0,
      average_processing_time: 0,
      performance_by_category: {},
      performance_by_scenario: {},
      best_performing_strategy: null,
      recommendations: []
    };

    const successfulTests = this.testResults.filter(r => r.success);
    
    // 전체 성공률
    analysis.overall_success_rate = (successfulTests.length / this.testResults.length) * 100;

    // 평균 압축률
    const compressionRatios = successfulTests
      .filter(r => r.compression && r.compression.compressionRatio)
      .map(r => r.compression.compressionRatio);
    
    analysis.average_compression_ratio = compressionRatios.length > 0 
      ? compressionRatios.reduce((sum, ratio) => sum + ratio, 0) / compressionRatios.length 
      : 0;

    // 평균 처리 시간
    const processingTimes = successfulTests.map(r => r.duration);
    analysis.average_processing_time = processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length;

    // 카테고리별 성능 분석
    const categories = [...new Set(successfulTests.map(r => r.category))];
    for (const category of categories) {
      const categoryTests = successfulTests.filter(r => r.category === category);
      analysis.performance_by_category[category] = this.analyzeTestGroup(categoryTests);
    }

    // 시나리오별 성능 분석
    const scenarios = [...new Set(successfulTests.map(r => r.scenario))];
    for (const scenario of scenarios) {
      const scenarioTests = successfulTests.filter(r => r.scenario === scenario);
      analysis.performance_by_scenario[scenario] = this.analyzeTestGroup(scenarioTests);
    }

    // 최고 성능 전략 식별
    analysis.best_performing_strategy = this.identifyBestStrategy(successfulTests);

    // 권장사항 생성
    analysis.recommendations = this.generateTestRecommendations(analysis);

    return analysis;
  }

  /**
   * 테스트 그룹을 분석합니다
   * @param {Array} tests - 테스트 배열
   * @returns {Object} 그룹 분석 결과
   */
  analyzeTestGroup(tests) {
    const compressionRatios = tests
      .filter(t => t.compression && t.compression.compressionRatio)
      .map(t => t.compression.compressionRatio);
    
    const processingTimes = tests.map(t => t.duration);
    
    return {
      test_count: tests.length,
      success_rate: (tests.filter(t => t.success).length / tests.length) * 100,
      average_compression_ratio: compressionRatios.length > 0 
        ? compressionRatios.reduce((sum, ratio) => sum + ratio, 0) / compressionRatios.length 
        : 0,
      average_processing_time: processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length,
      min_processing_time: Math.min(...processingTimes),
      max_processing_time: Math.max(...processingTimes)
    };
  }

  /**
   * 최고 성능 전략을 식별합니다
   * @param {Array} tests - 성공한 테스트 배열
   * @returns {Object} 최고 성능 전략
   */
  identifyBestStrategy(tests) {
    const strategies = ['minimal', 'balanced', 'aggressive'];
    const strategyPerformance = {};

    for (const strategy of strategies) {
      const strategyTests = tests.filter(t => 
        t.compression && t.compression.strategy === strategy
      );
      
      if (strategyTests.length > 0) {
        strategyPerformance[strategy] = this.analyzeTestGroup(strategyTests);
      }
    }

    // 압축률과 처리 시간을 고려한 종합 점수 계산
    let bestStrategy = null;
    let bestScore = -1;

    for (const [strategy, performance] of Object.entries(strategyPerformance)) {
      const score = (performance.average_compression_ratio * 0.7) + 
                   ((10000 - performance.average_processing_time) / 10000 * 100 * 0.3);
      
      if (score > bestScore) {
        bestScore = score;
        bestStrategy = strategy;
      }
    }

    return {
      strategy: bestStrategy,
      score: bestScore,
      performance: strategyPerformance[bestStrategy]
    };
  }

  /**
   * 테스트 권장사항을 생성합니다
   * @param {Object} analysis - 분석 결과
   * @returns {Array} 권장사항 배열
   */
  generateTestRecommendations(analysis) {
    const recommendations = [];

    // 성공률 기반 권장사항
    if (analysis.overall_success_rate < 90) {
      recommendations.push('전체 테스트 성공률이 낮습니다. 오류 처리를 개선하세요.');
    }

    // 압축률 기반 권장사항
    if (analysis.average_compression_ratio < 30) {
      recommendations.push('평균 압축률이 낮습니다. 더 적극적인 압축 전략을 고려하세요.');
    } else if (analysis.average_compression_ratio > 80) {
      recommendations.push('평균 압축률이 너무 높습니다. 정보 손실을 방지하기 위해 압축률을 낮추세요.');
    }

    // 성능 기반 권장사항
    if (analysis.average_processing_time > 5000) {
      recommendations.push('평균 처리 시간이 오래 걸립니다. 성능 최적화를 고려하세요.');
    }

    // 최고 성능 전략 권장사항
    if (analysis.best_performing_strategy) {
      recommendations.push(`${analysis.best_performing_strategy.strategy} 전략이 가장 좋은 성능을 보였습니다.`);
    }

    return recommendations;
  }

  /**
   * 품질 점수를 계산합니다
   * @param {string} original - 원본 콘텐츠
   * @param {string} compressed - 압축된 콘텐츠
   * @returns {number} 품질 점수 (0-1)
   */
  calculateQualityScore(original, compressed) {
    // 단순한 품질 점수 계산 (실제로는 더 복잡한 로직 필요)
    const originalWords = new Set(original.toLowerCase().split(/\s+/));
    const compressedWords = new Set(compressed.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...originalWords].filter(word => compressedWords.has(word)));
    return intersection.size / originalWords.size;
  }

  /**
   * 크기별 콘텐츠를 생성합니다
   * @param {string} baseContent - 기본 콘텐츠
   * @param {string} size - 크기 ('small', 'medium', 'large', 'xlarge')
   * @returns {string} 생성된 콘텐츠
   */
  generateContentBySize(baseContent, size) {
    const multipliers = {
      small: 1,
      medium: 5,
      large: 20,
      xlarge: 50
    };

    const multiplier = multipliers[size] || 1;
    const content = baseContent || this.generateComplexTaskContent();
    
    return Array(multiplier).fill(content).join('\n\n');
  }

  // 테스트 데이터 생성 메서드들
  generateSimpleTaskContent() {
    return `# Simple Task

## Description
This is a simple task for testing compression.

## Goal
Test basic compression functionality.

## Subtasks
- [ ] Task 1
- [ ] Task 2
- [x] Task 3

## Notes
Basic notes for testing.`;
  }

  generateComplexTaskContent() {
    return `---
task_id: T01_S01
sprint_sequence_id: S01
status: in_progress
complexity: High
last_updated: 2025-07-09T02:00:00Z
github_issue: 
---

# Task: 복잡한 압축 알고리즘 구현

## Description
이 태스크는 복잡한 압축 알고리즘을 구현하고 테스트하는 것을 목표로 합니다. 다양한 압축 전략을 구현하고, 성능을 측정하며, 품질을 검증해야 합니다.

## Goal / Objectives
- 3가지 압축 전략 구현 (Aggressive, Balanced, Minimal)
- 50% 이상의 압축률 달성
- 정보 손실 최소화
- 성능 최적화

## Acceptance Criteria
- [ ] 기본 압축 기능이 정상 작동함
- [ ] 압축률이 50% 이상 달성됨
- [ ] 중요 정보가 보존됨
- [ ] 성능 테스트 통과
- [ ] 품질 검증 완료

## Subtasks
- [ ] 압축 전략 설계
- [ ] 기본 압축 알고리즘 구현
- [ ] 성능 최적화
- [ ] 테스트 케이스 작성
- [ ] 품질 검증
- [ ] 문서화

## Technical Details
### 구현 방법
1. 텍스트 분석 및 분류
2. 중요도 기반 필터링
3. 압축 알고리즘 적용
4. 검증 및 최적화

### 성능 목표
- 처리 시간: 3초 이내
- 메모리 사용량: 100MB 이하
- 압축률: 50% 이상

## Output Log
[2025-07-09 02:00]: 태스크 시작
[2025-07-09 02:15]: 압축 전략 설계 완료
[2025-07-09 02:30]: 기본 알고리즘 구현 완료`;
  }

  generateKoreanTaskContent() {
    return `# 한국어 태스크 테스트

## 설명
한국어 콘텐츠 압축 기능을 테스트합니다.

## 목표
- 한국어 텍스트 압축 성능 검증
- 한국어 키워드 보존 확인
- 언어별 특성 고려

## 하위 태스크
- [ ] 한국어 토큰화 구현
- [ ] 한국어 키워드 추출
- [ ] 언어별 압축 최적화

## 참고 사항
한국어는 교착어의 특성상 영어와 다른 압축 전략이 필요합니다.`;
  }

  generateSprintMetadata() {
    return `---
sprint_folder_name: S01_M02_test_sprint
sprint_sequence_id: S01
milestone_id: M02
title: 테스트 스프린트
status: in_progress
goal: 압축 알고리즘 테스트를 위한 스프린트
last_updated: 2025-07-09T02:00:00Z
---

# Sprint: 테스트 스프린트 (S01)

## Sprint Goal
압축 알고리즘의 다양한 기능을 테스트하고 검증합니다.

## Tasks
- T01: 기본 압축 테스트
- T02: 성능 테스트
- T03: 품질 테스트`;
  }

  generateMilestoneData() {
    return `# Milestone: M02 테스트 마일스톤

## 목표
압축 시스템의 모든 기능을 검증하고 품질을 보장합니다.

## 주요 기능
- 다양한 압축 전략
- 성능 측정 도구
- 품질 검증 시스템`;
  }

  generateProjectManifest() {
    return `# 프로젝트 매니페스트

**프로젝트명**: 압축 테스트 프로젝트
**생성일**: 2025-07-09
**현재 버전**: 1.0.0

## 현재 상태
- 활성 스프린트: S01
- 진행 중인 태스크: 3개
- 완료된 태스크: 0개

## 기술 스택
- JavaScript (ES6+)
- Node.js
- Jest (테스트)`;
  }

  generatePRDDocument() {
    return `# PRD: 압축 시스템

## 제품 개요
Context 압축 시스템은 다양한 텍스트 콘텐츠를 효율적으로 압축하는 도구입니다.

## 주요 기능
1. 다중 압축 전략 지원
2. 실시간 성능 측정
3. 품질 보존 메커니즘
4. 사용자 정의 필터

## 기술 요구사항
- 50% 이상 압축률
- 3초 이내 처리 시간
- 90% 이상 정보 보존율`;
  }

  generateTechnicalSpecs() {
    return `# 기술 명세서

## 아키텍처
- 파이프라인 기반 처리
- 플러그인 가능한 압축 전략
- 메트릭 수집 시스템

## API 설계
- compress(content, options)
- decompress(compressed, metadata)
- measurePerformance(content)

## 성능 지표
- 압축률: 토큰 기준 50% 이상
- 처리 속도: 1000토큰/초 이상
- 메모리 사용량: 100MB 이하`;
  }

  generateAPIReference() {
    return `# API 참조

## ContextCompressor

### compress(content, options)
콘텐츠를 압축합니다.

**Parameters:**
- content: string - 압축할 콘텐츠
- options: object - 압축 옵션

**Returns:**
- Promise<CompressionResult>

### decompress(compressed, metadata)
압축된 콘텐츠를 복원합니다.

**Parameters:**
- compressed: string - 압축된 콘텐츠
- metadata: object - 복원 메타데이터

**Returns:**
- Promise<DecompressionResult>`;
  }

  generateCodeExamples() {
    return `# 코드 예시

## 기본 사용법

\`\`\`javascript
const compressor = new ContextCompressor();
const result = await compressor.compress(content);
console.log('압축률:', result.compressionRatio);
\`\`\`

## 고급 사용법

\`\`\`javascript
const options = {
  strategy: 'aggressive',
  maxTokens: 2000,
  preserveStructure: true
};
const result = await compressor.compress(content, options);
\`\`\`

## 성능 측정

\`\`\`javascript
const metrics = new CompressionMetrics();
const measurement = metrics.measureCompression(original, compressed);
console.log('품질 점수:', measurement.metrics.quality.overall_quality);
\`\`\``;
  }

  generateProjectReadme() {
    return `# 압축 시스템 프로젝트

## 개요
이 프로젝트는 다양한 텍스트 콘텐츠를 효율적으로 압축하는 시스템을 구현합니다.

## 주요 기능
- 다중 압축 전략
- 실시간 성능 측정
- 품질 보존 메커니즘

## 설치 방법
\`\`\`bash
npm install compression-system
\`\`\`

## 사용 방법
\`\`\`javascript
const compressor = new ContextCompressor();
const result = await compressor.compress(content);
\`\`\`

## 라이선스
MIT`;
  }

  generateInstallationGuide() {
    return `# 설치 가이드

## 시스템 요구사항
- Node.js 14.0.0 이상
- npm 6.0.0 이상
- 메모리 1GB 이상

## 설치 단계
1. 저장소 클론
2. 의존성 설치
3. 환경 설정
4. 테스트 실행

## 설정 방법
환경 변수 설정:
- MAX_TOKENS=10000
- COMPRESSION_LEVEL=balanced
- ENABLE_METRICS=true

## 문제 해결
- 메모리 부족 오류: 힙 크기 늘리기
- 성능 저하: 압축 레벨 조정
- 품질 저하: 보존 임계값 조정`;
  }

  generateTeamMeetingNotes() {
    return `# 팀 미팅 노트

**날짜**: 2025-07-09
**참석자**: 개발팀 전체
**주제**: 압축 시스템 개발 현황

## 논의 사항
1. 현재 개발 진행 상황
2. 성능 최적화 방안
3. 품질 검증 프로세스
4. 다음 스프린트 계획

## 결정 사항
- 압축률 목표: 50% 이상
- 성능 목표: 3초 이내
- 품질 목표: 90% 이상 보존

## 액션 아이템
- [ ] 성능 벤치마크 구현
- [ ] 품질 메트릭 개선
- [ ] 문서화 완료`;
  }

  generateDesignReviewNotes() {
    return `# 설계 검토 노트

**날짜**: 2025-07-09
**리뷰어**: 시니어 개발자
**대상**: 압축 시스템 아키텍처

## 검토 항목
1. 시스템 아키텍처
2. 압축 알고리즘 설계
3. 성능 최적화 방안
4. 확장성 고려사항

## 피드백
- 파이프라인 구조 적절함
- 메트릭 수집 시스템 우수
- 플러그인 아키텍처 확장성 좋음

## 개선 사항
- 메모리 사용량 최적화 필요
- 오류 처리 강화 필요
- 더 많은 테스트 케이스 필요`;
  }

  generateMixedMarkdown() {
    return `# 혼합 마크다운 문서

## 텍스트 섹션
이 문서는 다양한 마크다운 요소를 포함합니다.

## 목록
- 항목 1
- 항목 2
  - 하위 항목 A
  - 하위 항목 B
- 항목 3

## 코드 블록
\`\`\`javascript
function compress(content) {
  return compressor.compress(content);
}
\`\`\`

## 테이블
| 항목 | 값 | 설명 |
|------|-----|------|
| 압축률 | 50% | 토큰 기준 |
| 처리시간 | 3초 | 평균 |
| 품질 | 90% | 정보 보존 |

## 링크
[압축 시스템 문서](https://example.com/docs)

## 이미지
![압축 결과](https://example.com/image.png)`;
  }

  generateStructuredData() {
    return `# 구조화된 데이터

## 메타데이터
- 생성일: 2025-07-09
- 버전: 1.0.0
- 작성자: 개발팀

## 설정 데이터
\`\`\`json
{
  "compression": {
    "strategy": "balanced",
    "targetRatio": 0.5,
    "maxTokens": 5000
  },
  "performance": {
    "timeout": 10000,
    "memoryLimit": 104857600
  }
}
\`\`\`

## 통계 데이터
- 총 테스트: 100개
- 성공률: 95%
- 평균 압축률: 52%
- 평균 처리시간: 1.2초`;
  }

  /**
   * 테스트 보고서를 생성합니다
   * @param {Object} results - 테스트 결과
   * @returns {string} 보고서
   */
  generateTestReport(results) {
    const report = [];
    
    report.push('# 압축 알고리즘 테스트 보고서');
    report.push(`생성일: ${new Date().toLocaleString()}`);
    report.push('');
    
    // 요약
    report.push('## 테스트 요약');
    report.push(`- 총 테스트: ${results.summary.total_tests}개`);
    report.push(`- 성공: ${results.summary.passed}개`);
    report.push(`- 실패: ${results.summary.failed}개`);
    report.push(`- 성공률: ${((results.summary.passed / results.summary.total_tests) * 100).toFixed(1)}%`);
    report.push(`- 총 소요시간: ${results.summary.total_time}ms`);
    report.push(`- 평균 처리시간: ${results.summary.average_time.toFixed(1)}ms`);
    report.push('');
    
    // 성능 분석
    report.push('## 성능 분석');
    report.push(`- 평균 압축률: ${results.analysis.average_compression_ratio.toFixed(1)}%`);
    report.push(`- 평균 처리시간: ${results.analysis.average_processing_time.toFixed(1)}ms`);
    report.push('');
    
    // 카테고리별 성능
    report.push('## 카테고리별 성능');
    Object.entries(results.analysis.performance_by_category).forEach(([category, performance]) => {
      report.push(`### ${category}`);
      report.push(`- 테스트 수: ${performance.test_count}개`);
      report.push(`- 성공률: ${performance.success_rate.toFixed(1)}%`);
      report.push(`- 평균 압축률: ${performance.average_compression_ratio.toFixed(1)}%`);
      report.push(`- 평균 처리시간: ${performance.average_processing_time.toFixed(1)}ms`);
      report.push('');
    });
    
    // 최고 성능 전략
    if (results.analysis.best_performing_strategy) {
      report.push('## 최고 성능 전략');
      report.push(`**${results.analysis.best_performing_strategy.strategy}** 전략이 최고 성능을 보였습니다.`);
      report.push(`- 종합 점수: ${results.analysis.best_performing_strategy.score.toFixed(1)}`);
      report.push('');
    }
    
    // 권장사항
    if (results.analysis.recommendations.length > 0) {
      report.push('## 권장사항');
      results.analysis.recommendations.forEach(rec => {
        report.push(`- ${rec}`);
      });
      report.push('');
    }
    
    return report.join('\n');
  }

  /**
   * 테스트 보고서를 저장합니다
   * @param {string} report - 보고서 내용
   */
  async saveTestReport(report) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `compression_test_report_${timestamp}.md`;
    const filepath = path.join(process.cwd(), 'test-reports', filename);
    
    try {
      // 디렉토리 생성
      const dir = path.dirname(filepath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // 보고서 저장
      fs.writeFileSync(filepath, report);
      console.log(`\n테스트 보고서가 저장되었습니다: ${filepath}`);
    } catch (error) {
      console.error('보고서 저장 중 오류 발생:', error);
    }
  }

  /**
   * 리소스를 정리합니다
   */
  cleanup() {
    if (this.compressor) this.compressor.cleanup();
    if (this.metrics) this.metrics.cleanup();
    if (this.tokenCounter) this.tokenCounter.cleanup();
    this.testResults.length = 0;
  }
}

export default CompressionTestSuite;