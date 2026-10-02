---
description: SDD Phase 3 - 태스크(Tasks) 분해. 실행 가능한 작업 단위로 분해
argument-hint: (선택) 특정 feature ID (예: "001-photo-albums")
---

# SDD Tasks - 태스크 분해

**Spec-Driven Development Phase 3**: 태스크를 분해합니다.

## 입력 분석

Feature 지정: **$ARGUMENTS** (없으면 가장 최근 feature 사용)

## 전제 조건

⚠️ **spec.md와 plan.md가 먼저 필요합니다!**

## 실행 절차

### 1. 문서 읽기

1. `spec.md`에서 User Stories 추출 (우선순위 포함)
2. `plan.md`에서 기술 구조 추출
3. `data-model.md`에서 엔티티 추출 (있으면)

### 2. 태스크 분해

User Story별로 태스크 그룹화하여 `tasks.md` 생성:

```markdown
# Tasks: [FEATURE NAME]

**Prerequisites**: spec.md ✓, plan.md ✓

## Format

- `[P]`: 병렬 실행 가능 (다른 파일, 의존성 없음)
- `[US1]`: User Story 1 소속

---

## Phase 1: Setup

**Purpose**: 프로젝트 초기화

- [ ] T001 프로젝트 구조 생성
- [ ] T002 [P] 의존성 설치 및 설정
- [ ] T003 [P] 린트/포맷터 설정

---

## Phase 2: Foundational

**Purpose**: 모든 User Story의 전제조건

⚠️ 이 Phase 완료 전에 User Story 작업 불가

- [ ] T004 데이터베이스 스키마 설정
- [ ] T005 [P] 인증/인가 프레임워크 설정
- [ ] T006 [P] API 라우팅 및 미들웨어 설정
- [ ] T007 기본 모델/엔티티 생성
- [ ] T008 에러 핸들링 및 로깅 설정

**Checkpoint**: Foundation 완료 - User Story 작업 시작 가능

---

## Phase 3: User Story 1 - [제목] (P1) 🎯 MVP

**Goal**: [이 스토리가 전달하는 가치]
**Independent Test**: [독립 검증 방법]

### Implementation

- [ ] T009 [P] [US1] [Entity1] 모델 생성 in src/models/[entity1].py
- [ ] T010 [P] [US1] [Entity2] 모델 생성 in src/models/[entity2].py
- [ ] T011 [US1] [Service] 구현 in src/services/[service].py
- [ ] T012 [US1] [Endpoint] 구현 in src/api/[endpoint].py
- [ ] T013 [US1] 유효성 검사 및 에러 처리 추가

**Checkpoint**: User Story 1 독립 테스트 가능

---

## Phase 4: User Story 2 - [제목] (P2)

[계속...]

---

## Phase N: Polish & Cross-Cutting

**Purpose**: 전체 품질 향상

- [ ] TXXX [P] 문서화 업데이트
- [ ] TXXX 코드 정리 및 리팩토링
- [ ] TXXX 성능 최적화
- [ ] TXXX 보안 강화

---

## Dependencies

- **Setup (Phase 1)**: 의존성 없음
- **Foundational (Phase 2)**: Setup 완료 필요 - 모든 User Story 차단
- **User Stories**: Foundational 완료 후 병렬 가능
- **Polish**: 모든 User Story 완료 후
```

## 태스크 형식 규칙

| 마커 | 의미 |
|------|------|
| `[P]` | 병렬 실행 가능 (다른 파일, 의존성 없음) |
| `[US1]` | User Story 1 소속 |
| `in path/to/file.py` | 대상 파일 경로 명시 |

## 출력 구조

```
.sdd/specs/NNN-feature-name/
├── spec.md
├── plan.md
├── data-model.md
└── tasks.md          # 태스크 목록 (이 단계에서 생성)
```

## 완료 후 안내

```
✅ tasks.md 생성 완료: .sdd/specs/NNN-feature-name/tasks.md

다음 단계를 선택하세요:
┌─────────────────────────────────────────────────────────────┐
│ A) 직접 구현 시작                                            │
│    → "implement" 또는 tasks.md 보면서 직접 작업              │
│                                                              │
│ B) Superpowers Plan으로 변환 후 실행 (권장)                  │
│    → /superpowers:write-plan 에서 tasks.md 참조              │
│    → /superpowers:execute-plan 으로 배치별 실행              │
│                                                              │
│ C) 계획만 저장하고 나중에 실행                               │
│    → 다른 작업 진행 후 돌아와서 implement                    │
└─────────────────────────────────────────────────────────────┘
```

## Superpowers 연동 (B 선택 시)

tasks.md를 Superpowers plan 형식으로 변환:

1. `docs/plans/YYYY-MM-DD-feature-implementation.md` 생성
2. Phase별로 Batch 구성
3. 각 Batch에 Review Checkpoint 추가

변환 후 `/superpowers:execute-plan`으로 실행

## 참고

- spec-driven-development 스킬 참조
- 템플릿: .claude/skills/spec-driven-development/templates/tasks-template.md
