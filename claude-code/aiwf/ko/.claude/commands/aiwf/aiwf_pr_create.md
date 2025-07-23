# 태스크 완료 후 풀 리퀘스트 생성

태스크 완료 후 GitHub 풀 리퀘스트를 생성하고 관련 이슈와 연결합니다.

## 정확히 다음 7개 항목으로 TODO 생성

1. 워크플로우 상태 사전 검증
2. 현재 브랜치 및 변경사항 확인
3. PR 본문 템플릿 생성
4. GitHub PR 생성
5. 이슈와 PR 연결
6. 리뷰어 배정
7. 상태 동기화 및 결과 보고

## 1 · 워크플로우 상태 사전 검증

**병렬 서브에이전트**를 사용하여 다음 작업을 수행하세요:

- `aiwf state show` 명령어로 현재 워크플로우 상태 확인
- 진행 중인 작업이나 차단 요소 식별
- PR 생성이 현재 워크플로우에 미치는 영향 평가
- 상태 불일치나 프로젝트 구조 문제 확인

**상태 검증 결과:**
- 현재 활성 태스크: [상태 명령어 결과]
- 프로젝트 구조 무결성: [검증 결과]
- PR 생성 준비성: [준비 상태]

## 2 · 브랜치 및 변경사항 확인

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

## 7 · 상태 동기화 및 결과 보고

**PR 생성 후 상태 동기화:**

- `aiwf state update` 명령어로 워크플로우 상태 동기화
- 새로 생성된 PR의 우선순위 계산
- 태스크-PR 연결 정보 반영
- 관련 태스크들의 종속성 업데이트

**결과 보고:**

✅ **PR Created**: #{pr_number}
🔗 **Link**: {pr_url}
🎯 **Linked Issue**: #{issue_number}
👥 **Reviewers**: {reviewers}
🔄 **상태 동기화**: 완료