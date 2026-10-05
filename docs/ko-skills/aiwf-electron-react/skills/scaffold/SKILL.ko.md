# 에이전트 데스크톱 기반 구성

> 휴먼 리뷰용 한글 번역입니다. 실행 원문: [원문](../../../../../plugins/aiwf-electron-react/skills/scaffold/SKILL.md). 번역과 자동 검사는 승인을 뜻하지 않으며, 검토 상태와 원문 SHA256은 [관리 목록](../../../manifest.json)에서 확인합니다.

- 식별자: `scaffold`
- 설명: aiwf-core 명세로 Electron·React·TypeScript 에이전트 데스크톱 기반을 생성하거나 조정합니다. 생성 전에 의존성과 프로세스 경계를 조사합니다.


$ARGUMENTS에 설명된 앱을 생성하거나 조정합니다. 함께 쓰는 `requirements`, `entity-model`, `use-case-spec`, `test-case` 문서에서 시작합니다. 브라운필드는 실제 구현을 조사하고 동작 문서가 없으면 `reverse-engineer`를 사용합니다. 안정적인 UC/BR/TC ID와 기존 앱 파일을 보존합니다. 분석 또는 계획만 요청한 경우 의존성·경계 계획을 작성하고 코드 생성이나 의존성 설치 전에 마칩니다.

## 작성 전 조사

[스택 구성](references/stack-profile.ko.md)을 읽습니다. 패키지 선언·lockfile·Electron/vite/builder 설정·TypeScript 프로젝트·컴포넌트 registry 설정·기존 IPC와 에이전트 import를 조사합니다. 설치된 CLI 생성기와 복사된 런타임 컴포넌트, `ai`의 타입 전용 import와 실제 모델 실행을 구분합니다. 관찰한 버전·근거 경로·미해결 호환성을 기존 `docs/architecture/` 아키텍처 문서에 기록합니다.

새 앱은 Electron·React·TypeScript·electron-vite/Vite·electron-builder·Tailwind·shadcn/Radix·AI Elements·Streamdown/Shiki·Mermaid/KaTeX·Lucide/CVA/clsx/tailwind-merge·Zod를 요청 기준으로 사용합니다. 선택한 런타임이 WebSocket 전송을 쓰면 `ws`를 사용합니다. 의존성을 수정하기 전에 정확한 패키지 이름·배포 버전·peer 요건을 선택하고 확인합니다. 이 구성표는 검증된 lockfile이 아닙니다. 호환되지 않는 버전을 알리지 않고 대체하지 않습니다. 선택 기능은 요청한 유스케이스에 따라 포함합니다.

## 기반 구현

1. 비전·필요한 UC/BR 동작·테스트 정의·선택한 에이전트 런타임을 정리합니다. 확인된 사실을 채우고 권한·보존 기간·과금 정책을 추측하지 않으며 빠진 제품 결정을 드러냅니다.
2. `src/main/`, `src/preload/`, `src/renderer/`, `src/shared/`를 만들거나 기존 구조에 맞춥니다. 동등한 기존 구조를 전면 이동할 필요는 없습니다. 권한이 있는 프로세스·브리지·renderer의 빌드와 타입을 분리합니다. Renderer에서 Node·Electron·런타임 자격증명을 import하지 않습니다.
3. 디자인 토큰과 대표 채팅 상태가 있는 작은 shell을 만듭니다. 이미 생성된 컴포넌트 소스를 먼저 사용하고 CLI가 생성한 변경은 검토 후 반영합니다. Storybook은 실제 daemon 없이 합성 이벤트로 shell·컴포넌트를 문서화합니다.
4. main에서 Zod로 검증하는 작업별 typed IPC 계약을 추가합니다. Preload에는 UC에 필요한 작업만 노출합니다. 페이로드 검증과 별도로 발신자·프레임을 인증합니다. Context isolation·sandbox를 사용하고 renderer의 Node integration은 끕니다.
5. 선택한 런타임의 패키지/CLI·프로토콜 버전·지원 기능을 기록합니다. 사용할 수 없으면 연결 끊김/mock 표시가 명확한 UI를 제공하고 통합 누락을 보고합니다. Sally·PI API를 만들거나 에이전트가 작동한다고 주장하지 않습니다. 실제 연결에는 `agent-runtime`을 사용합니다.
6. 확인한 도구 버전에 맞춰 개발·타입 검사·빌드·테스트·로컬 패키징 스크립트를 구성합니다. 로컬 패키징에 원격 게시를 섞지 않습니다. Main/preload 런타임 의존성과 선택한 네이티브 바이너리가 패키지 결과에 올바르게 포함되어야 합니다.

## 검증과 인계

환경이 Electron을 지원하면 해당 타입 검사·빌드·smoke 실행을 수행합니다. Vite 브라우저뿐 아니라 실제 Electron 창에서 preload 브리지를 확인합니다. 영향받는 UC/TC를 계획한 `renderer-test`·`electron-test` 검사에 연결합니다. `sync-docs`가 있으면 문서를 마무리하고, 없으면 직접 갱신합니다. 생성·조정한 파일, 실제 명령과 결과, 의존성 결정, 선택 기능, 남은 런타임·OS 검증 누락을 보고합니다. 기반 생성 성공은 모델 실행이나 서명 배포판 검증을 뜻하지 않습니다.


라이선스: MIT. Copyright 2026 moonklabs.
