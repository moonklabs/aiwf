# AIWF — specifications, implementation and evidence

[한국어](README.ko.md)

Read the [Korean skill review documents](docs/ko-skills/README.md) before feature work. Update affected originals, translations and review records together; run `npm run docs:check` before concluding a task. Translation and automated checks do not constitute human approval. See the [optional Claude/Codex delegation design](docs/modernization/DELEGATION-OPTIONAL.ko.md).

AIWF keeps use-case specifications in Git, lets existing Claude Code/Codex agents implement them, and records inspectable verification evidence.

The specification workflow is split across two plugins: **`aiwf-core`** provides seven methodology skills for requirements, use cases, entities and specification review; **`aiwf-spec`** provides `workflow` for non-overwriting initialization, specification pins, drift detection and review packets, plus `sync-docs` for maintaining affected documents after development. Two separate Claude/Codex delegation add-ons are available by choice. Sprintable synchronization and unattended execution are planned, not implemented. The current npm release is `aiwf@0.4.0`.

See the [direction](docs/modernization/DIRECTION.ko.md), [validation record](docs/modernization/VALIDATION.md), [Sprintable adapter proposal](docs/modernization/SPRINTABLE.ko.md) and [worked example](examples/spec-workflow/README.md).

The [CLI productivity analysis (Korean)](docs/modernization/CLI-PRODUCTIVITY.ko.md) proposes a real use-case pilot before read-only verification and optional checks with versioned execution records. Synchronized documentation remains a quality requirement at every step. These extensions are proposals, not implemented commands.

Two independent Claude sessions assessed the reviewed proposal as conditionally suitable. The [Korean plan review](docs/modernization/CLAUDE-PLAN-REVIEW-2026-10-03.ko.md) preserves their concerns and original input. The revised [pilot plan](docs/modernization/PILOT-UC-001.ko.md) and [local execution result](docs/modernization/PILOT-RESULT-2026-10-03.ko.md) record drift refusal and failing-to-passing service tests. Actual product adoption, human review and productivity gains remain unverified; no proposed CLI commands were added.

## Install the CLI and choose your skills

The primary distribution flow for the next `aiwf@0.5.0` release is a global CLI install followed by a project skill install. This flow is implemented in the current checkout; the published `aiwf@0.4.0` still exposes only `aiwf-spec`.

Requires Node.js 22.20+ for the included `skills@1.7.0` backend; Python 3.9+ is used by specification validators.

```bash
# After aiwf@0.5.0 is published:
npm i -g aiwf
aiwf install

# Explicit, reproducible selection; run in the existing target project:
aiwf install --agent codex claude-code --stack electron-react --dry-run
aiwf install --agent codex claude-code --stack electron-react
aiwf status

# Delegation stays optional. Add it later without reinstalling unchanged skills:
aiwf install --agent codex --stack electron-react --delegate claude codex

# The design-spec skills are optional too:
aiwf install --agent codex --design
```

`aiwf install` asks for hosts, optional stacks, delegation and the design-spec skills in an interactive terminal. Automation specifies `--agent`. The recommended default is core plus workflow/document synchronization; `--core-only` selects just core. `--stack` accepts multiple choices from `aiwf list`. Skill scope defaults to the current project; use `--project /path/to/project` for another existing project or `--global` for user-level skills. Installing the CLI globally does not select global skill scope.

AIWF resolves the selected bundles and prepares complete resources with isolated `aiwf-` names. Its pinned official skills CLI performs installation with explicit hosts, names and `--copy`; no separate global skills install or runtime `npx` download is needed. Codex project/user skills go to `.agents/skills`; Claude project skills go to `.claude/skills`, and user skills respect `CLAUDE_CONFIG_DIR`. See the [installation design and verification](docs/modernization/CLI-INSTALLATION-REVIEW.ko.md).

Unchanged AIWF-managed skills are skipped, so stacks, delegation and another host can be added later. Local modifications and unmanaged existing skills cause a conflict and are preserved. AIWF records versions and hashes in `.aiwf/skills-installation.json`, and retains source resources in `.aiwf/skill-sources/` so the official `skills-lock.json` does not point to a deleted temporary directory. Keep these sources with the installation. `aiwf status` reports recorded installations; skills installed by other tools are outside that record. Update/removal and saved profiles remain future work. CLI upgrades use `npm i -g aiwf@latest`; this does not automatically update existing skills.

Use `aiwf spec --help` for document initialization, pinning, drift and evidence packets; the `aiwf-spec` executable remains compatible. Portable skills and native host plugins have distinct installation paths. Native Claude marketplace use and direct skills.sh installation remain available below.

## Run the current checkout

The target project directory must already exist. Use the checkout CLI before the next npm release:

```bash
npm ci
node src/cli/aiwf-cli.js install --agent codex --stack electron-react --project /path/to/project --dry-run
node src/cli/aiwf-cli.js install --agent codex --stack electron-react --project /path/to/project
```

The earlier checkout-only copy script remains available with its original refusal to overwrite any existing skill:

```bash
node src/cli/spec-cli.js init --root /path/to/project --name "Our service"
node scripts/install-spec-skills.mjs --project /path/to/project --dry-run
node scripts/install-spec-skills.mjs --project /path/to/project --stack nestjs-nextjs --dry-run
node scripts/install-spec-skills.mjs --project /path/to/project --stack nestjs-nextjs
node scripts/install-spec-skills.mjs --project /path/to/project --delegate codex --dry-run
```

By default Codex installs the `aiwf-core` seven skills plus the `aiwf-spec` `workflow` and `sync-docs` skills as `aiwf-requirements`, `aiwf-use-case-spec`, ..., `aiwf-workflow`, `aiwf-sync-docs`, with their full references, parsers and attribution. `--stack` selects one of `vaadin-jooq`, `angular-jpa`, `blazor-dotnet`, `nestjs-nextjs` or `electron-react` and adds that stack; existing skills are never overwritten and there is no force flag. Live host skill selection and model execution remain separate pilot checks.

After development, use Codex's `aiwf-sync-docs` or Claude Code's `/aiwf-spec:sync-docs` with the change intent, comparison scope and UC IDs. The workflow includes this before completion; it updates affected documents and preserves implementation gaps and unverified behavior. See the [installation and standalone skills CLI guide](plugins/aiwf-spec/README.md#synchronize-documents-after-development) and [Korean review copy](docs/ko-skills/aiwf-spec/skills/sync-docs/SKILL.ko.md). This is a skill, not a new `aiwf-spec` CLI command.

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

AIWF provides 46 skills: seven methodology skills in `aiwf-core`, 30 implementation and testing skills across five stacks, `workflow` and `sync-docs` in `aiwf-spec`, five design-spec skills in `aiwf-design`, and two optional delegation skills.

| Plugin | Role | Contents |
|---|---|---|
| `aiwf-core` | Methodology core (required) | 7 methodology skills (2.19.0) |
| `aiwf-spec` | AIWF wrapper (optional) | AIWF `workflow` and `sync-docs` |
| `aiwf-design` | Design-spec add-on (optional, requires `aiwf-core`) | `workflow`, `figma-sync`, `apply`, `trace`, `review` (0.1.0) |
| `aiwf-delegate-claude` | Optional delegation add-on | `delegate-claude` |
| `aiwf-delegate-codex` | Optional delegation add-on | `delegate-codex` |
| `aiwf-vaadin-jooq` | Stack | 8 skills (2.20.0) |
| `aiwf-angular-jpa` | Stack | 6 skills (0.7.0) |
| `aiwf-blazor-dotnet` | Stack | 5 skills (0.7.0) |
| `aiwf-nestjs-nextjs` | Stack | 5 skills (0.4.0) |
| `aiwf-electron-react` | Agent desktop stack | 6 skills (0.1.0) |

For Electron agent desktop apps, see the [Electron/React guide](plugins/aiwf-electron-react/README.md) and [Korean review copy](docs/ko-skills/aiwf-electron-react/README.ko.md). It extends core specifications with scaffolding, implementation, runtime adapters, UI/Electron tests and packaging. Agent execution stays in the selected Sally/PI/other adapter; AI Elements supplies UI. From this checkout, select `--stack electron-react` to install 15 skills including core and spec. The new stack is not included in the published `aiwf@0.4.0`.

For a designer-run design workspace next to the planning documents, see the [design-spec guide](plugins/aiwf-design/README.md) and [Korean review copy](docs/ko-skills/aiwf-design/README.ko.md). It routes each session to one role (designer work, sync, apply, trace or review), keeps Figma read-only outside designer work, checks Figma tokens against DTCG tokens, traces planning changes and lints the workspace. Project paths, the Figma file key, checks and gates come from `docs/design-spec/design-spec.config.json`. `aiwf install --design` or `--design` on the checkout installer adds the five skills as `aiwf-design-<name>`; [examples/design-spec](examples/design-spec/README.md) is a minimal project that passes the lint and token check.

Installation copies complete skill folders: it does not register native Codex subagents or configure MCP. Bundled agent prompts such as `agents/uc-coverage.md` are copied as resources, and the `workflow` skill describes the host mapping. See [SKILLS.ko.md](docs/modernization/SKILLS.ko.md) for names, counts and maintenance procedures.

For Claude Code, add this checkout's absolute path as a local marketplace during development, then install the core, the wrapper and any stack or add-on you need (`aiwf-core`, `aiwf-spec`, `aiwf-<stack>`, `aiwf-design`) and invoke a qualified command such as `/aiwf-core:use-case-spec`, `/aiwf-spec:workflow`, `/aiwf-nestjs-nextjs:implement` or `/aiwf-design:workflow`. After publishing these changes, the remote marketplace source can be `moonklabs/aiwf`.

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
npm run test:design
```

The old installer, language/sprint/persona/YOLO commands, duplicate skill collections and legacy plugins have been removed. The new npm package exposes `aiwf` with its official skills backend and the compatible `aiwf-spec`; `npm test` runs the current regression suite. Compatibility with the old framework has ended. The spec CLI itself uses built-in Node modules.

## Licenses

AIWF code uses [MIT](LICENSE). Plugin files retain their applicable [Apache-2.0](plugins/aiwf-core/LICENSE) or [MIT](plugins/aiwf-electron-react/LICENSE) licenses and [NOTICE](plugins/aiwf-core/NOTICE) files; see each plugin's legal documents.
