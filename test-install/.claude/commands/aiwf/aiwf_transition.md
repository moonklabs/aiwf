# Workflow Transition Management

Systematically manage transitions to the next phase when Sprints or Milestones are completed. Perform not just state changes, but completion verification, next phase preparation, and automated transitions.

## Key Features

- **Completion Verification**: Verify actual completion of Sprint/Milestone
- **Automatic Transition**: Auto-activate next phase when conditions are met
- **Preparation Work**: Perform prerequisite work for next phase
- **Consistency Assurance**: Proper transitions according to workflow rules

## Transition Types

### 1. Task Transitions
- pending → in_progress → review → completed
- Handle blocking states (blocked, paused)
- Auto-activate dependent tasks

### 2. Sprint Transitions
- planning → active → completed
- Sequential Sprint transitions (S01 → S02 → S03)
- 80% rule: Prepare next when previous Sprint 80% complete

### 3. Milestone Transitions
- planning → active → completed
- Milestone completes when all Sprints complete
- Next Milestone starts manually (review required)

## Execution Process

### 1. Current State Analysis

**Check Transition Possibility:**
```javascript
const transitionAnalysis = {
  currentState: getCurrentState(),
  completionStatus: checkCompletion(),
  nextStageReady: checkNextStageReadiness(),
  blockingIssues: findBlockers()
};
```

### 2. Sprint Completion Transition

**Sprint Completion Execution Process:**

#### 2.1 Completion Criteria Verification
```markdown
✅ Sprint Completion Checklist:
- [ ] All required tasks completed (required: true)
- [ ] Test pass rate ≥ 80%
- [ ] Code reviews completed
- [ ] Documentation updated
- [ ] Sprint goals achieved
```

#### 2.2 Sprint Closure Tasks
```markdown
## Sprint S02 Closure Process

1. **Generate Performance Summary**
   - Completed tasks: 5/5
   - Key achievements: API implementation, auth system
   - Unresolved issues: Performance optimization needed

2. **Sprint Review Document**
   - File: .aiwf/10_STATE_OF_PROJECT/S02_review.md
   - Contents: Achievements, lessons, improvements

3. **Archiving**
   - Sprint status: active → completed
   - Record completion date
   - Calculate actual time spent
```

#### 2.3 Next Sprint Preparation
```markdown
## Sprint S03 Preparation Process

1. **Verify Prerequisites**
   - S02 completion status ✓
   - S03 folder exists ✓
   - Sprint meta file check

2. **Initial Setup**
   - S03 status: planning → active
   - Set start date
   - Set target duration

3. **Determine Task Creation Need**
   - Existing tasks: Review and adjust
   - No tasks: Start creation process
   
4. **Resource Allocation**
   - Assign team members
   - Set priorities
   - Map dependencies
```

### 3. Milestone Completion Transition

**Milestone Completion Execution Process:**

#### 3.1 Completion Criteria Verification
```markdown
✅ Milestone Completion Checklist:
- [ ] All Sprints completed (3/3)
- [ ] Milestone goals achieved
- [ ] Business value verified
- [ ] Quality standards met
- [ ] Stakeholder approval
```

#### 3.2 Milestone Closure Tasks
```markdown
## Milestone M01 Closure Process

1. **Final Achievement Report**
   - Goal achieved: Basic authentication system built
   - Completed Sprints: S01, S02, S03
   - Total tasks: 15 completed
   - Duration: 6 weeks

2. **Retrospective & Lessons**
   - Successes: Systematic progress
   - Improvements: Initial planning accuracy
   - Apply next: Add buffer time

3. **Deliverables Organization**
   - Code: 15 modules
   - Docs: API docs, user guide
   - Tests: Unit/integration tests
```

#### 3.3 Next Milestone Preparation
```markdown
## Milestone M02 Preparation Process

1. **Dependency Check**
   - M01 completion required ✓
   - Resources secured
   - Team readiness

2. **Initial Planning**
   - Set goals
   - Sprint composition (S04, S05, S06)
   - Estimate duration

3. **Kickoff Preparation**
   - Stakeholder meeting
   - Finalize requirements
   - Define initial tasks
```

### 4. Execute Automated Actions

**Actions Auto-executed During Transitions:**

```javascript
// On Sprint completion
const sprintCompletionActions = [
  "generateSprintReport()",
  "archiveCompletedTasks()",
  "updateMilestoneProgress()",
  "activateNextSprint()",
  "notifyStakeholders()",
  "createCheckpoint()"
];

// On Milestone completion
const milestoneCompletionActions = [
  "generateMilestoneReport()",
  "conductRetrospective()",
  "archiveMilestone()",
  "prepareNextMilestone()",
  "updateProjectDashboard()",
  "triggerCelebration()"
];
```

### 5. Transition Validation and Rollback

**Validation for Safe Transitions:**

```markdown
## Transition Validation

### Pre-validation
- [ ] All requirements met
- [ ] Data consistency verified
- [ ] Backup created

### Execute Transition
- [ ] State change
- [ ] Run automated actions
- [ ] Send notifications

### Post-validation
- [ ] Verify new state
- [ ] System stability
- [ ] Rollback ready

### Rollback (if needed)
- Restore previous state
- Undo executed actions
- Analyze cause and retry
```

## Output Format

### Sprint Transition Success
```
🔄 Starting Sprint transition process...

✅ S02 Completion Verification:
- Required tasks: 5/5 completed ✓
- Test pass rate: 92% ✓
- Sprint goals achieved ✓

📊 S02 Final Performance:
- Completed tasks: 5
- Total hours spent: 40
- Team efficiency: 110%

🚀 S03 Activation:
- Status: planning → active
- Task preparation: 3 need creation
- Expected duration: 2 weeks

✅ Sprint transition complete!
Next action: /aiwf:create_sprint_tasks S03
```

### Milestone Transition Success
```
🎯 Starting Milestone transition process...

✅ M01 Completion Verification:
- Sprints completed: 3/3 ✓
- Goal achieved: Auth system built ✓
- Quality verified: Passed ✓

📊 M01 Final Performance:
- Duration: 6 weeks (1 week under plan)
- Completed tasks: 15
- Business value: High

🎉 M01 successfully completed!

📋 M02 Preparation Status:
- Goal: Advanced features implementation
- Planned Sprints: 3
- Expected duration: 8 weeks

💡 Recommendation: Conduct M01 retrospective before starting M02
```

## Usage Scenarios

### 1. On Sprint Completion
```bash
# Check Sprint completion
/aiwf:check_state
# S02: 100% complete confirmed

# Execute Sprint transition
/aiwf:transition sprint S02
# → Automatically closes S02, activates S03
```

### 2. On Milestone Completion
```bash
# Check Milestone status
/aiwf:project_status
# M01: All Sprints complete confirmed

# Milestone transition
/aiwf:transition milestone M01
# → Close M01, prepare M02
```

### 3. Force Transition (Exceptional Cases)
```bash
# Force transition (use with caution)
/aiwf:transition sprint S02 --force
# → Transition ignoring completion criteria
# ⚠️ Warning message displayed
```

## Important Notes

- Transitions are difficult to reverse, execute carefully
- Use force transitions only in exceptional cases
- All transitions are logged
- Verify results even with automatic transitions

## Related Commands

- `/aiwf:workflow_context` - Check current workflow state
- `/aiwf:validate_workflow` - Verify workflow consistency
- `/aiwf:create_sprint_tasks` - Create Sprint tasks
- `/aiwf:milestone_review` - Milestone review

This command ensures projects progress systematically and advance to the next phase only when each phase is properly completed.