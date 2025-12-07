---
description: Configure and execute YOLO mode for autonomous task execution
---

# YOLO 모드 - AIWF의 핵심 자율 실행 시스템

**YOLO는 AIWF의 심장입니다** - 단순한 기능이 아니라 존재 이유입니다.
이 모드는 오버엔지니어링을 방지하고 요구사항에 집중하는 지능적 자율 실행을 수행합니다.
사용자 상호작용 없이 실행되지만, 중요한 단계에서는 체크포인트와 복구 기능을 제공합니다.

## 📑 목차 (Table of Contents)

### 🎯 핵심 섹션
- [모드 선택](#모드-선택) - 실행 모드 결정
- [초기화 및 상태 확인](#초기화-및-상태-확인) - YOLO 세션 시작
- [워크플로우 기반 지능적 작업 찾기](#워크플로우-기반-지능적-작업-찾기) - 태스크 선택 알고리즘
- [워크플로우 기반 지능적 태스크 실행](#워크플로우-기반-지능적-태스크-실행) - 태스크 수행
- [워크플로우 기반 스마트 커밋 및 체크포인트 관리](#워크플로우-기반-스마트-커밋-및-체크포인트-관리) - 진행 상황 저장

### 🚀 고급 기능
- [독립 스프린트 생성 및 실행](#독립-스프린트-생성-및-실행-new) - 빠른 스프린트 모드
- [마일스톤 변경 감지 및 처리](#마일스톤-변경-감지-및-처리) - 적응적 계획 조정
- [워크플로우 기반 적응적 스프린트 관리](#워크플로우-기반-적응적-스프린트-관리) - 80% 규칙
- [ADR 자동 관리](#📋-adr-architecture-decision-record-자동-관리) - 아키텍처 결정 추적

### 🔄 실행 루프
- [연속 실행 루프](#연속-실행-루프) - 메인 실행 사이클
- [프로젝트 리뷰 실행](#프로젝트-리뷰-실행) - 품질 검증
- [계속 확인](#계속-확인) - 다음 작업 결정
- [요약 생성](#요약-생성) - 세션 종료 및 보고

**핵심 원칙 (YOLO 중심):**
- **요구사항 우선**: 명시된 요구사항만 구현 (requirement_first)
- **간단한 해결책**: 복잡한 솔루션보다 단순한 솔루션 선호 (simple_solution)
- **골드 플레이팅 금지**: 필요 이상의 기능 추가 방지 (no_gold_plating)
- **트랙 유지**: 원래 목표에서 벗어나지 않음 (stay_on_track)
- **독립 스프린트**: 마일스톤 없이도 빠른 실행 가능
- **체크포인트 복구**: 중단 시 안전한 복구 보장

**오버엔지니어링 방지 시스템:**
- 파일 크기 제한 (300줄), 함수 크기 제한 (50줄), 중첩 깊이 제한 (4레벨)
- 디자인 패턴 과용 방지, YAGNI 원칙 강제 적용
- 실시간 복잡도 모니터링 및 피드백

## 모드 선택

<$ARGUMENTS> 확인:

### 🚀 독립 스프린트 모드 (NEW!)
- `--create-independent`: 독립 스프린트를 생성하고 즉시 실행
- `--from-readme`: README TODO를 추출하여 독립 스프린트 생성
- `--from-issue N`: GitHub 이슈 #N을 기반으로 독립 스프린트 생성
- `--minimal`: 최소 엔지니어링 레벨로 설정
- `--balanced`: 균형 엔지니어링 레벨로 설정
- `--complete`: 완전 엔지니어링 레벨로 설정

### 기존 실행 모드
- 스프린트 ID가 제공된 경우 (예: S03): 해당 스프린트에서만 작업
- `sprint-all`이 제공된 경우: 완료될 때까지 모든 스프린트를 순차적으로 실행
- `milestone-all`이 제공된 경우: 완료될 때까지 모든 마일스톤(모든 스프린트 포함) 실행
- `worktree`가 제공된 경우: 워크트리 모드 사용 (브랜치 생성 없이 직접 푸시)
- 비어있는 경우: 일반 태스크를 먼저 작업한 후 활성 스프린트 태스크 작업

**사용자에게 모드 보고!**

## 안전 가이드라인

- 중요한 파일(.env, alembic 마이그레이션, 프로덕션 설정)을 **절대** 수정하지 마세요
- 데이터베이스 스키마 변경이 발생하면 **중단**하세요
- 5개 이상의 파일을 삭제해야 하는 경우 **중단**하세요
- 변경 후 테스트가 실패하면 **중단**하세요
- 태스크 구현 후 **항상** 테스트를 실행하세요

## 정확한 프로세스를 따르세요

이 프로세스를 고수하고 **정확히** 따라야 합니다

## 초기화 및 상태 확인

> **💡 Anthropic Long-Running Agent Pattern 통합**
> YOLO 모드는 `/aiwf:session-start` 명령어와 함께 사용할 수 있습니다.
> session-start가 기본 환경 설정을 완료한 후 YOLO로 자율 실행을 시작하면 더욱 효과적입니다.
> 또한 `work-loop-agent`의 자율 실행 패턴과 유사하게 동작하며,
> 장시간 세션에서 `aiwf-progress.md`를 통해 세션 간 컨텍스트를 유지합니다.

시작하기 전에:

1. **시간 기록**: 시스템에서 현재 datetime 스탬프를 가져와서 기억

2. **YOLO 설정 확인 및 초기화**:
   ```bash
   # YOLO 설정 파일이 있는지 확인
   if [[ ! -f ".aiwf/yolo-config.yaml" ]]; then
     echo "🔧 YOLO 설정 파일 생성 중..."
     # CLI 명령어로 초기화 (오버엔지니어링 방지 설정 포함)
     aiwf guard init
   fi
   
   # 설정 파일 내용 확인
   cat .aiwf/yolo-config.yaml | grep "engineering_level\|focus_rules" -A 5
   ```

3. **체크포인트 매니저 초기화**:
   ```bash
   # 체크포인트 디렉토리 확인 및 생성
   mkdir -p .aiwf/checkpoints

   # CLI로 현재 세션 상태 확인
   aiwf checkpoint status

   # 이전 세션이 있는지 확인하고 체크포인트 목록 보기
   if [[ -f ".aiwf/yolo-state.json" ]]; then
     echo "📊 이전 YOLO 세션 발견. 체크포인트 목록:"
     aiwf checkpoint list --limit 5
     # 필요시 복구: aiwf checkpoint restore <checkpoint-id>
   fi

   # Anthropic Long-Running Agent Pattern: 진행 파일 확인/생성
   if [[ -f ".aiwf/aiwf-progress.md" ]]; then
     echo "📋 이전 세션 진행 파일 발견. 컨텍스트 복원 중..."
     cat .aiwf/aiwf-progress.md | head -50
   else
     echo "📝 새 진행 파일 생성 중..."
     # 진행 파일 템플릿에서 생성
     cp .aiwf/99_TEMPLATES/aiwf-progress-template.md .aiwf/aiwf-progress.md 2>/dev/null || true
   fi
   ```

4. **오버엔지니어링 가드 활성화**:
   ```bash
   # CLI로 프로젝트 초기 복잡도 측정
   echo "🛡️ 프로젝트 복잡도 초기 상태 검사 중..."
   aiwf guard check . --config .aiwf/yolo-config.yaml
   
   # 빠른 체크가 필요한 경우
   # aiwf guard quick .
   ```

5. **상태 인덱스 초기화**:
   ```bash
   # 상태 인덱스 초기화 또는 업데이트
   aiwf state update
   # 현재 워크플로우 컨텍스트 확인
   aiwf state show
   ```

6. **테스트 기준선**: test.md 명령(@.claude/commands/aiwf/aiwf_test.md)을 사용하여 깨끗한 기준선 확인
   - **만약** 실패율이 10%를 초과하면 수정 가능성 평가 후 진행

7. **Git 상태 확인**: 깨끗한 작업 디렉토리 보장
   - **만약** git 상태가 깨끗하지 않다면 기록 후 진행

8. **독립 스프린트 처리**: `--create-independent`, `--from-readme`, `--from-issue` 플래그 확인
   - 해당 플래그가 있으면 독립 스프린트 생성 후 즉시 실행 모드로 전환

9. **마일스톤 변경 감지**: 이전 실행과 비교하여 마일스톤 변경 확인

10. **인수 분석**: <$ARGUMENTS> 고려하여 실행 모드 결정

## 독립 스프린트 생성 및 실행 (NEW!)

**독립 스프린트 플래그가 감지된 경우:**

### 1. 독립 스프린트 자동 생성
```bash
# --from-readme 플래그가 있는 경우
if [[ "$ARGUMENTS" == *"--from-readme"* ]]; then
  echo "📋 README에서 TODO 추출하여 독립 스프린트 생성 중..."
  aiwf sprint independent --from-readme --minimal
fi

# --from-issue N 플래그가 있는 경우
if [[ "$ARGUMENTS" =~ --from-issue[[:space:]]+([0-9]+) ]]; then
  ISSUE_NUMBER="${BASH_REMATCH[1]}"
  echo "🔗 GitHub 이슈 #$ISSUE_NUMBER 기반 독립 스프린트 생성 중..."
  aiwf sprint independent --from-issue "$ISSUE_NUMBER" --minimal
fi

# --create-independent 플래그가 있는 경우
if [[ "$ARGUMENTS" == *"--create-independent"* ]]; then
  echo "🚀 인터랙티브 독립 스프린트 생성 중..."
  aiwf sprint independent --minimal
fi
```

### 2. 엔지니어링 레벨 설정
```bash
# 엔지니어링 레벨 플래그 확인
ENGINEERING_LEVEL="minimal"  # 기본값
if [[ "$ARGUMENTS" == *"--balanced"* ]]; then
  ENGINEERING_LEVEL="balanced"
elif [[ "$ARGUMENTS" == *"--complete"* ]]; then
  ENGINEERING_LEVEL="complete"
fi

# YOLO 설정에 엔지니어링 레벨 적용
sed -i "s/engineering_level: .*/engineering_level: $ENGINEERING_LEVEL/" .aiwf/yolo-config.yaml
echo "🔧 엔지니어링 레벨을 '$ENGINEERING_LEVEL'로 설정했습니다."
```

### 3. 체크포인트 세션 시작
```bash
# 독립 스프린트 실행을 위한 체크포인트 세션 시작
CREATED_SPRINT_ID=$(ls .aiwf/03_SPRINTS/ | grep "^S" | sort | tail -1 | cut -d'_' -f1)
echo "📊 체크포인트 세션 시작: $CREATED_SPRINT_ID"

# CLI로 체크포인트 생성 (독립 스프린트 시작)
aiwf checkpoint create "session_start" \
  --message "독립 스프린트 $CREATED_SPRINT_ID 시작" \
  --meta '{"sprint_id": "'$CREATED_SPRINT_ID'", "type": "independent-sprint"}'

echo '✅ 독립 스프린트 체크포인트 세션 시작됨'
```

### 4. 오버엔지니어링 가드 활성화
```bash
# 독립 스프린트 전용 오버엔지니어링 가드 설정
echo "🛡️ 오버엔지니어링 방지 가드 활성화 중..."
echo "  - 요구사항 우선 모드: ON"
echo "  - 간단한 해결책 선호: ON"  
echo "  - 골드 플레이팅 방지: ON"
echo "  - 트랙 유지 강제: ON"

# CLI로 복잡도 초기 상태 확인
aiwf guard quick .
```

### 5. 독립 스프린트 실행으로 전환
- 생성된 스프린트 ID를 사용하여 즉시 실행 모드로 전환
- `### 워크플로우 기반 지능적 작업 찾기`로 이동
- 독립 스프린트 모드에서는 해당 스프린트 태스크만 실행

## 마일스톤 변경 감지 및 처리

[🔝 목차로 돌아가기](#📑-목차-table-of-contents)

**마일스톤 변경이 감지된 경우:**

1. **현재 작업 정리**:
   - 진행 중인 모든 작업 커밋 및 푸시
   - 현재 상태 저장

2. **마일스톤 계획 수립**:
   - **서브에이전트 사용**하여 새 마일스톤 분석을 위해 @.claude/commands/aiwf/aiwf_analyze_milestone.md 포함
   - 전체 마일스톤 구조 및 목표 파악
   - 고수준 계획 수립

3. **첫 스프린트 생성**:
   - **중요**: 첫 번째 스프린트만 생성 (전체 스프린트 미리 생성 금지)
   - **서브에이전트 사용**하여 첫 스프린트 생성을 위해 @.claude/commands/aiwf/aiwf_create_sprint_tasks.md 포함

4. **사용자 알림 및 리뷰**:
   - 마일스톤 변경 및 계획 완료 알림
   - 전체 커밋 및 푸시
   - 리뷰 요청 및 승인 대기

5. **실행 시작**: `### 열린 작업 찾기`로 이동

### 워크플로우 기반 지능적 작업 찾기

**1단계: 워크플로우 상태 분석**
```bash
# 워크플로우 검증 실행
aiwf state validate

# 다음 작업 추천 받기
aiwf state next
```

**2단계: 모드별 실행 전략**

**인수에 스프린트 ID가 제공된 경우:**
- 지정된 스프린트 범위 내에서 워크플로우 기반 태스크 선택
- 스프린트 내 우선순위 순서로 태스크 실행
- 의존성 확인 후 차단되지 않은 태스크만 선택

**인수에 `sprint-all`이 있는 경우:**
- **적응적 스프린트 관리** 모드
- 각 스프린트 80% 완료 시 다음 스프린트 동적 생성
- 워크플로우 규칙 기반 전환 조건 확인

**인수에 `milestone-all`이 있는 경우:**
- **적응적 마일스톤 관리** 모드  
- 마일스톤별 워크플로우 규칙 적용
- 전환 시점에서 자동 리뷰 및 승인 프로세스

**인수가 없는 경우 (워크플로우 최적화 모드):**
- **AI 의사결정 엔진** 활용
- 우선순위 매트릭스 기반 최적 태스크 선택:
  1. 진행 중인 태스크 (연속성 보장)
  2. 높은 우선순위 점수 태스크 (80+ 점수)
  3. 블로킹 해제 효과가 큰 태스크
  4. 병렬 작업이 가능한 태스크

**3단계: 지능적 태스크 선택 알고리즘**

```bash
# 워크플로우 기반 태스크 추천 로드
NEXT_ACTIONS=$(aiwf state next --format=json)
```

**선택 우선순위:**
1. **연속성 우선**: 진행 중인 태스크 (in_progress)
2. **우선순위 점수**: 70점 이상 high, 40-69점 medium, 40점 미만 low
3. **의존성 해제**: 다른 태스크를 차단하는 수 (blocks 배열 길이)
4. **병렬 작업**: 의존성 충돌이 없는 독립적 태스크

**자동 선택 로직:**
```
FOR each recommended_action in NEXT_ACTIONS:
  IF action.priority != 'blocked' AND 
     action.task_id not in ATTEMPTED_TASKS AND
     action.score >= MINIMUM_SCORE:
    SELECT action.task_id
    BREAK
```

**실패 안전장치:**
- 워크플로우 추천이 없으면 기존 방식으로 폴백
- 모든 추천 태스크가 차단되면 일반 태스크로 전환
- 순환 참조나 교착 상태 감지 시 수동 개입 요청

### 워크플로우 기반 적응적 스프린트 관리

**1단계: 스프린트 완료 조건 워크플로우 검증**
```bash
# 현재 스프린트 완료율 확인
aiwf state show | grep "completion_rate"

# 80% 규칙 확인
aiwf state validate | grep "SPRINT_PREPARATION"
```

**2단계: 적응적 전환 결정 매트릭스**

**80% 완료 시 (다음 스프린트 준비):**
1. **현재 스프린트 분석**:
   - 완료된 작업들의 실제 구현 결과 분석
   - 변경된 아키텍처나 설계 결정사항 파악
   - 예상과 다른 구현 결과 식별
   - **의존성 체인 재분석**: 
     ```bash
     aiwf state validate --focus=dependencies
     ```

2. **워크플로우 규칙 기반 전환 평가**:
   - 전환 조건 충족 여부 확인 (transition_rules.sprint_to_sprint)
   - 리스크 허용도 평가 (ai_behavior.risk_tolerance)
   - 자동 승인 vs 수동 리뷰 결정

3. **지능적 다음 스프린트 계획**:
   - **AI 의사결정 엔진** 활용:
     ```bash
     # 다음 스프린트 우선순위 계산
     aiwf state next --mode=sprint-planning --current-progress=80
     ```
   - 실제 구현 결과를 반영하여 계획 수정
   - 새로운 의존성이나 전제조건 동적 적용
   - 블로킹 해제된 태스크 우선순위 재계산

**3단계: 워크플로우 승인 기반 스프린트 생성**

**자동 승인 조건** (workflow_rules.transition_rules.sprint_to_sprint):
- current_80_percent: ✓
- next_planned: 계획 존재
- no_critical_blockers: 치명적 차단 없음
- risk_tolerance: conservative 모드에서 허용 범위

**수동 승인 필요 시**:
- 아키텍처 결정 변경 감지
- 의존성 순환 또는 복잡한 차단 상황
- 예상 일정 대비 20% 이상 지연

**스프린트 생성 실행**:
```bash
# 워크플로우 규칙 확인
if [[ $(aiwf state validate --check=sprint-transition) == "approved" ]]; then
  # 자동 생성
  @.claude/commands/aiwf/aiwf_create_sprint_tasks.md
else
  # 수동 승인 요청
  echo "⚠️ Manual approval required for sprint transition"
  echo "Reason: [detected issues]"
  echo "Continue? (y/n)"
fi
```

**4단계: 적응적 태스크 우선순위 조정**

**새 스프린트 태스크 생성 시**:
- 이전 스프린트 학습 반영
- 실제 구현 시간 vs 예상 시간 패턴 적용
- 팀 속도(velocity) 자동 조정
- 의존성 최적화 (병렬 작업 극대화)

**상태 인덱스 실시간 업데이트**:
```bash
# 새 스프린트 반영
aiwf state update

# 우선순위 재계산
aiwf state next --recalculate-priorities

# 워크플로우 재검증
aiwf state validate
```

**5단계: 연속 실행 준비**
- 새 스프린트 태스크가 생성되면 `### 워크플로우 기반 지능적 작업 찾기`로 복귀
- 적응적 우선순위 기반으로 최적 태스크 자동 선택
- 실행 전 의존성 재확인

### 워크플로우 기반 지능적 태스크 실행

**1단계: 태스크 실행 전 워크플로우 검증**
```bash
# 선택된 태스크의 실행 조건 재검증
aiwf state validate --task={task_id}

# 의존성 충족 여부 확인
aiwf state show --focus={task_id} --check-dependencies
```

**2단계: 실행 전 조건부 확인**
- **실행 이력 확인**: 이전에 시도한 태스크는 건너뛰기 (OUTPUT LOG 확인)
- **상태 유효성**: 태스크가 여전히 실행 가능한 상태인지 확인
- **의존성 재확인**: 다른 태스크 완료로 인한 차단 해제 확인
- **병렬 작업 충돌**: 동시 실행 중인 태스크와의 리소스 충돌 확인

**3단계: 지능적 실행 준비**
- **브랜치 전략**:
  ```bash
  # 워크트리 모드가 아닌 경우
  if [[ "$ARGUMENTS" != *"worktree"* ]]; then
    git checkout -b task/{task_id}
  fi
  ```

- **상태 포커스 설정**:
  ```bash
  # AI 컨텍스트 동기화
  aiwf state focus {task_id}
  
  # 작업 시작 타임스탬프 기록
  aiwf state update --start-work={task_id}
  ```

- **의존성 상태 동결**: 실행 중 의존성 변경 방지를 위한 스냅샷 생성

**4단계: 워크플로우 통합 태스크 실행 (오버엔지니어링 방지 강화)**

**🛡️ 태스크 시작 전 오버엔지니어링 가드 체크**:
```bash
# 태스크 시작 시 체크포인트 생성
aiwf checkpoint create "task_start" \
  --message "태스크 ${task_id} 시작" \
  --meta '{"task_id": "'${task_id}'", "engineering_level": "minimal"}'

# 오버엔지니어링 가드 사전 체크
aiwf guard feedback "task_${task_id}"

# 빠른 복잡도 체크
aiwf guard quick .
```

**스마트 태스크 실행 (YOLO 최적화 with Subagents)**:

- **전문 서브에이전트 활용 전략**:
  ```
  태스크 유형 분석 → 적절한 서브에이전트 선택 → 병렬 실행
  ```

- **서브에이전트 자동 선택 로직**:
  ```bash
  # 태스크 유형에 따라 적절한 서브에이전트 선택
  TASK_TYPE=$(grep -E "type:|category:" "${TASK_FILE}" | head -1 | cut -d: -f2 | xargs)
  
  case "$TASK_TYPE" in
    "frontend"|"ui"|"react")
      echo "🎨 프론트엔드 태스크 감지 → react-ai-frontend-developer 서브에이전트 활용"
      SUBAGENT_TYPE="react-ai-frontend-developer"
      ;;
    "backend"|"api"|"nestjs")
      echo "⚙️ 백엔드 태스크 감지 → nestjs-backend-specialist 서브에이전트 활용"
      SUBAGENT_TYPE="nestjs-backend-specialist"
      ;;
    "architecture"|"design")
      echo "🏗️ 아키텍처 태스크 감지 → backend-clean-architect 서브에이전트 활용"
      SUBAGENT_TYPE="backend-clean-architect"
      ;;
    "aws"|"lambda"|"serverless")
      echo "☁️ AWS 태스크 감지 → aws-serverless-architect 서브에이전트 활용"
      SUBAGENT_TYPE="aws-serverless-architect"
      ;;
    "data"|"analytics"|"bigquery")
      echo "📊 데이터 태스크 감지 → data-analyst 서브에이전트 활용"
      SUBAGENT_TYPE="data-analyst"
      ;;
    "security"|"vulnerability")
      echo "🔒 보안 태스크 감지 → security-vulnerability-scanner 서브에이전트 활용"
      SUBAGENT_TYPE="security-vulnerability-scanner"
      ;;
    "debug"|"error"|"issue")
      echo "🐛 디버깅 태스크 감지 → debug-specialist 서브에이전트 활용"
      SUBAGENT_TYPE="debug-specialist"
      ;;
    *)
      echo "🤖 일반 태스크 → general-purpose 서브에이전트 활용"
      SUBAGENT_TYPE="general-purpose"
      ;;
  esac
  ```

- **서브에이전트 병렬 실행**: 
  - Task 도구로 전문 서브에이전트 실행
  - 각 서브에이전트가 특화된 영역 처리
  - 결과 통합하여 최적 솔루션 도출

- **오버엔지니어링 방지 규칙 적용**: 
  - 파일 크기 300줄 이하 유지
  - 함수 크기 50줄 이하 유지
  - 중첩 깊이 4레벨 이하 유지
  - YAGNI 원칙 강제 적용

- **서브에이전트 실행 예시**:
  ```
  # React 컴포넌트 개발 태스크
  Task 도구로 react-ai-frontend-developer 서브에이전트 실행:
  - Firebase 인증 통합
  - TypeScript 타입 안전성 보장
  - 테스트 코드 작성
  
  # NestJS API 개발 태스크  
  Task 도구로 nestjs-backend-specialist 서브에이전트 실행:
  - RESTful API 엔드포인트 구현
  - 인증 가드 설정
  - BigQuery 통합
  ```

- 기존 aiwf_do_task.md 대신 워크플로우 인식 버전 활용
- 실행 중 실시간 상태 모니터링

**실행 중 지능적 모니터링 (복잡도 추적 포함)**:
```bash
# 1분마다 복잡도 체크 (백그라운드)
while task_in_progress; do
  sleep 60
  
  # CLI로 오버엔지니어링 가드 실시간 체크
  aiwf guard quick . 2>/dev/null
  
  # 상태 업데이트
  aiwf state update --silent
  check_blocking_conflicts
done
```

**5단계: 실행 후 워크플로우 통합 검증 (오버엔지니어링 방지 검증 포함)**

**🛡️ 오버엔지니어링 방지 최종 검증**:
```bash
# 태스크 완료 후 복잡도 체크
echo "🔍 태스크 완료 후 오버엔지니어링 검증 중..."

# CLI로 복잡도 최종 검사
aiwf guard check . --config .aiwf/yolo-config.yaml

# 체크포인트 생성 (태스크 완료)
aiwf checkpoint create "task_complete" \
  --message "태스크 ${task_id} 완료" \
  --meta '{"task_id": "'${task_id}'", "complexity_check": "passed", "engineering_level": "minimal"}'

echo '📊 태스크 완료 체크포인트 생성됨'
```

**🔄 Anthropic Long-Running Agent Pattern: 자동화된 검증 (verify-task.sh)**:
```bash
# 표준화된 검증 훅 실행 (테스트, 타입체크, 린트, 빌드)
echo "🔬 verify-task.sh 자동 검증 실행 중..."
VERIFY_RESULT=$(./hooks/verify-task.sh 2>&1)

if [[ "$VERIFY_RESULT" == *"VERIFICATION_PASSED"* ]]; then
  echo "✅ 검증 통과 - passes.status를 true로 업데이트"
  # 태스크 파일의 passes.status 업데이트
  sed -i 's/passes:\s*false/passes: true/' "${TASK_FILE}" 2>/dev/null || true

  # aiwf-progress.md 업데이트
  echo "- [$(date +%Y-%m-%d\ %H:%M)] ✅ ${task_id} 검증 통과" >> .aiwf/aiwf-progress.md
else
  echo "❌ 검증 실패 - 전문 에이전트 호출 필요"

  # 실패 유형에 따른 전문 에이전트 자동 선택
  if [[ "$VERIFY_RESULT" == *"BUILD_FAILED"* ]]; then
    if [[ "$TASK_TYPE" =~ (frontend|react) ]]; then
      echo "🔧 react-build-fixer 에이전트 호출..."
      # Task 도구로 react-build-fixer 서브에이전트 실행
    elif [[ "$TASK_TYPE" =~ (backend|api|nestjs) ]]; then
      echo "🔧 backend-build-fixer 에이전트 호출..."
      # Task 도구로 backend-build-fixer 서브에이전트 실행
    fi
  elif [[ "$VERIFY_RESULT" == *"TEST_FAILED"* ]]; then
    echo "🐛 debug-specialist 에이전트 호출..."
    # Task 도구로 debug-specialist 서브에이전트 실행
  fi

  # 실패 기록
  echo "- [$(date +%Y-%m-%d\ %H:%M)] ❌ ${task_id} 검증 실패: ${VERIFY_RESULT}" >> .aiwf/aiwf-progress.md
fi
```

**완료 검증 (전문 서브에이전트 활용)**:

**🔍 최종 품질 검증 프로세스:**

1. **자동 테스트 실행:**
   ```
   # 태스크 유형에 따른 테스트 전략
   if [[ "$TASK_TYPE" =~ (frontend|react) ]]; then
     echo "🎨 프론트엔드 테스트 실행"
     Task 도구로 react-ai-frontend-developer 서브에이전트 실행:
     - 컴포넌트 테스트, 스냅샷 테스트, E2E 테스트
   elif [[ "$TASK_TYPE" =~ (backend|api) ]]; then
     echo "⚙️ 백엔드 테스트 실행"
     Task 도구로 nestjs-backend-specialist 서브에이전트 실행:
     - 유닛 테스트, 통합 테스트, API 테스트
   fi
   ```

2. **보안 최종 검증:**
   ```
   # 보안이 중요한 코드 변경사항이 있는 경우
   Task 도구로 security-vulnerability-scanner 서브에이전트 실행:
   - 최종 보안 스캔
   - 새로운 취약점 확인
   - 보안 정책 준수 검증
   ```

3. **문서화 자동 업데이트:**
   ```
   # 코드 변경사항에 대한 문서 업데이트 필요 확인
   Task 도구로 technical-documentation-writer 서브에이전트 실행:
   - API 문서 업데이트
   - README 변경사항 반영
   - 기술 가이드 최신화
   ```

4. **워크플로우 기반 품질 검증:**
   ```bash
   # 워크플로우 일관성 재확인
   aiwf state validate --post-task={task_id}
   
   # 다음 태스크들 차단 해제 확인
   aiwf state next --check-unblocked
   ```

**지능적 오류 처리**:
- **치명적 오류 감지**: 
  - AI 의사결정으로 수정 가능성 평가
  - 자동 수정 시도 vs 수동 개입 요청 결정
- **비치명적 오류**: 
  - 워크플로우 진행에 미치는 영향 평가
  - 후속 태스크에 대한 리스크 계산
- **학습 반영**: 오류 패턴을 향후 우선순위 계산에 반영

**6단계: 적응적 다음 작업 준비**

**성공 시 자동 전환**:
```bash
# 태스크 완료 처리
aiwf state complete {task_id}

# 워크플로우 기반 다음 작업 계산
NEXT_TASK=$(aiwf state next --auto-select --exclude-attempted)

# 즉시 다음 작업으로 전환 (연속 실행)
if [[ -n "$NEXT_TASK" ]]; then
  echo "🚀 Auto-transitioning to next priority task: $NEXT_TASK"
  # 다음 태스크로 즉시 진행
fi
```

**실패 시 적응적 대응**:
- 차단된 태스크를 다른 태스크로 자동 교체
- 의존성 체인 재분석으로 우선순위 재계산
- 병렬 작업 기회 재탐색

### 워크플로우 기반 스마트 커밋 및 체크포인트 관리

**1단계: 워크플로우 사전 검증**
```bash
# 커밋 전 워크플로우 상태 확인
aiwf state validate --pre-commit

# 완료된 태스크의 후속 태스크 차단 해제 확인
aiwf state next --check-unblocked={task_id}
```

**2단계: 지능적 일반 태스크 커밋**

**커밋 조건 평가 (워크플로우 기반):**
- **오직** 테스트가 통과하고 치명적 문제가 없는 경우에만
- **워크플로우 일관성 검증**: 완료된 태스크가 다른 태스크를 차단하지 않는지 확인
- **의존성 체인 영향 분석**: 완료가 후속 작업에 미치는 영향 계산

**스마트 커밋 실행:**
```bash
# 워크플로우 통합 커밋 (기존 aiwf_commit.md 대신)
@.claude/commands/aiwf/aiwf_smart_complete.md {task_id} YOLO

# 커밋 후 상태 동기화
aiwf state complete {task_id}
aiwf state update
```

**커밋 성공 시 적응적 처리:**
- **만약** 인수에 `worktree`가 없다면: main으로 병합 후 워크플로우 업데이트
  ```bash
  git checkout main && git merge task/<task-id>
  aiwf state update  # 병합 후 상태 재계산
  ```
- **만약** 인수에 `worktree`가 있다면: 직접 푸시 후 상태 업데이트
  ```bash
  git push
  aiwf state update
  ```

**커밋 실패 시 적응적 대응:**
- OUTPUT LOG에 문제 기록
- **워크플로우 기반 대안 탐색**:
  ```bash
  # 대안 태스크 추천 받기
  ALTERNATIVE_TASKS=$(aiwf state next --exclude={failed_task_id} --auto-select)
  echo "🔄 Switching to alternative task: $ALTERNATIVE_TASKS"
  ```

**3단계: 워크플로우 기반 적응적 스프린트 체크포인트**

**스프린트 완료 조건 재검증:**
```bash
# 스프린트 완료율 확인 (80% → 100% 전환)
aiwf state show | grep "sprint_completion"

# 워크플로우 일관성 최종 확인
aiwf state validate --focus=sprint-completion
```

**지능적 스프린트 완료 처리:**
- **상태 인덱스 실시간 업데이트**:
  ```bash
  # 전체 상태 업데이트
  aiwf state update
  
  # 다음 스프린트 준비 상태 확인
  aiwf state next --mode=sprint-transition
  
  # 차단 해제된 태스크 식별
  aiwf state next --check-unblocked
  ```
  
- **워크플로우 승인 기반 전체 스프린트 커밋**:
  ```bash
  # 스프린트 레벨 상태 일관성 확인
  if [[ $(aiwf state validate --check=sprint-consistency) == "passed" ]]; then
    # 자동 커밋 및 푸시
    git add -A
    git commit -m "✅ Sprint completed with workflow validation"
    git push
    
    # 스프린트 완료 태그 생성 (워크플로우 메타데이터 포함)
    SPRINT_TAG="sprint-$(date +%Y%m%d-%H%M%S)-workflow-validated"
    git tag -a "$SPRINT_TAG" -m "Sprint completed: $(aiwf state show | grep current_sprint)"
    git push --tags
  else
    echo "⚠️ Workflow inconsistency detected. Manual review required."
  fi
  ```

**적응적 다음 스프린트 전환:**
- **사용자 알림**: 스프린트 완료 및 워크플로우 기반 다음 단계 알림
- **지능적 다음 스프린트 준비**: 
  ```bash
  # 워크플로우 규칙 기반 자동 결정
  if [[ $(aiwf state next --check=auto-sprint-generation) == "approved" ]]; then
    # 자동으로 다음 스프린트로 전환
    echo "🚀 Auto-transitioning to next sprint based on workflow rules"
    # `### 워크플로우 기반 적응적 스프린트 관리`로 이동
  else
    # 수동 검토 후 전환
    echo "🔍 Manual review required for next sprint"
  fi
  ```

**4단계: 워크플로우 기반 마일스톤 체크포인트**

**마일스톤 완료 워크플로우 검증:**
- 마일스톤의 모든 스프린트 완료 및 상태 일관성 확인
- **전체 워크플로우 상태 검증**:
  ```bash
  # 전체 상태 업데이트
  aiwf state update
  
  # 마일스톤 레벨 워크플로우 검증
  aiwf state validate --level=milestone
  
  # 다음 마일스톤 전환 조건 확인
  aiwf state next --mode=milestone-transition
  ```

**지능적 마일스톤 완료 처리:**
- **워크플로우 승인 기반 전체 마일스톤 커밋**:
  ```bash
  # 마일스톤 레벨 최종 검증
  if [[ $(aiwf state validate --check=milestone-completion) == "passed" ]]; then
    # 마일스톤 완료 커밋
    git add -A
    git commit -m "🎯 Milestone completed with full workflow validation"
    git push
    
    # 마일스톤 완료 태그 생성
    MILESTONE_TAG="milestone-$(date +%Y%m%d-%H%M%S)-completed"
    git tag -a "$MILESTONE_TAG" -m "Milestone completed: $(aiwf state show | grep current_milestone)"
    git push --tags
  fi
  ```

**적응적 리뷰 및 전환:**
- **워크플로우 기반 리뷰 요청**: 
  - AI 의사결정 엔진으로 리뷰 필요성 판단
  - 자동 승인 vs 수동 리뷰 결정
- **지능적 사용자 알림**: 
  - 마일스톤 완료 성과 요약 (워크플로우 메트릭 포함)
  - 다음 마일스톤 전환 계획 자동 생성

**5단계: 워크플로우 통합 풀 리퀘스트 생성**

**지능적 PR 생성 조건:**
- GitHub 이슈가 태스크에 연결된 경우
- **워크플로우 상태 기반 자동 결정**:
  ```bash
  # PR 생성 필요성 워크플로우 기반 판단
  if [[ $(aiwf state validate --check=pr-required) == "true" ]]; then
    # 워크플로우 메타데이터 포함한 PR 생성
    @.claude/commands/aiwf/aiwf_pr_create.md --include-workflow-metadata
  fi
  ```

**PR 내용 자동 최적화:**
- 완료된 태스크들의 워크플로우 영향 분석 포함
- 차단 해제된 후속 작업 목록 자동 생성
- 의존성 변경사항 및 영향 범위 자동 문서화

**📋 ADR (Architecture Decision Record) 자동 관리:**
```bash
# 아키텍처 변경사항 감지 및 ADR 업데이트
echo "🏗️ 아키텍처 변경사항 검사 중..."

# 주요 변경사항 검사 (패키지, 설정, 구조 등)
ARCH_CHANGES=$(git diff HEAD~1 --name-only | grep -E "(package\.json|\.env|config/|src/.*\.config\.|docker|infrastructure/)" | wc -l)

if [ $ARCH_CHANGES -gt 0 ]; then
  echo "🔍 아키텍처 관련 변경 감지 ($ARCH_CHANGES 파일)"
  
  # 관련 ADR 찾기
  RELATED_ADRS=$(find .aiwf/05_ARCHITECTURAL_DECISIONS/ -name "ADR*.md" -exec grep -l "$(git log -1 --pretty=%s)" {} \;)
  
  if [ -n "$RELATED_ADRS" ]; then
    echo "📝 관련 ADR 업데이트 중..."
    for adr in $RELATED_ADRS; do
      # ADR에 구현 경험 추가
      echo -e "\n### Implementation Update ($(date +%Y-%m-%d))" >> "$adr"
      echo "- 태스크: $(git log -1 --pretty=%s)" >> "$adr"
      echo "- 변경 파일: $(git diff HEAD~1 --name-only | tr '\n' ', ')" >> "$adr"
      echo "- 구현 노트: YOLO 모드에서 자동 적용됨" >> "$adr"
      
      echo "✅ ADR 업데이트: $(basename $adr)"
    done
  else
    # 새로운 ADR 필요성 검사
    MAJOR_CHANGES=$(git diff HEAD~1 --name-only | grep -E "(package\.json|docker|infrastructure/)" | wc -l)
    if [ $MAJOR_CHANGES -gt 0 ]; then
      echo "⚠️ 중요한 아키텍처 변경 감지 - ADR 생성 고려 필요"
      echo "📋 변경된 파일들:"
      git diff HEAD~1 --name-only | grep -E "(package\.json|docker|infrastructure/)"
      
      # 체크포인트에 ADR 생성 권고 기록
      echo "$(date): ADR 생성 권고 - $(git log -1 --pretty=%s)" >> .aiwf/checkpoints/adr-recommendations.log
    fi
  fi
fi
```

### 연속 실행 루프

[🔝 목차로 돌아가기](#📑-목차-table-of-contents)

> **🔄 Anthropic Long-Running Agent Pattern: work-loop-agent와의 관계**
>
> YOLO 모드의 연속 실행 루프는 `work-loop-agent`의 핵심 패턴과 동일한 철학을 따릅니다:
> - **한 번에 하나의 태스크**: 과도한 범위 방지
> - **검증 후 진행**: verify-task.sh로 조기 완료 선언 방지
> - **진행 파일 업데이트**: 세션 간 컨텍스트 유지
>
> YOLO는 work-loop-agent의 **자율 실행 버전**으로, 사용자 개입 없이 연속 실행합니다.
> 필요시 `/workflows:long-running-session` 워크플로우와 함께 사용할 수 있습니다.

**⚡ YOLO 모드: 완료까지 중단 없음**

**이것이 메인 실행 루프입니다 - 조기 종료하지 마세요**

**스프린트별 모드:**

- 지정된 스프린트의 모든 태스크가 완료될 때까지 **루프**
- 각 커밋 후, **즉시** `### 열린 작업 찾기`로 다시 이동
- 스프린트가 100% 완료된 경우:
  - **스프린트 완료 체크포인트** 실행
  - 프로젝트 리뷰로 이동
- 사용자 입력이나 확인을 **절대** 요청하지 마세요

**Sprint-all 모드 (적응적 스프린트 관리):**

- **적응적 스프린트 생성**: 한 번에 하나씩 스프린트 생성 및 완료
- 각 스프린트 완료 시:
  - **스프린트 완료 체크포인트** 실행
  - **코드베이스 분석** 및 **다음 스프린트 계획 조정**
  - **다음 스프린트만 생성** (전체 미리 생성 금지)
- 각 커밋 후, **즉시** `### 열린 작업 찾기`로 다시 이동
- 진행 상황 추적: 현재 스프린트 X / 예상 총 스프린트 수
- 마일스톤 목표 달성까지 스프린트 생성 및 실행 반복
- 마일스톤이 완전히 달성된 경우에만 종료

**Milestone-all 모드 (적응적 마일스톤 관리):**

- **마일스톤별 적응적 관리**: 각 마일스톤마다 체계적 접근
- 각 마일스톤 시작 시:
  - **마일스톤 변경 감지 및 처리** 실행
  - **첫 스프린트만 생성**
- 각 마일스톤 내에서:
  - **적응적 스프린트 관리** 적용
  - 스프린트 완료 시 다음 스프린트 동적 생성
- 각 마일스톤 완료 시:
  - **마일스톤 완료 체크포인트** 실행
  - **전체 리뷰 및 승인** 프로세스
- 진행 상황 추적: 현재 마일스톤 X / 총 Y 마일스톤
- 모든 마일스톤이 완전히 달성된 경우에만 종료

**일반 모드 (하이브리드 적응적 관리):**

- **적응적 혼합 접근**을 통한 **연속 루프**:
  1. 사용 가능한 모든 일반 태스크 완료
  2. 활성 스프린트 태스크로 이동
  3. 스프린트 완료 시:
     - **스프린트 완료 체크포인트** 실행
     - **코드베이스 분석** 및 **다음 스프린트 동적 생성**
  4. 마일스톤 변경 감지 시:
     - **마일스톤 변경 감지 및 처리** 실행
  5. 새로 생성된 스프린트나 태스크 확인
  6. 더 이상 사용 가능한 작업이 없을 때까지 반복
- 각 커밋 후, **즉시** `### 열린 작업 찾기`로 다시 이동
- **지능적 종료 조건**: 현재 마일스톤 목표 달성 또는 절대적으로 작업이 남아있지 않은 경우에만 종료

**중단 조건 (모든 것이 참인 경우에만 중단):**

- 대상 범위에 보류 중인 태스크 없음
- 자동 수정할 수 있는 태스크 없음
- 태스크 생성이 필요한 스프린트 없음
- 프로젝트 리뷰가 새 태스크를 생성하지 않고 통과

## 프로젝트 리뷰 실행

- **서브에이전트 사용**하여 @.claude/commands/aiwf/aiwf_project_review.md를 포함하도록 함
- 리뷰 결과에 따라:
  - 실패 시: 가능한 수정에 대해 생각.
  - 수정이 빠르게 완료되면, 즉시 수정하고 `## 프로젝트 리뷰 실행` 반복
  - 수정이 더 복잡하면 **서브에이전트 사용**하여 필요에 따라 새 일반 태스크를 생성하기 위해 @.claude/commands/aiwf/aiwf_create_general_task.md를 포함하도록 함.
  - 이러한 수정 작업을 위해 `### 열린 작업 찾기`로 다시 이동
  - 통과 시: 계속 진행

## 계속 확인

**⚡ 필수 계속 로직**

**남은 작업 확인:**

- 현재 범위에서 보류 중인 태스크 스캔
- 프로젝트 리뷰가 새 태스크를 생성했는지 확인
- 태스크 생성이 필요한 스프린트가 있는지 확인

**결정 매트릭스:**

**스프린트별 모드:**

- **만약** 스프린트에 보류 중인 태스크가 있다면 → `### 열린 작업 찾기`로 다시 이동
- **만약** 스프린트가 100% 완료되었다면:
  - **스프린트 완료 체크포인트** 실행
  - `## 요약 생성`으로 이동

**Sprint-all 모드 (적응적):**

- **만약** 현재 스프린트에 보류 중인 태스크가 있다면 → `### 열린 작업 찾기`로 다시 이동
- **만약** 현재 스프린트가 100% 완료되었다면:
  - **스프린트 완료 체크포인트** 실행
  - **코드베이스 분석 및 다음 스프린트 계획**
  - **다음 스프린트 생성** 후 `### 열린 작업 찾기`로 이동
- **만약** 마일스톤 목표가 달성되었다면 → `## 요약 생성`으로 이동
- **만약** 마일스톤 변경이 감지되었다면 → `## 마일스톤 변경 감지 및 처리`로 이동

**Milestone-all 모드 (적응적):**

- **만약** 현재 마일스톤에 불완전한 스프린트가 있다면 → `### 열린 작업 찾기`로 다시 이동
- **만약** 현재 마일스톤이 100% 완료되었다면:
  - **마일스톤 완료 체크포인트** 실행
  - **다음 마일스톤 시작** 또는 `## 요약 생성`으로 이동
- **만약** 마일스톤 변경이 감지되었다면 → `## 마일스톤 변경 감지 및 처리`로 이동
- **만약** 모든 마일스톤이 100% 완료되었다면 → `## 요약 생성`으로 이동

**일반 모드 (하이브리드 적응적):**

- **만약** 어떤 일반 태스크든 보류 중이라면 → `### 열린 작업 찾기`로 다시 이동
- **만약** 어떤 스프린트 태스크든 보류 중이라면 → `### 열린 작업 찾기`로 다시 이동
- **만약** 스프린트가 100% 완료되었다면:
  - **스프린트 완료 체크포인트** 실행
  - **다음 스프린트 동적 생성** 후 `### 열린 작업 찾기`로 이동
- **만약** 마일스톤 변경이 감지되었다면 → `## 마일스톤 변경 감지 및 처리`로 이동
- **만약** 프로젝트 리뷰가 실패하고 새 태스크를 생성했다면 → `### 열린 작업 찾기`로 다시 이동
- **오직** 현재 마일스톤 목표 달성 또는 절대적으로 작업이 남아있지 않은 경우에만 → `## 요약 생성`으로 이동

**🚨 치명적: 작업이 남아있지 않다고 100% 확신하지 않는 한 요약으로 이동하지 마세요**

## 요약 생성

> **📝 Anthropic Long-Running Agent Pattern: session-end 통합**
>
> YOLO 세션 종료 시 `/aiwf:session-end` 명령어를 활용하여
> 진행 상황을 `aiwf-progress.md`에 자동 저장하고 다음 세션을 위한 컨텍스트를 준비합니다.
> 이를 통해 세션 간 기억 손실을 방지하고 연속성을 보장합니다.

- 시스템에서 현재 datetime 스탬프를 가져와서 처음에 기억한 타임스탬프와 비교. 프로세스 지속시간 계산.

### 🛡️ YOLO 세션 종료 및 체크포인트 리포트 생성

**체크포인트 매니저 최종 리포트**:
```bash
# CLI로 세션 종료 체크포인트 생성
aiwf checkpoint create "session_end" \
  --message "YOLO 세션 종료" \
  --meta '{"mode": "YOLO", "engineering_level": "minimal", "focus_maintained": true}'

# 세션 리포트 생성
aiwf checkpoint report

# 오래된 체크포인트 정리 (선택사항)
aiwf checkpoint clean --keep 20

# Anthropic Long-Running Agent Pattern: aiwf-progress.md 최종 업데이트
echo "## Session Summary ($(date +%Y-%m-%d\ %H:%M))" >> .aiwf/aiwf-progress.md
echo "- Mode: YOLO" >> .aiwf/aiwf-progress.md
echo "- Duration: ${SESSION_DURATION}" >> .aiwf/aiwf-progress.md
echo "- Tasks Completed: ${COMPLETED_TASKS}" >> .aiwf/aiwf-progress.md
echo "- Verification Status: $(aiwf checkpoint report | grep 'verification')" >> .aiwf/aiwf-progress.md
echo "" >> .aiwf/aiwf-progress.md
echo "### Next Session Recommendations" >> .aiwf/aiwf-progress.md
echo "- 다음 세션 시작 시 \`/aiwf:session-start\` 또는 \`/aiwf:restore\` 사용" >> .aiwf/aiwf-progress.md
```

**오버엔지니어링 방지 최종 보고서**:
```bash
# CLI로 프로젝트 전체 복잡도 최종 분석
echo "🛡️ 오버엔지니어링 방지 최종 보고서 생성 중..."
aiwf guard check . --config .aiwf/yolo-config.yaml
```

### 프로젝트 상태 보고서 생성

**프로젝트 상태 데이터 수집:**

- 마일스톤 완료 상태를 위해 `.aiwf/01_MILESTONES/` 스캔
- 모든 스프린트 상태와 태스크 완료를 위해 `.aiwf/03_SPRINTS/` 스캔
- 일반 태스크 완료를 위해 `.aiwf/04_GENERAL_TASKS/` 스캔
- 각 카테고리에 대해 완료된 vs 전체 태스크 계산

**시각적 진행 상황 보고서 생성:**

```
=== MOONKLABS 프로젝트 상태 보고서 ===

🎯 마일스톤 진행 상황:
[▓▓▓▓▓▓▓░░░] 70% (10개 중 7개 완료)
M01: ✅ 설정 및 아키텍처
M02: ✅ 핵심 기능
M03: ✅ 인증
M04: 🔄 진행 중 - API 개발
M05: ⏳ 대기 중 - 프론트엔드 통합

📊 스프린트 진행 상황:
[▓▓▓▓▓▓░░░░] 60% (5개 스프린트 중 3개 완료)
S01: ✅ 완료 (12/12 태스크)
S02: ✅ 완료 (8/8 태스크)
S03: 🔄 활성 (9개 태스크 중 5개 완료)
S04: ⏳ 계획됨 (0/0 태스크)
S05: ⏳ 계획됨 (0/0 태스크)

⚡ 일반 태스크:
[▓▓▓▓▓▓▓▓░░] 80% (20개 중 16개 완료)

📈 전체 프로젝트 상태:
[▓▓▓▓▓▓▓░░░] 73% 완료
```

**다음을 포함한 YOLO 중심 적응적 관리 요약 보고서 생성:**

**🚀 YOLO 실행 모드 및 전략:**
- 실행된 모드 (독립 스프린트, 스프린트별, Sprint-all 적응적, Milestone-all 적응적, 또는 하이브리드 일반)
- 독립 스프린트 생성 여부 (README/GitHub 이슈 기반)
- 적용된 엔지니어링 레벨 (minimal/balanced/complete)
- 오버엔지니어링 방지 규칙 적용 횟수
- 체크포인트 생성 및 복구 횟수
- 적용된 적응적 관리 전략
- 마일스톤 변경 감지 및 처리 횟수

**스프린트 및 태스크 관리:**
- 동적으로 생성된 스프린트 수 및 상세 내역
- 이 세션에서 완료된 태스크 수
- 이 세션에서 건너뛰거나 실패한 태스크 수
- 코드베이스 분석 및 계획 조정 횟수

**체크포인트 및 리뷰:**
- 스프린트 완료 체크포인트 실행 횟수
- 마일스톤 완료 체크포인트 실행 횟수
- 커밋/푸시 작업 횟수
- 리뷰 요청 및 승인 상태

**🛡️ YOLO 성과 지표:**
- YOLO 세션의 총 지속시간
- 현재 프로젝트 완료 백분율
- 완료된 스프린트 수 및 상세 내역 (독립 스프린트 포함)
- 달성된 마일스톤 수 및 상세 내역
- **오버엔지니어링 방지 성과**:
  - 복잡도 기준 위반 방지 횟수
  - 간단한 해결책 선택 사례
  - 골드 플레이팅 방지 사례
  - YAGNI 원칙 적용 사례
- **체크포인트 시스템 성과**:
  - 생성된 체크포인트 수
  - 복구 실행 횟수
  - 세션 연속성 유지율
- 적응적 계획 조정으로 인한 효율성 개선 사례

**문제 및 해결:**
- 발생한 치명적 문제들
- 현재 테스트 상태
- 적응적 계획 조정으로 해결된 문제들

**🚀 YOLO 미래 계획:**
- 다음 권장 조치
- 다음 세션을 위한 상위 3개 우선순위 항목
- **독립 스프린트 추천**:
  - 빠른 프로토타입 기회
  - README TODO 활용 가능성
  - GitHub 이슈 기반 스프린트 후보
- 예상 다음 스프린트 방향성
- **오버엔지니어링 방지 개선사항**:
  - 복잡도 임계값 조정 제안
  - 추가 가드 규칙 필요 영역
  - 엔지니어링 레벨 최적화 제안
- 적응적 관리 개선 제안사항

**다음을 포함하여 사용자에게 완전한 상태 보고:**

- 시각적 진행 상황 그래프
- 세션 요약
- 프로젝트 상태 개요
- 권장 다음 단계

작업이 완료되었습니다. 감사합니다.
