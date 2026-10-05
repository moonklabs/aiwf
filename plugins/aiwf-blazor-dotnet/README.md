# AIWF Blazor/.NET

AIWF construction skills for C# / Blazor (.NET 10) applications.

## Stack purpose

Turns the entity model and use-case specifications produced by aiwf-core into EF Core migrations and Vertical Slice feature folders (Commands/Queries, EF Core entities, Blazor components), with .NET, bUnit and Playwright tests.

The skills consume the specifications produced by `aiwf-core` (entity model and `UC-*.md` use cases).

## Bundled resources

Every skill, nested reference, bundled rule and bundled agent in this folder ships with the plugin. Skill and agent prompt names are unchanged so prompts stay compatible with Claude Code. Run `node --test tests/spec-workflow/stack-provenance.test.mjs` to verify the bundled resources and their provenance records.

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
- SQL Server or PostgreSQL as the skills expect

## Optional MCP servers (documentation only)

The skills work without any MCP server. AIWF does not auto-configure or install MCP servers, and this plugin ships no `.mcp.json`. The optional servers the skills can use are documented in [rules/mcp-servers.md](rules/mcp-servers.md); configure them in your own host only if you want authoritative documentation lookups.

## Host notes

Claude Code loads this plugin through the AIWF marketplace entry. Codex installs the skills and their bundled resources by copying files. This stack bundles no host agents.

## License

Apache-2.0. See [LICENSE](LICENSE) and [NOTICE](NOTICE).
