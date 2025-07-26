#!/usr/bin/env node

/**
 * 의존성 검증 스크립트
 * 모든 import된 패키지가 package.json에 선언되어 있는지 확인
 */

import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';
import { builtinModules } from 'module';

// Node.js 내장 모듈 체크 함수
function isBuiltinModule(moduleName) {
    const rootModule = moduleName.split('/')[0];
    return builtinModules.includes(rootModule);
}

async function checkDependencies() {
    console.log('🔍 의존성 검증을 시작합니다...\n');
    
    try {
        // package.json 읽기
        const packageJson = JSON.parse(await fs.readFile('package.json', 'utf8'));
        const dependencies = {
            ...packageJson.dependencies,
            ...packageJson.devDependencies
        };
        
        // 모든 JS 파일 찾기 (템플릿 제외)
        const jsFiles = await glob('src/**/*.js', {
            ignore: ['src/lib/resources/templates/**/*.js']
        });
        
        const missingDeps = new Set();
        const foundImports = new Set();
        
        for (const file of jsFiles) {
            const content = await fs.readFile(file, 'utf8');
            
            // import 문 찾기
            const importMatches = content.match(/import\s+.*?\s+from\s+['"`]([^'"`]+)['"`]/g);
            if (importMatches) {
                for (const match of importMatches) {
                    const packageName = match.match(/from\s+['"`]([^'"`]+)['"`]/)[1];
                    
                    // 내장 모듈이나 상대 경로가 아닌 경우만 체크
                    if (!packageName.startsWith('.') && !packageName.startsWith('node:') && !isBuiltinModule(packageName)) {
                        const rootPackage = packageName.split('/')[0];
                        foundImports.add(rootPackage);
                        
                        if (!dependencies[rootPackage]) {
                            missingDeps.add(`${rootPackage} (used in ${file})`);
                        }
                    }
                }
            }
            
            // require 문도 찾기 (혹시 있을 경우)
            const requireMatches = content.match(/require\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g);
            if (requireMatches) {
                for (const match of requireMatches) {
                    const packageName = match.match(/['"`]([^'"`]+)['"`]/)[1];
                    
                    if (!packageName.startsWith('.') && !packageName.startsWith('node:') && !isBuiltinModule(packageName)) {
                        const rootPackage = packageName.split('/')[0];
                        foundImports.add(rootPackage);
                        
                        if (!dependencies[rootPackage]) {
                            missingDeps.add(`${rootPackage} (used in ${file})`);
                        }
                    }
                }
            }
        }
        
        // 결과 출력
        console.log(`✅ 검사한 파일: ${jsFiles.length}개`);
        console.log(`📦 발견된 외부 패키지: ${foundImports.size}개`);
        console.log(`   ${Array.from(foundImports).join(', ')}\n`);
        
        if (missingDeps.size > 0) {
            console.log('❌ 누락된 의존성:');
            for (const dep of missingDeps) {
                console.log(`   - ${dep}`);
            }
            console.log('\n💡 다음 명령어로 설치하세요:');
            const packages = Array.from(missingDeps).map(dep => dep.split(' ')[0]);
            console.log(`   npm install ${packages.join(' ')}`);
            process.exit(1);
        } else {
            console.log('✅ 모든 의존성이 올바르게 선언되어 있습니다!');
        }
        
    } catch (error) {
        console.error('❌ 의존성 검증 중 오류 발생:', error.message);
        process.exit(1);
    }
}

checkDependencies();
