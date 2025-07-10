---
task_id: T13_S03
sprint_sequence_id: S03
status: done
complexity: Medium
last_updated: 2025-01-08T17:50:00Z
github_issue: 
---

# Task: AI 도구 통합 템플릿 개발

## Description
5개 주요 AI 개발 도구(Claude Code, GitHub Copilot, Cursor, Windsurf, Augment)를 위한 통합 템플릿을 개발합니다. 각 도구별로 최적화된 설정 파일과 워크플로우를 제공하여, AIWF를 사용하는 개발자들이 선호하는 AI 도구와 즉시 연동할 수 있도록 지원합니다.

## Goal / Objectives
- 5개 AI 도구별 최적화된 설정 템플릿 제공
- 각 도구의 고유한 기능과 AIWF 기능의 시너지 극대화
- Feature Ledger와 AI 페르소나 시스템과의 원활한 통합
- 개발자가 즉시 사용할 수 있는 실용적인 워크플로우 구축

## Acceptance Criteria
- [ ] 5개 AI 도구별 템플릿 디렉토리 구조 완성 (`.aiwf/ai-tools/[tool-name]/`)
- [ ] 각 도구별 설정 파일 및 가이드 문서 작성
- [ ] Feature Ledger와의 통합 동작 확인
- [ ] AI 페르소나가 각 도구에서 활용되는 방식 문서화
- [ ] 템플릿 설치 및 활성화 명령어 구현
- [ ] 각 템플릿의 오프라인 캐시 지원
- [ ] 한국어/영어 사용 가이드 완성

## Subtasks
- [x] Claude Code 템플릿 개발
  - [x] `.claude` 디렉토리 구조 설계
  - [x] CLAUDE.md 템플릿 파일 작성
  - [x] Feature Ledger 연동 설정
  - [x] AI 페르소나 활용 가이드
- [x] GitHub Copilot 템플릿 개발
  - [x] `.github/copilot-instructions.md` 템플릿
  - [x] Copilot 설정 파일 구성
  - [x] AIWF 기능과의 통합 포인트 문서화
- [x] Cursor 템플릿 개발
  - [x] `.cursorrules` 파일 템플릿
  - [x] Cursor 전용 워크플로우 가이드
  - [x] Context 압축 기능 활용법
- [x] Windsurf 템플릿 개발
  - [x] Windsurf 설정 파일 구조
  - [x] AIWF 통합 설정
  - [x] 사용 시나리오 문서화
- [x] Augment 템플릿 개발
  - [x] Augment 설정 파일 템플릿
  - [x] AIWF 연동 가이드
  - [x] 성능 최적화 팁
- [x] 템플릿 관리 시스템 구현
  - [x] `aiwf ai-tool install [tool-name]` 명령어
  - [x] `aiwf ai-tool list` 명령어
  - [x] `aiwf ai-tool update` 명령어
- [x] 통합 테스트 및 검증
  - [x] 각 템플릿의 독립적 동작 확인
  - [x] Feature Ledger 연동 테스트
  - [x] AI 페르소나 적용 테스트
  - [x] 오프라인 모드 동작 확인

## Implementation Guide

### 1. 디렉토리 구조
```
.aiwf/ai-tools/
├── claude-code/
│   ├── template/
│   │   ├── .claude/
│   │   └── CLAUDE.md
│   ├── config.json
│   └── README.md
├── github-copilot/
│   ├── template/
│   │   └── .github/
│   │       └── copilot-instructions.md
│   ├── config.json
│   └── README.md
├── cursor/
│   ├── template/
│   │   └── .cursorrules
│   ├── config.json
│   └── README.md
├── windsurf/
│   ├── template/
│   ├── config.json
│   └── README.md
└── augment/
    ├── template/
    ├── config.json
    └── README.md
```

### 2. 템플릿 설정 파일 (config.json)
```json
{
  "name": "claude-code",
  "version": "1.0.0",
  "description": "Claude Code integration template for AIWF",
  "compatible_aiwf_version": ">=0.1.0",
  "features": {
    "feature_ledger": true,
    "ai_persona": true,
    "context_compression": true
  },
  "setup_commands": [],
  "files_to_copy": [
    {
      "source": "template/.claude",
      "destination": ".claude"
    }
  ]
}
```

### 3. 명령어 구현
- `src/commands/ai-tool.js` 파일 생성
- install, list, update 서브커맨드 구현
- 템플릿 파일 복사 및 설정 적용 로직

### 4. 각 도구별 특화 기능
- **Claude Code**: CLAUDE.md에 AIWF 컨텍스트 자동 포함
- **GitHub Copilot**: copilot-instructions.md에 프로젝트 구조 자동 업데이트
- **Cursor**: .cursorrules에 Feature Ledger 정보 통합
- **Windsurf**: 프로젝트 메타데이터 연동
- **Augment**: AI 페르소나 설정 자동 적용

## Related ADRs
- ADR-002: Feature Ledger 설계 (도구 통합 시 feature 추적)
- ADR-003: AI 페르소나 시스템 (각 도구별 페르소나 적용)
- ADR-004: Context 압축 (도구별 컨텍스트 최적화)

## Dependencies
- S01에서 구현된 Feature Ledger 시스템
- S02에서 구현된 AI 페르소나 시스템
- S02에서 구현된 오프라인 캐시 시스템

## Output Log
*(This section is populated as work progresses on the task)*

[2025-07-08 17:00:00] Started task
[2025-01-08 17:05:00] Modified files: Created AI tool templates directory structure
[2025-01-08 17:10:00] Completed subtask: Claude Code template development
[2025-01-08 17:15:00] Completed subtask: GitHub Copilot template development
[2025-01-08 17:20:00] Completed subtask: Cursor template development
[2025-01-08 17:25:00] Completed subtask: Windsurf template development
[2025-01-08 17:30:00] Completed subtask: Augment template development
[2025-01-08 17:35:00] Modified files: src/commands/ai-tool.js - Implemented template management commands
[2025-01-08 17:40:00] Modified files: index.js - Added ai-tool command to CLI
[2025-01-08 17:45:00] Created sample Feature Ledger and AI Personas for testing
[2025-01-08 17:50:00] Task completed