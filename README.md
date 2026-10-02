# AIWF — specifications, implementation and evidence

[한국어](README.ko.md)

AIWF keeps use-case specifications in Git, lets existing Claude Code/Codex agents implement them, and records inspectable verification evidence.

Modernization started on 2026-10-02. The new path has two plugins: **`aiwf-core`**, the AIUP-derived methodology core (seven upstream skills for requirements, use cases, entities and specification review), and **`aiwf-spec`**, the AIWF wrapper whose `workflow` skill uses the repository CLI for non-overwriting initialization, specification pins, drift detection and review packets. Sprintable synchronization and unattended execution are planned, not implemented. These features describe this checkout; do not assume they are present in the previously published npm release.

See the [direction](docs/modernization/DIRECTION.ko.md), [validation record](docs/modernization/VALIDATION.md), [Sprintable adapter proposal](docs/modernization/SPRINTABLE.ko.md) and [worked example](examples/spec-workflow/README.md).

## Start with this checkout

Node.js 20+; Python 3.9+ for structural lint. The new Node CLI has no external dependencies. The target project directory must already exist.

```bash
node src/cli/spec-cli.js init --root /path/to/project --name "Our service"
node scripts/install-spec-skills.mjs --project /path/to/project --dry-run
node scripts/install-spec-skills.mjs --project /path/to/project --stack nestjs-nextjs --dry-run
node scripts/install-spec-skills.mjs --project /path/to/project --stack nestjs-nextjs
```

By default Codex installs the `aiwf-core` seven skills plus the `aiwf-spec` `workflow` skill as `aiwf-requirements`, `aiwf-use-case-spec`, ..., `aiwf-workflow`, with their full references, parsers and attribution. `--stack` selects one of `vaadin-jooq`, `angular-jpa`, `blazor-dotnet` or `nestjs-nextjs` and adds that stack; existing skills are never overwritten and there is no force flag. Live host skill selection and model execution remain separate pilot checks.

## Plugins

31 upstream AIUP skills are vendored unchanged plus AIWF's own `workflow` (32 total). `aiwf-core` holds the seven upstream skills; `aiwf-spec` holds only the AIWF `workflow`.

| Plugin | Role | Contents |
|---|---|---|
| `aiwf-core` | Methodology core (required) | 7 upstream skills, byte-identical (2.19.0) |
| `aiwf-spec` | AIWF wrapper (optional) | AIWF `workflow` only |
| `aiwf-vaadin-jooq` | Stack | 8 upstream skills (2.20.0) |
| `aiwf-angular-jpa` | Stack | 6 upstream skills (0.7.0) |
| `aiwf-blazor-dotnet` | Stack | 5 upstream skills (0.7.0) |
| `aiwf-nestjs-nextjs` | Stack | 5 upstream skills (0.4.0) |

Each plugin vendors the upstream files it imports with a per-plugin `UPSTREAM.json` (`skills/` plus, for stacks, `rules/` and any `agents/`, `LICENSE`, `NOTICE`). The only upstream source change is the AIWF attribution appended to the `aiwf-core` NOTICE; every other vendored file is byte-identical. `aiwf-spec` has no upstream of its own and links the core [UPSTREAM.json](plugins/aiwf-core/UPSTREAM.json). The old AIWF session/task plugin is kept as `aiwf-core-legacy`; nothing was deleted. Installation copies files: it does not register native Codex subagents or configure MCP. Bundled agent prompts such as `agents/uc-coverage.md` are copied as resources, and the `workflow` skill describes the host mapping. See [SKILLS.ko.md](docs/modernization/SKILLS.ko.md) for names, counts and the pin-update procedure.

For Claude Code, add this checkout's absolute path as a local marketplace during development, then install the core, the wrapper and any stack you need (`aiwf-core`, `aiwf-spec`, `aiwf-<stack>`) and invoke a qualified command such as `/aiwf-core:use-case-spec`, `/aiwf-spec:workflow` or `/aiwf-nestjs-nextjs:implement`. After publishing these changes, the remote marketplace source can be `moonklabs/aiwf`.

## Workflow

Write vision → requirements → glossary/entities → use cases → test definitions. For existing applications, draft observed behavior using `reverse-engineer`. Keep IDs stable and use canonical `docs/use_cases/UC-*.md` and `docs/test_cases/TC-*.md` paths. Implementation plans and architecture documents live under `docs/plans/` and `docs/architecture/`.

Use English structural headings and status tokens. Korean prose is supported, but structural lint does not guarantee Korean semantic completeness.

```bash
python3 plugins/aiwf-core/skills/spec-review/scripts/spec_lint.py \
  --docs /path/to/project/docs --strict --no-baseline
node src/cli/spec-cli.js pin --root /path/to/project
node src/cli/spec-cli.js check --root /path/to/project --json
```

Initialization creates Draft templates; complete them and add UC/TC documents before pinning. Review meaning separately from structural lint. A pin records byte-level SHA256 hashes; it grants no approval. After a reviewed spec change, explicitly refresh the pin with `--refresh` and rerun affected checks.

Implement with the current project's tools, execute actual checks, and save logs. Create an evidence JSON file:

```json
{
  "checks": [
    {"name": "UC-001 regression", "command": "npm test", "status": "passed", "log": "artifacts/test.log"},
    {"name": "Business acceptance", "command": "stakeholder review", "status": "not_run"}
  ],
  "unverified": ["Stakeholder acceptance has not been recorded"]
}
```

This is an input-format example, not a test result. Executed checks require log files inside the project root. The CLI records submitted command strings and never executes them.

```bash
node src/cli/spec-cli.js packet --root /path/to/project --evidence /path/to/project/evidence.json
```

The packet embeds logs and their hashes, specification digests, Git context when available, reported results and limitations. It preserves failed/unexecuted checks and stays `awaiting_review`. Results are not independently verified; human acceptance, approval, merge and deployment need their own evidence. Existing packets require explicit `--force` to overwrite.

## Validate

```bash
npm run test:spec
npm run validate:spec-plugin
npm run test:spec-upstream
```

Legacy installer, sprint CLI and plugins remain separately available while the new path is piloted. The new CLI does not depend on them. See the [legacy guide](docs/CLI_USAGE_GUIDE.md); removal is deferred until the pilot establishes the used path.

## Attribution and licenses

The `aiwf-core` methodology plugin and the four stack plugins derive from the [AI Unified Process marketplace](https://github.com/AI-Unified-Process/marketplace) at commit `065dadda0f696c29ff2bacbda31b38152082e6fa`: `aiwf-core` and `aiwf-vaadin-jooq` by Simon Martinelli, `aiwf-angular-jpa` by Marc Affolter, `aiwf-blazor-dotnet` by Carl J. Mosca and `aiwf-nestjs-nextjs` by Swift Ugandan. Each plugin's `UPSTREAM.json` records the exact source commit, original hashes and modifications. Existing AIWF code remains [MIT](LICENSE); imported plugins carry [Apache-2.0](plugins/aiwf-core/LICENSE) and [NOTICE](plugins/aiwf-core/NOTICE).
