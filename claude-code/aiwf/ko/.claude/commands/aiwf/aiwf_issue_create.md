# 태스크에서 GitHub 이슈 생성

태스크 파일을 기반으로 GitHub 이슈를 자동으로 생성합니다.

## 정확히 다음 6개 항목으로 TODO 생성

1. 워크플로우 상태 사전 검증
2. Parse task file and extract information
3. Generate issue template
4. Create issue via GitHub API
5. Update task file with issue number
6. 상태 동기화 및 결과 보고

## 1 · 워크플로우 상태 사전 검증

**병렬 서브에이전트**를 사용하여 다음 작업을 수행하세요:

- `aiwf state show` 명령어로 현재 워크플로우 상태 확인
- 진행 중인 작업이나 차단 요소 식별
- GitHub 이슈 생성이 현재 워크플로우에 미치는 영향 평가
- 상태 불일치나 프로젝트 구조 문제 확인

**상태 검증 결과:**
- 현재 활성 태스크: [상태 명령어 결과]
- 프로젝트 구조 무결성: [검증 결과]
- 이슈 생성 준비성: [준비 상태]

## 2 · Parse Task File

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

## 6 · 상태 동기화 및 결과 보고

**이슈 생성 후 상태 동기화:**

- `aiwf state update` 명령어로 워크플로우 상태 동기화
- 새로 생성된 이슈의 우선순위 계산
- 태스크-이슈 연결 정보 반영
- 관련 태스크들의 종속성 업데이트

**결과 보고:**

✅ **Issue Created**: #{issue_number}
🔗 **Link**: {issue_url}
📄 **Task**: {task_id}
🔄 **상태 동기화**: 완료