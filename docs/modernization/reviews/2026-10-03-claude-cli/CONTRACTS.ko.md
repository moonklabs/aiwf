# Claude 계획 리뷰 — 검증·실행 기록 계약

작성: 2026-10-03. 상태: **AI 리뷰 완료, 휴먼 리뷰 대기**.

[검토 대상 계획](../../CLI-PRODUCTIVITY.ko.md), [통합 판단](../../CLAUDE-PLAN-REVIEW-2026-10-03.ko.md).

- 실제 CLI: Claude Code `2.1.288`.
- 세션 ID: `cab3cadc-37d4-4ebb-a699-0d122c4c3baa`.
- 요청·관측 모델: `claude-sonnet-5-5` (`modelUsage` 확인).
- 요청 effort: `high`. 결과 JSON에 실제 적용 effort가 없어 관측 effort는 미확인.
- 검토 당시 계획 SHA256: `426d38f8d52001678083979ca7418c64c6d0b780fa8ef504aec1d6aa5c6b7ab8`.
- 실행 결과: exit 0, `subtype: success`, `is_error: false`, 권한 거부 0, stderr 0 bytes.
- 도구: `Glob, Grep, Read`. 원문 결과를 별도 수정 없이 아래에 옮겼다. 행 번호는 위 hash의 계획을 기준으로 한다.
- 셸·테스트 실행 및 파일 편집은 리뷰 세션에 제공하지 않았다. 모델 리뷰는 자동 테스트 통과나 휴먼 승인이 아니다.

아래는 최종 리뷰 답변이며, 프롬프트·전체 세션 JSON·실행 로그는 저장소 밖의 비공개 임시 경로에 유지한다.

---

# review-2 결과: 검증/실행 기록 계약 · 기존 코드 정합성 · 최소 구현 복잡성

## 결론: 조건부 적합

계획의 현황 진술은 코드와 맞습니다. 위험을 줄이는 방향도 타당합니다. 다만 "UC/BR/TC→check 매핑과 검사 정의의 위치·신뢰 경계"가 정해져 있지 않습니다. 이 항목은 `fresh` 판정과 opt-in runner 경계의 전제입니다. 또 두 번째 단계를 "하나의 기능 단위"로 묶은 범위(15, 93행)가 첫 구현으로는 큽니다. 아래 P1을 정하고 P2의 범위 축소를 반영하면 구현 착수에 적합합니다.

## 코드와 대조해 맞는 진술 (사실)

- 현재 명령은 `init/pin/check/packet` 4개입니다 (`src/cli/spec-cli.js:33-58`).
- evidence 입력은 top-level `checks/unverified`만, 검사별로는 `name/command/status/log`만 허용합니다. 그 외 필드는 `evidence_unknown_field`로 거부합니다 (`src/lib/spec-workflow.js:630-661`). 계획의 28행과 121행은 맞습니다.
- packet은 생성 시점에 `checkSpec`을 호출하고 로그를 읽습니다. `trust: 'reported_untrusted'`와 `acceptance: 'not_recorded'`를 기록합니다 (`spec-workflow.js:755-808`).
- 로그는 1 MiB 이하의 정확한 UTF-8만 허용합니다 (`spec-workflow.js:734-742`).
- 모든 구조 검사는 lint가 통합 실행합니다. 누락된 validator와 BPMN parser는 INFO로만 남습니다 (`spec_lint.py:358-364`, `538-544`). lint는 INFO만 있으면 exit 0을 반환합니다 (`spec_lint.py:1210-1212`).
- `--trace`는 항상 exit 0을 반환하고 lint를 실행하지 않습니다 (`spec_lint.py:1160-1168`).
- workflow가 이미 `spec_lint.py --strict --no-baseline`을 지시하므로 verify 설계와 일치합니다 (`plugins/aiwf-spec/skills/workflow/SKILL.md:28`).

## 지적

### P1. 검사 정의·매핑의 저장 위치와 신뢰 경계가 미정이다 (`CLI-PRODUCTIVITY.ko.md:97, 102, 111, 113`)

- **근거(사실):**
  - pin은 `SPEC_DIRS`와 lint baseline만 추적합니다. 매핑이나 검사 정의 파일을 `docs/` 밖에 두면 바뀌어도 drift로 잡히지 않습니다 (`spec-workflow.js:27-39`).
  - 계획은 "프로젝트가 명시적으로 정의한 검사 ID"를 실행한다고 쓰지만, 정의 파일의 위치·schema는 정하지 않았습니다.
  - config hash는 receipt 기록 항목(102행)일 뿐, 실행 전 신뢰 확인에 쓰이지 않습니다.
- **영향(추론):** 저장소에 들어온 정의가 argv를 그대로 실행하게 됩니다. 정의가 바뀌어도 pin이 반응하지 않으면 UC/BR/TC→check 연결의 최신성(`fresh`)을 보장할 수 없습니다. dry-run만으로는 "누가 이 명령을 실행해도 된다고 승인했는가"가 남습니다.
- **최소 수정안:**
  1. 정의 파일의 위치와 pin 포함 여부를 계획에서 결정합니다.
  2. 정의 hash를 receipt에 기록하는 것과 별개로, runner는 실행 시점의 정의 hash를 사용자가 지정한 값과 대조하거나 `--yes` 같은 명시적 호출 입력을 요구합니다. 이 동작 자체가 "묵시 승인 금지" 경계가 됩니다.
  3. UC/BR/TC ID 존재 검사는 새 파서를 만들지 않고 `spec_lint.py --trace --format json` 출력을 재사용합니다. 이 재사용이 가능한지는 trace JSON 스키마를 읽어 확인하지 못했습니다.

### P2. verify의 "전체 통과" 판정이 lint 출력 해석에 의존하는데 오류 분기가 빠졌다 (`:83-87`, `:134`)

- **근거(사실):**
  - `load_sibling`은 모든 예외를 삼키고 `None`을 반환합니다 (`spec_lint.py:177-179`).
  - INFO는 UC 파일이 있을 때(`check_structure`의 `if not specs: return`), 또는 BPMN 파일이 있을 때만 나옵니다. "로드 성공"의 신호는 INFO가 없다는 사실뿐입니다.
  - Python 미설치나 `spawn ENOENT`, 버전 불일치, 미처리 예외는 계획에 분류가 없습니다. 미처리 예외도 exit 1이라 lint 오류 exit 1과 구분되지 않습니다.
  - lint의 `--docs` 오류는 exit 2입니다 (`spec_lint.py:1155-1158`). CLI의 exit 2는 사용법 오류입니다 (`spec-cli.js:23`).
- **영향:** stdout JSON 파싱 성공 여부를 검증하지 않으면 실행 오류가 `lint failed`로, 최악에는 조용한 incomplete 누락으로 이어집니다.
- **최소 수정안:**
  1. verify 결과 상태를 `lint_failed`, `tool_error`, `incomplete`, `drift`로 분리합니다. 이때 JSON의 summary 필드가 존재하는지로 판정합니다.
  2. Python 자식 프로세스에 `-B`를 붙이고, lint 실행 전후 `computePinDigest`를 재계산해 읽기 중 변경도 알립니다. 현재 `load_sibling`은 이미 bytecode 쓰기를 막고 있어(`:171`) readonly 경계 자체는 구현 가능합니다. 다만 CLI 쪽에서도 강제하는 편이 안전합니다.
  3. verify의 exit code 체계(0/1/2와 incomplete 처리)를 `--help`와 문서에 명시합니다 (`spec-cli.js:148`).

### P2. 첫 runner 범위가 과하다 (`:15, 93-109`)

- **근거(사실):**
  - 한 단위에 포함된 항목은 다음과 같습니다. 선언 범위의 새 파일을 포함하는 입력 manifest, 제외 정책, 환경 allowlist, 3상태 `fresh/stale/unknown`, 중단 receipt, packet v2입니다.
  - 현재 코드에는 glob 기능이 없고 spec 디렉터리를 수작업으로 순회합니다 (`spec-workflow.js:142-174`). `package.json`은 Node 20+를 선언하며 의존성이 없습니다 (`package.json:43-45`).
- **추론:** Node 20 내장 API로 선언 입력의 glob을 만드는 비용이 불확실합니다. 이 점은 확인하지 못했습니다.
- **최소 수정안(첫 구현):**
  - 입력은 **명시적 파일 경로 목록의 sha256**으로 시작합니다. glob, 신규 파일 탐지, 환경 allowlist는 파일럿 후로 미룹니다. 환경 allowlist는 비밀값 위험과 비교 대상 정의가 모두 필요합니다.
  - 상태는 receipt에 `outcome`(passed/failed/start_error/timeout/aborted/not_run), 비교 시 `fresh/stale`로 줄입니다. 선언 입력 hash를 읽지 못한 경우는 `stale`이 아니라 `unknown` 하나로만 둡니다.
  - 지금 계획의 방향(범위 밖 의존성을 제외 목록으로 명시)은 유지하되, 선언은 사용자가 쓴 경로 목록으로 한정합니다.

### P2. 1 MiB 로그 정책이 runner의 완료 조건과 충돌할 수 있다 (`:117`)

- **근거(사실):** 계획은 "이 제한 안에서 완전한 로그를 수집"하라고 하고, 초과를 성공으로 남기지 않는다고 합니다. 이 제한은 packet이 로그 본문을 packet에 포함하기 때문입니다 (`spec-workflow.js:734, 743-748`).
- **영향(추론):** Gradle, Maven, Playwright 같은 검사는 1 MiB를 넘기기 쉽습니다. 그러면 정상 통과한 검사가 `incomplete`로 처리되어 runner가 쓸모없어질 수 있습니다. 계획은 이때의 동작을 정하지 않았습니다.
- **최소 수정안:** receipt의 로그 파일(전체, hash·bytes)과 packet에 포함되는 발췌를 분리합니다. 초과분은 truncated 표시로 자르거나, 초과 시 packet 생성은 거부하되 receipt에는 전체를 보존합니다. 어느 쪽이든 계획에서 하나를 정해야 합니다.

### P3. packet 버전 용어 불일치와 baseline 동작 미기재

- **근거(사실):** 실제 packet은 숫자 `schema_version: 1`이고 `schema` 문자열 필드는 없습니다 (`spec-workflow.js:785`). 반면 Sprintable 설계안은 `"schema": "aiwf.review_packet.v1"`을 씁니다 (`SPRINTABLE.ko.md:33`). 이 불일치는 packet v2를 정의할 때 소비자 호환 계약의 혼선이 됩니다.
- **근거(사실):** verify는 `--no-baseline`을 강제합니다. 이미 수용된 baseline이 있는 프로젝트는 영원히 exit 0이 안 될 수 있습니다. 계획에 이 동작의 명시가 없습니다.
- **최소 수정안:** packet v2 착수 시 식별자 방식을 하나로 정합니다. verify 문서에 "baseline 무시, 수용 항목은 findings로 계속 보고"를 한 줄 추가합니다.

## 유지할 강점

- `reported_untrusted`, `acceptance: not_recorded`, awaiting_review를 유지하고 packet exit 0과 runner exit 0의 의미를 분리했습니다 (127행).
- 파일럿 선행, 병렬·Sprintable·자동 선택을 미루는 우선순위와 측정 지표(수작업 시간, 누락·오래된 로그 재사용 건수)가 적절합니다.
- "sidecar 파일만으로 packet이 출처를 검증하지 않는다", "receipt는 변조 불가 자료가 아니다"라는 보장 한계를 이미 명시했습니다 (125행). 이 부분은 과장이 아닙니다.
- verify와 runner의 readonly/opt-in 분리는 구현 가능합니다. 현행 `checkSpec`은 읽기 전용이고, lint는 `--update-baseline` 없이는 쓰지 않습니다 (`spec_lint.py:1176-1180`).

## 이견 없음

- 계획의 "현재 CLI는 lint를 실행하지 않는다"와 "INFO만이면 exit 0"이라는 진술은 코드와 일치합니다.
- 문서 우선 원칙(원문·한글본·hash 동시 갱신, awaiting_review 유지)은 이 계획과 충돌하지 않습니다.

## 미확인·휴먼 결정

- **미확인:**
  - Windows `.cmd` 실행과 프로세스 트리 종료, Node 20에서의 glob 대체 비용.
  - `--trace --format json`이 UC/BR/TC 전체 연결을 담는지 (스키마 미확인).
  - 계획의 수치(문서 70개, 검토 0개)와 문서 변경 후 hash·README·catalog 일관성은 이 세션 담당 밖이라 확인하지 않았습니다.
  - 계획 13행의 선행 파일럿 필요성은 다른 세션의 평가 범위입니다.
- **휴먼 결정:**
  1. 검사 정의 파일의 위치와 pin 포함 여부, 실행 전 신뢰 확인 방식 (P1).
  2. 로그 1 MiB 초과 시 정책 (P2).
  3. 첫 runner의 입력 선언 방식(명시 경로 목록)과 Node 20 하한 (140행의 별도 결정과 연결).
  4. packet v2의 식별자 방식(P3).

## 수행 기록

- **파일 변경 없음.**
- **셸·테스트·검사 실행 없음.** `npm test`나 `docs:check`는 실행하지 않았고, 계획 170-175행의 통과 기록을 재현하지 않았습니다.
- 다른 세션 결과는 보지 않았습니다.
- **권한 거부 없음.**
- 읽은 파일:
  - `AGENTS.md`, `docs/ko-skills/README.md`, `docs/modernization/CLI-PRODUCTIVITY.ko.md`, `docs/modernization/DIRECTION.ko.md`
  - `src/lib/spec-workflow.js`, `src/cli/spec-cli.js`, `package.json`
  - `spec_lint.py`(일부), workflow `SKILL.md`(일부), `SPRINTABLE.ko.md`(일부)
- `tests/spec-workflow/*.test.mjs`는 매칭 횟수만 확인했습니다. 본문은 읽지 않았습니다.
- 시스템 컨텍스트에 있던 `CLAUDE.md`의 내용은 따랐습니다.
