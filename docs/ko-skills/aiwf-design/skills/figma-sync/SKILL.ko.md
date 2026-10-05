# Figma 값 → 코드 토큰 동기화

> 휴먼 리뷰용 한글 번역입니다. 실행 원문: [원문](../../../../../plugins/aiwf-design/skills/figma-sync/SKILL.md). 번역과 자동 검사는 승인을 뜻하지 않으며, 검토 상태와 원문 SHA256은 [관리 목록](../../../manifest.json)에서 확인합니다.

**식별자:** `figma-sync`

**설명:** Figma 변수, 텍스트 스타일, 효과 또는 페인트 스타일이 바뀌어 코드 토큰이 맞아야 할 때, 프로젝트의 Figma 토큰 검사가 불일치를 보고할 때, 또는 Figma readback 응답이 잘려서 왔을 때("truncated to 20kb") 사용한다. "피그마 색·텍스트 스타일 바뀜", "토큰 동기화", "readback".

Copyright 2026 moonklabs. Apache-2.0 라이선스. 플러그인의 LICENSE와 NOTICE를 참조한다.

**필수 배경:** aiwf-design:workflow가 역할이 "동기화"임을 확인한다. Figma는 읽기 전용이다. 값은 사람이 코드에 옮기고, 검사가 두 값이 같음을 증명한다. 스냅샷에서 CSS를 자동으로 생성하지 않는다.

아래 경로는 `design-spec.config.json`의 설정 키이다(스키마는 [플러그인 README](../../../../../plugins/aiwf-design/README.md), [한글 검토본](../../README.ko.md)). `<skills>`는 이 스킬의 폴더를 담은 폴더이다.

## 파일

| 파일 | 역할 |
|---|---|
| [scripts/figma-readback.plugin.js](../../../../../plugins/aiwf-design/skills/figma-sync/scripts/figma-readback.plugin.js) | Figma 읽기 스크립트 (`use_figma`로 실행, 쓰기 없음). 연결된 파일의 키를 읽는다. 호스트가 키를 노출하지 않으면 `FILE_KEY`를 `figma.fileKey`로 설정한다 |
| `tokens.snapshot` | 스냅샷 (커밋) |
| `tokens.map` | Figma 이름 → 코드 토큰. 모든 항목은 매핑 또는 `skip` 사유이다 |
| `tokens.sources` · `tokens.typography` | 손으로 고치는 구현 원천 (`--group-name` 같은 토큰, `type-*` 같은 타이포그래피 유틸리티) |
| `tokens.dtcg` | 검사가 읽는 DTCG 토큰. `commands.tokenExport`가 생성하면 손으로 고치지 않는다 |

## 순서

1. figma:figma-use 스킬을 먼저 불러온다. 읽기 스크립트 전체를 `use_figma`로 실행한다 (`skillNames: "figma-use"`).
2. 응답이 잘렸거나 JSON으로 파싱되지 않으면 버린다. 스크립트의 `PART`를 `'variables'`, 다음에 `'styles'`로 바꿔 두 번 읽고, 각 원문 응답을 파일로 저장해 병합한다.
   ```bash
   node <skills>/figma-sync/scripts/merge_readback.mjs --out <tokens.snapshot> <variables.json> <styles.json>
   ```
   병합은 배열 길이가 Figma가 보고한 `counts`와 다르거나, 파일 키가 섞여 있거나, 구역이 빠졌으면 쓰기를 거부하고 실패한다.
3. `git diff <tokens.snapshot>` — 디자이너가 설명한 변경만 보이는지 확인한다. 다른 변경이 보이면 디자이너에게 묻는다.
4. 토큰 검사를 실행한다 (`commands.tokenCheck`, 또는 `node <skills>/figma-sync/scripts/check_figma_tokens.mjs`). 실패 목록이 할 일 목록이다.
5. 색은 `tokens.sources`에 토큰으로 반영하고(맵의 규칙이 달리 정하지 않으면 Figma `group/name` → `--group-name`), 텍스트 스타일은 `tokens.typography`에 유틸리티로, 새로 생기거나 이름이 바뀐 Figma 이름은 `tokens.map`에 반영한다.
6. `commands.tokenExport`가 설정되어 있으면 실행한 뒤 토큰 검사를 통과시킨다. 이 검사는 선언된 값을 비교하며 렌더나 픽셀 일치가 아니다.
7. traceability 디자인 시스템 표의 해당 행을 갱신한다 (aiwf-design:trace).

## 하지 않는 것

- 잘린 응답을 저장하거나 그 빈 곳을 채우기
- 불일치를 없애려고 Figma를 바꾸기 (디자이너 전달 목록에 올린다)
- 스냅샷을 손으로 고치기, 또는 생성되는 `tokens.dtcg`를 손으로 고치기
- 맵에 없는 Figma 항목을 조용히 무시하기 (`skip` 사유를 적는다)

## 스크립트를 고쳤을 때

```bash
node <skills>/figma-sync/scripts/merge_readback.mjs --self-test
node <skills>/figma-sync/scripts/check_figma_tokens.mjs --self-test
```
첫째는 실제 읽기 스크립트를 모의 Figma에 대해 실행해, 전체 읽기와 나눠 읽기가 같은지, 그리고 잘림, 구역 누락, 파일 섞임, 알 수 없는 파일 키 읽기가 거부되는지 확인한다. 둘째는 일치하는 픽스처가 통과하고, 깨진 토큰, 별칭, 매핑, 타이포그래피 입력이 각각 보고되는지 확인한다.
