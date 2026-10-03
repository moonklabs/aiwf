# 테스트 케이스 템플릿: [여정 이름] (Test Case: [Journey Name])

> 휴먼 리뷰용 한글 번역입니다. 실행 원문: [원문](../../../../../../plugins/aiwf-core/skills/test-case/references/test-case.md). 번역과 자동 검사는 승인을 뜻하지 않으며, 검토 상태와 원문 SHA256은 [관리 목록](../../../../manifest.json)에서 확인합니다.

아래는 `/test-case`가 채우는 빈 템플릿이다. 절 제목과 필드 라벨(`## Overview`, `**ID:**` 등), Flow 표의 열 이름, Priority·Status 값은 파서와 엔드투엔드 테스트 자동화가 인식하는 표기이므로 원문 그대로 두었고, 대괄호 안의 작성 지침은 한국어로 옮겼다.

이 템플릿의 `../use_cases/UC-XXX-name.md` 링크는 소비 프로젝트의 `docs/test_cases/` 문서를 기준으로 한 상대 경로의 예시이며 이 저장소의 실제 파일이 아니다. 활성 내비게이션 링크로 해석되지 않도록 링크 텍스트를 인라인 코드로 감쌌다.

## Overview

**ID:** TC-XXX  
**Goal:** [한 문장으로: 여정 전체에서 누가 무엇을 하는지, 그리고 어떤 결과를 엔드투엔드로 검증하는지]  
**Priority:** Critical | High | Medium | Low  
**Status:** Draft | Reviewed | Approved | Automated | Obsolete

## Roles

- [여정에서 행동하는 역할 (무엇을 하는지)]
- [여정이 여러 역할에 걸치면 두 번째 역할]

## Preconditions

- [여정이 시작되기 전에 존재해야 하는 데이터나 상태, 그리고 그 출처 (예: Flyway 테스트 데이터 `V900__test_data.sql`)]

## Flow

| Step | Name          | Description                                        | Test Data          | Use Case                                      |
|------|---------------|----------------------------------------------------|--------------------|-----------------------------------------------|
| 1    | [액션 이름]   | [역할이 하는 일과 시스템이 보여 주는 것]           | [리터럴 값]        | `[UC-XXX](../use_cases/UC-XXX-name.md)`         |
| 2    | [검증 …]      | [전환을 고정하는 관찰 가능한 결과]                  | -                  | -                                             |
| 3    | [다음 액션]   | [앞 단계에서 만든 상태를 이어서 진행]               | [리터럴 값]        | `[UC-YYY](../use_cases/UC-YYY-name.md)`         |

## Validation

1. **[검사 이름]**: [흐름이 끝난 뒤 UI로 관찰 가능한 횡단적 최종 상태 기대값]
2. **[검사 이름]**: [두 번째 기대값]

## Postconditions

- [여정이 만들거나 바꾸어 남기는 데이터 레코드]
- [정리 순서 제약이 있으면 (예: "수강 등록은 그 대상 학생보다 먼저 삭제되어야 함")]
