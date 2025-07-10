# AIWF (AI Workflow Framework)

[Read in Korean (한국어로 보기)](README.ko.md)

[![NPM Version](https://img.shields.io/npm/v/aiwf.svg)](https://www.npmjs.com/package/aiwf)
[![License](https://img.shields.io/npm/l/aiwf.svg)](https://github.com/aiwf/aiwf/blob/main/LICENSE)
[![Downloads](https://img.shields.io/npm/dm/aiwf.svg)](https://www.npmjs.com/package/aiwf)

## AIWF란?

AIWF는 Claude Code와 함께 AI 기반 개발을 위해 특별히 설계된 마크다운 기반 프로젝트 관리 프레임워크입니다. 소프트웨어 프로젝트를 AI가 효과적으로 처리할 수 있는 관리 가능한 단위로 분해하여 생산성을 극대화합니다.
이 프로젝트는 [Simone](https://github.com/Helmi/claude-simone)의 업데이트된 버전입니다.

## 📦 설치

프로젝트 디렉토리에서 AIWF 설치:

```bash
npx aiwf
```

설치 프로그램의 동작:

1. **언어 선택**: 한국어와 영어 중 선택
2. **디렉토리 구성**: 프로젝트 관리를 위한 `.aiwf/` 디렉토리 구조 생성
3. **명령어 설치**: 선택한 언어의 `.claude/commands/aiwf/` Claude 명령어 설정
4. **콘텐츠 다운로드**: 선택한 언어의 최신 템플릿과 문서 다운로드

## 🚀 사용법

### 첫 설치

```bash
npx aiwf
```

### 기존 설치 업데이트

AIWF가 이미 설치되어 있다면 설치 프로그램이 자동으로 감지하고 다음 옵션을 제공합니다:

- 업데이트 (자동 백업 포함)
- 설치 건너뛰기
- 취소

### 강제 설치

모든 프롬프트를 건너뛰고 강제 설치 (기본값: 한국어):

```bash
npx aiwf --force
```

### 언어별 설치

설치 프로그램은 선택한 언어에 따라 적절한 언어 버전을 자동으로 선택합니다:

- 한국어 버전: 한국어 명령어와 문서 포함 (기본값)
- English version: English commands and documentation

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

## 📚 문서 참조

전체 AIWF 명령어 목록과 자세한 사용법은 [COMMANDS_GUIDE.md](docs/COMMANDS_GUIDE.md)를 참조하세요.

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
- 📈 **페르소나 평가 시스템** - AI 응답 품질 평가 및 개선
- 🚀 **Feature Ledger** - 개발 진행 상황 추적을 위한 기능 ID 시스템
- 🔍 **AI 도구 템플릿** - GitHub Copilot, Cursor, Windsurf, Augment 지원

## 🔧 요구사항

- Node.js 14.0.0 이상
- GitHub에서 다운로드하기 위한 인터넷 연결

## 📖 소스

이 설치 프로그램은 다음에서 AIWF 프레임워크를 가져옵니다:
https://github.com/aiwf/aiwf

## 📝 라이선스

MIT
