---
name: scaffold
description: Create or adapt an Electron, React and TypeScript agent desktop foundation from aiwf-core specifications; inspect dependencies and process boundaries before scaffolding.
---

# Scaffold an Agent Desktop


Create or adapt the app described by $ARGUMENTS. Start from the companion `requirements`, `entity-model`, `use-case-spec` and `test-case` documents. For brownfield work, inspect the actual implementation and use `reverse-engineer` when behavior is undocumented. Preserve stable UC/BR/TC IDs and existing application files. For an analysis-only or planning-only request, produce the dependency/boundary plan and stop before scaffolding code or installing dependencies.

## Inspect before writing

Read the [stack profile](references/stack-profile.md). Inspect package manifests, lockfile, Electron/vite/builder configuration, TypeScript projects, component registry configuration, existing IPC and agent imports. Distinguish installed CLI generators from copied runtime components and type-only `ai` imports from actual model execution. Record observed versions, evidence paths and unresolved compatibility in the project's existing architecture documents under `docs/architecture/`.

In a new app, use Electron, React, TypeScript, electron-vite/Vite, electron-builder, Tailwind, shadcn/Radix, AI Elements, Streamdown/Shiki, Mermaid/KaTeX, Lucide/CVA/clsx/tailwind-merge and Zod as the requested baseline. Use `ws` for a selected WebSocket runtime transport. Choose and verify exact package coordinates, releases and peer requirements before editing dependencies; the profile is not a tested lockfile. Do not silently substitute incompatible versions. Keep optional features opt-in to the requested use case.

## Build the foundation

1. Establish vision, required UC/BR behavior, test definitions and selected agent runtime. Fill known facts; keep missing product decisions visible instead of inventing permissions, retention or billing policy.
2. Create or reconcile `src/main/`, `src/preload/`, `src/renderer/` and `src/shared/`. Existing equivalent layouts need no wholesale move. Configure separate privileged, bridge and renderer builds/types; renderer must not import Node, Electron or runtime credentials.
3. Create a small shell with design tokens and representative chat states. Use existing generated component sources first; inspect CLI-generated changes before keeping them. Storybook documents shell/components with synthetic events and no live daemon.
4. Add typed, operation-specific IPC contracts validated in main with Zod. Expose only the operations needed by the UC through preload. Authenticate the sender/frame independently of payload validation. Use context isolation, sandboxing and no renderer Node integration.
5. Record the selected runtime's package/CLI, protocol version and supported capabilities. If unavailable, provide a clearly labeled disconnected/mock UI and report the integration gap; do not invent Sally or PI APIs or claim a working agent. Use `agent-runtime` for a real connection.
6. Configure development, typecheck, build, test and local package scripts consistent with the detected tool versions. Keep remote publishing out of local packaging. Main/preload runtime dependencies and optional native binaries must be included correctly in packaged output.

## Verify and hand off

Run the applicable typecheck/build and smoke launch when the environment supports Electron. Verify the preload bridge in the actual Electron window, not only the Vite browser. Link affected UC/TCs to the planned `renderer-test` and `electron-test` checks; finish documents with `sync-docs` if installed, otherwise update them directly. Report created/adapted files, actual commands/results, dependency decisions, selected optional features and remaining runtime/OS gaps. Scaffolding success is not model execution or signed-release validation.


License: MIT. Copyright 2026 moonklabs.
