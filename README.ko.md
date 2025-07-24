# AIWF (AI Workflow Framework)

[Read in English](README.md)

[![NPM Version](https://img.shields.io/npm/v/aiwf.svg)](https://www.npmjs.com/package/aiwf)
[![License](https://img.shields.io/npm/l/aiwf.svg)](https://github.com/moonklabs/aiwf/blob/main/LICENSE)
[![Downloads](https://img.shields.io/npm/dm/aiwf.svg)](https://www.npmjs.com/package/aiwf)

## AIWF란?

AIWF는 Claude Code와 함께 AI 기반 개발을 위해 특별히 설계된 마크다운 기반 프로젝트 관리 프레임워크입니다. 소프트웨어 프로젝트를 AI가 효과적으로 처리할 수 있는 관리 가능한 단위로 분해하여 생산성을 극대화합니다.
이 프로젝트는 [Simone](https://github.com/Helmi/claude-simone)의 업데이트된 버전입니다.

## 📦 설치

### 전역 설치 (권장)

```bash
npm install -g aiwf
```

### 최초 설정

전역 설치 후, 프로젝트 디렉토리에서 실행:

```bash
aiwf install
```

설치 과정에서 안내하는 내용:

1. **언어 선택**: 한국어와 영어 중 선택
2. **프로젝트 설정**: 현재 디렉토리에 AIWF 초기화
3. **Claude 명령어**: 언어별 명령어 설치
4. **문서화**: 가이드 및 템플릿 다운로드

## 🚀 사용법

### 기본 명령어

```bash
# 현재 프로젝트에 AIWF 설치
aiwf install

# 강제 설치 (프롬프트 건너뛰기)
aiwf install --force

# 도움말 표시
aiwf --help

# 버전 확인
aiwf --version
```

### 언어 관리

```bash
# 현재 언어 확인
aiwf-lang status

# 언어 변경
aiwf-lang set ko    # 한국어
aiwf-lang set en    # 영어

# 자동 감지로 리셋
aiwf-lang reset
```

### 기존 설치 업데이트

기존 AIWF가 있는 프로젝트에서 `aiwf install` 실행 시:
- 자동 백업 생성
- 업데이트 또는 건너뛰기 옵션
- 설정 보존

## 📁 설치 내용

### 디렉토리 구조

```
your_project/
├── .aiwf/                        # 프로젝트 관리 루트
│   ├── 00_PROJECT_MANIFEST.md    # 중앙 추적 문서
│   ├── 01_PROJECT_DOCS/          # 프로젝트 문서
│   ├── 02_REQUIREMENTS/          # 마일스톤 요구사항
│   ├── 03_SPRINTS/              # 스프린트 실행 추적
│   ├── 04_GENERAL_TASKS/        # 독립 작업
│   ├── 05_ARCHITECTURE_DECISIONS/ # ADR 문서
│   ├── 10_STATE_OF_PROJECT/     # 프로젝트 상태 스냅샷
│   ├── 98_PROMPTS/              # 유용한 AI 프롬프트
│   └── 99_TEMPLATES/            # 문서 템플릿
├── .claude/commands/aiwf/       # 언어별 Claude 명령어
├── .cursor/rules/               # Cursor IDE 개발 규칙
└── .windsurf/rules/             # Windsurf IDE 개발 규칙
```

### 언어별 콘텐츠

선택한 언어에 따라 다음이 설치됩니다:

**한국어 버전 (`ko/`)** (기본값):

- 한국어 Claude 명령어 (`_kr` 접미사 포함)
- 한국어 문서 및 템플릿
- 현지화된 프로젝트 관리 콘텐츠

**English Version (`en/`)**:

- English Claude commands
- English documentation and templates
- Standard project management content

## 🎯 시작하기

설치 후 다음 단계:

1. Claude Code에서 프로젝트를 엽니다
2. `/project:aiwf` 명령어를 사용하여 프로젝트를 관리합니다
3. `/project:aiwf:initialize` 명령어로 프로젝트 설정을 시작합니다

### 주요 명령어

- **초기화**: `/project:aiwf:initialize` - 프로젝트 초기 설정
- **계획**: `/project:aiwf:plan_milestone` - 마일스톤 계획 수립
- **스프린트**: `/project:aiwf:create_sprints_from_milestone` - 스프린트 생성
- **작업**: `/project:aiwf:do_task` - 작업 실행
- **리뷰**: `/project:aiwf:code_review` - 코드 리뷰
- **GitHub 연동**: `/project:aiwf:issue_create`, `/project:aiwf:pr_create`

## 📚 문서

### 핵심 문서
- [명령어 가이드](docs/COMMANDS_GUIDE.ko.md) - 전체 AIWF 명령어 목록
- [CLI 사용 가이드](docs/CLI_USAGE_GUIDE.ko.md) - 상세한 CLI 도구 문서
- [시작하기](docs/GETTING_STARTED.md) - 새 사용자를 위한 빠른 시작 가이드
- [개발 가이드](docs/DEVELOPMENT_GUIDE.ko.md) - AIWF에 기여하기

### 기능 가이드
- [독립 스프린트 가이드](docs/guides/independent-sprint-guide-ko.md) - YOLO 중심 스프린트 생성
- [체크포인트 시스템 가이드](docs/guides/checkpoint-system-guide-ko.md) - 복구 및 진행 상황 추적
- [AI 페르소나 가이드](docs/guides/ai-personas-guide-ko.md) - 전문 AI 페르소나 사용
- [컨텍스트 압축 가이드](docs/guides/context-compression-guide-ko.md) - 토큰 최적화 전략
- [기능 Git 통합 가이드](docs/guides/feature-git-integration-guide-ko.md) - Git hooks 및 추적

### 기술 문서
- [상태 관리 가이드](docs/STATE_MANAGEMENT_GUIDE.ko.md) - 워크플로우 기반 상태 시스템
- [AI 워크플로우](docs/AI-WORKFLOW.ko.md) - AI 통합 패턴
- [API 참조](docs/API_REFERENCE.md) - 프로그래머틱 사용
- [문제 해결](docs/TROUBLESHOOTING.md) - 일반적인 문제 및 해결책

## ✨ 주요 기능

- 🌍 **다국어 지원** - 한국어와 영어 완전 지원
- 🎨 **아름다운 CLI** - 컬러와 진행 표시기가 있는 사용자 친화적 인터페이스
- 🔄 **스마트 업데이트** - 자동 백업과 함께 지능형 업데이트 감지
- 📦 **직접 다운로드** - 공식 GitHub 저장소에서 직접 다운로드
- 🚀 **간편한 사용** - `npx` 사용으로 전역 설치 불필요
- 💾 **안전한 백업** - 업데이트 시 타임스탬프 백업 생성
- 🎯 **언어별 맞춤** - 언어별 명령어와 문서
- 🔧 **IDE 통합** - Cursor와 Windsurf 개발 규칙 지원
- 🔗 **GitHub 연동** - 이슈 및 PR 생성 자동화
- 📊 **프로젝트 추적** - 마일스톤, 스프린트, 작업 체계적 관리
- 🎭 **AI 페르소나** - 5가지 전문 페르소나 (Architect, Security, Frontend, Backend, Data Analyst)
- 🧠 **페르소나 인식 압축** - 활성 페르소나에 최적화된 지능형 컨텍스트 압축
- 📈 **경량 평가 시스템** - 최소한의 부담으로 자동 백그라운드 품질 모니터링
- 🚀 **Feature Ledger** - 개발 진행 상황 추적을 위한 기능 ID 시스템
- 🔍 **AI 도구 템플릿** - GitHub Copilot, Cursor, Windsurf, Augment 지원
- 🪝 **Git Hooks 통합** - git 커밋과 함께 자동 기능 추적
- 🤖 **워크플로우 기반 상태 관리** - 지능적 작업 우선순위 지정 및 의존성 추적
- 🎯 **스마트 작업 추천** - 프로젝트 상태 기반 AI 구동 다음 행동 제안
- 🔄 **적응적 스프린트 관리** - 80% 완료 시 자동 스프린트 생성
- 🔍 **의존성 분석** - 순환 의존성 감지 및 차단 작업 식별

## 🤖 워크플로우 기반 상태 관리 (신규!)

AIWF는 이제 AI가 프로젝트 컨텍스트를 유지하는 데 도움이 되는 고급 상태 관리 시스템을 포함합니다:

### 상태 관리 명령어

```bash
# 프로젝트 상태 인덱스 업데이트
aiwf state update

# 현재 상태 및 추천사항 표시
aiwf state show

# AI 기반 다음 작업 추천 받기
aiwf state next

# 워크플로우 일관성 검증
aiwf state validate

# 작업 시작으로 표시
aiwf state start <task-id>

# 작업 완료로 표시  
aiwf state complete <task-id>
```

### 주요 특징

- **우선순위 매트릭스**: 긴급도(40%), 중요도(30%), 의존성(20%), 노력(10%) 기반 작업 점수화
- **의존성 추적**: 차단 작업 및 순환 의존성 자동 식별
- **80% 규칙**: 현재 스프린트가 80% 완료 시 다음 스프린트 준비 권장
- **워크플로우 검증**: 마일스톤, 스프린트, 작업 전반의 상태 일관성 보장
- **스마트 추천**: 프로젝트 상태 기반 최적 다음 행동 AI 제안

### YOLO 모드와의 통합

향상된 YOLO 모드는 이제 워크플로우 인텔리전스를 사용합니다:

```bash
# 워크플로우 기반 작업 선택으로 YOLO 실행
/project:aiwf:yolo

# 워크플로우 최적화를 통한 스프린트별 실행
/project:aiwf:yolo S03

# 적응적 스프린트 관리
/project:aiwf:yolo sprint-all
```

## 📁 프로젝트 구조

```
aiwf/
├── ai-tools/           # AI 도구별 구성
├── commands/           # AIWF 명령어 구현
├── config/             # 설정 파일
├── docs/               # 프로젝트 문서
├── feature-ledger/     # 기능 추적 JSON 파일
├── hooks/              # 자동화된 워크플로우를 위한 Git hooks
├── lib/                # 핵심 라이브러리 모듈
├── personas/           # AI 페르소나 정의
├── rules/              # 개발 규칙 및 가이드라인
├── scripts/            # 빌드 및 유틸리티 스크립트
├── templates/          # 프로젝트 템플릿 (api-server, npm-library, web-app)
├── tests/              # 테스트 스위트
└── utils/              # 유틸리티 모듈
```

### 주요 디렉토리

- **feature-ledger/**: 기능 개발 상태 및 git 커밋 관계 추적
- **hooks/**: 자동 기능 추적을 위한 git hooks (post-commit) 포함

## 🔧 요구사항

- Node.js 14.0.0 이상
- GitHub에서 다운로드하기 위한 인터넷 연결

## 📖 소스

이 설치 프로그램은 다음에서 AIWF 프레임워크를 가져옵니다:
https://github.com/moonklabs/aiwf

## 📝 라이선스

MIT
