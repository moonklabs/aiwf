# AIWF 상태 관리 가이드

## 개요

AIWF 상태 관리 시스템은 AI 어시스턴트가 세션 간에 완벽한 컨텍스트 인식을 유지하도록 돕는 혁신적인 기능입니다. 지능적인 작업 우선순위 지정, 의존성 추적, 워크플로우 검증을 통해 개발 효율성을 극대화합니다.

## 핵심 개념

### 1. 상태 인덱스
중앙 `task-state-index.json` 파일이 관리하는 내용:
- 현재 프로젝트 상태 (마일스톤, 스프린트, 태스크)
- 태스크 의존성 및 관계
- 진행 추적 및 완료 상태
- 원활한 세션 연속성을 위한 AI 컨텍스트

### 2. 워크플로우 규칙
`workflow-rules.json`이 정의하는 내용:
- 마일스톤 → 스프린트 → 태스크 계층 구조
- 상태 전환 조건
- 우선순위 계산 가중치
- AI 동작 선호 설정

### 3. 우선순위 매트릭스
태스크 점수 계산 기준:
- **긴급도 (40%)**: 마감일 기반 점수
- **중요도 (30%)**: 우선순위 레벨 (high/medium/low)
- **의존성 (20%)**: 차단된 태스크 수
- **노력 (10%)**: 역관계 (낮은 노력 = 높은 우선순위)

## CLI 명령어

### 기본 상태 관리

```bash
# 파일 시스템에서 상태 인덱스 업데이트
aiwf state update

# 현재 상태 및 통계 표시
aiwf state show

# 다음 권장 작업 가져오기
aiwf state next

# 워크플로우 일관성 검증
aiwf state validate
```

### 태스크 진행 추적

```bash
# 태스크를 시작됨으로 표시
aiwf state start T01_S01

# 태스크를 완료됨으로 표시
aiwf state complete T01_S01

# 특정 태스크에 집중 (상세 보기)
aiwf state focus T01_S01
```

### 고급 옵션

```bash
# 프로젝트 전체 강제 재스캔
aiwf state update --force

# JSON 형식으로 다음 작업 가져오기
aiwf state next --format=json

# 특정 측면 검증
aiwf state validate --focus=dependencies
aiwf state validate --check=sprint-consistency
```

## Claude 명령어와의 통합

### 스마트 태스크 실행

새로운 스마트 명령어는 상태 관리와 통합됩니다:

```bash
# 워크플로우 인식으로 태스크 시작
/project:aiwf:smart_start T01_S01

# 상태 동기화와 함께 태스크 완료
/project:aiwf:smart_complete T01_S01
```

### 향상된 YOLO 모드

YOLO 모드는 이제 워크플로우 인텔리전스를 사용합니다:

```bash
# 자동 태스크 선택으로 실행
/project:aiwf:yolo

# 워크플로우 최적화를 통한 스프린트별 실행
/project:aiwf:yolo S03

# 적응적 스프린트 관리 (80% 규칙)
/project:aiwf:yolo sprint-all
```

## 워크플로우 검증

### 검증 보고서 예시

```
🔍 워크플로우 검증 보고서

3개의 문제 발견:

❌ 오류 (1):
  1. INCONSISTENT_STATE
     스프린트 S02가 완료로 표시되었지만 2개의 미완료 태스크 존재
     
⚠️  경고 (1):
  1. STALE_TASK
     태스크 T03_S01이 7일 이상 진행 중
     
💡 제안사항 (1):
  1. SPRINT_PREPARATION
     스프린트 S02가 85% 완료. 다음 스프린트 준비를 고려하세요.
```

### 일반적인 문제 및 해결책

#### 1. 상태 불일치
```bash
# 상태 업데이트로 수정
aiwf state update --force

# 또는 수동으로 태스크 완료
aiwf state complete T05_S02
aiwf state complete T07_S02
```

#### 2. 순환 의존성
- 태스크 파일에서 태스크 의존성 검토
- 순환 참조 제거
- `aiwf state validate`를 실행하여 수정 확인

#### 3. 80% 규칙 트리거
```bash
# 스프린트가 80%에 도달하면 다음 스프린트 준비
/project:aiwf:create_sprint_tasks S03
```

## 모범 사례

### 1. 정기적인 상태 업데이트
- 주요 변경 후 `aiwf state update` 실행
- YOLO 모드 시작 전에 사용
- 스프린트 완료 후 검증

### 2. 의존성 관리
- 태스크 메타데이터에 의존성 정의
- 순환 의존성 피하기
- `blocks`와 `depends_on` 필드를 올바르게 사용

### 3. 스프린트 계획
- 80% 규칙이 스프린트 전환을 안내하도록 허용
- 주요 결정 전에 워크플로우 검증 사용
- `aiwf state next`의 AI 권장사항 신뢰

## 예제 워크플로우

### 새 세션 시작

```bash
# 1. 최신 상태로 업데이트
aiwf state update

# 2. 현재 상태 확인
aiwf state show

# 3. 권장사항 가져오기
aiwf state next

# 4. 권장 태스크 시작
aiwf state start T01_S01
/project:aiwf:smart_start T01_S01
```

### 작업 완료

```bash
# 1. 태스크 완료
/project:aiwf:smart_complete T01_S01

# 2. 상태가 자동으로 업데이트됨
# 3. 다음 권장사항 가져오기
aiwf state next

# 4. 다음 태스크로 계속
```

### 스프린트 전환

```bash
# 1. 스프린트 진행 상황 확인
aiwf state show

# 2. 80% 완료 시 검증
aiwf state validate

# 3. 검증이 제안하면 다음 스프린트 준비
/project:aiwf:create_sprint_tasks S03

# 4. 워크플로우 계속
```

## 문제 해결

### 상태가 업데이트되지 않음
```bash
# 전체 강제 재스캔
aiwf state update --force

# 파일 권한 확인
ls -la .aiwf/
```

### 의존성 누락
```bash
# 의존성 검증
aiwf state validate --focus=dependencies

# 적절한 메타데이터를 위해 태스크 파일 검토
```

### 워크플로우 오류
```bash
# 종합적인 검증 실행
aiwf state validate

# 워크플로우 규칙 확인
cat .aiwf/workflow-rules.json
```

## 고급 기능

### 사용자 정의 우선순위 가중치

`.aiwf/workflow-rules.json` 편집:
```json
{
  "priority_weights": {
    "urgency": 0.4,
    "importance": 0.3,
    "dependencies": 0.2,
    "effort": 0.1
  }
}
```

### AI 동작 조정

AI 선호 설정 구성:
```json
{
  "ai_behavior": {
    "auto_select_tasks": true,
    "prefer_blocked_tasks": true,
    "parallel_task_limit": 3,
    "risk_tolerance": "conservative"
  }
}
```

## 결론

AIWF 상태 관리 시스템은 AI 어시스턴트가 프로젝트와 작업하는 방식을 변화시킵니다. 완벽한 컨텍스트 인식을 유지하고 지능적인 권장사항을 제공함으로써 인간 개발자와 AI 어시스턴트 간의 최대 생산성과 원활한 협업을 보장합니다.

자세한 정보는 다음을 참조하세요:
- [COMMANDS_GUIDE.md](./COMMANDS_GUIDE.md) - 전체 명령어 참조
- [README.md](../README.md) - 프로젝트 개요
- [CHANGELOG.md](../CHANGELOG.md) - 최신 업데이트