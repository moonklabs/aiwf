# 독립 스프린트 가이드

[Read in English](independent-sprint-guide.md)

## 개요

독립 스프린트는 AIWF v0.3.12+의 핵심 기능으로, 마일스톤 관리의 오버헤드 없이 빠른 YOLO 실행을 가능하게 합니다. 다음과 같은 작업에 적합합니다:

- 빠른 프로토타입
- 독립적인 기능
- 버그 수정 묶음
- README TODO 구현
- GitHub 이슈 해결

## 주요 이점

### 🚀 속도
- 마일스톤 계획 불필요
- README에서 TODO 직접 추출
- 즉시 YOLO 실행 가능
- 최소한의 설정 오버헤드

### 🛡️ 오버엔지니어링 방지
- 내장된 엔지니어링 레벨 제어
- 포커스 규칙 강제
- 복잡도 제한
- 기본적으로 YAGNI 원칙 적용

### 💾 복구
- 자동 체크포인트 생성
- 안전한 중단 처리
- 진행 상황 보존
- Git 상태 추적

## 독립 스프린트 생성

### README TODO에서 생성

```bash
aiwf sprint independent --from-readme
```

이 명령어는:
1. README.md에서 TODO 항목, 체크박스, 기능 목록을 스캔
2. 이를 태스크로 추출
3. 최소 엔지니어링 레벨로 스프린트 생성
4. 즉시 YOLO 실행 준비

README 형식 예시:
```markdown
## TODO
- [ ] 사용자 인증 추가
- [ ] API 엔드포인트 구현
- [ ] 대시보드 UI 생성
```

### GitHub 이슈에서 생성

```bash
aiwf sprint independent --from-issue 123
```

이 명령어는:
1. `gh` CLI를 사용하여 GitHub에서 이슈 #123 가져오기
2. 제목과 체크리스트 항목 추출
3. 이슈 내용에서 태스크 생성
4. 원본 이슈로 다시 링크

### 대화형 생성

```bash
aiwf sprint independent "빠른 기능 구현"
```

다음을 프롬프트합니다:
- 스프린트 이름
- 주요 목표
- 엔지니어링 레벨 선호

### 엔지니어링 레벨과 함께

```bash
# Minimal - 빠른 프로토타입, 필수 요소만
aiwf sprint independent "MVP 기능" --minimal

# Balanced - 합리적인 속도로 좋은 품질
aiwf sprint independent "API 기능" --balanced  

# Complete - 모든 기능을 갖춘 완전한 구현
aiwf sprint independent "핵심 시스템" --complete
```

## 엔지니어링 레벨 설명

### Minimal 레벨
- **목표**: 최대한 빨리 작동하는 프로토타입
- **포커스**: 핵심 기능만
- **테스트**: 기본적인 스모크 테스트
- **문서화**: 인라인 주석만
- **리팩토링**: 문제가 있을 때만
- **사용 시기**: POC, 데모, 실험

### Balanced 레벨
- **목표**: 좋은 관행을 따르는 프로덕션 준비 코드
- **포커스**: 깨끗하고 유지보수 가능한 코드
- **테스트**: 중요한 경로에 대한 단위 테스트
- **문서화**: README + 주요 함수
- **리팩토링**: 명확성을 위해 필요시
- **사용 시기**: 일반 기능, API

### Complete 레벨
- **목표**: 엔터프라이즈급 구현
- **포커스**: 확장성과 확장 가능성
- **테스트**: 포괄적인 테스트 커버리지
- **문서화**: 전체 API 문서 + 가이드
- **리팩토링**: 사전 최적화
- **사용 시기**: 핵심 시스템, 라이브러리

## 독립 스프린트로 YOLO 실행

### 기본 실행

스프린트 생성 후 다음으로 실행:

```
/project:aiwf:yolo S03
```

### 설정과 함께

1. YOLO 설정 생성:
```bash
aiwf yolo-config wizard
```

2. 스프린트의 엔지니어링 레벨과 일치하는 옵션 선택

3. 오버엔지니어링이 방지된다는 확신으로 실행

### 체크포인트 복구

실행이 중단된 경우:

```bash
# 상태 확인
aiwf checkpoint status

# 사용 가능한 체크포인트 목록  
aiwf checkpoint list

# 복원 및 계속
aiwf checkpoint restore cp_1234567890
```

## 모범 사례

### 1. 작게 시작하기
- 초기 구현에는 `--minimal` 사용
- 후속 스프린트에서 엔지니어링 레벨 업그레이드
- 조기 최적화 피하기

### 2. 요구사항에 집중
- README TODO가 개발을 주도하도록 허용
- "있으면 좋은" 기능 추가 저항
- YAGNI 원칙 엄격히 따르기

### 3. 체크포인트를 현명하게 사용
- 위험한 변경 전에 수동 체크포인트 생성
- 오래된 체크포인트 정기적으로 정리
- 일반적인 흐름에서는 자동 체크포인트 신뢰

### 4. 목적에 맞는 레벨 매칭
- 프로토타입 → Minimal
- 사용자 대면 기능 → Balanced
- 핵심 인프라 → Complete

## 일반적인 워크플로우

### README에서 빠른 기능

```bash
# 1. 기능 목록으로 README 업데이트
echo "- [ ] 검색 기능 추가" >> README.md

# 2. README에서 스프린트 생성
aiwf sprint independent --from-readme --minimal

# 3. YOLO로 실행
# Claude Code에서: /project:aiwf:yolo S01
```

### 이슈 중심 개발

```bash
# 1. 이슈에서 스프린트 생성
aiwf sprint independent --from-issue 456 --balanced

# 2. 생성된 태스크 검토
aiwf-sprint status S01

# 3. 모니터링과 함께 실행
# Claude Code에서: /project:aiwf:yolo S01
```

### 프로토타입에서 프로덕션으로

```bash
# 1. 최소 프로토타입으로 시작
aiwf sprint independent "사용자 인증" --minimal
# 실행: /project:aiwf:yolo S01

# 2. 균형잡힌 구현으로 향상
aiwf sprint independent "사용자 인증 향상" --balanced
# 실행: /project:aiwf:yolo S02

# 3. 전체 기능으로 완성
aiwf sprint independent "사용자 인증 완성" --complete
# 실행: /project:aiwf:yolo S03
```

## 문제 해결

### 스프린트 생성 실패

**문제**: .aiwf 디렉토리를 찾을 수 없음
**해결**: AIWF가 설치된 프로젝트 루트에서 실행

**문제**: README에서 TODO를 찾을 수 없음
**해결**: 체크박스 형식으로 TODO 섹션 추가

### YOLO 실행 문제

**문제**: 오버엔지니어링 감지됨
**해결**: 엔지니어링 레벨을 minimal로 조정

**문제**: 테스트 실패
**해결**: YOLO 설정 테스트 임계값 설정 확인

### 체크포인트 문제

**문제**: 체크포인트를 복원할 수 없음
**해결**: Git 상태가 체크포인트와 일치하는지 확인

**문제**: 체크포인트가 너무 많음
**해결**: `aiwf checkpoint clean --keep 10` 실행

## 고급 사용법

### 사용자 정의 태스크 추출

`.aiwf/todo-patterns.json` 생성:
```json
{
  "patterns": [
    "TODO:",
    "FIXME:",
    "- [ ]",
    "기능:"
  ]
}
```

### 스프린트 템플릿

`.aiwf/sprint-templates/` 생성:
```yaml
# api-sprint.yaml
name_prefix: "API 기능"
engineering_level: balanced
default_tasks:
  - "API 엔드포인트 설계"
  - "컨트롤러 구현"
  - "테스트 추가"
  - "문서 업데이트"
```

### 자동화 스크립트

```bash
#!/bin/bash
# create-weekly-sprint.sh

# 이번 주 이슈 추출
ISSUES=$(gh issue list --label "이번-주" --json number -q '.[].number')

# 이슈에서 스프린트 생성
for issue in $ISSUES; do
  aiwf sprint independent --from-issue $issue --minimal
done
```

## CI/CD와의 통합

### GitHub Actions 예시

```yaml
name: 이슈에서 스프린트 생성
on:
  issues:
    types: [labeled]

jobs:
  create-sprint:
    if: github.event.label.name == 'ready-for-sprint'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: AIWF 설치
        run: npm install -g aiwf
      - name: 스프린트 생성
        run: |
          aiwf sprint independent \
            --from-issue ${{ github.event.issue.number }} \
            --minimal
```

## 요약

독립 스프린트는 빠르고 집중된 개발을 향한 AIWF의 진화를 나타냅니다. 마일스톤 관리의 오버헤드를 제거하고 오버엔지니어링 방지를 통합함으로써, 개발자가 최소한의 마찰로 아이디어에서 구현으로 이동할 수 있게 합니다.

기억하세요: **YOLO는 무모한 것이 아닙니다 - 안전 장치가 있는 집중된 실행입니다.**