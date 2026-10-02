---
description: Execute a long-running development session with dual-agent pattern
---

# 장시간 개발 세션 워크플로우

Anthropic의 효과적인 장시간 에이전트 하네스 패턴을 적용한 개발 워크플로우입니다.

## 개요

이 워크플로우는 두 개의 에이전트를 사용하여 장시간 개발 세션을 효과적으로 관리합니다:

1. **Init Session Agent**: 환경 설정, 태스크 선택
2. **Work Loop Agent**: 코드 구현, 검증, 커밋

## 워크플로우 시작

### 1. 세션 초기화

```
/aiwf:session-start
```

또는 에이전트 직접 호출:

```
@init-session-agent 프로젝트 세션을 초기화해주세요
```

**초기화 에이전트가 수행하는 작업:**

1. 프로젝트 환경 분석
2. 의존성 설치 (필요시)
3. AIWF 구조 확인/생성
4. 진행 파일 (aiwf-progress.md) 생성/업데이트
5. 미완료 태스크 목록 확인
6. 첫 번째 태스크 선택 및 할당

### 2. 작업 루프 시작

```
@work-loop-agent 현재 태스크 작업을 시작합니다
```

**작업 에이전트가 수행하는 작업:**

반복:
1. 진행 파일에서 현재 태스크 확인
2. 서브태스크 구현 (한 번에 하나씩)
3. 테스트 실행 (`./hooks/verify-task.sh`)
4. Git 커밋
5. 진행 파일 업데이트
6. 다음 서브태스크로 이동

### 3. 태스크 완료

모든 검증 단계 통과 시:

```yaml
## Passes
status: true
verified_at: 2024-01-15T15:00:00Z
verified_by: automated
checkpoint_tag: aiwf-checkpoint-T01-20240115
```

### 4. 세션 종료

```
/aiwf:session-end
```

## 검증 단계

각 태스크는 다음 검증 단계를 통과해야 합니다:

### Automated Verification
- [ ] Unit tests pass (`npm test`)
- [ ] Type check pass (`npx tsc --noEmit`)
- [ ] Lint pass (`npm run lint`)
- [ ] Build pass (`npm run build`)

### Manual Verification
- [ ] Feature works as expected
- [ ] Edge cases handled
- [ ] No regression

## 체크포인트

태스크 완료 시 자동 체크포인트 생성:

```bash
# 체크포인트 태그 형식
aiwf-checkpoint-{task_id}-{YYYYMMDD-HHMM}

# 예시
aiwf-checkpoint-T01-20240115-1500
```

## 복구

세션이 중단된 경우:

```
/aiwf:restore
```

복구 옵션:
1. 마지막 체크포인트에서 재개
2. 특정 체크포인트로 롤백
3. 진행 파일 기반 상태 복원

## 진행 파일 구조

```markdown
# AIWF Progress Log

## Current Session
- **Session ID**: session-20240115-1400
- **Started**: 2024-01-15T14:00:00Z
- **Current Task**: T01
- **Task Status**: in_progress

## Recent Activity
### Completed Tasks (이번 세션)
- T00: 프로젝트 초기화

### Current Task Progress
- [x] 서브태스크 1: API 엔드포인트 정의
- [ ] 서브태스크 2: 핸들러 구현
- [ ] 서브태스크 3: 테스트 작성

## Checkpoints
| Tag | Task | Commit | Timestamp |
|-----|------|--------|-----------|
| aiwf-checkpoint-T00-20240115-1400 | T00 | abc1234 | 2024-01-15T14:00:00Z |
```

## 주의사항

### DO (해야 할 것)
- ✓ 한 번에 하나의 태스크만 처리
- ✓ 각 서브태스크 완료 후 커밋
- ✓ 모든 검증 통과 후 완료 선언
- ✓ 진행 파일 지속적으로 업데이트
- ✓ 블로커 발견 시 즉시 기록

### DON'T (하지 말아야 할 것)
- ✗ 여러 태스크 동시 진행
- ✗ 검증 없이 완료 선언
- ✗ 큰 변경사항 한 번에 커밋
- ✗ 진행 파일 업데이트 미루기
- ✗ 관련 없는 리팩토링 수행

## 세션 흐름 다이어그램

```
┌─────────────────────────────────────────────────────────────┐
│                    세션 시작                                  │
│                  /aiwf:session-start                         │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                 Init Session Agent                          │
│  - 환경 분석                                                 │
│  - 진행 파일 읽기/생성                                        │
│  - 첫 태스크 선택                                            │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                 Work Loop Agent                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  반복:                                               │    │
│  │  1. 태스크 확인 → 2. 구현 → 3. 검증 → 4. 커밋        │    │
│  │       ↑                               │              │    │
│  │       └───────────────────────────────┘              │    │
│  └─────────────────────────────────────────────────────┘    │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
                    ┌──────┴──────┐
                    │ 세션 계속?   │
                    └──────┬──────┘
                   YES     │     NO
                    │      │      │
                    ▼      │      ▼
            ┌───────┴──────┴──────┴───────┐
            │                              │
            ▼                              ▼
    다음 태스크로                     세션 종료
       이동                      /aiwf:session-end
```

## 관련 명령어

- `/aiwf:session-start` - 세션 시작
- `/aiwf:session-end` - 세션 종료
- `/aiwf:restore` - 상태 복구
- `/aiwf:do-task` - 특정 태스크 실행
- `/aiwf:prime` - 프로젝트 컨텍스트 프라이밍
