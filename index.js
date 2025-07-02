#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import prompts from 'prompts';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const program = new Command();

const GITHUB_API_URL = 'https://api.github.com/repos/aiwf/aiwf';
const GITHUB_RAW_URL = 'https://raw.githubusercontent.com/aiwf/aiwf/master';
const GITHUB_CONTENT_PREFIX = 'claude-code/aiwf';

async function fetchGitHubContent(url) {
    return new Promise((resolve, reject) => {
        https.get(url, { headers: { 'User-Agent': 'aiwf' } }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    resolve(data);
                } else {
                    reject(new Error(`Failed to fetch ${url}: ${res.statusCode}`));
                }
                res.destroy();
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

async function downloadFile(url, destPath) {
    return new Promise((resolve, reject) => {
        https.get(url, { headers: { 'User-Agent': 'aiwf' } }, (response) => {
            if (response.statusCode !== 200) {
                response.destroy();
                reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
                return;
            }
            const file = createWriteStream(destPath);
            pipeline(response, file)
                .then(() => {
                    resolve();
                })
                .catch((err) => {
                    reject(err);
                })
                .finally(() => {
                    response.destroy();
                });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

async function getDirectoryStructure(path = '') {
    const url = `${GITHUB_API_URL}/contents/${path}`;
    const content = await fetchGitHubContent(url);
    return JSON.parse(content);
}

const COMMANDS_DIR = '.claude/commands/aiwf';

async function checkExistingInstallation() {
    const aiwfExists = await fs.access('.aiwf').then(() => true).catch(() => false);
    const claudeCommandsExists = await fs.access(COMMANDS_DIR).then(() => true).catch(() => false);
    return aiwfExists || claudeCommandsExists;
}

// 백업 폴더명 생성 함수
function getBackupDirName() {
    const now = new Date();
    const pad = n => n.toString().padStart(2, '0');
    const y = now.getFullYear();
    const m = pad(now.getMonth() + 1);
    const d = pad(now.getDate());
    const h = pad(now.getHours());
    const min = pad(now.getMinutes());
    const s = pad(now.getSeconds());
    return `.aiwf/backup_${y}${m}${d}_${h}${min}${s}`;
}

let BACKUP_DIR = null;

async function backupFile(filePath, backupDir) {
    try {
        const exists = await fs.access(filePath).then(() => true).catch(() => false);
        if (exists) {
            await fs.mkdir(backupDir, { recursive: true });
            const backupPath = `${filePath}.bak`;
            await fs.copyFile(filePath, backupPath);
            
            // 도구별 백업 파일 명명 규칙 개선
            let bakFileName;
            if (filePath.startsWith('.claude/commands/aiwf/')) {
                // Claude Code 명령어 파일
                const relativePath = filePath.substring('.claude/commands/aiwf/'.length);
                bakFileName = `claude-commands-aiwf-${relativePath.replace(/\//g, '-')}.bak`;
            } else if (filePath.startsWith('.gemini/prompts/aiwf/')) {
                // Gemini CLI 프롬프트 파일
                const relativePath = filePath.substring('.gemini/prompts/aiwf/'.length);
                bakFileName = `gemini-prompts-aiwf-${relativePath.replace(/\//g, '-')}.bak`;
            } else if (filePath.startsWith('.cursor/rules/')) {
                // Cursor 규칙 파일
                const relativePath = filePath.substring('.cursor/rules/'.length);
                bakFileName = `cursor-rules-${relativePath.replace(/\//g, '-')}.bak`;
            } else if (filePath.startsWith('.windsurf/rules/')) {
                // Windsurf 규칙 파일
                const relativePath = filePath.substring('.windsurf/rules/'.length);
                bakFileName = `windsurf-rules-${relativePath.replace(/\//g, '-')}.bak`;
            } else if (filePath.startsWith('.aiwf/')) {
                // AIWF 핵심 파일
                const relativePath = filePath.substring('.aiwf/'.length);
                bakFileName = `aiwf-${relativePath.replace(/\//g, '-')}.bak`;
            } else {
                // 기타 파일
                bakFileName = path.basename(filePath) + '.bak';
            }
            
            const destPath = path.join(backupDir, bakFileName);
            await fs.rename(backupPath, destPath);
            return destPath;
        }
    } catch (error) {
        // Backup failed, but continue
    }
    return null;
}

async function backupCommandsAndDocs(msg) {
    if (!BACKUP_DIR) BACKUP_DIR = getBackupDirName();
    const spinner = ora(msg.backingUp).start();
    const backedUpFiles = [];
    await fs.mkdir(BACKUP_DIR, { recursive: true });
    try {
        // Files that will be updated and need backup
        const filesToBackup = [
            '.aiwf/CLAUDE.md',
            '.aiwf/02_REQUIREMENTS/CLAUDE.md',
            '.aiwf/03_SPRINTS/CLAUDE.md',
            '.aiwf/04_GENERAL_TASKS/CLAUDE.md'
        ];
        
        // Backup CLAUDE.md files
        for (const file of filesToBackup) {
            const backupPath = await backupFile(file, BACKUP_DIR);
            if (backupPath) {
                backedUpFiles.push(backupPath);
            }
        }
        
        // Backup all command files
        const commandsExist = await fs.access(COMMANDS_DIR).then(() => true).catch(() => false);
        if (commandsExist) {
            try {
                const commandFiles = await fs.readdir(COMMANDS_DIR);
                for (const file of commandFiles) {
                    const filePath = path.join(COMMANDS_DIR, file);
                    const stat = await fs.stat(filePath);
                    if (stat.isFile() && file.endsWith('.md')) {
                        const backupPath = await backupFile(filePath, BACKUP_DIR);
                        if (backupPath) {
                            backedUpFiles.push(backupPath);
                        }
                    }
                }
            } catch (error) {
                // Commands directory might be empty or have issues
            }
        }
        
        // Backup IDE rule files (Cursor)
        const cursorRulesExist = await fs.access('.cursor/rules').then(() => true).catch(() => false);
        if (cursorRulesExist) {
            try {
                const cursorFiles = await fs.readdir('.cursor/rules');
                for (const file of cursorFiles) {
                    if (file.endsWith('.mdc')) {
                        const filePath = path.join('.cursor/rules', file);
                        const backupPath = await backupFile(filePath, BACKUP_DIR);
                        if (backupPath) {
                            backedUpFiles.push(backupPath);
                        }
                    }
                }
            } catch (error) {
                // Cursor rules directory might have issues
            }
        }
        
        // Backup IDE rule files (Windsurf)
        const windsurfRulesExist = await fs.access('.windsurf/rules').then(() => true).catch(() => false);
        if (windsurfRulesExist) {
            try {
                const windsurfFiles = await fs.readdir('.windsurf/rules');
                for (const file of windsurfFiles) {
                    if (file.endsWith('.md')) {
                        const filePath = path.join('.windsurf/rules', file);
                        const backupPath = await backupFile(filePath, BACKUP_DIR);
                        if (backupPath) {
                            backedUpFiles.push(backupPath);
                        }
                    }
                }
            } catch (error) {
                // Windsurf rules directory might have issues
            }
        }
        
        if (backedUpFiles.length > 0) {
            spinner.succeed(chalk.green(msg.backupComplete.replace('{count}', backedUpFiles.length)));
        } else {
            spinner.succeed(chalk.gray(msg.noFilesToBackup));
        }
        return backedUpFiles;
    } catch (error) {
        spinner.fail(chalk.red(msg.backupFailed));
        throw error;
    }
}

async function downloadDirectory(githubPath, localPath, spinner, msg) {
    await fs.mkdir(localPath, { recursive: true });

    const items = await getDirectoryStructure(githubPath);

    for (const item of items) {
        const itemLocalPath = path.join(localPath, item.name);

        if (item.type === 'dir') {
            await downloadDirectory(item.path, itemLocalPath, spinner, msg);
        } else if (item.type === 'file') {
            spinner.text = msg.downloadingFile.replace('{path}', item.path);
            await downloadFile(item.download_url, itemLocalPath);
        }
    }
}

// 스피너와 로그를 동시에 처리하는 함수
function logWithSpinner(spinner, message, debugLog) {
    if (debugLog) console.log(chalk.gray(message));
    if (spinner) spinner.text = message;
}

// 언어별 메시지 정의
const messages = {
    ko: {
        welcome: '\n🎉 AIWF에 오신 것을 환영합니다!\n',
        description: '이 설치 프로그램은 AIWF AI 프롬프트 프레임워크를 설정합니다',
        optimized: '특별히 Claude Code 에 최적화 되어있습니다.\n',
        selectLanguage: 'Please select language / 언어를 선택해주세요:',
        korean: '한국어 (Korean)',
        english: 'English',
        existingDetected: '기존 AIWF 설치가 감지되었습니다. 무엇을 하시겠습니까?',
        updateOption: '업데이트 (명령어와 문서만 업데이트하고 작업 내용은 보존)',
        skipOption: '설치 건너뛰기',
        cancelOption: '취소',
        installCancelled: '\n설치가 취소되었습니다.',
        backingUp: '기존 명령어 및 문서 백업 중...',
        fetching: 'GitHub에서 AIWF 프레임워크를 가져오는 중...',
        downloading: 'AIWF 프레임워크 파일을 다운로드하는 중...',
        updatingDocs: '문서를 업데이트하는 중...',
        downloadingCommands: 'AIWF 명령어를 새로 다운로드하는 중...',
        updateSuccess: '✅ AIWF 프레임워크가 성공적으로 업데이트되었습니다!',
        installSuccess: '✅ AIWF 프레임워크가 성공적으로 설치되었습니다!',
        enjoy: '\nEnjoy AIWF! 🚀\n',
        backupComplete: '{count}개 파일 백업 완료 (*.bak)',
        noFilesToBackup: '백업할 기존 파일이 없습니다',
        backupFailed: '백업 실패',
        downloadingFile: '{path} 다운로드 중...',
        downloadingTemplates: '템플릿 디렉토리를 다운로드 중...',
        templatesNotFound: '템플릿 디렉토리를 찾을 수 없어 건너뜁니다...',
        deletingOldCommands: '기존 AIWF 명령어 폴더를 삭제하는 중...',
        commandsNotFound: '명령어 디렉토리를 찾을 수 없어 건너뜁니다...',
        downloadingRulesGlobal: 'rules/global 폴더를 다운로드 중...',
        rulesGlobalNotFound: 'rules/global 폴더를 찾을 수 없어 건너뜁니다...',
        downloadingRulesManual: 'rules/manual 폴더를 다운로드 중...',
        rulesManualNotFound: 'rules/manual 폴더를 찾을 수 없어 건너뜁니다...',
        updateHistory: '🔄 업데이트 내역:',
        updatedCommands: '내의 명령어',
        updatedDocs: '문서 (CLAUDE.md 파일)',
        workPreserved: '💾 작업 내용은 보존되었습니다:',
        allFilesPreserved: '모든 작업, 스프린트, 및 프로젝트 파일이 변경되지 않음',
        backupCreated: '백업은 *.bak 파일로 만들어짐',
        structureCreated: '📁 생성된 구조:',
        aiwfRoot: '프로젝트 관리 루트',
        claudeCommands: 'Claude 사용자 명령어',
        nextSteps: '🚀 다음 단계:',
        nextStep1: 'Claude Code에서 이 프로젝트를 엽니다',
        nextStep2: '/aiwf_<command> 명령어를 사용하여 프로젝트를 관리하세요',
        nextStep3: '/aiwf_initialize를 실행하여 프로젝트를 설정하세요',
        gettingStarted: '✨ 시작하려면:',
        startStep1: '새 터미널을 열거나 쉘 프로필을 소싱하세요 (예: source ~/.zshrc)',
        startStep2: '다음을 실행하세요: claude 를 실행하여 사용 가능한 명령어를 확인하세요.',
        checkDocs: '자세한 내용은 .aiwf 디렉토리의 문서를 확인하세요.',
        updateFailed: '업데이트 실패',
        installFailed: '설치 실패',
        noBackupFound: '복원할 백업 폴더가 없습니다.',
        restoringFromBackup: '백업에서 복원 중...',
        restoreSuccess: '성공적으로 복원되었습니다.',
        restoreFailed: '복원에 실패했습니다.',
        cannotRestore: '파일을 복원할 수 없습니다. 수동 확인이 필요합니다.'
    },
    en: {
        welcome: '\n🎉 Welcome to AIWF!\n',
        description: 'This installer sets up the AIWF AI prompt framework',
        optimized: 'Specially optimized for Claude Code.\n',
        selectLanguage: 'Please select language / 언어를 선택해주세요:',
        korean: '한국어 (Korean)',
        english: 'English',
        existingDetected: 'Existing AIWF installation detected. What would you like to do?',
        updateOption: 'Update (Update commands and docs only, preserve work content)',
        skipOption: 'Skip installation',
        cancelOption: 'Cancel',
        installCancelled: '\nInstallation cancelled.',
        backingUp: 'Backing up existing commands and documents...',
        fetching: 'Fetching AIWF framework from GitHub...',
        downloading: 'Downloading AIWF framework files...',
        updatingDocs: 'Updating documentation...',
        downloadingCommands: 'Downloading AIWF commands...',
        updateSuccess: '✅ AIWF framework updated successfully!',
        installSuccess: '✅ AIWF framework installed successfully!',
        enjoy: '\nEnjoy AIWF! 🚀\n',
        backupComplete: '{count} files backed up (*.bak)',
        noFilesToBackup: 'No existing files to backup',
        backupFailed: 'Backup failed',
        downloadingFile: 'Downloading {path}...',
        downloadingTemplates: 'Downloading template directories...',
        templatesNotFound: 'Template directories not found, skipping...',
        deletingOldCommands: 'Deleting existing AIWF commands folder...',
        commandsNotFound: 'Commands directory not found, skipping...',
        downloadingRulesGlobal: 'Downloading rules/global folder...',
        rulesGlobalNotFound: 'rules/global folder not found, skipping...',
        downloadingRulesManual: 'Downloading rules/manual folder...',
        rulesManualNotFound: 'rules/manual folder not found, skipping...',
        updateHistory: '🔄 Update History:',
        updatedCommands: '/ commands',
        updatedDocs: 'Documentation (CLAUDE.md files)',
        workPreserved: '💾 Work preserved:',
        allFilesPreserved: 'All work, sprints, and project files unchanged',
        backupCreated: 'Backups created as *.bak files',
        structureCreated: '📁 Structure created:',
        aiwfRoot: 'Project management root',
        claudeCommands: 'Claude user commands',
        nextSteps: '🚀 Next steps:',
        nextStep1: 'Open this project in Claude Code',
        nextStep2: 'Use /aiwf_<command> commands to manage your project',
        nextStep3: 'Run /aiwf_initialize to set up your project',
        gettingStarted: '✨ Getting started:',
        startStep1: 'Open a new terminal or source your shell profile (e.g. source ~/.zshrc)',
        startStep2: 'Run: claude to see available commands.',
        checkDocs: 'For more details, check the documentation in the .aiwf directory.',
        updateFailed: 'Update failed',
        installFailed: 'Installation failed',
        noBackupFound: 'No backup folder found to restore.',
        restoringFromBackup: 'Restoring from backup...',
        restoreSuccess: 'Successfully restored.',
        restoreFailed: 'Restore failed.',
        cannotRestore: 'Cannot restore file. Manual verification required.'
    }
};

// =============================================================================
// INSTALLATION VALIDATION SYSTEM
// =============================================================================

// 각 도구별 필수 파일 목록 정의
const ESSENTIAL_FILES = {
    claudeCode: {
        baseDir: '.claude/commands/aiwf',
        requiredFiles: [
            'aiwf_initialize.md',
            'aiwf_do_task.md',
            'aiwf_commit.md',
            'aiwf_create_sprint_tasks.md',
            'aiwf_code_review.md'
        ],
        minFileCount: 5,
        description: 'Claude Code Commands'
    },
    geminiCLI: {
        baseDir: '.gemini/prompts/aiwf',
        requiredFiles: [
            'README.md'
        ],
        minFileCount: 1,
        description: 'Gemini-CLI Prompts'
    },
    cursor: {
        baseDir: '.cursor/rules',
        requiredFiles: [],
        minFileCount: 2,
        fileExtension: '.mdc',
        description: 'Cursor IDE Rules'
    },
    windsurf: {
        baseDir: '.windsurf/rules',
        requiredFiles: [],
        minFileCount: 2,
        fileExtension: '.md',
        description: 'Windsurf IDE Rules'
    },
    aiwf: {
        baseDir: '.aiwf',
        requiredFiles: [
            'CLAUDE.md',
            '00_PROJECT_MANIFEST.md'
        ],
        minFileCount: 2,
        description: 'AIWF Core Structure'
    }
};

// 범용 검증 함수 (모든 도구에서 사용)
async function validateToolInstallation(config) {
    const results = {
        success: true,
        description: config.description,
        baseDir: config.baseDir,
        checks: {
            directoryExists: false,
            fileCount: 0,
            requiredFiles: [],
            totalSize: 0,
            issues: []
        }
    };

    try {
        // 1. 디렉토리 존재 확인
        await fs.access(config.baseDir);
        const dirStat = await fs.stat(config.baseDir);
        if (dirStat.isDirectory()) {
            results.checks.directoryExists = true;
        } else {
            results.checks.issues.push(`${config.baseDir} is not a directory`);
            results.success = false;
            return results;
        }

        // 2. 파일 목록 가져오기
        const actualFiles = await fs.readdir(config.baseDir);
        results.checks.fileCount = actualFiles.length;

        // 3. 필수 파일 존재 확인
        for (const requiredFile of config.requiredFiles || []) {
            const filePath = path.join(config.baseDir, requiredFile);
            const fileCheck = {
                file: requiredFile,
                exists: false,
                size: 0,
                valid: false
            };

            if (actualFiles.includes(requiredFile)) {
                fileCheck.exists = true;
                try {
                    const stats = await fs.stat(filePath);
                    fileCheck.size = stats.size;
                    results.checks.totalSize += stats.size;
                    
                    // 파일 크기 검증 (최소 10바이트)
                    if (stats.size < 10) {
                        results.checks.issues.push(`File ${requiredFile} is too small (${stats.size} bytes)`);
                        results.success = false;
                    } else {
                        fileCheck.valid = true;
                    }
                } catch (error) {
                    results.checks.issues.push(`Cannot read stats for ${requiredFile}: ${error.message}`);
                    results.success = false;
                }
            } else {
                results.checks.issues.push(`Required file ${requiredFile} is missing`);
                results.success = false;
            }

            results.checks.requiredFiles.push(fileCheck);
        }

        // 4. 파일 확장자 기반 검증 (Cursor/Windsurf)
        if (config.fileExtension) {
            const matchingFiles = actualFiles.filter(f => f.endsWith(config.fileExtension));
            if (matchingFiles.length < config.minFileCount) {
                results.checks.issues.push(`Expected at least ${config.minFileCount} ${config.fileExtension} files, found ${matchingFiles.length}`);
                results.success = false;
            }

            // 확장자별 파일 크기 검증
            for (const file of matchingFiles) {
                const filePath = path.join(config.baseDir, file);
                try {
                    const stats = await fs.stat(filePath);
                    results.checks.totalSize += stats.size;
                    
                    if (stats.size < 50) { // Rules 파일은 최소 50바이트
                        results.checks.issues.push(`Rules file ${file} is too small (${stats.size} bytes)`);
                        results.success = false;
                    }
                } catch (error) {
                    results.checks.issues.push(`Cannot read ${file}: ${error.message}`);
                    results.success = false;
                }
            }
        }

        // 5. 최소 파일 개수 검증
        if (results.checks.fileCount < config.minFileCount) {
            results.checks.issues.push(`Expected at least ${config.minFileCount} files, found ${results.checks.fileCount}`);
            results.success = false;
        }

    } catch (error) {
        results.success = false;
        results.checks.issues.push(`Validation error: ${error.message}`);
    }

    return results;
}

// 개별 도구 검증 함수들
async function validateClaudeInstall() {
    return await validateToolInstallation(ESSENTIAL_FILES.claudeCode);
}

async function validateGeminiInstall() {
    return await validateToolInstallation(ESSENTIAL_FILES.geminiCLI);
}

async function validateCursorInstall() {
    return await validateToolInstallation(ESSENTIAL_FILES.cursor);
}

async function validateWindsurfInstall() {
    return await validateToolInstallation(ESSENTIAL_FILES.windsurf);
}

async function validateAIWFCore() {
    return await validateToolInstallation(ESSENTIAL_FILES.aiwf);
}

// Legacy detailed validation (for backward compatibility)
async function validateInstallationDetailed() {
    const validationResults = {
        overall: {
            success: true,
            toolsChecked: 0,
            toolsPassed: 0,
            toolsFailed: 0,
            totalIssues: 0
        },
        tools: {}
    };

    // AIWF 코어는 항상 검증
    const aiwfResult = await validateAIWFCore();
    validationResults.tools.aiwf = aiwfResult;
    validationResults.overall.toolsChecked++;
    
    if (aiwfResult.success) {
        validationResults.overall.toolsPassed++;
    } else {
        validationResults.overall.toolsFailed++;
        validationResults.overall.success = false;
        validationResults.overall.totalIssues += aiwfResult.checks.issues.length;
    }

    // 모든 도구 검증 (이 간단한 버전에서는 항상 모든 도구 설치)
    const toolValidators = {
        claudeCode: validateClaudeInstall,
        geminiCLI: validateGeminiInstall,
        cursor: validateCursorInstall,
        windsurf: validateWindsurfInstall
    };

    for (const [toolName, validator] of Object.entries(toolValidators)) {
        const result = await validator();
        validationResults.tools[toolName] = result;
        validationResults.overall.toolsChecked++;
        
        if (result.success) {
            validationResults.overall.toolsPassed++;
        } else {
            validationResults.overall.toolsFailed++;
            validationResults.overall.success = false;
            validationResults.overall.totalIssues += result.checks.issues.length;
        }
    }

    return validationResults;
}

// 향상된 설치 검증 함수 (선택적 도구 지원)
async function validateInstallationEnhanced(selectedTools = null, language = 'en') {
    const validationResults = {
        overall: {
            success: true,
            toolsChecked: 0,
            toolsPassed: 0,
            toolsFailed: 0,
            totalIssues: 0
        },
        tools: {}
    };

    // AIWF 코어는 항상 검증
    const aiwfResult = await validateAIWFCore();
    validationResults.tools.aiwf = aiwfResult;
    validationResults.overall.toolsChecked++;
    
    if (aiwfResult.success) {
        validationResults.overall.toolsPassed++;
    } else {
        validationResults.overall.toolsFailed++;
        validationResults.overall.success = false;
        validationResults.overall.totalIssues += aiwfResult.checks.issues.length;
    }

    // 도구 목록 결정 (선택된 도구 또는 모든 도구)
    const toolsToValidate = selectedTools || ['claudeCode', 'geminiCLI', 'cursor', 'windsurf'];
    
    const toolValidators = {
        claudeCode: validateClaudeInstall,
        geminiCLI: validateGeminiInstall,
        cursor: validateCursorInstall,
        windsurf: validateWindsurfInstall
    };

    for (const toolName of toolsToValidate) {
        if (toolValidators[toolName]) {
            const result = await toolValidators[toolName]();
            validationResults.tools[toolName] = result;
            validationResults.overall.toolsChecked++;
            
            if (result.success) {
                validationResults.overall.toolsPassed++;
            } else {
                validationResults.overall.toolsFailed++;
                validationResults.overall.success = false;
                validationResults.overall.totalIssues += result.checks.issues.length;
            }
        }
    }

    return validationResults;
}

// Display validation results for specification-compliant format
function displaySpecCompliantValidationResults(validationResults, language) {
    const msg = messages[language];
    
    console.log(chalk.blue('\n=== Installation Validation Results ==='));
    
    // Success summary
    if (validationResults.success.length > 0) {
        console.log(chalk.green(`\n✅ Successfully Validated Tools (${validationResults.success.length}):`));
        validationResults.success.forEach(tool => {
            console.log(chalk.green(`   ✓ ${tool}`));
        });
    }
    
    // Failed summary
    if (validationResults.failed.length > 0) {
        console.log(chalk.red(`\n❌ Failed Validations (${validationResults.failed.length}):`));
        validationResults.failed.forEach(({tool, reason}) => {
            console.log(chalk.red(`   ✗ ${tool}: ${reason}`));
        });
    }
    
    // Warnings summary  
    if (validationResults.warnings.length > 0) {
        console.log(chalk.yellow(`\n⚠️ Warnings (${validationResults.warnings.length}):`));
        validationResults.warnings.forEach(warning => {
            console.log(chalk.yellow(`   ⚠ ${warning}`));
        });
    }
    
    // Overall status
    const isSuccess = validationResults.failed.length === 0;
    const statusIcon = isSuccess ? '✅' : '❌';
    const statusColor = isSuccess ? chalk.green : chalk.red;
    const statusText = isSuccess ? 'PASSED' : 'FAILED';
    
    console.log(statusColor(`\n${statusIcon} Overall Validation: ${statusText}`));
    
    if (isSuccess) {
        console.log(chalk.green('🎉 All selected tools are properly installed and validated!'));
    } else {
        console.log(chalk.yellow('⚠️ Some installations failed. See details above.'));
    }
}

// Enhanced validation function with simplified interface for T05_S02
async function validateInstallation(selectedTools, language) {
    const results = {
        success: [],
        failed: [],
        warnings: []
    };
    
    // Always validate common files (AIWF core)
    const commonValid = await validateCommonFiles();
    if (!commonValid.success) {
        results.failed.push({ tool: 'aiwf', reason: commonValid.reason });
    } else {
        results.success.push('aiwf');
    }
    
    // Validate selected tools
    if (selectedTools && selectedTools.length > 0) {
        for (const tool of selectedTools) {
            const validation = await validateTool(tool);
            if (validation.success) {
                results.success.push(tool);
            } else {
                results.failed.push({ tool, reason: validation.reason });
            }
        }
    } else {
        // Default: validate all tools if no selection provided
        const allTools = ['claudeCode', 'geminiCLI', 'cursor', 'windsurf'];
        for (const tool of allTools) {
            const validation = await validateTool(tool);
            if (validation.success) {
                results.success.push(tool);
            } else {
                results.failed.push({ tool, reason: validation.reason });
            }
        }
    }
    
    return results;
}

// Helper function to validate common/core files
async function validateCommonFiles() {
    try {
        const requiredFiles = [
            '.aiwf/CLAUDE.md',
            '.aiwf/00_PROJECT_MANIFEST.md'
        ];
        
        for (const file of requiredFiles) {
            const exists = await fs.access(file).then(() => true).catch(() => false);
            if (!exists) {
                return { success: false, reason: `Missing core file: ${file}` };
            }
        }
        
        return { success: true };
    } catch (error) {
        return { success: false, reason: `Core validation error: ${error.message}` };
    }
}

// Helper function to validate specific tools with simplified interface
async function validateTool(tool) {
    switch (tool) {
        case 'claudeCode':
        case 'claude-code':
            return validateClaudeCode();
        case 'geminiCLI':
        case 'gemini-cli':
            return validateGeminiCLI();
        case 'cursor':
            return validateCursorTool();
        case 'windsurf':
            return validateWindsurfTool();
        case 'aiwf':
            return validateCommonFiles();
        default:
            return { success: false, reason: `Unknown tool: ${tool}` };
    }
}

// Simplified tool validation functions
async function validateClaudeCode() {
    try {
        const requiredFiles = [
            '.claude/commands/aiwf/aiwf_initialize.md',
            '.claude/commands/aiwf/aiwf_do_task.md',
            '.claude/commands/aiwf/aiwf_commit.md',
            '.claude/commands/aiwf/aiwf_code_review.md'
        ];
        
        for (const file of requiredFiles) {
            const exists = await fs.access(file).then(() => true).catch(() => false);
            if (!exists) {
                return { success: false, reason: `Missing file: ${file}` };
            }
        }
        
        return { success: true };
    } catch (error) {
        return { success: false, reason: `Claude Code validation error: ${error.message}` };
    }
}

async function validateGeminiCLI() {
    try {
        // Check if .gemini/prompts/aiwf directory exists
        const dirExists = await fs.access('.gemini/prompts/aiwf').then(() => true).catch(() => false);
        if (!dirExists) {
            return { success: false, reason: 'Missing Gemini-CLI prompts directory: .gemini/prompts/aiwf' };
        }
        
        return { success: true };
    } catch (error) {
        return { success: false, reason: `Gemini-CLI validation error: ${error.message}` };
    }
}

async function validateCursorTool() {
    try {
        const dirExists = await fs.access('.cursor/rules').then(() => true).catch(() => false);
        if (!dirExists) {
            return { success: false, reason: 'Missing Cursor rules directory: .cursor/rules' };
        }
        
        return { success: true };
    } catch (error) {
        return { success: false, reason: `Cursor validation error: ${error.message}` };
    }
}

async function validateWindsurfTool() {
    try {
        const dirExists = await fs.access('.windsurf/rules').then(() => true).catch(() => false);
        if (!dirExists) {
            return { success: false, reason: 'Missing Windsurf rules directory: .windsurf/rules' };
        }
        
        return { success: true };
    } catch (error) {
        return { success: false, reason: `Windsurf validation error: ${error.message}` };
    }
}

// Enhanced rollback function for T05_S02
async function rollbackToolEnhanced(tool, backupDir, language = 'ko') {
    const spinner = ora(`Rolling back ${tool}...`).start();
    
    try {
        // Get tool directory mapping
        const toolDir = getToolDirectory(tool);
        if (!toolDir) {
            spinner.fail(`Unknown tool: ${tool}`);
            return false;
        }
        
        // Remove installed directory
        try {
            await fs.access(toolDir);
            await fs.rm(toolDir, { recursive: true, force: true });
            spinner.text = `Removed ${toolDir}`;
        } catch (error) {
            // Directory doesn't exist, skip
        }
        
        // Restore from backup if available
        if (backupDir) {
            const backupFiles = await getBackupFilesForTool(tool, backupDir);
            for (const backup of backupFiles) {
                await restoreBackupFile(backup);
                spinner.text = `Restored ${backup.originalPath}`;
            }
        }
        
        spinner.succeed(`${tool} rolled back successfully`);
        return true;
    } catch (error) {
        spinner.fail(`Failed to rollback ${tool}: ${error.message}`);
        return false;
    }
}

// Helper function to get tool directories
function getToolDirectory(tool) {
    const toolDirs = {
        claudeCode: '.claude/commands/aiwf',
        'claude-code': '.claude/commands/aiwf',
        geminiCLI: '.gemini/prompts/aiwf',
        'gemini-cli': '.gemini/prompts/aiwf',
        cursor: '.cursor/rules',
        windsurf: '.windsurf/rules',
        aiwf: '.aiwf'
    };
    
    return toolDirs[tool] || null;
}

// Helper function to restore backup file
async function restoreBackupFile(backup) {
    try {
        // Ensure target directory exists
        const targetDir = path.dirname(backup.originalPath);
        await fs.mkdir(targetDir, { recursive: true });
        
        // Copy backup file to original location
        await fs.copyFile(backup.backupFile, backup.originalPath);
    } catch (error) {
        throw new Error(`Failed to restore ${backup.originalPath}: ${error.message}`);
    }
}

// Enhanced installation report generation function for T05_S02
function generateInstallationReportEnhanced(results, language) {
    const msg = messages[language];
    
    console.log('\n' + chalk.bold(language === 'ko' ? '📋 설치 리포트' : '📋 Installation Report'));
    console.log('─'.repeat(50));
    
    if (results.success.length > 0) {
        console.log(chalk.green(language === 'ko' ? '✅ 성공적으로 설치된 도구:' : '✅ Successfully Installed Tools:'));
        results.success.forEach(tool => {
            console.log(chalk.green(`  ✓ ${getToolName(tool, language)}`));
        });
    }
    
    if (results.failed.length > 0) {
        console.log(chalk.red(language === 'ko' ? '\n❌ 설치 실패한 도구:' : '\n❌ Failed to Install:'));
        results.failed.forEach(({ tool, reason }) => {
            console.log(chalk.red(`  ✗ ${getToolName(tool, language)}: ${reason}`));
        });
    }
    
    if (results.warnings.length > 0) {
        console.log(chalk.yellow(language === 'ko' ? '\n⚠️ 경고:' : '\n⚠️ Warnings:'));
        results.warnings.forEach(warning => {
            console.log(chalk.yellow(`  ⚠ ${warning}`));
        });
    }
    
    console.log('─'.repeat(50));
}

// Helper function to get localized tool names
function getToolName(tool, language) {
    const toolNames = {
        ko: {
            aiwf: 'AIWF 코어 구조',
            claudeCode: 'Claude Code 명령어',
            'claude-code': 'Claude Code 명령어',
            geminiCLI: 'Gemini-CLI 프롬프트',
            'gemini-cli': 'Gemini-CLI 프롬프트',
            cursor: 'Cursor IDE 규칙',
            windsurf: 'Windsurf IDE 규칙'
        },
        en: {
            aiwf: 'AIWF Core Structure',
            claudeCode: 'Claude Code Commands',
            'claude-code': 'Claude Code Commands',
            geminiCLI: 'Gemini-CLI Prompts',
            'gemini-cli': 'Gemini-CLI Prompts',
            cursor: 'Cursor IDE Rules',
            windsurf: 'Windsurf IDE Rules'
        }
    };
    
    return toolNames[language]?.[tool] || tool;
}

// Enhanced installation flow with validation and rollback for T05_S02
async function performInstallationStepEnhanced(language, selectedTools) {
    try {
        // ... installation performed by existing code ...
        // This function would be integrated into the main installation flow
        
        // After installation, perform validation
        const validation = await validateInstallation(selectedTools, language);
        
        // Handle failed tools with rollback
        if (validation.failed.length > 0) {
            console.log(chalk.yellow('\n⚠️ Some installations failed. Initiating rollback...'));
            
            for (const { tool } of validation.failed) {
                console.log(chalk.yellow(`Rolling back ${tool}...`));
                await rollbackToolEnhanced(tool, BACKUP_DIR, language);
            }
        }
        
        // Generate installation report
        generateInstallationReportEnhanced(validation, language);
        
        // Throw error if complete failure
        if (validation.success.length === 0) {
            const errorMsg = language === 'ko' ? 
                '모든 설치가 실패했습니다.' : 
                'All installations failed.';
            throw new Error(errorMsg);
        }
        
        return validation;
    } catch (error) {
        console.error(chalk.red(`Installation step failed: ${error.message}`));
        throw error;
    }
}

// 설치 리포트 생성 함수 (통합된 버전)
function generateInstallationReport(validationResults, language, installationType = 'install') {
    const msg = messages[language];
    
    // 상단 헤더
    console.log(chalk.blue.bold('\n' + '='.repeat(60)));
    console.log(chalk.blue.bold(
        language === 'ko' ? 
        '🔍 AIWF 설치 검증 및 리포트' : 
        '🔍 AIWF Installation Validation & Report'
    ));
    console.log(chalk.blue.bold('='.repeat(60)));
    
    // 설치 유형 표시
    const installTypeText = {
        install: language === 'ko' ? '새 설치' : 'Fresh Installation',
        update: language === 'ko' ? '업데이트' : 'Update',
        reinstall: language === 'ko' ? '재설치' : 'Reinstallation'
    };
    console.log(chalk.gray(`설치 유형 / Installation Type: ${installTypeText[installationType] || installTypeText.install}`));
    console.log(chalk.gray(`검증 시간 / Validation Time: ${new Date().toLocaleString()}`));
    
    // 전체 요약
    const { overall } = validationResults;
    const statusIcon = overall.success ? '✅' : '❌';
    const statusColor = overall.success ? chalk.green : chalk.red;
    
    console.log(statusColor(`\n${statusIcon} 전체 상태 / Overall Status: ${overall.success ? 'PASSED' : 'FAILED'}`));
    console.log(chalk.gray(`   검증한 도구 / Tools Checked: ${overall.toolsChecked}`));
    console.log(chalk.gray(`   성공한 도구 / Tools Passed: ${overall.toolsPassed}`));
    
    if (overall.toolsFailed > 0) {
        console.log(chalk.red(`   실패한 도구 / Tools Failed: ${overall.toolsFailed}`));
        console.log(chalk.red(`   총 이슈 수 / Total Issues: ${overall.totalIssues}`));
    }

    // 개별 도구 결과
    console.log(chalk.blue('\n=== 개별 도구 결과 / Individual Tool Results ==='));
    
    for (const [toolName, result] of Object.entries(validationResults.tools)) {
        const toolIcon = result.success ? '✅' : '❌';
        const toolColor = result.success ? chalk.green : chalk.red;
        
        console.log(toolColor(`\n${toolIcon} ${result.description} (${toolName})`));
        console.log(chalk.gray(`   디렉토리 / Directory: ${result.baseDir}`));
        console.log(chalk.gray(`   파일 수 / Files Found: ${result.checks.fileCount}`));
        console.log(chalk.gray(`   총 크기 / Total Size: ${(result.checks.totalSize / 1024).toFixed(2)} KB`));
        
        if (result.checks.issues.length > 0) {
            console.log(chalk.red(`   이슈 / Issues:`));
            for (const issue of result.checks.issues) {
                console.log(chalk.red(`     • ${issue}`));
            }
        }
        
        if (result.checks.requiredFiles.length > 0) {
            console.log(chalk.gray(`   필수 파일 / Required Files:`));
            for (const fileCheck of result.checks.requiredFiles) {
                const fileIcon = fileCheck.valid ? '✅' : '❌';
                const fileColor = fileCheck.valid ? chalk.gray : chalk.red;
                console.log(fileColor(`     ${fileIcon} ${fileCheck.file} (${(fileCheck.size / 1024).toFixed(2)} KB)`));
            }
        }
    }
    
    // 권장사항 섹션
    console.log(chalk.blue('\n=== 권장사항 / Recommendations ==='));
    if (overall.success) {
        console.log(chalk.green('🎉 모든 도구가 올바르게 설치되어 검증되었습니다!'));
        console.log(chalk.green('🎉 All tools are properly installed and validated!'));
        console.log(chalk.blue('\n다음 단계 / Next Steps:'));
        console.log(chalk.white('   1. Claude Code에서 프로젝트를 열어보세요'));
        console.log(chalk.white('   2. /project:aiwf:initialize 명령어로 프로젝트를 초기화하세요'));
        console.log(chalk.white('   3. 프로젝트 관리를 시작하세요!'));
    } else {
        console.log(chalk.yellow('⚠️  일부 이슈가 발견되었습니다. 위의 세부사항을 확인하세요.'));
        console.log(chalk.yellow('⚠️  Some issues were found. See details above.'));
        
        // 실패한 도구별 해결 방안 제시
        const failedTools = Object.entries(validationResults.tools)
            .filter(([_, result]) => !result.success)
            .map(([tool, _]) => tool);
            
        if (failedTools.length > 0) {
            console.log(chalk.blue('\n해결 방안 / Solutions:'));
            console.log(chalk.yellow('   • 전체 재설치를 시도해보세요'));
            console.log(chalk.yellow('   • 실패한 도구만 롤백 후 다시 설치하세요'));
            console.log(chalk.yellow('   • 네트워크 연결을 확인하고 다시 시도하세요'));
        }
    }
    
    console.log(chalk.blue.bold('\n' + '='.repeat(60)));
}

// 검증 결과 표시 함수 (기존 함수는 유지, 새로운 리포트 함수와 함께 사용)
function displayValidationResults(validationResults, language) {
    return generateInstallationReport(validationResults, language, 'install');
}

// 도구별 디렉토리 매핑 함수 (중복 제거됨 - 위의 함수 사용)

// 특정 도구의 백업 파일 목록 가져오기
async function getBackupFilesForTool(tool, backupDir) {
    const toolBackupFiles = [];
    
    try {
        const backupFiles = await fs.readdir(backupDir);
        const toolDir = getToolDirectory(tool);
        
        if (!toolDir) return toolBackupFiles;
        
        // 도구별 백업 파일 패턴 매칭
        const patterns = {
            claudeCode: /^claude-commands-aiwf-.*\.bak$/,
            geminiCLI: /^gemini-prompts-aiwf-.*\.bak$/,
            cursor: /^cursor-rules-.*\.bak$/,
            windsurf: /^windsurf-rules-.*\.bak$/,
            aiwf: /^aiwf-.*\.bak$/
        };
        
        const pattern = patterns[tool];
        if (pattern) {
            const matchingFiles = backupFiles.filter(file => pattern.test(file));
            for (const file of matchingFiles) {
                toolBackupFiles.push({
                    backupFile: path.join(backupDir, file),
                    originalPath: restoreOriginalPath(file, tool)
                });
            }
        }
        
    } catch (error) {
        // 백업 디렉토리가 없거나 읽을 수 없는 경우
    }
    
    return toolBackupFiles;
}

// 백업 파일명에서 원본 경로 복원
function restoreOriginalPath(backupFileName, tool) {
    const toolDirs = {
        claudeCode: '.claude/commands/aiwf',
        geminiCLI: '.gemini/prompts/aiwf',
        cursor: '.cursor/rules',
        windsurf: '.windsurf/rules',
        aiwf: '.aiwf'
    };
    
    const baseDir = toolDirs[tool];
    if (!baseDir) return null;
    
    // 백업 파일명에서 원본 파일명 추출
    let originalFileName = backupFileName;
    
    // 도구별 프리픽스 제거
    const prefixes = {
        claudeCode: 'claude-commands-aiwf-',
        geminiCLI: 'gemini-prompts-aiwf-',
        cursor: 'cursor-rules-',
        windsurf: 'windsurf-rules-',
        aiwf: 'aiwf-'
    };
    
    const prefix = prefixes[tool];
    if (prefix && originalFileName.startsWith(prefix)) {
        originalFileName = originalFileName.substring(prefix.length);
    }
    
    // .bak 확장자 제거
    if (originalFileName.endsWith('.bak')) {
        originalFileName = originalFileName.substring(0, originalFileName.length - 4);
    }
    
    // 하이픈을 슬래시로 복원 (하위 디렉토리 구조)
    originalFileName = originalFileName.replace(/-/g, '/');
    
    return path.join(baseDir, originalFileName);
}

// 개별 백업 파일 복원 (중복 제거됨 - 위의 함수 사용)

// 특정 도구 롤백 함수
async function rollbackTool(tool, backupDir, language = 'ko') {
    const msg = messages[language];
    const spinner = ora(
        language === 'ko' ? 
        `${tool} 도구를 롤백하는 중...` : 
        `Rolling back ${tool}...`
    ).start();
    
    try {
        // 1. 해당 도구의 디렉토리 삭제
        const toolDir = getToolDirectory(tool);
        if (toolDir) {
            const dirExists = await fs.access(toolDir).then(() => true).catch(() => false);
            if (dirExists) {
                await fs.rm(toolDir, { recursive: true, force: true });
                spinner.text = language === 'ko' ? 
                    `${tool} 디렉토리 삭제 완료` : 
                    `${tool} directory removed`;
            }
        }
        
        // 2. 백업에서 복원
        const backupFiles = await getBackupFilesForTool(tool, backupDir);
        let restoredCount = 0;
        
        for (const backup of backupFiles) {
            const restored = await restoreBackupFile(backup);
            if (restored) {
                restoredCount++;
            }
        }
        
        if (restoredCount > 0) {
            spinner.succeed(chalk.green(
                language === 'ko' ? 
                `${tool} 롤백 완료 (${restoredCount}개 파일 복원)` : 
                `${tool} rolled back successfully (${restoredCount} files restored)`
            ));
            return { success: true, restoredCount };
        } else {
            spinner.warn(chalk.yellow(
                language === 'ko' ? 
                `${tool} 롤백: 복원할 백업 파일이 없음` : 
                `${tool} rollback: No backup files to restore`
            ));
            return { success: true, restoredCount: 0 };
        }
        
    } catch (error) {
        spinner.fail(chalk.red(
            language === 'ko' ? 
            `${tool} 롤백 실패: ${error.message}` : 
            `Failed to rollback ${tool}: ${error.message}`
        ));
        return { success: false, error: error.message };
    }
}

// =============================================================================
// ROLLBACK SYSTEM IMPLEMENTATION
// =============================================================================

// 도구별 디렉토리 경로 가져오기 (중복 제거됨 - 위의 getToolDirectory 함수 사용)

// 백업에서 특정 도구의 파일들 찾기 (중복 제거됨 - 위의 함수 사용)

// 백업 파일명에서 원래 경로 복원
function restoreBackupPath(backupFileName, tool) {
    const toolDir = getToolDirectory(tool);
    if (!toolDir) return null;
    
    // 백업 파일명 패턴: claude-commands-aiwf-foo.md.bak -> .claude/commands/aiwf/foo.md
    if (backupFileName.startsWith('claude-commands-aiwf-')) {
        const relativePath = backupFileName
            .replace('claude-commands-aiwf-', '')
            .replace('.bak', '')
            .replace(/-/g, '/');
        return path.join('.claude/commands/aiwf', relativePath);
    }
    
    // 백업 파일명 패턴: aiwf-foo-bar.md.bak -> .aiwf/foo/bar.md
    if (backupFileName.startsWith('aiwf-')) {
        const relativePath = backupFileName
            .replace('aiwf-', '')
            .replace('.bak', '')
            .replace(/-/g, '/');
        return path.join('.aiwf', relativePath);
    }
    
    // 기타 패턴
    return backupFileName.replace('.bak', '');
}

// 개별 백업 파일 복원 (중복 제거됨 - 위의 함수 사용)

// 특정 도구 롤백 함수

// 다중 도구 롤백 함수
async function rollbackMultipleTools(failedTools, backupDir, language = 'en') {
    const results = {
        success: [],
        failed: [],
        partial: []
    };
    
    console.log(chalk.blue('\n🔄 Starting rollback process...'));
    
    for (const toolInfo of failedTools) {
        const toolName = typeof toolInfo === 'string' ? toolInfo : toolInfo.tool;
        const rollbackResult = await rollbackTool(toolName, backupDir, language);
        
        if (rollbackResult === true) {
            results.success.push(toolName);
        } else if (rollbackResult === false) {
            results.failed.push(toolName);
        } else {
            results.partial.push(toolName);
        }
    }
    
    // 롤백 결과 요약
    console.log(chalk.blue('\n📋 Rollback Summary:'));
    if (results.success.length > 0) {
        console.log(chalk.green(`✅ Successfully rolled back: ${results.success.join(', ')}`));
    }
    if (results.partial.length > 0) {
        console.log(chalk.yellow(`⚠️  Partially rolled back: ${results.partial.join(', ')}`));
    }
    if (results.failed.length > 0) {
        console.log(chalk.red(`❌ Failed to rollback: ${results.failed.join(', ')}`));
    }
    
    return results;
}

// 개선된 재설치 옵션 제공 함수
async function offerReinstallationOptions(validationResults, language) {
    console.log(chalk.yellow(
        language === 'ko' ? 
        '\n⚠️  일부 설치가 실패했습니다. 무엇을 하시겠습니까?' :
        '\n⚠️  Some installations failed. What would you like to do?'
    ));
    
    // 실패한 도구들 나열 - 새로운 형식에 맞게 수정
    const failedTools = validationResults.failed.map(({tool}) => tool);
    
    if (failedTools.length > 0) {
        console.log(chalk.red(
            language === 'ko' ? 
            `실패한 도구: ${failedTools.join(', ')}` :
            `Failed tools: ${failedTools.join(', ')}`
        ));
    }
    
    const response = await prompts({
        type: 'select',
        name: 'action',
        message: language === 'ko' ? '어떤 작업을 수행하시겠습니까?' : 'What would you like to do?',
        choices: [
            { 
                title: language === 'ko' ? '전체 재설치' : 'Full reinstallation', 
                value: 'reinstall' 
            },
            { 
                title: language === 'ko' ? '실패한 도구만 롤백' : 'Rollback failed tools only', 
                value: 'rollback' 
            },
            { 
                title: language === 'ko' ? '현재 상태 유지' : 'Keep current state', 
                value: 'keep' 
            }
        ]
    });
    
    return response.action;
}

// =============================================================================
// ROLLBACK SYSTEM
// =============================================================================

// 도구별 롤백 함수
// 도구별 백업 복원 함수
async function restoreToolFromBackup(tool, backupDir) {
    try {
        const backupFiles = await fs.readdir(backupDir);
        const toolBackups = backupFiles.filter(f => f.endsWith('.bak'));
        
        for (const backup of toolBackups) {
            let shouldRestore = false;
            let originalPath = '';
            
            // 도구별 백업 파일 패턴 매칭
            switch (tool) {
                case 'claudeCode':
                    if (backup.startsWith('claude-commands-aiwf-')) {
                        shouldRestore = true;
                        const fileName = backup.replace('claude-commands-aiwf-', '').replace('.bak', '');
                        originalPath = path.join('.claude/commands/aiwf', fileName);
                    }
                    break;
                case 'aiwf':
                    if (backup.startsWith('aiwf-')) {
                        shouldRestore = true;
                        const relativePath = backup.replace('aiwf-', '').replace(/-/g, '/').replace('.bak', '');
                        originalPath = '.aiwf/' + relativePath;
                    }
                    break;
                // cursor와 windsurf는 현재 백업하지 않음 (rules 파일은 동적 생성)
            }
            
            if (shouldRestore) {
                const backupPath = path.join(backupDir, backup);
                await fs.mkdir(path.dirname(originalPath), { recursive: true });
                await fs.copyFile(backupPath, originalPath);
            }
        }
    } catch (error) {
        // 백업 복원 실패는 심각하지 않음
        console.warn(`Warning: Could not restore ${tool} from backup: ${error.message}`);
    }
}

// 실패한 도구들에 대한 일괄 롤백
async function rollbackFailedTools(failedTools, language) {
    const results = {
        success: [],
        failed: []
    };
    
    for (const toolInfo of failedTools) {
        const tool = typeof toolInfo === 'object' ? toolInfo.tool : toolInfo;
        const rollbackSuccess = await rollbackTool(tool, language);
        
        if (rollbackSuccess) {
            results.success.push(tool);
        } else {
            results.failed.push(tool);
        }
    }
    
    return results;
}

// =============================================================================
// MAIN INSTALLATION FUNCTION
// =============================================================================

async function installAIWF(options = {}) {
    const debugLog = options.debugLog || false;

    // 언어 선택
    let selectedLanguage = 'en'; // 기본값은 영어
    if (!options.force) {
        const languageResponse = await prompts({
            type: 'select',
            name: 'language',
            message: 'Please select language / 언어를 선택해주세요:',
            choices: [
                { title: 'English', value: 'en' },
                { title: '한국어 (Korean)', value: 'ko' }
            ]
        });

        if (languageResponse.language) {
            selectedLanguage = languageResponse.language;
        }
    }

    const msg = messages[selectedLanguage];

    console.log(chalk.blue.bold(msg.welcome));
    console.log(chalk.gray(msg.description));
    console.log(chalk.gray(msg.optimized));

    // 언어별 경로 설정
    const languagePath = selectedLanguage === 'en' ? 'en' : 'ko';
    const GITHUB_CONTENT_LANGUAGE_PREFIX = `${GITHUB_CONTENT_PREFIX}/${languagePath}`;

    const hasExisting = await checkExistingInstallation();

    if (hasExisting && !options.force) {
        const response = await prompts({
            type: 'select',
            name: 'action',
            message: msg.existingDetected,
            choices: [
                { title: msg.updateOption, value: 'update' },
                { title: msg.skipOption, value: 'skip' },
                { title: msg.cancelOption, value: 'cancel' }
            ]
        });

        if (response.action === 'skip' || response.action === 'cancel') {
            console.log(chalk.yellow(msg.installCancelled));
            process.exit(0);
        }

        if (response.action === 'update') {
            await backupCommandsAndDocs(msg);
        }
    }

    const spinner = ora(msg.fetching).start();

    try {
        // Create .aiwf directory structure
        const aiwfDirs = [
            '.aiwf',
            '.aiwf/01_PROJECT_DOCS',
            '.aiwf/02_REQUIREMENTS',
            '.aiwf/03_SPRINTS',
            '.aiwf/04_GENERAL_TASKS',
            '.aiwf/05_ARCHITECTURE_DECISIONS',
            '.aiwf/10_STATE_OF_PROJECT',
            '.aiwf/98_PROMPTS',
            '.aiwf/99_TEMPLATES'
        ];

        for (const dir of aiwfDirs) {
            await fs.mkdir(dir, { recursive: true });
        }

        // Only download manifest on fresh installs
        if (!hasExisting) {
            logWithSpinner(spinner, msg.downloading, debugLog);
            // Get the root manifest
            try {
                const manifestUrl = `${GITHUB_RAW_URL}/${GITHUB_CONTENT_LANGUAGE_PREFIX}/.aiwf/00_PROJECT_MANIFEST.md`;
                await downloadFile(manifestUrl, '.aiwf/00_PROJECT_MANIFEST.md');
            } catch (error) {
                // If manifest doesn't exist, that's okay
            }
        }

        // Download templates on fresh install
        try {
            logWithSpinner(spinner, msg.downloadingTemplates, debugLog);
            await downloadDirectory(`${GITHUB_CONTENT_LANGUAGE_PREFIX}/.aiwf/98_PROMPTS`, '.aiwf/98_PROMPTS', spinner, msg);
            await downloadDirectory(`${GITHUB_CONTENT_LANGUAGE_PREFIX}/.aiwf/99_TEMPLATES`, '.aiwf/99_TEMPLATES', spinner, msg);
        } catch (error) {
            logWithSpinner(spinner, msg.templatesNotFound, debugLog);
        }

        // Always update CLAUDE.md documentation files
        logWithSpinner(spinner, msg.updatingDocs, debugLog);
        const claudeFiles = [
            '.aiwf/CLAUDE.md',
            '.aiwf/02_REQUIREMENTS/CLAUDE.md',
            '.aiwf/03_SPRINTS/CLAUDE.md',
            '.aiwf/04_GENERAL_TASKS/CLAUDE.md'
        ];

        for (const claudeFile of claudeFiles) {
            try {
                const claudeUrl = `${GITHUB_RAW_URL}/${GITHUB_CONTENT_LANGUAGE_PREFIX}/${claudeFile}`;
                await downloadFile(claudeUrl, claudeFile);
            } catch (error) {
                // If CLAUDE.md doesn't exist, that's okay
            }
        }

        // Delete and recreate commands directory
        const commandsExist = await fs.access(COMMANDS_DIR).then(() => true).catch(() => false);

        if (commandsExist) {
            logWithSpinner(spinner, msg.deletingOldCommands, debugLog);
            await fs.rm(COMMANDS_DIR, { recursive: true, force: true });
        }

        await fs.mkdir(COMMANDS_DIR, { recursive: true });

        // Always update commands (clean download)
        logWithSpinner(spinner, msg.downloadingCommands, debugLog);
        try {
            await downloadDirectory(`${GITHUB_CONTENT_LANGUAGE_PREFIX}/${COMMANDS_DIR}`, COMMANDS_DIR, spinner, msg);
        } catch (error) {
            logWithSpinner(spinner, msg.commandsNotFound, debugLog);
        }

        // 2. rules/global 폴더 다운로드 (임시 폴더)
        let tmpRulesGlobal = '.aiwf/_tmp_rules_global';
        try {
            logWithSpinner(spinner, msg.downloadingRulesGlobal, debugLog);
            await downloadDirectory(`rules/global`, tmpRulesGlobal, spinner, msg);
        } catch (error) {
            logWithSpinner(spinner, msg.rulesGlobalNotFound, debugLog);
            tmpRulesGlobal = null;
        }

        // 2-1. rules/manual 폴더 다운로드 (임시 폴더)
        let tmpRulesManual = '.aiwf/_tmp_rules_manual';
        try {
            logWithSpinner(spinner, msg.downloadingRulesManual, debugLog);
            await downloadDirectory(`rules/manual`, tmpRulesManual, spinner, msg);
        } catch (error) {
            logWithSpinner(spinner, msg.rulesManualNotFound, debugLog);
            tmpRulesManual = null;
        }

        // 3. rules/global -> .cursor/rules(.mdc+헤더), .windsurf/rules(확장자 유지) 복사
        if (tmpRulesGlobal) {
            const cursorRulesDir = '.cursor/rules';
            const windsurfRulesDir = '.windsurf/rules';
            await fs.mkdir(cursorRulesDir, { recursive: true });
            await fs.mkdir(windsurfRulesDir, { recursive: true });
            const files = await fs.readdir(tmpRulesGlobal);
            for (const file of files) {
                const srcPath = path.join(tmpRulesGlobal, file);
                const stat = await fs.stat(srcPath);
                if (!stat.isFile()) continue;
                // .cursor/rules: 확장자 mdc, 헤더 추가 (alwaysApply: true)
                const base = path.parse(file).name;
                const cursorTarget = path.join(cursorRulesDir, base + '.mdc');
                const content = await fs.readFile(srcPath, 'utf8');
                const header = '---\ndescription: \nglobs: \nalwaysApply: true\n---\n';
                await fs.writeFile(cursorTarget, header + content, 'utf8');
                logWithSpinner(spinner, `[rules/global] ${file} -> .cursor/rules/${base}.mdc`, debugLog);
                // .windsurf/rules: 확장자 유지, 헤더 없음
                const windsurfTarget = path.join(windsurfRulesDir, file);
                await fs.copyFile(srcPath, windsurfTarget);
                logWithSpinner(spinner, `[rules/global] ${file} -> .windsurf/rules/${file}`, debugLog);
            }
            // 임시 폴더 삭제
            for (const file of files) {
                await fs.unlink(path.join(tmpRulesGlobal, file));
            }
            await fs.rmdir(tmpRulesGlobal);
        }

        // 3-1. rules/manual -> .cursor/rules(.mdc+헤더), .windsurf/rules(확장자 유지) 복사
        if (tmpRulesManual) {
            const cursorRulesDir = '.cursor/rules';
            const windsurfRulesDir = '.windsurf/rules';
            await fs.mkdir(cursorRulesDir, { recursive: true });
            await fs.mkdir(windsurfRulesDir, { recursive: true });
            const files = await fs.readdir(tmpRulesManual);
            for (const file of files) {
                const srcPath = path.join(tmpRulesManual, file);
                const stat = await fs.stat(srcPath);
                if (!stat.isFile()) continue;
                // .cursor/rules: 확장자 mdc, 헤더 추가 (alwaysApply: false)
                const base = path.parse(file).name;
                const cursorTarget = path.join(cursorRulesDir, base + '.mdc');
                const content = await fs.readFile(srcPath, 'utf8');
                const header = '---\ndescription: \nglobs: \nalwaysApply: false\n---\n';
                await fs.writeFile(cursorTarget, header + content, 'utf8');
                logWithSpinner(spinner, `[rules/manual] ${file} -> .cursor/rules/${base}.mdc`, debugLog);
                // .windsurf/rules: 확장자 유지, 헤더 없음
                const windsurfTarget = path.join(windsurfRulesDir, file);
                await fs.copyFile(srcPath, windsurfTarget);
                logWithSpinner(spinner, `[rules/manual] ${file} -> .windsurf/rules/${file}`, debugLog);
            }
            // 임시 폴더 삭제
            for (const file of files) {
                await fs.unlink(path.join(tmpRulesManual, file));
            }
            await fs.rmdir(tmpRulesManual);
        }

        if (hasExisting) {
            spinner.succeed(chalk.green(msg.updateSuccess));
            console.log(chalk.blue(`\n${msg.updateHistory}`));
            console.log(chalk.gray(`   • ${COMMANDS_DIR}${msg.updatedCommands}`));
            console.log(chalk.gray(`   • ${msg.updatedDocs}`));
            console.log(chalk.green(`\n${msg.workPreserved}`));
            console.log(chalk.gray(`   • ${msg.allFilesPreserved}`));
            console.log(chalk.gray(`   • ${msg.backupCreated}`));
        } else {
            spinner.succeed(chalk.green(msg.installSuccess));
            console.log(chalk.blue(`\n${msg.structureCreated}`));
            console.log(chalk.gray(`   .aiwf/                - ${msg.aiwfRoot}`));
            console.log(chalk.gray(`   .claude/commands/     - ${msg.claudeCommands}`));

            console.log(chalk.green(`\n${msg.nextSteps}`));
            console.log(chalk.white(`   1. ${msg.nextStep1}`));
            console.log(chalk.white(`   2. ${msg.nextStep2}`));
            console.log(chalk.white(`   3. ${msg.nextStep3}\n`));

            console.log(chalk.blue(`\n${msg.gettingStarted}`));
            console.log(chalk.gray(`   1. ${msg.startStep1}`));
            console.log(chalk.gray(`   2. ${msg.startStep2}`));
            console.log(chalk.gray(`\n${msg.checkDocs}`));
        }

        // 설치 검증 실행
        console.log(chalk.blue('\n🔍 Installation Validation / 설치 검증을 시작합니다...'));
        // Use specification-compliant validation function
        const selectedTools = ['claude-code', 'cursor', 'windsurf']; // Default tools for this version
        const validationResults = await validateInstallation(selectedTools, selectedLanguage);
        displaySpecCompliantValidationResults(validationResults, selectedLanguage);
        
        // 부분 실패 시 재설치/롤백 옵션 제공  
        if (validationResults.failed.length > 0) {
            const action = await offerReinstallationOptions(validationResults, selectedLanguage);
            
            if (action === 'reinstall') {
                console.log(chalk.blue('\n🔄 재설치를 시작합니다... / Starting reinstallation...'));
                // 재귀적으로 설치를 다시 시도 (한 번만)
                if (!options.isRetry) {
                    return await installAIWF({ ...options, isRetry: true });
                }
            } else if (action === 'rollback') {
                console.log(chalk.blue('\n↩️  실패한 도구를 롤백합니다... / Rolling back failed tools...'));
                
                // 실패한 도구들만 롤백 - 새로운 형식에 맞게 수정
                const failedTools = validationResults.failed.map(({tool}) => tool);
                
                let rollbackResults = {};
                for (const tool of failedTools) {
                    if (BACKUP_DIR) {
                        const rollbackResult = await rollbackTool(tool, BACKUP_DIR, selectedLanguage);
                        rollbackResults[tool] = rollbackResult;
                    }
                }
                
                // 롤백 후 다시 검증
                console.log(chalk.blue('\n🔍 롤백 후 재검증... / Re-validating after rollback...'));
                const postRollbackValidation = await validateInstallation(selectedTools, selectedLanguage);
                displaySpecCompliantValidationResults(postRollbackValidation, selectedLanguage);
                
                // 롤백 결과 요약
                console.log(chalk.blue('\n=== Rollback Summary / 롤백 요약 ==='));
                for (const [tool, result] of Object.entries(rollbackResults)) {
                    if (result.success) {
                        console.log(chalk.green(`✅ ${tool}: ${result.restoredCount} files restored`));
                    } else {
                        console.log(chalk.red(`❌ ${tool}: ${result.error}`));
                    }
                }
            }
        }

        console.log(chalk.green(msg.enjoy));

    } catch (error) {
        if (hasExisting) {
            spinner.fail(chalk.red(msg.updateFailed));
            await restoreFromBackup(spinner, msg);
        } else {
            spinner.fail(chalk.red(msg.installFailed));
        }
        console.error(chalk.red(error.message));
        process.exit(1);
    }
}

async function restoreFromBackup(spinner, msg) {
    if (!BACKUP_DIR) {
        // 가장 최근 backup 폴더 사용
        const aiwfDir = '.aiwf';
        const dirs = (await fs.readdir(aiwfDir)).filter(f => f.startsWith('backup_'));
        if (dirs.length === 0) {
            spinner.fail(chalk.red(msg.noBackupFound));
            return;
        }
        dirs.sort();
        BACKUP_DIR = path.join(aiwfDir, dirs[dirs.length - 1]);
    }
    spinner.start(chalk.yellow(msg.restoringFromBackup));
    try {
        let backupFiles = [];
        try {
            backupFiles = (await fs.readdir(BACKUP_DIR)).filter(f => f.endsWith('.bak'));
        } catch (e) {
            backupFiles = [];
        }
        for (const backup of backupFiles) {
            // 원래 위치 추정: claude-commands-aiwf-foo.md.bak -> .claude/commands/aiwf/foo.md
            let originalFile;
            if (backup.startsWith('aiwf-')) {
                // .aiwf/ 하위
                const rel = backup.replace(/-/g, '/').replace('.bak', '');
                originalFile = '.' + rel;
            } else if (backup.startsWith('claude-commands-aiwf-')) {
                // .claude/commands/aiwf/ 하위
                const rel = backup.replace('claude-commands-aiwf-', '').replace(/-/g, '/').replace('.bak', '');
                originalFile = path.join(COMMANDS_DIR, rel);
            } else {
                // 기타
                originalFile = backup.replace('.bak', '');
            }
            try {
                await fs.rename(path.join(BACKUP_DIR, backup), originalFile);
            } catch (e) {
                console.warn(chalk.yellow(`'${backup}' ${msg.cannotRestore}`));
            }
        }
        spinner.succeed(chalk.green(msg.restoreSuccess));
    } catch (error) {
        spinner.fail(chalk.red(msg.restoreFailed));
        console.error(error);
    }
}

program
    .name('aiwf')
    .version('1.0.1')
    .description('AIWF Installer')
    .option('-f, --force', 'Force install without prompts')
    .action((options) => installAIWF({ ...options, debugLog: true }));

program.parse(process.argv);