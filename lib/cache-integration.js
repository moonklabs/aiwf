#!/usr/bin/env node

import { GitHubAPICache } from './cache-system.js';
import { TemplateCache } from './template-cache-system.js';
import { OfflineDetector } from './offline-detector.js';

/**
 * S02 캐시 시스템과 T16 템플릿 캐시 시스템 통합
 * - 통합 캐시 전략 구현
 * - 성능 최적화 및 공유 자원 관리
 * - 일관된 캐시 정책 적용
 */
class IntegratedCacheSystem {
    constructor(options = {}) {
        this.options = {
            // 공통 캐시 설정
            cacheDir: options.cacheDir || '.aiwf/cache',
            maxTotalSize: options.maxTotalSize || 200 * 1024 * 1024, // 200MB
            
            // GitHub API 캐시 설정
            githubApiTtl: options.githubApiTtl || 300000, // 5분
            
            // 템플릿 캐시 설정
            templateCacheMaxSize: options.templateCacheMaxSize || 100 * 1024 * 1024, // 100MB
            
            // 오프라인 감지 설정
            offlineCheckInterval: options.offlineCheckInterval || 30000, // 30초
            
            // 통합 정책
            priorityOrder: options.priorityOrder || ['templates', 'github-api'],
            cleanupSchedule: options.cleanupSchedule || 60 * 60 * 1000 // 1시간
        };
        
        // 각 캐시 시스템 초기화
        this.githubCache = new GitHubAPICache(
            `${this.options.cacheDir}/github-api`,
            this.options.githubApiTtl
        );
        
        this.templateCache = new TemplateCache({
            cacheDir: this.options.cacheDir,
            maxCacheSize: this.options.templateCacheMaxSize
        });
        
        this.offlineDetector = new OfflineDetector({
            checkInterval: this.options.offlineCheckInterval
        });
        
        // 캐시 시스템 연결
        this.offlineDetector.setCache(this.templateCache);
        
        // 통합 상태
        this.stats = {
            totalSize: 0,
            githubApiSize: 0,
            templateCacheSize: 0,
            lastCleanup: null,
            operationCount: 0
        };
        
        this.cleanupTimer = null;
    }

    /**
     * 통합 캐시 시스템 초기화
     */
    async init() {
        try {
            // 각 캐시 시스템 초기화
            await this.githubCache.init();
            await this.templateCache.init();
            await this.offlineDetector.start();
            
            // 초기 통계 계산
            await this.calculateStats();
            
            // 정기 정리 스케줄 시작
            this.startCleanupSchedule();
            
            console.log('Integrated cache system initialized');
            
        } catch (error) {
            console.error('Failed to initialize integrated cache system:', error.message);
            throw error;
        }
    }

    /**
     * 통합 캐시 통계 계산
     */
    async calculateStats() {
        try {
            const githubStats = this.githubCache.getStats();
            const templateStats = this.templateCache.getStats();
            
            this.stats = {
                totalSize: templateStats.totalSize + (githubStats.memorySize * 1024), // 대략적 계산
                githubApiSize: githubStats.memorySize * 1024,
                templateCacheSize: templateStats.totalSize,
                lastCleanup: this.stats.lastCleanup,
                operationCount: this.stats.operationCount,
                
                // 세부 통계
                githubCache: githubStats,
                templateCache: templateStats,
                network: this.offlineDetector.getNetworkStats()
            };
            
        } catch (error) {
            console.warn('Failed to calculate cache stats:', error.message);
        }
    }

    /**
     * GitHub API 캐시 래퍼 (오프라인 감지 포함)
     */
    async getGitHubData(url, headers = {}) {
        this.stats.operationCount++;
        
        try {
            // 온라인 상태 확인
            const isOnline = await this.offlineDetector.isOnline();
            
            if (!isOnline) {
                // 오프라인 모드에서는 캐시만 사용
                const cachedData = await this.githubCache.get(url, headers);
                if (cachedData) {
                    return cachedData;
                }
                throw new Error('Data not available offline');
            }
            
            // 온라인 상태에서는 정상적인 캐시 로직 사용
            return await this.githubCache.getOrFetch(url, async () => {
                const response = await fetch(url, { headers });
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                return await response.json();
            }, headers);
            
        } catch (error) {
            console.error(`GitHub API cache error for ${url}:`, error.message);
            throw error;
        }
    }

    /**
     * 템플릿 캐시 래퍼 (통합 크기 관리)
     */
    async cacheTemplate(type, name, sourcePath, version = '1.0.0') {
        this.stats.operationCount++;
        
        try {
            // 전체 캐시 크기 확인
            await this.calculateStats();
            
            if (this.stats.totalSize > this.options.maxTotalSize) {
                console.warn('Total cache size limit exceeded, cleaning up...');
                await this.smartCleanup();
            }
            
            return await this.templateCache.cacheTemplate(type, name, sourcePath, version);
            
        } catch (error) {
            console.error(`Template cache error for ${type}/${name}:`, error.message);
            throw error;
        }
    }

    /**
     * 템플릿 가져오기 (오프라인 지원)
     */
    async getTemplate(type, name, version = '1.0.0') {
        this.stats.operationCount++;
        
        try {
            return await this.templateCache.getTemplate(type, name, version);
        } catch (error) {
            console.error(`Template retrieval error for ${type}/${name}:`, error.message);
            throw error;
        }
    }

    /**
     * 템플릿 추출 (오프라인 지원)
     */
    async extractTemplate(type, name, targetPath, version = '1.0.0') {
        this.stats.operationCount++;
        
        try {
            return await this.templateCache.extractToDirectory(type, name, targetPath, version);
        } catch (error) {
            console.error(`Template extraction error for ${type}/${name}:`, error.message);
            throw error;
        }
    }

    /**
     * 스마트 캐시 정리 (우선순위 기반)
     */
    async smartCleanup() {
        try {
            let freedSpace = 0;
            const cleanupResults = [];
            
            // 우선순위 순서대로 정리
            for (const priority of this.options.priorityOrder) {
                if (this.stats.totalSize <= this.options.maxTotalSize * 0.8) {
                    break; // 80% 이하로 줄어들면 중단
                }
                
                if (priority === 'github-api') {
                    const result = await this.githubCache.cleanup();
                    cleanupResults.push({
                        type: 'github-api',
                        ...result
                    });
                    freedSpace += result.expiredMemoryKeys * 1024; // 대략적 계산
                    
                } else if (priority === 'templates') {
                    const result = await this.templateCache.cleanup();
                    cleanupResults.push({
                        type: 'templates',
                        ...result
                    });
                    freedSpace += result.freedSpace;
                }
            }
            
            // 통계 업데이트
            await this.calculateStats();
            this.stats.lastCleanup = new Date().toISOString();
            
            console.log(`Smart cleanup completed. Freed ${this.formatBytes(freedSpace)}`);
            
            return {
                freedSpace,
                results: cleanupResults,
                newTotalSize: this.stats.totalSize
            };
            
        } catch (error) {
            console.error('Smart cleanup failed:', error.message);
            throw error;
        }
    }

    /**
     * 정기 정리 스케줄 시작
     */
    startCleanupSchedule() {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
        }
        
        this.cleanupTimer = setInterval(async () => {
            try {
                await this.calculateStats();
                
                if (this.stats.totalSize > this.options.maxTotalSize * 0.9) {
                    console.log('Scheduled cleanup triggered');
                    await this.smartCleanup();
                }
            } catch (error) {
                console.error('Scheduled cleanup failed:', error.message);
            }
        }, this.options.cleanupSchedule);
    }

    /**
     * 통합 캐시 초기화
     */
    async clearAll() {
        try {
            await this.githubCache.clear();
            await this.templateCache.clear();
            await this.calculateStats();
            
            return {
                success: true,
                message: 'All caches cleared successfully'
            };
            
        } catch (error) {
            console.error('Failed to clear all caches:', error.message);
            throw error;
        }
    }

    /**
     * 통합 상태 정보
     */
    async getIntegratedStats() {
        await this.calculateStats();
        
        return {
            ...this.stats,
            totalSizeFormatted: this.formatBytes(this.stats.totalSize),
            maxSizeFormatted: this.formatBytes(this.options.maxTotalSize),
            usagePercentage: ((this.stats.totalSize / this.options.maxTotalSize) * 100).toFixed(2) + '%',
            
            breakdown: {
                githubApi: {
                    size: this.stats.githubApiSize,
                    sizeFormatted: this.formatBytes(this.stats.githubApiSize),
                    percentage: ((this.stats.githubApiSize / this.stats.totalSize) * 100).toFixed(2) + '%'
                },
                templates: {
                    size: this.stats.templateCacheSize,
                    sizeFormatted: this.formatBytes(this.stats.templateCacheSize),
                    percentage: ((this.stats.templateCacheSize / this.stats.totalSize) * 100).toFixed(2) + '%'
                }
            }
        };
    }

    /**
     * 오프라인 사용 가능 여부 확인
     */
    async isAvailableOffline(type, resource) {
        try {
            if (type === 'template') {
                const [templateType, name, version] = resource.split('/');
                return await this.templateCache.getTemplate(templateType, name, version) !== null;
            }
            
            if (type === 'github-api') {
                return await this.githubCache.get(resource) !== null;
            }
            
            return false;
            
        } catch (error) {
            console.error(`Offline availability check failed for ${type}/${resource}:`, error.message);
            return false;
        }
    }

    /**
     * 캐시 동기화 (네트워크 복구 시)
     */
    async synchronize() {
        try {
            const isOnline = await this.offlineDetector.isOnline();
            
            if (!isOnline) {
                console.log('Cannot synchronize - offline');
                return { synchronized: false, reason: 'offline' };
            }
            
            // GitHub API 캐시 정리 (만료된 것들 제거)
            await this.githubCache.cleanup();
            
            // 템플릿 캐시 크기 제한 확인
            await this.templateCache.checkSizeLimit();
            
            // 통계 업데이트
            await this.calculateStats();
            
            console.log('Cache synchronization completed');
            
            return {
                synchronized: true,
                stats: this.stats
            };
            
        } catch (error) {
            console.error('Cache synchronization failed:', error.message);
            return { synchronized: false, reason: error.message };
        }
    }

    /**
     * 바이트 포맷팅
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * 시스템 종료
     */
    async shutdown() {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
        }
        
        this.offlineDetector.stop();
        
        console.log('Integrated cache system shutdown');
    }
}

export { IntegratedCacheSystem };