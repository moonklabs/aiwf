## Overview
Feature Ledger API는 AIWF 프로젝트에서 기능 개발을 추적하고 관리하는 명령어들을 제공합니다. 모든 명령어는 `/project:aiwf:` 접두사를 사용합니다.

### 1. create_feature_ledger
새로운 Feature Ledger를 생성합니다.

```bash
/project:aiwf:create_feature_ledger <feature_name> [options]
```

#### Parameters
- `feature_name` (required): 기능 이름 (snake_case 권장)

#### Options
- `--milestone, -m`: 연결할 마일스톤 ID (예: M02)
- `--sprint, -s`: 연결할 스프린트 ID (예: S01_M02)
- `--priority, -p`: 우선순위 (critical|high|medium|low) - 기본값: medium
- `--complexity, -c`: 복잡도 (simple|moderate|complex) - 기본값: moderate
- `--assignee, -a`: 담당자 이름
- `--tags, -t`: 태그 목록 (쉼표로 구분)

#### Example
/project:aiwf:create_feature_ledger user_authentication --milestone M02 --sprint S01_M02 --priority high --complexity complex --assignee "john_doe" --tags "security,backend"
```

#### Response
```
✅ Feature Ledger created successfully!
Feature ID: FL001
Title: User Authentication
Status: active
Location: .aiwf/06_FEATURE_LEDGERS/active/FL001_User_Authentication.md
```

### 2. update_feature_status
Feature의 상태를 업데이트합니다.

/project:aiwf:update_feature_status <feature_id> <new_status> [options]
```

- `feature_id` (required): Feature ID (예: FL001)
- `new_status` (required): 새로운 상태 (active|completed|paused|archived)

- `--comment, -c`: 상태 변경 이유나 코멘트
- `--completion-date`: 완료 날짜 (completed 상태일 때)

#### State Transition Rules
- `active` → `completed`, `paused`, `archived`
- `paused` → `active`, `archived`
- `completed` → `archived`
- `archived` → 다른 상태로 전환 불가

/project:aiwf:update_feature_status FL001 completed --comment "All tests passing, merged to main" --completion-date 2025-07-09
```

```
✅ Feature status updated!
Feature: FL001 - User Authentication
Previous Status: active → New Status: completed
File moved to: .aiwf/06_FEATURE_LEDGERS/completed/FL001_User_Authentication.md
```

### 3. link_feature_commit
현재 Git 커밋을 Feature에 연결합니다.

/project:aiwf:link_feature_commit <feature_id> [options]
```

- `feature_id` (required): Feature ID

- `--commit, -c`: 특정 커밋 해시 (기본값: 현재 HEAD)
- `--auto-progress`: 커밋 메시지 기반 자동 진행률 업데이트

#### Supported Commit Patterns
- `feat(FL001):` - 기능 추가
- `fix(FL001):` - 버그 수정
- `test(FL001):` - 테스트 추가
- `docs(FL001):` - 문서화
- `[FL001]` - 일반 참조

/project:aiwf:link_feature_commit FL001 --auto-progress
```

```
✅ Commit linked to feature!
Feature: FL001
Commit: abc123def456
Message: feat(FL001): Implement JWT token generation
Progress updated: 45% → 55%
```

### 4. feature_dashboard
Feature 개발 현황 대시보드를 생성합니다.

/project:aiwf:feature_dashboard [options]
```

- `--milestone, -m`: 특정 마일스톤으로 필터링
- `--sprint, -s`: 특정 스프린트로 필터링
- `--assignee, -a`: 담당자로 필터링
- `--status`: 상태로 필터링
- `--format, -f`: 출력 형식 (markdown|json|html)

/project:aiwf:feature_dashboard --milestone M02 --status active
```

```markdown

## Summary
- Total Features: 12
- Active: 4 (33%)
- Completed: 7 (58%)
- Paused: 1 (8%)

## Active Features (4)
| ID | Title | Progress | Assignee | Sprint |
|----|-------|--------|
| FL001 | User Authentication | 70% | john_doe | S01_M02 |
| FL002 | Dashboard Redesign | 35% | jane_smith | S01_M02 |
| FL004 | API Rate Limiting | 15% | bob_jones | S02_M02 |
| FL005 | Search Enhancement | 50% | alice_wong | S02_M02 |

## Recent Activity
- FL001: New commit linked (2 hours ago)
- FL003: Status changed to completed (5 hours ago)
- FL005: Progress updated to 50% (1 day ago)
```

### 5. update_feature_progress
Feature의 진행률을 업데이트합니다.

/project:aiwf:update_feature_progress <feature_id> <progress_percentage> [options]
```

- `progress_percentage` (required): 진행률 (0-100)

- `--update-checklist`: 체크리스트 항목 업데이트
- `--hours, -h`: 실제 작업 시간 추가

/project:aiwf:update_feature_progress FL001 75 --hours 4
```

### 6. feature_search
Feature를 검색합니다.

/project:aiwf:feature_search <query> [options]
```

- `query` (required): 검색어

- `--tags, -t`: 태그로 필터링
- `--date-range, -d`: 날짜 범위 (예: "2025-07-01:2025-07-31")
- `--include-archived`: 보관된 feature 포함

/project:aiwf:feature_search "authentication" --tags "security" --date-range "2025-07-01:2025-07-31"
```

### 7. feature_report
Feature 보고서를 생성합니다.

/project:aiwf:feature_report <report_type> [options]
```

#### Report Types
- `velocity`: 개발 속도 분석
- `burndown`: 번다운 차트
- `timeline`: 타임라인 뷰
- `dependencies`: 의존성 그래프

- `--output, -o`: 출력 파일 경로
- `--format, -f`: 파일 형식 (pdf|html|markdown)

/project:aiwf:feature_report velocity --milestone M02 --output "reports/velocity_M02.pdf"
```

### 8. link_feature_pr
Pull Request를 Feature에 연결합니다.

/project:aiwf:link_feature_pr <feature_id> <pr_number> [options]
```

- `pr_number` (required): PR 번호

- `--auto-complete`: PR이 머지되면 자동으로 feature 완료 처리

/project:aiwf:link_feature_pr FL001 42 --auto-complete
```

### 9. feature_branch
Feature 브랜치를 생성하거나 체크아웃합니다.

/project:aiwf:feature_branch <feature_id> [action]
```

- `action` (optional): create|checkout|delete (기본값: create)

/project:aiwf:feature_branch FL001 create

# Creates and checks out: feature/FL001-user-authentication
```

### 10. feature_sync
Feature 정보를 Git과 동기화합니다.

/project:aiwf:feature_sync [options]
```

- `--feature, -f`: 특정 feature만 동기화
- `--direction, -d`: sync 방향 (git-to-ledger|ledger-to-git|both)

/project:aiwf:feature_sync --direction both
```

### 11. feature_template
Feature 템플릿을 관리합니다.

/project:aiwf:feature_template <action> [template_name]
```

#### Actions
- `list`: 사용 가능한 템플릿 목록
- `create`: 새 템플릿 생성
- `apply`: 템플릿 적용

/project:aiwf:feature_template apply backend_api FL006
```

### 12. feature_archive
오래된 Feature를 보관합니다.

/project:aiwf:feature_archive [options]
```

- `--days, -d`: N일 이상 된 completed feature 보관 (기본값: 90)
- `--dry-run`: 실제 실행 없이 대상 목록만 표시

/project:aiwf:feature_archive --days 60 --dry-run
```

## Error Codes
| Code | Description | Solution |
|------|-------------|----------|
| E001 | Feature ID not found | Feature ID가 올바른지 확인 |
| E002 | Invalid status transition | 허용된 상태 전환 규칙 확인 |
| E003 | Duplicate feature ID | 다른 ID 사용 또는 기존 feature 업데이트 |
| E004 | Git integration failed | Git 저장소 상태 확인 |
| E005 | Permission denied | 파일 권한 확인 |
| E006 | Invalid parameter | 명령어 파라미터 형식 확인 |

## Environment Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `AIWF_FEATURE_DIR` | Feature Ledger 디렉토리 경로 | `.aiwf/06_FEATURE_LEDGERS` |
| `AIWF_AUTO_COMMIT` | 변경사항 자동 커밋 여부 | `false` |
| `AIWF_DEFAULT_PRIORITY` | 기본 우선순위 | `medium` |
| `AIWF_DEFAULT_COMPLEXITY` | 기본 복잡도 | `moderate` |

## Best Practices
1. *Feature ID 관리*
   - 순차적 번호 사용 (FL001, FL002, ...)
   - 재사용 금지
   - 의미 있는 이름 사용

2. *커밋 메시지*
   - Feature ID 포함
   - Conventional Commits 형식 사용
   - 예: `feat(FL001): Add user login functionality`

3. *진행률 업데이트*
   - 정기적으로 업데이트
   - 체크리스트와 동기화
   - 실제 작업 시간 기록

4. *상태 관리*
   - 명확한 전환 이유 기록
   - 완료 기준 명확히 정의
   - 정기적인 상태 리뷰

5. *통합*
   - Git 브랜치와 1:1 매핑
   - PR과 연결
   - 자동화 활용