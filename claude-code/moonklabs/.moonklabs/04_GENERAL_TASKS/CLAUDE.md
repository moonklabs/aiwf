# General Tasks Instructions

## General Task Structure

General tasks are standalone work items not tied to sprints:

- Files follow pattern: `T<NNN>_<Description>.md`
- Completed tasks: `TX<NNN>_<Description>.md`

Always use the template at `.AIWF/99_TEMPLATES/task_template.md` when creating new general tasks.

## Task Formatting

General tasks use standardized YAML frontmatter and sections:

```yaml
---
task_id: T001
status: open # open | in_progress | pending_review | done | failed | blocked
complexity: Medium # Low | Medium | High
last_updated: YYYY-MM-DD HH:MM
github_issue: #123 # Optional: Link to GitHub issue
---
```

The full task structure with all sections is defined in the task template. Always maintain this structure.

## Working with General Tasks

When handling general tasks:

1. Check if task has a linked GitHub issue (look for `github_issue` in frontmatter)
2. Update the status field as you progress
3. If GitHub issue is linked, update it when starting:
   ```bash
   gh issue comment {issue_number} --body "🚀 Task work has started."
   gh issue edit {issue_number} --add-label "in-progress"
   ```
4. Record timestamps in this format (YYYY-MM-DD HH:MM)
5. Log all significant actions in the Output Log section:

   ```plaintext
   [YYYY-MM-DD HH:MM] Started task
   [YYYY-MM-DD HH:MM] Modified files: file1.js, file2.js
   ```

6. Mark subtasks as they're completed: `- [x] Completed subtask`
7. Use the Acceptance Criteria as your primary completion checklist
8. Ensure all sections from the task template are preserved

## Task Completion Process

When a task is complete:

1. Update status to "done"
2. Update all Acceptance Criteria with [x]
3. Add final Output Log entry
4. If GitHub issue is linked, update it:
   ```bash
   gh issue comment {issue_number} --body "✅ Task has been completed."
   gh issue edit {issue_number} --remove-label "in-progress" --add-label "completed"
   ```
5. Rename file from T... to TX... (e.g., `TX001_Task_Name.md`)

## GitHub Integration

### Creating Issues from Tasks

To create a GitHub issue from a general task:

```bash
/project:aiwf:issue_create {task_id}
```

### Linking Existing Issues

Add to task frontmatter:

```yaml
github_issue: #123
```

### Commit Integration

When committing changes for a task with a linked issue:

- Use `fixes #123` to auto-close the issue
- Use `relates to #123` to reference without closing

### Pull Request Creation

After task completion, create a PR:

```bash
/project:aiwf:pr_create {task_id}
```
