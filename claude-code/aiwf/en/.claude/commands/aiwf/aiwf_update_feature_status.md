# Update Feature Status

Change the status of a Feature Ledger.

```bash
cd .aiwf && node ../claude-code/aiwf/en/commands/feature-ledger.js update-status "$@"
```

## Description

Update the development progress status of a Feature. Changes are only allowed according to state transition rules.

### 🎯 Supported States
- `active` - Currently in development
- `completed` - Development completed
- `paused` - Temporarily paused
- `archived` - Archived

### 📝 Usage
```bash
# Change status
/project:aiwf:update_feature_status FL001 completed
/project:aiwf:update_feature_status FL002 paused

# Interactive mode
/project:aiwf:update_feature_status
```

### ⚡ State Transition Rules
- active → completed, paused, archived
- paused → active, archived
- completed → archived
- archived → (no transitions allowed)

### 📋 Update Contents
- Status change record
- Automatic timestamp addition
- Reason for change (optional)
- Automatic index file update

## Example Output
```
✅ Feature status updated successfully
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Feature ID: FL001
Previous status: active → New status: completed
Update time: 2025-07-10 11:30:00

📊 Completion statistics:
- Duration: 5 days
- Commit count: 23
- Related PRs: #45, #47
```