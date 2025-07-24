# Checkpoint System Guide

[한국어로 보기](checkpoint-system-guide-ko.md)

## Overview

The AIWF Checkpoint System is designed to provide robust recovery and progress tracking for YOLO mode execution. It automatically saves state at critical points and allows seamless continuation after interruptions.

## Key Concepts

### What is a Checkpoint?

A checkpoint is a snapshot of:
- Current session state
- Task completion status
- Git repository state
- Performance metrics
- Execution context

### When are Checkpoints Created?

Checkpoints are automatically created:
- At session start
- After each task completion
- Before risky operations
- At regular intervals (configurable)
- On graceful interruption

Manual checkpoints can be created anytime for extra safety.

## Using the Checkpoint System

### Basic Commands

```bash
# View current session status
aiwf checkpoint status

# List available checkpoints
aiwf checkpoint list
aiwf checkpoint list --limit 20

# Restore from a checkpoint
aiwf checkpoint restore cp_1234567890

# Create manual checkpoint
aiwf checkpoint create "Before major refactoring"

# Clean old checkpoints
aiwf checkpoint clean --keep 10
```

### Dedicated CLI Tool

The `aiwf-checkpoint` command provides advanced features:

```bash
# Generate progress report
aiwf-checkpoint report

# Show detailed checkpoint info
aiwf-checkpoint show cp_1234567890

# Clean with preview
aiwf-checkpoint clean --keep 5 --dry-run

# Get help
aiwf-checkpoint help
```

## Checkpoint Structure

### Checkpoint Files

```
.aiwf/checkpoints/
├── cp_1703123456789/
│   ├── metadata.json      # Checkpoint metadata
│   ├── session.json       # Session state
│   ├── git-state.json     # Git repository snapshot
│   └── metrics.json       # Performance metrics
└── current-session.json   # Active session reference
```

### Metadata Contents

```json
{
  "id": "cp_1703123456789",
  "type": "task_complete",
  "timestamp": "2024-12-25T10:30:45.789Z",
  "session_id": "session_1703123456789",
  "description": "Completed task T01_S01",
  "git_commit": "abc123def",
  "tasks_completed": 5,
  "sprint": "S01"
}
```

## Recovery Process

### Automatic Recovery

When YOLO mode starts, it checks for:
1. Active session with incomplete tasks
2. Recent checkpoints
3. Git state consistency

If an incomplete session is found, you'll be prompted to:
- Continue from last checkpoint
- Start fresh
- Review checkpoint details

### Manual Recovery

```bash
# 1. Check what's available
aiwf checkpoint list

# 2. View specific checkpoint details
aiwf-checkpoint show cp_1703123456789

# 3. Restore if appropriate
aiwf checkpoint restore cp_1703123456789

# 4. Continue in YOLO mode
# In Claude Code: /project:aiwf:yolo
```

## Integration with YOLO Mode

### YOLO Configuration

Configure checkpoint behavior in `.aiwf/yolo-config.yaml`:

```yaml
checkpoint:
  auto_checkpoint: true
  interval_minutes: 15
  max_checkpoints: 50
  checkpoint_on:
    - task_complete
    - sprint_complete
    - before_risky_operation
    - interval
```

### YOLO Execution Flow

```
Start YOLO → Check Recovery → Create Session → Execute Tasks
                ↓                                    ↓
          [Has Checkpoint]                   [Create Checkpoint]
                ↓                                    ↓
          Prompt Recovery                    Continue Execution
```

## Best Practices

### 1. Regular Cleanup

```bash
# Keep last 10 checkpoints
aiwf checkpoint clean --keep 10

# Or clean by age (days)
aiwf checkpoint clean --older-than 7
```

### 2. Manual Checkpoints for Safety

Create manual checkpoints before:
- Major refactoring
- Database migrations
- Breaking changes
- Experimental features

```bash
aiwf checkpoint create "Before database schema change"
```

### 3. Monitor Checkpoint Health

```bash
# Regular status checks
aiwf checkpoint status

# Weekly reports
aiwf-checkpoint report --period week
```

### 4. Git State Alignment

Ensure Git state matches checkpoint:
```bash
# Before restore
git status

# After restore
git log --oneline -5
```

## Advanced Features

### Session Metrics

Each checkpoint tracks:
- Execution time
- Tasks completed
- Success/failure ratio
- Token usage (if available)
- Memory usage

View metrics:
```bash
aiwf-checkpoint report --detailed
```

### Checkpoint Types

1. **session_start**: Beginning of YOLO session
2. **task_complete**: After task completion
3. **sprint_complete**: Sprint milestone
4. **auto**: Regular interval checkpoint
5. **manual**: User-created checkpoint
6. **error_recovery**: After error handling

### Parallel Sessions

The system prevents parallel YOLO sessions:
- Only one active session allowed
- Stale sessions auto-expire after 24 hours
- Force override with `--force` flag

## Troubleshooting

### Cannot Restore Checkpoint

**Issue**: "Git state mismatch"
```bash
# Check current Git state
git status

# View checkpoint Git state
aiwf-checkpoint show cp_1234567890

# Reset to checkpoint commit if safe
git reset --hard <checkpoint-commit>
```

**Issue**: "Session already active"
```bash
# Check active session
aiwf checkpoint status

# Force new session if needed
/project:aiwf:yolo --force
```

### Checkpoint Corruption

**Issue**: "Invalid checkpoint data"
```bash
# Remove corrupted checkpoint
rm -rf .aiwf/checkpoints/cp_1234567890

# Clean and verify
aiwf checkpoint clean --verify
```

### Storage Issues

**Issue**: "Too many checkpoints"
```bash
# Check checkpoint count
ls -la .aiwf/checkpoints/ | wc -l

# Aggressive cleanup
aiwf checkpoint clean --keep 5

# Check disk usage
du -sh .aiwf/checkpoints/
```

## Performance Considerations

### Checkpoint Size

- Average checkpoint: 10-50 KB
- Large projects may have bigger checkpoints
- Git state tracking adds minimal overhead

### Optimization Tips

1. **Configure intervals wisely**
   - Default: 15 minutes
   - Heavy tasks: 5-10 minutes
   - Light tasks: 20-30 minutes

2. **Limit checkpoint count**
   - Default: Keep last 50
   - Recommended: 10-20 for most projects

3. **Disable for simple tasks**
   ```yaml
   checkpoint:
     auto_checkpoint: false  # For simple sprints
   ```

## Integration Examples

### CI/CD Integration

```yaml
# .github/workflows/yolo-recovery.yml
name: YOLO Recovery Check
on:
  schedule:
    - cron: '0 9 * * 1-5'  # Weekdays at 9 AM

jobs:
  check-recovery:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install AIWF
        run: npm install -g aiwf
      - name: Check Incomplete Sessions
        run: |
          if aiwf checkpoint status | grep -q "incomplete"; then
            echo "Found incomplete YOLO session"
            aiwf-checkpoint report
          fi
```

### Custom Scripts

```bash
#!/bin/bash
# backup-checkpoints.sh

# Create checkpoint archive
tar -czf checkpoints-$(date +%Y%m%d).tar.gz .aiwf/checkpoints/

# Upload to cloud storage
aws s3 cp checkpoints-*.tar.gz s3://my-bucket/aiwf-backups/

# Clean local old checkpoints
aiwf checkpoint clean --keep 10
```

## Summary

The AIWF Checkpoint System provides peace of mind when running autonomous YOLO sessions. By automatically tracking progress and enabling easy recovery, it allows developers to leverage YOLO mode's power without fear of losing work. Regular maintenance and proper configuration ensure optimal performance and reliability.

Remember: **Checkpoints are your safety net - use them wisely!**