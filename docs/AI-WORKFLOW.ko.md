# Claude Code를 위한 AIWF

## 이것은 무엇인가요?

AIWF은 Claude Code, Gemini-CLI 와 더 효과적으로 작업하기 위해 만든 디렉토리 기반 프로젝트 관리 시스템입니다. 기본적으로 폴더, 마크다운 파일 및 AI가 효과적으로 처리할 수 있는 관리 가능한 단위로 소프트웨어 프로젝트를 분할하는 데 도움이 되는 사용자 정의 명령의 집합입니다.

**🚀 NEW**: 강화된 YOLO 모드로 전체 스프린트나 마일스톤을 한 번에 자동 완료할 수 있습니다!

**⚠️ 복잡성 경고**: AIWF은 제대로 이해하는 데 시간이 필요한 정교한 시스템입니다. 단순한 플러그 앤 플레이 솔루션이 아니라, 작동 방식을 배우고 워크플로에 적응하는 데 시간을 투자할 때 가장 잘 작동하는 프레임워크입니다.

**📋 최신 업데이트**: 최근 변경 사항 및 개선 사항은 [CHANGELOG.md](CHANGELOG.md)를 참조하세요.

## 시작하는 방법

### 1. AIWF 설치하기

```bash
npx aiwf
```

**다국어 지원**: AIWF는 지능형 감지 및 선호도 저장 기능을 갖춘 포괄적인 언어 관리 시스템을 제공합니다. 설치 시 영어와 한국어 중 선택할 수 있으며, 나중에 내장된 언어 관리 명령어를 사용하여 언어를 전환할 수 있습니다.

이것은 폴더 구조를 설정하고 프로젝트에 명령 파일을 설치/업데이트합니다. 기존 설치를 업데이트하는 데도 사용할 수 있으며, 명령 파일은 자동으로 백업됩니다.

**설치 옵션**:

- 대화형 설치: 언어 선택 후 설치
- 강제 설치: `npx aiwf --force` (자동 감지된 언어 사용)
- 언어 관리: 설치 후 언어 전환을 위한 `aiwf-lang` 명령어 사용

### 2. 프로젝트 초기화하기

Claude Code에서 프로젝트를 열고 다음을 실행하세요:

```
/project:aiwf:initialize
```

이것은 기본 설정 과정을 안내합니다. 새로운 코드베이스나 기존 코드베이스와 함께 작동하며, 프로젝트 문서(PRD, 아키텍처 문서)를 생성하거나 이미 가지고 있는 문서와 함께 작업하는 데 도움을 줍니다.

### 3. 첫 번째 마일스톤 설정하기

`.aiwf/02_REQUIREMENTS/`에 `M01_Your_Milestone_Name`(예: `M01_Basic_Application`)이라는 이름의 마일스톤 폴더를 생성하세요. 최소한 다음을 포함하세요:

- `M01_PRD.md` - 제품 요구사항 문서
- 필요에 따른 기타 사양: `M01_Database_Schema.md`, `M01_API_Specs.md` 등

_참고: 아직 이를 위한 명령어는 없습니다. 2단계의 기존 채팅을 사용하여 Claude가 마일스톤을 생성하도록 안내하고, `M##_` 접두사와 밑줄을 사용한 적절한 이름 지정을 확인하세요.\_

### 4. 스프린트로 분할하기

```
/project:aiwf:create_sprints_from_milestone
```

이것은 마일스톤을 분석하고 논리적인 스프린트로 분할합니다. 전체 범위를 살펴보고 아직 세부 작업 없이 의미 있는 스프린트 경계를 생성합니다.

### 5. 첫 번째 작업 생성하기

```
/project:aiwf:create_sprint_tasks
```

이것은 스프린트를 분석하고, 문서를 검토하며, 필요한 정보를 조사하고, 프로젝트에 대한 포괄적인 이해를 얻기 위한 지식 격차를 식별합니다. 현재 스프린트에 대한 상세하고 실행 가능한 작업을 생성합니다.

_중요: 모든 스프린트에 대한 작업을 미리 생성하지 말고 다음 스프린트에 대한 작업만 생성하세요. 스프린트 1을 완료한 후에 스프린트 2에 대한 작업을 생성하세요. 이렇게 하면 시스템이 기존 코드베이스를 참조하고 완료된 작업을 향후 작업 생성에 통합할 수 있습니다._

### 6. 작업 시작하기

```
/project:aiwf:do_task
```

이것은 일반 작업이나 스프린트에서 작업을 자동으로 선택합니다. 더 빠른 실행을 위해 작업 ID를 지정하세요:

```
/project:aiwf:do_task T01_S01
```

그러면 Claude는 전체 프로젝트 컨텍스트와 함께 지정된 작업을 수행합니다.

이것이 시작하기 위한 기본 워크플로입니다! 또한 다음과 같은 작업도 가능합니다:

- `/project:aiwf:create_general_task`로 일반 작업 생성
- YOLO 모드를 사용하여 전체 스프린트 또는 마일스톤을 자율적으로 실행
- `.claude/commands/aiwf/`에서 다른 명령어 탐색

### 7. YOLO 모드 - 자율 실행

YOLO 모드는 사용자 개입 없이 연속적으로 작업을 실행하는 강력한 기능입니다:

**기본 YOLO 모드:**

```
/project:aiwf:yolo
```

일반 작업을 먼저 처리한 후 활성 스프린트 작업을 실행합니다.

**스프린트별 실행:**

```
/project:aiwf:yolo S03
```

지정된 스프린트(S03)의 모든 작업을 완료할 때까지 실행합니다.

**🚀 NEW: 전체 스프린트 실행:**

```
/project:aiwf:yolo sprint-all
```

모든 스프린트를 순차적으로 완료할 때까지 멈추지 않고 실행합니다.

**🚀 NEW: 전체 마일스톤 실행:**

```
/project:aiwf:yolo milestone-all
```

모든 마일스톤과 관련된 스프린트, 작업을 완료할 때까지 실행합니다.

**🔧 Worktree 모드:**

```
/project:aiwf:yolo S03 worktree
/project:aiwf:yolo sprint-all worktree
```

Git worktree 환경에서 실행 시 브랜치 생성 없이 직접 푸시합니다.

**YOLO 모드 특징:**

- ⚡ 연속 실행: 각 작업 완료 후 즉시 다음 작업으로 이동
- 🎯 완전 자율: 사용자 입력이나 확인 없이 진행
- 📊 진행률 추적: 현재 진행 상황을 실시간으로 보고
- 🛡️ 안전 장치: 테스트 실패나 치명적 오류 시 중단
- 📈 상세 리포트: 완료 시 전체 프로젝트 상태 리포트 제공

**⚠️ 주의사항:**

- 중요한 파일(.env, 마이그레이션) 수정 시 중단됩니다
- 테스트가 10% 이상 실패하면 평가 후 진행 여부를 결정합니다
- 데이터베이스 스키마 변경이 필요하면 중단됩니다

**중요**: AIWF은 단순한 설정 후 잊어버리는 도구가 아닌 복잡한 시스템입니다. 작동 방식을 이해할 때 가장 효과적으로 작동합니다. 명령어를 읽어보고 워크플로에 맞게 조정하는 시간을 가지세요.

## 작동 방식

AIWF은 프로젝트를 다음과 같이 구성합니다:

- **마일스톤**: 주요 기능 또는 프로젝트 단계
- **스프린트**: 마일스톤 내의 관련 작업 그룹
- **작업**: 하나의 Claude 세션에 맞게 범위가 지정된 개별 작업 항목

각 작업은 전체 프로젝트 컨텍스트를 가져와 Claude가 무엇을 구축해야 하는지, 그리고 아키텍처에 어떻게 맞는지 정확히 알 수 있습니다.

## 이것을 만든 이유

AI 코딩 도구는 믿을 수 없을 정도로 강력해졌지만, 모두 동일한 근본적인 과제에 직면해 있습니다: 컨텍스트 관리. 컨텍스트 창의 크기는 제한되어 있으며, 무엇이 컨텍스트에 남아있고 무엇이 그렇지 않은지에 대한 제어가 거의 없습니다.

장시간 실행 세션의 문제점은 컨텍스트 감소입니다 - 작업을 진행하면서 중요한 프로젝트 지식이 컨텍스트 창의 끝에서 조용히 사라집니다. 무언가 잘못될 때까지 무엇이 잊혀졌는지 알 수 없습니다.

저의 해결책: 각 작업마다 새로 시작하지만 풍부한 주변 컨텍스트를 제공합니다. 작업을 집중적이고 잘 정의된 범위로 유지함으로써, 컨텍스트 창의 더 많은 부분을 관련 프로젝트 지식, 요구사항 및 아키텍처 결정에 할당할 수 있습니다. 이러한 방식으로:

- 각 작업은 필요한 프로젝트 컨텍스트만을 정확히 가지고 시작합니다
- 장시간 세션에서도 중요한 지식이 손실되지 않습니다
- Claude는 요구사항을 완전히 이해한 상태에서 자신 있게 작업할 수 있습니다
- 주변 컨텍스트가 단순한 작업 설명을 넘어 개발을 안내합니다

그 결과 Claude가 항상 해당 작업에 적합한 컨텍스트를 보유한 작업 기반 워크플로가 완성됩니다.

## Key Components

### 00_PROJECT_MANIFEST.md

프로젝트의 비전, 목표 및 상위 개요를 담고 있는 핵심 문서입니다. Claude가 프로젝트를 이해하기 위한 시작점 역할을 합니다. **중요**: 매니페스트 파일 이름은 반드시 `00_PROJECT_MANIFEST.md`이어야 하며 `MANIFEST.md`가 아닙니다.

### 01_PROJECT_DOCS/

기술 사양, 사용자 가이드, API 문서 등 Claude가 참조할 수 있는 일반 프로젝트 문서를 포함합니다.

### 02_REQUIREMENTS/

마일스톤별로 구성된 이 디렉터리는 제품 요구사항 문서(PRD)와 수정 사항을 보관하여 무엇을 구축해야 하는지 명확히 보여 줍니다. 이를 통해 Claude는 프로젝트 요구사항을 이해할 수 있습니다. 마일스톤 폴더는 `M##_Milestone_Name/`(예: `M01_Backend_Setup/`) 형식을 따라야 합니다.

### 03_SPRINTS/

마일스톤과 스프린트 순서에 따라 구성된 스프린트 계획과 작업 정의를 포함합니다. 각 스프린트 폴더에는 Claude가 작업할 수 있도록 상세 정보가 담긴 개별 작업 파일이 포함되어 있습니다.

### 04_GENERAL_TASKS/

특정 스프린트에 속하지 않는 작업 정의를 저장합니다. 완료된 작업은 `TX` 접두사를 사용합니다(예: `TX001_Completed_Task.md`)—이를 통해 Claude가 완료된 작업을 쉽게 식별할 수 있습니다.

### 05_ARCHITECTURAL_DECISIONS/

중요한 아키텍처 결정을 ADR(Architecture Decision Record) 형식으로 기록하여, 배경, 고려된 옵션 및 근거를 문서화합니다. 이는 Claude가 기술적 결정을 내릴 때 필수적인 컨텍스트를 제공합니다. 일관성을 위해 구조화된 ADR 템플릿을 사용합니다.

### 10_STATE_OF_PROJECT/

`project_review` 명령으로 생성된 타임스탬프가 있는 프로젝트 리뷰 스냅샷을 포함합니다. 이를 통해 프로젝트 상태, 기술적 결정, 진행 상황의 히스토리를 기록할 수 있습니다.

### 99_TEMPLATES/

사람과 Claude 모두의 일관성을 보장하기 위해 다양한 문서 유형에 대한 표준화된 템플릿을 포함합니다:

- 구조화된 목표와 수용 기준이 포함된 작업 템플릿
- 스프린트 및 마일스톤 메타데이터 템플릿
- 아키텍처 결정을 문서화하기 위한 ADR 템플릿
- 모든 템플릿은 단순화된 날짜 형식(YYYY-MM-DD HH:MM)을 사용합니다

### .claude/commands/aiwf/

AIWF 워크플로를 구동하는 맞춤형 Claude Code 명령어:

- `initialize` - 프로젝트 구조와 문서를 설정
- `create_sprints_from_milestone` - 마일스톤을 논리적 스프린트로 분할
- `create_sprint_tasks` - 스프린트 계획에서 상세 작업 생성
- `do_task` - 전체 컨텍스트로 개별 작업 실행
- `yolo` - 강력한 자율 실행 시스템:
  - 특정 스프린트 실행: `yolo S03`
  - 모든 스프린트 실행: `yolo sprint-all`
  - 모든 마일스톤 실행: `yolo milestone-all`
  - Worktree 지원: `yolo sprint-all worktree`
  - 연속 실행과 상세 진행률 리포트 제공
- `language_manager` - 포괄적 언어 관리 시스템:
  - 현재 언어 설정 및 상태 확인
  - 대화형 언어 전환
  - 시스템 언어 선호도 자동 감지
- 그 외 테스트, 리뷰, 프로젝트 관리용 명령어 다수

**언어 지원**: 모든 명령어는 완전한 기능적 동등성과 표준화된 품질을 갖춘 영어 및 한국어 버전으로 제공됩니다.

## 디렉토리 구조

```plaintext
.aiwf/
├── 00_PROJECT_MANIFEST.md
├── 01_PROJECT_DOCS/
├── 02_REQUIREMENTS/
│   ├── M01_Backend_Setup/
│   ├── M02_Frontend_Setup/
│   └── ...
├── 03_SPRINTS/
│   ├── S01_M01_Initial_API/
│   ├── S02_M01_Database_Schema/
│   └── ...
├── 04_GENERAL_TASKS/
│   ├── TX001_Refactor_Logging_Module.md  # Completed task
│   ├── T002_API_Rate_Limiting.md          # Open task
│   └── ...
├── 05_ARCHITECTURAL_DECISIONS/
│   ├── ADR001_Database_Selection.md
│   └── ...
├── 10_STATE_OF_PROJECT/         # Project review snapshots
└── 99_TEMPLATES/
    ├── task_template.md
    ├── sprint_meta_template.md
    └── milestone_meta_template.md
```

## 구성 팁

### 병렬 작업 실행 활성화

`create_sprint_tasks`와 같은 AIWF 명령은 `useParallelSubagents` 지시어를 지원하지만, 실제로 작업을 병렬로 실행하려면 Claude Code 설정이 필요합니다. 기본적으로는 한 번에 하나의 작업만 실행됩니다.

병렬 실행을 활성화하려면:

```bash
# Set the number of parallel tasks (example: 3)
claude config set --global "parallelTasksCount" 3

# Check your current configuration
claude config list -g
```

**중요 고려 사항:**

- 시스템 성능과 레이트 리밋을 고려하여 숫자를 선택하세요
- 병렬 실행은 API 사용량을 크게 증가시킵니다
- 일부 작업은 병렬로 실행될 때 충돌이 발생할 수 있습니다
- 작은 숫자(2-3)부터 시작하여 경험에 따라 조정하세요

## 기여 및 피드백

여러분의 의견을 듣고 싶습니다! 이는 제 워크플로에 맞춰져 있으므로 개선할 부분이 많을 것입니다.

- **GitHub Issues**: 버그 및 기능 요청을 위한 최적의 장소
- **Anthropic Discord**: 대화를 원하시면 @helmi 로 찾아주세요
- **Pull Requests**: 언제든 환영합니다! 함께 더 나은 프로젝트를 만들어봅시다

특히 다음에 관심이 있습니다:

- 다른 방식으로 사용하는 방법
- 워크플로에 부족한 점
- 더 나은 Claude Code 통합 아이디어
- 다양한 조직화 방법
