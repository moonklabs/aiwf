# 태스크 완료 후 풀 리퀘스트 생성

태스크 완료 후 GitHub 풀 리퀘스트를 생성하고 관련 이슈와 연결합니다.

## 정확히 다음 6개 항목으로 TODO 생성

1. 현재 브랜치 및 변경사항 확인
2. PR 본문 템플릿 생성
3. GitHub PR 생성
4. 이슈와 PR 연결
5. 리뷰어 배정
6. 결과 보고

## 1 · 브랜치 및 변경사항 확인

병렬로 실행:
- `git branch --show-current`: 현재 브랜치 확인
- `git log main..HEAD --oneline`: 커밋 히스토리
- `git diff main...HEAD --stat`: 변경된 파일 통계

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