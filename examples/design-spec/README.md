# Design-spec Example: 지출 내역 제출 화면

`aiwf-design` 플러그인의 최소 프로젝트 예제다. 디자이너 작업 공간 [docs/design-spec](docs/design-spec/README.md)과 기획 문서(`docs/requirements.md`, `docs/use_cases/`), Figma 스냅샷·토큰 대응표·DTCG 토큰·타이포그래피 유틸리티를 함께 둔다. Figma 파일 키와 노드 ID는 예시 값이다.

## 구성

| 경로 | 내용 |
|------|------|
| `docs/design-spec/design-spec.config.json` | 프로젝트 설정 (경로, Figma 파일 키, 토큰 원천, 검사) |
| `docs/design-spec/` | README · AGENTS · HANDOFF · decisions · traceability · figma-map · design-system · 계획서 |
| `docs/requirements.md`, `docs/use_cases/` | traceability가 가리키는 FR·UC |
| `design-system/figma-readback.json` | Figma 읽기 스냅샷 |
| `design-system/figma-token-map.json` | Figma 이름 → 코드 토큰 대응 |
| `design-system/tokens.json` | DTCG 토큰 (별칭 포함) |
| `src/styles/typography.css` | 텍스트 스타일 유틸리티 |

## 검사

저장소 루트에서 실행한다.

```bash
node plugins/aiwf-design/skills/review/scripts/design_spec_lint.mjs --root examples/design-spec --strict
node plugins/aiwf-design/skills/figma-sync/scripts/check_figma_tokens.mjs --root examples/design-spec
```

`npm run test:design`이 두 검사와 모든 self-test를 함께 실행한다. 토큰 검사는 선언값 대조이며 렌더링 확인이 아니다.
