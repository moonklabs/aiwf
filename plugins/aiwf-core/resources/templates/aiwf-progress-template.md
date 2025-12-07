# AIWF Progress Log

> 이 파일은 장시간 세션에서 컨텍스트를 유지하기 위한 진행 상황 파일입니다.
> 각 세션 시작 시 이 파일을 읽어 이전 상태를 파악하세요.

## Current Session

- **Session ID**: {{session_id}}
- **Started**: {{timestamp}}
- **Current Task**: {{current_task_id}}
- **Task Status**: {{task_status}}

## Project Context

- **Project**: {{project_name}}
- **Current Milestone**: {{current_milestone}}
- **Current Sprint**: {{current_sprint}}

## Recent Activity

### Last Commits (최근 5개)
```
{{recent_commits}}
```

### Completed Tasks (이번 세션)
{{completed_tasks_this_session}}

## Pending Tasks

### High Priority
{{high_priority_tasks}}

### Normal Priority
{{normal_priority_tasks}}

## Session Verification Checklist

> 각 세션 시작 시 아래 항목을 확인하세요.

- [ ] 프로젝트 루트 디렉토리 확인 (`pwd`)
- [ ] Git 상태 확인 (uncommitted changes 없음)
- [ ] 개발 서버 실행 가능 확인
- [ ] 이전 태스크 상태 검토 완료
- [ ] 다음 태스크 선택 완료

## Current Task Details

### Task: {{current_task_id}}

**Description**: {{task_description}}

**Acceptance Criteria**:
{{acceptance_criteria}}

**Verification Steps**:
- [ ] 유닛 테스트 통과
- [ ] 통합 테스트 통과
- [ ] 수동 검증 완료

**Notes**:
{{task_notes}}

## Blockers & Issues

{{blockers}}

## Checkpoints

| Checkpoint | Task | Commit | Timestamp |
|------------|------|--------|-----------|
{{checkpoints}}

## Session End Checklist

> 세션 종료 전 아래 항목을 완료하세요.

- [ ] 현재 작업 상태 기록
- [ ] 변경사항 Git 커밋
- [ ] 이 파일 업데이트
- [ ] 다음 세션을 위한 노트 작성

---

**Last Updated**: {{last_updated}}
**Updated By**: Claude Code Session
