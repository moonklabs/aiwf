# 커버리지 점검 (Coverage Check)

> 휴먼 리뷰용 한글 번역입니다. 실행 원문: [원문](../../../../../plugins/aiwf-angular-jpa/skills/coverage-check/SKILL.md). 번역과 자동 검사는 승인을 뜻하지 않으며, 검토 상태와 원문 SHA256은 [관리 목록](../../../manifest.json)에서 확인합니다.

**식별자(name):** `coverage-check`
**설명(description):** 이미 작성된 유스 케이스(UC-XXX)나 테스트 케이스(TC-XXX)를 명세에 대조해 감사하고 커버리지 매트릭스를 보고합니다. 어떤 주요 성공 시나리오 단계, 대안 흐름, 비즈니스 규칙, 사전 조건, 사후 조건에 코드와 테스트가 뒷받침되는지, 무엇이 아직 열려 있는지, 어떤 코드나 테스트가 명세에서 벗어났는지를 보여 줍니다. 사용자가 "check coverage", "run a coverage check", "is UC-001 fully implemented", "is UC-001 completely tested", "audit the use case", "show me the coverage matrix", "do a traceability check", "what is still missing for UC-001", "can I set the status to Tested"를 요청할 때 사용합니다. 이것은 커버리지 보고서의 줄 커버리지가 아니라 명세 커버리지입니다. 보고만 하며 — 코드도, 테스트도, 파일도 쓰지 않습니다. 간극을 나열하는 것이 아니라 닫기를 원하면 대신 /implement, /spring-boot-test, /vitest-test, /playwright-test를 사용하십시오.

> 번역자 주: 본문에 나오는 상대 경로(`docs/use_cases/`, `agents/uc-coverage.md` 등)는 원문 설치 스킬 기준의 경로입니다. 참조 문서 [agents/uc-coverage.ko.md](../../agents/uc-coverage.ko.md)도 함께 번역했습니다.

<!--
Copyright 2025-2026 Simon Martinelli and the AI Unified Process contributors.
Part of the AI Unified Process — https://unifiedprocess.ai
Licensed under the Apache License, Version 2.0. See LICENSE and NOTICE.
-->

## 지침

산출물 $ARGUMENTS — 유스 케이스(`UC-XXX`) 또는 테스트 케이스(`TC-XXX`) — 를 그것을
실현해야 하는 코드와 테스트에 대조하여 감사하고 결과를 보고하십시오.

이 스킬은 이 플러그인의 읽기 전용 `uc-coverage` 서브 에이전트로 가는 정문입니다. 감사
체크리스트 — 커버리지 단위를 어떻게 도출하는지, 어떤 마커를 검색하는지, 각 단위를 어떻게 판정하는지 —
는 플러그인 루트의 `agents/uc-coverage.md`에 있으며(glob `**/agents/uc-coverage.md`로
찾으십시오) 여기서는 **의도적으로 반복하지 않습니다**, 그래서 둘이 어긋날 수 없습니다. 당신의
일은 인자 파싱, 위임, 보고서의 충실한 제시, 다음 단계 제안입니다.

보고서가 산출물입니다. **당신은 그것이 찾은 것을 고치지 않습니다.**

## 인자

모든 것은 `$ARGUMENTS`에서 파싱되며, 토큰은 어떤 순서로든 나타날 수 있습니다.

| 토큰 | 의미 |
|------|------|
| `UC-001`, `UC001`, `uc 1`, 또는 명세 경로 | 감사할 산출물 — 세 자리로 0을 채운 `UC-001`로 정규화 |
| `TC-001`, `TC001` | 대신 테스트 케이스 여정을 감사 |
| `implementation`, `impl`, `code` | 모드 `implementation` |
| `tests`, `test` | 모드 `tests` |
| `both`, 또는 모드 토큰 없음 | 모드 `both`(기본값) |
| `wip`, `--wip`, `work in progress`, `in progress`, `draft` | 작업 중 한정자를 그대로 전달 |
| 두 개 이상의 id | 정확히 그 id들만의 한정된 훑기 |
| 없음 | [Sweeps](../../../../../plugins/aiwf-angular-jpa/skills/coverage-check/SKILL.md#sweeps) 참조 |

세 가지 파싱 규칙이 중요합니다:

- **모드는 독립된 한정자 토큰으로만 좁혀집니다.** 문장에서 — "is UC-001 fully
  implemented?" — *implemented*라는 단어는 산문이지 모드가 아닙니다: `both`를 실행하십시오. 조용히
  `implementation`으로 좁히면 이 스킬이 닫으려는 바로 그 간극을 다시 만듭니다.
- **위임하기 전에 해석된 인자를 한 줄로 밝히십시오**(`Auditing UC-001, mode both.`) —
  잘못 파싱해도 잘못된 판정을 내는 대신 재실행 한 번으로 끝납니다.
- id가 `docs/use_cases/`나 `docs/use-cases/`(두 철자가 모두 쓰입니다) 아래 어떤 파일로도
  해석되지 않으면, 근접 일치를 나열하고 물으십시오. 코드에서 유추한 명세에 대고 감사하지 마십시오.

## 워크플로

1. `$ARGUMENTS`를 id 또는 id들, 모드, 작업 중 플래그로 파싱합니다. id가 없으면
   [Sweeps](../../../../../plugins/aiwf-angular-jpa/skills/coverage-check/SKILL.md#sweeps)로 갑니다.
2. 명세가 존재하는지 확인합니다 — `docs/use_cases/UC-XXX-*.md`(`docs/use-cases/`도 확인)
   또는 `docs/test_cases/TC-XXX-*.md`. 없으면 멈추고 물어봅니다.
3. 해석된 인자를 한 줄로 밝힙니다.
4. 감사를 위임합니다 — [Delegation](../../../../../plugins/aiwf-angular-jpa/skills/coverage-check/SKILL.md#delegation) 참조.
5. 반환된 보고서를 그대로 제시합니다. 이 대화가 이미 같은 id와 모드의 감사를 가지고 있으면
   비교를 추가합니다 — [Repeated Runs](../../../../../plugins/aiwf-angular-jpa/skills/coverage-check/SKILL.md#repeated-runs) 참조.
6. 간극을 닫는 명령을 제안합니다 — [After the Report](../../../../../plugins/aiwf-angular-jpa/skills/coverage-check/SKILL.md#after-the-report) 참조. 그리고 멈춥니다.

## 위임

감사를 이 플러그인의 읽기 전용 `uc-coverage` 서브 에이전트에 넘기십시오(`aiup-angular-jpa:uc-coverage`로
나타날 수 있습니다). 정확히 id, 모드, 그리고 해당되면 `work in progress`만 전달하고 다른 것은
전달하지 마십시오:

```text
UC-001 both
UC-001 tests
UC-001 implementation work in progress
TC-001 tests
```

명세 요약, 구현한다고 생각하는 파일 목록, 답이 무엇일 것으로 예상하는지를 덧붙이지 마십시오.
에이전트는 스스로 증거를 찾아야 합니다; 호출자가 제공한 파일 목록은 감사를 도장 찍기로 바꾸는
가장 빠른 길입니다.

보고서를 돌아온 그대로 제시하십시오 — 제목, 점수 줄, 전체 매트릭스, `### Gaps`,
`### Drift`, `### Suggested status`. 산문으로 요약하지 말고, 공간을 아끼려고 커버된
행을 빼지 말고, 판정을 바꾸지 마십시오. 매트릭스가 산출물입니다; 판정에 동의하지 않으면 그
아래에 그렇게 말하고 행은 그대로 두십시오.

## 보고서 이후

- 각 간극을 그것을 닫는 명령으로 바꾸십시오: 구현 간극에는 `/implement`(백엔드 또는
  Angular); 백엔드 테스트 간극에는 `/spring-boot-test`; Angular 컴포넌트나
  서비스 테스트 간극에는 `/vitest-test`; 브라우저나 여정 간극에는 `/playwright-test`. 제안하고,
  사용자가 동의할 때만 하나를 실행하십시오.
- 표류는 알려진 수정이 있는 간극이 아닙니다. 각 표류 항목마다 사용자에게 어느 쪽이 맞는지 물으십시오 — 명세
  (`/use-case-spec UC-XXX`가 그 동작을 추가)인지 코드(`/implement`가 그것을 제거)인지 —
  그리고 답에 맞는 명령만 제안하십시오. 스스로 어느 쪽도 고르지 마십시오: 그 결정 없이
  명세를 코드에 맞추거나 코드를 명세에 맞추는 것이 `/spec-review`와 `/coverage-check`를
  맴돌게 하는 원인입니다.
- 스스로 간극을 닫지 말고, "한 줄뿐이니까"라며 "빨리" 닫지도 마십시오. 감사자의 한 줄
  수정도 당신이 방금 내린 판정에 대한 리뷰되지 않은 변경입니다.
- 에이전트는 빌드나 테스트를 실행할 수 없습니다. `Tested` 제안을 반복하기 전에 스위트가
  통과하는지 물으십시오.
- `### Suggested status`를 제안으로 전달하고, 바뀔 줄을 명명하십시오. 이 보고의 일부로
  명세의 `**Status:**` 줄을 편집하지 마십시오.

## 반복 실행

에이전트는 매번 처음부터 시작하며 이전 판정을 모릅니다; 당신은 압니다. 이 대화가 이미 같은
id와 모드의 보고서를 가지고 있으면 보고서 아래에 한 절을 추가하십시오 — 매트릭스 자체는
에이전트가 반환한 그대로 둡니다:

```markdown
### Since the last run

- Closed: BR-002, A1
- New: A3 — `PersonForm.java` changed since the last run
- Changed without a change: Step 4 Covered → Partial; neither the specification nor the files
  named in the row changed
- Still open after a fix aimed at it: Post-S-1
```

- 명세도 증거 파일도 변하지 않았는데 판정이 바뀌었다면 그것은 감사자의 판단이 흔들린 것이지
  새 작업이 아닙니다. 그렇게 말하고, 사용자에게 그것에 따라 행동할지 물으십시오; 그것을
  위한 명령을 제안하지 마십시오.
- 겨냥한 수정 후에도 여전히 열려 있는 간극: 같은 명령을 다시 제안하지 마십시오. 감사자가
  원하는 것과 코드가 하는 것을 진술하고 사용자가 정하게 하십시오 — 바뀌어야 하는 것이 명세일
  수 있으며, 그것은 간극이 아니라 결정입니다.
- 모든 단위가 `Covered` 또는 `n/a`이면 감사는 끝난 것입니다. 추가 실행을 제안하지 마십시오.

## 서브 에이전트가 없는 호스트

서브 에이전트는 Claude Code 전용이며 Agent Plugins 표준의 일부가 아닙니다. 호스트에 그것이
없으면 glob `**/agents/uc-coverage.md`로 `agents/uc-coverage.md`를 찾아 — 스킬을 한
폴더씩 설치하는 호스트는 플러그인 루트를 노출하지 않으므로 이 스킬 폴더 기준으로 경로를 절대
해석하지 마십시오 — 지시 문서로서 처음부터 끝까지 직접 따르십시오; 그 체크리스트는
Claude Code에 의존하지 않습니다. 그것이 정말로 없으면 기억에서 감사를 즉흥적으로 만들지 말고 그렇게
말하십시오. 체크리스트가 *곧* 스킬입니다.

인라인으로 실행하면 에이전트의 도구 제한과 깨끗한 컨텍스트를 잃으므로 두 규칙이 추가로
적용됩니다: 대화 앞부분에서 썼다고 기억하는 것에 의존하지 말고 디스크에서 명세와 코드를 다시
읽으십시오, 그리고 에이전트의 `## DO NOT`을 자신에게 구속력 있게 여기십시오 — 특히
"no `file:line`, no `Covered`".

## 훑기

id가 없을 때: 대화가 방금 특정 `UC-*`나 `TC-*`를 다루고 있었다면 그것을 제안하고
물으십시오. 그렇지 않으면 있는 것을 나열하십시오 — 두 명세 디렉터리에 대한 glob 더하기
`**Status:**` 줄에 대한 grep — 그리고 어느 것을 감사할지 물으십시오. 기본적으로 전부를
감사하지 마십시오.

사용자가 실제로 훑기를 요청하면("all", "every use case", "sweep") 그것은 **서른
개의 감사가 아니라 분류 패스**입니다:

1. **사전 패스, 서브 에이전트 전혀 없음.** 모든 명세에 대해 id, 제목, `**Status:**`를 수집하고,
   리터럴 id에 대한 트리 전역 grep 하나로 *어떤* 구현 마커와 *어떤* 테스트 마커가 존재하는지
   확인합니다. 프로젝트 전체에 도구 호출 두세 번.
2. **그 표를 먼저 공개하십시오.** 그것은 이미 흔한 질문 — 어떤 유스 케이스에 아무것도 없는가 —
   에 감사 비용 제로로 답합니다.
3. **그런 다음 순위를 매기고 상한을 두십시오.** 전체 감사는 의심스러운 행에만 갑니다: 상태가
   `Implemented`나 `Tested`라고 주장하는데 마커가 없거나, 마커는 있는데 상태가
   `Approved`인 경우(코드보다 뒤처진 상태). 기본 상한: **호출당 전체 감사 다섯 개**,
   한 번에 하나씩 실행.
4. **상한을 넘기 전에 물으십시오, 숫자를 명명하면서** — "유스 케이스 30개, 7개가
   의심스럽습니다. 지금 그 7개를 감사할까요, 원하는 것을 지정하시겠습니까?" 조용히 30개를
   실행하지 마십시오.
5. 산출물은 요약 표 더하기 실제로 감사한 것에 대한 전체 매트릭스, 그리고 건너뛴 id를
   명명하는 한 줄이라 아무도 분류 행을 감사로 착각하지 않게 합니다. 한 호출에서 같은 id를 두
   번 감사하지 마십시오.

## 금지 사항

- 코드, 테스트, 명세를 작성하거나 편집하지 마십시오 — `**Status:**` 줄 포함.
- 이 파일에서 에이전트의 감사 체크리스트를 다시 진술하거나 바꿔 말하지 마십시오;
  `agents/uc-coverage.md`가 그것을 소유합니다.
- 판정을 무르거나, 올리거나, 빼지 말고, 매트릭스 대신 요약을 제시하지 마십시오.
- 에이전트에게 무엇을 찾을 것으로 예상하는지 말하지 마십시오.
- 빌드나 테스트 스위트를 실행했다고 주장하지 마십시오.
- 요청 없이 모든 유스 케이스를 감사하지 말고, 확인 없이 훑기 상한을 넘지 마십시오.
