# Feature Ledger 시스템

Feature Ledger는 AIWF 프레임워크에서 개발 중인 기능들의 상태를 체계적으로 추적하고 관리하는 시스템입니다.

## 디렉토리 구조

```
06_FEATURE_LEDGERS/
├── active/           # 진행 중인 Feature들
├── completed/        # 완료된 Feature들  
├── archived/         # 아카이브된 Feature들
├── schemas/          # JSON 스키마 파일들
│   └── feature_schema.json
├── FEATURE_INDEX.md  # 전체 Feature 인덱스
└── README.md         # 본 파일
```

## Feature 파일 명명 규칙

Feature 파일은 다음 형식을 따릅니다:
- **파일명**: `{feature_id}_{sanitized_title}.md`
- **Feature ID**: `FL001`, `FL002`, `FL003`, ... (자동 증분)
- **예시**: `FL001_사용자_인증_시스템.md`

## Feature 상태 워크플로우

1. **draft**: 초기 기획 단계
2. **active**: 현재 개발 중
3. **on-hold**: 일시 중단
4. **completed**: 개발 완료
5. **archived**: 아카이브 처리

## 파일 구조

각 Feature 파일은 YAML 프론트매터와 Markdown 본문으로 구성됩니다:

```yaml
---
feature_id: FL001
title: 사용자 인증 시스템
description: JWT 기반 사용자 인증 시스템 구현
status: active
priority: high
milestone_id: M02
assignee: 개발자명
created_date: 2025-07-08T20:55:00Z
updated_date: 2025-07-08T20:55:00Z
estimated_hours: 8
actual_hours: 4
tags: [authentication, security, core]
dependencies: [FL002]
git_branches: [feature/FL001-user-auth]
---

# 사용자 인증 시스템

## 개요
...
```

## 사용법

### Feature 생성
```bash
/aiwf_create_feature_ledger "Feature 제목" "상세 설명"
```

### Feature 상태 업데이트
```bash
/aiwf_update_feature_status FL001 completed
```

### Feature 검색
```bash
/aiwf_search_features --status active --milestone M02
```

## 통합 기능

- **Git 연동**: 브랜치 생성 및 커밋 추적
- **마일스톤 연동**: 마일스톤별 Feature 그룹핑
- **AI 페르소나**: 페르소나별 Feature 추천
- **Context 압축**: Feature 기반 컨텍스트 최적화

## 주의사항

- Feature ID는 자동 생성되며 직접 수정하지 마세요
- 상태 변경 시 반드시 업데이트 시간을 갱신하세요
- 완료된 Feature는 `completed/` 디렉토리로 이동됩니다
- 아카이브된 Feature는 `archived/` 디렉토리로 이동됩니다

---

*최종 업데이트: 2025-07-08 20:55*