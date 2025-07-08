const fs = require('fs').promises;
const path = require('path');
const yaml = require('yaml');
const { getCommitsByFeatureId } = require('./git-utils');

/**
 * Feature Ledger 파일 업데이트 메커니즘
 */

/**
 * Feature 파일 경로 구성
 * @param {string} featureId - Feature ID (예: 'FL001')
 * @param {string} status - Feature 상태 (active, completed, archived)
 * @returns {string} - Feature 파일 경로
 */
function getFeatureFilePath(featureId, status = 'active') {
  const basePath = path.join(process.cwd(), '.aiwf', '06_FEATURE_LEDGERS');
  const fileName = `${featureId}_*.md`;
  return path.join(basePath, status, fileName);
}

/**
 * Feature 파일 찾기
 * @param {string} featureId - Feature ID
 * @returns {Promise<{path: string, status: string}|null>} - 파일 경로와 상태
 */
async function findFeatureFile(featureId) {
  const basePath = path.join(process.cwd(), '.aiwf', '06_FEATURE_LEDGERS');
  const statuses = ['active', 'completed', 'archived'];
  
  for (const status of statuses) {
    const dirPath = path.join(basePath, status);
    try {
      const files = await fs.readdir(dirPath);
      const featureFile = files.find(file => file.startsWith(`${featureId}_`));
      if (featureFile) {
        return {
          path: path.join(dirPath, featureFile),
          status: status
        };
      }
    } catch (error) {
      // 디렉토리가 없을 수 있음
      continue;
    }
  }
  
  return null;
}

/**
 * Feature 파일 읽기
 * @param {string} filePath - 파일 경로
 * @returns {Promise<{frontmatter: Object, content: string}>}
 */
async function readFeatureFile(filePath) {
  const fileContent = await fs.readFile(filePath, 'utf8');
  const lines = fileContent.split('\n');
  
  // Frontmatter 파싱
  let frontmatterEnd = -1;
  let inFrontmatter = false;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i] === '---') {
      if (!inFrontmatter) {
        inFrontmatter = true;
      } else {
        frontmatterEnd = i;
        break;
      }
    }
  }
  
  const frontmatterText = lines.slice(1, frontmatterEnd).join('\n');
  const frontmatter = yaml.parse(frontmatterText);
  const content = lines.slice(frontmatterEnd + 1).join('\n');
  
  return { frontmatter, content };
}

/**
 * Feature 파일 작성
 * @param {string} filePath - 파일 경로
 * @param {Object} frontmatter - Frontmatter 데이터
 * @param {string} content - 파일 내용
 */
async function writeFeatureFile(filePath, frontmatter, content) {
  const frontmatterText = yaml.stringify(frontmatter);
  const fileContent = `---\n${frontmatterText}---\n${content}`;
  
  // 백업 생성
  try {
    const backupPath = `${filePath}.backup`;
    await fs.copyFile(filePath, backupPath);
  } catch (error) {
    // 백업 실패는 무시
  }
  
  await fs.writeFile(filePath, fileContent, 'utf8');
}

/**
 * Git 커밋 정보를 Feature 파일에 추가
 * @param {string} featureId - Feature ID
 * @param {Array<Object>} commits - 커밋 정보 배열
 * @returns {Promise<boolean>} - 성공 여부
 */
async function updateFeatureWithCommits(featureId, commits) {
  try {
    const featureFile = await findFeatureFile(featureId);
    if (!featureFile) {
      console.error(`Feature file not found for ${featureId}`);
      return false;
    }
    
    const { frontmatter, content } = await readFeatureFile(featureFile.path);
    
    // Frontmatter 업데이트
    if (!frontmatter.git_commits) {
      frontmatter.git_commits = [];
    }
    
    // 커밋 객체로 저장 (사양에 맞게)
    const existingHashes = new Set(frontmatter.git_commits.map(c => 
      typeof c === 'string' ? c : c.hash
    ));
    
    commits.forEach(commit => {
      if (!existingHashes.has(commit.hash)) {
        // 사양에 정의된 구조로 커밋 정보 저장
        frontmatter.git_commits.push({
          hash: commit.hash,
          message: commit.message,
          author: commit.author,
          date: commit.date,
          files_changed: 0,  // 추후 git 명령어로 업데이트 가능
          insertions: 0,     // 추후 git 명령어로 업데이트 가능
          deletions: 0       // 추후 git 명령어로 업데이트 가능
        });
      }
    });
    
    // 마지막 업데이트 시간 갱신
    frontmatter.last_updated = new Date().toISOString().replace('T', ' ').substring(0, 16);
    
    // Git History 섹션 업데이트
    let updatedContent = content;
    const gitHistorySection = '## Git History';
    const gitHistoryIndex = content.indexOf(gitHistorySection);
    
    if (gitHistoryIndex === -1) {
      // Git History 섹션이 없으면 추가
      updatedContent += '\n\n## Git History\n### Commits\n';
    }
    
    // 커밋 정보 추가
    const commitLines = commits.map(commit => {
      const date = new Date(commit.date).toISOString().substring(0, 10);
      return `- \`${commit.hash.substring(0, 7)}\`: ${commit.message.split('\n')[0]} [${date}]`;
    });
    
    if (gitHistoryIndex !== -1) {
      // 기존 섹션에 추가
      const sections = updatedContent.split('##');
      const gitHistorySectionIndex = sections.findIndex(s => s.trim().startsWith('Git History'));
      
      if (gitHistorySectionIndex !== -1) {
        const commitsSectionIndex = sections[gitHistorySectionIndex].indexOf('### Commits');
        if (commitsSectionIndex !== -1) {
          sections[gitHistorySectionIndex] += '\n' + commitLines.join('\n');
        }
        updatedContent = sections.join('##');
      }
    } else {
      updatedContent += commitLines.join('\n');
    }
    
    await writeFeatureFile(featureFile.path, frontmatter, updatedContent);
    return true;
  } catch (error) {
    console.error(`Error updating feature ${featureId}:`, error);
    return false;
  }
}

/**
 * Feature와 Git 커밋 동기화
 * @param {string} featureId - Feature ID
 * @returns {Promise<{success: boolean, commitCount: number}>}
 */
async function syncFeatureWithGit(featureId) {
  try {
    const commits = await getCommitsByFeatureId(featureId);
    
    if (commits.length === 0) {
      return { success: true, commitCount: 0 };
    }
    
    const success = await updateFeatureWithCommits(featureId, commits);
    return { success, commitCount: commits.length };
  } catch (error) {
    console.error(`Error syncing feature ${featureId}:`, error);
    return { success: false, commitCount: 0 };
  }
}

/**
 * 모든 활성 Feature를 Git과 동기화
 * @returns {Promise<{total: number, synced: number, failed: number}>}
 */
async function syncAllActiveFeatures() {
  const basePath = path.join(process.cwd(), '.aiwf', '06_FEATURE_LEDGERS', 'active');
  const results = { total: 0, synced: 0, failed: 0 };
  
  try {
    const files = await fs.readdir(basePath);
    const featureFiles = files.filter(f => f.endsWith('.md'));
    results.total = featureFiles.length;
    
    for (const file of featureFiles) {
      const featureId = file.split('_')[0];
      const { success } = await syncFeatureWithGit(featureId);
      
      if (success) {
        results.synced++;
      } else {
        results.failed++;
      }
    }
  } catch (error) {
    console.error('Error syncing all features:', error);
  }
  
  return results;
}

/**
 * Feature 진행률 업데이트
 * @param {string} featureId - Feature ID
 * @param {number} percentage - 진행률 (0-100)
 * @returns {Promise<boolean>} - 성공 여부
 */
async function updateFeatureProgress(featureId, percentage) {
  try {
    const featureFile = await findFeatureFile(featureId);
    if (!featureFile) {
      return false;
    }
    
    const { frontmatter, content } = await readFeatureFile(featureFile.path);
    
    frontmatter.progress_percentage = Math.min(100, Math.max(0, percentage));
    frontmatter.last_updated = new Date().toISOString().replace('T', ' ').substring(0, 16);
    
    await writeFeatureFile(featureFile.path, frontmatter, content);
    return true;
  } catch (error) {
    console.error(`Error updating progress for ${featureId}:`, error);
    return false;
  }
}

module.exports = {
  findFeatureFile,
  readFeatureFile,
  writeFeatureFile,
  updateFeatureWithCommits,
  syncFeatureWithGit,
  syncAllActiveFeatures,
  updateFeatureProgress
};