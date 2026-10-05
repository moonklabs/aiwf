# 기획 ↔ 디자인 ↔ 구현 추적

> 휴먼 리뷰용 한글 번역입니다. 실행 원문: [원문](../../../../../plugins/aiwf-design/skills/trace/SKILL.md). 번역과 자동 검사는 승인을 뜻하지 않으며, 검토 상태와 원문 SHA256은 [관리 목록](../../../manifest.json)에서 확인합니다.

**식별자:** `trace`

**설명:** 유스케이스, 요구사항(FR/NFR/C) 또는 인수 기준이 바뀌어 디자인에 영향이 있을 수 있을 때, 디자인 결정이 기획 문서와 다를 때, 새 디자인 단위(흐름, 화면, 채팅 요소)가 생길 때, 또는 디자인을 코드에 적용한 뒤에 사용한다. "기획 변경 반영", "traceability", "대응표", "기획 변경 대기".

Copyright 2026 moonklabs. Apache-2.0 라이선스. 플러그인의 LICENSE와 NOTICE를 참조한다.

`<specRoot>/traceability.md`가 유일한 연결점이다. 기획 문서와 디자인 문서는 서로를 직접 고치지 않고, 이 표의 행 상태로 신호를 보낸다. 경로는 `design-spec.config.json`(`specRoot`, `planning.*`)에서 가져온다(스키마는 [플러그인 README](../../../../../plugins/aiwf-design/README.md), [한글 검토본](../../README.ko.md)). `<skills>`는 이 스킬의 폴더를 담은 폴더이다.

## 누가 무엇을 고치나

| 파일 | 고치는 쪽 |
|---|---|
| `planning.requirements` · `planning.useCases` · `planning.testCases` | 기획 (aiwf-core 스킬) |
| `traceability.md` 행 | 변경을 일으킨 쪽 |
| `HANDOFF.md` 대기 목록 | 변경을 일으킨 쪽, 한 줄 |
| `decisions.md` · `figma/figma-map.md` · `memories/plans/` | 디자이너 |

## 행 고치는 법

- **상태**는 `## 상태 값` 표의 단어만 쓴다. 여러 개는 ` · `로 잇는다. 설명은 단어 뒤 괄호에 쓴다.
- **갱신**은 행을 고친 날짜이다(오늘, `date +%F`로 확인). 상태가 그대로여도 다른 열이 바뀌었으면 고친다.
- **기획** 열의 UC/FR/NFR/C ID는 실제로 존재해야 한다. 범위는 `FR-008~009`처럼 쓴다.
- 행을 덮어쓴다. 과거 상태를 행 안에 쌓지 않는다.

## 기획이 바뀌었을 때

1. 바뀐 UC/FR 원문을 읽는다. 이 브랜치에 없으면 어느 브랜치나 PR에 있는지 알아본다. 그 문구를 지어내지 않는다.
2. 그 ID가 들어 있는 행을 모두 찾는다: `grep -n "UC-002\|FR-004" <specRoot>/traceability.md`. 범위 표기(`UC-001~003`) 안에 그 ID가 든 행도 읽는다.
3. 바뀐 흐름이 디자인 단위(화면, 컴포넌트)에 나타나는 행만 영향 행이다. ID가 범위 안에 있을 뿐 그 흐름이 없는 행은 그대로 둔다. 영향 행은 상태에 `기획 변경 대기`를 더하고, 기획 열에 무엇이 바뀌었는지 짧게 적고, 갱신을 오늘로 바꾼다.
4. HANDOFF의 `## 기획 변경 대기` 절에 한 줄을 추가한다: `UC-002/FR-004 '<변경 요약>' → <디자인 단위> 재검토`. 절이 없으면 "아직 결정 안 된 것" 바로 위에 만든다. 디자이너가 처리하면 그 줄을 지운다.
5. `decisions.md`, Figma, `memories/plans/`는 건드리지 않는다. 디자인 결정은 디자이너의 몫이다.
6. aiwf-spec:sync-docs를 쓰는 중이면 이 행들을 그 보고에도 적는다.

## 디자인이 기획과 다를 때

행 상태를 `기획 변경 필요`로 하고 HANDOFF의 "아직 결정 안 된 것"에 한 줄을 추가한다. 기획 쪽이 aiwf-core로 새 ID를 만들면 기획 열에 연결하고 `기획 변경 필요`를 제거한다. 대응하는 UC가 없는 새 디자인 단위는 `기획 없음`으로 둔다.

## 코드에 적용한 뒤

구현 열과 상태(`구현: 새 디자인`)만 바꾼다. 사람이 실제 앱에서 확인하면 `검증 완료`로 하고 증거 링크를 추가한다.

## 확인

```bash
node <skills>/review/scripts/design_spec_lint.mjs
```
`DS_TRACE_STATUS`, `DS_TRACE_DATE`, `DS_DANGLING_REF`를 고친다. `DS_QUEUE_DESIGN`(디자이너가 볼 행)과 `DS_QUEUE_PLANNING`(기획이 결정할 행) 목록은 그대로 보고에 옮긴다.
