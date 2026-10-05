# AIWF 스킬 인벤토리

작성: 2026-10-02, 2026-10-03 core 분리, 2026-10-04 문서 동기화 스킬 반영, 2026-10-05 안내 문구 정리 및 Electron/React 스택·design-spec 애드온 추가.

## 요약

- 기존 방법론·스택 스킬 31개 + Electron/React 6개 + `workflow`, `sync-docs` 2개 + design-spec 5개 + 선택 위임 스킬 2개 = 총 46개 제공.
- 방법론 core는 `plugins/aiwf-core`(v2.19.0 스킬 7개).
- AIWF 래퍼는 `plugins/aiwf-spec`(`workflow`, `sync-docs` 2개, 0.3.0).
- design-spec 애드온은 `plugins/aiwf-design`(`workflow`, `figma-sync`, `apply`, `trace`, `review` 5개, 0.1.0, `aiwf-core` 선행). 기본 설치에는 포함되지 않고 `--design`으로 추가하며 설치 이름은 `aiwf-design-<name>`이다.
- 선택 위임 애드온은 `plugins/aiwf-delegate-claude`와 `plugins/aiwf-delegate-codex`에 각각 스킬 1개를 둔다. 기본 설치에는 포함되지 않는다.
- stack 5개 플러그인: 30개 (vaadin-jooq 8, angular-jpa 6, blazor-dotnet 5, nestjs-nextjs 5, electron-react 6).
- 원본(vendored)은 upstream 바이트 그대로 두고 이름·명령 참조 변환은 설치본에만 적용한다.

## Core: plugins/aiwf-core

core는 방법론 스킬 7개와 참조 문서, Python 검사기를 제공한다. host 중립 작업 추적·증거 경계 지침은 `aiwf-spec`의 `workflow`에 있다.

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

`workflow`와 `sync-docs`를 담는다. `LICENSE`/`NOTICE`(Apache-2.0)를 함께 유지한다.

| 설치 이름 (Codex) | 원본 스킬 | 구분 |
|---|---|---|
| `aiwf-workflow` | (AIWF) | 자체 |
| `aiwf-sync-docs` | (AIWF) | 개발 후 영향 문서 동기화 |

## Design-spec: plugins/aiwf-design

디자이너 작업 공간(`docs/design-spec`)과 기획 문서·Figma·코드 사이의 작업을 역할별로 나눈 자체 스킬 5개를 담는다. `aiwf-core`를 선행 플러그인으로 선언하고 `LICENSE`/`NOTICE`(Apache-2.0)를 유지하며 `UPSTREAM.json`은 두지 않는다. 기본 설치에는 포함되지 않고 `--design`으로 추가한다. 설치본은 `aiwf-design:<name>` 참조와 `<skills>/<name>/` 스크립트 경로를 설치 이름으로 바꾼다.

| 설치 이름 (Codex) | Claude Code | 구분 |
|---|---|---|
| `aiwf-design-workflow` | `/aiwf-design:workflow` | 역할 라우터, 템플릿으로 시작 |
| `aiwf-design-figma-sync` | `/aiwf-design:figma-sync` | 읽기 전용 readback·병합·토큰 대조 |
| `aiwf-design-apply` | `/aiwf-design:apply` | Figma 디자인을 코드에 적용 |
| `aiwf-design-trace` | `/aiwf-design:trace` | 기획 ↔ 디자인 ↔ 구현 대응표 |
| `aiwf-design-review` | `/aiwf-design:review` | 구조 lint와 판단 검사 |

## Optional delegates: plugins/aiwf-delegate-<target>

Claude와 Codex용 위임 스킬은 서로 독립된 선택 애드온이다. vendored upstream이 아니며 각각 자체 플러그인 안에 `delegate-claude` 또는 `delegate-codex` 스킬 하나를 둔다. Codex 설치 스크립트는 `--delegate claude` 또는 `--delegate codex`를 선택한 경우에만 `aiwf-delegate-<target>` 이름으로 복사한다. skills.sh 설치는 원래 `delegate-<target>` 이름을 사용한다. Claude Code marketplace 항목은 `/aiwf-delegate-claude:delegate-claude` 및 `/aiwf-delegate-codex:delegate-codex`로 호출한다.

두 스킬 모두 직접 호출만 허용한다. 교차 CLI는 현재 요청에 명시된 `--cross-cli` 토큰이 있을 때만 실행한다. 기본은 읽기 전용이며, 현재 요청에 쓰기 요청과 명시 범위가 함께 있어야 한다. 실제 변경은 대상 CLI의 자체 권한 정책이 허용해야 한다.

## Stacks: plugins/aiwf-<stack>

각 stack 플러그인은 `skills/`와 플러그인 manifest를 포함한다. 기존 4종은 `rules/`, 필요한 경우 `agents/`도 포함한다. `LICENSE`와 `NOTICE`는 각 플러그인에 유지한다.

| 플러그인 | 버전 | 스킬 수 | 스킬 |
|---|---|---|---|
| `plugins/aiwf-vaadin-jooq` | 2.20.0 | 8 | `implement`, `implement-hilla`, `flyway-migration`, `coverage-check`, `karibu-test`, `browserless-test`, `hilla-test`, `playwright-test` |
| `plugins/aiwf-angular-jpa` | 0.7.0 | 6 | `implement`, `flyway-migration`, `coverage-check`, `spring-boot-test`, `vitest-test`, `playwright-test` |
| `plugins/aiwf-blazor-dotnet` | 0.7.0 | 5 | `implement`, `ef-migration`, `bunit-test`, `dotnet-test`, `playwright-test` |
| `plugins/aiwf-nestjs-nextjs` | 0.4.0 | 5 | `implement`, `drizzle-migration`, `nest-test`, `react-test`, `playwright-test` |
| `plugins/aiwf-electron-react` | 0.1.0 | 6 | `scaffold`, `implement`, `agent-runtime`, `renderer-test`, `electron-test`, `package` |

`vaadin-jooq`와 `angular-jpa`는 `agents/uc-coverage.md`를 함께 가져온다. `blazor-dotnet`과 `nestjs-nextjs`는 호스트 에이전트를 포함하지 않는다. `rules/mcp-servers.md`는 기존 4종 stack에 포함되며 문서 참고용이다.

`aiwf-electron-react`는 core의 UC·TC 명세를 확장하는 자체 MIT 플러그인이다. Sally·PI·기타 런타임 어댑터와 UI의 경계, typed IPC, 네이티브 패키징을 다룬다. 요청된 버전 조합은 검증 전 기준이며 실제 앱의 lockfile·import·프로토콜로 확인한다. 별도 agents/rules/MCP를 추가하지 않는다. [한글 README](../ko-skills/aiwf-electron-react/README.ko.md)에서 전체 검토본으로 이동할 수 있다.

## 원본과 설치본 정책

| 구분 | 위치 | 내용 |
|---|---|---|
| 원본(vendored) | `plugins/aiwf-core/`와 기존 4종 stack | upstream 바이트 그대로. 이름·참조를 바꾸지 않는다. |
| 자체 지시 | `plugins/aiwf-spec/`, `plugins/aiwf-delegate-claude/`, `plugins/aiwf-delegate-codex/`, `plugins/aiwf-electron-react/` | 한글 검토본·manifest·catalog와 함께 수정한다. |
| 설치본 | 대상 프로젝트 `.agents/skills/` | 복사 후 설치 이름으로 변환. core/spec `aiwf-*`, stack `aiwf-<stack>-*`. |

설치 시 SKILL.md `name`과 Markdown 본문의 `/skill`, `skill` 참조를 설치 이름으로 바꾸고 파일 끝에 AIWF 설치 수정 주석을 붙인다. vendored 원본은 변환하지 않는다. 이름 변환은 설치된 Markdown에만 적용되며, Java/TSX 같은 비-Markdown 참조 파일의 주석에 남은 upstream 명령 이름은 그대로 둔다. 복사본은 파일일 뿐이며 네이티브 Codex 서브에이전트를 등록하지 않는다. `agents/uc-coverage.md` 같은 에이전트 프롬프트는 리소스로 설치되고 실행에는 호스트 매핑이 필요하며, 그 매핑은 `workflow` 스킬이 설명한다. 선택 위임 스킬도 하위 에이전트 런타임을 설치하지 않는다.

## 설치

Claude Code는 marketplace 항목을 쓴다. core는 `aiwf-core`(필수), 래퍼는 `aiwf-spec`(선택), stack은 `aiwf-<stack>`를 opt-in으로 설치한다. 스킬은 `/aiwf-core:use-case-spec`, `/aiwf-spec:workflow`, `/aiwf-nestjs-nextjs:implement`처럼 플러그인 이름으로 한정해 호출한다.

```text
/plugin marketplace add moonklabs/aiwf
/plugin install aiwf-core@aiwf-plugins
/plugin install aiwf-spec@aiwf-plugins
/plugin install aiwf-nestjs-nextjs@aiwf-plugins
```

Codex는 checkout에서 `scripts/install-spec-skills.mjs`로 설치한다. 기본으로 `aiwf-core` 7개와 `aiwf-spec`의 `workflow`, `sync-docs` 2개를 설치하고, `--stack`은 `vaadin-jooq`, `angular-jpa`, `blazor-dotnet`, `nestjs-nextjs`, `electron-react` 다섯 값 중 하나이며 그 stack을 추가한다.

```bash
# 미리보기: 쓰기 없음
node scripts/install-spec-skills.mjs --project /path/to/project --dry-run
node scripts/install-spec-skills.mjs --project /path/to/project --stack nestjs-nextjs --dry-run

# 실제 설치
node scripts/install-spec-skills.mjs --project /path/to/project
node scripts/install-spec-skills.mjs --project /path/to/project --stack nestjs-nextjs
```

위 두 실제 설치 줄은 대안 관계이며 순서대로 실행하는 것이 아니다. 기본 설치가 core+workflow+sync-docs 스킬을 이미 만들면, 뒤이은 `--stack` 설치는 overwrite 없음 원칙 때문에 거부된다. 이미 존재하는 대상 스킬이 있으면 설치를 거부하고 아무것도 덮어쓰지 않는다. `--force` 같은 강제 플래그는 없다. 기존 설치를 갱신하려면 별도로 검토한 마이그레이션이 필요하다. 설치기는 MCP 서버를 자동 구성하지 않으며 새 의존성도 추가하지 않는다.

## 최신 pin 갱신 절차

저장소에 upstream을 자동으로 따라가는 `sync` 명령은 없다. 기존 core와 4종 stack에 대해 다음을 수동으로 한다. 자체 Electron/React 플러그인에는 `UPSTREAM.json`을 만들지 않으며 원문·한글본·설치 검증을 함께 갱신한다.

1. 대상 플러그인의 `UPSTREAM.json`에 기록된 저장소와 기준 커밋을 확인하고, 갱신 대상 커밋을 검토한다.
2. 대상 플러그인(core `plugins/aiwf-core`, 기존 stack 4종)의 `skills/`, `rules/`, `agents/`, `LICENSE`, `NOTICE`를 가져온다. vendored 파일은 upstream 바이트 그대로 둔다. `aiwf-spec`, 선택 위임 애드온과 `aiwf-electron-react`는 자체 upstream이 없다.
3. 각 플러그인의 `UPSTREAM.json`에서 `commit`, `upstream_version`, `upstream_sha256`을 갱신한다. core `NOTICE`처럼 불가피한 수정은 `modifications`/`modified_sha256`에 기록한다.
4. upstream 버전이나 스킬 집합이 바뀌면 테스트와 validator에 하드코딩된 버전/스킬 개수 상수도 함께 갱신한다.
5. 검증: `node --test tests/spec-workflow/stack-provenance.test.mjs`, `npm run validate:spec-plugin`, `npm run test:spec`, `npm run test:spec-upstream`.
6. 패키징: `npm pack --dry-run`으로 포함 파일을 확인한다.

원본 hash와 설치 이름 변환은 각각 `stack-provenance.test.mjs`와 `install-skills.test.mjs`가 반복 검사한다. 특정 날짜의 임시 checkout을 가리키는 일회성 대조 경로는 제거했다.
