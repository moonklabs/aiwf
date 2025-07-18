import fs from 'fs/promises';
import path from 'path';
import ora from 'ora';
import chalk from 'chalk';
import { getMessages } from '../utils/messages.js';
import { getToolDirectory as getToolDirectoryPath } from '../utils/paths.js';

// Backup file patterns for each tool
const BACKUP_PATTERNS = {
  claudeCode: /^claude-commands-aiwf-.*\.bak$/,
  geminiCLI: /^gemini-prompts-aiwf-.*\.bak$/,
  cursor: /^cursor-rules-.*\.bak$/,
  windsurf: /^windsurf-rules-.*\.bak$/,
  aiwf: /^aiwf-.*\.bak$/
};

// Backup file prefixes
const BACKUP_PREFIXES = {
  claudeCode: 'claude-commands-aiwf-',
  geminiCLI: 'gemini-prompts-aiwf-',
  cursor: 'cursor-rules-',
  windsurf: 'windsurf-rules-',
  aiwf: 'aiwf-'
};

// Tool names for localization
const TOOL_NAMES = {
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

/**
 * Get tool directory path
 * @param {string} tool - Tool name
 * @returns {string|null} Directory path or null
 */
export function getToolDirectory(tool) {
  return getToolDirectoryPath(tool);
}

/**
 * Get localized tool name
 * @param {string} tool - Tool name
 * @param {string} language - Language code
 * @returns {string} Localized tool name
 */
export function getToolName(tool, language) {
  return TOOL_NAMES[language]?.[tool] || tool;
}

/**
 * Restore original path from backup filename
 * @param {string} backupFileName - Backup file name
 * @param {string} tool - Tool name
 * @returns {string|null} Original path or null
 */
function restoreOriginalPath(backupFileName, tool) {
  const baseDir = getToolDirectory(tool);
  if (!baseDir) return null;

  let originalFileName = backupFileName;

  // Remove tool-specific prefix
  const prefix = BACKUP_PREFIXES[tool];
  if (prefix && originalFileName.startsWith(prefix)) {
    originalFileName = originalFileName.substring(prefix.length);
  }

  // Remove .bak extension
  if (originalFileName.endsWith('.bak')) {
    originalFileName = originalFileName.substring(0, originalFileName.length - 4);
  }

  // Replace hyphens with slashes (subdirectory structure)
  originalFileName = originalFileName.replace(/-/g, '/');

  return path.join(baseDir, originalFileName);
}

/**
 * Get backup files for a specific tool
 * @param {string} tool - Tool name
 * @param {string} backupDir - Backup directory path
 * @returns {Promise<Array>} Array of backup file info
 */
async function getBackupFilesForTool(tool, backupDir) {
  const toolBackupFiles = [];

  try {
    const backupFiles = await fs.readdir(backupDir);
    const pattern = BACKUP_PATTERNS[tool];

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
    // Backup directory doesn't exist or can't be read
  }

  return toolBackupFiles;
}

/**
 * Restore a single backup file
 * @param {Object} backup - Backup file info
 * @returns {Promise<boolean>} Success status
 */
async function restoreBackupFile(backup) {
  try {
    // Ensure target directory exists
    const targetDir = path.dirname(backup.originalPath);
    await fs.mkdir(targetDir, { recursive: true });

    // Copy backup file to original location
    await fs.copyFile(backup.backupFile, backup.originalPath);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Rollback a specific tool
 * @param {string} tool - Tool name
 * @param {string} backupDir - Backup directory path
 * @param {string} language - Language code
 * @returns {Promise<Object>} Rollback result
 */
export async function rollbackTool(tool, backupDir, language = 'ko') {
  const messages = getMessages(language);
  const spinner = ora(
    language === 'ko' ? `${tool} 도구를 롤백하는 중...` : `Rolling back ${tool}...`
  ).start();

  try {
    // 1. Remove tool directory
    const toolDir = getToolDirectory(tool);
    if (toolDir) {
      const dirExists = await fs
        .access(toolDir)
        .then(() => true)
        .catch(() => false);
      if (dirExists) {
        await fs.rm(toolDir, { recursive: true, force: true });
        spinner.text =
          language === 'ko' ? `${tool} 디렉토리 삭제 완료` : `${tool} directory removed`;
      }
    }

    // 2. Restore from backup
    const backupFiles = await getBackupFilesForTool(tool, backupDir);
    let restoredCount = 0;

    for (const backup of backupFiles) {
      const restored = await restoreBackupFile(backup);
      if (restored) {
        restoredCount++;
      }
    }

    if (restoredCount > 0) {
      spinner.succeed(
        chalk.green(
          language === 'ko'
            ? `${tool} 롤백 완료 (${restoredCount}개 파일 복원)`
            : `${tool} rolled back successfully (${restoredCount} files restored)`
        )
      );
      return { success: true, restoredCount };
    } else {
      spinner.warn(
        chalk.yellow(
          language === 'ko'
            ? `${tool} 롤백: 복원할 백업 파일이 없음`
            : `${tool} rollback: No backup files to restore`
        )
      );
      return { success: true, restoredCount: 0 };
    }
  } catch (error) {
    spinner.fail(
      chalk.red(
        language === 'ko'
          ? `${tool} 롤백 실패: ${error.message}`
          : `Failed to rollback ${tool}: ${error.message}`
      )
    );
    return { success: false, error: error.message };
  }
}

/**
 * Enhanced rollback function with backup directory
 * @param {string} tool - Tool name
 * @param {string} backupDir - Backup directory path
 * @param {string} language - Language code
 * @returns {Promise<boolean>} Success status
 */
export async function rollbackToolEnhanced(tool, backupDir, language = 'ko') {
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

/**
 * Generate installation report
 * @param {Object} validationResults - Validation results
 * @param {string} language - Language code
 * @param {string} installationType - Installation type
 */
export function generateInstallationReport(
  validationResults,
  language,
  installationType = 'install'
) {
  const messages = getMessages(language);

  // Header
  console.log(chalk.blue.bold('\n' + '='.repeat(60)));
  console.log(
    chalk.blue.bold(
      language === 'ko'
        ? '🔍 AIWF 설치 검증 및 리포트'
        : '🔍 AIWF Installation Validation & Report'
    )
  );
  console.log(chalk.blue.bold('='.repeat(60)));

  // Installation type
  const installTypeText = {
    install: language === 'ko' ? '새 설치' : 'Fresh Installation',
    update: language === 'ko' ? '업데이트' : 'Update',
    reinstall: language === 'ko' ? '재설치' : 'Reinstallation'
  };
  console.log(
    chalk.gray(
      `설치 유형 / Installation Type: ${installTypeText[installationType] || installTypeText.install}`
    )
  );
  console.log(chalk.gray(`검증 시간 / Validation Time: ${new Date().toLocaleString()}`));

  // Overall summary
  const { overall } = validationResults;
  const statusIcon = overall.success ? '✅' : '❌';
  const statusColor = overall.success ? chalk.green : chalk.red;

  console.log(
    statusColor(
      `\n${statusIcon} 전체 상태 / Overall Status: ${overall.success ? 'PASSED' : 'FAILED'}`
    )
  );
  console.log(chalk.gray(`   검증한 도구 / Tools Checked: ${overall.toolsChecked}`));
  console.log(chalk.gray(`   성공한 도구 / Tools Passed: ${overall.toolsPassed}`));

  if (overall.toolsFailed > 0) {
    console.log(chalk.red(`   실패한 도구 / Tools Failed: ${overall.toolsFailed}`));
    console.log(chalk.red(`   총 이슈 수 / Total Issues: ${overall.totalIssues}`));
  }

  // Individual tool results
  console.log(chalk.blue('\n=== 개별 도구 결과 / Individual Tool Results ==='));

  for (const [toolName, result] of Object.entries(validationResults.tools)) {
    const toolIcon = result.success ? '✅' : '❌';
    const toolColor = result.success ? chalk.green : chalk.red;

    console.log(toolColor(`\n${toolIcon} ${result.description} (${toolName})`));
    console.log(chalk.gray(`   디렉토리 / Directory: ${result.baseDir}`));
    console.log(chalk.gray(`   파일 수 / Files Found: ${result.checks.fileCount}`));
    console.log(
      chalk.gray(`   총 크기 / Total Size: ${(result.checks.totalSize / 1024).toFixed(2)} KB`)
    );

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
        console.log(
          fileColor(
            `     ${fileIcon} ${fileCheck.file} (${(fileCheck.size / 1024).toFixed(2)} KB)`
          )
        );
      }
    }
  }

  // Recommendations
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

    // Solutions for failed tools
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

/**
 * Enhanced installation report generation
 * @param {Object} results - Installation results
 * @param {string} language - Language code
 */
export function generateInstallationReportEnhanced(results, language) {
  const msg = getMessages(language);

  console.log(
    '\n' + chalk.bold(language === 'ko' ? '📋 설치 리포트' : '📋 Installation Report')
  );
  console.log('─'.repeat(50));

  if (results.success.length > 0) {
    console.log(
      chalk.green(
        language === 'ko' ? '✅ 성공적으로 설치된 도구:' : '✅ Successfully Installed Tools:'
      )
    );
    results.success.forEach(tool => {
      console.log(chalk.green(`  ✓ ${getToolName(tool, language)}`));
    });
  }

  if (results.failed.length > 0) {
    console.log(
      chalk.red(language === 'ko' ? '\n❌ 설치 실패한 도구:' : '\n❌ Failed to Install:')
    );
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