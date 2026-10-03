# 유스케이스 명세 — 규범적 포맷 (Use Case Specification — Normative Format)

> 휴먼 리뷰용 한글 번역입니다. 실행 원문: [원문](../../../../../../plugins/aiwf-core/skills/use-case-spec/references/format-spec.md). 번역과 자동 검사는 승인을 뜻하지 않으며, 검토 상태와 원문 SHA256은 [관리 목록](../../../../manifest.json)에서 확인합니다.

<!--
Copyright 2025-2026 Simon Martinelli and the AI Unified Process contributors.
Part of the AI Unified Process — https://unifiedprocess.ai
Licensed under the Apache License, Version 2.0. See LICENSE and NOTICE.
-->

이 문서는 AI Unified Process 스킬(`/use-case-spec`, `/reverse-engineer`)과 AI Unified Process Studio 구조 편집기가 공유하는 유스케이스 명세 포맷의 유일한 규범적 정의다. Studio 파서(`UseCaseSpecificationDocument.java`)는 *구조적* 규칙의 실행 가능한 기준이고, 스킬은 그 위에 *내용* 규칙을 더한다. 함께 제공되는 검사기(`scripts/validate_use_case.py`)는 둘 다 확인한다:

- **ERROR** — 문서가 구조 문법을 위반한다; Studio 구조 편집기가 열 수 없다(일반 markdown 편집기로 폴백되고, 대시보드에는 `**Use Case ID:**` 줄이 있을 때만 집계된다).
- **WARN** — Studio는 문서를 허용하지만 스킬 계약을 위반하거나, Studio가 저장 시 내용을 다시 쓴다(손실 있는 허용).

## 문서 구조

유스케이스마다 파일 하나. 섹션은 다음 순서다(Studio는 저장 시 이 순서로 재배열한다):

```markdown
# Use Case: <name>

## Overview

**Use Case ID:** UC-XXX
**Use Case Name:** <name>
**Primary Actor:** <roles>                      (one or more, comma-separated)
**Secondary Actors:** <roles>                    (optional)
**Goal:** <one sentence>
**Trigger:** <event that starts the use case>     (optional)
**Status:** <status value>

**Requirements:** [FR-001, NFR-004, C-003](../requirements.md)   (optional)

## Preconditions

- <bullet items>

## Main Success Scenario

1. <numbered steps, starting at 1, no gaps>

## Alternative Flows

### A1: <flow name>

**Trigger:** <condition> (step N)
**Flow:**

1. <numbered steps>
2. Use case continues at step N. / Use case ends.

## Postconditions

### Success Postconditions

- <bullet items>

### Failure Postconditions

- <bullet items>

## Business Rules

### BR-XXX: <rule name>

<free-text description>
```

`### Failure Postconditions`(독일어 `### Fehlerfall`)는 호환성을 위해 제목을 유지하지만 **최소 보장**을 담는다: 유스케이스의 모든 비성공적 종료에 대해 성립해야 하는 서술, 예를 들어 "No reservation is created". 실패에 대한 시스템 반응(오류 메시지)은 여기가 아니라 대안 흐름에 속한다.

## 언어

구조는 영어와 독일어가 동일하며, 제목, 필드 라벨, 상태 값, 규칙 접두사만 다르다. 언어는 문서에서 감지되며(일치하는 제목/라벨의 다수; 동점이나 빈 파일은 영어) 저장 시 보존된다.

| 요소(Element)              | 영어(English)                       | 독일어(German)                  |
|----------------------|-------------------------------|-------------------------|
| Title prefix         | `# Use Case:`                 | `# Use Case:` (same)    |
| Overview             | `## Overview`                 | `## Übersicht`          |
| ID field             | `**Use Case ID:**`            | `**Use-Case-ID:**`      |
| Name field           | `**Use Case Name:**`          | `**Use-Case-Name:**`    |
| Primary actor        | `**Primary Actor:**`          | `**Primärer Akteur:**`  |
| Secondary actors     | `**Secondary Actors:**`       | `**Sekundäre Akteure:**`|
| Goal                 | `**Goal:**`                   | `**Ziel:**`             |
| Use case trigger     | `**Trigger:**` (Overview)     | `**Auslösendes Ereignis:**` (reads `**Trigger:**` too) |
| Status               | `**Status:**`                 | `**Status:**` (same)    |
| Requirements         | `**Requirements:**`           | `**Anforderungen:**`    |
| Preconditions        | `## Preconditions`            | `## Vorbedingungen`     |
| Main scenario        | `## Main Success Scenario`    | `## Hauptablauf`        |
| Alternative flows    | `## Alternative Flows`        | `## Alternativabläufe`  |
| Flow trigger field   | `**Trigger:**`                | `**Auslöser:**` (reads `**Trigger:**` too) |
| Flow field           | `**Flow:**`                   | `**Ablauf:**`           |
| Postconditions       | `## Postconditions`           | `## Nachbedingungen`    |
| Success subsection   | `### Success Postconditions`  | `### Erfolgsfall`       |
| Failure subsection   | `### Failure Postconditions`  | `### Fehlerfall`        |
| Business rules       | `## Business Rules`           | `## Geschäftsregeln`    |
| Rule prefix          | `BR`                          | `GR` (reads `BR` too)   |

상태 값(어느 언어든 어느 문서에서나 읽을 수 있다):

| 영어(English)       | 독일어(German)          |
|---------------|-----------------|
| Draft         | Entwurf         |
| Reviewed      | Geprüft         |
| Approved      | Genehmigt       |
| Implemented   | Implementiert   |
| Tested        | Getestet        |
| Done          | Abgeschlossen   |
| Obsolete      | Obsolet         |

## 구조 규칙 (ERROR 수준)

1. **제목(Title)** — 첫 번째 비어 있지 않은 줄은 `# Use Case: <name>` 또는 ID 문법 `[SB]?UC-[A-Za-z0-9_-]+`에 맞는 ID 형식 제목 `# UC-XXX: <name>`이다(따라서 `SUC-`, `BUC-`, `UC-013a`, `UC-2-1`은 유효한 ID다). Studio는 저장 시 ID 형식 제목을 표준 접두사로 다시 쓴다.
2. **개요(Overview)** — `## Overview` 섹션이 존재해야 하고 다섯 개의 필수 필드(ID, Name, Primary Actor, Goal, Status)를 담아야 한다. Secondary Actors, Trigger, Requirements는 선택이다. Primary Actor는 역할 하나 또는 쉼표로 구분한 역할 목록을 담는다; 라벨은 두 경우 모두 단수(`**Primary Actor:**`, `**Primärer Akteur:**`)로 유지된다.
3. **상태(Status)** — 상태 값은 위 값 중 하나로 시작해야 한다(대소문자 무시). 값 앞에 글자 없는 장식이 있거나 값 뒤 단어 경계에 주석이 붙어도 허용된다: `✅ Implemented (2025-07-11)`와 `Approved — 🚧 partial`은 Implemented와 Approved로 읽히고, `In Progress`는 유효하지 않다.
4. **사전 조건 / 사후 조건 하위 섹션** — 불릿 항목(`- `). 자리표시자 문단(허용 오차 참조)이 아닌 다른 것은 예상 밖 내용이다.
5. **주 성공 시나리오(Main Success Scenario)** — 최상위 번호 항목(`1. `, 들여쓰기 없음). 줄바꿈된 연속 줄은 해당 항목에 이어 붙는다.
6. **대안 흐름(Alternative Flows)** — 각 흐름은 `### ` 제목 뒤에 트리거 줄(`**Trigger:**` / `**Auslöser:**`), 흐름 필드 줄(`**Flow:**` / `**Ablauf:**`), 그리고 최소 하나의 번호 단계가 온다. 셋 중 하나라도 빠진 흐름은 불완전하다. 흐름 안의 일반 산문은 예상 밖 내용이다(마크업 문단은 노트 — 허용 오차 참조).
7. **비즈니스 규칙(Business Rules)** — 각 규칙은 `### ` 제목 뒤에 자유 텍스트 설명 줄이 온다.
8. 최상위 또는 항목 섹션 안의 다른 **일반 산문**은 예상 밖 내용이다.

## 허용 오차 (손실 없이 파싱, 진단 없음)

이들은 Studio의 통과 규칙(UC-010 BR-011, FR-072)과 관대한 읽기 규칙(UC-020 BR-003)에서 온다; 생성기는 여전히 표준 형식을 내보내야 하지만 검사기는 받아들여야 한다:

- **알 수 없는 개요 줄**(예: `**Priorität:** Hoch`) — 그대로 유지.
- **추가 섹션** — 템플릿 섹션 사이 어디든 자기 제목을 가진 것(예: `## Suchkriterien`) — 자기 위치에 그대로 유지.
- **자리표시자 문단** — *비어 있는* 템플릿 섹션의 내용을 대신하는, 전부 기울임인 문단(예: `_None — the page is static._`). 실제 내용 옆에 있으면 예상 밖이다.
- **흐름 노트** — 대안 흐름 안의 마크업 문단(트리거 앞, 트리거와 흐름 필드 사이, 또는 단계 뒤에서 `**`, `_`, `*`, `>`로 시작). 흐름의 노트로 읽힌다; 노트가 트리거나 단계를 대신하지는 않는다.
- **장식된 상태 값** — 위에서 설명한 대로.
- **독일어 문서의 `**Trigger:**`** (`**Auslöser:**`로 다시 쓰임). 독일어 문서의 개요에서 이것은 유스케이스 트리거로 읽히며, 그 표준 라벨은 `**Auslösendes Ereignis:**`다 — 대안 흐름의 조건을 명명하는 `**Auslöser:**`가 의도적으로 아니다.
- **독일어 문서의 `BR-` 규칙 라벨** (`GR-`로 다시 쓰임).
- **줄바꿈된 줄** — 위 항목에 이어 붙는다.

## Studio가 저장 시 정규화 (WARN 수준)

Studio는 묻지 않고 이것들을 다시 쓴다; 이것들을 생성하는 생성기는 첫 Studio 저장에서 diff를 만든다:

- **단계나 불릿 항목 아래 중첩된 하위 불릿**은 평탄화된다 — 부모 줄에 이어 붙는다. 단계 안에 목록을 중첩하지 않는다.
- **단계, 흐름(`A1`…), 규칙(`BR-001`…) 번호는 위치 기반이다**: Studio는 저장 시 빈 번호 없이 다시 매긴다.
- **섹션 순서**는 템플릿 순서로 정규화된다.

## 스킬 계약 (WARN 수준)

`/use-case-spec` 스킬은 추가로 다음을 요구한다:

- 개요가 유스케이스 트리거를 명명한다 — 유스케이스를 시작하는 이벤트(액터의 요청, 시점, 외부 시스템의 메시지). 이 줄은 선택이므로 오래된 문서도 유효하게 남고, 스킬은 모든 새 문서에 그것을 쓴다. 검사기는 트리거가 있는데 비어 있거나, 단계를 참조하거나(`(step N)`은 대안 흐름 트리거에 속한다), 사전 조건을 그대로 반복할 때 경고한다. 그것이 정말 상태가 아니라 이벤트인지는 `/spec-review`가 판단한다.

- 다섯 개 템플릿 섹션과 두 사후 조건 하위 섹션이 모두 존재한다.
- 유스케이스 ID가 `[SB]?UC-[A-Za-z0-9_-]+`에 맞고 파일 이름이 그 ID로 시작한다(표준: `UC-XXX-<kebab-case-name>.md`).
- 주 시나리오의 단계가 빈 번호 없이 `1..n`으로 매겨진다.
- 대안 흐름이 주 시나리오 단계의 모든 의미 있는 대안이나 예외 조건을 문서화한다. 그런 것이 없는 유스케이스는 지어낸 흐름 대신 기울임 자리표시자(`_None — …_`)로 그렇게 밝힌다; 검사기는 자리표시자 없이 섹션이 비어 있을 때만 경고한다(`NO_ALTERNATIVE_FLOWS`). 각 트리거는 자기 주 시나리오 단계를 `(step N)` / `(Schritt N)`으로 명명한다; 각 흐름의 마지막 단계는 `Use case continues at step N.` 또는 `Use case ends.`로 끝난다(독일어: `Der Use Case wird bei Schritt N fortgesetzt.` / `Der Use Case endet.`).
- 성공과 실패 사후 조건이 비어 있지 않다(명시적 기울임 자리표시자 `_None — …_`도 의도된 서술로 친다).
- 비즈니스 규칙 제목이 `BR-XXX:` / `GR-XXX:` 라벨을 가지며, 문서 안에서 `BR-001`, `BR-002`, …로 빈 번호 없이 매겨진다.
- 단계에 구현 수준 용어가 없다(SMTP, email server, JWT, token, bcrypt, hash, salt, SHA, SQL, SELECT, INSERT).

### 비즈니스 규칙 ID 범위

`BR-XXX` ID는 **자기 유스케이스에 한정된다**: 모든 문서가 규칙을 `BR-001`부터 매기고, 같은 ID가 다른 문서에 나타날 수 있다. 이는 저장 시 문서마다 규칙을 다시 매기는 Studio와 일치한다. 다른 문서에서 참조하는 규칙은 유스케이스 ID로 한정하며("UC-005 BR-002"), 알맹이 규칙 ID만으로 참조하지 않는다.

## 검증

```bash
python3 scripts/validate_use_case.py [--strict] docs/use_cases/UC-*.md
```

깨끗하면 종료 코드 0; ERROR가 있으면 1(`--strict`면 WARN도 포함); `--self-test`는 내장 픽스처를 실행한다. 새로 생성한 문서는 `--strict`를 통과해야 한다. 기존에 손으로 쓴 문서는 최소한 ERROR가 없어야 하며, 그렇지 않으면 Studio가 구조 편집기에서 열 수 없다.
