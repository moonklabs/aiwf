---
name: review
description: Use when reviewing or validating docs/design-spec before a commit or PR, after renaming a heading or moving a file there, when design-spec links or traceability rows may be stale, or when a document claims something about the Figma file — "디자인 스펙 점검", "design-spec 리뷰", "링크 확인", "lint".
---

# design-spec review

Copyright 2026 moonklabs. Licensed under Apache-2.0; see the plugin LICENSE and NOTICE.

Run the structural check (script) and the judgment check (list below) separately. Review is a separate pass from writing. Designer-owned documents (`decisions.md`, `figma-map.md`, `memories/plans/`) are not edited without a request; only point out issues. Paths come from `design-spec.config.json` (schema in the plugin README). `<skills>` is the folder that holds this skill's folder.

## 1. Structural check

```bash
node <skills>/review/scripts/design_spec_lint.mjs            # 0 = no ERROR
node <skills>/review/scripts/design_spec_lint.mjs --strict   # before a commit or PR: WARN also fails
node <skills>/review/scripts/design_spec_lint.mjs --self-test
```

Run from the repository root (or pass `--root <repo>`); pass `--config <file>` when the config is not at `docs/design-spec/design-spec.config.json`. A missing or invalid config exits with 2 and names the expected file. The output is `path:line: SEVERITY CODE [element]: message` (the same shape as aiwf-core `spec_lint.py`). Code meanings and where to fix them are in [references/lint-codes.md](references/lint-codes.md). If you changed the script, confirm with `--self-test` that every code fires again. Check the AIWF planning documents themselves separately with aiwf-core:spec-review.

## 2. Judgment check

| Check | How |
|---|---|
| A document's assertion about Figma (e.g. "codeSyntax equals the CSS name") | Count it in the snapshot (`tokens.snapshot`). If only some match, change it to "only some" |
| Places where `decisions.md` and Figma differ | Compare decisions' rule sentences with snapshot values (e.g. the code font). List them; do not resolve them |
| `memories/plans/` cited as if it were the current source | The source must be decisions · figma-map · design-system documents |
| Figma value tables copied into other documents | Values come from Figma and tokens; documents only link |
| Whether planning or upper-level reference documents were edited in design-spec work | `git diff --stat -- <planning.requirements> <planning.useCases> <planning.testCases>` plus the glossary, product, architecture and vision documents |
| Whether HANDOFF reflects the last work | Compare with the progress log and traceability dates (`DS_HANDOFF_STALE`) |
| Sentences pointing at a renamed heading | With `DS_QUOTED_HEADING`, `grep -rn "<old heading>" <entryDocs> <specRoot>` |

## Report

Write ERROR and WARN with `file:line` and the fix; write judgment-check results with their evidence (snapshot values, grep output). Separate what you fixed from what you only pointed out. If you did not run a check, say that you did not run it.
