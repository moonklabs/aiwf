---
name: workflow
description: Use when a request touches the design-spec workspace (docs/design-spec), the Figma design file, design tokens, or how planning (UC/FR) relates to design — including "디자인 스펙", "피그마", "디자인 시스템", "traceability", "디자인 적용", "토큰 동기화", "HANDOFF", "decisions" — and before deciding whether Figma may be written in this session.
---

# design-spec workflow (router)

Copyright 2026 moonklabs. Licensed under Apache-2.0; see the plugin LICENSE and NOTICE.

The design-spec workspace is run by the designer. It connects to the upper-level AIWF planning documents (requirements · use_cases · test_cases) only through `traceability.md`. **Before starting, pick exactly one role for this session.** The role decides whether Figma may be written and which files may be changed.

## Project config

Every project value comes from `docs/design-spec/design-spec.config.json` (or the config path the user names): `specRoot`, entry documents, planning document paths, the Figma file key and SOT pages, token sources, check commands, gates, the acceptance document location and the test policy. The schema and defaults are in the plugin README. Read it before acting and never guess these values. If it is missing, say so and stop or start from the templates below; the bundled scripts exit with a configuration error rather than assume a layout.

`<skills>` below is the folder that holds this skill's folder (this plugin's skills, or the project's installed skills folder).

### No design-spec yet: start from the templates

1. Confirm with the user that a design-spec workspace should be created and where (default `docs/design-spec/`).
2. Copy [references/templates/design-spec/](references/templates/design-spec/) there without overwriting any existing file, and copy [references/templates/design-spec.config.json](references/templates/design-spec.config.json) to `<specRoot>/design-spec.config.json`. A plan starts from [references/templates/plan.md](references/templates/plan.md) as `memories/plans/YYYY-MM-DD-<name>.md`.
3. Fill the config from facts only: the Figma file key and SOT pages from the user or a Figma URL, token sources, commands and gates from the repository. Leave unknown values empty and list them as open questions; do not invent them. Replace the `YYYY-MM-DD` placeholders in the copied documents with today's date.
4. Run the lint (aiwf-design:review) and report its actual result.

## Pick the role

| Request | Role | Figma | Next |
|---|---|---|---|
| Create or change Figma screens or components; record decisions, IDs or plans | Designer work | Write (only when this work itself was requested) | `<specRoot>/AGENTS.md`, figma:figma-use |
| Align code tokens with changed Figma variables or styles | Sync | Read-only | aiwf-design:figma-sync |
| Apply the Figma design to code, Storybook or app screens | Apply | Read-only | aiwf-design:apply |
| A UC/FR/constraint changed, or a design decision differs from planning | Trace | — | aiwf-design:trace (+ aiwf-spec:sync-docs) |
| Check the design-spec documents, or before a commit | Review | Read-only | aiwf-design:review |

## Mixed requests

- One session takes one role. If "while you're at it, fix Figma too" arrives during sync or apply, finish the current work read-only. Record the Figma change in the acceptance document's "디자이너 전달 목록". Add a line to HANDOFF as well, unless the repository's instructions keep this role out of the design-spec documents; then state in the report that the designer must carry it into HANDOFF. Ask the user whether to run it as separate designer work.
- When `decisions.md` and Figma differ, do not pick one. Record the difference and ask for a decision. `decisions.md` holds only what the user confirmed.
- Do not change the planning documents (requirements · use_cases · test_cases) or the other upper-level reference documents (such as the glossary, product, architecture and vision documents) in design-spec work. Report a needed change instead.

## What is the source of truth

| What | Source |
|---|---|
| Values and component shapes | The Figma working file (config `figma.fileKey`, IDs in `figma/figma-map.md`) |
| Rules and confirmed decisions | `decisions.md` |
| Current planning ↔ design ↔ implementation state | `traceability.md` |
| What to do now | `HANDOFF.md` |
| History of past work (not a source) | `memories/plans/` |

## Quick commands

```bash
node <skills>/review/scripts/design_spec_lint.mjs              # documents, links, traceability
node <skills>/figma-sync/scripts/check_figma_tokens.mjs        # Figma snapshot ↔ code tokens
```

Run them from the repository root; pass `--config <file>` when the config is not at the default path. Use the config's `commands.tokenCheck` instead of the second line when the project defines its own token check; if that command cannot start, fall back to the second line and say so.

## Stop when

The chosen role's deliverable exists, and the lint and the role's checks were actually run with their results and remaining differences reported. If a Figma change went onto the "디자이너 전달 목록" without a HANDOFF line, the report says that the designer must carry it into HANDOFF. Render and visual inspection happen only when the user asks; otherwise record them as unverified.
