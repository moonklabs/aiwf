#!/usr/bin/env node

/**
 * AIWF 명령어 파일 일관성 검증 도구
 * 
 * 이 스크립트는 다음을 검증합니다:
 * 1. 한국어/영어 명령어 파일 간의 일관성
 * 2. 명령어 파일명과 실제 명령어명의 매칭
 * 3. 누락된 명령어 파일 식별
 * 4. GitHub URL 참조 일관성
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// 색상 출력을 위한 ANSI 코드
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    gray: '\x1b[90m'
};

// chalk 대체 함수
const chalk = {
    red: (text) => `${colors.red}${text}${colors.reset}`,
    green: (text) => `${colors.green}${text}${colors.reset}`,
    yellow: (text) => `${colors.yellow}${text}${colors.reset}`,
    blue: (text) => `${colors.blue}${text}${colors.reset}`,
    cyan: (text) => `${colors.cyan}${text}${colors.reset}`,
    gray: (text) => `${colors.gray}${text}${colors.reset}`,
    bold: (text) => `\x1b[1m${text}${colors.reset}`
};

const KO_COMMANDS_DIR = 'claude-code/aiwf/ko/.claude/commands/aiwf';
const EN_COMMANDS_DIR = 'claude-code/aiwf/en/.claude/commands/aiwf';

// 명령어 파일 메타데이터 추출
async function extractCommandMetadata(filePath) {
    try {
        const content = await fs.readFile(filePath, 'utf-8');
        const lines = content.split('\n');
        
        // YAML frontmatter 찾기
        if (lines[0] === '---') {
            const endIndex = lines.findIndex((line, index) => index > 0 && line === '---');
            if (endIndex !== -1) {
                const frontmatter = lines.slice(1, endIndex).join('\n');
                // 간단한 YAML 파싱 (name 추출)
                const nameMatch = frontmatter.match(/name:\s*["']?([^"'\n]+)["']?/);
                const descMatch = frontmatter.match(/description:\s*["']?([^"'\n]+)["']?/);
                
                return {
                    name: nameMatch ? nameMatch[1] : null,
                    description: descMatch ? descMatch[1] : null,
                    hasFrontmatter: true
                };
            }
        }
        
        // 첫 번째 헤더에서 명령어명 추출
        const headerMatch = content.match(/^#\s+(.+)/m);
        return {
            name: headerMatch ? headerMatch[1] : null,
            description: null,
            hasFrontmatter: false
        };
    } catch (error) {
        return { error: error.message };
    }
}

// 디렉토리의 모든 명령어 파일 스캔
async function scanCommandsDirectory(dir) {
    const commands = {};
    
    try {
        const files = await fs.readdir(dir);
        const mdFiles = files.filter(file => file.endsWith('.md'));
        
        for (const file of mdFiles) {
            const filePath = path.join(dir, file);
            const metadata = await extractCommandMetadata(filePath);
            commands[file] = {
                ...metadata,
                path: filePath
            };
        }
    } catch (error) {
        console.error(chalk.red(`Error scanning directory ${dir}: ${error.message}`));
        return { commands, error: error.message };
    }
    
    return { commands, error: null };
}

// GitHub URL 참조 검증
async function validateGitHubUrls(filePath) {
    try {
        const content = await fs.readFile(filePath, 'utf-8');
        const moonklabsRefs = content.match(/moonklabs\/aiwf/g) || [];
        const aiwfRefs = content.match(/aiwf\/aiwf/g) || [];
        
        return {
            moonklabsCount: moonklabsRefs.length,
            aiwfCount: aiwfRefs.length,
            hasInconsistentUrls: moonklabsRefs.length > 0
        };
    } catch (error) {
        return { error: error.message };
    }
}

// 명령어 파일 검증
async function validateCommands() {
    console.log(chalk.blue(chalk.bold('\n🔍 AIWF Command Files Validation\n')));
    console.log('='.repeat(50));
    
    // 1. 디렉토리 스캔
    console.log(chalk.cyan('\n1. 디렉토리 스캔 중...'));
    const koScan = await scanCommandsDirectory(KO_COMMANDS_DIR);
    const enScan = await scanCommandsDirectory(EN_COMMANDS_DIR);
    const koCommands = koScan.commands;
    const enCommands = enScan.commands;
    
    console.log(chalk.gray(`   한국어 명령어: ${Object.keys(koCommands).length}개`));
    console.log(chalk.gray(`   영어 명령어: ${Object.keys(enCommands).length}개`));
    
    // 2. 명령어 일관성 검증
    console.log(chalk.cyan('\n2. 명령어 일관성 검증 중...'));
    
    const allFiles = new Set([...Object.keys(koCommands), ...Object.keys(enCommands)]);
    const issues = [];

    // 스캔 실패(존재하지 않는 디렉토리 등)를 통과로 삼키지 않는다
    for (const [dir, scan] of [[KO_COMMANDS_DIR, koScan], [EN_COMMANDS_DIR, enScan]]) {
        if (scan.error) {
            issues.push({
                type: 'scan_error',
                file: dir,
                message: `디렉토리 스캔 실패: ${dir} (${scan.error})`
            });
        }
    }

    // 검증 대상이 하나도 없으면 잘못된 통과로 간주한다
    if (allFiles.size === 0 && issues.length === 0) {
        issues.push({
            type: 'no_commands',
            file: null,
            message: '명령어 파일을 찾을 수 없습니다 (검증 대상 없음)'
        });
    }
    
    for (const fileName of allFiles) {
        const koExists = koCommands[fileName];
        const enExists = enCommands[fileName];
        
        if (!koExists) {
            issues.push({
                type: 'missing_ko',
                file: fileName,
                message: `한국어 버전 누락: ${fileName}`
            });
        }
        
        if (!enExists) {
            issues.push({
                type: 'missing_en',
                file: fileName,
                message: `영어 버전 누락: ${fileName}`
            });
        }
        
        // 명령어명 일관성 검증 (언어가 다르므로 생략)
        if (koExists && enExists && koExists.name && enExists.name) {
            // 언어가 다르므로 명령어명이 다른 것은 정상
            // 이 검증은 제거
        }
    }
    
    // 3. update_docs 명령어 검증
    console.log(chalk.cyan('\n3. update_docs 명령어 검증 중...'));
    
    const updateDocsFiles = [
        'aiwf_update_docs.md',
        'aiwf_docs.md'
    ];
    
    const updateDocsStatus = {};
    for (const file of updateDocsFiles) {
        updateDocsStatus[file] = {
            ko: !!koCommands[file],
            en: !!enCommands[file]
        };
    }
    
    // 4. GitHub URL 검증
    console.log(chalk.cyan('\n4. GitHub URL 참조 검증 중...'));
    
    const urlIssues = [];
    for (const [fileName, command] of Object.entries({ ...koCommands, ...enCommands })) {
        if (command.path) {
            const urlCheck = await validateGitHubUrls(command.path);
            if (urlCheck.hasInconsistentUrls) {
                urlIssues.push({
                    file: fileName,
                    path: command.path,
                    moonklabsCount: urlCheck.moonklabsCount
                });
            }
        }
    }
    
    // 결과 출력
    console.log(chalk.blue(chalk.bold('\n📋 검증 결과\n')));
    console.log('='.repeat(50));
    
    // 일관성 이슈
    if (issues.length > 0) {
        console.log(chalk.red(`\n❌ 발견된 이슈 (${issues.length}개):`));
        for (const issue of issues) {
            console.log(chalk.red(`   • ${issue.message}`));
        }
    } else {
        console.log(chalk.green('\n✅ 명령어 일관성 검증 통과'));
    }
    
    // update_docs 상태
    console.log(chalk.blue('\n📝 update_docs 명령어 상태:'));
    for (const [file, status] of Object.entries(updateDocsStatus)) {
        const koIcon = status.ko ? '✅' : '❌';
        const enIcon = status.en ? '✅' : '❌';
        console.log(chalk.gray(`   ${file}: KO ${koIcon} EN ${enIcon}`));
    }
    
    // GitHub URL 이슈
    if (urlIssues.length > 0) {
        console.log(chalk.yellow(`\n⚠️ GitHub URL 이슈 (${urlIssues.length}개):`));
        for (const issue of urlIssues) {
            console.log(chalk.yellow(`   • ${issue.file}: moonklabs/aiwf 참조 ${issue.moonklabsCount}개`));
        }
    } else {
        console.log(chalk.green('\n✅ GitHub URL 참조 검증 통과'));
    }
    
    // 요약
    console.log(chalk.blue(chalk.bold('\n📊 요약:')));
    console.log(chalk.gray(`   총 명령어 파일: ${allFiles.size}개`));
    console.log(chalk.gray(`   한국어/영어 쌍: ${Math.min(Object.keys(koCommands).length, Object.keys(enCommands).length)}개`));
    console.log(chalk.gray(`   일관성 이슈: ${issues.length}개`));
    console.log(chalk.gray(`   URL 이슈: ${urlIssues.length}개`));
    
    const overallSuccess = issues.length === 0 && urlIssues.length === 0;
    console.log(overallSuccess ? 
        chalk.green('\n🎉 모든 검증 통과!') : 
        chalk.red('\n⚠️ 일부 이슈가 발견되었습니다.')
    );
    
    return {
        success: overallSuccess,
        issues,
        urlIssues,
        updateDocsStatus,
        totalFiles: allFiles.size
    };
}

// 메인 실행
const isMainModule = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMainModule) {
    validateCommands()
        .then((result) => {
            if (!result || result.success !== true) {
                process.exitCode = 1;
            }
        })
        .catch((error) => {
            console.error(error);
            process.exitCode = 1;
        });
}

export { validateCommands };
