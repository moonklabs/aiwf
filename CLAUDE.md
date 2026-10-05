# AIWF repository guidance

## Documentation comes first

Prioritize accurate, current human-review documents before features or new skills in every task. Read `AGENTS.md` and `docs/ko-skills/README.md` before changes. Korean review copies live under `docs/ko-skills/`; executable skill originals remain in `plugins/`. Translate every plugin-root `README.md` to `docs/ko-skills/<plugin>/README.ko.md`. Update affected translations and their source/translation SHA256 records in `manifest.json` in the same change as instructions, references, rules, agent prompts or plugin READMEs. Include additions, removals and moves in the catalog. Never refresh hashes as a substitute for updating a translation.

Run `npm run docs:check` before concluding work and report the relevant Korean review links and outstanding review decisions. Keep translations `awaiting_review` until a real human reviews the recorded version. Automatic checks do not grant approval. Preserve upstream bytes, provenance and licensing; review copies must not become installable skills. Local skill snapshots are review material, not core additions.

AIWF is a spec-driven development workflow for existing Claude Code/Codex agents. The root is a plugin marketplace; install the individual plugins rather than the repository as a single plugin.

Public guides, plugin introductions and CLI help describe AIWF functionality and installation. Keep licensing notices and source provenance in their dedicated legal and tracking files; do not replace them with claims of original authorship.

## Current structure

- `plugins/aiwf-core`: seven methodology skills, references and Python validators.
- `plugins/aiwf-spec`: the AIWF-owned workflow and post-development sync-docs skills.
- `plugins/aiwf-delegate-claude`, `plugins/aiwf-delegate-codex`: optional, explicitly invoked delegation plugins with native-host and opt-in cross-CLI paths.
- `plugins/aiwf-<stack>`: four imported stack plugins and the AIWF-owned MIT `aiwf-electron-react` desktop stack.
- `docs/ko-skills`: Korean human-review translations, local skill snapshots, catalog and source/hash records. This review archive is not an installable plugin or npm package payload.
- `src/cli/spec-cli.js`, `src/lib/spec-workflow.js`: dependency-free Node CLI/library for initialization, pins, drift and evidence packets.
- `src/cli/aiwf-cli.js`, `src/lib/skill-bundles.js`, `src/lib/skill-installation.js`: public installation CLI, marketplace-backed bundle selection and the pinned official skills backend. Promote `npm i -g aiwf` followed by `aiwf install` as the primary distribution flow. Global CLI installation does not select global skill scope. Preserve explicit host/delegation choices, complete resources, local modifications and installation ownership; keep the old spec CLI compatible.
- `scripts/install-spec-skills.mjs`: installs named copies into the consuming project's `.agents/skills`, without overwriting existing skills.
- `scripts/check-korean-docs.mjs`: read-only source, translation, link, example and review-status checks; `npm test` runs it before the regression suite.
- `tests/spec-workflow`: Node regression suite.
- `docs/modernization`, `examples/spec-workflow`: current decisions, validation evidence and worked example.

## Development and verification

Use Node.js 22.20+ and Python 3.9+. Run `npm test`, `npm run check:deps`, `npm run validate:spec-plugin`, `npm run test:spec-upstream` and `npm run validate:spec-example`. `npm test` checks Korean documentation before the regression suite. Use `npm run docs:check:local` to fail when this machine's installed local skills differ from their archived snapshots. The public installer depends on pinned `skills`; the spec CLI/library uses built-in Node modules. No build step is required. `npm run test:spec` remains an alias for the regression suite.

Keep reusable behavior and document-contract checks. Remove one-off experiment code, temporary install fixtures and ad hoc verification scripts after use; do not add checks that merely repeat a plugin's current inventory or depend on a dated local checkout. Preserve useful findings in review documents, distinguish historical results from runnable checks, and remove obsolete replay instructions when their code is deleted.

Keep imported skills, references, rules and agent prompts byte-identical to the pinned upstream. Record provenance in each imported plugin's UPSTREAM.json and retain its LICENSE/NOTICE. Make AIWF-specific workflow changes in aiwf-spec or the local CLI, and Electron stack guidance in aiwf-electron-react; keep optional Claude/Codex delegation in the two AIWF-owned delegate plugins. Name mapping applies only to installed copies.

The old installer, language/sprint/persona/YOLO framework and command collections have been removed. Do not reintroduce those paths. Never delete a consuming project's documents, installed skills or local user/runtime data as part of repository cleanup.

Pins and hashes record identity, not semantic correctness or approval. Packets preserve failures and unexecuted checks and stay awaiting_review. Sprintable integration, unattended execution, human acceptance, merge and deployment require separate implementation and evidence.

Keep changelog entries concise and in English. Preserve historical evidence as recorded; add current validation separately.
