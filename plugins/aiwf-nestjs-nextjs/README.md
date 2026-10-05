# AIWF NestJS/Next.js

AIWF construction skills for NestJS/Drizzle + Next.js applications.

## Stack purpose

Turns the entity model and use-case specifications produced by aiwf-core into Drizzle migrations and a NestJS backend over PostgreSQL plus a Next.js App Router frontend, with Nest, React and Playwright tests.

The skills consume the specifications produced by `aiwf-core` (entity model and `UC-*.md` use cases).

## Bundled resources

Every skill, nested reference, bundled rule and bundled agent in this folder ships with the plugin. Skill and agent prompt names are unchanged so prompts stay compatible with Claude Code. Run `node --test tests/spec-workflow/stack-provenance.test.mjs` to verify the bundled resources and their provenance records.

## Skills

| Skill | Purpose |
|-------|---------|
| `implement` | Implement a use case across the NestJS/Drizzle API and Next.js UI |
| `drizzle-migration` | Author Drizzle migrations from the entity model |
| `nest-test` | NestJS API tests |
| `react-test` | Next.js / React component tests |
| `playwright-test` | End-to-end Playwright browser tests |

## Prerequisites

- Node.js 20+ and npm/pnpm
- PostgreSQL and Drizzle Kit as the skills expect
- NestJS CLI and Next.js for scaffolding

## Optional MCP servers (documentation only)

The skills work without any MCP server. AIWF does not auto-configure or install MCP servers, and this plugin ships no `.mcp.json`. The optional servers the skills can use are documented in [rules/mcp-servers.md](rules/mcp-servers.md); configure them in your own host only if you want authoritative documentation lookups.

## Host notes

Claude Code loads this plugin through the AIWF marketplace entry. Codex installs the skills and their bundled resources by copying files. This stack bundles no host agents.

## License

Apache-2.0. See [LICENSE](LICENSE) and [NOTICE](NOTICE).
