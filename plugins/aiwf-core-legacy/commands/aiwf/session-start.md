---
description: Start a new AIWF session with context restoration and task selection
---

# AIWF 세션 시작

장시간 에이전트 작업을 위한 세션을 시작합니다. 이전 상태를 복구하고 다음 작업을 선택합니다.

## 세션 시작 절차

다음 단계를 **순서대로** 실행하세요:

### 1. 환경 확인

```bash
# 작업 디렉토리 확인
pwd

# Git 상태 확인
git status

# 최근 커밋 확인
git log --oneline -5
```

**확인 사항**:
- 프로젝트 루트 디렉토리에 있는지 확인
- uncommitted changes가 있으면 먼저 처리
- 이전 세션의 마지막 커밋 확인

### 2. 진행 파일 읽기

```bash
# 진행 파일 확인
cat .aiwf/aiwf-progress.md 2>/dev/null || echo "진행 파일 없음 - 새로 생성 필요"
```

**진행 파일이 없는 경우**:
- `.aiwf/aiwf-progress.md` 파일을 템플릿에서 생성
- 현재 프로젝트 상태로 초기화

### 3. 프로젝트 상태 확인

```bash
# 프로젝트 매니페스트 읽기
cat .aiwf/00_PROJECT_MANIFEST.md

# 현재 스프린트 확인
ls .aiwf/03_SPRINTS/
```

### 4. 미완료 태스크 목록

`.aiwf/03_SPRINTS/` 에서 미완료 태스크를 찾아 목록화:

```
📋 미완료 태스크:
1. [ ] TASK_01_xxx - 설명
2. [ ] TASK_02_xxx - 설명
...
```

### 5. 다음 작업 선택

사용자에게 다음 중 하나를 선택하도록 요청:

```
🎯 다음 작업을 선택하세요:

1. [가장 높은 우선순위 태스크] - 권장
2. [두 번째 우선순위 태스크]
3. 직접 지정

선택:
```

### 6. 세션 체크리스트 완료

진행 파일의 "Session Verification Checklist" 업데이트:

```markdown
## Session Verification Checklist
- [x] 프로젝트 루트 디렉토리 확인 (`pwd`)
- [x] Git 상태 확인 (uncommitted changes 없음)
- [x] 개발 서버 실행 가능 확인
- [x] 이전 태스크 상태 검토 완료
- [x] 다음 태스크 선택 완료
```

### 7. 진행 파일 업데이트

선택한 태스크 정보로 진행 파일 업데이트:

```markdown
## Current Session
- **Session ID**: [날짜-시간]
- **Started**: [현재 시간]
- **Current Task**: [선택한 태스크 ID]
- **Task Status**: in_progress
```

## 세션 시작 완료 메시지

```
✅ AIWF 세션 시작 완료!

📍 현재 위치: [프로젝트 경로]
📋 현재 태스크: [태스크 ID] - [태스크 설명]
📊 세션 상태: 진행 중

💡 다음 단계:
1. 태스크 요구사항 확인: .aiwf/03_SPRINTS/[스프린트]/[태스크].md
2. 구현 시작
3. 완료 시 /aiwf:session-end 실행

🔄 한 번에 하나의 기능만 구현하세요!
```

## 주의사항

- **한 번에 하나의 태스크만** 처리
- 태스크 완료 전까지 **다른 태스크로 전환 금지**
- 막히면 **블로커로 기록**하고 다음 태스크로 이동 가능
- 각 의미있는 변경마다 **Git 커밋** 생성
