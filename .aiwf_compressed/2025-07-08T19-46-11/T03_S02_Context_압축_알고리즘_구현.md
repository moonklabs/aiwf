---
task_id: T03_S02
sprint_sequence_id: S02
status: in_progress
complexity: Medium
last_updated: 2025-07-09T03:30:00Z
github_issue:
---

## Description
토큰 사용량을 50% 이상 절약하는 Context 압축 시스템을 구현합니다. S01에서 설계된 아키텍처를 바탕으로 aggressive, balanced, minimal 3단계 압축 모드와 `/project:aiwf:compress_context` 명령어를 구현하며, 중요도 기반 필터링과 실시간 토큰 모니터링을 제공합니다.

## Goal / Objectives
- 토큰 사용량 50% 이상 절약 달성
- 3단계 압축 모드 (aggressive, balanced, minimal) 구현
- `/project:aiwf:compress_context` 명령어 완성
- 압축 전후 컨텍스트 품질 유지
- 실시간 토큰 사용량 모니터링

## Acceptance Criteria
- [ ] `/project:aiwf:compress_context` 명령어 정상 작동
- [ ] aggressive 모드에서 50-70% 토큰 절약 달성
- [ ] balanced 모드에서 30-50% 토큰 절약 달성
- [ ] minimal 모드에서 10-30% 토큰 절약 달성
- [ ] 압축 처리 시간 3초 이내
- [ ] critical 정보 손실 없음 검증
- [ ] 대규모 프로젝트에서 테스트 통과

## Subtasks
- [ ] S01 토큰 추적 시스템과 통합
- [ ] 중요도 기반 컨텐츠 분류 알고리즘 구현
- [ ] 3단계 압축 모드별 알고리즘 개발
- [ ] 압축 명령어 인터페이스 구현
- [ ] 토큰 카운팅 및 절약률 계산 시스템
- [ ] 압축 품질 검증 시스템
- [ ] 성능 최적화 및 캐싱 구현

### 코드베이스의 주요 인터페이스 및 통합 지점
- S01 토큰 추적 시스템: `claude-code/aiwf/ko/utils/token-counter.js`
- S01 압축 아키텍처: TX07_S01 태스크에서 설계된 구조
- 토큰 카운팅: tiktoken 라이브러리
- AIWF 명령어 시스템: `.claude/commands/aiwf/` 구조

### 특정 임포트 및 모듈 참조
- tiktoken: `const { encoding_for_model } = require('tiktoken')`
- S01 압축 유틸리티: 기존 압축 관련 유틸리티 함수들
- 파일 시스템: `fs.readFile`, `fs.writeFile` 비동기 처리
- 마크다운 파싱: frontmatter와 본문 분리 처리

### 따라야 할 기존 패턴
- S01에서 구축된 토큰 카운팅 패턴
- 압축 전략 구조: aggressive, balanced, minimal 모드
- 중요도 분류: critical, high, medium, low 우선순위
- 성능 모니터링 패턴: 처리 시간, 메모리 사용량 추적

### 작업할 데이터베이스 모델 또는 API 계약
- 압축 설정 구조:
  ```javascript
  {
   mode: 'aggressive|balanced|minimal',
   targetReduction: 0.5, // 50% 절약 목표
   preserveCritical: true,
   enableCaching: true
  }
  ```
- 압축 결과:
  {
   originalTokens: 1000,
   compressedTokens: 500,
   reductionRate: 0.5,
   compressionTime: 1200, // ms
   qualityScore: 0.95
  }
  ```

### 오류 처리 접근법
- 토큰 카운팅 실패: 추정값 사용 또는 압축 건너뛰기
- 압축 시간 초과: 부분 압축 결과 반환
- 메모리 부족: 청크 단위 처리로 분할
- 중요 정보 손실 감지: 자동으로 낮은 압축 모드로 전환

### 단계별 구현 접근법
1. S01 토큰 추적 시스템과의 통합 인터페이스 구현
2. 컨텐츠 중요도 분류 알고리즘 개발
3. 3단계 압축 모드별 알고리즘 구현
4. 압축 명령어 및 사용자 인터페이스 개발
5. 토큰 절약률 계산 및 검증 시스템
6. 압축 품질 평가 및 최적화
7. 성능 튜닝 및 캐싱 시스템

### 존중해야 할 주요 아키텍처 결정
- S01에서 설계된 압축 아키텍처 준수
- tiktoken 기반 토큰 카운팅 시스템 활용
- 3단계 압축 모드의 명확한 차별화
- 압축 품질과 성능의 균형

### 테스트 접근법
- 각 압축 모드별 토큰 절약률 검증
- 대용량 컨텐츠에서의 성능 테스트
- 압축 품질 자동 검증 (critical 정보 보존)
- 메모리 사용량 및 처리 시간 성능 테스트
- 다양한 컨텐츠 유형별 압축 효과 측정

### 성능 고려사항
- 압축 결과 캐싱으로 반복 처리 방지
- 청크 단위 처리로 메모리 효율성 확보
- 병렬 처리 가능한 부분의 최적화
- 토큰 카운팅 오버헤드 최소화
- 압축 알고리즘의 시간 복잡도 최적화

#### Aggressive 모드 (50-70% 압축)
- 중요도 critical/high만 유지
- 코드 예제 대폭 축소
- 중복 정보 완전 제거
- 요약 중심 압축

#### Balanced 모드 (30-50% 압축)
- 중요도 critical/high/medium 유지
- 코드 예제 선택적 유지
- 중복 정보 부분 제거
- 균형잡힌 압축

#### Minimal 모드 (10-30% 압축)
- 모든 중요도 유지
- 공백 및 형식 정리
- 명백한 중복만 제거
- 안전한 압축

## Output Log
*(This section is populated as work progresses on the task)*

[2025-07-09 03:30:00] Task 상태를 in_progress로 업데이트