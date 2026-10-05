# Planning ↔ design ↔ implementation (current state only)

> Record only the **current state**. Overwrite a row when it changes and update its date. History lives in Git.
> Planning IDs are the FR/UC of the planning documents; design units are this folder's flows, screens and components; implementation is the repository source. Do not edit planning documents here — when they must change, set the state to `기획 변경 필요` and add one line to [HANDOFF](HANDOFF.md).

## 상태 값
| 값 | Meaning |
|---|---|
| `기획 없음` | A design exists without a matching UC/FR. Link it when planning assigns a new ID |
| `기획 변경 필요` | A design decision differs from an existing UC/FR or constraint. Planning decides first |
| `기획 변경 대기` | A UC/FR changed and the design needs review (set by the side that changed it) |
| `디자인 완료` | Figma screens and components exist and the decisions are in decisions.md |
| `구현: 이전 디자인` | The feature is in code but the new design is not applied |
| `구현: 새 디자인` | The new design is applied to code (type check and build) |
| `검증 완료` | A person confirmed it in the real app. Link the capture or acceptance document |

## Flows and screens
| 디자인 단위 | 기획 (UC / FR / 제약) | Figma | 구현 | 상태 | 갱신 |
|---|---|---|---|---|---|

## Design system
| 단위 | Figma | 구현 | 검사 | 상태 | 갱신 |
|---|---|---|---|---|---|

## Update rules
1. **Planning changes**: the side that changed it sets the affected rows to `기획 변경 대기` and adds a line to HANDOFF "기획 변경 대기".
2. **Design changes**: the designer edits the Figma column and state. When it differs from planning, set `기획 변경 필요` and add it to HANDOFF "아직 결정 안 된 것".
3. **Applied to code**: change only the implementation column and the state (`구현: 새 디자인`). After a real-app review, set `검증 완료` with an evidence link.
4. Overwrite rows. Do not accumulate past states in a row.
