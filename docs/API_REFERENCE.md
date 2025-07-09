# AIWF API Reference

This comprehensive API reference covers all modules and utilities provided by the AIWF framework. The API is organized into core systems and feature-specific modules.

## Table of Contents

1. [Performance & Optimization APIs](#performance--optimization-apis)
   - [GitHub API Cache System](#github-api-cache-system)
   - [File Batch Processing](#file-batch-processing)
   - [Memory Profiler](#memory-profiler)
   - [Performance Benchmark](#performance-benchmark)
2. [Feature Management APIs](#feature-management-apis)
   - [Feature Ledger](#feature-ledger)
   - [Token Tracker](#token-tracker)
3. [AI Enhancement APIs](#ai-enhancement-apis)
   - [AI Persona Manager](#ai-persona-manager)
   - [Context Compressor](#context-compressor)
   - [Feature-Git Integration](#feature-git-integration)
4. [Utility APIs](#utility-apis)
   - [Markdown Processor](#markdown-processor)
   - [Template Engine](#template-engine)

---

## Performance & Optimization APIs

### GitHub API Cache System

Optimizes GitHub API calls through intelligent caching and batch processing.

#### GitHubAPICache

##### Constructor
```javascript
new GitHubAPICache(cacheDir?: string, ttl?: number)
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| cacheDir | string | '.aiwf/cache' | Cache directory path |
| ttl | number | 300000 | Cache TTL in milliseconds |

##### Methods

###### init()
```javascript
async init(): Promise<void>
```
Initializes the cache system and creates necessary directories.

**Example:**
```javascript
const cache = new GitHubAPICache();
await cache.init();
```

###### get()
```javascript
async get(url: string, headers?: object): Promise<any>
```
Retrieves data from cache.

**Parameters:**
- `url` - The API endpoint URL
- `headers` - Optional HTTP headers

**Returns:** Cached data or null if not found/expired

###### set()
```javascript
async set(url: string, data: any, headers?: object): Promise<void>
```
Stores data in cache.

**Parameters:**
- `url` - The API endpoint URL
- `data` - Data to cache
- `headers` - Optional HTTP headers

###### getOrFetch()
```javascript
async getOrFetch(
  url: string, 
  fetchFunction: () => Promise<any>, 
  headers?: object
): Promise<any>
```
Gets data from cache or fetches if not available.

**Example:**
```javascript
const data = await cache.getOrFetch(url, async () => {
  const response = await fetch(url);
  return await response.json();
});
```

###### getStats()
```javascript
getStats(): CacheStats
```
Returns cache statistics.

**Returns:**
```typescript
interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  totalSize: number;
  itemCount: number;
}
```

###### cleanup()
```javascript
async cleanup(): Promise<void>
```
Removes expired cache entries.

---

#### OptimizedGitHubClient

Enhanced GitHub API client with caching and batch support.

##### Constructor
```javascript
new OptimizedGitHubClient(baseUrl?: string, cacheOptions?: object)
```

##### Methods

###### cachedFetch()
```javascript
async cachedFetch(url: string, options?: RequestInit): Promise<any>
```
Performs cached HTTP request.

###### batchRequest()
```javascript
async batchRequest(
  urls: string[], 
  options?: BatchOptions
): Promise<any[]>
```
Executes batch requests with rate limiting.

**Options:**
```typescript
interface BatchOptions {
  batchSize?: number;    // Default: 5
  delay?: number;        // Delay between batches (ms)
  headers?: object;      // HTTP headers
}
```

###### getDirectoryStructure()
```javascript
async getDirectoryStructure(
  repoPath: string, 
  dirPath?: string
): Promise<TreeNode[]>
```
Fetches repository directory structure.

**Example:**
```javascript
const structure = await client.getDirectoryStructure('owner/repo', 'src');
```

---

### File Batch Processing

Optimizes file system operations through batching and concurrency control.

#### FileBatchProcessor

##### Constructor
```javascript
new FileBatchProcessor(options?: ProcessorOptions)
```

**Options:**
```typescript
interface ProcessorOptions {
  maxConcurrency?: number;  // Default: 10
  batchSize?: number;       // Default: 50
  timeout?: number;         // Operation timeout (ms)
}
```

##### Methods

###### addReadOperation()
```javascript
async addReadOperation(
  filePath: string, 
  options?: ReadOptions
): Promise<string>
```
Queues a file read operation.

**Options:**
```typescript
interface ReadOptions {
  encoding?: string;  // Default: 'utf8'
  flag?: string;      // File system flag
}
```

###### addWriteOperation()
```javascript
async addWriteOperation(
  filePath: string, 
  content: string, 
  options?: WriteOptions
): Promise<void>
```
Queues a file write operation.

###### addCopyOperation()
```javascript
async addCopyOperation(
  source: string, 
  destination: string, 
  options?: CopyOptions
): Promise<void>
```
Queues a file copy operation.

###### processBatch()
```javascript
async processBatch(): Promise<BatchResult>
```
Processes all queued operations.

**Returns:**
```typescript
interface BatchResult {
  successful: number;
  failed: number;
  errors: Error[];
  duration: number;
}
```

###### getStats()
```javascript
getStats(): ProcessorStats
```
Returns processor statistics.

---

#### FileUtils

Static utility methods for file operations.

##### readMultipleFiles()
```javascript
static async readMultipleFiles(
  filePaths: string[], 
  processor: FileBatchProcessor
): Promise<Map<string, string>>
```
Reads multiple files concurrently.

##### writeMultipleFiles()
```javascript
static async writeMultipleFiles(
  fileData: Record<string, string>, 
  processor: FileBatchProcessor
): Promise<void>
```
Writes multiple files concurrently.

---

### Memory Profiler

Monitors and optimizes memory usage in Node.js applications.

#### MemoryProfiler

##### Constructor
```javascript
new MemoryProfiler(options?: ProfilerOptions)
```

**Options:**
```typescript
interface ProfilerOptions {
  samplingInterval?: number;  // Default: 1000ms
  maxSamples?: number;        // Default: 1000
  heapThreshold?: number;     // Default: 100MB
  autoGC?: boolean;           // Default: false
}
```

##### Methods

###### startProfiling()
```javascript
startProfiling(): void
```
Starts memory profiling.

###### stopProfiling()
```javascript
stopProfiling(): ProfileReport
```
Stops profiling and returns report.

###### createSnapshot()
```javascript
createSnapshot(label: string): Snapshot
```
Creates a memory snapshot.

**Returns:**
```typescript
interface Snapshot {
  label: string;
  timestamp: number;
  heapUsed: number;
  heapTotal: number;
  external: number;
  arrayBuffers: number;
}
```

###### compareSnapshots()
```javascript
compareSnapshots(
  label1: string, 
  label2: string
): SnapshotComparison
```
Compares two snapshots.

**Returns:**
```typescript
interface SnapshotComparison {
  memoryDiff: number;
  percentChange: number;
  timeDiff: number;
  details: object;
}
```

###### getOptimizationSuggestions()
```javascript
getOptimizationSuggestions(): Suggestion[]
```
Returns memory optimization suggestions.

###### monitor()
```javascript
async monitor(duration?: number): Promise<MonitorReport>
```
Monitors memory for specified duration.

**Example:**
```javascript
const report = await profiler.monitor(60000); // Monitor for 1 minute
```

---

### Performance Benchmark

Comprehensive performance testing and benchmarking system.

#### PerformanceBenchmark

##### Constructor
```javascript
new PerformanceBenchmark(options?: BenchmarkOptions)
```

**Options:**
```typescript
interface BenchmarkOptions {
  iterations?: number;         // Default: 100
  warmupIterations?: number;   // Default: 10
  memoryProfiling?: boolean;   // Default: false
  timeout?: number;            // Test timeout (ms)
}
```

##### Methods

###### run()
```javascript
async run(testSuite: TestSuite): Promise<BenchmarkResult>
```
Runs a benchmark test suite.

**Test Suite Structure:**
```typescript
interface TestSuite {
  name: string;
  tests: Test[];
  setup?: () => Promise<void>;
  teardown?: () => Promise<void>;
}

interface Test {
  name: string;
  fn: () => Promise<void>;
  options?: TestOptions;
}
```

###### runLoadTest()
```javascript
async runLoadTest(config: LoadTestConfig): Promise<LoadTestResult>
```
Performs load testing.

**Config:**
```typescript
interface LoadTestConfig {
  name: string;
  target: string | (() => Promise<void>);
  duration: number;
  concurrency: number;
  rampUp?: number;
}
```

###### detectPerformanceRegression()
```javascript
detectPerformanceRegression(
  current: BenchmarkResult, 
  baseline: BenchmarkResult
): RegressionReport
```
Detects performance regressions.

###### generateReport()
```javascript
generateReport(): BenchmarkReport
```
Generates comprehensive benchmark report.

---

## Feature Management APIs

### Feature Ledger

Tracks and manages feature development progress.

#### FeatureLedger

##### Constructor
```javascript
new FeatureLedger(ledgerPath?: string)
```

##### Methods

###### createFeature()
```javascript
async createFeature(feature: FeatureInput): Promise<Feature>
```
Creates a new feature entry.

**Input:**
```typescript
interface FeatureInput {
  name: string;
  description: string;
  category: 'feature' | 'bugfix' | 'enhancement' | 'refactor';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignee?: string;
  tags?: string[];
}
```

**Returns:**
```typescript
interface Feature extends FeatureInput {
  id: string;           // Auto-generated (F001, F002, etc.)
  status: string;       // 'planned' | 'in_progress' | 'completed'
  createdAt: string;    // ISO timestamp
  updatedAt: string;    // ISO timestamp
  progress: number;     // 0-100
  commits: string[];    // Related commit hashes
}
```

###### updateFeatureStatus()
```javascript
async updateFeatureStatus(
  featureId: string, 
  status: FeatureStatus
): Promise<void>
```
Updates feature status.

###### linkCommit()
```javascript
async linkCommit(
  featureId: string, 
  commitHash: string
): Promise<void>
```
Links a commit to a feature.

###### getFeatureProgress()
```javascript
async getFeatureProgress(featureId: string): Promise<number>
```
Calculates feature completion percentage.

###### searchFeatures()
```javascript
async searchFeatures(query: SearchQuery): Promise<Feature[]>
```
Searches features with filters.

**Query Options:**
```typescript
interface SearchQuery {
  status?: FeatureStatus;
  category?: string;
  priority?: string;
  assignee?: string;
  tags?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
}
```

---

### Token Tracker

Monitors token usage in AI conversations.

#### TokenTracker

##### Constructor
```javascript
new TokenTracker(options?: TrackerOptions)
```

**Options:**
```typescript
interface TrackerOptions {
  maxTokensPerSession?: number;  // Default: 100000
  warningThreshold?: number;      // Default: 0.8 (80%)
  model?: 'claude-3' | 'gpt-4';  // For accurate counting
}
```

##### Methods

###### trackTokens()
```javascript
trackTokens(message: string, tokenCount?: number): void
```
Records token usage.

###### getSessionStats()
```javascript
getSessionStats(): SessionStats
```
Returns current session statistics.

**Returns:**
```typescript
interface SessionStats {
  totalTokens: number;
  remainingTokens: number;
  percentageUsed: number;
  messageCount: number;
  avgTokensPerMessage: number;
}
```

###### predictTokenUsage()
```javascript
predictTokenUsage(content: string): number
```
Estimates token count for content.

###### resetSession()
```javascript
resetSession(): void
```
Resets session tracking.

###### exportHistory()
```javascript
exportHistory(): TokenHistory[]
```
Exports token usage history.

---

## AI Enhancement APIs

### AI Persona Manager

Manages AI behavior personas for different development tasks.

#### AIPersonaManager

##### Constructor
```javascript
new AIPersonaManager(configPath?: string)
```

##### Available Personas

| Persona | Purpose | Characteristics |
|---------|---------|-----------------|
| architect | System design | Big picture, scalability focus |
| debugger | Bug fixing | Detail-oriented, systematic |
| reviewer | Code review | Quality, standards, security |
| documenter | Documentation | Clear explanations, examples |
| optimizer | Performance | Efficiency, benchmarking |

##### Methods

###### switchPersona()
```javascript
async switchPersona(personaName: string): Promise<void>
```
Switches to specified persona.

**Example:**
```javascript
await manager.switchPersona('architect');
```

###### getCurrentPersona()
```javascript
getCurrentPersona(): Persona
```
Returns currently active persona.

###### getPersonaContext()
```javascript
getPersonaContext(personaName: string): ContextRules
```
Gets context rules for persona.

**Returns:**
```typescript
interface ContextRules {
  priority: string[];      // Priority file types
  focus: string[];         // Focus areas
  exclude: string[];       // Excluded patterns
  keywords: string[];      // Important keywords
}
```

###### applyPersonaRules()
```javascript
async applyPersonaRules(
  content: string, 
  personaName: string
): Promise<string>
```
Applies persona filtering to content.

---

### Context Compressor

Optimizes context size for AI interactions.

#### ContextCompressor

##### Constructor
```javascript
new ContextCompressor(options?: CompressorOptions)
```

**Options:**
```typescript
interface CompressorOptions {
  defaultMode?: 'aggressive' | 'balanced' | 'conservative';
  cacheEnabled?: boolean;
  preserveStructure?: boolean;
}
```

##### Compression Modes

| Mode | Compression Rate | Quality Loss | Use Case |
|------|------------------|--------------|----------|
| aggressive | 70-80% | Medium-High | Large codebases, overview |
| balanced | 50-60% | Low | General development |
| conservative | 30-40% | Very Low | Critical code, debugging |

##### Methods

###### compressContext()
```javascript
compressContext(
  context: string, 
  mode?: CompressionMode
): CompressedResult
```
Compresses context with specified mode.

**Returns:**
```typescript
interface CompressedResult {
  compressed: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  mode: string;
}
```

###### compressFile()
```javascript
async compressFile(
  filePath: string, 
  mode?: CompressionMode
): Promise<CompressedResult>
```
Compresses a single file.

###### compressDirectory()
```javascript
async compressDirectory(
  dirPath: string, 
  mode?: CompressionMode, 
  options?: DirectoryOptions
): Promise<DirectoryResult>
```
Compresses entire directory.

**Options:**
```typescript
interface DirectoryOptions {
  exclude?: string[];      // Patterns to exclude
  includeOnly?: string[];  // Patterns to include
  recursive?: boolean;     // Default: true
  maxDepth?: number;       // Max recursion depth
}
```

---

### Feature-Git Integration

Integrates Feature Ledger with Git workflows.

#### FeatureGitIntegration

##### Constructor
```javascript
new FeatureGitIntegration(options?: IntegrationOptions)
```

**Options:**
```typescript
interface IntegrationOptions {
  ledgerPath?: string;
  autoLink?: boolean;      // Default: true
  hooks?: boolean;         // Install git hooks
}
```

##### Methods

###### parseCommitMessage()
```javascript
parseCommitMessage(message: string): ParsedCommit
```
Extracts feature information from commit message.

**Returns:**
```typescript
interface ParsedCommit {
  featureId?: string;
  type?: string;
  scope?: string;
  description: string;
}
```

###### linkFeatureCommit()
```javascript
async linkFeatureCommit(
  commitHash: string, 
  featureId: string
): Promise<void>
```
Links commit to feature.

###### installHooks()
```javascript
async installHooks(): Promise<void>
```
Installs Git hooks for automatic linking.

###### validateCommit()
```javascript
async validateCommit(commitMessage: string): Promise<boolean>
```
Validates commit message format.

###### generateChangeLog()
```javascript
async generateChangeLog(
  featureId: string
): Promise<string>
```
Generates feature-specific changelog.

---

## Utility APIs

### Markdown Processor

Processes and manipulates markdown files.

#### MarkdownProcessor

##### Methods

###### parse()
```javascript
static parse(markdown: string): ParsedMarkdown
```
Parses markdown content.

###### extract()
```javascript
static extract(
  markdown: string, 
  selector: string
): string | null
```
Extracts content by selector.

###### transform()
```javascript
static transform(
  markdown: string, 
  transformFn: (node: Node) => Node
): string
```
Transforms markdown AST.

---

### Template Engine

Processes AIWF templates with variable substitution.

#### TemplateEngine

##### Methods

###### render()
```javascript
static render(
  template: string, 
  variables: Record<string, any>
): string
```
Renders template with variables.

###### loadTemplate()
```javascript
static async loadTemplate(
  templateName: string
): Promise<string>
```
Loads template from templates directory.

###### registerHelper()
```javascript
static registerHelper(
  name: string, 
  fn: (...args: any[]) => any
): void
```
Registers template helper function.

---

## Error Handling

All async methods follow standard Promise rejection patterns:

```javascript
try {
  const result = await someAsyncOperation();
  console.log(result);
} catch (error) {
  if (error instanceof ValidationError) {
    // Handle validation errors
  } else if (error instanceof NetworkError) {
    // Handle network errors
  } else {
    // Handle general errors
  }
}
```

### Common Error Types

```typescript
class ValidationError extends Error {
  field?: string;
  value?: any;
}

class NetworkError extends Error {
  statusCode?: number;
  response?: any;
}

class FileSystemError extends Error {
  path?: string;
  operation?: string;
}
```

---

## Best Practices

### Performance

1. **Batch Operations**: Use batch processors for multiple file operations
2. **Caching**: Enable caching for repeated API calls
3. **Memory Management**: Monitor memory usage in long-running processes
4. **Compression**: Use appropriate compression modes based on use case

### Error Handling

1. **Graceful Degradation**: Provide fallbacks for failed operations
2. **Retry Logic**: Implement exponential backoff for network requests
3. **Logging**: Use structured logging for debugging
4. **Validation**: Validate inputs before processing

### Integration

1. **Git Hooks**: Install hooks for automatic feature tracking
2. **CI/CD**: Integrate benchmarks into build pipeline
3. **Monitoring**: Track token usage and performance metrics
4. **Documentation**: Keep API documentation in sync with code

---

## Version Compatibility

| AIWF Version | Node.js | API Version |
|--------------|---------|-------------|
| 1.0.x | 14+ | v1 |
| 1.1.x | 16+ | v1 |
| 2.0.x | 18+ | v2 |

---

## Support

- **GitHub Issues**: [github.com/aiwf/aiwf/issues](https://github.com/aiwf/aiwf/issues)
- **Documentation**: [aiwf.github.io/docs](https://aiwf.github.io/docs)
- **Discord**: [discord.gg/aiwf](https://discord.gg/aiwf)
- **Email**: support@aiwf.dev