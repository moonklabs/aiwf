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

const GITHUB_API_URL = 'https://api.github.com/repos/moonklabs/aiwf';
const GITHUB_RAW_URL = 'https://raw.githubusercontent.com/moonklabs/aiwf/master';
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
            // 상대경로 보존: .claude/commands/aiwf/foo.md -> backupDir/claude-commands-aiwf-foo.md.bak
            let bakFileName;
            if (filePath.startsWith(COMMANDS_DIR + '/')) {
                bakFileName = filePath.replace(/\//g, '-').replace(/^\./, '') + '.bak';
            } else if (filePath.startsWith('.aiwf/')) {
                bakFileName = filePath.replace(/\//g, '-').replace(/^\./, '') + '.bak';
            } else {
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