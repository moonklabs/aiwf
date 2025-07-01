# GitHub Integration with AIWF Framework

This document provides guidance on integrating GitHub issues and pull requests with the AIWF task management system.

## Overview

The AIWF framework now supports seamless integration with GitHub issues and pull requests, enabling better tracking and collaboration through the `gh` CLI tool.

## Key Features

### 1. Task-Issue Linking

- Each task can be linked to a GitHub issue via the `github_issue` field in frontmatter
- Automatic status synchronization between tasks and issues
- Bidirectional updates ensure consistency

### 2. Automated Workflows

- Create GitHub issues from tasks: `/project:aiwf:issue_create {task_id}`
- Generate pull requests with issue linking: `/project:aiwf:pr_create {task_id}`
- Commit messages automatically include issue references

### 3. Status Management

- Task status changes trigger GitHub issue updates
- Issues are labeled based on task status (in-progress, completed, etc.)
- Comments are added to issues for transparency

## Commands Reference

### Issue Creation

```bash
/project:aiwf:issue_create {task_id}
```

Creates a GitHub issue from a task file with:

- Title including task ID
- Description from task content
- Appropriate labels
- Automatic assignment

### Pull Request Creation

```bash
/project:aiwf:pr_create {task_id}
```

Creates a pull request that:

- Links to the associated issue
- Includes commit history
- Auto-closes issue on merge
- Assigns reviewers

### Manual GitHub Commands

Update issue status:

```bash
gh issue comment {issue_number} --body "Status update message"
gh issue edit {issue_number} --add-label "label-name"
```

Create issue manually:

```bash
gh issue create \
  --title "Task: Description" \
  --body "Detailed description" \
  --label "task,sprint-01"
```

## Best Practices

### 1. Issue Creation Timing

- Create issues when starting a sprint
- Link issues immediately after creation
- Update frontmatter with issue number

### 2. Commit Messages

- Use `fixes #123` for bug fixes
- Use `relates to #123` for partial work
- Include task ID in commit message

### 3. Pull Request Workflow

- Create PR after task completion
- Ensure all tests pass
- Link to original issue
- Request appropriate reviewers

## Integration Points

### Task Files

Add to frontmatter:

```yaml
github_issue: #123
```

### Sprint Planning

- Create issues for all tasks at sprint start
- Use labels to group by sprint
- Track progress via GitHub Projects

### YOLO Mode

- Automatically creates issues if enabled
- Creates PRs after successful commits
- Maintains full automation flow

## Troubleshooting

### Common Issues

1. **Missing gh CLI**: Install GitHub CLI first
2. **Authentication**: Run `gh auth login`
3. **Permissions**: Ensure repo access rights

### Error Handling

- Check task file for valid issue number
- Verify GitHub API limits
- Ensure branch protection rules allow automation
