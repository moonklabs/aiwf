import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import { TOOL_DIRS, AIWF_DIRS, FILES } from '../utils/paths.js';

// Essential files configuration for each tool
const ESSENTIAL_FILES = {
  claudeCode: {
    baseDir: TOOL_DIRS.CLAUDE_COMMANDS,
    requiredFiles: [
      'aiwf_initialize.md',
      'aiwf_do_task.md',
      'aiwf_commit.md',
      'aiwf_create_sprint_tasks.md',
      'aiwf_code_review.md'
    ],
    minFileCount: 5,
    description: 'Claude Code Commands'
  },
  geminiCLI: {
    baseDir: TOOL_DIRS.GEMINI_PROMPTS,
    requiredFiles: ['README.md'],
    minFileCount: 1,
    description: 'Gemini-CLI Prompts'
  },
  cursor: {
    baseDir: TOOL_DIRS.CURSOR_RULES,
    requiredFiles: [],
    minFileCount: 2,
    fileExtension: '.mdc',
    description: 'Cursor IDE Rules'
  },
  windsurf: {
    baseDir: TOOL_DIRS.WINDSURF_RULES,
    requiredFiles: [],
    minFileCount: 2,
    fileExtension: '.md',
    description: 'Windsurf IDE Rules'
  },
  aiwf: {
    baseDir: AIWF_DIRS.ROOT,
    requiredFiles: ['CLAUDE.md', '00_PROJECT_MANIFEST.md'],
    minFileCount: 2,
    description: 'AIWF Core Structure'
  }
};

/**
 * Validate tool installation based on configuration
 * @param {Object} config - Tool configuration
 * @returns {Promise<Object>} Validation results
 */
async function validateToolInstallation(config) {
  const results = {
    success: true,
    description: config.description,
    baseDir: config.baseDir,
    checks: {
      directoryExists: false,
      fileCount: 0,
      requiredFiles: [],
      totalSize: 0,
      issues: []
    }
  };

  try {
    // 1. Check directory exists
    await fs.access(config.baseDir);
    const dirStat = await fs.stat(config.baseDir);
    if (dirStat.isDirectory()) {
      results.checks.directoryExists = true;
    } else {
      results.checks.issues.push(`${config.baseDir} is not a directory`);
      results.success = false;
      return results;
    }

    // 2. Get file list
    const actualFiles = await fs.readdir(config.baseDir);
    results.checks.fileCount = actualFiles.length;

    // 3. Check required files
    for (const requiredFile of config.requiredFiles || []) {
      const filePath = path.join(config.baseDir, requiredFile);
      const fileCheck = {
        file: requiredFile,
        exists: false,
        size: 0,
        valid: false
      };

      if (actualFiles.includes(requiredFile)) {
        fileCheck.exists = true;
        try {
          const stats = await fs.stat(filePath);
          fileCheck.size = stats.size;
          results.checks.totalSize += stats.size;

          // Validate file size (minimum 10 bytes)
          if (stats.size < 10) {
            results.checks.issues.push(
              `File ${requiredFile} is too small (${stats.size} bytes)`
            );
            results.success = false;
          } else {
            fileCheck.valid = true;
          }
        } catch (error) {
          results.checks.issues.push(
            `Cannot read stats for ${requiredFile}: ${error.message}`
          );
          results.success = false;
        }
      } else {
        results.checks.issues.push(`Required file ${requiredFile} is missing`);
        results.success = false;
      }

      results.checks.requiredFiles.push(fileCheck);
    }

    // 4. File extension validation (Cursor/Windsurf)
    if (config.fileExtension) {
      const matchingFiles = actualFiles.filter(f => f.endsWith(config.fileExtension));
      if (matchingFiles.length < config.minFileCount) {
        results.checks.issues.push(
          `Expected at least ${config.minFileCount} ${config.fileExtension} files, found ${matchingFiles.length}`
        );
        results.success = false;
      }

      // Validate file sizes for extension files
      for (const file of matchingFiles) {
        const filePath = path.join(config.baseDir, file);
        try {
          const stats = await fs.stat(filePath);
          results.checks.totalSize += stats.size;

          if (stats.size < 50) {
            // Rules files should be at least 50 bytes
            results.checks.issues.push(
              `Rules file ${file} is too small (${stats.size} bytes)`
            );
            results.success = false;
          }
        } catch (error) {
          results.checks.issues.push(`Cannot read ${file}: ${error.message}`);
          results.success = false;
        }
      }
    }

    // 5. Minimum file count validation
    if (results.checks.fileCount < config.minFileCount) {
      results.checks.issues.push(
        `Expected at least ${config.minFileCount} files, found ${results.checks.fileCount}`
      );
      results.success = false;
    }
  } catch (error) {
    results.success = false;
    results.checks.issues.push(`Validation error: ${error.message}`);
  }

  return results;
}

/**
 * Validate Claude Code installation
 * @returns {Promise<Object>} Validation results
 */
export async function validateClaudeInstall() {
  return await validateToolInstallation(ESSENTIAL_FILES.claudeCode);
}

/**
 * Validate Gemini CLI installation
 * @returns {Promise<Object>} Validation results
 */
export async function validateGeminiInstall() {
  return await validateToolInstallation(ESSENTIAL_FILES.geminiCLI);
}

/**
 * Validate Cursor installation
 * @returns {Promise<Object>} Validation results
 */
export async function validateCursorInstall() {
  return await validateToolInstallation(ESSENTIAL_FILES.cursor);
}

/**
 * Validate Windsurf installation
 * @returns {Promise<Object>} Validation results
 */
export async function validateWindsurfInstall() {
  return await validateToolInstallation(ESSENTIAL_FILES.windsurf);
}

/**
 * Validate AIWF Core installation
 * @returns {Promise<Object>} Validation results
 */
export async function validateAIWFCore() {
  return await validateToolInstallation(ESSENTIAL_FILES.aiwf);
}

/**
 * Validate installation with detailed results
 * @returns {Promise<Object>} Detailed validation results
 */
export async function validateInstallationDetailed() {
  const validationResults = {
    overall: {
      success: true,
      toolsChecked: 0,
      toolsPassed: 0,
      toolsFailed: 0,
      totalIssues: 0
    },
    tools: {}
  };

  // Always validate AIWF core
  const aiwfResult = await validateAIWFCore();
  validationResults.tools.aiwf = aiwfResult;
  validationResults.overall.toolsChecked++;

  if (aiwfResult.success) {
    validationResults.overall.toolsPassed++;
  } else {
    validationResults.overall.toolsFailed++;
    validationResults.overall.success = false;
    validationResults.overall.totalIssues += aiwfResult.checks.issues.length;
  }

  // Validate all tools
  const toolValidators = {
    claudeCode: validateClaudeInstall,
    geminiCLI: validateGeminiInstall,
    cursor: validateCursorInstall,
    windsurf: validateWindsurfInstall
  };

  for (const [toolName, validator] of Object.entries(toolValidators)) {
    const result = await validator();
    validationResults.tools[toolName] = result;
    validationResults.overall.toolsChecked++;

    if (result.success) {
      validationResults.overall.toolsPassed++;
    } else {
      validationResults.overall.toolsFailed++;
      validationResults.overall.success = false;
      validationResults.overall.totalIssues += result.checks.issues.length;
    }
  }

  return validationResults;
}

/**
 * Enhanced installation validation with tool selection
 * @param {Array|null} selectedTools - Tools to validate
 * @param {string} language - Language code
 * @returns {Promise<Object>} Validation results
 */
export async function validateInstallationEnhanced(selectedTools = null, language = 'en') {
  const validationResults = {
    overall: {
      success: true,
      toolsChecked: 0,
      toolsPassed: 0,
      toolsFailed: 0,
      totalIssues: 0
    },
    tools: {}
  };

  // Always validate AIWF core
  const aiwfResult = await validateAIWFCore();
  validationResults.tools.aiwf = aiwfResult;
  validationResults.overall.toolsChecked++;

  if (aiwfResult.success) {
    validationResults.overall.toolsPassed++;
  } else {
    validationResults.overall.toolsFailed++;
    validationResults.overall.success = false;
    validationResults.overall.totalIssues += aiwfResult.checks.issues.length;
  }

  // Determine tools to validate
  const toolsToValidate = selectedTools || ['claudeCode', 'geminiCLI', 'cursor', 'windsurf'];

  const toolValidators = {
    claudeCode: validateClaudeInstall,
    geminiCLI: validateGeminiInstall,
    cursor: validateCursorInstall,
    windsurf: validateWindsurfInstall
  };

  for (const toolName of toolsToValidate) {
    if (toolValidators[toolName]) {
      const result = await toolValidators[toolName]();
      validationResults.tools[toolName] = result;
      validationResults.overall.toolsChecked++;

      if (result.success) {
        validationResults.overall.toolsPassed++;
      } else {
        validationResults.overall.toolsFailed++;
        validationResults.overall.success = false;
        validationResults.overall.totalIssues += result.checks.issues.length;
      }
    }
  }

  return validationResults;
}

/**
 * Simplified validation with clean interface
 * @param {Array} selectedTools - Tools to validate
 * @param {string} language - Language code
 * @returns {Promise<Object>} Validation results
 */
export async function validateInstallation(selectedTools, language) {
  const results = {
    success: [],
    failed: [],
    warnings: []
  };

  // Always validate common files (AIWF core)
  const commonValid = await validateCommonFiles();
  if (!commonValid.success) {
    results.failed.push({ tool: 'aiwf', reason: commonValid.reason });
  } else {
    results.success.push('aiwf');
  }

  // Validate selected tools
  if (selectedTools && selectedTools.length > 0) {
    for (const tool of selectedTools) {
      const validation = await validateTool(tool);
      if (validation.success) {
        results.success.push(tool);
      } else {
        results.failed.push({ tool, reason: validation.reason });
      }
    }
  } else {
    // Default: validate all tools if no selection provided
    const allTools = ['claudeCode', 'geminiCLI', 'cursor', 'windsurf'];
    for (const tool of allTools) {
      const validation = await validateTool(tool);
      if (validation.success) {
        results.success.push(tool);
      } else {
        results.failed.push({ tool, reason: validation.reason });
      }
    }
  }

  return results;
}

/**
 * Validate common/core files
 * @returns {Promise<Object>} Validation result
 */
async function validateCommonFiles() {
  try {
    const requiredFiles = [
      FILES.CLAUDE_MD.ROOT,
      FILES.PROJECT_MANIFEST
    ];

    for (const file of requiredFiles) {
      const exists = await fs
        .access(file)
        .then(() => true)
        .catch(() => false);
      if (!exists) {
        return { success: false, reason: `Missing core file: ${file}` };
      }
    }

    return { success: true };
  } catch (error) {
    return { success: false, reason: `Core validation error: ${error.message}` };
  }
}

/**
 * Validate specific tool
 * @param {string} tool - Tool name
 * @returns {Promise<Object>} Validation result
 */
async function validateTool(tool) {
  switch (tool) {
    case 'claudeCode':
    case 'claude-code':
      return validateClaudeCode();
    case 'geminiCLI':
    case 'gemini-cli':
      return validateGeminiCLI();
    case 'cursor':
      return validateCursorTool();
    case 'windsurf':
      return validateWindsurfTool();
    case 'aiwf':
      return validateCommonFiles();
    default:
      return { success: false, reason: `Unknown tool: ${tool}` };
  }
}

/**
 * Validate Claude Code with simplified interface
 * @returns {Promise<Object>} Validation result
 */
async function validateClaudeCode() {
  try {
    const requiredFiles = [
      'aiwf_initialize.md',
      'aiwf_do_task.md',
      'aiwf_commit.md',
      'aiwf_code_review.md'
    ];

    for (const fileName of requiredFiles) {
      const filePath = path.join(TOOL_DIRS.CLAUDE_COMMANDS, fileName);
      const exists = await fs
        .access(filePath)
        .then(() => true)
        .catch(() => false);
      if (!exists) {
        return { success: false, reason: `Missing file: ${filePath}` };
      }
    }

    return { success: true };
  } catch (error) {
    return { success: false, reason: `Claude Code validation error: ${error.message}` };
  }
}

/**
 * Validate Gemini CLI with simplified interface
 * @returns {Promise<Object>} Validation result
 */
async function validateGeminiCLI() {
  try {
    const dirExists = await fs
      .access(TOOL_DIRS.GEMINI_PROMPTS)
      .then(() => true)
      .catch(() => false);
    if (!dirExists) {
      return {
        success: false,
        reason: `Missing Gemini-CLI prompts directory: ${TOOL_DIRS.GEMINI_PROMPTS}`
      };
    }

    return { success: true };
  } catch (error) {
    return { success: false, reason: `Gemini-CLI validation error: ${error.message}` };
  }
}

/**
 * Validate Cursor tool with simplified interface
 * @returns {Promise<Object>} Validation result
 */
async function validateCursorTool() {
  try {
    const dirExists = await fs
      .access(TOOL_DIRS.CURSOR_RULES)
      .then(() => true)
      .catch(() => false);
    if (!dirExists) {
      return { success: false, reason: `Missing Cursor rules directory: ${TOOL_DIRS.CURSOR_RULES}` };
    }

    return { success: true };
  } catch (error) {
    return { success: false, reason: `Cursor validation error: ${error.message}` };
  }
}

/**
 * Validate Windsurf tool with simplified interface
 * @returns {Promise<Object>} Validation result
 */
async function validateWindsurfTool() {
  try {
    const dirExists = await fs
      .access(TOOL_DIRS.WINDSURF_RULES)
      .then(() => true)
      .catch(() => false);
    if (!dirExists) {
      return { success: false, reason: `Missing Windsurf rules directory: ${TOOL_DIRS.WINDSURF_RULES}` };
    }

    return { success: true };
  } catch (error) {
    return { success: false, reason: `Windsurf validation error: ${error.message}` };
  }
}

/**
 * Display validation results in spec-compliant format
 * @param {Object} validationResults - Validation results
 * @param {string} language - Language code
 */
export function displaySpecCompliantValidationResults(validationResults, language) {
  console.log(chalk.blue('\n=== Installation Validation Results ==='));

  // Success summary
  if (validationResults.success.length > 0) {
    console.log(
      chalk.green(`\n✅ Successfully Validated Tools (${validationResults.success.length}):`)
    );
    validationResults.success.forEach(tool => {
      console.log(chalk.green(`   ✓ ${tool}`));
    });
  }

  // Failed summary
  if (validationResults.failed.length > 0) {
    console.log(chalk.red(`\n❌ Failed Validations (${validationResults.failed.length}):`));
    validationResults.failed.forEach(({ tool, reason }) => {
      console.log(chalk.red(`   ✗ ${tool}: ${reason}`));
    });
  }

  // Warnings summary
  if (validationResults.warnings.length > 0) {
    console.log(chalk.yellow(`\n⚠️ Warnings (${validationResults.warnings.length}):`));
    validationResults.warnings.forEach(warning => {
      console.log(chalk.yellow(`   ⚠ ${warning}`));
    });
  }

  // Overall status
  const isSuccess = validationResults.failed.length === 0;
  const statusIcon = isSuccess ? '✅' : '❌';
  const statusColor = isSuccess ? chalk.green : chalk.red;
  const statusText = isSuccess ? 'PASSED' : 'FAILED';

  console.log(statusColor(`\n${statusIcon} Overall Validation: ${statusText}`));

  if (isSuccess) {
    console.log(chalk.green('🎉 All selected tools are properly installed and validated!'));
  } else {
    console.log(chalk.yellow('⚠️ Some installations failed. See details above.'));
  }
}