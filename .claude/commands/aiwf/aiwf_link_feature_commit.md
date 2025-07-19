# Link Feature Commit

Manually link a Git commit to a Feature in the Feature Ledger.

## Command Usage

```bash
/project:aiwf:link_feature_commit <feature-id> <commit-hash>
```

## Parameters

- `feature-id`: The Feature ID (e.g., FL001)
- `commit-hash`: The Git commit hash to link (full or short hash)

## What It Does

1. Retrieves commit information (message, author, date, stats)
2. Links the commit to the specified feature
3. Updates feature status if needed (planned → active)
4. Records the commit in the feature's git_commits array

## Examples

```bash
# Link a specific commit to feature FL001
/project:aiwf:link_feature_commit FL001 abc123def

# Link the latest commit
/project:aiwf:link_feature_commit FL002 HEAD
```

## Implementation

Execute the following command:

```bash
node .aiwf/scripts/git-integration.cjs link-commit {{FEATURE_ID}} {{COMMIT_HASH}}
```

## Notes

- The commit must exist in the current repository
- The feature file must exist in the Feature Ledgers
- Duplicate commits are automatically ignored
- Feature status automatically updates from 'planned' to 'active' on first commit