# AIWF YOLO System Guide

> Comprehensive guide to AIWF's autonomous execution system (YOLO Mode)

[한국어](YOLO_SYSTEM_GUIDE.ko.md) | [English](YOLO_SYSTEM_GUIDE.md)

## Table of Contents

1. [Overview](#overview)
2. [System Components](#system-components)
3. [Engineering Guard](#engineering-guard)
4. [Checkpoint Manager](#checkpoint-manager)
5. [YOLO Configuration](#yolo-configuration)
6. [Usage Patterns](#usage-patterns)
7. [Safety Mechanisms](#safety-mechanisms)
8. [Performance Optimization](#performance-optimization)
9. [Troubleshooting](#troubleshooting)
10. [Best Practices](#best-practices)

## Overview

YOLO (You Only Live Once) mode is AIWF's autonomous execution system that allows Claude Code to work independently on tasks with minimal human intervention. The system includes sophisticated safety mechanisms, progress tracking, and quality control to ensure reliable autonomous operation.

### Key Features

- **Autonomous Task Execution**: Complete sprints or milestones automatically
- **Over-engineering Prevention**: Built-in guards against unnecessary complexity
- **Progress Tracking**: Comprehensive checkpoint and recovery system
- **Quality Control**: Real-time code quality monitoring
- **Recovery Mechanisms**: Robust error handling and state restoration

## System Components

### Architecture Overview

```
YOLO Mode
├── Engineering Guard (over-engineering prevention)
├── Checkpoint Manager (progress tracking & recovery)
├── Configuration System (behavior customization)
├── Sprint Manager (task organization)
└── Recovery System (failure handling)
```

### Core Modules

1. **`utils/engineering-guard.js`**: Quality control and complexity prevention
2. **`utils/checkpoint-manager.js`**: Progress tracking and recovery
3. **`src/config/yolo-config-template.yaml`**: Configuration template
4. **`src/commands/yolo-config.js`**: Configuration management
5. **`src/cli/checkpoint-cli.js`**: Dedicated checkpoint CLI

## Engineering Guard

The Engineering Guard prevents over-engineering and maintains code quality during autonomous execution.

### Core Functions

#### Complexity Monitoring
- **File Size Limits**: Prevents files from growing too large
- **Function Size Control**: Keeps functions manageable
- **Nesting Depth**: Limits excessive indentation
- **Pattern Detection**: Identifies overuse of design patterns

#### Configuration Options

```yaml
overengineering_prevention:
  max_file_lines: 300
  max_function_lines: 50
  max_nesting_depth: 4
  max_abstraction_layers: 3
  limit_design_patterns: true
  no_future_proofing: true
```

### Usage Examples

#### Programmatic Usage
```javascript
import { EngineeringGuard } from 'aiwf/utils/engineering-guard';

const guard = new EngineeringGuard('.aiwf/yolo-config.yaml');

// Check a single file
await guard.checkFileComplexity('src/app.js');
const report = guard.generateReport();

// Check entire project
const projectReport = await guard.checkProject('./src');
```

#### Real-time Feedback
```javascript
// Get immediate feedback during development
const feedback = await guard.provideFeedback('src/new-feature.js');
console.log(feedback);
// Output: [
//   { level: 'warning', message: 'File is getting large...' },
//   { level: 'suggestion', message: 'Consider extracting complex conditions...' }
// ]
```

### Detection Capabilities

#### Design Pattern Detection
- Factory patterns
- Singleton usage
- Observer implementations
- Strategy patterns
- Decorator patterns
- Adapter patterns

#### Future-proofing Detection
- TODO comments with future references
- Conditional FIXME items
- Speculative comments
- Reserved/placeholder code
- Version-specific checks

## Checkpoint Manager

The Checkpoint Manager handles progress tracking, state persistence, and recovery mechanisms.

### Core Functionality

#### Session Management
```javascript
import { CheckpointManager } from 'aiwf/utils/checkpoint-manager';

const manager = new CheckpointManager('./project-root');

// Start a YOLO session
await manager.startSession('S01', 'sprint');

// Track task progress
await manager.startTask('T001_setup_api');
await manager.completeTask('T001_setup_api', { files_created: 5 });

// Create manual checkpoint
await manager.createCheckpoint('manual', { milestone: 'API setup complete' });
```

#### Recovery Operations
```javascript
// List available checkpoints
const checkpoints = await manager.listCheckpoints();

// Restore from checkpoint
await manager.restoreFromCheckpoint('cp_1234567890');

// Generate progress report
const report = await manager.generateProgressReport();
```

### Checkpoint Types

1. **session_start**: Created when YOLO session begins
2. **task_complete**: Created after each task completion
3. **auto**: Created automatically at intervals
4. **manual**: Created by user request
5. **session_end**: Created when session ends

### State Structure

```json
{
  "session_id": "1703123456789",
  "started_at": "2025-01-27T10:00:00Z",
  "sprint_id": "S01",
  "mode": "sprint",
  "completed_tasks": [
    {
      "id": "T001_setup_api",
      "completed_at": "2025-01-27T10:15:00Z",
      "duration": 900000,
      "attempts": 1
    }
  ],
  "current_task": null,
  "metrics": {
    "completed_tasks": 1,
    "failed_tasks": 0,
    "total_time": 900000,
    "avg_task_time": 900000
  }
}
```

## YOLO Configuration

### Configuration Template

The YOLO configuration system uses a YAML file to control autonomous behavior:

```yaml
# Engineering level (minimal/balanced/complete)
engineering_level: minimal

# Focus rules to prevent scope creep
focus_rules:
  requirement_first: true
  simple_solution: true
  no_gold_plating: true
  stay_on_track: true

# Execution settings
execution:
  fast_mode: true
  run_tests: true
  auto_commit: false
  branch_strategy: feature

# Safety breakpoints
breakpoints:
  critical_files:
    - .env
    - database/migrations/*
  test_failure_threshold: 10
  schema_changes: true

# Checkpoint settings
checkpoint:
  enabled: true
  interval: 5
  recovery_mode: auto
```

### Configuration Management

#### CLI Commands
```bash
# Initialize configuration
aiwf yolo-config init

# Interactive configuration wizard
aiwf yolo-config wizard

# Show current configuration
aiwf yolo-config show
```

#### Programmatic Configuration
```javascript
import { createYoloConfig, createInteractiveYoloConfig } from 'aiwf/commands/yolo-config';

// Create with defaults
await createYoloConfig();

// Interactive setup
await createInteractiveYoloConfig();
```

## Usage Patterns

### Basic YOLO Execution

#### Sprint-level Execution
```bash
# Execute specific sprint
/aiwf_yolo S02

# Execute all sprints
/aiwf_yolo sprint-all

# Execute all milestones
/aiwf_yolo milestone-all
```

#### CLI-based Sprint Creation
```bash
# Create independent sprint from README
aiwf sprint independent --from-readme --minimal

# Create from GitHub issue
aiwf sprint independent --from-issue 123

# Interactive creation
aiwf sprint independent "Quick Feature" --balanced
```

### Checkpoint Operations

#### Using aiwf-checkpoint CLI
```bash
# List checkpoints
aiwf-checkpoint list

# Show progress report
aiwf-checkpoint report

# Restore from checkpoint
aiwf checkpoint restore cp_1234567890

# Create manual checkpoint
aiwf checkpoint create "Before major refactor"

# Clean old checkpoints
aiwf checkpoint clean --keep 10
```

### Recovery Scenarios

#### Session Interruption Recovery
```bash
# Check current session status
aiwf-checkpoint status

# List available recovery points
aiwf-checkpoint list --limit 10

# Restore to last stable state
aiwf checkpoint restore cp_latest
```

## Safety Mechanisms

### Over-engineering Prevention

#### Automatic Checks
- **File Size Monitoring**: Warns when files exceed limits
- **Complexity Detection**: Identifies overly complex code structures
- **Pattern Overuse**: Prevents unnecessary design patterns
- **Future-proofing**: Blocks speculative implementations

#### Manual Overrides
```yaml
# Disable specific checks
overengineering_prevention:
  max_file_lines: 500  # Increase limit
  limit_design_patterns: false  # Allow patterns
```

### Execution Safeguards

#### Critical File Protection
```yaml
breakpoints:
  critical_files:
    - .env
    - package.json
    - database/schema.sql
```

#### Test Failure Handling
```yaml
breakpoints:
  test_failure_threshold: 10  # Stop if >10% tests fail
```

#### Schema Change Confirmation
```yaml
breakpoints:
  schema_changes: true  # Require confirmation for DB changes
```

## Performance Optimization

### Checkpoint Optimization

#### Automatic Cleanup
```javascript
// Clean old checkpoints automatically
await manager.cleanup(keepLast: 10);
```

#### Storage Efficiency
- Incremental state snapshots
- Compressed checkpoint data
- Automatic old checkpoint removal

### Execution Optimization

#### Parallel Task Execution
```yaml
performance:
  parallel_tasks: false  # Experimental feature
  use_cache: true
  skip_unchanged: true
```

#### Memory Management
- Lazy module loading
- Resource pooling
- Automatic garbage collection

## Troubleshooting

### Common Issues

#### Engineering Guard Not Working
```bash
# Check if module exists
ls -la src/utils/engineering-guard.js

# Test dynamic import
node -e "import('./src/utils/engineering-guard.js').then(console.log)"

# Verify configuration
cat .aiwf/yolo-config.yaml
```

#### Checkpoint System Failures
```bash
# Check checkpoint directory
ls -la .aiwf/checkpoints/

# Verify permissions
chmod 755 .aiwf/checkpoints/

# Test checkpoint creation
aiwf checkpoint create "test-checkpoint"
```

#### Configuration Issues
```bash
# Recreate configuration
aiwf yolo-config init --force

# Validate configuration
aiwf yolo-config show

# Reset to defaults
rm .aiwf/yolo-config.yaml && aiwf yolo-config init
```

### Recovery Procedures

#### Corrupted State Recovery
```bash
# List available checkpoints
aiwf-checkpoint list

# Restore to known good state
aiwf checkpoint restore cp_last_known_good

# Reinitialize if necessary
aiwf yolo-config init --force
```

#### Git State Mismatch
```bash
# Check Git status at checkpoint
aiwf-checkpoint show cp_1234567890

# Restore Git state if needed
git checkout checkpoint_branch_name
git reset --hard checkpoint_commit_hash
```

## Best Practices

### Configuration Management

1. **Start Conservative**: Begin with minimal engineering level
2. **Customize Gradually**: Adjust settings based on project needs
3. **Monitor Results**: Track metrics and adjust thresholds
4. **Document Changes**: Keep configuration changes in version control

### Session Management

1. **Regular Checkpoints**: Create checkpoints at logical milestones
2. **Monitor Progress**: Check session status periodically
3. **Clean Up**: Remove old checkpoints regularly
4. **Plan Recovery**: Have recovery procedures ready

### Quality Control

1. **Set Appropriate Limits**: Configure complexity limits for your project
2. **Monitor Violations**: Review engineering guard reports
3. **Address Issues Early**: Fix complexity issues before they compound
4. **Balance Speed vs Quality**: Adjust engineering level based on needs

### Performance Optimization

1. **Use Caching**: Enable caching for repeated operations
2. **Optimize Checkpoints**: Clean up old checkpoints regularly
3. **Monitor Resources**: Track memory and disk usage
4. **Profile Performance**: Identify bottlenecks in autonomous execution

## Integration Examples

### Custom YOLO Workflow

```javascript
import { CheckpointManager } from 'aiwf/utils/checkpoint-manager';
import { EngineeringGuard } from 'aiwf/utils/engineering-guard';

class CustomYoloWorkflow {
  constructor(projectRoot) {
    this.checkpointManager = new CheckpointManager(projectRoot);
    this.engineeringGuard = new EngineeringGuard('.aiwf/yolo-config.yaml');
  }
  
  async executeWithGuards(tasks) {
    await this.checkpointManager.startSession('custom', 'workflow');
    
    for (const task of tasks) {
      await this.checkpointManager.startTask(task.id);
      
      // Execute task...
      const result = await this.executeTask(task);
      
      // Check quality
      const report = await this.engineeringGuard.checkProject('./src');
      if (!report.passed) {
        console.warn('Quality issues detected:', report.violations);
      }
      
      await this.checkpointManager.completeTask(task.id, result);
    }
    
    return await this.checkpointManager.endSession();
  }
}
```

## Related Commands

### Claude Code Commands
- `/project:aiwf:yolo` - Main YOLO execution command
- `/aiwf_yolo` - Autonomous task execution
- `/aiwf_checkpoint_status` - Check current progress

### CLI Commands
- `aiwf yolo-config` - Configuration management
- `aiwf checkpoint` - Checkpoint operations
- `aiwf-checkpoint` - Dedicated checkpoint CLI
- `aiwf sprint independent` - Independent sprint creation

## Related Documents

- [CLI_USAGE_GUIDE.md](CLI_USAGE_GUIDE.md) - CLI command reference
- [COMMANDS_GUIDE.md](COMMANDS_GUIDE.md) - Claude Code command guide
- [MODULE_MANAGEMENT_GUIDE.md](MODULE_MANAGEMENT_GUIDE.md) - Module architecture
- [Independent Sprint Guide](guides/independent-sprint-guide.md) - Sprint management
- [Checkpoint System Guide](guides/checkpoint-system-guide.md) - Checkpoint details

---

**Last Updated**: 2025-01-27  
**Version**: Compatible with AIWF v0.3.16+