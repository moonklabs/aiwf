# Smart Task Complete - Workflow-Aware Task Completion

Intelligently complete tasks considering workflow rules and state.

## Overview

This command automates:
- Task completion validation
- State index updates
- Next action recommendations
- Sprint/milestone transitions
- Automatic commits and documentation

## Create TODO with EXACTLY these 8 items

1. Check current task status
2. Validate completion criteria
3. Run code review and tests
4. Update task file and mark complete
5. Commit changes
6. Update state index
7. Check workflow transitions
8. Recommend next actions and report

## Detailed Execution Process

### 1. Check current task status

**Identify Task:**
- Extract task ID from <$ARGUMENTS>
- If empty, check current focused task:
  ```bash
  aiwf state show | grep "current_focus"
  ```

**Validate Status:**
- Verify task is in 'in_progress' state
- Read task file for details
- Check work logs

### 2. Validate completion criteria

**Check Acceptance Criteria:**
- Review "Acceptance Criteria" section in task file
- Verify all checklist items completed
- Confirm required deliverables created

**Technical Validation:**
```bash
# Run lint
npm run lint

# Type check
npm run typecheck

# Run tests
npm test
```

### 3. Run code review and tests

**Automated Code Review:**
- Run @.claude/commands/aiwf/aiwf_code_review.md with subagent
- Pass task ID as scope
- Analyze review results

**If Issues Found:**
- Critical issues: Block completion, require fixes
- Minor issues: Warn but allow progress
- Improvements: Record as next tasks

### 4. Update task file and mark complete

**Update Task Metadata:**
```yaml
status: completed
completed_at: YYYY-MM-DD HH:MM
actual_time: [actual time spent]
```

**Write OUTPUT LOG:**
- Implementation results summary
- Major changes recorded
- Test results included
- Remaining improvements noted

**Rename File:**
- `T##_S##_*.md` → `TX##_S##_*.md`
- Add 'X' for completion marker

### 5. Commit changes

**Smart Commit:**
```bash
# Execute commit with subagent
# Include @.claude/commands/aiwf/aiwf_commit.md
# Pass task ID and YOLO as arguments
```

**Update GitHub Issue:**
- Auto-update if linked issue exists
- Add completion comment
- Change labels: in-progress → completed

### 6. Update state index

**State Synchronization:**
```bash
# Mark task complete
aiwf state complete {task_id}

# Update overall state
aiwf state update

# Validate workflow
aiwf validate workflow
```

**Progress Calculation:**
- Update sprint completion rate
- Refresh milestone progress
- Reflect overall project state

### 7. Check workflow transitions

**Check Transition Conditions:**
- All sprint tasks completed?
- All milestone sprints completed?
- 80% rule check (prepare next sprint)

**Auto-transition Handling:**
```bash
# Execute transitions if needed
aiwf transition sprint  # On sprint completion
aiwf transition milestone  # On milestone completion
```

### 8. Recommend next actions and report

**Analyze Next Actions:**
```bash
# Check recommendations
aiwf state next
```

**Generate Final Report:**
- Completed task summary
- Sprint/milestone progress
- Next recommended actions
- Warnings and risks

## Smart Features

### Automatic Quality Control
- Auto-verify code quality
- Check test coverage
- Validate documentation completeness

### Intelligent Transition Management
- Auto-finalize on sprint completion
- Auto-prepare next sprint
- Request review on milestone transition

### Continuity Assurance
- Auto-recommend next tasks
- Update dependency chains
- Identify parallel work opportunities

## Usage Examples

### Basic Usage
```
/aiwf:smart_complete
```
→ Complete currently focused task

### Complete Specific Task
```
/aiwf:smart_complete T03_S02
```
→ Complete specified task

### Skip Options
```
/aiwf:smart_complete T03_S02 --skip-review
```
→ Skip code review (use with caution)

## Output Format

### Successful Completion
```
✅ Smart Task Complete

📋 Task Info:
- ID: T03_S02
- Title: Implement API Endpoints
- Time Spent: 6 hours (estimated: 8 hours)

🔍 Validation Results:
- Acceptance Criteria: All met ✓
- Code Review: Passed ✓
- Tests: 100% passed ✓
- Lint: No issues ✓

📊 Progress Update:
- Sprint S02: 60% → 80% complete
- Milestone M01: 45% → 52% complete
- Overall Project: 38% → 41% complete

💾 Commit Complete:
- SHA: abc123def
- Message: "feat(api): complete T03_S02 API endpoints implementation"

🎯 Next Recommendations:
1. T04_S02 - Design Database Schema (Priority: High)
2. T05_S02 - Implement Auth Middleware (Can parallel)

⚡ Sprint 80% Reached!
→ Start preparing next sprint S03
```

### When Issues Found
```
⚠️ Task Completion Pending

❌ Issues Found:
1. Test Failures: 3 tests not passing
   - test/api/endpoints.test.js:45
   - test/api/validation.test.js:23
   - test/integration/flow.test.js:89

2. Lint Errors: 2 files
   - src/api/handlers.js: Unused variable
   - src/utils/validator.js: Type error

📝 Required Actions:
1. Fix failing tests
2. Resolve lint errors
3. Run /aiwf:smart_complete again

💡 Help:
- Debug tests: npm test -- --verbose
- Auto-fix lint: npm run lint:fix
```

## Workflow Integration

Related Commands:
- `/aiwf:smart_start` - Intelligent task start
- `/aiwf:transition` - Manual transitions
- `/aiwf:project_status` - Overall status check
- `/aiwf:sprint_review` - Sprint review

## Important Notes

- Don't skip validation steps
- Auto-transitions may be hard to revert
- Manual state adjustment may be needed for issues
- Additional review recommended for major milestone completion