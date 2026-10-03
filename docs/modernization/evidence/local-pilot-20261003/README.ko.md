# UC-001 로컬 변경·재검증 자료

[파일럿 결과](../../PILOT-RESULT-2026-10-03.ko.md)의 재현 자료다. 실제 제품이나 운영 앱은 아니다. 원 실행 경로·시각·로그는 수정하지 않고 보관했다. private 경로는 실행 당시 문맥이며 재현에 그 경로가 필요하지 않다.

- `project/docs`, `project/src`, `project/tests`: 최종 명세·검사 연결표·서비스·23개 테스트.
- `project/artifacts`: 기준/실패/최종 evidence와 packet, 명세 pin, 실제 stdout/stderr와 readback. `.aiwf` 실행 상태는 복사하지 않았다.
- [execution.json](execution.json): 단계별 실제 실행과 입출력 hash. 현재 CLI가 자동 수집하는 계약이 아니다.
- [scope.json](scope.json): 예제 범위·환경·최종 입력 hash·보관 시 도구 hash, 휴먼 검토 미기록.
- `maintenance/`: 파일럿 이후 AIWF 저장소의 회귀·출처·예제·문서 검사와 재현 안내 실행 기록. 원 파일럿 측정과 구분한다.

원 구현과 12개 테스트는 [이전 보관 자료](../full-test-20261003/)와 bytes가 같았다. 구현 수정 전 실패는 새 테스트가 기존 구현의 누락을 검출한 결과다. 역사 자료와 원 packet은 덮어쓰지 않았다.

## 최종 서비스와 구조 검사 재현

아래는 AIWF 저장소 루트에서 실행한다. 새 Node 프로세스를 사용한다. Python은 전체 core의 sibling 검사가 있는 경로를 사용한다.

```bash
node --test docs/modernization/evidence/local-pilot-20261003/project/tests/expense.test.mjs
python3 plugins/aiwf-core/skills/spec-review/scripts/spec_lint.py --docs docs/modernization/evidence/local-pilot-20261003/project/docs --strict --no-baseline --format json
```

둘 다 exit 0, 서비스 23 passed/0 failed와 lint findings 0이 예상 결과다. 로그인·UI·DB·의미 검토는 이 명령의 검증 범위가 아니다.

## 새 로그로 pin·packet 재현

보관본을 새로운 임시 프로젝트에 복사해 실제 검사를 다시 실행한 뒤 packet을 만든다. 기존 기록의 로그를 새 검증이라고 재사용하지 않는다. 아래의 `set -e`는 검사 실패 시 성공 상태가 적힌 evidence로 packet을 만드는 다음 단계를 중단한다. 본문 속 `command` 필드는 기록된 설명이므로 재실행 도구·cwd와 exit code는 별도로 확인한다.

```bash
set -e
pilot_parent=$(mktemp -d "${TMPDIR:-/tmp}/aiwf-replay-XXXXXX")
cp -R docs/modernization/evidence/local-pilot-20261003/project "$pilot_parent/project"
pilot_root="$pilot_parent/project"
python3 plugins/aiwf-core/skills/spec-review/scripts/spec_lint.py --docs "$pilot_root/docs" --strict --no-baseline --format json > "$pilot_root/artifacts/final-structure.stdout.txt"
node --test "$pilot_root/tests/expense.test.mjs" > "$pilot_root/artifacts/final-service.stdout.txt"
node src/cli/spec-cli.js pin --root "$pilot_root" --json
node src/cli/spec-cli.js check --root "$pilot_root" --json
node src/cli/spec-cli.js packet --root "$pilot_root" --evidence "$pilot_root/artifacts/final-evidence.json" --output "$pilot_root/.aiwf/new-review-packet.json" --json
```

새 packet도 `awaiting_review`, acceptance `not_recorded`, passed 2/not_run 2로 남는다. 코드 hash·실행 최신성은 별도 확인이 필요하다. 재현은 실제 사람의 수용을 기록하지 않는다.
