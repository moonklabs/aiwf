# Link Feature Branch

Link the current Git branch to a Feature in the Feature Ledger.

## Command Usage

```bash
/project:aiwf:link_feature_branch <feature-id>
```

## Parameters

- `feature-id`: The Feature ID to link the current branch to (e.g., FL001)

## What It Does

1. Gets the current Git branch name
2. Updates the feature's git_branch field
3. Establishes the branch-feature relationship

## Examples

```bash
# On branch feature/FL001-user-auth
/project:aiwf:link_feature_branch FL001

# Creates the link between current branch and feature
```

## Implementation

Execute the following command:

```bash
node .aiwf/scripts/git-integration.cjs link-branch {{FEATURE_ID}}
```

## Notes

- Must be run from within a Git repository
- The current branch will be linked to the feature
- Overwrites any existing branch link
- Useful when branch naming doesn't follow the FL### pattern