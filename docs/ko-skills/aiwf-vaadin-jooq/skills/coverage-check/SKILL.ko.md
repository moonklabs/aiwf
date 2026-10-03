# 커버리지 점검

> 휴먼 리뷰용 한글 번역입니다. 실행 원문: [원문](../../../../../plugins/aiwf-vaadin-jooq/skills/coverage-check/SKILL.md). 번역과 자동 검사는 승인을 뜻하지 않으며, 검토 상태와 원문 SHA256은 [관리 목록](../../../manifest.json)에서 확인합니다.

- 식별자(name): `coverage-check`
- 설명(description): 이미 작성된 유스 케이스(UC-XXX) 또는 테스트 케이스(TC-XXX)를 명세와 대조해 감사하고 커버리지 행렬을 보고한다: 주 성공 시나리오 단계, 대안 흐름, 업무 규칙, 사전 조건, 사후 조건 중 어느 것에 코드와 테스트가 뒷받침되는지, 어느 것이 아직 열려 있는지, 어느 코드나 테스트가 명세에서 벗어났는지(drift)를 보여준다. 사용자가 "check coverage", "run a coverage check", "is UC-001 fully implemented", "is UC-001 completely tested", "audit the use case", "show me the coverage matrix", "do a traceability check", "what is still missing for UC-001", "can I set the status to Tested"를 요청할 때 사용한다. 이는 명세 커버리지이며, 커버리지 보고서의 라인 커버리지가 아니다. 보고만 하고 코드도 테스트도 파일도 작성하지 않는다. 사용자가 나열이 아니라 공백 해소를 원하면 대신 /implement, /implement-hilla, /browserless-test, /hilla-test, /karibu-test, /playwright-test를 사용한다.

<!--
Copyright 2025-2026 Simon Martinelli and the AI Unified Process contributors.
Part of the AI Unified Process — https://unifiedprocess.ai
Licensed under the Apache License, Version 2.0. See LICENSE and NOTICE.
-->

## 지침

`$ARGUMENTS` 아티팩트 — 유스 케이스(`UC-XXX`) 또는 테스트 케이스(`TC-XXX`) — 를, 그것을 실현하기로 되어 있는 코드와 테스트와 대조해 감사하고 결과를 보고하십시오.

이 스킬은 이 플러그인의 읽기 전용 `uc-coverage` 서브에이전트로 가는 정문입니다. 감사 체크리스트 — 커버리지 단위를 어떻게 도출하는지, 어떤 마커를 검색하는지, 각 단위를 어떻게 판정하는지 — 는 플러그인 루트의 `agents/uc-coverage.md`에 있습니다(`**/agents/uc-coverage.md` 글롭으로 찾으십시오). 그 내용은 **여기서 의도적으로 반복하지 않습니다**. 그래야 둘이 어긋날 수 없습니다. 당신의 일은 인자 파싱, 위임, 보고의 충실한 제시, 그리고 다음 단계 제안입니다.

보고서가 산출물입니다. **발견한 것을 고치지 않습니다.**

## 인자

모든 것은 `$ARGUMENTS`에서 파싱됩니다. 토큰은 어떤 순서로 나타나도 됩니다.

| 토큰                                                     | 의미                                                             |
|-----------------------------------------------------------|----------------------------------------------------------------------|
| `UC-001`, `UC001`, `uc 1`, 또는 명세로의 경로    | 감사할 아티팩트 — `UC-001`로 정규화하고 세 자리로 0을 채운다 |
| `TC-001`, `TC001`                                          | 대신 테스트 케이스 여정을 감사한다                                   |
| `implementation`, `impl`, `code`                           | 모드 `implementation`                                               |
| `tests`, `test`                                            | 모드 `tests`                                                        |
| `both`, 또는 모드 토큰이 전혀 없음                            | 모드 `both`(기본값)                                                |
| `wip`, `--wip`, `work in progress`, `in progress`, `draft` | 작업 진행 중 한정자를 그대로 전달한다                         |
| id가 둘 이상                                            | 정확히 그 id들만의 제한된 일괄 감사(sweep)                                |
| 아무것도 없음                                                    | [일괄 감사(Sweeps)](../../../../../plugins/aiwf-vaadin-jooq/skills/coverage-check/SKILL.md#sweeps) 참고                                               |

중요한 파싱 규칙 세 가지가 있습니다:

- **모드는 독립된 한정자 토큰으로만 좁혀집니다.** 문장에서 — "is UC-001 fully implemented?" — 단어 *implemented*는 산문이지 모드가 아닙니다: `both`를 실행하십시오. 조용히 `implementation`으로 좁히면 이 스킬이 닫으려는 바로 그 공백을 다시 만듭니다.
- **위임 전에 해석된 인자를 한 줄로 밝히십시오**(`Auditing UC-001, mode both.`). 그러면 잘못된 파싱의 비용이 잘못된 판정을 내는 대신 재실행 한 번으로 끝납니다.
- id가 `docs/use_cases/` 또는 `docs/use-cases/`(두 표기가 모두 쓰임) 아래 어떤 파일로도 해석되지 않으면, 가까운 일치를 나열하고 물으십시오. 코드에서 추론한 명세에 대고 감사하지 마십시오.

## 워크플로

1. `$ARGUMENTS`를 id 또는 id들, 모드, 작업 진행 중 플래그로 파싱한다. id가 없으면
   [일괄 감사(Sweeps)](../../../../../plugins/aiwf-vaadin-jooq/skills/coverage-check/SKILL.md#sweeps)로 간다.
2. 명세가 존재하는지 확인한다 — `docs/use_cases/UC-XXX-*.md`(`docs/use-cases/`도 확인)
   또는 `docs/test_cases/TC-XXX-*.md`. 없으면 멈추고 묻는다.
3. 해석된 인자를 한 줄로 밝힌다.
4. 감사를 위임한다 — [위임(Delegation)](../../../../../plugins/aiwf-vaadin-jooq/skills/coverage-check/SKILL.md#delegation) 참고.
5. 반환된 보고서를 그대로 제시한다. 이 대화에 같은 id와 모드의 감사가 이미 있으면
   비교를 덧붙인다 — [반복 실행(Repeated Runs)](../../../../../plugins/aiwf-vaadin-jooq/skills/coverage-check/SKILL.md#repeated-runs) 참고.
6. 공백을 닫는 명령을 제안한다 — [보고 후(After the Report)](../../../../../plugins/aiwf-vaadin-jooq/skills/coverage-check/SKILL.md#after-the-report) 참고. 그런 다음 멈춘다.

## 위임

감사를 이 플러그인의 읽기 전용 `uc-coverage` 서브에이전트에 넘기십시오(`aiup-vaadin-jooq:uc-coverage`로 나타날 수 있음). 정확히 id, 모드, 그리고 해당될 때 `work in progress`만 전달하고 그 외에는 아무것도 전달하지 마십시오:

```text
UC-001 both
UC-001 tests
UC-001 implementation work in progress
TC-001 tests
```

명세 요약, 당신이 구현한다고 믿는 파일 목록, 답이 어떨 것이라는 예상을 덧붙이지 마십시오. 에이전트가 스스로 증거를 찾아야 합니다. 호출자가 제공한 파일 목록은 감사를 도장 찍기로 만드는 가장 빠른 길입니다.

보고서는 돌아온 그대로 제시하십시오 — 제목, 점수 줄, 전체 행렬, `### Gaps`, `### Drift`, `### Suggested status`. 산문으로 요약하지 말고, 공간을 아끼려고 커버된 행을 빼지 말고, 판정을 바꾸지 마십시오. 행렬이 산출물입니다. 판정에 동의하지 않으면 그 아래에 그렇게 말하고 행은 그대로 두십시오.

## 보고 후

- 각 공백을 그것을 닫는 명령으로 바꾸되, 프로젝트에 이미 있는 스택에 맞추십시오:
  구현 공백에는 `/implement` 또는 `/implement-hilla`; 단위 테스트 공백에는 `/browserless-test`, `/hilla-test`,
  또는 `/karibu-test`; 브라우저 또는 여정 공백에는 `/playwright-test`. 제안하고,
  사용자가 승낙할 때만 실행하십시오.
- Drift는 알려진 해법이 있는 공백이 아닙니다. 각 drift 항목에 대해 어느 쪽이 맞는지 사용자에게 물으십시오 — 명세
  (`/use-case-spec UC-XXX`가 그 동작을 추가)인지 코드(`/implement`가 제거)인지 — 그리고 그 답에 맞는
  명령만 제안하십시오. 스스로 한쪽을 고르지 마십시오: 그 결정 없이 코드에 맞춰 명세를 바꾸거나 명세에 맞춰 코드를
  바꾸는 것이 `/spec-review`와 `/coverage-check`를 맴돌게 만드는 원인입니다.
- 공백을 스스로 닫지 말고, "한 줄뿐이니까"라며 "빨리" 닫지도 마십시오. 감사자가 한 줄 고치는 것도 방금 내린
  판정에 대한 미검토 변경입니다.
- 에이전트는 빌드나 테스트를 실행할 수 없습니다. `Tested` 제안을 반복하기 전에, 스위트가 통과하는지 물으십시오.
- `### Suggested status`는 제안으로서 전달하고, 바뀔 줄의 이름을 밝히십시오. 이 보고의 일부로 명세의
  `**Status:**` 줄을 편집하지 마십시오.

## 반복 실행

에이전트는 매번 처음부터 시작하고 이전 판정을 모릅니다. 당신은 압니다. 이 대화에 같은 id와 모드의 보고서가 이미 있으면 보고서 아래에 한 섹션을 덧붙이십시오 — 행렬 자체는 에이전트가 반환한 그대로 둡니다:

```markdown
### Since the last run

- Closed: BR-002, A1
- New: A3 — `PersonForm.java` changed since the last run
- Changed without a change: Step 4 Covered → Partial; neither the specification nor the files
  named in the row changed
- Still open after a fix aimed at it: Post-S-1
```

- 명세도 증거 파일도 바뀌지 않았는데 판정이 바뀌었다면 감사자의 판단이 흔들린 것이지 새 작업이 아닙니다. 그렇게 말하고, 그것에 대응할지 사용자에게 물으십시오. 그에 대한 명령을 제안하지 마십시오.
- 겨냥한 수정 후에도 남아 있는 공백: 같은 명령을 다시 제안하지 마십시오. 감사자가 무엇을 원하고 코드가 무엇을 하는지 밝히고, 사용자가 정하도록 청하십시오 — 바뀌어야 하는 것이 명세일 수 있으며, 그것은 공백이 아니라 결정입니다.
- 모든 단위가 `Covered` 또는 `n/a`이면 감사는 끝난 것입니다. 추가 실행을 제안하지 마십시오.

## 서브에이전트가 없는 호스트

서브에이전트는 Claude Code 고유이며 Agent Plugins 표준의 일부가 아닙니다. 호스트에 서브에이전트가 없으면 `**/agents/uc-coverage.md` 글롭으로 `agents/uc-coverage.md`를 찾고 — 스킬을 한 폴더씩 설치하는 호스트는 플러그인 루트를 노출하지 않으므로 이 스킬의 폴더를 기준으로 상대 해석하지 마십시오 — 지침 문서로서 처음부터 끝까지 직접 따르십시오. 그 체크리스트는 Claude Code에 의존하지 않습니다. 그것이 정말로 없으면, 기억으로 감사를 즉흥적으로 만들지 말고 없다고 말하십시오. 체크리스트가 *곧* 이 스킬입니다.

인라인으로 실행하면 에이전트의 도구 제한과 깨끗한 컨텍스트를 잃습니다. 그래서 그 위에 두 규칙이 적용됩니다: 대화 앞부분에서 작성했다고 기억하는 것에 의존하지 말고 명세와 코드를 디스크에서 다시 읽으십시오. 그리고 에이전트의 `## DO NOT`을 자신에게 구속력 있는 것으로 취급하십시오 — 무엇보다 "no `file:line`, no `Covered`".

## 일괄 감사(Sweeps)

id가 없을 때: 대화가 방금 특정 `UC-*` 또는 `TC-*`를 다루고 있었다면 그것을 제안하고 물으십시오. 그렇지 않으면 있는 것을 나열하고 — 두 명세 디렉터리에 대한 글롭에 더해 `**Status:**` 줄에 대한 grep — 어느 것을 감사할지 물으십시오. 기본적으로 모든 것을 감사하지 마십시오.

사용자가 실제로 일괄 감사를 요청할 때("all", "every use case", "sweep") 그것은 **서른 번의 감사가 아니라 분류(triage) 단계**입니다:

1. **사전 단계, 서브에이전트 전혀 없음.** 모든 명세에 대해 id, 제목, `**Status:**`를 수집하고, 더해 트리 전체에서 리터럴 id를 한 번 grep하여 *어떤* 구현 마커와 *어떤* 테스트 마커가 존재하는지 본다. 프로젝트 전체에 도구 호출 두세 번.
2. **그 표를 먼저 공개한다.** 그것만으로 흔한 질문 — 어느 유스 케이스에 아무 뒷받침이 없는가 — 에 감사 비용 없이 답한다.
3. **그런 다음 순위를 매기고 상한을 둔다.** 전체 감사는 의심스러운 행에만 간다: 상태가 `Implemented` 또는 `Tested`라고 주장하는데 마커가 없는 경우, 또는 마커는 있는데 상태가 `Approved`인 경우(코드보다 뒤처진 상태). 기본 상한: **호출당 전체 감사 다섯 건**, 한 번에 하나씩 실행.
4. **상한을 넘기기 전에 숫자를 밝히며 묻는다** — "30 use cases, 7 look suspicious. Audit those 7 now, or name the ones you want?" 조용히 30건을 실행하지 마십시오.
5. 산출물은 요약 표와 실제로 감사한 것들에 대한 전체 행렬, 그리고 건너뛴 id를 밝히는 한 줄이다. 그래야 아무도 분류 행을 감사로 오해하지 않는다. 한 호출에서 같은 id를 두 번 감사하지 마십시오.

## 하지 말 것

- 코드, 테스트, 명세를 작성하거나 편집하지 마십시오 — `**Status:**` 줄 포함.
- 이 파일에 에이전트의 감사 체크리스트를 다시 적거나 바꿔 말하지 마십시오. `agents/uc-coverage.md`가 그것을 소유한다.
- 판정을 완화하거나, 올리거나, 빼지 말고, 행렬 대신 요약을 제시하지 마십시오.
- 에이전트에게 무엇을 찾을 것으로 기대하는지 말하지 마십시오.
- 빌드나 테스트 스위트를 실행했다고 주장하지 마십시오.
- 요청받지 않고 모든 유스 케이스를 감사하지 말고, 확인 없이 일괄 감사 상한을 넘기지 마십시오.
