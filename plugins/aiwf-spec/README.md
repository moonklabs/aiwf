# AIWF Spec

The AIWF workflow wrapper for the AIUP-derived methodology core. It adds the AIWF `workflow` skill, which uses the repository CLI; the upstream skills live in the sibling [aiwf-core](../aiwf-core) plugin.

## Contents

- `skills/workflow` - AIWF's own skill: host-neutral task tracking, explicit evidence/approval boundaries and the future Sprintable handoff. This is the only skill here and it has no upstream counterpart.
- `LICENSE` and `NOTICE` (Apache-2.0).

The seven upstream skills (requirements, entities, use cases, journeys, reverse engineering, specification review) are no longer in this plugin. They were moved unchanged into [aiwf-core](../aiwf-core/README.md); the exact source commit, original hashes and the single NOTICE attribution change are recorded in the core [UPSTREAM.json](../aiwf-core/UPSTREAM.json). This plugin has no `UPSTREAM.json` of its own.

Canonical project artifacts are `docs/vision.md`, `requirements.md`, `glossary.md`, `entity_model.md`, `use_cases.puml`, `use_cases/UC-*.md`, `test_cases/TC-*.md`, and optional `processes/*.bpmn`. Keep English structural headings/status tokens; bodies may be Korean. Structural lint does not guarantee Korean semantic completeness. The structural checker is `aiwf-core/skills/spec-review/scripts/spec_lint.py`.

Claude Code installs the marketplace's `aiwf-core` (required) and `aiwf-spec` (wrapper) entries. Codex receives complete skill folders through `scripts/install-spec-skills.mjs`, which installs the core seven plus this `workflow` by default; installed names are prefixed `aiwf-`. File installation is tested; live host skill discovery/model execution is a separate validation gate. No MCP server is installed automatically.

The `workflow` skill assumes the repository CLI `src/cli/spec-cli.js` (npm bin `aiwf-spec`) for initialization, pins, drift detection and evidence packets; installing the marketplace plugin alone does not install that binary. The CLI does not invoke an AI model, execute application checks, publish to Sprintable, or grant approval. See the repository [Korean guide](../../docs/modernization/DIRECTION.ko.md).
