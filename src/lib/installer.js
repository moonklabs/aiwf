import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import ora from 'ora';
import chalk from 'chalk';
import prompts from 'prompts';
import {
  fetchContent,
  downloadFile,
  downloadDirectory,
  GITHUB_RAW_URL,
  GITHUB_CONTENT_PREFIX
} from './file-downloader.js';
import {
  backupCommandsAndDocs,
  restoreFromBackup,
  getCurrentBackupDir,
  setBackupDir
} from './backup-manager.js';
import { getMessages } from '../utils/messages.js';
import {
  validateInstallation,
  displaySpecCompliantValidationResults
} from './validator.js';
import { rollbackTool } from './rollback-manager.js';
import {
  detectLanguage,
  loadUserLanguageConfig,
  saveUserLanguageConfig,
  getInstallationLanguagePath,
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE
} from '../utils/language-utils.js';
import {
  FILES,
  TOOL_DIRS,
  AIWF_DIRS,
  BASE_DIRS,
  getAllAiwfDirectories,
  getAllClaudeMdFiles
} from '../utils/paths.js';

/**
 * Check if AIWF is already installed
 * @returns {Promise<boolean>} Installation status
 */
async function checkExistingInstallation() {
  const flagExists = await fs
    .access(FILES.INSTALLED_FLAG)
    .then(() => true)
    .catch(() => false);
  return flagExists;
}

/**
 * Check if existing project files exist
 * @returns {Promise<{hasProject: boolean, projectFiles: string[]}>} Project status
 */
async function checkExistingProject() {
  const projectFiles = [];
  let hasProject = false;

  // Check for key project files
  const keyFiles = [
    FILES.PROJECT_MANIFEST,
    path.join(AIWF_DIRS.PROJECT_DOCS, 'README.md'),
    path.join(AIWF_DIRS.REQUIREMENTS, 'requirements.md'),
    path.join(AIWF_DIRS.SPRINTS, 'sprint-01.md'),
    path.join(AIWF_DIRS.GENERAL_TASKS, 'tasks.md'),
    path.join(AIWF_DIRS.ARCHITECTURAL_DECISIONS, 'decisions.md'),
    path.join(AIWF_DIRS.STATE_OF_PROJECT, 'current-state.md')
  ];

  for (const file of keyFiles) {
    try {
      await fs.access(file);
      projectFiles.push(file);
      hasProject = true;
    } catch (error) {
      // File doesn't exist, continue
    }
  }

  // Check for any .md files in project directories
  const projectDirs = [
    AIWF_DIRS.PROJECT_DOCS,
    AIWF_DIRS.REQUIREMENTS,
    AIWF_DIRS.SPRINTS,
    AIWF_DIRS.GENERAL_TASKS,
    AIWF_DIRS.ARCHITECTURAL_DECISIONS,
    AIWF_DIRS.STATE_OF_PROJECT
  ];

  for (const dir of projectDirs) {
    try {
      const files = await fs.readdir(dir);
      const mdFiles = files.filter(file => file.endsWith('.md'));
      if (mdFiles.length > 0) {
        hasProject = true;
        projectFiles.push(...mdFiles.map(file => path.join(dir, file)));
      }
    } catch (error) {
      // Directory doesn't exist, continue
    }
  }

  return { hasProject, projectFiles };
}

/**
 * Log with spinner for debug mode
 * @param {Object} spinner - Ora spinner instance
 * @param {string} message - Message to log
 * @param {boolean} debugLog - Debug mode flag
 */
function logWithSpinner(spinner, message, debugLog) {
  if (debugLog) console.log(chalk.gray(message));
  if (spinner) spinner.text = message;
}

/**
 * Select language for installation
 * @param {Object} options - Installation options
 * @returns {Promise<string>} Selected language
 */
async function selectLanguage(options) {
  let selectedLanguage = DEFAULT_LANGUAGE;

  if (!options.force) {
    // 1. Check existing configuration
    const existingConfig = await loadUserLanguageConfig();

    if (existingConfig && existingConfig.language) {
      selectedLanguage = existingConfig.language;
      console.log(
        chalk.blue(
          `🌐 기존 언어 설정을 사용합니다 / Using existing language setting: ${selectedLanguage}`
        )
      );
    } else {
      // 2. Try auto-detection
      const detectedLang = await detectLanguage();

      console.log(
        chalk.gray(`🔍 시스템 언어 감지 / System language detected: ${detectedLang}`)
      );

      // 3. Prompt user for language selection
      const languageResponse = await prompts({
        type: 'select',
        name: 'language',
        message: 'Please select language / 언어를 선택해주세요:',
        choices: [
          { title: 'English', value: 'en' },
          { title: '한국어 (Korean)', value: 'ko' }
        ],
        initial:
          SUPPORTED_LANGUAGES.indexOf(detectedLang) !== -1
            ? SUPPORTED_LANGUAGES.indexOf(detectedLang)
            : 0
      });

      if (languageResponse.language) {
        selectedLanguage = languageResponse.language;
      } else {
        selectedLanguage = detectedLang;
      }

      // 4. Save selected language
      try {
        await saveUserLanguageConfig(selectedLanguage, {
          autoDetect: true,
          fallback: DEFAULT_LANGUAGE
        });
        console.log(
          chalk.green(
            `✅ 언어 설정이 저장되었습니다 / Language preference saved: ${selectedLanguage}`
          )
        );
      } catch (error) {
        console.warn(
          chalk.yellow(
            `⚠️ 언어 설정 저장 실패 / Failed to save language preference: ${error.message}`
          )
        );
      }
    }
  } else {
    // Force mode: try auto-detection
    try {
      selectedLanguage = await detectLanguage();
    } catch (error) {
      selectedLanguage = DEFAULT_LANGUAGE;
    }
  }

  return selectedLanguage;
}

/**
 * Handle existing installation
 * @param {Object} msg - Localized messages
 * @param {Object} options - Installation options
 * @returns {Promise<{continue: boolean, installType: string, preserveProject: boolean}>} Installation decision
 */
async function handleExistingInstallation(msg, options) {

  if (options.force) {
    return { continue: true, installType: 'reinstall', preserveProject: false };
  }

  // First, ask about installation type
  const installResponse = await prompts({
    type: 'select',
    name: 'action',
    message: msg.existingDetected,
    choices: [
      { title: msg.updateOption, value: 'update' },
      { title: msg.reinstallOption, value: 'reinstall' },
      { title: msg.skipOption, value: 'skip' },
      { title: msg.cancelOption, value: 'cancel' }
    ]
  });



  if (installResponse.action === 'skip' || installResponse.action === 'cancel') {
    console.log(chalk.yellow(msg.installCancelled));
    process.exit(0);
  }

  let preserveProject = true; // Default to preserve
  
  // If reinstalling, don't preserve project (complete fresh install)
  if (installResponse.action === 'reinstall') {
    preserveProject = false;
  }

  // Backup if updating
  if (installResponse.action === 'update') {
    await backupCommandsAndDocs(msg);
  }

  return {
    continue: true,
    installType: installResponse.action,
    preserveProject
  };
}

/**
 * Backup project files
 * @param {string[]} projectFiles - List of project files to backup
 * @param {Object} msg - Localized messages
 * @returns {Promise<string>} Backup directory path
 */
async function backupProjectFiles(projectFiles, msg) {
  if (projectFiles.length === 0) {
    return null;
  }

  const backupDir = path.join(os.tmpdir(), `aiwf-project-backup-${Date.now()}`);
  await fs.mkdir(backupDir, { recursive: true });

  console.log(chalk.cyan('💾 Backing up project files...'));
  
  for (const file of projectFiles) {
    try {
      const relativePath = path.relative(process.cwd(), file);
      const backupPath = path.join(backupDir, relativePath);
      const backupDirPath = path.dirname(backupPath);
      
      await fs.mkdir(backupDirPath, { recursive: true });
      await fs.copyFile(file, backupPath);
    } catch (error) {
      console.log(chalk.yellow(`Warning: Could not backup ${file}: ${error.message}`));
    }
  }

  console.log(chalk.green(`✅ Project files backed up to: ${backupDir}`));
  return backupDir;
}

/**
 * Restore project files from backup
 * @param {string} backupDir - Backup directory path
 * @param {Object} msg - Localized messages
 */
async function restoreProjectFiles(backupDir, msg) {
  if (!backupDir) {
    return;
  }

  console.log(chalk.cyan('🔄 Restoring project files...'));
  
  try {
    const backupFiles = await fs.readdir(backupDir, { recursive: true });
    
    for (const file of backupFiles) {
      const backupFilePath = path.join(backupDir, file);
      const stat = await fs.stat(backupFilePath);
      
      if (stat.isFile()) {
        const targetPath = path.join(process.cwd(), file);
        const targetDir = path.dirname(targetPath);
        
        await fs.mkdir(targetDir, { recursive: true });
        await fs.copyFile(backupFilePath, targetPath);
      }
    }
    
    console.log(chalk.green(msg.projectPreserved));
    
    // Clean up backup directory
    await fs.rm(backupDir, { recursive: true, force: true });
  } catch (error) {
    console.log(chalk.yellow(`Warning: Could not restore some project files: ${error.message}`));
    console.log(chalk.yellow(`Backup preserved at: ${backupDir}`));
  }
}

/**
 * Remove project files
 * @param {string[]} projectFiles - List of project files to remove
 * @param {Object} msg - Localized messages
 */
async function removeProjectFiles(projectFiles, msg) {
  if (projectFiles.length === 0) {
    return;
  }

  console.log(chalk.cyan('🗑️  Removing existing project files...'));
  
  for (const file of projectFiles) {
    try {
      await fs.unlink(file);
    } catch (error) {
      // File might already be deleted, continue
    }
  }
  
  console.log(chalk.green(msg.projectOverwritten));
}

/**
 * Create AIWF directory structure
 */
async function createDirectoryStructure() {
  const aiwfDirs = getAllAiwfDirectories();

  // Create AIWF directories
  for (const dir of aiwfDirs) {
    await fs.mkdir(dir, { recursive: true });
  }

  // Create tool-specific directories
  await fs.mkdir(TOOL_DIRS.CURSOR_RULES, { recursive: true });
  await fs.mkdir(TOOL_DIRS.WINDSURF_RULES, { recursive: true });
  await fs.mkdir(TOOL_DIRS.CLAUDE_AGENTS, { recursive: true });
}

/**
 * Download manifest file
 * @param {string} languagePath - Language path
 * @param {Object} spinner - Ora spinner instance
 * @param {Object} msg - Localized messages
 * @param {boolean} debugLog - Debug mode flag
 */
async function downloadManifest(languagePath, spinner, msg, debugLog) {
  logWithSpinner(spinner, msg.downloading, debugLog);
  try {
    const manifestUrl = `${GITHUB_RAW_URL}/${GITHUB_CONTENT_PREFIX}/${languagePath}/.aiwf/00_PROJECT_MANIFEST.md`;
    await downloadFile(manifestUrl, FILES.PROJECT_MANIFEST);
  } catch (error) {
    // If manifest doesn't exist, that's okay
  }
}

/**
 * Download templates
 * @param {string} languagePath - Language path
 * @param {Object} spinner - Ora spinner instance
 * @param {Object} msg - Localized messages
 * @param {boolean} debugLog - Debug mode flag
 */
async function downloadTemplates(languagePath, spinner, msg, debugLog) {
  try {
    logWithSpinner(spinner, msg.downloadingTemplates, debugLog);
    
    // .aiwf 전체 디렉토리를 동적으로 다운로드
    logWithSpinner(spinner, `Downloading .aiwf directory structure...`, debugLog);
    await downloadDirectory(
      `${GITHUB_CONTENT_PREFIX}/${languagePath}/.aiwf`,
      AIWF_DIRS.ROOT,
      spinner,
      msg,
      languagePath,
      true // useDynamicFetch = true
    );
    
    logWithSpinner(spinner, `Successfully downloaded .aiwf directory`, debugLog);
  } catch (error) {
    logWithSpinner(spinner, `Error downloading .aiwf: ${error.message}`, debugLog);
    
    // Fallback: 개별 디렉토리 다운로드 시도
    try {
      logWithSpinner(spinner, `Trying individual directory downloads...`, debugLog);
      
      await downloadDirectory(
        `${GITHUB_CONTENT_PREFIX}/${languagePath}/.aiwf/98_PROMPTS`,
        AIWF_DIRS.PROMPTS,
        spinner,
        msg,
        languagePath,
        true
      );
      
      await downloadDirectory(
        `${GITHUB_CONTENT_PREFIX}/${languagePath}/.aiwf/99_TEMPLATES`,
        AIWF_DIRS.TEMPLATES,
        spinner,
        msg,
        languagePath,
        true
      );
    } catch (fallbackError) {
      logWithSpinner(spinner, msg.templatesNotFound, debugLog);
    }
  }
}

/**
 * Update CLAUDE.md documentation files
 * @param {string} languagePath - Language path
 * @param {Object} spinner - Ora spinner instance
 * @param {Object} msg - Localized messages
 * @param {boolean} debugLog - Debug mode flag
 */
async function updateDocumentation(languagePath, spinner, msg, debugLog) {
  logWithSpinner(spinner, msg.updatingDocs, debugLog);
  const claudeFiles = getAllClaudeMdFiles();

  for (const claudeFile of claudeFiles) {
    try {
      const relativePath = claudeFile.replace(process.cwd() + '/', '');
      const claudeUrl = `${GITHUB_RAW_URL}/${GITHUB_CONTENT_PREFIX}/${languagePath}/${relativePath}`;
      await downloadFile(claudeUrl, claudeFile);
    } catch (error) {
      // If CLAUDE.md doesn't exist, that's okay
    }
  }
}

/**
 * Update Claude commands and agents
 * @param {string} languagePath - Language path
 * @param {Object} spinner - Ora spinner instance
 * @param {Object} msg - Localized messages
 * @param {boolean} debugLog - Debug mode flag
 */
async function updateCommands(languagePath, spinner, msg, debugLog) {
  // Delete existing commands folder if it exists
  if (await fs.access(TOOL_DIRS.CLAUDE_COMMANDS).then(() => true).catch(() => false)) {
    logWithSpinner(spinner, msg.deletingOldCommands, debugLog);
    await fs.rm(TOOL_DIRS.CLAUDE_COMMANDS, { recursive: true, force: true });
  }

  // Delete existing agents folder if it exists
  if (await fs.access(TOOL_DIRS.CLAUDE_AGENTS).then(() => true).catch(() => false)) {
    logWithSpinner(spinner, 'Deleting old agents...', debugLog);
    await fs.rm(TOOL_DIRS.CLAUDE_AGENTS, { recursive: true, force: true });
  }

  await fs.mkdir(TOOL_DIRS.CLAUDE_COMMANDS, { recursive: true });
  await fs.mkdir(TOOL_DIRS.CLAUDE_AGENTS, { recursive: true });

  // Download commands
  logWithSpinner(spinner, msg.downloadingCommands, debugLog);
  try {
    await downloadDirectory(
      `${GITHUB_CONTENT_PREFIX}/${languagePath}/${TOOL_DIRS.CLAUDE_COMMANDS}`,
      TOOL_DIRS.CLAUDE_COMMANDS,
      spinner,
      msg,
      languagePath,
      true // commands도 동적 디렉터리 탐색 사용 (파일 리스트 의존 제거)
    );
  } catch (error) {
    logWithSpinner(spinner, msg.commandsNotFound, debugLog);
  }

  // Download agents
  logWithSpinner(spinner, 'Downloading agents...', debugLog);
  try {
    await downloadDirectory(
      `${GITHUB_CONTENT_PREFIX}/${languagePath}/${TOOL_DIRS.CLAUDE_AGENTS}`,
      TOOL_DIRS.CLAUDE_AGENTS,
      spinner,
      msg,
      languagePath,
      true // agents도 동적 디렉터리 탐색 사용 (파일 리스트 의존 제거)
    );
    logWithSpinner(spinner, 'Successfully downloaded agents', debugLog);
  } catch (error) {
    logWithSpinner(spinner, 'Agents not found or failed to download', debugLog);
  }
}

/**
 * Check if tool directories exist and handle them
 * @param {Object} spinner - Ora spinner instance
 * @param {Object} msg - Localized messages
 * @param {boolean} debugLog - Debug mode flag
 * @returns {Promise<Object>} Directory status info
 */
async function checkAndHandleExistingToolDirs(spinner, msg, debugLog) {
  const toolDirStatus = {
    cursor: {
      exists: false,
      hadFiles: false,
      backedUp: false
    },
    windsurf: {
      exists: false,
      hadFiles: false,
      backedUp: false
    }
  };

  // Check Cursor directory
  try {
    await fs.access(TOOL_DIRS.CURSOR_RULES);
    toolDirStatus.cursor.exists = true;
    
    const cursorFiles = await fs.readdir(TOOL_DIRS.CURSOR_RULES);
    const mdcFiles = cursorFiles.filter(file => file.endsWith('.mdc'));
    
    if (mdcFiles.length > 0) {
      toolDirStatus.cursor.hadFiles = true;
      logWithSpinner(spinner, `${msg.foundExistingCursor} (${mdcFiles.length} files)`, debugLog);
      
      // Backup existing files
      logWithSpinner(spinner, msg.backingUpToolFiles, debugLog);
      const backupDir = path.join(TOOL_DIRS.CURSOR_RULES, `backup_${Date.now()}`);
      await fs.mkdir(backupDir, { recursive: true });
      
      for (const file of mdcFiles) {
        const srcPath = path.join(TOOL_DIRS.CURSOR_RULES, file);
        const backupPath = path.join(backupDir, file);
        await fs.copyFile(srcPath, backupPath);
      }
      
      toolDirStatus.cursor.backedUp = true;
      logWithSpinner(spinner, `${msg.toolBackupCreated}: ${backupDir}`, debugLog);
      
      // Remove existing files
      for (const file of mdcFiles) {
        await fs.unlink(path.join(TOOL_DIRS.CURSOR_RULES, file));
      }
    }
  } catch (error) {
    // Directory doesn't exist, that's fine
    logWithSpinner(spinner, `Cursor rules directory not found, will create new`, debugLog);
  }

  // Check Windsurf directory
  try {
    await fs.access(TOOL_DIRS.WINDSURF_RULES);
    toolDirStatus.windsurf.exists = true;
    
    const windsurfFiles = await fs.readdir(TOOL_DIRS.WINDSURF_RULES);
    const mdFiles = windsurfFiles.filter(file => file.endsWith('.md'));
    
    if (mdFiles.length > 0) {
      toolDirStatus.windsurf.hadFiles = true;
      logWithSpinner(spinner, `${msg.foundExistingWindsurf} (${mdFiles.length} files)`, debugLog);
      
      // Backup existing files
      logWithSpinner(spinner, msg.backingUpToolFiles, debugLog);
      const backupDir = path.join(TOOL_DIRS.WINDSURF_RULES, `backup_${Date.now()}`);
      await fs.mkdir(backupDir, { recursive: true });
      
      for (const file of mdFiles) {
        const srcPath = path.join(TOOL_DIRS.WINDSURF_RULES, file);
        const backupPath = path.join(backupDir, file);
        await fs.copyFile(srcPath, backupPath);
      }
      
      toolDirStatus.windsurf.backedUp = true;
      logWithSpinner(spinner, `${msg.toolBackupCreated}: ${backupDir}`, debugLog);
      
      // Remove existing files
      for (const file of mdFiles) {
        await fs.unlink(path.join(TOOL_DIRS.WINDSURF_RULES, file));
      }
    }
  } catch (error) {
    // Directory doesn't exist, that's fine
    logWithSpinner(spinner, `Windsurf rules directory not found, will create new`, debugLog);
  }

  return toolDirStatus;
}

/**
 * Download and process rules
 * @param {Object} spinner - Ora spinner instance
 * @param {Object} msg - Localized messages
 * @param {boolean} debugLog - Debug mode flag
 */
async function downloadAndProcessRules(spinner, msg, debugLog) {
  // Check and handle existing tool directories first
  logWithSpinner(spinner, msg.checkingExistingTools, debugLog);
  const toolDirStatus = await checkAndHandleExistingToolDirs(spinner, msg, debugLog);
  // Try to download from GitHub first, fallback to local files
  const tmpRulesGlobal = path.join(os.tmpdir(), 'aiwf-rules-global');
  const tmpRulesManual = path.join(os.tmpdir(), 'aiwf-rules-manual');
  
  let useLocalGlobal = false;
  let useLocalManual = false;
  
  // Try to download rules/global from GitHub
  try {
    await downloadDirectory(
      `rules/global`,
      tmpRulesGlobal,
      spinner,
      debugLog
    );
    logWithSpinner(spinner, `Downloaded rules/global from GitHub`, debugLog);
  } catch (error) {
    logWithSpinner(spinner, `Failed to download rules/global from GitHub, trying local files`, debugLog);
    // Fallback to local files
    const localRulesGlobal = path.join(process.cwd(), 'rules/global');
    try {
      logWithSpinner(spinner, `Trying to access: ${localRulesGlobal}`, debugLog);
      await fs.access(localRulesGlobal);
      logWithSpinner(spinner, `Successfully accessed local rules/global`, debugLog);
      // Copy local files to temp directory
      await fs.mkdir(tmpRulesGlobal, { recursive: true });
      const files = await fs.readdir(localRulesGlobal);
      logWithSpinner(spinner, `Found ${files.length} files in rules/global: ${files.join(', ')}`, debugLog);
      for (const file of files) {
        const srcPath = path.join(localRulesGlobal, file);
        const destPath = path.join(tmpRulesGlobal, file);
        await fs.copyFile(srcPath, destPath);
        logWithSpinner(spinner, `Copied: ${file}`, debugLog);
      }
      useLocalGlobal = true;
      logWithSpinner(spinner, `Using local rules/global directory`, debugLog);
    } catch (localError) {
      logWithSpinner(spinner, `Local rules/global error: ${localError.message}`, debugLog);
      logWithSpinner(spinner, msg.rulesGlobalNotFound, debugLog);
    }
  }

  // Try to download rules/manual from GitHub
  try {
    await downloadDirectory(
      `rules/manual`,
      tmpRulesManual,
      spinner,
      debugLog
    );
    logWithSpinner(spinner, `Downloaded rules/manual from GitHub`, debugLog);
  } catch (error) {
    logWithSpinner(spinner, `Failed to download rules/manual from GitHub, trying local files`, debugLog);
    // Fallback to local files
    const localRulesManual = path.join(process.cwd(), 'rules/manual');
    try {
      await fs.access(localRulesManual);
      // Copy local files to temp directory
      await fs.mkdir(tmpRulesManual, { recursive: true });
      const files = await fs.readdir(localRulesManual);
      for (const file of files) {
        const srcPath = path.join(localRulesManual, file);
        const destPath = path.join(tmpRulesManual, file);
        await fs.copyFile(srcPath, destPath);
      }
      useLocalManual = true;
      logWithSpinner(spinner, `Using local rules/manual directory`, debugLog);
    } catch (localError) {
      logWithSpinner(spinner, msg.rulesManualNotFound, debugLog);
    }
  }

  // Process rules/global
  try {
    await fs.access(tmpRulesGlobal);
    await fs.mkdir(TOOL_DIRS.CURSOR_RULES, { recursive: true });
    await fs.mkdir(TOOL_DIRS.WINDSURF_RULES, { recursive: true });
    const files = await fs.readdir(tmpRulesGlobal);
    for (const file of files) {
      const srcPath = path.join(tmpRulesGlobal, file);
      const stat = await fs.stat(srcPath);
      if (!stat.isFile()) continue;

      // .cursor/rules: add .mdc extension and header
      const base = path.parse(file).name;
      const cursorTarget = path.join(TOOL_DIRS.CURSOR_RULES, base + '.mdc');
      const content = await fs.readFile(srcPath, 'utf8');
      const header = '---\ndescription: \nglobs: \nalwaysApply: true\n---\n';
      await fs.writeFile(cursorTarget, header + content, 'utf8');
      logWithSpinner(
        spinner,
        `[rules/global] ${file} -> ${TOOL_DIRS.CURSOR_RULES}/${base}.mdc`,
        debugLog
      );

      // .windsurf/rules: keep extension, no header
      const windsurfTarget = path.join(TOOL_DIRS.WINDSURF_RULES, file);
      const windsurfContent = await fs.readFile(srcPath, 'utf8');
      const windsurfHeader = '---\ntrigger: always_on\n---\n';
      await fs.writeFile(windsurfTarget, windsurfHeader + windsurfContent, 'utf8');
      logWithSpinner(
        spinner,
        `[rules/global] ${file} -> ${TOOL_DIRS.WINDSURF_RULES}/${file}`,
        debugLog
      );
    }
    // Clean up temp folder (only if not using local files)
    if (!useLocalGlobal) {
      await fs.rm(tmpRulesGlobal, { recursive: true, force: true });
    }
  } catch (error) {
    logWithSpinner(spinner, `No rules/global directory found`, debugLog);
  }

  // Process rules/manual
  try {
    await fs.access(tmpRulesManual);
    await fs.mkdir(TOOL_DIRS.CURSOR_RULES, { recursive: true });
    await fs.mkdir(TOOL_DIRS.WINDSURF_RULES, { recursive: true });
    const files = await fs.readdir(tmpRulesManual);
    for (const file of files) {
      const srcPath = path.join(tmpRulesManual, file);
      const stat = await fs.stat(srcPath);
      if (!stat.isFile()) continue;

      // .cursor/rules: add .mdc extension and header (alwaysApply: false)
      const base = path.parse(file).name;
      const cursorTarget = path.join(TOOL_DIRS.CURSOR_RULES, base + '.mdc');
      const content = await fs.readFile(srcPath, 'utf8');
      const header = '---\ndescription: \nglobs: \nalwaysApply: false\n---\n';
      await fs.writeFile(cursorTarget, header + content, 'utf8');
      logWithSpinner(
        spinner,
        `[rules/manual] ${file} -> ${TOOL_DIRS.CURSOR_RULES}/${base}.mdc`,
        debugLog
      );

      // .windsurf/rules: keep extension, no header
      const windsurfTarget = path.join(TOOL_DIRS.WINDSURF_RULES, file);
      const windsurfContent = await fs.readFile(srcPath, 'utf8');
      const windsurfHeader = '---\ntrigger: manual\n---\n';
      await fs.writeFile(windsurfTarget, windsurfHeader + windsurfContent, 'utf8');
      logWithSpinner(
        spinner,
        `[rules/manual] ${file} -> ${TOOL_DIRS.WINDSURF_RULES}/${file}`,
        debugLog
      );
    }
    // Clean up temp folder (only if not using local files)
    if (!useLocalManual) {
      await fs.rm(tmpRulesManual, { recursive: true, force: true });
    }
  } catch (error) {
    logWithSpinner(spinner, `No rules/manual directory found`, debugLog);
  }

  // Success message for tool rules installation
  logWithSpinner(spinner, msg.toolRulesInstalled, debugLog);

  // Display installation results for tool directories
  if (toolDirStatus.cursor.backedUp || toolDirStatus.windsurf.backedUp) {
    console.log(chalk.cyan(`\n📂 Tool Directory Installation Results:`));
    
    if (toolDirStatus.cursor.backedUp) {
      console.log(chalk.yellow(`   • Cursor: Existing rules backed up and replaced`));
    } else if (toolDirStatus.cursor.exists) {
      console.log(chalk.green(`   • Cursor: Rules installed (directory was empty)`));
    } else {
      console.log(chalk.green(`   • Cursor: Rules installed (new directory)`));
    }
    
    if (toolDirStatus.windsurf.backedUp) {
      console.log(chalk.yellow(`   • Windsurf: Existing rules backed up and replaced`));
    } else if (toolDirStatus.windsurf.exists) {
      console.log(chalk.green(`   • Windsurf: Rules installed (directory was empty)`));
    } else {
      console.log(chalk.green(`   • Windsurf: Rules installed (new directory)`));
    }
  }

  return toolDirStatus;
}

/**
 * Display installation summary
 * @param {boolean} hasExisting - Has existing installation
 * @param {Object} msg - Localized messages
 */
function displaySummary(hasExisting, msg) {
  if (hasExisting) {
    console.log(chalk.blue(`\n${msg.updateHistory}`));
    console.log(chalk.gray(`   • ${TOOL_DIRS.CLAUDE_COMMANDS}${msg.updatedCommands}`));
    console.log(chalk.gray(`   • ${msg.updatedDocs}`));
    console.log(chalk.green(`\n${msg.workPreserved}`));
    console.log(chalk.gray(`   • ${msg.allFilesPreserved}`));
    console.log(chalk.gray(`   • ${msg.backupCreated}`));
  } else {
    console.log(chalk.blue(`\n${msg.structureCreated}`));
    console.log(chalk.gray(`   ${AIWF_DIRS.ROOT}/                - ${msg.aiwfRoot}`));
    console.log(chalk.gray(`   ${TOOL_DIRS.CLAUDE_COMMANDS}/     - ${msg.claudeCommands}`));

    console.log(chalk.green(`\n${msg.nextSteps}`));
    console.log(chalk.white(`   1. ${msg.nextStep1}`));
    console.log(chalk.white(`   2. ${msg.nextStep2}`));
    console.log(chalk.white(`   3. ${msg.nextStep3}\n`));

    console.log(chalk.blue(`\n${msg.gettingStarted}`));
    console.log(chalk.gray(`   1. ${msg.startStep1}`));
    console.log(chalk.gray(`   2. ${msg.startStep2}`));
    console.log(chalk.gray(`\n${msg.checkDocs}`));
  }
}

/**
 * Offer reinstallation options
 * @param {Object} validationResults - Validation results
 * @param {string} language - Language code
 * @returns {Promise<string>} Selected action
 */
async function offerReinstallationOptions(validationResults, language) {
  console.log(
    chalk.yellow(
      language === 'ko'
        ? '\n⚠️  일부 설치가 실패했습니다. 무엇을 하시겠습니까?'
        : '\n⚠️  Some installations failed. What would you like to do?'
    )
  );

  // List failed tools
  const failedTools = validationResults.failed.map(({ tool }) => tool);

  if (failedTools.length > 0) {
    console.log(
      chalk.red(
        language === 'ko'
          ? `실패한 도구: ${failedTools.join(', ')}`
          : `Failed tools: ${failedTools.join(', ')}`
      )
    );
  }

  const response = await prompts({
    type: 'select',
    name: 'action',
    message:
      language === 'ko' ? '어떤 작업을 수행하시겠습니까?' : 'What would you like to do?',
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

/**
 * Main installation function
 * @param {Object} options - Installation options
 */
export async function installAIWF(options = {}) {
  const debugLog = options.debugLog || false;

  // Select language
  const selectedLanguage = await selectLanguage(options);
  const msg = getMessages(selectedLanguage);

  console.log(chalk.blue.bold(msg.welcome));
  console.log(chalk.gray(msg.description));
  console.log(chalk.gray(msg.optimized));

  // Set language path
  const languagePath = getInstallationLanguagePath(selectedLanguage);
  const GITHUB_CONTENT_LANGUAGE_PREFIX = `${GITHUB_CONTENT_PREFIX}/${languagePath}`;

  // Check existing installation
  const hasExisting = await checkExistingInstallation();

  let installDecision = { continue: true, installType: 'fresh', preserveProject: false };
  let projectBackupDir = null;

  if (hasExisting) {

    installDecision = await handleExistingInstallation(msg, options);

    if (!installDecision.continue) return;
    
    // If reinstalling and preserving project, backup project files
    if (installDecision.installType === 'reinstall' && installDecision.preserveProject) {
      const { hasProject, projectFiles } = await checkExistingProject();
      if (hasProject) {
        projectBackupDir = await backupProjectFiles(projectFiles, msg);
      }
    }
  }

  const spinner = ora(msg.fetching).start();

  try {
    // Create directory structure
    await createDirectoryStructure();

    // Download manifest (fresh installs only or complete reinstall)
    if (!hasExisting || installDecision.installType === 'reinstall') {
      await downloadManifest(languagePath, spinner, msg, debugLog);
    }

    // Download templates (fresh installs and complete reinstall only)
    if (!hasExisting || installDecision.installType === 'reinstall') {
      await downloadTemplates(languagePath, spinner, msg, debugLog);
    }

    // Update documentation (fresh installs and complete reinstall only)
    if (!hasExisting || installDecision.installType === 'reinstall') {
      await updateDocumentation(languagePath, spinner, msg, debugLog);
    }

    // Update commands
    await updateCommands(languagePath, spinner, msg, debugLog);

    // Download and process rules
    const toolDirStatus = await downloadAndProcessRules(spinner, msg, debugLog);

    // Restore project files if needed
    if (projectBackupDir) {
      await restoreProjectFiles(projectBackupDir, msg);
    }

    // Success
    if (hasExisting && installDecision.installType === 'update') {
      spinner.succeed(chalk.green(msg.updateSuccess));
    } else {
      spinner.succeed(chalk.green(msg.installSuccess));
    }

    // Display summary
    displaySummary(hasExisting, msg);

    // Run validation
    console.log(
      chalk.blue('\n🔍 Installation Validation / 설치 검증을 시작합니다...')
    );
    const selectedTools = ['claude-code', 'cursor', 'windsurf'];
    const validationResults = await validateInstallation(
      selectedTools,
      selectedLanguage
    );
    displaySpecCompliantValidationResults(validationResults, selectedLanguage);

    // Handle partial failures
    if (validationResults.failed.length > 0) {
      const action = await offerReinstallationOptions(
        validationResults,
        selectedLanguage
      );

      if (action === 'reinstall') {
        console.log(
          chalk.blue('\n🔄 재설치를 시작합니다... / Starting reinstallation...')
        );
        // Retry installation once
        if (!options.isRetry) {
          return await installAIWF({ ...options, isRetry: true });
        }
      } else if (action === 'rollback') {
        console.log(
          chalk.blue('\n↩️  실패한 도구를 롤백합니다... / Rolling back failed tools...')
        );

        // Rollback failed tools
        const failedTools = validationResults.failed.map(({ tool }) => tool);
        const backupDir = getCurrentBackupDir();
        let rollbackResults = {};

        for (const tool of failedTools) {
          if (backupDir) {
            const rollbackResult = await rollbackTool(
              tool,
              backupDir,
              selectedLanguage
            );
            rollbackResults[tool] = rollbackResult;
          }
        }

        // Re-validate after rollback
        console.log(
          chalk.blue('\n🔍 롤백 후 재검증... / Re-validating after rollback...')
        );
        const postRollbackValidation = await validateInstallation(
          selectedTools,
          selectedLanguage
        );
        displaySpecCompliantValidationResults(
          postRollbackValidation,
          selectedLanguage
        );

        // Rollback summary
        console.log(chalk.blue('\n=== Rollback Summary / 롤백 요약 ==='));
        for (const [tool, result] of Object.entries(rollbackResults)) {
          if (result.success) {
            console.log(
              chalk.green(`✅ ${tool}: ${result.restoredCount} files restored`)
            );
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

  // Create installation flag file
  await fs.writeFile(FILES.INSTALLED_FLAG, 'installed', 'utf8');
}