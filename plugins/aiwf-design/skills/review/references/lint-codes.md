# design_spec_lint codes

Exit codes: 0 clean, 1 ERROR present (with `--strict` also WARN), 2 usage or configuration error (missing or invalid `design-spec.config.json`).

Paths are config keys of `design-spec.config.json`: `specRoot` (default `docs/design-spec`), `planning.requirements`, `planning.useCases`, `plans.dir`, `plans.toolDefaultDirs`, `tokens.snapshot`, `figma.fileKey`.

| Severity | Code | Meaning | Where to fix |
|---|---|---|---|
| ERROR | `DS_FILE_MISSING` | A required design-spec file is missing (README · AGENTS · HANDOFF · decisions · traceability · figma/figma-map · design-system/README) | Restore the file |
| ERROR | `DS_LEGACY_DIR` | `superpowers/` or `docs/` exists inside design-spec | Move plans to `plans.dir` |
| WARN | `DS_PLAN_DEFAULT_PATH` | A `plans.toolDefaultDirs` folder appeared in the repository (a planning tool's default path) | Move it to `<specRoot>/<plans.dir>/` |
| ERROR | `DS_BROKEN_LINK` | A relative link target does not exist | The link or the file name |
| ERROR | `DS_BROKEN_ANCHOR` | The heading of a `.md#anchor` does not exist (the heading was renamed) | Point the link at the new heading's anchor |
| ERROR | `DS_ABSOLUTE_PATH` | A design-spec document links with an absolute path such as `/Users/…` | Use a relative path |
| WARN | `DS_QUOTED_HEADING` | The heading or table row named by a `file.md "section"` sentence does not exist | The section name in the sentence |
| ERROR | `DS_TRACE_VOCAB` | traceability has no `## 상태 값` table | Restore the table |
| ERROR | `DS_TRACE_STATUS` | A row state contains none of the 상태 값 words | Use 상태 값 words (explanations in parentheses) |
| ERROR | `DS_TRACE_DATE` | The 갱신 column is not `YYYY-MM-DD` | The date the row was edited |
| ERROR | `DS_DANGLING_REF` | A UC/FR/NFR/C ID in a row is not in `planning.requirements` or `planning.useCases` | Check the ID or the planning side |
| INFO | `DS_QUEUE_DESIGN` | A `기획 변경 대기` row — for the designer to revisit | List in the report |
| INFO | `DS_QUEUE_PLANNING` | A `기획 변경 필요` row — for planning to decide | List in the report |
| WARN | `DS_PLAN_NAME` | A plan file name is not `YYYY-MM-DD-kebab.md` | The file name |
| WARN | `DS_PLAN_NO_LOG` | A plan has no "진행 기록" section | The plan document (designer) |
| ERROR | `DS_HANDOFF_DATE` | HANDOFF has no `마지막 갱신: YYYY-MM-DD` | The HANDOFF header |
| WARN | `DS_HANDOFF_STALE` | The HANDOFF date is earlier than the newest traceability or plan date | Update HANDOFF |
| ERROR | `DS_SNAPSHOT_INVALID` | `tokens.snapshot` is not JSON (a cut-off read) | Read again with aiwf-design:figma-sync |
| WARN | `DS_FILEKEY` | The snapshot's Figma file key is not in figma-map.md, or differs from `figma.fileKey` | figma-map, the config or the snapshot |

Scope: every link in `<specRoot>/**/*.md`, plus links into design-spec from the `entryDocs` files (default `README.md`, `AGENTS.md`).
