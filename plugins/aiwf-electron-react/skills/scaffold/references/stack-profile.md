# Agent Desktop Stack Profile

## Requested baseline and evidence

This is the user's target profile, recorded on 2026-10-05, not a verified compatibility matrix. The supplied reference path could not be read on the authoring machine. In each consuming app, inspect its package declarations, lockfile and actual imports before selecting exact releases. Record discrepancies and resolve unsupported peer/engine combinations without silently upgrading the request. Electron's embedded Node and the Node used to build the app are different version constraints. This is the plugin's reference profile; explicit constraints in the consuming project take precedence.

| Area | Requested baseline | Responsibility |
| --- | --- | --- |
| Desktop | Electron 43.3 | Windows, browser hosts, IPC, file/OS access |
| Renderer | React 19.3 + TypeScript | Components and type contracts |
| Build | electron-vite 5 + Vite 7 | Separate main/preload/renderer development and bundles |
| Distribution | electron-builder 26.15 | macOS/Windows artifacts |
| Styling | Tailwind CSS 4.3 | CSS variables, tokens and utilities |
| Base UI | shadcn/ui + Radix UI 1.6 | App-owned components and accessible primitives |
| Chat UI | AI Elements 1.9 + `ai` 7.0 | Message/reasoning/tool display and `UIMessage` types |
| Agent | Sally daemon/protocol, PI or selected alternative | Model calls, tools/REPL, sessions and events |
| Transport/schema | `ws` + Zod 4.6 | Selected WebSocket transport and runtime validation |
| Response rendering | Streamdown 2.6 + Shiki 3.23 | Streaming Markdown and code highlighting |
| Diagrams/math | Mermaid + KaTeX | Displayed diagrams and math |
| Styling helpers | Lucide + CVA + clsx + tailwind-merge | Icons, variants and class composition |
| Design collaboration | Storybook 10.6 | Tokens, shell and component scenarios |

Do not infer exact npm coordinates from display names. Radix may use individual packages or a unified package; inspect generated imports. Sally/PI names are architectural choices, not supplied install coordinates. The chat renderer may use only type imports from `ai`; no `@ai-sdk/react`, `useChat` or provider is assumed. Model execution stays in the selected agent runtime unless the user explicitly chooses a different architecture.

## Dependency placement and sources

Keep shadcn/ui and AI Elements generators in development tooling when retained; generated component source lives in the app. React/Radix/Streamdown and other imported UI dependencies supply runtime behavior. Inspect the selected component files and their transitive requirements before adding/removing packages. Type-only imports still need types available to the build, but do not prove runtime model calls.

Use Storybook in development with synthetic data. Keep Electron build tools and TypeScript in development dependencies. Runtime packages externalized from main/preload must be available in the packaged app; a package's name alone is not enough to decide dependency placement. Keep shared schema code bundleable into a sandboxed preload, and leave native code in main or an owned service process.

## Optional feature selection

| Feature | Candidate packages | Conditions |
| --- | --- | --- |
| Terminal | `@xterm/xterm` + `@lydell/node-pty` | Renderer display, main-owned PTY; scoped command/cwd/environment and cleanup |
| Files | `@pierre/trees` + `@parcel/watcher` + `@vscode/ripgrep` | Tree display, authorized roots, watcher/search cancellation, native/sidecar packaging |
| Documents | `pdfjs-dist` + `exceljs` + `@napi-rs/canvas` / `jimp` | Input size/type bounds, worker/resource paths and chosen main/renderer processing |
| Persistence/observability | `electron-store` + `electron-log` + OpenTelemetry | Schema/migration/retention, secret redaction, explicit telemetry destination/consent |
| Verification | Node test runner + `tsx` + `playwright-core` + `pixelmatch` | Separate pure logic, real Electron and deterministic visual checks |

These are capability choices, not a bulk-install list. Do not treat `electron-store` as a secret vault or turn telemetry on implicitly. Choose only the packages needed for the requested UC; check native/prebuilt support on each target OS/architecture before promising distribution.

## Official implementation references

Reviewed on 2026-10-05 for behavior, not validation of the target version combination:

- [electron-vite production builds](https://electron-vite.org/guide/build) and [dependency handling](https://electron-vite.org/guide/dependency-handling): verify the installed major's main/preload externalization and production paths.
- [AI Elements usage](https://elements.ai-sdk.dev/docs/usage): components are project source; the displayed `useChat` example does not establish the app's runtime.
- [electron-builder v26 multi-platform builds](https://www.electron.build/v26/docs/features/multi-platform-build/): check target-native dependencies and signing environment.

Record the actual dependency decision and evidence in the consuming app's existing architecture document. Never label requested versions as installed, compatible or tested without that evidence.
