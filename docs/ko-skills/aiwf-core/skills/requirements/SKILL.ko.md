# 요구사항

> 휴먼 리뷰용 한글 번역입니다. 실행 원문: [원문](../../../../../plugins/aiwf-core/skills/requirements/SKILL.md). 번역과 자동 검사는 승인을 뜻하지 않으며, 검토 상태와 원문 SHA256은 [관리 목록](../../../manifest.json)에서 확인합니다.

- 식별자: `requirements`
- 설명: 소프트웨어 요구사항을 수집·정리해 기능 요구사항(사용자 스토리), 비기능 요구사항(측정 가능한 품질 속성), 제약으로 구성된 구조적 카탈로그 문서로 작성합니다. 사용자가 "요구사항 작성", "PRD 생성", "요구사항 수집", "기능 명세 문서화", "사용자 스토리 작성", "NFR 정의", "제약 나열", "용어집 작성", "도메인 용어 정의"를 요청하거나 요구사항 카탈로그, 요구사항 분석, 제품 요구사항 문서, 기능 명세, 용어집을 언급할 때 사용합니다.

<!--
Copyright 2025-2026 Simon Martinelli and the AI Unified Process contributors.
Part of the AI Unified Process — https://unifiedprocess.ai
Licensed under the Apache License, Version 2.0. See LICENSE and NOTICE.
-->

## 지침

`docs/vision.md`를 바탕으로 `docs/requirements.md`에 요구사항 카탈로그를 생성하거나 갱신합니다.
이 문서는 기능 요구사항, 비기능 요구사항, 제약을 Markdown 표로 정리해 담습니다. 이와 함께 `docs/glossary.md`에 용어집을 생성하거나 갱신합니다(아래 [용어집](#용어집) 참고).

## 하지 말 것

- 요구사항 유형을 하나의 표에 섞지 않습니다
- 기능 요구사항에서 사용자 스토리 형식을 건너뛰지 않습니다
- 요구사항 유형에 걸쳐 ID를 중복 사용하지 않습니다
- Status 열을 비워 두지 않습니다

## 요구사항 유형

### 기능 요구사항 (FR)

시스템이 무엇을 해야 하는지 정의합니다. 항상 사용자 스토리 형식을 사용합니다:

**형식:** As a [role], I want [goal] so that [benefit].

아래 예시 표는 산출물이 따라야 할 형식을 그대로 보여 주기 위해 원문을 유지했습니다. 열은 왼쪽부터 `ID`, `Title`, `User Story`, `Priority`, `Status`이며, `User Story` 셀은 위 **형식** 문구와 정확히 일치해야 합니다.

| ID     | Title        | User Story                                                                                | Priority | Status |
|--------|--------------|-------------------------------------------------------------------------------------------|----------|--------|
| FR-001 | Create Task  | As a project manager, I want to create tasks so that I can track work items.              | High     | Open   |
| FR-002 | Assign Task  | As a project manager, I want to assign tasks to team members so that work is distributed. | High     | Open   |
| FR-003 | Filter Tasks | As a team member, I want to filter tasks by status so that I can focus on relevant items. | Medium   | Open   |

행별 의미(사용자 스토리는 원문 형식을 유지하므로 아래에 한국어 뜻을 함께 적습니다):

- `FR-001` Create Task — 프로젝트 관리자가 작업 항목을 추적할 수 있도록 작업을 생성한다. (우선순위 High, 상태 Open)
- `FR-002` Assign Task — 프로젝트 관리자가 작업을 팀 구성원에게 배정해 업무가 분산되도록 한다. (우선순위 High, 상태 Open)
- `FR-003` Filter Tasks — 팀 구성원이 관련 항목에 집중할 수 있도록 상태로 작업을 필터링한다. (우선순위 Medium, 상태 Open)

### 비기능 요구사항 (NFR)

품질 속성을 정의합니다. 측정 가능해야 합니다.

아래 예시 표도 원문을 유지했습니다. 열은 왼쪽부터 `ID`, `Title`, `Requirement`, `Category`, `Priority`, `Status`입니다.

| ID      | Title            | Requirement                                                   | Category     | Priority | Status |
|---------|------------------|---------------------------------------------------------------|--------------|----------|--------|
| NFR-001 | Response Time    | All page loads must complete within 2 seconds.                | Performance  | High     | Open   |
| NFR-002 | Availability     | System must maintain 99.9% uptime during business hours.      | Availability | High     | Open   |
| NFR-003 | Concurrent Users | System must support 100 concurrent users without degradation. | Scalability  | Medium   | Open   |
| NFR-004 | Data Encryption  | All data in transit must use TLS 1.3 encryption.              | Security     | High     | Open   |

행별 의미(측정 임계값과 범주를 함께 적습니다):

- `NFR-001` Response Time — 모든 페이지 로드는 2초 이내에 완료되어야 한다. (범주 Performance, 우선순위 High, 상태 Open)
- `NFR-002` Availability — 업무 시간 동안 가동률 99.9%를 유지해야 한다. (범주 Availability, 우선순위 High, 상태 Open)
- `NFR-003` Concurrent Users — 성능 저하 없이 동시 사용자 100명을 지원해야 한다. (범주 Scalability, 우선순위 Medium, 상태 Open)
- `NFR-004` Data Encryption — 전송 중인 모든 데이터는 TLS 1.3 암호화를 사용해야 한다. (범주 Security, 우선순위 High, 상태 Open)

### 제약 (C)

해법에 부과되는 한계와 경계를 정의합니다.

아래 예시 표도 원문을 유지했습니다. 열은 왼쪽부터 `ID`, `Title`, `Constraint`, `Category`, `Source`, `Priority`, `Status`입니다.

| ID    | Title             | Constraint                                                              | Category   | Source                 | Priority | Status |
|-------|-------------------|-------------------------------------------------------------------------|------------|------------------------|----------|--------|
| C-001 | Runtime Platform  | Backend must run on Java 21 LTS.                                        | Technical  |                        | High     | Open   |
| C-002 | Database Platform | System must use PostgreSQL 16.                                          | Technical  |                        | High     | Open   |
| C-003 | Browser Support   | UI must support Chrome, Firefox, and Safari (latest 2 versions).        | Technical  |                        | High     | Open   |
| C-004 | Budget Limit      | Total development cost must not exceed $50,000.                         | Business   |                        | High     | Open   |
| C-005 | Deadline          | System must be production-ready by Q2 2025.                             | Schedule   |                        | High     | Open   |
| C-006 | Right to Erasure  | Personal data of a customer must be erased within 30 days of a request. | Regulatory | GDPR Art. 17(1), 12(3) | High     | Open   |

행별 의미(범주와 출처를 함께 적습니다):

- `C-001` Runtime Platform — 백엔드는 Java 21 LTS에서 실행되어야 한다. (범주 Technical, 우선순위 High, 상태 Open)
- `C-002` Database Platform — 시스템은 PostgreSQL 16을 사용해야 한다. (범주 Technical, 우선순위 High, 상태 Open)
- `C-003` Browser Support — UI는 Chrome, Firefox, Safari(각 최신 2개 버전)를 지원해야 한다. (범주 Technical, 우선순위 High, 상태 Open)
- `C-004` Budget Limit — 총 개발 비용은 50,000달러를 넘지 않아야 한다. (범주 Business, 우선순위 High, 상태 Open)
- `C-005` Deadline — 2025년 2분기까지 프로덕션 준비를 마쳐야 한다. (범주 Schedule, 우선순위 High, 상태 Open)
- `C-006` Right to Erasure — 고객의 개인 데이터는 삭제 요청 후 30일 이내에 삭제되어야 한다. (범주 Regulatory, 출처 GDPR Art. 17(1), 12(3), 우선순위 High, 상태 Open)

**Source** 열은 선택 사항입니다. 제약이 외부 문서에서 온 것이 아니면 생략합니다. 이 열은 제약이 어디에서 왔는지, 즉 법률·규정·표준·내부 정책을 조문이나 항(그리고 필요한 경우 버전까지) 단위로 적습니다(`GDPR Art. 17(1)`, `ISO 27001:2022 A.8.24`, `Operating Policy OP-12 v3`). 이렇게 하면 강제되는 규칙의 출처를 추적할 수 있습니다. 이 열을 두는 경우, 모든 `Regulatory` 제약에는 값을 채우고 나머지는 비워 둡니다. Status는 마지막 열로 유지합니다.

## 용어집

용어집은 도메인 개념마다 하나의 이름을 고정하여, 요구사항·유스케이스·테스트 케이스·코드가 모두 같은 단어를 사용하도록 합니다. [references/glossary.md](../../../../../plugins/aiwf-core/skills/requirements/references/glossary.md)([한글 검토본](references/glossary.ko.md))를 구조로 사용하십시오(이 경로는 이 SKILL.md가 있는 폴더 기준입니다). `Term | Definition | Avoid` 열을 가진 표 하나입니다.

- **Term** — 선호하는 이름이며, 비즈니스에서 부르는 대로 단수형으로 적습니다. 개념마다 한 행이며, 같은 용어를 두 번 정의하지 않습니다.
- **Definition** — 이 개념을 이웃 개념과 구별해 주는 한두 문장입니다(예: Guest가 반드시 Reservation을 만든 사람인 것은 아닙니다).
- **Avoid** — 이 개념에 사용해서는 안 되는, 쉼표로 구분한 동의어이거나 비어 있습니다. 모호하거나 오해를 부를 수 있는 단어만 여기에 넣습니다. 여기에 올린 단어는 명세 어디에 나타나든 표시됩니다.

용어는 비전 문서와 사용자 스토리의 명사(역할, 비즈니스 객체, 상태, 비즈니스 이벤트)에서 가져옵니다. 일반적인 단어(system, data, user interface)는 제외합니다. 용어집이 이미 있으면 새 용어를 추가하고, 사용자가 바꾸라고 요청하지 않는 한 기존 행을 유지합니다.

## 참고

ID 접두사, 우선순위 수준, 상태 값, NFR 범주, 제약 범주는 [references/REFERENCE.md](../../../../../plugins/aiwf-core/skills/requirements/references/REFERENCE.md)([한글 검토본](references/REFERENCE.ko.md))를 참고하십시오. 이 경로는 프로젝트 루트가 아니라 이 SKILL.md가 있는 폴더 기준입니다.

## 요구사항 품질 검사

모든 요구사항은 확정하기 전에 다음 검사를 통과해야 합니다:

| 검사        | 규칙                                        | 나쁜 예                                    | 좋은 예                          |
|-------------|---------------------------------------------|--------------------------------------------|----------------------------------|
| 측정 가능성 | NFR에는 숫자나 임계값이 있어야 합니다        | "시스템은 빨라야 한다"                     | "페이지가 2초 이내에 로드된다"    |
| 단일성      | 한 행에 요구사항 하나                        | "시스템은 데이터를 가져오고 내보내야 한다" | FR-001과 FR-002로 분리합니다      |
| 명확성      | 주관적인 표현이 없어야 합니다                | "사용자 친화적 인터페이스"                 | "WCAG 2.1 AA 준수"               |
| 검증 가능성 | 통과/실패 테스트를 작성할 수 있어야 합니다   | "시스템은 안정적이다"                      | "30일 동안 99.9% 가동"            |
| ID 고유성   | 모든 표에서 ID가 중복되지 않아야 합니다      | FR-001 항목 두 개                          | 각 ID는 정확히 한 번만 사용        |

## 오류 복구

- **원본 문서가 불완전한 경우**: 무엇이 빠졌는지(역할, NFR 범주, 제약)를 나열하고, 진행하기 전에 사용자에게 명확히 해 달라고 요청합니다
- **사용자의 요구사항이 모호한 경우**: 측정 가능한 요구사항으로 다시 쓰고 사용자에게 임계값을 확인해 달라고 요청합니다
- **요구사항이 충돌하는 경우**: 충돌을 명시적으로 표시하고(예: "FR-003은 실시간 동기화를 요구하지만 C-002는 배치 처리로 제한합니다") 사용자에게 해결을 요청합니다
- **이해관계자 역할이 빠진 경우**: 일반적인 역할(User, Admin, System)을 기본값으로 두고 사용자 검토용으로 표시합니다

> **형식은 오류 복구에서도 유지됩니다.** 모호함, 충돌, 잠정 상태는 사용자 스토리 형식을 포기할 근거가 되지 않습니다. 충돌 또는 미확인으로 표시하는 FR 행도 반드시 "As a [role], I want [goal] so that [benefit]."로 읽혀야 합니다. 문제는 메모나 Status 열에 기록하고(예: `Conflict`, `Needs review`), 요구사항을 "Support real-time sync." 같은 평면적 진술로 떨어뜨려서는 안 됩니다.

## 워크플로

1. 비전 문서 또는 프로젝트 개요를 읽습니다
2. TodoWrite로 요구사항 유형마다 작업을 만듭니다
3. 문서 헤더를 작성합니다
4. 기능 요구사항:
    - 사용자 역할을 식별합니다
    - 명확한 목표와 이점을 가진 사용자 스토리를 정의합니다
    - 비즈니스 가치에 따라 우선순위를 지정합니다
5. 비기능 요구사항:
    - 측정 가능한 품질 속성을 정의합니다
    - NFR 유형별로 분류합니다
    - 요구사항이 검증 가능한지 확인합니다
6. 제약:
    - 기술적·비즈니스적 한계를 문서화합니다
    - 제약 유형별로 분류합니다
    - 규제 또는 외부에서 부과된 제약마다 Source 열에 출처를 적습니다
7. 검증: 모든 요구사항을 위 품질 검사 표에 비추어 검사합니다
    - 모든 표에서 ID가 중복되지 않아야 합니다
    - 모든 Status 열이 채워져야 합니다
    - **강제 게이트:** 모든 FR User Story가 "As a [role], I want [goal] so
      that [benefit]"와 일치해야 합니다 — 각 행을 훑어 "As a", "I want", "so
      that" 중 하나라도 빠진 행은 거부하고 확정 전에 다시 씁니다. 예외는 없습니다
    - 모든 NFR이 측정 가능한 임계값을 포함해야 합니다
8. 유스케이스가 존재하는 기존 카탈로그를 갱신할 때는, 각 요구사항을 연결하는 유스케이스의 `**Status:**`에서
   해당 요구사항의 진행 상태(Open, In Progress, Implemented, Verified)를 설정합니다(참고 자료의 Status에 정의된 대로).
   Deferred 또는 Rejected 상태는 임의로 바꾸지 않습니다
9. 카탈로그에서 사용한 도메인 용어로 `docs/glossary.md`를 생성하거나 갱신하고, 모든 요구사항에서 정확히 그 용어만
   사용합니다(Avoid 동의어는 절대 사용하지 않습니다)
10. 할 일을 완료로 표시합니다
