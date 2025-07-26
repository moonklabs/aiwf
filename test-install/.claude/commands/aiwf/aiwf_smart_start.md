# Smart Task Start - Workflow-Aware Task Execution

Intelligently start tasks based on workflow rules and current state.

## Overview

This command integrates:
- Workflow context loading
- Task validation
- State index updates
- Dependency checking
- Task execution

## Create TODO with EXACTLY these 6 items

1. Load workflow context and check current state
2. Select task and validate
3. Check dependencies and prerequisites
4. Update state index and set focus
5. Execute task
6. Recommend next actions

## Detailed Execution Process

### 1. Load workflow context and check current state

**Load Workflow Context:**
```bash
# Check current workflow state
aiwf state show
```

**Identify Current Position:**
- Check current milestone, sprint, and tasks
- Identify work in progress
- Review recommended next actions

### 2. Select task and validate

**Determine Task:**
- If <$ARGUMENTS> provided: Select that task
- If not provided: Use `aiwf state next` to select recommended task

**Validate:**
- Verify task belongs to current sprint
- Check task status is 'pending' or 'blocked'
- Ensure task file exists

### 3. Check dependencies and prerequisites

**Validate Dependencies:**
```bash
# Validate workflow rules
aiwf validate workflow
```

**Check:**
- Prerequisite tasks completed
- Required resources available
- Technical constraints met

**If Issues Found:**
- Specify blocking reasons
- Recommend alternative tasks
- Suggest resolution methods

### 4. Update state index and set focus

**Prepare Task Start:**
```bash
# Update state
aiwf state update

# Set focus to current task
aiwf state focus {task_id}

# Create branch (if needed)
git checkout -b task/{task_id}
```

**Check GitHub Issues:**
- Verify if task has linked issue
- Suggest issue creation if needed

### 5. Execute task

**Execute Task with Subagent:**
- Include @.claude/commands/aiwf/aiwf_do_task.md
- Pass task ID as argument
- Monitor execution results

**Track Progress:**
- Record progress updates
- Report issues immediately
- Auto-update state on completion

### 6. Recommend next actions

**After Task Completion:**
```bash
# Update state
aiwf state update

# Check next recommendations
aiwf state next
```

**Provide Recommendations:**
- Next priority task
- Parallel workable tasks
- Sprint/milestone transition needs

## Smart Features

### Automatic Context Switching
- Auto-prepare next sprint on sprint completion
- Re-review plans on milestone transition

### Intelligent Priority Management
- Task recommendations based on urgency and importance
- Consider resource availability
- Optimize dependency chains

### Real-time Validation
- Re-verify all conditions before starting work
- Detect dynamic state changes
- Conflict prevention mechanisms

## Usage Examples

### Basic Usage
```
/aiwf:smart_start
```
→ Start with workflow-recommended optimal task

### Specify Task
```
/aiwf:smart_start T03_S02
```
→ Start specified task after validation

### Force Execution
```
/aiwf:smart_start T03_S02 --force
```
→ Start task ignoring warnings (use with caution)

## Output Format

### On Success
```
🚀 Smart Task Start

📊 Workflow Status:
- Current Milestone: M01 (60% complete)
- Current Sprint: S02 (40% complete)
- Active Tasks: 2

✅ Task Validation Complete:
- Task: T03_S02 - Implement API Endpoints
- Dependencies: All met
- Resources: Available

🎯 Task Started:
- Branch: task/T03_S02 created
- Focus: Set to T03_S02
- Status: Changed to in_progress

💡 Next Recommendations:
1. T04_S02 - Design Database Schema
2. T05_S02 - Implement Auth Middleware
```

### When Blocked
```
⚠️ Task Start Blocked

❌ Blocking Reason:
- Unmet dependency: T02_S02 not yet completed
- This task requires results from T02

🔄 Alternative Recommendations:
1. Complete T02_S02 first
2. T06_S02 - Implement Independent Utility Functions
3. General Task T001 - Update Documentation

💡 Resolution:
- Complete prerequisite with /aiwf:smart_start T02_S02
- Or proceed with independent work: /aiwf:smart_start T06_S02
```

## Workflow Integration

This command works with:
- `/aiwf:workflow_context` - Check full context
- `/aiwf:smart_complete` - Intelligent task completion
- `/aiwf:transition` - Phase transitions
- `/aiwf:validate_workflow` - State validation

## Important Notes

- Workflow rules take priority
- Use force execution carefully
- State synchronization is handled automatically
- Manual intervention may be needed for issues