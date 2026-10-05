# Design work — session start

Shared instructions for every coding agent. Keep the rules in this file only.

This folder is the design workspace. Its results are the Figma file and the documents here. Code changes follow the repository root instructions.

## First, in every new session
> **This folder is the single source of truth.** Other machines and agents have no private memory, so every fact, decision and ID belongs in these documents.

1. [HANDOFF.md](HANDOFF.md) — what is done and what is next
2. [decisions.md](decisions.md) — confirmed decisions (do not ask again)
3. The Figma IDs of the area in [figma/figma-map.md](figma/figma-map.md)

## Rules
- Pick the session role first (aiwf-design workflow). Figma may be written only in the designer-work role and only in the SOT file `figma.fileKey` of `design-spec.config.json`. Files in `figma.referenceFiles` are read-only.
- Link between documents with relative paths only. Never use absolute paths such as `/Users/…`.
- Plans go to `memories/plans/`, even when a tool defaults to another folder. Do not create a `docs/` folder inside this folder.

## Relation to the planning documents
- The planning documents (requirements · use_cases · test_cases) and the other upper-level documents (glossary, product, architecture, vision) are references. Do not edit them in design work.
- Connect them only in [traceability.md](traceability.md).
- When planning changes, the state becomes `기획 변경 대기` and one line goes to the HANDOFF section "기획 변경 대기".
- When a design decision differs from planning, mark the row `기획 변경 필요`; planning reflects it with a new ID.
