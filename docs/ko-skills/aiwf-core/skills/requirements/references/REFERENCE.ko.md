# 요구사항 참고 자료

> 휴먼 리뷰용 한글 번역입니다. 실행 원문: [원문](../../../../../../plugins/aiwf-core/skills/requirements/references/REFERENCE.md). 번역과 자동 검사는 승인을 뜻하지 않으며, 검토 상태와 원문 SHA256은 [관리 목록](../../../../manifest.json)에서 확인합니다.

<!--
Copyright 2025-2026 Simon Martinelli and the AI Unified Process contributors.
Part of the AI Unified Process — https://unifiedprocess.ai
Licensed under the Apache License, Version 2.0. See LICENSE and NOTICE.
-->

## ID 접두사

| 접두사 | 유형     | 예      |
|--------|----------|---------|
| FR     | 기능 요구사항(Functional Requirement)     | FR-001  |
| NFR    | 비기능 요구사항(Non-Functional Requirement) | NFR-001 |
| C      | 제약(Constraint)                          | C-001   |

## 우선순위

| 우선순위 | 설명                                       |
|----------|--------------------------------------------|
| High     | 반드시 있어야 합니다(Must have). 핵심 기능 또는 중요한 품질. |
| Medium   | 있어야 합니다(Should have). 중요하지만 없어도 시스템은 동작합니다. |
| Low      | 있으면 좋습니다(Nice to have). 향후 릴리스로 미룰 수 있습니다. |

## 상태

| 상태        | 설명                                     |
|-------------|------------------------------------------|
| Open        | 요구사항이 정의되었으나 아직 구현되지 않았습니다. |
| In Progress | 현재 구현 중입니다.                      |
| Implemented | 구현이 완료되어 검증을 기다립니다.       |
| Verified    | 테스트로 확인되어 동작이 검증되었습니다. |
| Deferred    | 향후 릴리스로 연기되었습니다.            |
| Rejected    | 범위에서 제거되었습니다.                 |

Deferred와 Rejected는 범위 결정이며 수동으로 설정합니다. Open, In Progress, Implemented, Verified는
진행 상태이며, 진행 상태는 `**Requirements:**` 줄에 해당 요구사항을 나열한 유스케이스를 따릅니다:

| 요구사항 상태 | 조건                                                              |
|---------------|-------------------------------------------------------------------|
| Open          | 연결된 유스케이스가 아직 하나도 Implemented가 아닐 때(모두 Draft, Reviewed, Approved) |
| In Progress   | 연결된 유스케이스 중 일부는 Implemented 이상이고 일부는 아닐 때   |
| Implemented   | 연결된 모든 유스케이스가 Implemented, Tested, Done일 때            |
| Verified      | 연결된 모든 유스케이스가 Tested 또는 Done일 때                     |

폐기된 유스케이스는 집계하지 않습니다. 어떤 유스케이스도 연결하지 않는 요구사항은 상태를 수동으로 유지합니다.
`/spec-review`는 유스케이스와 모순되는 진행 상태를 `REQ_STATUS_DRIFT`로 보고하며, `--trace` 매트릭스는
유스케이스가 만들어 내는 상태를 보여 줍니다.

## NFR 범주

| 범주            | 설명                                       |
|-----------------|--------------------------------------------|
| Performance     | 속도, 처리량, 응답 시간                    |
| Scalability     | 성장을 감당하는 능력                        |
| Availability    | 가동률, 내결함성                            |
| Security        | 인증, 권한 부여, 암호화                     |
| Usability       | 사용자 경험, 접근성                         |
| Maintainability | 코드 품질, 문서화, 모듈성                   |
| Portability     | 플랫폼 독립성, 배포 유연성                  |

## 제약 범주

| 범주        | 설명                                    |
|-------------|-----------------------------------------|
| Technical   | 기술 스택, 플랫폼, 연동                 |
| Business    | 예산, 자원, 조직 정책                   |
| Schedule    | 마감, 마일스톤, 시간 제약               |
| Regulatory  | 법률, 규정 준수, 산업 표준              |
| Operational | 배포, 유지보수, 지원 요구사항           |

