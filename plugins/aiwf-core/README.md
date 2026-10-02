# AIWF Core

The AIWF methodology core. Derived from the AI Unified Process Marketplace by Simon Martinelli, pinned in [UPSTREAM.json](UPSTREAM.json). Apache-2.0; see [LICENSE](LICENSE) and [NOTICE](NOTICE).

## What it holds

Seven upstream AIUP skills cover requirements, entities, use cases, journey definitions, reverse engineering and specification review. Every SKILL.md, nested reference and Python parser is a byte-identical copy of upstream; the only upstream change is the appended AIWF attribution in [NOTICE](NOTICE). Host-neutral task tracking and evidence guidance are not here.

| Skill | Purpose |
|---|---|
| `requirements` | Turn a vision into numbered, testable requirements |
| `use-case-diagram` | Maintain `use_cases.puml` and its actors |
| `use-case-spec` | Author `UC-*.md` use cases |
| `entity-model` | Maintain `entity_model.md` |
| `test-case` | Author `TC-*.md` test definitions |
| `spec-review` | Structural lint and the professional review checklist |
| `reverse-engineer` | Draft observed behavior from an existing system |

The structural checker ships with the review skill at `skills/spec-review/scripts/spec_lint.py`; `use-case-spec` and `test-case` bundle `scripts/validate_use_case.py` and `scripts/bpmn_paths.py`.

## Role in the workflow

This plugin is the required methodology core. The sibling `aiwf-spec` plugin adds only the AIWF `workflow` skill: guidance for host-neutral task tracking, evidence and the Sprintable handoff boundary. The CLI (pins, drift detection, evidence packets) is not carried by the plugin; it lives in this repository as `src/cli/spec-cli.js` (the `aiwf-spec` npm bin), so installing the marketplace plugin alone does not install the CLI binary. The stack plugins (`aiwf-vaadin-jooq`, `aiwf-angular-jpa`, `aiwf-blazor-dotnet`, `aiwf-nestjs-nextjs`) add implementation and test skills on top.

## Install

- Claude Code: `/plugin marketplace add moonklabs/aiwf` then `/plugin install aiwf-core@aiwf-plugins`; commands are qualified, for example `/aiwf-core:use-case-spec`.
- Codex: `node scripts/install-spec-skills.mjs --project /path/to/project` installs this core plus the `aiwf-spec` wrapper by default; add `--stack <vaadin-jooq|angular-jpa|blazor-dotnet|nestjs-nextjs>` for a stack. Installed names are prefixed `aiwf-`, so `requirements` becomes `aiwf-requirements`. Existing target skills are never overwritten.

No MCP server is installed automatically and Context7 is optional; the imported skills work without any MCP server.

## License and credits

Apache-2.0. Original work by Simon Martinelli and the AI Unified Process contributors - https://unifiedprocess.ai. Source: https://github.com/AI-Unified-Process/marketplace/tree/065dadda0f696c29ff2bacbda31b38152082e6fa/aiup-core

## Migration note

These seven skills were previously imported into `plugins/aiwf-spec`, which conflated the methodology core with the AIWF wrapper. They were moved here unchanged; the raw sources are preserved and `aiwf-spec` now holds only `workflow`. Existing installations are not updated automatically and no forced update exists; migrating an existing install requires a separately reviewed step.
