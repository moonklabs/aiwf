# UC-001 로컬 변경·재검증 기록

[파일럿 결과](../../PILOT-RESULT-2026-10-03.ko.md)의 과거 실행 기록이다. 실제 제품이나 운영 앱은 아니다. 원 실행 경로·시각·로그는 당시 값으로 보관한다.

2026-10-05 일회성 테스트·검증 코드 정리에 따라 `project/src/expense.mjs`와 `project/tests/expense.test.mjs`, 관련 재실행 안내를 제거했다. 이전 `full-test-20261003`의 일회성 구현·테스트도 제거했다. 이 보관소는 실행 가능한 서비스 예제가 아니며, 기록 안의 코드 경로와 해시는 당시 입력을 설명한다.

- `project/docs`: 당시 명세와 검사 연결표. pin에 연결된 원문을 보존한다.
- `project/artifacts`: 기준/실패/최종 evidence와 packet, 명세 pin, 실제 stdout/stderr와 readback.
- [execution.json](execution.json): 단계별 실제 실행과 입출력 hash. 현재 CLI가 자동 수집하는 계약이 아니다.
- [scope.json](scope.json): 당시 예제 범위·환경·입력 hash·보관 시 도구 hash, 휴먼 검토 미기록.
- `maintenance/`: 당시 저장소 검사와 재현 안내 실행 기록. 삭제한 코드를 지금 다시 실행할 수 있다는 뜻이 아니다.

현재 검증은 저장소의 `npm test`, `npm run docs:check`, `npm run validate:spec-plugin`과 `npm run validate:spec-example`을 사용한다. 반복 가능한 명세 예제는 [examples/spec-workflow](../../../../examples/spec-workflow/README.md)에 유지한다. 과거 성공 로그를 현재 변경의 검사 결과로 재사용하지 않는다.
