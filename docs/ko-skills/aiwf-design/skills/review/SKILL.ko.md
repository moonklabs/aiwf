# design-spec 검토

> 휴먼 리뷰용 한글 번역입니다. 실행 원문: [원문](../../../../../plugins/aiwf-design/skills/review/SKILL.md). 번역과 자동 검사는 승인을 뜻하지 않으며, 검토 상태와 원문 SHA256은 [관리 목록](../../../manifest.json)에서 확인합니다.

**식별자:** `review`

**설명:** 커밋이나 PR 전에 docs/design-spec을 검토·검증할 때, 그곳의 제목을 바꾸거나 파일을 옮긴 뒤, design-spec 링크나 traceability 행이 낡았을 수 있을 때, 또는 문서가 Figma 파일에 대해 무언가를 단정할 때 사용한다. "디자인 스펙 점검", "design-spec 리뷰", "링크 확인", "lint".

Copyright 2026 moonklabs. Apache-2.0 라이선스. 플러그인의 LICENSE와 NOTICE를 참조한다.

구조 검사(스크립트)와 판단 검사(아래 목록)를 나누어 실행한다. 검토는 쓰기와 별개의 패스이다. 디자이너 소유 문서(`decisions.md`, `figma-map.md`, `memories/plans/`)는 요청 없이는 고치지 않고 문제만 지적한다. 경로는 `design-spec.config.json`에서 가져온다(스키마는 [플러그인 README](../../../../../plugins/aiwf-design/README.md), [한글 검토본](../../README.ko.md)). `<skills>`는 이 스킬의 폴더를 담은 폴더이다.

## 1. 구조 검사

```bash
node <skills>/review/scripts/design_spec_lint.mjs            # 0 = no ERROR
node <skills>/review/scripts/design_spec_lint.mjs --strict   # before a commit or PR: WARN also fails
node <skills>/review/scripts/design_spec_lint.mjs --self-test
```

저장소 루트에서 실행하거나(`--root <repo>`를 넘긴다), 설정이 `docs/design-spec/design-spec.config.json`에 없으면 `--config <file>`을 넘긴다. 설정이 없거나 올바르지 않으면 종료 코드 2로 끝나며 기대하는 파일을 알려 준다. 출력은 `path:line: SEVERITY CODE [element]: message` 형식이다(aiwf-core `spec_lint.py`와 같은 모양). 코드의 뜻과 고치는 곳은 [references/lint-codes.md](../../../../../plugins/aiwf-design/skills/review/references/lint-codes.md)([한글 검토본](references/lint-codes.ko.md))에 있다. 스크립트를 바꿨으면 `--self-test`로 모든 코드가 다시 발생하는지 확인한다. AIWF 기획 문서 자체는 aiwf-core:spec-review로 따로 검사한다.

## 2. 판단 검사

| 확인할 것 | 방법 |
|---|---|
| Figma에 대한 문서의 단정(예: "codeSyntax equals the CSS name") | 스냅샷(`tokens.snapshot`)에서 센다. 일부만 일치하면 "일부만"으로 바꾼다 |
| `decisions.md`와 Figma가 다른 곳 | decisions의 규칙 문장을 스냅샷 값과 비교한다(예: 코드 글꼴). 목록으로 적고 해결하지 않는다 |
| `memories/plans/`를 현재 기준처럼 인용 | 기준은 decisions · figma-map · design-system 문서여야 한다 |
| Figma 값 표를 다른 문서에 복사 | 값은 Figma와 토큰에서 오고, 문서는 링크만 둔다 |
| design-spec 작업에서 기획 문서를 고쳤는지 | `git diff --stat -- <planning.requirements> <planning.useCases> <planning.testCases>` |
| HANDOFF가 마지막 작업을 반영하는지 | 진행 기록과 traceability 날짜와 비교한다 (`DS_HANDOFF_STALE`) |
| 이름이 바뀐 제목을 가리키는 문장 | `DS_QUOTED_HEADING`과 함께 `grep -rn "<old heading>" <entryDocs> <specRoot>` |

## 보고

ERROR와 WARN은 `file:line`과 고칠 내용으로, 판단 검사 결과는 근거(스냅샷 값, grep 출력)와 함께 적는다. 고친 것과 지적만 한 것을 구분한다. 검사를 실행하지 않았으면 실행하지 않았다고 쓴다.
