# AIWF State Management Guide

## Overview

The AIWF State Management System is a revolutionary feature that helps AI assistants maintain perfect context awareness across sessions. It provides intelligent task prioritization, dependency tracking, and workflow validation to maximize development efficiency.

## Key Concepts

### 1. State Index
The central `task-state-index.json` file maintains:
- Current project state (milestones, sprints, tasks)
- Task dependencies and relationships
- Progress tracking and completion status
- AI context for seamless session continuity

### 2. Workflow Rules
The `workflow-rules.json` defines:
- Milestone → Sprint → Task hierarchy
- State transition conditions
- Priority calculation weights
- AI behavior preferences

### 3. Priority Matrix
Tasks are scored based on:
- **Urgency (40%)**: Deadline-based scoring
- **Importance (30%)**: Priority level (high/medium/low)
- **Dependencies (20%)**: Number of blocked tasks
- **Effort (10%)**: Inverse relationship (lower effort = higher priority)

## CLI Commands

### Basic State Management

```bash
# Update state index from file system
aiwf state update

# Display current state and statistics
aiwf state show

# Get next recommended actions
aiwf state next

# Validate workflow consistency
aiwf state validate
```

### Task Progress Tracking

```bash
# Mark task as started
aiwf state start T01_S01

# Mark task as completed
aiwf state complete T01_S01

# Focus on specific task (for detailed view)
aiwf state focus T01_S01
```

### Advanced Options

```bash
# Force full rescan of project
aiwf state update --force

# Get next actions in JSON format
aiwf state next --format=json

# Validate specific aspects
aiwf state validate --focus=dependencies
aiwf state validate --check=sprint-consistency
```

## Integration with Claude Commands

### Smart Task Execution

The new smart commands integrate with state management:

```bash
# Start task with workflow awareness
/project:aiwf:smart_start T01_S01

# Complete task with state synchronization
/project:aiwf:smart_complete T01_S01
```

### Enhanced YOLO Mode

YOLO mode now uses workflow intelligence:

```bash
# Run with automatic task selection
/project:aiwf:yolo

# Sprint-specific with workflow optimization
/project:aiwf:yolo S03

# Adaptive sprint management (80% rule)
/project:aiwf:yolo sprint-all
```

## Workflow Validation

### Validation Report Example

```
🔍 Workflow Validation Report

Found 3 issue(s):

❌ Errors (1):
  1. INCONSISTENT_STATE
     Sprint S02 marked complete but has 2 incomplete tasks
     
⚠️  Warnings (1):
  1. STALE_TASK
     Task T03_S01 in progress for over 7 days
     
💡 Suggestions (1):
  1. SPRINT_PREPARATION
     Sprint S02 is 85% complete. Consider preparing next sprint.
```

### Common Issues and Solutions

#### 1. State Inconsistency
```bash
# Fix by updating state
aiwf state update --force

# Or manually complete tasks
aiwf state complete T05_S02
aiwf state complete T07_S02
```

#### 2. Circular Dependencies
- Review task dependencies in task files
- Remove circular references
- Run `aiwf state validate` to verify fix

#### 3. 80% Rule Trigger
```bash
# When sprint reaches 80%, prepare next sprint
/project:aiwf:create_sprint_tasks S03
```

## Best Practices

### 1. Regular State Updates
- Run `aiwf state update` after major changes
- Use before starting YOLO mode
- Validate after sprint completions

### 2. Dependency Management
- Define dependencies in task metadata
- Avoid circular dependencies
- Use `blocks` and `depends_on` fields correctly

### 3. Sprint Planning
- Let the 80% rule guide sprint transitions
- Use workflow validation before major decisions
- Trust AI recommendations from `aiwf state next`

## Example Workflow

### Starting a New Session

```bash
# 1. Update state to latest
aiwf state update

# 2. Check current status
aiwf state show

# 3. Get recommendations
aiwf state next

# 4. Start recommended task
aiwf state start T01_S01
/project:aiwf:smart_start T01_S01
```

### Completing Work

```bash
# 1. Complete the task
/project:aiwf:smart_complete T01_S01

# 2. State is automatically updated
# 3. Get next recommendation
aiwf state next

# 4. Continue with next task
```

### Sprint Transition

```bash
# 1. Check sprint progress
aiwf state show

# 2. When 80% complete, validate
aiwf state validate

# 3. If validation suggests, prepare next sprint
/project:aiwf:create_sprint_tasks S03

# 4. Continue with workflow
```

## Troubleshooting

### State Not Updating
```bash
# Force full rescan
aiwf state update --force

# Check for file permissions
ls -la .aiwf/
```

### Missing Dependencies
```bash
# Validate dependencies
aiwf state validate --focus=dependencies

# Review task files for proper metadata
```

### Workflow Errors
```bash
# Run comprehensive validation
aiwf state validate

# Check workflow rules
cat .aiwf/workflow-rules.json
```

## Advanced Features

### Custom Priority Weights

Edit `.aiwf/workflow-rules.json`:
```json
{
  "priority_weights": {
    "urgency": 0.4,
    "importance": 0.3,
    "dependencies": 0.2,
    "effort": 0.1
  }
}
```

### AI Behavior Tuning

Configure AI preferences:
```json
{
  "ai_behavior": {
    "auto_select_tasks": true,
    "prefer_blocked_tasks": true,
    "parallel_task_limit": 3,
    "risk_tolerance": "conservative"
  }
}
```

## Conclusion

The AIWF State Management System transforms how AI assistants work with your projects. By maintaining perfect context awareness and providing intelligent recommendations, it ensures maximum productivity and seamless collaboration between human developers and AI assistants.

For more information, see:
- [COMMANDS_GUIDE.md](./COMMANDS_GUIDE.md) - Full command reference
- [README.md](../README.md) - Project overview
- [CHANGELOG.md](../CHANGELOG.md) - Latest updates