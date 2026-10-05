---
name: agent-runtime
description: Connect Sally, PI or another selected coding-agent runtime to an Electron desktop through a verified adapter, including sessions, streaming, tool consent, cancellation and cleanup.
---

# Integrate an Agent Runtime


Integrate the runtime selected for $ARGUMENTS. Inspect installed packages, CLI help, protocol definitions, real imports and existing daemon ownership first. Sally daemon/protocol and PI are possible backends, not mandatory package names or interchangeable APIs. Do not guess their module coordinates, RPC methods, event names or authentication. If evidence is missing, record the exact missing artifact and implement only the contract/mock boundary that the task permits.

## Adapter and transport

1. Document the actual execution path from renderer action through preload/main to runtime and back. List supported capabilities such as session creation, resume, cancellation, tool approval and attachments; represent unsupported capabilities explicitly in UI and tests.
2. Place the adapter in main or an owned worker/service process. Normalize provider events into app-owned serializable messages with stable session/run/event identity. Validate both IPC requests and incoming runtime events with bounded schemas; reject malformed, oversized, unknown-version or wrong-session traffic before state changes.
3. For `ws`, use the runtime's documented endpoint/authentication and TLS for remote connections. Bind a local service to loopback with authenticated access when the app owns it. Browser session cookies are not daemon authorization. Do not put tokens or executable paths under renderer control.
4. Preserve stream ordering, deduplicate retransmissions and apply backpressure/coalescing without losing tool boundaries or final outcomes. Buffer partial tool arguments until valid; do not execute incomplete streamed JSON. Normalize reasoning and tool-display data without exposing secrets.
5. Carry approvals and cancellation through the runtime's real protocol. Preserve the runtime's authorization policy; a model-emitted approval event does not grant permission. Timeouts/disconnects produce an unknown or failed state until reconciled; do not label a run cancelled merely because a button was clicked. Reconnect may resume only when supported, with stable identity and no duplicate tool side effects.
6. Track ownership: detach from an externally managed daemon; stop only child processes/sessions owned by this app and authorized scope. On window close or restart, release subscriptions and pending requests, redact logs and apply the documented retention policy. Use the existing main-side credential store where available. If none exists, record the credential-storage decision before adding live credentials; do not assume a store is already present.

## Verification

Use recorded/synthetic events first: deltas, malformed messages, duplicate/out-of-order events, disconnect/reconnect, rejected tool actions, unsupported capabilities, cancellation races and daemon exits. Verify no duplicate side effect and no stale event crossing sessions. Run a live smoke only when the selected runtime is installed/configured and its access/cost is authorized. Report adapter version, protocol evidence, mock versus live results, supported capabilities and blockers. Refresh affected UC/TC and architecture documents via `sync-docs` or directly.


License: MIT. Copyright 2026 moonklabs.
