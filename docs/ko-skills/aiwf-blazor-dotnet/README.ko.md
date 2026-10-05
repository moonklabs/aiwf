# AIWF Blazor/.NET 플러그인 안내

> 플러그인 README 한글 검토본입니다. 원문: [README](../../../plugins/aiwf-blazor-dotnet/README.md). 검토 상태와 원문 SHA256은 [관리 목록](../manifest.json)에서 확인합니다. 번역과 자동 검사는 승인을 뜻하지 않습니다.

C# / Blazor (.NET 10) 애플리케이션용 AIWF 구성 스킬입니다.

## 스택의 목적

`aiwf-core`에서 만든 엔티티 모델과 유스케이스 명세를 바탕으로 EF Core 마이그레이션과 Vertical Slice 기능 폴더(Commands/Queries, EF Core 엔티티, Blazor 컴포넌트)를 만들고 .NET, bUnit, Playwright 테스트를 작성합니다.

이 스킬들은 `aiwf-core`가 만든 명세(엔티티 모델과 `UC-*.md` 유스케이스)를 사용합니다.

## 포함 리소스

이 폴더의 모든 스킬, 중첩 참조 문서, 포함 규칙과 에이전트는 플러그인과 함께 제공됩니다. 스킬과 에이전트 프롬프트 이름은 Claude Code와의 호환성을 위해 그대로 유지합니다. 포함 리소스와 출처 기록을 확인하려면 `node --test tests/spec-workflow/stack-provenance.test.mjs`를 실행합니다.

## 스킬

| 스킬 | 목적 |
|-------|---------|
| `implement` | Blazor 컴포넌트와 CQRS 핸들러를 사용하는 Vertical Slice로 유스케이스 구현 |
| `ef-migration` | 엔티티 모델을 바탕으로 EF Core 마이그레이션 작성 |
| `dotnet-test` | .NET 단위 및 통합 테스트 |
| `bunit-test` | Blazor 컴포넌트용 bUnit 테스트 |
| `playwright-test` | 브라우저에서 실행하는 Playwright 종단 간 테스트 |

## 사전 조건

- .NET 10 SDK
- EF Core 도구 (`dotnet ef`)
- 스킬이 요구하는 SQL Server 또는 PostgreSQL

## 선택적 MCP 서버 (문서 안내만 제공)

MCP 서버 없이도 스킬을 사용할 수 있습니다. AIWF는 MCP 서버를 자동 구성하거나 설치하지 않으며 이 플러그인에는 `.mcp.json`이 없습니다. 스킬이 사용할 수 있는 선택 서버는 [rules/mcp-servers.md](../../../plugins/aiwf-blazor-dotnet/rules/mcp-servers.md)에 설명되어 있습니다. 공식 문서를 직접 조회하고 싶을 때만 사용 중인 호스트에 직접 구성하세요.

## 호스트별 참고

Claude Code는 AIWF marketplace 항목을 통해 이 플러그인을 불러옵니다. Codex는 스킬과 포함 리소스를 파일 복사로 설치합니다. 이 stack에는 호스트 에이전트가 포함되어 있지 않습니다.

## 라이선스

Apache-2.0. [LICENSE](../../../plugins/aiwf-blazor-dotnet/LICENSE)와 [NOTICE](../../../plugins/aiwf-blazor-dotnet/NOTICE)를 확인하세요.
