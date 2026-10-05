# 에이전트 데스크톱 아키텍처

> 휴먼 리뷰용 한글 번역입니다. 실행 원문: [원문](../../../../../../plugins/aiwf-electron-react/skills/implement/references/architecture.md). 번역과 자동 검사는 승인을 뜻하지 않으며, 검토 상태와 원문 SHA256은 [관리 목록](../../../../manifest.json)에서 확인합니다.

## 프로세스 구성

시작 구조로 사용하며 동등한 경계가 있는 기존 앱을 재구성하는 이유로 삼지 않습니다.

```text
src/
├─ main/       # windows, files, settings, browser hosts, agent adapters
├─ preload/    # restricted typed IPC facade
├─ renderer/   # React, UI sources, tokens, event-driven view state
└─ shared/     # serializable contracts and Zod schemas
```

Main은 창·권한 있는 리소스·에이전트 수명주기, preload는 작은 facade, renderer는 상태 표시, shared는 데이터 계약을 담당합니다. 각 프로세스가 shared를 참조하며 renderer가 권한 있는 main 코드를 참조하면 안 됩니다. 비용이 크거나 신뢰하지 않는 파싱은 renderer/main 이벤트 루프를 막는 대신 적합한 소유 worker/서비스에서 수행합니다.

## IPC와 리소스 권한

Context isolation·sandbox·Node integration 비활성화·제한적인 CSP를 사용합니다. `contextBridge`로 지원 작업별 메서드를 노출하며 원시 `ipcRenderer`·임의 채널명·Electron 이벤트 객체는 비공개로 유지합니다. Renderer callback을 호출하기 전에 이벤트 객체를 제거하고 구독 해제 함수를 반환합니다.

Main은 Zod 검증과 별도로 알려진 앱 webContents와 예상 frame/origin의 권한을 확인합니다. 없거나 예상하지 못한 발신 프레임·원격 페이지·권한 없는 subframe은 거부합니다. 임의 접두사나 모든 `file:` 페이지 대신 설정된 운영 앱 origin/resource와 정확한 개발 origin을 신뢰합니다. 선택한 workspace 루트·symlink 처리·파일 크기·URL/shell 정책은 main에서 해석하고 집행합니다. Renderer가 전달한 경로·세션 ID·모델 응답을 권한으로 바꾸지 않습니다.

## 브라우저 호스트

신뢰하지 않는 페이지는 앱의 권한 있는 preload 브리지 없이 격리된 `WebContentsView`에 표시합니다. 제품의 보존 정책에 필요한 별도 session partition을 사용합니다. 같은 partition 이름은 상태를 공유하고 `persist:`는 상태를 영구 저장합니다. Partition은 IPC 권한 검사가 아닙니다. 제품 정책에 맞춰 navigation·새 창·download·permission·외부 URL 열기를 제한합니다. 페이지 텍스트는 앱 에이전트에 대한 지시가 아니라 콘텐츠입니다.

View 소유와 정리를 명시적으로 추적합니다. `BaseWindow` 사용 시 더 이상 필요하지 않은 자식 webContents를 닫아야 합니다. Base window 닫힘만으로 자동 해제되지 않습니다. 원격 페이지 자격증명·다운로드 파일·에이전트 도구 출력이 무관한 세션으로 넘어가지 않게 합니다.

## 앱 소유 어댑터 예시

다음은 직렬화 가능한 UI 경계를 보여주는 예시입니다. Provider별 세부사항을 의도적으로 생략했으며 완전한 런타임 구현이 아닙니다. 기존 앱 계약을 교체하기보다 그 계약에 맞춥니다. 이벤트를 연결하기 전에 실제 런타임 타입/프로토콜을 조사하며 미지원 기능을 유지하고 main에서 소유 권한을 집행합니다.

```ts
// Application-owned example, not a Sally or PI protocol declaration.
type AgentEvent = {
  sessionId: string;
  runId: string;
  eventId: string;
  sequence: number;
} & (
  | { kind: 'text-delta'; text: string }
  | { kind: 'tool'; toolId: string; state: 'pending' | 'done' | 'failed' }
  | { kind: 'finished'; outcome: 'completed' | 'cancelled' | 'failed' }
);

type CapabilitySupport = 'unknown' | 'unsupported' | 'supported';

interface AgentCapabilities {
  resume: CapabilitySupport;
  cancel: CapabilitySupport;
  toolApproval: CapabilitySupport;
}

interface DesktopAgentApi {
  submit(input: { sessionId: string; text: string }): Promise<{ runId: string }>;
  cancel(input: { sessionId: string; runId: string }): Promise<{ accepted: boolean }>;
  subscribe(listener: (event: AgentEvent) => void): () => void;
}
```

기능은 확인 전까지 `unknown`으로 유지하고 `supported`인 작업만 활성화합니다. 데이터를 받기 전에 대응하는 런타임 스키마와 크기 제한을 구현합니다. Main은 실행 식별자를 승인된 세션·발신자에 할당/연결합니다. 구독이 다른 창·세션의 이벤트를 broadcast하면 안 됩니다. 이벤트 순서는 문서화된 실행 안에서 의미가 있으며 전역 counter가 아닙니다. 취소 요청 수락은 종료된 취소 이벤트가 아닙니다. 실제 결과를 재확인할 때까지 어댑터 상태를 유지합니다. 선택한 백엔드가 지원할 때만 승인/재개 작업을 추가하고 성공을 꾸미지 않습니다.

## UI와 렌더링

복사된 shadcn/ui·AI Elements 소스를 renderer에 유지하고 설치된 import를 조사합니다. 설치된 `UIMessage` part나 컴포넌트 props에 연결하기 전에 에이전트 출력을 정규화합니다. `ai` 타입 import는 AI SDK 모델 provider를 요구하지 않습니다. 실행 가능한 도구·토큰·모델 클라이언트는 renderer 밖에 둡니다.

스트리밍 Markdown/HTML·Mermaid·수식·코드 블록·첨부 미리보기는 신뢰하지 않습니다. 라이브러리 정제/보안 옵션·제한적인 CSP·명시적 URL/파일 열기 정책을 사용합니다. 메시지에 코드가 나타났다는 이유만으로 실행하지 않습니다. 페이로드 크기와 렌더링 작업량을 제한하고 스트리밍 중 접근성 label·focus를 유지합니다. Storybook은 합성 어댑터를 사용하며 컴포넌트 검토에 자격증명이나 실제 daemon이 필요하지 않습니다.

## 공식 참고

2026-10-05에 동작 설명을 확인했으며 소비 앱의 설치 버전을 기준으로 다시 확인합니다.

- [Electron 보안](https://www.electronjs.org/docs/latest/tutorial/security): 발신자 검증·sandbox·IPC·navigation.
- [WebPreferences](https://www.electronjs.org/docs/latest/api/structures/web-preferences): context isolation·preload·session partition.
- [BaseWindow 리소스 관리](https://www.electronjs.org/docs/latest/api/base-window#resource-management): 자식 webContents 수명주기.
- [Playwright Electron](https://playwright.dev/docs/api/class-electron): 실험적 자동화와 실행 한계.
- [electron-builder v26 macOS 서명](https://www.electron.build/v26/docs/features/code-signing/code-signing-mac/)과 [Windows 서명](https://www.electron.build/v26/docs/features/code-signing/code-signing-win/): 주 버전에 맞는 설정을 사용하고 실제 산출물을 검증합니다.
