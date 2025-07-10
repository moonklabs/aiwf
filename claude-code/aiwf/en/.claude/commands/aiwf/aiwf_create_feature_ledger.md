# Create Feature Ledger

Create a new Feature Ledger to track feature development.

```bash
cd .aiwf && node ../claude-code/aiwf/en/commands/feature-ledger.js create "$@"
```

## Description

Feature Ledger is a system for systematically tracking and managing each feature development in your project. Use this command when you start developing a new feature.

### 🎯 Key Features
- Automatic Feature ID assignment (FL001, FL002...)
- Standardized directory structure creation
- Automatic Feature index updates
- Git branch creation guidance

### 📝 Usage
```bash
# Interactive mode (recommended)
/project:aiwf:create_feature_ledger

# Direct name specification
/project:aiwf:create_feature_ledger user_authentication
/project:aiwf:create_feature_ledger "Dashboard Redesign"
```

### 📂 Creation Location
- `.aiwf/06_FEATURE_LEDGERS/active/FL###_feature_name.md`
- Automatic index file update

### ✅ Creation Process
1. Check next available Feature ID
2. Receive Feature metadata input
3. Create Feature file
4. Update index
5. Provide Git branch creation guidance

## Example Output
```
🎯 Feature Ledger created successfully!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Feature ID: FL001
Title: User Authentication System
Status: active
Priority: high
Category: feature

📁 File location: .aiwf/06_FEATURE_LEDGERS/active/FL001_user_authentication.md

💡 Next steps:
git checkout -b feature/FL001-user-authentication
```