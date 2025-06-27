# $Argument 기반 Moonklabs 태스크 처리

**IMPORTANT:** Follow from Top to Bottom - don't skip anything!

**CREATE A TODO LIST** with exactly these 8 items

1. Analyse scope from argument
2. Identify task file
3. Analyse the task
4. Set status to in_progress
5. Execute task work
6. Placeholder
7. Execute Code review
8. Finalize Task status

## 1 · Analyse scope from argument

<$ARGUMENTS> ⇒ Task ID, Sprint ID, or empty (select next open task in current sprint).

## 2 · Identify task file

Search .moonklabs/03_SPRINTS/ and .moonklabs/04_GENERAL_TASKS/.
If no open task matches, pause and ask the user how to proceed.

## 3 · Analyse the task

Read the task description. If anything is unclear, ask clarifying questions before continuing.

**CRITICAL CONTEXT VALIDATION:** Before executing any task spin up Parallel Subagents for these tasks:

1. **Sprint Context:** Confirm task belongs to current sprint scope
2. **Dependencies:** Check if any dependent tasks need to be completed first
3. **Requirements:** Read relevant requirements docs in `.moonklabs/02_REQUIREMENTS/`
4. **Scope Verification:** Ensure task aligns with current sprint objectives
5. **GitHub Issue Check:** Check if task file has a `github_issue` field

**IMPORTANT:** If task references functionality from future sprints or has unmet dependencies, pause and ask for clarification.

**GitHub Issue Creation (Optional):**
- If task doesn't have a GitHub issue and user wants issue tracking
- Suggest using `/project:moonklabs:issue_create {task_id}` command

## 4 · Set status to in_progress

- Find out the current local timestamp (YYYY-MM-DD HH:MM).
- Update front-matter to **status: in_progress** and set Updated time
- Update ./moonklabs/00_PROJECT_MANIFEST.md to set task in progress, updated time and current Sprint Status.
- **GitHub Issue Update (if exists):**
  ```bash
  gh issue comment {issue_number} --body "🚀 Task work has started."
  gh issue edit {issue_number} --add-label "in-progress"
  ```

## 5 · Execute task work

- Follow Description, Goal and Acceptance Criteria.
- Consult supporting docs in .moonklabs/01_PROJECT_DOCS/ and .moonklabs/02_REQUIREMENTS/.
- Iterate over subtasks:
  1. Pick the next incomplete subtask.
  2. Implement the required changes, consulting docs as needed.
  3. Mark the subtask done.
  4. Append a log entry to **## Output Log** using the format `[YYYY-MM-DD HH:MM]: <message>`.
  5. Repeat until all subtasks are complete.

## 6 · Placeholder

Placeholder - just move on to the next step

## 7 · Execute Code Review

Follow these steps for a Code Review (in order)

- include @.claude/commands/moonklabs/code_review.md and use the Task ID as Scope.
- Follow the instructions in the file to run a code review in **PARALLEL SUBAGENTS**
- When done continue acting on the results accordingly
- Understand and think about the results
- on **FAIL**
  - thoroughly understand the problem
  - extend the Current Task with the Subtasks identified by the review
  - go back to "5 · Execute task work"
- on **PASS**
  - move on to next step

## 8 · Finalize task status

- set the Task status to **completed**
- Rename the Task file accordingly to enable proper Completed recognition from the filename (TX[TASK_ID]...)
- Update .moonklabs/00_PROJECT_MANIFEST.md to reflect the new status
- **GitHub Issue Update (if exists):**
  ```bash
  gh issue comment {issue_number} --body "✅ Task has been completed."
  gh issue edit {issue_number} --remove-label "in-progress" --add-label "completed"
  ```
- **Report** the result to the user

  ✅ **Result**: Quick statement of success

  🔎 **Scope**: Identified task or reason none was processed

  💬 **Summary**: One-paragraph recap of what was done or why blocked

  ⏭️ **Next steps**: Recommended follow-up actions

- **Suggestions** for the User:

  - 🛠️ Use /project:moonklabs:commit `TASK_ID` to commit the changes to git
  - 🔀 Use /project:moonklabs:pr_create `TASK_ID` to create a Pull Request
  - 🧹 Use /clear to clear the context before starting the next Task
