# AIWF Vaadin/jOOQ 플러그인 안내

> 플러그인 README 한글 검토본입니다. 원문: [README](../../../plugins/aiwf-vaadin-jooq/README.md). 검토 상태와 원문 SHA256은 [관리 목록](../manifest.json)에서 확인합니다. 번역과 자동 검사는 승인을 뜻하지 않습니다.

AI Unified Process Marketplace에서 Simon Martinelli가 만든 Vaadin/Hilla 및 jOOQ 애플리케이션용 구성 스킬입니다. 가져온 버전은 고정된 [UPSTREAM.json](../../../plugins/aiwf-vaadin-jooq/UPSTREAM.json)에 기록되어 있으며 내용을 변경하지 않았습니다.

## 스택의 목적

`aiwf-core`에서 만든 엔티티 모델과 유스케이스 명세를 바탕으로 버전 관리되는 Flyway 마이그레이션, jOOQ를 사용하는 Vaadin Flow / Hilla 애플리케이션 코드, 계층별 테스트(Karibu, browserless, Hilla/Vitest, Playwright)를 구성합니다.

이 스킬들은 `aiwf-core`가 만든 명세(엔티티 모델과 `UC-*.md` 유스케이스)를 사용하며 upstream `aiup-core` 플러그인과는 독립적입니다.

## 원본 보존

이 폴더의 모든 스킬, 중첩 참조 문서, 포함 규칙과 에이전트는 upstream 플러그인의 커밋 `065dadda0f696c29ff2bacbda31b38152082e6fa`와 바이트 단위로 동일합니다. AIWF가 추가한 것은 이 README, [UPSTREAM.json](../../../plugins/aiwf-vaadin-jooq/UPSTREAM.json), `.claude-plugin/plugin.json` 매니페스트뿐이며 스킬 내용은 수정하지 않았습니다. 스킬과 에이전트 프롬프트 이름은 Claude Code와의 호환성을 위해 upstream 그대로 유지합니다. 모든 해시를 다시 확인하려면 `node --test tests/spec-workflow/stack-provenance.test.mjs`를 실행합니다.

## 스킬

| 스킬 | 목적 |
|-------|---------|
| `implement` | Vaadin Flow 화면·폼·그리드와 jOOQ 쿼리로 유스케이스 구현 |
| `implement-hilla` | Hilla 엔드포인트와 React 화면으로 유스케이스 구현 |
| `flyway-migration` | 엔티티 모델에서 버전 관리되는 Flyway 마이그레이션 작성 |
| `karibu-test` | Vaadin 화면용 Karibu 단위 테스트 |
| `browserless-test` | 브라우저 없는 Vaadin UI 테스트 |
| `hilla-test` | Hilla 엔드포인트 및 React 화면 테스트 |
| `playwright-test` | 브라우저에서 실행하는 Playwright 종단 간 테스트 |
| `coverage-check` | 명세와 비교해 UC/TC를 점검하는 읽기 전용 uc-coverage 감사 |

## 사전 조건

- JDK 21 이상과 Maven
- Vaadin 프런트엔드 도구 모음을 위한 Node.js/npm
- upstream 스킬이 요구하는 관계형 데이터베이스, jOOQ 코드 생성, Flyway

## 선택적 MCP 서버 (문서 안내만 제공)

MCP 서버 없이도 스킬을 사용할 수 있습니다. AIWF는 MCP 서버를 자동 구성하거나 설치하지 않으며 이 플러그인에는 `.mcp.json`이 없습니다. upstream 스킬이 사용할 수 있는 선택 서버는 [rules/mcp-servers.md](../../../plugins/aiwf-vaadin-jooq/rules/mcp-servers.md)에 설명되어 있습니다. 공식 문서를 직접 조회하고 싶을 때만 사용 중인 호스트에 직접 구성하세요.

## 호스트별 참고

Claude Code는 AIWF marketplace 항목을 통해 이 플러그인을 불러옵니다. Codex는 스킬과 포함 리소스를 파일 복사로 설치하지만, 파일 복사만으로 호스트 에이전트를 등록할 수는 없습니다. 포함된 에이전트 프롬프트(`agents/uc-coverage.md`)는 리소스로 설치됩니다. 이를 `uc-coverage` 서브에이전트로 실행하려면 호스트에 별도 매핑이 필요합니다.

## 라이선스와 출처

Apache-2.0. 원저작자는 Simon Martinelli 및 AI Unified Process 기여자입니다. [LICENSE](../../../plugins/aiwf-vaadin-jooq/LICENSE)와 [NOTICE](../../../plugins/aiwf-vaadin-jooq/NOTICE)를 확인하세요. [원본 저장소](https://github.com/AI-Unified-Process/marketplace/tree/065dadda0f696c29ff2bacbda31b38152082e6fa/aiup-vaadin-jooq).
