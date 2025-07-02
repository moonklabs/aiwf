# AIWF Language Switch

A command that allows users to change the language settings of the AIWF framework.

## Usage

This command is used in the following cases:
- When you want to change the current language setting to another language
- When you want to check the current language setting status
- When you want to resolve language detection issues

## Parameters

- `<language_code>` (optional): Language to switch to (`ko` or `en`)
- Running without parameters displays the current language status

## Execution Steps

### 1. Check Current Language Status

First, check the current language configuration status:

```bash
node -e "
import('./language-utils.js').then(async ({ getLanguageStatus }) => {
  const status = await getLanguageStatus();
  console.log('=== AIWF Language Settings Status ===');
  console.log('Detected language:', status.detectedLanguage);
  console.log('Configured language:', status.configuredLanguage || 'None');
  console.log('Effective language:', status.effectiveLanguage);
  console.log('Auto detection:', status.autoDetect ? 'Enabled' : 'Disabled');
  console.log('Fallback language:', status.fallbackLanguage);
  console.log('Config file path:', status.configPath);
  if (status.error) console.log('Error:', status.error);
});
"
```

### 2. Argument Analysis

Check the `<$ARGUMENTS>` value and perform one of the following:

- **No arguments**: Display current status only and exit
- **Valid language code (`ko` or `en`)**: Switch to that language
- **Invalid argument**: Display error message and usage guide

### 3. Execute Language Switch

If a valid language code is provided, switch the language:

```bash
node -e "
import('./language-utils.js').then(async ({ switchLanguage }) => {
  const targetLanguage = process.argv[1];
  const result = await switchLanguage(targetLanguage);
  
  if (result.success) {
    console.log('✅ Language switch successful!');
    console.log('Previous language:', result.previousLanguage);
    console.log('New language:', result.newLanguage);
    console.log('Message:', result.message);
  } else {
    console.error('❌ Language switch failed:', result.error);
    console.log('Message:', result.message);
  }
});
" -- $ARGUMENTS
```

### 4. Post-Switch Validation

Verify that the settings are properly applied after the language switch:

```bash
node -e "
import('./language-utils.js').then(async ({ getLanguageStatus }) => {
  const status = await getLanguageStatus();
  console.log('\n=== Post-Switch Language Settings Status ===');
  console.log('Current language:', status.effectiveLanguage);
  console.log('Config file:', status.configuredLanguage ? 'Saved' : 'None');
});
"
```

### 5. Command Path Testing

Test if command paths are properly resolved with the new language:

```bash
node -e "
import('./language-utils.js').then(async ({ resolveCommandPath, detectLanguage }) => {
  const currentLang = await detectLanguage();
  const testCommands = ['aiwf_do_task', 'aiwf_commit', 'aiwf_initialize'];
  
  console.log('\n=== Command Path Testing ===');
  console.log('Current language:', currentLang);
  
  for (const cmd of testCommands) {
    const result = await resolveCommandPath(cmd);
    if (result.path) {
      console.log('✅', cmd, '->', result.path, result.fallback ? '(fallback)' : '(direct)');
    } else {
      console.log('❌', cmd, '-> Not found:', result.error);
    }
  }
});
"
```

## Output Format

### Successful Language Switch
```
✅ Language switch successful!
Previous language: en
New language: ko
Message: Language changed successfully

=== Post-Switch Language Settings Status ===
Current language: ko
Config file: Saved

=== Command Path Testing ===
Current language: ko
✅ aiwf_do_task -> claude-code/aiwf/ko/.claude/commands/aiwf/aiwf_do_task.md (direct)
✅ aiwf_commit -> claude-code/aiwf/ko/.claude/commands/aiwf/aiwf_commit.md (direct)
✅ aiwf_initialize -> claude-code/aiwf/ko/.claude/commands/aiwf/aiwf_initialize.md (direct)
```

### Status Check Only
```
=== AIWF Language Settings Status ===
Detected language: ko
Configured language: ko
Effective language: ko
Auto detection: Enabled
Fallback language: en
Config file path: .aiwf/config/language.json
```

### Error Occurred
```
❌ Language switch failed: Language not supported
Message: Failed to change language

Usage: /project:aiwf:switch_language [ko|en]
Supported languages: ko (Korean), en (English)
```

## Important Notes

1. **Config File Permissions**: Write permissions are required for the `.aiwf/config/` directory
2. **Command File Existence**: Command files for the target language must exist
3. **Project Root**: Can only be used in projects where AIWF has been initialized

## Related Commands

- `/project:aiwf:initialize` - Initialize AIWF project
- `/project:aiwf:update_docs` - Update documentation (language-specific)
- `/project:aiwf:help` - Help (displayed in current language)