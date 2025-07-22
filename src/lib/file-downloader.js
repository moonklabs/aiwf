import https from 'https';
import { createWriteStream } from 'fs';
import fs from 'fs/promises';
import { pipeline } from 'stream/promises';
import path from 'path';
import {
  COMMAND_FILES,
  GLOBAL_RULES_FILES,
  MANUAL_RULES_FILES,
  TEMPLATE_FILES,
  PROMPT_FILES
} from '../config/file-lists.js';

const GITHUB_RAW_URL = 'https://raw.githubusercontent.com/moonklabs/aiwf/main';
const GITHUB_CONTENT_PREFIX = 'claude-code/aiwf';
const GITHUB_API_URL = 'https://api.github.com/repos/moonklabs/aiwf/contents';
const GITHUB_OWNER = 'moonklabs';
const GITHUB_REPO = 'aiwf';
const GITHUB_BRANCH = 'main';

/**
 * Fetch content from URL
 * @param {string} url - The URL to fetch from
 * @param {Object} headers - Optional headers
 * @returns {Promise<string>} The response content
 */
async function fetchContent(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const defaultHeaders = { 'User-Agent': 'aiwf' };
    const requestHeaders = { ...defaultHeaders, ...headers };
    
    https.get(url, { headers: requestHeaders }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(data);
        } else if (res.statusCode === 403 && res.headers['x-ratelimit-remaining'] === '0') {
          reject(new Error('GitHub API rate limit exceeded. Please try again later.'));
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

/**
 * Sleep for specified milliseconds
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetch directory contents from GitHub API with retry logic
 * @param {string} path - Repository path
 * @param {number} retries - Number of retries for rate limit
 * @returns {Promise<Array>} Array of file/directory objects
 */
async function fetchGitHubDirectory(path, retries = 3) {
  const apiUrl = `${GITHUB_API_URL}/${path}?ref=${GITHUB_BRANCH}`;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetchContent(apiUrl, {
        'Accept': 'application/vnd.github.v3+json'
      });
      return JSON.parse(response);
    } catch (error) {
      if (error.message.includes('rate limit exceeded') && attempt < retries) {
        console.warn(`GitHub API rate limit hit. Retrying in ${(attempt + 1) * 10} seconds...`);
        await sleep((attempt + 1) * 10000); // 10s, 20s, 30s
        continue;
      }
      
      // GitHub API가 실패하면 빈 배열 반환
      console.warn(`Failed to fetch directory listing for ${path}: ${error.message}`);
      
      // 404 에러의 경우 정상적으로 빈 배열 반환 (디렉토리가 없는 경우)
      if (error.message.includes('404')) {
        return [];
      }
      
      // Rate limit이나 다른 에러의 경우 재시도 후 실패
      if (attempt === retries) {
        throw error;
      }
    }
  }
  
  return [];
}

/**
 * Recursively download directory contents
 * @param {string} githubPath - GitHub repository path
 * @param {string} localPath - Local destination path
 * @param {Object} spinner - Ora spinner instance
 * @param {boolean} debugLog - Debug logging flag
 * @returns {Promise<void>}
 */
async function downloadDirectoryRecursive(githubPath, localPath, spinner, debugLog = false) {
  try {
    // GitHub API로 디렉토리 내용 가져오기
    const contents = await fetchGitHubDirectory(githubPath);
    
    if (contents.length === 0) {
      if (debugLog) console.log(`No contents found in ${githubPath}`);
      return;
    }
    
    // 로컬 디렉토리 생성
    await fs.mkdir(localPath, { recursive: true });
    
    for (const item of contents) {
      if (item.type === 'file') {
        // 파일 다운로드
        const destPath = path.join(localPath, item.name);
        const downloadUrl = item.download_url;
        
        try {
          await downloadFile(downloadUrl, destPath);
          if (spinner) {
            spinner.text = `Downloaded: ${item.name}`;
          }
          if (debugLog) console.log(`Downloaded: ${githubPath}/${item.name}`);
        } catch (error) {
          if (debugLog) console.error(`Failed to download ${item.name}: ${error.message}`);
        }
      } else if (item.type === 'dir') {
        // 하위 디렉토리 재귀적으로 처리
        const subGithubPath = `${githubPath}/${item.name}`;
        const subLocalPath = path.join(localPath, item.name);
        
        if (spinner) {
          spinner.text = `Processing directory: ${item.name}`;
        }
        
        await downloadDirectoryRecursive(subGithubPath, subLocalPath, spinner, debugLog);
      }
    }
  } catch (error) {
    if (debugLog) console.error(`Error processing directory ${githubPath}: ${error.message}`);
    throw error;
  }
}

/**
 * Download a file from URL to destination path with retry logic
 * @param {string} url - The URL to download from
 * @param {string} destPath - The destination file path
 * @param {number} retries - Number of retries
 * @returns {Promise<void>}
 */
async function downloadFile(url, destPath, retries = 3) {
  // Ensure destination directory exists
  const destDir = path.dirname(destPath);
  await fs.mkdir(destDir, { recursive: true });
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      await new Promise((resolve, reject) => {
        https.get(url, { headers: { 'User-Agent': 'aiwf' } }, (response) => {
          if (response.statusCode === 403 && response.headers['x-ratelimit-remaining'] === '0') {
            response.destroy();
            reject(new Error('GitHub API rate limit exceeded'));
            return;
          }
          
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
            .catch((error) => {
              reject(error);
            });
        }).on('error', (err) => {
          reject(err);
        });
      });
      
      // 성공하면 반환
      return;
    } catch (error) {
      if (error.message.includes('rate limit exceeded') && attempt < retries) {
        console.warn(`Rate limit hit while downloading ${path.basename(destPath)}. Retrying in ${(attempt + 1) * 10} seconds...`);
        await sleep((attempt + 1) * 10000);
        continue;
      }
      
      // 마지막 시도에서도 실패하면 에러 throw
      if (attempt === retries) {
        throw error;
      }
    }
  }
}

/**
 * Download files from a predefined list
 * @param {string} githubPath - GitHub repository path
 * @param {string} localPath - Local destination path
 * @param {Array<string>} fileList - List of files to download
 * @param {Object} spinner - Ora spinner instance
 * @param {Object} messages - Localized messages
 * @returns {Promise<void>}
 */
async function downloadFileList(githubPath, localPath, fileList, spinner, messages) {
  for (const fileName of fileList) {
    try {
      const destPath = path.join(localPath, fileName);
      const downloadUrl = `${GITHUB_RAW_URL}/${githubPath}/${fileName}`;
      
      await downloadFile(downloadUrl, destPath);
      if (spinner) {
        spinner.text = `${messages.downloading}: ${fileName}`;
      }
    } catch (error) {
      // Skip files that don't exist, but log the error
      if (spinner) {
        spinner.text = `${messages.skipping || 'Skipping'}: ${fileName}`;
      }
    }
  }
}

/**
 * Download directory contents using predefined file lists or dynamic fetching
 * @param {string} githubPath - GitHub repository path
 * @param {string} localPath - Local destination path
 * @param {Object} spinner - Ora spinner instance
 * @param {Object} messages - Localized messages
 * @param {string} [selectedLanguage='en'] - Selected language
 * @param {boolean} [useDynamicFetch=false] - Use GitHub API for dynamic fetching
 * @returns {Promise<void>}
 */
async function downloadDirectory(githubPath, localPath, spinner, messages, selectedLanguage = 'en', useDynamicFetch = false) {
  try {
    // .aiwf 디렉토리나 알 수 없는 디렉토리의 경우 동적 다운로드 사용
    if (useDynamicFetch || githubPath.includes('.aiwf') || 
        (!githubPath.includes('.claude/commands/aiwf') && 
         !githubPath.includes('rules/global') && 
         !githubPath.includes('rules/manual'))) {
      
      if (spinner) {
        spinner.text = `Fetching directory structure: ${githubPath}`;
      }
      
      // GitHub API를 사용한 동적 디렉토리 다운로드
      await downloadDirectoryRecursive(githubPath, localPath, spinner, messages && messages.debugLog);
      return;
    }
    
    // 기존 로직: 사전 정의된 파일 리스트 사용
    let fileList = [];
    
    if (githubPath.includes('.claude/commands/aiwf')) {
      fileList = COMMAND_FILES;
    } else if (githubPath.includes('rules/global')) {
      fileList = GLOBAL_RULES_FILES;
    } else if (githubPath.includes('rules/manual')) {
      fileList = MANUAL_RULES_FILES;
    }
    
    if (fileList.length > 0) {
      await downloadFileList(githubPath, localPath, fileList, spinner, messages);
    }
  } catch (error) {
    throw new Error(`Failed to download directory ${githubPath}: ${error.message}`);
  }
}

export {
  fetchContent,
  downloadFile,
  downloadFileList,
  downloadDirectory,
  downloadDirectoryRecursive,
  fetchGitHubDirectory,
  GITHUB_RAW_URL,
  GITHUB_CONTENT_PREFIX,
  GITHUB_API_URL,
  GITHUB_OWNER,
  GITHUB_REPO,
  GITHUB_BRANCH,
  COMMAND_FILES,
  GLOBAL_RULES_FILES,
  MANUAL_RULES_FILES,
  TEMPLATE_FILES,
  PROMPT_FILES
};
