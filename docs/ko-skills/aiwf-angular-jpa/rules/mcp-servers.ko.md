# Angular/JPA 스킬용 선택적 MCP 서버

> 휴먼 리뷰용 한글 번역입니다. 실행 원문: [원문](../../../../plugins/aiwf-angular-jpa/rules/mcp-servers.md). 번역과 자동 검사는 승인을 뜻하지 않으며, 검토 상태와 원문 SHA256은 [관리 목록](../../manifest.json)에서 확인합니다.

**식별자(name):** 파일명 `mcp-servers.md` (frontmatter 없음)

`aiup-angular-jpa` 스킬은 MCP 서버 없이도 동작합니다. 각 스킬에 내장된 자체 지식과 문서 링크로 대체됩니다. 권위 있고 최신인 문서, API 조회, CLI 통합 도구를 사용하려면 아래의 선택적 MCP 서버를 에이전트에 설정하십시오. 이들은 권장 사항일 뿐이며, 이 스킬들 중 어느 것도 이들을 반드시 요구하지 않습니다.

## 서버

| 서버 | 유형 | URL / 명령 | 사용하는 스킬 |
|------|------|-----------|--------------|
| JavaDocs | http | `https://www.javadocs.dev/mcp` | `implement`, `spring-boot-test` |
| playwright | stdio | `npx @playwright/mcp@latest` | `playwright-test` (브라우저 테스트 실행) |

## Claude Code에서 설정

프로젝트의 `.mcp.json`에 다음을 추가하십시오 (Tessl의 `tessl mcp start` 브리지는 이들과 나란히 두어도 됩니다):

```json
{
  "mcpServers": {
    "JavaDocs": {
      "type": "http",
      "url": "https://www.javadocs.dev/mcp"
    },
    "playwright": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "@playwright/mcp@latest"
      ]
    }
  }
}
```

다른 에이전트(Cursor, Gemini, Codex, Copilot)의 경우, 해당 에이전트의 MCP 설정 파일에 같은 서버를 추가하십시오.

## `aiup-core`가 이미 다루는 프런트엔드 문서

`aiup-core`의 `.mcp.json`은 일반 라이브러리 문서 서버인 **context7**(`https://mcp.context7.com/mcp`)을 연결합니다. 이것은 요청 시 임의의 npm/JS 패키지 문서를 해석하므로 Angular, RxJS, Vitest — 즉 `implement`와 `vitest-test` 스킬이 프런트엔드에서 의존하는 라이브러리 — 를 이미 다룹니다. `aiup-core`가 설치되어 있다면(이 플러그인의 전제 조건 — 최상위 README 참조) 여기에 추가로 설정할 것 없이 프런트엔드 문서 조회를 그대로 사용할 수 있습니다.

## Tessl로 설치한 사용자를 위한 참고

Tessl은 플러그인과 함께 MCP 서버 정의를 제공하지 않습니다. `tessl install`로 이 플러그인을 설치하면 Tessl 브리지만 설정됩니다. 향상된 문서 조회를 원하면 위 서버를 수동으로 설정하십시오. Claude Code 마켓플레이스를 통해 플러그인을 설치한 사용자는 플러그인의 `.mcp.json`에서 이 서버들을 자동으로 받습니다.

## 향후 기회

`aiup-vaadin-jooq`는 플러그인 작성자가 직접 만들어 호스팅하는 jOOQ와 Karibu Testing용 전용 MCP 서버를 제공합니다. Spring Data JPA/Hibernate 전용으로 같은 성격의 서버는 아직 없습니다. 같은 패턴을 따르는 전용 서버가 여기에 자연스러운 추가가 되겠지만 오늘은 포함되어 있지 않습니다.
