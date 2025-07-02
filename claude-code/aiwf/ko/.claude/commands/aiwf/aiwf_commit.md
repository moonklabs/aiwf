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

## 2 · Review changes and group by logical commits

### PRIORITY: Context Filtering

**If context provided in arguments**:

1. **FILTER FIRST**: Separate changes into two groups:
   - **Related to context**: Files that are part of the task/context implementation
   - **Unrelated to context**: Everything else
2. **FOCUS**: Only analyze the "related to context" group for the first commit
3. **DEFER**: Keep the "unrelated" group for potential later commits (only if user requests)

**Standard grouping logic** (for no-context or within-context grouping):

- **Think about** which changes belong together logically:
  - Task completion (group by task ID when applicable)
  - Feature additions (group by feature scope)
  - Configuration updates (group separately)
  - Documentation updates (group by documentation type)
  - Bug fixes (group by related functionality)
- **Think carefully** to ensure each commit represents one logical change that can be understood and potentially reverted independently
- Avoid mixing unrelated changes in the same commit
- Consider dependencies between changes when ordering commits

## 3 · Propose commit

### Context-Aware Commit Proposal

**When context was provided** (e.g., task ID):

- **FIRST COMMIT**: Must contain ONLY files related to the provided context
- State clearly: "This commit includes changes for $ARGUMENTS"
- After this commit is done, then ask: "There are also unrelated changes in [list files]. Would you like me to create additional commits for these?"

**When no context provided**:

- Propose commits based on logical grouping of all changes

For the next commit to create:

- **Context**: If applicable, which task/context this commit addresses
- **Files**: List the specific files to be included
- **Commit message**: Use conventional commit format, be clear and concise
  - **CRITICAL:** Must not contain any attribution to Claude, Anthropic, or AI assistance
  - If task-related, include task ID in message (e.g., "feat(agents): implement T01_S02 coordinator agent" or "fix(api): resolve T003 authentication issue")
  - **GitHub Issue Linking**: If task has a GitHub issue, include `fixes #123` or `relates to #456` in commit message
- **Reasoning**: Brief explanation of why these changes belong together

## 4 · Check if user approval is necessary

If YOLO **IS** part of the <$ARGUMENTS> skip this and jump to next step.

Otherwise ask the User for approval.

- Show the complete commit plan including files and message
- Wait for explicit user confirmation before proceeding
- If user says no, ask what should be changed
- If user wants to modify the commit message or scope, make adjustments

## 5 · Execute approved commit and continue

For the approved commit:

- Stage the specified files with `git add`
- **IMPORTANT:** We are using pre-commit hooks that will likely report shortcomings. You need to fix them. Don't skip validation unless there are open tasks adressing especially these problems.
- **Create the commit** with the approved message
- Verify commit was created successfully
- **GitHub Issue Update (if applicable):**
  - If task has a linked GitHub issue
  - Add commit link comment to issue:
    ```bash
    gh issue comment {issue_number} --body "🔗 Commit: {commit_sha} - {commit_message}"
    ```
- **IMPORTANT:** If there are more commits remaining, return to step 3 for the next commit
- Only proceed to step 6 when all commits are completed

## 6 · Report commit results

Provide summary:

- **Commits Created**: List each commit with SHA and message
- **Files Committed**: Total count of files committed
- **Remaining Changes**: Any uncommitted changes still pending
- **Repository Status**: Current git status after commits

## 7 · Generate Changelog (Optional)

After successful commits:

- Ask user: "커밋이 완료되었습니다. Changelog를 업데이트하시겠습니까? (y/n)"
- If yes, execute: `/project:aiwf:changelog`
- This will:
  - Analyze recent commit history
  - Generate or update CHANGELOG.md
  - Categorize changes by type (feat, fix, docs, etc.)
  - Include the commits just created
