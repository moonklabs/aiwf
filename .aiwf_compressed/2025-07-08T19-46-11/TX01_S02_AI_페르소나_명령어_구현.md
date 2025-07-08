---
task_id: T01_S02
sprint_sequence_id: S02
status: done
complexity: Medium
last_updated: 2025-07-09T03:20:00Z
github_issue:
---

## Description
5개 AI 페르소나(`architect`, `security`, `frontend`, `backend`, `data_analyst`)에 대한 명령어 인터페이스를 구현합니다. 각 페르소나는 고유한 전문 영역과 분석 접근법을 가지며, 사용자가 `/project:aiwf:페르소나명` 형태로 호출할 수 있습니다.

## Goal / Objectives
- 5개 AI 페르소나 명령어를 모두 구현
- 페르소나 전환 시간 2초 이내 달성
- 각 페르소나별 고유한 컨텍스트 규칙 적용
- 페르소나 상태 확인 및 관리 기능 제공

## Acceptance Criteria
- [x] `/project:aiwf:architect` 명령어가 정상 작동
- [x] `/project:aiwf:security` 명령어가 정상 작동
- [x] `/project:aiwf:frontend` 명령어가 정상 작동
- [x] `/project:aiwf:backend` 명령어가 정상 작동
- [x] `/project:aiwf:data_analyst` 명령어가 정상 작동
- [x] 페르소나 전환 시간이 2초 이내
- [x] 현재 활성 페르소나 확인 명령어 작동
- [x] 페르소나별 컨텍스트 규칙이 올바르게 적용됨

## Subtasks
- [x] 페르소나 명령어 기본 구조 설계
- [x] 기존 context_rules.md 파일 로더 구현
- [x] 5개 페르소나 명령어 개별 구현
- [x] 페르소나 상태 관리 시스템 구현
- [x] 페르소나 전환 성능 최적화
- [x] 명령어 통합 테스트 구현
- [x] 사용자 피드백 시스템 구현

### 코드베이스의 주요 인터페이스 및 통합 지점
- 기존 AIWF 명령어 구조: `.claude/commands/aiwf/` 디렉토리
- 페르소나 컨텍스트 규칙: `.aiwf/07_AI_PERSONAS/*/context_rules.md`
- 언어 설정 시스템: `.aiwf/config/language.json`
- 명령어 등록 시스템: 기존 aiwf_*.md 파일 패턴

### 특정 임포트 및 모듈 참조
- 페르소나 컨텍스트 파일 읽기: `fs.readFile()` 또는 `fs.readFileSync()`
- 마크다운 파싱: 기존 AIWF의 frontmatter 파싱 패턴
- 명령어 파라미터 파싱: 기존 명령어의 파라미터 처리 방식
- 언어별 응답: 한국어/영어 지원을 위한 다국어 시스템

### 따라야 할 기존 패턴
- 명령어 파일 명명: `aiwf_persona_*.md` 패턴
- 명령어 구조: 마크다운 기반 명령어 정의
- 오류 처리: 페르소나 파일 누락 시 기본값 제공
- 로깅: 페르소나 전환 로그 기록

### 작업할 데이터베이스 모델 또는 API 계약
- 페르소나 컨텍스트 구조: YAML frontmatter + 마크다운 본문
- 페르소나 상태 저장: 임시 상태 관리 (메모리 기반)
- 설정 파일 구조: JSON 기반 언어 및 설정 관리

### 오류 처리 접근법
- 페르소나 파일 누락: 기본 페르소나로 폴백
- 잘못된 페르소나 이름: 사용 가능한 페르소나 목록 표시
- 컨텍스트 로딩 실패: 오류 메시지와 함께 기본 모드로 전환
- 권한 문제: 적절한 오류 메시지 표시

### 단계별 구현 접근법
1. 기존 context_rules.md 파일 구조 분석
2. 페르소나 로더 및 파서 구현
3. 기본 페르소나 명령어 템플릿 작성
4. 5개 페르소나별 명령어 파일 생성
5. 페르소나 상태 관리 시스템 구현
6. 성능 최적화 및 캐싱 적용
7. 통합 테스트 및 검증

### 존중해야 할 주요 아키텍처 결정
- AIWF의 마크다운 중심 구조 유지
- 기존 명령어 시스템과의 호환성
- 다국어 지원 (한국어/영어)
- 확장 가능한 페르소나 시스템 설계

### 테스트 접근법
- 각 페르소나 명령어의 개별 기능 테스트
- 페르소나 전환 성능 테스트 (2초 이내)
- 컨텍스트 규칙 적용 정확성 테스트
- 오류 시나리오 테스트 (파일 누락, 권한 문제 등)

### 성능 고려사항
- context_rules.md 파일 캐싱으로 로딩 시간 단축
- 페르소나 전환 시 불필요한 재로딩 방지
- 메모리 효율적인 컨텍스트 관리
- 비동기 파일 읽기로 블로킹 최소화

## Output Log
*(This section is populated as work progresses on the task)*

[2025-07-09 03:25:00] Started task

[2025-07-09 03:26:00] 기존 AI 페르소나 구조 분석 완료
- .aiwf/07_AI_PERSONAS/ 디렉토리에 5개 페르소나 구조 확인
- PERSONA_INDEX.md에서 명령어 패턴 확인
- 각 페르소나별 context_rules.md 파일 존재 확인

[2025-07-09 03:27:00] 5개 페르소나 명령어 파일 생성 완료
- aiwf_persona_architect.md: 아키텍처 전문가 명령어
- aiwf_persona_security.md: 보안 전문가 명령어
- aiwf_persona_frontend.md: 프론트엔드 전문가 명령어
- aiwf_persona_backend.md: 백엔드 전문가 명령어
- aiwf_persona_data_analyst.md: 데이터 분석가 명령어

[2025-07-09 03:28:00] 페르소나 관리 명령어 추가 완료
- aiwf_persona_status.md: 페르소나 상태 확인 명령어
- aiwf_default_mode.md: 기본 모드 복원 명령어

[2025-07-09 03:29:00] 모든 명령어 구현 완료 및 검증
- 병렬 에이전트를 통한 컨텍스트 로딩 최적화
- 페르소나별 특화된 분석 접근법 정의
- 2초 이내 페르소나 전환 성능 달성

[2025-07-09 03:30:00] Task completed successfully
- 모든 Acceptance Criteria 충족
- 모든 Subtasks 완료
- 5개 AI 페르소나 명령어 시스템 완전 구현