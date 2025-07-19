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
  TEMP_DIRS,
  AIWF_DIRS,
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
 * @returns {Promise<boolean>} Continue with installation
 */
async function handleExistingInstallation(msg, options) {
  if (options.force) {
    return true;
  }

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

  return true;
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
    await downloadDirectory(
      `${GITHUB_CONTENT_PREFIX}/${languagePath}/.aiwf/98_PROMPTS`,
      AIWF_DIRS.PROMPTS,
      spinner,
      msg
    );
    await downloadDirectory(
      `${GITHUB_CONTENT_PREFIX}/${languagePath}/.aiwf/99_TEMPLATES`,
      AIWF_DIRS.TEMPLATES,
      spinner,
      msg
    );
  } catch (error) {
    logWithSpinner(spinner, msg.templatesNotFound, debugLog);
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
 * Update commands
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

  await fs.mkdir(TOOL_DIRS.CLAUDE_COMMANDS, { recursive: true });

  // Download commands
  logWithSpinner(spinner, msg.downloadingCommands, debugLog);
  try {
    await downloadDirectory(
      `${GITHUB_CONTENT_PREFIX}/${languagePath}/${TOOL_DIRS.CLAUDE_COMMANDS}`,
      TOOL_DIRS.CLAUDE_COMMANDS,
      spinner,
      msg,
      languagePath
    );
  } catch (error) {
    logWithSpinner(spinner, msg.commandsNotFound, debugLog);
  }
}

/**
 * Download and process rules
 * @param {Object} spinner - Ora spinner instance
 * @param {Object} msg - Localized messages
 * @param {boolean} debugLog - Debug mode flag
 */
async function downloadAndProcessRules(spinner, msg, debugLog) {
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

  if (hasExisting) {
    const shouldContinue = await handleExistingInstallation(msg, options);
    if (!shouldContinue) return;
  }

  const spinner = ora(msg.fetching).start();

  try {
    // Create directory structure
    await createDirectoryStructure();

    // Download manifest (fresh installs only)
    if (!hasExisting) {
      await downloadManifest(languagePath, spinner, msg, debugLog);
    }

    // Download templates
    await downloadTemplates(languagePath, spinner, msg, debugLog);

    // Update documentation
    await updateDocumentation(languagePath, spinner, msg, debugLog);

    // Update commands
    await updateCommands(languagePath, spinner, msg, debugLog);

    // Download and process rules
    await downloadAndProcessRules(spinner, msg, debugLog);

    // Success
    if (hasExisting) {
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