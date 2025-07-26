# State Validation - Workflow Consistency and Dependency Check

Validate project state consistency and detect workflow rule violations.

## Overview

This command validates:
- Sprint-task state consistency
- Task dependencies and circular references
- Workflow rule compliance
- 80% rule and transition conditions

## Execution Process

### 1. Run State Validation

```bash
# Execute workflow validation
aiwf state validate
```

### 2. Validation Items

#### State Consistency
- Check completed sprints have no incomplete tasks
- Verify active milestones have active sprints
- Ensure task states match sprint states

#### Dependency Validation
- Detect circular dependencies
- Identify blocked tasks
- Check dependency chain length

#### Workflow Rules
- Verify sprint order rules
- Validate task transition conditions
- Check 80% completion sprint preparation

### 3. Result Interpretation

#### Errors
Issues requiring immediate fixes:
- **INCONSISTENT_STATE**: Sprint/task state mismatch
- **CIRCULAR_DEPENDENCY**: Circular dependency detected
- **INVALID_TRANSITION**: Invalid state transition

#### Warnings
Items needing attention:
- Stale in-progress tasks
- High dependency complexity
- Potential resource conflicts

#### Suggestions
Recommendations for improvement:
- **SPRINT_PREPARATION**: 80% complete, prepare next sprint
- Parallel work opportunities
- Priority adjustments needed

## Usage Examples

### Basic Validation
```bash
aiwf state validate
```

### Validate After State Update
```bash
# Run validation
aiwf state validate

# Update state if issues found
aiwf state update

# Validate again
aiwf state validate
```

## Output Examples

### Healthy State
```
🔍 Workflow Validation Report

✅ Workflow validation passed!
  No errors or warnings found.

📊 Workflow Statistics:
  Total Tasks: 25
  Active Sprints: 1
  Overall Progress: 68%

🔗 Dependency Analysis:
  Tasks with dependencies: 12
  Currently blocked tasks: 0
  Circular dependencies: 0
```

### Issues Found
```
🔍 Workflow Validation Report

Found 3 issue(s):

❌ Errors (1):
  1. INCONSISTENT_STATE
     Sprint S02 marked complete but has 2 incomplete tasks
     Affected tasks: T05_S02, T07_S02

⚠️  Warnings (1):
  1. STALE_TASK
     Task T03_S01 in progress for over 7 days

💡 Suggestions (1):
  1. SPRINT_PREPARATION
     Sprint S02 is 85% complete. Consider preparing the next sprint.

🎯 Recommended Actions:
  1. Fix inconsistent sprint/task states
     - Update task statuses to match sprint status
     - Or reopen completed sprints if needed
  2. Review stale tasks
     - Check if T03_S01 is actually being worked on
     - Consider reassigning or breaking down
```

## Troubleshooting Guide

### Resolving State Inconsistencies
```bash
# Check task states
aiwf state show

# Complete individual tasks
aiwf state complete T05_S02
aiwf state complete T07_S02

# Or modify sprint state
# (Edit sprint meta file directly)
```

### Resolving Circular Dependencies
1. Identify tasks in circular relationship
2. Review and restructure dependencies
3. Edit dependency sections in task files
4. Update state and re-validate

### Handling 80% Rule
```bash
# Prepare next sprint
/aiwf:create_sprint_tasks S03

# Accelerate current sprint completion
/aiwf:next_action
```

## Automation Usage

### CI/CD Integration
```yaml
# GitHub Actions example
- name: Validate AIWF Workflow
  run: |
    npm install -g aiwf
    aiwf state validate
```

### Pre-commit Hook
```bash
#!/bin/bash
# .git/hooks/pre-commit
aiwf state validate || {
  echo "Workflow validation failed. Fix issues before committing."
  exit 1
}
```

## Important Notes

- Validation is based on current state index
- May not be synchronized with file system
- Recommend running `aiwf state update` before validation
- No automatic fixes provided (manual intervention required)