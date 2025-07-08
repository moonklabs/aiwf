#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { createHash } from 'crypto';
import { createReadStream, createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { createGzip, createGunzip } from 'zlib';
import { promisify } from 'util';

/**
 * 오프라인 템플릿 캐시 시스템
 * - 모든 AI 도구 템플릿과 프로젝트 템플릿 캐시 관리
 * - 압축 저장으로 디스크 사용량 최적화
 * - 버전 관리 및 자동 업데이트
 * - 네트워크 상태 감지 및 오프라인 폴백
 */
class TemplateCache {
    constructor(options = {}) {
        this.cacheDir = options.cacheDir || path.join(process.env.HOME || process.env.USERPROFILE, '.aiwf', 'cache');
        this.templatesDir = path.join(this.cacheDir, 'templates');
        this.aiToolsDir = path.join(this.templatesDir, 'ai-tools');
        this.projectsDir = path.join(this.templatesDir, 'projects');
        this.manifestPath = path.join(this.cacheDir, 'manifest.json');
        this.lockPath = path.join(this.cacheDir, 'lock.json');
        
        // 기본 설정
        this.maxCacheSize = options.maxCacheSize || 100 * 1024 * 1024; // 100MB
        this.compressionLevel = options.compressionLevel || 6;
        this.updateCheckInterval = options.updateCheckInterval || 24 * 60 * 60 * 1000; // 24시간
        
        // 내부 상태
        this.manifest = null;
        this.lock = null;
        this.stats = {
            totalSize: 0,
            templatesCount: 0,
            lastUpdate: null,
            hitCount: 0,
            missCount: 0
        };
    }

    /**
     * 캐시 시스템 초기화
     */
    async init() {
        try {
            // 캐시 디렉토리 생성
            await fs.mkdir(this.cacheDir, { recursive: true });
            await fs.mkdir(this.templatesDir, { recursive: true });
            await fs.mkdir(this.aiToolsDir, { recursive: true });
            await fs.mkdir(this.projectsDir, { recursive: true });

            // 매니페스트 파일 로드 또는 생성
            await this.loadManifest();
            await this.loadLock();
            
            // 캐시 상태 계산
            await this.calculateStats();
            
            console.log('Template cache system initialized');
        } catch (error) {
            console.error('Failed to initialize template cache:', error.message);
            throw error;
        }
    }

    /**
     * 매니페스트 파일 로드
     */
    async loadManifest() {
        try {
            const manifestData = await fs.readFile(this.manifestPath, 'utf8');
            this.manifest = JSON.parse(manifestData);
        } catch (error) {
            // 매니페스트 파일이 없으면 새로 생성
            this.manifest = {
                version: '1.0.0',
                templates: {
                    'ai-tools': {},
                    'projects': {}
                },
                last_update_check: null,
                created_at: new Date().toISOString()
            };
            await this.saveManifest();
        }
    }

    /**
     * 락 파일 로드
     */
    async loadLock() {
        try {
            const lockData = await fs.readFile(this.lockPath, 'utf8');
            this.lock = JSON.parse(lockData);
        } catch (error) {
            this.lock = {
                locked: false,
                process_id: null,
                operation: null,
                timestamp: null
            };
            await this.saveLock();
        }
    }

    /**
     * 매니페스트 저장
     */
    async saveManifest() {
        await fs.writeFile(this.manifestPath, JSON.stringify(this.manifest, null, 2));
    }

    /**
     * 락 파일 저장
     */
    async saveLock() {
        await fs.writeFile(this.lockPath, JSON.stringify(this.lock, null, 2));
    }

    /**
     * 캐시 통계 계산
     */
    async calculateStats() {
        let totalSize = 0;
        let templatesCount = 0;

        const calculateDirectorySize = async (dir) => {
            try {
                const files = await fs.readdir(dir);
                let dirSize = 0;
                for (const file of files) {
                    const filePath = path.join(dir, file);
                    const stat = await fs.stat(filePath);
                    if (stat.isDirectory()) {
                        dirSize += await calculateDirectorySize(filePath);
                    } else {
                        dirSize += stat.size;
                        if (file.endsWith('.tar.gz')) {
                            templatesCount++;
                        }
                    }
                }
                return dirSize;
            } catch (error) {
                return 0;
            }
        };

        totalSize = await calculateDirectorySize(this.templatesDir);
        
        this.stats = {
            ...this.stats,
            totalSize,
            templatesCount,
            lastUpdate: this.manifest.last_update_check
        };
    }

    /**
     * 템플릿 캐시 키 생성
     */
    generateCacheKey(type, name, version = '1.0.0') {
        return `${type}/${name}@${version}`;
    }

    /**
     * 템플릿 압축 및 캐시 저장
     */
    async cacheTemplate(type, name, sourcePath, version = '1.0.0') {
        const cacheKey = this.generateCacheKey(type, name, version);
        const targetDir = type === 'ai-tools' ? this.aiToolsDir : this.projectsDir;
        const cacheFile = path.join(targetDir, `${name}@${version}.tar.gz`);
        
        try {
            // 디렉토리 압축
            await this.compressDirectory(sourcePath, cacheFile);
            
            // 체크섬 계산
            const checksum = await this.calculateChecksum(cacheFile);
            const stat = await fs.stat(cacheFile);
            
            // 매니페스트 업데이트
            this.manifest.templates[type][name] = {
                version,
                cached_at: new Date().toISOString(),
                size: stat.size,
                checksum,
                cache_file: cacheFile
            };
            
            await this.saveManifest();
            console.log(`Template cached: ${cacheKey}`);
            
            return {
                success: true,
                cacheKey,
                size: stat.size,
                checksum
            };
        } catch (error) {
            console.error(`Failed to cache template ${cacheKey}:`, error.message);
            throw error;
        }
    }

    /**
     * 템플릿 압축 (간단한 방식)
     */
    async compressDirectory(sourcePath, targetFile) {
        // Node.js 내장 zlib와 fs를 사용한 간단한 압축
        const { createGzip } = await import('zlib');
        const { createReadStream, createWriteStream } = await import('fs');
        
        // 디렉토리 내용을 JSON으로 직렬화
        const dirContents = await this.readDirectoryRecursive(sourcePath);
        const jsonData = JSON.stringify(dirContents, null, 2);
        
        // 압축하여 저장
        const gzip = createGzip();
        const input = Buffer.from(jsonData);
        const output = createWriteStream(targetFile);
        
        return new Promise((resolve, reject) => {
            gzip.pipe(output);
            gzip.on('error', reject);
            output.on('error', reject);
            output.on('finish', resolve);
            gzip.end(input);
        });
    }

    /**
     * 디렉토리 내용을 재귀적으로 읽기
     */
    async readDirectoryRecursive(dirPath) {
        const result = {};
        const items = await fs.readdir(dirPath);
        
        for (const item of items) {
            const itemPath = path.join(dirPath, item);
            const stat = await fs.stat(itemPath);
            
            if (stat.isDirectory()) {
                // node_modules와 .git 제외
                if (!item.includes('node_modules') && !item.includes('.git')) {
                    result[item] = await this.readDirectoryRecursive(itemPath);
                }
            } else {
                // 파일 내용 읽기
                try {
                    const content = await fs.readFile(itemPath, 'utf8');
                    result[item] = {
                        type: 'file',
                        content: content,
                        size: stat.size
                    };
                } catch (error) {
                    // 바이너리 파일은 base64로 저장
                    const content = await fs.readFile(itemPath);
                    result[item] = {
                        type: 'binary',
                        content: content.toString('base64'),
                        size: stat.size
                    };
                }
            }
        }
        
        return result;
    }

    /**
     * 템플릿 압축 해제
     */
    async extractTemplate(cacheFile, targetPath) {
        const { createGunzip } = await import('zlib');
        const { createReadStream } = await import('fs');
        
        // 압축 해제
        const gunzip = createGunzip();
        const input = createReadStream(cacheFile);
        
        return new Promise((resolve, reject) => {
            let data = '';
            
            input.pipe(gunzip);
            gunzip.on('data', chunk => data += chunk);
            gunzip.on('end', async () => {
                try {
                    const dirContents = JSON.parse(data);
                    await this.writeDirectoryRecursive(targetPath, dirContents);
                    resolve();
                } catch (error) {
                    reject(error);
                }
            });
            gunzip.on('error', reject);
            input.on('error', reject);
        });
    }

    /**
     * 디렉토리 내용을 재귀적으로 쓰기
     */
    async writeDirectoryRecursive(dirPath, contents) {
        await fs.mkdir(dirPath, { recursive: true });
        
        for (const [name, item] of Object.entries(contents)) {
            const itemPath = path.join(dirPath, name);
            
            if (item.type === 'file') {
                await fs.writeFile(itemPath, item.content, 'utf8');
            } else if (item.type === 'binary') {
                const buffer = Buffer.from(item.content, 'base64');
                await fs.writeFile(itemPath, buffer);
            } else {
                // 디렉토리
                await this.writeDirectoryRecursive(itemPath, item);
            }
        }
    }

    /**
     * 파일 체크섬 계산
     */
    async calculateChecksum(filePath) {
        return new Promise((resolve, reject) => {
            const hash = createHash('sha256');
            const stream = createReadStream(filePath);
            
            stream.on('error', reject);
            stream.on('data', chunk => hash.update(chunk));
            stream.on('end', () => resolve(hash.digest('hex')));
        });
    }

    /**
     * 캐시된 템플릿 가져오기
     */
    async getTemplate(type, name, version = '1.0.0') {
        const cacheKey = this.generateCacheKey(type, name, version);
        
        try {
            const templateInfo = this.manifest.templates[type][name];
            if (!templateInfo) {
                this.stats.missCount++;
                return null;
            }
            
            const cacheFile = templateInfo.cache_file;
            if (!await this.fileExists(cacheFile)) {
                this.stats.missCount++;
                return null;
            }
            
            // 체크섬 검증
            const currentChecksum = await this.calculateChecksum(cacheFile);
            if (currentChecksum !== templateInfo.checksum) {
                console.warn(`Checksum mismatch for ${cacheKey}, cache may be corrupted`);
                this.stats.missCount++;
                return null;
            }
            
            this.stats.hitCount++;
            return {
                cacheKey,
                cacheFile,
                templateInfo
            };
        } catch (error) {
            console.error(`Failed to get template ${cacheKey}:`, error.message);
            this.stats.missCount++;
            return null;
        }
    }

    /**
     * 템플릿을 대상 디렉토리로 추출
     */
    async extractToDirectory(type, name, targetPath, version = '1.0.0') {
        const template = await this.getTemplate(type, name, version);
        if (!template) {
            throw new Error(`Template ${type}/${name}@${version} not found in cache`);
        }
        
        await fs.mkdir(targetPath, { recursive: true });
        await this.extractTemplate(template.cacheFile, targetPath);
        
        return {
            success: true,
            extracted: true,
            targetPath,
            templateInfo: template.templateInfo
        };
    }

    /**
     * 파일 존재 확인
     */
    async fileExists(filePath) {
        try {
            await fs.access(filePath);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * 사용 가능한 템플릿 목록 조회
     */
    async listTemplates(type = null) {
        const result = {};
        
        if (type) {
            result[type] = this.manifest.templates[type] || {};
        } else {
            result['ai-tools'] = this.manifest.templates['ai-tools'] || {};
            result['projects'] = this.manifest.templates['projects'] || {};
        }
        
        return result;
    }

    /**
     * 캐시 정리
     */
    async cleanup(options = {}) {
        const maxAge = options.maxAge || 7 * 24 * 60 * 60 * 1000; // 7일
        const now = Date.now();
        let removedCount = 0;
        let freedSpace = 0;
        
        for (const type of ['ai-tools', 'projects']) {
            const templates = this.manifest.templates[type];
            
            for (const [name, templateInfo] of Object.entries(templates)) {
                const cachedAt = new Date(templateInfo.cached_at).getTime();
                
                if (now - cachedAt > maxAge) {
                    try {
                        await fs.unlink(templateInfo.cache_file);
                        freedSpace += templateInfo.size;
                        removedCount++;
                        delete templates[name];
                    } catch (error) {
                        console.warn(`Failed to remove expired cache: ${name}`, error.message);
                    }
                }
            }
        }
        
        await this.saveManifest();
        await this.calculateStats();
        
        return {
            removedCount,
            freedSpace,
            totalSize: this.stats.totalSize
        };
    }

    /**
     * 전체 캐시 초기화
     */
    async clear() {
        try {
            await fs.rm(this.templatesDir, { recursive: true, force: true });
            await fs.mkdir(this.templatesDir, { recursive: true });
            await fs.mkdir(this.aiToolsDir, { recursive: true });
            await fs.mkdir(this.projectsDir, { recursive: true });
            
            this.manifest.templates = {
                'ai-tools': {},
                'projects': {}
            };
            
            await this.saveManifest();
            await this.calculateStats();
            
            return {
                success: true,
                message: 'Cache cleared successfully'
            };
        } catch (error) {
            console.error('Failed to clear cache:', error.message);
            throw error;
        }
    }

    /**
     * 캐시 통계 정보
     */
    getStats() {
        return {
            ...this.stats,
            maxCacheSize: this.maxCacheSize,
            usagePercentage: ((this.stats.totalSize / this.maxCacheSize) * 100).toFixed(2) + '%',
            hitRate: this.stats.hitCount + this.stats.missCount > 0 
                ? ((this.stats.hitCount / (this.stats.hitCount + this.stats.missCount)) * 100).toFixed(2) + '%'
                : '0%'
        };
    }

    /**
     * 캐시 크기 제한 확인
     */
    async checkSizeLimit() {
        if (this.stats.totalSize > this.maxCacheSize) {
            // 가장 오래된 캐시부터 정리
            const templates = [];
            
            for (const type of ['ai-tools', 'projects']) {
                for (const [name, templateInfo] of Object.entries(this.manifest.templates[type])) {
                    templates.push({
                        type,
                        name,
                        ...templateInfo,
                        cachedAt: new Date(templateInfo.cached_at).getTime()
                    });
                }
            }
            
            templates.sort((a, b) => a.cachedAt - b.cachedAt);
            
            let currentSize = this.stats.totalSize;
            let removedCount = 0;
            
            for (const template of templates) {
                if (currentSize <= this.maxCacheSize * 0.8) break;
                
                try {
                    await fs.unlink(template.cache_file);
                    currentSize -= template.size;
                    removedCount++;
                    delete this.manifest.templates[template.type][template.name];
                } catch (error) {
                    console.warn(`Failed to remove cache: ${template.name}`, error.message);
                }
            }
            
            await this.saveManifest();
            await this.calculateStats();
            
            return {
                cleanedUp: true,
                removedCount,
                currentSize: this.stats.totalSize
            };
        }
        
        return { cleanedUp: false };
    }
}

export { TemplateCache };