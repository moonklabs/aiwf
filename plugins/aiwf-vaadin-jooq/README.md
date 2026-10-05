# AIWF Vaadin/jOOQ

AIWF construction skills for Vaadin/Hilla and jOOQ applications.

## Stack purpose

Turns the entity model and use-case specifications produced by aiwf-core into versioned Flyway migrations, Vaadin Flow / Hilla application code backed by jOOQ, and layered tests (Karibu, browserless, Hilla/Vitest, Playwright).

The skills consume the specifications produced by `aiwf-core` (entity model and `UC-*.md` use cases).

## Bundled resources

Every skill, nested reference, bundled rule and bundled agent in this folder ships with the plugin. Skill and agent prompt names are unchanged so prompts stay compatible with Claude Code. Run `node --test tests/spec-workflow/stack-provenance.test.mjs` to verify the bundled resources and their provenance records.

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
- A relational database plus jOOQ code generation and Flyway, as the skills expect

## Optional MCP servers (documentation only)

The skills work without any MCP server. AIWF does not auto-configure or install MCP servers, and this plugin ships no `.mcp.json`. The optional servers the skills can use are documented in [rules/mcp-servers.md](rules/mcp-servers.md); configure them in your own host only if you want authoritative documentation lookups.

## Host notes

Claude Code loads this plugin through the AIWF marketplace entry. Codex installs the skills and their bundled resources by copying files, but Codex cannot register host agents by file copy. The bundled agent prompt (`agents/uc-coverage.md`) is installed as a resource; running it as the `uc-coverage` sub-agent still needs a native host mapping.

## License

Apache-2.0. See [LICENSE](LICENSE) and [NOTICE](NOTICE).
