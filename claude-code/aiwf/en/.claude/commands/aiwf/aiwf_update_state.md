# Update State Index

Scan all task files to update the central state index (task-state-index.json). Ensures AI always has accurate understanding of the current project state.

## Main Purpose

- **State Centralization**: Consolidate distributed task information into one index
- **AI Context Persistence**: Ensure state continuity between sessions
- **Progress Tracking**: Provide real-time project metrics
- **Next Action Suggestions**: Intelligent task recommendations based on current state

## Execution Process

### 1. State Index Initialization Check

**Verify Index File Existence:**
- Check for `.aiwf/task-state-index.json`
- Create new if missing (with initial structure)
- Load existing file if present

### 2. Project Manifest Analysis

**Understand Current Project State:**
- Read `00_PROJECT_MANIFEST.md`
- Identify current milestone
- Identify active sprint
- Project phase (planning, implementation, testing, etc.)

### 3. Sprint Directory Scan

**Traverse All Sprint Folders:**
```bash
.aiwf/03_SPRINTS/
├── S01_M01_Initial_Setup/
├── S02_M01_Core_Features/
└── S03_M01_Testing/
```

**For Each Sprint:**
1. Read sprint meta file (`S##_sprint_meta.md`)
2. Check sprint status (planning, active, completed)
3. Collect all task files within sprint

### 4. Task File Analysis

**Extract Information from Each Task File:**
- Task ID (T##_S##_M##)
- Title (`# T##: [Title]`)
- Status (`**Status**: pending/in_progress/completed/blocked`)
- Priority (`**Priority**: high/medium/low`)
- Estimated/actual time
- Dependency information
- OUTPUT LOG check (actual completion status)

**Status Determination Logic:**
```
1. OUTPUT LOG contains ✅ or "completed" → completed
2. Check status field → use that status
3. Default → pending
```

### 5. Metrics Calculation

**Overall Project Statistics:**
- Total task count
- Completed tasks
- In-progress tasks
- Pending tasks
- Blocked tasks
- Overall progress (%)

**Sprint-level Statistics:**
- Tasks per sprint
- Sprint completion rate
- Estimated completion date

### 6. Current Focus Update

**AI Work Context:**
- Auto-detect currently active tasks
- Record last worked task
- Maintain session notes

### 7. Next Actions Generation

**Priority-based Recommendations:**

1. **High**: Continue in-progress tasks
2. **Medium**: Start new tasks from current sprint
3. **Low**: Unblock tasks, documentation, reviews

### 8. Index File Save

**Save Updated Information:**
```json
{
  "version": "1.0.0",
  "last_updated": "2025-01-22T16:00:00Z",
  "last_updated_by": "aiwf-state-update",
  "project_info": { ... },
  "current_focus": { ... },
  "tasks": { ... },
  "sprint_summary": { ... },
  "next_actions": [ ... ],
  "metrics": { ... }
}
```

## Output Format

```
🔄 Updating state index...

📊 Scan Results:
- Sprints: 3
- Tasks: 15
- Changes: 5

✅ State index updated successfully!

📈 Project Status:
  ✅ Completed: 8 (53%)
  🔄 In Progress: 2 (13%)
  ⏳ Pending: 4 (27%)
  ❌ Blocked: 1 (7%)
  
  Overall Progress: [████████████░░░░░░░░] 53%

🎯 Current Focus: T03_S02_M01 - Implement User Authentication API

🚀 Suggested Next Actions:
1. Complete T03 register endpoint (2 hours)
2. Write T03 unit tests (3 hours)
3. Prepare T04 - Review API docs (1 hour)
```

## Auto-execution Scenarios

Automatically runs in these situations:
- After task creation/modification
- When sprint plans change
- Before YOLO mode starts
- Before project review
- At AI session start

## CLI Command

```bash
# Update state index
aiwf state update

# Alias
aiwf state u
```

## Usage Examples

### Regular Update
```bash
/aiwf:update_state
```

### Pre-work State Check
```bash
# 1. Update state
/aiwf:update_state

# 2. Check current state
/aiwf:check_state

# 3. Start work on recommended task
/aiwf:do_task T03
```

### YOLO Mode Integration
```bash
# Automatically runs before YOLO
/aiwf:yolo
# → Internally executes update_state
# → Proceeds with latest state
```

## Important Notes

- Large projects may take time to scan
- Non-standard file formats may result in missing information
- Manually edited task-state-index.json may be overwritten
- Git state synchronization requires separate commands

## Related Commands

- `/aiwf:check_state` - Check current state
- `/aiwf:project_status` - Detailed project status
- `/aiwf:yolo` - Automated task execution (includes state update)

This command is a core feature that ensures AI always has the latest project state awareness for consistent task execution.