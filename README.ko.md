# AIWF (AI Workflow Framework)

[English](README.md) · [설치 상세 안내](docs/SKILLS_INSTALLATION.md) · [MIT 라이선스](LICENSE)

AIWF는 AI 개발 작업을 프로젝트 문서, 마일스톤, 스프린트, 검증 가능한 태스크로 관리합니다. **Codex와 Claude Code**에서 같은 Agent Skills를 설치하고 각 도구의 기본 기능과 `.aiwf/` 프로젝트 파일로 작업합니다. 문서와 작업 기록은 사용자의 언어로 작성합니다.

## skills.sh로 설치

공식 [Vercel skills CLI](https://skills.sh/docs/cli)를 사용합니다. 검증한 설치 도구는 `skills@1.7.0`이며 **Node.js 22.20 이상**이 필요합니다. AIWF를 사용할 프로젝트 폴더에서 설치하세요.

### 현재 체크아웃 설치

이번 업데이트가 공개되기 전에는 수정된 로컬 저장소를 설치합니다.

```bash
cd /path/to/your-project
npx skills add /path/to/aiwf --skill aiwf --agent codex claude-code -y
```

`/path/to/aiwf`를 이 저장소의 절대 경로로 바꾸세요. 전체 스킬 7개를 설치하려면 `--skill aiwf`를 `--skill '*'`로 바꾸고, Codex에만 설치하려면 `--agent codex`를 사용합니다.

### 공개 저장소 설치

업데이트된 `skills/`가 GitHub에 반영된 뒤에는 다음 명령으로 설치할 수 있습니다.

```bash
npx skills add moonklabs/aiwf --skill aiwf --agent codex claude-code -y
```

공식 CLI는 Codex용 스킬과 자료를 프로젝트의 `.agents/skills/`에 복사하고 Claude Code의 `.claude/skills/`에도 연결합니다. 두 경로에 각각 복사하려면 `--copy`, 모든 프로젝트에서 사용할 사용자 설치는 `--global`을 추가합니다. 사용자 설치를 해도 프로젝트 상태는 각 프로젝트에 저장됩니다.

## 사용하기

설치한 프로젝트를 Codex 또는 Claude Code에서 엽니다. 스킬이 바로 보이지 않으면 해당 프로젝트에서 새 세션을 시작하세요.

Codex에서는 다음처럼 요청합니다.

```text
$aiwf 이 프로젝트를 초기화해줘.
$aiwf 인증 기능 개선을 계획하고 완료 조건과 태스크를 만들어줘.
$aiwf 다음 실행 가능한 태스크를 구현하고 검증 결과를 기록해줘.
$aiwf 현재 상태를 보여주고 진행 중인 작업을 이어서 해줘.
```

Claude Code에서는 `/aiwf`로 호출합니다.

```text
/aiwf 이 프로젝트를 초기화해줘.
/aiwf 인증 기능 개선을 계획하고 완료 조건과 태스크를 만들어줘.
/aiwf 다음 실행 가능한 태스크를 구현하고 검증 결과를 기록해줘.
```

핵심 스킬은 작업 절차, 템플릿, 선택적으로 사용할 Node.js helper를 포함합니다. 초기화는 없는 파일을 만들고 기존 프로젝트 문서와 `AGENTS.md`, `CLAUDE.md`를 보존합니다. 초기화만 요청하면 프로젝트 관리 설정까지 수행합니다.

## 제공 스킬

| 스킬 | 용도 |
| --- | --- |
| `aiwf` | 초기화, 계획, 구현, 검토, 작업 재개 |
| `aiwf-spec-driven-development` | 요구사항·계획·태스크 작성 후 구현 |
| `aiwf-backend-dev-guidelines` | 프로젝트의 실제 기술 구성에 맞춘 백엔드 개발 |
| `aiwf-frontend-dev-guidelines` | 프로젝트의 실제 기술 구성에 맞춘 프론트엔드 개발 |
| `aiwf-error-tracking` | 기존 오류 추적 도구와 로깅 활용 |
| `aiwf-route-tester` | 프로젝트 인증과 테스트 도구로 API 검증 |
| `aiwf-skill-developer` | 표준 Agent Skills 작성과 관리 |

각 스킬은 필요한 자료를 자체 포함합니다. 핵심 작업 흐름은 전용 AIWF CLI, Claude 플러그인 hook, 지정된 외부 에이전트, 다른 스킬 없이 사용할 수 있습니다.

## 프로젝트 파일

```text
.aiwf/
  00_PROJECT_MANIFEST.md       # 목표, 현재 작업, 검증 명령
  aiwf-progress.md            # 세션 진행 상황과 다음 작업
  01_PROJECT_DOCS/
  02_REQUIREMENTS/            # 마일스톤
  03_SPRINTS/                 # 스프린트와 태스크
  04_GENERAL_TASKS/           # 독립 태스크
  05_ARCHITECTURAL_DECISIONS/
  10_STATE_OF_PROJECT/
  98_PROMPTS/
  99_TEMPLATES/
```

태스크 frontmatter의 `open`, `in_progress`, `pending_review`, `done`, `blocked`, `failed`가 작업 상태의 기준입니다. 완료 조건과 필요한 검증을 충족한 작업만 `done`으로 기록하며, 기존 실패나 남은 승인도 함께 기록합니다.

## 업데이트와 기존 설치

로컬 설치는 설치 시점의 복사본입니다. 이 저장소를 수정한 뒤 대상 프로젝트에서 같은 `npx skills add /path/to/aiwf ...` 명령을 다시 실행하세요. 원격 프로젝트 설치는 `npx skills update -p -y`, 원격 사용자 설치는 `npx skills update -y`로 갱신합니다. 공식 CLI의 `update`는 로컬 설치를 건너뜁니다.

기존 `backend-dev-guidelines` 등의 스킬 디렉토리는 `aiwf-backend-dev-guidelines` 등으로 바뀌었고, frontmatter 이름의 `aiwf:`는 하이픈으로 정리했습니다. [기존 설치 이전 안내](docs/SKILLS_INSTALLATION.md#existing-installations)를 참고하세요.

기존 npm CLI와 Claude 모듈형 플러그인은 저장소에 유지합니다. 이전 경로의 문서는 [PLUGIN_README.md](PLUGIN_README.md)와 [기존 CLI 안내](docs/CLI_USAGE_GUIDE.ko.md)에 있습니다. 기존 hook 및 전체 테스트 문제는 [개선 계획](docs/AIWF_IMPROVEMENT_PLAN.ko.md)에 기록했습니다. 위 설치 안내는 새 표준 스킬을 사용합니다.

## 개발 검증

```bash
npm ci
npm run test:skills
npm run test:skills-install
npm run check:deps
```

`test:skills`는 메타데이터, 포함 자료, 설치본 helper, npm 배포 파일과 명령어 검증기 회귀를 검사합니다. `test:skills-install`은 실제 공식 `skills@1.7.0` CLI로 임시 프로젝트에 설치하고, 두 도구의 파일과 helper를 확인한 뒤 임시 폴더를 삭제합니다. 필요할 때 npx로 설치 도구를 내려받으며 저장소 의존성은 추가하지 않습니다. 이미 설치된 CLI는 `node scripts/test-skills-install.js --cli /absolute/path/to/skills/bin/cli.mjs`로 지정할 수 있습니다.

기존 전체 Jest 테스트에는 사전 실패가 남아 있으며, 새 스킬 검사 통과와 별도로 관리합니다. 현재 저장소에는 lint/typecheck 명령이 없습니다.

## 출처와 라이선스

AIWF는 [Simone](https://github.com/Helmi/claude-simone)을 바탕으로 합니다. [MIT 라이선스](LICENSE)를 따릅니다.
