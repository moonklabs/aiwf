# 전체 한글 검토 문서 목록

47개 저장소 스킬, 플러그인 README 10개, 로컬 2개 스킬과 연결된 참조·규칙·프롬프트·템플릿을 포함한 96개 문서다. 기술 용어와 실행 예제는 원문 형식을 유지한다. 검토 상태와 파일 버전의 기준은 [관리 목록](manifest.json)이며, 목록 작성은 휴먼 승인을 뜻하지 않는다.

[검토 시작점](README.md)으로 돌아갈 수 있다. 원문과 번역을 나란히 읽고 지시의 의미와 제한을 검토한다. 변경 시 해당 목록 링크도 함께 갱신한다.

## 플러그인 README

2026-10-05에 core·spec·기술 스택 4종의 원문과 한글본을 기능·설치 안내 중심으로 갱신했다. 아래 문서 경로는 유지하며 해당 버전의 검토 상태는 `awaiting_review`다.

| 플러그인 | 한글 검토본 | 원문 |
| --- | --- | --- |
| `aiwf-core` | [읽기](aiwf-core/README.ko.md) | [비교](../../plugins/aiwf-core/README.md) |
| `aiwf-spec` | [읽기](aiwf-spec/README.ko.md) | [비교](../../plugins/aiwf-spec/README.md) |
| `aiwf-design` | [읽기](aiwf-design/README.ko.md) | [비교](../../plugins/aiwf-design/README.md) |
| `aiwf-vaadin-jooq` | [읽기](aiwf-vaadin-jooq/README.ko.md) | [비교](../../plugins/aiwf-vaadin-jooq/README.md) |
| `aiwf-angular-jpa` | [읽기](aiwf-angular-jpa/README.ko.md) | [비교](../../plugins/aiwf-angular-jpa/README.md) |
| `aiwf-blazor-dotnet` | [읽기](aiwf-blazor-dotnet/README.ko.md) | [비교](../../plugins/aiwf-blazor-dotnet/README.md) |
| `aiwf-nestjs-nextjs` | [읽기](aiwf-nestjs-nextjs/README.ko.md) | [비교](../../plugins/aiwf-nestjs-nextjs/README.md) |
| `aiwf-electron-react` | [읽기](aiwf-electron-react/README.ko.md) | [비교](../../plugins/aiwf-electron-react/README.md) |
| `aiwf-delegate-claude` | [읽기](aiwf-delegate-claude/README.ko.md) | [비교](../../plugins/aiwf-delegate-claude/README.md) |
| `aiwf-delegate-codex` | [읽기](aiwf-delegate-codex/README.ko.md) | [비교](../../plugins/aiwf-delegate-codex/README.md) |

`aiwf-spec` README에는 [CLI 생산성 분석과 권고안](../modernization/CLI-PRODUCTIVITY.ko.md)을 연결했다. 원문·한글본과 관리 목록을 함께 갱신했으며, 새 명령은 미구현 제안으로 표시한다.

[Claude 두 세션의 검토 결과](../modernization/CLAUDE-PLAN-REVIEW-2026-10-03.ko.md)도 같은 README의 원문·한글본에서 연결한다. 자동 리뷰 결과는 휴먼 승인으로 기록하지 않는다.

[파일럿 계획](../modernization/PILOT-UC-001.ko.md)과 [로컬 실행 결과](../modernization/PILOT-RESULT-2026-10-03.ko.md)를 추가로 연결했다. 기준·실패·최종 packet과 재현 자료를 보존하고 README의 원문·한글본·해시를 함께 갱신했다. 명세와 한글 문서의 휴먼 리뷰 상태는 대기로 유지한다.

## aiwf-angular-jpa

| 문서 | 한글 검토본 | 원문 |
| --- | --- | --- |
| `agents/uc-coverage.ko.md` | [읽기](aiwf-angular-jpa/agents/uc-coverage.ko.md) | [비교](../../plugins/aiwf-angular-jpa/agents/uc-coverage.md) |
| `rules/mcp-servers.ko.md` | [읽기](aiwf-angular-jpa/rules/mcp-servers.ko.md) | [비교](../../plugins/aiwf-angular-jpa/rules/mcp-servers.md) |
| `skills/coverage-check/SKILL.ko.md` | [읽기](aiwf-angular-jpa/skills/coverage-check/SKILL.ko.md) | [비교](../../plugins/aiwf-angular-jpa/skills/coverage-check/SKILL.md) |
| `skills/flyway-migration/SKILL.ko.md` | [읽기](aiwf-angular-jpa/skills/flyway-migration/SKILL.ko.md) | [비교](../../plugins/aiwf-angular-jpa/skills/flyway-migration/SKILL.md) |
| `skills/implement/SKILL.ko.md` | [읽기](aiwf-angular-jpa/skills/implement/SKILL.ko.md) | [비교](../../plugins/aiwf-angular-jpa/skills/implement/SKILL.md) |
| `skills/implement/references/module-layout.ko.md` | [읽기](aiwf-angular-jpa/skills/implement/references/module-layout.ko.md) | [비교](../../plugins/aiwf-angular-jpa/skills/implement/references/module-layout.md) |
| `skills/playwright-test/SKILL.ko.md` | [읽기](aiwf-angular-jpa/skills/playwright-test/SKILL.ko.md) | [비교](../../plugins/aiwf-angular-jpa/skills/playwright-test/SKILL.md) |
| `skills/spring-boot-test/SKILL.ko.md` | [읽기](aiwf-angular-jpa/skills/spring-boot-test/SKILL.ko.md) | [비교](../../plugins/aiwf-angular-jpa/skills/spring-boot-test/SKILL.md) |
| `skills/vitest-test/SKILL.ko.md` | [읽기](aiwf-angular-jpa/skills/vitest-test/SKILL.ko.md) | [비교](../../plugins/aiwf-angular-jpa/skills/vitest-test/SKILL.md) |

## aiwf-blazor-dotnet

| 문서 | 한글 검토본 | 원문 |
| --- | --- | --- |
| `rules/mcp-servers.ko.md` | [읽기](aiwf-blazor-dotnet/rules/mcp-servers.ko.md) | [비교](../../plugins/aiwf-blazor-dotnet/rules/mcp-servers.md) |
| `skills/bunit-test/SKILL.ko.md` | [읽기](aiwf-blazor-dotnet/skills/bunit-test/SKILL.ko.md) | [비교](../../plugins/aiwf-blazor-dotnet/skills/bunit-test/SKILL.md) |
| `skills/dotnet-test/SKILL.ko.md` | [읽기](aiwf-blazor-dotnet/skills/dotnet-test/SKILL.ko.md) | [비교](../../plugins/aiwf-blazor-dotnet/skills/dotnet-test/SKILL.md) |
| `skills/ef-migration/SKILL.ko.md` | [읽기](aiwf-blazor-dotnet/skills/ef-migration/SKILL.ko.md) | [비교](../../plugins/aiwf-blazor-dotnet/skills/ef-migration/SKILL.md) |
| `skills/implement/SKILL.ko.md` | [읽기](aiwf-blazor-dotnet/skills/implement/SKILL.ko.md) | [비교](../../plugins/aiwf-blazor-dotnet/skills/implement/SKILL.md) |
| `skills/playwright-test/SKILL.ko.md` | [읽기](aiwf-blazor-dotnet/skills/playwright-test/SKILL.ko.md) | [비교](../../plugins/aiwf-blazor-dotnet/skills/playwright-test/SKILL.md) |

## aiwf-core

| 문서 | 한글 검토본 | 원문 |
| --- | --- | --- |
| `skills/entity-model/SKILL.ko.md` | [읽기](aiwf-core/skills/entity-model/SKILL.ko.md) | [비교](../../plugins/aiwf-core/skills/entity-model/SKILL.md) |
| `skills/entity-model/references/REFERENCE.ko.md` | [읽기](aiwf-core/skills/entity-model/references/REFERENCE.ko.md) | [비교](../../plugins/aiwf-core/skills/entity-model/references/REFERENCE.md) |
| `skills/requirements/SKILL.ko.md` | [읽기](aiwf-core/skills/requirements/SKILL.ko.md) | [비교](../../plugins/aiwf-core/skills/requirements/SKILL.md) |
| `skills/requirements/references/REFERENCE.ko.md` | [읽기](aiwf-core/skills/requirements/references/REFERENCE.ko.md) | [비교](../../plugins/aiwf-core/skills/requirements/references/REFERENCE.md) |
| `skills/requirements/references/glossary.ko.md` | [읽기](aiwf-core/skills/requirements/references/glossary.ko.md) | [비교](../../plugins/aiwf-core/skills/requirements/references/glossary.md) |
| `skills/reverse-engineer/SKILL.ko.md` | [읽기](aiwf-core/skills/reverse-engineer/SKILL.ko.md) | [비교](../../plugins/aiwf-core/skills/reverse-engineer/SKILL.md) |
| `skills/docpilot/SKILL.ko.md` | [읽기](aiwf-core/skills/docpilot/SKILL.ko.md) | [비교](../../plugins/aiwf-core/skills/docpilot/SKILL.md) |
| `skills/reverse-engineer/references/stack-signals.ko.md` | [읽기](aiwf-core/skills/reverse-engineer/references/stack-signals.ko.md) | [비교](../../plugins/aiwf-core/skills/reverse-engineer/references/stack-signals.md) |
| `skills/spec-review/SKILL.ko.md` | [읽기](aiwf-core/skills/spec-review/SKILL.ko.md) | [비교](../../plugins/aiwf-core/skills/spec-review/SKILL.md) |
| `skills/spec-review/references/lint-codes.ko.md` | [읽기](aiwf-core/skills/spec-review/references/lint-codes.ko.md) | [비교](../../plugins/aiwf-core/skills/spec-review/references/lint-codes.md) |
| `skills/spec-review/references/review-checklist.ko.md` | [읽기](aiwf-core/skills/spec-review/references/review-checklist.ko.md) | [비교](../../plugins/aiwf-core/skills/spec-review/references/review-checklist.md) |
| `skills/test-case/SKILL.ko.md` | [읽기](aiwf-core/skills/test-case/SKILL.ko.md) | [비교](../../plugins/aiwf-core/skills/test-case/SKILL.md) |
| `skills/test-case/references/example.ko.md` | [읽기](aiwf-core/skills/test-case/references/example.ko.md) | [비교](../../plugins/aiwf-core/skills/test-case/references/example.md) |
| `skills/test-case/references/test-case.ko.md` | [읽기](aiwf-core/skills/test-case/references/test-case.ko.md) | [비교](../../plugins/aiwf-core/skills/test-case/references/test-case.md) |
| `skills/use-case-diagram/SKILL.ko.md` | [읽기](aiwf-core/skills/use-case-diagram/SKILL.ko.md) | [비교](../../plugins/aiwf-core/skills/use-case-diagram/SKILL.md) |
| `skills/use-case-spec/SKILL.ko.md` | [읽기](aiwf-core/skills/use-case-spec/SKILL.ko.md) | [비교](../../plugins/aiwf-core/skills/use-case-spec/SKILL.md) |
| `skills/use-case-spec/references/clarify-checklist.ko.md` | [읽기](aiwf-core/skills/use-case-spec/references/clarify-checklist.ko.md) | [비교](../../plugins/aiwf-core/skills/use-case-spec/references/clarify-checklist.md) |
| `skills/use-case-spec/references/example.ko.md` | [읽기](aiwf-core/skills/use-case-spec/references/example.ko.md) | [비교](../../plugins/aiwf-core/skills/use-case-spec/references/example.md) |
| `skills/use-case-spec/references/format-spec.ko.md` | [읽기](aiwf-core/skills/use-case-spec/references/format-spec.ko.md) | [비교](../../plugins/aiwf-core/skills/use-case-spec/references/format-spec.md) |
| `skills/use-case-spec/references/use-case.ko.md` | [읽기](aiwf-core/skills/use-case-spec/references/use-case.ko.md) | [비교](../../plugins/aiwf-core/skills/use-case-spec/references/use-case.md) |

## aiwf-delegate-claude

| 문서 | 한글 검토본 | 원문 |
| --- | --- | --- |
| `skills/delegate-claude/SKILL.ko.md` | [읽기](aiwf-delegate-claude/skills/delegate-claude/SKILL.ko.md) | [비교](../../plugins/aiwf-delegate-claude/skills/delegate-claude/SKILL.md) |

## aiwf-delegate-codex

| 문서 | 한글 검토본 | 원문 |
| --- | --- | --- |
| `skills/delegate-codex/SKILL.ko.md` | [읽기](aiwf-delegate-codex/skills/delegate-codex/SKILL.ko.md) | [비교](../../plugins/aiwf-delegate-codex/skills/delegate-codex/SKILL.md) |

## aiwf-design

| 문서 | 한글 검토본 | 원문 |
| --- | --- | --- |
| `skills/apply/SKILL.ko.md` | [읽기](aiwf-design/skills/apply/SKILL.ko.md) | [비교](../../plugins/aiwf-design/skills/apply/SKILL.md) |
| `skills/figma-sync/SKILL.ko.md` | [읽기](aiwf-design/skills/figma-sync/SKILL.ko.md) | [비교](../../plugins/aiwf-design/skills/figma-sync/SKILL.md) |
| `skills/review/SKILL.ko.md` | [읽기](aiwf-design/skills/review/SKILL.ko.md) | [비교](../../plugins/aiwf-design/skills/review/SKILL.md) |
| `skills/review/references/lint-codes.ko.md` | [읽기](aiwf-design/skills/review/references/lint-codes.ko.md) | [비교](../../plugins/aiwf-design/skills/review/references/lint-codes.md) |
| `skills/trace/SKILL.ko.md` | [읽기](aiwf-design/skills/trace/SKILL.ko.md) | [비교](../../plugins/aiwf-design/skills/trace/SKILL.md) |
| `skills/workflow/SKILL.ko.md` | [읽기](aiwf-design/skills/workflow/SKILL.ko.md) | [비교](../../plugins/aiwf-design/skills/workflow/SKILL.md) |
| `skills/workflow/references/templates/design-spec/AGENTS.ko.md` | [읽기](aiwf-design/skills/workflow/references/templates/design-spec/AGENTS.ko.md) | [비교](../../plugins/aiwf-design/skills/workflow/references/templates/design-spec/AGENTS.md) |
| `skills/workflow/references/templates/design-spec/HANDOFF.ko.md` | [읽기](aiwf-design/skills/workflow/references/templates/design-spec/HANDOFF.ko.md) | [비교](../../plugins/aiwf-design/skills/workflow/references/templates/design-spec/HANDOFF.md) |
| `skills/workflow/references/templates/design-spec/README.ko.md` | [읽기](aiwf-design/skills/workflow/references/templates/design-spec/README.ko.md) | [비교](../../plugins/aiwf-design/skills/workflow/references/templates/design-spec/README.md) |
| `skills/workflow/references/templates/design-spec/decisions.ko.md` | [읽기](aiwf-design/skills/workflow/references/templates/design-spec/decisions.ko.md) | [비교](../../plugins/aiwf-design/skills/workflow/references/templates/design-spec/decisions.md) |
| `skills/workflow/references/templates/design-spec/design-system/README.ko.md` | [읽기](aiwf-design/skills/workflow/references/templates/design-spec/design-system/README.ko.md) | [비교](../../plugins/aiwf-design/skills/workflow/references/templates/design-spec/design-system/README.md) |
| `skills/workflow/references/templates/design-spec/figma/figma-map.ko.md` | [읽기](aiwf-design/skills/workflow/references/templates/design-spec/figma/figma-map.ko.md) | [비교](../../plugins/aiwf-design/skills/workflow/references/templates/design-spec/figma/figma-map.md) |
| `skills/workflow/references/templates/design-spec/traceability.ko.md` | [읽기](aiwf-design/skills/workflow/references/templates/design-spec/traceability.ko.md) | [비교](../../plugins/aiwf-design/skills/workflow/references/templates/design-spec/traceability.md) |
| `skills/workflow/references/templates/plan.ko.md` | [읽기](aiwf-design/skills/workflow/references/templates/plan.ko.md) | [비교](../../plugins/aiwf-design/skills/workflow/references/templates/plan.md) |

## aiwf-electron-react

| 문서 | 한글 검토본 | 원문 |
| --- | --- | --- |
| `skills/agent-runtime/SKILL.ko.md` | [읽기](aiwf-electron-react/skills/agent-runtime/SKILL.ko.md) | [비교](../../plugins/aiwf-electron-react/skills/agent-runtime/SKILL.md) |
| `skills/electron-test/SKILL.ko.md` | [읽기](aiwf-electron-react/skills/electron-test/SKILL.ko.md) | [비교](../../plugins/aiwf-electron-react/skills/electron-test/SKILL.md) |
| `skills/implement/SKILL.ko.md` | [읽기](aiwf-electron-react/skills/implement/SKILL.ko.md) | [비교](../../plugins/aiwf-electron-react/skills/implement/SKILL.md) |
| `skills/implement/references/architecture.ko.md` | [읽기](aiwf-electron-react/skills/implement/references/architecture.ko.md) | [비교](../../plugins/aiwf-electron-react/skills/implement/references/architecture.md) |
| `skills/package/SKILL.ko.md` | [읽기](aiwf-electron-react/skills/package/SKILL.ko.md) | [비교](../../plugins/aiwf-electron-react/skills/package/SKILL.md) |
| `skills/renderer-test/SKILL.ko.md` | [읽기](aiwf-electron-react/skills/renderer-test/SKILL.ko.md) | [비교](../../plugins/aiwf-electron-react/skills/renderer-test/SKILL.md) |
| `skills/scaffold/SKILL.ko.md` | [읽기](aiwf-electron-react/skills/scaffold/SKILL.ko.md) | [비교](../../plugins/aiwf-electron-react/skills/scaffold/SKILL.md) |
| `skills/scaffold/references/stack-profile.ko.md` | [읽기](aiwf-electron-react/skills/scaffold/references/stack-profile.ko.md) | [비교](../../plugins/aiwf-electron-react/skills/scaffold/references/stack-profile.md) |

## aiwf-nestjs-nextjs

| 문서 | 한글 검토본 | 원문 |
| --- | --- | --- |
| `rules/mcp-servers.ko.md` | [읽기](aiwf-nestjs-nextjs/rules/mcp-servers.ko.md) | [비교](../../plugins/aiwf-nestjs-nextjs/rules/mcp-servers.md) |
| `skills/drizzle-migration/SKILL.ko.md` | [읽기](aiwf-nestjs-nextjs/skills/drizzle-migration/SKILL.ko.md) | [비교](../../plugins/aiwf-nestjs-nextjs/skills/drizzle-migration/SKILL.md) |
| `skills/implement/SKILL.ko.md` | [읽기](aiwf-nestjs-nextjs/skills/implement/SKILL.ko.md) | [비교](../../plugins/aiwf-nestjs-nextjs/skills/implement/SKILL.md) |
| `skills/implement/references/project-layout.ko.md` | [읽기](aiwf-nestjs-nextjs/skills/implement/references/project-layout.ko.md) | [비교](../../plugins/aiwf-nestjs-nextjs/skills/implement/references/project-layout.md) |
| `skills/nest-test/SKILL.ko.md` | [읽기](aiwf-nestjs-nextjs/skills/nest-test/SKILL.ko.md) | [비교](../../plugins/aiwf-nestjs-nextjs/skills/nest-test/SKILL.md) |
| `skills/playwright-test/SKILL.ko.md` | [읽기](aiwf-nestjs-nextjs/skills/playwright-test/SKILL.ko.md) | [비교](../../plugins/aiwf-nestjs-nextjs/skills/playwright-test/SKILL.md) |
| `skills/react-test/SKILL.ko.md` | [읽기](aiwf-nestjs-nextjs/skills/react-test/SKILL.ko.md) | [비교](../../plugins/aiwf-nestjs-nextjs/skills/react-test/SKILL.md) |

## aiwf-spec

| 문서 | 한글 검토본 | 원문 |
| --- | --- | --- |
| `skills/sync-docs/SKILL.ko.md` | [읽기](aiwf-spec/skills/sync-docs/SKILL.ko.md) | [비교](../../plugins/aiwf-spec/skills/sync-docs/SKILL.md) |
| `skills/workflow/SKILL.ko.md` | [읽기](aiwf-spec/skills/workflow/SKILL.ko.md) | [비교](../../plugins/aiwf-spec/skills/workflow/SKILL.md) |

## aiwf-vaadin-jooq

| 문서 | 한글 검토본 | 원문 |
| --- | --- | --- |
| `agents/uc-coverage.ko.md` | [읽기](aiwf-vaadin-jooq/agents/uc-coverage.ko.md) | [비교](../../plugins/aiwf-vaadin-jooq/agents/uc-coverage.md) |
| `rules/mcp-servers.ko.md` | [읽기](aiwf-vaadin-jooq/rules/mcp-servers.ko.md) | [비교](../../plugins/aiwf-vaadin-jooq/rules/mcp-servers.md) |
| `skills/browserless-test/SKILL.ko.md` | [읽기](aiwf-vaadin-jooq/skills/browserless-test/SKILL.ko.md) | [비교](../../plugins/aiwf-vaadin-jooq/skills/browserless-test/SKILL.md) |
| `skills/coverage-check/SKILL.ko.md` | [읽기](aiwf-vaadin-jooq/skills/coverage-check/SKILL.ko.md) | [비교](../../plugins/aiwf-vaadin-jooq/skills/coverage-check/SKILL.md) |
| `skills/flyway-migration/SKILL.ko.md` | [읽기](aiwf-vaadin-jooq/skills/flyway-migration/SKILL.ko.md) | [비교](../../plugins/aiwf-vaadin-jooq/skills/flyway-migration/SKILL.md) |
| `skills/hilla-test/SKILL.ko.md` | [읽기](aiwf-vaadin-jooq/skills/hilla-test/SKILL.ko.md) | [비교](../../plugins/aiwf-vaadin-jooq/skills/hilla-test/SKILL.md) |
| `skills/implement/SKILL.ko.md` | [읽기](aiwf-vaadin-jooq/skills/implement/SKILL.ko.md) | [비교](../../plugins/aiwf-vaadin-jooq/skills/implement/SKILL.md) |
| `skills/implement-hilla/SKILL.ko.md` | [읽기](aiwf-vaadin-jooq/skills/implement-hilla/SKILL.ko.md) | [비교](../../plugins/aiwf-vaadin-jooq/skills/implement-hilla/SKILL.md) |
| `skills/karibu-test/SKILL.ko.md` | [읽기](aiwf-vaadin-jooq/skills/karibu-test/SKILL.ko.md) | [비교](../../plugins/aiwf-vaadin-jooq/skills/karibu-test/SKILL.md) |
| `skills/playwright-test/SKILL.ko.md` | [읽기](aiwf-vaadin-jooq/skills/playwright-test/SKILL.ko.md) | [비교](../../plugins/aiwf-vaadin-jooq/skills/playwright-test/SKILL.md) |
| `skills/playwright-test/references/dramafinder-api.ko.md` | [읽기](aiwf-vaadin-jooq/skills/playwright-test/references/dramafinder-api.ko.md) | [비교](../../plugins/aiwf-vaadin-jooq/skills/playwright-test/references/dramafinder-api.md) |

## 로컬 설치본: grill-with-docs

| 문서 | 한글 검토본 | 원문 |
| --- | --- | --- |
| `ADR-FORMAT.ko.md` | [읽기](local/grill-with-docs/ADR-FORMAT.ko.md) | [비교](local/grill-with-docs/source/ADR-FORMAT.md) |
| `CONTEXT-FORMAT.ko.md` | [읽기](local/grill-with-docs/CONTEXT-FORMAT.ko.md) | [비교](local/grill-with-docs/source/CONTEXT-FORMAT.md) |
| `README.ko.md` | [읽기](local/grill-with-docs/README.ko.md) | [비교](local/grill-with-docs/source/README.md) |
| `SKILL.ko.md` | [읽기](local/grill-with-docs/SKILL.ko.md) | [비교](local/grill-with-docs/source/SKILL.source.md) |

## 로컬 설치본: use-case-spec-driven-development

| 문서 | 한글 검토본 | 원문 |
| --- | --- | --- |
| `SKILL.ko.md` | [읽기](local/use-case-spec-driven-development/SKILL.ko.md) | [비교](local/use-case-spec-driven-development/source/SKILL.source.md) |
| `agents/openai.ko.md` | [읽기](local/use-case-spec-driven-development/agents/openai.ko.md) | [비교](local/use-case-spec-driven-development/source/agents/openai.yaml) |
| `references/use-case-sdd-document-map.ko.md` | [읽기](local/use-case-spec-driven-development/references/use-case-sdd-document-map.ko.md) | [비교](local/use-case-spec-driven-development/source/references/use-case-sdd-document-map.md) |
