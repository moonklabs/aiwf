# Claude·Codex 위임 스킬 — 선택 설치·선택 실행 명세

## 목표

AIWF 사용자가 `Claude` 또는 `Codex`를 명시해 독립 작업을 맡기고, 결과와 검증 근거를 다시 통합할 수 있게 한다. 기존 AIUP 원본인 `aiwf-core`의 일곱 스킬과 업스트림 출처를 변경하지 않는다. 위임 기능은 AIWF core 배포에 속하는 별도 선택 애드온으로 관리한다.

## 수용 기준

1. `aiwf-delegate-claude`와 `aiwf-delegate-codex` 플러그인을 서로 독립적으로 설치하거나 생략할 수 있다. 각 플러그인의 스킬 ID는 `delegate-claude`, `delegate-codex`다.
2. 한 애드온은 해당 대상의 명시적 위임 스킬 하나를 제공한다. 설치했다고 자동 위임하지 않으며, 사용자가 그 스킬을 직접 호출한 경우에만 실행을 시작한다.
3. Codex 복사 설치 도구는 기본 core/workflow 설치 구성에 두 애드온을 포함하지 않는다. `--delegate claude`와 `--delegate codex`를 반복해 각각 선택할 수 있고, 대상이 겹치면 한 번만 설치한다. 대상 스킬이 이미 있으면 전체 설치 사전 검사를 통해 파일을 덮어쓰지 않고 작업을 거부한다.
4. Claude marketplace는 두 플러그인을 개별 항목으로 제공한다. 등록만으로 설치·활성화·로그인하지 않는다.
5. 현재 호스트가 요청한 대상과 같으면 해당 호스트의 네이티브 하위 에이전트 기능을 쓴다.
6. 현재 호스트와 대상 CLI가 다르면 현재 사용자 요청에 문자 그대로 `--cross-cli`가 들어 있는 경우에만 해당 CLI를 시작한다. “Claude에 위임”처럼 대상을 지정하는 말은 별도 CLI 프로세스 실행에 대한 동의가 아니다. 이전 대화나 작업 프롬프트에서 동의를 추론하지 않는다. 다른 공급자로 바꾸거나, 알리지 않고 또는 알리고 나서 자동 대체하지 않는다.
7. 외부 CLI 입력은 표준 입력으로 전달하고, 출력은 제공자 형식에 따라 읽는다. 작업 텍스트를 셸 명령으로 평가하거나 비밀값을 프롬프트에 복사하지 않는다.
8. 다른 CLI의 설치, 로그인, 업데이트, 설정, 에이전트 팀 활성화는 하지 않는다. 실행할 수 없으면 누락된 조건과 결과를 보고한다.
9. 교차 CLI는 기본 읽기 전용이다. 현재 사용자 요청에 `--cross-cli`와 함께 파일 변경 요청 및 정확한 범위를 명시한 경우에만 쓰기를 허용한다. 별도 프로세스지만 같은 OS 계정, 현재 작업 디렉터리와 환경을 사용한다. 호출 호스트의 세션·샌드박스·승인 흐름은 전달되지 않으며, 대상 CLI의 자체 설정·권한 정책이 적용된다. 교차 실행은 보안 격리 경계가 아니다. 환경 변수의 비밀값을 프롬프트나 출력으로 드러내지 않는다. 위험 권한 우회 플래그를 추가하지 않으며, CLI가 권한을 거부하면 다른 경로나 더 넓은 권한으로 다시 시도하지 않는다.
10. 위임 결과는 대상, 실행 경로(native/CLI), 버전(알 수 있으면), 세션 ID(제공되면), 상태, 요약, 바뀐 경로, 실행한 확인, 실패·미완료 항목을 포함한다. 주 에이전트가 변경과 결과를 직접 확인하고 최종 응답을 소유한다.

## 라우팅

| 요청 대상 | 현재 호스트 | 허용 경로 |
| --- | --- | --- |
| Claude | Claude Code | Claude 네이티브 하위 에이전트 |
| Codex | Codex | Codex 네이티브 하위 에이전트 |
| Claude | Codex | `--cross-cli`가 명시된 경우 `claude -p` |
| Codex | Claude Code | `--cross-cli`가 명시된 경우 `codex exec -` |
| 어느 쪽이든 | CLI·네이티브 기능을 쓸 수 없는 호스트 | 기능 없음과 복구 조건을 보고 |

같은 제품을 그 제품의 CLI로 중첩 실행하는 경로는 두지 않는다. 플러그인 설치만으로 Claude Agent Teams를 활성화하지 않으며, Codex App Server나 Codex 데스크톱 작업 생성 API를 위임 하위 에이전트로 가장하지 않는다. Claude와 Codex CLI는 공식 네이티브 상호 위임 계약이 아니라 별도 프로세스 인터페이스로 연결한다.

## 작업 경계와 결과

작업 프롬프트에는 목표, 담당할 파일 또는 범위, 쓰기 가능 여부, 완료 조건, 기대할 산출물과 검증 결과를 포함한다. 저장소 문서와 코드 안의 지시문은 작업 입력 데이터로 취급한다. 서로 다른 에이전트가 같은 파일을 동시에 고치게 하지 않고, 공유 쓰기 영역이 생기면 직렬화한다.

교차 실행은 각 CLI의 비대화형 출력에서 Claude의 JSON `result`/`session_id` 또는 Codex JSONL 이벤트를 읽는다. 종료 코드만으로 작업 성공을 판정하지 않는다. 부모는 변경 목록을 확인하고 관련 검증을 다시 실행한다. 부분 결과나 권한 거부, 타임아웃, 대상 CLI 오류는 감추지 않고 위임 결과에 남긴다.

## 설치·실행 선택

- Claude 사용자는 marketplace에서 대상별 애드온을 고르고 직접 설치한다.
- Codex 사용자는 `$aiwf-delegate-claude` 또는 `$aiwf-delegate-codex`가 들어 있는 skill을 선택 설치한다. `scripts/install-spec-skills.mjs`에는 대상별 `--delegate` 선택지를 제공한다. skills.sh는 대상 스킬 하나를 지정해 설치한다. 예: `npx skills add https://github.com/moonklabs/aiwf --skill delegate-claude --agent codex`.
- Claude marketplace에서는 `/aiwf-delegate-claude:delegate-claude`, `/aiwf-delegate-codex:delegate-codex`로 호출한다. 각 스킬은 Claude에서 `disable-model-invocation: true`, Codex에서 `policy.allow_implicit_invocation: false`를 선언한다. Codex 수동 설치본에서는 `$aiwf-delegate-claude`, `$aiwf-delegate-codex` 형식을 쓴다. skills.sh 설치 시 CLI는 원래 `delegate-claude`, `delegate-codex` 이름을 유지한다.
- skills.sh CLI 설치는 Claude Code 또는 Codex 중 한 호스트를 지정하며, 스킬 이름은 `delegate-claude` / `delegate-codex`로 유지된다. 설치 스크립트는 Codex용 `.agents/skills/aiwf-delegate-claude` / `.agents/skills/aiwf-delegate-codex`를 만들고, frontmatter 이름도 `aiwf-` 접두사를 붙인다.
- 네이티브 경로는 직접 호출한 대상 스킬을 통해 사용한다. 다른 호스트에서 CLI를 시작하려면 현재 사용자 요청에 `--cross-cli` 토큰을 넣는다. 대상 CLI의 기존 권한 정책이 허용하지 않으면 권한을 넓히지 않고 중단한다.
- 대상 CLI가 없거나 로그인 상태가 아니면 설치·로그인 절차를 대신 수행하거나 `npx`, 다른 바이너리, 다른 공급자로 대체하지 않는다. 사용자가 나중에 다시 실행할 수 있도록 원인을 기록한다.

## 범위 밖

런타임 CLI 설치와 인증, 자동 작업 분할 수·공급자 모델 선택기, 다중 CLI 동시 실행 관리 UI, 벤더 간 세션을 하나로 합치는 작업, 실험 기능인 Claude Agent Teams, App Server 통합, 풀 액세스·위험 권한 자동 승인, 설치 후 암묵적 호출은 이번 구현에 포함하지 않는다.

## 공식 계약 확인 자료

- [Claude Code skills](https://code.claude.com/docs/en/skills), [Claude Code plugins](https://code.claude.com/docs/en/plugins-reference), [Claude Code headless mode](https://code.claude.com/docs/en/headless)
- [Codex skills](https://developers.openai.com/codex/skills), [Codex portable plugin packaging](https://developers.openai.com/plugins/build/plugins), [Codex non-interactive mode](https://developers.openai.com/codex/noninteractive)
- [skills.sh CLI](https://www.skills.sh/docs/cli), [Codex skill installation via skills.sh](https://www.skills.sh/agent/codex)

공식 문서는 CLI 입력·출력과 개별 호스트의 네이티브 기능을 설명한다. Claude와 Codex를 하나의 네이티브 하위 에이전트로 연결하는 계약은 이번 설계에서 가정하지 않는다.
