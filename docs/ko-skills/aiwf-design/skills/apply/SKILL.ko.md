# Figma 디자인을 코드에 적용

> 휴먼 리뷰용 한글 번역입니다. 실행 원문: [원문](../../../../../plugins/aiwf-design/skills/apply/SKILL.md). 번역과 자동 검사는 승인을 뜻하지 않으며, 검토 상태와 원문 SHA256은 [관리 목록](../../../manifest.json)에서 확인합니다.

**식별자:** `apply`

**설명:** Figma 디자인(컴포넌트, 셸, 채팅 UI)을 앱 코드, Storybook 또는 현재 화면에 적용할 때 사용한다. "디자인 적용", "피그마대로 코드 맞춰", "컴포넌트를 피그마에 맞게", "Storybook 디자인 갱신". 특히 요청에 Figma 수정, 디자인 충돌 또는 마감 기한 언급이 함께 있을 때 사용한다.

Copyright 2026 moonklabs. Apache-2.0 라이선스. 플러그인의 LICENSE와 NOTICE를 참조한다.

**필수 배경:** 먼저 aiwf-design:workflow로 역할이 "적용"임을 확인한다. 이 역할에서 Figma는 읽기 전용이다.

프로젝트 값은 `design-spec.config.json`에서 가져온다(스키마는 [플러그인 README](../../../../../plugins/aiwf-design/README.md), [한글 검토본](../../README.ko.md)). `figma.fileKey`와 `figma.sotPages`, `acceptance.doc`, `gates`, `commands.tokenCheck`, `testPolicy`, `apply.waves`가 있다. `<skills>`는 이 스킬의 폴더를 담은 폴더이다.

## 철칙

1. **Figma에 쓰지 않는다.** `use_figma`는 읽기 스크립트만 실행한다(생성, 속성 대입, `setProperties`, 삭제 금지). 같은 메시지로 요청된 Figma 변경은 "디자이너 전달 목록"에 올리고 별도 작업으로 확인받는다. design-spec `AGENTS.md`의 "파일 전체 수정 허용"은 디자이너 작업 역할의 규칙이다.
2. **구현된 기능만** 새 디자인을 적용한다. 존재하지 않는 기능의 화면은 만들지 않는다. Figma에 없는 구현된 기능(예: 자동화나 스킬 메뉴)은 삭제하지 않고 가장 가까운 Figma 컴포넌트로 다듬는다.
3. **기존 코드를 먼저 찾는다.** 같은 역할의 컴포넌트가 있으면 그것을 고친다. 새 파일로 평행 컴포넌트를 만들지 않는다.
4. **토큰과 타이포그래피 유틸리티(`type-*` 등)만 쓴다.** Figma 값에 토큰이 없으면 aiwf-design:figma-sync로 토큰부터 만든다. 정말 토큰이 없는 값은 Figma 노드 ID를 주석으로 남긴다.
5. **저장소 테스트 정책(`testPolicy`)을 따른다.** `acceptance-gates`에서는 단위 테스트를 추가하지 않는다. `repository`에서는 저장소 자체의 테스트 규칙을 따른다. 둘 다 목표의 인수 문서(`acceptance.doc`)를 먼저 쓰고 게이트(`gates`, 토큰 검사 포함)로 검증한다.
6. **충돌은 기록한다.** decisions.md와 Figma의 차이, 화면 문구나 폭 같은 결정은 인수 문서의 "적용 결정" 표에 적는다. 사용자 지시가 없으면 Figma를 따르고 `확인 필요`를 붙인다. `decisions.md`는 고치지 않는다.
7. **모든 에이전트에 모델을 정한다.** 조사와 검증은 opus, 구현·수정·통합은 sonnet, 기계적 정리는 haiku.

## 순서

1. 인수 문서는 코드를 바꾸기 전에 쓴다. 첫 파일 편집으로 하고, 진행 기록에 `진행 중` 행을 먼저 넣은 뒤 게이트 뒤에 완성한다. 작업이 기존 목표에 속하면(`acceptance.doc`에 맞는 기존 문서와 traceability의 링크를 확인한다) 그 목표의 문서를 갱신하고, 새 목표일 때만 새 `<goal>`을 만든다. SOT 페이지와 노드, 범위, 적용 결정, 디자이너 전달 목록, 진행 기록을 적는다.
2. 토큰 검사: `commands.tokenCheck`. 설정이 없거나 실행되지 않으면(예: 의존성 없음) 대신 `node <skills>/figma-sync/scripts/check_figma_tokens.mjs`를 실행하고 어느 쪽을 실행했는지 밝힌다. 실패하면 먼저 aiwf-design:figma-sync를 실행한다.
3. 조사 (읽기 전용): 컴포넌트 묶음마다 Figma 실측 스펙 → 코드 대상 → 차이 목록, 그다음 완결성 비평. [references/survey-template.js](../../../../../plugins/aiwf-design/skills/apply/references/survey-template.js)
4. `apply.waves` 순서대로 단계별로 적용한다(예: 공용 아이콘 → L1 기본 → L2 셸 → L3 채팅). 묶음마다 구현 → 적대적 검증 → 수정을 하고, 각 단계 끝에 통합한다(i18n, story id, 컴포넌트 맵, 다른 파일 요청). 각 파일은 한 묶음만 소유한다. [references/wave-template.js](../../../../../plugins/aiwf-design/skills/apply/references/wave-template.js)
5. 게이트를 통과한 뒤 그 단계의 파일만 커밋한다. 진행 중인 단계의 파일은 커밋하지 않는다. 커밋은 임시 `git worktree add --detach`에서 다시 검사한다.
6. traceability 구현 열과 상태를 갱신하고(aiwf-design:trace) 인수 문서의 진행 기록을 갱신한다. `구현: 새 디자인`은 게이트를 통과한 작업에만 쓰고, 그렇지 않으면 미검증 범위를 기록한다.

Workflow 도구는 사용자가 워크플로우를 명시적으로 요청할 때만 사용한다. 그 밖에는 같은 구조를 Agent 도구로 실행한다. 두 템플릿은 Claude Code Workflow 스크립트이며, 그 `args`는 설정에서 만든다. Codex나 Workflow 도구가 없는 호스트에서는 같은 프롬프트, 모델, 파일 소유권으로 하위 에이전트에 위임해 같은 단계를 실행하고, 위임이 불가능하면 직접 순서대로 실행하며, 어느 경로로 실행했는지 보고한다. 템플릿을 바꾼 뒤에는 `node <skills>/apply/scripts/check_templates.mjs`를 실행한다. `agent()` 호출에 명시적 모델이 없거나 설정된 경로를 무시하면 이 검사가 실패한다.

## 합리화 표

| 핑계 | 실제 |
|---|---|
| "design-spec AGENTS.md가 Figma 수정을 허용한다던데" | 그것은 디자이너 작업 역할의 규칙이다. 적용 역할은 읽기 전용이다 |
| "사용자가 같은 메시지에서 고쳐 달라고 했다" | 분리해서 전달 목록에 올리고 확인받는다 |
| "decisions.md에 없으니 한 줄 추가하자" | decisions에는 사용자 확정만 들어간다. 적용 결정 표를 쓴다 |
| "테스트 먼저가 원칙이다" | `testPolicy`를 따른다. `acceptance-gates`에서는 단위 테스트가 금지다: 인수 문서와 게이트 |
| "새로 만드는 게 빠르다" | 기존 컴포넌트를 고친다. 소비처가 계속 동작한다 |
| "Figma에 이 메뉴가 없으니 뺀다" | 구현된 기능은 절대 삭제하지 않는다 |
| "리터럴 값 하나쯤은 괜찮다" | 토큰을 먼저 만든다 |

## 빨간 신호

`use_figma` 스크립트에 대입문이 보인다 · `acceptance-gates`에서 새 단위 테스트 파일(`*.test.ts` 등) · 같은 역할의 파일이 있는데 새 컴포넌트 파일 · `#` 색 리터럴 추가 · 인수 문서 없이 구현 시작 · 변경 전후 비교에 `git stash`나 `git checkout` 사용 (대신 `git worktree add --detach HEAD`) · 두 묶음이 같은 파일을 고친다. → 멈추고 위 순서로 돌아간다.
