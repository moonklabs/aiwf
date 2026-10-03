# Implementation Plan: [FEATURE]

**Feature ID**: `[NNN-feature-name]` | **Date**: [DATE] | **Spec**: [link to spec.md]

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
.sdd/specs/[NNN-feature]/
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
├── api/                 # API 엔드포인트 (또는 cli/, ui/)
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
| /api/[resource]/{id} | PUT | 수정 |
| /api/[resource]/{id} | DELETE | 삭제 |

## Implementation Phases

1. **Setup**: 프로젝트 초기화, 의존성 설치
2. **Foundational**: 공통 인프라 (DB, 인증 등)
3. **User Story 1 (P1)**: MVP 핵심 기능
4. **User Story 2 (P2)**: 추가 기능
5. **Polish**: 문서화, 최적화, 테스트 보강

## Notes

- [기술적 결정 사항]
- [주의할 제약 조건]
