# AIWF Vaadin/jOOQ

AI Unified Process construction skills for Vaadin/Hilla and jOOQ applications. Imported unchanged from the AI Unified Process Marketplace by
Simon Martinelli, pinned in [UPSTREAM.json](UPSTREAM.json).

## Stack purpose

Turns the entity model and use-case specifications produced by aiwf-spec into versioned Flyway migrations, Vaadin Flow / Hilla application code backed by jOOQ, and layered tests (Karibu, browserless, Hilla/Vitest, Playwright).

The skills consume the specifications produced by `aiwf-spec` (entity model and
`UC-*.md` use cases) and are independent of the upstream `aiup-core` plugin.

## Raw source preservation

Every skill, nested reference, bundled rule and bundled agent in this folder is a
byte-identical copy of the upstream plugin at commit `065dadda0f696c29ff2bacbda31b38152082e6fa`. AIWF adds only this
README, [UPSTREAM.json](UPSTREAM.json) and the `.claude-plugin/plugin.json` manifest;
no skill content is patched. Skill and agent prompt names are kept exactly as
upstream so the prompts stay compatible with Claude Code. Run
`node --test tests/spec-workflow/stack-provenance.test.mjs` to re-verify every hash.

## Skills

| Skill | Purpose |
|-------|---------|
| `implement` | Implement a use case as Vaadin Flow views/forms/grids and jOOQ queries |
| `implement-hilla` | Implement a use case with Hilla endpoints and React views |
| `flyway-migration` | Author versioned Flyway migrations from the entity model |
| `karibu-test` | Karibu unit tests for Vaadin views |
| `browserless-test` | Browserless Vaadin UI tests |
| `hilla-test` | Hilla endpoint and React view tests |
| `playwright-test` | End-to-end Playwright browser tests |
| `coverage-check` | Read-only uc-coverage audit of a UC/TC against its specification |

## Prerequisites

- JDK 21+ and Maven
- Node.js/npm for the Vaadin frontend toolchain
- A relational database plus jOOQ code generation and Flyway, as the upstream skills expect

## Optional MCP servers (documentation only)

The skills work without any MCP server. AIWF does not auto-configure or install MCP
servers, and this plugin ships no `.mcp.json`. The optional servers the upstream
skills can use are documented in [rules/mcp-servers.md](rules/mcp-servers.md);
configure them in your own host only if you want authoritative documentation lookups.

## Host notes

Claude Code loads this plugin through the AIWF marketplace entry. Codex installs the skills and their bundled resources by copying files, but Codex cannot register host agents by file copy. The bundled agent prompt (`agents/uc-coverage.md`) is installed as a resource; running it as the `uc-coverage` sub-agent still needs a native host mapping.

## License and credits

Apache-2.0. Original work by Simon Martinelli and the AI Unified Process
contributors - https://unifiedprocess.ai. See [LICENSE](LICENSE) and [NOTICE](NOTICE).
Original source: https://github.com/AI-Unified-Process/marketplace/tree/065dadda0f696c29ff2bacbda31b38152082e6fa/aiup-vaadin-jooq
