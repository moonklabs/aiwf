---
name: use-case-spec-driven-development
description: Plan and deliver software with use-case-centered specifications, traceable requirements, acceptance tests, architecture decisions, and implementation work packages. Also reverse-engineer an existing system into the same model. Use when a task should move from stakeholder goals to executable, verifiable software.
---

# Use-Case-Centered Specification-Driven Development

Use user goals and use cases as the bridge from requirements to design, tests, work decomposition, and code. The document set is a practical project convention, not a claim of compliance with an official methodology or standard.

## Choose a mode

- **New system / new capability:** establish the target (`To-Be`) behavior, specify it, decompose it into use-case-centered vertical work packages, implement, test, and keep the specification synchronized with the result.
- **Existing-system analysis:** reconstruct the current (`As-Is`) behavior from repository evidence and produce traceable documents. Do not alter application behavior unless implementation is separately requested.
- **Extension to an existing system:** document the relevant current behavior first, then specify the proposed delta separately. Preserve existing constraints and identify migrations or compatibility effects instead of silently redefining them.

If the user requests only analysis, a plan, or documents, stop at that deliverable. If they ask to build or implement, do not stop after writing the specification: carry approved or clearly bounded requirements through code and verification.

## Principles

- Default deliverables to Korean unless the user requests another language.
- Read applicable `AGENTS.md`, repository docs, code, tests, and conventions first. Use existing project vocabulary and doc locations; otherwise use `docs/` and adapt [the document map](references/use-case-sdd-document-map.md).
- Treat user/business goals as intent, not as proof of current behavior. Distinguish current implementation, target requirements, design decisions, assumptions, and open questions.
- Ground current-state claims in source, schema, configuration, runtime observation, or tests. Ground target-state claims in explicit user input or mark the assumption for review.
- Ask focused questions only when an unresolved decision materially changes scope, user-visible behavior, data/security boundaries, compatibility, or acceptance. State exactly what needs review, why evidence cannot decide it, and what it affects. Continue reversible work using explicit low-risk assumptions.
- Do not overproduce documents. Use the reference structure where it improves shared understanding; omit irrelevant artifacts and explain material coverage gaps.

## Workflow

1. **Understand the goal and boundaries.** Identify users/actors, problem, outcomes, in-scope and out-of-scope behavior, existing constraints, affected systems, and the requested stop point (analysis, specification, plan, or implementation). Inspect repository instructions and status before editing.
2. **Discover and classify evidence.** For existing systems, map routes/entry points to UI, APIs/services, authorization, persisted data, integrations/jobs, configuration, and tests. Prefer current executable behavior and tests over stale documentation; record conflicts and unknowns. For greenfield work, capture stakeholder intent and distinguish confirmed decisions from assumptions.
3. **Specify actor goals and requirements.** Define cohesive use cases, not one use case per screen or button. Derive functional requirements, business rules, quality requirements, domain concepts, and observable acceptance criteria. Keep `As-Is` and `To-Be` separate. Use stable IDs and link requirements to their supporting use cases.
4. **Shape design and test strategy.** Describe only architecture needed to explain responsibilities, boundaries, important flows, data ownership, integrations, and consequential decisions. Derive test scenarios from use-case main, alternate, and failure flows. Identify test level and evidence; distinguish existing automated tests from proposed tests and do not claim unrun verification.
5. **Decompose implementation by user value.** For implementation work, split scope into ordered, reviewable vertical work packages (`WP`) that deliver and verify use-case outcomes end to end. Each package names linked `FR`/`UC`/`TC` IDs, behavior and boundaries, dependencies, acceptance checks, and exit criteria. Use technical foundation tasks when necessary, but avoid a plan made only of file/module chores. Surface sequencing, integration, data migration, and risk.
6. **Implement and keep the contract aligned.** Follow repository patterns and preserve explicit scope. Build in small increments, run the most relevant checks, and report failures with evidence. When actual behavior/design differs from the spec, reconcile the code or update the spec transparently; do not leave contradictory documentation. Ask for review at materially consequential decision points, not for routine reversible steps.
7. **Validate traceability and report.** Check links, IDs, route/capability coverage where relevant, diagram consistency, acceptance-to-test mapping, and package completion. Report created/changed artifacts, implemented scope, checks and results, unresolved review decisions, and anything not verified.

## Traceability and confidence

Keep the chain useful and navigable:

`목표 -> 요구사항(FR/NFR) -> 유스케이스(UC) -> 업무 규칙(BR) / 테스트(TC) -> 작업 패키지(WP) -> 구현 근거`

Use evidence labels for existing-system findings when helpful:

- `구현 확인`: directly observed in code or runtime behavior.
- `테스트 확인`: asserted by an inspected or executed test; state which.
- `설정/스키마 확인`: defined by schema, route, permission, or configuration.
- `추론`: evidence-backed interpretation, not directly specified.
- `확인 필요`: ambiguous, missing, stale, conflicting, or awaiting stakeholder decision.

Not every requirement needs a separate file or automated test. Do not create empty artifacts to satisfy a template, fabricate source links, or mark proposed acceptance checks as passed. Protect credentials and personal data in generated documents.
