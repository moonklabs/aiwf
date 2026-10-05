---
name: apply
description: Use when applying the Figma design (components, shell, chat UI) to the app code, Storybook, or current screens — "디자인 적용", "피그마대로 코드 맞춰", "컴포넌트를 피그마에 맞게", "Storybook 디자인 갱신" — especially when the request also mentions fixing Figma, a design conflict, or a deadline.
---

# Apply the Figma design to code

Copyright 2026 moonklabs. Licensed under Apache-2.0; see the plugin LICENSE and NOTICE.

**REQUIRED BACKGROUND:** first confirm with aiwf-design:workflow that the role is "apply". In this role Figma is read-only.

Project values come from `design-spec.config.json` (schema in the plugin README): `figma.fileKey` and `figma.sotPages`, `acceptance.doc`, `gates`, `commands.tokenCheck`, `testPolicy`, `apply.waves`. `<skills>` is the folder that holds this skill's folder.

## Iron rules

1. **Never write to Figma.** `use_figma` runs read scripts only (no create, no property assignment, no `setProperties`, no delete). A Figma change requested in the same message goes on the "디자이너 전달 목록" and is confirmed as separate work. "Editing the whole file is allowed" in the design-spec `AGENTS.md` is a rule of the designer-work role.
2. **Only implemented features** get the new design. Do not build screens for features that do not exist. Do not delete implemented features that Figma lacks (for example automation or skill menus); refine them with the closest Figma component.
3. **Find the existing code first.** If a component with the same role exists, change it. Do not create a parallel component in a new file.
4. **Use tokens and typography utilities only** (such as `type-*`). If a Figma value has no token, create the token first with aiwf-design:figma-sync. For a value that truly has no token, leave the Figma node ID in a comment.
5. **Follow the repository test policy** (`testPolicy`). Under `acceptance-gates` do not add unit tests. Under `repository`, follow the repository's own test rules. In both, write the goal's acceptance document (`acceptance.doc`) first and verify with the gates (`gates`, including the token check).
6. **Record conflicts.** Differences between decisions.md and Figma, and decisions such as screen copy or widths, go in the acceptance document's "적용 결정" table. Without a user instruction, follow Figma and mark it `확인 필요`. Do not edit `decisions.md`.
7. **Choose a model for every agent.** Research and verification opus, implementation, fixes and integration sonnet, mechanical cleanup haiku.

## Order

1. Acceptance document, written before any code change: make it your first file edit, with a 진행 기록 row marked `진행 중` that you complete after the gates. If the work falls within an existing goal (check the existing documents that match `acceptance.doc` and the links in traceability), update that goal's document; create a new `<goal>` only for a new goal. Record SOT pages and nodes, scope, 적용 결정, 디자이너 전달 목록, 진행 기록.
2. Token check: `commands.tokenCheck`. If it is unset or cannot start (for example missing dependencies), run `node <skills>/figma-sync/scripts/check_figma_tokens.mjs` instead and say which one ran. If it fails, run aiwf-design:figma-sync first.
3. Survey (read-only): per component group, measured Figma spec → code targets → difference list, then a completeness critic. [references/survey-template.js](references/survey-template.js)
4. Apply wave by wave in the order of `apply.waves` (for example shared icons → L1 base → L2 shell → L3 chat). Per group implement → adversarial verification → fix; at the end of each wave integrate (i18n, story ids, component map, requests to other files). Each file is owned by one group only. [references/wave-template.js](references/wave-template.js)
5. After the gates pass, commit only that wave's files. Do not commit files of a wave in progress. Recheck the commit in a temporary `git worktree add --detach`.
6. Update the traceability implementation column and status (aiwf-design:trace) and the acceptance document's progress log. Use `구현: 새 디자인` only for work whose gates passed; otherwise record what is unverified.

Use the Workflow tool only when the user explicitly asks for a workflow. Otherwise run the same structure with the Agent tool. The two templates are Claude Code Workflow scripts; build their `args` from the config. In Codex or any host without the Workflow tool, run the same stages by delegating to subagents with the same prompts, models and file ownership, or run them in order yourself when delegation is unavailable, and report which route ran. After changing a template, run `node <skills>/apply/scripts/check_templates.mjs`; it fails when an `agent()` call has no explicit model or ignores the configured paths.

## Rationalization table

| Excuse | Reality |
|---|---|
| "The design-spec AGENTS.md says Figma edits are allowed" | That is the designer-work role's rule. The apply role is read-only |
| "The user asked to fix it in the same message" | Split it out, put it on the hand-off list and get confirmation |
| "It's not in decisions.md, so add a line" | decisions holds user confirmations only. Use the 적용 결정 table |
| "Tests first is the rule" | Follow `testPolicy`. Under `acceptance-gates` unit tests are forbidden: acceptance document and gates |
| "Building it new is faster" | Change the existing component. Its consumers keep working |
| "Figma doesn't have this menu, so drop it" | Never delete implemented features |
| "One literal value is fine" | Create the token first |

## Red flags

An assignment appears in a `use_figma` script · a new unit test file (such as `*.test.ts`) under `acceptance-gates` · a new component file while a file with the same role exists · an added `#` color literal · implementation started without an acceptance document · `git stash` or `git checkout` used to compare before and after (use `git worktree add --detach HEAD` instead) · two groups edit the same file. → Stop and return to the order above.
