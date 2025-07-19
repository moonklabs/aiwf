# Install Git Hooks

Install or manage AIWF Git hooks for automatic Feature-Git integration.

## Command Usage

```bash
# Install hooks
/project:aiwf:install_git_hooks

# Check status
/project:aiwf:install_git_hooks status

# Uninstall hooks
/project:aiwf:install_git_hooks uninstall
```

## What It Does

### Install (default)
1. Backs up existing Git hooks if present
2. Installs AIWF pre-commit hook
3. Installs AIWF post-commit hook
4. Installs AIWF post-merge hook

### Status
- Shows which hooks are installed
- Indicates if AIWF hooks or other hooks are active

### Uninstall
- Removes AIWF hooks
- Restores original hooks from backup if available

## Hooks Functionality

### Pre-commit Hook
- Scans staged files for Feature ID references
- Prepares for feature tracking

### Post-commit Hook
- Extracts Feature ID from commit message
- Automatically links commit to feature
- Updates feature status (planned → active)

### Post-merge Hook
- Detects merges to main/master branch
- Updates feature status to completed
- Finalizes feature metrics

## Implementation

Execute the following command:

```bash
node .aiwf/scripts/install-git-hooks.cjs {{COMMAND}}
```

## Notes

- Must be run from a Git repository root
- Preserves existing hooks as .aiwf-backup files
- Hooks are non-intrusive and fast
- Can be safely installed/uninstalled anytime