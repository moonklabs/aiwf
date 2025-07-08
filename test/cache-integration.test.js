#!/usr/bin/env node

import { writeFile, mkdir, rm } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * 캐시 시스템 기본 통합 테스트
 */
async function runBasicIntegrationTest() {
    console.log('🧪 Cache System Basic Integration Test');
    console.log('─'.repeat(50));
    
    let testsPassed = 0;
    let testsTotal = 0;
    
    // 테스트 1: 캐시 디렉토리 생성
    testsTotal++;
    try {
        const cacheDir = path.join(__dirname, 'temp-cache');
        await mkdir(cacheDir, { recursive: true });
        
        // 캐시 매니페스트 생성
        const manifest = {
            version: '1.0.0',
            templates: {
                'ai-tools': {},
                'projects': {}
            },
            last_update_check: new Date().toISOString()
        };
        
        await writeFile(
            path.join(cacheDir, 'manifest.json'),
            JSON.stringify(manifest, null, 2)
        );
        
        console.log('✅ Test 1: Cache directory creation - PASSED');
        testsPassed++;
        
        // 정리
        await rm(cacheDir, { recursive: true, force: true });
        
    } catch (error) {
        console.log(`❌ Test 1: Cache directory creation - FAILED: ${error.message}`);
    }
    
    // 테스트 2: 모듈 로딩 테스트
    testsTotal++;
    try {
        const { TemplateCache } = await import('../lib/template-cache-system.js');
        const { OfflineDetector } = await import('../lib/offline-detector.js');
        const { TemplateDownloader } = await import('../lib/template-downloader.js');
        const { TemplateVersionManager } = await import('../lib/template-version-manager.js');
        const { IntegratedCacheSystem } = await import('../lib/cache-integration.js');
        
        // 인스턴스 생성 테스트
        const cache = new TemplateCache();
        const detector = new OfflineDetector();
        const downloader = new TemplateDownloader();
        const versionManager = new TemplateVersionManager();
        const integrated = new IntegratedCacheSystem();
        
        console.log('✅ Test 2: Module loading - PASSED');
        testsPassed++;
        
    } catch (error) {
        console.log(`❌ Test 2: Module loading - FAILED: ${error.message}`);
    }
    
    // 테스트 3: CLI 명령어 가용성 테스트
    testsTotal++;
    try {
        const { CacheCLI } = await import('../lib/cache-cli.js');
        const cli = new CacheCLI();
        
        // 기본 메서드 존재 확인
        const requiredMethods = ['downloadCommand', 'listCommand', 'cleanCommand', 'updateCommand', 'statusCommand'];
        
        for (const method of requiredMethods) {
            if (typeof cli[method] !== 'function') {
                throw new Error(`Required method ${method} not found`);
            }
        }
        
        console.log('✅ Test 3: CLI command availability - PASSED');
        testsPassed++;
        
    } catch (error) {
        console.log(`❌ Test 3: CLI command availability - FAILED: ${error.message}`);
    }
    
    // 테스트 4: 설정 구조 검증
    testsTotal++;
    try {
        const { TemplateCache } = await import('../lib/template-cache-system.js');
        
        const cache = new TemplateCache({
            cacheDir: path.join(__dirname, 'test-config'),
            maxCacheSize: 50 * 1024 * 1024,
            compressionLevel: 6
        });
        
        // 설정 검증
        if (cache.maxCacheSize !== 50 * 1024 * 1024) {
            throw new Error('Configuration not properly applied');
        }
        
        console.log('✅ Test 4: Configuration structure - PASSED');
        testsPassed++;
        
    } catch (error) {
        console.log(`❌ Test 4: Configuration structure - FAILED: ${error.message}`);
    }
    
    // 결과 요약
    console.log('\n📊 Integration Test Results');
    console.log('─'.repeat(50));
    console.log(`✅ PASSED: ${testsPassed}/${testsTotal}`);
    console.log(`❌ FAILED: ${testsTotal - testsPassed}/${testsTotal}`);
    
    const successRate = (testsPassed / testsTotal * 100).toFixed(1);
    console.log(`🎯 Success Rate: ${successRate}%`);
    
    if (testsPassed === testsTotal) {
        console.log('\n🎉 All integration tests passed!');
        console.log('✅ Template cache system is ready for use');
    } else {
        console.log('\n⚠️  Some tests failed. Please check the implementation');
    }
}

// 테스트 실행
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    runBasicIntegrationTest().catch(console.error);
}

export { runBasicIntegrationTest };