# Technical Specification: Feature Ledger System

## Overview

Feature Ledger System은 AIWF 프로젝트 내에서 개발 중인 기능들을 체계적으로 추적하고 문서화하는 시스템입니다. Wrinkl 프로젝트의 개념을 차용하여 AIWF의 구조에 맞게 구현합니다.

## Architecture

### Directory Structure
```
.aiwf/
├── 06_FEATURE_LEDGERS/
│   ├── active/
│   │   ├── FL001_User_Authentication.md
│   │   └── FL002_Dashboard_Redesign.md
│   ├── completed/
│   │   └── FL000_Initial_Setup.md
│   ├── archived/
│   │   └── FL003_Deprecated_API.md
│   └── FEATURE_LEDGER_INDEX.md
```

### File Naming Convention
- Pattern: `FL###_Feature_Name.md`
- FL = Feature Ledger
- ### = 3-digit sequential number
- Feature_Name = Snake_case feature identifier

## Data Model

### Feature Ledger Entry
```yaml
---
feature_id: FL001
title: User Authentication System
status: active # active | completed | archived | paused
created_date: 2025-07-08
last_updated: 2025-07-08 15:45
milestone: M02
sprint: S04_M02
assignee: developer_name
tags: [authentication, security, backend]
---
```

### Feature States
1. **active**: Currently being developed
2. **completed**: Development finished and tested
3. **archived**: No longer relevant or deprecated
4. **paused**: Temporarily on hold

## Command Specifications

### 1. Create Feature Ledger
```bash
/project:aiwf:create_feature_ledger <feature_name>
```

**Process**:
1. Generate next available FL### number
2. Create feature ledger file in `active/` directory
3. Populate with template content
4. Update FEATURE_LEDGER_INDEX.md
5. Link to current sprint/milestone if applicable

### 2. Update Feature Status
```bash
/project:aiwf:update_feature_status <feature_id> <new_status>
```

**Process**:
1. Locate feature file
2. Update status in YAML frontmatter
3. Move file to appropriate directory (active/completed/archived)
4. Update index and timestamps
5. Log status change in feature history

### 3. Link Feature to Git
```bash
/project:aiwf:link_feature_commit <feature_id>
```

**Process**:
1. Extract current git branch/commit
2. Add commit reference to feature ledger
3. Auto-update feature progress based on commit message
4. Generate commit section in feature document

### 4. Generate Feature Dashboard
```bash
/project:aiwf:feature_dashboard
```

**Output Format**:
```markdown
# Feature Development Dashboard

## Active Features (3)
- FL001: User Authentication [70% complete]
- FL002: Dashboard Redesign [30% complete]
- FL004: API Rate Limiting [10% complete]

## Recently Completed (2)
- FL000: Initial Setup (2025-07-07)
- FL003: Database Migration (2025-07-06)

## By Milestone
### M02: Context Engineering Enhancement
- Active: 2
- Completed: 1
- Total Progress: 45%
```

## Integration Points

### Git Integration
- Pre-commit hook to prompt feature ledger update
- Auto-detect feature references in commit messages (e.g., `[FL001]`)
- Generate feature-based changelog

### Sprint/Task Integration
- Auto-link features to tasks
- Update feature progress from task completion
- Cross-reference in sprint reviews

### AI Context Integration
- Include active features in AI context
- Compress completed features for token efficiency
- Provide feature history on demand

## Template Structure

### Feature Ledger Template
```markdown
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
actual_completion: null
---

# Feature: {{ title }}

## Overview
Brief description of the feature and its purpose.

## Requirements
- [ ] Requirement 1
- [ ] Requirement 2
- [ ] Requirement 3

## Technical Design
### Architecture Changes
Description of architectural impacts

### API Changes
Any API modifications or additions

### Database Changes
Schema updates or migrations

## Progress Log
### YYYY-MM-DD
- Initial feature ledger created
- Design discussion completed

## Related Documents
- Link to PRD
- Link to Technical Spec
- Link to Design Mockups

## Git History
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

## Implementation Requirements

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

## Future Enhancements

1. **Feature Dependencies**: Track inter-feature dependencies
2. **Metrics Collection**: Auto-calculate velocity and cycle time
3. **Visual Timeline**: Generate feature timeline visualization
4. **AI Insights**: Feature completion predictions based on history