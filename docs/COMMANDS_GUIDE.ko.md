# AIWF (AI Workflow Framework) 명령어 가이드

이 가이드는 사용 가능한 AIWF 명령어와 이를 프로젝트에서 효과적으로 사용하는 방법을 설명합니다.

> **다국어 지원**: AIWF는 한국어와 영어를 모두 지원합니다. 설치 시 선택한 언어에 따라 해당 언어의 명령어와 문서가 제공됩니다.

## 명령어 개요

AIWF 명령어는 `/<command_name> [arguments]` 형식을 따릅니다.

> **참고**:
>
> - 이전 버전과의 호환성을 위해 `/project:aiwf:<command_name>` 형식도 계속 지원됩니다.
> - 한국어 명령어는 `_kr` 접미사를 가질 수 있습니다 (예: `/aiwf_initialize_kr`)

## 언어 관리 시스템

### 언어 지원 기능

AIWF에는 다음과 같은 포괄적인 언어 관리 시스템이 포함되어 있습니다:

- **지능형 언어 감지**: 시스템 언어 설정을 자동으로 감지
- **영구 언어 저장**: 향후 설치를 위한 언어 설정 저장
- **대화형 언어 전환**: 간단한 명령어로 언어 간 전환
- **명령줄 언어 도구**: 언어 관리 전용 CLI 도구

### 언어 관리 명령어

#### 🌐 `/aiwf_language_manager`

**목적**: 포괄적인 언어 관리 인터페이스

**사용법**:

```
/aiwf_language_manager
```

**동작**:

- 현재 언어 설정 및 선호도 표시
- 대화형으로 언어 변경 옵션 제공
- 언어 감지 및 저장 관리
- 시스템 전체의 언어 설정 검증

#### 🔍 `/aiwf_language_status`

**목적**: 현재 언어 구성 및 상태 확인

**사용법**:

```
/aiwf_language_status
```

**동작**:

- 현재 활성 언어 표시
- 감지된 시스템 언어 설정 표시
- 언어 파일 가용성 및 일관성 보고
- 언어별 설치 상태 제공

#### 🔄 `/aiwf_switch_language`

**목적**: 지원되는 언어 간 전환

**사용법**:

```
/aiwf_switch_language
# 대화형 언어 선택

/aiwf_switch_language ko
# 한국어로 전환

/aiwf_switch_language en
# 영어로 전환
```

**동작**:

- 언어 설정 업데이트
- 선택된 언어로 명령어 재설치
- 프로젝트 설정 및 데이터 유지
- 성공적인 언어 전환 확인 제공

### 명령어 버전

- **기본 명령어**: 영어 또는 표준화된 다국어
- **한국어 명령어**: 완전한 기능 동등성을 갖춘 한국어 버전
- **언어 관리**: 동일한 기능을 갖춘 양방향 언어 지원

## 설정 및 컨텍스트 명령어

### 🚀 `/aiwf_initialize`

**목적**: 새 프로젝트 또는 기존 프로젝트에서 AIWF 초기화

**사용법**:

```
/aiwf_initialize
```

**동작**:

1. 프로젝트를 스캔하고 분석
2. 프로젝트 타입 확인 요청
3. 기존 AIWF 문서 확인
4. 문서 생성 과정 안내 (기존 문서 가져오기 또는 새로 생성)
5. 첫 번째 마일스톤 생성
6. 프로젝트 매니페스트 생성

**사용 시기**: 프로젝트에서 AIWF를 처음 설정할 때

---

### 🧠 `/aiwf_prime`

**목적**: 코딩 세션 시작 시 프로젝트 컨텍스트를 로드합니다

**사용법**:

```
/aiwf_prime
```

**동작**:

- 프로젝트 매니페스트를 읽음
- 현재 마일스톤 및 스프린트 정보를 로드
- 활성 작업을 식별
- 빠른 상태 개요를 제공

**사용 시기**: 코딩 세션을 시작할 때 전체 상황을 빠르게 파악할 때

## 계획 명령어

### 📅 `/aiwf_create_sprints_from_milestone`

**목적**: 마일스톤을 관리 가능한 스프린트로 분해

**사용법**:

```
/aiwf_create_sprints_from_milestone 001_MVP_FOUNDATION
```

**동작**:

1. 마일스톤 요구사항을 분석
2. 관련 요구사항을 약 1주 길이의 스프린트로 그룹화
3. 스프린트 폴더 및 META 파일 생성
4. 스프린트 정보를 매니페스트에 업데이트

**사용 시기**: 새로운 마일스톤을 생성한 후

---

### 📋 `/aiwf_create_sprint_tasks`

**목적**: 스프린트를 위한 상세 작업 분해 생성

**사용법**:

```
/aiwf_create_sprint_tasks S01
# or for specific sprint:
/aiwf_create_sprint_tasks S02_001_MVP_FOUNDATION
```

**동작**:

1. 스프린트 요구사항을 분석
2. 이를 구체적이고 실행 가능한 작업으로 분해
3. 목표가 명확한 작업 파일을 생성
4. 작업 간 종속성을 처리

**사용 시기**: 각 스프린트 시작 시

---

### ✏️ `/aiwf_create_general_task`

**목적**: 스프린트와 연결되지 않은 독립형 작업 생성

**사용법**:

```
/aiwf_create_general_task
# Then describe your task when prompted
```

**예시 작업**:

- "Fix memory leak in physics engine"
- "Update documentation for API changes"
- "Refactor database connection pooling"

**사용 시기**: 유지보수, 버그 수정 또는 스프린트 범위를 벗어난 작업에 사용

## 개발 명령어

### 💻 `/aiwf_do_task`

**목적**: 특정 작업을 실행

**사용법**:

```
/aiwf_do_task
# 사용 가능한 작업을 나열하고 선택을 요청

# 또는 작업을 직접 지정:
/aiwf_do_task T001_S01_setup_tauri
```

**동작**:

1. 작업 요구사항 읽기
2. 솔루션 구현
3. 해당되는 경우 테스트 실행
4. 작업 상태 업데이트
5. 필요한 파일/변경 사항 생성

**사용 시기**: 특정 작업을 수행할 준비가 되었을 때

---

### 📝 `/aiwf_commit`

**목적**: 잘 구조화된 git 커밋 생성 및 GitHub 이슈 연동

**사용법**:

```
/aiwf_commit
# 변경 사항을 검토하고 커밋을 생성

# 또는 특정 작업에 대해:
/aiwf_commit T001_S01_setup_tauri

# 리뷰와 함께:
/aiwf_commit --review
```

**동작**:

1. 변경 사항 분석
2. 관련 변경 사항 그룹화
3. 의미있는 커밋 메시지 생성
4. 커밋을 작업/요구사항에 연결
5. GitHub 이슈와 연동 (fixes #123, relates to #456)
6. 선택적으로 코드 리뷰 먼저 실행

**사용 시기**: 완료한 작업을 저장하고 싶을 때

---

### 🧪 `/aiwf_test`

**목적**: 테스트 실행 및 일반적인 문제 수정

**사용법**:

```
/aiwf_test
# 모든 테스트 실행

/aiwf_test unit
# 특정 테스트 스위트 실행
```

**동작**:

1. package.json에서 테스트 명령어 식별
2. 적절한 테스트 실행
3. 일반적인 문제 수정 (누락된 의존성, 구성)
4. 결과를 명확하게 리포트

**사용 시기**: 커밋하기 전이나 테스트가 실패할 때

## 코드 리뷰 명령어

### 🔍 `/aiwf_code_review`

**목적**: 명세에 따른 코드 검토

**사용법**:

```
/aiwf_code_review
# 커밋되지 않은 변경 사항 검토

/aiwf_code_review src/app/components/GameCanvas.tsx
# 특정 파일 검토
```

**동작**:

1. 요구사항에 대한 코드 검사
2. 패턴 및 관습 확인
3. 버그 및 문제점 식별
4. 개선 사항 제안
5. 명세 준수 확인

**사용 시기**: 중요한 변경 사항을 커밋하기 전

---

### 📊 `/aiwf_project_review`

**목적**: 프로젝트 전반적인 상태 점검

**사용법**:

```
/aiwf_project_review
```

**동작**:

1. 전체 아키텍처 검토
2. 기술 부채 확인
3. 진행 상황 vs 일정 분석
4. 위험 요소 및 차단 요소 식별
5. 개선 사항 제안

**사용 시기**: 주간 또는 스프린트 경계에서

---

### 🧪 `/aiwf_testing_review`

**목적**: 테스트 커버리지 및 품질 분석

**사용법**:

```
/aiwf_testing_review
```

**동작**:

1. 테스트 커버리지 검토
2. 누락된 테스트 케이스 식별
3. 테스트 품질 확인
4. 개선 사항 제안

**사용 시기**: 기능 구현 후

---

### 💬 `/aiwf_discuss_review`

**목적**: 검토 결과에 대한 기술적 토론

**사용법**:

```
/aiwf_discuss_review
# 다른 검토 명령어 실행 후
```

**동작**:

- 상세한 설명 제공
- 장단점 토론
- 솔루션 제안
- 질문에 답변

**사용 시기**: 검토 피드백을 더 잘 이해하기 위해

## 자동화 명령어

### 🚀 `/aiwf_yolo`

**목적**: 자율적 작업 실행

**사용법**:

```
/aiwf_yolo
# 모든 열린 작업을 순차 실행

/aiwf_yolo S02
# 특정 스프린트를 순차 실행

/aiwf_yolo sprint-all
# 모든 스프린트를 순차 실행

/aiwf_yolo milestone-all
# 모든 마일스톤을 순차 실행

/aiwf_yolo S02 worktree
# Git worktree 모드로 실행
```

**동작**:

1. 열린 작업 식별
2. 순서대로 실행
3. 종속성 처리
4. 완료된 작업 커밋
5. 진행 상황 업데이트
6. GitHub 이슈 상태 업데이트

**안전 기능**:

- 확인 없이 스키마 수정하지 않음
- 위험한 작업 건너뛰기
- 코드 품질 유지
- 논리적 커밋 생성
- 테스트 실패 시 중단

**사용 시기**: 자율적인 진행을 원할 때

## 추가/고급 명령어

### 📌 `/aiwf_pr_create`

**목적**: Pull Request를 생성하고 템플릿을 적용하여 변경 사항을 정리

**사용법**:

```
/aiwf_pr_create
# 대화형으로 PR 생성

/aiwf_pr_create "Add authentication to API"
# 제목과 함께 PR 생성
```

**동작**:

1. 현재 브랜치의 변경 사항 분석
2. 연관된 이슈 및 작업 식별
3. PR 제목 및 설명 생성
4. 테스트 체크리스트 포함
5. GitHub에 PR 생성

---

### 🗂️ `/aiwf_issue_create`

**목적**: GitHub Issue를 생성하여 버그 리포트 및 기능 요청 기록

**사용법**:

```
/aiwf_issue_create
# 대화형으로 이슈 생성

/aiwf_issue_create "Bug: login fails on Safari"
# 제목과 함께 이슈 생성
```

**동작**:

1. 이슈 제목 및 설명 입력 받기
2. 적절한 라벨 및 마일스톤 자동 할당
3. 버그/기능 요청 템플릿 적용
4. GitHub에 이슈 생성
5. 필요시 작업으로 변환

---

### 🛠️ `/aiwf_create_milestone_plan`

**목적**: 대화형 프로세스로 신규 마일스톤을 계획하고 `.aiwf/02_REQUIREMENTS/` 구조를 자동 생성

**사용법**:

```
/aiwf_create_milestone_plan
```

**동작**:

1. 마일스톤 목표 및 범위 정의
2. 요구사항 문서 구조 생성
3. PRD 및 기술 명세 템플릿 생성
4. 마일스톤 디렉토리 구조 설정
5. 프로젝트 매니페스트 업데이트

---

### 📝 `/aiwf_create_prd`

**목적**: 제품 요구사항 문서(PRD)를 생성하여 기능의 상세 명세를 작성

**사용법**:

```
/aiwf_create_prd
# 대화형으로 PRD 생성

/aiwf_create_prd "사용자 인증 시스템"
# 특정 기능에 대한 PRD 생성
```

**동작**:

1. 기능의 목적과 범위 정의
2. 사용자 스토리 및 시나리오 작성
3. 기술적 요구사항 명세
4. 제약사항 및 의존성 파악
5. PRD 문서 구조 생성

**사용 시기**: 새로운 기능을 구현하기 전 상세 명세가 필요할 때

---

### 📈 `/aiwf_mermaid`

**목적**: 코드베이스를 분석하여 Mermaid 다이어그램 생성

**사용법**:

```
/aiwf_mermaid
# 전체 아키텍처 다이어그램 생성

/aiwf_mermaid flowchart
# 플로우차트 생성

/aiwf_mermaid sequence
# 시퀀스 다이어그램 생성
```

**동작**:

1. 코드베이스 구조 분석
2. 컴포넌트 및 모듈 관계 파악
3. 적절한 다이어그램 유형 선택
4. Mermaid 문법으로 다이어그램 생성
5. 문서에 삽입 가능한 형태로 출력

---

### ♾️ `/aiwf_infinite`

**목적**: 명세에 따라 반복적으로 결과물을 생성하는 고급 반복 루프 실행

**사용법**:

```
/aiwf_infinite
# 무한 반복 모드

/aiwf_infinite 5
# 5회 반복 모드
```

**동작**:

1. 반복 생성 규칙 정의
2. 초기 조건 설정
3. 지정된 횟수만큼 반복 실행
4. 각 반복마다 결과 검증
5. 최종 결과물 통합

---

### 🤖 `/aiwf_tm-run-all-subtask`

**목적**: Task Master의 모든 서브태스크를 한 번에 실행하여 진행 상황 자동화

**사용법**:

```
/aiwf_tm-run-all-subtask
```

**동작**:

1. 활성 서브태스크 식별
2. 종속성 순서 결정
3. 병렬 실행 가능 여부 판단
4. 순차적으로 서브태스크 실행
5. 전체 진행 상황 업데이트

---

### 🧠 `/aiwf_ultrathink_general`

**목적**: 폭넓은 문제를 심층 분석하기 위한 울트라 씽킹 세션

**사용법**:

```
/aiwf_ultrathink_general "복잡한 비즈니스 로직 설계"
```

---

### 🧠 `/aiwf_ultrathink_code_basic`

**목적**: 코드 기반 문제를 기본 수준에서 심층 분석하는 울트라 씽킹 세션

**사용법**:

```
/aiwf_ultrathink_code_basic "성능 최적화 방안"
```

---

### 🧠 `/aiwf_ultrathink_code_advanced`

**목적**: 복잡한 코드 및 아키텍처 문제를 고급 수준에서 심층 분석하는 울트라 씽킹 세션

**사용법**:

```
/aiwf_ultrathink_code_advanced "마이크로서비스 아키텍처 설계"
```

---

### ⚙️ `/aiwf_update_docs`

**목적**: 프로젝트 문서 업데이트 및 동기화

**사용법**:

```
/aiwf_update_docs
```

**동작**:

1. 프로젝트 문서 구조 스캔
2. 오래되거나 누락된 문서 식별
3. 현재 프로젝트 상태를 반영하여 문서 업데이트
4. 다양한 형식의 문서 간 동기화
5. 문서 일관성 및 완성도 검증

### ⚙️ `/aiwf_prime_context`

**목적**: 프로젝트 컨텍스트를 빠르게 불러와 프라임

**사용법**:

```
/aiwf_prime_context
```

**동작**:

1. 프로젝트 파일 목록 스캔
2. 주요 문서 식별
3. 현재 상태 요약
4. 컨텍스트 정보 로드
5. 작업 준비 상태 설정

## CLI 명령어 (v0.3.12 신규!)

### 🚀 `aiwf sprint independent`

**목적**: 빠른 YOLO 실행을 위한 마일스톤 없이 독립 스프린트 생성

**사용법**:
```bash
# README TODO에서 추출
aiwf sprint independent --from-readme

# GitHub 이슈에서 생성
aiwf sprint independent --from-issue 123

# 엔지니어링 레벨과 함께 대화형 생성
aiwf sprint independent "빠른 기능" --minimal
aiwf sprint independent "API 개발" --balanced
aiwf sprint independent "복잡한 시스템" --complete
```

**기능**:
- 마일스톤 종속성 불필요
- README/이슈에서 자동 태스크 추출
- 설정 가능한 엔지니어링 레벨
- YOLO 최적화된 스프린트 구조

### 💾 `aiwf checkpoint`

**목적**: 복구 및 추적을 위한 YOLO 실행 체크포인트 관리

**사용법**:
```bash
# 체크포인트 목록
aiwf checkpoint list
aiwf checkpoint list --limit 20

# 현재 세션 상태 확인
aiwf checkpoint status

# 체크포인트에서 복원
aiwf checkpoint restore cp_1234567890

# 수동 체크포인트 생성
aiwf checkpoint create "주요 리팩토링 전"

# 오래된 체크포인트 정리
aiwf checkpoint clean --keep 10
```

**기능**:
- YOLO 중 자동 체크포인트 생성
- Git 상태 추적
- 세션 메트릭 및 성능 데이터
- 중단으로부터 안전한 복구

### 🛠️ `aiwf yolo-config`

**목적**: YOLO 동작 및 오버엔지니어링 방지 구성

**사용법**:
```bash
# 기본 설정 초기화
aiwf yolo-config init

# 대화형 구성 마법사
aiwf yolo-config wizard

# 현재 구성 표시
aiwf yolo-config show
```

**구성 옵션**:
- 엔지니어링 레벨 (minimal/balanced/complete)
- 포커스 규칙 (requirement_first, simple_solution 등)
- 실행 모드 (fast/smart/safe)
- 오버엔지니어링 방지 제한
- 체크포인트 간격

### 📊 `aiwf-sprint` (전용 CLI)

**목적**: 포괄적인 스프린트 관리 도구

**사용법**:
```bash
# 독립 스프린트 생성
aiwf-sprint independent --from-readme --minimal

# 모든 스프린트 목록
aiwf-sprint list
aiwf-sprint list --status active

# 스프린트 상태 확인
aiwf-sprint status S01

# 도움말 받기
aiwf-sprint help
```

### 🔄 `aiwf-checkpoint` (전용 CLI)

**목적**: 고급 체크포인트 관리

**사용법**:
```bash
# 진행 상황 리포트 생성
aiwf-checkpoint report

# 상세 정보와 함께 목록
aiwf-checkpoint list

# 드라이 런으로 정리
aiwf-checkpoint clean --keep 5 --dry-run

# 도움말 받기
aiwf-checkpoint help
```

## AI 페르소나 명령어

### 🎭 `/project:aiwf:ai_persona:switch`

**목적**: 집중된 개발 작업을 위한 특정 AI 페르소나로 전환

**사용법**:

```
/project:aiwf:ai_persona:switch architect
# 아키텍트 페르소나로 전환

/project:aiwf:ai_persona:switch debugger
# 디버거 페르소나로 전환
```

**사용 가능한 페르소나**:
- `architect` - 시스템 설계 및 아키텍처
- `debugger` - 버그 감지 및 문제 해결
- `reviewer` - 코드 품질 및 표준
- `documenter` - 문서화 및 가이드
- `optimizer` - 성능 최적화
- `developer` - 일반 개발 (기본값)

### 🎭 `/project:aiwf:ai_persona:architect`

**목적**: 아키텍트 페르소나로 전환하는 단축키

**사용법**:

```
/project:aiwf:ai_persona:architect
```

**사용 시기**: 시스템 아키텍처 설계, 모듈 계획, 기술 설계 생성 시

### 🎭 `/project:aiwf:ai_persona:debugger`

**목적**: 디버거 페르소나로 전환하는 단축키

**사용법**:

```
/project:aiwf:ai_persona:debugger
```

**사용 시기**: 버그 수정, 오류 추적, 문제 조사 시

### 🎭 `/project:aiwf:ai_persona:reviewer`

**목적**: 리뷰어 페르소나로 전환하는 단축키

**사용법**:

```
/project:aiwf:ai_persona:reviewer
```

**사용 시기**: 코드 리뷰, 보안 확인, 표준 준수 확인 시

### 🎭 `/project:aiwf:ai_persona:documenter`

**목적**: 문서 작성자 페르소나로 전환하는 단축키

**사용법**:

```
/project:aiwf:ai_persona:documenter
```

**사용 시기**: 문서 작성, 가이드 생성, 기능 설명 시

### 🎭 `/project:aiwf:ai_persona:optimizer`

**목적**: 최적화 전문가 페르소나로 전환하는 단축키

**사용법**:

```
/project:aiwf:ai_persona:optimizer
```

**사용 시기**: 성능 최적화, 리소스 사용 감소, 효율성 개선 시

### 🔄 `/project:aiwf:ai_persona:auto`

**목적**: 자동 페르소나 감지 활성화 또는 비활성화

**사용법**:

```
/project:aiwf:ai_persona:auto on
# 자동 감지 활성화

/project:aiwf:ai_persona:auto off
# 자동 감지 비활성화
```

**동작**: 활성화 시 Claude가 태스크 컨텍스트에 따라 자동으로 페르소나 전환

### 📊 `/project:aiwf:ai_persona:status`

**목적**: 현재 페르소나 및 세션 메트릭 표시

**사용법**:

```
/project:aiwf:ai_persona:status
```

**출력**: 현재 페르소나, 동작, 세션 기간, 상호작용, 토큰 사용량 표시

### 📋 `/project:aiwf:ai_persona:list`

**목적**: 사용 가능한 모든 AI 페르소나 목록 표시

**사용법**:

```
/project:aiwf:ai_persona:list
```

**출력**: 설명 및 집중 영역과 함께 모든 페르소나 표시

### 🔍 `/project:aiwf:ai_persona:detect`

**목적**: 특정 작업에 최적의 페르소나 감지

**사용법**:

```
/project:aiwf:ai_persona:detect "인증 버그 수정"
# 디버거 페르소나 감지

/project:aiwf:ai_persona:detect "API 구조 설계"
# 아키텍트 페르소나 감지
```

### 📈 `/project:aiwf:ai_persona:report`

**목적**: 페르소나 사용에 대한 성능 리포트 생성

**사용법**:

```
/project:aiwf:ai_persona:report
# 전체 기간 리포트 생성

/project:aiwf:ai_persona:report week
# 지난 주 리포트 생성
```

**출력**: 성능 메트릭, 페르소나 사용 통계, 권장사항

### 📊 `/project:aiwf:ai_persona:stats`

**목적**: 특정 페르소나의 상세 통계 보기

**사용법**:

```
/project:aiwf:ai_persona:stats debugger
# 디버거 페르소나 통계 보기

/project:aiwf:ai_persona:stats
# 현재 페르소나 통계 보기
```

### 🔄 `/project:aiwf:ai_persona:reset`

**목적**: 페르소나 시스템을 기본값(developer)으로 리셋

**사용법**:

```
/project:aiwf:ai_persona:reset
```

## 모범 사례

### 일일 워크플로

```bash
# 하루 시작
/aiwf_prime

# AI 페르소나 자동 감지 활성화
/project:aiwf:ai_persona:auto on

# 작업 수행
/aiwf_do_task
/aiwf_test
/aiwf_commit

# 하루 마무리
/aiwf_project_review
/project:aiwf:ai_persona:report
```

### 스프린트 워크플로

```bash
# Sprint planning
/aiwf_create_sprint_tasks S02

# Sprint execution
/aiwf_do_task T001_S02_first_task
/aiwf_do_task T002_S02_second_task
/aiwf_commit --review

# Sprint review
/aiwf_project_review
```

### 빠른 수정

```bash
# 버그 수정 워크플로
/aiwf_create_general_task
# 설명: "Fix memory leak in /src/foo.bar"
/aiwf_do_task T003
/aiwf_test
/aiwf_commit T003
```

## 팁 & 트릭

1. **일상적인 작업에는 YOLO 사용**: 간단한 기능 구현에 유용
2. **항상 먼저 prime 실행**: 명령어가 적절한 컨텍스트를 갖도록 보장
3. **주요 커밋 전 검토**: 문제를 조기에 발견
4. **버그는 일반 작업으로 생성**: 추적 가능하게 유지
5. **작업별 커밋 사용**: 더 나은 추적성
6. **AI 페르소나 자동 감지 활성화**: Claude가 자동으로 올바른 모드로 전환하도록 허용
7. **계획 시 아키텍트 페르소나 사용**: 더 나은 시스템 설계 결정
8. **버그 수정 시 디버거로 전환**: 더 체계적인 오류 분석
9. **최적화 페르소나는 신중히 사용**: 실제 병목 현상에 집중
10. **주간 페르소나 리포트 확인**: 개발 패턴 이해

## 명령어 안전 장치

AIWF 명령어에는 다음과 같은 안전 기능이 포함되어 있습니다:

- 중요 파일 삭제하지 않음
- 스키마 변경 전 확인 요청
- 명세에 따른 변경 사항 검증
- 코드 품질 기준 유지
- 점진적 커밋 생성

## 도움 받기

명령어에 대한 도움이 필요한 경우:

1. 인수 없이 명령어를 실행하여 사용법 정보 확인
2. 이 가이드 확인
3. `.aiwf/`의 작업 예시 확인
4. `.claude/commands/`의 명령어 소스 검토

## 문서 업데이트

**📝 중요**: 이 문서는 새로운 기능이 추가되거나 기존 명령어가 수정될 때 자동으로 업데이트됩니다. 정확한 명령어 정보를 위해 항상 최신 버전을 참조하세요.

**언어 버전**: 이 가이드의 영어 및 한국어 버전은 언어 설치 간 일관성을 보장하기 위해 동시에 유지되고 업데이트됩니다.

**최종 업데이트**: 2025-07-09 - AI 페르소나 시스템 통합 및 문서화
