# UC-001 로컬 파일럿 실행 결과

실행: 2026-10-03. 상태: **로컬 검증 완료, 실제 제품 적용·휴먼 리뷰 대기**. [실행 전 계획](PILOT-UC-001.ko.md), [검토 당시 계획](CLI-PRODUCTIVITY-REVIEWED-2026-10-03.ko.md), [Claude 두 세션의 리뷰](CLAUDE-PLAN-REVIEW-2026-10-03.ko.md)를 구분해 읽는다. 이번 수정본에 대한 Claude 재검토는 실행하지 않았다.

## 결과와 이번 변경

기존 지출 제출 예제를 별도 임시 프로젝트에서 실행했다. 엔터티의 사용 내용 길이 200을 `UC-001 BR-002/A3`, `TC-002`, [구현 계획의 검사 연결표](evidence/local-pilot-20261003/project/docs/plans/UC-001.md)에 명시하고 서비스 구현·테스트를 연결했다. Unicode code point 수와 생략·null·타입 정책은 이 예제의 결정이며 실제 업무 정책 승인이 아니다.

기준 서비스 테스트 12개는 모두 통과했다. 새 요구사항을 검증하는 11개 테스트를 추가하자 **23개 중 7개가 실제로 실패**했다. 길이 초과·숫자/배열/객체 입력·null 처리·길이 수정 흐름의 누락을 검출했다. 저장 전에 타입·길이·선택 입력을 검증하도록 구현을 고친 후 **23개 모두 통과**했다. 보관한 최종 파일에서도 새 프로세스로 같은 23개를 다시 실행해 통과했다.

명세 변경 시 `check`는 TC 추가 1개와 기존 문서 변경 3개를 drift로 보고했고 exit 1을 반환했다. 갱신 전 `packet`도 `packet_requires_sync`로 거부했으며 출력 파일이 만들어지지 않았다. 명세를 명시적으로 다시 pin한 뒤 실패·최종 packet을 따로 생성했다.

AIWF의 실행 CLI·upstream 원문·스킬은 수정하지 않았다. 서비스 변경은 [보관 예제](evidence/local-pilot-20261003/README.ko.md)의 재현 자료다. `verify`, runner, packet v2, 문서 보고서와 CI는 미구현 후보로 유지한다.

## 실행 근거

| 단계 | 실제 결과 | 기록 |
| --- | --- | --- |
| 기준 구조·서비스 | lint findings 0, tests 12/12, exit 0 | [구조](evidence/local-pilot-20261003/project/artifacts/baseline-structure.stdout.txt), [테스트](evidence/local-pilot-20261003/project/artifacts/baseline-service.stdout.txt) |
| 기준 pin·packet | pin과 digest 일치, passed 2 / not_run 2 | [기준 packet](evidence/local-pilot-20261003/project/artifacts/baseline-packet.json) |
| 명세 변경 | TC 1개 추가, 문서 3개 변경, check exit 1 | [drift JSON](evidence/local-pilot-20261003/project/artifacts/changed-check.stdout.txt) |
| drift 상태 packet | exit 1, packet_requires_sync, 출력 없음 | [거부 JSON](evidence/local-pilot-20261003/project/artifacts/changed-packet-refused.stdout.txt) |
| 명세 재고정 후 구현 수정 전 | lint findings 0, tests 16 passed / 7 failed, test exit 1 | [실패 테스트](evidence/local-pilot-20261003/project/artifacts/red-service.stdout.txt) |
| 실패 packet | 생성 exit 0, passed 1 / failed 1 / not_run 2 | [실패 packet](evidence/local-pilot-20261003/project/artifacts/red-packet.json), [readback](evidence/local-pilot-20261003/project/artifacts/red-readback.json) |
| 구현 수정 후 | lint findings 0, tests 23/23, check in_sync, exit 0 | [최종 테스트](evidence/local-pilot-20261003/project/artifacts/final-service.stdout.txt), [check](evidence/local-pilot-20261003/project/artifacts/final-check.stdout.txt) |
| 최종 packet | passed 2 / not_run 2, digest·로그 bytes 일치 | [최종 packet](evidence/local-pilot-20261003/project/artifacts/final-packet.json), [readback](evidence/local-pilot-20261003/project/artifacts/final-readback.json) |
| 보관본 재실행 | lint findings 0, tests 23/23, exit 0 | [구조](evidence/local-pilot-20261003/project/artifacts/archive-structure.stdout.txt), [테스트](evidence/local-pilot-20261003/project/artifacts/archive-service.stdout.txt) |

구조 검사는 모두 저장소 core의 `spec_lint.py --docs docs --strict --no-baseline --format json`으로 실행했다. UC 검사기는 core의 sibling에서 로드했고 누락 INFO도 없었다. 이번 명세에는 BPMN이 없어 BPMN 파싱 실행을 검증한 결과는 아니다. 구조 검사 통과는 한국어 의미·업무 수용과 별개다.

서비스 검사 명령은 `node --test tests/expense.test.mjs`다. [실행 기록](evidence/local-pilot-20261003/execution.json)에 각 argv·cwd·UTC 시각·exit code·stdout/stderr bytes와 SHA256, 실행 전후 docs/src/tests hash를 보관했다. 각 명령 전후 관찰한 입력 hash는 동일했다. 그 사이의 일시적 변경까지 배제하는 격리 증명은 아니다.

## 버전과 근거의 한계

| 항목 | 확인 값 |
| --- | --- |
| checkout 기준 HEAD | `fcf5ebc24bcd5e49148290a65ac6e1a5c4b22ba6`; 문서 변경은 미커밋 상태 |
| 실행 환경 | Node `v22.23.1`, Python `3.14.8` |
| 기준 명세 digest | `53e0bd97d338aa9ca96472e09ff9f2ee54b33e0e6a39a9e23bf63c1bb4272bef` |
| 변경·최종 명세 digest | `a2616b3224768a0a7972bd75ba19632d2e9b84afc5c175ae21c71281dc5017a2` |
| 최종 서비스 SHA256 | `8f434f4614809a9ec3c478235232bc0a14b586fab6e7a6c4467e91d7040c0669` |
| 최종 테스트 SHA256 | `90b7203d0933c09b63d3d2ba1e302bb45eef8932f2d54837d27194e82a9ad439` |

임시 프로젝트는 Git 저장소가 아니므로 packet의 `git`은 null이다. 기준 HEAD는 사용한 AIWF checkout의 문맥이며 서비스 코드의 Git 버전으로 취급하지 않는다. [범위 기록](evidence/local-pilot-20261003/scope.json)은 보관 시점의 도구 hash와 최종 입력 hash를 추가로 남긴다.

현재 CLI는 코드·테스트 hash나 실행 시점·exit code를 자동 확인하지 않는다. 이번 실행 기록은 에이전트가 별도로 수집한 자료이며 새로운 evidence schema나 CLI 기능이 아니다. packet의 `command`는 설명 필드이고 CLI는 그 명령을 실행하지 않았다. 갱신된 pin에서 옛 로그를 넣는 일을 현재 CLI가 막는다고 주장하지 않는다.

모든 packet은 `awaiting_review`, acceptance `not_recorded`, evidence trust `reported_untrusted`다. 실패 packet 생성의 exit 0은 **실패를 포함한 파일 저장 성공**이다. 최종 packet에서도 로그인·UI·실제 사람 검토는 `not_run`/미검증으로 남아 있다. readback은 작성자의 기계적 확인이며 독립 의미 검토나 사람 승인이 아니다.

## 생산성 판단과 다음 범위

버전 조회를 포함한 파일럿 명령 18개와 보관본 검사 2개의 프로세스 wall time 합계는 약 **0.879초**다. 이는 이 컴퓨터의 작은 예제에서 명령 실행에 쓴 시간이며 문서 작성·검토·코딩·사람의 활성 시간이 아니다. 사람 시간은 `not_measured`이고 절감률은 계산하지 않는다.

명령 선택, 로그 저장, 상태 전사, 근거 묶기, 입력·로그 hash 확인이 반복되는 지점은 관찰했다. 그러나 하나의 UC를 변경·재실행한 결과이므로 독립 UC 2개 이상의 비용 측정 기준을 충족하지 않는다. 새 runner나 packet v2의 도입 근거로 확대하지 않는다.

다음 적용 범위는 사용자가 지정한 실제 소비 프로젝트·UC다. 우선 동일한 연결표와 실제 사람의 packet 검토 기록을 사용한다. 검사 경로·누락 확인이 문제면 후보 A인 읽기 전용 `verify`를, 전사·수집 비용이 확인되면 후보 B의 최소 runner를 검토한다. 이번 결과만으로 구현을 시작할 범위를 늘리지 않는다.

## 사람이 검토할 항목

| 항목 | 현재 상태 |
| --- | --- |
| 실제 소비 프로젝트 / UC | 미지정; 로컬 예제만 실행 |
| 검토자 / 검토 시각 | 미기록 |
| 읽은 packet / spec digest / 코드·테스트 hash | 실제 검토자가 기록해야 함 |
| BR-002의 글자 수·null·타입 정책과 업무 의미 | 로컬 예제 결정, 휴먼 리뷰 대기 |
| 범위 판단 / 자료 재요청 / 수정 요청 | 미기록 |
| 리뷰 준비·읽기·수정의 사람 활성 시간 | not_measured |

기존 70개 한글 검토 문서의 실제 휴먼 리뷰 상태도 바꾸지 않았다. plugin README의 원문·한글본과 관리 목록을 함께 갱신했다. 저장소 유지보수 검사의 최신 결과는 아래에 별도로 기록하며 과거 검증을 이번 성공으로 전사하지 않는다.

미검증 범위는 로그인·권한·submitter_id, UI와 오류·접수 표시, 실제 DB·동시성·지속성·Decimal 정밀도, 업무 수용·제품 효과, 지원 하한 Node 20/Python 3.9, stack 앱, Sprintable·원격 승인·무인 실행이다.

## 이번 변경 후 저장소 검증

| 검사 | 최신 결과 | 실행 기록 |
| --- | --- | --- |
| `npm test` | 85 passed / 0 failed; pretest의 한글 문서 검사 통과 | [기록](evidence/local-pilot-20261003/maintenance/node.json) |
| `npm run check:deps` | Node 소스 6개의 의존성·로컬 import 통과 | [기록](evidence/local-pilot-20261003/maintenance/dependencies.json) |
| `npm run validate:spec-plugin` | upstream 31개 스킬·71개 resource의 보관 hash, 참조·manifest 통과 | [기록](evidence/local-pilot-20261003/maintenance/provenance.json) |
| `npm run test:spec-upstream` | Python self-test 3개 통과 | [기록](evidence/local-pilot-20261003/maintenance/upstream.json) |
| `npm run validate:spec-example` | 기존 예제 0 errors / 0 warnings / 0 infos | [기록](evidence/local-pilot-20261003/maintenance/example.json) |
| `npm run docs:check` / `docs:check:local` | 70개 문서의 원문·번역·참조 및 로컬 snapshot 정합성 통과, 휴먼 리뷰 기록 0 | [문서](evidence/local-pilot-20261003/maintenance/docs.json), [로컬](evidence/local-pilot-20261003/maintenance/local-docs.json) |
| 보관 README의 pin·packet 재현 안내 | 새 임시 프로젝트에서 새 로그로 실행, exit 0 | [명령·출력 기록](evidence/local-pilot-20261003/maintenance/readme-replay.json) |

이 검증은 원래 파일럿 20개 명령의 시간 합계와 별개다. Node 회귀 suite의 선택적 외부 upstream reference checkout은 없어서 새 byte 대조를 수행하지 않았다. 저장소에 기록된 upstream hash 대조는 통과했다. 별도 build/typecheck/lint 명령은 이 저장소에 없으며 구조 검사·의존성 검사·회귀 검증의 범위를 보존한다.
