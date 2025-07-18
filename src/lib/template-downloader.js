#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { EventEmitter } from 'events';

/**
 * 템플릿 다운로드 시스템
 * - AI 도구 및 프로젝트 템플릿 다운로드
 * - 선택적 다운로드 및 배치 처리
 * - 진행률 추적 및 재시도 메커니즘
 * - 버전 관리 및 증분 업데이트
 */
class TemplateDownloader extends EventEmitter {
    constructor(options = {}) {
        super();
        
        this.options = {
            // 다운로드 설정
            batchSize: options.batchSize || 3,
            retryCount: options.retryCount || 3,
            retryDelay: options.retryDelay || 1000,
            timeout: options.timeout || 30000,
            
            // 소스 경로
            aiToolsPath: options.aiToolsPath || '.aiwf/ai-tools',
            projectsPath: options.projectsPath || '.aiwf/templates',
            
            // 진행률 콜백
            onProgress: options.onProgress || null,
            onComplete: options.onComplete || null,
            onError: options.onError || null
        };
        
        this.state = {
            downloading: false,
            progress: {
                total: 0,
                completed: 0,
                failed: 0,
                current: null
            },
            results: []
        };
        
        this.cache = null; // TemplateCache 인스턴스
        this.offlineDetector = null; // OfflineDetector 인스턴스
    }

    /**
     * 캐시 및 오프라인 감지기 연결
     */
    setCache(cache) {
        this.cache = cache;
    }
    
    setOfflineDetector(detector) {
        this.offlineDetector = detector;
    }

    /**
     * 사용 가능한 템플릿 스캔
     */
    async scanAvailableTemplates() {
        const templates = {
            'ai-tools': {},
            'projects': {}
        };
        
        try {
            // AI 도구 템플릿 스캔
            const aiToolsDir = this.options.aiToolsPath;
            const aiTools = await fs.readdir(aiToolsDir);
            
            for (const tool of aiTools) {
                const toolPath = path.join(aiToolsDir, tool);
                const stat = await fs.stat(toolPath);
                
                if (stat.isDirectory()) {
                    const configPath = path.join(toolPath, 'config.json');
                    try {
                        const config = JSON.parse(await fs.readFile(configPath, 'utf8'));
                        templates['ai-tools'][tool] = {
                            name: config.name || tool,
                            version: config.version || '1.0.0',
                            description: config.description || '',
                            size: await this.getDirectorySize(toolPath),
                            path: toolPath,
                            config
                        };
                    } catch (error) {
                        console.warn(`Invalid config for AI tool ${tool}:`, error.message);
                    }
                }
            }
            
            // 프로젝트 템플릿 스캔
            const projectsDir = this.options.projectsPath;
            const projects = await fs.readdir(projectsDir);
            
            for (const project of projects) {
                const projectPath = path.join(projectsDir, project);
                const stat = await fs.stat(projectPath);
                
                if (stat.isDirectory() && project !== 'README.md') {
                    const configPath = path.join(projectPath, 'config.json');
                    try {
                        const config = JSON.parse(await fs.readFile(configPath, 'utf8'));
                        templates['projects'][project] = {
                            name: config.name || project,
                            version: config.version || '1.0.0',
                            description: config.description || '',
                            size: await this.getDirectorySize(projectPath),
                            path: projectPath,
                            config
                        };
                    } catch (error) {
                        console.warn(`Invalid config for project ${project}:`, error.message);
                    }
                }
            }
            
        } catch (error) {
            console.error('Failed to scan templates:', error.message);
        }
        
        return templates;
    }

    /**
     * 디렉토리 크기 계산
     */
    async getDirectorySize(dirPath) {
        let totalSize = 0;
        
        try {
            const files = await fs.readdir(dirPath);
            
            for (const file of files) {
                const filePath = path.join(dirPath, file);
                const stat = await fs.stat(filePath);
                
                if (stat.isDirectory()) {
                    totalSize += await this.getDirectorySize(filePath);
                } else {
                    totalSize += stat.size;
                }
            }
        } catch (error) {
            console.warn(`Failed to calculate size for ${dirPath}:`, error.message);
        }
        
        return totalSize;
    }

    /**
     * 선택적 템플릿 다운로드
     */
    async downloadSelectedTemplates(selections) {
        if (this.state.downloading) {
            throw new Error('Download already in progress');
        }
        
        this.state.downloading = true;
        this.state.progress = {
            total: selections.length,
            completed: 0,
            failed: 0,
            current: null
        };
        this.state.results = [];
        
        try {
            // 병렬 다운로드 처리
            const batches = this.createBatches(selections);
            
            for (const batch of batches) {
                const batchPromises = batch.map(selection => 
                    this.downloadSingleTemplate(selection.type, selection.name, selection.version)
                );
                
                const batchResults = await Promise.allSettled(batchPromises);
                
                for (let i = 0; i < batchResults.length; i++) {
                    const result = batchResults[i];
                    const selection = batch[i];
                    
                    if (result.status === 'fulfilled') {
                        this.state.progress.completed++;
                        this.state.results.push({
                            ...selection,
                            success: true,
                            result: result.value
                        });
                    } else {
                        this.state.progress.failed++;
                        this.state.results.push({
                            ...selection,
                            success: false,
                            error: result.reason.message
                        });
                    }
                    
                    // 진행률 이벤트 발생
                    this.emit('progress', {
                        ...this.state.progress,
                        percentage: (this.state.progress.completed / this.state.progress.total) * 100
                    });
                }
            }
            
            const summary = {
                total: this.state.progress.total,
                completed: this.state.progress.completed,
                failed: this.state.progress.failed,
                results: this.state.results
            };
            
            this.emit('complete', summary);
            
            if (this.options.onComplete) {
                this.options.onComplete(summary);
            }
            
            return summary;
            
        } finally {
            this.state.downloading = false;
        }
    }

    /**
     * 배치 생성
     */
    createBatches(items) {
        const batches = [];
        
        for (let i = 0; i < items.length; i += this.options.batchSize) {
            batches.push(items.slice(i, i + this.options.batchSize));
        }
        
        return batches;
    }

    /**
     * 단일 템플릿 다운로드
     */
    async downloadSingleTemplate(type, name, version = '1.0.0') {
        this.state.progress.current = { type, name, version };
        
        this.emit('templateStart', { type, name, version });
        
        try {
            // 소스 경로 확인
            const sourcePath = this.getTemplatePath(type, name);
            const exists = await this.directoryExists(sourcePath);
            
            if (!exists) {
                throw new Error(`Template source not found: ${sourcePath}`);
            }
            
            // 캐시에 저장
            const result = await this.cache.cacheTemplate(type, name, sourcePath, version);
            
            this.emit('templateComplete', { type, name, version, result });
            
            return result;
            
        } catch (error) {
            this.emit('templateError', { type, name, version, error: error.message });
            throw error;
        }
    }

    /**
     * 템플릿 소스 경로 반환
     */
    getTemplatePath(type, name) {
        if (type === 'ai-tools') {
            return path.join(this.options.aiToolsPath, name);
        } else {
            return path.join(this.options.projectsPath, name);
        }
    }

    /**
     * 디렉토리 존재 확인
     */
    async directoryExists(dirPath) {
        try {
            const stat = await fs.stat(dirPath);
            return stat.isDirectory();
        } catch {
            return false;
        }
    }

    /**
     * 모든 템플릿 다운로드
     */
    async downloadAllTemplates() {
        const templates = await this.scanAvailableTemplates();
        const selections = [];
        
        // AI 도구 추가
        for (const [name, info] of Object.entries(templates['ai-tools'])) {
            selections.push({
                type: 'ai-tools',
                name,
                version: info.version
            });
        }
        
        // 프로젝트 템플릿 추가
        for (const [name, info] of Object.entries(templates['projects'])) {
            selections.push({
                type: 'projects',
                name,
                version: info.version
            });
        }
        
        return await this.downloadSelectedTemplates(selections);
    }

    /**
     * 특정 타입의 템플릿만 다운로드
     */
    async downloadTemplatesByType(type) {
        const templates = await this.scanAvailableTemplates();
        const selections = [];
        
        if (templates[type]) {
            for (const [name, info] of Object.entries(templates[type])) {
                selections.push({
                    type,
                    name,
                    version: info.version
                });
            }
        }
        
        return await this.downloadSelectedTemplates(selections);
    }

    /**
     * 업데이트 필요한 템플릿 확인
     */
    async checkForUpdates() {
        const availableTemplates = await this.scanAvailableTemplates();
        const cachedTemplates = await this.cache.listTemplates();
        const updates = [];
        
        for (const type of ['ai-tools', 'projects']) {
            const available = availableTemplates[type];
            const cached = cachedTemplates[type];
            
            for (const [name, info] of Object.entries(available)) {
                const cachedInfo = cached[name];
                
                if (!cachedInfo) {
                    updates.push({
                        type,
                        name,
                        status: 'new',
                        currentVersion: null,
                        availableVersion: info.version
                    });
                } else if (this.isVersionNewer(info.version, cachedInfo.version)) {
                    updates.push({
                        type,
                        name,
                        status: 'update',
                        currentVersion: cachedInfo.version,
                        availableVersion: info.version
                    });
                }
            }
        }
        
        return updates;
    }

    /**
     * 버전 비교 (간단한 semantic versioning)
     */
    isVersionNewer(newVersion, currentVersion) {
        const parseVersion = (version) => {
            return version.split('.').map(num => parseInt(num, 10));
        };
        
        const newParts = parseVersion(newVersion);
        const currentParts = parseVersion(currentVersion);
        
        for (let i = 0; i < Math.max(newParts.length, currentParts.length); i++) {
            const newPart = newParts[i] || 0;
            const currentPart = currentParts[i] || 0;
            
            if (newPart > currentPart) return true;
            if (newPart < currentPart) return false;
        }
        
        return false;
    }

    /**
     * 다운로드 진행률 정보
     */
    getProgress() {
        return {
            ...this.state.progress,
            percentage: this.state.progress.total > 0 
                ? (this.state.progress.completed / this.state.progress.total) * 100 
                : 0,
            downloading: this.state.downloading
        };
    }

    /**
     * 다운로드 중단
     */
    cancel() {
        if (this.state.downloading) {
            this.state.downloading = false;
            this.emit('cancelled');
        }
    }

    /**
     * 재시도 다운로드
     */
    async retryFailedDownloads() {
        const failedResults = this.state.results.filter(result => !result.success);
        
        if (failedResults.length === 0) {
            return { message: 'No failed downloads to retry' };
        }
        
        const retrySelections = failedResults.map(result => ({
            type: result.type,
            name: result.name,
            version: result.version
        }));
        
        return await this.downloadSelectedTemplates(retrySelections);
    }

    /**
     * 다운로드 통계
     */
    getStats() {
        const totalResults = this.state.results.length;
        const successCount = this.state.results.filter(r => r.success).length;
        const failureCount = this.state.results.filter(r => !r.success).length;
        
        return {
            totalAttempts: totalResults,
            successCount,
            failureCount,
            successRate: totalResults > 0 ? (successCount / totalResults * 100).toFixed(2) + '%' : '0%',
            downloading: this.state.downloading,
            progress: this.getProgress()
        };
    }
}

export { TemplateDownloader };