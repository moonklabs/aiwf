#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

// Git hooks 경로
const GIT_HOOKS_PATH = path.join(process.cwd(), '.git', 'hooks');
const SCRIPTS_PATH = path.join(process.cwd(), '.aiwf', 'scripts');

// Hook 템플릿
const PRE_COMMIT_HOOK = `#!/bin/sh
# AIWF Feature-Git Integration Pre-commit Hook
# 이 hook은 AIWF에 의해 자동으로 설치되었습니다.

# 기존 pre-commit hook이 있으면 실행
if [ -f .git/hooks/pre-commit.aiwf-backup ]; then
    .git/hooks/pre-commit.aiwf-backup
    if [ $? -ne 0 ]; then
        exit 1
    fi
fi

# AIWF Git 통합 실행
node .aiwf/scripts/git-integration.cjs pre-commit

exit 0
`;

const POST_COMMIT_HOOK = `#!/bin/sh
# AIWF Feature-Git Integration Post-commit Hook
# 이 hook은 AIWF에 의해 자동으로 설치되었습니다.

# AIWF Git 통합 실행
node .aiwf/scripts/git-integration.cjs post-commit

# 기존 post-commit hook이 있으면 실행
if [ -f .git/hooks/post-commit.aiwf-backup ]; then
    .git/hooks/post-commit.aiwf-backup
fi

exit 0
`;

const POST_MERGE_HOOK = `#!/bin/sh
# AIWF Feature-Git Integration Post-merge Hook
# 이 hook은 AIWF에 의해 자동으로 설치되었습니다.

# 현재 브랜치 확인
branch_name=$(git rev-parse --abbrev-ref HEAD)

# main 또는 master 브랜치로 머지된 경우
if [ "$branch_name" = "main" ] || [ "$branch_name" = "master" ]; then
    # 머지된 브랜치에서 Feature ID 추출
    merge_commit=$(git rev-parse HEAD)
    merge_message=$(git log -1 --pretty=%B $merge_commit)
    
    # Feature ID 추출 시도
    feature_id=$(echo "$merge_message" | grep -o "FL[0-9]\\{3\\}" | head -1)
    
    if [ -n "$feature_id" ]; then
        echo "Updating feature $feature_id status to completed..."
        # Feature 상태 업데이트 명령 실행
        node .aiwf/scripts/update-feature-status.cjs "$feature_id" "completed"
    fi
fi

# 기존 post-merge hook이 있으면 실행
if [ -f .git/hooks/post-merge.aiwf-backup ]; then
    .git/hooks/post-merge.aiwf-backup
fi

exit 0
`;

// Hook 설치 함수
async function installHook(hookName, hookContent) {
    const hookPath = path.join(GIT_HOOKS_PATH, hookName);
    
    try {
        // 기존 hook 백업
        try {
            await fs.access(hookPath);
            const backupPath = `${hookPath}.aiwf-backup`;
            
            // 이미 백업이 있는지 확인
            try {
                await fs.access(backupPath);
                console.log(`✓ Backup already exists for ${hookName}`);
            } catch {
                // 백업 생성
                await fs.copyFile(hookPath, backupPath);
                console.log(`✓ Backed up existing ${hookName} to ${hookName}.aiwf-backup`);
            }
        } catch {
            // 기존 hook이 없음
        }

        // 새 hook 설치
        await fs.writeFile(hookPath, hookContent);
        await fs.chmod(hookPath, 0o755);
        
        console.log(`✓ Installed ${hookName} hook`);
        return true;
    } catch (error) {
        console.error(`✗ Failed to install ${hookName}: ${error.message}`);
        return false;
    }
}

// Hook 제거 함수
async function uninstallHook(hookName) {
    const hookPath = path.join(GIT_HOOKS_PATH, hookName);
    const backupPath = `${hookPath}.aiwf-backup`;
    
    try {
        // 현재 hook 제거
        await fs.unlink(hookPath);
        
        // 백업이 있으면 복원
        try {
            await fs.access(backupPath);
            await fs.rename(backupPath, hookPath);
            console.log(`✓ Restored original ${hookName} hook`);
        } catch {
            console.log(`✓ Removed ${hookName} hook`);
        }
        
        return true;
    } catch (error) {
        console.error(`✗ Failed to uninstall ${hookName}: ${error.message}`);
        return false;
    }
}

// Git 저장소 확인
async function checkGitRepository() {
    try {
        execSync('git rev-parse --git-dir', { stdio: 'ignore' });
        return true;
    } catch {
        return false;
    }
}

// 메인 함수
async function main() {
    const command = process.argv[2] || 'install';

    // Git 저장소 확인
    if (!await checkGitRepository()) {
        console.error('Error: Not in a Git repository');
        process.exit(1);
    }

    // .git/hooks 디렉토리 확인 및 생성
    try {
        await fs.access(GIT_HOOKS_PATH);
    } catch {
        await fs.mkdir(GIT_HOOKS_PATH, { recursive: true });
    }

    switch (command) {
        case 'install':
            console.log('Installing AIWF Git hooks...\n');
            
            const preCommitSuccess = await installHook('pre-commit', PRE_COMMIT_HOOK);
            const postCommitSuccess = await installHook('post-commit', POST_COMMIT_HOOK);
            const postMergeSuccess = await installHook('post-merge', POST_MERGE_HOOK);
            
            if (preCommitSuccess && postCommitSuccess && postMergeSuccess) {
                console.log('\n✓ All hooks installed successfully!');
                console.log('\nThe following hooks are now active:');
                console.log('  - pre-commit: Detects feature references in staged files');
                console.log('  - post-commit: Links commits to features automatically');
                console.log('  - post-merge: Updates feature status on merge to main');
            } else {
                console.log('\n⚠ Some hooks failed to install');
            }
            break;

        case 'uninstall':
            console.log('Uninstalling AIWF Git hooks...\n');
            
            await uninstallHook('pre-commit');
            await uninstallHook('post-commit');
            await uninstallHook('post-merge');
            
            console.log('\n✓ All hooks uninstalled');
            break;

        case 'status':
            console.log('AIWF Git hooks status:\n');
            
            const hooks = ['pre-commit', 'post-commit', 'post-merge'];
            for (const hook of hooks) {
                const hookPath = path.join(GIT_HOOKS_PATH, hook);
                try {
                    const content = await fs.readFile(hookPath, 'utf-8');
                    if (content.includes('AIWF Feature-Git Integration')) {
                        console.log(`✓ ${hook}: AIWF hook installed`);
                    } else {
                        console.log(`○ ${hook}: Other hook installed`);
                    }
                } catch {
                    console.log(`✗ ${hook}: Not installed`);
                }
            }
            break;

        default:
            console.log('AIWF Git Hooks Installer');
            console.log('\nUsage:');
            console.log('  node install-git-hooks.js install    Install AIWF hooks');
            console.log('  node install-git-hooks.js uninstall  Remove AIWF hooks');
            console.log('  node install-git-hooks.js status     Check hooks status');
    }
}

// 스크립트 실행
if (require.main === module) {
    main().catch(error => {
        console.error(`Fatal error: ${error.message}`);
        process.exit(1);
    });
}