#!/usr/bin/env node

import { performance } from 'perf_hooks';
import fs from 'fs/promises';
import path from 'path';

/**
 * 메모리 프로파일링 및 최적화 시스템
 * - 실시간 메모리 사용량 추적
 * - 메모리 누수 감지
 * - 가비지 컬렉션 최적화
 */
class MemoryProfiler {
    constructor(options = {}) {
        this.samplingInterval = options.samplingInterval || 1000; // 1초
        this.maxSamples = options.maxSamples || 1000;
        this.thresholds = {
            heapUsed: options.heapThreshold || 100 * 1024 * 1024, // 100MB
            heapTotal: options.heapTotalThreshold || 200 * 1024 * 1024, // 200MB
            external: options.externalThreshold || 50 * 1024 * 1024, // 50MB
            rss: options.rssThreshold || 500 * 1024 * 1024 // 500MB
        };
        
        this.samples = [];
        this.alerts = [];
        this.profiling = false;
        this.intervalId = null;
        this.snapshots = new Map();
        this.objectLeakDetector = new ObjectLeakDetector();
    }

    // 프로파일링 시작
    startProfiling() {
        if (this.profiling) {
            return;
        }

        this.profiling = true;
        this.intervalId = setInterval(() => {
            this.takeSample();
        }, this.samplingInterval);

        console.log('Memory profiling started');
    }

    // 프로파일링 중지
    stopProfiling() {
        if (!this.profiling) {
            return;
        }

        this.profiling = false;
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }

        console.log('Memory profiling stopped');
    }

    // 메모리 샘플 수집
    takeSample() {
        const memoryUsage = process.memoryUsage();
        const performanceMetrics = this.getPerformanceMetrics();
        
        const sample = {
            timestamp: Date.now(),
            memory: memoryUsage,
            performance: performanceMetrics,
            gc: this.getGCStats()
        };

        this.samples.push(sample);
        
        // 최대 샘플 수 제한
        if (this.samples.length > this.maxSamples) {
            this.samples.shift();
        }

        // 임계값 확인
        this.checkThresholds(sample);
        
        // 메모리 누수 감지
        this.detectMemoryLeaks(sample);
    }

    // 성능 메트릭 수집
    getPerformanceMetrics() {
        const entries = performance.getEntriesByType('measure');
        const metrics = {
            totalMeasures: entries.length,
            averageDuration: 0,
            maxDuration: 0,
            minDuration: Infinity
        };

        if (entries.length > 0) {
            const durations = entries.map(entry => entry.duration);
            metrics.averageDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
            metrics.maxDuration = Math.max(...durations);
            metrics.minDuration = Math.min(...durations);
        }

        return metrics;
    }

    // GC 통계 수집
    getGCStats() {
        // V8 GC 정보 (Node.js 14+)
        if (global.gc && typeof global.gc.getHeapStatistics === 'function') {
            return global.gc.getHeapStatistics();
        }
        
        return {
            totalHeapSize: 0,
            usedHeapSize: 0,
            heapSizeLimit: 0
        };
    }

    // 임계값 확인
    checkThresholds(sample) {
        const { memory } = sample;
        const alerts = [];

        Object.entries(this.thresholds).forEach(([key, threshold]) => {
            if (memory[key] > threshold) {
                alerts.push({
                    type: 'threshold_exceeded',
                    metric: key,
                    value: memory[key],
                    threshold,
                    timestamp: sample.timestamp
                });
            }
        });

        if (alerts.length > 0) {
            this.alerts.push(...alerts);
            this.triggerAlerts(alerts);
        }
    }

    // 메모리 누수 감지
    detectMemoryLeaks(sample) {
        const recentSamples = this.samples.slice(-10); // 최근 10개 샘플
        
        if (recentSamples.length < 10) {
            return;
        }

        // 메모리 사용량 추세 분석
        const heapTrend = this.calculateTrend(recentSamples.map(s => s.memory.heapUsed));
        const rssTrend = this.calculateTrend(recentSamples.map(s => s.memory.rss));

        // 지속적인 메모리 증가 감지
        if (heapTrend > 0.05 || rssTrend > 0.05) { // 5% 이상 증가
            this.alerts.push({
                type: 'memory_leak_suspected',
                heapTrend,
                rssTrend,
                timestamp: sample.timestamp
            });
        }
    }

    // 추세 계산
    calculateTrend(values) {
        if (values.length < 2) return 0;
        
        const first = values[0];
        const last = values[values.length - 1];
        
        return (last - first) / first;
    }

    // 알림 발생
    triggerAlerts(alerts) {
        alerts.forEach(alert => {
            console.warn(`Memory Alert: ${alert.type}`, alert);
        });
    }

    // 메모리 스냅샷 생성
    createSnapshot(label) {
        const snapshot = {
            label,
            timestamp: Date.now(),
            memory: process.memoryUsage(),
            objectCounts: this.objectLeakDetector.getObjectCounts()
        };

        this.snapshots.set(label, snapshot);
        return snapshot;
    }

    // 스냅샷 비교
    compareSnapshots(label1, label2) {
        const snapshot1 = this.snapshots.get(label1);
        const snapshot2 = this.snapshots.get(label2);

        if (!snapshot1 || !snapshot2) {
            throw new Error('Snapshot not found');
        }

        const comparison = {
            timeDiff: snapshot2.timestamp - snapshot1.timestamp,
            memoryDiff: {},
            objectDiff: {}
        };

        // 메모리 사용량 차이
        Object.keys(snapshot1.memory).forEach(key => {
            comparison.memoryDiff[key] = snapshot2.memory[key] - snapshot1.memory[key];
        });

        // 객체 수 차이
        Object.keys(snapshot1.objectCounts).forEach(key => {
            comparison.objectDiff[key] = (snapshot2.objectCounts[key] || 0) - (snapshot1.objectCounts[key] || 0);
        });

        return comparison;
    }

    // 메모리 최적화 제안
    getOptimizationSuggestions() {
        const suggestions = [];
        const currentMemory = process.memoryUsage();
        const recentSamples = this.samples.slice(-10);

        // 높은 메모리 사용량
        if (currentMemory.heapUsed > this.thresholds.heapUsed) {
            suggestions.push({
                type: 'high_memory_usage',
                suggestion: 'Consider running garbage collection or optimizing data structures',
                priority: 'high'
            });
        }

        // 메모리 누수 의심
        if (recentSamples.length > 0) {
            const heapTrend = this.calculateTrend(recentSamples.map(s => s.memory.heapUsed));
            if (heapTrend > 0.1) {
                suggestions.push({
                    type: 'memory_leak',
                    suggestion: 'Potential memory leak detected. Review object references and event listeners',
                    priority: 'critical'
                });
            }
        }

        // 외부 메모리 사용량
        if (currentMemory.external > this.thresholds.external) {
            suggestions.push({
                type: 'external_memory',
                suggestion: 'High external memory usage. Review Buffer and C++ addon usage',
                priority: 'medium'
            });
        }

        return suggestions;
    }

    // 가비지 컬렉션 강제 실행
    forceGarbageCollection() {
        if (global.gc) {
            const beforeGC = process.memoryUsage();
            global.gc();
            const afterGC = process.memoryUsage();
            
            return {
                before: beforeGC,
                after: afterGC,
                freed: {
                    heapUsed: beforeGC.heapUsed - afterGC.heapUsed,
                    heapTotal: beforeGC.heapTotal - afterGC.heapTotal,
                    external: beforeGC.external - afterGC.external,
                    rss: beforeGC.rss - afterGC.rss
                }
            };
        }
        
        return null;
    }

    // 메모리 사용량 보고서 생성
    generateReport() {
        const currentMemory = process.memoryUsage();
        const recentSamples = this.samples.slice(-100); // 최근 100개 샘플
        
        const report = {
            timestamp: Date.now(),
            current: currentMemory,
            statistics: this.calculateStatistics(recentSamples),
            alerts: this.alerts.slice(-10), // 최근 10개 알림
            suggestions: this.getOptimizationSuggestions(),
            snapshots: Array.from(this.snapshots.keys())
        };

        return report;
    }

    // 통계 계산
    calculateStatistics(samples) {
        if (samples.length === 0) {
            return {};
        }

        const stats = {
            heapUsed: { min: Infinity, max: 0, avg: 0 },
            heapTotal: { min: Infinity, max: 0, avg: 0 },
            external: { min: Infinity, max: 0, avg: 0 },
            rss: { min: Infinity, max: 0, avg: 0 }
        };

        samples.forEach(sample => {
            Object.keys(stats).forEach(key => {
                const value = sample.memory[key];
                stats[key].min = Math.min(stats[key].min, value);
                stats[key].max = Math.max(stats[key].max, value);
                stats[key].avg += value;
            });
        });

        // 평균 계산
        Object.keys(stats).forEach(key => {
            stats[key].avg /= samples.length;
        });

        return stats;
    }

    // 보고서를 파일로 저장
    async saveReport(filePath) {
        const report = this.generateReport();
        await fs.writeFile(filePath, JSON.stringify(report, null, 2));
        return filePath;
    }

    // 메모리 사용량 모니터링
    monitor(duration = 60000) { // 1분 기본
        return new Promise((resolve) => {
            this.startProfiling();
            
            setTimeout(() => {
                this.stopProfiling();
                resolve(this.generateReport());
            }, duration);
        });
    }
}

// 객체 누수 감지기
class ObjectLeakDetector {
    constructor() {
        this.objectCounts = new Map();
        this.tracking = false;
    }

    startTracking() {
        this.tracking = true;
        this.objectCounts.clear();
    }

    stopTracking() {
        this.tracking = false;
    }

    // 객체 수 추적
    trackObject(type, operation = 'create') {
        if (!this.tracking) return;

        const current = this.objectCounts.get(type) || 0;
        
        if (operation === 'create') {
            this.objectCounts.set(type, current + 1);
        } else if (operation === 'destroy') {
            this.objectCounts.set(type, Math.max(0, current - 1));
        }
    }

    // 현재 객체 수 반환
    getObjectCounts() {
        return Object.fromEntries(this.objectCounts);
    }

    // 누수 의심 객체 찾기
    findLeakingObjects(threshold = 1000) {
        const leaking = [];
        
        for (const [type, count] of this.objectCounts) {
            if (count > threshold) {
                leaking.push({ type, count });
            }
        }
        
        return leaking;
    }
}

// 메모리 최적화 유틸리티
class MemoryOptimizer {
    static async optimizeForLargeFiles(filePath, chunkSize = 64 * 1024) {
        const stat = await fs.stat(filePath);
        
        if (stat.size > 100 * 1024 * 1024) { // 100MB 이상
            // 스트리밍 처리 권장
            return {
                recommendation: 'streaming',
                reason: 'File size exceeds 100MB',
                chunkSize
            };
        }
        
        return {
            recommendation: 'buffer',
            reason: 'File size is manageable for buffer processing'
        };
    }

    static optimizeDataStructures(data) {
        // 메모리 효율적인 데이터 구조 제안
        if (Array.isArray(data)) {
            if (data.length > 10000) {
                return {
                    recommendation: 'Use Set or Map for better performance',
                    reason: 'Large array detected'
                };
            }
        }

        if (typeof data === 'object' && data !== null) {
            const keys = Object.keys(data);
            if (keys.length > 1000) {
                return {
                    recommendation: 'Consider using Map instead of Object',
                    reason: 'Large object with many properties'
                };
            }
        }

        return {
            recommendation: 'Current data structure is optimal',
            reason: 'Size is within acceptable limits'
        };
    }

    static async cleanupTemporaryFiles(tmpDir = '/tmp') {
        const files = await fs.readdir(tmpDir);
        const cleanedFiles = [];

        for (const file of files) {
            const filePath = path.join(tmpDir, file);
            try {
                const stat = await fs.stat(filePath);
                
                // 1시간 이상 된 임시 파일 삭제
                if (Date.now() - stat.mtime.getTime() > 3600000) {
                    await fs.unlink(filePath);
                    cleanedFiles.push(filePath);
                }
            } catch (error) {
                // 파일 삭제 실패는 무시
            }
        }

        return cleanedFiles;
    }
}

export { MemoryProfiler, ObjectLeakDetector, MemoryOptimizer };