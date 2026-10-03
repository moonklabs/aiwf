# AIWF installation with skills.sh

AIWF is distributed as seven portable Agent Skills under `skills/`. Use the official [Vercel skills CLI](https://skills.sh/docs/cli), which supports Codex and Claude Code. The package layout follows the [Agent Skills specification](https://agentskills.io/specification); Codex's skill support is documented in [OpenAI's skills guide](https://developers.openai.com/codex/skills).

The instructions and integration test were verified with **Node.js 22.23.1 and skills 1.7.0**. That CLI requires Node.js 22.20+. The optional AIWF project helper itself requires Node.js 18+, and an agent can use the bundled Markdown templates directly without it.

## Install the current local update

Run this from the project you want to manage:

```bash
cd /path/to/your-project
npx skills add /absolute/path/to/aiwf --skill aiwf --agent codex claude-code -y
```

Use the absolute path of the checkout containing the updated `skills/` directory.

To select all AIWF skills:

```bash
npx skills add /absolute/path/to/aiwf --skill '*' --agent codex claude-code -y
```

Quote a path containing spaces. Use `--agent codex` or `--agent claude-code` to target one host. Use `--copy` for separate copies in both agent directories. Without it, the CLI can expose an agent directory through a link to the canonical copy; neither mode needs this checkout at runtime.

Useful official CLI options:

| Option | Effect |
| --- | --- |
| `--list` | Show available source skills without installing them |
| `--skill aiwf` | Install only the core workflow |
| `--skill '*'` | Install all discovered skills |
| `--agent codex claude-code` | Target these two agents |
| `--copy` | Copy rather than link agent destinations |
| `--global` | Install for the user across projects |
| `-y` | Skip selection prompts |

For example, `npx skills add /absolute/path/to/aiwf --list` previews the catalog. In skills 1.7.0, `--list` cannot be combined with `--json`. Avoid `--all` when you only want these two agents: that option also selects all supported agents.

## Install from GitHub after publication

Once this update is pushed to the repository:

```bash
npx skills add moonklabs/aiwf --skill aiwf --agent codex claude-code -y
```

The uncommitted local update is verified through the local source path. GitHub installation of that update cannot be verified before publication. No npm AIWF release or marketplace registration is required for the skills CLI to install a repository containing `skills/*/SKILL.md`.

## Verify and use

Inspect the installed catalog from the target project:

```bash
npx skills list --agent codex claude-code
```

Add `--global` when inspecting a global installation.

| Host | Project skill location | Invoke the core workflow |
| --- | --- | --- |
| Codex | `.agents/skills/aiwf/SKILL.md` | `$aiwf` |
| Claude Code | `.claude/skills/aiwf/SKILL.md` | `/aiwf` |

Open the project in the host agent and start a new session if its skill list needs to refresh. In Codex:

```text
$aiwf 이 프로젝트를 초기화해줘.
$aiwf 검색 기능 개선을 계획하고 완료 조건과 태스크를 만들어줘.
$aiwf 다음 실행 가능한 태스크를 구현하고 검증 결과를 기록해줘.
$aiwf 현재 상태를 확인하고 진행 중인 작업을 이어서 해줘.
```

In Claude Code, replace `$aiwf` with `/aiwf`. Both hosts inspect project guidance, write `.aiwf/` tracking files, use native implementation and verification tools, and record the same task states. They do not require AIWF-specific hooks or a separately installed AIWF CLI.

To run the optional helper directly for a project installation:

```bash
node .agents/skills/aiwf/scripts/project.mjs init .
node .agents/skills/aiwf/scripts/project.mjs status .
```

For a Claude-only installation, use the helper under `.claude/skills/aiwf/`. A global installation needs the absolute installed skill path. `init` preserves existing files; the agent then fills the manifest using observed project facts. `status` is read-only and returns task counts, invalid states, and warnings. Installation or initialization alone is not evidence that project tasks are complete.

## Existing installations

The six previous specialist skills were renamed:

| Previous directory | Current directory and skill name |
| --- | --- |
| `backend-dev-guidelines` | `aiwf-backend-dev-guidelines` |
| `frontend-dev-guidelines` | `aiwf-frontend-dev-guidelines` |
| `error-tracking` | `aiwf-error-tracking` |
| `route-tester` | `aiwf-route-tester` |
| `skill-developer` | `aiwf-skill-developer` |
| `spec-driven-development` | `aiwf-spec-driven-development` |

Previous frontmatter used names like `aiwf:backend-dev-guidelines`. Current names use hyphens and match their directories. Existing `.aiwf/` project documents remain usable and are preserved during initialization. No legacy `.claude/commands/` or project guidance is removed by this update.

Older task files can store status in their body instead of frontmatter. The helper reports those files in `warnings` rather than including them in its frontmatter counts. The agent reads each warned file and any legacy `task-state-index.json` before resuming; inspect those warnings before treating counts as the complete project state.

Install the new names first and confirm they appear. If you previously installed the old skills with the official CLI, inspect `npx skills list`, then remove only the old AIWF entries that actually appear. For example, if that list identifies `aiwf:backend-dev-guidelines`:

```bash
npx skills remove 'aiwf:backend-dev-guidelines' --agent codex claude-code -y
```

Use `--global` if the old installation was global. For manually copied skills, inspect the old directory and any local edits before removing it. Do not remove unrelated skills or project tracking files.

## Update

For a **local** source, rerun the same `skills add /absolute/path/to/aiwf ...` command after changing the checkout. Installed skills are copies; editing the source does not refresh them automatically. The CLI's update command skips local sources.

For **remote** project installs:

```bash
npx skills update -p -y
```

For remote global installs:

```bash
npx skills update -y
```

These commands update installed skills in the selected scope. In skills 1.7.0, `skills check` delegates to update; do not use it as a read-only status check. Use `skills list` to inspect the installed catalog.

## Repository verification

```bash
npm run test:skills
npm run test:skills-install
npm run check:deps
```

The first command verifies metadata and bundled links, runs copied-helper regression tests, checks all skill resources in the actual npm pack list, and retains the command-validator regression checks. The second performs a real official installation in a temporary project for both agents, checks all installed files against the source, runs the installed helpers, and cleans up. It uses npx `skills@1.7.0` without adding a repository dependency. An already available CLI can be selected with `node scripts/test-skills-install.js --cli /absolute/path/to/skills/bin/cli.mjs`.

Legacy full-suite failures and plugin hook problems are recorded separately in [the improvement plan](AIWF_IMPROVEMENT_PLAN.ko.md). They do not provide or gate the portable skill's runtime.
