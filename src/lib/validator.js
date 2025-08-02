import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import { TOOL_DIRS, AIWF_DIRS, FILES } from '../utils/paths.js';

// Validation constants
const VALIDATION_CONSTANTS = {
  MIN_FILE_SIZE: 10,
  MIN_RULE_FILE_SIZE: 50,
  MIN_FILE_COUNT: {
    CURSOR_MDC: 2,
    WINDSURF_MD: 2,
    CLAUDE_COMMANDS: 4
  }
};


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
      
      // Check file size
      try {
        const stats = await fs.stat(filePath);
        if (stats.size < VALIDATION_CONSTANTS.MIN_FILE_SIZE) {
          return { success: false, reason: `File ${fileName} is too small (${stats.size} bytes)` };
        }
      } catch (error) {
        return { success: false, reason: `Cannot read file ${fileName}: ${error.message}` };
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

    // Enhanced validation: Check file count and types
    const files = await fs.readdir(TOOL_DIRS.CURSOR_RULES);
    const mdcFiles = files.filter(file => file.endsWith('.mdc'));
    
    if (mdcFiles.length < VALIDATION_CONSTANTS.MIN_FILE_COUNT.CURSOR_MDC) {
      return { 
        success: false, 
        reason: `Cursor rules: Expected at least ${VALIDATION_CONSTANTS.MIN_FILE_COUNT.CURSOR_MDC} .mdc files, found ${mdcFiles.length}` 
      };
    }

    // Validate file sizes
    for (const file of mdcFiles) {
      const filePath = path.join(TOOL_DIRS.CURSOR_RULES, file);
      try {
        const stats = await fs.stat(filePath);
        if (stats.size < VALIDATION_CONSTANTS.MIN_RULE_FILE_SIZE) {
          return { 
            success: false, 
            reason: `Cursor rules file ${file} is too small (${stats.size} bytes, minimum ${VALIDATION_CONSTANTS.MIN_RULE_FILE_SIZE})` 
          };
        }
      } catch (error) {
        return { 
          success: false, 
          reason: `Cannot read Cursor rules file ${file}: ${error.message}` 
        };
      }
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

    // Enhanced validation: Check file count and types
    const files = await fs.readdir(TOOL_DIRS.WINDSURF_RULES);
    const mdFiles = files.filter(file => file.endsWith('.md'));
    
    if (mdFiles.length < VALIDATION_CONSTANTS.MIN_FILE_COUNT.WINDSURF_MD) {
      return { 
        success: false, 
        reason: `Windsurf rules: Expected at least ${VALIDATION_CONSTANTS.MIN_FILE_COUNT.WINDSURF_MD} .md files, found ${mdFiles.length}` 
      };
    }

    // Validate file sizes
    for (const file of mdFiles) {
      const filePath = path.join(TOOL_DIRS.WINDSURF_RULES, file);
      try {
        const stats = await fs.stat(filePath);
        if (stats.size < VALIDATION_CONSTANTS.MIN_RULE_FILE_SIZE) {
          return { 
            success: false, 
            reason: `Windsurf rules file ${file} is too small (${stats.size} bytes, minimum ${VALIDATION_CONSTANTS.MIN_RULE_FILE_SIZE})` 
          };
        }
      } catch (error) {
        return { 
          success: false, 
          reason: `Cannot read Windsurf rules file ${file}: ${error.message}` 
        };
      }
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