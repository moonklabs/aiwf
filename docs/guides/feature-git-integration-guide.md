[Read in Korean (한국어로 보기)](feature-git-integration-guide-ko.md)

# Feature-Git Integration Setup Guide

## Overview

The Feature-Git integration system is a tool that automatically connects AIWF's Feature Ledger with Git commits to track and manage feature development progress. It automates project management through commit message parsing, automatic status updates, and progress tracking.

## Key Features

### 1. Automatic Feature Tracking
- Automatic connection between Git commits and Feature IDs
- Extract Feature information from commit messages
- Automatic Feature status updates

### 2. Pre-commit Hook
- Validate Feature ID before commit
- Check commit message format
- Automatic Feature Ledger updates

### 3. Progress Management
- Calculate progress based on commit count
- Track contribution by Feature
- Generate team productivity metrics

## Installation and Setup

### 1. Basic Installation

**Automatic Installation (Recommended)**:
```bash
/project:aiwf:install_git_hooks
# or
/프로젝트:aiwf:git_훅_설치
```

**Manual Installation**:
```bash
# Navigate to Git hooks directory
cd .git/hooks

# Create Pre-commit hook
cat > pre-commit << 'EOF'
#!/bin/bash
# AIWF Feature-Git Integration Hook

# Commit message file path
COMMIT_MSG_FILE="$1"

# Execute AIWF commit validation
node .aiwf/scripts/validate-commit.js "$COMMIT_MSG_FILE"

# Return validation result
exit $?
EOF

# Grant execution permission
chmod +x pre-commit
```

### 2. Configuration File Setup

`.aiwf/config/git-integration.json`:
```json
{
  "featureGitIntegration": {
    "enabled": true,
    "autoLinkCommits": true,
    "updateFeatureStatus": true,
    "commitMessagePattern": "^(feat|fix|docs|style|refactor|test|chore)\\(([A-Z]\\d{3})\\): .+$",
    "featureIdPattern": "[A-Z]\\d{3}",
    "hooks": {
      "preCommit": true,
      "postCommit": true,
      "prePush": false
    },
    "statusMapping": {
      "feat": "in_progress",
      "fix": "in_progress",
      "docs": "in_progress",
      "test": "testing",
      "chore": "in_progress",
      "refactor": "in_progress",
      "style": "in_progress"
    }
  }
}
```

### 3. Feature Ledger Initialization

```bash
/project:aiwf:init_feature_ledger
# or
/프로젝트:aiwf:기능_원장_초기화
```

## Commit Message Format

### Basic Format
```
<type>(<feature-id>): <description>

[optional body]

[optional footer]
```

### Type Categories
- `feat`: Add new feature
- `fix`: Fix bug
- `docs`: Modify documentation
- `style`: Code formatting, missing semicolons, etc.
- `refactor`: Code refactoring
- `test`: Add or modify tests
- `chore`: Build process or auxiliary tool changes

### Feature ID Format
- Format: `[A-Z][0-9]{3}` (e.g., F001, B023, T456)
- Customizable per project

### Examples

**Basic commit**:
```bash
git commit -m "feat(F001): Implement user authentication system"
```

**With detailed description**:
```bash
git commit -m "fix(B023): Resolve session persistence issue on login

- Fixed session timeout settings
- Added cookie domain configuration
- Improved refresh token logic"
```

**Multiple Feature references**:
```bash
git commit -m "refactor(F001,F002): Integrate authentication modules

Integrated login logic from F001 and permission system from F002
to eliminate code duplication and improve maintainability."
```

## link_feature_commit Command

### Basic Usage
```bash
/project:aiwf:link_feature_commit <commit-hash> <feature-id>
# or
/프로젝트:aiwf:기능_커밋_연결 <커밋해시> <기능ID>
```

### Examples
```bash
# Link specific commit to Feature
/project:aiwf:link_feature_commit abc123def F001

# Link recent commit
/project:aiwf:link_feature_commit HEAD F002

# Link range of commits
/project:aiwf:link_feature_commit abc123..def456 F003
```

### Batch Linking
```bash
# Link multiple commits at once
/project:aiwf:link_feature_commits --batch
"abc123 -> F001
 def456 -> F002
 ghi789 -> F003"
```

## Automatic Feature Status Updates

### Status Transition Rules

1. **First commit**: `planned` → `in_progress`
2. **Test type commit**: → `testing`
3. **Fix followed by test pass**: → `ready_for_review`
4. **PR merge**: → `completed`

### Custom Rule Configuration
```json
{
  "stateTransitions": {
    "planned": {
      "feat": "in_progress",
      "fix": "in_progress"
    },
    "in_progress": {
      "test": "testing",
      "docs": "documenting"
    },
    "testing": {
      "fix": "in_progress",
      "feat": "ready_for_review"
    }
  }
}
```

## Advanced Configuration

### 1. Commit Message Template

Create `.gitmessage` file:
```
# <type>(<feature-id>): <subject>
# 
# <body>
# 
# Feature: <feature-description>
# Related: <related-features>
# Closes: <issue-numbers>
```

Git configuration:
```bash
git config commit.template .gitmessage
```

### 2. Automatic Feature ID Suggestion

```bash
# Extract Feature ID from current branch name
/project:aiwf:suggest_feature_id
```

### 3. Post-commit Automation

`.aiwf/hooks/post-commit`:
```bash
#!/bin/bash
# Update Feature Ledger
node .aiwf/scripts/update-feature-ledger.js

# Calculate progress
node .aiwf/scripts/calculate-progress.js

# Notify team (optional)
# node .aiwf/scripts/notify-team.js
```

## Workflow Integration

### 1. Branch Strategy Integration

**Feature Branch Creation**:
```bash
# Create branch with Feature ID
git checkout -b feature/F001-user-authentication

# AIWF automatically recognizes Feature ID
```

**Branch Rules**:
- `feature/[FEATURE-ID]-description`
- `bugfix/[BUG-ID]-description`
- `hotfix/[HOTFIX-ID]-description`

### 2. PR/MR Integration

**PR Template** (`.github/pull_request_template.md`):
```markdown
## Feature ID: [FEATURE-ID]

### Changes
- [ ] Feature implementation completed
- [ ] Tests written and completed
- [ ] Documentation updated

### Feature Ledger Update
- Current status: `in_progress`
- Target status: `completed`
- Progress: X%

### Related Commits
- commit1: description
- commit2: description
```

### 3. CI/CD Pipeline Integration

**GitHub Actions Example**:
```yaml
name: AIWF Feature Tracking

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  feature-tracking:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Validate Commit Message
      run: |
        node .aiwf/scripts/validate-commit.js ${{ github.event.head_commit.message }}
    
    - name: Update Feature Ledger
      run: |
        node .aiwf/scripts/update-feature-ledger.js \
          --commit ${{ github.sha }} \
          --message "${{ github.event.head_commit.message }}"
    
    - name: Calculate Progress
      run: |
        node .aiwf/scripts/calculate-progress.js
    
    - name: Generate Report
      run: |
        node .aiwf/scripts/generate-feature-report.js
```

## Reports and Analytics

### 1. Feature Progress Report

```bash
/project:aiwf:feature_report
# or
/프로젝트:aiwf:기능_보고서
```

**Example Output**:
```
Feature Progress Report
=======================

Active Features:
- F001: User Authentication (75% complete)
  - 12 commits, 3 contributors
  - Status: testing
  - Last update: 2 hours ago

- F002: Payment Integration (45% complete)
  - 8 commits, 2 contributors
  - Status: in_progress
  - Last update: 1 day ago

Completed Features (Last 7 days):
- F003: Dashboard UI (100% complete)
- F004: API Documentation (100% complete)

Team Velocity: 4.5 features/week
```

### 2. Commit Analysis

```bash
/project:aiwf:analyze_commits --period 7d
```

**Analysis Content**:
- Commit frequency
- Commit distribution by Feature
- Contribution by developer
- Activity patterns by time

## Troubleshooting

### 1. Hook Not Working

**Check Items**:
```bash
# Check if hook file exists
ls -la .git/hooks/pre-commit

# Check execution permission
test -x .git/hooks/pre-commit && echo "Executable" || echo "Not executable"

# Check hook content
cat .git/hooks/pre-commit
```

**Solutions**:
```bash
# Reset permissions
chmod +x .git/hooks/pre-commit

# Reinstall hook
/project:aiwf:reinstall_hooks
```

### 2. Feature ID Recognition Failure

**Symptoms**: Commit succeeds but Feature is not updated

**Solutions**:
1. Check commit message format
2. Check Feature ID pattern configuration
3. Check Feature Ledger file permissions

### 3. Status Update Errors

**Check Logs**:
```bash
tail -f .aiwf/logs/git-integration.log
```

**Manual Update**:
```bash
/project:aiwf:update_feature_status F001 in_progress
```

## Best Practices

### 1. Consistent Commit Messages
- Use the same format across the entire team
- Always include Feature ID
- Write clear and descriptive messages

### 2. Small Unit Commits
- One commit for one logical change
- Easy to review and track
- Easy to rollback when issues occur

### 3. Regular Synchronization
```bash
# Daily Feature Ledger synchronization
/project:aiwf:sync_features

# Weekly report generation
/project:aiwf:weekly_feature_report
```

### 4. Branch and Feature Mapping
- Include Feature ID in branch names
- Specify Feature ID in PR titles
- Maintain Feature ID in merge commits

## Team Collaboration Scenarios

### 1. Starting New Feature
```bash
# 1. Create Feature
/project:aiwf:create_feature "User Profile Feature"
# Returns: F005 created

# 2. Create Branch
git checkout -b feature/F005-user-profile

# 3. First Commit
git commit -m "feat(F005): Create basic user profile structure"
```

### 2. Collaborative Development
```bash
# Developer A
git commit -m "feat(F005): Implement profile image upload"

# Developer B
git commit -m "test(F005): Add profile upload tests"

# Check progress
/project:aiwf:feature_status F005
```

### 3. Completion and Merge
```bash
# When creating PR
# Title: "feat(F005): Complete user profile feature"

# After merge, automatically
# - Feature status → completed
# - Progress → 100%
# - Completion time recorded
```

## Conclusion

The Feature-Git integration system effectively combines development processes with project management. Through automated tracking and reporting capabilities, it improves team productivity and enables real-time monitoring of project progress.

We encourage you to continuously improve and optimize your workflow through ongoing use and team feedback.