/**
 * AIWF Directory Paths Configuration
 * Central location for all directory paths used in the AIWF framework
 */

import path from 'path';
import os from 'os';

// Base directories
export const BASE_DIRS = {
  AIWF: '.aiwf',
  CLAUDE: '.claude',
  GEMINI: '.gemini',
  CURSOR: '.cursor',
  WINDSURF: '.windsurf'
};

// AIWF subdirectories
export const AIWF_DIRS = {
  ROOT: BASE_DIRS.AIWF,
  PROJECT_DOCS: path.join(BASE_DIRS.AIWF, '01_PROJECT_DOCS'),
  REQUIREMENTS: path.join(BASE_DIRS.AIWF, '02_REQUIREMENTS'),
  SPRINTS: path.join(BASE_DIRS.AIWF, '03_SPRINTS'),
  GENERAL_TASKS: path.join(BASE_DIRS.AIWF, '04_GENERAL_TASKS'),
  ARCHITECTURE_DECISIONS: path.join(BASE_DIRS.AIWF, '05_ARCHITECTURE_DECISIONS'),
  STATE_OF_PROJECT: path.join(BASE_DIRS.AIWF, '10_STATE_OF_PROJECT'),
  PROMPTS: path.join(BASE_DIRS.AIWF, '98_PROMPTS'),
  TEMPLATES: path.join(BASE_DIRS.AIWF, '99_TEMPLATES'),
  CACHE: path.join(BASE_DIRS.AIWF, 'cache'),
  METRICS: path.join(BASE_DIRS.AIWF, 'metrics'),
  CONFIG: path.join(BASE_DIRS.AIWF, 'config'),
  PERSONAS: path.join(BASE_DIRS.AIWF, 'personas'),
  AI_TOOLS: path.join(BASE_DIRS.AIWF, 'ai-tools'),
  CONTEXT_CACHE: path.join(BASE_DIRS.AIWF, 'cache', 'context')
};

// Tool-specific directories
export const TOOL_DIRS = {
  CLAUDE_COMMANDS: path.join(BASE_DIRS.CLAUDE, 'commands', 'aiwf'),
  CLAUDE_AGENTS: path.join(BASE_DIRS.CLAUDE, 'agents'),
  GEMINI_PROMPTS: path.join(BASE_DIRS.GEMINI, 'prompts', 'aiwf'),
  CURSOR_RULES: path.join(BASE_DIRS.CURSOR, 'rules'),
  WINDSURF_RULES: path.join(BASE_DIRS.WINDSURF, 'rules')
};

// Files
export const FILES = {
  INSTALLED_FLAG: path.join(AIWF_DIRS.ROOT, 'installed.flag'),
  PROJECT_MANIFEST: path.join(AIWF_DIRS.ROOT, '00_PROJECT_MANIFEST.md'),
  LANGUAGE_CONFIG: path.join(AIWF_DIRS.CONFIG, 'language.json'),
  CLAUDE_MD: {
    ROOT: path.join(AIWF_DIRS.ROOT, 'CLAUDE.md'),
    REQUIREMENTS: path.join(AIWF_DIRS.REQUIREMENTS, 'CLAUDE.md'),
    SPRINTS: path.join(AIWF_DIRS.SPRINTS, 'CLAUDE.md'),
    GENERAL_TASKS: path.join(AIWF_DIRS.GENERAL_TASKS, 'CLAUDE.md')
  }
};

// Temporary directories
export const TEMP_DIRS = {
  RULES_GLOBAL: path.join(AIWF_DIRS.ROOT, '_tmp_rules_global'),
  RULES_MANUAL: path.join(AIWF_DIRS.ROOT, '_tmp_rules_manual')
};

// User cache directory (for global cache)
export const USER_CACHE_DIR = path.join(
  os.homedir(),
  BASE_DIRS.AIWF,
  'cache'
);

// Get all AIWF directories as array
export function getAllAiwfDirectories() {
  return [
    AIWF_DIRS.ROOT,
    AIWF_DIRS.PROJECT_DOCS,
    AIWF_DIRS.REQUIREMENTS,
    AIWF_DIRS.SPRINTS,
    AIWF_DIRS.GENERAL_TASKS,
    AIWF_DIRS.ARCHITECTURE_DECISIONS,
    AIWF_DIRS.STATE_OF_PROJECT,
    AIWF_DIRS.PROMPTS,
    AIWF_DIRS.TEMPLATES
  ];
}

// Get all CLAUDE.md files as array
export function getAllClaudeMdFiles() {
  return Object.values(FILES.CLAUDE_MD);
}

// Get tool directory by name
export function getToolDirectory(tool) {
  const mapping = {
    claudeCode: TOOL_DIRS.CLAUDE_COMMANDS,
    'claude-code': TOOL_DIRS.CLAUDE_COMMANDS,
    geminiCLI: TOOL_DIRS.GEMINI_PROMPTS,
    'gemini-cli': TOOL_DIRS.GEMINI_PROMPTS,
    cursor: TOOL_DIRS.CURSOR_RULES,
    windsurf: TOOL_DIRS.WINDSURF_RULES,
    aiwf: AIWF_DIRS.ROOT
  };
  return mapping[tool] || null;
}

// Get backup directory name with timestamp
export function getBackupDirName() {
  const now = new Date();
  const pad = n => n.toString().padStart(2, '0');
  const y = now.getFullYear();
  const m = pad(now.getMonth() + 1);
  const d = pad(now.getDate());
  const h = pad(now.getHours());
  const min = pad(now.getMinutes());
  const s = pad(now.getSeconds());
  return path.join(AIWF_DIRS.ROOT, `backup_${y}${m}${d}_${h}${min}${s}`);
}

// Export all for convenience
export default {
  BASE_DIRS,
  AIWF_DIRS,
  TOOL_DIRS,
  FILES,
  TEMP_DIRS,
  USER_CACHE_DIR,
  getAllAiwfDirectories,
  getAllClaudeMdFiles,
  getToolDirectory,
  getBackupDirName
};