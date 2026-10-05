# 디자인 작업 — 세션 시작

> 휴먼 리뷰용 한글 번역입니다. 실행 원문: [원문](../../../../../../../../plugins/aiwf-design/skills/workflow/references/templates/design-spec/AGENTS.md). 번역과 자동 검사는 승인을 뜻하지 않으며, 검토 상태와 원문 SHA256은 [관리 목록](../../../../../../manifest.json)에서 확인합니다.

모든 코딩 에이전트를 위한 공통 지침이다. 규칙은 이 파일에만 둔다.

이 폴더는 디자인 작업 공간이다. 결과물은 Figma 파일과 여기의 문서이다. 코드 변경은 저장소 루트의 지침을 따른다.

## 새 세션마다 먼저
> **이 폴더가 단일 기준(source of truth)이다.** 다른 기기와 에이전트에는 개인 메모리가 없으므로 모든 사실, 결정, ID는 이 문서들에 있어야 한다.

1. [HANDOFF.md](../../../../../../../../plugins/aiwf-design/skills/workflow/references/templates/design-spec/HANDOFF.md) — 끝난 것과 다음에 할 것
2. [decisions.md](../../../../../../../../plugins/aiwf-design/skills/workflow/references/templates/design-spec/decisions.md) — 확정된 결정 (다시 묻지 않는다)
3. [figma/figma-map.md](../../../../../../../../plugins/aiwf-design/skills/workflow/references/templates/design-spec/figma/figma-map.md)에서 해당 영역의 Figma ID

## 규칙
- 먼저 세션 역할을 정한다(aiwf-design workflow). Figma는 디자이너 작업 역할에서만, 그리고 `design-spec.config.json`의 SOT 파일 `figma.fileKey`에만 쓸 수 있다. `figma.referenceFiles`의 파일은 읽기 전용이다.
- 문서 사이의 링크는 상대 경로만 쓴다. `/Users/…` 같은 절대 경로는 쓰지 않는다.
- 도구의 기본 폴더가 다르더라도 계획은 `memories/plans/`에 둔다. 이 폴더 안에 `docs/` 폴더를 만들지 않는다.

## 기획 문서와의 관계
- 기획 문서(requirements · use_cases · test_cases)는 참조 문서이다. 디자인 작업에서 고치지 않는다.
- [traceability.md](../../../../../../../../plugins/aiwf-design/skills/workflow/references/templates/design-spec/traceability.md)에서만 연결한다.
- 기획이 바뀌면 상태가 `기획 변경 대기`가 되고 HANDOFF 절 "기획 변경 대기"에 한 줄이 들어간다.
- 디자인 결정이 기획과 다르면 그 행을 `기획 변경 필요`로 표시한다. 기획이 새 ID로 반영한다.
