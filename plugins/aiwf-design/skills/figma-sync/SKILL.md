---
name: figma-sync
description: Use when Figma variables, text styles, effect or paint styles changed and code tokens must match, when the project's Figma token check reports a mismatch, or when a Figma readback response came back cut off ("truncated to 20kb") — "피그마 색·텍스트 스타일 바뀜", "토큰 동기화", "readback".
---

# Figma values → code token sync

Copyright 2026 moonklabs. Licensed under Apache-2.0; see the plugin LICENSE and NOTICE.

**REQUIRED BACKGROUND:** aiwf-design:workflow confirms that the role is "sync". Figma is read-only. A person copies values into the code, and the check proves they are equal. Never generate CSS from the snapshot automatically.

Paths below are config keys of `design-spec.config.json` (schema in the plugin README). `<skills>` is the folder that holds this skill's folder.

## Files

| File | Role |
|---|---|
| [scripts/figma-readback.plugin.js](scripts/figma-readback.plugin.js) | Figma read script (run with `use_figma`, no writes). Reads the connected file's key; set `FILE_KEY` to `figma.fileKey` when the host does not expose it |
| `tokens.snapshot` | Snapshot (committed) |
| `tokens.map` | Figma name → code token. Every entry is a mapping or a `skip` reason |
| `tokens.sources` · `tokens.typography` | Hand-edited implementation sources (tokens such as `--group-name`, typography utilities such as `type-*`) |
| `tokens.dtcg` | DTCG tokens the check reads. When `commands.tokenExport` generates it, do not edit it by hand |

## Order

1. Load the figma:figma-use skill first. Run the whole read script with `use_figma` (`skillNames: "figma-use"`).
2. If the response was cut off or does not parse as JSON, discard it. Change the script's `PART` to `'variables'`, then `'styles'`, read twice, save each raw response to a file and merge them.
   ```bash
   node <skills>/figma-sync/scripts/merge_readback.mjs --out <tokens.snapshot> <variables.json> <styles.json>
   ```
   The merge refuses to write and fails when an array length differs from the `counts` Figma reported, when file keys are mixed, or when a section is missing.
3. `git diff <tokens.snapshot>` — confirm that only the changes the designer described appear. If other changes appear, ask the designer.
4. Run the token check: `commands.tokenCheck`, or `node <skills>/figma-sync/scripts/check_figma_tokens.mjs` when it is unset or cannot start; report which one ran. The failure list is the to-do list.
5. Reflect colors as tokens in `tokens.sources` (Figma `group/name` → `--group-name` unless the map's rules say otherwise), text styles as utilities in `tokens.typography`, and new or renamed Figma names in `tokens.map`.
6. Run `commands.tokenExport` when it is set, then pass the token check. This check compares declared values; it is not a render or pixel match.
7. Update the row in the traceability design-system table (aiwf-design:trace).

## Do not

- Save a cut-off response or fill in its gaps
- Change Figma to make a mismatch disappear (put it on the designer hand-off list)
- Edit the snapshot by hand, or edit `tokens.dtcg` by hand when it is generated
- Silently ignore a Figma item missing from the map (write a `skip` reason)

## When you changed a script

```bash
node <skills>/figma-sync/scripts/merge_readback.mjs --self-test
node <skills>/figma-sync/scripts/check_figma_tokens.mjs --self-test
```
The first runs the real read script against a mock Figma and confirms that a full read equals a split read, and that cut-off, missing-section, mixed-file and unknown-file-key reads are rejected. The second confirms that a matching fixture passes and that each broken token, alias, mapping and typography input is reported.
