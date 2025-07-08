## 개요
AIWF의 토큰 사용량을 최적화하기 위한 Context 압축 시스템의 상세 설계 문서입니다. 이 시스템은 중요한 정보를 유지하면서 토큰 사용량을 50% 이상 줄이는 것을 목표로 합니다.

### 1.1 토큰 카운팅 메커니즘
```javascript
// 토큰 카운팅 인터페이스
class TokenCounter {
  constructor(model = 'gpt-4') {
   this.model = model;
   this.encoder = this.getEncoder(model);
  }

  // 텍스트의 토큰 수 계산
  countTokens(text) {
   return this.encoder.encode(text).length;
  }

  // 파일의 토큰 수 계산
  countFileTokens(filePath) {
   const content = fs.readFileSync(filePath, 'utf8');
   return this.countTokens(content);
  }

  // 디렉토리의 전체 토큰 수 계산
  countDirectoryTokens(dirPath) {
   const files = this.getMarkdownFiles(dirPath);
   return files.reduce((total, file) => {
   return total + this.countFileTokens(file);
   }, 0);
  }

  // 토큰 분포 분석
  analyzeTokenDistribution(content) {
   const sections = this.parseSections(content);
   return sections.map(section => ({
   name: section.name,
   tokens: this.countTokens(section.content),
   percentage: (this.countTokens(section.content) / this.countTokens(content)) * 100
   }));
  }
}
```

### 1.2 토큰 사용량 추적 시스템
// 토큰 사용량 추적 인터페이스
class TokenTracker {
  constructor() {
   this.usage = {
   total: 0,
   compressed: 0,
   saved: 0,
   ratio: 0
   };
  }

  // 압축 전후 토큰 수 기록
  trackCompression(originalTokens, compressedTokens) {
   this.usage.total = originalTokens;
   this.usage.compressed = compressedTokens;
   this.usage.saved = originalTokens - compressedTokens;
   this.usage.ratio = (this.usage.saved / originalTokens) * 100;
  }

  // 토큰 사용량 보고서 생성
  generateReport() {
   return {
   originalTokens: this.usage.total,
   compressedTokens: this.usage.compressed,
   savedTokens: this.usage.saved,
   compressionRatio: this.usage.ratio.toFixed(2) + '%',
   efficiency: this.usage.ratio >= 50 ? 'High' : 'Medium'
   };
  }
}
```

### 1.3 토큰 분석 대시보드
// 토큰 분석 대시보드
class TokenDashboard {
  constructor(projectPath) {
   this.projectPath = projectPath;
   this.counter = new TokenCounter();
   this.tracker = new TokenTracker();
  }

  // 프로젝트 토큰 분석
  analyzeProject() {
   const analysis = {
   totalTokens: 0,
   fileBreakdown: {},
   sectionBreakdown: {},
   compressionOpportunities: []
   };

   // 각 디렉토리별 토큰 수 분석
   const directories = [
   '.aiwf/01_PROJECT_DOCS',
   '.aiwf/02_REQUIREMENTS',
   '.aiwf/03_SPRINTS',
   '.aiwf/04_GENERAL_TASKS'
   ];

   directories.forEach(dir => {
   const tokens = this.counter.countDirectoryTokens(dir);
   analysis.fileBreakdown[dir] = tokens;
   analysis.totalTokens += tokens;
   });

   // 압축 기회 식별
   analysis.compressionOpportunities = this.identifyCompressionOpportunities();

   return analysis;
  }

  identifyCompressionOpportunities() {
   const opportunities = [];

   // 반복되는 콘텐츠 식별
   opportunities.push({
   type: 'repetitive_content',
   description: '반복되는 템플릿 내용',
   potential_savings: '20-30%'
   });

   // 장문의 설명 식별
   type: 'verbose_descriptions',
   description: '장문의 설명 및 예시',
   potential_savings: '15-25%'
   });

   // 오래된 로그 식별
   type: 'outdated_logs',
   description: '오래된 로그 및 히스토리',
   potential_savings: '10-20%'
   });

   return opportunities;
  }
}
```

### 2.1 압축 알고리즘 아키텍처
// Context 압축 알고리즘 클래스
class ContextCompressor {
  constructor(mode = 'balanced') {
   this.mode = mode;
   this.strategies = {
   aggressive: new AggressiveCompressionStrategy(),
   balanced: new BalancedCompressionStrategy(),
   minimal: new MinimalCompressionStrategy()
   };
  }

  // 메인 압축 메서드
  compress(content, options = {}) {
   const strategy = this.strategies[this.mode];
   const compressed = strategy.compress(content, options);

   original: content,
   compressed: compressed.content,
   metadata: compressed.metadata,
   compressionRatio: this.calculateRatio(content, compressed.content)
   };
  }

  // 압축률 계산
  calculateRatio(original, compressed) {
   const originalTokens = new TokenCounter().countTokens(original);
   const compressedTokens = new TokenCounter().countTokens(compressed);
   return ((originalTokens - compressedTokens) / originalTokens) * 100;
  }
}
```

### 2.2 압축 전략 인터페이스
// 압축 전략 기본 인터페이스
class CompressionStrategy {
  compress(content, options) {
   throw new Error('compress method must be implemented');
  }

  decompress(compressed, metadata) {
   throw new Error('decompress method must be implemented');
  }
}

// 적극적 압축 전략 (50-70% 압축)
class AggressiveCompressionStrategy extends CompressionStrategy {
   let compressed = content;

   // 1. 반복 콘텐츠 제거
   compressed = this.removeRepetitiveContent(compressed);

   // 2. 상세 설명 요약
   compressed = this.summarizeDescriptions(compressed);

   // 3. 오래된 로그 제거
   compressed = this.removeOldLogs(compressed);

   // 4. 중요도 기반 필터링
   compressed = this.filterByImportance(compressed, 'high');

   content: compressed,
   metadata: {
   strategy: 'aggressive',
   removedSections: this.getRemovedSections(),
   compressionLevel: 'high'
   }
   };
  }
}

// 균형 압축 전략 (30-50% 압축)
class BalancedCompressionStrategy extends CompressionStrategy {

   // 1. 반복 콘텐츠 축약
   compressed = this.condenseRepetitiveContent(compressed);

   // 2. 장문 설명 압축
   compressed = this.compressLongDescriptions(compressed);

   // 3. 중요도 기반 필터링 (medium 이상)
   compressed = this.filterByImportance(compressed, 'medium');

   strategy: 'balanced',
   compressionLevel: 'medium'
   }
   };
  }
}

// 최소 압축 전략 (10-30% 압축)
class MinimalCompressionStrategy extends CompressionStrategy {

   // 1. 공백 및 포맷팅 최적화
   compressed = this.optimizeFormatting(compressed);

   // 2. 오래된 로그만 제거

   strategy: 'minimal',
   compressionLevel: 'low'
   }
   };
  }
}
```

### 3.1 압축 모드 정의
// 압축 모드 설정
const COMPRESSION_MODES = {
  aggressive: {
   name: 'Aggressive',
   description: '최대 압축률 (50-70%)',
   target_ratio: 60,
   preserves: ['critical_tasks', 'current_sprint', 'requirements'],
   removes: ['old_logs', 'completed_tasks', 'detailed_examples', 'verbose_descriptions']
  },

  balanced: {
   name: 'Balanced',
   description: '균형 압축률 (30-50%)',
   target_ratio: 40,
   preserves: ['active_tasks', 'requirements', 'recent_logs', 'important_notes'],
   removes: ['old_logs', 'completed_tasks', 'redundant_content']
  },

  minimal: {
   name: 'Minimal',
   description: '최소 압축률 (10-30%)',
   target_ratio: 20,
   preserves: ['all_tasks', 'all_requirements', 'all_documentation'],
   removes: ['old_logs', 'formatting_redundancy']
  }
};
```

### 3.2 압축 레벨 시스템
// 압축 레벨 관리 클래스
class CompressionLevelManager {
   this.levels = {
   1: { name: 'Conservative', ratio: 15, risk: 'low' },
   2: { name: 'Standard', ratio: 30, risk: 'low' },
   3: { name: 'Moderate', ratio: 45, risk: 'medium' },
   4: { name: 'Aggressive', ratio: 60, risk: 'high' },
   5: { name: 'Maximum', ratio: 75, risk: 'very_high' }
   };
  }

  // 프로젝트 크기에 따른 권장 레벨
  getRecommendedLevel(projectSize) {
   if (projectSize < 10000) return 1;
   if (projectSize < 50000) return 2;
   if (projectSize < 100000) return 3;
   if (projectSize < 200000) return 4;
   return 5;
  }

  // 레벨별 설정 반환
  getLevelConfig(level) {
   return this.levels[level] || this.levels[2];
  }
}
```

### 4.1 중요도 분류 시스템
// 중요도 분류 클래스
class ImportanceClassifier {
   this.priorities = {
   critical: {
   weight: 1.0,
   keywords: ['urgent', 'critical', 'blocking', 'error', 'failed'],
   sections: ['active_tasks', 'current_sprint', 'requirements']
   },
   high: {
   weight: 0.8,
   keywords: ['important', 'priority', 'deadline', 'milestone'],
   sections: ['planned_tasks', 'specifications', 'architecture']
   },
   medium: {
   weight: 0.6,
   keywords: ['enhancement', 'improvement', 'optimize'],
   sections: ['documentation', 'tests', 'examples']
   },
   low: {
   weight: 0.4,
   keywords: ['nice-to-have', 'future', 'consider'],
   sections: ['logs', 'history', 'templates']
   }
   };
  }

  // 콘텐츠 중요도 분석
  analyzeImportance(content) {
   const sections = this.parseContentSections(content);

   content: section.content,
   importance: this.calculateImportance(section),
   tokens: new TokenCounter().countTokens(section.content)
   }));
  }

  // 중요도 계산
  calculateImportance(section) {
   let score = 0;

   // 키워드 기반 점수
   Object.entries(this.priorities).forEach(([level, config]) => {
   const keywordMatches = config.keywords.filter(keyword =>
   section.content.toLowerCase().includes(keyword)
   ).length;
   score += keywordMatches * config.weight;
   });

   // 섹션 타입 기반 점수
   if (config.sections.includes(section.type)) {
   score += config.weight;
   }
   });

   // 점수를 카테고리로 변환
   if (score >= 1.5) return 'critical';
   if (score >= 1.0) return 'high';
   if (score >= 0.5) return 'medium';
   return 'low';
  }
}
```

### 4.2 정보 필터링 시스템
// 정보 필터링 클래스
class InformationFilter {
  constructor(threshold = 'medium') {
   this.threshold = threshold;
   this.classifier = new ImportanceClassifier();
  }

  // 중요도 기반 필터링
  filterByImportance(content, minImportance = this.threshold) {
   const analyzedSections = this.classifier.analyzeImportance(content);
   const importanceOrder = ['critical', 'high', 'medium', 'low'];
   const minIndex = importanceOrder.indexOf(minImportance);

   const filteredSections = analyzedSections.filter(section => {
   const sectionIndex = importanceOrder.indexOf(section.importance);
   return sectionIndex <= minIndex;
   });

   content: this.reconstructContent(filteredSections),
   originalSections: analyzedSections.length,
   filteredSections: filteredSections.length,
   removedSections: analyzedSections.length - filteredSections.length
   }
   };
  }

  // 콘텐츠 재구성
  reconstructContent(sections) {
   return sections.map(section => section.content).join('\n\n');
  }
}
```

### 5.1 압축 파이프라인
// 압축 파이프라인 클래스
class CompressionPipeline {
  constructor(options = {}) {
   this.stages = [
   new TokenAnalysisStage(),
   new ImportanceAnalysisStage(),
   new CompressionStage(options.mode || 'balanced'),
   new ValidationStage(),
   new MetadataGenerationStage()
   ];
  }

  // 파이프라인 실행
  async execute(input) {
   let result = { content: input };

   for (const stage of this.stages) {
   result = await stage.process(result);

   // 단계별 로깅
   console.log(`Stage ${stage.name} completed:`, {
   tokens: new TokenCounter().countTokens(result.content),
   ratio: result.compressionRatio
   });
   }

   return result;
  }
}

// 파이프라인 단계 인터페이스
class PipelineStage {
  constructor(name) {
   this.name = name;
  }

  async process(input) {
   throw new Error('process method must be implemented');
  }
}

// 토큰 분석 단계
class TokenAnalysisStage extends PipelineStage {
   super('TokenAnalysis');
  }

   const originalTokens = this.counter.countTokens(input.content);

   ...input,
   originalTokens,
   tokenDistribution: this.counter.analyzeTokenDistribution(input.content)
   };
  }
}

// 중요도 분석 단계
class ImportanceAnalysisStage extends PipelineStage {
   super('ImportanceAnalysis');
  }

   const importanceAnalysis = this.classifier.analyzeImportance(input.content);

   importanceAnalysis
   };
  }
}

// 압축 단계
class CompressionStage extends PipelineStage {
   super('Compression');
   this.compressor = new ContextCompressor(mode);
  }

   const compressed = this.compressor.compress(input.content);

   content: compressed.compressed,
   compressionRatio: compressed.compressionRatio,
   compressionMetadata: compressed.metadata
   };
  }
}
```

### 5.2 복원 파이프라인
// 복원 파이프라인 클래스
class DecompressionPipeline {
   new MetadataValidationStage(),
   new DecompressionStage(),
   new IntegrityCheckStage()
   ];
  }

  // 복원 실행
  async execute(compressedContent, metadata) {
   let result = { content: compressedContent, metadata };

   }

  }
}

// 복원 단계
class DecompressionStage extends PipelineStage {
   super('Decompression');
  }

   const strategy = this.getStrategy(input.metadata.strategy);
   const decompressed = strategy.decompress(input.content, input.metadata);

   content: decompressed
   };
  }
}
```

### 6.1 벤치마크 테스트 스위트
// 성능 벤치마크 클래스
class PerformanceBenchmark {
   this.metrics = {
   compressionTime: [],
   decompressionTime: [],
   compressionRatio: [],
   memoryUsage: [],
   accuracy: []
   };
  }

  // 압축 성능 테스트
  async benchmarkCompression(testCases) {
   const results = [];

   for (const testCase of testCases) {
   const startTime = performance.now();
   const startMemory = process.memoryUsage();

   const compressor = new ContextCompressor(testCase.mode);
   const result = compressor.compress(testCase.content);

   const endTime = performance.now();
   const endMemory = process.memoryUsage();

   results.push({
   testCase: testCase.name,
   compressionTime: endTime - startTime,
   memoryUsage: endMemory.heapUsed - startMemory.heapUsed,
   compressionRatio: result.compressionRatio,
   originalSize: testCase.content.length,
   compressedSize: result.compressed.length
   });
   }

   return results;
  }

  // 정확도 테스트
  async benchmarkAccuracy(testCases) {

   const compressed = compressor.compress(testCase.content);

   // 정보 손실 측정
   const informationLoss = this.measureInformationLoss(
   testCase.content,
   compressed.compressed
   );

   informationLoss,
   accuracy: 100 - informationLoss
   });
   }

  }

  measureInformationLoss(original, compressed) {
   const originalSections = this.extractImportantSections(original);
   const compressedSections = this.extractImportantSections(compressed);

   const lostSections = originalSections.filter(section =>
   !compressedSections.includes(section)
   );

   return (lostSections.length / originalSections.length) * 100;
  }

  // 성능 보고서 생성
  generatePerformanceReport(results) {
   summary: {
   averageCompressionTime: this.average(results.map(r => r.compressionTime)),
   averageCompressionRatio: this.average(results.map(r => r.compressionRatio)),
   averageMemoryUsage: this.average(results.map(r => r.memoryUsage)),
   averageAccuracy: this.average(results.map(r => r.accuracy))
   },
   detailed: results,
   recommendations: this.generateRecommendations(results)
   };
  }
}
```

### 6.2 실시간 성능 모니터링
// 실시간 성능 모니터링 클래스
class PerformanceMonitor {
   this.metrics = new Map();
   this.alerts = [];
  }

  // 성능 메트릭 수집
  collectMetrics(operation, startTime, endTime, metadata) {
   const duration = endTime - startTime;
   const key = `${operation}_${metadata.mode}`;

   if (!this.metrics.has(key)) {
   this.metrics.set(key, []);
   }

   this.metrics.get(key).push({
   duration,
   timestamp: Date.now(),
   metadata
   });

   // 성능 임계값 확인
   this.checkPerformanceThresholds(key, duration);
  }

  checkPerformanceThresholds(operation, duration) {
   const thresholds = {
   compression: 3000, // 3초
   decompression: 1000, // 1초
   analysis: 2000 // 2초
   };

   const threshold = thresholds[operation.split('_')[0]];

   if (duration > threshold) {
   this.alerts.push({
   type: 'performance_warning',
   operation,
   threshold,
   });
   }
  }

  // 성능 대시보드 데이터 생성
  getDashboardData() {
   const data = {};

   this.metrics.forEach((values, key) => {
   data[key] = {
   count: values.length,
   averageDuration: values.reduce((sum, v) => sum + v.duration, 0) / values.length,
   lastDuration: values[values.length - 1]?.duration || 0,
   trend: this.calculateTrend(values)
   };
   });

   metrics: data,
   alerts: this.alerts.slice(-10), // 최근 10개 알림
   uptime: process.uptime()
   };
  }
}
```

### 7.1 기본 사용법
```bash

# Context 압축 명령어
aiwf compress --mode balanced --level 3

# 특정 디렉토리 압축
aiwf compress --path .aiwf/03_SPRINTS --mode aggressive

# 압축 분석
aiwf analyze-tokens --report

# 압축 성능 벤치마크
aiwf benchmark --mode all
```

### 7.2 프로그래밍 인터페이스
// 압축 시스템 사용 예시
const compressionSystem = new CompressionSystem({
  mode: 'balanced',
  level: 3,
  preserveCritical: true
});

// 프로젝트 전체 압축
const result = await compressionSystem.compressProject('/path/to/project');

console.log('압축 결과:', {
  originalTokens: result.originalTokens,
  compressedTokens: result.compressedTokens,
  savedTokens: result.savedTokens
});

// 성능 모니터링
const monitor = new PerformanceMonitor();
compressionSystem.setMonitor(monitor);
```

### 8.1 Machine Learning 기반 압축
- AI 모델을 활용한 지능형 압축 전략
- 사용자 패턴 학습을 통한 개인화된 압축
- 자동 압축 레벨 조정

### 8.2 분산 압축 시스템
- 대용량 프로젝트를 위한 분산 처리
- 병렬 압축 알고리즘
- 클라우드 기반 압축 서비스

### 8.3 실시간 압축
- 실시간 context 압축
- 스트리밍 압축 지원
- 증분 압축 알고리즘
---
*이 문서는 AIWF Token Optimization System의 설계 문서입니다. 구현 과정에서 세부사항이 조정될 수 있습니다.*