# Git-Feature 통합 가이드

이 문서는 AIWF의 Git 연동 Feature 추적 시스템 사용법을 설명합니다.

## 개요

Git-Feature 통합 시스템은 Git 커밋과 Feature Ledger를 자동으로 연결하여, 개발 진행 상황을 효과적으로 추적할 수 있게 합니다.

## 주요 기능

1. **커밋 메시지 파싱**: 다양한 형식의 Feature ID 자동 인식
2. **자동 동기화**: Git hooks를 통한 실시간 Feature 업데이트
3. **히스토리 스캔**: 기존 커밋 히스토리와 Feature 연결
4. **리포트 생성**: Feature-커밋 매핑 리포트 자동 생성

## 커밋 메시지 규칙

### 지원하는 Feature ID 형식

```bash
# 직접 참조
git commit -m "FL001 사용자 인증 기능 구현"

# 대괄호 참조
git commit -m "[FL001] 로그인 폼 스타일 수정"

# Conventional Commit 형식
git commit -m "feat(FL001): JWT 토큰 발급 로직 추가"
git commit -m "fix(FL001): 로그인 오류 수정"

# 해시 참조
git commit -m "Update authentication flow #FL001"

# 여러 Feature 참조
git commit -m "FL001, FL002 관련 공통 유틸리티 추가"
```

### 브랜치 명명 규칙

```bash
# Feature 브랜치 형식
git checkout -b feature/FL001-user-authentication
git checkout -b feature/FL002-dashboard-redesign
```

## 명령어 사용법

### 1. sync_feature_commits - Feature 동기화

```bash
# 특정 Feature 동기화
node claude-code/aiwf/ko/commands/sync_feature_commits.js FL001

# 모든 활성 Feature 동기화
node claude-code/aiwf/ko/commands/sync_feature_commits.js --all

# 최근 100개 커밋에서 Feature 찾기
node claude-code/aiwf/ko/commands/sync_feature_commits.js --recent 100

# 특정 날짜 이후 커밋 검색
node claude-code/aiwf/ko/commands/sync_feature_commits.js --since 2025-01-01

# 상세 로그 출력
node claude-code/aiwf/ko/commands/sync_feature_commits.js --verbose
```

### 2. scan_git_history - 히스토리 스캔

```bash
# 기본 스캔 (2025-01-01부터)
node claude-code/aiwf/ko/commands/scan_git_history.js

# 날짜 범위 지정
node claude-code/aiwf/ko/commands/scan_git_history.js --since 2024-01-01 --until 2024-12-31

# 특정 Feature만 스캔
node claude-code/aiwf/ko/commands/scan_git_history.js --feature FL001

# Dry-run 모드 (실제 업데이트 없음)
node claude-code/aiwf/ko/commands/scan_git_history.js --dry-run

# 누락된 Feature 파일 자동 생성
node claude-code/aiwf/ko/commands/scan_git_history.js --create-missing
```

### 3. feature_commit_report - 리포트 생성

```bash
# 기본 Markdown 리포트 생성
node claude-code/aiwf/ko/commands/feature_commit_report.js

# 특정 Feature 리포트
node claude-code/aiwf/ko/commands/feature_commit_report.js --feature FL001

# 활성 Feature만 포함
node claude-code/aiwf/ko/commands/feature_commit_report.js --status active

# JSON 형식으로 출력
node claude-code/aiwf/ko/commands/feature_commit_report.js --format json --output report.json

# HTML 형식 + 상세 정보
node claude-code/aiwf/ko/commands/feature_commit_report.js --format html --detailed --output report.html

# 타임라인 뷰 포함
node claude-code/aiwf/ko/commands/feature_commit_report.js --timeline
```

## Git Hooks 설정

### 자동 설치

```bash
# 설치 스크립트 실행
./claude-code/aiwf/ko/hooks/install-hooks.sh

# 환경 변수 설정 (활성화)
export AIWF_HOOKS_ENABLED=true

# 상세 로그 활성화 (선택사항)
export AIWF_HOOKS_VERBOSE=true

# 영구 설정 (~/.bashrc 또는 ~/.zshrc에 추가)
echo 'export AIWF_HOOKS_ENABLED=true' >> ~/.bashrc
```

### 수동 설치

```bash
# post-commit hook 복사
cp claude-code/aiwf/ko/hooks/post-commit .git/hooks/
chmod +x .git/hooks/post-commit

# 환경 변수 설정
export AIWF_HOOKS_ENABLED=true
```

### Hook 동작 확인

```bash
# Feature ID를 포함한 커밋 생성
git add .
git commit -m "feat(FL001): 새로운 기능 추가"

# 콘솔에 다음과 같은 메시지가 표시됩니다:
# 🔄 AIWF Feature Ledger 동기화 중...
# ✅ Feature ID 발견: FL001
# 📝 FL001 동기화 중...
# ✅ FL001 동기화 완료
# ✨ Feature Ledger 동기화 완료!
```

## 워크플로우 예시

### 1. 새 Feature 시작

```bash
# 1. Feature Ledger 생성
/project:aiwf:create_feature_ledger "User Authentication"

# 2. Feature 브랜치 생성
git checkout -b feature/FL001-user-authentication

# 3. 개발 및 커밋
git add src/auth/*
git commit -m "feat(FL001): 사용자 인증 모듈 구현"

# 4. Feature 자동 업데이트 확인
cat .aiwf/06_FEATURE_LEDGERS/active/FL001_User_Authentication.md
```

### 2. 기존 프로젝트에 적용

```bash
# 1. Git 히스토리 스캔
node claude-code/aiwf/ko/commands/scan_git_history.js --since 2024-01-01

# 2. 누락된 Feature 확인 및 생성
node claude-code/aiwf/ko/commands/scan_git_history.js --create-missing

# 3. 리포트 생성
node claude-code/aiwf/ko/commands/feature_commit_report.js --detailed

# 4. Git hooks 설치
./claude-code/aiwf/ko/hooks/install-hooks.sh
export AIWF_HOOKS_ENABLED=true
```

### 3. 진행 상황 모니터링

```bash
# 전체 Feature 상태 확인
node claude-code/aiwf/ko/commands/feature_commit_report.js

# 특정 Feature 상세 정보
node claude-code/aiwf/ko/commands/sync_feature_commits.js FL001 --verbose

# 최근 활동 확인
node claude-code/aiwf/ko/commands/sync_feature_commits.js --recent 50 --verbose
```

## 문제 해결

### Git hooks가 실행되지 않음

```bash
# 환경 변수 확인
echo $AIWF_HOOKS_ENABLED

# Hook 파일 권한 확인
ls -la .git/hooks/post-commit

# 수동으로 동기화 실행
node claude-code/aiwf/ko/commands/sync_feature_commits.js --all
```

### Feature ID가 인식되지 않음

```bash
# 커밋 메시지 패턴 확인
git log --oneline | grep "FL[0-9]\{3\}"

# 지원하는 형식 사용
git commit -m "feat(FL001): 기능 설명"  # 권장
git commit -m "[FL001] 기능 설명"       # 가능
git commit -m "FL001 기능 설명"         # 가능
```

### 동기화 오류

```bash
# Feature 파일 존재 확인
find .aiwf/06_FEATURE_LEDGERS -name "FL001*"

# 수동으로 Feature 파일 생성
/project:aiwf:create_feature_ledger "Feature Name"

# 다시 동기화 시도
node claude-code/aiwf/ko/commands/sync_feature_commits.js FL001
```

## 모범 사례

1. **일관된 커밋 메시지**: Conventional Commit 형식 사용 권장
2. **브랜치 전략**: Feature별 브랜치 생성 및 명명 규칙 준수
3. **정기적 동기화**: 주기적으로 `--all` 옵션으로 전체 동기화
4. **리포트 활용**: 스프린트 종료 시 리포트 생성하여 진행 상황 공유
5. **Hook 활성화**: 팀 전체가 Git hooks를 활성화하여 일관성 유지

## 추가 리소스

- [Feature Ledger 시스템 사양](/.aiwf/02_REQUIREMENTS/M02_Context_Engineering_Enhancement/SPECS_Feature_Ledger_System.md)
- [Git 통합 사양](/.aiwf/06_FEATURE_LEDGERS/FEATURE_GIT_INTEGRATION.md)
- [통합 가이드](/.aiwf/06_FEATURE_LEDGERS/FEATURE_INTEGRATION_GUIDE.md)