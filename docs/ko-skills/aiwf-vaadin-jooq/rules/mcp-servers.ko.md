# Vaadin/jOOQ 스킬용 선택적 MCP 서버

> 휴먼 리뷰용 한글 번역입니다. 실행 원문: [원문](../../../../plugins/aiwf-vaadin-jooq/rules/mcp-servers.md). 번역과 자동 검사는 승인을 뜻하지 않으며, 검토 상태와 원문 SHA256은 [관리 목록](../../manifest.json)에서 확인합니다.

`aiup-vaadin-jooq` 스킬은 MCP 서버 없이도 동작합니다. 서버가 없으면 각자의 지식과 각 스킬 안에 있는 문서 링크로 되돌아갑니다. 권위 있고 최신인 문서와 API 조회를 위해 아래의 선택적 MCP 서버를 에이전트에 구성하십시오. 이 서버들은 조언용일 뿐이며, 이 스킬들 중 어느 것도 이들을 강제로 요구하지 않습니다.

## 서버

| 서버            | 유형  | URL / 명령                                           | 사용하는 스킬                                             |
|-----------------|-------|------------------------------------------------------|--------------------------------------------------------|
| Vaadin          | http  | `https://mcp.vaadin.com/docs`                        | `implement`, `implement-hilla`, `browserless-test`     |
| jOOQ            | http  | `https://jooq-mcp.martinelli.ch/mcp`                 | `implement`, `implement-hilla`                         |
| JavaDocs        | http  | `https://www.javadocs.dev/mcp`                       | `implement`, `implement-hilla`, `playwright-test`      |
| KaribuTesting   | http  | `https://karibu-testing-mcp.martinelli.ch/mcp`       | `karibu-test`                             |
| Playwright      | stdio | `npx @playwright/mcp@latest`                         | `playwright-test` (브라우저 테스트 실행) |

## Claude Code에서 구성

프로젝트의 `.mcp.json`에 다음을 추가하십시오 (Tessl의 `tessl mcp start` 브리지는 이들과 함께 있어도 됩니다):

```json
{
  "mcpServers": {
    "Vaadin":        { "type": "http", "url": "https://mcp.vaadin.com/docs" },
    "jOOQ":          { "type": "http", "url": "https://jooq-mcp.martinelli.ch/mcp" },
    "JavaDocs":      { "type": "http", "url": "https://www.javadocs.dev/mcp" },
    "KaribuTesting": { "type": "http", "url": "https://karibu-testing-mcp.martinelli.ch/mcp" },
    "playwright":    { "type": "stdio", "command": "npx", "args": ["@playwright/mcp@latest"] }
  }
}
```

다른 에이전트(Cursor, Gemini, Codex, Copilot)에서는 같은 서버들을 그 에이전트의 MCP 구성 파일에 추가하십시오.

## Tessl로 설치한 사용자를 위한 참고

Tessl은 플러그인과 함께 MCP 서버 정의를 제공하지 않습니다. `tessl install`로 이 플러그인을 설치하면 Tessl 브리지만 구성됩니다. 향상된 문서 조회를 원한다면 위 서버들을 수동으로 구성하십시오. Claude Code 마켓플레이스를 통해 플러그인을 설치한 사용자는 플러그인의 `.mcp.json`에서 이 서버들을 자동으로 받습니다.
