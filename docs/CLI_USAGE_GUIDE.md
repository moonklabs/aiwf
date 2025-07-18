# AIWF CLI 사용 가이드

## 📋 목차
1. [설치 및 초기 설정](#설치-및-초기-설정)
2. [기본 명령어](#기본-명령어)
3. [AI 도구 관리](#ai-도구-관리)
4. [캐시 관리](#캐시-관리)
5. [언어 관리](#언어-관리)
6. [Claude Code 통합 명령어](#claude-code-통합-명령어)
7. [Git 통합 및 Feature Tracking](#git-통합-및-feature-tracking)
8. [일반적인 워크플로우](#일반적인-워크플로우)
9. [문제 해결](#문제-해결)

---

## 🚀 설치 및 초기 설정

### 최초 설치
```bash
# 프로젝트 디렉토리에서 실행
cd my-project
npx aiwf

# 또는 전역 설치
npm install -g aiwf
aiwf
```

설치 과정:
1. 언어 선택 (한국어/English)
2. 자동으로 필요한 파일 다운로드
3. 프로젝트 구조 생성

### 강제 설치 (프롬프트 없이)
```bash
aiwf install --force
# 또는
aiwf install -f
```

### 설치 후 생성되는 구조
```
your-project/
├── .aiwf/                    # AIWF 프로젝트 관리
├── .claude/commands/aiwf/    # Claude Code 명령어
├── .cursor/rules/            # Cursor IDE 규칙
├── .windsurf/rules/          # Windsurf IDE 규칙
└── [기존 프로젝트 파일들]
```

---

## 📌 기본 명령어

### aiwf 메인 명령어
```bash
# 기본 설치 (install이 기본 동작)
aiwf

# 명시적 설치
aiwf install

# 강제 설치
aiwf install --force

# 도움말
aiwf --help

# 버전 확인
aiwf --version
```

---

## 🤖 AI 도구 관리

### AI 도구 설치
```bash
# 특정 AI 도구 템플릿 설치
aiwf ai-tool install claude-code
aiwf ai-tool install cursor
aiwf ai-tool install windsurf
aiwf ai-tool install github-copilot
aiwf ai-tool install augment
```

### AI 도구 목록 확인
```bash
# 설치 가능한 도구와 설치된 도구 목록
aiwf ai-tool list
```

출력 예시:
```
🤖 AI Tool Templates

claude-code
  Status: ✓ Installed
  Version: 1.0.0
  Features: custom_instructions, project_context, command_integration

cursor
  Status: Available
  Version: 1.0.0
  Features: smart_completion, aiwf_context_awareness, project_structure_recognition

windsurf
  Status: Available
  Version: 1.0.0
  Features: ai_assistance, code_generation, context_awareness
```

### AI 도구 업데이트
```bash
# 특정 도구 업데이트
aiwf ai-tool update claude-code

# 업데이트 확인
aiwf ai-tool check
aiwf ai-tool check claude-code  # 특정 도구만
```

### AI 도구 검증
```bash
# 설치 상태 검증
aiwf ai-tool verify claude-code
```

### AI 도구 버전 확인
```bash
aiwf ai-tool version claude-code
```

---

## 💾 캐시 관리

### 템플릿 다운로드 (오프라인 사용)
```bash
# 대화형 선택
aiwf cache download

# 모든 템플릿 다운로드
aiwf cache download --all

# 특정 타입만 다운로드
aiwf cache download --type ai-tools
aiwf cache download --type projects
```

### 캐시 목록 확인
```bash
# 전체 캐시 목록
aiwf cache list

# 타입별 필터
aiwf cache list --type ai-tools
```

### 캐시 정리
```bash
# 만료된 캐시만 정리 (기본 7일)
aiwf cache clean

# 모든 캐시 삭제
aiwf cache clean --all

# 특정 기간 이상된 캐시 삭제
aiwf cache clean --max-age 30  # 30일 이상
```

### 캐시 업데이트
```bash
# 업데이트 확인
aiwf cache update

# 업데이트 확인 후 자동 설치
aiwf cache update --install
```

### 캐시 상태 확인
```bash
aiwf cache status
```

출력 예시:
```
📊 AIWF Cache Status

Cache Location: /Users/username/.aiwf-cache
Network Status: Online

Cache Statistics:
  Total Size: 24.3 MB
  Templates: 12
  AI Tools: 5
  Oldest Entry: 2024-01-13

By Status:
  Valid: 10 templates
  Expired: 2 templates
  Corrupted: 0 templates
```

---

## 🌐 언어 관리

### 언어 상태 확인
```bash
# 현재 언어 설정 확인
aiwf-lang
aiwf-lang status
aiwf-lang s  # 별칭
```

### 언어 변경
```bash
# 한국어로 변경
aiwf-lang set ko

# 영어로 변경
aiwf-lang set en

# 대화형 선택
aiwf-lang set

# 자동 감지 설정
aiwf-lang set --auto-detect true
aiwf-lang set --auto-detect false
```

### 언어 초기화
```bash
# 자동 감지 모드로 리셋
aiwf-lang reset
aiwf-lang r  # 별칭
```

---

## 🤝 Claude Code 통합 명령어

Claude Code에서 사용할 수 있는 `/aiwf_*` 명령어들:

### 프로젝트 초기화
```
/aiwf_initialize          # 프로젝트 초기 설정
/aiwf_prime              # 프로젝트 컨텍스트 로드
```

### 계획 및 작업 관리
```
/aiwf_create_milestone_plan      # 마일스톤 계획 생성
/aiwf_create_sprints_from_milestone  # 스프린트 생성
/aiwf_create_sprint_tasks        # 스프린트 작업 생성
/aiwf_create_general_task        # 일반 작업 생성
/aiwf_create_prd                 # 제품 요구사항 문서 생성
```

### 개발 작업
```
/aiwf_do_task                    # 작업 실행
/aiwf_commit                     # Git 커밋 생성
/aiwf_test                       # 테스트 실행
```

### 코드 리뷰
```
/aiwf_code_review                # 코드 리뷰
/aiwf_project_review             # 프로젝트 전체 리뷰
/aiwf_testing_review             # 테스트 커버리지 리뷰
/aiwf_discuss_review             # 리뷰 결과 토론
```

### AI 페르소나
```
/project:aiwf:ai_persona:architect      # 아키텍트 페르소나
/project:aiwf:ai_persona:backend        # 백엔드 개발자
/project:aiwf:ai_persona:frontend       # 프론트엔드 개발자
/project:aiwf:ai_persona:security       # 보안 전문가
/project:aiwf:ai_persona:data_analyst   # 데이터 분석가
/project:aiwf:ai_persona:status         # 현재 페르소나 상태
/project:aiwf:ai_persona:auto on        # 자동 페르소나 전환
```

### GitHub 통합
```
/aiwf_pr_create                  # Pull Request 생성
/aiwf_issue_create               # GitHub Issue 생성
```

### 고급 기능
```
/aiwf_yolo                       # 자동 작업 실행
/aiwf_infinite                   # 연속 작업 모드
/aiwf_ultrathink_code_advanced   # 고급 코드 분석
```

---

## 🔗 Git 통합 및 Feature Tracking

### Git Hooks 설치
```bash
# 프로젝트 루트에서 실행
./hooks/install-hooks.sh
```

### Feature 관련 스크립트
```bash
# Git 히스토리에서 Feature ID 스캔
node commands/scan-git-history.js --since 2025-01-01

# 특정 Feature의 커밋 동기화
node commands/sync-feature-commits.js FL001

# Feature 커밋 리포트 생성
node commands/feature-commit-report.js --format markdown
```

### Git 커밋 시 자동 Feature 추적
```bash
# Feature ID가 포함된 커밋
git commit -m "feat(FL001): 인증 시스템 구현"
# post-commit hook이 자동으로 Feature Ledger 업데이트
```

---

## 💡 일반적인 워크플로우

### 1. 새 프로젝트 시작
```bash
# 1. 프로젝트 생성
mkdir my-awesome-project
cd my-awesome-project

# 2. AIWF 설치
npx aiwf

# 3. Git hooks 설치
git init
./hooks/install-hooks.sh

# 4. AI 도구 설정
aiwf ai-tool install claude-code
aiwf ai-tool install cursor

# 5. Claude Code에서 프로젝트 열기
# 그 후 /aiwf_initialize 실행
```

### 2. 기존 프로젝트에 추가
```bash
# 1. 프로젝트 디렉토리로 이동
cd existing-project

# 2. AIWF 설치
npx aiwf

# 3. 기존 구조와 통합
/aiwf_prime  # Claude Code에서
```

### 3. 팀 협업 설정
```bash
# 1. 언어 설정 통일
aiwf-lang set ko  # 또는 en

# 2. AI 도구 표준화
aiwf ai-tool install claude-code
aiwf ai-tool install cursor

# 3. Git hooks 설정
./hooks/install-hooks.sh

# 4. .gitignore에 추가
echo ".aiwf/backup_*" >> .gitignore
echo "token-data/" >> .gitignore
```

### 4. 오프라인 개발 준비
```bash
# 1. 모든 템플릿 다운로드
aiwf cache download --all

# 2. 캐시 상태 확인
aiwf cache status

# 3. 오프라인에서도 정상 작동
# 캐시된 템플릿 자동 사용
```

---

## 🔧 문제 해결

### 설치 실패 시
```bash
# 1. 강제 재설치
aiwf install --force

# 2. 캐시 정리 후 재시도
aiwf cache clean --all
aiwf install

# 3. 수동 정리
rm -rf .aiwf .claude .cursor .windsurf
aiwf install
```

### 언어 관련 문제
```bash
# 언어 설정 초기화
aiwf-lang reset

# 수동으로 언어 설정
aiwf-lang set ko --auto-detect false
```

### 네트워크 문제
```bash
# 1. 캐시 모드 사용
aiwf cache download --all  # 온라인일 때 미리 실행

# 2. 프록시 설정 (필요시)
export HTTPS_PROXY=http://proxy.company.com:8080
aiwf install
```

### 권한 문제
```bash
# 실행 권한 부여
chmod +x hooks/install-hooks.sh
chmod +x hooks/post-commit
chmod +x index.js
chmod +x language-cli.js
```

### 업데이트 후 문제 발생
```bash
# 백업에서 복원
# 백업 위치: .aiwf/backup_YYYY-MM-DD_HHMMSS
cp -r .aiwf/backup_2024-01-20_143052/* .aiwf/
```

---

## 📚 추가 리소스

- **GitHub 저장소**: https://github.com/aiwf/aiwf
- **문제 보고**: https://github.com/aiwf/aiwf/issues
- **문서**: [COMMANDS_GUIDE.md](docs/COMMANDS_GUIDE.md)
- **한국어 문서**: [COMMANDS_GUIDE.ko.md](docs/COMMANDS_GUIDE.ko.md)

---

## 🎯 빠른 참조

```bash
# 설치
npx aiwf

# AI 도구
aiwf ai-tool install claude-code
aiwf ai-tool list

# 캐시
aiwf cache download --all
aiwf cache status

# 언어
aiwf-lang set ko
aiwf-lang status

# Git hooks
./hooks/install-hooks.sh
```