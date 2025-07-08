# Feature 메타데이터 필드 정의

## 개요

Feature Ledger 시스템에서 각 Feature는 체계적인 메타데이터를 통해 관리됩니다. 이 문서는 모든 메타데이터 필드의 정의와 사용법을 설명합니다.

## 필수 필드 (Required Fields)

### 1. feature_id
- **타입**: String
- **형식**: `FL###` (예: FL001, FL002)
- **설명**: Feature의 고유 식별자
- **자동 생성**: 예
- **수정 불가**: 예

### 2. title
- **타입**: String
- **제한**: 1-100자
- **설명**: Feature의 간단한 제목
- **예시**: "사용자 인증 시스템", "댓글 기능 구현"

### 3. description
- **타입**: String
- **제한**: 1-1000자
- **설명**: Feature의 상세 설명
- **예시**: "JWT 기반 사용자 인증 시스템 구현"

### 4. status
- **타입**: Enum
- **값**: draft, active, on-hold, completed, archived
- **설명**: Feature의 현재 상태
- **기본값**: draft

### 5. priority
- **타입**: Enum
- **값**: low, medium, high, critical
- **설명**: Feature의 우선순위
- **기본값**: medium

## 프로젝트 연동 필드

### 6. milestone_id
- **타입**: String
- **형식**: `M##` (예: M01, M02)
- **설명**: 연관된 마일스톤 ID
- **필수**: 예
- **참조**: `02_REQUIREMENTS/` 디렉토리의 마일스톤

### 7. assignee
- **타입**: String
- **제한**: 1-50자
- **설명**: Feature 담당자명
- **예시**: "moonklabs", "team-frontend", "개발자명"

## 시간 관리 필드

### 8. created_date
- **타입**: DateTime (ISO 8601)
- **설명**: Feature 생성 일시
- **자동 생성**: 예
- **예시**: "2025-07-08T20:55:57+0900"

### 9. updated_date
- **타입**: DateTime (ISO 8601)
- **설명**: Feature 최종 수정 일시
- **자동 업데이트**: 예
- **예시**: "2025-07-08T21:30:45+0900"

### 10. estimated_hours
- **타입**: Number
- **범위**: 0-1000
- **단위**: 시간
- **설명**: 예상 작업 시간
- **기본값**: 0

### 11. actual_hours
- **타입**: Number
- **범위**: 0-1000
- **단위**: 시간
- **설명**: 실제 작업 시간
- **기본값**: 0
- **자동 계산**: Git 커밋 기반 (옵션)

## 분류 및 태그 필드

### 12. tags
- **타입**: Array of String
- **제한**: 각 태그 1-30자
- **설명**: Feature 분류 태그
- **예시**: ["authentication", "security", "core"]
- **사전 정의 태그**:
  - **카테고리**: frontend, backend, api, database, ui, ux
  - **유형**: feature, enhancement, bugfix, refactor, docs
  - **복잡도**: simple, complex, critical
  - **도메인**: auth, payment, notification, search, admin

### 13. dependencies
- **타입**: Array of String
- **형식**: Feature ID 배열 (["FL002", "FL003"])
- **설명**: 종속성 Feature ID 목록
- **검증**: 존재하는 Feature ID만 허용
- **순환 참조**: 자동 감지 및 방지

## Git 연동 필드

### 14. git_branches
- **타입**: Array of String
- **형식**: 브랜치명 배열
- **설명**: 관련 Git 브랜치 목록
- **예시**: ["feature/FL001-user-auth", "hotfix/FL001-security-fix"]
- **자동 추가**: 브랜치 생성 시 자동 업데이트

## 선택 필드 (Optional Fields)

### 15. epic_id
- **타입**: String
- **형식**: `EP###` (예: EP001)
- **설명**: 상위 Epic ID (대규모 Feature 그룹)
- **사용**: 큰 프로젝트에서 Feature 그룹핑

### 16. story_points
- **타입**: Number
- **범위**: 1-100
- **설명**: 스크럼 스토리 포인트
- **사용**: 애자일 개발 시 복잡도 추정

### 17. acceptance_criteria
- **타입**: Array of String
- **설명**: 완료 조건 목록
- **예시**: ["로그인 성공 시 토큰 발급", "실패 시 에러 메시지 표시"]

### 18. business_value
- **타입**: String
- **제한**: 1-500자
- **설명**: 비즈니스 가치 및 ROI 설명

### 19. technical_notes
- **타입**: String
- **제한**: 1-2000자
- **설명**: 기술적 구현 노트 및 제약사항

### 20. test_coverage
- **타입**: Number
- **범위**: 0-100
- **단위**: 퍼센트
- **설명**: 테스트 커버리지 (자동 계산)

## 메타데이터 검증 규칙

### 1. 필수 필드 검증
```yaml
required_fields:
  - feature_id
  - title
  - description
  - status
  - priority
  - milestone_id
  - assignee
  - created_date
  - updated_date
  - estimated_hours
  - actual_hours
  - tags
  - dependencies
  - git_branches
```

### 2. 형식 검증
- **Feature ID**: 정규식 `^FL[0-9]{3}$`
- **Milestone ID**: 정규식 `^M[0-9]{2}$`
- **Epic ID**: 정규식 `^EP[0-9]{3}$`
- **날짜**: ISO 8601 형식
- **브랜치명**: Git 브랜치 명명 규칙

### 3. 참조 무결성
- Milestone ID는 실제 존재하는 마일스톤 참조
- Dependencies의 Feature ID는 실제 존재하는 Feature 참조
- 순환 의존성 자동 감지

## 기본값 및 자동 생성

### 1. 자동 생성 필드
```yaml
auto_generated:
  feature_id: "다음 가용 FL### ID"
  created_date: "현재 시간"
  updated_date: "현재 시간"
```

### 2. 기본값 설정
```yaml
defaults:
  status: "draft"
  priority: "medium"
  estimated_hours: 0
  actual_hours: 0
  tags: []
  dependencies: []
  git_branches: []
```

## 메타데이터 활용

### 1. 검색 및 필터링
```bash
# 태그별 검색
/aiwf_search_features --tags authentication,security

# 담당자별 검색
/aiwf_search_features --assignee moonklabs

# 마일스톤별 검색
/aiwf_search_features --milestone M02

# 복합 조건
/aiwf_search_features --status active --priority high --milestone M02
```

### 2. 리포팅
```bash
# 진행률 리포트
/aiwf_progress_report --milestone M02

# 시간 추적 리포트
/aiwf_time_report --assignee moonklabs --date-range "2025-07-01,2025-07-31"

# 의존성 분석
/aiwf_dependency_analysis --feature FL001
```

### 3. 자동화 트리거
- **상태 변경** 시 Git 브랜치 생성/삭제
- **의존성 해결** 시 대기 중인 Feature 알림
- **시간 초과** 시 담당자 통지

---

*생성일: 2025-07-08*
*최종 업데이트: 2025-07-08 20:55*