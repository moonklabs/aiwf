---
description: SDD Phase 1 - 기능 명세(Specification) 작성. WHAT과 WHY만 정의 (HOW 금지)
argument-hint: 기능 설명 (예: "사진 앨범 정리 앱", "사용자 인증 시스템")
---

# SDD Specify - 기능 명세 작성

**Spec-Driven Development Phase 1**: 기능 명세를 작성합니다.

## 입력 분석

기능 요청: **$ARGUMENTS**

## 실행 절차

### 1. 디렉토리 준비

```bash
# .sdd/specs/ 디렉토리 확인/생성
mkdir -p .sdd/specs
```

### 2. 다음 번호 결정

기존 `.sdd/specs/` 스캔하여 다음 번호 결정 (001, 002, ...)

### 3. Feature 디렉토리 생성

기능명에서 kebab-case 이름 생성 후 디렉토리 생성:
- `.sdd/specs/NNN-feature-name/`

### 4. spec.md 작성

다음 템플릿을 기반으로 `spec.md` 작성:

```markdown
# Feature Specification: [기능명]

**Feature ID**: `NNN-feature-name`
**Created**: [날짜]
**Status**: Draft

## User Scenarios & Testing

### User Story 1 - [제목] (Priority: P1)

[사용자 여정을 자연어로 설명]

**Why this priority**: [이 우선순위인 이유와 가치]

**Independent Test**: [이 스토리만으로 독립 테스트하는 방법]

**Acceptance Scenarios**:

1. **Given** [초기 상태], **When** [행동], **Then** [예상 결과]
2. **Given** [초기 상태], **When** [행동], **Then** [예상 결과]

---

### User Story 2 - [제목] (Priority: P2)

[계속...]

---

### Edge Cases

- [경계 조건] 발생 시?
- [에러 시나리오] 처리 방법?

## Requirements

### Functional Requirements

- **FR-001**: System MUST [구체적 기능]
- **FR-002**: System MUST [구체적 기능]

*불명확한 부분:*
- **FR-00X**: [NEEDS CLARIFICATION: 명확화 필요 - 옵션 A? B?]

### Key Entities (데이터 관련 시)

- **[Entity 1]**: [의미, 주요 속성 - 구현 없이]
- **[Entity 2]**: [의미, 다른 엔티티와 관계]

## Success Criteria

- **SC-001**: [측정 가능 지표]
- **SC-002**: [측정 가능 지표]
```

## 핵심 규칙 (반드시 준수)

| 규칙 | 설명 |
|------|------|
| ✅ WHAT/WHY만 | 무엇을 하고 왜 하는지만 기술 |
| ❌ HOW 금지 | 기술 스택, API 구조, 구현 방식 언급 안함 |
| ✅ 독립 테스트 | 각 User Story는 독립적으로 테스트 가능해야 |
| ✅ 우선순위 필수 | P1(핵심) → P2 → P3... 반드시 지정 |
| ✅ Given-When-Then | Acceptance Scenarios 형식 사용 |

## 출력 구조

```
.sdd/specs/NNN-feature-name/
├── spec.md           # 기능 명세 (이 단계에서 생성)
└── checklists/
    └── requirements.md  # (선택) 요구사항 체크리스트
```

## 완료 후 안내

```
✅ spec.md 생성 완료: .sdd/specs/NNN-feature-name/spec.md

다음 단계:
→ /sdd-plan [기술 스택] (예: /sdd-plan React + SQLite)
```

## 참고

- spec-driven-development 스킬 참조
- 템플릿: .claude/skills/spec-driven-development/templates/spec-template.md
