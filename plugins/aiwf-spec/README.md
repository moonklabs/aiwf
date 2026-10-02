# AIWF Spec

A portable, use-case-driven specification workflow. Derived from the AI Unified Process Marketplace by Simon Martinelli, pinned in [UPSTREAM.json](UPSTREAM.json). This plugin and its resources are Apache-2.0; see [LICENSE](LICENSE) and [NOTICE](NOTICE).

The seven upstream core SKILL.md files cover requirements, entities, use cases, journey definitions, reverse engineering and specification review. They are restored byte-identical to upstream, as are their references and Python parsers; the only upstream change is the appended AIWF attribution in [NOTICE](NOTICE). AIWF adds `workflow`, host-neutral task tracking, and explicit evidence/approval boundaries. Upstream generation CI is not included. Context7 is optional and no MCP server is automatically installed.

Stack implementations now ship as sibling plugins, each vendoring its upstream `skills/`, `rules/`, `agents/`, `LICENSE` and `NOTICE` unchanged with a per-plugin `UPSTREAM.json`: `aiwf-vaadin-jooq`, `aiwf-angular-jpa`, `aiwf-blazor-dotnet` and `aiwf-nestjs-nextjs`. Install a stack with `scripts/install-spec-skills.mjs --stack <name>`; see the repository [SKILLS inventory](../../docs/modernization/SKILLS.ko.md).

Canonical project artifacts are `docs/vision.md`, `requirements.md`, `glossary.md`, `entity_model.md`, `use_cases.puml`, `use_cases/UC-*.md`, `test_cases/TC-*.md`, and optional `processes/*.bpmn`. Keep English structural headings/status tokens; bodies may be Korean. Structural lint does not guarantee Korean semantic completeness.

Claude Code uses the marketplace's `aiwf-spec` entry. Codex receives complete skill folders through `scripts/install-spec-skills.mjs`; installed names are prefixed `aiwf-` and include their LICENSE/NOTICE and sibling parsers. File installation is tested; live host skill discovery/model execution is a separate validation gate.

Run the local `aiwf-spec` CLI for initialization, pins, drift detection and evidence packets. It does not invoke an AI model, execute application checks, publish to Sprintable, or grant approval. See the repository [Korean guide](../../docs/modernization/DIRECTION.ko.md).
