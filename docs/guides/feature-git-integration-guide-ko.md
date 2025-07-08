[Read in English](feature-git-integration-guide.md)

# Feature-Git 연동 설정 가이드

## 개요

Feature-Git 연동 시스템은 AIWF의 Feature Ledger와 Git 커밋을 자동으로 연결하여 기능 개발 진행 상황을 추적하고 관리하는 도구입니다. 커밋 메시지 파싱, 자동 상태 업데이트, 진행률 추적 등을 통해 프로젝트 관리를 자동화합니다.

## 주요 기능

### 1. 자동 Feature 추적
- Git 커밋과 Feature ID 자동 연결
- 커밋 메시지에서 Feature 정보 추출
- Feature 상태 자동 업데이트

### 2. Pre-commit Hook
- 커밋 전 Feature ID 검증
- 커밋 메시지 형식 확인
- Feature Ledger 자동 업데이트

### 3. 진행률 관리
- 커밋 수 기반 진행률 계산
- Feature별 기여도 추적
- 팀 생산성 메트릭 생성

## 설치 및 설정

### 1. 기본 설치

**자동 설치 (권장)**:
```bash
/project:aiwf:install_git_hooks
# 또는
/프로젝트:aiwf:git_훅_설치
```

**수동 설치**:
```bash
# Git hooks 디렉토리로 이동
cd .git/hooks

# Pre-commit hook 생성
cat > pre-commit << 'EOF'
#!/bin/bash
# AIWF Feature-Git Integration Hook

# 커밋 메시지 파일 경로
COMMIT_MSG_FILE="$1"

# AIWF 커밋 검증 실행
node .aiwf/scripts/validate-commit.js "$COMMIT_MSG_FILE"

# 검증 결과 반환
exit $?
EOF

# 실행 권한 부여
chmod +x pre-commit
```

### 2. 설정 파일 구성

`.aiwf/config/git-integration.json`:
```json
{
  "featureGitIntegration": {
    "enabled": true,
    "autoLinkCommits": true,
    "updateFeatureStatus": true,
    "commitMessagePattern": "^(feat|fix|docs|style|refactor|test|chore)\\(([A-Z]\\d{3})\\): .+$",
    "featureIdPattern": "[A-Z]\\d{3}",
    "hooks": {
      "preCommit": true,
      "postCommit": true,
      "prePush": false
    },
    "statusMapping": {
      "feat": "in_progress",
      "fix": "in_progress",
      "docs": "in_progress",
      "test": "testing",
      "chore": "in_progress",
      "refactor": "in_progress",
      "style": "in_progress"
    }
  }
}
```

### 3. Feature Ledger 초기화

```bash
/project:aiwf:init_feature_ledger
# 또는
/프로젝트:aiwf:기능_원장_초기화
```

## 커밋 메시지 형식

### 기본 형식
```
<type>(<feature-id>): <description>

[optional body]

[optional footer]
```

### 타입 종류
- `feat`: 새로운 기능 추가
- `fix`: 버그 수정
- `docs`: 문서 수정
- `style`: 코드 포맷팅, 세미콜론 누락 등
- `refactor`: 코드 리팩토링
- `test`: 테스트 추가 또는 수정
- `chore`: 빌드 프로세스 또는 보조 도구 변경

### Feature ID 형식
- 형식: `[A-Z][0-9]{3}` (예: F001, B023, T456)
- 프로젝트별 커스터마이징 가능

### 예시

**기본 커밋**:
```bash
git commit -m "feat(F001): 사용자 인증 시스템 구현"
```

**상세 설명 포함**:
```bash
git commit -m "fix(B023): 로그인 시 세션 유지 문제 해결

- 세션 타임아웃 설정 수정
- 쿠키 도메인 설정 추가
- 리프레시 토큰 로직 개선"
```

**여러 Feature 참조**:
```bash
git commit -m "refactor(F001,F002): 인증 모듈 통합

F001의 로그인 로직과 F002의 권한 시스템을 통합하여
코드 중복을 제거하고 유지보수성을 향상시켰습니다."
```

## link_feature_commit 명령어

### 기본 사용법
```bash
/project:aiwf:link_feature_commit <commit-hash> <feature-id>
# 또는
/프로젝트:aiwf:기능_커밋_연결 <커밋해시> <기능ID>
```

### 예시
```bash
# 특정 커밋을 Feature에 연결
/project:aiwf:link_feature_commit abc123def F001

# 최근 커밋 연결
/project:aiwf:link_feature_commit HEAD F002

# 범위 지정 연결
/project:aiwf:link_feature_commit abc123..def456 F003
```

### 일괄 연결
```bash
# 여러 커밋을 한 번에 연결
/project:aiwf:link_feature_commits --batch
"abc123 -> F001
 def456 -> F002
 ghi789 -> F003"
```

## Feature 상태 자동 업데이트

### 상태 전환 규칙

1. **첫 커밋**: `planned` → `in_progress`
2. **test 타입 커밋**: → `testing`
3. **fix 후 test 통과**: → `ready_for_review`
4. **PR 머지**: → `completed`

### 커스텀 규칙 설정
```json
{
  "stateTransitions": {
    "planned": {
      "feat": "in_progress",
      "fix": "in_progress"
    },
    "in_progress": {
      "test": "testing",
      "docs": "documenting"
    },
    "testing": {
      "fix": "in_progress",
      "feat": "ready_for_review"
    }
  }
}
```

## 고급 설정

### 1. 커밋 메시지 템플릿

`.gitmessage` 파일 생성:
```
# <type>(<feature-id>): <subject>
# 
# <body>
# 
# Feature: <feature-description>
# Related: <related-features>
# Closes: <issue-numbers>
```

Git 설정:
```bash
git config commit.template .gitmessage
```

### 2. 자동 Feature ID 추천

```bash
# 현재 브랜치명에서 Feature ID 추출
/project:aiwf:suggest_feature_id
```

### 3. 커밋 후 자동 작업

`.aiwf/hooks/post-commit`:
```bash
#!/bin/bash
# Feature Ledger 업데이트
node .aiwf/scripts/update-feature-ledger.js

# 진행률 계산
node .aiwf/scripts/calculate-progress.js

# 팀에 알림 (선택사항)
# node .aiwf/scripts/notify-team.js
```

## 워크플로우 통합

### 1. 브랜치 전략과 연동

**Feature 브랜치 생성**:
```bash
# Feature ID로 브랜치 생성
git checkout -b feature/F001-user-authentication

# AIWF가 자동으로 Feature ID 인식
```

**브랜치 규칙**:
- `feature/[FEATURE-ID]-description`
- `bugfix/[BUG-ID]-description`
- `hotfix/[HOTFIX-ID]-description`

### 2. PR/MR 통합

**PR 템플릿** (`.github/pull_request_template.md`):
```markdown
## Feature ID: [FEATURE-ID]

### 변경 사항
- [ ] 기능 구현 완료
- [ ] 테스트 작성 완료
- [ ] 문서 업데이트 완료

### Feature Ledger 업데이트
- 현재 상태: `in_progress`
- 목표 상태: `completed`
- 진행률: X%

### 관련 커밋
- commit1: description
- commit2: description
```

### 3. CI/CD 파이프라인 통합

**GitHub Actions 예시**:
```yaml
name: AIWF Feature Tracking

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  feature-tracking:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Validate Commit Message
      run: |
        node .aiwf/scripts/validate-commit.js ${{ github.event.head_commit.message }}
    
    - name: Update Feature Ledger
      run: |
        node .aiwf/scripts/update-feature-ledger.js \
          --commit ${{ github.sha }} \
          --message "${{ github.event.head_commit.message }}"
    
    - name: Calculate Progress
      run: |
        node .aiwf/scripts/calculate-progress.js
    
    - name: Generate Report
      run: |
        node .aiwf/scripts/generate-feature-report.js
```

## 보고서 및 분석

### 1. Feature 진행 상황 보고서

```bash
/project:aiwf:feature_report
# 또는
/프로젝트:aiwf:기능_보고서
```

**출력 예시**:
```
Feature Progress Report
=======================

Active Features:
- F001: User Authentication (75% complete)
  - 12 commits, 3 contributors
  - Status: testing
  - Last update: 2 hours ago

- F002: Payment Integration (45% complete)
  - 8 commits, 2 contributors
  - Status: in_progress
  - Last update: 1 day ago

Completed Features (Last 7 days):
- F003: Dashboard UI (100% complete)
- F004: API Documentation (100% complete)

Team Velocity: 4.5 features/week
```

### 2. 커밋 분석

```bash
/project:aiwf:analyze_commits --period 7d
```

**분석 내용**:
- 커밋 빈도
- Feature별 커밋 분포
- 개발자별 기여도
- 시간대별 활동 패턴

## 문제 해결

### 1. Hook이 작동하지 않음

**확인 사항**:
```bash
# Hook 파일 존재 확인
ls -la .git/hooks/pre-commit

# 실행 권한 확인
test -x .git/hooks/pre-commit && echo "실행 가능" || echo "실행 불가"

# Hook 내용 확인
cat .git/hooks/pre-commit
```

**해결 방법**:
```bash
# 권한 재설정
chmod +x .git/hooks/pre-commit

# Hook 재설치
/project:aiwf:reinstall_hooks
```

### 2. Feature ID 인식 실패

**증상**: 커밋은 되지만 Feature가 업데이트되지 않음

**해결**:
1. 커밋 메시지 형식 확인
2. Feature ID 패턴 설정 확인
3. Feature Ledger 파일 권한 확인

### 3. 상태 업데이트 오류

**로그 확인**:
```bash
tail -f .aiwf/logs/git-integration.log
```

**수동 업데이트**:
```bash
/project:aiwf:update_feature_status F001 in_progress
```

## 모범 사례

### 1. 일관된 커밋 메시지
- 팀 전체가 동일한 형식 사용
- Feature ID는 항상 포함
- 명확하고 설명적인 메시지 작성

### 2. 작은 단위 커밋
- 하나의 커밋은 하나의 논리적 변경
- 리뷰와 추적이 용이
- 문제 발생 시 롤백 용이

### 3. 정기적인 동기화
```bash
# 매일 Feature Ledger 동기화
/project:aiwf:sync_features

# 주간 보고서 생성
/project:aiwf:weekly_feature_report
```

### 4. 브랜치와 Feature 매핑
- 브랜치명에 Feature ID 포함
- PR 제목에 Feature ID 명시
- 머지 커밋에도 Feature ID 유지

## 팀 협업 시나리오

### 1. 새 Feature 시작
```bash
# 1. Feature 생성
/project:aiwf:create_feature "사용자 프로필 기능"
# Returns: F005 created

# 2. 브랜치 생성
git checkout -b feature/F005-user-profile

# 3. 첫 커밋
git commit -m "feat(F005): 사용자 프로필 기본 구조 생성"
```

### 2. 협업 개발
```bash
# 개발자 A
git commit -m "feat(F005): 프로필 이미지 업로드 구현"

# 개발자 B
git commit -m "test(F005): 프로필 업로드 테스트 추가"

# 진행 상황 확인
/project:aiwf:feature_status F005
```

### 3. 완료 및 머지
```bash
# PR 생성 시
# Title: "feat(F005): 사용자 프로필 기능 완성"

# 머지 후 자동으로
# - Feature 상태 → completed
# - 진행률 → 100%
# - 완료 시간 기록
```

## 결론

Feature-Git 연동 시스템은 개발 프로세스와 프로젝트 관리를 효과적으로 통합합니다. 자동화된 추적과 보고 기능을 통해 팀의 생산성을 향상시키고, 프로젝트 진행 상황을 실시간으로 파악할 수 있습니다.

지속적인 사용과 팀 피드백을 통해 워크플로우를 개선하고 최적화하시기 바랍니다.