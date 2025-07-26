# AIWF 시작하기

[한국어](GETTING_STARTED.ko.md) | [English](GETTING_STARTED.md)

> AIWF를 사용하여 AI 지원 개발을 시작하는 빠른 가이드

## 📋 목차

1. [설치](#설치)
2. [첫 프로젝트 설정](#첫-프로젝트-설정)
3. [기본 워크플로우](#기본-워크플로우)
4. [핵심 개념](#핵심-개념)
5. [다음 단계](#다음-단계)

## 설치

### 전역 설치 (권장)

```bash
npm install -g aiwf
```

### 프로젝트에 AIWF 설치

프로젝트 디렉토리로 이동한 후:

```bash
aiwf install
```

설치 프로그램이 다음을 안내합니다:
1. **언어 선택**: 한국어 또는 영어 선택
2. **프로젝트 설정**: 현재 디렉토리에 AIWF 초기화
3. **Claude 명령어**: 언어별 명령어 설치
4. **문서**: 가이드 및 템플릿 다운로드

## 첫 프로젝트 설정

### 1. 새 프로젝트 생성

```bash
# 대화형 프로젝트 생성
aiwf create-project

# 템플릿 사용
aiwf create-project my-api --template api-server
aiwf create-project my-lib --template npm-library
aiwf create-project my-app --template web-app
```

### 2. 기존 프로젝트에 AIWF 추가

```bash
cd my-existing-project
aiwf install
```

### 3. 프로젝트 상태 초기화

```bash
aiwf state init
```

## 기본 워크플로우

### 1. 마일스톤 계획

```bash
# PRD로부터 마일스톤 생성
aiwf create-milestone-plan

# 마일스톤으로부터 스프린트 생성
aiwf create-sprints-from-milestone
```

### 2. 태스크 관리

```bash
# 일반 태스크 생성
aiwf create-general-task "기능 구현" --description "사용자 인증 추가"

# 스프린트에 태스크 추가
aiwf add-sprint-task S01 "API 엔드포인트 구현"

# 스마트 태스크 시작
aiwf smart-start

# 태스크 완료
aiwf smart-complete
```

### 3. 상태 추적

```bash
# 상태 업데이트
aiwf state update

# 현재 상태 확인
aiwf state show

# 다음 추천 작업
aiwf state next
```

### 4. YOLO 모드 (자율 실행)

```bash
# 전체 스프린트 자동 실행
aiwf yolo

# 안전 모드로 실행
aiwf yolo --safe

# 드라이런 (시뮬레이션)
aiwf yolo --dry-run
```

## 핵심 개념

### 📂 프로젝트 구조

```
my-project/
├── .aiwf/                    # AIWF 구성 및 상태
│   ├── config.json          # 프로젝트 설정
│   ├── state/               # 상태 파일
│   └── checkpoints/         # YOLO 체크포인트
├── milestones/              # 마일스톤 정의
├── sprints/                 # 스프린트 정의
└── tasks/                   # 태스크 파일
```

### 🎯 워크플로우 단계

1. **계획 (Planning)**
   - PRD 작성
   - 마일스톤 정의
   - 스프린트 분할

2. **개발 (Development)**
   - 태스크 생성 및 할당
   - 코드 구현
   - 테스트 작성

3. **리뷰 (Review)**
   - 코드 리뷰
   - 테스트 실행
   - 품질 평가

4. **배포 (Deployment)**
   - 최종 검증
   - 릴리스 준비
   - 문서 업데이트

### 🤖 AI 페르소나

AIWF는 전문 AI 페르소나를 제공합니다:

- **Architect**: 시스템 설계 및 아키텍처
- **Backend**: 백엔드 개발 및 API
- **Frontend**: UI/UX 및 프론트엔드
- **Security**: 보안 검토 및 개선
- **Data Analyst**: 데이터 분석 및 최적화

페르소나 사용 예:

```bash
# 아키텍처 리뷰
aiwf persona apply architect

# 보안 검토
aiwf persona apply security
```

### 💾 체크포인트 시스템

YOLO 모드 실행 중 진행 상황 자동 저장:

```bash
# 체크포인트 목록
aiwf checkpoint list

# 특정 체크포인트에서 재개
aiwf yolo --resume checkpoint-id
```

## 다음 단계

### 📚 추천 문서

1. **[명령어 가이드](COMMANDS_GUIDE.ko.md)** - 모든 AIWF 명령어 상세 설명
2. **[상태 관리 가이드](STATE_MANAGEMENT_GUIDE.ko.md)** - 고급 상태 관리 기법
3. **[AI 페르소나 가이드](guides/ai-personas-guide-ko.md)** - 페르소나 활용법
4. **[독립 스프린트 가이드](guides/independent-sprint-guide-ko.md)** - YOLO 최적화 스프린트

### 🎓 학습 경로

1. **초급**: 기본 명령어와 워크플로우 익히기
2. **중급**: 상태 관리와 AI 페르소나 활용
3. **고급**: YOLO 모드와 커스터마이징

### 💡 팁

- 항상 `aiwf state update`로 상태 동기화
- 큰 작업은 작은 태스크로 분할
- YOLO 모드는 충분한 컨텍스트와 함께 사용
- 정기적으로 체크포인트 확인

## 🆘 도움말

문제가 발생하면:

1. `aiwf --help` 명령어 도움말 확인
2. [문제 해결 가이드](TROUBLESHOOTING.ko.md) 참조
3. [GitHub 이슈](https://github.com/moonklabs/aiwf/issues) 제출

---

🎉 이제 AIWF로 AI 지원 개발을 시작할 준비가 되었습니다!