# Validate Workflow

Verify that the current project state matches workflow rules, automatically detect inconsistencies or errors, and suggest corrections.

## Key Features

- **Rule Compliance Verification**: Detect workflow rule violations
- **Consistency Check**: Verify data consistency
- **Auto-correction**: Automatically fix simple issues
- **Improvement Suggestions**: Workflow optimization recommendations

## Validation Items

### 1. Structural Validation

#### Hierarchy Structure Validation
```
✓ Do Milestones contain Sprints?
✓ Do Sprints contain Tasks?
✓ Are there no orphan Tasks?
✓ Are there no duplicate IDs?
```

#### Naming Convention Validation
```
✓ Milestone ID: M## format
✓ Sprint ID: S##_M## format
✓ Task ID: T##_S##_M## format
✓ Filename matches ID
```

### 2. State Consistency Validation

#### Sprint-Task Consistency
```javascript
// Sprint completed but Tasks incomplete
if (sprint.status === 'completed') {
  const incompleteTasks = tasks.filter(t => 
    t.sprint === sprint.id && 
    t.status !== 'completed'
  );
  if (incompleteTasks.length > 0) {
    errors.push({
      type: 'INCONSISTENT_STATE',
      message: 'Sprint marked complete but has incomplete tasks',
      sprint: sprint.id,
      tasks: incompleteTasks
    });
  }
}
```

#### Milestone-Sprint Consistency
```javascript
// Milestone active but no active Sprint
if (milestone.status === 'active') {
  const activeSprints = sprints.filter(s => 
    s.milestone === milestone.id && 
    s.status === 'active'
  );
  if (activeSprints.length === 0) {
    warnings.push({
      type: 'NO_ACTIVE_SPRINT',
      message: 'Milestone active but no active Sprint',
      milestone: milestone.id
    });
  }
}
```

### 3. Workflow Rule Validation

#### Sprint Order Rules
```javascript
// S02 active but S01 incomplete
const sprintOrder = ['S01', 'S02', 'S03'];
for (let i = 1; i < sprintOrder.length; i++) {
  const current = findSprint(sprintOrder[i]);
  const previous = findSprint(sprintOrder[i-1]);
  
  if (current.status === 'active' && 
      previous.status !== 'completed') {
    errors.push({
      type: 'SPRINT_ORDER_VIOLATION',
      message: 'Sprint order violation',
      current: current.id,
      previous: previous.id
    });
  }
}
```

#### Task Dependency Rules
```javascript
// Dependent task incomplete but current task in progress
tasks.forEach(task => {
  if (task.status === 'in_progress' && task.dependencies) {
    const unmetDeps = task.dependencies.filter(depId => {
      const dep = findTask(depId);
      return dep.status !== 'completed';
    });
    
    if (unmetDeps.length > 0) {
      errors.push({
        type: 'DEPENDENCY_VIOLATION',
        message: 'Task progressing with unmet dependencies',
        task: task.id,
        unmetDependencies: unmetDeps
      });
    }
  }
});
```

### 4. Data Integrity Validation

#### Reference Integrity
```
✓ Does Sprint referenced by Task exist?
✓ Does Milestone referenced by Sprint exist?
✓ Do Tasks referenced by dependencies exist?
```

#### State Transition Validation
```
✓ Only allowed state transitions occurred?
✓ State changed without required conditions?
✓ Incorrectly transitioned to irreversible state?
```

## Execution Process

### 1. Full Scan and Data Collection
```javascript
const validationData = {
  milestones: scanMilestones(),
  sprints: scanSprints(),
  tasks: scanTasks(),
  stateIndex: loadStateIndex(),
  workflowRules: loadWorkflowRules()
};
```

### 2. Execute Validation
```javascript
const validationResult = {
  errors: [],      // Must fix
  warnings: [],    // Needs attention
  suggestions: [], // Improvements
  autoFixable: [] // Auto-fixable
};

// Execute each validation function
validateStructure(validationData, validationResult);
validateConsistency(validationData, validationResult);
validateWorkflowRules(validationData, validationResult);
validateDataIntegrity(validationData, validationResult);
```

### 3. Auto-fix Suggestions
```javascript
validationResult.autoFixable = [
  {
    issue: "Sprint S02 progress mismatch",
    current: "40%",
    correct: "60%",
    action: "updateSprintProgress('S02', 60)"
  },
  {
    issue: "Task T05 status inconsistency",
    current: "pending",
    correct: "blocked",
    action: "updateTaskStatus('T05', 'blocked', 'T04 incomplete')"
  }
];
```

### 4. Generate Validation Report

## Output Format

### Validation Passed
```
✅ Workflow validation complete

📊 Validation Results:
- Items checked: 45
- Passed: 45
- Errors: 0
- Warnings: 0

🎯 Workflow Status: Normal

💡 Improvement Suggestions:
- Recommend pre-planning S03 tasks (at S02 80% point)
- Consider automating daily progress updates
```

### Errors Found
```
❌ Workflow validation failed

📊 Validation Results:
- Items checked: 45
- Passed: 41
- Errors: 3
- Warnings: 1

🚨 Errors Found:

1. Sprint Order Violation
   - Issue: S03 active but S02 incomplete
   - Cause: Force transition used
   - Fix: Revert S03 to planning

2. Task Dependency Violation
   - Issue: T05 in progress but T04 incomplete
   - Cause: Started ignoring dependencies
   - Fix: Change T05 to pending

3. State Inconsistency
   - Issue: Sprint S01 complete but T02 in progress
   - Cause: Tasks not checked at Sprint closure
   - Fix: Verify and update T02 status

⚠️ Warning:
- M01 deadline risk (5 days remaining, 30% incomplete)

🔧 Auto-fixable: 2 items
Execute fixes? (y/n)
```

### Auto-fix Results
```
🔧 Executing auto-fixes...

✅ Fixed:
1. Sprint S02 progress: 40% → 60%
2. Task T05 status: pending → blocked

❌ Manual Fix Required:
1. Sprint order violation - needs admin decision
2. T02 status - needs actual progress verification

💡 Next Steps:
1. Handle manual fix items
2. Re-run /aiwf:validate_workflow
3. Continue work after resolving all errors
```

## Custom Validation Rules

### Adding Project-specific Rules
```json
// .aiwf/custom-rules.json
{
  "customRules": [
    {
      "name": "Code Review Required",
      "condition": "task.status === 'review'",
      "validate": "task.reviewer !== null",
      "error": "Reviewer not assigned"
    },
    {
      "name": "Test Coverage",
      "condition": "sprint.status === 'completed'",
      "validate": "sprint.testCoverage >= 80",
      "error": "Insufficient test coverage"
    }
  ]
}
```

## Usage Scenarios

### 1. Regular Validation
```bash
# Daily morning workflow validation
/aiwf:validate_workflow
# → Detect overnight inconsistencies
```

### 2. Pre-work Validation
```bash
# Check state before important work
/aiwf:validate_workflow
/aiwf:next_action
# → Start work from clean state
```

### 3. Before Sprint Transition
```bash
# Validate before Sprint transition
/aiwf:validate_workflow
/aiwf:transition sprint S02
# → Ensure safe transition
```

## Auto-execution Triggers

- On task state change
- On Sprint completion
- Daily automatic validation (configurable)
- Before YOLO mode start

## Related Commands

- `/aiwf:workflow_context` - Check workflow context
- `/aiwf:update_state` - Update state index
- `/aiwf:fix_workflow` - Fix workflow issues
- `/aiwf:project_health` - Check project health

This command ensures the project always follows correct workflow rules and maintains consistent state.