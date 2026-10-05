# Agent Desktop Architecture

## Process map

Use this as a starting layout, not a reason to reorganize an existing app with equivalent boundaries.

```text
src/
├─ main/       # windows, files, settings, browser hosts, agent adapters
├─ preload/    # restricted typed IPC facade
├─ renderer/   # React, UI sources, tokens, event-driven view state
└─ shared/     # serializable contracts and Zod schemas
```

Main owns windows, privileged resources and agent lifecycle; preload exposes a small facade; renderer presents state; shared defines data contracts. Dependency direction is from each process to shared, never from renderer to privileged main code. For expensive or untrusted parsing, use a suitable owned worker/service rather than block the renderer or main event loop.

## IPC and resource authorization

Use context isolation, sandboxing, disabled Node integration and a restrictive CSP. Expose one method per supported operation through `contextBridge`; raw `ipcRenderer`, arbitrary channel names and Electron event objects stay private. Strip event objects before invoking a renderer callback and return an unsubscribe function.

Main authorizes the known application webContents and its expected frame/origin, separately from Zod validation. Reject missing/unexpected sender frames, remote pages and unauthorized subframes. Trust a configured production app origin/resource and the exact development origin rather than arbitrary prefixes or all `file:` pages. Resolve and enforce selected workspace roots, symlink handling, file size and URL/shell policies in main. Do not turn a renderer-supplied path, session ID or model response into authority.

## Browser hosts

Host untrusted pages in an isolated `WebContentsView` without the app's privileged preload bridge. Use separate session partitions as required by the product's persistence policy; identical partition names share session state, and `persist:` persists it. A partition is not an IPC authorization check. Restrict navigation, new windows, downloads, permissions and external URL opening to the specified product policy. Treat page text as content, not instructions to the app's agent.

Track view ownership and cleanup explicitly. With `BaseWindow`, close child webContents when finished; closing the base window does not automatically release them. Do not allow remote page credentials, downloaded files or agent tool output to reach unrelated sessions.

## Application-owned adapter example

The example below illustrates a serializable UI boundary. It intentionally omits provider-specific details and is not a complete runtime implementation. Adapt existing app contracts rather than replace them. Inspect the actual runtime's types/protocol before mapping events; preserve capability gaps and enforce ownership in main.

```ts
// Application-owned example, not a Sally or PI protocol declaration.
type AgentEvent = {
  sessionId: string;
  runId: string;
  eventId: string;
  sequence: number;
} & (
  | { kind: 'text-delta'; text: string }
  | { kind: 'tool'; toolId: string; state: 'pending' | 'done' | 'failed' }
  | { kind: 'finished'; outcome: 'completed' | 'cancelled' | 'failed' }
);

type CapabilitySupport = 'unknown' | 'unsupported' | 'supported';

interface AgentCapabilities {
  resume: CapabilitySupport;
  cancel: CapabilitySupport;
  toolApproval: CapabilitySupport;
}

interface DesktopAgentApi {
  submit(input: { sessionId: string; text: string }): Promise<{ runId: string }>;
  cancel(input: { sessionId: string; runId: string }): Promise<{ accepted: boolean }>;
  subscribe(listener: (event: AgentEvent) => void): () => void;
}
```

Keep capabilities `unknown` until verified; enable an operation only when its capability is `supported`. Implement matching runtime schemas and bounds before accepting data. Main assigns/binds run identity to the authorized session and sender; subscribing must not broadcast other windows' or sessions' events. Event sequence is meaningful within its documented run, not a global counter. An accepted cancel request is not a terminal cancellation event. Preserve adapter state until the actual outcome is reconciled. Add approval/resume operations only when supported by the selected backend; do not fake success.

## UI and rendering

Keep copied shadcn/ui and AI Elements sources in renderer and inspect their installed imports. Normalize agent output before mapping to installed `UIMessage` parts or component props. `ai` type imports do not require AI SDK model providers; keep executable tools, tokens and model clients outside renderer.

Treat streaming Markdown/HTML, Mermaid, math, code blocks and attachment previews as untrusted. Use library sanitization/security options, a restrictive CSP and explicit URL/file opening policies; never evaluate code merely because it appears in a message. Bound payload size and rendering work, and preserve accessible labels/focus during streaming. Storybook uses synthetic adapters; no credentials or live daemon is needed for component review.

## Official references

Behavior references reviewed on 2026-10-05; recheck against the consuming app's installed versions:

- [Electron security](https://www.electronjs.org/docs/latest/tutorial/security): sender validation, sandboxing, IPC and navigation.
- [WebPreferences](https://www.electronjs.org/docs/latest/api/structures/web-preferences): context isolation, preload and session partitions.
- [BaseWindow resource management](https://www.electronjs.org/docs/latest/api/base-window#resource-management): child webContents lifecycle.
- [Playwright Electron](https://playwright.dev/docs/api/class-electron): experimental automation and launch limitations.
- [electron-builder v26 macOS signing](https://www.electron.build/v26/docs/features/code-signing/code-signing-mac/) and [Windows signing](https://www.electron.build/v26/docs/features/code-signing/code-signing-win/): use major-appropriate configuration and verify actual artifacts.
