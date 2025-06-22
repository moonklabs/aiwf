# Simone Framework Sync Guide

## Overview

This guide explains how to sync Simone framework updates from development projects (like Synapsa) back to the canonical `claude-simone` repository.

**Important**: This is a ONE-WAY sync process. Framework improvements flow from active development projects → claude-simone, not the other way around.

## Current Development Context

- **Primary Development**: Happens in Synapsa project
- **Framework Evolution**: New commands, templates, and improvements are tested in real use
- **Sync Direction**: Synapsa → claude-simone (when improvements are stable)
- **Manual Review**: Each sync should be carefully reviewed, not automated

## What to Consider When Syncing

Before syncing, ask yourself:
1. Is this change Synapsa-specific or would it benefit all Simone users?
2. Has this been tested enough in real use?
3. Will this break existing workflows?
4. Is the change documented clearly?

## What Gets Synced

### Framework Core (Always Sync)
```
/.claude/commands/simone/     # All command definitions
/.simone/99_TEMPLATES/        # All templates
/.simone/CLAUDE.MD           # Framework instructions
/.simone/README.md           # Framework documentation
```

### Framework Structure (Sync Structure Only)
```
/.simone/10_STATE_OF_PROJECT/  # Directory only, not contents
```

### Project-Specific (Never Sync)
```
/.simone/00_PROJECT_MANIFEST.md
/.simone/01_PROJECT_DOCS/*
/.simone/02_REQUIREMENTS/*
/.simone/03_SPRINTS/*
/.simone/04_GENERAL_TASKS/*
/.simone/05_ARCHITECTURAL_DECISIONS/*
/.simone/10_STATE_OF_PROJECT/* (contents)
```

## Manual Sync Process (Synapsa → claude-simone)

1. **Identify What Changed**
   ```bash
   # From claude-simone directory
   # Compare commands
   diff -r ./.claude/commands/simone/ ~/code/synapsa/.claude/commands/simone/
   
   # Compare templates
   diff -r ./.simone/99_TEMPLATES/ ~/code/synapsa/.simone/99_TEMPLATES/
   
   # Check for new structural elements
   ls -la ~/code/synapsa/.simone/
   ```

2. **Review Each Change Carefully**
   - Read through command changes - are they improvements or project-specific?
   - Check template modifications - are they more generic or more specific?
   - Look for new directories or conventions

3. **Selective Manual Copy**
   - Copy only framework improvements
   - Leave out Synapsa-specific adaptations
   - Preserve generic examples in claude-simone

4. **Test in claude-simone Context**
   - Ensure examples still make sense
   - Verify commands work with generic project structure
   - Check that documentation is project-agnostic

5. **Document Changes for Users**
   - Update README.md with new features or changes
   - Add usage examples for new commands
   - Note any breaking changes or migration needs
   - Consider creating a CHANGELOG.md for version history

6. **Prepare for GitHub Push**
   - Review all documentation for clarity
   - Ensure examples are helpful and generic
   - Check that getting started instructions still work
   - Commit with clear message about what's new

## Sync Decision Tree

```
Is it a command file? → YES → Sync it
                     ↓ NO
Is it a template? → YES → Sync it
                 ↓ NO
Is it CLAUDE.MD or README.md in .simone/? → YES → Sync it
                                          ↓ NO
Is it a new directory structure? → YES → Create directory only
                                ↓ NO
Don't sync (project-specific content)
```

## Handling Conflicts

### Command Updates
- New commands: Add directly
- Modified commands: Review changes, ensure compatibility
- Removed commands: Keep if still used in project

### Template Changes
- Always take latest version from claude-simone
- Templates should be generic enough for all projects

### Structure Changes
- New directories: Add to all projects
- Directory renames: Carefully migrate with content preservation

## Best Practices

1. **Regular Syncs**: Sync framework updates monthly or when new features are announced
2. **Test After Sync**: Run a few commands to ensure everything works
3. **Document Custom Changes**: If you modify framework files, document why
4. **Contribute Back**: If you improve templates or commands, PR to claude-simone

## Example: Syncing to Synapsa

```bash
# From synapsa directory
cd ~/code/synapsa

# Dry run first
rsync -av --dry-run \
  --include='/.claude/commands/simone/***' \
  --include='/.simone/99_TEMPLATES/***' \
  --include='/.simone/CLAUDE.MD' \
  --include='/.simone/README.md' \
  --exclude='/*' \
  ~/code/claude-simone/ ./

# If looks good, run without --dry-run
rsync -av \
  --include='/.claude/commands/simone/***' \
  --include='/.simone/99_TEMPLATES/***' \
  --include='/.simone/CLAUDE.MD' \
  --include='/.simone/README.md' \
  --exclude='/*' \
  ~/code/claude-simone/ ./

# Create any new directories
mkdir -p .simone/10_STATE_OF_PROJECT
```

## Troubleshooting

### Missing Directories
Create them manually: `mkdir -p .simone/10_STATE_OF_PROJECT`

### Command Not Working
Check if it depends on new directory structures or conventions

### Merge Conflicts
Always prefer claude-simone version for framework files

## Future Improvements

- [ ] Automated sync script with safety checks
- [ ] Version tracking for framework components
- [ ] Compatibility matrix for different Simone versions
- [ ] Migration guides for breaking changes