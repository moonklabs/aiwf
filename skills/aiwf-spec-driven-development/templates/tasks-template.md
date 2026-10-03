# Tasks: [FEATURE NAME]

**Prerequisites**: spec.md (required), plan.md (required)

## Format

```
- [ ] [TaskID] [P?] [Story?] Description with file path
```

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

**Goal**: [이 스토리가 전달하는 가치]

**Independent Test**: [독립 검증 방법]

### Implementation

- [ ] T014 [P] [US2] [Entity] 모델 생성 in src/models/[entity].py
- [ ] T015 [US2] [Service] 구현 in src/services/[service].py
- [ ] T016 [US2] [Endpoint] 구현 in src/api/[endpoint].py

**Checkpoint**: User Story 2 독립 테스트 가능

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

## Parallel Execution Example

```bash
# Phase 2 병렬 실행 가능 태스크:
T005, T006  # 동시 실행 가능

# Phase 3 병렬 실행 가능 태스크:
T009, T010  # 동시 실행 가능
```

## Notes

- [P] 태스크는 다른 파일, 의존성 없음
- 각 태스크 완료 후 커밋
- 체크포인트에서 검증 후 진행
