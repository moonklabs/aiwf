# 태스크에서 GitHub Issue 생성

태스크 파일을 기반으로 GitHub issue를 자동으로 생성합니다.

## 정확히 다음 5개 항목으로 TODO 생성

1. 태스크 파일 파싱 및 정보 추출
2. Issue 템플릿 생성
3. GitHub API로 issue 생성
4. 태스크 파일에 issue 번호 업데이트
5. 결과 보고

## 1 · 태스크 파일 파싱

<$ARGUMENTS>에서 태스크 ID 받기:
- 스프린트 태스크: `.moonklabs/03_SPRINTS/` 검색
- 일반 태스크: `.moonklabs/04_GENERAL_TASKS/` 검색

태스크 파일에서 추출:
- 제목 (title)
- 설명 (description)
- 수락 기준 (acceptance_criteria)
- 라벨 (스프린트 번호, 태스크 타입)

## 2 · Issue 템플릿 생성

```markdown
## 📋 태스크: {task_title}

### 설명
{task_description}

### 수락 기준
{acceptance_criteria}

### 관련 정보
- 태스크 ID: {task_id}
- 스프린트: {sprint_id}
- 태스크 파일: `.moonklabs/.../{task_file}`
```

## 3 · GitHub Issue 생성

```bash
gh issue create \
  --title "{task_id}: {task_title}" \
  --body "{issue_body}" \
  --label "task,{sprint_label}" \
  --assignee "@me"
```

생성된 issue 번호 캡처

## 4 · 태스크 파일 업데이트

태스크 파일의 frontmatter에 추가:
```yaml
github_issue: #{issue_number}
```

## 5 · 결과 보고

✅ **Issue 생성됨**: #{issue_number}
🔗 **링크**: {issue_url}
📄 **태스크**: {task_id}