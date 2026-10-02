# Core package correction — 2026-10-03

Historical plan. Legacy-retention decisions are superseded by [LEGACY-REMOVAL-PLAN.md](LEGACY-REMOVAL-PLAN.md) on 2026-10-03.

The upstream core skills were imported under aiwf-spec, while aiwf-core still advertised legacy session and task commands. Make the methodology foundation explicit: aiwf-core owns the seven original core skills and their provenance; aiwf-spec owns only the AIWF workflow extension. Preserve legacy core files under aiwf-core-legacy with a separate marketplace entry. Keep the aiwf-spec CLI and installed Codex skill names stable.

Before moving files, add a regression proving that the marketplace/default installer points to the methodology core, the original hashes remain exact, the wrapper has no duplicate core skills, and legacy resources are preserved. Then update paths, manifests, installation, validation and guides. Verify targeted tests, original Python self-tests, example lint, dependencies and packaged contents. No model execution, automatic MCP installation or Sprintable publication is part of this correction.
