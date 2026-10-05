# 데스크톱 Renderer 테스트

> 휴먼 리뷰용 한글 번역입니다. 실행 원문: [원문](../../../../../plugins/aiwf-electron-react/skills/renderer-test/SKILL.md). 번역과 자동 검사는 승인을 뜻하지 않으며, 검토 상태와 원문 SHA256은 [관리 목록](../../../manifest.json)에서 확인합니다.

- 식별자: `renderer-test`
- 설명: 결정적인 런타임 이벤트·접근성 검사·Storybook story·선택적 시각 비교로 Electron React UI와 AI Elements 채팅 상태를 테스트합니다.


$ARGUMENTS의 UI 범위를 core의 TC/UC/BR 정의에 맞춰 테스트합니다. 기존 테스트 스크립트·복사된 shadcn/ui와 AI Elements 컴포넌트·Storybook 설정·브리지 타입·이벤트 reducer를 조사합니다. 컴포넌트 구현 세부사항보다 사용자가 관찰하는 동작과 계약 불변식을 테스트합니다.

## 검사 환경 선택

프로젝트의 기존 컴포넌트 검사 환경을 사용합니다. 요청한 Node 테스트 러너와 `tsx`로 순수 이벤트 정규화/reducer를 별도 검사합니다. 이 도구만으로는 브라우저 DOM을 제공하지 않습니다. 실제 DOM·preload 동작은 기존 브라우저/Storybook 자동화 또는 `electron-test`로 확인합니다. 예제 테스트를 컴파일하려고 Vitest·jsdom·Testing Library·`@ai-sdk/react`를 알리지 않고 추가하지 않습니다.

## 사용자 상태 검증

- UC에 필요한 idle·streaming·추론 표시·도구 대기/승인/거부/실패·첨부 실패·재연결·취소·완료 상태를 합성 이벤트로 재생합니다. 반복·오래된 이벤트가 메시지를 중복 생성하거나 실행을 섞으면 안 됩니다. 도구 출력과 Markdown은 실행되지 않는 콘텐츠여야 합니다.
- 토큰 수신 중에도 label·키보드 순서·포커스 복원·dialog 동작·접근 가능한 상태 알림·오류 복구·스크롤을 검증합니다. 비공개 대화를 snapshot에 출력하지 않고 긴 대화와 렌더링 작업량 제한을 테스트합니다.
- 설치된 `UIMessage` 타입과 컴포넌트 props에 맞춰 메시지 part·도구 표시를 검증합니다. `ai`의 타입 전용 사용은 모델 시작이나 앱 전송을 `useChat`으로 교체할 권한을 뜻하지 않습니다.
- 합성 어댑터로 해당 shell·토큰·채팅 상태의 Storybook story를 생성·갱신합니다. Story는 실제 daemon에 연결하거나 사용자 파일을 읽거나 운영 자격증명을 요구하면 안 됩니다.
- 안정적인 시각 검사에 선택한 경우에만 `pixelmatch`를 사용합니다. Viewport·font·OS/DPR 가정·시계·animation을 고정하고 대상 환경과 diff 근거를 저장합니다. Screenshot baseline 변경에는 의도적인 디자인 이유가 있어야 하며 회귀를 감추면 안 됩니다.

## 보고와 동기화

TC/UC와 해당 규칙에 따라 검사 이름을 정하고 실행 가능한 명령을 수행하며 실패·미실행 항목을 보존합니다. 순수 로직·브라우저·Storybook·Electron 중 어디서 얻은 결과인지 밝힙니다. 실제 preload를 실행하는 것은 Electron입니다. `sync-docs` 또는 직접 작업으로 테스트 정의·UI 문서를 갱신합니다. 시각 유사성·story 생성·mock 통과는 실제 에이전트 실행을 증명하지 않습니다.


라이선스: MIT. Copyright 2026 moonklabs.
