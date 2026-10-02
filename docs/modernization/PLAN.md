# AIWF modernization — 2026-10-02

## Target result

Move AIWF from Claude-specific task bookkeeping toward durable, use-case-driven specifications consumed by existing coding agents. Reuse the AI Unified Process core rather than rebuilding its methodology. Keep specifications in Git and prepare reviewable evidence for future Sprintable integration.

## First implementation boundary

1. Add an isolated `aiwf-spec` plugin from upstream core skills and validators, pinned to an exact commit; retain Apache-2.0 LICENSE, NOTICE and change notices.
2. Add a dependency-free local CLI for preserving project initialization, spec snapshots, change detection, and evidence packets. It records reported checks and cannot grant approval or assert business acceptance.
3. Add portable skill installation, a complete worked example, provenance checks, and end-to-end validation.
4. Document verified Sprintable contracts and a proposed adapter. Do not write to production or imply synchronization exists.

Legacy commands stay available during the first slice. Their later removal is a separate migration after a pilot establishes the new path. No new dependencies. No model SDK, scheduler, chat interface or backend rewrite in this slice.

## Behavior and verification

Before changing legacy behavior, establish targeted regression coverage. This slice adds independent entry points; tests cover preservation, malformed inputs, draft/missing specs, pin drift, failed/unexecuted checks, file boundaries and actual CLI execution. Run upstream validator self-tests and validate a real example end to end. Inspect packaged files so the plugin, scripts and notices ship. Report legacy-suite/environment gaps separately.

## Stop condition

A fresh local project can initialize without losing files; an example can pass structural lint, pin specs, detect changed specs, and generate a packet with inspectable logs. The direction, provenance, migration boundary and remaining Sprintable work are written down. This is a verified local foundation, not a completed automation platform.

## Original-preserving skill update

The user requests skills as unchanged as possible. First add regressions for exact upstream core hashes and opt-in stack installation. Restore all seven core SKILL.md files from the verified latest upstream commit, and import the four stack skill bundles and their supporting resources without editing upstream bytes. Keep host portability and AIWF evidence guidance in the separate workflow skill. Apply name/reference mappings only to installed copies. Validate every imported resource hash, all manifests, core/stack installation, upstream self-tests, the worked example and packaged contents. Keep existing installed user skills protected from overwrites.
