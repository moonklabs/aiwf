---
name: electron-test
description: Verify Electron main/preload contracts, agent lifecycle and desktop end-to-end use cases with Node tests and Playwright Electron automation.
---

# Test Electron Boundaries and Flows


Verify $ARGUMENTS against current UC/TC definitions and the actual app's scripts. Inspect compiled entry/preload paths and the selected Electron/Playwright versions before creating a launch harness. Use Node's test runner and `tsx` where the project config supports them; use `playwright-core` for Electron automation when selected.

## Layer the evidence

1. Unit/contract tests: validate Zod request/event schemas and business rules; reject unknown operations, malformed payloads, unauthorized sender/frame identities and resource paths outside the authorized workspace. Include traversal/symlink cases, bounded inputs and sanitized errors. A valid payload from a remote frame is still unauthorized.
2. Lifecycle tests: replay agent disconnects, process exits, duplicate/out-of-order events, cancellation races and resume support. Check session isolation, no repeated tool side effects, disposal of listeners/watchers and ownership-aware daemon cleanup. Use temporary user data and fixtures rather than real profiles or credentials.
3. Electron smoke/E2E: launch the built application with the experimental Playwright `_electron` API, locate the intended window, exercise the actual preload bridge and verify renderer-visible outcomes. Use deterministic fake runtime events by default; label a separately authorized live runtime smoke accurately. Close the application and owned processes in test cleanup, including failures.
4. Remote browser checks: verify an untrusted `WebContentsView` cannot reach the app bridge; test navigation/popup/permission policy and view cleanup. A screenshot of the application window is not proof of child-view security or complete child-view automation coverage; record manual gaps explicitly.
5. Packaged-app checks: confirm compiled resource/preload paths and native dependencies in the distribution, distinct from a dev server launch. Run target OS checks required by the UC; use `package` for artifact-specific work.

## Harness limits

Playwright Electron support is experimental. Inspect the installed version's launch requirements and Electron fuses, including `EnableNodeCliInspectArguments`. Do not weaken production fuses or sandbox settings to make automation pass; use a separate test artifact when necessary and record the difference. Electron native dialogs need controlled main-side stubs or a separate manual check. A mocked dialog does not prove OS permission prompts work.

## Completion

Report command, app revision, runtime mode, OS/architecture and TC/BR result. Preserve logs/screenshots only with synthetic or redacted data. Mark unavailable GUI/OS/live-runtime checks as unexecuted, not passed. Update test definitions and affected docs via `sync-docs` or directly; a successful test suite grants no human approval or distribution authorization.


License: MIT. Copyright 2026 moonklabs.
