# 워크플로우 전환 관리

Sprint 또는 Milestone 완료 시 다음 단계로의 전환을 체계적으로 관리합니다. 단순한 상태 변경이 아닌, 완료 검증, 다음 단계 준비, 자동화된 전환을 수행합니다.

## 주요 기능

- **완료 조건 검증**: Sprint/Milestone의 실제 완료 여부 확인
- **자동 전환**: 조건 충족 시 다음 단계 자동 활성화
- **준비 작업**: 다음 단계에 필요한 사전 작업 수행
- **일관성 보장**: 워크플로우 규칙에 따른 올바른 전환

## 전환 유형

### 1. Task 전환
- pending → in_progress → review → completed
- 블로킹 상태 처리 (blocked, paused)
- 의존 Task 자동 활성화

### 2. Sprint 전환
- planning → active → completed
- Sprint 간 순차 전환 (S01 → S02 → S03)
- 80% 규칙: 이전 Sprint 80% 완료 시 다음 준비

### 3. Milestone 전환
- planning → active → completed
- 모든 Sprint 완료 시 Milestone 완료
- 다음 Milestone은 수동 시작 (리뷰 필요)

## 실행 프로세스

### 1. 현재 상태 분석

**전환 가능성 확인:**
```javascript
const transitionAnalysis = {
  currentState: getCurrentState(),
  completionStatus: checkCompletion(),
  nextStageReady: checkNextStageReadiness(),
  blockingIssues: findBlockers()
};
```

### 2. Sprint 완료 전환

**Sprint 완료 시 실행 프로세스:**

#### 2.1 완료 조건 검증
```markdown
✅ Sprint 완료 체크리스트:
- [ ] 모든 필수 Task 완료 (required: true)
- [ ] 테스트 통과율 80% 이상
- [ ] 코드 리뷰 완료
- [ ] 문서 업데이트 완료
- [ ] Sprint 목표 달성
```

#### 2.2 Sprint 종료 작업
```markdown
## Sprint S02 종료 프로세스

1. **성과 요약 생성**
   - 완료된 Task: 5/5
   - 주요 성과: API 구현, 인증 시스템
   - 미해결 이슈: 성능 최적화 필요

2. **Sprint 리뷰 문서**
   - 파일: .aiwf/10_STATE_OF_PROJECT/S02_review.md
   - 내용: 성과, 교훈, 개선점

3. **아카이빙**
   - Sprint 상태: active → completed
   - 완료 날짜 기록
   - 실제 소요 시간 계산
```

#### 2.3 다음 Sprint 준비
```markdown
## Sprint S03 준비 프로세스

1. **전제 조건 확인**
   - S02 완료 상태 ✓
   - S03 폴더 존재 ✓
   - Sprint 메타 파일 확인

2. **초기 설정**
   - S03 상태: planning → active
   - 시작 날짜 설정
   - 목표 기간 설정

3. **Task 생성 필요성 판단**
   - 기존 Task 있음: 검토 및 조정
   - Task 없음: 생성 프로세스 시작
   
4. **리소스 할당**
   - 담당자 배정
   - 우선순위 설정
   - 의존성 매핑
```

### 3. Milestone 완료 전환

**Milestone 완료 시 실행 프로세스:**

#### 3.1 완료 조건 검증
```markdown
✅ Milestone 완료 체크리스트:
- [ ] 모든 Sprint 완료 (3/3)
- [ ] Milestone 목표 달성
- [ ] 비즈니스 가치 검증
- [ ] 품질 기준 충족
- [ ] 이해관계자 승인
```

#### 3.2 Milestone 종료 작업
```markdown
## Milestone M01 종료 프로세스

1. **최종 성과 보고서**
   - 달성 목표: 기본 인증 시스템 구축
   - 완료 Sprint: S01, S02, S03
   - 총 Task: 15개 완료
   - 소요 기간: 6주

2. **회고 및 교훈**
   - 잘된 점: 체계적 진행
   - 개선점: 초기 계획 정확도
   - 다음 적용: 버퍼 시간 추가

3. **산출물 정리**
   - 코드: 15개 모듈
   - 문서: API 문서, 사용자 가이드
   - 테스트: 단위/통합 테스트
```

#### 3.3 다음 Milestone 준비
```markdown
## Milestone M02 준비 프로세스

1. **의존성 확인**
   - M01 완료 필수 ✓
   - 필요 리소스 확보
   - 팀 준비 상태

2. **초기 계획**
   - 목표 설정
   - Sprint 구성 (S04, S05, S06)
   - 예상 기간 산정

3. **킥오프 준비**
   - 이해관계자 미팅
   - 요구사항 확정
   - 초기 Task 정의
```

### 4. 자동화 액션 실행

**전환 시 자동 실행되는 작업:**

```javascript
// Sprint 완료 시
const sprintCompletionActions = [
  "generateSprintReport()",
  "archiveCompletedTasks()",
  "updateMilestoneProgress()",
  "activateNextSprint()",
  "notifyStakeholders()",
  "createCheckpoint()"
];

// Milestone 완료 시
const milestoneCompletionActions = [
  "generateMilestoneReport()",
  "conductRetrospective()",
  "archiveMilestone()",
  "prepareNextMilestone()",
  "updateProjectDashboard()",
  "triggerCelebration()"
];
```

### 5. 전환 검증 및 롤백

**안전한 전환을 위한 검증:**

```markdown
## 전환 검증

### 사전 검증
- [ ] 모든 필수 조건 충족
- [ ] 데이터 일관성 확인
- [ ] 백업 생성

### 전환 실행
- [ ] 상태 변경
- [ ] 자동화 액션 실행
- [ ] 알림 발송

### 사후 검증
- [ ] 새 상태 확인
- [ ] 시스템 안정성
- [ ] 롤백 준비

### 롤백 (필요시)
- 이전 상태 복원
- 실행된 액션 되돌리기
- 원인 분석 및 재시도
```

## 출력 형식

### Sprint 전환 성공
```
🔄 Sprint 전환 프로세스 시작...

✅ S02 완료 검증:
- 필수 Task: 5/5 완료 ✓
- 테스트 통과: 92% ✓
- Sprint 목표 달성 ✓

📊 S02 최종 성과:
- 완료 Task: 5
- 총 소요 시간: 40시간
- 팀 효율성: 110%

🚀 S03 활성화:
- 상태: planning → active
- Task 준비: 3개 생성 필요
- 예상 기간: 2주

✅ Sprint 전환 완료!
다음 액션: /aiwf:create_sprint_tasks S03
```

### Milestone 전환 성공
```
🎯 Milestone 전환 프로세스 시작...

✅ M01 완료 검증:
- Sprint 완료: 3/3 ✓
- 목표 달성: 인증 시스템 구축 ✓
- 품질 검증: 통과 ✓

📊 M01 최종 성과:
- 기간: 6주 (계획 대비 -1주)
- 완료 Task: 15
- 비즈니스 가치: 높음

🎉 M01 성공적으로 완료!

📋 M02 준비 상태:
- 목표: 고급 기능 구현
- 계획 Sprint: 3개
- 예상 기간: 8주

💡 권장: M01 회고 실시 후 M02 시작
```

## 사용 시나리오

### 1. Sprint 완료 시
```bash
# Sprint 완료 확인
/aiwf:check_state
# S02: 100% 완료 확인

# Sprint 전환 실행
/aiwf:transition sprint S02
# → 자동으로 S02 종료, S03 활성화
```

### 2. Milestone 완료 시
```bash
# Milestone 상태 확인
/aiwf:project_status
# M01: 모든 Sprint 완료 확인

# Milestone 전환
/aiwf:transition milestone M01
# → M01 종료, M02 준비
```

### 3. 강제 전환 (예외 상황)
```bash
# 강제 전환 (주의 필요)
/aiwf:transition sprint S02 --force
# → 완료 조건 무시하고 전환
# ⚠️ 경고 메시지 표시
```

## 주의사항

- 전환은 되돌리기 어려우므로 신중히 실행
- 강제 전환은 예외적인 경우에만 사용
- 모든 전환은 로그에 기록됨
- 자동 전환 시에도 결과 확인 필요

## 관련 명령어

- `/aiwf:workflow_context` - 현재 워크플로우 상태 확인
- `/aiwf:validate_workflow` - 워크플로우 일관성 검증
- `/aiwf:create_sprint_tasks` - Sprint Task 생성
- `/aiwf:milestone_review` - Milestone 리뷰

이 명령어는 프로젝트가 체계적으로 진행되고, 각 단계가 올바르게 완료되었을 때만 다음 단계로 넘어갈 수 있도록 보장합니다.