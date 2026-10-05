# design_spec_lint 코드

> 휴먼 리뷰용 한글 번역입니다. 실행 원문: [원문](../../../../../../plugins/aiwf-design/skills/review/references/lint-codes.md). 번역과 자동 검사는 승인을 뜻하지 않으며, 검토 상태와 원문 SHA256은 [관리 목록](../../../../manifest.json)에서 확인합니다.

종료 코드: 0 깨끗함, 1 ERROR 있음(`--strict`이면 WARN도), 2 사용법 또는 설정 오류(`design-spec.config.json`이 없거나 올바르지 않음).

경로는 `design-spec.config.json`의 설정 키이다: `specRoot`(기본 `docs/design-spec`), `planning.requirements`, `planning.useCases`, `plans.dir`, `plans.toolDefaultDirs`, `tokens.snapshot`, `figma.fileKey`.

| 심각도 | 코드 | 뜻 | 고치는 곳 |
|---|---|---|---|
| ERROR | `DS_FILE_MISSING` | design-spec 필수 파일이 없다 (README · AGENTS · HANDOFF · decisions · traceability · figma/figma-map · design-system/README) | 파일 복구 |
| ERROR | `DS_LEGACY_DIR` | design-spec 안에 `superpowers/`나 `docs/`가 있다 | 계획을 `plans.dir`로 옮긴다 |
| WARN | `DS_PLAN_DEFAULT_PATH` | `plans.toolDefaultDirs` 폴더가 저장소에 생겼다 (계획 도구의 기본 경로) | `<specRoot>/<plans.dir>/`로 옮긴다 |
| ERROR | `DS_BROKEN_LINK` | 상대 링크의 대상이 없다 | 링크 또는 파일 이름 |
| ERROR | `DS_BROKEN_ANCHOR` | `.md#anchor`의 제목이 없다 (제목 이름이 바뀌었다) | 링크를 새 제목의 앵커로 바꾼다 |
| ERROR | `DS_ABSOLUTE_PATH` | design-spec 문서가 `/Users/…` 같은 절대 경로로 링크한다 | 상대 경로를 쓴다 |
| WARN | `DS_QUOTED_HEADING` | `file.md "section"` 문장이 가리키는 제목이나 표 행이 없다 | 문장의 섹션 이름 |
| ERROR | `DS_TRACE_VOCAB` | traceability에 `## 상태 값` 표가 없다 | 표를 복구한다 |
| ERROR | `DS_TRACE_STATUS` | 행 상태에 상태 값 단어가 하나도 없다 | 상태 값 단어를 쓴다 (설명은 괄호) |
| ERROR | `DS_TRACE_DATE` | 갱신 열이 `YYYY-MM-DD`가 아니다 | 행을 고친 날짜 |
| ERROR | `DS_DANGLING_REF` | 행의 UC/FR/NFR/C ID가 `planning.requirements`나 `planning.useCases`에 없다 | ID 또는 기획 쪽을 확인한다 |
| INFO | `DS_QUEUE_DESIGN` | `기획 변경 대기` 행 — 디자이너가 다시 볼 것 | 보고에 목록으로 적는다 |
| INFO | `DS_QUEUE_PLANNING` | `기획 변경 필요` 행 — 기획이 결정할 것 | 보고에 목록으로 적는다 |
| WARN | `DS_PLAN_NAME` | 계획 파일 이름이 `YYYY-MM-DD-kebab.md`가 아니다 | 파일 이름 |
| WARN | `DS_PLAN_NO_LOG` | 계획에 "진행 기록" 절이 없다 | 계획 문서 (디자이너) |
| ERROR | `DS_HANDOFF_DATE` | HANDOFF에 `마지막 갱신: YYYY-MM-DD`가 없다 | HANDOFF 머리말 |
| WARN | `DS_HANDOFF_STALE` | HANDOFF 날짜가 traceability나 계획의 가장 최근 날짜보다 이르다 | HANDOFF를 갱신한다 |
| ERROR | `DS_SNAPSHOT_INVALID` | `tokens.snapshot`이 JSON이 아니다 (잘린 읽기) | aiwf-design:figma-sync로 다시 읽는다 |
| WARN | `DS_FILEKEY` | 스냅샷의 Figma 파일 키가 figma-map.md에 없거나 `figma.fileKey`와 다르다 | figma-map, 설정 또는 스냅샷 |

범위: `<specRoot>/**/*.md`의 모든 링크, 그리고 `entryDocs` 파일(기본 `README.md`, `AGENTS.md`)에서 design-spec으로 들어오는 링크.
