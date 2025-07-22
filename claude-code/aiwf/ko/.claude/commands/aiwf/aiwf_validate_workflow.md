# 워크플로우 검증

프로젝트의 현재 상태가 워크플로우 규칙과 일치하는지 검증하고, 불일치나 오류를 자동으로 감지하여 수정 방안을 제시합니다.

## 주요 기능

- **규칙 준수 검증**: 워크플로우 규칙 위반 사항 검출
- **일관성 검사**: 데이터 간 일관성 확인
- **자동 수정**: 간단한 문제는 자동 수정
- **개선 제안**: 워크플로우 최적화 제안

## 검증 항목

### 1. 구조적 검증

#### 계층 구조 검증
```
✓ Milestone이 Sprint를 포함하는가?
✓ Sprint가 Task를 포함하는가?
✓ 고아 Task가 없는가?
✓ 중복 ID가 없는가?
```

#### 명명 규칙 검증
```
✓ Milestone ID: M## 형식
✓ Sprint ID: S##_M## 형식
✓ Task ID: T##_S##_M## 형식
✓ 파일명과 ID 일치
```

### 2. 상태 일관성 검증

#### Sprint-Task 일관성
```javascript
// Sprint가 완료인데 Task가 미완료인 경우
if (sprint.status === 'completed') {
  const incompleteTasks = tasks.filter(t => 
    t.sprint === sprint.id && 
    t.status !== 'completed'
  );
  if (incompleteTasks.length > 0) {
    errors.push({
      type: 'INCONSISTENT_STATE',
      message: 'Sprint 완료 상태이나 미완료 Task 존재',
      sprint: sprint.id,
      tasks: incompleteTasks
    });
  }
}
```

#### Milestone-Sprint 일관성
```javascript
// Milestone이 활성인데 Sprint가 없는 경우
if (milestone.status === 'active') {
  const activeSprints = sprints.filter(s => 
    s.milestone === milestone.id && 
    s.status === 'active'
  );
  if (activeSprints.length === 0) {
    warnings.push({
      type: 'NO_ACTIVE_SPRINT',
      message: 'Milestone 활성이나 활성 Sprint 없음',
      milestone: milestone.id
    });
  }
}
```

### 3. 워크플로우 규칙 검증

#### Sprint 순서 규칙
```javascript
// S02가 활성인데 S01이 미완료
const sprintOrder = ['S01', 'S02', 'S03'];
for (let i = 1; i < sprintOrder.length; i++) {
  const current = findSprint(sprintOrder[i]);
  const previous = findSprint(sprintOrder[i-1]);
  
  if (current.status === 'active' && 
      previous.status !== 'completed') {
    errors.push({
      type: 'SPRINT_ORDER_VIOLATION',
      message: 'Sprint 순서 위반',
      current: current.id,
      previous: previous.id
    });
  }
}
```

#### Task 의존성 규칙
```javascript
// 의존 Task가 미완료인데 현재 Task가 진행 중
tasks.forEach(task => {
  if (task.status === 'in_progress' && task.dependencies) {
    const unmetDeps = task.dependencies.filter(depId => {
      const dep = findTask(depId);
      return dep.status !== 'completed';
    });
    
    if (unmetDeps.length > 0) {
      errors.push({
        type: 'DEPENDENCY_VIOLATION',
        message: '의존성 미충족 상태로 Task 진행',
        task: task.id,
        unmetDependencies: unmetDeps
      });
    }
  }
});
```

### 4. 데이터 무결성 검증

#### 참조 무결성
```
✓ Task가 참조하는 Sprint 존재 여부
✓ Sprint가 참조하는 Milestone 존재 여부
✓ 의존성이 참조하는 Task 존재 여부
```

#### 상태 전이 검증
```
✓ 허용된 상태 전이만 발생했는가?
✓ 필수 조건 없이 상태가 변경되었는가?
✓ 되돌릴 수 없는 상태로 잘못 전이되었는가?
```

## 실행 프로세스

### 1. 전체 스캔 및 데이터 수집
```javascript
const validationData = {
  milestones: scanMilestones(),
  sprints: scanSprints(),
  tasks: scanTasks(),
  stateIndex: loadStateIndex(),
  workflowRules: loadWorkflowRules()
};
```

### 2. 검증 실행
```javascript
const validationResult = {
  errors: [],      // 반드시 수정 필요
  warnings: [],    // 주의 필요
  suggestions: [], // 개선 제안
  autoFixable: [] // 자동 수정 가능
};

// 각 검증 함수 실행
validateStructure(validationData, validationResult);
validateConsistency(validationData, validationResult);
validateWorkflowRules(validationData, validationResult);
validateDataIntegrity(validationData, validationResult);
```

### 3. 자동 수정 제안
```javascript
validationResult.autoFixable = [
  {
    issue: "Sprint S02 진행률 불일치",
    current: "40%",
    correct: "60%",
    action: "updateSprintProgress('S02', 60)"
  },
  {
    issue: "Task T05 상태 불일치",
    current: "pending",
    correct: "blocked",
    action: "updateTaskStatus('T05', 'blocked', 'T04 미완료')"
  }
];
```

### 4. 검증 보고서 생성

## 출력 형식

### 검증 통과
```
✅ 워크플로우 검증 완료

📊 검증 결과:
- 검사 항목: 45개
- 통과: 45개
- 오류: 0개
- 경고: 0개

🎯 워크플로우 상태: 정상

💡 개선 제안:
- S03 Task 사전 계획 권장 (S02 80% 시점)
- 일일 진행률 업데이트 자동화 고려
```

### 오류 발견
```
❌ 워크플로우 검증 실패

📊 검증 결과:
- 검사 항목: 45개
- 통과: 41개
- 오류: 3개
- 경고: 1개

🚨 발견된 오류:

1. Sprint 순서 위반
   - 문제: S03 활성이나 S02 미완료
   - 원인: 강제 전환 사용
   - 해결: S03을 planning으로 되돌리기

2. Task 의존성 위반
   - 문제: T05 진행 중이나 T04 미완료
   - 원인: 의존성 무시하고 시작
   - 해결: T05를 pending으로 변경

3. 상태 불일치
   - 문제: Sprint S01 완료이나 T02 진행 중
   - 원인: Sprint 종료 시 Task 미확인
   - 해결: T02 상태 확인 및 업데이트

⚠️ 경고:
- M01 목표일 초과 위험 (잔여 5일, 미완료 30%)

🔧 자동 수정 가능: 2개
실행하시겠습니까? (y/n)
```

### 자동 수정 결과
```
🔧 자동 수정 실행 중...

✅ 수정 완료:
1. Sprint S02 진행률: 40% → 60%
2. Task T05 상태: pending → blocked

❌ 수동 수정 필요:
1. Sprint 순서 위반 - 관리자 결정 필요
2. T02 상태 - 실제 진행 상황 확인 필요

💡 다음 단계:
1. 수동 수정 항목 처리
2. /aiwf:validate_workflow 재실행
3. 모든 오류 해결 후 작업 계속
```

## 검증 규칙 커스터마이징

### 프로젝트별 규칙 추가
```json
// .aiwf/custom-rules.json
{
  "customRules": [
    {
      "name": "코드 리뷰 필수",
      "condition": "task.status === 'review'",
      "validate": "task.reviewer !== null",
      "error": "리뷰어 미지정"
    },
    {
      "name": "테스트 커버리지",
      "condition": "sprint.status === 'completed'",
      "validate": "sprint.testCoverage >= 80",
      "error": "테스트 커버리지 부족"
    }
  ]
}
```

## 사용 시나리오

### 1. 정기 검증
```bash
# 매일 아침 워크플로우 검증
/aiwf:validate_workflow
# → 밤사이 발생한 불일치 감지
```

### 2. 작업 전 검증
```bash
# 중요 작업 전 상태 확인
/aiwf:validate_workflow
/aiwf:next_action
# → 깨끗한 상태에서 작업 시작
```

### 3. Sprint 전환 전
```bash
# Sprint 전환 전 검증
/aiwf:validate_workflow
/aiwf:transition sprint S02
# → 안전한 전환 보장
```

## 자동 실행 트리거

- Task 상태 변경 시
- Sprint 완료 시
- 일일 자동 검증 (설정 가능)
- YOLO 모드 시작 전

## 관련 명령어

- `/aiwf:workflow_context` - 워크플로우 컨텍스트 확인
- `/aiwf:update_state` - 상태 인덱스 업데이트
- `/aiwf:fix_workflow` - 워크플로우 문제 수정
- `/aiwf:project_health` - 프로젝트 건강도 확인

이 명령어는 프로젝트가 항상 올바른 워크플로우 규칙을 따르고, 일관된 상태를 유지하도록 보장합니다.