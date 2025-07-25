# 변경사항 분석 및 사용자 확인을 통한 논리적 git 커밋 생성

다음 지시사항을 위에서 아래로 순서대로 따르세요.

## 정확히 다음 6개 항목으로 TODO 생성

1. 인수 파싱 및 git 상태 분석
2. 변경사항 검토 및 논리적 커밋별 그룹화
3. 커밋 구조 및 메시지 제안
4. 사용자 승인 필요 여부 확인
5. 승인된 커밋 실행
6. 커밋 결과 보고

---

## 1 · git 상태 분석 및 인수 파싱

- 최대 효율성을 위해 다음 명령어들을 병렬 실행: `git status`, `git diff --staged`, `git diff`
- 범위를 이해하기 위해 폴더 구조와 함께 모든 변경된 파일 나열

### 중요: 인수 해석 규칙

**컨텍스트 제공됨** (<$ARGUMENTS>에 텍스트가 포함된 경우):

- YOLO가 <$ARGUMENTS>의 일부라면 사용자 승인을 건너뛰는 것을 의미 (Todo의 4단계 참조)
- <$ARGUMENTS>의 다른 텍스트는 사용자가 제공한 **태스크 ID**, **스프린트 ID**, 또는 기타 **컨텍스트 식별자**를 나타냄
- 이것은 파일 경로가 아니라 변경사항을 필터링하기 위한 의미적 컨텍스트임
- **주요 초점**: 이 컨텍스트와 직접 관련된 파일만 커밋
- **부차적 고려사항**: 주요 컨텍스트 처리 후, 사용자가 관련 없는 다른 변경사항을 커밋하고 싶은지 묻기

**태스크 ID 패턴** (예: T01_S02, TX03_S01, T003):

- 스프린트 태스크: `T<NN>_S<NN>` 형식 (예: T01_S02, T03_S02)
- 완료된 스프린트 태스크: `TX<NN>_S<NN>` 형식 (예: TX01_S02, TX03_S01)
- 일반 태스크: `T<NNN>` 형식 (예: T001, T002)
- 완료된 일반 태스크: `TX<NNN>` 형식 (예: TX001, TX002)
- 다음 위치에서 이 태스크 ID를 검색:
  - `.aiwf/03_SPRINTS/` 디렉토리 (스프린트 태스크용)
  - `.aiwf/04_GENERAL_TASKS/` 디렉토리 (일반 태스크용)
  - 파일의 태스크 메타데이터 (frontmatter에서 `task_id: T01_S02` 찾기)
  - Git diff 내용 (코드 주석이나 커밋이 태스크를 참조하는지 확인)
- 이 태스크 구현의 일부로 수정된 모든 파일 식별
- 여기에는 다음이 포함: 소스 코드, 테스트, 구성, 그리고 태스크 문서 파일 자체

**스프린트 ID 패턴** (예: S01, S02):

- 스프린트 ID만 제공된 경우, 해당 스프린트 내의 모든 태스크와 관련된 변경사항을 커밋
- 검색 패턴: 스프린트 디렉토리의 `T*_S<NN>`
- 예시: "S02"는 T01_S02, T02_S02, T03_S02 등의 변경사항을 포함

**컨텍스트 제공되지 않음** (<$ARGUMENTS>가 비어있는 경우):

- 모든 변경사항을 분석하고 논리적으로 그룹화
- 서로 다른 논리적 작업 단위에 대해 별도 커밋 제안

### 구현 단계

1. 먼저 <$ARGUMENTS>에 텍스트가 포함되어 있는지 확인
2. 포함되어 있다면 명시적으로 기술: "컨텍스트 제공됨: '$ARGUMENTS' - 이 컨텍스트와 관련된 변경사항에 집중하겠습니다"
3. 태스크 ID 패턴인 경우, 태스크 파일을 찾아서 구현된 내용 이해
4. 식별된 컨텍스트와 관련된 파일들로만 변경된 파일들을 필터링
5. 컨텍스트와 일치하는 파일이 없으면 사용자에게 알림: "'$ARGUMENTS'와 관련된 변경사항을 찾을 수 없습니다"
6. 관련 없는 변경사항이 존재하면 언급하되 초기 커밋 제안에는 포함하지 않음

## 2 · 변경사항 검토 및 논리적 커밋별 그룹화

### 우선순위: 컨텍스트 필터링

**인수에 컨텍스트가 제공된 경우**:

1. **먼저 필터링**: 변경사항을 두 그룹으로 분리:
   - **컨텍스트와 관련**: 태스크/컨텍스트 구현의 일부인 파일들
   - **컨텍스트와 무관**: 그 외 모든 것
2. **집중**: 첫 번째 커밋에서는 "컨텍스트와 관련" 그룹만 분석
3. **연기**: 잠재적인 후속 커밋을 위해 "무관" 그룹 보관 (사용자가 요청하는 경우에만)

**표준 그룹화 로직** (컨텍스트 없음 또는 컨텍스트 내 그룹화용):

- **논리적으로 함께 속하는 변경사항 고민**:
  - 태스크 완료 (해당되는 경우 태스크 ID별 그룹화)
  - 기능 추가 (기능 범위별 그룹화)
  - 구성 업데이트 (별도 그룹화)
  - 문서 업데이트 (문서 유형별 그룹화)
  - 버그 수정 (관련 기능별 그룹화)
- **신중하게 고려**하여 각 커밋이 독립적으로 이해되고 잠재적으로 되돌릴 수 있는 하나의 논리적 변경을 나타내도록 보장
- 관련 없는 변경사항을 같은 커밋에 혼합하지 않기
- 커밋 순서를 정할 때 변경사항 간의 의존성 고려

## 3 · 커밋 제안

### 컨텍스트 인식 커밋 제안

**컨텍스트가 제공된 경우** (예: 태스크 ID):

- **첫 번째 커밋**: 제공된 컨텍스트와 관련된 파일만 포함해야 함
- 명확히 기술: "이 커밋은 $ARGUMENTS에 대한 변경사항을 포함합니다"
- 이 커밋이 완료된 후, 다음과 같이 묻기: "[파일 목록]에 관련 없는 변경사항도 있습니다. 이것들에 대해서도 추가 커밋을 생성하시겠습니까?"

**컨텍스트가 제공되지 않은 경우**:

- 모든 변경사항의 논리적 그룹화를 기반으로 커밋 제안

생성할 다음 커밋에 대해:

- **컨텍스트**: 해당되는 경우, 이 커밋이 다루는 태스크/컨텍스트
- **파일**: 포함될 특정 파일 목록
- **커밋 메시지**: 관례적인 커밋 형식 사용, 명확하고 간결하게
  - **중요:** Claude, Anthropic, 또는 AI 지원에 대한 어떤 언급도 포함하지 않아야 함
  - 태스크 관련인 경우, 메시지에 태스크 ID 포함 (예: "feat(agents): implement T01_S02 coordinator agent" 또는 "fix(api): resolve T003 authentication issue")
  - **GitHub 이슈 연결**: 태스크에 GitHub 이슈가 있는 경우, 커밋 메시지에 `fixes #123` 또는 `relates to #456` 포함
- **근거**: 이러한 변경사항들이 왜 함께 속하는지에 대한 간단한 설명

## 4 · 사용자 승인 필요 여부 확인

YOLO가 <$ARGUMENTS>의 **일부라면** 이 단계를 건너뛰고 다음 단계로 이동.

그렇지 않으면 사용자 승인을 요청.

- 파일과 메시지를 포함한 완전한 커밋 계획 표시
- 진행하기 전에 명시적인 사용자 확인 대기
- 사용자가 거부하면 무엇을 변경해야 하는지 묻기
- 사용자가 커밋 메시지나 범위를 수정하고 싶어하면 조정

## 5 · 승인된 커밋 실행 및 계속

승인된 커밋에 대해:

- `git add`로 지정된 파일들 스테이징
- **중요:** pre-commit 훅을 사용하고 있어 부족한 점을 보고할 가능성이 높음. 이를 수정해야 함. 특히 이런 문제들을 다루는 열린 태스크가 없다면 검증을 건너뛰지 마세요.
- 승인된 메시지로 **커밋 생성**
- 커밋이 성공적으로 생성되었는지 확인
- **GitHub 이슈 업데이트 (해당하는 경우):**
  - 태스크에 연결된 GitHub 이슈가 있는 경우
  - 이슈에 커밋 링크 댓글 추가:
    ```bash
    gh issue comment {issue_number} --body "🔗 Commit: {commit_sha} - {commit_message}"
    ```
- **중요:** 남은 커밋이 더 있다면 다음 커밋을 위해 3단계로 돌아가기
- 모든 커밋이 완료된 경우에만 6단계로 진행

## 6 · 커밋 결과 보고

요약 제공:

- **생성된 커밋**: SHA와 메시지와 함께 각 커밋 나열
- **커밋된 파일**: 커밋된 파일의 총 개수
- **남은 변경사항**: 아직 커밋되지 않은 대기 중인 변경사항
- **저장소 상태**: 커밋 후 현재 git 상태

**상태 인덱스 동기화**:
```bash
# 커밋 후 상태 업데이트
aiwf state update
# 워크플로우 컨텍스트 확인
aiwf state show
```

## 7 · 변경 로그 생성 (선택사항)

성공적인 커밋 후:

- 사용자에게 묻기: "커밋이 완료되었습니다. Changelog를 업데이트하시겠습니까? (y/n)"
- yes인 경우 실행: `/project:aiwf:changelog`
- 이는 다음을 수행:
  - 최근 커밋 히스토리 분석
  - CHANGELOG.md 생성 또는 업데이트
  - 유형별 변경사항 분류 (feat, fix, docs 등)
  - 방금 생성된 커밋들 포함
