# 태스크 완료 후 Pull Request 생성

태스크 완료 후 GitHub Pull Request를 생성하고 관련 issue와 연결합니다.

## 정확히 다음 6개 항목으로 TODO 생성

1. 현재 브랜치 및 변경사항 확인
2. PR 본문 템플릿 생성
3. GitHub PR 생성
4. Issue와 PR 연결
5. 리뷰어 할당
6. 결과 보고

## 1 · 브랜치 및 변경사항 확인

병렬로 실행:
- `git branch --show-current`: 현재 브랜치 확인
- `git log main..HEAD --oneline`: 커밋 이력
- `git diff main...HEAD --stat`: 변경 파일 통계

태스크 파일에서 GitHub issue 번호 추출

## 2 · PR 본문 템플릿 생성

```markdown
## 🎯 개요
{task_title} 구현을 완료했습니다.

## 📝 변경사항
{커밋 목록}

## 📊 변경 파일
{파일 통계}

## ✅ 체크리스트
- [ ] 테스트 통과
- [ ] 코드 리뷰 완료
- [ ] 문서 업데이트

## 🔗 관련 정보
- Closes #{issue_number}
- 태스크: {task_id}
```

## 3 · GitHub PR 생성

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

## 4 · Issue와 PR 연결

PR 본문에 자동으로 포함:
- `Closes #{issue_number}`: issue 자동 닫기
- `Relates to #{issue_number}`: 연관 표시

## 5 · 리뷰어 할당

```bash
gh pr edit {pr_number} \
  --add-reviewer {reviewer_username}
```

## 6 · 결과 보고

✅ **PR 생성됨**: #{pr_number}
🔗 **링크**: {pr_url}
🎯 **연결된 Issue**: #{issue_number}
👥 **리뷰어**: {reviewers}