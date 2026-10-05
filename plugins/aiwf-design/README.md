# AIWF Design

Skills, checks and templates for a designer-run design-spec workspace that sits next to the AIWF planning documents. The workspace connects to requirements and use cases only through `traceability.md`; Figma stays read-only unless the session's role is designer work.

Install `aiwf-core` first: this plugin declares it as a dependency, and its trace and review skills point at the core planning skills. `aiwf-spec` is optional; its `workflow` and `sync-docs` skills call `aiwf-design:trace` when a project has `docs/design-spec/traceability.md`.

## Skills

| Skill | Claude Code | Codex installation | Role |
|---|---|---|---|
| `skills/workflow` | `/aiwf-design:workflow` | `aiwf-design-workflow` | Router: picks one role per session, decides whether Figma may be written, starts a new workspace from the templates |
| `skills/figma-sync` | `/aiwf-design:figma-sync` | `aiwf-design-figma-sync` | Read-only Figma readback, split-read merge and the token check |
| `skills/apply` | `/aiwf-design:apply` | `aiwf-design-apply` | Read-only application of the Figma design to code: iron rules, rationalization table, red flags, survey and wave templates |
| `skills/trace` | `/aiwf-design:trace` | `aiwf-design-trace` | Traceability row states, dates and HANDOFF waiting lines when planning or design changes |
| `skills/review` | `/aiwf-design:review` | `aiwf-design-review` | Structural lint and the judgment checklist |

The Claude Code marketplace installs the plugin with its qualified commands. `aiwf install --design` and `node scripts/install-spec-skills.mjs --project <path> --design` add the five skills to a project as `aiwf-design-<name>` next to the default AIWF skills; existing skill folders are never overwritten. Installed copies rewrite `aiwf-design:<name>` references and sibling script paths to the installed names.

## Project configuration

Every project value lives in one file, `docs/design-spec/design-spec.config.json` by default. The scripts accept `--config <file>` for another location and stop with exit code 2 and the expected path when the file is missing or invalid. Start from [the template](skills/workflow/references/templates/design-spec.config.json). Paths are repository-relative and may not contain `..`.

| Key | Type | Default | Read by | Meaning |
|---|---|---|---|---|
| `version` | number | required: `1` | all | Schema version |
| `specRoot` | path | `docs/design-spec` | lint, all skills | The design-spec workspace |
| `entryDocs` | paths | `["README.md", "AGENTS.md"]` | lint | Repository documents whose links into `specRoot` are checked |
| `planning.requirements` | path | `docs/requirements.md` | lint, trace, review | Table whose first column holds FR/NFR/C IDs such as `FR-001` |
| `planning.useCases` | path | `docs/use_cases` | lint, trace, review | Folder of `UC-NNN-*.md` files |
| `planning.testCases` | path | `docs/test_cases` | trace, review | Test definitions (never edited by design work) |
| `plans.dir` | path | `memories/plans` | lint | Plan folder, relative to `specRoot` |
| `plans.toolDefaultDirs` | paths | `["docs/superpowers/plans"]` | lint | Default output folders of planning tools that must stay unused |
| `figma.fileKey` | string | `""` | readback, token check, lint, apply | The SOT Figma file; when set, the snapshot must come from it |
| `figma.sotPages` | strings | `[]` | apply | SOT page and node IDs with names, e.g. `"11:500 Components"` |
| `figma.referenceFiles` | objects | `[]` | workflow, AGENTS | Read-only reference files: `{ "fileKey": "...", "name": "..." }` |
| `tokens.snapshot` | path | `design-system/figma-readback.json` | lint, figma-sync, token check | Committed Figma readback |
| `tokens.map` | path | `design-system/figma-token-map.json` | figma-sync, token check, apply | Figma name → code token map |
| `tokens.dtcg` | path | `design-system/tokens.json` | token check | DTCG tokens |
| `tokens.dtcgRootGroup` | string | `""` | token check | Group removed before deriving CSS names (`tokens.surface-card` → `--surface-card`) |
| `tokens.typography` | path or null | `null` | token check | CSS with `@utility <name> {}` or `.<name> {}` blocks; required when text styles are mapped |
| `tokens.sources` | paths | `[]` | figma-sync, apply | Hand-edited token sources |
| `tokens.remPx` | number | `16` | token check | Pixels per `rem` |
| `commands.tokenCheck` | string or null | `null` (the bundled check) | figma-sync, apply | The project's token check command |
| `commands.tokenExport` | string or null | `null` | figma-sync | Regenerates `tokens.dtcg`; `null` means it is maintained by hand |
| `gates` | strings | `[]` | apply | Commands that must pass before a wave is committed |
| `acceptance.doc` | path pattern | `tests/acceptance/<goal>/README.md` | apply | Where a goal's acceptance document lives |
| `testPolicy` | `repository` or `acceptance-gates` | `repository` | apply | `acceptance-gates` forbids new unit tests and relies on the acceptance document and gates; `repository` follows the repository's own test rules |
| `apply.waves` | strings | `[]` | apply | Wave order, e.g. `["shared icons", "L1 base", "L2 shell", "L3 chat"]` |
| `apply.sharedFiles` | paths | `[]` | apply | Files only the wave integrator edits (locale catalogs, registries) |
| `apply.locales` | strings | `[]` | apply | Locale keys for new UI strings; empty when there is no catalog |
| `apply.storyIds` | path or null | `null` | apply | Story-id registry, if any |
| `apply.componentMap` | path or null | `null` | apply | Figma node → component map, if any |
| `apply.integrationChecks` | strings | `[]` | apply | Extra checks the integrator runs |

The lint validates the keys it reads plus `testPolicy`, `gates` and `acceptance.doc`; the token check validates the `tokens` and `figma.fileKey` keys. Skills read the remaining keys.

### Token map

The token check compares the snapshot with the DTCG tokens and typography source through `tokens.map`:

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

`token` is a DTCG path and `css` a custom property derived from that path. `{group.token}` aliases resolve anywhere in a value, and cycles or dangling targets are reported. Multi-mode variables can be mapped per mode as `"name@Mode"`. Every Figma item needs a mapping or a non-empty `skip` reason. Colors are hex or sRGB DTCG objects, dimensions `px` or `rem`, shadows one layer or an array, and gradients a stop array or `{ "stops": [...] }`. A font family matches the first family of the utility's stack, ignoring a trailing ` Variable`; `fontFamilies` renames a Figma family when the CSS name differs.

## Scripts

| Script | Purpose |
|---|---|
| `skills/review/scripts/design_spec_lint.mjs` | Links, anchors, absolute paths, quoted headings, traceability vocabulary, dates and IDs, plan names, HANDOFF date, snapshot validity. `--root <repo>`, `--config <file>`, `--strict`, `--format json`, `--self-test` (14 codes) |
| `skills/figma-sync/scripts/figma-readback.plugin.js` | Read-only `use_figma` script with `PART` and Figma-side `counts`; reads the connected file key or `FILE_KEY` |
| `skills/figma-sync/scripts/merge_readback.mjs` | Merges split reads; rejects cut-off, missing-section, mixed-file and unknown-file-key reads. `--self-test` runs the readback script above against a mock Figma |
| `skills/figma-sync/scripts/check_figma_tokens.mjs` | Generic DTCG/typography/map comparison with alias resolution. `--root <repo>`, `--config <file>`, `--self-test` |
| `skills/apply/scripts/check_templates.mjs` | Dry-runs the Workflow templates; fails when an `agent()` call has no explicit `model` or ignores configured paths |

All scripts use built-in Node modules only. The survey and wave templates are Claude Code Workflow scripts; in Codex or without the Workflow tool, run the same stages through subagent delegation, as the apply skill describes.

## Templates and example

`skills/workflow/references/templates/` holds the minimal workspace (`README`, `AGENTS`, `HANDOFF`, `decisions`, `traceability` with the `## 상태 값` table, `figma/figma-map`, `design-system/README`, `memories/plans/`), a plan template and the config template. The workflow skill copies them when a project has no design-spec yet. Korean parser words (`상태`, `갱신`, `마지막 갱신:`, `진행 기록`, `기획 변경 대기`, the 상태 값 words) are preserved because the lint reads them.

[`examples/design-spec`](../../examples/design-spec) is a minimal project whose lint and token check pass. `npm run test:design` runs every self-test, the template check and both example checks.

## Limits

- The token check compares declared values in the DTCG file and typography source. It is not a render or pixel check, and it does not prove that a generated `tokens.dtcg` is current; run `commands.tokenExport` or the project's own drift check for that.
- Typography sources are parsed as flat CSS blocks; nested rules, `@apply` and computed cascades are not evaluated.
- `figma.fileKey` comes from the connected file when the Figma host exposes it; otherwise set `FILE_KEY` in the readback script.

See the [Korean review copy](../../docs/ko-skills/aiwf-design/README.ko.md) and the skill translations under `docs/ko-skills/aiwf-design/`.
