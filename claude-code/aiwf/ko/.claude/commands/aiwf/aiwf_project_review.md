# 프로젝트 리뷰 - 탑 다운 실행

아키텍처, 진행 상황, 기술 결정에 초점을 맞춘 포괄적인 프로젝트 수준 리뷰를 수행합니다.

**중요사항:**

- 이는 최근 변경 사항이 아닌 전체 프로젝트 상태에 대한 고수준 리뷰입니다.
- 프로젝트 문서에 명확히 언급되지 않은 한, 타임라인과 일정은 관련이 없습니다

## 정확히 다음 9개 항목으로 TODO 생성

1. 리뷰 범위 및 타이밍 분석
2. 테스트 인프라 상태 실행 및 평가
3. 프로젝트 문서 정렬 평가
4. 마일스톤 및 스프린트 진행 상황 검토
5. 코드베이스 아키텍처 및 구조 분석
6. 파일 구성 및 워크플로우 준수 감사
7. 기술적 결정 및 복잡성 평가
8. 구현 품질 비평 (John Carmack 관점)
9. 권장 사항과 함께 포괄적인 평가 제공

단계별로 진행하며 각 단계에 대한 다음 지침을 엄격히 준수하세요.

## 모든 TODO 항목에 대한 세부사항

### 1. 리뷰 범위 및 타이밍 분석

확인: <$ARGUMENTS>

비어있다면 전체 프로젝트 리뷰를 수행합니다. 그렇지 않으면 <$ARGUMENTS>를 해석하여 특정 초점 영역(마일스톤, 스프린트, 아키텍처 구성 요소 등)을 식별합니다. Argument에 명시되지 않은 한 `.aiwf/10_STATE_OF_PROJECT`의 이전 프로젝트 리뷰와 비교하지 마세요.

**중요:** 이 리뷰는 최근 변경사항의 맥락에서 전체 프로젝트 상태를 살펴봅니다.

**핵심:** `.aiwf/00_PROJECT_MANIFEST.md`를 **먼저** 읽어서 다음을 이해하세요:

- 현재 마일스톤 및 스프린트 상태
- 완료된 작업 vs 진행 중인 작업 vs 계획된 작업
- 활성 스프린트 목표 및 결과물

**맥락 확인:** 기능 평가 전에:

- `.aiwf/03_SPRINTS/`로 이동하여 현재 스프린트 찾기
- 스프린트 메타 파일을 읽어 범위 내에 있는 것 이해하기
- 스프린트 내에서 완료된 태스크 vs 계획된 태스크 확인
- 향후 스프린트가 제공할 내용 이해하기

**리뷰 원칙:** 전체 마일스톤 범위가 아닌 현재 스프린트 결과물에 대해 평가합니다.

### 2. 테스트 인프라 상태 실행 및 평가

**핵심:** 테스트 인프라 상태는 스프린트/마일스톤 진행의 차단 기준입니다.

- 전체 테스트 스위트 실행을 위해 test.md 명령 사용 (@.claude/commands/aiwf/aiwf_test.md)
- 테스트 결과 분석: 통과/실패/건너뛴 개수 및 실패 카테고리
- 테스트 상태 점수 계산 (0-10 스케일):
  - 10: 100% 통과율, 인프라 문제 없음
  - 8-9: >95% 통과율, 사소한 문제만 있음
  - 6-7: 80-95% 통과율, 일부 비핵심 실패
  - 4-5: 60-80% 통과율, 중대한 문제
  - 0-3: <60% pass rate, critical infrastructure problems
- CATEGORIZE failures:
  - Infrastructure: Import errors, missing modules
  - Configuration: Environment variables, database connections
  - Logic: Assertion failures, actual bugs
  - Flaky: Intermittent failures
- DETERMINE blocking status:
  - Score < 6: BLOCKS sprint progression
  - Score < 8: BLOCKS milestone completion
  - Score < 4: TRIGGERS emergency escalation
- IDENTIFY root causes of any infrastructure failures
- TRACK trend vs previous review (improvement/degradation)
- ASSESS test strategy validity for scope of the project. Tests should be pragmatic and help assuring functionality but not get in the way of development progress too much.

### 3. Assess project documentation alignment

**USE PARALLEL AGENTS** to follow these steps:

- READ all core documents in `.aiwf/01_PROJECT_DOCS/` especially ARCHITECTURE.md
- READ current milestone requirements in `.aiwf/02_REQUIREMENTS/`
- READ architecture decisions in `.aiwf/05_ARCHITECTURE_DECISIONS` as they might extend/contradict other documents
- IDENTIFY any gaps between documentation and current implementation
- CHECK if the project is still following the documented architecture vision
- VERIFY that current code structure matches documented patterns

**IMPORTANT:** Documentation is our source of truth. Any deviation needs justification.

### 4. Review milestone and sprint progress

**USE PARALLEL AGENTS** to follow these steps:

- READ `.aiwf/00_PROJECT_MANIFEST.md` for current status
- ANALYZE completed sprints in `.aiwf/03_SPRINTS/`
- COMPARE actual progress against CURRENT SPRINT deliverables (not full milestone)
- DISTINGUISH between sprint-level tasks vs milestone-level features
- ASSESS if current sprint focus aligns with milestone goals

### 5. Analyze codebase architecture and structure

#

**USE PARALLEL AGENTS** to follow these steps:

- EXAMINE overall project structure and organization
- ANALYZE import patterns and dependency relationships
- REVIEW database models and API structure for consistency
- CHECK for architectural patterns: are we following DDD, clean architecture, etc.?
- IDENTIFY any architectural debt or inconsistencies

**Focus areas:**

- **Directory structure** — logical organization, separation of concerns
- **Dependencies** — are we over-engineering? unnecessary libraries?
- **Models/Schemas** — consistency, proper relationships, normalization
- **APIs** — RESTful design, proper HTTP methods, consistent patterns
- **Configuration** — environment management, secrets handling

### 6. Audit file organization and workflow compliance

**IMPORTANT:** Check for workflow discipline and architectural boundary violations.

- **Root directory audit** — identify files that don't belong in project root
- **Development scripts** — verify all dev scripts follow `run_dev.py` pattern
- **Test file organization** — check tests are in `tests/` directory, not scattered
- **Documentation placement** — verify docs are in proper locations
- **Temporary/experimental files** — flag any `.py` files that look ad-hoc or experimental

**File Organization Rules to Enforce:**

- **Development scripts** — MUST go through `run_dev.py`, not standalone files
- **Test files** — MUST be in `tests/` directory with proper naming (`test_*.py`)
- **Documentation** — MUST be in `docs/` or `.aiwf/01_PROJECT_DOCS/`
- **Configuration** — MUST follow established patterns (`.env.example`, `pyproject.toml`)
- **Temporary files** — SHOULD NOT exist in committed code

**Red Flags to Identify:**

- Multiple scripts doing similar things (duplicate functionality)
- Random `.py` files in root directory
- Test files outside `tests/` directory
- Development scripts bypassing `run_dev.py`
- Unclear file purposes or experimental code

**CRITICAL:** File proliferation indicates workflow breakdown. Flag for immediate cleanup task creation.

### 7. Evaluate technical decisions and complexity

- ASSESS complexity vs. business value ratio
- REVIEW choice of frameworks, libraries, and tools
- ANALYZE if current patterns will scale with project growth
- IDENTIFY areas where we might be over-complicating simple problems
- CHECK for premature optimization or under-optimization

**IMPORTANT:** Think like an experienced developer. Are we solving the right problems the right way?

### 8. Critique implementation quality (John Carmack perspective)

Think as John Carmack would: focus on simplicity, performance, and maintainability, but keep the projects goal in mind. Especially long term vision as well. Don't over simplify.

- **Simplicity:** Are we solving problems in the most straightforward way?
- **Performance:** Are there obvious performance issues or bottlenecks?
- **Maintainability:** Will a new developer understand this code in 6 months?
- **Robustness:** How does the system handle edge cases and failures?
- **Technical debt:** What shortcuts are we taking that will hurt us later?

Be **brutally honest**. Carmack-level critique means no sugar-coating but still staying true to the project's reality.
Be thorough and **go above and beyond** in your analysis - leave no stone unturned.

### 9. Provide comprehensive assessment with recommendations

**IMPORTANT:** Get current timestamp and create output file

- Get current timestamp using system date command
- Create filename: `YYYY-MM-DD-HH-MM-<judgment-slug>.md` in `.aiwf/10_STATE_OF_PROJECT/`
- Judgment slug should be 2-3 words describing overall project health (e.g., "solid-progress", "needs-focus", "critical-issues", "doing-great", "on-track")

**IMPORTANT:** Write full report to the timestamped file with this format:

```markdown
# Project Review - [YYYY-MM-DD HH:MM]

## 🎭 Review Sentiment

[3 emojis only - no explanations]

## Executive Summary

- **Result:** EXCELLENT | GOOD | NEEDS_WORK | CRITICAL_ISSUES
- **Scope:** What areas were reviewed
- **Overall Judgment:** [2-3 word assessment used in filename]

## Test Infrastructure Assessment

- **Test Suite Status**: [PASSING/FAILING/BLOCKED] (X/Y tests)
- **Test Pass Rate**: X% (Y passed, Z failed)
- **Test Health Score**: X/10
- **Infrastructure Health**: [HEALTHY/DEGRADED/BROKEN]
  - Import errors: [count]
  - Configuration errors: [count]
  - Fixture issues: [count]
- **Test Categories**:
  - Unit Tests: X/Y passing
  - Integration Tests: X/Y passing
  - API Tests: X/Y passing
- **Critical Issues**:
  - [List of blocking test infrastructure problems]
  - [Module import mismatches]
  - [Environment configuration failures]
- **Sprint Coverage**: [% of sprint deliverables with passing tests]
- **Blocking Status**: [CLEAR/BLOCKED - reason]
- **Recommendations**:
  - [Immediate fixes required]
  - [Test infrastructure improvements needed]

## Development Context

- **Current Milestone:** [ID and status from manifest]
- **Current Sprint:** [ID and focus]
- **Expected Completeness:** [what SHOULD be done at this stage]

## Progress Assessment

- **Milestone Progress:** [percentage complete]
- **Sprint Status:** [current sprint assessment]
- **Deliverable Tracking:** [what's done vs planned]

## Architecture & Technical Assessment

- **Architecture Score:** 1-10 rating with explanation
- **Technical Debt Level:** LOW | MEDIUM | HIGH with specific examples
- **Code Quality:** [overall assessment with examples]

## File Organization Audit

- **Workflow Compliance:** GOOD | NEEDS_ATTENTION | CRITICAL_VIOLATIONS
- **File Organization Issues:** [list any misplaced files, duplicate scripts, etc.]
- **Cleanup Tasks Needed:** [specific file moves/deletions/consolidations required]

## Critical Findings

### Critical Issues (Severity 8-10)

[Lists of must-fix problems headed with #### heading, one empty line and then list of details]

### Improvement Opportunities (Severity 4-7)

[List of recommended enhancements headed with #### heading, one empty line and then list of details]

## John Carmack Critique 🔥

[Top 3 brutally honest observations about technical decisions]

## Recommendations

Based on your findings recommend Action items - chose whatever fits your findings

- **Important fixes:** What needs to be fixed immediately?
- **Optional fixes/changes:** What would still be recommended though optional?
- **Next Sprint Focus:** Can the user move to the next sprint?
```

**IMPORTANT:** Be specific with file paths and line numbers. This review should be actionable and permanently archived.
