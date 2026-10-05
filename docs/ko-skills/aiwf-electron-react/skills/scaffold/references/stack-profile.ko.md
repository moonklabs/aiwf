# 에이전트 데스크톱 스택 구성

> 휴먼 리뷰용 한글 번역입니다. 실행 원문: [원문](../../../../../../plugins/aiwf-electron-react/skills/scaffold/references/stack-profile.md). 번역과 자동 검사는 승인을 뜻하지 않으며, 검토 상태와 원문 SHA256은 [관리 목록](../../../../manifest.json)에서 확인합니다.

## 요청 기준과 근거

2026-10-05에 기록한 사용자 요청 기준이며 검증된 호환성 표가 아닙니다. 작성 환경에서는 제시된 참고 경로를 읽을 수 없었습니다. 소비 앱마다 정확한 버전을 선택하기 전에 패키지 선언·lockfile·실제 import를 조사합니다. 차이를 기록하고 지원되지 않는 peer/engine 조합을 해결하되 요청 버전을 알리지 않고 올리지 않습니다. Electron 내장 Node와 앱 빌드에 사용하는 Node에는 서로 다른 버전 제약이 적용됩니다. 이는 플러그인의 참고 구성이며 소비 프로젝트의 명시적 제약이 우선합니다.

| 영역 | 요청 기준 | 책임 |
| --- | --- | --- |
| 데스크톱 | Electron 43.3 | 창·브라우저 호스트·IPC·파일/OS 접근 |
| Renderer | React 19.3 + TypeScript | 컴포넌트와 타입 계약 |
| 빌드 | electron-vite 5 + Vite 7 | main/preload/renderer별 개발과 번들 |
| 배포 | electron-builder 26.15 | macOS·Windows 산출물 |
| 스타일 | Tailwind CSS 4.3 | CSS 변수·토큰·유틸리티 |
| 기본 UI | shadcn/ui + Radix UI 1.6 | 앱 소유 컴포넌트와 접근성 primitive |
| 채팅 UI | AI Elements 1.9 + `ai` 7.0 | 메시지·추론·도구 표시와 `UIMessage` 타입 |
| 에이전트 | Sally daemon/protocol, PI 또는 선택한 대안 | 모델 호출·도구/REPL·세션·이벤트 |
| 전송/스키마 | `ws` + Zod 4.6 | 선택한 WebSocket 전송과 런타임 검증 |
| 답변 표시 | Streamdown 2.6 + Shiki 3.23 | 스트리밍 Markdown과 코드 강조 |
| 다이어그램/수식 | Mermaid + KaTeX | 다이어그램과 수식 표시 |
| 스타일 도우미 | Lucide + CVA + clsx + tailwind-merge | 아이콘·variant·클래스 조합 |
| 디자인 협업 | Storybook 10.6 | 토큰·shell·컴포넌트 시나리오 |

표시 이름으로 정확한 npm 패키지를 추측하지 않습니다. Radix는 개별 또는 통합 패키지를 사용할 수 있으므로 생성된 import를 조사합니다. Sally/PI 이름은 아키텍처 선택지이며 설치 패키지명이 제공된 것이 아닙니다. 채팅 renderer는 `ai`에서 타입만 가져올 수 있고 `@ai-sdk/react`·`useChat`·provider를 가정하지 않습니다. 사용자가 다른 아키텍처를 명시적으로 선택하기 전까지 모델 실행은 선택한 에이전트 런타임에 둡니다.

## 의존성 배치와 소스

shadcn/ui·AI Elements 생성기를 유지하면 개발 도구로 둡니다. 생성된 컴포넌트 소스는 앱에 있습니다. React/Radix/Streamdown 등 import한 UI 의존성이 런타임 동작을 제공합니다. 패키지 추가·제거 전에 선택한 컴포넌트 파일과 전이 요구사항을 조사합니다. 타입 전용 import도 빌드에 타입이 필요하지만 모델 실행을 증명하지 않습니다.

Storybook은 합성 데이터로 개발 환경에서 사용합니다. Electron 빌드 도구와 TypeScript는 개발 의존성에 둡니다. Main/preload에서 externalize한 런타임 패키지는 배포 앱에서도 사용할 수 있어야 합니다. 패키지 이름만으로 의존성 위치를 정할 수 없습니다. Shared 스키마는 sandboxed preload에 번들링할 수 있게 유지하고 네이티브 코드는 main 또는 소유한 서비스 프로세스에 둡니다.

## 선택 기능

| 기능 | 후보 패키지 | 조건 |
| --- | --- | --- |
| 터미널 | `@xterm/xterm` + `@lydell/node-pty` | Renderer 표시·main 소유 PTY, 명령/cwd/환경 범위와 정리 |
| 파일 | `@pierre/trees` + `@parcel/watcher` + `@vscode/ripgrep` | 트리 표시·승인된 루트·감시/검색 취소·네이티브/sidecar 패키징 |
| 문서 | `pdfjs-dist` + `exceljs` + `@napi-rs/canvas` / `jimp` | 입력 크기/타입 제한·worker/resource 경로·선택한 main/renderer 처리 |
| 저장/관찰 | `electron-store` + `electron-log` + OpenTelemetry | 스키마/이전/보존·비밀 가리기·명시적 telemetry 목적지/동의 |
| 검증 | Node 테스트 러너 + `tsx` + `playwright-core` + `pixelmatch` | 순수 로직·실제 Electron·결정적 시각 검사를 구분 |

한꺼번에 설치하는 목록이 아니라 기능 선택지입니다. `electron-store`를 비밀 저장소로 취급하거나 telemetry를 암묵적으로 켜지 않습니다. 요청한 UC에 필요한 패키지만 선택하고 배포를 약속하기 전에 각 대상 OS/아키텍처의 네이티브/prebuilt 지원을 확인합니다.

## 공식 구현 참고

2026-10-05에 동작 설명을 확인한 자료이며 요청 버전 조합을 검증한 기록은 아닙니다.

- [electron-vite 운영 빌드](https://electron-vite.org/guide/build)와 [의존성 처리](https://electron-vite.org/guide/dependency-handling): 설치한 주 버전의 main/preload externalization과 운영 경로를 확인합니다.
- [AI Elements 사용법](https://elements.ai-sdk.dev/docs/usage): 컴포넌트는 프로젝트 소스이며 제시된 `useChat` 예제가 앱 런타임을 결정하지 않습니다.
- [electron-builder v26 다중 플랫폼 빌드](https://www.electron.build/v26/docs/features/multi-platform-build/): 대상별 네이티브 의존성과 서명 환경을 확인합니다.

실제 의존성 결정과 근거는 소비 앱의 기존 아키텍처 문서에 기록합니다. 근거 없이 요청 버전을 설치됨·호환됨·검증됨으로 표시하지 않습니다.
