# Project Status Check

Comprehensively check the current project's milestone, sprint, and task progress and generate a visual status report.

## Execution Process

### 1. Project Structure Analysis

**Use parallel sub-agents to scan the following directories:**

- `.aiwf/00_PROJECT_MANIFEST.md` - Project basic info and current status
- `.aiwf/02_REQUIREMENTS/` - Milestone requirements analysis
- `.aiwf/03_SPRINTS/` - All sprint status and task completion analysis
- `.aiwf/04_GENERAL_TASKS/` - General task completion analysis
- `.aiwf/10_STATE_OF_PROJECT/` - Recent project state records

### 2. Milestone Progress Analysis

**Milestone Data Collection:**
- Scan all milestone folders in `.aiwf/02_REQUIREMENTS/` directory
- Analyze metadata files (`M##_milestone_meta.md`) for each milestone
- Check completion status for each milestone:
  - ✅ **Completed**: All related sprints are 100% complete
  - 🔄 **In Progress**: Some sprints are in progress
  - ⏳ **Pending**: Not yet started
  - ❌ **Blocked**: Cannot proceed due to dependency issues

**Milestone Completion Rate Calculation:**
- Identify number of sprints belonging to each milestone
- Calculate milestone completion rate by completed sprint ratio
- Calculate ratio of completed milestones to total milestones

### 3. Sprint Progress Analysis

**Sprint Data Collection:**
- Scan all sprint folders in `.aiwf/03_SPRINTS/` directory
- Analyze metadata files (`S##_sprint_meta.md`) for each sprint
- Check count and status of task files (`T*.md`) within sprints

**Sprint Status Classification:**
- ✅ **Completed**: All tasks completed and sprint closed
- 🔄 **Active**: Currently in progress (some tasks completed)
- ⏳ **Planned**: Tasks created but not started
- 📝 **Preparing**: Only meta file exists, tasks not created

**Sprint Completion Rate Calculation:**
- Total tasks vs completed tasks per sprint
- Calculate average sprint completion rate
- Detailed progress of currently active sprint

### 4. General Task Progress Analysis

**General Task Data Collection:**
- Scan all task files in `.aiwf/04_GENERAL_TASKS/` directory
- Check completion status of each task file
- Analyze task priority and categories

**Task Status Classification:**
- ✅ **Completed**: Completion marked in OUTPUT LOG
- 🔄 **In Progress**: Work started but incomplete
- ⏳ **Pending**: Not yet started tasks
- ❌ **Blocked**: Cannot proceed due to dependencies or technical issues

### 5. Visual Progress Report Generation

**Overall Project Status Dashboard:**

```
=== 🏗️ AIWF Project Status Dashboard ===
Generated: {current date and time}

🎯 Milestone Progress:
[▓▓▓▓▓▓▓░░░] {completion rate}% ({completed} of {total} completed)
M01: ✅ {milestone name} - Completed
M02: 🔄 {milestone name} - In Progress ({progress rate}%)
M03: ⏳ {milestone name} - Pending
...

📊 Sprint Progress:
[▓▓▓▓▓▓░░░░] {completion rate}% ({completed} of {total} sprints completed)
S01: ✅ Complete ({completed tasks}/{total tasks} tasks)
S02: 🔄 Active ({completed tasks}/{total tasks} tasks) - Currently in progress
S03: ⏳ Planned ({total tasks} tasks pending)
S04: 📝 Preparing - Task creation needed
...

⚡ General Tasks:
[▓▓▓▓▓▓▓▓░░] {completion rate}% ({completed} of {total} completed)
High Priority: {completed}/{total}
Medium Priority: {completed}/{total}
Low Priority: {completed}/{total}

📈 Overall Project Status:
[▓▓▓▓▓▓▓░░░] {overall completion rate}% Complete
```

### 6. Detailed Analysis Report Generation

**Current Status Summary:**
- **Active Work**: Currently in-progress sprints and tasks
- **Blockers**: Issues preventing progress
- **Next Steps**: Immediately actionable work items

**Performance Metrics:**
- **Completion Velocity**: Recently completed tasks/sprints count
- **Productivity Metrics**: Average task completion time
- **Quality Metrics**: Test pass rate, code review status

**Risk Analysis:**
- **Schedule Delays**: Current progress vs expected timeline
- **Technical Debt**: Technical issues requiring resolution
- **Dependency Issues**: External dependency blockers

### 7. Action Items and Recommendations

**Immediately Actionable Work:**
```
🚀 Recommended Next Actions:
1. {specific next task}
2. {blocker that needs resolution}
3. {high priority general task}

⭐ This Week's Goals:
- [ ] {major goal 1}
- [ ] {major goal 2}
- [ ] {major goal 3}

📋 Backlog Priorities:
1. {high priority item}
2. {medium priority item}
3. {low priority item}
```

### 8. Recent Activity Summary

**Recently Completed Work:**
- Analyze latest status files in `.aiwf/10_STATE_OF_PROJECT/` directory
- List of tasks and sprints completed in the past week
- Actual work progress linked with Git commit logs

**Change Trends:**
- Completion rate change trends
- Productivity change patterns
- Problem resolution speed

### 9. Predictions and Planning

**Completion Predictions:**
- Expected project completion date based on current progress
- Expected completion timing for each milestone
- Resource and time requirement analysis

**Planning Adjustment Suggestions:**
- Schedule optimization approaches
- Resource reallocation suggestions
- Scope adjustment necessity review

## Output Format

Output the entire report in Markdown format while maintaining the following structure:

1. **Dashboard** - Core metrics visualization
2. **Detailed Analysis** - Detailed status by area
3. **Action Items** - Specific next steps
4. **Predictions and Planning** - Future outlook

## Usage

```bash
# Basic status check
/project:aiwf:project_status

# CLI command (future implementation)
aiwf status
aiwf project status
```

## Important Notes

- Verify actual file existence and provide warnings for missing structures
- Accurately reflect actual completion status in progress calculations
- Detect and report inconsistencies between current Git state and documented state
- Use visual representations that are easy for users to understand

This command aims to help project managers get a comprehensive view of the entire project situation at a glance and make informed decisions about next actions.