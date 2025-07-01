# Create Pull Request After Task Completion

Create a GitHub Pull Request after task completion and link it with related issues.

## Create TODO with EXACTLY these 6 items

1. Check current branch and changes
2. Generate PR body template
3. Create GitHub PR
4. Link issue with PR
5. Assign reviewers
6. Report results

## 1 · Check Branch and Changes

Run in parallel:
- `git branch --show-current`: Check current branch
- `git log main..HEAD --oneline`: Commit history
- `git diff main...HEAD --stat`: Changed files statistics

Extract GitHub issue number from task file

## 2 · Generate PR Body Template

```markdown
## 🎯 Overview
Completed implementation of {task_title}.

## 📝 Changes
{commit_list}

## 📊 Changed Files
{file_statistics}

## ✅ Checklist
- [ ] Tests pass
- [ ] Code review completed
- [ ] Documentation updated

## 🔗 Related Information
- Closes #{issue_number}
- Task: {task_id}
```

## 3 · Create GitHub PR

```bash
gh pr create \
  --title "{task_id}: {task_title}" \
  --body "$(cat <<'EOF'
{pr_body}
EOF
)" \
  --base main \
  --head {branch_name}
```

## 4 · Link Issue with PR

Automatically included in PR body:
- `Closes #{issue_number}`: Auto-close issue
- `Relates to #{issue_number}`: Show relationship

## 5 · Assign Reviewers

```bash
gh pr edit {pr_number} \
  --add-reviewer {reviewer_username}
```

## 6 · Report Results

✅ **PR Created**: #{pr_number}
🔗 **Link**: {pr_url}
🎯 **Linked Issue**: #{issue_number}
👥 **Reviewers**: {reviewers}