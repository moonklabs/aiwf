# AIWF Electron/React

Build Electron + React + TypeScript agent desktop applications from `aiwf-core` requirements, entity models, use cases and test definitions. This plugin follows the stack-plugin organization used by `aiwf-nestjs-nextjs`, with desktop process boundaries and agent adapters in place of a web API/database stack.

## Architecture and runtime

Use `src/main/` for windows, files, settings, browser hosts and agent connections; `src/preload/` for a restricted typed IPC bridge; `src/renderer/` for React, shadcn/ui, AI Elements and design tokens; and `src/shared/` for serializable contracts and Zod schemas.

Sally daemon/protocol, PI or another explicitly selected coding-agent library owns model calls, tools, sessions and events. The renderer displays normalized events. An `ai` dependency or `UIMessage` type does not imply model execution through AI SDK. Do not add `@ai-sdk/react`, `useChat` or provider packages merely to render chat. shadcn/ui and AI Elements supply component source to the application; their CLIs are development tools.

## Skills

| Skill | Outcome |
| --- | --- |
| `scaffold` | Inspect an existing app or create the four-directory foundation with a verified dependency plan |
| `implement` | Implement a scoped UC/BR across contracts, main, preload and renderer |
| `agent-runtime` | Integrate a selected agent through a capability-aware adapter with streaming and lifecycle handling |
| `renderer-test` | Verify React/chat states, accessibility and Storybook scenarios with deterministic events |
| `electron-test` | Verify IPC, process lifecycle, filesystem boundaries and Electron end-to-end behavior |
| `package` | Build and inspect macOS/Windows artifacts, including optional native modules and signing requirements |

Start with `aiwf-core` for vision, requirements, glossary, entity model, use cases and test definitions. For an existing app, use `reverse-engineer` to establish observed behavior before planning a change. Run `spec-review` for document consistency. Use the companion `aiwf-spec` `workflow` and `sync-docs` skills to maintain affected documents and evidence after implementation. Skill installation does not initialize an app or start an agent daemon.

## Stack profile

The [stack profile](skills/scaffold/references/stack-profile.md) records the user's requested version baseline and optional features. Exact dependency versions, peer requirements and real imports must be checked in the consuming repository before installation. The supplied reference checkout was unavailable on the authoring machine; this plugin does not claim to have inspected that app or validated the whole dependency combination.

The [architecture guide](skills/implement/references/architecture.md) defines typed IPC, remote browser isolation and an example adapter contract. Its types are an application-owned design example, not a claim about Sally or PI APIs. Existing projects retain their actual protocol and layout when equivalent boundaries already exist.

## Install and invoke

Claude Code:

```text
/plugin marketplace add moonklabs/aiwf
/plugin install aiwf-core@aiwf-plugins
/plugin install aiwf-spec@aiwf-plugins
/plugin install aiwf-electron-react@aiwf-plugins
/aiwf-electron-react:scaffold
/aiwf-electron-react:implement UC-001
```

Codex project installation from this checkout (choose preview or installation):

```bash
node scripts/install-spec-skills.mjs --project /path/to/project --stack electron-react --dry-run
node scripts/install-spec-skills.mjs --project /path/to/project --stack electron-react
```

This installs nine core/workflow skills plus six desktop skills. The desktop names become `aiwf-electron-react-scaffold`, `aiwf-electron-react-implement`, `aiwf-electron-react-agent-runtime`, `aiwf-electron-react-renderer-test`, `aiwf-electron-react-electron-test` and `aiwf-electron-react-package`. Existing destinations are refused before copying any skill; an existing installation needs a separately scoped migration.

For standalone skills CLI installation from a local checkout, explicitly choose the skill and host:

```bash
npx skills add /path/to/aiwf/plugins/aiwf-electron-react --skill implement --agent codex
npx skills add /path/to/aiwf/plugins/aiwf-electron-react --skill implement --agent claude-code
```

These are alternatives; standalone installation retains the name `implement` and does not install the companion core. Each skill includes a full MIT license for standalone copies. Remote marketplace/skills installation becomes available once these files reach the repository's default branch. No MCP server, model runtime, provider account or optional native dependency is installed automatically.

## Verification and review

Repository tests verify packaging metadata, complete skill installation, naming and preservation behavior. They do not prove a consuming Electron app, Sally/PI integration, native modules or signed distributions work. Those need the actual app, selected runtime and target OS. Record executed checks and unverified cases; maintain the [Korean review copy](../../docs/ko-skills/aiwf-electron-react/README.ko.md) alongside changes.

## License

MIT. See [LICENSE](LICENSE) and [NOTICE](NOTICE).
