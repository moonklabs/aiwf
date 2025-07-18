import https from 'https';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import path from 'path';

const GITHUB_RAW_URL = 'https://raw.githubusercontent.com/moonklabs/aiwf/main';
const GITHUB_CONTENT_PREFIX = 'claude-code/aiwf';

// Pre-defined list of command files
const COMMAND_FILES = [
  'aiwf_changelog.md',
  'aiwf_code_review.md',
  'aiwf_commit.md',
  'aiwf_compress_aggressive_persona.md',
  'aiwf_compress_context.md',
  'aiwf_compress_minimal_persona.md',
  'aiwf_compress_stats.md',
  'aiwf_compress_with_persona.md',
  'aiwf_create_feature_ledger.md',
  'aiwf_create_general_task.md',
  'aiwf_create_milestone_plan.md',
  'aiwf_create_prd.md',
  'aiwf_create_sprint_tasks.md',
  'aiwf_create_sprints_from_milestone.md',
  'aiwf_default_mode.md',
  'aiwf_discuss_review.md',
  'aiwf_do_task.md',
  'aiwf_docs.md',
  'aiwf_evaluate.md',
  'aiwf_get_feature_details.md',
  'aiwf_infinite.md',
  'aiwf_initialize.md',
  'aiwf_issue_create.md',
  'aiwf_link_feature_to_milestone.md',
  'aiwf_list_features.md',
  'aiwf_mermaid.md',
  'aiwf_persona_architect.md',
  'aiwf_persona_backend.md',
  'aiwf_persona_data_analyst.md',
  'aiwf_persona_frontend.md',
  'aiwf_persona_security.md',
  'aiwf_persona_status.md',
  'aiwf_pr_create.md',
  'aiwf_prime.md',
  'aiwf_project_review.md',
  'aiwf_switch_language.md',
  'aiwf_test.md',
  'aiwf_testing_review.md',
  'aiwf_tm-run-all-subtask.md',
  'aiwf_ultrathink_code_advanced.md',
  'aiwf_ultrathink_code_basic.md',
  'aiwf_ultrathink_general.md',
  'aiwf_update_docs_kr.md',
  'aiwf_update_feature_status.md',
  'aiwf_yolo.md'
];

// Pre-defined list of global rules files
const GLOBAL_RULES_FILES = [
  'code-style-guide.md',
  'coding-principles.md',
  'development-process.md',
  'global-rules.md'
];

// Pre-defined list of manual rules files
const MANUAL_RULES_FILES = [
  'generate-plan-docs.md'
];

// Pre-defined list of template files (these might not exist in the repo)
const TEMPLATE_FILES = [
  // Add template files here when they are available
];

// Pre-defined list of prompt files (these might not exist in the repo)
const PROMPT_FILES = [
  // Add prompt files here when they are available
];

/**
 * Fetch content from URL
 * @param {string} url - The URL to fetch from
 * @returns {Promise<string>} The response content
 */
async function fetchContent(url) {
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

/**
 * Download a file from URL to destination path
 * @param {string} url - The URL to download from
 * @param {string} destPath - The destination file path
 * @returns {Promise<void>}
 */
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
        .catch((error) => {
          reject(error);
        });
    }).on('error', (err) => {
      reject(err);
    });
  });
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
 * Download directory contents using predefined file lists
 * @param {string} githubPath - GitHub repository path
 * @param {string} localPath - Local destination path
 * @param {Object} spinner - Ora spinner instance
 * @param {Object} messages - Localized messages
 * @param {string} [selectedLanguage='en'] - Selected language
 * @returns {Promise<void>}
 */
async function downloadDirectory(githubPath, localPath, spinner, messages, selectedLanguage = 'en') {
  try {
    // Determine which file list to use based on the path
    let fileList = [];
    
    if (githubPath.includes('.claude/commands/aiwf')) {
      fileList = COMMAND_FILES;
    } else if (githubPath.includes('rules/global')) {
      fileList = GLOBAL_RULES_FILES;
    } else if (githubPath.includes('rules/manual')) {
      fileList = MANUAL_RULES_FILES;
    } else if (githubPath.includes('98_PROMPTS')) {
      fileList = PROMPT_FILES;
    } else if (githubPath.includes('99_TEMPLATES')) {
      fileList = TEMPLATE_FILES;
    } else {
      // For unknown directories, try to download common files
      fileList = ['README.md', 'index.md'];
    }
    
    await downloadFileList(githubPath, localPath, fileList, spinner, messages);
  } catch (error) {
    throw new Error(`Failed to download directory ${githubPath}: ${error.message}`);
  }
}

export {
  fetchContent,
  downloadFile,
  downloadFileList,
  downloadDirectory,
  GITHUB_RAW_URL,
  GITHUB_CONTENT_PREFIX,
  COMMAND_FILES,
  GLOBAL_RULES_FILES,
  MANUAL_RULES_FILES,
  TEMPLATE_FILES,
  PROMPT_FILES
};
