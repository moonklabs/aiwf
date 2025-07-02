# AIWF Language Manager

A command that provides integrated management of language-related functions in the AIWF framework.

## Usage

```
/project:aiwf:language_manager [action] [arguments]
```

### Action Types

- `status` - Check current language status
- `switch <language_code>` - Switch language  
- `detect` - Auto-detect system language
- `reset` - Reset language settings
- `test` - Test language system
- `config` - Manage configuration file

## Execution Steps

### 1. Argument Analysis and Action Routing

```bash
# Parse arguments
ACTION="${1:-status}"
ARGUMENT="${2:-}"

echo "=== AIWF Language Manager ==="
echo "Action: $ACTION"
echo "Argument: $ARGUMENT"
echo ""
```

### 2. Action-Specific Execution

#### 2.1 Status Check (status)

```bash
if [ "$ACTION" = "status" ]; then
  echo "📊 Checking language status..."
  node -e "
  import('./language-utils.js').then(async ({ getLanguageStatus }) => {
    const status = await getLanguageStatus();
    
    console.log('=== Language Settings Status ===');
    console.log('Detected language:', status.detectedLanguage);
    console.log('Configured language:', status.configuredLanguage || 'None');
    console.log('Effective language:', status.effectiveLanguage);
    console.log('Auto detection:', status.autoDetect ? 'Enabled' : 'Disabled');
    console.log('Fallback language:', status.fallbackLanguage);
    console.log('Supported languages:', status.supportedLanguages.join(', '));
    
    if (status.error) {
      console.log('⚠️ Error:', status.error);
    }
  });
  "
fi
```

#### 2.2 Language Switch (switch)

```bash
if [ "$ACTION" = "switch" ]; then
  if [ -z "$ARGUMENT" ]; then
    echo "❌ Error: Please specify a language code"
    echo "Usage: /project:aiwf:language_manager switch [ko|en]"
    exit 1
  fi
  
  echo "🔄 Switching language to: $ARGUMENT"
  node -e "
  import('./language-utils.js').then(async ({ switchLanguage }) => {
    const result = await switchLanguage(process.argv[1]);
    
    if (result.success) {
      console.log('✅ Language switch successful!');
      console.log('Previous language:', result.previousLanguage);
      console.log('New language:', result.newLanguage);
    } else {
      console.error('❌ Language switch failed:', result.error);
      process.exit(1);
    }
  });
  " -- "$ARGUMENT"
fi
```

#### 2.3 Language Detection (detect)

```bash
if [ "$ACTION" = "detect" ]; then
  echo "🔍 Detecting system language..."
  node -e "
  import('./language-utils.js').then(async ({ detectLanguage }) => {
    const detected = await detectLanguage();
    
    console.log('=== Language Detection Results ===');
    console.log('Detected language:', detected);
    console.log('');
    console.log('Environment variables:');
    console.log('  LANG:', process.env.LANG || 'Not set');
    console.log('  LC_ALL:', process.env.LC_ALL || 'Not set');
    console.log('  LANGUAGE:', process.env.LANGUAGE || 'Not set');
  });
  "
fi
```

#### 2.4 Settings Reset (reset)

```bash
if [ "$ACTION" = "reset" ]; then
  echo "🗑️ Resetting language settings..."
  
  # Delete configuration file
  if [ -f ".aiwf/config/language.json" ]; then
    rm ".aiwf/config/language.json"
    echo "✅ Language configuration file has been deleted"
  else
    echo "ℹ️ Language configuration file does not exist"
  fi
  
  # Perform re-detection
  echo "🔄 Re-detecting language..."
  node -e "
  import('./language-utils.js').then(async ({ detectLanguage }) => {
    const detected = await detectLanguage();
    console.log('Re-detected language:', detected);
  });
  "
fi
```

#### 2.5 System Test (test)

```bash
if [ "$ACTION" = "test" ]; then
  echo "🧪 Testing language system..."
  node -e "
  import('./language-utils.js').then(async (utils) => {
    const { resolveCommandPath, detectLanguage, getLocalizedMessage } = utils;
    
    console.log('=== Language System Test ===');
    
    // 1. Language detection test
    const detected = await detectLanguage();
    console.log('✅ Language detection:', detected);
    
    // 2. Command path resolution test
    const testCommands = ['aiwf_do_task', 'aiwf_commit'];
    console.log('\n📁 Command path test:');
    
    for (const cmd of testCommands) {
      const result = await resolveCommandPath(cmd);
      if (result.path) {
        console.log('  ✅', cmd, result.fallback ? '(fallback)' : '(direct)');
      } else {
        console.log('  ❌', cmd, 'failed');
      }
    }
    
    // 3. Message system test
    console.log('\n💬 Message system test:');
    const testMsg = getLocalizedMessage('LANGUAGE_NOT_SUPPORTED', detected);
    console.log('  Message:', testMsg);
    
    console.log('\n✅ All tests completed');
  });
  "
fi
```

#### 2.6 Configuration Management (config)

```bash
if [ "$ACTION" = "config" ]; then
  echo "⚙️ Language configuration file management"
  
  CONFIG_FILE=".aiwf/config/language.json"
  
  if [ -f "$CONFIG_FILE" ]; then
    echo "📄 Current configuration file contents:"
    cat "$CONFIG_FILE" | jq . 2>/dev/null || cat "$CONFIG_FILE"
    echo ""
    
    echo "📊 Configuration file info:"
    echo "  Location: $CONFIG_FILE"
    echo "  Size: $(stat -f%z "$CONFIG_FILE" 2>/dev/null || stat -c%s "$CONFIG_FILE" 2>/dev/null) bytes"
    echo "  Modified: $(stat -f%Sm "$CONFIG_FILE" 2>/dev/null || stat -c%y "$CONFIG_FILE" 2>/dev/null)"
  else
    echo "❌ Configuration file does not exist: $CONFIG_FILE"
    echo ""
    echo "💡 To create a configuration file, set a language:"
    echo "   /project:aiwf:language_manager switch ko"
    echo "   /project:aiwf:language_manager switch en"
  fi
fi
```

### 3. Help (default)

```bash
if [ "$ACTION" = "help" ] || [ "$ACTION" = "--help" ]; then
  echo "📖 AIWF Language Manager Help"
  echo ""
  echo "Usage:"
  echo "  /project:aiwf:language_manager [action] [arguments]"
  echo ""
  echo "Actions:"
  echo "  status          Check current language status"
  echo "  switch <lang>   Switch language (ko|en)"
  echo "  detect          Auto-detect system language"
  echo "  reset           Reset language settings"
  echo "  test            Test language system"
  echo "  config          Manage configuration file"
  echo "  help            Show this help"
  echo ""
  echo "Examples:"
  echo "  /project:aiwf:language_manager status"
  echo "  /project:aiwf:language_manager switch ko"
  echo "  /project:aiwf:language_manager test"
fi
```

### 4. Result Summary

```bash
echo ""
echo "=== Execution Complete ==="
echo "Action: $ACTION"
echo "Time: $(date '+%Y-%m-%d %H:%M:%S')"

# Simple current language status display
node -e "
import('./language-utils.js').then(async ({ detectLanguage }) => {
  const lang = await detectLanguage();
  console.log('Current language:', lang);
});
" 2>/dev/null || echo "Current language: Unable to detect"
```

## Output Examples

### Status Check
```
=== AIWF Language Manager ===
Action: status

📊 Checking language status...
=== Language Settings Status ===
Detected language: en
Configured language: en  
Effective language: en
Auto detection: Enabled
Fallback language: en
Supported languages: ko, en

=== Execution Complete ===
Action: status
Time: 2025-07-03 06:25:30
Current language: en
```

### Language Switch
```
=== AIWF Language Manager ===
Action: switch
Argument: ko

🔄 Switching language to: ko
✅ Language switch successful!
Previous language: en
New language: ko

=== Execution Complete ===
Action: switch
Time: 2025-07-03 06:25:35
Current language: ko
```

## Related Commands

- `/project:aiwf:switch_language` - Simple language switching
- `/project:aiwf:language_status` - Detailed status check
- `/project:aiwf:initialize` - AIWF initialization (includes language selection)