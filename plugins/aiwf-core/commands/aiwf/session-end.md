---
description: End AIWF session with progress save and checkpoint creation
---

# AIWF 세션 종료

현재 세션을 종료하고 진행 상황을 저장합니다. 다음 세션에서 컨텍스트를 복구할 수 있도록 합니다.

## 세션 종료 절차

다음 단계를 **순서대로** 실행하세요:

### 1. 현재 작업 상태 확인

```bash
# Git 상태 확인
git status

# 변경된 파일 목록
git diff --stat
```

### 2. 미커밋 변경사항 처리

**변경사항이 있는 경우**:
```bash
# 변경사항 커밋
git add .
git commit -m "[AIWF] 세션 종료: [태스크 ID] - [간단한 설명]"
```

### 3. 태스크 상태 업데이트

현재 태스크 파일 (`.aiwf/03_SPRINTS/[스프린트]/TASK_XX_xxx.md`) 업데이트:

**완료된 경우**:
```markdown
## Status
- status: completed
- completed_at: [현재 시간]
```

**진행 중인 경우**:
```markdown
## Status
- status: in_progress
- progress: [완료 퍼센트]%

## Session Notes
- [이번 세션에서 한 작업]
- [다음 세션에서 할 작업]
```

### 4. 진행 파일 업데이트

`.aiwf/aiwf-progress.md` 업데이트:

```markdown
## Current Session
- **Session ID**: [세션 ID]
- **Started**: [시작 시간]
- **Ended**: [현재 시간]
- **Current Task**: [태스크 ID]
- **Task Status**: [completed/in_progress/blocked]

## Completed Tasks (이번 세션)
- [완료한 태스크 목록]

## Session End Checklist
- [x] 현재 작업 상태 기록
- [x] 변경사항 Git 커밋
- [x] 이 파일 업데이트
- [x] 다음 세션을 위한 노트 작성
```

### 5. 체크포인트 생성 (선택)

태스크가 완료된 경우 체크포인트 생성:

```bash
# 체크포인트 태그 생성
git tag "aiwf-checkpoint-[태스크ID]-$(date +%Y%m%d-%H%M)"
```

### 6. 다음 세션을 위한 노트

진행 파일에 다음 세션을 위한 노트 추가:

```markdown
## Notes for Next Session

### 이번 세션 요약
- [주요 완료 사항]
- [발견한 이슈]

### 다음 세션에서 할 일
1. [첫 번째 할 일]
2. [두 번째 할 일]

### 주의사항
- [알아야 할 사항]
- [잠재적 문제]
```

### 7. 최종 커밋

```bash
git add .aiwf/aiwf-progress.md
git commit -m "[AIWF] 세션 종료 - 진행 상황 저장"
```

## 세션 종료 완료 메시지

```
✅ AIWF 세션 종료 완료!

📊 세션 요약:
- 시작: [시작 시간]
- 종료: [종료 시간]
- 소요 시간: [시간]

📋 완료한 태스크:
- [완료 태스크 목록]

📝 진행 중인 태스크:
- [진행 중 태스크] ([진행률]%)

🏷️ 체크포인트: [태그 이름] (있는 경우)

💾 모든 진행 상황이 저장되었습니다.

다음 세션 시작: /aiwf:session-start
```

## 긴급 종료

세션을 긴급하게 종료해야 하는 경우:

```bash
# 현재 상태 빠르게 저장
git stash save "AIWF 긴급 종료 - $(date)"

# 간단한 노트 추가
echo "## Emergency Exit - $(date)" >> .aiwf/aiwf-progress.md
echo "- 작업 중단됨, git stash에 변경사항 저장" >> .aiwf/aiwf-progress.md

git add .aiwf/aiwf-progress.md
git commit -m "[AIWF] 긴급 세션 종료"
```

## 주의사항

- **반드시 진행 파일 업데이트** 후 종료
- 미커밋 변경사항 **절대 남기지 않기**
- 다음 세션을 위한 **명확한 노트** 작성
- 의미있는 진전이 있으면 **체크포인트 생성**
