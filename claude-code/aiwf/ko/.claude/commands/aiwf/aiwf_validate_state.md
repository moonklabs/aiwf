# 상태 검증 - 워크플로우 일관성 및 의존성 확인

프로젝트 상태의 일관성을 검증하고 워크플로우 규칙 위반을 감지합니다.

## 개요

이 명령은 다음을 검증합니다:
- 스프린트-태스크 상태 일관성
- 태스크 의존성 및 순환 참조
- 워크플로우 규칙 준수
- 80% 규칙 및 전환 조건

## 실행 프로세스

### 1. 상태 검증 실행

```bash
# 워크플로우 검증 실행
aiwf state validate
```

### 2. 검증 항목

#### 상태 일관성
- 완료된 스프린트에 미완료 태스크가 없는지 확인
- 활성 마일스톤에 활성 스프린트가 있는지 확인
- 태스크 상태가 스프린트 상태와 일치하는지 확인

#### 의존성 검증
- 순환 의존성 감지
- 차단된 태스크 식별
- 의존성 체인 길이 확인

#### 워크플로우 규칙
- 스프린트 순서 규칙 확인
- 태스크 전환 조건 검증
- 80% 완료 시 다음 스프린트 준비 확인

### 3. 결과 해석

#### 오류 (Errors)
즉시 수정이 필요한 문제:
- **INCONSISTENT_STATE**: 스프린트/태스크 상태 불일치
- **CIRCULAR_DEPENDENCY**: 순환 의존성 발견
- **INVALID_TRANSITION**: 잘못된 상태 전환

#### 경고 (Warnings)
주의가 필요한 사항:
- 오래된 진행 중 태스크
- 높은 의존성 복잡도
- 리소스 충돌 가능성

#### 제안사항 (Suggestions)
개선을 위한 권장사항:
- **SPRINT_PREPARATION**: 80% 완료로 다음 스프린트 준비 필요
- 병렬 작업 기회
- 우선순위 재조정 필요

## 사용 예시

### 기본 검증
```bash
aiwf state validate
```

### 검증 후 상태 업데이트
```bash
# 검증 실행
aiwf state validate

# 문제 발견 시 상태 업데이트
aiwf state update

# 다시 검증
aiwf state validate
```

## 출력 예시

### 정상 상태
```
🔍 Workflow Validation Report

✅ Workflow validation passed!
  No errors or warnings found.

📊 Workflow Statistics:
  Total Tasks: 25
  Active Sprints: 1
  Overall Progress: 68%

🔗 Dependency Analysis:
  Tasks with dependencies: 12
  Currently blocked tasks: 0
  Circular dependencies: 0
```

### 문제 발견 시
```
🔍 Workflow Validation Report

Found 3 issue(s):

❌ Errors (1):
  1. INCONSISTENT_STATE
     Sprint S02 marked complete but has 2 incomplete tasks
     Affected tasks: T05_S02, T07_S02

⚠️  Warnings (1):
  1. STALE_TASK
     Task T03_S01 in progress for over 7 days

💡 Suggestions (1):
  1. SPRINT_PREPARATION
     Sprint S02 is 85% complete. Consider preparing the next sprint.

🎯 Recommended Actions:
  1. Fix inconsistent sprint/task states
     - Update task statuses to match sprint status
     - Or reopen completed sprints if needed
  2. Review stale tasks
     - Check if T03_S01 is actually being worked on
     - Consider reassigning or breaking down
```

## 문제 해결 가이드

### 상태 불일치 해결
```bash
# 태스크 상태 확인
aiwf state show

# 개별 태스크 완료 처리
aiwf state complete T05_S02
aiwf state complete T07_S02

# 또는 스프린트 상태 수정
# (스프린트 메타 파일 직접 편집)
```

### 순환 의존성 해결
1. 순환 관계에 있는 태스크 식별
2. 의존성 재검토 및 재구성
3. 태스크 파일에서 의존성 섹션 수정
4. 상태 업데이트 및 재검증

### 80% 규칙 대응
```bash
# 다음 스프린트 준비
/aiwf:create_sprint_tasks S03

# 현재 스프린트 마무리 가속화
/aiwf:next_action
```

## 자동화 활용

### CI/CD 통합
```yaml
# GitHub Actions 예시
- name: Validate AIWF Workflow
  run: |
    npm install -g aiwf
    aiwf state validate
```

### Pre-commit Hook
```bash
#!/bin/bash
# .git/hooks/pre-commit
aiwf state validate || {
  echo "Workflow validation failed. Fix issues before committing."
  exit 1
}
```

## 주의사항

- 검증은 현재 상태 인덱스를 기반으로 함
- 파일 시스템과 동기화되지 않았을 수 있음
- 검증 전 `aiwf state update` 실행 권장
- 자동 수정 기능은 제공하지 않음 (수동 개입 필요)