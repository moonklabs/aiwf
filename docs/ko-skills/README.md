# 스킬 한글 검토 문서

기능 추가에 앞서 실제 스킬의 지시를 사람이 읽고 검토할 수 있도록 관리한다. 이 폴더는 설치용 스킬이 아니라 **휴먼 리뷰용 문서**다. 원문 지시를 요약하지 않고 한국어로 옮기며, 실행 원문은 별도 경로에 보존한다.

## 먼저 검토할 문서

- [Core 스킬과 참조 문서](#core): 요구사항, 용어, 유스케이스, 테스트, 명세 검토, 역공학.
- [AIWF workflow](aiwf-spec/skills/workflow/SKILL.ko.md): core와 구현·검증·검토 결과를 연결하는 현재 지시.
- [개발 후 문서 동기화](aiwf-spec/skills/sync-docs/SKILL.ko.md): 변경 범위에 맞는 UC·규칙·테스트 정의·모델·사용 안내 갱신과 구현 불일치 보고.
- [sync-docs 추가와 검증 기록](../modernization/SYNC-DOCS-VALIDATION-2026-10-04.ko.md): 설치·회귀 검사와 독립 에이전트 실행 예제, 미검증 범위와 휴먼 검토 항목.
- [로컬 두 스킬](#로컬-설치-스킬): 사용자가 제시한 요구사항 정리와 유스케이스 기반 개발 스킬. core 포함 여부와 문서 규약 차이도 함께 확인한다.
- [각 플러그인의 README 한글본](CATALOG.md#플러그인-readme), [전체 번역 문서 목록](CATALOG.md), [작성 규칙](TRANSLATION-RULES.md), [정리 계획](PLAN.md), [원문·번역·검토 관리 목록](manifest.json).
- [CLI 생산성 분석과 권고안](../modernization/CLI-PRODUCTIVITY.ko.md): 원문·한글본의 변경과 검토 준비를 우선하고 검증 자동화를 단계적으로 연결하는 제안. 새 CLI 명령이나 휴먼 승인을 추가한 기록은 아니다.
- [깊은 역설계 고도화 검토안](../modernization/DEEP-REVERSE-ENGINEERING.ko.md): 현행 동작의 근거 연결, 실행 재현과 충돌 검토를 보강하는 제안. 기존 스킬 변경이나 대상 제품의 역설계 완료 기록은 아니다.
- [브라운필드·그린필드 작업 가이드](../modernization/BROWNFIELD-GREENFIELD.ko.md): 기존 동작 보존·변경 영향 분석과 신규 목표·첫 구현을 각각 명세·검증으로 연결하는 제안.
- [Claude 두 세션의 계획 리뷰](../modernization/CLAUDE-PLAN-REVIEW-2026-10-03.ko.md): 방향과 검증 계약의 독립 AI 리뷰 및 남은 판단. 실제 휴먼 리뷰 상태는 바꾸지 않는다.
- [파일럿 계획](../modernization/PILOT-UC-001.ko.md)과 [실행 결과](../modernization/PILOT-RESULT-2026-10-03.ko.md): 완료 기준·검사 연결표와 로컬 예제의 실패·재검증 근거. `aiwf-spec` README 원문·한글본에서 함께 연결하며 실제 제품 적용·휴먼 리뷰는 대기 상태다.

기준 저장소 커밋은 `6bbfcf2ee40ec88b939c59d404a59554c761b680`이다. 파일별 실제 기준은 관리 목록의 원문 SHA256이다. 저장소 스킬 35개와 연결된 Markdown 참조·규칙·프롬프트, 플러그인 8개의 README를 번역 대상으로 삼는다. 로컬 두 스킬은 검토용 원문 스냅샷과 함께 별도 관리한다.

## 플러그인 README

플러그인별 README는 설치·구성·출처 안내를 담으므로 스킬 문서와 함께 한국어로 유지한다. 원문 README를 수정할 때 번역, 이 목록, `CATALOG.md`, `manifest.json`을 같은 변경에서 갱신하고, 검토가 끝나지 않은 버전은 `awaiting_review`로 둔다.

| 플러그인 | 한글 검토본 |
| --- | --- |
| `aiwf-core` | [README](aiwf-core/README.ko.md) |
| `aiwf-spec` | [README](aiwf-spec/README.ko.md) |
| `aiwf-vaadin-jooq` | [README](aiwf-vaadin-jooq/README.ko.md) |
| `aiwf-angular-jpa` | [README](aiwf-angular-jpa/README.ko.md) |
| `aiwf-blazor-dotnet` | [README](aiwf-blazor-dotnet/README.ko.md) |
| `aiwf-nestjs-nextjs` | [README](aiwf-nestjs-nextjs/README.ko.md) |
| `aiwf-delegate-claude` | [README](aiwf-delegate-claude/README.ko.md) |
| `aiwf-delegate-codex` | [README](aiwf-delegate-codex/README.ko.md) |

**검토 상태는 모두 `awaiting_review`에서 시작한다.** 에이전트의 번역 작성과 자동 검사 통과는 사람의 의미 검토나 승인이 아니다. 명세의 `Approved`, 구현 수용, merge·배포 승인과도 별개다.

## Core

| 스킬 | 검토할 내용 | 한글 검토본 |
| --- | --- | --- |
| `requirements` | FR/NFR/제약, 상태, 용어집 | [지시](aiwf-core/skills/requirements/SKILL.ko.md) |
| `entity-model` | 엔티티·관계·속성·데이터 모델 | [지시](aiwf-core/skills/entity-model/SKILL.ko.md) |
| `use-case-diagram` | 액터와 시스템 경계, UC 관계 | [지시](aiwf-core/skills/use-case-diagram/SKILL.ko.md) |
| `use-case-spec` | 기본·대안 흐름, BR, 형식·검사·검토 전환 | [지시](aiwf-core/skills/use-case-spec/SKILL.ko.md) |
| `test-case` | UC·업무 프로세스에서 테스트 도출 | [지시](aiwf-core/skills/test-case/SKILL.ko.md) |
| `spec-review` | 구조 검사와 의미 검토, 발견 사항 처리 | [지시](aiwf-core/skills/spec-review/SKILL.ko.md) |
| `reverse-engineer` | 기존 구현을 근거로 현행 명세 작성 | [지시](aiwf-core/skills/reverse-engineer/SKILL.ko.md) |

각 지시의 참조 링크에서 형식, 체크리스트와 예제도 검토할 수 있다. Upstream 버전은 core `2.19.0`이며, 원본 파일과 `UPSTREAM.json`, `LICENSE`, `NOTICE`는 [원문 플러그인](../../plugins/aiwf-core/)에 유지한다.

## 선택 위임 애드온

설치 기본 구성에는 포함하지 않는다. Claude 또는 Codex를 대상으로 지정해 명시적으로 실행하는 두 스킬이며, 현재 호스트와 대상이 다르면 현재 요청에 `--cross-cli`가 있어야 CLI를 시작한다.

| 스킬 | 한글 검토본 |
| --- | --- |
| `delegate-claude` | [지시](aiwf-delegate-claude/skills/delegate-claude/SKILL.ko.md) |
| `delegate-codex` | [지시](aiwf-delegate-codex/skills/delegate-codex/SKILL.ko.md) |

## 기술 스택별 스킬

| 플러그인 | 한글 검토본 |
| --- | --- |
| Vaadin / jOOQ (8개) | [implement](aiwf-vaadin-jooq/skills/implement/SKILL.ko.md), [implement-hilla](aiwf-vaadin-jooq/skills/implement-hilla/SKILL.ko.md), [flyway-migration](aiwf-vaadin-jooq/skills/flyway-migration/SKILL.ko.md), [coverage-check](aiwf-vaadin-jooq/skills/coverage-check/SKILL.ko.md), [karibu-test](aiwf-vaadin-jooq/skills/karibu-test/SKILL.ko.md), [browserless-test](aiwf-vaadin-jooq/skills/browserless-test/SKILL.ko.md), [hilla-test](aiwf-vaadin-jooq/skills/hilla-test/SKILL.ko.md), [playwright-test](aiwf-vaadin-jooq/skills/playwright-test/SKILL.ko.md) |
| Angular / JPA (6개) | [implement](aiwf-angular-jpa/skills/implement/SKILL.ko.md), [flyway-migration](aiwf-angular-jpa/skills/flyway-migration/SKILL.ko.md), [coverage-check](aiwf-angular-jpa/skills/coverage-check/SKILL.ko.md), [spring-boot-test](aiwf-angular-jpa/skills/spring-boot-test/SKILL.ko.md), [vitest-test](aiwf-angular-jpa/skills/vitest-test/SKILL.ko.md), [playwright-test](aiwf-angular-jpa/skills/playwright-test/SKILL.ko.md) |
| Blazor / .NET (5개) | [implement](aiwf-blazor-dotnet/skills/implement/SKILL.ko.md), [ef-migration](aiwf-blazor-dotnet/skills/ef-migration/SKILL.ko.md), [bunit-test](aiwf-blazor-dotnet/skills/bunit-test/SKILL.ko.md), [dotnet-test](aiwf-blazor-dotnet/skills/dotnet-test/SKILL.ko.md), [playwright-test](aiwf-blazor-dotnet/skills/playwright-test/SKILL.ko.md) |
| NestJS / Next.js (5개) | [implement](aiwf-nestjs-nextjs/skills/implement/SKILL.ko.md), [drizzle-migration](aiwf-nestjs-nextjs/skills/drizzle-migration/SKILL.ko.md), [nest-test](aiwf-nestjs-nextjs/skills/nest-test/SKILL.ko.md), [react-test](aiwf-nestjs-nextjs/skills/react-test/SKILL.ko.md), [playwright-test](aiwf-nestjs-nextjs/skills/playwright-test/SKILL.ko.md) |

스킬 지시와 참조 문서는 플러그인 `skills/`, `rules/`, `agents/` 아래에서 찾고, 각 플러그인 루트 `README.md`도 별도의 한글본으로 관리한다. 법적 문서(`LICENSE`, `NOTICE`)와 JSON·Python·Java·TypeScript·BPMN 등의 실행·예제 파일은 번역 대상에서 제외하며 필요한 경우 원문에 연결한다. 코드 블록의 내용과 순서는 보존한다. 중첩 Markdown 예제가 렌더링을 깨뜨리는 경우에만 바깥 펜스 길이를 늘리고 관리 목록에 보정 사유를 기록한다. 실제 실행과 API 유효성 검증은 별도 작업이다.

## 로컬 설치 스킬

| 스킬 | 역할 | 한글 검토본 |
| --- | --- | --- |
| `grill-with-docs` | 질문을 하나씩 주고받으며 용어·범위·설계 결정을 정리 | [지시](local/grill-with-docs/SKILL.ko.md), [용어집 형식](local/grill-with-docs/CONTEXT-FORMAT.ko.md), [ADR 형식](local/grill-with-docs/ADR-FORMAT.ko.md), [소개·출처](local/grill-with-docs/README.ko.md) |
| `use-case-spec-driven-development` | 신규·현행·확장 모드에서 명세·작업분해·구현·검증 연결 | [지시](local/use-case-spec-driven-development/SKILL.ko.md), [문서 맵](local/use-case-spec-driven-development/references/use-case-sdd-document-map.ko.md), [Codex 표시 정보](local/use-case-spec-driven-development/agents/openai.ko.md) |

원문은 사용자의 `~/.codex/skills/` 설치본에서 가져온 `source/` 스냅샷이다. 두 스킬은 현재 core나 배포·설치 목록에 포함되어 있지 않으며, 여기의 문서 추가는 스킬 설치를 뜻하지 않는다. Grill의 출처는 [로컬 소개 원문](local/grill-with-docs/source/README.md)에 기록되어 있다.

검토 때 다음 문서 규약 차이를 먼저 확인한다. 아래는 번역에 섞어 넣지 않은 AIWF 검토 메모다.

- Grill의 `CONTEXT.md`는 용어 설명 목록이고, core는 `docs/glossary.md`의 `Term | Definition | Avoid` 표를 사용한다. 파일명만 바꿔 같은 형식으로 취급할 수 없다.
- Grill의 `docs/adr/`와 로컬 SDD의 `docs/business_rules.md`, `docs/work_breakdown.md`는 현재 AIWF pin 대상에 자동 포함되지 않는다. AIWF의 대응 경로는 `docs/architecture/`, `docs/plans/`이며 BR은 UC 안에서 관리한다.
- 로컬 SDD는 분석·문서만 요청한 경우 그 산출물에서 멈춘다. 현재 AIWF workflow의 기본 산출물은 코드와 review packet까지다. 호출 전에 요청된 종료 지점을 확인해야 한다.
- 한국어 본문을 작성할 수 있어도 파서용 영어 헤딩·상태·ID를 바꾸면 검사와 호환되지 않을 수 있다. 휴먼 리뷰본의 한국어 제목을 실행 명세에 그대로 복사하지 않는다.

## 모든 작업의 문서 관리 순서

1. 변경 전 이 목록과 관련 플러그인 README, 원문·한글 검토본을 읽는다. 사용자에게 검토가 필요한 지시와 영향을 식별한다.
2. 스킬 지시·참조·규칙·프롬프트 또는 플러그인 README가 바뀌면 같은 변경에서 한글본을 수정한다. 추가·삭제·이동도 README 목록, `CATALOG.md`, 관리 목록에 반영한다. 원문이 바뀌지 않은 작업은 문서 영향 여부를 확인한다.
3. 실제로 번역을 검토한 뒤 파일별 `source_sha256`, `translation_sha256`을 갱신하고 `review_status`를 `awaiting_review`로 되돌린다. 해시만 다시 찍어서 오래된 번역을 최신으로 표시하지 않는다. SHA256은 `shasum -a 256 <원문> <번역>`으로 확인할 수 있다.
4. `npm run docs:check`를 실행해 대상 누락, 변경, 코드 예제 차이와 문서 링크를 확인한다. 로컬 원문이 이 컴퓨터에 있으면 스냅샷과도 비교한다. `npm run docs:check:local`은 로컬 원문이 스냅샷과 다를 때 실패한다. 로컬 자료가 없으면 스냅샷 기준으로만 확인했다고 출력한다.
5. 관련 개발 검증을 수행하고, 최종 보고에 한글 검토본 링크와 남은 검토 사항을 남긴다.
6. 실제 사람이 검토한 경우에만 `human_reviewed`와 검토자·시각·검토한 두 해시를 `human_review`에 기록한다. 예를 들어 `reviewer`, `reviewed_at`, `source_sha256`, `translation_sha256`을 남긴다. 코드나 제품 승인으로 확대 해석하지 않는다.

자동 검사는 파일 정합성과 일부 누락을 찾는 도구다. 번역의 의미, 원문 지시의 적절성, 요구사항·테스트의 충분성은 사람이 검토한다. 작성 규칙과 변경 이력을 먼저 정리하고 검토 자료가 최신인 상태에서 기능 작업을 진행한다.
