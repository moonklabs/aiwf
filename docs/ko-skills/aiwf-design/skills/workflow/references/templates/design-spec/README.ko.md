# Design-spec 안내

> 휴먼 리뷰용 한글 번역입니다. 실행 원문: [원문](../../../../../../../../plugins/aiwf-design/skills/workflow/references/templates/design-spec/README.md). 번역과 자동 검사는 승인을 뜻하지 않으며, 검토 상태와 원문 SHA256은 [관리 목록](../../../../../../manifest.json)에서 확인합니다.

| 폴더 · 파일 | 무엇 | 언제 읽나 |
|---|---|---|
| [AGENTS.md](../../../../../../../../plugins/aiwf-design/skills/workflow/references/templates/design-spec/AGENTS.md) | 모든 에이전트가 공유하는 규칙 | 자동으로 불러온다 · 규칙은 여기서만 바꾼다 |
| [HANDOFF.md](../../../../../../../../plugins/aiwf-design/skills/workflow/references/templates/design-spec/HANDOFF.md) | 현재 상태 · 다음 단계 · 열린 결정 | **모든 세션의 시작에서** |
| [decisions.md](../../../../../../../../plugins/aiwf-design/skills/workflow/references/templates/design-spec/decisions.md) | 사용자가 확정한 결정 | 결정이 필요한 작업 전에 |
| [traceability.md](../../../../../../../../plugins/aiwf-design/skills/workflow/references/templates/design-spec/traceability.md) | 기획(UC/FR) ↔ 디자인 ↔ 구현과 현재 상태. 기획 문서와의 유일한 연결 | 기획이 바뀌었거나 디자인을 코드에 적용할 때 |
| [figma/figma-map.md](../../../../../../../../plugins/aiwf-design/skills/workflow/references/templates/design-spec/figma/figma-map.md) | 파일 · 페이지 · 섹션 · 컴포넌트 · 변수 ID | Figma 작업 전에 |
| [design-system/README.md](../../../../../../../../plugins/aiwf-design/skills/workflow/references/templates/design-spec/design-system/README.md) | 디자인 시스템 진입점: 각 계층이 쓰는 문서, Figma 섹션, 코드 | 디자인 시스템을 찾거나 적용할 때 |
| `memories/plans/` | 작업 계획과 그 이력. **기준 문서가 아니다** | 그 작업을 이어서 할 때 |

## 새 작업을 할 때
1. 작업에 계획이 필요하면 먼저 `memories/plans/YYYY-MM-DD-<name>.md`를 쓴다.
2. 확정된 결정은 [decisions.md](../../../../../../../../plugins/aiwf-design/skills/workflow/references/templates/design-spec/decisions.md)에 한 줄로 기록한다.
3. 새 Figma 섹션과 컴포넌트 ID는 [figma/figma-map.md](../../../../../../../../plugins/aiwf-design/skills/workflow/references/templates/design-spec/figma/figma-map.md)에 추가한다.
4. 끝나면 계획의 "진행 기록"과 [HANDOFF.md](../../../../../../../../plugins/aiwf-design/skills/workflow/references/templates/design-spec/HANDOFF.md)를 갱신한다.

프로젝트 경로, Figma 파일 키와 검사는 이 폴더의 `design-spec.config.json`에 있다. 커밋 전에 design-spec lint를 `--strict`로 실행한다.
