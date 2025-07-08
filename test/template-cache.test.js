#!/usr/bin/env node

import { TemplateCache } from '../lib/template-cache-system.js';
import { OfflineDetector } from '../lib/offline-detector.js';
import { TemplateDownloader } from '../lib/template-downloader.js';
import { TemplateVersionManager } from '../lib/template-version-manager.js';
import { IntegratedCacheSystem } from '../lib/cache-integration.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * 오프라인 템플릿 캐시 시스템 테스트
 */
class TemplateCacheSystemTest {
    constructor() {
        this.testDir = path.join(__dirname, 'test-cache');
        this.results = [];
    }

    async init() {
        // 테스트 디렉토리 생성
        await fs.mkdir(this.testDir, { recursive: true });
        
        // 임시 템플릿 파일 생성
        await this.createTestTemplates();
        
        console.log('🧪 Template Cache System Test Suite');
        console.log('─'.repeat(50));
    }

    async createTestTemplates() {
        // AI 도구 템플릿 생성
        const aiToolsDir = path.join(this.testDir, 'ai-tools', 'claude-code');
        await fs.mkdir(aiToolsDir, { recursive: true });
        
        await fs.writeFile(
            path.join(aiToolsDir, 'config.json'),
            JSON.stringify({
                name: 'claude-code',
                version: '1.0.0',
                description: 'Claude Code integration'
            }, null, 2)
        );
        
        await fs.writeFile(
            path.join(aiToolsDir, 'template.md'),
            '# Claude Code Template\n\nThis is a test template for Claude Code integration.'
        );
        
        // 프로젝트 템플릿 생성
        const projectsDir = path.join(this.testDir, 'projects', 'web-app');
        await fs.mkdir(projectsDir, { recursive: true });
        
        await fs.writeFile(
            path.join(projectsDir, 'config.json'),
            JSON.stringify({
                name: 'web-app',
                version: '1.0.0',
                description: 'Web application template'
            }, null, 2)
        );
        
        await fs.writeFile(
            path.join(projectsDir, 'package.json'),
            JSON.stringify({
                name: 'test-web-app',
                version: '1.0.0',
                description: 'Test web application'
            }, null, 2)
        );
    }

    async test(testName, testFunction) {
        try {
            console.log(`\n🔍 ${testName}...`);
            const result = await testFunction();
            
            if (result.success) {
                console.log(`✅ ${testName} - PASSED`);
                this.results.push({ name: testName, status: 'PASSED', details: result.details });
            } else {
                console.log(`❌ ${testName} - FAILED: ${result.error}`);
                this.results.push({ name: testName, status: 'FAILED', error: result.error });
            }
        } catch (error) {
            console.log(`❌ ${testName} - ERROR: ${error.message}`);
            this.results.push({ name: testName, status: 'ERROR', error: error.message });
        }
    }

    async testTemplateCache() {
        return await this.test('Template Cache Basic Operations', async () => {
            const cache = new TemplateCache({
                cacheDir: path.join(this.testDir, 'cache')
            });
            
            await cache.init();
            
            // 템플릿 캐시 테스트
            const result = await cache.cacheTemplate(
                'ai-tools',
                'claude-code',
                path.join(this.testDir, 'ai-tools', 'claude-code'),
                '1.0.0'
            );
            
            if (!result.success) {
                return { success: false, error: 'Failed to cache template' };
            }
            
            // 캐시된 템플릿 가져오기
            const cached = await cache.getTemplate('ai-tools', 'claude-code', '1.0.0');
            
            if (!cached) {
                return { success: false, error: 'Failed to retrieve cached template' };
            }
            
            // 통계 확인
            const stats = cache.getStats();
            
            return {
                success: true,
                details: {
                    cacheSize: stats.totalSize,
                    templatesCount: stats.templatesCount,
                    checksum: result.checksum
                }
            };
        });
    }

    async testOfflineDetector() {
        return await this.test('Offline Detector', async () => {
            const detector = new OfflineDetector({
                checkInterval: 5000,
                timeout: 2000
            });
            
            await detector.start();
            
            // 네트워크 상태 확인
            const isOnline = await detector.isOnline();
            const connectionInfo = detector.getConnectionInfo();
            const networkStats = detector.getNetworkStats();
            
            detector.stop();
            
            return {
                success: true,
                details: {
                    isOnline,
                    connectionInfo,
                    networkStats
                }
            };
        });
    }

    async testTemplateDownloader() {
        return await this.test('Template Downloader', async () => {
            const cache = new TemplateCache({
                cacheDir: path.join(this.testDir, 'cache')
            });
            
            const downloader = new TemplateDownloader({
                aiToolsPath: path.join(this.testDir, 'ai-tools'),
                projectsPath: path.join(this.testDir, 'projects')
            });
            
            await cache.init();
            downloader.setCache(cache);
            
            // 사용 가능한 템플릿 스캔
            const templates = await downloader.scanAvailableTemplates();
            
            if (!templates['ai-tools']['claude-code']) {
                return { success: false, error: 'claude-code template not found' };
            }
            
            // 선택적 다운로드 테스트
            const selections = [
                { type: 'ai-tools', name: 'claude-code', version: '1.0.0' },
                { type: 'projects', name: 'web-app', version: '1.0.0' }
            ];
            
            const result = await downloader.downloadSelectedTemplates(selections);
            
            if (result.failed > 0) {
                return { success: false, error: `${result.failed} downloads failed` };
            }
            
            return {
                success: true,
                details: {
                    availableTemplates: Object.keys(templates['ai-tools']).length + Object.keys(templates['projects']).length,
                    downloadedTemplates: result.completed,
                    downloadResults: result.results
                }
            };
        });
    }

    async testVersionManager() {
        return await this.test('Version Manager', async () => {
            const cache = new TemplateCache({
                cacheDir: path.join(this.testDir, 'cache')
            });
            
            const downloader = new TemplateDownloader({
                aiToolsPath: path.join(this.testDir, 'ai-tools'),
                projectsPath: path.join(this.testDir, 'projects')
            });
            
            const versionManager = new TemplateVersionManager({
                versionsFile: path.join(this.testDir, 'versions.json')
            });
            
            await cache.init();
            downloader.setCache(cache);
            versionManager.setCache(cache);
            versionManager.setDownloader(downloader);
            
            await versionManager.init();
            
            // 버전 등록 테스트
            await versionManager.registerTemplateVersion(
                'ai-tools',
                'claude-code',
                '1.0.0',
                {
                    checksum: 'test-checksum',
                    size: 1024,
                    cached: true
                }
            );
            
            // 버전 조회 테스트
            const versionInfo = versionManager.getTemplateVersion('ai-tools', 'claude-code');
            
            if (!versionInfo || versionInfo.current !== '1.0.0') {
                return { success: false, error: 'Version registration failed' };
            }
            
            // 버전 히스토리 조회
            const history = versionManager.getVersionHistory('ai-tools', 'claude-code');
            
            return {
                success: true,
                details: {
                    currentVersion: versionInfo.current,
                    versionsCount: history.versions.length,
                    lastUpdated: versionInfo.lastUpdated
                }
            };
        });
    }

    async testIntegratedCacheSystem() {
        return await this.test('Integrated Cache System', async () => {
            const integratedCache = new IntegratedCacheSystem({
                cacheDir: path.join(this.testDir, 'integrated-cache'),
                maxTotalSize: 10 * 1024 * 1024, // 10MB
                templateCacheMaxSize: 5 * 1024 * 1024 // 5MB
            });
            
            await integratedCache.init();
            
            // 템플릿 캐시 테스트
            const cacheResult = await integratedCache.cacheTemplate(
                'ai-tools',
                'claude-code',
                path.join(this.testDir, 'ai-tools', 'claude-code'),
                '1.0.0'
            );
            
            if (!cacheResult.success) {
                return { success: false, error: 'Integrated cache failed' };
            }
            
            // 통합 상태 확인
            const stats = await integratedCache.getIntegratedStats();
            
            // 동기화 테스트
            const syncResult = await integratedCache.synchronize();
            
            await integratedCache.shutdown();
            
            return {
                success: true,
                details: {
                    totalSize: stats.totalSize,
                    usagePercentage: stats.usagePercentage,
                    synchronized: syncResult.synchronized
                }
            };
        });
    }

    async testCacheCleanup() {
        return await this.test('Cache Cleanup and Management', async () => {
            const cache = new TemplateCache({
                cacheDir: path.join(this.testDir, 'cleanup-cache'),
                maxCacheSize: 1024 * 1024 // 1MB
            });
            
            await cache.init();
            
            // 여러 템플릿 캐시
            await cache.cacheTemplate(
                'ai-tools',
                'claude-code',
                path.join(this.testDir, 'ai-tools', 'claude-code'),
                '1.0.0'
            );
            
            await cache.cacheTemplate(
                'projects',
                'web-app',
                path.join(this.testDir, 'projects', 'web-app'),
                '1.0.0'
            );
            
            // 초기 상태 확인
            const initialStats = cache.getStats();
            
            // 캐시 정리 테스트
            const cleanupResult = await cache.cleanup();
            
            // 정리 후 상태 확인
            const finalStats = cache.getStats();
            
            // 전체 캐시 초기화 테스트
            const clearResult = await cache.clear();
            
            return {
                success: true,
                details: {
                    initialSize: initialStats.totalSize,
                    cleanupResult,
                    finalSize: finalStats.totalSize,
                    clearResult
                }
            };
        });
    }

    async runAllTests() {
        await this.init();
        
        // 모든 테스트 실행
        await this.testTemplateCache();
        await this.testOfflineDetector();
        await this.testTemplateDownloader();
        await this.testVersionManager();
        await this.testIntegratedCacheSystem();
        await this.testCacheCleanup();
        
        // 결과 요약
        this.displayResults();
        
        // 테스트 디렉토리 정리
        await this.cleanup();
    }

    displayResults() {
        console.log('\n📊 Test Results Summary');
        console.log('─'.repeat(50));
        
        const passed = this.results.filter(r => r.status === 'PASSED').length;
        const failed = this.results.filter(r => r.status === 'FAILED').length;
        const errors = this.results.filter(r => r.status === 'ERROR').length;
        
        console.log(`✅ PASSED: ${passed}`);
        console.log(`❌ FAILED: ${failed}`);
        console.log(`⚠️  ERROR: ${errors}`);
        console.log(`📋 TOTAL: ${this.results.length}`);
        
        if (failed > 0 || errors > 0) {
            console.log('\n🔍 Failed Tests:');
            this.results
                .filter(r => r.status !== 'PASSED')
                .forEach(r => {
                    console.log(`   ${r.name}: ${r.error}`);
                });
        }
        
        const successRate = (passed / this.results.length * 100).toFixed(1);
        console.log(`\n🎯 Success Rate: ${successRate}%`);
    }

    async cleanup() {
        try {
            await fs.rm(this.testDir, { recursive: true, force: true });
            console.log('\n🧹 Test cleanup completed');
        } catch (error) {
            console.warn('⚠️  Test cleanup failed:', error.message);
        }
    }
}

// 테스트 실행
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const test = new TemplateCacheSystemTest();
    test.runAllTests().catch(console.error);
}

export { TemplateCacheSystemTest };