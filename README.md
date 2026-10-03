# AIWF (AI Workflow Framework)

[한국어](README.ko.md) · [Installation guide](docs/SKILLS_INSTALLATION.md) · [MIT License](LICENSE)

AIWF organizes AI-assisted development into project documents, milestones, sprints, and verifiable tasks. Its portable Agent Skills work in **Codex and Claude Code**, using each agent's native tools and the same `.aiwf/` project files. Project documents follow the user's language.

## Install with skills.sh

Use the official [Vercel skills CLI](https://skills.sh/docs/cli). The tested installer is `skills@1.7.0`, which requires Node.js **22.20+**. Install from the project where you will use AIWF.

### Current checkout

Until this update is published, install the updated local checkout:

```bash
cd /path/to/your-project
npx skills add /path/to/aiwf --skill aiwf --agent codex claude-code -y
```

Replace `/path/to/aiwf` with this repository's absolute path. To install all seven skills, replace `--skill aiwf` with `--skill '*'`. To install for only Codex, use `--agent codex`.

### Published repository

After the updated `skills/` directory is pushed to GitHub:

```bash
npx skills add moonklabs/aiwf --skill aiwf --agent codex claude-code -y
```

The CLI copies the skill and its bundled assets into the project's `.agents/skills/` for Codex and exposes it in `.claude/skills/` for Claude Code. Use `--copy` for separate copies in both locations or `--global` for user-wide installation. A global install shares the skill, not project state.

## Use AIWF

Open the target project in your agent. If skills do not appear immediately, start a new session in that project.

In Codex:

```text
$aiwf Initialize this project.
$aiwf Plan the authentication improvement with acceptance criteria and tasks.
$aiwf Execute the next unblocked task and record verification.
$aiwf Show project status and resume the active task.
```

In Claude Code, use the same requests with `/aiwf`:

```text
/aiwf Initialize this project.
/aiwf Plan the authentication improvement with acceptance criteria and tasks.
/aiwf Execute the next unblocked task and record verification.
```

The core skill includes workflow instructions, templates, and an optional Node.js helper. It creates missing scaffolding, preserves existing documents and agent guidance, and records task evidence. An initialization request creates project tracking; it does not implement an entire project.

## Available skills

| Skill | Purpose |
| --- | --- |
| `aiwf` | Initialize, plan, execute, review, and resume project work |
| `aiwf-spec-driven-development` | Write specifications, plans, and tasks, then implement them |
| `aiwf-backend-dev-guidelines` | Apply backend patterns from the host project's actual stack |
| `aiwf-frontend-dev-guidelines` | Apply frontend patterns from the host project's actual stack |
| `aiwf-error-tracking` | Reuse the project's existing error tracking provider |
| `aiwf-route-tester` | Verify endpoints with the project's authentication and tests |
| `aiwf-skill-developer` | Create and maintain portable Agent Skills |

Each skill contains its own required resources. AIWF's core workflow does not require the npm AIWF CLI, Claude plugin hooks, named specialist agents, or companion skills.

## Project files

```text
.aiwf/
  00_PROJECT_MANIFEST.md       # Goals, current work, verification commands
  aiwf-progress.md            # Session progress and next action
  01_PROJECT_DOCS/
  02_REQUIREMENTS/            # Milestones
  03_SPRINTS/                 # Sprints and tasks
  04_GENERAL_TASKS/           # Independent tasks
  05_ARCHITECTURAL_DECISIONS/
  10_STATE_OF_PROJECT/
  98_PROMPTS/
  99_TEMPLATES/
```

Task frontmatter is the source of truth for `open`, `in_progress`, `pending_review`, `done`, `blocked`, and `failed`. A task is complete when its acceptance criteria and required checks have evidence. Existing failures and pending approvals remain visible.

## Updates and previous installations

Local installs are snapshots. After editing this checkout, rerun the same `npx skills add /path/to/aiwf ...` command in the target project. For remote project installs, use `npx skills update -p -y`; for remote global installs, use `npx skills update -y`. The CLI's `update` skips local sources.

Earlier skill directories have been renamed from `backend-dev-guidelines`, etc. to `aiwf-backend-dev-guidelines`, etc.; frontmatter names now use hyphens instead of `aiwf:`. See [migration and removal instructions](docs/SKILLS_INSTALLATION.md#existing-installations).

The earlier npm CLI and modular Claude plugins remain in the repository. Their historical documentation is in [PLUGIN_README.md](PLUGIN_README.md) and the [legacy CLI guide](docs/CLI_USAGE_GUIDE.md). Known plugin hook and legacy test problems are tracked in the [improvement plan](docs/AIWF_IMPROVEMENT_PLAN.ko.md). The installation path described above uses the portable skills.

## Development verification

```bash
npm ci
npm run test:skills
npm run test:skills-install
npm run check:deps
```

`test:skills` checks metadata, bundled references, installed helper behavior, npm distribution, and the command validator regression. `test:skills-install` uses the real official `skills@1.7.0` CLI in a temporary project, verifies both agent destinations byte-for-byte, and removes its fixture. It downloads the CLI via npx when needed; no repository dependency is added. To use an existing CLI, run `node scripts/test-skills-install.js --cli /absolute/path/to/skills/bin/cli.mjs`.

The legacy full Jest suite still has pre-existing failures; the targeted skills checks do not replace that baseline. No repository lint/typecheck command is currently declared.

## Credits and license

AIWF builds on [Simone](https://github.com/Helmi/claude-simone). Licensed under [MIT](LICENSE).
