# Check Current State

Check and visually display the current project state from the central state index. Essential for AI to understand the full context before starting work.

## Key Features

- **Project Overview**: Current milestone, sprint, and phase
- **Current Focus**: Active task and context
- **Progress Metrics**: Completion rates, task distribution, velocity
- **Next Actions**: AI-recommended task list
- **Sprint Status**: Detailed active sprint information

## Displayed Information

### 1. Project Information
```
📋 Project Information:
  Name: My AIWF Project
  Current Milestone: M01
  Active Sprint: S02
  Phase: implementation
  Last Updated: 2025-01-22 16:30:00
```

### 2. Current Focus
```
🎯 Current Focus:
  Primary Task: T03_S02_M01 - Implement User Authentication API
  Status: in_progress
  Progress: 45%
  Next Step: register endpoint validation
```

### 3. Overall Metrics
```
📊 Metrics:
  Total Tasks: 15
  Completed: 8 (53%)
  In Progress: 2 (13%)
  Pending: 4 (27%)
  Blocked: 1 (7%)

  Overall Progress: [████████████░░░░░░░░] 53%
```

### 4. Recommended Actions
```
🚀 Next Actions:
  1. 🔴 Complete T03 register endpoint (2 hours)
  2. 🟡 Write T03 unit tests (3 hours)
  3. 🟢 Prepare T04 API documentation review (1 hour)
```

### 5. Active Sprints
```
📅 Active Sprints:
  S02: Core Feature Development
    Progress: [████████░░░░░░░░░░░░] 40%
    Tasks: 1/3 completed
    Est. Completion: 2025-01-28
```

## Usage Scenarios

### 1. Pre-work State Assessment
```bash
# Start AI session
/aiwf:check_state
# → Understand overall situation
# → Check previous work context
# → Decide next action
```

### 2. Progress Monitoring
```bash
# Periodic state check
/aiwf:check_state
# → Check progress changes
# → Identify blockers
# → Adjust priorities
```

### 3. Decision Support
```bash
# Choose next task
/aiwf:check_state
# → Review AI recommendations
# → Priority-based selection
# → Efficient work order
```

## Advanced Features

### AI Context Information
```
🤖 AI Context:
  Last Session: 2025-01-22 15:00:00
  Session Count: 12
  Learned Patterns:
    - Preferred Testing: jest with supertest
    - Code Style: eslint-airbnb
    - Commit Pattern: conventional-commits
```

### Velocity Analysis
```
📈 Velocity:
  Last Week: 2 tasks/week
  Average: 1.5 tasks/week
  Estimated Completion: 2025-02-15
```

### Risk Factors
```
⚠️ Attention Needed:
  - T05 blocked (3 days)
  - S03 not yet planned
  - Test coverage below 60%
```

## CLI Command

```bash
# Check current state
aiwf state show

# Alias
aiwf state s
```

## Usage Examples

### Basic State Check
```bash
/aiwf:check_state
```

### Check After Update
```bash
# 1. Update to latest state
/aiwf:update_state

# 2. Check updated state
/aiwf:check_state
```

### Check After Task Focus
```bash
# 1. Focus on task
aiwf state focus T03_S02_M01

# 2. Check focused state
/aiwf:check_state
```

## Output Customization

Coming soon:
- `--verbose`: More detailed information
- `--json`: JSON format output
- `--sprint S02`: Specific sprint only
- `--metrics`: Show metrics only

## Important Notes

- Requires state index; run `update_state` first if missing
- Shows information from last update, not real-time
- Large projects may take time to display

## Related Commands

- `/aiwf:update_state` - Update state index
- `/aiwf:project_status` - More detailed project analysis
- `/aiwf:yolo` - State-based automated task execution

This command is an essential tool that helps AI always see the big picture and make optimal decisions.