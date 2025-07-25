# 스마트 태스크 시작 - 워크플로우 인식 태스크 실행

워크플로우 규칙과 현재 상태를 기반으로 지능적으로 태스크를 시작합니다.

## 개요

이 명령은 다음을 통합합니다:
- 워크플로우 컨텍스트 로드
- 태스크 유효성 검증
- 상태 인덱스 업데이트
- 의존성 확인
- 태스크 실행

## 정확히 다음 6개 항목으로 TODO 생성

1. 워크플로우 컨텍스트 로드 및 현재 상태 확인
2. 태스크 선택 및 유효성 검증
3. 의존성 및 전제조건 확인
4. 상태 인덱스 업데이트 및 포커스 설정
5. 태스크 실행
6. 다음 작업 추천

## 세부 실행 프로세스

### 1. 워크플로우 컨텍스트 로드 및 현재 상태 확인

**워크플로우 컨텍스트 로드:**
```bash
# 현재 워크플로우 상태 확인
aiwf state show
```

**현재 위치 파악:**
- 현재 마일스톤, 스프린트, 태스크 확인
- 진행 중인 작업 확인
- 권장 다음 작업 확인

### 2. 태스크 선택 및 유효성 검증

**태스크 결정:**
- <$ARGUMENTS>가 제공된 경우: 해당 태스크 선택
- 제공되지 않은 경우: `aiwf state next`로 추천 태스크 선택

**유효성 확인:**
- 태스크가 현재 스프린트에 속하는지 확인
- 태스크 상태가 'pending' 또는 'blocked'인지 확인
- 태스크 파일이 존재하는지 확인

### 3. 의존성 및 전제조건 확인

**의존성 검증:**
```bash
# 워크플로우 규칙 검증
aiwf validate workflow
```

**확인 사항:**
- 선행 태스크 완료 여부
- 필요한 리소스 사용 가능 여부
- 기술적 제약사항 충족 여부

**문제 발견 시:**
- 차단 이유 명시
- 대체 태스크 추천
- 해결 방법 제안

### 4. 상태 인덱스 업데이트 및 포커스 설정

**태스크 시작 준비:**
```bash
# 상태 업데이트
aiwf state update

# 현재 태스크에 포커스 설정
aiwf state focus {task_id}

# 브랜치 생성 (필요시)
git checkout -b task/{task_id}
```

**GitHub 이슈 확인:**
- 태스크에 연결된 이슈가 있는지 확인
- 필요시 이슈 생성 제안

### 5. 태스크 실행

**서브에이전트로 태스크 실행:**
- @.claude/commands/aiwf/aiwf_do_task.md 포함
- 태스크 ID를 인수로 전달
- 실행 결과 모니터링

**실행 중 상태 추적:**
- 진행 상황 기록
- 문제 발생 시 즉시 보고
- 완료 시 자동 상태 업데이트

### 6. 다음 작업 추천

**태스크 완료 후:**
```bash
# 상태 업데이트
aiwf state update

# 다음 추천 작업 확인
aiwf state next
```

**추천 제공:**
- 다음 우선순위 태스크
- 병렬 작업 가능한 태스크
- 스프린트/마일스톤 전환 필요 여부

## 스마트 기능

### 자동 컨텍스트 전환
- 스프린트 완료 시 자동으로 다음 스프린트 준비
- 마일스톤 전환 시 계획 재검토

### 지능형 우선순위 관리
- 긴급도와 중요도 기반 태스크 추천
- 리소스 가용성 고려
- 의존성 체인 최적화

### 실시간 검증
- 작업 시작 전 모든 조건 재확인
- 동적 상태 변경 감지
- 충돌 방지 메커니즘

## 사용 예시

### 기본 사용법
```
/aiwf:smart_start
```
→ 워크플로우가 추천하는 최적의 태스크로 시작

### 특정 태스크 지정
```
/aiwf:smart_start T03_S02
```
→ 지정된 태스크를 검증 후 시작

### 강제 실행
```
/aiwf:smart_start T03_S02 --force
```
→ 경고를 무시하고 태스크 시작 (주의 필요)

## 출력 형식

### 성공 시
```
🚀 스마트 태스크 시작

📊 워크플로우 상태:
- 현재 마일스톤: M01 (진행률 60%)
- 현재 스프린트: S02 (진행률 40%)
- 활성 태스크: 2개

✅ 태스크 검증 완료:
- 태스크: T03_S02 - API 엔드포인트 구현
- 의존성: 모두 충족
- 리소스: 사용 가능

🎯 태스크 시작:
- 브랜치: task/T03_S02 생성됨
- 포커스: T03_S02로 설정됨
- 상태: in_progress로 변경됨

💡 다음 추천 작업:
1. T04_S02 - 데이터베이스 스키마 설계
2. T05_S02 - 인증 미들웨어 구현
```

### 차단 시
```
⚠️ 태스크 시작 차단

❌ 차단 이유:
- 의존성 미충족: T02_S02가 아직 완료되지 않음
- 이 태스크는 T02의 결과가 필요합니다

🔄 대체 추천:
1. T02_S02 완료하기
2. T06_S02 - 독립적인 유틸리티 함수 구현
3. 일반 태스크 T001 - 문서 업데이트

💡 해결 방법:
- /aiwf:smart_start T02_S02로 선행 태스크 먼저 완료
- 또는 /aiwf:smart_start T06_S02로 독립적인 작업 진행
```

## 워크플로우 통합

이 명령은 다음과 함께 사용됩니다:
- `/aiwf:workflow_context` - 전체 컨텍스트 확인
- `/aiwf:smart_complete` - 지능형 태스크 완료
- `/aiwf:transition` - 단계 전환
- `/aiwf:validate_workflow` - 상태 검증

## 주의사항

- 워크플로우 규칙을 우선시합니다
- 강제 실행은 신중히 사용하세요
- 상태 동기화는 자동으로 처리됩니다
- 문제 발생 시 수동 개입이 필요할 수 있습니다