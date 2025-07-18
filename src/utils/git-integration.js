#!/usr/bin/env node

import { promises as fs } from 'fs';
import path from 'path';
import { exec, execSync } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const execAsync = promisify(exec);

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
        // 폴더가 없거나 읽기 실패 시 계속 진행
    }
    
    // completed, archived 폴더도 확인
    const otherPaths = ['completed', 'archived'];
    for (const folder of otherPaths) {
        const folderPath = path.join(FEATURE_LEDGERS_PATH, folder);
        try {
            const files = await fs.readdir(folderPath);
            const featureFile = files.find(file => file.startsWith(`${featureId}_`));
            if (featureFile) {
                return path.join(folderPath, featureFile);
            }
        } catch (error) {
            // 폴더가 없거나 읽기 실패 시 계속 진행
        }
    }
    
    return null;
}

// Git 커밋 정보 가져오기
async function getCommitInfo(commitHash) {
    try {
        const { stdout } = await execAsync(`git show --no-patch --format="%H|%h|%an|%ae|%ad|%s" ${commitHash}`);
        const [hash, shortHash, author, email, date, message] = stdout.trim().split('|');
        return {
            hash,
            shortHash,
            author,
            email,
            date: new Date(date).toISOString(),
            message
        };
    } catch (error) {
        console.error(`Error getting commit info for ${commitHash}:`, error.message);
        return null;
    }
}

// YAML frontmatter 파싱
function parseYamlFrontmatter(content) {
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return null;
    
    const yaml = match[1];
    const metadata = {};
    
    // 간단한 YAML 파싱 (복잡한 구조는 제외)
    yaml.split('\n').forEach(line => {
        const keyValue = line.match(/^(\w+):\s*(.*)$/);
        if (keyValue) {
            const [_, key, value] = keyValue;
            metadata[key] = value.trim();
        }
    });
    
    return metadata;
}

// YAML frontmatter 업데이트
function updateYamlFrontmatter(content, metadata) {
    const existingMatch = content.match(/^---\n([\s\S]*?)\n---/);
    
    let yamlLines = [];
    Object.entries(metadata).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            yamlLines.push(`${key}: ${value}`);
        }
    });
    
    const newYaml = `---\n${yamlLines.join('\n')}\n---`;
    
    if (existingMatch) {
        return content.replace(/^---\n[\s\S]*?\n---/, newYaml);
    } else {
        return `${newYaml}\n\n${content}`;
    }
}

// Git 로그에서 Feature 관련 커밋 가져오기
async function getFeatureCommits(featureId, since = null) {
    try {
        let gitCommand = `git log --grep="${featureId}" --format="%H|%h|%an|%ad|%s"`;
        if (since) {
            gitCommand += ` --since="${since}"`;
        }
        
        const { stdout } = await execAsync(gitCommand);
        if (!stdout.trim()) return [];
        
        const commits = stdout.trim().split('\n').map(line => {
            const [hash, shortHash, author, date, message] = line.split('|');
            return {
                hash,
                shortHash,
                author,
                date: new Date(date).toISOString(),
                message
            };
        });
        
        return commits;
    } catch (error) {
        console.error(`Error getting commits for ${featureId}:`, error.message);
        return [];
    }
}

export {
    extractFeatureId,
    getFeaturePath,
    getCommitInfo,
    parseYamlFrontmatter,
    updateYamlFrontmatter,
    getFeatureCommits,
    AIWF_ROOT,
    FEATURE_LEDGERS_PATH,
    ACTIVE_PATH
};