#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { createHash } from 'crypto';

/**
 * GitHub API 캐싱 시스템
 * - API 호출 결과를 메모리와 디스크에 캐싱
 * - TTL 기반 캐시 만료 처리
 * - 중복 요청 방지
 */
class GitHubAPICache {
    constructor(cacheDir = '.aiwf/cache', ttl = 300000) { // 5분 TTL
        this.cacheDir = cacheDir;
        this.ttl = ttl;
        this.memoryCache = new Map();
        this.pendingRequests = new Map();
        this.stats = {
            hits: 0,
            misses: 0,
            requests: 0
        };
    }

    async init() {
        try {
            await fs.mkdir(this.cacheDir, { recursive: true });
        } catch (error) {
            console.warn('Failed to create cache directory:', error.message);
        }
    }

    // 캐시 키 생성
    generateCacheKey(url, headers = {}) {
        const keyData = JSON.stringify({ url, headers });
        return createHash('sha256').update(keyData).digest('hex');
    }

    // 메모리 캐시에서 가져오기
    getFromMemory(key) {
        const cached = this.memoryCache.get(key);
        if (cached && Date.now() - cached.timestamp < this.ttl) {
            this.stats.hits++;
            return cached.data;
        }
        return null;
    }

    // 디스크 캐시에서 가져오기
    async getFromDisk(key) {
        try {
            const cachePath = path.join(this.cacheDir, `${key}.json`);
            const cacheData = await fs.readFile(cachePath, 'utf8');
            const cached = JSON.parse(cacheData);
            
            if (Date.now() - cached.timestamp < this.ttl) {
                // 메모리 캐시에도 저장
                this.memoryCache.set(key, cached);
                this.stats.hits++;
                return cached.data;
            } else {
                // 만료된 캐시 삭제
                await fs.unlink(cachePath).catch(() => {});
            }
        } catch (error) {
            // 캐시 파일이 없거나 읽기 실패
        }
        return null;
    }

    // 캐시에 저장
    async saveToCache(key, data) {
        const cacheEntry = {
            data,
            timestamp: Date.now()
        };

        // 메모리 캐시에 저장
        this.memoryCache.set(key, cacheEntry);

        // 디스크 캐시에 저장
        try {
            const cachePath = path.join(this.cacheDir, `${key}.json`);
            await fs.writeFile(cachePath, JSON.stringify(cacheEntry, null, 2));
        } catch (error) {
            console.warn('Failed to save to disk cache:', error.message);
        }
    }

    // 캐시된 데이터 가져오기
    async get(url, headers = {}) {
        const key = this.generateCacheKey(url, headers);
        
        // 메모리 캐시 확인
        let cachedData = this.getFromMemory(key);
        if (cachedData) {
            return cachedData;
        }

        // 디스크 캐시 확인
        cachedData = await this.getFromDisk(key);
        if (cachedData) {
            return cachedData;
        }

        this.stats.misses++;
        return null;
    }

    // 캐시에 저장
    async set(url, data, headers = {}) {
        const key = this.generateCacheKey(url, headers);
        await this.saveToCache(key, data);
    }

    // 중복 요청 방지
    async getOrFetch(url, fetchFunction, headers = {}) {
        const key = this.generateCacheKey(url, headers);
        this.stats.requests++;

        // 캐시에서 확인
        const cachedData = await this.get(url, headers);
        if (cachedData) {
            return cachedData;
        }

        // 이미 진행 중인 요청이 있는지 확인
        if (this.pendingRequests.has(key)) {
            return await this.pendingRequests.get(key);
        }

        // 새로운 요청 시작
        const fetchPromise = fetchFunction().then(async (data) => {
            await this.set(url, data, headers);
            this.pendingRequests.delete(key);
            return data;
        }).catch((error) => {
            this.pendingRequests.delete(key);
            throw error;
        });

        this.pendingRequests.set(key, fetchPromise);
        return await fetchPromise;
    }

    // 캐시 통계
    getStats() {
        return {
            ...this.stats,
            hitRate: this.stats.requests > 0 ? (this.stats.hits / this.stats.requests * 100).toFixed(2) + '%' : '0%',
            memorySize: this.memoryCache.size,
            cacheDir: this.cacheDir
        };
    }

    // 캐시 정리
    async cleanup() {
        const now = Date.now();
        const expiredKeys = [];

        // 메모리 캐시 정리
        for (const [key, cached] of this.memoryCache.entries()) {
            if (now - cached.timestamp >= this.ttl) {
                expiredKeys.push(key);
            }
        }

        expiredKeys.forEach(key => this.memoryCache.delete(key));

        // 디스크 캐시 정리
        try {
            const files = await fs.readdir(this.cacheDir);
            for (const file of files) {
                if (file.endsWith('.json')) {
                    const filePath = path.join(this.cacheDir, file);
                    try {
                        const stat = await fs.stat(filePath);
                        if (now - stat.mtime.getTime() >= this.ttl) {
                            await fs.unlink(filePath);
                        }
                    } catch (error) {
                        // 파일 삭제 실패는 무시
                    }
                }
            }
        } catch (error) {
            // 디렉토리 읽기 실패는 무시
        }

        return {
            expiredMemoryKeys: expiredKeys.length,
            message: `Cleaned up ${expiredKeys.length} expired cache entries`
        };
    }

    // 전체 캐시 초기화
    async clear() {
        this.memoryCache.clear();
        this.stats = { hits: 0, misses: 0, requests: 0 };

        try {
            const files = await fs.readdir(this.cacheDir);
            for (const file of files) {
                if (file.endsWith('.json')) {
                    await fs.unlink(path.join(this.cacheDir, file));
                }
            }
        } catch (error) {
            // 디렉토리 읽기 실패는 무시
        }
    }
}

// 배치 처리를 위한 GitHub API 클라이언트
class OptimizedGitHubClient {
    constructor(baseUrl = 'https://api.github.com', cacheOptions = {}) {
        this.baseUrl = baseUrl;
        this.cache = new GitHubAPICache(cacheOptions.cacheDir, cacheOptions.ttl);
        this.rateLimiter = new RateLimiter(60, 60000); // 60 requests per minute
        this.batchQueue = [];
        this.batchTimeout = null;
    }

    async init() {
        await this.cache.init();
    }

    // 캐시된 HTTP 요청
    async cachedFetch(url, options = {}) {
        const headers = { 'User-Agent': 'aiwf', ...options.headers };
        
        return await this.cache.getOrFetch(url, async () => {
            // Rate limiting
            await this.rateLimiter.waitForNext();
            
            const response = await fetch(url, { ...options, headers });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            return await response.json();
        }, headers);
    }

    // 배치 요청 처리
    async batchRequest(urls, options = {}) {
        const results = [];
        const batchSize = options.batchSize || 5;
        
        for (let i = 0; i < urls.length; i += batchSize) {
            const batch = urls.slice(i, i + batchSize);
            const batchPromises = batch.map(url => this.cachedFetch(url, options));
            
            try {
                const batchResults = await Promise.allSettled(batchPromises);
                results.push(...batchResults);
            } catch (error) {
                console.error('Batch request failed:', error);
                results.push(...batch.map(() => ({ status: 'rejected', reason: error })));
            }
        }
        
        return results;
    }

    // 디렉토리 구조 가져오기 (캐시 적용)
    async getDirectoryStructure(repoPath, dirPath = '') {
        const url = `${this.baseUrl}/repos/${repoPath}/contents/${dirPath}`;
        return await this.cachedFetch(url);
    }

    // 파일 내용 가져오기 (캐시 적용)
    async getFileContent(repoPath, filePath) {
        const url = `${this.baseUrl}/repos/${repoPath}/contents/${filePath}`;
        return await this.cachedFetch(url);
    }

    // 통계 정보
    getStats() {
        return {
            cache: this.cache.getStats(),
            rateLimit: this.rateLimiter.getStats()
        };
    }

    // 캐시 정리
    async cleanup() {
        return await this.cache.cleanup();
    }
}

// Rate Limiter 클래스
class RateLimiter {
    constructor(maxRequests, timeWindow) {
        this.maxRequests = maxRequests;
        this.timeWindow = timeWindow;
        this.requests = [];
        this.stats = { totalRequests: 0, throttledRequests: 0 };
    }

    async waitForNext() {
        const now = Date.now();
        
        // 시간 윈도우를 벗어난 요청 제거
        this.requests = this.requests.filter(time => now - time < this.timeWindow);
        
        if (this.requests.length >= this.maxRequests) {
            const oldestRequest = Math.min(...this.requests);
            const waitTime = this.timeWindow - (now - oldestRequest);
            
            if (waitTime > 0) {
                this.stats.throttledRequests++;
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
        }
        
        this.requests.push(now);
        this.stats.totalRequests++;
    }

    getStats() {
        return {
            ...this.stats,
            currentRequests: this.requests.length,
            maxRequests: this.maxRequests,
            timeWindow: this.timeWindow
        };
    }
}

export { GitHubAPICache, OptimizedGitHubClient, RateLimiter };