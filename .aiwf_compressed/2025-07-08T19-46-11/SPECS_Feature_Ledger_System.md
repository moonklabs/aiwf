## Overview
Feature Ledger System은 AIWF 프로젝트 내에서 개발 중인 기능들을 체계적으로 추적하고 문서화하는 시스템입니다. Wrinkl 프로젝트의 개념을 차용하여 AIWF의 구조에 맞게 구현합니다.

### Directory Structure
```
.aiwf/
├── 06_FEATURE_LEDGERS/
│  ├── active/
│  │  ├── FL001_User_Authentication.md
│  │  └── FL002_Dashboard_Redesign.md
│  ├── completed/
│  │  └── FL000_Initial_Setup.md
│  ├── archived/
│  │  └── FL003_Deprecated_API.md
│  ├── FEATURE_LEDGER_INDEX.md
│  ├── FEATURE_SCHEMA.md
│  ├── FEATURE_STATE_DIAGRAM.md
│  ├── FEATURE_INTEGRATION_GUIDE.md
│  └── FEATURE_GIT_INTEGRATION.md
```

### File Naming Convention
- Pattern: `FL###_Feature_Name.md`
- FL = Feature Ledger
- ### = 3-digit sequential number
- Feature_Name = Snake_case feature identifier

### Feature Ledger Entry
```yaml
---

# Core Identification
feature_id: FL001
title: User Authentication System
status: active # active | completed | archived | paused
created_date: 2025-07-08
last_updated: 2025-07-08 15:45

# Milestone & Sprint Association
milestone: M02
sprint_ids: [S01_M02, S02_M02]
tasks: [T01_S01, T02_S01]

# Team & Assignment
assignee: developer_name
contributors: [dev2, dev3]
reviewers: [lead_dev, architect]

# Classification
priority: high # critical | high | medium | low
complexity: complex # simple | moderate | complex
category: feature # feature | enhancement | bugfix | refactor
tags: [authentication, security, backend]

# Time Tracking
estimated_hours: 80
actual_hours: 45
estimated_completion: 2025-07-20
actual_completion: null

# Git Integration
git_branch: feature/FL001-user-auth
git_commits: [abc123, def456]
pull_requests:
  - number: 42
   title: "Implement JWT authentication"
   status: open
   url: "https://github.com/org/repo/pull/42"

# Dependencies
depends_on: []
blocks: [FL002, FL003]

# Progress Tracking
progress_percentage: 55
checklist_items_total: 12
checklist_items_completed: 7

# Risk & Issues
risk_level: medium # low | medium | high
known_issues: ["Session timeout handling needs refinement"]
mitigation_plans: ["Implement refresh token mechanism"]
---
```

### Feature States
1. *active*: Currently being developed
   - Has active resources assigned
   - Work is in progress
   - Appears in sprint boards and active dashboards

2. *completed*: Development finished and tested
   - All acceptance criteria met
   - Code merged to main branch
   - Tests passing
   - Documentation updated

3. *paused*: Temporarily on hold
   - Work temporarily halted
   - Resources reallocated
   - Reason documented in notes

4. *archived*: No longer relevant or deprecated
   - Kept for historical reference
   - Cannot be transitioned to other states
   - Excluded from active reports

For detailed state transition rules, see: `.aiwf/06_FEATURE_LEDGERS/FEATURE_STATE_DIAGRAM.md`

### 1. Create Feature Ledger
```bash
/project:aiwf:create_feature_ledger <feature_name>
```

*Process*:
1. Generate next available FL### number
2. Create feature ledger file in `active/` directory
3. Populate with template content
4. Update FEATURE_LEDGER_INDEX.md
5. Link to current sprint/milestone if applicable

### 2. Update Feature Status
/project:aiwf:update_feature_status <feature_id> <new_status>
```

1. Locate feature file
2. Update status in YAML frontmatter
3. Move file to appropriate directory (active/completed/archived)
4. Update index and timestamps
5. Log status change in feature history

### 3. Link Feature to Git
/project:aiwf:link_feature_commit <feature_id>
```

1. Extract current git branch/commit
2. Add commit reference to feature ledger
3. Auto-update feature progress based on commit message
4. Generate commit section in feature document

### 4. Generate Feature Dashboard
/project:aiwf:feature_dashboard
```

*Output Format*:
```markdown

## Active Features (3)
- FL001: User Authentication [70% complete]
- FL002: Dashboard Redesign [30% complete]
- FL004: API Rate Limiting [10% complete]

## Recently Completed (2)
- FL000: Initial Setup (2025-07-07)
- FL003: Database Migration (2025-07-06)

### M02: Context Engineering Enhancement
- Active: 2
- Completed: 1
- Total Progress: 45%
```

## Integration Points
- Pre-commit hook to prompt feature ledger update
- Auto-detect feature references in commit messages (e.g., `[FL001]`)
- Generate feature-based changelog
- Supported commit patterns:
  - `FL###` - Direct reference
  - `[FL###]` - Bracketed reference
  - `feat(FL###):` - Conventional commit format
  - `fix(FL###):` - Bug fix for feature
  - `#FL###` - Hash reference
- Automatic PR linking when title/body contains feature ID
- Branch naming convention: `feature/FL###-descriptive-name`
- For detailed Git integration, see: `.aiwf/06_FEATURE_LEDGERS/FEATURE_GIT_INTEGRATION.md`

### Sprint/Task Integration
- Features linked to multiple sprints via `sprint_ids` array
- Bidirectional linking between features and tasks
- Progress calculation based on task completion
- Milestone progress aggregated from feature statuses
- Integration patterns:
  - Feature → Sprints (one-to-many)
  - Feature → Tasks (one-to-many)
  - Milestone → Features (one-to-many)
- For detailed integration guide, see: `.aiwf/06_FEATURE_LEDGERS/FEATURE_INTEGRATION_GUIDE.md`

### AI Context Integration
- Include active features in AI context
- Compress completed features for token efficiency
- Provide feature history on demand

### Feature Ledger Template
---
feature_id: FL###
title: Feature Title
status: active
created_date: YYYY-MM-DD
last_updated: YYYY-MM-DD HH:MM
milestone: M##
sprint: S##_M##
assignee: name
tags: []
estimated_completion: YYYY-MM-DD
---

# Feature: {{ title }}
Brief description of the feature and its purpose.

## Requirements
- [ ] Requirement 1
- [ ] Requirement 2
- [ ] Requirement 3

### Architecture Changes
Description of architectural impacts

### API Changes
Any API modifications or additions

### Database Changes
Schema updates or migrations

### YYYY-MM-DD
- Initial feature ledger created
- Design discussion completed

## Related Documents
- Link to PRD
- Link to Technical Spec
- Link to Design Mockups

### Commits
- `commit_hash`: Commit message [YYYY-MM-DD]

### Pull Requests
- PR #123: PR title [status]

## Testing Plan
- Unit tests required
- Integration test scenarios
- User acceptance criteria

## Rollout Strategy
- Feature flag name: `feature_name_enabled`
- Rollout phases
- Monitoring plan

## Notes
Additional context or decisions made during development.
```

### Performance
- Index file updates should be < 100ms
- Feature search should support fuzzy matching
- Dashboard generation < 1 second

### Validation
- Ensure unique feature IDs
- Validate status transitions
- Check required fields on creation

### Error Handling
- Graceful handling of missing features
- Conflict resolution for concurrent updates
- Backup before bulk operations

## Migration Plan
For existing AIWF projects:
1. Scan existing tasks/sprints for features
2. Generate initial feature ledgers
3. Create index from discovered features
4. Prompt user to review and adjust

### Completed Components
- ✅ Directory structure created (`.aiwf/06_FEATURE_LEDGERS/`)
- ✅ Feature schema defined (`FEATURE_SCHEMA.md`)
- ✅ State transition diagram (`FEATURE_STATE_DIAGRAM.md`)
- ✅ Integration guide (`FEATURE_INTEGRATION_GUIDE.md`)
- ✅ Git integration specification (`FEATURE_GIT_INTEGRATION.md`)
- ✅ Feature template (`99_TEMPLATES/feature_template.md`)
- ✅ Index file structure (`FEATURE_LEDGER_INDEX.md`)

### Pending Components
- ⏳ CLI commands implementation
- ⏳ Git hooks setup
- ⏳ Automated sync mechanisms
- ⏳ Dashboard generation
- ⏳ Migration scripts

## Future Enhancements
1. *Feature Dependencies*: Track inter-feature dependencies
2. *Metrics Collection*: Auto-calculate velocity and cycle time
3. *Visual Timeline*: Generate feature timeline visualization
4. *AI Insights*: Feature completion predictions based on history
5. *Advanced Search*: Full-text search across features
6. *Export Capabilities*: Generate reports in various formats