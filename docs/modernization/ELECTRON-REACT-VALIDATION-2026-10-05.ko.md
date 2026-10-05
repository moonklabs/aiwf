# Electron/React 플러그인 추가와 검증

검증일: 2026-10-05. 새 플러그인은 `aiwf-electron-react@0.1.0`이며 현재 checkout의 변경이다. 배포된 `aiwf@0.4.0`에는 포함되지 않는다. 휴먼 검토 상태는 `awaiting_review`다.

## 구성과 검토 순서

`aiwf-nestjs-nextjs`의 스택 플러그인 구성을 참고해 core 명세를 Electron 구현으로 연결하는 자체 MIT 지침을 작성했다. 기존 방법론 원문과 기존 스택 4종은 변경하지 않는다.

1. [한글 README](../ko-skills/aiwf-electron-react/README.ko.md)에서 역할·설치·호출 방법을 확인한다.
2. [스택 기준](../ko-skills/aiwf-electron-react/skills/scaffold/references/stack-profile.ko.md)에서 요청 버전과 선택 기능을 확인한다. 제공된 참고 앱 경로는 이 환경에 없어 실제 package.json·main·import를 조사한 것으로 기록하지 않았다.
3. [아키텍처](../ko-skills/aiwf-electron-react/skills/implement/references/architecture.ko.md)에서 main·preload·renderer·shared, typed IPC, 원격 브라우저 격리와 어댑터 예시를 검토한다.
4. README에 연결된 6개 스킬의 실행 범위와 미검증 결과 보고 조건을 검토한다. 설계 예시는 Sally·PI의 실제 프로토콜 선언이 아니다.

코딩 에이전트는 선택한 Sally·PI·기타 런타임이 실행한다. shadcn/ui·AI Elements는 앱 소스로 UI를 구성하며, `ai`의 타입 사용을 모델 실행이나 `useChat` 도입으로 확대하지 않는다. 터미널·파일 검색·문서 처리·추적 등의 기능은 UC에 필요한 경우에 선택한다.

## 실행한 검사

| 검사 | 확인한 결과 |
| --- | --- |
| `npm test` | 문서 선행 검사와 Node 테스트 97개 통과. 선택적 외부 원본 checkout 바이트 대조는 해당 경로가 없어 수행하지 않았으며 저장된 해시 대조는 통과 |
| `npm run docs:check` | 한글 문서 80개, 저장소 스킬 41개와 로컬 검토 스킬 2개 포함. 전부 검토 대기, 휴먼 승인 0개 |
| `npm run validate:spec-plugin` | 기존 스킬 31개와 리소스 71개의 기록된 해시 보존, 기존 NOTICE 수정 1건, 자체 스킬 10개와 참조·manifest 검증 통과 |
| `npm run check:deps` | Node 소스 6개 선언·로컬 import 검사 통과. 새 프로젝트 의존성 없음 |
| `npm run test:spec-upstream` | Python 자체 검사 3개 통과 |
| `npm run validate:spec-example` | 명세 예제 오류·경고·정보 0개 |
| 공식 `skills` CLI 1.5.26 | 로컬 플러그인에서 스킬 6개 검색, Codex·Claude Code 각각의 임시 프로젝트에 실제 복사 설치. 스킬·참조·MIT 라이선스 14개 파일이 원문과 바이트 일치 |
| `npm pack --dry-run --json` | 새 플러그인 파일 18개 포함. `docs/ko-skills/` 검토 자료는 배포 파일에서 제외 |

위 검사는 플러그인 지침과 설치·배포 구성을 확인한다. 앱을 생성하거나 Sally·PI를 실제 실행한 결과가 아니다. `skill-creator`의 Python `quick_validate.py`는 환경에 PyYAML이 없어 실행하지 못했다. 대신 실제 skills CLI의 검색·설치와 저장소 validator로 frontmatter·이름·참조를 확인했다.

## 독립 에이전트 적용 예제

별도 에이전트에게 `scaffold`와 `agent-runtime` 지침 및 최소 fixture를 주고, “UC-001의 Sally 연결·취소·재연결을 구현할 준비를 하되 설치나 모델 호출 없이 상태 조사·계획·계약 문서를 작성”하도록 요청했다. 입력은 package.json 선언, 타입 전용 `UIMessage` import, 연결되지 않은 Sally 상태 상수, Draft UC 4개 파일이었다.

에이전트는 현재 상태, 앱 소유 계약, 구현 계획과 실행 보고서를 작성했다. 선언 버전을 설치 증거로 취급하지 않았고, 실제 Sally API를 추측하지 않았으며, 취소 접수와 취소 완료·재연결과 실행 재개를 구분했다. 원본 4개 SHA256 보존을 부모 세션에서도 확인했고, 에이전트의 로컬 문서 링크 22개 검사 결과를 검토했다. fixture의 `npm run docs:check`는 script 부재로 실패한 사실을 남겼다. 저장소의 문서 검사 통과와 별개다.

적용 중 드러난 모호함을 원문·한글본에 함께 보완했다. scaffold의 문서 한정 종료 지점, 소비 프로젝트 제약의 우선순위, 신규 앱의 자격증명 저장 방식 결정, 기능 지원의 `unknown`/`unsupported`/`supported` 구분이다. 코드 예시는 양쪽 문서에서 동일하게 갱신했다. 보완 후 문서·설치 검사는 다시 수행했으며 독립 적용 예제 전체를 다시 실행하지는 않았다.

이 예제는 문서 인계 범위다. 계약 TypeScript 컴파일·합성 이벤트 테스트·실제 Electron/Sally 실행은 하지 않았다. 임시 조사·설치 fixture, 생성·검증 스크립트와 임시 로그는 일회성 코드 정리 요청에 따라 삭제했다. 이 문서에는 관찰 결과와 보완한 지침만 남기며 독립 적용 예제는 자동 회귀 테스트가 아니다.

## 일회성 코드 정리 후 검증

사용자의 정리 요청에 따라 Electron 전용 목록 확인 테스트 3개를 제거하고 단독 설치 라이선스 검사는 기존 배포 검사로 옮겼다. 날짜가 고정된 임시 checkout 대조 1개와 과거 파일럿의 구현·테스트 파일 4개도 제거했다. 설치·덮어쓰기 방지·명세·출처·문서 계약을 검증하는 반복 가능한 검사는 유지한다.

정리 후 `npm test`는 93개 통과, 실패 0이다. 한글 문서 80개 검사, 의존성·플러그인 검사, Python 자체 검사 3종과 명세 예제 검사도 통과했다. 위 표의 97개는 정리 전 기록이다. 스킬 원문·한글본과 휴먼 검토 대기 상태는 유지했다.

## 확인하지 않은 범위

- 요청 버전 전체의 배포 여부, peer·engine 호환성과 앱 lockfile.
- 실제 대상 앱에서의 Electron GUI·preload·원격 브라우저 동작.
- Sally·PI 패키지 좌표, 인증·프로토콜과 실제 모델·도구 호출.
- 네이티브 모듈의 OS·CPU별 빌드, macOS·Windows 서명·배포판 실행.
- Claude Code marketplace의 실시간 설치·호스트 자동 스킬 선택. 현재 확인한 것은 메타데이터와 명시적 skills CLI 설치다.
- 원문 지시와 한국어 번역의 사람에 의한 의미 검토. 자동 검사 통과로 승인 상태를 바꾸지 않는다.
