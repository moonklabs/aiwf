#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { createHash } from 'crypto';

/**
 * 템플릿 버전 관리 시스템
 * - 템플릿 버전 추적 및 비교
 * - 자동 업데이트 확인
 * - 버전 충돌 해결
 * - 롤백 기능
 */
class TemplateVersionManager {
    constructor(options = {}) {
        this.options = {
            versionsFile: options.versionsFile || path.join(process.env.HOME || process.env.USERPROFILE, '.aiwf', 'cache', 'versions.json'),
            updateCheckInterval: options.updateCheckInterval || 24 * 60 * 60 * 1000, // 24시간
            maxVersionsToKeep: options.maxVersionsToKeep || 5,
            autoUpdate: options.autoUpdate || false,
            notifications: options.notifications !== false
        };
        
        this.versions = null;
        this.cache = null;
        this.downloader = null;
        this.offlineDetector = null;
    }

    /**
     * 의존성 주입
     */
    setCache(cache) {
        this.cache = cache;
    }
    
    setDownloader(downloader) {
        this.downloader = downloader;
    }
    
    setOfflineDetector(detector) {
        this.offlineDetector = detector;
    }

    /**
     * 버전 관리자 초기화
     */
    async init() {
        await this.loadVersions();
        
        // 자동 업데이트 체크 스케줄링
        if (this.options.autoUpdate) {
            this.scheduleUpdateCheck();
        }
        
        console.log('Template version manager initialized');
    }

    /**
     * 버전 정보 로드
     */
    async loadVersions() {
        try {
            const versionsData = await fs.readFile(this.options.versionsFile, 'utf8');
            this.versions = JSON.parse(versionsData);
        } catch (error) {
            // 버전 파일이 없으면 새로 생성
            this.versions = {
                metadata: {
                    version: '1.0.0',
                    created_at: new Date().toISOString(),
                    last_check: null
                },
                templates: {
                    'ai-tools': {},
                    'projects': {}
                },
                update_history: []
            };
            await this.saveVersions();
        }
    }

    /**
     * 버전 정보 저장
     */
    async saveVersions() {
        const versionsDir = path.dirname(this.options.versionsFile);
        await fs.mkdir(versionsDir, { recursive: true });
        await fs.writeFile(this.options.versionsFile, JSON.stringify(this.versions, null, 2));
    }

    /**
     * 현재 템플릿 버전 등록
     */
    async registerTemplateVersion(type, name, version, metadata = {}) {
        const templateKey = `${type}/${name}`;
        
        if (!this.versions.templates[type]) {
            this.versions.templates[type] = {};
        }
        
        if (!this.versions.templates[type][name]) {
            this.versions.templates[type][name] = {
                versions: [],
                current_version: null,
                last_updated: null
            };
        }
        
        const templateInfo = this.versions.templates[type][name];
        const versionInfo = {
            version,
            timestamp: new Date().toISOString(),
            checksum: metadata.checksum || null,
            size: metadata.size || null,
            cached: metadata.cached || false,
            metadata: metadata.metadata || {}
        };
        
        // 중복 버전 확인
        const existingIndex = templateInfo.versions.findIndex(v => v.version === version);
        if (existingIndex !== -1) {
            templateInfo.versions[existingIndex] = versionInfo;
        } else {
            templateInfo.versions.push(versionInfo);
        }
        
        // 버전 정렬 (최신 순)
        templateInfo.versions.sort((a, b) => this.compareVersions(b.version, a.version));
        
        // 최대 보관 버전 수 제한
        if (templateInfo.versions.length > this.options.maxVersionsToKeep) {
            templateInfo.versions = templateInfo.versions.slice(0, this.options.maxVersionsToKeep);
        }
        
        // 현재 버전 업데이트
        templateInfo.current_version = version;
        templateInfo.last_updated = new Date().toISOString();
        
        await this.saveVersions();
        
        return versionInfo;
    }

    /**
     * 템플릿 버전 조회
     */
    getTemplateVersion(type, name, version = null) {
        const templateInfo = this.versions.templates[type]?.[name];
        
        if (!templateInfo) {
            return null;
        }
        
        if (version) {
            return templateInfo.versions.find(v => v.version === version);
        }
        
        return {
            current: templateInfo.current_version,
            versions: templateInfo.versions,
            lastUpdated: templateInfo.last_updated
        };
    }

    /**
     * 사용 가능한 업데이트 확인
     */
    async checkForUpdates() {
        if (!this.downloader) {
            throw new Error('Template downloader not configured');
        }
        
        const updates = await this.downloader.checkForUpdates();
        const updateInfo = {
            timestamp: new Date().toISOString(),
            updates: [],
            errors: []
        };
        
        for (const update of updates) {
            try {
                const currentVersion = this.getTemplateVersion(update.type, update.name);
                
                updateInfo.updates.push({
                    ...update,
                    currentVersionInfo: currentVersion,
                    needsUpdate: !currentVersion || 
                        this.compareVersions(update.availableVersion, currentVersion.current) > 0
                });
            } catch (error) {
                updateInfo.errors.push({
                    template: `${update.type}/${update.name}`,
                    error: error.message
                });
            }
        }
        
        // 업데이트 기록 저장
        this.versions.metadata.last_check = updateInfo.timestamp;
        this.versions.update_history.unshift(updateInfo);
        
        // 업데이트 히스토리 제한
        if (this.versions.update_history.length > 10) {
            this.versions.update_history = this.versions.update_history.slice(0, 10);
        }
        
        await this.saveVersions();
        
        return updateInfo;
    }

    /**
     * 버전 비교 (semantic versioning)
     */
    compareVersions(version1, version2) {
        const parseVersion = (version) => {
            return version.split('.').map(num => parseInt(num, 10));
        };
        
        const v1Parts = parseVersion(version1);
        const v2Parts = parseVersion(version2);
        const maxLength = Math.max(v1Parts.length, v2Parts.length);
        
        for (let i = 0; i < maxLength; i++) {
            const v1Part = v1Parts[i] || 0;
            const v2Part = v2Parts[i] || 0;
            
            if (v1Part > v2Part) return 1;
            if (v1Part < v2Part) return -1;
        }
        
        return 0;
    }

    /**
     * 템플릿 업데이트 실행
     */
    async updateTemplate(type, name, version = null) {
        if (!this.downloader) {
            throw new Error('Template downloader not configured');
        }
        
        try {
            const currentVersion = this.getTemplateVersion(type, name);
            
            // 버전 지정하지 않으면 최신 버전 사용
            if (!version) {
                const availableTemplates = await this.downloader.scanAvailableTemplates();
                const templateInfo = availableTemplates[type]?.[name];
                
                if (!templateInfo) {
                    throw new Error(`Template ${type}/${name} not found`);
                }
                
                version = templateInfo.version;
            }
            
            // 이미 최신 버전인지 확인
            if (currentVersion && currentVersion.current === version) {
                return {
                    success: false,
                    message: `Template ${type}/${name} is already at version ${version}`,
                    currentVersion: currentVersion.current
                };
            }
            
            // 이전 버전 백업
            const backupInfo = currentVersion ? {
                version: currentVersion.current,
                timestamp: new Date().toISOString()
            } : null;
            
            // 새 버전 다운로드
            const downloadResult = await this.downloader.downloadSingleTemplate(type, name, version);
            
            // 버전 정보 등록
            await this.registerTemplateVersion(type, name, version, {
                checksum: downloadResult.checksum,
                size: downloadResult.size,
                cached: true,
                metadata: {
                    backup: backupInfo,
                    download_result: downloadResult
                }
            });
            
            return {
                success: true,
                message: `Template ${type}/${name} updated to version ${version}`,
                previousVersion: currentVersion?.current || null,
                newVersion: version,
                downloadResult
            };
            
        } catch (error) {
            console.error(`Failed to update template ${type}/${name}:`, error.message);
            throw error;
        }
    }

    /**
     * 템플릿 롤백
     */
    async rollbackTemplate(type, name, targetVersion = null) {
        const templateInfo = this.versions.templates[type]?.[name];
        
        if (!templateInfo) {
            throw new Error(`Template ${type}/${name} not found`);
        }
        
        // 롤백 대상 버전 결정
        let rollbackVersion;
        if (targetVersion) {
            rollbackVersion = templateInfo.versions.find(v => v.version === targetVersion);
            if (!rollbackVersion) {
                throw new Error(`Version ${targetVersion} not found for template ${type}/${name}`);
            }
        } else {
            // 이전 버전으로 롤백
            const currentIndex = templateInfo.versions.findIndex(v => v.version === templateInfo.current_version);
            if (currentIndex === -1 || currentIndex === templateInfo.versions.length - 1) {
                throw new Error(`No previous version available for rollback`);
            }
            rollbackVersion = templateInfo.versions[currentIndex + 1];
        }
        
        // 롤백 실행
        if (rollbackVersion.cached) {
            // 캐시된 버전 사용
            templateInfo.current_version = rollbackVersion.version;
            templateInfo.last_updated = new Date().toISOString();
            
            await this.saveVersions();
            
            return {
                success: true,
                message: `Template ${type}/${name} rolled back to version ${rollbackVersion.version}`,
                rolledBackFrom: templateInfo.current_version,
                rolledBackTo: rollbackVersion.version
            };
        } else {
            throw new Error(`Version ${rollbackVersion.version} is not cached, cannot rollback`);
        }
    }

    /**
     * 버전 히스토리 조회
     */
    getVersionHistory(type, name) {
        const templateInfo = this.versions.templates[type]?.[name];
        
        if (!templateInfo) {
            return null;
        }
        
        return {
            current: templateInfo.current_version,
            lastUpdated: templateInfo.last_updated,
            versions: templateInfo.versions.map(v => ({
                version: v.version,
                timestamp: v.timestamp,
                cached: v.cached,
                size: v.size,
                checksum: v.checksum
            }))
        };
    }

    /**
     * 자동 업데이트 체크 스케줄링
     */
    scheduleUpdateCheck() {
        setInterval(async () => {
            if (this.offlineDetector && !await this.offlineDetector.isOnline()) {
                console.log('Skipping update check - offline');
                return;
            }
            
            try {
                const updateInfo = await this.checkForUpdates();
                const availableUpdates = updateInfo.updates.filter(u => u.needsUpdate);
                
                if (availableUpdates.length > 0 && this.options.notifications) {
                    console.log(`📦 ${availableUpdates.length} template updates available`);
                    
                    if (this.options.autoUpdate) {
                        console.log('🔄 Auto-updating templates...');
                        await this.updateAllTemplates();
                    }
                }
            } catch (error) {
                console.error('Failed to check for updates:', error.message);
            }
        }, this.options.updateCheckInterval);
    }

    /**
     * 모든 템플릿 업데이트
     */
    async updateAllTemplates() {
        const updateInfo = await this.checkForUpdates();
        const availableUpdates = updateInfo.updates.filter(u => u.needsUpdate);
        const results = [];
        
        for (const update of availableUpdates) {
            try {
                const result = await this.updateTemplate(update.type, update.name, update.availableVersion);
                results.push({
                    ...update,
                    success: true,
                    result
                });
            } catch (error) {
                results.push({
                    ...update,
                    success: false,
                    error: error.message
                });
            }
        }
        
        const successCount = results.filter(r => r.success).length;
        const failCount = results.filter(r => !r.success).length;
        
        console.log(`✅ ${successCount} templates updated successfully`);
        if (failCount > 0) {
            console.log(`❌ ${failCount} templates failed to update`);
        }
        
        return results;
    }

    /**
     * 버전 관리 통계
     */
    getStats() {
        const stats = {
            totalTemplates: 0,
            totalVersions: 0,
            cachedVersions: 0,
            lastCheck: this.versions.metadata.last_check,
            updateHistory: this.versions.update_history.length
        };
        
        for (const type of ['ai-tools', 'projects']) {
            const templates = this.versions.templates[type];
            
            for (const [name, templateInfo] of Object.entries(templates)) {
                stats.totalTemplates++;
                stats.totalVersions += templateInfo.versions.length;
                stats.cachedVersions += templateInfo.versions.filter(v => v.cached).length;
            }
        }
        
        return stats;
    }

    /**
     * 버전 정보 정리
     */
    async cleanup() {
        let removedVersions = 0;
        
        for (const type of ['ai-tools', 'projects']) {
            const templates = this.versions.templates[type];
            
            for (const [name, templateInfo] of Object.entries(templates)) {
                const before = templateInfo.versions.length;
                
                // 캐시되지 않은 오래된 버전 제거
                templateInfo.versions = templateInfo.versions.filter((v, index) => {
                    if (index < 2) return true; // 최신 2개 버전은 유지
                    return v.cached; // 캐시된 버전만 유지
                });
                
                removedVersions += before - templateInfo.versions.length;
            }
        }
        
        await this.saveVersions();
        
        return {
            removedVersions,
            message: `Cleaned up ${removedVersions} old version entries`
        };
    }
}

export { TemplateVersionManager };