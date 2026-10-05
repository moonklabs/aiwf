---
name: trace
description: Use when a use case, requirement (FR/NFR/C) or acceptance criterion changed and design may be affected, when a design decision differs from the planning documents, when a new design unit (flow, screen, chat element) appears, or after design was applied to code — "기획 변경 반영", "traceability", "대응표", "기획 변경 대기".
---

# Planning ↔ design ↔ implementation trace

Copyright 2026 moonklabs. Licensed under Apache-2.0; see the plugin LICENSE and NOTICE.

`<specRoot>/traceability.md` is the only connection point. Planning documents and design documents never edit each other directly; they signal through the row states of this table. Paths come from `design-spec.config.json` (`specRoot`, `planning.*`; schema in the plugin README). `<skills>` is the folder that holds this skill's folder.

## Who changes what

| File | Changed by |
|---|---|
| `planning.requirements` · `planning.useCases` · `planning.testCases` | Planning (aiwf-core skills) |
| `traceability.md` rows | The side that caused the change |
| `HANDOFF.md` waiting list | The side that caused the change, one line |
| `decisions.md` · `figma/figma-map.md` · `memories/plans/` | The designer |

## How to edit a row

- **상태** uses only words from the `## 상태 값` table. Join several with ` · `. Put an explanation in parentheses after the word.
- **갱신** is the date the row was edited (today; check with `date +%F`). Change it whenever another column changed, even if the state stayed the same.
- The UC/FR/NFR/C IDs in the **기획** column must exist. Write ranges like `FR-008~009`.
- Overwrite the row. Do not accumulate past states inside it.

## When planning changed

1. Read the changed UC/FR source. If it is not on this branch, find out which branch or PR has it. Do not invent its wording.
2. Find every row containing the ID: `grep -n "UC-002\|FR-004" <specRoot>/traceability.md`. Also read rows whose range notation (`UC-001~003`) contains it.
3. Only rows whose design unit (screen, component) shows the changed flow are affected rows. Leave rows whose ID is merely inside a range without that flow. For an affected row, add `기획 변경 대기` to its state, write briefly in the 기획 column what changed, and set 갱신 to today.
4. Add one line to HANDOFF's `## 기획 변경 대기` section: `UC-002/FR-004 '<변경 요약>' → <디자인 단위> 재검토`. If the section does not exist, create it right above "아직 결정 안 된 것". The designer deletes the line once handled.
5. Do not touch `decisions.md`, Figma or `memories/plans/`. Design decisions belong to the designer.
6. When aiwf-spec:sync-docs is in use, list these rows in its report as well.

## When design differs from planning

Set the row state to `기획 변경 필요` and add one line to HANDOFF's "아직 결정 안 된 것". When planning creates a new ID with aiwf-core, link it in the 기획 column and remove `기획 변경 필요`. A new design unit without a matching UC stays `기획 없음`.

## After applying to code

Change only the implementation column and the state (`구현: 새 디자인`). When a person confirms it in the real app, set `검증 완료` and add an evidence link.

## Check

```bash
node <skills>/review/scripts/design_spec_lint.mjs
```
Fix `DS_TRACE_STATUS`, `DS_TRACE_DATE` and `DS_DANGLING_REF`. Copy the `DS_QUEUE_DESIGN` (rows for the designer) and `DS_QUEUE_PLANNING` (rows for planning to decide) lists into the report as they are.
