# AIWF Blazor/.NET

AI Unified Process construction skills for C# / Blazor (.NET 10) applications. Imported unchanged from the AI Unified Process Marketplace by
Carl J. Mosca, pinned in [UPSTREAM.json](UPSTREAM.json).

## Stack purpose

Turns the entity model and use-case specifications produced by aiwf-spec into EF Core migrations and Vertical Slice feature folders (Commands/Queries, EF Core entities, Blazor components), with .NET, bUnit and Playwright tests.

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
| `implement` | Implement a use case as a Vertical Slice with Blazor components and CQRS handlers |
| `ef-migration` | Author EF Core migrations from the entity model |
| `dotnet-test` | .NET unit and integration tests |
| `bunit-test` | bUnit component tests for Blazor |
| `playwright-test` | End-to-end Playwright browser tests |

## Prerequisites

- .NET 10 SDK
- EF Core tooling (dotnet ef)
- SQL Server or PostgreSQL as the upstream skills expect

## Optional MCP servers (documentation only)

The skills work without any MCP server. AIWF does not auto-configure or install MCP
servers, and this plugin ships no `.mcp.json`. The optional servers the upstream
skills can use are documented in [rules/mcp-servers.md](rules/mcp-servers.md);
configure them in your own host only if you want authoritative documentation lookups.

## Host notes

Claude Code loads this plugin through the AIWF marketplace entry. Codex installs the skills and their bundled resources by copying files. This stack bundles no host agents.

## License and credits

Apache-2.0. Original work by Carl J. Mosca and the AI Unified Process
contributors - https://unifiedprocess.ai. See [LICENSE](LICENSE) and [NOTICE](NOTICE).
Original source: https://github.com/AI-Unified-Process/marketplace/tree/065dadda0f696c29ff2bacbda31b38152082e6fa/aiup-blazor-dotnet
