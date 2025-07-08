# AIWF 성능 가이드라인

## 개요

이 문서는 AIWF 프로젝트에서 최적의 성능을 얻기 위한 가이드라인과 모범 사례를 제공합니다. 개발자들이 성능을 고려한 코드를 작성하고 시스템을 효율적으로 운영할 수 있도록 돕습니다.

## 1. GitHub API 사용 최적화

### 1.1 캐싱 전략

#### 기본 캐싱 사용법

```javascript
import { GitHubAPICache, OptimizedGitHubClient } from './lib/cache-system.js';

// 캐시 시스템 초기화
const githubClient = new OptimizedGitHubClient();
await githubClient.init();

// 자동 캐싱과 함께 API 호출
const repoData = await githubClient.cachedFetch('https://api.github.com/repos/user/repo');
```

#### 캐시 설정 최적화

```javascript
// 환경별 캐시 설정
const cacheOptions = {
    cacheDir: process.env.NODE_ENV === 'production' ? '.aiwf/cache' : '.aiwf/cache-dev',
    ttl: process.env.NODE_ENV === 'production' ? 300000 : 60000 // 프로덕션: 5분, 개발: 1분
};

const client = new OptimizedGitHubClient('https://api.github.com', cacheOptions);
```

### 1.2 배치 처리

#### 여러 API 호출 최적화

```javascript
// 순차 호출 (비효율적)
const repos = [];
for (const repoName of repoNames) {
    repos.push(await client.cachedFetch(`/repos/user/${repoName}`));
}

// 배치 처리 (효율적)
const urls = repoNames.map(name => `/repos/user/${name}`);
const results = await client.batchRequest(urls, { batchSize: 10 });
```

### 1.3 Rate Limiting 대응

```javascript
// Rate Limiter 커스터마이징
class CustomRateLimiter extends RateLimiter {
    constructor() {
        super(60, 60000); // 분당 60개 요청
    }
    
    async waitForNext() {
        // GitHub API 헤더에서 남은 요청 수 확인
        const remaining = this.getRemainingRequests();
        if (remaining < 10) {
            // 남은 요청이 적으면 더 오래 대기
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        return super.waitForNext();
    }
}
```

## 2. 파일 시스템 작업 최적화

### 2.1 배치 처리 활용

#### 단일 파일 작업 (비효율적)

```javascript
// 비효율적인 방법
for (const filePath of filePaths) {
    const content = await fs.readFile(filePath, 'utf8');
    await processFile(content);
}
```

#### 배치 처리 (효율적)

```javascript
import { FileBatchProcessor, FileUtils } from './lib/file-batch-processor.js';

// 효율적인 방법
const processor = new FileBatchProcessor({
    maxConcurrency: 5,
    batchSize: 20
});

const results = await FileUtils.readMultipleFiles(filePaths, processor);
```

### 2.2 큰 파일 처리

#### 스트리밍 처리

```javascript
// 큰 파일은 자동으로 스트리밍 처리됨 (10MB 이상)
const processor = new FileBatchProcessor();

// 큰 파일 읽기 - 자동으로 스트리밍 사용
const content = await processor.addReadOperation('/path/to/large/file.txt');

// 큰 파일 쓰기 - 자동으로 스트리밍 사용
await processor.addWriteOperation('/path/to/output.txt', largeContent);
```

### 2.3 메모리 효율적인 파일 복사

```javascript
// 메모리 효율적인 파일 복사
const fileMappings = {
    '/source/file1.txt': '/dest/file1.txt',
    '/source/file2.txt': '/dest/file2.txt'
};

const results = await FileUtils.copyMultipleFiles(fileMappings, processor);
```

## 3. 메모리 사용량 최적화

### 3.1 메모리 프로파일링

#### 기본 프로파일링

```javascript
import { MemoryProfiler } from './lib/memory-profiler.js';

const profiler = new MemoryProfiler({
    samplingInterval: 1000, // 1초마다 샘플링
    heapThreshold: 100 * 1024 * 1024 // 100MB 임계값
});

// 프로파일링 시작
profiler.startProfiling();

// 작업 실행
await performWorkload();

// 프로파일링 중지 및 보고서 생성
profiler.stopProfiling();
const report = profiler.generateReport();
console.log('메모리 사용량 보고서:', report);
```

#### 스냅샷 비교

```javascript
// 작업 전후 메모리 사용량 비교
profiler.createSnapshot('before-operation');

// 메모리 집약적인 작업
await processLargeDataset();

profiler.createSnapshot('after-operation');

// 메모리 변화 분석
const comparison = profiler.compareSnapshots('before-operation', 'after-operation');
console.log('메모리 변화:', comparison.memoryDiff);
```

### 3.2 메모리 누수 방지

#### 객체 추적

```javascript
// 객체 생성/소멸 추적
const leakDetector = profiler.objectLeakDetector;
leakDetector.startTracking();

// 객체 생성 추적
leakDetector.trackObject('MyClass', 'create');

// 객체 소멸 추적
leakDetector.trackObject('MyClass', 'destroy');

// 누수 의심 객체 확인
const leaking = leakDetector.findLeakingObjects(1000);
if (leaking.length > 0) {
    console.warn('메모리 누수 의심 객체:', leaking);
}
```

#### 가비지 컬렉션 최적화

```javascript
// 메모리 정리 필요 시 강제 GC 실행
const gcResult = profiler.forceGarbageCollection();
if (gcResult) {
    console.log('GC로 해제된 메모리:', gcResult.freed);
}
```

### 3.3 메모리 최적화 제안 활용

```javascript
import { MemoryOptimizer } from './lib/memory-profiler.js';

// 대용량 파일 처리 최적화
const fileOptimization = await MemoryOptimizer.optimizeForLargeFiles('/path/to/large/file');
if (fileOptimization.recommendation === 'streaming') {
    // 스트리밍 처리 사용
    console.log('스트리밍 처리 권장:', fileOptimization.reason);
}

// 데이터 구조 최적화
const dataOptimization = MemoryOptimizer.optimizeDataStructures(largeArray);
if (dataOptimization.recommendation !== 'Current data structure is optimal') {
    console.log('데이터 구조 최적화 제안:', dataOptimization);
}
```

## 4. 성능 벤치마킹

### 4.1 기본 벤치마크 실행

```javascript
import { PerformanceBenchmark, BenchmarkSuites } from './lib/performance-benchmark.js';

const benchmark = new PerformanceBenchmark({
    iterations: 100,
    warmupIterations: 10,
    memoryProfiling: true
});

// 사전 정의된 테스트 스위트 실행
const fileOpsSuite = BenchmarkSuites.fileOperations();
const results = await benchmark.run(fileOpsSuite);

console.log('벤치마크 결과:', results.summary);
```

### 4.2 커스텀 벤치마크 작성

```javascript
// 커스텀 테스트 스위트 정의
const customSuite = {
    name: 'Custom Performance Tests',
    tests: [
        {
            name: 'Data Processing Performance',
            fn: async () => {
                const startTime = performance.now();
                await processData(testData);
                const endTime = performance.now();
                return { duration: endTime - startTime };
            }
        },
        {
            name: 'Cache Hit Performance',
            fn: async () => {
                const cache = new GitHubAPICache();
                await cache.init();
                
                // 캐시에 데이터 저장
                await cache.set('test-key', testData);
                
                const startTime = performance.now();
                const result = await cache.get('test-key');
                const endTime = performance.now();
                
                return { duration: endTime - startTime, throughput: 1 };
            }
        }
    ]
};

const customResults = await benchmark.run(customSuite);
```

### 4.3 부하 테스트

```javascript
// API 엔드포인트 부하 테스트
const loadTestResult = await benchmark.runLoadTest({
    name: 'GitHub API Load Test',
    target: 'https://api.github.com/repos/user/repo',
    duration: 60000, // 1분
    concurrency: 10, // 동시 10개 요청
    rampUp: 5000 // 5초에 걸쳐 점진적 증가
});

console.log('부하 테스트 결과:', loadTestResult.metrics);
```

### 4.4 성능 회귀 감지

```javascript
// 이전 결과와 비교하여 성능 회귀 감지
const currentResult = await benchmark.run(testSuite);
const baselineResult = loadBaselineResults(); // 기준 결과 로드

const regression = benchmark.detectPerformanceRegression(currentResult, baselineResult);
if (regression.detected) {
    console.error('성능 회귀 감지:', regression.issues);
} else {
    console.log('성능 개선:', regression.improvements);
}
```

## 5. 통합 성능 최적화 워크플로우

### 5.1 전체 최적화 프로세스

```javascript
async function optimizeApplicationPerformance() {
    // 1. 메모리 프로파일링 시작
    const profiler = new MemoryProfiler();
    profiler.startProfiling();
    
    // 2. GitHub API 캐싱 설정
    const githubClient = new OptimizedGitHubClient();
    await githubClient.init();
    
    // 3. 파일 배치 처리 설정
    const fileProcessor = new FileBatchProcessor({
        maxConcurrency: 5,
        batchSize: 20
    });
    
    // 4. 성능 벤치마크 실행
    const benchmark = new PerformanceBenchmark({
        iterations: 50,
        memoryProfiling: true
    });
    
    const suites = [
        BenchmarkSuites.fileOperations(),
        BenchmarkSuites.memoryOperations(),
        BenchmarkSuites.githubAPICache()
    ];
    
    const results = await Promise.all(
        suites.map(suite => benchmark.run(suite))
    );
    
    // 5. 결과 분석 및 보고서 생성
    profiler.stopProfiling();
    const memoryReport = profiler.generateReport();
    const suggestions = profiler.getOptimizationSuggestions();
    
    // 6. 보고서 저장
    await benchmark.saveReport('./performance-report.json');
    await benchmark.generateHTMLReport('./performance-report.html');
    await profiler.saveReport('./memory-report.json');
    
    return {
        performanceResults: results,
        memoryReport,
        suggestions,
        githubStats: githubClient.getStats(),
        fileProcessorStats: fileProcessor.getStats()
    };
}
```

### 5.2 CI/CD 통합

```javascript
// CI/CD 파이프라인에서 성능 테스트 실행
async function runPerformanceTests() {
    const benchmark = new PerformanceBenchmark();
    const results = await benchmark.run(BenchmarkSuites.fileOperations());
    
    // 성능 기준 확인
    const avgDuration = results.summary.averageDuration;
    const threshold = 1000; // 1초
    
    if (avgDuration > threshold) {
        throw new Error(`Performance regression detected: ${avgDuration}ms > ${threshold}ms`);
    }
    
    console.log('✅ Performance tests passed');
    return results;
}
```

## 6. 모니터링 및 경고

### 6.1 실시간 모니터링 설정

```javascript
// 프로덕션 환경에서 실시간 모니터링
const productionProfiler = new MemoryProfiler({
    samplingInterval: 5000, // 5초마다
    heapThreshold: 500 * 1024 * 1024, // 500MB
    alertCallback: (alerts) => {
        // 알림 시스템으로 경고 전송
        alerts.forEach(alert => {
            sendAlert(`Memory Alert: ${alert.type}`, alert);
        });
    }
});

productionProfiler.startProfiling();
```

### 6.2 성능 대시보드

```javascript
// 성능 메트릭 대시보드용 데이터 생성
function generateDashboardData() {
    return {
        timestamp: Date.now(),
        memory: process.memoryUsage(),
        cache: githubClient.getStats(),
        fileProcessor: fileProcessor.getStats(),
        uptime: process.uptime()
    };
}

// 주기적으로 대시보드 데이터 업데이트
setInterval(() => {
    const dashboardData = generateDashboardData();
    updateDashboard(dashboardData);
}, 30000); // 30초마다
```

## 7. 환경별 설정 가이드

### 7.1 개발 환경

```javascript
const developmentConfig = {
    github: {
        cacheDir: '.aiwf/cache-dev',
        ttl: 60000, // 1분
        rateLimitPerMinute: 30
    },
    fileProcessor: {
        maxConcurrency: 2,
        batchSize: 10
    },
    memoryProfiler: {
        samplingInterval: 2000, // 2초
        alertThreshold: 100 * 1024 * 1024 // 100MB
    }
};
```

### 7.2 프로덕션 환경

```javascript
const productionConfig = {
    github: {
        cacheDir: '.aiwf/cache',
        ttl: 300000, // 5분
        rateLimitPerMinute: 60
    },
    fileProcessor: {
        maxConcurrency: 10,
        batchSize: 50
    },
    memoryProfiler: {
        samplingInterval: 5000, // 5초
        alertThreshold: 500 * 1024 * 1024 // 500MB
    }
};
```

## 8. 문제 해결 가이드

### 8.1 메모리 사용량 급증

```javascript
// 메모리 사용량이 급증하는 경우
if (currentMemoryUsage > threshold) {
    // 1. 강제 가비지 컬렉션
    const gcResult = profiler.forceGarbageCollection();
    
    // 2. 캐시 정리
    await githubClient.cleanup();
    
    // 3. 임시 파일 정리
    await MemoryOptimizer.cleanupTemporaryFiles();
    
    // 4. 배치 처리 큐 정리
    fileProcessor.clearQueue();
}
```

### 8.2 GitHub API Rate Limit 초과

```javascript
// Rate limit 초과 시 대응
client.on('rateLimit', async (resetTime) => {
    console.log(`Rate limit exceeded. Waiting until ${new Date(resetTime)}`);
    
    // 캐시된 데이터 우선 사용
    const cachedData = await cache.get(url);
    if (cachedData) {
        return cachedData;
    }
    
    // Reset 시간까지 대기
    const waitTime = resetTime - Date.now();
    await new Promise(resolve => setTimeout(resolve, waitTime));
});
```

### 8.3 파일 시스템 성능 저하

```javascript
// 파일 시스템 성능 저하 시
if (fileProcessor.getStats().averageProcessingTime > 5000) { // 5초 이상
    // 1. 동시성 감소
    fileProcessor.maxConcurrency = Math.max(1, fileProcessor.maxConcurrency / 2);
    
    // 2. 배치 크기 감소
    fileProcessor.batchSize = Math.max(5, fileProcessor.batchSize / 2);
    
    // 3. 임시 파일 정리
    await MemoryOptimizer.cleanupTemporaryFiles();
}
```

## 9. 베스트 프랙티스

### 9.1 코드 레벨 최적화

1. **비동기 처리 활용**: Promise.all() 대신 Promise.allSettled() 사용
2. **메모리 효율적인 데이터 구조**: 큰 데이터셋에는 Map/Set 사용
3. **스트리밍 처리**: 큰 파일은 항상 스트림으로 처리
4. **캐시 우선 사용**: API 호출 전 항상 캐시 확인

### 9.2 아키텍처 레벨 최적화

1. **배치 처리 우선**: 개별 작업보다 배치 처리 사용
2. **적절한 캐시 TTL**: 데이터 성격에 맞는 TTL 설정
3. **동시성 제어**: 시스템 리소스에 맞는 동시성 수준 설정
4. **모니터링 필수**: 프로덕션에서 항상 성능 모니터링

### 9.3 운영 레벨 최적화

1. **정기적인 정리**: 캐시, 로그, 임시 파일 정기 정리
2. **성능 기준 설정**: 명확한 성능 SLA 정의
3. **알림 시스템**: 성능 저하 시 즉시 알림
4. **지속적인 개선**: 정기적인 성능 벤치마크 실행

## 결론

AIWF의 성능 최적화는 GitHub API 캐싱, 파일 배치 처리, 메모리 관리, 성능 벤치마킹의 4가지 핵심 영역에서 이루어집니다. 이 가이드라인을 따라 구현하면 대규모 프로젝트에서도 안정적이고 효율적인 성능을 유지할 수 있습니다.

성능 최적화는 지속적인 과정이므로, 정기적인 모니터링과 벤치마킹을 통해 시스템을 개선해 나가는 것이 중요합니다.