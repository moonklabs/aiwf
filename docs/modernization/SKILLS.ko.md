# AIWF 스킬 인벤토리

작성: 2026-10-02, 2026-10-03 core 분리 반영. 기준 upstream: AIUP marketplace `065dadda0f696c29ff2bacbda31b38152082e6fa`.

## 요약

- upstream 스킬 31개 + AIWF 자체 `workflow` 1개 = 총 32개.
- 방법론 core는 `plugins/aiwf-core`(`aiup-core` v2.19.0 스킬 7개).
- AIWF 래퍼는 `plugins/aiwf-spec`(`workflow` 1개).
- stack 4개 플러그인: 24개 (vaadin-jooq 8, angular-jpa 6, blazor-dotnet 5, nestjs-nextjs 5).
- 원본(vendored)은 upstream 바이트 그대로 두고 이름·명령 참조 변환은 설치본에만 적용한다.

## Core: plugins/aiwf-core

원본은 `aiup-core` v2.19.0(Simon Martinelli)이다. 7개 SKILL.md는 upstream 바이트와 동일하고 참조 문서와 Python 검사기도 수정하지 않았다. 유일한 upstream 소스 수정은 `NOTICE`에 AIWF 출처를 덧붙인 것이다. host 중립 작업 추적·증거 경계 지침은 여기가 아니라 `aiwf-spec`의 `workflow`에 있다. AIWF가 추가한 파일은 `README.md`, `UPSTREAM.json`, `.claude-plugin/plugin.json`뿐이다.

이전에는 이 7개를 `aiwf-spec`에 넣어 방법론 core와 AIWF 래퍼가 한 플러그인에 섞였는데, 2026-10-03에 원본 바이트 그대로 `aiwf-core`로 옮겨 분리했다.

| 설치 이름 (Codex) | 원본 스킬 |
|---|---|
| `aiwf-requirements` | `requirements` |
| `aiwf-use-case-diagram` | `use-case-diagram` |
| `aiwf-use-case-spec` | `use-case-spec` |
| `aiwf-entity-model` | `entity-model` |
| `aiwf-test-case` | `test-case` |
| `aiwf-spec-review` | `spec-review` |
| `aiwf-reverse-engineer` | `reverse-engineer` |

구조 검사기는 `skills/spec-review/scripts/spec_lint.py`, 유스케이스·테스트 검사기는 `skills/use-case-spec/scripts/validate_use_case.py`와 `skills/test-case/scripts/bpmn_paths.py`에 있다.

## Wrapper: plugins/aiwf-spec

AIWF가 추가한 `workflow` 하나만 담는다. upstream 스킬이 없으므로 자체 `UPSTREAM.json`도 없고 core의 [UPSTREAM.json](../../plugins/aiwf-core/UPSTREAM.json)을 가리킨다. `LICENSE`/`NOTICE`(Apache-2.0)만 함께 유지한다.

| 설치 이름 (Codex) | 원본 스킬 | 구분 |
|---|---|---|
| `aiwf-workflow` | (AIWF) | 자체 |

## Stacks: plugins/aiwf-<stack>

각 플러그인은 upstream 플러그인을 바이트 단위로 그대로 복사한 것이다. `skills/`, `rules/`, `agents/`, `LICENSE`, `NOTICE`는 수정하지 않았고 AIWF가 추가한 파일은 `README.md`, `UPSTREAM.json`, `.claude-plugin/plugin.json`뿐이다. 파일 hash는 각 플러그인의 UPSTREAM.json에 기록한다.

| 플러그인 | upstream | 버전 | 작성자 | 스킬 수 | 스킬 |
|---|---|---|---|---|---|
| `plugins/aiwf-vaadin-jooq` | `aiup-vaadin-jooq` | 2.20.0 | Simon Martinelli | 8 | `implement`, `implement-hilla`, `flyway-migration`, `coverage-check`, `karibu-test`, `browserless-test`, `hilla-test`, `playwright-test` |
| `plugins/aiwf-angular-jpa` | `aiup-angular-jpa` | 0.7.0 | Marc Affolter | 6 | `implement`, `flyway-migration`, `coverage-check`, `spring-boot-test`, `vitest-test`, `playwright-test` |
| `plugins/aiwf-blazor-dotnet` | `aiup-blazor-dotnet` | 0.7.0 | Carl J. Mosca | 5 | `implement`, `ef-migration`, `bunit-test`, `dotnet-test`, `playwright-test` |
| `plugins/aiwf-nestjs-nextjs` | `aiup-nestjs-nextjs` | 0.4.0 | Swift Ugandan | 5 | `implement`, `drizzle-migration`, `nest-test`, `react-test`, `playwright-test` |

`vaadin-jooq`와 `angular-jpa`는 `agents/uc-coverage.md`를 함께 가져온다. `blazor-dotnet`과 `nestjs-nextjs`는 호스트 에이전트를 포함하지 않는다. `rules/mcp-servers.md`는 모든 stack에 포함되며 문서 참고용이다.

## 원본과 설치본 정책

| 구분 | 위치 | 내용 |
|---|---|---|
| 원본(vendored) | `plugins/aiwf-core/`, `plugins/aiwf-spec/`, `plugins/aiwf-<stack>/` | upstream 바이트 그대로. 이름·참조를 바꾸지 않는다. |
| 설치본 | 대상 프로젝트 `.agents/skills/` | 복사 후 설치 이름으로 변환. core/spec `aiwf-*`, stack `aiwf-<stack>-*`. |

설치 시 SKILL.md `name`과 Markdown 본문의 `/skill`, `skill` 참조를 설치 이름으로 바꾸고 파일 끝에 AIWF 설치 수정 주석을 붙인다. vendored 원본은 변환하지 않는다. 이름 변환은 설치된 Markdown에만 적용되며, Java/TSX 같은 비-Markdown 참조 파일의 주석에 남은 upstream 명령 이름은 그대로 둔다. 복사본은 파일일 뿐이며 네이티브 Codex 서브에이전트를 등록하지 않는다. `agents/uc-coverage.md` 같은 에이전트 프롬프트는 리소스로 설치되고 실행에는 호스트 매핑이 필요하며, 그 매핑은 `workflow` 스킬이 설명한다.

## 설치

Claude Code는 marketplace 항목을 쓴다. core는 `aiwf-core`(필수), 래퍼는 `aiwf-spec`(선택), stack은 `aiwf-<stack>`를 opt-in으로 설치한다. 스킬은 `/aiwf-core:use-case-spec`, `/aiwf-spec:workflow`, `/aiwf-nestjs-nextjs:implement`처럼 플러그인 이름으로 한정해 호출한다.

```text
/plugin marketplace add moonklabs/aiwf
/plugin install aiwf-core@aiwf-plugins
/plugin install aiwf-spec@aiwf-plugins
/plugin install aiwf-nestjs-nextjs@aiwf-plugins
```

Codex는 checkout에서 `scripts/install-spec-skills.mjs`로 설치한다. 기본으로 `aiwf-core` 7개와 `aiwf-spec`의 `workflow` 1개를 설치하고, `--stack`은 네 값 중 하나이며 그 stack을 추가한다.

```bash
# 미리보기: 쓰기 없음
node scripts/install-spec-skills.mjs --project /path/to/project --dry-run
node scripts/install-spec-skills.mjs --project /path/to/project --stack nestjs-nextjs --dry-run

# 실제 설치
node scripts/install-spec-skills.mjs --project /path/to/project
node scripts/install-spec-skills.mjs --project /path/to/project --stack nestjs-nextjs
```

위 두 실제 설치 줄은 대안 관계이며 순서대로 실행하는 것이 아니다. 기본 설치가 core+workflow 스킬을 이미 만들면, 뒤이은 `--stack` 설치는 overwrite 없음 원칙 때문에 거부된다. 이미 존재하는 대상 스킬이 있으면 설치를 거부하고 아무것도 덮어쓰지 않는다. `--force` 같은 강제 플래그는 없다. 기존 설치를 갱신하려면 별도로 검토한 마이그레이션이 필요하다. 설치기는 MCP 서버를 자동 구성하지 않으며 새 의존성도 추가하지 않는다.

## 최신 pin 갱신 절차

저장소에 upstream을 자동으로 따라가는 `sync` 명령은 없다. 다음을 수동으로 한다.

1. upstream을 fetch하고 대상 커밋을 검토한다. 예: `git ls-remote https://github.com/AI-Unified-Process/marketplace HEAD`.
2. 대상 플러그인(core `plugins/aiwf-core`, stack `plugins/aiwf-<stack>`)의 `skills/`, `rules/`, `agents/`, `LICENSE`, `NOTICE`를 가져온다. vendored 파일은 upstream 바이트 그대로 둔다. `aiwf-spec`는 자체 upstream이 없다.
3. 각 플러그인의 `UPSTREAM.json`에서 `commit`, `upstream_version`, `upstream_sha256`을 갱신한다. core `NOTICE`처럼 불가피한 수정은 `modifications`/`modified_sha256`에 기록한다.
4. upstream 버전이나 스킬 집합이 바뀌면 테스트와 validator에 하드코딩된 버전/스킬 개수 상수도 함께 갱신한다.
5. 검증: `node --test tests/spec-workflow/stack-provenance.test.mjs`, `npm run validate:spec-plugin`, `npm run test:spec`, `npm run test:spec-upstream`.
6. 패키징: `npm pack --dry-run`으로 포함 파일을 확인한다.

바이트 대조는 선택적 참조 checkout(`AIWF_AIUP_REFERENCE`)이 있을 때 추가로 수행한다. 출처 hash와 설치 이름 변환은 각각 `stack-provenance.test.mjs`와 `install-skills.test.mjs`가 검사한다.
