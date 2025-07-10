# Link Feature to Milestone

Link a Feature Ledger to a milestone and sprint.

```bash
cd .aiwf && node ../claude-code/aiwf/en/commands/feature-ledger.js link-milestone "$@"
```

## Description

Link a Feature to a specific milestone and sprint to synchronize with project planning.

### 🎯 Link Options
- Milestone link (required)
- Sprint link (optional)
- Task link (optional)
- Automatic priority adjustment

### 📝 Usage
```bash
# Link to milestone only
/project:aiwf:link_feature_to_milestone FL001 M02

# Link to milestone and sprint
/project:aiwf:link_feature_to_milestone FL001 M02 --sprint=S01_M02

# Link to task as well
/project:aiwf:link_feature_to_milestone FL001 M02 --sprint=S01_M02 --task=TX01_S01

# Interactive mode
/project:aiwf:link_feature_to_milestone
```

### 🔄 Automatic Updates
- Add milestone information to Feature file
- Add Feature reference to milestone file
- Update sprint metadata
- Synchronize priorities

## Example Output
```
✅ Feature-Milestone link completed
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Feature: FL001 - User Authentication System
Milestone: M02 - Context Engineering Enhancement
Sprint: S01_M02 - context_foundation

📊 Link Results:
- Feature file updated ✓
- Milestone reference added ✓
- Sprint meta updated ✓

🔗 Related Files:
- .aiwf/06_FEATURE_LEDGERS/active/FL001_user_authentication.md
- .aiwf/02_REQUIREMENTS/M02_Context_Engineering_Enhancement/M02_milestone_meta.md
- .aiwf/03_SPRINTS/S01_M02_context_foundation/S01_M02_sprint_meta.md
```