# AIWF YOLO 시스템 가이드

> AIWF의 자율 실행 시스템(YOLO 모드)에 대한 종합 가이드

[한국어](YOLO_SYSTEM_GUIDE.ko.md) | [English](YOLO_SYSTEM_GUIDE.md)

## 목차

1. [개요](#개요)
2. [시스템 구성 요소](#시스템-구성-요소)
3. [엔지니어링 가드](#엔지니어링-가드)
4. [체크포인트 매니저](#체크포인트-매니저)
5. [YOLO 설정](#yolo-설정)
6. [사용 패턴](#사용-패턴)
7. [안전 메커니즘](#안전-메커니즘)
8. [성능 최적화](#성능-최적화)
9. [문제 해결](#문제-해결)
10. [모범 사례](#모범-사례)

## 개요

YOLO(You Only Live Once) 모드는 Claude Code가 최소한의 인간 개입으로 독립적으로 작업할 수 있게 하는 AIWF의 자율 실행 시스템입니다. 이 시스템은 신뢰할 수 있는 자율 운영을 보장하기 위해 정교한 안전 메커니즘, 진행률 추적, 품질 제어를 포함합니다.

### 주요 기능

- **자율 태스크 실행**: 스프린트나 마일스톤을 자동으로 완료
- **오버엔지니어링 방지**: 불필요한 복잡성에 대한 내장 가드
- **진행률 추적**: 포괄적인 체크포인트 및 복구 시스템
- **품질 제어**: 실시간 코드 품질 모니터링
- **복구 메커니즘**: 강력한 오류 처리 및 상태 복원

## 시스템 구성 요소

### 아키텍처 개요

```
YOLO 모드
├── Engineering Guard (오버엔지니어링 방지)
├── Checkpoint Manager (진행률 추적 & 복구)
├── Configuration System (동작 커스터마이징)
├── Sprint Manager (태스크 조직화)
└── Recovery System (실패 처리)
```

### 핵심 모듈

1. **`utils/engineering-guard.js`**: 품질 제어 및 복잡성 방지
2. **`utils/checkpoint-manager.js`**: 진행률 추적 및 복구
3. **`src/config/yolo-config-template.yaml`**: 설정 템플릿
4. **`src/commands/yolo-config.js`**: 설정 관리
5. **`src/cli/checkpoint-cli.js`**: 전용 체크포인트 CLI

## 엔지니어링 가드

엔지니어링 가드는 자율 실행 중 오버엔지니어링을 방지하고 코드 품질을 유지합니다.

### 핵심 기능

#### 복잡성 모니터링
- **파일 크기 제한**: 파일이 너무 커지는 것을 방지
- **함수 크기 제어**: 함수를 관리 가능한 크기로 유지
- **중첩 깊이**: 과도한 들여쓰기 제한
- **패턴 감지**: 디자인 패턴의 과도한 사용 식별

#### 설정 옵션

```yaml
overengineering_prevention:
  max_file_lines: 300
  max_function_lines: 50
  max_nesting_depth: 4
  max_abstraction_layers: 3
  limit_design_patterns: true
  no_future_proofing: true
```

### 사용 예제

#### 프로그래밍 방식 사용
```javascript
import { EngineeringGuard } from 'aiwf/utils/engineering-guard';

const guard = new EngineeringGuard('.aiwf/yolo-config.yaml');

// 단일 파일 검사
await guard.checkFileComplexity('src/app.js');
const report = guard.generateReport();

// 전체 프로젝트 검사
const projectReport = await guard.checkProject('./src');
```

#### 실시간 피드백
```javascript
// 개발 중 즉각적인 피드백 받기
const feedback = await guard.provideFeedback('src/new-feature.js');
console.log(feedback);
// 출력: [
//   { level: 'warning', message: '파일이 너무 커지고 있습니다...' },
//   { level: 'suggestion', message: '복잡한 조건문을 별도 함수로 추출 고려...' }
// ]
```

### 감지 기능

#### 디자인 패턴 감지
- Factory 패턴
- Singleton 사용
- Observer 구현
- Strategy 패턴
- Decorator 패턴
- Adapter 패턴

#### 미래 대비 코드 감지
- 미래 참조가 있는 TODO 주석
- 조건부 FIXME 항목
- 추측성 주석
- 예약/플레이스홀더 코드
- 버전별 검사

## 체크포인트 매니저

체크포인트 매니저는 진행률 추적, 상태 지속성, 복구 메커니즘을 처리합니다.

### 핵심 기능

#### 세션 관리
```javascript
import { CheckpointManager } from 'aiwf/utils/checkpoint-manager';

const manager = new CheckpointManager('./project-root');

// YOLO 세션 시작
await manager.startSession('S01', 'sprint');

// 태스크 진행률 추적
await manager.startTask('T001_setup_api');
await manager.completeTask('T001_setup_api', { files_created: 5 });

// 수동 체크포인트 생성
await manager.createCheckpoint('manual', { milestone: 'API setup complete' });
```

#### 복구 작업
```javascript
// 사용 가능한 체크포인트 목록
const checkpoints = await manager.listCheckpoints();

// 체크포인트에서 복구
await manager.restoreFromCheckpoint('cp_1234567890');

// 진행률 리포트 생성
const report = await manager.generateProgressReport();
```

### 체크포인트 유형

1. **session_start**: YOLO 세션 시작 시 생성
2. **task_complete**: 각 태스크 완료 후 생성
3. **auto**: 일정 간격으로 자동 생성
4. **manual**: 사용자 요청에 의해 생성
5. **session_end**: 세션 종료 시 생성

### 상태 구조

```json
{
  "session_id": "1703123456789",
  "started_at": "2025-01-27T10:00:00Z",
  "sprint_id": "S01",
  "mode": "sprint",
  "completed_tasks": [
    {
      "id": "T001_setup_api",
      "completed_at": "2025-01-27T10:15:00Z",
      "duration": 900000,
      "attempts": 1
    }
  ],
  "current_task": null,
  "metrics": {
    "completed_tasks": 1,
    "failed_tasks": 0,
    "total_time": 900000,
    "avg_task_time": 900000
  }
}
```

## YOLO 설정

### 설정 템플릿

YOLO 설정 시스템은 YAML 파일을 사용하여 자율 동작을 제어합니다:

```yaml
# 엔지니어링 레벨 (minimal/balanced/complete)
engineering_level: minimal

# 범위 확산 방지를 위한 포커스 규칙
focus_rules:
  requirement_first: true
  simple_solution: true
  no_gold_plating: true
  stay_on_track: true

# 실행 설정
execution:
  fast_mode: true
  run_tests: true
  auto_commit: false
  branch_strategy: feature

# 안전 중단점
breakpoints:
  critical_files:
    - .env
    - database/migrations/*
  test_failure_threshold: 10
  schema_changes: true

# 체크포인트 설정
checkpoint:
  enabled: true
  interval: 5
  recovery_mode: auto
```

### 설정 관리

#### CLI 명령어
```bash
# 설정 초기화
aiwf yolo-config init

# 대화형 설정 마법사
aiwf yolo-config wizard

# 현재 설정 표시
aiwf yolo-config show
```

#### 프로그래밍 방식 설정
```javascript
import { createYoloConfig, createInteractiveYoloConfig } from 'aiwf/commands/yolo-config';

// 기본값으로 생성
await createYoloConfig();

// 대화형 설정
await createInteractiveYoloConfig();
```

## 사용 패턴

### 기본 YOLO 실행

#### 스프린트 레벨 실행
```bash
# 특정 스프린트 실행
/aiwf_yolo S02

# 모든 스프린트 실행
/aiwf_yolo sprint-all

# 모든 마일스톤 실행
/aiwf_yolo milestone-all
```

#### CLI 기반 스프린트 생성
```bash
# README에서 독립 스프린트 생성
aiwf sprint independent --from-readme --minimal

# GitHub 이슈에서 생성
aiwf sprint independent --from-issue 123

# 대화형 생성
aiwf sprint independent "Quick Feature" --balanced
```

### 체크포인트 작업

#### aiwf-checkpoint CLI 사용
```bash
# 체크포인트 목록
aiwf-checkpoint list

# 진행률 리포트 표시
aiwf-checkpoint report

# 체크포인트에서 복구
aiwf checkpoint restore cp_1234567890

# 수동 체크포인트 생성
aiwf checkpoint create "주요 리팩토링 전"

# 오래된 체크포인트 정리
aiwf checkpoint clean --keep 10
```

### 복구 시나리오

#### 세션 중단 복구
```bash
# 현재 세션 상태 확인
aiwf-checkpoint status

# 사용 가능한 복구 지점 목록
aiwf-checkpoint list --limit 10

# 마지막 안정 상태로 복구
aiwf checkpoint restore cp_latest
```

## 안전 메커니즘

### 오버엔지니어링 방지

#### 자동 검사
- **파일 크기 모니터링**: 파일이 제한을 초과할 때 경고
- **복잡성 감지**: 지나치게 복잡한 코드 구조 식별
- **패턴 과용**: 불필요한 디자인 패턴 방지
- **미래 대비**: 추측성 구현 차단

#### 수동 재정의
```yaml
# 특정 검사 비활성화
overengineering_prevention:
  max_file_lines: 500  # 제한 증가
  limit_design_patterns: false  # 패턴 허용
```

### 실행 안전장치

#### 중요 파일 보호
```yaml
breakpoints:
  critical_files:
    - .env
    - package.json
    - database/schema.sql
```

#### 테스트 실패 처리
```yaml
breakpoints:
  test_failure_threshold: 10  # 10% 이상 테스트 실패 시 중단
```

#### 스키마 변경 확인
```yaml
breakpoints:
  schema_changes: true  # DB 변경에 대한 확인 필요
```

## 성능 최적화

### 체크포인트 최적화

#### 자동 정리
```javascript
// 오래된 체크포인트 자동 정리
await manager.cleanup(keepLast: 10);
```

#### 스토리지 효율성
- 증분 상태 스냅샷
- 압축된 체크포인트 데이터
- 자동 오래된 체크포인트 제거

### 실행 최적화

#### 병렬 태스크 실행
```yaml
performance:
  parallel_tasks: false  # 실험적 기능
  use_cache: true
  skip_unchanged: true
```

#### 메모리 관리
- 지연 모듈 로딩
- 리소스 풀링
- 자동 가비지 컬렉션

## 문제 해결

### 일반적인 문제

#### 엔지니어링 가드가 작동하지 않음
```bash
# 모듈 존재 확인
ls -la src/utils/engineering-guard.js

# 동적 import 테스트
node -e "import('./src/utils/engineering-guard.js').then(console.log)"

# 설정 확인
cat .aiwf/yolo-config.yaml
```

#### 체크포인트 시스템 실패
```bash
# 체크포인트 디렉토리 확인
ls -la .aiwf/checkpoints/

# 권한 확인
chmod 755 .aiwf/checkpoints/

# 체크포인트 생성 테스트
aiwf checkpoint create "test-checkpoint"
```

#### 설정 문제
```bash
# 설정 재생성
aiwf yolo-config init --force

# 설정 검증
aiwf yolo-config show

# 기본값으로 재설정
rm .aiwf/yolo-config.yaml && aiwf yolo-config init
```

### 복구 절차

#### 손상된 상태 복구
```bash
# 사용 가능한 체크포인트 목록
aiwf-checkpoint list

# 알려진 정상 상태로 복구
aiwf checkpoint restore cp_last_known_good

# 필요시 재초기화
aiwf yolo-config init --force
```

#### Git 상태 불일치
```bash
# 체크포인트의 Git 상태 확인
aiwf-checkpoint show cp_1234567890

# 필요시 Git 상태 복원
git checkout checkpoint_branch_name
git reset --hard checkpoint_commit_hash
```

## 모범 사례

### 설정 관리

1. **보수적으로 시작**: 최소 엔지니어링 레벨로 시작
2. **점진적 커스터마이징**: 프로젝트 요구에 따라 설정 조정
3. **결과 모니터링**: 메트릭 추적 및 임계값 조정
4. **변경 문서화**: 설정 변경을 버전 제어에 보관

### 세션 관리

1. **정기적 체크포인트**: 논리적 마일스톤에서 체크포인트 생성
2. **진행률 모니터링**: 주기적으로 세션 상태 확인
3. **정리**: 오래된 체크포인트 정기적 제거
4. **복구 계획**: 복구 절차 준비

### 품질 제어

1. **적절한 제한 설정**: 프로젝트에 맞는 복잡성 제한 구성
2. **위반 모니터링**: 엔지니어링 가드 리포트 검토
3. **조기 문제 해결**: 복잡성 문제가 누적되기 전에 수정
4. **속도 vs 품질 균형**: 요구에 따라 엔지니어링 레벨 조정

### 성능 최적화

1. **캐싱 사용**: 반복 작업에 캐싱 활성화
2. **체크포인트 최적화**: 오래된 체크포인트 정기적 정리
3. **리소스 모니터링**: 메모리 및 디스크 사용량 추적
4. **성능 프로파일링**: 자율 실행의 병목 지점 식별

## 통합 예제

### 커스텀 YOLO 워크플로

```javascript
import { CheckpointManager } from 'aiwf/utils/checkpoint-manager';
import { EngineeringGuard } from 'aiwf/utils/engineering-guard';

class CustomYoloWorkflow {
  constructor(projectRoot) {
    this.checkpointManager = new CheckpointManager(projectRoot);
    this.engineeringGuard = new EngineeringGuard('.aiwf/yolo-config.yaml');
  }
  
  async executeWithGuards(tasks) {
    await this.checkpointManager.startSession('custom', 'workflow');
    
    for (const task of tasks) {
      await this.checkpointManager.startTask(task.id);
      
      // 태스크 실행...
      const result = await this.executeTask(task);
      
      // 품질 확인
      const report = await this.engineeringGuard.checkProject('./src');
      if (!report.passed) {
        console.warn('품질 문제 감지:', report.violations);
      }
      
      await this.checkpointManager.completeTask(task.id, result);
    }
    
    return await this.checkpointManager.endSession();
  }
}
```

## 관련 명령어

### Claude Code 명령어
- `/project:aiwf:yolo` - 메인 YOLO 실행 명령어
- `/aiwf_yolo` - 자율 태스크 실행
- `/aiwf_checkpoint_status` - 현재 진행률 확인

### CLI 명령어
- `aiwf yolo-config` - 설정 관리
- `aiwf checkpoint` - 체크포인트 작업
- `aiwf-checkpoint` - 전용 체크포인트 CLI
- `aiwf sprint independent` - 독립 스프린트 생성

## 관련 문서

- [CLI_USAGE_GUIDE.md](CLI_USAGE_GUIDE.ko.md) - CLI 명령어 참조
- [COMMANDS_GUIDE.md](COMMANDS_GUIDE.ko.md) - Claude Code 명령어 가이드
- [MODULE_MANAGEMENT_GUIDE.md](MODULE_MANAGEMENT_GUIDE.ko.md) - 모듈 아키텍처
- [Independent Sprint Guide](guides/independent-sprint-guide-ko.md) - 스프린트 관리
- [Checkpoint System Guide](guides/checkpoint-system-guide-ko.md) - 체크포인트 세부사항

---

**마지막 업데이트**: 2025-01-27  
**버전**: AIWF v0.3.16+ 호환