# AIWF Electron/React

> 휴먼 리뷰용 한글 번역입니다. 실행 원문: [원문](../../../plugins/aiwf-electron-react/README.md). 번역과 자동 검사는 승인을 뜻하지 않으며, 검토 상태와 원문 SHA256은 [관리 목록](../manifest.json)에서 확인합니다.

`aiwf-core`의 요구사항, 엔티티 모델, 유스케이스와 테스트 정의로 Electron + React + TypeScript 에이전트 데스크톱 앱을 만듭니다. `aiwf-nestjs-nextjs`의 스택 플러그인 구성을 참고하되, 웹 API·데이터베이스 스택 대신 데스크톱 프로세스 경계와 에이전트 어댑터를 다룹니다.

## 아키텍처와 실행 환경

`src/main/`은 창·파일·설정·브라우저 호스트·에이전트 연결, `src/preload/`는 제한된 typed IPC 브리지, `src/renderer/`는 React·shadcn/ui·AI Elements·디자인 토큰, `src/shared/`는 직렬화 가능한 계약과 Zod 스키마를 담당합니다.

Sally daemon/protocol, PI 또는 명시적으로 선택한 다른 코딩 에이전트 라이브러리가 모델 호출·도구·세션·이벤트를 담당합니다. Renderer는 정규화한 이벤트를 표시합니다. `ai` 의존성이나 `UIMessage` 타입만으로 AI SDK가 모델을 실행한다고 판단하지 않습니다. 채팅을 표시할 목적으로만 `@ai-sdk/react`, `useChat` 또는 provider 패키지를 추가하지 않습니다. shadcn/ui와 AI Elements는 앱에 컴포넌트 소스를 제공하며 해당 CLI는 개발 도구입니다.

## 스킬

| 스킬 | 결과 |
| --- | --- |
| `scaffold` | 기존 앱을 조사하거나 검증한 의존성 계획으로 네 디렉터리 구조의 기반 생성 |
| `implement` | 범위가 정해진 UC/BR을 계약·main·preload·renderer에 걸쳐 구현 |
| `agent-runtime` | 기능 지원 여부를 확인한 어댑터로 선택한 에이전트의 스트리밍·수명주기 통합 |
| `renderer-test` | 결정적인 이벤트로 React·채팅 상태·접근성·Storybook 시나리오 검증 |
| `electron-test` | IPC·프로세스 수명주기·파일시스템 경계·Electron 종단간 동작 검증 |
| `package` | 선택적 네이티브 모듈과 서명 요건을 포함한 macOS·Windows 산출물 빌드·검사 |

비전·요구사항·용어집·엔티티 모델·유스케이스·테스트 정의는 `aiwf-core`에서 시작합니다. 기존 앱은 `reverse-engineer`로 관찰된 동작을 파악한 뒤 변경을 계획합니다. `spec-review`로 문서 정합성을 검토합니다. 구현 후에는 함께 쓰는 `aiwf-spec`의 `workflow`와 `sync-docs`로 영향받는 문서와 근거를 관리합니다. 스킬 설치 자체가 앱을 초기화하거나 에이전트 daemon을 시작하지는 않습니다.

## 스택 구성

[스택 구성](skills/scaffold/references/stack-profile.ko.md)은 사용자가 요청한 버전 기준과 선택 기능을 기록합니다. 설치 전에 소비 저장소의 정확한 의존성 버전·peer 요건·실제 import를 확인해야 합니다. 작성 환경에서 제시된 참고 checkout에 접근할 수 없었으므로, 이 플러그인이 그 앱을 조사하거나 전체 의존성 조합을 검증했다고 주장하지 않습니다.

[아키텍처 안내](skills/implement/references/architecture.ko.md)는 typed IPC, 원격 브라우저 격리와 예제 어댑터 계약을 정의합니다. 타입은 앱이 소유하는 설계 예시이며 Sally·PI API를 나타내는 것이 아닙니다. 기존 프로젝트에 동등한 경계가 있으면 실제 프로토콜과 구조를 유지합니다.

## 설치와 호출

Claude Code:

```text
/plugin marketplace add moonklabs/aiwf
/plugin install aiwf-core@aiwf-plugins
/plugin install aiwf-spec@aiwf-plugins
/plugin install aiwf-electron-react@aiwf-plugins
/aiwf-electron-react:scaffold
/aiwf-electron-react:implement UC-001
```

현재 checkout에서 Codex 프로젝트에 설치합니다. 미리보기와 실제 설치 중 선택합니다.

```bash
node scripts/install-spec-skills.mjs --project /path/to/project --stack electron-react --dry-run
node scripts/install-spec-skills.mjs --project /path/to/project --stack electron-react
```

core/workflow 스킬 9개와 데스크톱 스킬 6개를 설치합니다. 데스크톱 이름은 `aiwf-electron-react-scaffold`, `aiwf-electron-react-implement`, `aiwf-electron-react-agent-runtime`, `aiwf-electron-react-renderer-test`, `aiwf-electron-react-electron-test`, `aiwf-electron-react-package`가 됩니다. 기존 대상이 있으면 복사를 시작하기 전에 거부하며, 이미 설치된 환경의 이전은 별도 범위를 정해야 합니다.

로컬 checkout에서 skills CLI로 단독 설치하려면 스킬과 호스트를 명시합니다.

```bash
npx skills add /path/to/aiwf/plugins/aiwf-electron-react --skill implement --agent codex
npx skills add /path/to/aiwf/plugins/aiwf-electron-react --skill implement --agent claude-code
```

대안 관계의 명령이며 단독 설치는 `implement` 이름을 유지하고 companion core를 설치하지 않습니다. 각 스킬은 단독 복사에도 MIT 라이선스 전문을 포함합니다. 원격 marketplace·skills 설치는 파일이 저장소 기본 브랜치에 반영된 뒤 사용할 수 있습니다. MCP 서버·모델 런타임·provider 계정·선택적 네이티브 의존성은 자동 설치하지 않습니다.

## 검증과 검토

저장소 테스트는 패키징 메타데이터, 완전한 스킬 설치, 이름 변환과 기존 파일 보존을 확인합니다. 소비 Electron 앱·Sally/PI 통합·네이티브 모듈·서명 배포판의 동작을 증명하지는 않습니다. 실제 앱과 선택한 런타임, 대상 OS에서 별도 검증해야 합니다. 실행한 검사와 미검증 사례를 기록하며 변경 시 [한글 검토본](README.ko.md)을 함께 관리합니다.

## 라이선스

MIT. [LICENSE](../../../plugins/aiwf-electron-react/LICENSE)와 [NOTICE](../../../plugins/aiwf-electron-react/NOTICE)를 확인합니다.
