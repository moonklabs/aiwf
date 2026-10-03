# NestJS/Next.js 스킬용 선택적 MCP 서버

> 휴먼 리뷰용 한글 번역입니다. 실행 원문: [원문](../../../../plugins/aiwf-nestjs-nextjs/rules/mcp-servers.md). 번역과 자동 검사는 승인을 뜻하지 않으며, 검토 상태와 원문 SHA256은 [관리 목록](../../manifest.json)에서 확인합니다.

- 식별자: `rules/mcp-servers`
- 설명: `aiup-nestjs-nextjs` 스킬이 선택적으로 사용할 수 있는 MCP 서버 안내입니다.

`aiup-nestjs-nextjs` 스킬은 MCP 서버 없이도 동작합니다. 그 경우 에이전트 자신의 지식과 각 스킬 안의 문서 링크로 대체합니다. 권위 있고 최신인 문서와 브라우저 자동화를 위해, 아래 선택적 서버를 에이전트에 구성하십시오. 이는 보조용일 뿐이며, 이 스킬들 중 어느 것도 이를 필수로 요구하지 않습니다.

## 서버

| 서버       | 유형  | URL / 명령                    | 사용하는 스킬                             |
|------------|-------|------------------------------|-------------------------------------------|
| playwright | stdio | `npx @playwright/mcp@latest` | `playwright-test` (브라우저 테스트 실행) |

## Claude Code에서 구성

프로젝트의 `.mcp.json`에 다음을 추가하십시오(Tessl `tessl mcp start` 브리지는 그대로 함께 둘 수 있습니다):

```json
{
  "mcpServers": {
    "playwright": {
      "type": "stdio",
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
```

다른 에이전트(Cursor, Gemini, Codex, Copilot)의 경우, 같은 서버를 해당 에이전트의 MCP 구성 파일에 추가하십시오.

## `aiup-core`가 이미 커버하는 라이브러리 문서

`aiup-core`의 `.mcp.json`은 일반 라이브러리 문서 서버인 **context7**(`https://mcp.context7.com/mcp`)을 연결합니다. 어떤 npm 패키지의 문서든 요청 시 해석하므로, 이 스킬들이 의존하는 모든 라이브러리를 이미 커버합니다:

| 라이브러리                  | 사용하는 스킬                                  |
|-----------------------------|------------------------------------------------|
| NestJS                      | `implement`, `nest-test`                     |
| Drizzle ORM / drizzle-kit   | `drizzle-migration`, `implement`             |
| Next.js / React             | `implement`, `react-test`                    |
| Vitest                      | `nest-test`, `react-test`                    |
| Supertest                   | `nest-test`                                   |
| Testcontainers              | `nest-test`                                   |
| React Testing Library       | `react-test`                                  |

`aiup-core`가 설치되어 있다면 — 이 플러그인의 전제 조건이며 최상위 README 참고 — 여기서 추가로 구성할 것 없이 이 모든 라이브러리의 문서 조회를 무료로 얻습니다.

## Tessl로 설치한 사용자를 위한 참고

Tessl은 플러그인과 함께 MCP 서버 정의를 제공하지 않습니다 — `tessl install`로 이 플러그인을 설치하면 Tessl 브리지만 구성됩니다. `playwright-test` 중 브라우저 자동화를 원하면 위 서버를 수동으로 구성하십시오. Claude Code 마켓플레이스를 통해 플러그인을 설치한 사용자는 플러그인의 `.mcp.json`에서 자동으로 얻습니다.
