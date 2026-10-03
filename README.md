# AIWF — specifications, implementation and evidence

[한국어](README.ko.md)

Read the [Korean skill review documents](docs/ko-skills/README.md) before feature work. Update affected originals, translations and review records together; run `npm run docs:check` before concluding a task. Translation and automated checks do not constitute human approval. See the [optional Claude/Codex delegation design](docs/modernization/DELEGATION-OPTIONAL.ko.md).

AIWF keeps use-case specifications in Git, lets existing Claude Code/Codex agents implement them, and records inspectable verification evidence.

Modernization started on 2026-10-02. The specification workflow is split across two plugins: **`aiwf-core`**, the AIUP-derived methodology core (seven upstream skills for requirements, use cases, entities and specification review), and **`aiwf-spec`**, the AIWF wrapper whose `workflow` skill uses the repository CLI for non-overwriting initialization, specification pins, drift detection and review packets. Two separate Claude/Codex delegation add-ons are available by choice. Sprintable synchronization and unattended execution are planned, not implemented. These features describe this checkout; do not assume they are present in the previously published npm release.

See the [direction](docs/modernization/DIRECTION.ko.md), [validation record](docs/modernization/VALIDATION.md), [Sprintable adapter proposal](docs/modernization/SPRINTABLE.ko.md) and [worked example](examples/spec-workflow/README.md).

The [CLI productivity analysis (Korean)](docs/modernization/CLI-PRODUCTIVITY.ko.md) proposes a real use-case pilot before read-only verification and optional checks with versioned execution records. Synchronized documentation remains a quality requirement at every step. These extensions are proposals, not implemented commands.

Two independent Claude sessions assessed the reviewed proposal as conditionally suitable. The [Korean plan review](docs/modernization/CLAUDE-PLAN-REVIEW-2026-10-03.ko.md) preserves their concerns and original input. The revised [pilot plan](docs/modernization/PILOT-UC-001.ko.md) and [local execution result](docs/modernization/PILOT-RESULT-2026-10-03.ko.md) record drift refusal and failing-to-passing service tests. Actual product adoption, human review and productivity gains remain unverified; no proposed CLI commands were added.

## Start with this checkout

Node.js 20+; Python 3.9+ for structural lint. The new Node CLI has no external dependencies. The target project directory must already exist.

```bash
node src/cli/spec-cli.js init --root /path/to/project --name "Our service"
node scripts/install-spec-skills.mjs --project /path/to/project --dry-run
node scripts/install-spec-skills.mjs --project /path/to/project --stack nestjs-nextjs --dry-run
node scripts/install-spec-skills.mjs --project /path/to/project --stack nestjs-nextjs
node scripts/install-spec-skills.mjs --project /path/to/project --delegate codex --dry-run
```

By default Codex installs the `aiwf-core` seven skills plus the `aiwf-spec` `workflow` skill as `aiwf-requirements`, `aiwf-use-case-spec`, ..., `aiwf-workflow`, with their full references, parsers and attribution. `--stack` selects one of `vaadin-jooq`, `angular-jpa`, `blazor-dotnet` or `nestjs-nextjs` and adds that stack; existing skills are never overwritten and there is no force flag. Live host skill selection and model execution remain separate pilot checks.

Delegation is opt-in: `--delegate claude` and `--delegate codex` add only the selected skill; repeat the option to add both. Claude Code users can instead install either marketplace add-on. To install one portable skill with the skills CLI for Codex or Claude Code, choose both the skill and agent explicitly:

The GitHub-based skills.sh commands below become available after these changes are published to the repository.

```bash
npx skills add https://github.com/moonklabs/aiwf --skill delegate-claude --agent codex
npx skills add https://github.com/moonklabs/aiwf --skill delegate-codex --agent codex
npx skills add https://github.com/moonklabs/aiwf --skill delegate-claude --agent claude-code
npx skills add https://github.com/moonklabs/aiwf --skill delegate-codex --agent claude-code
```

These skills run only when invoked directly. Native delegation is used when the current host matches the target. Starting the other CLI requires the literal `--cross-cli` token in the current request; naming a target alone does not authorize another process. Cross-CLI tasks are read-only by default. A write requires that same request to explicitly ask for changes and state their scope. The CLI runs under the same OS account, directory and environment, follows its own permission policy, and does not inherit the host's sandbox or approvals. See the [delegation design](docs/modernization/DELEGATION-OPTIONAL.ko.md).

## Plugins

31 upstream AIUP skills are vendored unchanged plus AIWF's own `workflow` and two optional delegation skills (34 total available). `aiwf-core` holds the seven upstream skills; `aiwf-spec` holds only the AIWF `workflow`.

| Plugin | Role | Contents |
|---|---|---|
| `aiwf-core` | Methodology core (required) | 7 upstream skills, byte-identical (2.19.0) |
| `aiwf-spec` | AIWF wrapper (optional) | AIWF `workflow` only |
| `aiwf-delegate-claude` | Optional delegation add-on | `delegate-claude` |
| `aiwf-delegate-codex` | Optional delegation add-on | `delegate-codex` |
| `aiwf-vaadin-jooq` | Stack | 8 upstream skills (2.20.0) |
| `aiwf-angular-jpa` | Stack | 6 upstream skills (0.7.0) |
| `aiwf-blazor-dotnet` | Stack | 5 upstream skills (0.7.0) |
| `aiwf-nestjs-nextjs` | Stack | 5 upstream skills (0.4.0) |

Each plugin vendors the upstream files it imports with a per-plugin `UPSTREAM.json` (`skills/` plus, for stacks, `rules/` and any `agents/`, `LICENSE`, `NOTICE`). The only upstream source change is the AIWF attribution appended to the `aiwf-core` NOTICE; every other vendored file is byte-identical. `aiwf-spec` has no upstream of its own and links the core [UPSTREAM.json](plugins/aiwf-core/UPSTREAM.json). Installation copies files: it does not register native Codex subagents or configure MCP. Bundled agent prompts such as `agents/uc-coverage.md` are copied as resources, and the `workflow` skill describes the host mapping. See [SKILLS.ko.md](docs/modernization/SKILLS.ko.md) for names, counts and the pin-update procedure.

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

The old installer, language/sprint/persona/YOLO commands, duplicate skill collections and legacy plugins have been removed. The npm package exposes only `aiwf-spec`, with no external Node dependencies. `npm test` runs the current regression suite. This is a breaking change from the old framework; previously installed project data is untouched.

## Attribution and licenses

The `aiwf-core` methodology plugin and the four stack plugins derive from the [AI Unified Process marketplace](https://github.com/AI-Unified-Process/marketplace) at commit `065dadda0f696c29ff2bacbda31b38152082e6fa`: `aiwf-core` and `aiwf-vaadin-jooq` by Simon Martinelli, `aiwf-angular-jpa` by Marc Affolter, `aiwf-blazor-dotnet` by Carl J. Mosca and `aiwf-nestjs-nextjs` by Swift Ugandan. Each plugin's `UPSTREAM.json` records the exact source commit, original hashes and modifications. Existing AIWF code remains [MIT](LICENSE); imported plugins carry [Apache-2.0](plugins/aiwf-core/LICENSE) and [NOTICE](plugins/aiwf-core/NOTICE).
