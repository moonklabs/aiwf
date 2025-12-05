---
description: SDD Phase 2 - 구현 계획(Plan) 수립. 기술 스택과 아키텍처 정의
argument-hint: 기술 스택 (예: "React + SQLite", "FastAPI + PostgreSQL")
---

# SDD Plan - 구현 계획 수립

**Spec-Driven Development Phase 2**: 구현 계획을 수립합니다.

## 입력 분석

기술 스택: **$ARGUMENTS**

## 전제 조건

⚠️ **spec.md가 먼저 필요합니다!**

`.sdd/specs/` 디렉토리에서 가장 최근 (또는 지정된) feature의 `spec.md`를 읽습니다.

## 실행 절차

### 1. spec.md 확인

```bash
# 가장 최근 spec 찾기
ls -1d .sdd/specs/*/ | tail -1
```

해당 디렉토리의 `spec.md` 읽기

### 2. 기술 스택 분석

사용자 입력에서 추출:
- Language/Version
- Primary Dependencies
- Storage
- Testing Framework
- Target Platform

### 3. plan.md 작성

다음 템플릿을 기반으로 `plan.md` 작성:

```markdown
# Implementation Plan: [FEATURE]

**Feature ID**: `NNN-feature-name` | **Date**: [날짜] | **Spec**: spec.md

## Summary

[spec에서 추출한 핵심 요구사항 + 기술 접근법 요약]

## Technical Context

**Language/Version**: [예: Python 3.11, TypeScript 5.0]
**Primary Dependencies**: [예: FastAPI, React]
**Storage**: [예: SQLite, PostgreSQL, N/A]
**Testing**: [예: pytest, Jest]
**Target Platform**: [예: Web, iOS, CLI]

## Project Structure

### Documentation (이 feature)

```text
.sdd/specs/NNN-feature/
├── spec.md              # 기능 명세
├── plan.md              # 이 파일
├── data-model.md        # 데이터 모델
├── tasks.md             # 태스크 목록
└── contracts/           # API 계약 (필요시)
```

### Source Code

```text
src/
├── models/              # 데이터 모델
├── services/            # 비즈니스 로직
├── api/                 # API 엔드포인트
└── lib/                 # 공통 유틸리티

tests/
├── unit/                # 단위 테스트
├── integration/         # 통합 테스트
└── contract/            # 계약 테스트
```

## Data Model Summary

| Entity | 주요 속성 | 관계 |
|--------|----------|------|
| [Entity1] | id, name, ... | Has many [Entity2] |
| [Entity2] | id, entity1_id, ... | Belongs to [Entity1] |

## API Contracts Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| /api/[resource] | GET | 목록 조회 |
| /api/[resource] | POST | 생성 |
| /api/[resource]/{id} | GET | 단일 조회 |

## Implementation Phases

1. **Setup**: 프로젝트 초기화, 의존성 설치
2. **Foundational**: 공통 인프라 (DB, 인증 등)
3. **User Story 1 (P1)**: MVP 핵심 기능
4. **User Story 2 (P2)**: 추가 기능
5. **Polish**: 문서화, 최적화, 테스트 보강

## Notes

- [기술적 결정 사항]
- [주의할 제약 조건]
```

### 4. data-model.md 생성 (필요시)

엔티티, 관계, 속성을 상세히 정의

### 5. contracts/ 디렉토리 (필요시)

API 명세를 별도 파일로 분리

## 출력 구조

```
.sdd/specs/NNN-feature-name/
├── spec.md
├── plan.md           # 구현 계획 (이 단계에서 생성)
├── data-model.md     # 데이터 모델 (이 단계에서 생성)
├── research.md       # 기술 조사 (선택)
└── contracts/
    └── api-spec.json # API 명세 (필요시)
```

## 완료 후 안내

```
✅ plan.md 생성 완료: .sdd/specs/NNN-feature-name/plan.md
✅ data-model.md 생성 완료: .sdd/specs/NNN-feature-name/data-model.md

다음 단계:
→ /sdd-tasks (태스크 분해)
```

## 참고

- spec-driven-development 스킬 참조
- 템플릿: .claude/skills/spec-driven-development/templates/plan-template.md
