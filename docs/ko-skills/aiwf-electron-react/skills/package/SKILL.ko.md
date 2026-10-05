# 에이전트 데스크톱 패키징

> 휴먼 리뷰용 한글 번역입니다. 실행 원문: [원문](../../../../../plugins/aiwf-electron-react/skills/package/SKILL.md). 번역과 자동 검사는 승인을 뜻하지 않으며, 검토 상태와 원문 SHA256은 [관리 목록](../../../manifest.json)에서 확인합니다.

- 식별자: `package`
- 설명: electron-vite·electron-builder로 macOS 또는 Windows 로컬 산출물을 빌드하고 네이티브 모듈·리소스·서명 근거를 검증합니다.


$ARGUMENTS에 지정한 앱과 대상 OS/아키텍처를 패키징합니다. 먼저 앱 빌드 스크립트·lockfile·builder 설정·에이전트 제공 방식·배포 요건을 읽습니다. 설치한 electron-builder 주 버전 문서를 따르고 새 주 버전의 호환되지 않는 설정을 복사하지 않습니다.

## 빌드와 검사

1. 기존 타입 검사와 관련 테스트를 실행한 뒤 electron-vite로 main·preload·renderer를 빌드합니다. 컴파일된 main entry와 모든 preload/renderer 리소스가 패키지 파일 집합에 있는지 확인합니다. 개발 URL·소스 경로가 운영 시작 경로에 남으면 안 됩니다.
2. 런타임 의존성과 빌드 도구를 구분합니다. electron-vite 5에서는 main/preload의 `build.externalizeDeps` 동작을 확인하며 renderer 의존성은 번들링합니다. Sandboxed preload의 번들링 가능한 import는 포함해야 하고, 네이티브 addon은 권한이 있는 프로세스에 두며 호환 바이너리를 제공해야 합니다.
3. 선택한 네이티브/sidecar 기능인 `@lydell/node-pty`, `@parcel/watcher`, `@vscode/ripgrep`, `@napi-rs/canvas` 등에 대해 정확한 대상 OS·CPU 아키텍처·Electron ABI 또는 해당 Node-API 지원을 검증합니다. 프로젝트가 지원하는 rebuild/prebuilt 방식을 쓰며 실행 권한과 ASAR unpack/resources 경로를 확인합니다. 개발 호스트 모듈이 다른 대상에서 작동한다고 가정하지 않습니다.
4. 선택한 에이전트를 외부 설치로 사용할지 함께 묶을지 정합니다. 외부 방식에는 명시적인 탐색·버전 검사와 해결 방법을 안내하는 런타임 누락 UI가 필요합니다. 번들 방식에는 재배포 호환성·리소스 선언·소유 관계에 따른 시작/종료가 필요합니다. 토큰·사용자 profile·개발자 로컬 절대 경로를 산출물에 넣지 않습니다.
5. 실제 builder 버전의 flag/설정을 사용해 게시를 끈 상태로 macOS·Windows 로컬 산출물을 만듭니다. macOS 서명/공증과 Windows 서명에는 설정된 identity·환경이 필요합니다. 미서명·ad-hoc 빌드는 배포 가능한 서명 빌드와 별도 결과입니다. 각 대상을 테스트하거나 없는 대상 환경을 밝힙니다.
6. 격리한 사용자 데이터로 패키지 앱을 smoke 실행합니다. IPC 브리지·파일 선택·에이전트 연결/해제·선택한 네이티브 기능을 검증하고 문서 렌더링의 asset/worker 경로를 확인합니다. 기존 사용자 데이터를 지우지 않고 업그레이드/이전 동작을 검사하며 산출물 이름·checksum·실제 서명/공증 검증 결과를 보존합니다.

## 릴리스 경계

패키징 요청은 로컬 산출물 준비 범위입니다. 릴리스 업로드·피드 게시·서명 자격증명 변경은 사용자 요청에 해당 범위가 있어야 합니다. 기존 릴리스 자동화는 부작용을 조사한 뒤 재사용합니다. `sync-docs` 또는 직접 작업으로 릴리스·설치·문제 해결 문서를 마무리합니다. 빌드 대상·실행한 smoke 검사·빠진 선택 모듈·서명/OS/런타임 검증 누락을 보고합니다. 한 번의 로컬 빌드로 여러 플랫폼·서명 배포가 검증됐다고 표현하지 않습니다.


라이선스: MIT. Copyright 2026 moonklabs.
