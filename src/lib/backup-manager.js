import fs from 'fs/promises';
import path from 'path';
import ora from 'ora';
import chalk from 'chalk';
import { 
  TOOL_DIRS, 
  AIWF_DIRS, 
  FILES
} from '../utils/paths.js';

let BACKUP_DIR = null;

/**
 * Generate backup directory name with timestamp
 * @returns {string} Backup directory name
 */
function getBackupDirName() {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
  return `backup-${timestamp}`;
}

/**
 * Backup a single file with proper naming convention
 * @param {string} filePath - File to backup
 * @param {string} backupDir - Backup directory path
 * @returns {Promise<string|null>} Backup file path or null
 */
async function backupFile(filePath, backupDir) {
  try {
    const exists = await fs.access(filePath).then(() => true).catch(() => false);
    if (exists) {
      await fs.mkdir(backupDir, { recursive: true });
      const backupPath = `${filePath}.bak`;
      await fs.copyFile(filePath, backupPath);
      
      // Tool-specific backup file naming rules
      let bakFileName;
      if (filePath.startsWith(TOOL_DIRS.CLAUDE_COMMANDS + '/')) {
        // Claude Code command files
        const relativePath = filePath.substring(TOOL_DIRS.CLAUDE_COMMANDS.length + 1);
        bakFileName = `claude-commands-aiwf-${relativePath.replace(/\//g, '-')}.bak`;
      } else if (filePath.startsWith(TOOL_DIRS.GEMINI_PROMPTS + '/')) {
        // Gemini CLI prompt files
        const relativePath = filePath.substring(TOOL_DIRS.GEMINI_PROMPTS.length + 1);
        bakFileName = `gemini-prompts-aiwf-${relativePath.replace(/\//g, '-')}.bak`;
      } else if (filePath.startsWith(TOOL_DIRS.CURSOR_RULES + '/')) {
        // Cursor rule files
        const relativePath = filePath.substring(TOOL_DIRS.CURSOR_RULES.length + 1);
        bakFileName = `cursor-rules-${relativePath.replace(/\//g, '-')}.bak`;
      } else if (filePath.startsWith(TOOL_DIRS.WINDSURF_RULES + '/')) {
        // Windsurf rule files
        const relativePath = filePath.substring(TOOL_DIRS.WINDSURF_RULES.length + 1);
        bakFileName = `windsurf-rules-${relativePath.replace(/\//g, '-')}.bak`;
      } else if (filePath.startsWith(AIWF_DIRS.ROOT + '/')) {
        // AIWF core files
        const relativePath = filePath.substring(AIWF_DIRS.ROOT.length + 1);
        bakFileName = `aiwf-${relativePath.replace(/\//g, '-')}.bak`;
      } else {
        // Other files
        bakFileName = path.basename(filePath) + '.bak';
      }
      
      const destPath = path.join(backupDir, bakFileName);
      await fs.rename(backupPath, destPath);
      return destPath;
    }
  } catch (error) {
    // Backup failed, but continue
  }
  return null;
}

/**
 * Backup commands and documentation files
 * @param {Object} messages - Localized messages
 * @param {string} [commandsDir] - Commands directory
 * @returns {Promise<Array<string>>} Array of backed up file paths
 */
async function backupCommandsAndDocs(messages, commandsDir = TOOL_DIRS.CLAUDE_COMMANDS) {
  if (!BACKUP_DIR) BACKUP_DIR = getBackupDirName();
  const spinner = ora(messages.backingUp).start();
  const backedUpFiles = [];
  await fs.mkdir(BACKUP_DIR, { recursive: true });
  
  try {
    // Files that will be updated and need backup
    const filesToBackup = Object.values(FILES.CLAUDE_MD);
    
    // Backup CLAUDE.md files
    for (const file of filesToBackup) {
      const backupPath = await backupFile(file, BACKUP_DIR);
      if (backupPath) {
        backedUpFiles.push(backupPath);
      }
    }
    
    // Backup all command files
    const commandsExist = await fs.access(commandsDir).then(() => true).catch(() => false);
    if (commandsExist) {
      try {
        const commandFiles = await fs.readdir(commandsDir);
        for (const file of commandFiles) {
          const filePath = path.join(commandsDir, file);
          const stat = await fs.stat(filePath);
          if (stat.isFile() && file.endsWith('.md')) {
            const backupPath = await backupFile(filePath, BACKUP_DIR);
            if (backupPath) {
              backedUpFiles.push(backupPath);
            }
          }
        }
      } catch (error) {
        // Commands directory might be empty or have issues
      }
    }
    
    // Backup IDE rule files (Cursor)
    const cursorRulesExist = await fs.access(TOOL_DIRS.CURSOR_RULES).then(() => true).catch(() => false);
    if (cursorRulesExist) {
      try {
        const cursorFiles = await fs.readdir(TOOL_DIRS.CURSOR_RULES);
        for (const file of cursorFiles) {
          if (file.endsWith('.mdc')) {
            const filePath = path.join(TOOL_DIRS.CURSOR_RULES, file);
            const backupPath = await backupFile(filePath, BACKUP_DIR);
            if (backupPath) {
              backedUpFiles.push(backupPath);
            }
          }
        }
      } catch (error) {
        // Cursor rules directory might have issues
      }
    }
    
    // Backup IDE rule files (Windsurf)
    const windsurfRulesExist = await fs.access(TOOL_DIRS.WINDSURF_RULES).then(() => true).catch(() => false);
    if (windsurfRulesExist) {
      try {
        const windsurfFiles = await fs.readdir(TOOL_DIRS.WINDSURF_RULES);
        for (const file of windsurfFiles) {
          if (file.endsWith('.md')) {
            const filePath = path.join(TOOL_DIRS.WINDSURF_RULES, file);
            const backupPath = await backupFile(filePath, BACKUP_DIR);
            if (backupPath) {
              backedUpFiles.push(backupPath);
            }
          }
        }
      } catch (error) {
        // Windsurf rules directory might have issues
      }
    }
    
    if (backedUpFiles.length > 0) {
      spinner.succeed(chalk.green(messages.backupComplete.replace('{count}', backedUpFiles.length)));
    } else {
      spinner.succeed(chalk.gray(messages.noFilesToBackup));
    }
    return backedUpFiles;
  } catch (error) {
    spinner.fail(chalk.red(messages.backupFailed));
    throw error;
  }
}

/**
 * Restore files from backup
 * @param {Object} spinner - Ora spinner instance
 * @param {Object} messages - Localized messages
 * @returns {Promise<void>}
 */
async function restoreFromBackup(spinner, messages) {
  if (!BACKUP_DIR) return;
  
  try {
    spinner.text = messages.restoringBackup;
    
    // Get all backup files
    const backupFiles = await fs.readdir(BACKUP_DIR);
    let restoredCount = 0;
    
    for (const bakFile of backupFiles) {
      if (bakFile.endsWith('.bak')) {
        const backupPath = path.join(BACKUP_DIR, bakFile);
        let originalPath;
        
        // Determine original path from backup filename
        if (bakFile.startsWith('claude-commands-aiwf-')) {
          const relativePath = bakFile
            .replace('claude-commands-aiwf-', '')
            .replace('.bak', '')
            .replace(/-/g, '/');
          originalPath = path.join(TOOL_DIRS.CLAUDE_COMMANDS, relativePath);
        } else if (bakFile.startsWith('gemini-prompts-aiwf-')) {
          const relativePath = bakFile
            .replace('gemini-prompts-aiwf-', '')
            .replace('.bak', '')
            .replace(/-/g, '/');
          originalPath = path.join(TOOL_DIRS.GEMINI_PROMPTS, relativePath);
        } else if (bakFile.startsWith('cursor-rules-')) {
          const relativePath = bakFile
            .replace('cursor-rules-', '')
            .replace('.bak', '')
            .replace(/-/g, '/');
          originalPath = path.join(TOOL_DIRS.CURSOR_RULES, relativePath);
        } else if (bakFile.startsWith('windsurf-rules-')) {
          const relativePath = bakFile
            .replace('windsurf-rules-', '')
            .replace('.bak', '')
            .replace(/-/g, '/');
          originalPath = path.join(TOOL_DIRS.WINDSURF_RULES, relativePath);
        } else if (bakFile.startsWith('aiwf-')) {
          const relativePath = bakFile
            .replace('aiwf-', '')
            .replace('.bak', '')
            .replace(/-/g, '/');
          originalPath = path.join(AIWF_DIRS.ROOT, relativePath);
        } else {
          // Simple filename.ext.bak format
          originalPath = bakFile.replace('.bak', '');
        }
        
        try {
          // Ensure directory exists
          await fs.mkdir(path.dirname(originalPath), { recursive: true });
          // Copy backup to original location
          await fs.copyFile(backupPath, originalPath);
          restoredCount++;
        } catch (error) {
          // Individual file restore failed, continue with others
        }
      }
    }
    
    // Clean up backup directory
    await fs.rm(BACKUP_DIR, { recursive: true, force: true });
    BACKUP_DIR = null;
    
    spinner.text = messages.backupRestored.replace('{count}', restoredCount);
  } catch (error) {
    spinner.fail(chalk.red(messages.restoreFailed));
    throw error;
  }
}

/**
 * Get current backup directory
 * @returns {string|null} Current backup directory path
 */
function getCurrentBackupDir() {
  return BACKUP_DIR;
}

/**
 * Set backup directory
 * @param {string} dir - Backup directory path
 */
function setBackupDir(dir) {
  BACKUP_DIR = dir;
}

export {
  getBackupDirName,
  backupFile,
  backupCommandsAndDocs,
  restoreFromBackup,
  getCurrentBackupDir,
  setBackupDir
};