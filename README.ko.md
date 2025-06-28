# hello-moonklabs

이 프로젝트는 [Simone](https://github.com/Helmi/claude-simone)의 업데이트된 버전입니다.

> 🚀 Claude Code용 Moonklabs 프로젝트 관리 프레임워크를 위한 빠른 설치 프로그램

## Moonklabs Framework란 무엇인가요?

Moonklabs는 Claude Code를 사용한 AI 지원 개발을 위해 특별히 설계된 마크다운 기반 프로젝트 관리 프레임워크입니다. 소프트웨어 프로젝트를 관리 가능한 덩어리로 나누어 효과적인 AI 처리를 돕습니다.

## 설치

모든 프로젝트 디렉토리에 Moonklabs를 설치하세요:

```bash
npx hello-moonklabs
```

이것으로 끝입니다! 설치 프로그램은 다음을 수행합니다:

- 프로젝트 관리를 위한 `.moonklabs/` 디렉토리 구조 생성
- 사용자 지정 Claude 명령어를 위한 `.claude/commands/moonklabs/` 설정
- 최신 템플릿 및 문서 다운로드

## 사용법

### 첫 설치

```bash
npx @moonklabs/aiwf
```

### 기존 설치 업데이트

Moonklabs가 이미 설치된 경우, 설치 프로그램이 이를 감지하고 다음 옵션을 제공합니다:

- 업데이트 (자동 백업 포함)
- 설치 건너뛰기
- 취소

### 강제 설치

모든 프롬프트를 건너뛰고 강제로 설치합니다:

```bash
npx @moonklabs/aiwf --force
```

## 설치되는 항목

```
aiwf/
├── AI-WORKFLOW.md
├── CHANGELOG.md
├── claude-code/
│   ├── docker/
│   │   └── Dockerfile
│   ├── moonklabs/
│   └── simone/
│       ├── CHANGELOG.md
│       ├── LICENSE
│       ├── README.md
│       ├── SYNC_GUIDE.md
│       └── sync-simone.sh
├── COMMANDS_GUIDE.md
├── LICENSE
├── package-lock.json
├── package.json
├── PRD.ko.md
├── PRD.md
├── README.ko.md
├── README.md
└── rules/
    ├── global/
    │   ├── code-style-guide.md
    │   ├── coding-principles.md
    │   ├── development-process.md
    │   └── global-rules.md
    └── manual/
        └── generate-plan-docs.md
```

## 다음 단계

설치 후:

1.  Claude Code에서 프로젝트를 엽니다
2.  `/project:moonklabs` 명령어를 사용하여 프로젝트를 관리합니다
3.  `/project:moonklabs:initialize`로 시작하여 프로젝트를 설정합니다

## 특징

- 🎨 색상과 진행 표시기가 있는 아름다운 CLI
- 🔄 자동 백업 기능이 있는 스마트 업데이트 감지
- 📦 공식 GitHub 리포지토리에서 직접 다운로드
- 🚀 `npx`로 작동 - 전역 설치 필요 없음
- 💾 업데이트 시 타임스탬프가 찍힌 백업 생성

## 요구사항

- Node.js 14.0.0 이상
- GitHub에서 다운로드하기 위한 인터넷 연결

## 소스

이 설치 프로그램은 다음에서 Moonklabs 프레임워크를 가져옵니다:
https://github.com/moonklabs/aiwf

## 라이선스

MIT
