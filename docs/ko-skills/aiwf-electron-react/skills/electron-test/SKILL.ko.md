# Electron 경계와 흐름 테스트

> 휴먼 리뷰용 한글 번역입니다. 실행 원문: [원문](../../../../../plugins/aiwf-electron-react/skills/electron-test/SKILL.md). 번역과 자동 검사는 승인을 뜻하지 않으며, 검토 상태와 원문 SHA256은 [관리 목록](../../../manifest.json)에서 확인합니다.

- 식별자: `electron-test`
- 설명: Node 테스트와 Playwright Electron 자동화로 main/preload 계약·에이전트 수명주기·데스크톱 종단간 유스케이스를 검증합니다.


현재 UC/TC 정의와 실제 앱 스크립트를 기준으로 $ARGUMENTS를 검증합니다. 실행 harness를 만들기 전에 컴파일된 entry/preload 경로와 선택한 Electron/Playwright 버전을 조사합니다. 프로젝트 설정이 지원하면 Node 테스트 러너·`tsx`를 쓰며 Electron 자동화에 선택한 경우 `playwright-core`를 사용합니다.

## 계층별 근거

1. 단위/계약 테스트: Zod 요청·이벤트 스키마와 업무 규칙을 검증합니다. 알 수 없는 작업·잘못된 페이로드·허용되지 않은 발신자/프레임·승인된 workspace 밖 리소스 경로를 거부합니다. 경로 탈출·symlink·입력 크기 제한·정제된 오류를 포함합니다. 페이로드가 유효해도 원격 프레임은 권한이 없습니다.
2. 수명주기 테스트: 에이전트 연결 해제·프로세스 종료·중복/순서 역전·취소 경합·재개 지원을 재생합니다. 세션 격리·도구 부작용 중복 방지·listener/watcher 해제·소유 관계에 따른 daemon 정리를 검증합니다. 실제 profile·자격증명 대신 임시 사용자 데이터와 fixture를 사용합니다.
3. Electron smoke/E2E: 실험적 Playwright `_electron` API로 빌드된 앱을 시작하고 의도한 창을 찾으며 실제 preload 브리지를 호출해 renderer에서 보이는 결과를 확인합니다. 기본은 결정적인 가짜 런타임 이벤트이며 별도 승인된 실제 runtime smoke는 정확히 구분합니다. 실패를 포함해 테스트 정리 단계에서 앱과 소유 프로세스를 종료합니다.
4. 원격 브라우저 검사: 신뢰하지 않는 `WebContentsView`가 앱 브리지에 접근할 수 없는지 확인합니다. Navigation/popup/권한 정책과 view 정리를 테스트합니다. 앱 창 screenshot은 하위 view 보안이나 자동화 범위 전체를 증명하지 않으므로 수동 검증 누락을 명시합니다.
5. 패키지 앱 검사: 개발 서버 실행과 구분하여 배포판의 컴파일된 resource/preload 경로와 네이티브 의존성을 확인합니다. UC가 요구하는 대상 OS 검사를 수행하고 산출물 관련 작업에는 `package`를 사용합니다.

## Harness 한계

Playwright의 Electron 지원은 실험적입니다. 설치 버전의 실행 요건과 `EnableNodeCliInspectArguments`를 포함한 Electron fuse를 확인합니다. 자동화를 통과시키려고 운영 fuse나 sandbox 설정을 약화하지 않습니다. 필요하면 별도 테스트 산출물을 사용하고 차이를 기록합니다. Electron 네이티브 dialog는 main 측의 통제된 stub 또는 별도 수동 검사가 필요합니다. Mock dialog는 OS 권한 프롬프트 동작을 증명하지 않습니다.

## 완료

명령·앱 버전·런타임 모드·OS/아키텍처·TC/BR 결과를 보고합니다. 합성 또는 비식별 데이터만 로그/screenshot에 보존합니다. 사용할 수 없는 GUI·OS·실제 런타임 검사는 통과가 아니라 미실행으로 표시합니다. `sync-docs` 또는 직접 작업으로 테스트 정의와 관련 문서를 갱신합니다. 테스트 성공은 휴먼 승인이나 배포 권한을 부여하지 않습니다.


라이선스: MIT. Copyright 2026 moonklabs.
