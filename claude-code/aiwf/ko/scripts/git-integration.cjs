#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const { exec, execSync } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

// AIWF 경로 설정
const AIWF_ROOT = path.join(process.cwd(), '.aiwf');
const FEATURE_LEDGERS_PATH = path.join(AIWF_ROOT, '06_FEATURE_LEDGERS');
const ACTIVE_PATH = path.join(FEATURE_LEDGERS_PATH, 'active');

// 커밋 메시지에서 Feature ID를 추출하는 정규식 패턴들
const FEATURE_ID_PATTERNS = [
    /FL\d{3}(?!\d)/,                    // FL001 (not followed by digit)
    /\[FL\d{3}\]/,                      // [FL001]
    /\(FL\d{3}\)/,                      // (FL001)
    /(feat|fix|docs|style|refactor|test|chore)\(FL\d{3}\)/,  // feat(FL001)
    /FL\d{3}:/,                         // FL001:
    /#FL\d{3}/,                         // #FL001
    /relates to FL\d{3}/i,              // relates to FL001
];

// Feature ID 추출 함수
function extractFeatureId(text) {
    for (const pattern of FEATURE_ID_PATTERNS) {
        const match = text.match(pattern);
        if (match) {
            // 순수 Feature ID만 추출 (FL###)
            const idMatch = match[0].match(/FL\d{3}/);
            if (idMatch) {
                return idMatch[0];
            }
        }
    }
    return null;
}

// Feature 파일 경로 가져오기
async function getFeaturePath(featureId) {
    // active 폴더에서 먼저 확인
    const activePath = path.join(ACTIVE_PATH, `${featureId}_*.md`);
    try {
        const files = await fs.readdir(ACTIVE_PATH);
        const featureFile = files.find(file => file.startsWith(`${featureId}_`));
        if (featureFile) {
            return path.join(ACTIVE_PATH, featureFile);
        }
    } catch (error) {
        // active 폴더가 없거나 접근 불가
    }

    // completed 폴더 확인
    const completedPath = path.join(FEATURE_LEDGERS_PATH, 'completed');
    try {
        const files = await fs.readdir(completedPath);
        const featureFile = files.find(file => file.startsWith(`${featureId}_`));
        if (featureFile) {
            return path.join(completedPath, featureFile);
        }
    } catch (error) {
        // completed 폴더가 없거나 접근 불가
    }

    return null;
}

// YAML frontmatter 파싱
function parseYamlFrontmatter(content) {
    const yamlMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (!yamlMatch) return null;

    const yamlContent = yamlMatch[1];
    const lines = yamlContent.split('\n');
    const metadata = {};

    let currentKey = null;
    let currentArray = null;
    let inArray = false;

    for (const line of lines) {
        if (line.trim() === '') continue;

        // 배열 항목 처리
        if (line.startsWith('  - ')) {
            if (currentArray) {
                currentArray.push(line.substring(4).trim());
            }
            continue;
        }

        // 새로운 키 처리
        const keyMatch = line.match(/^(\w+):\s*(.*)/);
        if (keyMatch) {
            currentKey = keyMatch[1];
            const value = keyMatch[2].trim();

            if (value.startsWith('[')) {
                // 인라인 배열
                metadata[currentKey] = value.slice(1, -1).split(',').map(v => v.trim());
                currentArray = null;
            } else if (value === '') {
                // 다음 줄에 배열이 올 수 있음
                metadata[currentKey] = [];
                currentArray = metadata[currentKey];
            } else {
                // 일반 값
                metadata[currentKey] = value;
                currentArray = null;
            }
        }
    }

    return metadata;
}

// YAML frontmatter 업데이트
function updateYamlFrontmatter(content, updates) {
    const yamlMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (!yamlMatch) return content;

    const metadata = parseYamlFrontmatter(content);
    if (!metadata) return content;

    // 메타데이터 업데이트
    Object.assign(metadata, updates);

    // YAML 문자열 재구성
    let yamlLines = ['---'];
    
    for (const [key, value] of Object.entries(metadata)) {
        if (Array.isArray(value)) {
            if (value.length === 0) {
                yamlLines.push(`${key}: []`);
            } else {
                yamlLines.push(`${key}:`);
                value.forEach(item => {
                    yamlLines.push(`  - ${item}`);
                });
            }
        } else if (typeof value === 'object' && value !== null) {
            yamlLines.push(`${key}:`);
            for (const [subKey, subValue] of Object.entries(value)) {
                yamlLines.push(`  ${subKey}: ${subValue}`);
            }
        } else {
            yamlLines.push(`${key}: ${value || ''}`);
        }
    }
    
    yamlLines.push('---');

    // 본문과 결합
    const bodyMatch = content.match(/^---\n[\s\S]*?\n---\n([\s\S]*)/);
    const body = bodyMatch ? bodyMatch[1] : '';
    
    return yamlLines.join('\n') + '\n' + body;
}

// Git 커밋 정보 가져오기
async function getCommitInfo(commitHash) {
    try {
        const { stdout } = await execAsync(
            `git show --no-patch --format="%H|%s|%ae|%ai|%b" ${commitHash}`
        );
        
        const [hash, subject, author, date, body] = stdout.trim().split('|');
        
        // 변경된 파일 수 가져오기
        const { stdout: statsOutput } = await execAsync(
            `git show --stat --format="" ${commitHash} | tail -1`
        );
        
        let filesChanged = 0, insertions = 0, deletions = 0;
        const statsMatch = statsOutput.match(/(\d+) files? changed/);
        if (statsMatch) {
            filesChanged = parseInt(statsMatch[1]);
        }
        const insertMatch = statsOutput.match(/(\d+) insertions?\(\+\)/);
        if (insertMatch) {
            insertions = parseInt(insertMatch[1]);
        }
        const deleteMatch = statsOutput.match(/(\d+) deletions?\(-\)/);
        if (deleteMatch) {
            deletions = parseInt(deleteMatch[1]);
        }

        return {
            hash: hash.substring(0, 7), // 짧은 해시
            message: subject,
            author,
            date: date.split(' ')[0] + ' ' + date.split(' ')[1], // YYYY-MM-DD HH:MM 형식
            files_changed: filesChanged,
            insertions,
            deletions
        };
    } catch (error) {
        console.error(`Error getting commit info: ${error.message}`);
        return null;
    }
}

// Feature에 커밋 링크
async function linkCommitToFeature(featureId, commitInfo) {
    const featurePath = await getFeaturePath(featureId);
    if (!featurePath) {
        console.error(`Feature ${featureId} not found`);
        return false;
    }

    try {
        const content = await fs.readFile(featurePath, 'utf-8');
        const metadata = parseYamlFrontmatter(content);
        
        if (!metadata) {
            console.error(`Invalid feature file format: ${featurePath}`);
            return false;
        }

        // git_commits 배열 초기화
        if (!metadata.git_commits) {
            metadata.git_commits = [];
        }

        // 이미 링크된 커밋인지 확인
        const isLinked = metadata.git_commits.some(commit => 
            typeof commit === 'string' ? commit === commitInfo.hash : commit.hash === commitInfo.hash
        );

        if (!isLinked) {
            // 커밋 정보를 배열에 추가
            metadata.git_commits.push(commitInfo.hash);
        }

        // 상태 업데이트
        if (metadata.status === 'planned') {
            metadata.status = 'active';
        }

        // 마지막 업데이트 시간
        metadata.last_updated = new Date().toISOString().replace('T', ' ').substring(0, 16);

        // 파일 업데이트
        const updatedContent = updateYamlFrontmatter(content, metadata);
        await fs.writeFile(featurePath, updatedContent);

        console.log(`✓ Linked commit ${commitInfo.hash} to feature ${featureId}`);
        return true;
    } catch (error) {
        console.error(`Error linking commit to feature: ${error.message}`);
        return false;
    }
}

// 현재 브랜치를 Feature에 링크
async function linkBranchToFeature(featureId) {
    try {
        const { stdout: branchName } = await execAsync('git rev-parse --abbrev-ref HEAD');
        const branch = branchName.trim();

        const featurePath = await getFeaturePath(featureId);
        if (!featurePath) {
            console.error(`Feature ${featureId} not found`);
            return false;
        }

        const content = await fs.readFile(featurePath, 'utf-8');
        const metadata = parseYamlFrontmatter(content);

        if (!metadata) {
            console.error(`Invalid feature file format: ${featurePath}`);
            return false;
        }

        metadata.git_branch = branch;
        metadata.last_updated = new Date().toISOString().replace('T', ' ').substring(0, 16);

        const updatedContent = updateYamlFrontmatter(content, metadata);
        await fs.writeFile(featurePath, updatedContent);

        console.log(`✓ Linked branch '${branch}' to feature ${featureId}`);
        return true;
    } catch (error) {
        console.error(`Error linking branch to feature: ${error.message}`);
        return false;
    }
}

// 메인 함수
async function main() {
    const args = process.argv.slice(2);
    const command = args[0];

    switch (command) {
        case 'pre-commit':
            // Pre-commit hook 처리
            try {
                const { stdout: stagedFiles } = await execAsync('git diff --cached --name-only');
                const files = stagedFiles.trim().split('\n').filter(f => f);
                
                for (const file of files) {
                    try {
                        const { stdout: content } = await execAsync(`git show :${file}`);
                        const featureId = extractFeatureId(content);
                        if (featureId) {
                            console.log(`Found feature reference: ${featureId} in ${file}`);
                            // Feature 활동 업데이트는 post-commit에서 처리
                        }
                    } catch (error) {
                        // 파일 읽기 실패 무시
                    }
                }
            } catch (error) {
                console.error(`Pre-commit error: ${error.message}`);
            }
            break;

        case 'post-commit':
            // Post-commit hook 처리
            try {
                const { stdout: commitMessage } = await execAsync('git log -1 --pretty=%B');
                const featureId = extractFeatureId(commitMessage);
                
                if (featureId) {
                    const { stdout: commitHash } = await execAsync('git rev-parse HEAD');
                    const commitInfo = await getCommitInfo(commitHash.trim());
                    
                    if (commitInfo) {
                        await linkCommitToFeature(featureId, commitInfo);
                    }
                }
            } catch (error) {
                console.error(`Post-commit error: ${error.message}`);
            }
            break;

        case 'link-commit':
            // 수동 커밋 링크
            const featureId = args[1];
            const commitHash = args[2];
            
            if (!featureId || !commitHash) {
                console.error('Usage: git-integration.js link-commit <feature-id> <commit-hash>');
                process.exit(1);
            }

            const commitInfo = await getCommitInfo(commitHash);
            if (commitInfo) {
                await linkCommitToFeature(featureId, commitInfo);
            }
            break;

        case 'link-branch':
            // 현재 브랜치 링크
            const branchFeatureId = args[1];
            
            if (!branchFeatureId) {
                console.error('Usage: git-integration.js link-branch <feature-id>');
                process.exit(1);
            }

            await linkBranchToFeature(branchFeatureId);
            break;

        default:
            console.log('AIWF Git Integration');
            console.log('Usage:');
            console.log('  git-integration.js pre-commit');
            console.log('  git-integration.js post-commit');
            console.log('  git-integration.js link-commit <feature-id> <commit-hash>');
            console.log('  git-integration.js link-branch <feature-id>');
    }
}

// 스크립트 실행
if (require.main === module) {
    main().catch(error => {
        console.error(`Fatal error: ${error.message}`);
        process.exit(1);
    });
}

module.exports = {
    extractFeatureId,
    getFeaturePath,
    linkCommitToFeature,
    linkBranchToFeature,
    parseYamlFrontmatter,
    updateYamlFrontmatter
};