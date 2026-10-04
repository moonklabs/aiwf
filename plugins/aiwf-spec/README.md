# AIWF Spec

The AIWF workflow wrapper for the AIUP-derived methodology core. It adds AIWF's `workflow` and `sync-docs` skills; the upstream skills live in the sibling [aiwf-core](../aiwf-core) plugin.

## Contents

- `skills/workflow` - AIWF's own skill: host-neutral task tracking, documentation synchronization before completion, explicit evidence/approval boundaries and the future Sprintable handoff.
- `skills/sync-docs` - Synchronize affected use cases, rules, test definitions, data models and usage guides after scoped development; preserve unmet requirements and unintended code/spec differences. These two skills have no upstream counterpart.
- `LICENSE` and `NOTICE` (Apache-2.0).

The seven upstream skills (requirements, entities, use cases, journeys, reverse engineering, specification review) are no longer in this plugin. They were moved unchanged into [aiwf-core](../aiwf-core/README.md); the exact source commit, original hashes and the single NOTICE attribution change are recorded in the core [UPSTREAM.json](../aiwf-core/UPSTREAM.json). This plugin has no `UPSTREAM.json` of its own.

Canonical project artifacts are `docs/vision.md`, `requirements.md`, `glossary.md`, `entity_model.md`, `use_cases.puml`, `use_cases/UC-*.md`, `test_cases/TC-*.md`, and optional `processes/*.bpmn`. Keep English structural headings/status tokens; bodies may be Korean. Structural lint does not guarantee Korean semantic completeness. The structural checker is `aiwf-core/skills/spec-review/scripts/spec_lint.py`.

Claude Code installs the marketplace's `aiwf-core` (required) and `aiwf-spec` (wrapper) entries. Codex receives complete skill folders through `scripts/install-spec-skills.mjs`, which installs the core seven plus `workflow` and `sync-docs` by default; installed names are prefixed `aiwf-`. File installation is tested; live host skill discovery/model execution is a separate validation gate. No MCP server is installed automatically.

## Synchronize documents after development

Claude Code calls `/aiwf-spec:sync-docs`; Codex's project installer names it `aiwf-sync-docs`. Supply the change intent, comparison revision or current change scope, and the affected UC if known. It updates only relevant documents and reports implementation gaps and checks actually run. It does not fix code or turn observed bugs into accepted policy. The `workflow` skill uses it before completing implementation.

For a standalone installation, the [official skills CLI](https://github.com/vercel-labs/skills#install-a-skill) supports local paths, skill selection and agent selection:

```bash
npx skills add /path/to/aiwf/plugins/aiwf-spec --skill sync-docs --agent codex
npx skills add /path/to/aiwf/plugins/aiwf-spec --skill sync-docs --agent claude-code
```

These are alternatives run from the consuming project with the actual checkout path. The skills CLI keeps the name `sync-docs`; the AIWF project installer prefixes it. After this change reaches the remote default branch, the same skill can be selected from `https://github.com/moonklabs/aiwf`. The project installer refuses existing destinations; it does not upgrade old installations automatically. Document synchronization itself needs no CLI binary, model runtime or automatic cross-CLI delegation. Canonical AIWF documents use the companion core formats and validators. See the [Korean skill review](../../docs/ko-skills/aiwf-spec/skills/sync-docs/SKILL.ko.md) and [brownfield/greenfield guide](../../docs/modernization/BROWNFIELD-GREENFIELD.ko.md).

The `workflow` skill assumes the repository CLI `src/cli/spec-cli.js` (npm bin `aiwf-spec`) for initialization, pins, drift detection and evidence packets; installing the marketplace plugin alone does not install that binary. The CLI does not invoke an AI model, execute application checks, publish to Sprintable, or grant approval. See the repository [Korean guide](../../docs/modernization/DIRECTION.ko.md).

The [CLI productivity analysis (Korean)](../../docs/modernization/CLI-PRODUCTIVITY.ko.md) proposes a real use-case pilot before read-only verification and optional checks linked to versioned execution records, with synchronized documentation at every step. These extensions remain proposals and do not change the installed workflow or current CLI commands.

The [two-session Claude plan review (Korean)](../../docs/modernization/CLAUDE-PLAN-REVIEW-2026-10-03.ko.md) records a conditional suitability assessment and the pilot criteria and execution-contract concerns raised at the reviewed version. It is an AI review, not human approval or implementation validation.

The revised [pilot plan (Korean)](../../docs/modernization/PILOT-UC-001.ko.md) defines completion criteria, pinned UC/check mapping and human review records. The [local execution result (Korean)](../../docs/modernization/PILOT-RESULT-2026-10-03.ko.md) preserves baseline, failing and passing service checks, spec drift refusal and separate packets. This is a worked example; actual product adoption, human acceptance and time savings remain unverified. No new CLI commands were added.
