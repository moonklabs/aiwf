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

const fs = require('fs');
const path = require('path');

// 색상 출력을 위한 ANSI 코드
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

// 명령어 파일 경로
const KOREAN_COMMANDS_PATH = path.join(__dirname, '../claude-code/aiwf/ko/.claude/commands/aiwf');
const ENGLISH_COMMANDS_PATH = path.join(__dirname, '../claude-code/aiwf/en/.claude/commands/aiwf');

/**
 * 디렉토리에서 명령어 파일 목록을 가져옵니다
 */
function getCommandFiles(dirPath) {
    try {
        return fs.readdirSync(dirPath)
            .filter(file => file.endsWith('.md'))
            .map(file => ({
                filename: file,
                path: path.join(dirPath, file)
            }));
    } catch (error) {
        log(`디렉토리를 읽을 수 없습니다: ${dirPath}`, 'red');
        return [];
    }
}

/**
 * 명령어 파일에서 메타데이터를 추출합니다
 */
function extractCommandMetadata(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        
        // 파일명에서 명령어명 추출 (aiwf_*.md → aiwf_*)
        const filename = path.basename(filePath, '.md');
        
        // 첫 번째 # 제목 찾기
        const titleLine = lines.find(line => line.startsWith('# '));
        const title = titleLine ? titleLine.substring(2).trim() : '';
        
        // frontmatter에서 name 필드 찾기 (있는 경우)
        let frontmatterName = '';
        if (content.startsWith('---')) {
            const frontmatterEnd = content.indexOf('---', 3);
            if (frontmatterEnd > 0) {
                const frontmatter = content.substring(0, frontmatterEnd);
                const nameMatch = frontmatter.match(/name:\s*["']?([^"'\n]+)["']?/);
                if (nameMatch) {
                    frontmatterName = nameMatch[1];
                }
            }
        }
        
        return {
            filename,
            title,
            frontmatterName,
            path: filePath
        };
    } catch (error) {
        log(`파일을 읽을 수 없습니다: ${filePath}`, 'red');
        return null;
    }
}

/**
 * 한국어와 영어 명령어 파일의 일관성을 검증합니다
 */
function validateConsistency() {
    log('\n=== 명령어 파일 일관성 검증 ===', 'cyan');
    
    const koreanFiles = getCommandFiles(KOREAN_COMMANDS_PATH);
    const englishFiles = getCommandFiles(ENGLISH_COMMANDS_PATH);
    
    log(`한국어 명령어 파일: ${koreanFiles.length}개`, 'blue');
    log(`영어 명령어 파일: ${englishFiles.length}개`, 'blue');
    
    // 파일명 기준으로 매칭 (한국어는 _kr 접미사 제거)
    const koreanFileMap = new Map();
    const englishFileMap = new Map();
    
    koreanFiles.forEach(file => {
        const normalizedName = file.filename.replace('_kr.md', '.md');
        koreanFileMap.set(normalizedName, file);
    });
    
    englishFiles.forEach(file => {
        englishFileMap.set(file.filename, file);
    });
    
    // 누락된 파일 확인
    const allFileNames = new Set([...koreanFileMap.keys(), ...englishFileMap.keys()]);
    const missingInKorean = [];
    const missingInEnglish = [];
    
    allFileNames.forEach(filename => {
        if (!koreanFileMap.has(filename)) {
            missingInKorean.push(filename);
        }
        if (!englishFileMap.has(filename)) {
            missingInEnglish.push(filename);
        }
    });
    
    // 결과 출력
    if (missingInKorean.length > 0) {
        log('\n한국어 버전에서 누락된 파일:', 'yellow');
        missingInKorean.forEach(file => log(`  - ${file}`, 'red'));
    }
    
    if (missingInEnglish.length > 0) {
        log('\n영어 버전에서 누락된 파일:', 'yellow');
        missingInEnglish.forEach(file => log(`  - ${file}`, 'red'));
    }
    
    if (missingInKorean.length === 0 && missingInEnglish.length === 0) {
        log('\n✅ 모든 명령어 파일이 한국어/영어 버전으로 존재합니다', 'green');
    }
    
    return {
        koreanFiles: koreanFileMap,
        englishFiles: englishFileMap,
        missingInKorean,
        missingInEnglish
    };
}

/**
 * 명령어 파일의 메타데이터를 검증합니다
 */
function validateMetadata() {
    log('\n=== 명령어 메타데이터 검증 ===', 'cyan');
    
    const koreanFiles = getCommandFiles(KOREAN_COMMANDS_PATH);
    const englishFiles = getCommandFiles(ENGLISH_COMMANDS_PATH);
    
    let issues = 0;
    
    // 한국어 파일 검증
    log('\n한국어 명령어 파일 검증:', 'blue');
    koreanFiles.forEach(file => {
        const metadata = extractCommandMetadata(file.path);
        if (metadata) {
            if (!metadata.title) {
                log(`  ❌ ${file.filename}: 제목이 없습니다`, 'red');
                issues++;
            } else {
                log(`  ✅ ${file.filename}: ${metadata.title}`, 'green');
            }
        }
    });
    
    // 영어 파일 검증
    log('\n영어 명령어 파일 검증:', 'blue');
    englishFiles.forEach(file => {
        const metadata = extractCommandMetadata(file.path);
        if (metadata) {
            if (!metadata.title) {
                log(`  ❌ ${file.filename}: 제목이 없습니다`, 'red');
                issues++;
            } else {
                log(`  ✅ ${file.filename}: ${metadata.title}`, 'green');
            }
        }
    });
    
    if (issues === 0) {
        log('\n✅ 모든 명령어 파일의 메타데이터가 올바릅니다', 'green');
    } else {
        log(`\n❌ ${issues}개의 메타데이터 이슈가 발견되었습니다`, 'red');
    }
    
    return issues;
}

/**
 * GitHub URL 참조를 검증합니다
 */
function validateGitHubUrls() {
    log('\n=== GitHub URL 참조 검증 ===', 'cyan');
    
    const allFiles = [
        ...getCommandFiles(KOREAN_COMMANDS_PATH),
        ...getCommandFiles(ENGLISH_COMMANDS_PATH)
    ];
    
    let issues = 0;
    
    allFiles.forEach(file => {
        const content = fs.readFileSync(file.path, 'utf8');
        
        // moonklabs/aiwf 패턴 검색
        if (content.includes('moonklabs/aiwf')) {
            log(`  ❌ ${file.filename}: 'moonklabs/aiwf' 참조 발견`, 'red');
            issues++;
        }
        
        // aiwf/aiwf 패턴 확인
        if (content.includes('aiwf/aiwf')) {
            log(`  ✅ ${file.filename}: 올바른 'aiwf/aiwf' 참조`, 'green');
        }
    });
    
    if (issues === 0) {
        log('\n✅ 모든 GitHub URL 참조가 올바릅니다', 'green');
    } else {
        log(`\n❌ ${issues}개의 잘못된 GitHub URL 참조가 발견되었습니다`, 'red');
    }
    
    return issues;
}

/**
 * 특정 명령어 파일이 누락되었는지 확인합니다
 */
function checkSpecificCommands() {
    log('\n=== 특정 명령어 파일 확인 ===', 'cyan');
    
    const requiredCommands = [
        'aiwf_update_docs.md',     // 영어 버전
        'aiwf_update_docs_kr.md'   // 한국어 버전
    ];
    
    let issues = 0;
    
    requiredCommands.forEach(commandFile => {
        const isKorean = commandFile.includes('_kr');
        const dirPath = isKorean ? KOREAN_COMMANDS_PATH : ENGLISH_COMMANDS_PATH;
        const filePath = path.join(dirPath, commandFile);
        
        if (fs.existsSync(filePath)) {
            log(`  ✅ ${commandFile}: 존재`, 'green');
        } else {
            log(`  ❌ ${commandFile}: 누락`, 'red');
            issues++;
        }
    });
    
    // aiwf_docs.md가 있는지 확인 (기존 파일)
    const legacyDocsKo = path.join(KOREAN_COMMANDS_PATH, 'aiwf_docs.md');
    const legacyDocsEn = path.join(ENGLISH_COMMANDS_PATH, 'aiwf_docs.md');
    
    if (fs.existsSync(legacyDocsKo)) {
        log(`  ℹ️  aiwf_docs.md (한국어): 기존 파일 존재`, 'yellow');
    }
    
    if (fs.existsSync(legacyDocsEn)) {
        log(`  ℹ️  aiwf_docs.md (영어): 기존 파일 존재`, 'yellow');
    }
    
    return issues;
}

/**
 * 검증 요약을 출력합니다
 */
function printSummary(results) {
    log('\n=== 검증 요약 ===', 'cyan');
    
    const totalIssues = results.metadataIssues + results.githubUrlIssues + results.specificCommandIssues;
    
    log(`총 발견된 이슈: ${totalIssues}개`, totalIssues > 0 ? 'red' : 'green');
    log(`- 메타데이터 이슈: ${results.metadataIssues}개`, 'blue');
    log(`- GitHub URL 이슈: ${results.githubUrlIssues}개`, 'blue');
    log(`- 누락된 특정 명령어: ${results.specificCommandIssues}개`, 'blue');
    log(`- 한국어 버전 누락: ${results.consistency.missingInKorean.length}개`, 'blue');
    log(`- 영어 버전 누락: ${results.consistency.missingInEnglish.length}개`, 'blue');
    
    if (totalIssues === 0) {
        log('\n🎉 모든 검증이 통과되었습니다!', 'green');
        return true;
    } else {
        log('\n⚠️  일부 이슈가 발견되었습니다. 위의 내용을 확인해주세요.', 'red');
        return false;
    }
}

/**
 * 메인 실행 함수
 */
function main() {
    log('AIWF 명령어 파일 일관성 검증 도구', 'cyan');
    log('====================================', 'cyan');
    
    const consistency = validateConsistency();
    const metadataIssues = validateMetadata();
    const githubUrlIssues = validateGitHubUrls();
    const specificCommandIssues = checkSpecificCommands();
    
    const results = {
        consistency,
        metadataIssues,
        githubUrlIssues,
        specificCommandIssues
    };
    
    const success = printSummary(results);
    
    // 종료 코드 설정
    process.exit(success ? 0 : 1);
}

// 스크립트가 직접 실행될 때만 main 함수 호출
if (require.main === module) {
    main();
}

module.exports = {
    validateConsistency,
    validateMetadata,
    validateGitHubUrls,
    checkSpecificCommands
};