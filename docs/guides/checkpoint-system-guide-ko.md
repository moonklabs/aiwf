# 체크포인트 시스템 가이드

[Read in English](checkpoint-system-guide.md)

## 개요

AIWF 체크포인트 시스템은 YOLO 모드 실행을 위한 강력한 복구 및 진행 상황 추적을 제공하도록 설계되었습니다. 중요한 시점에 자동으로 상태를 저장하고 중단 후 원활한 계속을 허용합니다.

## 핵심 개념

### 체크포인트란?

체크포인트는 다음의 스냅샷입니다:
- 현재 세션 상태
- 태스크 완료 상태
- Git 저장소 상태
- 성능 메트릭
- 실행 컨텍스트

### 체크포인트는 언제 생성되나요?

체크포인트는 자동으로 생성됩니다:
- 세션 시작 시
- 각 태스크 완료 후
- 위험한 작업 전
- 정기적인 간격으로 (설정 가능)
- 우아한 중단 시

추가 안전을 위해 언제든지 수동 체크포인트를 생성할 수 있습니다.

## 체크포인트 시스템 사용

### 기본 명령어

```bash
# 현재 세션 상태 보기
aiwf checkpoint status

# 사용 가능한 체크포인트 목록
aiwf checkpoint list
aiwf checkpoint list --limit 20

# 체크포인트에서 복원
aiwf checkpoint restore cp_1234567890

# 수동 체크포인트 생성
aiwf checkpoint create "주요 리팩토링 전"

# 오래된 체크포인트 정리
aiwf checkpoint clean --keep 10
```

### 전용 CLI 도구

`aiwf-checkpoint` 명령어는 고급 기능을 제공합니다:

```bash
# 진행 상황 리포트 생성
aiwf-checkpoint report

# 상세 체크포인트 정보 표시
aiwf-checkpoint show cp_1234567890

# 미리보기와 함께 정리
aiwf-checkpoint clean --keep 5 --dry-run

# 도움말 보기
aiwf-checkpoint help
```

## 체크포인트 구조

### 체크포인트 파일

```
.aiwf/checkpoints/
├── cp_1703123456789/
│   ├── metadata.json      # 체크포인트 메타데이터
│   ├── session.json       # 세션 상태
│   ├── git-state.json     # Git 저장소 스냅샷
│   └── metrics.json       # 성능 메트릭
└── current-session.json   # 활성 세션 참조
```

### 메타데이터 내용

```json
{
  "id": "cp_1703123456789",
  "type": "task_complete",
  "timestamp": "2024-12-25T10:30:45.789Z",
  "session_id": "session_1703123456789",
  "description": "태스크 T01_S01 완료",
  "git_commit": "abc123def",
  "tasks_completed": 5,
  "sprint": "S01"
}
```

## 복구 프로세스

### 자동 복구

YOLO 모드가 시작될 때 다음을 확인합니다:
1. 미완료 태스크가 있는 활성 세션
2. 최근 체크포인트
3. Git 상태 일관성

미완료 세션이 발견되면 다음 중 선택하라는 메시지가 표시됩니다:
- 마지막 체크포인트에서 계속
- 새로 시작
- 체크포인트 세부 정보 검토

### 수동 복구

```bash
# 1. 사용 가능한 항목 확인
aiwf checkpoint list

# 2. 특정 체크포인트 세부 정보 보기
aiwf-checkpoint show cp_1703123456789

# 3. 적절한 경우 복원
aiwf checkpoint restore cp_1703123456789

# 4. YOLO 모드에서 계속
# Claude Code에서: /project:aiwf:yolo
```

## YOLO 모드와의 통합

### YOLO 설정

`.aiwf/yolo-config.yaml`에서 체크포인트 동작 구성:

```yaml
checkpoint:
  auto_checkpoint: true
  interval_minutes: 15
  max_checkpoints: 50
  checkpoint_on:
    - task_complete
    - sprint_complete
    - before_risky_operation
    - interval
```

### YOLO 실행 흐름

```
YOLO 시작 → 복구 확인 → 세션 생성 → 태스크 실행
             ↓                            ↓
       [체크포인트 있음]            [체크포인트 생성]
             ↓                            ↓
        복구 프롬프트                실행 계속
```

## 모범 사례

### 1. 정기적인 정리

```bash
# 마지막 10개 체크포인트 유지
aiwf checkpoint clean --keep 10

# 또는 기간(일)으로 정리
aiwf checkpoint clean --older-than 7
```

### 2. 안전을 위한 수동 체크포인트

다음 작업 전에 수동 체크포인트 생성:
- 주요 리팩토링
- 데이터베이스 마이그레이션
- 브레이킹 체인지
- 실험적 기능

```bash
aiwf checkpoint create "데이터베이스 스키마 변경 전"
```

### 3. 체크포인트 상태 모니터링

```bash
# 정기적인 상태 확인
aiwf checkpoint status

# 주간 리포트
aiwf-checkpoint report --period week
```

### 4. Git 상태 정렬

Git 상태가 체크포인트와 일치하는지 확인:
```bash
# 복원 전
git status

# 복원 후
git log --oneline -5
```

## 고급 기능

### 세션 메트릭

각 체크포인트는 다음을 추적합니다:
- 실행 시간
- 완료된 태스크
- 성공/실패 비율
- 토큰 사용량 (가능한 경우)
- 메모리 사용량

메트릭 보기:
```bash
aiwf-checkpoint report --detailed
```

### 체크포인트 타입

1. **session_start**: YOLO 세션 시작
2. **task_complete**: 태스크 완료 후
3. **sprint_complete**: 스프린트 마일스톤
4. **auto**: 정기 간격 체크포인트
5. **manual**: 사용자 생성 체크포인트
6. **error_recovery**: 오류 처리 후

### 병렬 세션

시스템은 병렬 YOLO 세션을 방지합니다:
- 하나의 활성 세션만 허용
- 오래된 세션은 24시간 후 자동 만료
- `--force` 플래그로 강제 재정의

## 문제 해결

### 체크포인트를 복원할 수 없음

**문제**: "Git 상태 불일치"
```bash
# 현재 Git 상태 확인
git status

# 체크포인트 Git 상태 보기
aiwf-checkpoint show cp_1234567890

# 안전한 경우 체크포인트 커밋으로 리셋
git reset --hard <checkpoint-commit>
```

**문제**: "세션이 이미 활성화됨"
```bash
# 활성 세션 확인
aiwf checkpoint status

# 필요한 경우 새 세션 강제
/project:aiwf:yolo --force
```

### 체크포인트 손상

**문제**: "잘못된 체크포인트 데이터"
```bash
# 손상된 체크포인트 제거
rm -rf .aiwf/checkpoints/cp_1234567890

# 정리 및 검증
aiwf checkpoint clean --verify
```

### 저장소 문제

**문제**: "체크포인트가 너무 많음"
```bash
# 체크포인트 수 확인
ls -la .aiwf/checkpoints/ | wc -l

# 적극적인 정리
aiwf checkpoint clean --keep 5

# 디스크 사용량 확인
du -sh .aiwf/checkpoints/
```

## 성능 고려사항

### 체크포인트 크기

- 평균 체크포인트: 10-50 KB
- 대규모 프로젝트는 더 큰 체크포인트를 가질 수 있음
- Git 상태 추적은 최소한의 오버헤드 추가

### 최적화 팁

1. **간격을 현명하게 구성**
   - 기본값: 15분
   - 무거운 작업: 5-10분
   - 가벼운 작업: 20-30분

2. **체크포인트 수 제한**
   - 기본값: 마지막 50개 유지
   - 권장: 대부분의 프로젝트에 10-20개

3. **간단한 작업에는 비활성화**
   ```yaml
   checkpoint:
     auto_checkpoint: false  # 간단한 스프린트용
   ```

## 통합 예시

### CI/CD 통합

```yaml
# .github/workflows/yolo-recovery.yml
name: YOLO 복구 확인
on:
  schedule:
    - cron: '0 9 * * 1-5'  # 평일 오전 9시

jobs:
  check-recovery:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: AIWF 설치
        run: npm install -g aiwf
      - name: 미완료 세션 확인
        run: |
          if aiwf checkpoint status | grep -q "incomplete"; then
            echo "미완료 YOLO 세션 발견"
            aiwf-checkpoint report
          fi
```

### 사용자 정의 스크립트

```bash
#!/bin/bash
# backup-checkpoints.sh

# 체크포인트 아카이브 생성
tar -czf checkpoints-$(date +%Y%m%d).tar.gz .aiwf/checkpoints/

# 클라우드 스토리지에 업로드
aws s3 cp checkpoints-*.tar.gz s3://my-bucket/aiwf-backups/

# 로컬 오래된 체크포인트 정리
aiwf checkpoint clean --keep 10
```

## 요약

AIWF 체크포인트 시스템은 자율적인 YOLO 세션을 실행할 때 안심을 제공합니다. 진행 상황을 자동으로 추적하고 쉬운 복구를 가능하게 함으로써, 개발자가 작업을 잃을 염려 없이 YOLO 모드의 힘을 활용할 수 있게 합니다. 정기적인 유지보수와 적절한 구성은 최적의 성능과 신뢰성을 보장합니다.

기억하세요: **체크포인트는 당신의 안전망입니다 - 현명하게 사용하세요!**