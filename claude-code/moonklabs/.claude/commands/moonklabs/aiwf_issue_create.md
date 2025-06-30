# Create GitHub Issue from Task

Automatically create a GitHub issue based on a task file.

## Create TODO with EXACTLY these 5 items

1. Parse task file and extract information
2. Generate issue template
3. Create issue via GitHub API
4. Update task file with issue number
5. Report results

## 1 · Parse Task File

Get task ID from <$ARGUMENTS>:
- Sprint tasks: Search `.aiwf/03_SPRINTS/`
- General tasks: Search `.aiwf/04_GENERAL_TASKS/`

Extract from task file:
- Title
- Description
- Acceptance criteria
- Labels (sprint number, task type)

## 2 · Generate Issue Template

```markdown
## 📋 Task: {task_title}

### Description
{task_description}

### Acceptance Criteria
{acceptance_criteria}

### Related Information
- Task ID: {task_id}
- Sprint: {sprint_id}
- Task file: `.aiwf/.../{task_file}`
```

## 3 · Create GitHub Issue

```bash
gh issue create \
  --title "{task_id}: {task_title}" \
  --body "{issue_body}" \
  --label "task,{sprint_label}" \
  --assignee "@me"
```

Capture the created issue number

## 4 · Update Task File

Add to task file frontmatter:
```yaml
github_issue: #{issue_number}
```

## 5 · Report Results

✅ **Issue Created**: #{issue_number}
🔗 **Link**: {issue_url}
📄 **Task**: {task_id}