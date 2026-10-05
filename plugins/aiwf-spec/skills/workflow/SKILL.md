---
name: workflow
description: Use for AIWF specification-driven implementation, existing-project modernization, spec version checks and review evidence. Connects durable use cases to the current coding agent and prepares local evidence for future Sprintable integration.
---

# AIWF Spec Workflow

Copyright 2026 moonklabs. Licensed under Apache-2.0; see the plugin LICENSE and NOTICE.

## Deliverable

For one selected user goal, deliver persistent requirements, a use case, a test definition, code, executed checks and a review packet. Specifications remain in Git after the implementation ships. Use existing project tooling and the current agent; do not install a model runtime or require a particular vendor.

## Host integration

The seven core skills and four optional stack bundles are preserved upstream resources. Do not patch their instructions to customize AIWF. Apply host-specific handling through this workflow and the user's repository instructions. Where a preserved skill names an unavailable tool such as TodoWrite, use the host's task tracker or a short Markdown checklist. Resolve bundled scripts and references from the installed skill folder.

The methodology foundation is the `aiwf-core` plugin. Install it before this optional `aiwf-spec` workflow extension. Core owns `requirements`, `entity-model`, `use-case-diagram`, `use-case-spec`, `test-case`, `spec-review`, `reverse-engineer` and their validators. Claude Code calls core skills as `/aiwf-core:requirements`; this extension exposes `/aiwf-spec:workflow`. The Codex installer includes both packages and retains the established `aiwf-*` skill names.

Choose the stack matching the repository. Codex installation prefixes stack names (for example `aiwf-nestjs-nextjs-implement`) and maps command references only in installed copies. For Claude Code, install the matching `aiwf-*` plugin and use its qualified commands. Raw upstream agent names are retained; Angular/Vaadin coverage skills have bundled `agents/uc-coverage.md` prompts. File installation alone does not register a Codex custom agent. Use native host delegation with that prompt when supported, and report a missing agent capability explicitly when the skill requires it. Never claim a separate reviewer ran when the same agent performed the check.

Upstream specification statuses remain meaningful documented claims. A digest, completed run or test pass does not supply stakeholder approval. Follow existing user authorization for reversible work, and record real approvals and reviewed versions separately; never invent Approved status to unblock implementation. Keep review and authoring as separate passes. Existing `.aiwf` and `.sdd` files are migration inputs and are not automatically removed.

## Workflow

1. Read repository instructions, source, existing tests and any legacy `.aiwf` / `.sdd` documents. Classify observed behavior, requested changes and uncertain assumptions. On a new project run `aiwf-spec init --root <project> --name <name>`; this preserves existing files. In a legacy project use `reverse-engineer` to draft the current behavior, without endorsing every observed behavior as a requirement.
2. Create or revise `docs/vision.md`. Define target users, one first useful outcome, measurable success, non-goals and constraints. Use `requirements`, `entity-model`, `use-case-diagram`, `use-case-spec`, then `test-case` for the selected goal. Keep IDs stable and use the canonical `docs/use_cases/` and `docs/test_cases/` folders. Keep English parser headings and status words; Korean body text is allowed.
3. Run the installed `spec-review/scripts/spec_lint.py --docs <project>/docs --strict --no-baseline` and do a separate semantic review. Resolve scripts relative to the installed skill's sibling folders. A trace matrix shows document links, not executed test coverage. If review reports an issue, fix it in a separate author pass within existing user authorization and rerun the relevant check. Never automatically accept a lint baseline.
4. Run `aiwf-spec pin --root <project>`. This records a local content digest, not approval. Any required human approval comes from the real approver at the recorded version; it is a separate decision. An agent may proceed with local implementation already authorized by the user. Do not change status to Approved to unblock yourself.
5. Write a small implementation plan in `docs/plans/UC-XXX.md`: selected use case and rules, files to change, acceptance/test mapping, repository test commands and remaining questions. Create this before the pin, or explicitly refresh the pin after adding it. Keep architecture choices in `docs/architecture/`. For each BR/alternative, identify a meaningful test or explicitly explain why it cannot yet be exercised. A test named with a UC ID is still not proof of full coverage.
6. Implement the selected goal. Use the repository's current stack and installed development skills. Reuse existing utilities and dependencies. Record UC/BR IDs near non-obvious rule enforcement and in relevant tests. Preserve behavior outside the requested change. Delegate only independent, bounded tasks when supported and useful; Main integrates and verifies.
7. Execute the smallest checks that prove the selected behavior; save exact output and exit status. Run applicable broader checks. Before completing the goal, use `sync-docs` with the change intent, comparison scope and executed evidence to update affected use cases, rules, test definitions, models and usage guides. Report an explained no-change result when documents are unaffected. Preserve unmet requirements and unintended implementation differences rather than rewriting policy to match code. Review writing in a separate pass, resolve authorized fixes and run the applicable document checks. Run `aiwf-spec check --root <project>` after implementation. If a specification changed, explain the change, review affected behavior, refresh the pin explicitly and rerun affected tests. Include optional business processes and test definitions in the same reviewed scope. Synchronization is a skill-guided task, not a new CLI command or automatic proof of consistency.
8. Write an evidence JSON file using the CLI's documented checks schema. Keep passed, failed and not_run separate, attach actual local logs to executed checks, and list unverified behavior. `command` is descriptive data; packet generation never executes it. Run `aiwf-spec packet --root <project> --evidence <file>`. Review the saved output. It records agent-reported results and must remain awaiting_review with acceptance not_recorded.
9. Report the outcome, changed files, checks and limitations. Business acceptance, approved, merged and deployed are separate claims requiring their own evidence. The current CLI does not enforce approval or run an autonomous scheduler.

## Sprintable boundary

This release prepares a local JSON packet only. It does not publish or synchronize automatically. A future adapter should create a Markdown Doc containing exact spec/file digests and evidence, attach report evidence to the selected story/task, then submit a document/concept approval when required. Use current discovered MCP contracts, explicit project/work-item IDs and returned references. `spec pins` on visual artifacts are not repository spec snapshots. Do not mark a story done merely because a document was uploaded. Do not treat reported evidence as independent verification.

## Stop condition

Stop when the selected goal has the agreed checks, affected documents have been synchronized or an explained no-change result recorded, the saved packet can be read back, and remaining gaps are explicit. Do not repeatedly regenerate plans or perform new semantic reviews of unchanged text simply to produce more output. Escalate only a material ambiguity, destructive action, missing authority or a blocker with no useful safe path.
