# 디자인 시스템 — 진입점

> 휴먼 리뷰용 한글 번역입니다. 실행 원문: [원문](../../../../../../../../../plugins/aiwf-design/skills/workflow/references/templates/design-spec/design-system/README.md). 번역과 자동 검사는 승인을 뜻하지 않으며, 검토 상태와 원문 SHA256은 [관리 목록](../../../../../../../manifest.json)에서 확인합니다.

이 폴더와 Figma SOT 파일이 디자인 시스템을 정의한다. 저장소의 다른 문서는 여기로 링크한다. 값 표를 다른 문서에 복사하지 말고 링크한다.

## Principles
- **정의는 여기에, 구현은 코드에.** 토큰 값, 컴포넌트, 상태, 아이콘은 이 폴더와 Figma 변수·컴포넌트가 정의한다. 코드 원천은 `design-spec.config.json`의 토큰과 타이포그래피 원천이다.
- **다리는 토큰 맵**(`tokens.map`)이다: Figma 이름 → 코드 토큰과 타이포그래피 유틸리티. 토큰 검사는 Figma 스냅샷을 코드 토큰과 비교한다.
- **사람이 변경을 적용한다.** Figma JSON에서 코드를 생성하지 않는다.

## Where each layer lives
| Layer | Definition | Figma (ID는 [figma-map](../../../../../../../../../plugins/aiwf-design/skills/workflow/references/templates/design-spec/figma/figma-map.md)) | Code |
|---|---|---|---|
| Rules | [decisions.md](../../../../../../../../../plugins/aiwf-design/skills/workflow/references/templates/design-spec/decisions.md) | — | 컴포넌트 스타일 |
| Tokens | | 변수 컬렉션, 텍스트·효과 스타일 | `tokens.sources` → `tokens.dtcg` |
| Components | | Components 페이지 | 컴포넌트 소스 |
| States | | | 컴포넌트 variant |
| Icons | | | |

## When applying to code
1. [traceability](../../../../../../../../../plugins/aiwf-design/skills/workflow/references/templates/design-spec/traceability.md)에서 그 계층의 상태를 확인한다.
2. 정의와 Figma를 읽은 다음 코드를 바꾼다. Figma 값이 바뀌었으면 먼저 스냅샷을 다시 읽는다.
3. 토큰 검사를 실행한다.
4. traceability의 구현 열과 상태를 갱신한다. 이 폴더의 정의는 디자이너가 고친다.

> 번역자 주: 헤딩 `Principles`(원칙), `Where each layer lives`(각 계층이 있는 곳), `When applying to code`(코드에 적용할 때)와 표 머리글 `Layer`(계층), `Definition`(정의), `Code`(코드), 계층 이름은 원문 템플릿의 영어 그대로이다.
