# AIWF Language Status Check

A command to check the detailed language configuration status of the AIWF framework.

## Usage

This command provides the following information:
- Currently detected system language
- User-configured language (if any)
- Actually used language
- Language configuration file status
- Command path resolution status

## Execution Process

### 1. Comprehensive Language Status Analysis

```bash
node -e "
import('./language-utils.js').then(async (utils) => {
  const { getLanguageStatus, resolveCommandPath, getLocalizedMessage } = utils;
  
  console.log('=== AIWF Language System Status Analysis ===\n');
  
  // Basic status information
  const status = await getLanguageStatus();
  
  console.log('📍 Basic Information:');
  console.log('  Detected language:', status.detectedLanguage);
  console.log('  Configured language:', status.configuredLanguage || 'None');
  console.log('  Effective language:', status.effectiveLanguage);
  console.log('  Auto detection:', status.autoDetect ? 'Enabled' : 'Disabled');
  console.log('  Fallback language:', status.fallbackLanguage);
  console.log('  Supported languages:', status.supportedLanguages.join(', '));
  console.log('  Config file:', status.configPath);
  
  if (status.error) {
    console.log('  ⚠️ Error:', status.error);
  }
  
  console.log('\n📂 Config File Status:');
  try {
    const fs = await import('fs/promises');
    const configExists = await fs.access(status.configPath).then(() => true).catch(() => false);
    
    if (configExists) {
      const configContent = await fs.readFile(status.configPath, 'utf8');
      const config = JSON.parse(configContent);
      console.log('  ✅ Config file exists');
      console.log('  📄 Contents:', JSON.stringify(config, null, 4));
    } else {
      console.log('  ❌ Config file not found');
    }
  } catch (error) {
    console.log('  ⚠️ Config file read error:', error.message);
  }
});
"
```

### 2. Environment Variables Analysis

```bash
node -e "
console.log('\n🌍 System Environment Variables:');
console.log('  LANG:', process.env.LANG || 'Not set');
console.log('  LC_ALL:', process.env.LC_ALL || 'Not set');
console.log('  LANGUAGE:', process.env.LANGUAGE || 'Not set');
console.log('  NODE_ENV:', process.env.NODE_ENV || 'Not set');
"
```

### 3. Command Path Testing

```bash
node -e "
import('./language-utils.js').then(async ({ resolveCommandPath, detectLanguage }) => {
  console.log('\n🔍 Command Path Resolution Testing:');
  
  const currentLang = await detectLanguage();
  console.log('  Current language:', currentLang);
  
  const testCommands = [
    'aiwf_do_task',
    'aiwf_commit', 
    'aiwf_initialize',
    'aiwf_switch_language',
    'aiwf_test',
    'aiwf_code_review',
    'aiwf_project_review'
  ];
  
  for (const cmd of testCommands) {
    const result = await resolveCommandPath(cmd);
    if (result.path) {
      const status = result.fallback ? '🔄 Fallback' : '✅ Direct';
      console.log('  ' + status, cmd + ':', result.language);
    } else {
      console.log('  ❌ Missing', cmd + ':', result.error);
    }
  }
});
"
```

### 4. Message System Testing

```bash
node -e "
import('./language-utils.js').then(async ({ getLocalizedMessage, detectLanguage }) => {
  console.log('\n💬 Multilingual Message System Testing:');
  
  const currentLang = await detectLanguage();
  console.log('  Current language:', currentLang);
  
  const testMessages = [
    'LANGUAGE_NOT_SUPPORTED',
    'CONFIG_LOAD_FAILED', 
    'CONFIG_SAVE_FAILED',
    'COMMAND_NOT_FOUND',
    'LANGUAGE_SWITCH_SUCCESS'
  ];
  
  for (const msgKey of testMessages) {
    const koMsg = getLocalizedMessage(msgKey, 'ko');
    const enMsg = getLocalizedMessage(msgKey, 'en');
    console.log('  ' + msgKey + ':');
    console.log('    Korean: ' + koMsg);
    console.log('    English: ' + enMsg);
  }
});
"
```

### 5. Directory Structure Check

```bash
node -e "
const fs = await import('fs/promises');
const path = await import('path');

console.log('\n📁 AIWF Directory Structure:');

const checkDirs = [
  '.aiwf',
  '.aiwf/config',
  '.claude',
  '.claude/commands',
  '.claude/commands/aiwf',
  'claude-code/aiwf/ko/.claude/commands/aiwf',
  'claude-code/aiwf/en/.claude/commands/aiwf'
];

for (const dir of checkDirs) {
  try {
    const exists = await fs.access(dir).then(() => true).catch(() => false);
    if (exists) {
      const files = await fs.readdir(dir);
      console.log('  ✅', dir + ':', files.length + ' files');
    } else {
      console.log('  ❌', dir + ':', 'Directory not found');
    }
  } catch (error) {
    console.log('  ⚠️', dir + ':', 'Access error');
  }
}
"
```

## Diagnostics and Recommendations

### Language Detection Problem Resolution

The command provides the following recommendations:

1. **When config file is missing**:
   ```
   💡 Recommendation: Explicitly set the language
   /project:aiwf:switch_language ko
   ```

2. **Environment variable issues**:
   ```
   💡 Recommendation: Check environment variables
   export LANG=en_US.UTF-8
   ```

3. **Missing command files**:
   ```
   💡 Recommendation: Reinstall AIWF
   npx aiwf --force
   ```

## Output Example

```
=== AIWF Language System Status Analysis ===

📍 Basic Information:
  Detected language: en
  Configured language: en
  Effective language: en
  Auto detection: Enabled
  Fallback language: en
  Supported languages: ko, en
  Config file: .aiwf/config/language.json

📂 Config File Status:
  ✅ Config file exists
  📄 Contents: {
      "language": "en",
      "auto_detect": true,
      "last_updated": "2025-07-03T06:25:00.000Z",
      "fallback": "en"
  }

🌍 System Environment Variables:
  LANG: en_US.UTF-8
  LC_ALL: Not set
  LANGUAGE: Not set
  NODE_ENV: Not set

🔍 Command Path Resolution Testing:
  Current language: en
  ✅ Direct aiwf_do_task: en
  ✅ Direct aiwf_commit: en
  ✅ Direct aiwf_initialize: en
  ✅ Direct aiwf_switch_language: en
  🔄 Fallback aiwf_test: ko
  ❌ Missing aiwf_unknown: Command file not found

💬 Multilingual Message System Testing:
  Current language: en
  LANGUAGE_NOT_SUPPORTED:
    Korean: 지원되지 않는 언어입니다
    English: Language not supported
  
📁 AIWF Directory Structure:
  ✅ .aiwf: 8 files
  ✅ .aiwf/config: 1 file
  ✅ .claude: 2 files
  ✅ .claude/commands: 1 file
  ❌ .claude/commands/aiwf: Directory not found
  ✅ claude-code/aiwf/ko/.claude/commands/aiwf: 15 files
  ✅ claude-code/aiwf/en/.claude/commands/aiwf: 14 files
```