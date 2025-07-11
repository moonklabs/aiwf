# AIWF (AI Workflow Framework) 아키텍처

## 프로젝트 개요

AIWF는 Claude Code와의 통합을 위해 설계된 마크다운 기반 프로젝트 관리 프레임워크입니다. AI 지원 개발을 위한 체계적인 워크플로우를 제공하며, 다국어 지원(한국어/영어)을 통해 글로벌 개발자들이 사용할 수 있도록 설계되었습니다.

## 핵심 목적

- AI가 효과적으로 처리할 수 있는 관리 가능한 단위로 소프트웨어 프로젝트를 분해
- Claude Code와의 완벽한 통합을 통한 개발 생산성 극대화
- 체계적인 프로젝트 관리 및 추적 시스템 제공
- 다국어 환경에서의 일관된 개발 경험 보장

## 핵심 아키텍처 구성요소

### 1. CLI 설치 도구 (index.js)
- **역할**: GitHub에서 AIWF 프레임워크 구성요소를 다운로드하고 설치하는 메인 진입점
- **기술 스택**: Node.js ES modules, Commander.js, Chalk, Ora, Prompts
- **핵심 기능**:
  - GitHub API 통합으로 최신 프레임워크 컨텐츠 가져오기
  - 대화형 언어 선택 (한국어/영어)
  - 자동 백업 및 업데이트 시스템
  - IDE별 규칙 변환 (Cursor, Windsurf)

### 2. AIWF 프레임워크 (claude-code/aiwf/)
- **구조**: 언어별 분리된 디렉토리 구조 (`ko/`, `en/`)
- **구성요소**:
  - `.claude/commands/`: Claude Code 커스텀 명령어
  - `.aiwf/`: 프로젝트 관리 구조 및 템플릿

### 3. 규칙 시스템 (rules/)
- **Global Rules**: 항상 적용되는 개발 가이드라인
- **Manual Rules**: 필요에 따라 적용하는 규칙들
- **IDE 통합**: Cursor와 Windsurf IDE를 위한 특화된 규칙 변환

## 기술적 아키텍처 결정사항

### 다국어 지원 전략
- **언어별 분리**: `ko/`, `en/` 폴더를 통한 완전한 언어별 컨텐츠 분리
- **설치 시점 선택**: 사용자가 설치 시 언어를 선택하여 해당 언어 버전만 설치
- **명령어 현지화**: 언어별 Claude Code 명령어 제공

### GitHub 통합 전략
- **직접 다운로드**: GitHub API를 통한 실시간 컨텐츠 페치
- **무인증 액세스**: GitHub API 속도 제한 내에서 동작
- **마스터 브랜치 기준**: 항상 최신 안정 버전 제공

### 파일 관리 전략
- **원자적 연산**: 백업/복원 기능을 통한 안전한 업데이트
- **선택적 업데이트**: 
  - CLAUDE.md 파일: 항상 업데이트
  - 명령어: 항상 업데이트
  - 템플릿: 신규 설치 시만 다운로드
  - 사용자 컨텐츠: 업데이트 중 보존

## 프로젝트 관리 워크플로우

### 명령어 구조
```
/project:aiwf:<command>
```

### 핵심 명령어 카테고리
1. **설정**: `initialize`, `prime`
2. **계획**: `plan_milestone`, `create_sprints_from_milestone`
3. **개발**: `do_task`, `commit`, `test`, `code_review`
4. **자동화**: `yolo` (자율 실행)
5. **GitHub 통합**: `issue_create`, `pr_create`
6. **분석**: `ultrathink_*`, `mermaid`, `project_review`

### 디렉토리 구조 규칙
```
.aiwf/
├── 00_PROJECT_MANIFEST.md     # 중앙 추적 문서
├── 01_PROJECT_DOCS/           # 프로젝트 문서
├── 02_REQUIREMENTS/           # 마일스톤 요구사항
├── 03_SPRINTS/               # 스프린트 실행 추적
├── 04_GENERAL_TASKS/         # 독립적 태스크
├── 05_ARCHITECTURE_DECISIONS/ # ADR 문서
├── 10_STATE_OF_PROJECT/      # 프로젝트 상태 스냅샷
├── 98_PROMPTS/               # 유용한 AI 프롬프트
└── 99_TEMPLATES/             # 문서 템플릿
```

## 중요한 기술적 제약사항

### 설치 안전성
- 사용자가 생성한 프로젝트 컨텐츠는 절대 덮어쓰지 않음
- 업데이트 전 항상 백업 생성
- 스프린트 및 태스크의 기존 작업 보존

### Node.js 요구사항
- 최소 Node.js 14.0.0
- ES 모듈 사용 (`"type": "module"`)
- `https` 및 `fs/promises` 지원 필요

### 네트워크 의존성
- 설치를 위한 인터넷 연결 필요
- 라이브 GitHub 저장소에서 모든 컨텐츠 가져오기
- GitHub API 속도 제한 고려 (미인증)

## 보안 고려사항

- GitHub API를 통한 안전한 컨텐츠 다운로드
- 사용자 로컬 파일 시스템에 대한 안전한 파일 조작
- 백업 메커니즘을 통한 데이터 손실 방지

## 확장성 고려사항

### 새로운 언어 추가
1. `claude-code/aiwf/{lang_code}/` 디렉토리 생성
2. 기존 언어에서 컨텐츠 복사 및 번역
3. `index.js`의 `messages` 객체에 언어 옵션 추가
4. 언어 선택 프롬프트 업데이트

### 새로운 명령어 추가
1. 언어별 디렉토리에 명령어 파일 생성
2. 명명 규칙 준수 (한국어 버전은 `_kr` 접미사 가능)
3. 문서 업데이트

이 아키텍처는 안정성과 사용자 안전을 중시하며, 광범위한 오류 처리와 백업 메커니즘을 통해 여러 언어에서 안정적인 프레임워크 배포를 보장합니다.