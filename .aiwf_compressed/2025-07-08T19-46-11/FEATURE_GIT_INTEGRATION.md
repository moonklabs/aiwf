# Feature Git Integration Specification
This document defines how Features integrate with Git version control in AIWF.

### Core Git Fields in Feature YAML
```yaml

# Git branch information
git_branch: string  # Associated feature branch
git_base_branch: string  # Base branch (usually main/master)

# Commit tracking
git_commits: [  # List of related commits
  {
   hash: string,  # Commit SHA
   message: string,  # Commit message
   author: string,  # Author email
   date: YYYY-MM-DD HH:MM,  # Commit timestamp
   files_changed: integer,  # Number of files changed
   insertions: integer,  # Lines added
   deletions: integer  # Lines deleted
  }
]

# Pull request tracking
pull_requests: [  # Associated PRs
  {
   number: integer,  # PR number
   title: string,  # PR title
   status: string,  # open | merged | closed
   url: string,  # Full PR URL
   created_at: timestamp,  # PR creation time
   merged_at: timestamp,  # PR merge time (if merged)
   reviewers: [string],  # List of reviewers
   labels: [string]  # PR labels
  }
]

# Code metrics
code_metrics: {
  total_commits: integer,  # Total number of commits
  total_lines_added: integer,  # Total insertions
  total_lines_removed: integer, # Total deletions
  files_impacted: integer,  # Unique files changed
  first_commit: timestamp,  # First commit timestamp
  last_commit: timestamp  # Most recent commit
}
```

### 1. Feature Branch Creation
When creating a new feature:

```bash

# Create feature in AIWF
/project:aiwf:create_feature_ledger "User Authentication"

# Create Git branch
git checkout -b feature/FL001-user-authentication

# Link branch to feature
/project:aiwf:link_feature_branch FL001
```

#### Automatic Commit Linking
Commits mentioning the feature ID are automatically linked:

git commit -m "feat(FL001): implement JWT token generation"
git commit -m "[FL001] add password hashing"
git commit -m "FL001 - configure auth middleware"
```

#### Manual Commit Linking
/project:aiwf:link_feature_commit FL001 abc123def
```

# Create PR with feature reference
gh pr create --title "[FL001] User Authentication Implementation" \
  --body "Implements feature FL001: User Authentication System"

# Auto-links to feature when title/body contains FL### pattern
```

# Sync PR status to feature
/project:aiwf:sync_feature_pr FL001
```

### Feature ID Detection Patterns
The following patterns in commit messages trigger auto-linking:

1. `FL###` - Direct reference
2. `[FL###]` - Bracketed reference
3. `(FL###)` - Parenthetical reference
4. `feat(FL###):` - Conventional commit format
5. `FL###:` - Prefix format
6. `#FL###` - Hash reference

# Good examples
git commit -m "feat(FL001): implement user registration endpoint"
git commit -m "[FL001] add email validation to registration"
git commit -m "fix(FL001): resolve token expiration bug"
git commit -m "test(FL001): add unit tests for auth service"
git commit -m "docs(FL001): update API documentation for auth endpoints"

# Conventional commit types for features
feat(FL###):  # New feature implementation
fix(FL###):  # Bug fixes in feature
test(FL###):  # Tests for feature
docs(FL###):  # Documentation for feature
refactor(FL###): # Code refactoring
perf(FL###):  # Performance improvements
style(FL###):  # Code style changes
```

# Check if commits reference a feature
feature_id=$(git diff --cached --name-only | xargs grep -l "FL[0-9]\{3\}" | head -1)

if [ -n "$feature_id" ]; then
   echo "Feature reference detected. Updating feature ledger..."
   /project:aiwf:update_feature_activity "$feature_id"
fi
```

# Extract feature ID from commit message
commit_msg=$(git log -1 --pretty=%B)
feature_id=$(echo "$commit_msg" | grep -o "FL[0-9]\{3\}" | head -1)

   # Link commit to feature
   commit_hash=$(git rev-parse HEAD)
   /project:aiwf:link_feature_commit "$feature_id" "$commit_hash"
```

# Update feature status when PR is merged
branch_name=$(git rev-parse --abbrev-ref HEAD)
if [[ "$branch_name" == "main" || "$branch_name" == "master" ]]; then
   # Extract feature ID from merged branch
   merged_branch=$(git reflog -1 | grep -o "feature/FL[0-9]\{3\}[^[:space:]]*")
   if [ -n "$merged_branch" ]; then
   feature_id=$(echo "$merged_branch" | grep -o "FL[0-9]\{3\}")
   /project:aiwf:update_feature_status "$feature_id" "completed"
```

### Link Current Branch to Feature
```

### Import Commit History
/project:aiwf:import_feature_commits FL001 --since="2025-07-01"
```

### Generate Feature Changelog
/project:aiwf:feature_changelog FL001
```

Output:
```markdown

## Commits (15 total)
- abc123d feat(FL001): implement JWT token generation (2025-07-08)
- def456e [FL001] add password hashing (2025-07-09)
- ghi789f fix(FL001): resolve token expiration bug (2025-07-10)

## Pull Requests (2 total)
- PR #42: [FL001] User Authentication Implementation (merged)
- PR #45: [FL001] Fix token validation (open)

## Code Impact
- Files changed: 23
- Lines added: 1,245
- Lines removed: 89
- First commit: 2025-07-08
- Last activity: 2025-07-10
```

### Feature Git Status
/project:aiwf:feature_git_status FL001
```

```
Feature: FL001 - User Authentication System
Branch: feature/FL001-user-authentication
Status: 5 commits ahead of main
Uncommitted changes: 2 files
Open PRs: 1
```

### 1. Branch Naming Convention
- Pattern: `feature/FL###-descriptive-name`
- Auto-created when feature is created
- Validated before commits

### 2. Commit Aggregation
- Commits are aggregated daily
- Metrics updated every 6 hours
- Full history preserved

### 3. PR Auto-Updates
- PR status synced on webhook
- Feature progress updated on merge
- Reviewers added to contributors

### 4. Completion Triggers
- Feature marked complete when PR merged to main
- Notification sent to stakeholders
- Metrics finalized

### Feature Velocity Metrics
- Average commits per feature
- Time from first commit to merge
- Code churn rate
- Review turnaround time

### Quality Metrics
- Test coverage delta
- Code review comments
- Bug fix ratio
- Refactoring frequency

### Team Metrics
- Commits per developer
- Review participation
- Feature ownership distribution
- Collaboration patterns

## Best Practices
1. *One Feature, One Branch*: Each feature should have dedicated branch
2. *Atomic Commits*: Make small, focused commits with clear messages
3. *Reference Features*: Always include feature ID in commit messages
4. *Regular Sync*: Run sync commands after significant changes
5. *Clean History*: Squash commits before merging for clarity

### Common Issues
1. *Missing Commits*: Run import command to catch up
2. *Broken Links*: Use repair command to fix references
3. *Orphaned Branches*: Clean up after feature completion
4. *Sync Delays*: Check webhook configuration

# Repair feature-git links
/project:aiwf:repair_feature_git FL001

# Resync all features
/project:aiwf:resync_all_features

# Clean orphaned branches
/project:aiwf:clean_feature_branches
```