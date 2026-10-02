# AIWF repository guidance

AIWF is a spec-driven development workflow for existing Claude Code/Codex agents. The root is a plugin marketplace; install the individual plugins rather than the repository as a single plugin.

## Current structure

- `plugins/aiwf-core`: seven unchanged AIUP methodology skills, references and Python validators.
- `plugins/aiwf-spec`: the AIWF-owned workflow skill.
- `plugins/aiwf-<stack>`: four original AIUP stack plugins.
- `src/cli/spec-cli.js`, `src/lib/spec-workflow.js`: dependency-free Node CLI/library for initialization, pins, drift and evidence packets.
- `scripts/install-spec-skills.mjs`: installs named copies into the consuming project's `.agents/skills`, without overwriting existing skills.
- `tests/spec-workflow`: Node regression suite.
- `docs/modernization`, `examples/spec-workflow`: current decisions, validation evidence and worked example.

## Development and verification

Use Node.js 20+ and Python 3.9+. Run `npm test`, `npm run check:deps`, `npm run validate:spec-plugin`, `npm run test:spec-upstream` and `npm run validate:spec-example`. No external Node dependencies or build step are required. `npm run test:spec` remains an alias for the regression suite.

Keep imported skills, references, rules and agent prompts byte-identical to the pinned upstream. Record provenance in each imported plugin's UPSTREAM.json and retain its LICENSE/NOTICE. Make AIWF-specific workflow changes in aiwf-spec or the local CLI. Name mapping applies only to installed copies.

The old installer, language/sprint/persona/YOLO framework and command collections have been removed. Do not reintroduce those paths. Never delete a consuming project's documents, installed skills or local user/runtime data as part of repository cleanup.

Pins and hashes record identity, not semantic correctness or approval. Packets preserve failures and unexecuted checks and stay awaiting_review. Sprintable integration, unattended execution, human acceptance, merge and deployment require separate implementation and evidence.

Keep changelog entries concise and in English. Preserve historical evidence as recorded; add current validation separately.
