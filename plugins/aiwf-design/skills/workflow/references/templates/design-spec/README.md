# Design-spec guide

| Folder · file | What | When to read |
|---|---|---|
| [AGENTS.md](AGENTS.md) | Shared rules for every agent | Loaded automatically · change rules only here |
| [HANDOFF.md](HANDOFF.md) | Current state · next steps · open decisions | **At the start of every session** |
| [decisions.md](decisions.md) | Decisions the user confirmed | Before work that needs a decision |
| [traceability.md](traceability.md) | Planning (UC/FR) ↔ design ↔ implementation and the current state; the only link to the planning documents | When planning changed or design is applied to code |
| [figma/figma-map.md](figma/figma-map.md) | Files · pages · sections · components · variable IDs | Before Figma work |
| [design-system/README.md](design-system/README.md) | Design system entry point: which document, Figma section and code each layer uses | When looking for the design system or applying it |
| `memories/plans/` | Work plans and their history. **Not a source of truth** | When continuing that work |

## For new work
1. If the work needs a plan, write `memories/plans/YYYY-MM-DD-<name>.md` first.
2. Record a confirmed decision as one line in [decisions.md](decisions.md).
3. Add new Figma section and component IDs to [figma/figma-map.md](figma/figma-map.md).
4. When done, update the plan's "진행 기록" and [HANDOFF.md](HANDOFF.md).

Project paths, the Figma file key and checks are in `design-spec.config.json` in this folder. Run the design-spec lint with `--strict` before a commit.
