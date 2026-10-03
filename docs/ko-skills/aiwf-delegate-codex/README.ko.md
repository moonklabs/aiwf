# AIWF Codex 위임 플러그인 안내

> 플러그인 README 한글 검토본입니다. 원문: [README](../../../plugins/aiwf-delegate-codex/README.md). 검토 상태와 원문 SHA256은 [관리 목록](../manifest.json)에서 확인합니다. 번역과 자동 검사는 승인을 뜻하지 않습니다.

`delegate-codex` 스킬을 제공하는 선택형 AIWF 확장입니다. Codex 사용자는 `scripts/install-spec-skills.mjs --delegate codex`로 선택 설치할 수 있으며 Claude Code 사용자는 AIWF marketplace에서 플러그인을 설치할 수 있습니다. skills.sh에서 스킬만 개별 설치할 수도 있습니다.

```bash
npx skills add https://github.com/moonklabs/aiwf --skill delegate-codex --agent codex
npx skills add https://github.com/moonklabs/aiwf --skill delegate-codex --agent claude-code
```

위 GitHub 명령은 변경 사항을 저장소에 게시한 뒤 사용할 수 있습니다. 설치는 스킬을 실행하거나 Codex를 설치·인증하거나 어느 호스트의 권한도 변경하지 않습니다. Codex에게 작업을 위임할 때 `delegate-codex`를 명시적으로 호출하세요. Codex의 수동 설치기는 스킬을 `$aiwf-delegate-codex`라는 이름으로 설치합니다. Claude Code marketplace에서는 `/aiwf-delegate-codex:delegate-codex`로 호출합니다. 교차 CLI 호출에는 현재 요청에 `--cross-cli` 토큰을 명시해야 합니다.
