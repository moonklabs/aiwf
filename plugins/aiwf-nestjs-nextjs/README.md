# AIWF NestJS/Next.js

AI Unified Process construction skills for NestJS/Drizzle + Next.js applications. Imported unchanged from the AI Unified Process Marketplace by
Swift Ugandan, pinned in [UPSTREAM.json](UPSTREAM.json).

## Stack purpose

Turns the entity model and use-case specifications produced by aiwf-core into Drizzle migrations and a NestJS backend over PostgreSQL plus a Next.js App Router frontend, with Nest, React and Playwright tests.

The skills consume the specifications produced by `aiwf-core` (entity model and
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
| `implement` | Implement a use case across the NestJS/Drizzle API and Next.js UI |
| `drizzle-migration` | Author Drizzle migrations from the entity model |
| `nest-test` | NestJS API tests |
| `react-test` | Next.js / React component tests |
| `playwright-test` | End-to-end Playwright browser tests |

## Prerequisites

- Node.js 20+ and npm/pnpm
- PostgreSQL and Drizzle Kit as the upstream skills expect
- NestJS CLI and Next.js for scaffolding

## Optional MCP servers (documentation only)

The skills work without any MCP server. AIWF does not auto-configure or install MCP
servers, and this plugin ships no `.mcp.json`. The optional servers the upstream
skills can use are documented in [rules/mcp-servers.md](rules/mcp-servers.md);
configure them in your own host only if you want authoritative documentation lookups.

## Host notes

Claude Code loads this plugin through the AIWF marketplace entry. Codex installs the skills and their bundled resources by copying files. This stack bundles no host agents.

## License and credits

Apache-2.0. Original work by Swift Ugandan and the AI Unified Process
contributors - https://unifiedprocess.ai. See [LICENSE](LICENSE) and [NOTICE](NOTICE).
Original source: https://github.com/AI-Unified-Process/marketplace/tree/065dadda0f696c29ff2bacbda31b38152082e6fa/aiup-nestjs-nextjs
