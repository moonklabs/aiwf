# sync-docs 추가와 검증 기록

작성: 2026-10-04. 대상: 이 작업 checkout. 휴먼 검토·제품 적용은 미확인.

## 반영 내용

AIWF 소유 `aiwf-spec` 0.2.0에 [sync-docs 실행 원문](../../plugins/aiwf-spec/skills/sync-docs/SKILL.md)과 [한글 검토본](../ko-skills/aiwf-spec/skills/sync-docs/SKILL.ko.md)을 추가했다. workflow는 구현 완료 전에 영향 문서를 동기화하거나 문서 영향이 없는 이유를 기록하도록 갱신했다. 프로젝트 설치기는 스킬 폴더를 동적으로 탐색하므로 설치 코드의 변경 없이 기본 9개 스킬에 `aiwf-sync-docs`를 포함한다. 새 CLI 명령이나 자동 실행 서비스는 추가하지 않았다.

## 실제 검증

| 검사 | 결과 |
| --- | --- |
| `npm test` | 88개 통과, 실패 0. 한글 문서 검사도 pretest에서 통과 |
| `npm run validate:spec-plugin` | upstream 스킬 31개 및 리소스 해시 보존, AIWF 자체 스킬 4개, manifest·참조 검사 통과 |
| `npm run check:deps` | 기존 Node 소스 6개 검사 통과, 의존성 추가 없음 |
| `npm run test:spec-upstream` | Python 검사기 self-test 3종 통과 |
| `npm run validate:spec-example` | 기존 명세 예제 오류·경고 0 |
| 공식 skills CLI의 로컬 목록 조회 | aiwf-spec에서 workflow와 sync-docs를 발견 |
| 공식 skills CLI의 단독 설치 | 임시 Codex 프로젝트 `.agents/skills/sync-docs/SKILL.md`, Claude 프로젝트 `.claude/skills/sync-docs/SKILL.md` 생성. 원문 바이트 동일 |
| npm package dry run | 새 실행 스킬 포함, `docs/ko-skills/` 검토 보관소 제외 확인 |

스킬 생성 도구의 `quick_validate.py`는 기본·번들 Python에 PyYAML이 없어 실행하지 못했다. 새 의존성은 설치하지 않았다. frontmatter 발견과 실제 설치는 기존 공식 skills CLI로, 리소스·패키지·번역·설치 이름은 저장소 검사기로 확인했다. 이를 해당 Python 도구의 통과로 표현하지 않는다.

## 독립 에이전트의 실행 예제

임시 작업 공간에 기존 지출 예제의 문서·코드·테스트를 복사했다. 요청은 설명 길이를 200에서 150 Unicode code points로 변경한 결과를 문서에 반영하고 다른 업무 정책은 유지하는 것이었다. 입력 코드에는 이 길이 변경과 금액 0을 허용하는 변경을 함께 넣었다. 평가 에이전트에는 예상 답이나 의심 결함을 알려주지 않고 스킬, 요청, 코드·문서·테스트와 diff만 제공했다.

평가 에이전트는 UC-001 BR-002/A3, TC-002, 데이터 모델, 계획과 README의 길이 기준을 갱신했다. BR-001의 양수 정책은 유지하고 금액 0 허용을 구현 회귀로 보고했다. 기존 UC ID와 비영향 문서를 유지했으며 코드·테스트를 수정하지 않은 것을 메인 담당자가 확인했다.

기존 서비스 검사는 23개 중 17개 통과, 6개 실패였다. 실패는 이전 길이·메시지를 기대한 검사 5개와 금액 0 거부 검사 1개다. 새 길이의 ASCII·astral Unicode 150/151 경계 보조 확인과 문서 구조 검사는 통과했다. 실패를 전체 테스트 통과로 바꾸거나 요구사항을 코드에 맞춰 완화하지 않았다. UI·실제 DB·배포·휴먼 수용은 확인하지 않았다.

평가 도중 저장소 번역 관리 파일을 작성 중이어서 AIWF `docs:check` 실패도 보고되었다. 이는 당시 중간 상태의 기록이다. 원문·번역·manifest 갱신 후 메인의 최종 검사는 71개 문서·37개 스킬 검토본으로 통과했다. 과거 관찰을 현재 실패라고 해석하지 않는다.

## 한계와 휴먼 검토

이 기록은 로컬 설치와 한 번의 독립 에이전트 실행 예제다. 모든 소비 프로젝트·스택·호스트의 자동 선택 또는 반복 실행 품질을 보증하지 않는다. 실행 지시는 에이전트가 수행하며 CLI가 문서·구현 정합성을 강제하는 것은 아니다. 원문 및 한글본의 검토 상태는 `awaiting_review`다.

스킬 원문·한글본, workflow 완료 조건과 플러그인 README를 함께 검토한다. 코드 결함을 요구사항으로 바꾸지 않는 처리, 미구현·미검증 상태 보존, 비교 범위와 pin 갱신 책임이 주요 검토 대상이다. 이번 작업에서 commit·push·npm 배포는 수행하지 않았다.
