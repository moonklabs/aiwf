# AIWF 프로젝트 매니페스트
*프로젝트명*: AIWF (AI Workflow Framework)
*생성일*: 2025-07-02
*마지막 업데이트*: 2025-07-09
*프로젝트 유형*: Node.js NPM 패키지
*현재 버전*: 0.3.0
*최고 마일스톤*: M02
*최고 스프린트*: S03

## 프로젝트 개요
AIWF는 Claude Code와의 통합을 위해 설계된 마크다운 기반 프로젝트 관리 프레임워크입니다. AI 지원 개발을 위한 체계적인 워크플로우를 제공하며, 다국어 지원(한국어/영어)을 통해 글로벌 개발자들이 사용할 수 있도록 설계되었습니다.

## 현재 마일스톤
- *활성 마일스톤*: M02_Context_Engineering_Enhancement
- *마일스톤 상태*: 계획 중
- *진행률*: 0%
- *예상 완료일*: 미정

## 현재 스프린트
- *활성 스프린트*: S01_M02_context_foundation
- *스프린트 상태*: in_progress
- *시작일*: 2025-07-08
- *예상 종료일*: 2025-07-15

### 진행 중
- *T12_S01*: 성능 최적화 및 문서화 (in_progress → 2025-07-09 03:12 시작)
- *T03_S02*: Context 압축 알고리즘 구현 (in_progress → 2025-07-09 03:30 시작)

### 계획됨
- *S01_M02*: Context Engineering 기반 구축 (planned)
- *S02_M02*: AI 강화 기능 구현 (planned)
- *S03_M02*: 생태계 통합 및 완성 (planned)

### 최근 완료
- *TX11_S01*: 통합 테스트 Suite 구축 (completed → 2025-07-09 03:06 완료)
- *TX10_S01*: update_docs 명령어 복구 (completed → 2025-07-09 02:49 완료)
- *TX09_S01*: 압축 알고리즘 프로토타입 (completed → 2025-07-09 02:35 완료)
- *TX08_S01*: 토큰 추적 시스템 프로토타입 (completed → 2025-07-09 02:12 완료)
- *TX07_S01*: Context 압축 아키텍처 설계 (completed → 2025-07-09 01:54 완료)
- *TX05_S01*: AI 페르소나 데이터 구조 설계 (completed → 2025-07-09 01:25 완료)
- *TX04_S01*: Feature Ledger 문서화 (completed → 2025-07-09 01:02 완료)
- *TX03_S01*: Git 연동 Feature 추적 (completed → 2025-07-09 00:45 완료)
- *TX02_S01*: Feature Ledger CLI 명령어 개발 (completed → 2025-07-09 00:18 완료)
- *TX01_S01*: Feature Ledger 데이터 구조 설계 (completed → 2025-07-09 00:01 완료)
- *T04_S03*: update_docs 명령어 누락 이슈 해결 (completed → 2025-07-03 06:35 완료)
- *T03_S03*: 한국어 명령어 전체 시스템 표준화 (completed → 2025-07-03 06:28 완료)

### 완료됨
- 프로젝트 초기화 완료
- M01 마일스톤 완료 (한국어 명령어 표준화)

## 마일스톤 목록
| ID  | 이름  | 상태  | 진행률 | 시작일  | 완료일 |
| --- | ----------- | ------- | ------ | ---------- | ------ |
| M02 | Context_Engineering_Enhancement | 계획 중 | 0%  | -  | -  |

### 마일스톤 상세
- [ ] [M02: Context Engineering Enhancement][1] - 상태: 계획 중

## 스프린트 목록
| ID  | 이름  | 마일스톤 | 상태  | 진행률 | 시작일  | 완료일 |
| --- | ----------------------------- | -------- | --------- | ------ | ---------- | ------ |
| S01 | context_foundation  | M02  | in_progress | 0%  | 2025-07-08 | -  |
| S02 | ai_enhancement  | M02  | planned  | 0%  | -  | -  |
| S03 | ecosystem_integration  | M02  | planned  | 0%  | -  | -  |

## 태스크 통계
- *총 태스크*: 12
- *완료*: 10
- *진행 중*: 0
- *대기 중*: 2
- *차단됨*: 0

## 프로젝트 메트릭
- *코드 커버리지*: N/A (NPM 패키지)
- *활성 이슈*: 0
- *해결된 이슈*: 0
- *오픈 PR*: 0

## 기술 스택
- *언어*: JavaScript (ES6+)
- *런타임*: Node.js 14.0.0+
- *패키지 매니저*: NPM
- *테스트*: Jest
- *CLI 도구*: Commander.js, Chalk, Ora, Prompts

## 주요 디렉토리
- `index.js`: 메인 CLI 설치 도구
- `claude-code/aiwf/ko/`: 한국어 AIWF 프레임워크
- `claude-code/aiwf/en/`: 영어 AIWF 프레임워크
- `rules/`: IDE별 개발 규칙
- `docs/`: 프로젝트 문서
- `tests/`: 테스트 파일

## 연락처 및 리소스
- *저자*: moonklabs
- *라이선스*: MIT
- *저장소*: https://github.com/aiwf/aiwf
- *NPM*: https://www.npmjs.com/package/aiwf
- *이슈 트래커*: https://github.com/aiwf/aiwf/issues

### 2025-07-08
- M01 마일스톤 삭제 (완료됨)
- M02 Context Engineering Enhancement 마일스톤을 위한 스프린트 재구성:
  - S01_M02_context_foundation: Feature Ledger, AI 페르소나, Context 압축 기반 구축
  - S02_M02_ai_enhancement: 5개 AI 페르소나, Context 압축 모드, Git 연동 구현
  - S03_M02_ecosystem_integration: 5개 AI 도구 템플릿, 통합 및 문서화 완성
- M02 DoD 요구사항에 맞춘 스프린트 재정의
- 1주일 단위 실행 가능한 범위로 조정

### 2025-07-02
- AIWF 프로젝트 초기화 완료
- 아키텍처 문서 생성
- M01 한국어 명령어 표준화 마일스톤 시작
- T03_S03 태스크 생성

## 향후 계획
1. *단기 목표 (1-2주)*:

   - 한국어 명령어 표준화 완료 (M01)
   - Context Engineering 시스템 설계 착수 (M02)

2. *중기 목표 (1개월)*:

   - Feature Ledger 시스템 구현 (M02)
   - AI 페르소나 시스템 개발 (M02)
   - 영어 명령어와의 동등성 검증 (M01)

3. *장기 목표 (분기)*:
   - 토큰 최적화 및 Context 압축 기능 완성 (M02)
   - 새로운 언어 지원 추가
   - AI 도구 통합 확대 (GitHub Copilot, Cursor, Windsurf 등)

[1]: 02_REQUIREMENTS/M02_Context_Engineering_Enhancement/M02_milestone_meta.md