# Moonklabs 명령어 가이드

이 가이드는 사용 가능한 Moonklabs 명령어와 이를 프로젝트에서 효과적으로 사용하는 방법을 설명합니다.

## 명령어 개요

Moonklabs 명령어는 `/project:moonklabs:<command_name> [arguments]` 형식을 따릅니다.

## 설정 및 컨텍스트 명령어

### 🚀 `/project:moonklabs:initialize`

**목적**: 새 프로젝트 또는 기존 프로젝트에서 Moonklabs 초기화

**사용법**:

```
/project:moonklabs:initialize
```

**동작**:

1. Scans and analyzes your project
2. Asks for confirmation about project type
3. Checks for existing Moonklabs documents
4. Guides you through document creation (imports existing docs or creates new ones)
5. Creates your first milestone
6. Generates project manifest

**사용 시기**: 프로젝트에서 Moonklabs를 처음 설정할 때(현재 ForeLoop에는 이미 설정되어 있습니다!)

---

### 🧠 `/project:moonklabs:prime`

**목적**: 코딩 세션 시작 시 프로젝트 컨텍스트를 로드합니다

**사용법**:

```
/project:moonklabs:prime
```

**동작**:

- 프로젝트 매니페스트를 읽음
- 현재 마일스톤 및 스프린트 정보를 로드
- 활성 작업을 식별
- 빠른 상태 개요를 제공

**사용 시기**: 코딩 세션을 시작할 때 전체 상황을 빠르게 파악할 때

## 계획 명령어

### 📅 `/project:moonklabs:create_sprints_from_milestone`

**목적**: 마일스톤을 관리 가능한 스프린트로 분해

**사용법**:

```
/project:moonklabs:create_sprints_from_milestone 001_MVP_FOUNDATION
```

**동작**:

1. 마일스톤 요구사항을 분석
2. 관련 요구사항을 약 1주 길이의 스프린트로 그룹화
3. 스프린트 폴더 및 META 파일 생성
4. 스프린트 정보를 매니페스트에 업데이트

**사용 시기**: 새로운 마일스톤을 생성한 후

---

### 📋 `/project:moonklabs:create_sprint_tasks`

**목적**: 스프린트를 위한 상세 작업 분해 생성

**사용법**:

```
/project:moonklabs:create_sprint_tasks S01
# or for specific sprint:
/project:moonklabs:create_sprint_tasks S02_001_MVP_FOUNDATION
```

**동작**:

1. 스프린트 요구사항을 분석
2. 이를 구체적이고 실행 가능한 작업으로 분해
3. 목표가 명확한 작업 파일을 생성
4. 작업 간 종속성을 처리

**사용 시기**: 각 스프린트 시작 시

---

### ✏️ `/project:moonklabs:create_general_task`

**목적**: 스프린트와 연결되지 않은 독립형 작업 생성

**사용법**:

```
/project:moonklabs:create_general_task
# Then describe your task when prompted
```

**예시 작업**:

- "Fix memory leak in physics engine"
- "Update documentation for API changes"
- "Refactor database connection pooling"

**사용 시기**: 유지보수, 버그 수정 또는 스프린트 범위를 벗어난 작업에 사용

## Development Commands

### 💻 `/project:moonklabs:do_task`

**목적**: 특정 작업을 실행

**사용법**:

```
/project:moonklabs:do_task
# 사용 가능한 작업을 나열하고 선택을 요청

# 또는 작업을 직접 지정:
/project:moonklabs:do_task T001_S01_setup_tauri
```

**동작**:

1. Reads task requirements
2. Implements the solution
3. Runs tests if applicable
4. Updates task status
5. Creates necessary files/changes

**사용 시기**: Ready to work on a specific task

---

### 📝 `/project:moonklabs:commit`

**목적**: Create well-structured git commits

**사용법**:

```
/project:moonklabs:commit
# 변경 사항을 검토하고 커밋을 생성

# 또는 특정 작업에 대해:
/project:moonklabs:commit T001_S01_setup_tauri

# 리뷰와 함께:
/project:moonklabs:commit --review
```

**동작**:

1. Analyzes changes made
2. Groups related changes
3. Creates meaningful commit messages
4. Links commits to tasks/requirements
5. Optionally runs code review first

**사용 시기**: After completing work you want to save

---

### 🧪 `/project:moonklabs:test`

**목적**: Run tests and fix common issues

**사용법**:

```
/project:moonklabs:test
# 모든 테스트 실행

/project:moonklabs:test unit
# 특정 테스트 스위트 실행
```

**동작**:

1. Identifies test commands from package.json
2. Runs appropriate tests
3. Fixes common issues (missing deps, configs)
4. Reports results clearly

**사용 시기**: Before committing or when tests fail

## 코드 리뷰 명령어

### 🔍 `/project:moonklabs:code_review`

**목적**: Review code against specifications

**사용법**:

```
/project:moonklabs:code_review
# 커밋되지 않은 변경 사항 검토

/project:moonklabs:code_review src/app/components/GameCanvas.tsx
# Reviews specific file
```

**동작**:

1. Checks code against requirements
2. Verifies patterns and conventions
3. Identifies bugs and issues
4. Suggests improvements
5. Ensures spec compliance

**사용 시기**: Before committing important changes

---

### 📊 `/project:moonklabs:project_review`

**목적**: Comprehensive project health check

**사용법**:

```
/project:moonklabs:project_review
```

**동작**:

1. Reviews overall architecture
2. Checks technical debt
3. Analyzes progress vs. timeline
4. Identifies risks and blockers
5. Suggests improvements

**사용 시기**: Weekly or at sprint boundaries

---

### 🧪 `/project:moonklabs:testing_review`

**목적**: Analyze test coverage and quality

**사용법**:

```
/project:moonklabs:testing_review
```

**동작**:

1. Reviews test coverage
2. Identifies missing test cases
3. Checks test quality
4. Suggests improvements

**사용 시기**: After implementing features

---

### 💬 `/project:moonklabs:discuss_review`

**목적**: Technical discussion about review findings

**사용법**:

```
/project:moonklabs:discuss_review
# After running another review command
```

**동작**:

- Provides detailed explanations
- Discusses trade-offs
- Suggests solutions
- Answers questions

**사용 시기**: To understand review feedback better

## 자동화 명령어

### 🚀 `/project:moonklabs:yolo`

**목적**: 자율적인 작업 실행

**사용법**:

```
/project:moonklabs:yolo
# 모든 열린 작업을 순차 실행

/project:moonklabs:yolo S02
# 특정 스프린트를 순차 실행

/project:moonklabs:yolo sprint-all
# 모든 스프린트를 순차적으로 완료할 때까지 실행

/project:moonklabs:yolo milestone-all
# 모든 마일스톤과 관련된 스프린트, 작업을 완료할 때까지 실행

/project:moonklabs:yolo S03 worktree
/project:moonklabs:yolo sprint-all worktree
# Git worktree 환경에서 실행 시 브랜치 생성 없이 직접 푸시
```

**동작**:

1. 열려 있는 작업을 식별합니다.
2. 순서대로 실행합니다.
3. 종속성을 처리합니다.
4. 완료된 작업을 커밋합니다.
5. 진행 상황을 업데이트합니다.

**YOLO 모드 특징:**

- ⚡ 연속 실행: 각 작업 완료 후 즉시 다음 작업으로 이동
- 🎯 완전 자율: 사용자 입력이나 확인 없이 진행
- 📊 진행률 추적: 현재 진행 상황을 실시간으로 보고
- 🛡️ 안전 장치: 테스트 실패나 치명적 오류 시 중단
- 📈 상세 리포트: 완료 시 전체 프로젝트 상태 리포트 제공

**⚠️ 주의사항:**

- 중요한 파일(.env, 마이그레이션) 수정 시 중단됩니다
- 테스트가 10% 이상 실패하면 평가 후 진행 여부를 결정합니다
- 데이터베이스 스키마 변경이 필요하면 중단됩니다

**사용 시기**: 자율적인 진행을 원할 때

## 추가/고급 명령어

### 📌 `/project:moonklabs:pr_create`

**목적**: Pull Request를 생성하고 템플릿을 적용하여 변경 사항을 정리합니다.

**사용법**:

```
/project:moonklabs:pr_create "Add authentication to API"
```

---

### 🗂️ `/project:moonklabs:issue_create`

**목적**: GitHub Issue를 생성하여 버그 리포트·기능 요청을 기록합니다.

**사용법**:

```
/project:moonklabs:issue_create "Bug: login fails on Safari"
```

---

### 🛠️ `/project:moonklabs:plan_milestone`

**목적**: 대화형 프로세스로 신규 마일스톤을 계획하고 `.moonklabs/02_REQUIREMENTS/` 구조를 자동 생성합니다.

---

### 📈 `/project:moonklabs:mermaid`

**목적**: 코드베이스를 분석하여 Mermaid 다이어그램(UML/시퀀스 등)을 생성합니다.

---

### ♾️ `/project:moonklabs:infinite`

**목적**: 명세에 따라 무한(또는 지정 횟수) 반복 결과물을 생성하는 고급 반복 생성 루프를 실행합니다.

---

### 🤖 `/project:moonklabs:tm-run-all-subtask`

**목적**: Task Master의 모든 서브태스크를 한 번에 실행하여 진행 상황을 자동화합니다.

---

### 🧠 `/project:moonklabs:ultrathink_general`

**목적**: 폭넓은 문제를 심층 분석하기 위한 울트라 씽킹(General) 세션을 시작합니다.

---

### 🧠 `/project:moonklabs:ultrathink_code_basic`

**목적**: 코드 기반 문제를 기본 수준에서 심층 분석하는 울트라 씽킹 세션을 시작합니다.

---

### 🧠 `/project:moonklabs:ultrathink_code_advanced`

**목적**: 복잡한 코드·아키텍처 문제를 고급 수준에서 심층 분석하는 울트라 씽킹 세션을 시작합니다.

---

### ⚙️ `/project:moonklabs:prime_context`

**목적**: 프로젝트 컨텍스트(파일 목록·주요 문서)를 빠르게 불러와 프라임합니다.

## 모범 사례

### 일일 워크플로

```bash
# Start of day
/project:moonklabs:prime

# Work on tasks
/project:moonklabs:do_task
/project:moonklabs:test
/project:moonklabs:commit

# End of day
/project:moonklabs:project_review
```

### 스프린트 워크플로

```bash
# Sprint planning
/project:moonklabs:create_sprint_tasks S02

# Sprint execution
/project:moonklabs:do_task T001_S02_first_task
/project:moonklabs:do_task T002_S02_second_task
/project:moonklabs:commit --review

# Sprint review
/project:moonklabs:project_review
```

### 빠른 수정

```bash
# Bug fix workflow
/project:moonklabs:create_general_task
# Describe: "Fix memory leak in /src/foo.bar"
/project:moonklabs:do_task T003
/project:moonklabs:test
/project:moonklabs:commit T003
```

## 팁 & 트릭

1. **Use YOLO for routine tasks**: Great for implementing straightforward features
2. **Always prime first**: Ensures commands have proper context
3. **Review before major commits**: Catch issues early
4. **Create general tasks for bugs**: Keeps them trackable
5. **Use task-specific commits**: Better traceability

## 명령어 안전 장치

Moonklabs commands include safety features:

- Won't delete critical files
- Asks before schema changes
- Validates changes against specs
- Maintains code quality standards
- Creates incremental commits

## 도움 받기

If you need help with a command:

1. Run the command without arguments for usage info
2. Check this guide
3. Look at task examples in `.moonklabs/`
4. Review the command source in `.claude/commands/`
