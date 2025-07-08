# AIWF 성능 최적화 API 문서

## 개요

이 문서는 AIWF 프로젝트의 성능 최적화 시스템에 대한 API 문서입니다. 다음 모듈들을 포함합니다:

- GitHub API 캐싱 시스템
- 파일 배치 처리 시스템
- 메모리 프로파일링 시스템
- 성능 벤치마크 시스템

## 1. GitHub API 캐싱 시스템

### GitHubAPICache

GitHub API 호출을 최적화하기 위한 캐싱 시스템입니다.

#### 생성자

```javascript
new GitHubAPICache(cacheDir = '.aiwf/cache', ttl = 300000)
```

- `cacheDir`: 캐시 디렉토리 경로
- `ttl`: 캐시 만료 시간 (밀리초)

#### 메서드

##### `async init()`

캐시 시스템을 초기화합니다.

```javascript
const cache = new GitHubAPICache();
await cache.init();
```

##### `async get(url, headers = {})`

캐시에서 데이터를 가져옵니다.

```javascript
const data = await cache.get('https://api.github.com/repos/user/repo');
```

##### `async set(url, data, headers = {})`

캐시에 데이터를 저장합니다.

```javascript
await cache.set('https://api.github.com/repos/user/repo', responseData);
```

##### `async getOrFetch(url, fetchFunction, headers = {})`

캐시에서 데이터를 가져오거나 없으면 fetch 함수를 실행합니다.

```javascript
const data = await cache.getOrFetch(url, async () => {
    const response = await fetch(url);
    return await response.json();
});
```

##### `getStats()`

캐시 통계를 반환합니다.

```javascript
const stats = cache.getStats();
console.log(stats.hitRate); // 캐시 히트율
```

##### `async cleanup()`

만료된 캐시를 정리합니다.

```javascript
await cache.cleanup();
```

### OptimizedGitHubClient

최적화된 GitHub API 클라이언트입니다.

#### 생성자

```javascript
new OptimizedGitHubClient(baseUrl = 'https://api.github.com', cacheOptions = {})
```

#### 메서드

##### `async cachedFetch(url, options = {})`

캐시를 적용한 HTTP 요청을 수행합니다.

```javascript
const client = new OptimizedGitHubClient();
const data = await client.cachedFetch('https://api.github.com/repos/user/repo');
```

##### `async batchRequest(urls, options = {})`

여러 URL에 대한 배치 요청을 수행합니다.

```javascript
const urls = ['url1', 'url2', 'url3'];
const results = await client.batchRequest(urls, { batchSize: 5 });
```

##### `async getDirectoryStructure(repoPath, dirPath = '')`

리포지토리의 디렉토리 구조를 가져옵니다.

```javascript
const structure = await client.getDirectoryStructure('user/repo', 'src');
```

## 2. 파일 배치 처리 시스템

### FileBatchProcessor

파일 시스템 작업을 배치로 처리하는 시스템입니다.

#### 생성자

```javascript
new FileBatchProcessor(options = {})
```

- `maxConcurrency`: 최대 동시 처리 수 (기본값: 10)
- `batchSize`: 배치 크기 (기본값: 50)

#### 메서드

##### `addReadOperation(filePath, options = {})`

파일 읽기 작업을 큐에 추가합니다.

```javascript
const processor = new FileBatchProcessor();
const content = await processor.addReadOperation('/path/to/file.txt');
```

##### `addWriteOperation(filePath, content, options = {})`

파일 쓰기 작업을 큐에 추가합니다.

```javascript
await processor.addWriteOperation('/path/to/file.txt', 'content');
```

##### `addCopyOperation(source, destination, options = {})`

파일 복사 작업을 큐에 추가합니다.

```javascript
await processor.addCopyOperation('/src/file.txt', '/dest/file.txt');
```

##### `addMkdirOperation(dirPath, options = {})`

디렉토리 생성 작업을 큐에 추가합니다.

```javascript
await processor.addMkdirOperation('/path/to/directory');
```

##### `getStats()`

처리 통계를 반환합니다.

```javascript
const stats = processor.getStats();
console.log(stats.successRate); // 성공률
```

### FileUtils

파일 작업 유틸리티 함수들입니다.

#### 메서드

##### `static async readMultipleFiles(filePaths, processor)`

여러 파일을 동시에 읽습니다.

```javascript
const filePaths = ['file1.txt', 'file2.txt', 'file3.txt'];
const results = await FileUtils.readMultipleFiles(filePaths, processor);
```

##### `static async writeMultipleFiles(fileData, processor)`

여러 파일을 동시에 씁니다.

```javascript
const fileData = {
    'file1.txt': 'content1',
    'file2.txt': 'content2'
};
await FileUtils.writeMultipleFiles(fileData, processor);
```

## 3. 메모리 프로파일링 시스템

### MemoryProfiler

메모리 사용량을 모니터링하고 최적화하는 시스템입니다.

#### 생성자

```javascript
new MemoryProfiler(options = {})
```

- `samplingInterval`: 샘플링 간격 (기본값: 1000ms)
- `maxSamples`: 최대 샘플 수 (기본값: 1000)
- `heapThreshold`: 힙 메모리 임계값 (기본값: 100MB)

#### 메서드

##### `startProfiling()`

메모리 프로파일링을 시작합니다.

```javascript
const profiler = new MemoryProfiler();
profiler.startProfiling();
```

##### `stopProfiling()`

메모리 프로파일링을 중지합니다.

```javascript
profiler.stopProfiling();
```

##### `createSnapshot(label)`

메모리 스냅샷을 생성합니다.

```javascript
const snapshot = profiler.createSnapshot('before-operation');
```

##### `compareSnapshots(label1, label2)`

두 스냅샷을 비교합니다.

```javascript
const comparison = profiler.compareSnapshots('before', 'after');
console.log(comparison.memoryDiff); // 메모리 차이
```

##### `getOptimizationSuggestions()`

메모리 최적화 제안을 반환합니다.

```javascript
const suggestions = profiler.getOptimizationSuggestions();
```

##### `forceGarbageCollection()`

가비지 컬렉션을 강제 실행합니다.

```javascript
const gcResult = profiler.forceGarbageCollection();
```

##### `generateReport()`

메모리 사용량 보고서를 생성합니다.

```javascript
const report = profiler.generateReport();
```

##### `async monitor(duration = 60000)`

지정된 시간 동안 메모리를 모니터링합니다.

```javascript
const report = await profiler.monitor(60000); // 1분 동안 모니터링
```

### MemoryOptimizer

메모리 최적화 유틸리티입니다.

#### 메서드

##### `static async optimizeForLargeFiles(filePath, chunkSize = 64 * 1024)`

대용량 파일에 대한 최적화 제안을 반환합니다.

```javascript
const optimization = await MemoryOptimizer.optimizeForLargeFiles('/path/to/large/file');
```

##### `static optimizeDataStructures(data)`

데이터 구조에 대한 최적화 제안을 반환합니다.

```javascript
const optimization = MemoryOptimizer.optimizeDataStructures(largeArray);
```

## 4. 성능 벤치마크 시스템

### PerformanceBenchmark

성능 벤치마크를 실행하는 시스템입니다.

#### 생성자

```javascript
new PerformanceBenchmark(options = {})
```

- `iterations`: 반복 횟수 (기본값: 100)
- `warmupIterations`: 워밍업 반복 횟수 (기본값: 10)
- `memoryProfiling`: 메모리 프로파일링 활성화 (기본값: false)

#### 메서드

##### `async run(testSuite)`

벤치마크 테스트 스위트를 실행합니다.

```javascript
const benchmark = new PerformanceBenchmark();
const testSuite = {
    name: 'My Test Suite',
    tests: [
        {
            name: 'Test 1',
            fn: async () => {
                // 테스트 로직
            }
        }
    ]
};
const results = await benchmark.run(testSuite);
```

##### `async runLoadTest(testConfig)`

부하 테스트를 실행합니다.

```javascript
const loadTestResult = await benchmark.runLoadTest({
    name: 'Load Test',
    target: 'https://api.example.com',
    duration: 60000,
    concurrency: 10
});
```

##### `detectPerformanceRegression(currentResult, baselineResult)`

성능 회귀를 감지합니다.

```javascript
const regression = benchmark.detectPerformanceRegression(current, baseline);
```

##### `generateReport()`

성능 보고서를 생성합니다.

```javascript
const report = benchmark.generateReport();
```

##### `async saveReport(filePath)`

보고서를 JSON 파일로 저장합니다.

```javascript
await benchmark.saveReport('/path/to/report.json');
```

##### `async generateHTMLReport(filePath)`

보고서를 HTML 파일로 생성합니다.

```javascript
await benchmark.generateHTMLReport('/path/to/report.html');
```

### BenchmarkSuites

사전 정의된 벤치마크 테스트 스위트들입니다.

#### 메서드

##### `static fileOperations()`

파일 작업 벤치마크 스위트를 반환합니다.

```javascript
const suite = BenchmarkSuites.fileOperations();
await benchmark.run(suite);
```

##### `static memoryOperations()`

메모리 작업 벤치마크 스위트를 반환합니다.

```javascript
const suite = BenchmarkSuites.memoryOperations();
await benchmark.run(suite);
```

##### `static githubAPICache()`

GitHub API 캐시 벤치마크 스위트를 반환합니다.

```javascript
const suite = BenchmarkSuites.githubAPICache();
await benchmark.run(suite);
```

## 사용 예제

### 전체 성능 최적화 워크플로우

```javascript
import { GitHubAPICache, OptimizedGitHubClient } from './lib/cache-system.js';
import { FileBatchProcessor, FileUtils } from './lib/file-batch-processor.js';
import { MemoryProfiler, MemoryOptimizer } from './lib/memory-profiler.js';
import { PerformanceBenchmark, BenchmarkSuites } from './lib/performance-benchmark.js';

async function optimizePerformance() {
    // 1. GitHub API 캐싱 설정
    const githubClient = new OptimizedGitHubClient();
    await githubClient.init();
    
    // 2. 파일 배치 처리 설정
    const fileProcessor = new FileBatchProcessor({
        maxConcurrency: 5,
        batchSize: 20
    });
    
    // 3. 메모리 프로파일링 시작
    const memoryProfiler = new MemoryProfiler();
    memoryProfiler.startProfiling();
    
    // 4. 성능 벤치마크 실행
    const benchmark = new PerformanceBenchmark({
        iterations: 50,
        memoryProfiling: true
    });
    
    const fileOpsSuite = BenchmarkSuites.fileOperations();
    const memOpsSuite = BenchmarkSuites.memoryOperations();
    const cacheOpsSuite = BenchmarkSuites.githubAPICache();
    
    const results = await Promise.all([
        benchmark.run(fileOpsSuite),
        benchmark.run(memOpsSuite),
        benchmark.run(cacheOpsSuite)
    ]);
    
    // 5. 결과 저장
    await benchmark.saveReport('./performance-report.json');
    await benchmark.generateHTMLReport('./performance-report.html');
    
    // 6. 메모리 프로파일링 결과
    const memoryReport = memoryProfiler.generateReport();
    const suggestions = memoryProfiler.getOptimizationSuggestions();
    
    console.log('성능 최적화 완료');
    console.log('메모리 최적화 제안:', suggestions);
    
    return {
        performanceResults: results,
        memoryReport,
        suggestions
    };
}

// 실행
optimizePerformance().catch(console.error);
```

### 특정 모듈 사용 예제

```javascript
// GitHub API 캐싱 사용
const cache = new GitHubAPICache();
await cache.init();

const repoData = await cache.getOrFetch(
    'https://api.github.com/repos/user/repo',
    async () => {
        const response = await fetch('https://api.github.com/repos/user/repo');
        return await response.json();
    }
);

// 파일 배치 처리 사용
const processor = new FileBatchProcessor();
const files = ['file1.txt', 'file2.txt', 'file3.txt'];
const contents = await FileUtils.readMultipleFiles(files, processor);

// 메모리 프로파일링 사용
const profiler = new MemoryProfiler();
profiler.createSnapshot('start');
// ... 작업 실행 ...
profiler.createSnapshot('end');
const comparison = profiler.compareSnapshots('start', 'end');
```

## 오류 처리

모든 API는 Promise를 반환하므로 적절한 오류 처리가 필요합니다:

```javascript
try {
    const result = await someAsyncOperation();
    console.log(result);
} catch (error) {
    console.error('Operation failed:', error.message);
    // 오류 처리 로직
}
```

## 성능 고려사항

1. **캐시 설정**: TTL 값을 적절히 설정하여 메모리 사용량과 성능의 균형을 맞추세요.
2. **배치 크기**: 너무 큰 배치는 메모리 사용량을 증가시킬 수 있습니다.
3. **동시성**: 시스템 리소스에 따라 최적의 동시성 수준을 설정하세요.
4. **모니터링**: 정기적으로 성능 메트릭을 확인하고 최적화하세요.

## 지원 및 문의

- GitHub Issues: https://github.com/aiwf/aiwf/issues
- 문서: https://aiwf.github.io/docs
- 이메일: support@aiwf.dev