# YOLO 모드에서 모든 열린 태스크 실행

This mode is meant to be run without user interaction.
You **DO NOT** ask the user any questions or ask for confirmation
If in doubt you **RESEARCH** and **ULTRATHINK** about the best solution.

**IMPORTANT** you try not to stop at any certain point but do so if you need after thoughtful consideration.

Priority is to get the work completed.

## Mode Selection

Check <$ARGUMENTS>:

- If sprint ID provided (e.g., S03): Work ONLY on that sprint
- If `sprint-all` provided: Execute ALL sprints sequentially until completion
- If `milestone-all` provided: Execute ALL milestones (including all their sprints) until completion
- If `worktree` provided: Use worktree mode (no branch creation, direct push)
- If empty: Work on general tasks first, then active sprint tasks

**Report Mode** to the User!

## Safety Guidelines

- **NEVER** modify critical files (.env, alembic migrations, production configs)
- **STOP** if you encounter database schema changes
- **STOP** if you need to delete more than 5 files
- **STOP** if tests are failing after your changes
- **ALWAYS** run tests after implementing a task

## Follow this exact process

You need to stick to this process and **PRECISELY** follow it

Before you start:

- Run tests to ensure clean baseline using test.md command (@.claude/commands/moonklabs/aiwf_test.md)
- **If** FAIL rate is above 10% asses if a fix is possible. If so, fix and move on. If not, move on anyways.

- Check git status to ensure clean working directory
- **If** git status is not clean just remember and report to the user at the end, but move on.

Also consider <$ARGUMENTS> - if anything between <> can be considered additional instructions, prioritize them in the process.

Get the current datetime stamp from the system and remember it

### FIND OPEN WORK

Execute based on mode:

**If Sprint ID provided in arguments:**

- Navigate to .moonklabs/03_SPRINTS/{sprint_id}/
- Check if sprint has tasks (T\*.md files)
- If NO tasks exist:
  - Check for sprint meta file
  - If meta exists: Jump to ### CREATE SPRINT TASKS
  - If no meta: Exit with error - sprint doesn't exist
- If tasks exist: Continue to **Task selection** section below

**If `sprint-all` in arguments:**

- Scan ALL sprints in .moonklabs/03_SPRINTS/ directory
- Create ordered list of ALL sprints (S01, S02, S03, ...)
- For each sprint in sequence:
  - Check if sprint has tasks, if not create them
  - Execute ALL tasks in current sprint before moving to next
  - Mark sprint as completed when all tasks done
- Continue until ALL sprints are 100% completed
- Priority: Complete current sprint entirely before starting next

**If `milestone-all` in arguments:**

- Scan ALL milestones in .moonklabs/01_MILESTONES/ directory
- For each milestone in sequence:
  - Identify all related sprints for this milestone
  - Execute ALL sprints related to current milestone
  - Execute ALL tasks in each sprint
  - Mark milestone as completed when all related work done
- Continue until ALL milestones are 100% completed
- Priority: Complete current milestone entirely before starting next

**If NO arguments (general mode):**

- Use PARALLEL SUBAGENTS to check:
  - .moonklabs/04_GENERAL_TASKS for open general tasks
  - .moonklabs/00_PROJECT_MANIFEST.md for currently active sprint
  - .moonklabs/03_SPRINTS/ for any sprint with only meta file
- Priority order:
  1. General tasks (if any open)
  2. Active sprint tasks (if any open)
  3. Sprint needing task creation (if found) - maintain order of Sprints

**Task Selection:**

- From found tasks, select ONE that is not completed. Take the lowest ID in Sprint or General Tasks
- Skip tasks you've previously attempted (check OUTPUT LOG)
- If no suitable task found and no sprint needs tasks: Exit gracefully

### CREATE SPRINT TASKS

**ONLY EXECUTE** if sprint needs task creation

- Use a **SUBAGENT** and have it include @.claude/commands/moonklabs/aiwf_create_sprint_tasks.md with Sprint ID as argument
- Wait for completion
- After task creation move back to `### FIND OPEN WORK`

### WORK ON TASK

- if you have touched this task before ignore it and jump to the next task
- if you can't find a task that you have not tried fixing before jump to ### EXECUTE PROJECT REVIEW
- if you find a task that you cannot fix because the work was done already, close the task and note in Output Log of task.
- **BEFORE STARTING**:
  - **If** `worktree` NOT in arguments: Create a git branch for the task: `git checkout -b task/<task-id>`
  - **If** `worktree` in arguments: Skip branch creation (worktree mode)
- **GitHub Issue Creation (Optional):**
  - If task doesn't have a `github_issue` field
  - Use SUBAGENT to include @.claude/commands/moonklabs/aiwf_issue_create.md to create issue
- **USE A SUBAGENT** and have it include @.claude/commands/moonklabs/aiwf_do_task.md with the Task ID as Argument to execute the Task.
- **AFTER TASK COMPLETION**: Run tests to verify nothing broke using test.md command (@.claude/commands/moonklabs/aiwf_test.md)
- on any failure in the task execution assess the severity of the error:
  - CRITICAL errors (breaking tests, security issues, data loss risk): **FIX PROBLEMS**
  - NON-CRITICAL errors (linting, formatting, minor issues): note in OUTPUT LOG and continue
- on success move on

### COMMIT WORK

- **ONLY IF** tests are passing and no critical issues exist
- **USE A SUBAGENT** and have it include @.claude/commands/moonklabs/aiwf_commit.md with the Task ID as Argument and YOLO as additional argument
- on any failure when committing, note the problem in the OUTPUT LOG of the task and continue
- after successful commit,
  - **If** `worktree` NOT in arguments: after successful commit, merge to main: `git checkout main && git merge task/<task-id>`
  - **If** `worktree` in arguments: after successful commit, push changes: `git push`
- **Pull Request Creation (Optional):**
  - If GitHub issue is linked to the task
  - Use SUBAGENT to include @.claude/commands/moonklabs/aiwf_pr_create.md to create PR
- **IMMEDIATELY** go back to `### FIND OPEN WORK` to continue with next task

### CONTINUOUS EXECUTION LOOP

**⚡ YOLO MODE: NO STOPPING UNTIL COMPLETION**

**This is the main execution loop - DO NOT EXIT EARLY**

**Sprint-specific mode:**

- **LOOP UNTIL** ALL tasks in the specified sprint are completed
- After each commit, **IMMEDIATELY** go back to `### FIND OPEN WORK`
- **ONLY** move to project review when sprint is 100% complete
- **NEVER** ask for user input or confirmation

**Sprint-all mode:**

- **LOOP UNTIL** ALL sprints are 100% completed
- For each sprint: Complete ALL tasks before moving to next sprint
- After each commit, **IMMEDIATELY** go back to `### FIND OPEN WORK`
- Track progress: Current sprint X of Y total sprints
- **NEVER** skip incomplete sprints
- **ONLY** exit when ALL sprints are fully completed

**Milestone-all mode:**

- **LOOP UNTIL** ALL milestones are 100% completed
- For each milestone: Complete ALL related sprints and tasks
- After each commit, **IMMEDIATELY** go back to `### FIND OPEN WORK`
- Track progress: Current milestone X of Y total milestones
- **NEVER** skip incomplete milestones or their dependencies
- **ONLY** exit when ALL milestones are fully achieved

**General mode:**

- **LOOP CONTINUOUSLY** through:
  1. Complete ALL available general tasks
  2. Then move to active sprint tasks
  3. Complete ALL active sprint tasks
  4. Check for new sprints or tasks created
  5. Repeat until NO more work available
- After each commit, **IMMEDIATELY** go back to `### FIND OPEN WORK`
- **ONLY** exit when absolutely no work remains

**Stopping Conditions (ONLY stop if ALL are true):**

- NO pending tasks in target scope
- NO tasks that can be auto-fixed
- NO sprints needing task creation
- Project review passes with NO new tasks created

## EXECUTE PROJECT REVIEW

- **USE A SUBAGENT** and have it include @.claude/commands/moonklabs/aiwf_project_review.md
- Depending on the results of the review:
  - On FAIL: Think about possible fixes.
  - If fixes are quickly done, fix right away and repeat `## EXECUTE PROJECT REVIEW``
  - If fixes are more complex **USE A SUBAGENT** and have it include @.claude/commands/moonklabs/aiwf_create_general_task.md to create new general tasks as needed.
  - Go back to `### FIND OPEN WORK` to work on these fixes
  - On PASS: move on

## CONTINUATION CHECK

**⚡ MANDATORY CONTINUATION LOGIC**

**Check for remaining work:**

- Scan for ANY pending tasks in current scope
- Check if project review created new tasks
- Verify if any sprints need task creation

**Decision Matrix:**

**Sprint-specific mode:**

- **IF** sprint has ANY pending tasks → Go back to `### FIND OPEN WORK`
- **IF** sprint is 100% complete → Move to `## CREATE SUMMARY`

**Sprint-all mode:**

- **IF** ANY sprint has pending tasks → Go back to `### FIND OPEN WORK`
- **IF** ANY sprint needs task creation → Go back to `### FIND OPEN WORK`
- **IF** ALL sprints are 100% complete → Move to `## CREATE SUMMARY`

**Milestone-all mode:**

- **IF** ANY milestone has incomplete sprints → Go back to `### FIND OPEN WORK`
- **IF** ANY milestone-related tasks pending → Go back to `### FIND OPEN WORK`
- **IF** ALL milestones are 100% complete → Move to `## CREATE SUMMARY`

**General mode:**

- **IF** ANY general tasks pending → Go back to `### FIND OPEN WORK`
- **IF** ANY sprint tasks pending → Go back to `### FIND OPEN WORK`
- **IF** ANY sprints need task creation → Go back to `### FIND OPEN WORK`
- **IF** project review failed and created new tasks → Go back to `### FIND OPEN WORK`
- **ONLY IF** absolutely NO work remains → Move to `## CREATE SUMMARY`

**🚨 CRITICAL: Do NOT move to summary unless 100% certain no work remains**

## CREATE SUMMARY

- Get current datetime stamp from the system and compare to initially remembered timestamp. Calculate duration of the process.

### GENERATE PROJECT STATUS REPORT

**Gather Project Status Data:**

- Scan `.moonklabs/01_MILESTONES/` for milestone completion status
- Scan `.moonklabs/03_SPRINTS/` for all sprint status and task completion
- Scan `.moonklabs/04_GENERAL_TASKS/` for general task completion
- Count completed vs total tasks for each category

**Create Visual Progress Report:**

```
=== MOONKLABS PROJECT STATUS REPORT ===

🎯 MILESTONES PROGRESS:
[▓▓▓▓▓▓▓░░░] 70% (7/10 completed)
M01: ✅ Setup & Architecture
M02: ✅ Core Features
M03: ✅ Authentication
M04: 🔄 In Progress - API Development
M05: ⏳ Pending - Frontend Integration

📊 SPRINT PROGRESS:
[▓▓▓▓▓▓░░░░] 60% (3/5 sprints completed)
S01: ✅ Complete (12/12 tasks)
S02: ✅ Complete (8/8 tasks)
S03: 🔄 Active (5/9 tasks completed)
S04: ⏳ Planned (0/0 tasks)
S05: ⏳ Planned (0/0 tasks)

⚡ GENERAL TASKS:
[▓▓▓▓▓▓▓▓░░] 80% (16/20 completed)

📈 OVERALL PROJECT HEALTH:
[▓▓▓▓▓▓▓░░░] 73% Complete
```

**Create Summary Report including:**

- Mode executed (Sprint-specific, Sprint-all, Milestone-all, or General)
- Sprint tasks created (if applicable)
- Number of tasks completed this session
- Number of tasks skipped/failed this session
- Total duration of YOLO session
- Current project completion percentage
- Sprints completed (if sprint-all mode)
- Milestones achieved (if milestone-all mode)
- Any critical issues encountered
- Current test status
- Next recommended action
- Top 3 priority items for next session

**Report the complete status to the user including:**

- Visual progress graphs
- Session summary
- Project health overview
- Recommended next steps

Your work is done. Thank you.
