# Feature State Transition Diagram

This document defines the state transitions and rules for Feature Ledger entries.

## State Definitions

### 1. **active** 
- Feature is currently being developed
- Has active resources assigned
- Work is in progress
- Appears in sprint boards and active dashboards

### 2. **completed**
- All acceptance criteria have been met
- Code has been merged to main branch
- All tests are passing
- Documentation has been updated
- Feature is ready for production

### 3. **paused**
- Work has been temporarily halted
- Resources have been reallocated
- Reason for pause is documented
- Can be resumed later

### 4. **archived**
- Feature is no longer relevant
- Kept for historical reference only
- Cannot be transitioned to other states
- Excluded from active reports and dashboards

## State Transition Diagram

```
┌─────────┐
│  START  │
└────┬────┘
     │
     ▼
┌─────────┐      pause        ┌─────────┐
│         ├──────────────────►│         │
│ active  │                   │ paused  │
│         │◄──────────────────┤         │
└────┬────┘      resume       └────┬────┘
     │                             │
     │ complete                    │ abandon
     │                             │
     ▼                             │
┌─────────┐                        │
│completed│                        │
└────┬────┘                        │
     │                             │
     │ archive                     │
     │                             │
     ▼                             ▼
┌─────────────────────────────────┐
│           archived              │
└─────────────────────────────────┘
```

## Transition Rules

### From **active**:
- **→ completed**: When all work is done and acceptance criteria met
- **→ paused**: When work needs to be temporarily halted
- **→ archived**: When feature is abandoned or no longer needed

### From **paused**:
- **→ active**: When work resumes
- **→ archived**: When decision made not to continue

### From **completed**:
- **→ archived**: When feature is retired or superseded

### From **archived**:
- No transitions allowed (terminal state)

## Transition Triggers and Conditions

### active → completed
**Triggers:**
- All checklist items marked as complete
- All linked tasks have status "completed"
- Code review approved and merged
- Tests passing in CI/CD

**Validation:**
- `checklist_items_completed == checklist_items_total`
- `actual_completion` date is set
- All linked PRs have status "merged"

**Actions:**
- Set `actual_completion` to current date
- Update `progress_percentage` to 100
- Notify stakeholders
- Update milestone progress

### active → paused
**Triggers:**
- Resource reallocation needed
- Blocking dependencies identified
- Strategic priority change
- Technical blockers discovered

**Validation:**
- Pause reason documented in `notes`
- `known_issues` updated if applicable

**Actions:**
- Add pause reason to activity log
- Notify assignee and stakeholders
- Update sprint planning

### paused → active
**Triggers:**
- Resources become available
- Blocking dependencies resolved
- Priority restored
- Technical issues resolved

**Validation:**
- Assignee available
- Dependencies cleared

**Actions:**
- Notify assignee to resume work
- Update sprint allocation
- Clear pause reason from notes

### Any → archived
**Triggers:**
- Feature deprecated
- Business requirements changed
- Superseded by another feature
- Project cancelled

**Validation:**
- Archive reason documented
- No active dependencies

**Actions:**
- Move file to `archived/` directory
- Update all dependent features
- Remove from active reports
- Final notification to stakeholders

## State Management Commands

### Check Current State
```bash
/project:aiwf:feature_status FL001
```

### Transition State
```bash
/project:aiwf:update_feature_status FL001 completed
```

### Validate Transition
```bash
/project:aiwf:validate_feature_transition FL001 active completed
```

## Automation Rules

1. **Auto-pause** if no activity for 30 days
2. **Auto-archive** completed features after 90 days
3. **Alert** when paused features exceed 14 days
4. **Block** invalid transitions with error messages
5. **Log** all transitions with timestamp and user

## Reporting

### State Distribution Report
- Shows count and percentage by state
- Identifies stale features
- Tracks state transition velocity

### Transition History
- Audit trail of all state changes
- Average time in each state
- Transition patterns analysis

## Best Practices

1. **Document Transitions**: Always add a note explaining why a state change occurred
2. **Review Before Archiving**: Ensure no valuable work is lost
3. **Regular State Reviews**: Weekly review of paused features
4. **Clear Dependencies**: Update blocked features when completing dependencies
5. **Timely Updates**: Change state as soon as conditions are met