# Blazor/.NET 스킬용 선택적 MCP 서버

> 휴먼 리뷰용 한글 번역입니다. 실행 원문: [원문](../../../../plugins/aiwf-blazor-dotnet/rules/mcp-servers.md). 번역과 자동 검사는 승인을 뜻하지 않으며, 검토 상태와 원문 SHA256은 [관리 목록](../../manifest.json)에서 확인합니다.

- 식별자: `rules/mcp-servers`
- 설명: `aiup-blazor-dotnet` 스킬이 선택적으로 사용할 수 있는 MCP 서버 안내입니다.

`aiup-blazor-dotnet` 스킬은 MCP 서버 없이도 동작합니다. 그 경우 에이전트 자신의 지식과 표준 .NET 10 문서 패턴으로 대체합니다. 권위 있고 최신인 문서와 API 조회를 위해, 아래 선택적 MCP 서버를 에이전트에 구성하십시오. 이들은 보조용일 뿐이며, 이 스킬들 중 어느 것도 이들을 필수로 요구하지 않습니다.

## 서버

| 서버            | 유형  | URL / 명령                                           | 사용하는 스킬                                |
|-----------------|-------|------------------------------------------------------|-------------------------------------------|
| MicrosoftLearn  | http  | `https://mcp.context7.com/mcp`                       | `implement`, `ef-migration`, `dotnet-test`|
| bUnitDocs       | http  | `https://mcp.context7.com/mcp`                       | `bunit-test`                              |
| Playwright      | stdio | `npx @playwright/mcp@latest`                         | `playwright-test` (브라우저 테스트 실행)   |

## Claude Code에서 구성

프로젝트의 `.mcp.json`에 다음을 추가하십시오:

```json
{
  "mcpServers": {
    "MicrosoftLearn": { "type": "http", "url": "https://mcp.context7.com/mcp" },
    "bUnitDocs":      { "type": "http", "url": "https://mcp.context7.com/mcp" },
    "playwright":     { "type": "stdio", "command": "npx", "args": ["@playwright/mcp@latest"] }
  }
}
```
