# AIWF — 명세에서 구현과 검증까지

[English](README.md)

AIWF는 유스케이스 명세를 Git에 유지하면서 기존 Claude Code/Codex로 구현하고, 실제 검증 결과를 검토 가능한 형태로 남기는 개발 워크플로우다.

2026-10-02부터 개선 중이다. 새 경로는 두 플러그인으로 나뉜다. **`aiwf-core`**는 AIUP에서 가져온 방법론 core로 요구사항·유스케이스·엔티티·명세 검토용 upstream 스킬 7개를 담는다. **`aiwf-spec`**는 AIWF가 추가한 `workflow` 스킬을 담고, 저장소 CLI를 사용해 비파괴 초기화·명세 버전 고정·변경 감지·검증 로그 묶기를 연결한다. Sprintable 연동과 무인 반복 실행은 후속 범위다. 아래 기능은 이 저장소의 개발 버전 기준이며 기존 npm 배포판에 포함됐다고 가정하면 안 된다.

## 가장 먼저 읽을 것

- [개선 방향과 단계](docs/modernization/DIRECTION.ko.md)
- [검증 기록과 한계](docs/modernization/VALIDATION.md)
- [Sprintable 연결 계약 초안](docs/modernization/SPRINTABLE.ko.md)
- [한국어 지출 제출 예제](examples/spec-workflow/README.md)

## 개발 버전으로 시작하기

Node.js 20 이상. 명세 구조 검사에는 Python 3.9 이상이 필요하다. 새 CLI는 외부 Node 패키지 없이 실행된다.

```bash
# 실제 대상 프로젝트 폴더는 먼저 존재해야 한다.
node src/cli/spec-cli.js init --root /path/to/project --name "우리 서비스"

# Codex용 스킬 설치: 기존 스킬은 덮어쓰지 않는다.
node scripts/install-spec-skills.mjs --project /path/to/project --dry-run
node scripts/install-spec-skills.mjs --project /path/to/project --stack nestjs-nextjs --dry-run
node scripts/install-spec-skills.mjs --project /path/to/project --stack nestjs-nextjs
```

Codex는 기본적으로 `aiwf-core` 스킬 7개와 `aiwf-spec`의 `workflow`를 `aiwf-requirements`, `aiwf-use-case-spec`, ..., `aiwf-workflow`로 함께 설치하며 참조 문서·검사기·출처도 포함한다. `--stack`은 `vaadin-jooq`, `angular-jpa`, `blazor-dotnet`, `nestjs-nextjs` 중 하나를 골라 해당 stack을 추가한다. 기존 스킬은 덮어쓰지 않고 강제 플래그도 없다. 실제 호스트의 스킬 자동 선택과 모델 실행은 별도 파일럿에서 검증할 예정이다.

## 플러그인 구성

upstream AIUP 스킬 31개를 바이트 그대로 가져오고 AIWF 자체 `workflow` 1개를 더해 총 32개다. `aiwf-core`가 upstream 7개를, `aiwf-spec`가 AIWF `workflow` 하나만 담는다.

| 플러그인 | 역할 | 내용 |
|---|---|---|
| `aiwf-core` | 방법론 core (필수) | upstream 스킬 7개 바이트 그대로 (2.19.0) |
| `aiwf-spec` | AIWF 래퍼 (선택) | AIWF `workflow` 하나 |
| `aiwf-vaadin-jooq` | stack | upstream 스킬 8개 (2.20.0) |
| `aiwf-angular-jpa` | stack | upstream 스킬 6개 (0.7.0) |
| `aiwf-blazor-dotnet` | stack | upstream 스킬 5개 (0.7.0) |
| `aiwf-nestjs-nextjs` | stack | upstream 스킬 5개 (0.4.0) |

각 플러그인은 가져온 upstream 파일(`skills/`, stack은 `rules/`와 있는 경우 `agents/`, `LICENSE`, `NOTICE`)과 플러그인별 `UPSTREAM.json`을 둔다. 유일한 upstream 소스 수정은 `aiwf-core` NOTICE에 덧붙인 AIWF 출처 문구이며, 그 밖의 vendored 파일은 upstream 바이트와 동일하다. `aiwf-spec`는 자체 upstream이 없어 core의 [UPSTREAM.json](plugins/aiwf-core/UPSTREAM.json)을 가리킨다. 기존 AIWF 세션·작업 플러그인은 `aiwf-core-legacy`로 남겨 두었고 삭제한 파일은 없다. 설치는 파일 복사이며 네이티브 Codex 서브에이전트를 등록하지 않고 MCP도 자동 구성하지 않는다. `agents/uc-coverage.md` 같은 에이전트 프롬프트는 리소스로만 복사되고, 호스트 매핑은 `workflow` 스킬이 설명한다. 이름·개수·pin 갱신 절차는 [SKILLS.ko.md](docs/modernization/SKILLS.ko.md)에 정리했다.

Claude Code에서는 이 저장소를 marketplace로 등록하고 필요한 플러그인(`aiwf-core`, `aiwf-spec`, `aiwf-<stack>`)을 설치한 뒤 `/aiwf-core:use-case-spec`, `/aiwf-spec:workflow`, `/aiwf-nestjs-nextjs:implement`처럼 플러그인 이름으로 한정해 호출한다.

```text
/plugin marketplace add moonklabs/aiwf
/plugin install aiwf-spec@aiwf-plugins
/plugin install aiwf-nestjs-nextjs@aiwf-plugins
/aiwf-nestjs-nextjs:implement
```

원격 설치는 해당 변경이 저장소에 반영된 후 사용할 수 있다. 로컬 개발 중에는 현재 checkout의 절대 경로로 marketplace를 등록한다.

## 개발 흐름

1. 사용자 목표와 범위 밖의 일을 `docs/vision.md`에 작성한다.
2. 요구사항·엔티티·유스케이스·테스트 정의를 작성한다. 예전 시스템은 reverse-engineer로 실제 동작부터 조사한다.
3. 명세 구조와 참조를 검사하고, 의미 검토를 별도로 한다.
4. 구현 계획까지 포함한 명세 버전을 고정한다.
5. 현재 에이전트와 프로젝트 도구로 구현하고 실제 테스트를 실행한다.
6. 명세 변경을 확인하고, 실행 로그와 미검증 사항을 packet으로 남긴다.

```bash
# 저장소 checkout 기준 경로. 대상 프로젝트의 docs를 검사한다.
python3 plugins/aiwf-core/skills/spec-review/scripts/spec_lint.py \
  --docs /path/to/project/docs --strict --no-baseline

node src/cli/spec-cli.js pin --root /path/to/project
node src/cli/spec-cli.js check --root /path/to/project --json
```

초기화 문서는 Draft 템플릿이다. TODO를 채우고 UC/TC 문서를 작성한 후 pin한다. pin은 SHA256으로 파일 버전을 기록하며 승인을 부여하지 않는다. 명세를 수정했다면 변경 내용을 검토하고 `pin --refresh`로 명시적으로 갱신한다.

```text
project/
├── docs/
│   ├── vision.md
│   ├── requirements.md
│   ├── glossary.md
│   ├── entity_model.md
│   ├── use_cases.puml
│   ├── use_cases/UC-001-*.md
│   ├── test_cases/TC-001-*.md
│   ├── architecture/          # 선택
│   ├── plans/                 # 선택
│   └── processes/*.bpmn       # 선택
└── .aiwf/
    ├── spec-pin.json
    └── review-packet.json
```

헤딩·상태·ID는 파서 호환을 위해 영어 형식을 유지한다. 한국어 본문을 사용할 수 있지만 검사 통과가 한국어 의미의 완전성을 보장하지는 않는다.

## 검증 결과 묶기

테스트는 프로젝트의 도구로 실제 실행하고 로그를 저장한다. 다음 파일은 입력 형식 예시이며 테스트 성공을 증명하는 결과 자체가 아니다. `log`는 대상 프로젝트 안의 경로다.

```json
{
  "checks": [
    {
      "name": "UC-001 regression",
      "command": "npm test -- --runInBand",
      "status": "passed",
      "log": "artifacts/test.log"
    },
    {
      "name": "Business acceptance",
      "command": "stakeholder review",
      "status": "not_run"
    }
  ],
  "unverified": ["실제 사용자 업무 수용은 아직 확인하지 않음"]
}
```

```bash
node src/cli/spec-cli.js packet \
  --root /path/to/project --evidence /path/to/project/evidence.json
```

packet은 로그 본문과 SHA256, 명세 digest, 보고된 검사 결과를 보관한다. `failed`/`not_run`을 보존하며 결과는 `awaiting_review`로 남는다. CLI는 입력된 명령을 실행하지 않고 검사 결과를 독립적으로 인증하지 않는다. 기존 packet은 기본적으로 덮어쓰지 않으며 재생성에는 `--force`가 필요하다.

## 개발 검증

```bash
npm run test:spec
npm run validate:spec-plugin
npm run test:spec-upstream
```

새 경로는 dependency-free CLI + 이식한 명세 검사기로 구성된다. 오래된 `aiwf install`, `aiwf-sprint`, 레거시 플러그인은 별도 경로로 남아 있으며 이번 CLI에서 사용하지 않는다. 예전 자료는 [레거시 CLI 가이드](docs/CLI_USAGE_GUIDE.md)에서 확인할 수 있다. 실제 파일럿 후 제거 범위를 결정한다.

## 출처와 라이선스

`aiwf-core` 방법론 플러그인과 4개 stack 플러그인은 [AI Unified Process marketplace](https://github.com/AI-Unified-Process/marketplace) 커밋 `065dadda0f696c29ff2bacbda31b38152082e6fa`에서 가져왔다. `aiwf-core`와 `aiwf-vaadin-jooq`는 Simon Martinelli, `aiwf-angular-jpa`는 Marc Affolter, `aiwf-blazor-dotnet`은 Carl J. Mosca, `aiwf-nestjs-nextjs`는 Swift Ugandan의 작업이다. 각 플러그인의 `UPSTREAM.json`에 원본 커밋·파일 hash·수정 내역을 기록했다. 기존 AIWF 코드는 [MIT](LICENSE), 가져온 플러그인은 [Apache-2.0](plugins/aiwf-core/LICENSE)와 [NOTICE](plugins/aiwf-core/NOTICE)를 따른다.
