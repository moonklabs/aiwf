# 린트 코드 (Lint Codes)

> 휴먼 리뷰용 한글 번역입니다. 실행 원문: [원문](../../../../../../plugins/aiwf-core/skills/spec-review/references/lint-codes.md). 번역과 자동 검사는 승인을 뜻하지 않으며, 검토 상태와 원문 SHA256은 [관리 목록](../../../../manifest.json)에서 확인합니다.

<!--
Copyright 2025-2026 Simon Martinelli and the AI Unified Process contributors.
Part of the AI Unified Process — https://unifiedprocess.ai
Licensed under the Apache License, Version 2.0. See LICENSE and NOTICE.
-->

`scripts/spec_lint.py`는 발견 사항마다 한 줄을 출력한다:

```text
docs/use_cases/UC-004-book-room.md:12: ERROR DANGLING_REF [UC-004]: requirement FR-019 is not in requirements.md
```

형식은 `path:line: SEVERITY CODE [element]: message`다. 줄 `0`은 발견 사항이 파일 전체에 관한 것임을 뜻한다. 종료 코드는 실행이 깨끗하면 0, `ERROR`가 있으면 1(`--strict`면 `WARN`도 포함), 사용법 오류면 2다.

## 파일 간 코드 (Cross-file codes)

| 심각도 | 코드(Code)                    | 의미                                                                                        | 고치는 곳            |
|----------|-------------------------|------------------------------------------------------------------------------------------------|---------------------|
| ERROR    | `SPEC_MISSING`          | `use_cases.puml`의 유스케이스에 `use_cases/UC-XXX-*.md`가 없다                                  | `/use-case-spec`    |
| ERROR    | `NOT_IN_DIAGRAM`        | (`Obsolete`가 아닌) 명세의 유스케이스가 `use_cases.puml`에 없다                    | `/use-case-diagram` |
| ERROR    | `DUPLICATE_ID`          | UC, TC, FR, NFR, C ID 또는 엔티티 제목이 두 번 쓰였다                                | 소유 스킬    |
| ERROR    | `DANGLING_REF`          | `**Requirements:**`의 FR, NFR, C ID, `UC-xxx BR-yyy` 인용, 테스트 케이스의 UC 링크, 또는 `**Process:**` 링크가 아무것도 가리키지 않는다 | 소유 스킬 |
| ERROR    | `BPMN_UNMAPPED`         | 이름에 알려진 유스케이스 ID가 없고 어떤 유스케이스 제목과도 일치하지 않는 BPMN 활동         | `/use-case-spec`    |
| ERROR    | `BPMN_INVALID`          | 파싱할 수 없는 `.bpmn` 파일                                                          | 모델링 도구   |
| WARN     | `FR_UNCOVERED`          | (`Rejected`나 `Deferred`가 아닌) FR을 어떤 유스케이스도 `**Requirements:**`에 나열하지 않았다             | `/use-case-spec`    |
| WARN     | `REQ_STATUS_DRIFT`      | 요구사항의 진행 상태(Open, In Progress, Implemented, Verified)가 그것을 연결한 유스케이스의 `**Status:**`가 부여하는 상태와 다르다 | `/requirements`     |
| WARN     | `BR_DUPLICATE`          | 두 유스케이스가 같은 규칙 텍스트를 담는다; 하나에 두고 `UC-xxx BR-yyy`로 인용한다          | `/use-case-spec`    |
| WARN     | `WEAK_WORD`             | 모호하거나 선택적인 단어("fast", "appropriate", "etc.", "and/or", "should", "ggf.", …)        | 소유 스킬    |
| WARN     | `GLOSSARY_AVOIDED_TERM` | `glossary.md`가 Avoid 열에 나열한 동의어                                         | 소유 스킬    |
| WARN     | `GLOSSARY_DUPLICATE`    | `glossary.md`에 두 번 정의된 용어                                                          | `/requirements`     |
| INFO     | `NO_TRACEABILITY`       | `**Requirements:**` 필드를 가진 유스케이스가 없어 FR 커버리지를 확인하지 않는다                     | `/use-case-spec`    |
| INFO     | `UC_UNUSED_BY_TC`       | 테스트 케이스가 존재하지만 어느 것도 이 유스케이스를 포함하지 않는다                                     | `/test-case`        |
| INFO     | `BASELINE_STALE`        | 더 이상 어떤 발견 사항과도 일치하지 않는 기준선 항목; `--update-baseline`으로 갱신          | —                   |
| INFO     | `VALIDATOR_MISSING`, `BPMN_PARSER_MISSING` | 형제 스킬이 설치되어 있지 않아 그 검사를 건너뛰었다                | `aiup-core` 설치 |

## 파일별 코드 (Per-file codes)

`spec_lint.py`는 `use-case-spec` 스킬의 `validate_use_case.py`를 모든 유스케이스에 대해 실행하고 그 발견 사항을 그대로 전달한다: `ERROR`는 문서가 파싱되지 않음을 뜻하고(`TITLE_MISSING`, `OVERVIEW_MISSING`, `FIELD_MISSING`, `STATUS_INVALID`, `FLOW_INCOMPLETE`, `UNEXPECTED_CONTENT`), `WARN`은 use-case-spec 스킬의 규칙이 깨졌음을 뜻한다(`SECTION_MISSING`, `NUMBERING`, `NO_ALTERNATIVE_FLOWS`, `TRIGGER_STEP_REF`, `FLOW_TERMINATION`, `POSTCONDITIONS_EMPTY`, `RULE_LABEL_MISSING`, `RULE_NUMBERING`, `TECHNICAL_TERM`, `UC_TRIGGER_EMPTY`, `UC_TRIGGER_STEP_REF`, `UC_TRIGGER_IS_PRECONDITION`, …). `/use-case-spec`로 고친다.

## 옵션 (Options)

| 옵션                       | 효과                                                                                  |
|------------------------------|-----------------------------------------------------------------------------------------|
| `--docs DIR`                 | 문서 폴더(기본 `docs`)                                                    |
| `--only UC-XXX` / `TC-XXX`   | 이 요소에 관한 발견 사항만 보고                                                  |
| `--strict`                   | 경고도 실패로 처리                                                                     |
| `--format json`              | `{"findings": [...], "summary": {...}}` 출력                                                  |
| `--baseline FILE`            | 이 기준선 사용(기본은 존재할 때 `DIR/.spec-lint-baseline.json`)               |
| `--no-baseline`              | 모든 발견 사항을 보고                                                                     |
| `--update-baseline`          | 현재의 모든 `ERROR`와 `WARN` 발견 사항을 기준선에 수용하고 종료 코드 0으로 끝낸다            |
| `--self-test`                | 내장 픽스처 실행                                                                |

기준선 항목은 코드, 파일, 요소, 메시지의 지문(fingerprint)이며 줄 번호가 아니므로, 파일 내 다른 곳을 편집해도 살아남는다.
