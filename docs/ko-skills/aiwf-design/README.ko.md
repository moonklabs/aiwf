# AIWF Design

> 휴먼 리뷰용 한글 번역입니다. 실행 원문: [원문](../../../plugins/aiwf-design/README.md). 번역과 자동 검사는 승인을 뜻하지 않으며, 검토 상태와 원문 SHA256은 [관리 목록](../manifest.json)에서 확인합니다.

AIWF 기획 문서 옆에 두는, 디자이너가 운영하는 design-spec 작업 공간용 스킬, 검사와 템플릿이다. 이 작업 공간은 `traceability.md`를 통해서만 요구사항과 유스케이스에 연결되며, 세션의 역할이 디자이너 작업이 아니면 Figma는 읽기 전용으로 유지된다.

먼저 `aiwf-core`를 설치한다. 이 플러그인은 그것을 의존성으로 선언하며, trace와 review 스킬은 core 기획 스킬을 가리킨다. `aiwf-spec`은 선택 사항이다. 프로젝트에 `docs/design-spec/traceability.md`가 있으면 그 `workflow`와 `sync-docs` 스킬이 `aiwf-design:trace`를 호출한다.

## 스킬

| 스킬 | Claude Code | Codex 설치명 | 역할 |
|---|---|---|---|
| `skills/workflow` | `/aiwf-design:workflow` | `aiwf-design-workflow` | 라우터: 세션마다 역할 하나를 고르고, Figma에 쓸 수 있는지 판단하고, 템플릿으로 새 작업 공간을 시작한다 |
| `skills/figma-sync` | `/aiwf-design:figma-sync` | `aiwf-design-figma-sync` | 읽기 전용 Figma 읽기(readback), 나눠 읽은 결과의 병합, 토큰 검사 |
| `skills/apply` | `/aiwf-design:apply` | `aiwf-design-apply` | Figma 디자인을 코드에 읽기 전용으로 적용: 철칙, 합리화 표, 빨간 신호, 조사·단계 템플릿 |
| `skills/trace` | `/aiwf-design:trace` | `aiwf-design-trace` | 기획이나 디자인이 바뀔 때 traceability 행 상태, 날짜와 HANDOFF 대기 줄 |
| `skills/review` | `/aiwf-design:review` | `aiwf-design-review` | 구조 lint와 판단 점검 목록 |

Claude Code 마켓플레이스는 이 플러그인을 정규화된 명령과 함께 설치한다. `aiwf install --design`과 `node scripts/install-spec-skills.mjs --project <path> --design`은 다섯 스킬을 기본 AIWF 스킬 옆에 `aiwf-design-<name>`이라는 이름으로 프로젝트에 추가하며, 이미 있는 스킬 폴더는 덮어쓰지 않는다. 설치된 복사본은 `aiwf-design:<name>` 참조와 같은 폴더의 스크립트 경로를 설치된 이름으로 바꾼다.

## 프로젝트 설정

모든 프로젝트 값은 기본값이 `docs/design-spec/design-spec.config.json`인 파일 하나에 둔다. 스크립트는 다른 위치를 위해 `--config <file>`을 받으며, 파일이 없거나 올바르지 않으면 종료 코드 2와 기대하는 경로를 출력하고 멈춘다. [템플릿](../../../plugins/aiwf-design/skills/workflow/references/templates/design-spec.config.json)에서 시작한다. 경로는 저장소 기준 상대 경로이며 `..`를 포함할 수 없다.

| 키 | 타입 | 기본값 | 읽는 쪽 | 뜻 |
|---|---|---|---|---|
| `version` | number | 필수: `1` | 모두 | 스키마 버전 |
| `specRoot` | path | `docs/design-spec` | lint, 모든 스킬 | design-spec 작업 공간 |
| `entryDocs` | paths | `["README.md", "AGENTS.md"]` | lint | `specRoot`로 들어오는 링크를 검사할 저장소 문서 |
| `planning.requirements` | path | `docs/requirements.md` | lint, trace, review | 첫 열에 `FR-001` 같은 FR/NFR/C ID를 담은 표 |
| `planning.useCases` | path | `docs/use_cases` | lint, trace, review | `UC-NNN-*.md` 파일이 있는 폴더 |
| `planning.testCases` | path | `docs/test_cases` | trace, review | 테스트 정의 (디자인 작업에서는 절대 고치지 않는다) |
| `plans.dir` | path | `memories/plans` | lint | 계획 폴더, `specRoot` 기준 상대 경로 |
| `plans.toolDefaultDirs` | paths | `["docs/superpowers/plans"]` | lint | 쓰지 않아야 하는 계획 도구의 기본 출력 폴더 |
| `figma.fileKey` | string | `""` | readback, 토큰 검사, lint, apply | SOT Figma 파일. 설정하면 스냅샷은 이 파일에서 와야 한다 |
| `figma.sotPages` | strings | `[]` | apply | 이름이 붙은 SOT 페이지와 노드 ID, 예: `"11:500 Components"` |
| `figma.referenceFiles` | objects | `[]` | workflow, AGENTS | 읽기 전용 참고 파일: `{ "fileKey": "...", "name": "..." }` |
| `tokens.snapshot` | path | `design-system/figma-readback.json` | lint, figma-sync, 토큰 검사 | 커밋하는 Figma readback |
| `tokens.map` | path | `design-system/figma-token-map.json` | figma-sync, 토큰 검사, apply | Figma 이름 → 코드 토큰 매핑 |
| `tokens.dtcg` | path | `design-system/tokens.json` | 토큰 검사 | DTCG 토큰 |
| `tokens.dtcgRootGroup` | string | `""` | 토큰 검사 | CSS 이름을 만들기 전에 제거하는 그룹 (`tokens.surface-card` → `--surface-card`) |
| `tokens.typography` | path 또는 null | `null` | 토큰 검사 | `@utility <name> {}` 또는 `.<name> {}` 블록이 있는 CSS. 텍스트 스타일을 매핑하면 필수 |
| `tokens.sources` | paths | `[]` | figma-sync, apply | 손으로 고치는 토큰 원천 |
| `tokens.remPx` | number | `16` | 토큰 검사 | `rem` 하나당 픽셀 수 |
| `commands.tokenCheck` | string 또는 null | `null` (내장 검사) | figma-sync, apply | 프로젝트의 토큰 검사 명령 |
| `commands.tokenExport` | string 또는 null | `null` | figma-sync | `tokens.dtcg`를 다시 생성한다. `null`이면 손으로 관리한다는 뜻이다 |
| `gates` | strings | `[]` | apply | 단계를 커밋하기 전에 통과해야 하는 명령 |
| `acceptance.doc` | path pattern | `tests/acceptance/<goal>/README.md` | apply | 목표의 인수 문서가 있는 위치 |
| `testPolicy` | `repository` 또는 `acceptance-gates` | `repository` | apply | `acceptance-gates`는 새 단위 테스트를 금지하고 인수 문서와 게이트에 의존한다. `repository`는 저장소 자체의 테스트 규칙을 따른다 |
| `apply.waves` | strings | `[]` | apply | 단계 순서, 예: `["shared icons", "L1 base", "L2 shell", "L3 chat"]` |
| `apply.sharedFiles` | paths | `[]` | apply | 단계 통합 담당만 고치는 파일 (로캘 카탈로그, 레지스트리) |
| `apply.locales` | strings | `[]` | apply | 새 UI 문자열을 위한 로캘 키. 카탈로그가 없으면 비어 있다 |
| `apply.storyIds` | path 또는 null | `null` | apply | story-id 레지스트리가 있다면 그 경로 |
| `apply.componentMap` | path 또는 null | `null` | apply | Figma 노드 → 컴포넌트 매핑이 있다면 그 경로 |
| `apply.integrationChecks` | strings | `[]` | apply | 통합 담당이 실행하는 추가 검사 |

lint는 자신이 읽는 키와 `testPolicy`, `gates`, `acceptance.doc`을 검증하고, 토큰 검사는 `tokens`와 `figma.fileKey` 키를 검증한다. 나머지 키는 스킬이 읽는다.

### 토큰 맵

토큰 검사는 `tokens.map`을 통해 스냅샷을 DTCG 토큰과 타이포그래피 원천에 대조한다.

```json
{
  "fileKey": "<same key as the snapshot>",
  "spacingBase": "--spacing",
  "fontFamilies": { "Pretendard": "Pretendard" },
  "fontWeights": { "Book": 450 },
  "variables": {
    "surface/card": { "css": "--surface-card" },
    "radius/sm": { "token": "radius.sm" },
    "space/2": { "spacing": 2 },
    "radius/pill": { "utility": "rounded-full" },
    "white": { "skip": "primitive; reached through aliases" }
  },
  "textStyles": { "Text/Body": { "utility": "type-body" } },
  "effectStyles": { "Effect/Card": { "css": "--shadow-card" } },
  "paintStyles": { "Surface/Sidebar Gradient": { "token": "gradient.sidebar" } }
}
```

`token`은 DTCG 경로이고 `css`는 그 경로에서 파생한 CSS 사용자 지정 속성이다. `{group.token}` 별칭은 값의 어디에서든 해석되며, 순환이나 대상이 없는 별칭은 보고한다. 모드가 여러 개인 변수는 `"name@Mode"`로 모드별로 매핑할 수 있다. 모든 Figma 항목에는 매핑이나 비어 있지 않은 `skip` 사유가 있어야 한다. 색은 hex 또는 sRGB DTCG 객체, 치수는 `px` 또는 `rem`, 그림자는 한 겹 또는 배열, 그라디언트는 stop 배열 또는 `{ "stops": [...] }`이다. 글꼴 패밀리는 유틸리티 스택의 첫 패밀리와 일치해야 하며 끝의 ` Variable`은 무시한다. CSS 이름이 다르면 `fontFamilies`가 Figma 패밀리 이름을 바꾼다.

## 스크립트

| 스크립트 | 목적 |
|---|---|
| `skills/review/scripts/design_spec_lint.mjs` | 링크, 앵커, 절대 경로, 인용된 제목, traceability 어휘·날짜·ID, 계획 이름, HANDOFF 날짜, 스냅샷 유효성. `--root <repo>`, `--config <file>`, `--strict`, `--format json`, `--self-test` (코드 14개) |
| `skills/figma-sync/scripts/figma-readback.plugin.js` | `PART`와 Figma 쪽 `counts`를 쓰는 읽기 전용 `use_figma` 스크립트. 연결된 파일 키 또는 `FILE_KEY`를 읽는다 |
| `skills/figma-sync/scripts/merge_readback.mjs` | 나눠 읽은 결과를 병합한다. 잘림, 구역 누락, 파일 섞임, 알 수 없는 파일 키를 거부한다. `--self-test`는 위 readback 스크립트를 모의 Figma에 대해 실행한다 |
| `skills/figma-sync/scripts/check_figma_tokens.mjs` | 별칭 해석을 포함한 일반 DTCG/타이포그래피/맵 대조. `--root <repo>`, `--config <file>`, `--self-test` |
| `skills/apply/scripts/check_templates.mjs` | Workflow 템플릿을 드라이런한다. `agent()` 호출에 명시적 `model`이 없거나 설정된 경로를 무시하면 실패한다 |

모든 스크립트는 Node 내장 모듈만 쓴다. 조사·단계 템플릿은 Claude Code Workflow 스크립트이며, Codex나 Workflow 도구가 없는 환경에서는 apply 스킬이 설명하는 대로 같은 단계를 하위 에이전트 위임으로 실행한다.

## 템플릿과 예제

`skills/workflow/references/templates/`에는 최소 작업 공간(`README`, `AGENTS`, `HANDOFF`, `decisions`, `## 상태 값` 표가 있는 `traceability`, `figma/figma-map`, `design-system/README`, `memories/plans/`), 계획 템플릿과 설정 템플릿이 있다. 프로젝트에 design-spec이 아직 없으면 workflow 스킬이 이를 복사한다. lint가 읽기 때문에 한국어 파서 단어(`상태`, `갱신`, `마지막 갱신:`, `진행 기록`, `기획 변경 대기`, 상태 값 단어)는 그대로 보존한다.

[`examples/design-spec`](../../../examples/design-spec)은 lint와 토큰 검사가 통과하는 최소 프로젝트이다. `npm run test:design`은 모든 자체 테스트, 템플릿 검사와 두 예제 검사를 실행한다.

## 한계

- 토큰 검사는 DTCG 파일과 타이포그래피 원천에 선언된 값을 비교한다. 렌더나 픽셀 검사가 아니며, 생성된 `tokens.dtcg`가 최신임을 증명하지도 않는다. 그것은 `commands.tokenExport` 또는 프로젝트 자체의 드리프트 검사로 확인한다.
- 타이포그래피 원천은 평평한 CSS 블록으로 파싱한다. 중첩 규칙, `@apply`, 계산된 캐스케이드는 평가하지 않는다.
- `figma.fileKey`는 Figma 호스트가 노출할 때 연결된 파일에서 가져온다. 그렇지 않으면 readback 스크립트에 `FILE_KEY`를 설정한다.

[한글 검토본](README.ko.md)과 `docs/ko-skills/aiwf-design/` 아래의 스킬 번역을 참고한다.
