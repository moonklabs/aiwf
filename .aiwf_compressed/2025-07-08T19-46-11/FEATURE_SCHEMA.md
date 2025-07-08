# Feature Ledger Schema Definition
This document defines the data model and schema for Feature Ledger entries in AIWF.

## YAML Frontmatter Schema
```yaml
---

# Required Fields
feature_id: FL###  # Unique identifier (FL + 3-digit number)
title: string  # Feature title (max 100 chars)
status: enum  # active | completed | archived | paused
created_date: YYYY-MM-DD  # Creation date
last_updated: YYYY-MM-DD HH:MM  # Last modification timestamp

# Milestone & Sprint Association
milestone: M##  # Associated milestone ID
sprint_ids: [S##_M##, ...]  # List of related sprint IDs
tasks: [T##_S##, ...]  # List of related task IDs

# Team & Assignment
assignee: string  # Primary assignee username
contributors: [string, ...]  # List of contributor usernames
reviewers: [string, ...]  # List of reviewer usernames

# Classification
priority: enum  # critical | high | medium | low
complexity: enum  # simple | moderate | complex
category: string  # feature | enhancement | bugfix | refactor
tags: [string, ...]  # Searchable tags

# Time Tracking
estimated_hours: number  # Estimated hours to complete
actual_hours: number  # Actual hours spent
estimated_completion: YYYY-MM-DD  # Estimated completion date
actual_completion: YYYY-MM-DD  # Actual completion date

# Git Integration
git_branch: string  # Associated git branch name
git_commits: [string, ...]  # List of commit hashes
pull_requests: [  # Associated PRs
  {
   number: integer,
   title: string,
   status: string,  # open | merged | closed
   url: string
  }
]

# Dependencies
depends_on: [FL###, ...]  # Feature dependencies
blocks: [FL###, ...]  # Features blocked by this one

# Progress Tracking
progress_percentage: 0-100  # Overall progress percentage
checklist_items_total: integer  # Total checklist items
checklist_items_completed: integer  # Completed checklist items

# Risk & Issues
risk_level: enum  # low | medium | high
known_issues: [string, ...]  # List of known issues
mitigation_plans: [string, ...]  # Risk mitigation strategies

# Additional Metadata
external_links: [  # External resources
  {
   type: string  # doc | design | spec | discussion
  }
]
notes: string  # Additional notes (multiline)
---
```

### feature_id
- Pattern: `FL[0-9]{3}`
- Must be unique across all features
- Sequential assignment recommended

### title
- Required, non-empty string
- Maximum 100 characters
- Should be descriptive and searchable

### status
- Required enum value
- Valid transitions:
  - `active` → `completed`, `paused`, `archived`
  - `paused` → `active`, `archived`
  - `completed` → `archived`
  - `archived` → (no transitions allowed)

### dates
- ISO 8601 format for all dates
- `created_date` is immutable once set
- `last_updated` auto-updates on any change

### priority
- Default: `medium`
- Used for sprint planning and resource allocation

### complexity
- Default: `moderate`
- Guidelines:
  - `simple`: < 8 hours estimated
  - `moderate`: 8-40 hours estimated
  - `complex`: > 40 hours estimated

### progress_percentage
- Calculated based on:
  - Checklist completion (40%)
  - Task completion (40%)
  - Time elapsed vs estimate (20%)

### active
- Feature is currently being worked on
- Has assigned resources
- Appears in active dashboards

### completed
- All acceptance criteria met
- Code merged to main branch
- Tests passing
- Documentation updated

### paused
- Work temporarily halted
- Reason documented in notes
- Resources reallocated

### archived
- No longer relevant
- Kept for historical reference
- Excluded from active reports

## Example Feature Entry
---
feature_id: FL001
title: User Authentication System
status: active
created_date: 2025-07-08
last_updated: 2025-07-08 23:50

milestone: M02
sprint_ids: [S01_M02, S02_M02]
tasks: [T01_S01, T02_S01]

assignee: developer1
contributors: [developer2, designer1]
reviewers: [lead_dev, architect]

priority: high
complexity: complex
category: feature
tags: [authentication, security, backend, api]

estimated_hours: 80
actual_hours: 45
estimated_completion: 2025-07-20
actual_completion: null

git_branch: feature/FL001-user-auth
git_commits: [abc123, def456]
pull_requests:
  - number: 42
   title: "Implement JWT authentication"
   status: open
   url: "https://github.com/org/repo/pull/42"

depends_on: []
blocks: [FL002, FL003]

progress_percentage: 55
checklist_items_total: 12
checklist_items_completed: 7

risk_level: medium
known_issues:
  - "Session timeout handling needs refinement"
  - "Password reset flow requires email service"
mitigation_plans:
  - "Implement refresh token mechanism"
  - "Integrate with SendGrid for email delivery"

external_links:
  - title: "Authentication Design Doc"
   url: "https://docs.example.com/auth-design"
   type: "design"
  - title: "Security Requirements"
   url: "https://docs.example.com/security-req"
   type: "spec"

notes: |
  Initial implementation focuses on JWT-based authentication.
  Need to consider OAuth2 integration in future sprints.
  Performance testing required for token validation endpoint.
---
```