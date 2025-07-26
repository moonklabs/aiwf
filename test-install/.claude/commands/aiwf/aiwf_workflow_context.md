# Load Workflow Context

Understand the complete workflow state of the project and provide context for AI to make correct decisions within the Milestone → Sprint → Task hierarchy.

## Core Purpose

- **Hierarchical Understanding**: Comprehend the 3-tier structure of Milestone/Sprint/Task
- **Rule-based Operations**: Proper progression following workflow rules
- **Automated Decision Making**: AI autonomously determines next steps
- **Consistency Assurance**: Work aligned with overall project flow

## Execution Process

### 1. Load State Data

**Check and Load Required Files:**
```
.aiwf/
├── task-state-index.json      # Current state
├── workflow-rules.json        # Workflow rules
├── 00_PROJECT_MANIFEST.md     # Project info
└── 02_REQUIREMENTS/           # Milestone definitions
```

### 2. Identify Current Position

**Current Position in 3-tier Hierarchy:**
```
Current Location: M01 → S02 → T03
├── Milestone: M01 - Basic Authentication System (Progress: 67%)
├── Sprint: S02 - Core Feature Development (Progress: 40%)
└── Task: T03 - Implement User Auth API (Status: in_progress)
```

### 3. Apply Workflow Rules

**Verify Core Rules:**

#### Milestone Rules
- ✓ Work only within current Milestone
- ✓ Perform only tasks aligned with Milestone goals
- ✓ Milestone completes when all Sprints complete

#### Sprint Rules  
- ✓ Sequential progression (S01 → S02 → S03)
- ✓ Next Sprint preparation at 80% completion
- ✓ Auto-transition at 100% completion

#### Task Rules
- ✓ Start only tasks with resolved dependencies
- ✓ Concurrent execution only within same Sprint
- ✓ Priority-based execution order

### 4. State Validation

**Verify Current State Consistency:**
```javascript
// Validation Items
1. Does active Sprint belong to current Milestone?
2. Do in-progress Tasks belong to active Sprint?
3. Are dependent Tasks of completed Tasks pending?
4. Do Sprint progress and Task states match?
5. Are blockers for blocked Tasks resolved?
```

### 5. Generate Context Information

**Structured Context for AI Understanding:**

```markdown
## 📍 Current Workflow Context

### Project Position
- **Milestone**: M01 - Basic Authentication System (2/3 Sprints complete)
- **Sprint**: S02 - Core Feature Development (1/3 Tasks complete)  
- **Focus**: T03 - User Auth API Implementation (45% progress)

### Progress Overview
```
M01 [████████░░] 67%
 └─ S01 [██████████] 100% ✅
 └─ S02 [████░░░░░░] 40% 🔄
     ├─ T03 [████░░░░░░] 45% 🔄 (current)
     ├─ T04 [░░░░░░░░░░] 0% ⏳ (waiting: depends on T03)
     └─ T05 [░░░░░░░░░░] 0% ⏳ (waiting: depends on T03, T04)
 └─ S03 [░░░░░░░░░░] 0% 📝 (planning needed)
```

### Workflow State
- **Current Phase**: Implementation
- **Next Milestones**: S02 complete → S03 planning → M01 complete
- **Expected Path**: T03 complete → T04 start → T05 start → S02 complete

### Active Rules
1. **Sprint Sequential**: S02 in progress, S03 prep after S02 80%
2. **Task Dependencies**: T04 can start after T03 completes
3. **No Parallel**: T04, T05 must run sequentially due to dependencies

### Warnings
⚠️ Blockers: None
⚠️ Risks: S03 Tasks not created (planning needed)
⚠️ Deadline: M01 target date in 2 weeks
```

### 6. Provide Decision Guide

**Clear Action Guidelines for AI:**

```markdown
## 🎯 Workflow-based Action Guidelines

### Immediately Executable
1. **Continue T03**
   - Reason: Currently in progress, dependent tasks waiting
   - Goal: Complete register endpoint (2 hours)
   - Next: Write unit tests

### Preparation Needed
1. **Prepare T04**
   - Condition: T03 API endpoints complete
   - Preparation: Write API documentation
   - Expected: Start immediately after T03

2. **Plan S03**
   - Condition: S02 reaches 80% (currently 40%)
   - Preparation: Requirements analysis, task definition
   - Expected: In 3-4 days

### Prohibited Actions
❌ Start S03 Tasks now (violates Sprint sequence)
❌ Start T04 before T03 completes (violates dependencies)
❌ Begin M02 work (current Milestone incomplete)

### Recommended Workflow
1. Complete T03 (45% → 100%)
2. Start and complete T04
3. Start T05 (after T04 completes)
4. Verify S02 completion
5. Plan and create S03 Tasks
6. Execute S03
7. Complete and review M01
```

## Output Format

```
🔄 Loading workflow context...

✅ Context loaded successfully!

📊 Project Structure:
M01 - Basic Authentication System
├── S01 - Project Setup [Completed]
├── S02 - Core Feature Development [In Progress]
└── S03 - Testing and Finalization [Waiting]

🎯 Current Focus:
Location: M01 > S02 > T03
Status: Implementing User Auth API (45%)
Next: Register endpoint validation

📋 Workflow Rules:
- Sprint sequential progress ✓
- Task dependency check ✓
- Milestone boundary compliance ✓

💡 AI Action Guidelines:
1. Continue T03 work (currently in progress)
2. Prepare T04 after completion
3. Plan S03 when S02 reaches 80%

⚠️ Caution:
- T04 requires T03 completion
- S03 cannot start yet
```

## Usage Scenarios

### 1. Required Before Starting Work
```bash
# 1. Load workflow context
/aiwf:workflow_context

# 2. Decide work based on context
/aiwf:next_action

# 3. Execute decided work
/aiwf:do_task T03
```

### 2. YOLO Mode Integration
```bash
/aiwf:yolo
# → Automatically executes workflow_context internally
# → Auto-progression based on workflow rules
```

### 3. During State Transitions
```bash
# When Sprint nears completion
/aiwf:workflow_context
# → Verify S02 at 80%
# → Suggest starting S03 preparation
```

## Workflow Rules File

The system references rules from `.aiwf/workflow-rules.json`:
- Milestone/Sprint/Task transition rules
- Priority calculation logic
- Automation triggers
- Validation rules

## Related Commands

- `/aiwf:next_action` - Determine next action based on workflow
- `/aiwf:transition` - Manage Sprint/Milestone transitions
- `/aiwf:validate_workflow` - Verify workflow consistency
- `/aiwf:update_state` - Update state index

This command is a core feature that enables AI to understand the full project context and work within the correct workflow.