#!/usr/bin/env node

import { performance } from 'perf_hooks';
import { Worker } from 'worker_threads';
import fs from 'fs/promises';
import path from 'path';
import { MemoryProfiler } from './memory-profiler.js';
import { GitHubAPICache } from './cache-system.js';

/**
 * 성능 벤치마크 도구
 * - 다양한 성능 메트릭 측정
 * - 부하 테스트 실행
 * - 성능 회귀 감지
 */
class PerformanceBenchmark {
    constructor(options = {}) {
        this.options = {
            iterations: options.iterations || 100,
            warmupIterations: options.warmupIterations || 10,
            memoryProfiling: options.memoryProfiling || false,
            concurrency: options.concurrency || 1,
            timeout: options.timeout || 30000,
            ...options
        };
        
        this.results = [];
        this.memoryProfiler = new MemoryProfiler();
        this.benchmarkHistory = new Map();
    }

    // 벤치마크 실행
    async run(testSuite) {
        console.log(`Starting benchmark suite: ${testSuite.name}`);
        
        if (this.options.memoryProfiling) {
            this.memoryProfiler.startProfiling();
        }

        const suiteResults = {
            name: testSuite.name,
            timestamp: Date.now(),
            tests: [],
            summary: {}
        };

        // 각 테스트 실행
        for (const test of testSuite.tests) {
            console.log(`Running test: ${test.name}`);
            
            try {
                const testResult = await this.runTest(test);
                suiteResults.tests.push(testResult);
            } catch (error) {
                suiteResults.tests.push({
                    name: test.name,
                    error: error.message,
                    status: 'failed'
                });
            }
        }

        // 요약 생성
        suiteResults.summary = this.generateSummary(suiteResults.tests);

        if (this.options.memoryProfiling) {
            this.memoryProfiler.stopProfiling();
            suiteResults.memoryReport = this.memoryProfiler.generateReport();
        }

        this.results.push(suiteResults);
        this.benchmarkHistory.set(testSuite.name, suiteResults);
        
        return suiteResults;
    }

    // 개별 테스트 실행
    async runTest(test) {
        const testResult = {
            name: test.name,
            status: 'running',
            iterations: this.options.iterations,
            warmupIterations: this.options.warmupIterations,
            metrics: {
                duration: [],
                memory: [],
                throughput: [],
                errors: 0
            },
            statistics: {}
        };

        // 워밍업 실행
        await this.warmup(test);

        // 메인 벤치마크 실행
        const startTime = performance.now();
        
        for (let i = 0; i < this.options.iterations; i++) {
            const iterationStartTime = performance.now();
            const memoryBefore = process.memoryUsage();
            
            try {
                const result = await Promise.race([
                    this.executeTest(test),
                    this.createTimeout(this.options.timeout)
                ]);
                
                const iterationEndTime = performance.now();
                const memoryAfter = process.memoryUsage();
                
                // 메트릭 수집
                testResult.metrics.duration.push(iterationEndTime - iterationStartTime);
                testResult.metrics.memory.push(memoryAfter.heapUsed - memoryBefore.heapUsed);
                
                if (result && result.throughput) {
                    testResult.metrics.throughput.push(result.throughput);
                }
                
            } catch (error) {
                testResult.metrics.errors++;
                console.warn(`Test iteration ${i} failed:`, error.message);
            }
        }

        const endTime = performance.now();
        testResult.totalTime = endTime - startTime;
        testResult.status = 'completed';

        // 통계 계산
        testResult.statistics = this.calculateStatistics(testResult.metrics);
        
        return testResult;
    }

    // 워밍업 실행
    async warmup(test) {
        console.log(`Warming up: ${test.name}`);
        
        for (let i = 0; i < this.options.warmupIterations; i++) {
            try {
                await this.executeTest(test);
            } catch (error) {
                // 워밍업 실패는 무시
            }
        }
    }

    // 테스트 실행
    async executeTest(test) {
        if (this.options.concurrency > 1) {
            return await this.executeConcurrentTest(test);
        }
        
        return await test.fn();
    }

    // 동시성 테스트 실행
    async executeConcurrentTest(test) {
        const promises = [];
        
        for (let i = 0; i < this.options.concurrency; i++) {
            promises.push(test.fn());
        }
        
        const results = await Promise.allSettled(promises);
        const successfulResults = results.filter(r => r.status === 'fulfilled');
        
        return {
            totalRequests: this.options.concurrency,
            successfulRequests: successfulResults.length,
            failedRequests: results.length - successfulResults.length,
            throughput: successfulResults.length / (Date.now() / 1000)
        };
    }

    // 타임아웃 생성
    createTimeout(timeout) {
        return new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Test timeout')), timeout);
        });
    }

    // 통계 계산
    calculateStatistics(metrics) {
        const stats = {};
        
        ['duration', 'memory', 'throughput'].forEach(metric => {
            if (metrics[metric].length > 0) {
                const sorted = metrics[metric].slice().sort((a, b) => a - b);
                
                stats[metric] = {
                    min: sorted[0],
                    max: sorted[sorted.length - 1],
                    avg: sorted.reduce((a, b) => a + b, 0) / sorted.length,
                    median: this.calculateMedian(sorted),
                    p95: this.calculatePercentile(sorted, 95),
                    p99: this.calculatePercentile(sorted, 99),
                    stddev: this.calculateStandardDeviation(sorted)
                };
            }
        });

        stats.errorRate = metrics.errors / (metrics.duration.length + metrics.errors);
        
        return stats;
    }

    // 중간값 계산
    calculateMedian(sorted) {
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0 ? 
            (sorted[mid - 1] + sorted[mid]) / 2 : 
            sorted[mid];
    }

    // 백분위수 계산
    calculatePercentile(sorted, percentile) {
        const index = Math.ceil((percentile / 100) * sorted.length) - 1;
        return sorted[Math.max(0, Math.min(index, sorted.length - 1))];
    }

    // 표준편차 계산
    calculateStandardDeviation(values) {
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        const variance = values.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / values.length;
        return Math.sqrt(variance);
    }

    // 요약 생성
    generateSummary(tests) {
        const summary = {
            totalTests: tests.length,
            passedTests: tests.filter(t => t.status === 'completed').length,
            failedTests: tests.filter(t => t.status === 'failed').length,
            averageDuration: 0,
            totalDuration: 0,
            memoryUsage: {
                min: Infinity,
                max: 0,
                avg: 0
            }
        };

        const completedTests = tests.filter(t => t.status === 'completed');
        
        if (completedTests.length > 0) {
            summary.totalDuration = completedTests.reduce((sum, test) => sum + test.totalTime, 0);
            summary.averageDuration = summary.totalDuration / completedTests.length;
            
            // 메모리 사용량 요약
            const memoryStats = completedTests.map(t => t.statistics.memory).filter(Boolean);
            if (memoryStats.length > 0) {
                summary.memoryUsage.min = Math.min(...memoryStats.map(s => s.min));
                summary.memoryUsage.max = Math.max(...memoryStats.map(s => s.max));
                summary.memoryUsage.avg = memoryStats.reduce((sum, s) => sum + s.avg, 0) / memoryStats.length;
            }
        }

        return summary;
    }

    // 부하 테스트 실행
    async runLoadTest(testConfig) {
        const {
            name,
            target,
            duration = 60000, // 1분
            concurrency = 10,
            rampUp = 5000 // 5초
        } = testConfig;

        console.log(`Starting load test: ${name}`);
        console.log(`Target: ${target}, Duration: ${duration}ms, Concurrency: ${concurrency}`);

        const loadTestResult = {
            name,
            config: testConfig,
            timestamp: Date.now(),
            metrics: {
                totalRequests: 0,
                successfulRequests: 0,
                failedRequests: 0,
                averageResponseTime: 0,
                responseTimePercentiles: {},
                throughput: 0,
                errorRate: 0
            },
            timeline: []
        };

        const startTime = Date.now();
        const workers = [];
        const results = [];

        // 점진적 부하 증가
        for (let i = 0; i < concurrency; i++) {
            setTimeout(() => {
                const worker = this.createLoadTestWorker(target, duration, results);
                workers.push(worker);
            }, (i / concurrency) * rampUp);
        }

        // 테스트 완료 대기
        await new Promise(resolve => setTimeout(resolve, duration + rampUp));

        // 워커 정리
        workers.forEach(worker => worker.terminate());

        // 결과 분석
        loadTestResult.metrics = this.analyzeLoadTestResults(results);
        loadTestResult.duration = Date.now() - startTime;

        return loadTestResult;
    }

    // 부하 테스트 워커 생성
    createLoadTestWorker(target, duration, results) {
        const worker = new Worker(`
            const { parentPort } = require('worker_threads');
            const startTime = Date.now();
            
            async function runRequests() {
                while (Date.now() - startTime < ${duration}) {
                    const requestStartTime = Date.now();
                    
                    try {
                        // 실제 요청 실행 (예: HTTP 요청)
                        await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
                        
                        const responseTime = Date.now() - requestStartTime;
                        parentPort.postMessage({
                            type: 'success',
                            responseTime,
                            timestamp: Date.now()
                        });
                    } catch (error) {
                        parentPort.postMessage({
                            type: 'error',
                            error: error.message,
                            timestamp: Date.now()
                        });
                    }
                }
            }
            
            runRequests();
        `, { eval: true });

        worker.on('message', (message) => {
            results.push(message);
        });

        return worker;
    }

    // 부하 테스트 결과 분석
    analyzeLoadTestResults(results) {
        const successful = results.filter(r => r.type === 'success');
        const failed = results.filter(r => r.type === 'error');
        
        const responseTimes = successful.map(r => r.responseTime);
        const sorted = responseTimes.slice().sort((a, b) => a - b);

        return {
            totalRequests: results.length,
            successfulRequests: successful.length,
            failedRequests: failed.length,
            averageResponseTime: responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
            responseTimePercentiles: {
                p50: this.calculatePercentile(sorted, 50),
                p95: this.calculatePercentile(sorted, 95),
                p99: this.calculatePercentile(sorted, 99)
            },
            throughput: successful.length / (results.length > 0 ? 
                (Math.max(...results.map(r => r.timestamp)) - Math.min(...results.map(r => r.timestamp))) / 1000 : 1),
            errorRate: failed.length / results.length
        };
    }

    // 성능 회귀 감지
    detectPerformanceRegression(currentResult, baselineResult) {
        const regression = {
            detected: false,
            issues: [],
            improvements: []
        };

        const thresholds = {
            duration: 0.2, // 20% 증가
            memory: 0.3,   // 30% 증가
            throughput: -0.1 // 10% 감소
        };

        // 지속 시간 회귀 검사
        const durationChange = (currentResult.statistics.duration.avg - baselineResult.statistics.duration.avg) / baselineResult.statistics.duration.avg;
        
        if (durationChange > thresholds.duration) {
            regression.detected = true;
            regression.issues.push({
                metric: 'duration',
                change: durationChange,
                threshold: thresholds.duration
            });
        } else if (durationChange < -thresholds.duration) {
            regression.improvements.push({
                metric: 'duration',
                change: durationChange
            });
        }

        // 메모리 회귀 검사
        if (currentResult.statistics.memory && baselineResult.statistics.memory) {
            const memoryChange = (currentResult.statistics.memory.avg - baselineResult.statistics.memory.avg) / baselineResult.statistics.memory.avg;
            
            if (memoryChange > thresholds.memory) {
                regression.detected = true;
                regression.issues.push({
                    metric: 'memory',
                    change: memoryChange,
                    threshold: thresholds.memory
                });
            }
        }

        return regression;
    }

    // 보고서 생성
    generateReport() {
        const report = {
            timestamp: Date.now(),
            summary: {
                totalSuites: this.results.length,
                totalTests: this.results.reduce((sum, suite) => sum + suite.tests.length, 0),
                overallStatus: this.results.every(suite => suite.tests.every(test => test.status === 'completed')) ? 'passed' : 'failed'
            },
            suites: this.results,
            configuration: this.options,
            systemInfo: {
                nodeVersion: process.version,
                platform: process.platform,
                arch: process.arch,
                memory: process.memoryUsage()
            }
        };

        return report;
    }

    // 보고서 저장
    async saveReport(filePath) {
        const report = this.generateReport();
        await fs.writeFile(filePath, JSON.stringify(report, null, 2));
        return filePath;
    }

    // HTML 보고서 생성
    async generateHTMLReport(filePath) {
        const report = this.generateReport();
        const html = this.generateHTMLTemplate(report);
        await fs.writeFile(filePath, html);
        return filePath;
    }

    // HTML 템플릿 생성
    generateHTMLTemplate(report) {
        return `
<!DOCTYPE html>
<html>
<head>
    <title>Performance Benchmark Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .summary { background: #f5f5f5; padding: 15px; border-radius: 5px; }
        .test-suite { margin: 20px 0; border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
        .test { margin: 10px 0; padding: 10px; background: #fafafa; border-radius: 3px; }
        .passed { border-left: 4px solid #4CAF50; }
        .failed { border-left: 4px solid #f44336; }
        .metric { display: inline-block; margin: 5px 10px; }
        .chart { width: 100%; height: 200px; margin: 10px 0; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <h1>Performance Benchmark Report</h1>
    
    <div class="summary">
        <h2>Summary</h2>
        <p>Generated: ${new Date(report.timestamp).toLocaleString()}</p>
        <p>Total Suites: ${report.summary.totalSuites}</p>
        <p>Total Tests: ${report.summary.totalTests}</p>
        <p>Overall Status: ${report.summary.overallStatus}</p>
    </div>

    ${report.suites.map(suite => `
        <div class="test-suite">
            <h3>${suite.name}</h3>
            <p>Tests: ${suite.tests.length}</p>
            <p>Duration: ${suite.summary.totalDuration.toFixed(2)}ms</p>
            
            ${suite.tests.map(test => `
                <div class="test ${test.status}">
                    <h4>${test.name}</h4>
                    <div class="metric">Duration: ${test.statistics.duration?.avg.toFixed(2)}ms</div>
                    <div class="metric">Memory: ${test.statistics.memory?.avg.toFixed(2)} bytes</div>
                    <div class="metric">Error Rate: ${(test.statistics.errorRate * 100).toFixed(2)}%</div>
                </div>
            `).join('')}
        </div>
    `).join('')}

    <div class="summary">
        <h2>System Information</h2>
        <table>
            <tr><th>Property</th><th>Value</th></tr>
            <tr><td>Node Version</td><td>${report.systemInfo.nodeVersion}</td></tr>
            <tr><td>Platform</td><td>${report.systemInfo.platform}</td></tr>
            <tr><td>Architecture</td><td>${report.systemInfo.arch}</td></tr>
            <tr><td>Memory (RSS)</td><td>${(report.systemInfo.memory.rss / 1024 / 1024).toFixed(2)} MB</td></tr>
        </table>
    </div>
</body>
</html>
        `;
    }
}

// 사전 정의된 벤치마크 테스트 스위트
class BenchmarkSuites {
    static fileOperations() {
        return {
            name: 'File Operations',
            tests: [
                {
                    name: 'File Read Performance',
                    fn: async () => {
                        const filePath = '/tmp/test-file.txt';
                        await fs.writeFile(filePath, 'test content'.repeat(1000));
                        const startTime = performance.now();
                        await fs.readFile(filePath, 'utf8');
                        const endTime = performance.now();
                        await fs.unlink(filePath);
                        return { duration: endTime - startTime };
                    }
                },
                {
                    name: 'File Write Performance',
                    fn: async () => {
                        const filePath = '/tmp/test-write.txt';
                        const content = 'test content'.repeat(1000);
                        const startTime = performance.now();
                        await fs.writeFile(filePath, content);
                        const endTime = performance.now();
                        await fs.unlink(filePath);
                        return { duration: endTime - startTime };
                    }
                }
            ]
        };
    }

    static memoryOperations() {
        return {
            name: 'Memory Operations',
            tests: [
                {
                    name: 'Array Creation',
                    fn: async () => {
                        const startTime = performance.now();
                        const arr = new Array(100000).fill(0);
                        const endTime = performance.now();
                        return { duration: endTime - startTime };
                    }
                },
                {
                    name: 'Object Creation',
                    fn: async () => {
                        const startTime = performance.now();
                        const obj = {};
                        for (let i = 0; i < 10000; i++) {
                            obj[`key${i}`] = `value${i}`;
                        }
                        const endTime = performance.now();
                        return { duration: endTime - startTime };
                    }
                }
            ]
        };
    }

    static githubAPICache() {
        return {
            name: 'GitHub API Cache',
            tests: [
                {
                    name: 'Cache Hit Performance',
                    fn: async () => {
                        const cache = new GitHubAPICache();
                        await cache.init();
                        
                        const url = 'https://api.github.com/repos/test/test';
                        const data = { test: 'data' };
                        
                        await cache.set(url, data);
                        
                        const startTime = performance.now();
                        const result = await cache.get(url);
                        const endTime = performance.now();
                        
                        return { duration: endTime - startTime, throughput: 1 };
                    }
                }
            ]
        };
    }
}

export { PerformanceBenchmark, BenchmarkSuites };