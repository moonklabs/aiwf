# AIWF Core

The AIWF methodology core plugin. Apache-2.0; see [LICENSE](LICENSE) and [NOTICE](NOTICE).

## What it holds

Seven methodology skills cover requirements, entities, use cases, journey definitions, reverse engineering and specification review. Host-neutral task tracking and evidence guidance are not here.

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

This plugin is the required methodology core. The sibling `aiwf-spec` plugin adds the AIWF `workflow` and `sync-docs` skills: guidance for host-neutral task tracking, evidence, documentation synchronization before completion and the Sprintable handoff boundary. The CLI (pins, drift detection, evidence packets) is not carried by the plugin; it lives in this repository as `src/cli/spec-cli.js` (the `aiwf-spec` npm bin), so installing the marketplace plugin alone does not install the CLI binary. The stack plugins (`aiwf-vaadin-jooq`, `aiwf-angular-jpa`, `aiwf-blazor-dotnet`, `aiwf-nestjs-nextjs`, `aiwf-electron-react`) add implementation and test skills on top.

## Install

- Claude Code: `/plugin marketplace add moonklabs/aiwf` then `/plugin install aiwf-core@aiwf-plugins`; commands are qualified, for example `/aiwf-core:use-case-spec`.
- Codex: `node scripts/install-spec-skills.mjs --project /path/to/project` installs this core plus the `aiwf-spec` wrapper by default; add `--stack <vaadin-jooq|angular-jpa|blazor-dotnet|nestjs-nextjs|electron-react>` for a stack. Installed names are prefixed `aiwf-`, so `requirements` becomes `aiwf-requirements`. Existing target skills are never overwritten.

No MCP server is installed automatically and Context7 is optional; the bundled skills work without any MCP server.

## License

Apache-2.0. See [LICENSE](LICENSE) and [NOTICE](NOTICE).

## Migration note

These seven skills were previously packaged in `plugins/aiwf-spec`. They now live here, and `aiwf-spec` holds the `workflow` and `sync-docs` skills. Existing installations are not updated automatically and no forced update exists; migrating an existing install requires a separately reviewed step.
