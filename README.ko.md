# AIWF — 명세에서 구현과 검증까지

[English](README.md)

AIWF는 유스케이스 명세를 Git에 유지하면서 기존 Claude Code/Codex로 구현하고, 실제 검증 결과를 검토 가능한 형태로 남기는 개발 워크플로우다.

명세 워크플로는 두 플러그인으로 나뉜다. **`aiwf-core`**는 요구사항·유스케이스·엔티티·명세 검토 및 전체·변경분 문서화 오케스트레이션을 위한 방법론 스킬 8개를 제공한다. **`aiwf-spec`**는 비파괴 초기화·명세 버전 고정·변경 감지·검증 로그 묶기를 연결하는 `workflow`와 개발 후 영향받는 문서를 정리하는 `sync-docs`를 제공한다. Claude/Codex 위임 애드온 두 개는 별도 선택 사항이다. Sprintable 연동과 무인 반복 실행은 후속 범위다. `aiwf@0.6.0`에는 설치 CLI와 선택 스택/design 구성, `docpilot`가 포함된다.

## 가장 먼저 읽을 것

- [스킬 한글 휴먼 리뷰본과 문서 관리 절차](docs/ko-skills/README.md) — 모든 작업에서 먼저 확인하고 관련 원문·번역을 함께 갱신한다.
- [Claude·Codex 위임 스킬 선택 설치·실행 명세](docs/modernization/DELEGATION-OPTIONAL.ko.md)
- [개선 방향과 단계](docs/modernization/DIRECTION.ko.md)
- [CLI 설치 중심 역할과 구현 검토](docs/modernization/CLI-INSTALLATION-REVIEW.ko.md) — npm 전역 CLI 설치, 공식 skills CLI 기반 구성 설치와 반복·추가 설치.
- [CLI 생산성 분석과 권고안](docs/modernization/CLI-PRODUCTIVITY.ko.md) — 실제 UC 파일럿 후 읽기 전용 검증과 선택 검사를 확장하는 제안. 원문·한글본 갱신은 모든 단계의 품질 조건이다.
- [Claude 두 세션의 계획 리뷰](docs/modernization/CLAUDE-PLAN-REVIEW-2026-10-03.ko.md) — 조건부 적합, 검토 당시 고정본과 지적 사항 보존.
- [파일럿 계획](docs/modernization/PILOT-UC-001.ko.md)과 [로컬 실행 결과](docs/modernization/PILOT-RESULT-2026-10-03.ko.md) — 완료 기준과 검사 연결표, drift 거부, 실패→수정→23개 테스트 통과. 실제 제품 적용·휴먼 수용·생산성 효과는 미검증이며 새 CLI 명령은 추가하지 않았다.
- [검증 기록과 한계](docs/modernization/VALIDATION.md)
- [Sprintable 연결 계약 초안](docs/modernization/SPRINTABLE.ko.md)
- [한국어 지출 제출 예제](examples/spec-workflow/README.md)

## CLI를 설치하고 스킬 구성 선택하기

`aiwf@0.6.0`의 기본 흐름은 **CLI를 npm 전역 설치한 뒤 프로젝트에 필요한 스킬 구성을 설치**하는 것이다. 패키지는 `aiwf`와 호환 실행 파일 `aiwf-spec`를 함께 제공한다.

포함된 `skills@1.7.0` 실행에는 **Node.js 22.20 이상**이 필요하다. 명세 구조 검사에는 Python 3.9 이상이 필요하다.

```bash
npm i -g aiwf
aiwf install

# 실제 대상 프로젝트에서 호스트와 스택을 지정해 재현 가능한 설치:
aiwf install --agent codex claude-code --stack electron-react --dry-run
aiwf install --agent codex claude-code --stack electron-react
aiwf status

# 위임은 선택 사항이며 나중에 기존 구성에 추가할 수 있다.
aiwf install --agent codex --stack electron-react --delegate claude codex

# design-spec 스킬도 선택 사항이다.
aiwf install --agent codex --design
```

대화형 터미널의 `aiwf install`은 호스트·선택 스택·위임·design-spec 스킬 포함 여부를 묻는다. 자동 실행에서는 `--agent`를 지정한다. 기본 추천 구성은 core와 workflow/문서 동기화이며, `--core-only`로 core만 선택할 수 있다. `--stack`은 `aiwf list`에 표시된 스택을 여러 개 선택할 수 있다. 스킬은 현재 프로젝트에 설치하며, 다른 프로젝트는 `--project /path/to/project`, 사용자 범위는 `--global`로 지정한다. **CLI의 npm 전역 설치와 스킬의 전역 설치는 별개다.**

AIWF는 플러그인 조합과 의존성을 계산하고 완전한 참조 자료와 `aiwf-` 이름을 준비한다. 실제 설치는 버전을 고정한 공식 skills CLI가 호스트·스킬·`--copy`를 지정해 수행한다. skills CLI를 따로 전역 설치하거나 실행 때 `npx`로 내려받을 필요가 없다. Codex의 프로젝트·사용자 스킬은 `.agents/skills`, Claude 프로젝트 스킬은 `.claude/skills`로 배치하며 Claude 사용자 범위는 `CLAUDE_CONFIG_DIR`를 따른다. [설치 설계와 검증](docs/modernization/CLI-INSTALLATION-REVIEW.ko.md)을 참고한다.

같은 버전의 AIWF 관리 스킬은 건너뛰므로 스택·위임·다른 호스트를 나중에 추가할 수 있다. 로컬 수정이나 다른 도구가 설치한 기존 스킬은 충돌로 표시하고 보존한다. `.aiwf/skills-installation.json`에 버전과 해시를 기록하고, 공식 `skills-lock.json`이 삭제된 임시 경로를 가리키지 않도록 `.aiwf/skill-sources/`에 설치 소스를 유지한다. 이 자료는 설치와 함께 보존한다. `aiwf status`는 기록된 설치를 확인하며 다른 도구의 설치를 자동으로 관리 대상으로 삼지 않는다. 스킬 갱신·제거와 저장 프로필은 후속 범위다. CLI 자체 갱신은 `npm i -g aiwf@latest`를 사용하며 설치된 스킬을 자동 갱신하지 않는다.

명세 초기화·pin·변경 확인·packet은 `aiwf spec --help`로 사용하며 기존 `aiwf-spec`도 유지한다. portable 스킬과 네이티브 플러그인은 설치 방식이 다르다. 아래 Claude marketplace와 직접 skills.sh 설치 경로도 계속 지원한다.

## 현재 checkout에서 실행하기

실제 대상 프로젝트 폴더는 먼저 존재해야 한다. 개발 중에는 checkout CLI를 실행할 수 있다.

```bash
npm ci
node src/cli/aiwf-cli.js install --agent codex --stack electron-react --project /path/to/project --dry-run
node src/cli/aiwf-cli.js install --agent codex --stack electron-react --project /path/to/project
```

이전 checkout 전용 복사 스크립트도 유지하며, 이 경로는 기존 스킬이 하나라도 있으면 덮어쓰기 없이 중단한다.

```bash
# 실제 대상 프로젝트 폴더는 먼저 존재해야 한다.
node src/cli/spec-cli.js init --root /path/to/project --name "우리 서비스"

# Codex용 스킬 설치: 기존 스킬은 덮어쓰지 않는다.
node scripts/install-spec-skills.mjs --project /path/to/project --dry-run
node scripts/install-spec-skills.mjs --project /path/to/project --stack nestjs-nextjs --dry-run
node scripts/install-spec-skills.mjs --project /path/to/project --stack nestjs-nextjs
node scripts/install-spec-skills.mjs --project /path/to/project --delegate codex --dry-run
```

Codex는 기본적으로 `aiwf-core` 스킬 8개와 `aiwf-spec`의 `workflow`, `sync-docs`를 `aiwf-requirements`, `aiwf-use-case-spec`, ..., `aiwf-docpilot`, `aiwf-workflow`, `aiwf-sync-docs`로 함께 설치하며 참조 문서·검사기·출처도 포함한다. `--stack`은 `vaadin-jooq`, `angular-jpa`, `blazor-dotnet`, `nestjs-nextjs`, `electron-react` 중 하나를 골라 해당 stack을 추가한다. 기존 스킬은 덮어쓰지 않고 강제 플래그도 없다. 실제 호스트의 스킬 자동 선택과 모델 실행은 별도 파일럿에서 검증할 예정이다.

개발 후에는 Codex의 `aiwf-sync-docs` 또는 Claude Code의 `/aiwf-spec:sync-docs`에 변경 의도, 비교 범위와 UC ID를 전달한다. workflow는 완료 전에 이 절차로 관련 문서를 갱신하고 구현 누락·미검증 동작을 보존한다. [단독 skills CLI 설치와 사용 안내](docs/ko-skills/aiwf-spec/README.ko.md#개발-후-문서-동기화), [한글 검토본](docs/ko-skills/aiwf-spec/skills/sync-docs/SKILL.ko.md)을 참고한다. 새 `aiwf-spec` CLI 명령을 추가한 것은 아니다.

Claude/Codex 위임 스킬은 기본 설치에서 빠져 있다. `--delegate claude` 또는 `--delegate codex`로 하나를 고르며, 두 옵션을 함께 주면 둘 다 설치한다. Claude Code marketplace에서도 각 애드온을 따로 설치할 수 있다. 아래 GitHub 기반 skills.sh 명령은 이 변경을 저장소에 게시한 뒤 사용할 수 있다. 대상 스킬과 호스트를 함께 지정한다.

```bash
npx skills add https://github.com/moonklabs/aiwf --skill delegate-claude --agent codex
npx skills add https://github.com/moonklabs/aiwf --skill delegate-codex --agent codex
npx skills add https://github.com/moonklabs/aiwf --skill delegate-claude --agent claude-code
npx skills add https://github.com/moonklabs/aiwf --skill delegate-codex --agent claude-code
```

위임은 스킬을 직접 호출해야 시작한다. 현재 호스트와 대상이 같으면 네이티브 위임을 사용한다. 다른 CLI를 시작하려면 현재 요청에 `--cross-cli` 토큰이 있어야 한다. 대상 지명만으로는 별도 프로세스 실행 동의가 되지 않는다. 교차 CLI는 기본 읽기 전용이며, 쓰기는 같은 요청에 변경 지시와 정확한 범위가 있을 때만 허용한다. 별도 CLI는 같은 OS 계정·작업 디렉터리·환경으로 실행되고 자체 권한 정책을 따르며 현재 호스트의 샌드박스나 승인을 상속하지 않는다. 자세한 내용은 [위임 명세](docs/modernization/DELEGATION-OPTIONAL.ko.md)를 참고한다.

## 플러그인 구성

AIWF는 총 47개 스킬을 제공한다. `aiwf-core`의 방법론·오케스트레이션 스킬 8개, 기술 스택 5종의 구현·테스트 스킬 30개, `aiwf-spec`의 `workflow`·`sync-docs`, `aiwf-design`의 design-spec 스킬 5개, 선택 위임 스킬 2개로 구성된다.

| 플러그인 | 역할 | 내용 |
|---|---|---|
| `aiwf-core` | 방법론 core (필수) | 방법론·오케스트레이션 스킬 8개 (upstream 2.19.0 + AIWF 보충 스킬) |
| `aiwf-spec` | AIWF 래퍼 (선택) | AIWF `workflow`와 `sync-docs` |
| `aiwf-design` | design-spec 애드온 (선택, `aiwf-core` 필요) | `workflow`, `figma-sync`, `apply`, `trace`, `review` (0.1.0) |
| `aiwf-delegate-claude` | 선택 위임 애드온 | `delegate-claude` |
| `aiwf-delegate-codex` | 선택 위임 애드온 | `delegate-codex` |
| `aiwf-vaadin-jooq` | stack | 스킬 8개 (2.20.0) |
| `aiwf-angular-jpa` | stack | 스킬 6개 (0.7.0) |
| `aiwf-blazor-dotnet` | stack | 스킬 5개 (0.7.0) |
| `aiwf-nestjs-nextjs` | stack | 스킬 5개 (0.4.0) |
| `aiwf-electron-react` | 에이전트 데스크톱 stack | 스킬 6개 (0.1.0) |

Electron 에이전트 데스크톱 앱은 [Electron/React 안내 원문](plugins/aiwf-electron-react/README.md)과 [한글 검토본](docs/ko-skills/aiwf-electron-react/README.ko.md)을 참고한다. core 명세를 바탕으로 프로젝트 생성, 구현, 런타임 어댑터, UI/Electron 테스트와 패키징을 진행한다. 실제 에이전트는 선택한 Sally·PI·기타 어댑터가 실행하고 AI Elements는 UI를 담당한다. `--stack electron-react`를 선택하면 core·spec을 포함한 16개 스킬을 설치한다. 이 스택은 `aiwf@0.6.0`에 포함된다.

설치는 완전한 스킬 폴더의 파일 복사이며 네이티브 Codex 서브에이전트를 등록하지 않고 MCP도 자동 구성하지 않는다. `agents/uc-coverage.md` 같은 에이전트 프롬프트는 리소스로만 복사되고, 호스트 매핑은 `workflow` 스킬이 설명한다. 이름·개수·유지보수 절차는 [SKILLS.ko.md](docs/modernization/SKILLS.ko.md)에 정리했다.

디자이너가 운영하는 디자인 작업 공간은 [design-spec 안내 원문](plugins/aiwf-design/README.md)과 [한글 검토본](docs/ko-skills/aiwf-design/README.ko.md)을 참고한다. 세션마다 역할(디자이너 작업·동기화·적용·추적·검토)을 하나로 정하고, 디자이너 작업 밖에서는 Figma를 읽기 전용으로 둔다. Figma 토큰을 DTCG 토큰과 대조하고, 기획 변경을 대응표에 추적하며, 작업 공간을 lint로 검사한다. 경로·Figma 파일 키·검사·게이트는 `docs/design-spec/design-spec.config.json`에서 읽는다. `aiwf install --design` 또는 checkout 설치기의 `--design`은 다섯 스킬을 `aiwf-design-<name>`으로 추가한다. [examples/design-spec](examples/design-spec/README.md)은 lint와 토큰 대조를 통과하는 최소 프로젝트다.

Claude Code에서는 이 저장소를 marketplace로 등록하고 필요한 플러그인(`aiwf-core`, `aiwf-spec`, `aiwf-<stack>`, `aiwf-design`)을 설치한 뒤 `/aiwf-core:use-case-spec`, `/aiwf-spec:workflow`, `/aiwf-nestjs-nextjs:implement`, `/aiwf-design:workflow`처럼 플러그인 이름으로 한정해 호출한다.

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
6. `sync-docs`로 영향받는 UC·규칙·테스트 정의·모델·사용 안내를 정리하고 불일치를 보고한다. 문서 검토와 명세 변경 확인 후 실행 로그와 미검증 사항을 packet으로 남긴다.

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
npm run test:design
```

예전 설치기·언어/스프린트/페르소나/YOLO 명령·중복 스킬·레거시 플러그인과 문서는 제거했다. 새 npm 패키지는 공식 skills CLI를 사용하는 `aiwf`와 기존 `aiwf-spec`를 제공하며 `npm test`는 현재 회귀 검사를 실행한다. 예전 프레임워크와의 호환성은 종료했다. 명세 CLI 자체는 Node 기본 모듈만 사용한다.

## 라이선스

AIWF 코드는 [MIT](LICENSE)를 따른다. 플러그인 파일에는 해당 [Apache-2.0](plugins/aiwf-core/LICENSE) 또는 [MIT](plugins/aiwf-electron-react/LICENSE) 라이선스와 [NOTICE](plugins/aiwf-core/NOTICE)를 유지하며, 적용 범위는 각 플러그인의 법적 문서를 확인한다.
