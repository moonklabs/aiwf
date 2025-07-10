# Feature Integration Guide

This document describes how Features integrate with Milestones, Sprints, and Tasks in AIWF.

## Integration Architecture

```
Milestone (M##)
    └── Features (FL###)
         └── Sprints (S##_M##)
              └── Tasks (T##_S##)
```

## Milestone Integration

### Linking Features to Milestones

Each feature is associated with exactly one milestone through the `milestone` field in the YAML frontmatter.

```yaml
milestone: M02  # Required field
```

### Milestone Progress Calculation

Milestone progress is calculated based on:
- Number of completed features vs total features
- Weighted by feature complexity
- Formula: `Σ(completed_features * complexity_weight) / Σ(all_features * complexity_weight)`

### Complexity Weights
- `simple`: 1.0
- `moderate`: 2.0
- `complex`: 3.0

## Sprint Integration

### Multi-Sprint Features

Features often span multiple sprints. The `sprint_ids` array tracks all related sprints:

```yaml
sprint_ids: [S01_M02, S02_M02, S03_M02]
```

### Sprint Assignment Rules

1. Features are assigned to sprints during sprint planning
2. A feature can be active in multiple sprints
3. Sprint progress includes partial feature completion

### Sprint Progress Tracking

For features spanning multiple sprints:
- Track `progress_percentage` at feature level
- Calculate sprint-specific progress based on completed tasks
- Update feature progress after each sprint

## Task Integration

### Linking Tasks to Features

Tasks reference their parent feature:

```yaml
# In task file
feature_id: FL001
```

Features track their child tasks:

```yaml
# In feature file
tasks: [T01_S01, T02_S01, T05_S02]
```

### Task Completion Impact

When a task is completed:
1. Update feature's task list
2. Recalculate feature progress
3. Update sprint progress
4. Trigger milestone progress update

### Progress Calculation

Feature progress based on tasks:
```
progress = (completed_tasks / total_tasks) * 100
```

## Bidirectional Sync Mechanisms

### 1. Feature Creation
```
Create Feature → Update Milestone → Link to Current Sprint
```

### 2. Task Creation
```
Create Task → Link to Feature → Update Feature Task List
```

### 3. Sprint Planning
```
Assign Features to Sprint → Update Feature sprint_ids → Update Sprint Scope
```

### 4. Status Updates
```
Complete Task → Update Feature Progress → Update Sprint Progress → Update Milestone Progress
```

## Command Integration

### Create Feature with Milestone
```bash
/project:aiwf:create_feature_ledger "User Authentication" --milestone M02
```

### Link Feature to Sprint
```bash
/project:aiwf:link_feature_sprint FL001 S02_M02
```

### Update Feature from Task Completion
```bash
/project:aiwf:complete_task T01_S01
# Automatically updates FL001 progress
```

## Data Consistency Rules

### 1. Referential Integrity
- Milestone must exist before feature assignment
- Sprint must belong to the same milestone
- Tasks must belong to linked sprints

### 2. Status Consistency
- Feature cannot be "completed" if tasks are incomplete
- Milestone cannot be "completed" if features are incomplete
- Archived features are excluded from progress calculations

### 3. Progress Synchronization
- Task completion triggers feature progress update
- Feature progress updates trigger milestone recalculation
- All updates are timestamped for audit trail

## Integration Queries

### Find Features by Milestone
```bash
/project:aiwf:list_features --milestone M02
```

### Find Features by Sprint
```bash
/project:aiwf:list_features --sprint S01_M02
```

### Feature Impact Analysis
```bash
/project:aiwf:feature_impact FL001
# Shows: Related tasks, sprints, blocking features
```

## Reporting Integration

### Milestone Report includes:
- Feature count by status
- Overall progress percentage
- Feature complexity distribution
- Estimated vs actual timeline

### Sprint Report includes:
- Active features
- Feature progress within sprint
- Task completion rate
- Velocity metrics

### Feature Report includes:
- Task breakdown
- Sprint allocation
- Time tracking
- Dependency graph

## Best Practices

1. **Plan Features First**: Define features before creating tasks
2. **Update Regularly**: Keep progress percentages current
3. **Cross-Reference**: Ensure bidirectional links are maintained
4. **Review Dependencies**: Check for blocked features before sprint planning
5. **Archive Completed**: Move completed features to maintain performance

## Automated Workflows

### On Feature Creation:
1. Generate unique feature ID
2. Link to active milestone
3. Create in active sprint (if in progress)
4. Initialize progress tracking

### On Task Completion:
1. Update feature task list
2. Recalculate feature progress
3. Check if feature is complete
4. Propagate to milestone

### On Sprint Close:
1. Review feature progress
2. Move incomplete features to next sprint
3. Archive completed features
4. Generate sprint report

## Error Handling

### Common Issues:
1. **Orphaned Features**: Features without milestone
2. **Broken References**: Tasks referencing non-existent features
3. **Circular Dependencies**: Features depending on each other
4. **Stale Progress**: Outdated progress percentages

### Resolution:
- Regular integrity checks
- Automated fixing scripts
- Manual review process
- Audit trail for changes