---
name: renderer-test
description: Test Electron React UI and AI Elements chat states using deterministic runtime events, accessibility checks, Storybook stories and optional visual comparison.
---

# Test the Desktop Renderer


Test the UI scope in $ARGUMENTS against its core TC/UC/BR definitions. Inspect the existing test scripts, copied shadcn/ui and AI Elements components, Storybook configuration, bridge types and event reducer. Test observable user behavior and contract invariants, not component implementation details.

## Select the harness

Use the project's existing component harness. With the requested Node test runner and `tsx`, test pure event normalization/reducers separately; those tools alone do not provide a browser DOM. Use existing browser/Storybook automation or `electron-test` for real DOM and preload behavior. Do not silently add Vitest, jsdom, Testing Library or `@ai-sdk/react` to make a sample test compile.

## Cover the user states

- Replay synthetic events for idle, streaming, reasoning display, tool pending/approved/denied/failed, attachment failure, reconnecting, cancelled and completed states as required by the UC. Repeated or stale events must not duplicate messages or mix runs; tool output and Markdown must remain inert content.
- Assert labels, keyboard order, focus restoration, dialog behavior, accessible status announcements, error recovery and scroll behavior while tokens arrive. Test long conversations and bounded rendering without printing private transcripts into snapshots.
- Verify message parts and tool displays against the installed `UIMessage` types and component props. Type-only use of `ai` does not authorize starting a model or replacing the app's transport with `useChat`.
- Create or update Storybook stories for relevant shell, token and chat states using synthetic adapters. Stories must not connect to a real daemon, read a user's files or require production credentials.
- Use `pixelmatch` only when selected for stable visual checks. Fix viewport, fonts, OS/DPR assumptions, clock and animation; store the target environment and diff evidence. A screenshot baseline update needs an intentional design reason and must not hide a regression.

## Report and synchronize

Name checks by TC/UC and applicable rules, run available commands and retain failed/unexecuted cases. State whether the result came from pure logic, a browser, Storybook or Electron; only the latter exercises the real preload. Update test definitions and UI documentation with `sync-docs` or directly. Visual similarity, generated stories and passing mocks do not establish live agent execution.


License: MIT. Copyright 2026 moonklabs.
