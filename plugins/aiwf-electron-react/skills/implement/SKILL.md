---
name: implement
description: Implement a scoped use case in an Electron React TypeScript app across shared contracts, main, preload and renderer, preserving the selected coding-agent runtime.
---

# Implement an Electron Use Case


Implement $ARGUMENTS using the companion core's UC, business rules, TC definitions, entity model and glossary. Read the existing feature and [architecture guide](references/architecture.md) before editing. Reconcile an existing implementation rather than creating a second IPC route, agent connection or chat state store. If behavior is still ambiguous, resolve only decisions that affect this change; analysis-only requests end with documentation.

## Trace the change through its boundaries

- Map affected UC steps and `UC-001 BR-001` style rules to shared contracts, main handlers/services, preload APIs, renderer state and tests. Carry existing rule IDs into enforcement comments and test names. Do not assign a new ID to the same rule merely because it crosses processes.
- Keep OS/filesystem/browser/agent authority in main or its explicitly owned service process. Shared modules contain serializable types and Zod schemas, not privileged implementations. Main validates sender/frame, payload, capability and resource scope before acting; type correctness alone is insufficient.
- Preload exposes operation-specific methods and filtered event data with an unsubscribe path. Do not expose arbitrary channels, raw `ipcRenderer`, Electron event objects, generic shell commands or unrestricted filesystem access.
- Render adapter-owned streaming state with local shadcn/ui and AI Elements components. Use type-only `ai` imports where needed; preserve the selected model/tool execution path. `useChat` or a provider transport requires an explicit runtime architecture choice, not a cosmetic chat change.
- Keep reasoning, tool arguments/results, Markdown, Mermaid, links and file previews as untrusted content. Do not execute displayed tool text or turn model output into IPC authority. Apply sanitization/link rules and bound rendering work for large or malformed outputs.
- Support the specified loading, empty, reconnecting, failed, cancelled and completed states. Reconcile ordered/deduplicated events by session/run rather than append every transport message blindly; cancellation and tool consent must reflect actual backend results.
- Introduce optional terminal, tree/watch/search, document processing or telemetry only when the UC needs it. Put native/resource work behind narrow main-owned services and dispose watchers, processes, event subscriptions and browser views on close.

## Test and complete

Implement scoped tests as part of the request or use `renderer-test` and `electron-test` for focused verification. Use `agent-runtime` when the provider/daemon boundary changes and `package` when native dependencies, compiled paths or distribution behavior changes. Run available checks, retain failures and distinguish mock event replay from a live model run. Update affected documents through `sync-docs` or directly, then run `spec-review` for document consistency. Report UC/BR coverage, changed files, actual checks and remaining gaps without changing unmet requirements to match accidental implementation behavior.


License: MIT. Copyright 2026 moonklabs.
