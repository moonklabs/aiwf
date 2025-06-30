# 전체 작업 지능형 실행

Arguments: $ARGUMENTS

프로젝트의 모든 작업(전체 task 또는 특정 작업의 하위 작업)을 지능적으로 분석하고 최적화된 순서로 실행합니다.

## 지능형 분석 및 실행

### 컨텍스트 분석

실행 전 다음 요소들을 분석합니다:

- **작업 의존성**: 작업 간 의존 관계 파악 (상위-하위, 작업-작업 간)
- **작업 복잡도**: 각 작업의 난이도와 예상 소요 시간
- **현재 상태**: 진행 중인 작업, 블록된 작업, 완료된 작업 식별
- **사용자 패턴**: 이전 작업 수행 방식과 선호도
- **프로젝트 우선순위**: 전체 프로젝트 관점에서의 중요도

### 스마트 실행 전략

상황에 따른 최적화된 실행 방식:

**의존성 기반 실행**:

- 의존 관계가 있는 작업들을 올바른 순서로 배치
- 병렬 처리 가능한 작업들 식별
- 차단된 작업의 의존성 해결 우선

**복잡도 기반 실행**:

- 간단한 작업 먼저 → 빠른 성취감과 모멘텀
- 복잡한 작업 먼저 → 집중력이 높을 때 어려운 작업 처리

**시간대별 최적화**:

- 오전: 복잡한 작업 우선
- 오후: 루틴한 작업이나 리뷰 작업
- 저녁: 마무리 작업이나 문서화

**우선순위 기반 실행**:

- 프로젝트 전체 관점에서 중요한 작업 우선
- 마일스톤 달성에 필요한 작업 우선

## 워크플로우

### 1. 전체 프로젝트 분석

```bash
# 모든 작업 조회
task-master get-tasks --with-subtasks

# 의존성 검증
task-master validate-dependencies

# 복잡도 분석
task-master complexity-report
```

### 2. 실행 모드 결정

**전체 프로젝트 실행**:

- 모든 pending 상태의 작업을 대상
- 전체 프로젝트 완료를 목표

**특정 작업 및 하위 작업 실행**:

- 특정 작업과 그 하위 작업들을 대상
- 해당 작업 완료를 목표

### 3. 지능형 실행 순서 결정

```bash
# 다음 실행 가능한 작업 찾기
task-master next

# 실행 가능한 모든 작업 나열 (차단되지 않은 작업들)
task-master get-tasks --status=pending --with-subtasks
```

### 4. 최적화된 작업 실행

**전체 작업 실행 루프**:

```bash
# 실행 가능한 작업이 있는 동안 반복
while [ "$(task-master next)" != "No tasks available" ]; do
  CURRENT_TASK=$(task-master next --format=id)

  # 작업 정보 표시
  echo "=== 실행 중: Task $CURRENT_TASK ==="
  task-master show $CURRENT_TASK

  # 하위 작업이 있는지 확인
  if task-master show $CURRENT_TASK | grep -q "subtasks"; then
    echo "하위 작업 실행 시작..."
    # 하위 작업들을 순차적으로 실행
    for subtask in $(task-master show $CURRENT_TASK --subtasks-only --format=ids); do
      echo "--- 하위 작업 $subtask 실행 ---"
      task-master show $subtask

      # 실제 구현 로직 수행
      echo "작업 구현 중..."

      # 완료 표시
      task-master set-status --id=$subtask --status=done
      echo "하위 작업 $subtask 완료"
    done
  else
    # 단일 작업 실행
    echo "단일 작업 실행 중..."

    # 실제 구현 로직 수행
    echo "작업 구현 중..."
  fi

  # 작업 완료 표시
  task-master set-status --id=$CURRENT_TASK --status=done
  echo "Task $CURRENT_TASK 완료"
  echo ""
done

echo "모든 실행 가능한 작업이 완료되었습니다!"
```

### 5. 진행 상황 추적 및 학습

- 실행 패턴 기록
- 예상 vs 실제 소요 시간 학습
- 효율성 메트릭 수집
- 차단된 작업들에 대한 해결 방안 제안

### 6. 완료 후 상태 분석

```bash
# 전체 프로젝트 상태 확인
task-master get-tasks --status=all

# 차단된 작업들 확인
task-master get-tasks --status=blocked,deferred

# 다음 마일스톤까지의 진행률
echo "프로젝트 진행률 분석..."
```

## 학습 모드

이 명령어는 실행 패턴을 학습합니다:

- **실행 순서 최적화**: 성공적인 패턴 기억
- **시간 예측 개선**: 실제 소요 시간 데이터 축적
- **개인 선호도 학습**: 사용자의 작업 스타일 적응
- **효율성 향상**: 생산성 높은 워크플로우 식별
- **프로젝트 패턴 학습**: 프로젝트 유형별 최적 실행 전략

## 사용법

```bash
# 전체 프로젝트의 모든 작업 실행
/tm run-all-tasks

# 특정 작업과 그 하위 작업들 실행
/tm run-all-tasks <task-id>

# 실행 전략 지정
/tm run-all-tasks --strategy=dependency   # 의존성 우선
/tm run-all-tasks --strategy=complexity   # 복잡도 우선
/tm run-all-tasks --strategy=priority     # 우선순위 우선
/tm run-all-tasks --strategy=time         # 시간대 최적화

# 특정 상태의 작업만 실행
/tm run-all-tasks --status=pending        # pending 작업만
/tm run-all-tasks --status=in-progress    # 진행 중인 작업만

# 드라이런 모드 (실제 실행 없이 계획만 표시)
/tm run-all-tasks --dry-run

# 대화형 모드 (각 작업 실행 전 확인)
/tm run-all-tasks --interactive
```

## 지능형 기능

### 자동 중단점

- 차단된 작업 발견 시 자동 일시 정지
- 의존성 해결 제안
- 대안 작업 경로 제시

### 진행률 예측

- 남은 작업량 기반 완료 시간 예측
- 일일/주간 목표 달성 가능성 분석
- 프로젝트 전체 완료 예상 시점

### 컨텍스트 기반 제안

실행 완료 후 상황별 다음 액션:

- **모든 작업 완료** → 프로젝트 완료 축하 + 다음 프로젝트 제안
- **일부 작업 차단됨** → 차단 해제 방법 제안 + 대체 작업 제안
- **복잡한 작업 남음** → 휴식 제안 + 작업 분할 제안
- **의존성 문제** → 의존 관계 재구성 제안

### 스마트 배치

- **에너지 수준 고려**: 오전에는 복잡한 작업, 오후에는 단순한 작업
- **컨텍스트 스위칭 최소화**: 유사한 작업들을 그룹핑하여 연속 실행
- **병렬 처리 기회**: 독립적인 작업들의 동시 진행 제안
