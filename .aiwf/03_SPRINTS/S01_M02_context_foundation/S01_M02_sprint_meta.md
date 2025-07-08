---
sprint_folder_name: S01_M02_context_foundation
sprint_sequence_id: S01
milestone_id: M02
title: Context Foundation - 핵심 기반 구축
status: planned
goal: Feature Ledger와 AI 페르소나 시스템의 핵심 기반을 구축하고, Context 압축 아키텍처를 설계하여 M02 마일스톤의 토대를 마련한다.
last_updated: 2025-07-08T16:30:00Z
---

# Sprint: Context Foundation (S01)

## Sprint Goal
Feature Ledger와 AI 페르소나 시스템의 핵심 기반을 구축하고, Context 압축 아키텍처를 설계하여 M02 마일스톤의 토대를 마련한다.

## Scope & Key Deliverables

### 1. Feature Ledger 시스템 구현 (필수)
- `.aiwf/06_FEATURE_LEDGERS/` 디렉토리 구조 생성
- Feature 데이터 모델 설계 및 구현
- 기본 CRUD 명령어 구현 (`create_feature_ledger`, `update_feature_status`)
- 마일스톤과의 연동 시스템 구축

### 2. AI 페르소나 기반 구조 구축 (필수)
- `.aiwf/07_AI_PERSONAS/` 디렉토리 구조 생성
- 페르소나 정의 스키마 설계
- 페르소나 관리 기본 명령어 구현
- 컨텍스트 로딩 메커니즘 설계

### 3. Context 압축 아키텍처 설계 (필수)
- 토큰 사용량 추적 시스템 설계
- Context 압축 알고리즘 아키텍처
- SPECS_Token_Optimization.md 문서 작성
- 프로토타입 구현

### 4. 핵심 시스템 안정화
- `update_docs` 명령어 복구
- 핵심 명령어 10개 안정화 (축소된 범위)
- 테스트 커버리지 80% 달성 (현실적 목표)
- GitHub API 최적화

## 태스크 목록

### Feature Ledger 시스템 (4개 태스크)
- [x] [TX01_S01: Feature Ledger 데이터 구조 설계](TX01_S01_Feature_Ledger_데이터_구조_설계.md)
- [x] [TX02_S01: Feature Ledger CLI 명령어 개발](TX02_S01_Feature_Ledger_CLI_명령어_개발.md)
- [ ] [T03_S01: Git 연동 Feature 추적](T03_S01_Git_연동_Feature_추적.md)
- [ ] [T04_S01: Feature Ledger 문서화](T04_S01_Feature_Ledger_문서화.md)

### AI 페르소나 시스템 (2개 태스크)
- [ ] [T05_S01: AI 페르소나 데이터 구조 설계](T05_S01_AI_페르소나_데이터_구조_설계.md)
- [ ] [T06_S01: 페르소나 관리 명령어 구현](T06_S01_페르소나_관리_명령어_구현.md)

### Context 압축 시스템 (3개 태스크)
- [ ] [T07_S01: Context 압축 아키텍처 설계](T07_S01_Context_압축_아키텍처_설계.md)
- [ ] [T08_S01: 토큰 추적 시스템 프로토타입](T08_S01_토큰_추적_시스템_프로토타입.md)
- [ ] [T09_S01: 압축 알고리즘 프로토타입](T09_S01_압축_알고리즘_프로토타입.md)

### 시스템 안정화 (3개 태스크)
- [ ] [T10_S01: update_docs 명령어 복구](T10_S01_update_docs_명령어_복구.md)
- [ ] [T11_S01: 통합 테스트 Suite 구축](T11_S01_통합_테스트_Suite_구축.md)
- [ ] [T12_S01: 성능 최적화 및 문서화](T12_S01_성능_최적화_및_문서화.md)

## Definition of Done (for the Sprint)

### M02 핵심 기능 기반
- [ ] Feature Ledger 디렉토리 구조 및 데이터 모델 완성
- [ ] Feature CRUD 명령어 2개 이상 동작
- [ ] AI 페르소나 디렉토리 구조 및 스키마 완성
- [ ] 페르소나 관리 명령어 기본 구현
- [ ] Context 압축 아키텍처 문서 (SPECS_Token_Optimization.md) 완성
- [ ] 토큰 추적 시스템 프로토타입 동작

### 시스템 안정화
- [ ] `update_docs` 명령어 정상 작동
- [ ] 핵심 명령어 10개 오류 없이 실행
- [ ] 테스트 커버리지 80% 달성
- [ ] GitHub API 안정적 동작

### 품질 및 문서화
- [ ] Feature Ledger API 문서 초안
- [ ] AI 페르소나 시스템 설계 문서
- [ ] Context 압축 사양서 완성
- [ ] 다음 스프린트를 위한 인터페이스 정의

## Notes / Retrospective Points

- **핵심 초점**: M02의 3대 핵심 기능(Feature Ledger, AI 페르소나, Context 압축) 기반 구축
- **우선순위**: Feature Ledger 시스템이 다른 기능의 기반이 되므로 최우선
- **기술적 도전**: Context 압축 알고리즘 설계의 복잡성
- **성공 지표**: 다음 스프린트에서 바로 구현 가능한 수준의 설계 완성도
- **범위 조정**: 1주일 내 완료 가능하도록 구현보다 설계와 프로토타입에 집중
- **다음 스프린트 준비**: S02에서 본격 구현을 위한 명확한 인터페이스 정의
- **총 태스크**: 12개 (복잡성: 높음 3개, 보통 7개, 낮음 2개)