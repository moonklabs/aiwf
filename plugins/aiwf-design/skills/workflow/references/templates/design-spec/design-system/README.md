# Design system — entry point

This folder and the Figma SOT file define the design system. Other repository documents link here. Do not copy value tables into other documents; link instead.

## Principles
- **Definitions here, implementation in code.** Token values, components, states and icons are defined by this folder and the Figma variables and components. The code sources are the token and typography sources in `design-spec.config.json`.
- **The bridge is the token map** (`tokens.map`): Figma names → code tokens and typography utilities. The token check compares the Figma snapshot with the code tokens.
- **People apply changes.** Do not generate code from Figma JSON.

## Where each layer lives
| Layer | Definition | Figma (IDs in [figma-map](../figma/figma-map.md)) | Code |
|---|---|---|---|
| Rules | [decisions.md](../decisions.md) | — | Component styles |
| Tokens | | Variable collections, text and effect styles | `tokens.sources` → `tokens.dtcg` |
| Components | | Components page | Component sources |
| States | | | Component variants |
| Icons | | | |

## When applying to code
1. Check the layer's state in [traceability](../traceability.md).
2. Read the definition and Figma, then change the code. If Figma values changed, read the snapshot again first.
3. Run the token check.
4. Update the implementation column and state in traceability. The designer edits the definitions in this folder.
