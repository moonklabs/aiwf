# design-spec 작업 흐름 (라우터)

> 휴먼 리뷰용 한글 번역입니다. 실행 원문: [원문](../../../../../plugins/aiwf-design/skills/workflow/SKILL.md). 번역과 자동 검사는 승인을 뜻하지 않으며, 검토 상태와 원문 SHA256은 [관리 목록](../../../manifest.json)에서 확인합니다.

**식별자:** `workflow`

**설명:** design-spec 작업 공간(docs/design-spec), Figma 디자인 파일, 디자인 토큰, 또는 기획(UC/FR)과 디자인의 관계를 다루는 요청에 사용한다. "디자인 스펙", "피그마", "디자인 시스템", "traceability", "디자인 적용", "토큰 동기화", "HANDOFF", "decisions" 같은 요청을 포함하며, 이번 세션에서 Figma에 써도 되는지 판단하기 전에 사용한다.

Copyright 2026 moonklabs. Apache-2.0 라이선스. 플러그인의 LICENSE와 NOTICE를 참조한다.

design-spec 작업 공간은 디자이너가 운영한다. 상위 AIWF 기획 문서(requirements · use_cases · test_cases)와는 `traceability.md` 한 곳으로만 연결된다. **시작하기 전에 이번 세션의 역할을 정확히 하나로 정한다.** 역할이 Figma에 쓸 수 있는지와 고칠 수 있는 파일을 정한다.

## 프로젝트 설정

모든 프로젝트 값은 `docs/design-spec/design-spec.config.json`(또는 사용자가 지정한 설정 경로)에서 가져온다. `specRoot`, 진입 문서, 기획 문서 경로, Figma 파일 키와 SOT 페이지, 토큰 원천, 검사 명령, 게이트, 인수 문서 위치와 테스트 정책이 들어 있다. 스키마와 기본값은 [플러그인 README](../../../../../plugins/aiwf-design/README.md)에 있다([한글 검토본](../../README.ko.md)). 행동하기 전에 읽고 이 값을 추측하지 않는다. 없으면 없다고 말하고 멈추거나 아래 템플릿에서 시작한다. 내장 스크립트는 구조를 가정하지 않고 설정 오류로 종료한다.

아래의 `<skills>`는 이 스킬의 폴더를 담은 폴더(이 플러그인의 스킬 폴더, 또는 프로젝트에 설치된 스킬 폴더)이다.

### design-spec이 아직 없을 때: 템플릿으로 시작

1. design-spec 작업 공간을 만들어도 되는지와 위치(기본 `docs/design-spec/`)를 사용자에게 확인한다.
2. [references/templates/design-spec/](../../../../../plugins/aiwf-design/skills/workflow/references/templates/design-spec/)를 기존 파일을 덮어쓰지 않고 그 위치로 복사하고, [references/templates/design-spec.config.json](../../../../../plugins/aiwf-design/skills/workflow/references/templates/design-spec.config.json)을 `<specRoot>/design-spec.config.json`으로 복사한다. 계획은 [references/templates/plan.md](../../../../../plugins/aiwf-design/skills/workflow/references/templates/plan.md)([한글 검토본](references/templates/plan.ko.md))에서 시작해 `memories/plans/YYYY-MM-DD-<name>.md`로 둔다.
3. 설정은 사실만으로 채운다. Figma 파일 키와 SOT 페이지는 사용자나 Figma URL에서, 토큰 원천·명령·게이트는 저장소에서 가져온다. 모르는 값은 비워 두고 열린 질문으로 적는다. 지어내지 않는다. 복사한 문서의 `YYYY-MM-DD` 자리표시자는 오늘 날짜로 바꾼다.
4. lint(aiwf-design:review)를 실행하고 실제 결과를 보고한다.

## 역할 고르기

| 요청 | 역할 | Figma | 다음 |
|---|---|---|---|
| Figma 화면·컴포넌트를 만들거나 고친다. 결정·ID·계획을 기록한다 | 디자이너 작업 | 쓰기 (이 작업 자체를 요청받았을 때만) | `<specRoot>/AGENTS.md`, figma:figma-use |
| Figma에서 바뀐 변수·스타일 값에 코드 토큰을 맞춘다 | 동기화 | 읽기 전용 | aiwf-design:figma-sync |
| Figma 디자인을 코드, Storybook, 앱 화면에 적용한다 | 적용 | 읽기 전용 | aiwf-design:apply |
| UC/FR/제약이 바뀌었다, 또는 디자인 결정이 기획과 다르다 | 추적 | — | aiwf-design:trace (+ aiwf-spec:sync-docs) |
| design-spec 문서를 점검한다, 또는 커밋 전이다 | 검토 | 읽기 전용 | aiwf-design:review |

## 섞인 요청

- 한 세션은 한 역할만 맡는다. 동기화나 적용 중에 "하는 김에 피그마도 고쳐줘"가 오면, 지금 작업은 읽기 전용으로 끝낸다. Figma 변경은 인수 문서의 "디자이너 전달 목록"에 적는다. 저장소 지침이 이 역할의 design-spec 문서 수정을 막지 않으면 HANDOFF에도 한 줄 적는다. 막혀 있으면 디자이너가 HANDOFF로 옮겨야 한다고 보고에 적는다. 별도 디자이너 작업으로 실행할지 사용자에게 묻는다.
- `decisions.md`와 Figma가 다르면 둘 중 하나를 고르지 않는다. 차이를 기록하고 결정을 요청한다. `decisions.md`에는 사용자가 확정한 것만 들어간다.
- design-spec 작업에서 기획 문서(requirements · use_cases · test_cases)와 그 밖의 상위 참조 문서(용어집, 제품, 아키텍처, 비전 문서 등)를 고치지 않는다. 고칠 필요가 있으면 보고한다.

## 무엇이 기준인가

| 무엇 | 기준 |
|---|---|
| 값과 컴포넌트 모양 | Figma 작업 파일 (설정 `figma.fileKey`, ID는 `figma/figma-map.md`) |
| 규칙과 확정된 결정 | `decisions.md` |
| 기획 ↔ 디자인 ↔ 구현의 현재 상태 | `traceability.md` |
| 지금 할 일 | `HANDOFF.md` |
| 지난 작업의 이력 (기준 아님) | `memories/plans/` |

## 빠른 명령

```bash
node <skills>/review/scripts/design_spec_lint.mjs              # documents, links, traceability
node <skills>/figma-sync/scripts/check_figma_tokens.mjs        # Figma snapshot ↔ code tokens
```

저장소 루트에서 실행하고, 설정이 기본 경로에 없으면 `--config <file>`을 넘긴다. 프로젝트가 자체 토큰 검사를 정의했으면 둘째 줄 대신 설정의 `commands.tokenCheck`를 사용한다.

## 멈출 때

선택한 역할의 결과물이 있고, lint와 그 역할의 검사를 실제로 실행해 결과와 남은 차이를 보고했을 때 멈춘다. Figma 변경을 HANDOFF 줄 없이 "디자이너 전달 목록"에만 올렸으면, 디자이너가 HANDOFF로 옮겨야 한다고 보고에 적는다. 렌더와 시각 검수는 사용자가 요청할 때만 하며, 하지 않았으면 미검증으로 기록한다.
