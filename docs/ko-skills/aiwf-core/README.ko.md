# AIWF Core 플러그인 안내

> 플러그인 README 한글 검토본입니다. 원문: [README](../../../plugins/aiwf-core/README.md). 검토 상태와 원문 SHA256은 [관리 목록](../manifest.json)에서 확인합니다. 번역과 자동 검사는 승인을 뜻하지 않습니다.

## 포함 내용

AIWF 방법론 core 플러그인입니다. Apache-2.0 라이선스이며 [LICENSE](../../../plugins/aiwf-core/LICENSE)와 [NOTICE](../../../plugins/aiwf-core/NOTICE)를 확인하세요.

방법론 스킬 7개는 요구사항, 엔티티, 유스케이스, 여정 정의, 역공학, 명세 검토를 다룹니다. 호스트에 종속되지 않는 작업 추적과 검증 근거 안내는 여기에 포함되지 않습니다.

| 스킬 | 목적 |
|---|---|
| `requirements` | 비전을 번호가 붙은 테스트 가능한 요구사항으로 구체화 |
| `use-case-diagram` | `use_cases.puml`과 액터 관리 |
| `use-case-spec` | `UC-*.md` 유스케이스 작성 |
| `entity-model` | `entity_model.md` 관리 |
| `test-case` | `TC-*.md` 테스트 정의 작성 |
| `spec-review` | 구조 검사와 전문가 검토 체크리스트 |
| `reverse-engineer` | 기존 시스템에서 관찰된 동작을 바탕으로 초안 작성 |

구조 검사기는 검토 스킬의 `skills/spec-review/scripts/spec_lint.py`에 들어 있습니다. `use-case-spec`과 `test-case`에는 `scripts/validate_use_case.py`와 `scripts/bpmn_paths.py`가 포함됩니다.

## 워크플로에서의 역할

이 플러그인은 필수 방법론 core입니다. 함께 제공되는 `aiwf-spec` 플러그인은 AIWF `workflow`와 `sync-docs` 스킬을 추가합니다. 이 스킬은 호스트에 종속되지 않는 작업 추적, 검증 근거, 완료 전 문서 동기화, Sprintable로 넘기는 경계를 안내합니다. 핀, 변경 감지, 검증 패킷을 제공하는 CLI는 플러그인에 포함되지 않으며 저장소의 `src/cli/spec-cli.js`에 있습니다(`aiwf-spec` npm 실행 파일). 따라서 마켓플레이스 플러그인만 설치해도 CLI 바이너리는 설치되지 않습니다. 스택 플러그인(`aiwf-vaadin-jooq`, `aiwf-angular-jpa`, `aiwf-blazor-dotnet`, `aiwf-nestjs-nextjs`, `aiwf-electron-react`)은 구현 및 테스트 스킬을 추가합니다.

## 설치

- Claude Code: `/plugin marketplace add moonklabs/aiwf`를 실행한 다음 `/plugin install aiwf-core@aiwf-plugins`로 설치합니다. 명령은 `/aiwf-core:use-case-spec`처럼 플러그인 이름을 붙여 호출합니다.
- Codex: `node scripts/install-spec-skills.mjs --project /path/to/project`를 실행하면 기본 설정으로 이 core와 `aiwf-spec` 래퍼가 설치됩니다. 스택을 추가하려면 `--stack <vaadin-jooq|angular-jpa|blazor-dotnet|nestjs-nextjs|electron-react>`를 지정합니다. 설치된 이름에는 `aiwf-` 접두사가 붙으므로 `requirements`는 `aiwf-requirements`가 됩니다. 기존 대상 스킬은 덮어쓰지 않습니다.

MCP 서버는 자동 설치하지 않습니다. Context7은 선택 사항이며 MCP 서버가 없어도 포함된 스킬을 사용할 수 있습니다.

## 라이선스

Apache-2.0. [LICENSE](../../../plugins/aiwf-core/LICENSE)와 [NOTICE](../../../plugins/aiwf-core/NOTICE)를 확인하세요.

## 마이그레이션 안내

이 스킬 7개는 이전에 `plugins/aiwf-spec`에 함께 들어 있었습니다. 이제 이 위치에 있으며 `aiwf-spec`에는 `workflow`와 `sync-docs` 스킬이 있습니다. 기존 설치는 자동 갱신되지 않고 강제 갱신도 없습니다. 기존 설치를 옮기는 작업은 별도 검토가 필요합니다.
