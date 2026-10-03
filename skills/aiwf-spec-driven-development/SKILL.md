---
name: aiwf-spec-driven-development
description: Spec-first development workflow that turns an idea into spec.md, plan.md, and tasks.md, then implements them. Use when starting a new feature or project and you want requirements captured before code. This skill executes the whole workflow itself, with no external CLI or companion commands; do not use it for trivial one-line fixes.
---

# Spec-Driven Development (SDD)

## 개요

명세가 코드를 생성하는 개발 방법론. 별도 설치나 외부 명령 없이 이 스킬이 워크플로우를 직접 실행한다.

핵심 원칙: 명세(WHAT & WHY) -> 계획(HOW) -> 태스크(실행 단위) -> 구현(코드)

## 실행 주체

이 스킬은 스스로 실행된다. `/superpowers:*` 같은 외부 명령이나 서드파티 CLI가 필요하지 않다. 아래 트리거를 만나면 이 에이전트가 직접 파일을 만들고, 계획하고, 구현한다.

## 경계 (Boundaries)

이 스킬은 사용자가 승인한 범위 안에서만 동작한다.

- 호스트 프로젝트의 지침(README, AGENTS.md, 기존 규약)과 사용자가 승인한 단계를 따른다. 단계를 임의로 건너뛰거나 확장하지 않는다.
- 기존 파일과 사용자 변경을 보존한다. 생성/수정 전에 기존 내용을 확인하고, 삭제는 명시적 요청이 있을 때만 한다.
- 이미 설치된 도구와 프로젝트 스택을 사용한다. 사용자의 명시적 승인 없이 새 의존성, 패키지, CLI를 추가하지 않는다. (아래 "의존성 설치" 태스크 예시는 프로젝트가 이미 승인한 패키지에만 해당한다.)
- 명시적 승인 없이 커밋, 푸시, 배포, 원격 상태 변경을 하지 않는다.
- 지침이 불명확하거나 파괴적 변경이 필요하면 진행을 멈추고 사용자에게 확인한다.

## When to Use

**사용 시점:**
- 새 프로젝트/기능 개발 시작
- 체계적인 요구사항 관리 필요

**사용하지 말 것:**
- 간단한 버그 수정, 한 줄 변경

## Quick Reference

| 단계 | 트리거 | 출력 |
|------|------|------|
| 1. 명세 | "specify: [기능 설명]" | `.sdd/specs/NNN-feature/spec.md` |
| 2. 계획 | "plan: [기술 스택]" | `plan.md`, `data-model.md` |
| 3. 태스크 | "tasks" | `tasks.md` |
| 4. 구현 | "implement" | 소스 코드 |

## Phase 1: Specify (명세 작성)

**트리거:** `specify:` 또는 "명세 작성", "기능 정의"

### 실행 절차

1. `.sdd/specs/` 디렉토리 확인/생성
2. 기존 specs 스캔하여 다음 번호 결정 (001, 002, ...)
3. 기능명에서 branch-name 생성 (예: "photo-albums")
4. 디렉토리 생성: `.sdd/specs/NNN-feature-name/`
5. `spec.md` 작성 (템플릿: [templates/spec-template.md](templates/spec-template.md))

### 핵심 규칙

- **WHAT(무엇)과 WHY(왜)만** 기술
- **HOW(어떻게)는 금지** - 기술 스택, API 구조, 구현 방식 언급 안함
- 각 User Story는 **독립적으로 테스트 가능**해야 함
- **우선순위 필수**: P1(핵심) -> P2 -> P3...

### spec.md 필수 섹션

```markdown
# Feature Specification: [기능명]

## User Scenarios & Testing
### User Story 1 - [제목] (Priority: P1)
- 설명, 우선순위 이유
- Independent Test: 독립 테스트 방법
- Acceptance Scenarios: Given-When-Then

## Requirements
### Functional Requirements
- FR-001: System MUST [구체적 기능]
- [NEEDS CLARIFICATION: 불명확한 부분]

## Success Criteria
- SC-001: [측정 가능한 지표]
```

## Phase 2: Plan (계획 수립)

**트리거:** `plan:` 또는 "계획 수립", "기술 설계"

### 실행 절차

1. 현재 feature의 `spec.md` 읽기
2. 사용자 입력에서 기술 스택 추출
3. `plan.md` 작성 (템플릿: [templates/plan-template.md](templates/plan-template.md))
4. `data-model.md` 생성 (엔티티, 관계)
5. `contracts/` 디렉토리에 API 명세 (필요시)

### plan.md 필수 섹션

```markdown
# Implementation Plan: [기능명]

## Summary
[spec에서 추출한 요구사항 + 기술 접근법]

## Technical Context
- Language/Version: [예: Python 3.11]
- Primary Dependencies: [예: FastAPI]
- Storage: [예: SQLite]
- Testing: [예: pytest]

## Project Structure
src/
├── models/
├── services/
└── api/
tests/
└── ...
```

## Phase 3: Tasks (태스크 분해)

**트리거:** `tasks` 또는 "태스크 생성", "작업 분해"

### 실행 절차

1. `spec.md`에서 User Stories 추출 (우선순위 포함)
2. `plan.md`에서 기술 구조 추출
3. `data-model.md`에서 엔티티 추출 (있으면)
4. User Story별로 태스크 그룹화
5. `tasks.md` 생성 (템플릿: [templates/tasks-template.md](templates/tasks-template.md))

### 태스크 형식

```markdown
- [ ] T001 프로젝트 구조 생성
- [ ] T002 [P] 의존성 설치
- [ ] T003 [P] [US1] User 모델 생성 in src/models/user.py
- [ ] T004 [US1] UserService 구현 in src/services/user.py
```

- `[P]`: 병렬 실행 가능
- `[US1]`: User Story 1 소속

### Phase 구조

```markdown
## Phase 1: Setup
## Phase 2: Foundational (모든 User Story 전제조건)
## Phase 3: User Story 1 (P1) - MVP
## Phase 4: User Story 2 (P2)
## Phase N: Polish & Cross-Cutting
```

## Phase 4: Implement (구현)

**트리거:** `implement` 또는 "구현 시작"

### 실행 절차

1. `tasks.md` 읽기
2. Phase 순서대로 실행
3. 각 태스크 완료 시 `[X]`로 표시
4. 체크포인트에서 검증

구현은 이 에이전트가 직접 수행한다. 외부 실행 명령이나 별도 플랜 파일로의 변환이 필요하지 않다. 태스크를 순서대로 처리하고, 각 체크포인트에서 빌드/테스트로 검증한 뒤 다음 단계로 넘어간다.

## Directory Structure

```
project/
├── .sdd/                     # SDD 워킹 디렉토리
│   └── specs/
│       └── 001-feature/
│           ├── spec.md
│           ├── plan.md
│           ├── tasks.md
│           ├── data-model.md
│           └── contracts/
├── src/                      # 소스 코드
└── tests/                    # 테스트
```

## Common Mistakes

| 실수 | 해결책 |
|------|--------|
| specify에 기술 언급 | WHAT/WHY만, 기술은 plan에서 |
| User Story 독립성 없음 | 각 Story는 단독 테스트 가능해야 |
| tasks 없이 implement | 반드시 tasks -> implement 순서 |
| 우선순위 없는 Story | P1, P2, P3 필수 지정 |

## File References

템플릿 파일 (필요시 참조):
- [templates/spec-template.md](templates/spec-template.md)
- [templates/plan-template.md](templates/plan-template.md)
- [templates/tasks-template.md](templates/tasks-template.md)
