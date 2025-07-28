# AIWF - AI 워크플로우 프레임워크

_버전: 0.3.0_

## 개요

모든 프로젝트에 AIWF (AI 워크플로우 프레임워크)를 설치하기 위한 포괄적인 `npx` 실행 가능 커맨드 라인 도구입니다. AI 지원 프로젝트 관리를 위한 구조화된 디렉토리 레이아웃과 커맨드 라인 도구를 제공하며, 다국어(영어 및 한국어)를 완벽하게 지원합니다.

## 핵심 기능

### 설치 명령어

이 도구는 `npx`를 통해 실행됩니다:

```bash
npx aiwf          # 대화형 언어 선택
npx aiwf --force  # 프롬프트 건너뛰기 (기본값: 한국어)
```

### 주요 특징

1.  **다국어 지원**:
    - 대화형 언어 선택 (영어/한국어)
    - 언어별 명령어 파일 및 문서
    - 현지화된 사용자 인터페이스 및 메시지

2.  **디렉토리 구조 생성**:
    - 문서, 요구사항, 스프린트 등을 위한 표준화된 하위 디렉토리를 포함하는 `.aiwf/` 디렉토리를 초기화합니다
    - 사용자 지정 Claude 명령어를 위한 `.claude/commands/aiwf/` 디렉토리를 설정합니다
    - Cursor 및 Windsurf용 IDE별 규칙을 구성합니다

3.  **GitHub에서 파일 가져오기**:
    - GitHub의 `aiwf/aiwf` 리포지토리에서 최신 프레임워크 파일을 다운로드합니다
    - `claude-code/aiwf/ko/` 또는 `claude-code/aiwf/en/`에서 언어별 파일을 가져옵니다
    - 명령어, 문서 템플릿, 프로젝트 매니페스트를 설치합니다

4.  **기존 설치 처리**:
    - AIWF 프레임워크가 이미 존재하는지 감지합니다
    - 사용자에게 **업데이트**, **건너뛰기**, 또는 **취소**를 요청합니다
    - 업데이트 프로세스는 사용자가 생성한 파일(작업, 스프린트)을 보존하면서 명령어 스크립트와 `CLAUDE.md` 문서를 업데이트합니다
    - 덮어쓴 파일은 타임스탬프가 포함된 `.bak` 확장자로 자동 백업합니다

5.  **IDE 통합**:
    - Cursor IDE용 규칙을 자동으로 변환하고 설치합니다 (`.mdc` 형식)
    - 일반 마크다운 규칙으로 Windsurf IDE를 지원합니다
    - Claude Code와의 원활한 통합

## 기술적 접근 방식

- **Node.js 스크립트**: Node.js로 구축된 단일 실행 스크립트입니다.
- **의존성**: 커맨드 라인 인터페이스를 향상시키기 위해 외부 라이브러리를 사용합니다:
  - `commander`: 커맨드 라인 인수 구문 분석용.
  - `ora`: 로딩 스피너 표시용.
  - `prompts`: 대화형 사용자 프롬프트용.
  - `chalk`: 콘솔 출력에 색상 추가용.
- **GitHub Fetching**: GitHub API를 사용하여 디렉토리 내용을 나열하고, `raw.githubusercontent.com` 소스에서 직접 파일을 다운로드합니다.

## 설치 흐름

1.  환영 메시지가 표시됩니다
2.  언어 선택 프롬프트 (영어/한국어) - `--force` 플래그 사용 시 제외
3.  스크립트가 기존 설치를 확인합니다
4.  설치가 존재하면 사용자에게 작업(업데이트, 건너뛰기, 취소)을 선택하라는 메시지를 표시합니다
5.  진행 시, 스피너가 GitHub에서 파일을 가져오는 중임을 나타냅니다
6.  선택한 언어에 따라 필요한 디렉토리 구조가 생성됩니다
7.  언어별 디렉토리에서 프레임워크 파일(매니페스트, 템플릿, 문서, 명령어)이 다운로드됩니다
8.  IDE 규칙이 처리되고 설치됩니다 (Cursor/Windsurf)
9.  시작을 위한 다음 단계와 함께 성공 메시지가 표시됩니다
10. 단계가 실패하면 오류 메시지가 표시되고 가능한 경우 백업에서 기존 파일이 복원됩니다

## 생성되는 파일 구조

설치 프로그램은 프로젝트에 다음 구조를 생성합니다:

```
your_project/
├── .aiwf/                              # AIWF 프로젝트 관리 구조
│   ├── 00_PROJECT_MANIFEST.md          # 중앙 프로젝트 추적
│   ├── 01_PROJECT_DOCS/                # 프로젝트 문서
│   │   └── ARCHITECTURE.md             # 시스템 아키텍처 문서
│   ├── 02_REQUIREMENTS/                # 마일스톤 기반 요구사항
│   │   └── M01_*/                      # 마일스톤 폴더
│   ├── 03_SPRINTS/                     # 스프린트 실행 폴더
│   │   └── S01_*/                      # 태스크가 포함된 스프린트 폴더
│   ├── 04_GENERAL_TASKS/               # 스프린트 외 태스크
│   ├── 98_PROMPTS/                     # 유용한 프롬프트
│   └── 99_TEMPLATES/                   # 문서 템플릿
├── .claude/commands/aiwf/              # Claude Code 사용자 정의 명령어
│   ├── initialize.md                   # 프로젝트 초기화
│   ├── prime_context.md                # 컨텍스트 로딩
│   ├── aiwf_create_milestone_plan.md   # 마일스톤 계획
│   ├── create_sprints_from_milestone.md # 스프린트 생성
│   ├── do_task.md                      # 태스크 실행
│   ├── commit.md                       # Git 커밋 워크플로우
│   ├── yolo.md                         # 자율 실행
│   └── ... (20개 이상의 추가 명령어)
├── .cursor/rules/                      # Cursor IDE 통합 (감지된 경우)
│   ├── code-style-guide.mdc
│   ├── coding-principles.mdc
│   └── ... (변환된 규칙)
└── .windsurf/rules/                    # Windsurf IDE 통합 (감지된 경우)
    ├── code-style-guide.md
    ├── coding-principles.md
    └── ... (일반 마크다운 규칙)
```

## 상세 기능

### 다국어 지원
- **언어 선택**: 설치 중 대화형 프롬프트
- **지원 언어**: 영어 및 한국어
- **언어별 파일**: 선택한 언어에 따라 명령어와 문서가 설치됨
- **기본값**: `--force` 플래그 사용 시 한국어로 기본 설정

### 명령어 시스템
이 프레임워크는 AI 지원 개발을 위한 25개 이상의 전문 명령어를 포함합니다:
- **설정**: `initialize`, `prime`, `prime_context`
- **계획**: `aiwf_create_milestone_plan`, `aiwf_create_sprints_from_milestone`, `aiwf_create_sprint_tasks`
- **개발**: `do_task`, `commit`, `test`, `code_review`
- **자동화**: `yolo` (자율 태스크 실행)
- **GitHub 통합**: `issue_create`, `pr_create`
- **분석**: `ultrathink_*`, `mermaid`, `project_review`

### IDE 통합
- **Cursor IDE**: 프론트매터가 포함된 `.mdc` 형식으로 규칙 변환
- **Windsurf IDE**: 일반 마크다운 형식 사용
- **Claude Code**: 사용자 정의 명령어와의 네이티브 통합

## 현재 상태 (v0.3.0)

### 완료된 기능
- ✅ NPM 패키지 배포 (`npx aiwf`)
- ✅ 다국어 지원 (한국어/영어)
- ✅ IDE 통합 (Cursor, Windsurf)
- ✅ 25개 이상의 Claude Code 명령어
- ✅ 백업/복원 메커니즘
- ✅ GitHub API 통합

### 알려진 이슈
- `update_docs` 명령어 파일 누락 (`aiwf_docs.md`만 존재)
- GitHub 저장소 URL이 `aiwf/aiwf`로 통일됨

### 로드맵
- [ ] 오프라인 설치 옵션
- [ ] 추가 언어 지원
- [ ] VS Code 확장
- [ ] 향상된 프로젝트 템플릿
- [ ] 사용자 정의 명령어를 위한 커뮤니티 마켓플레이스
