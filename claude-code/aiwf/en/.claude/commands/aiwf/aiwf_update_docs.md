# Update Documentation

Analyze current project documentation and update it to reflect implementation progress and recent changes.

## Create a TODO with EXACTLY these 10 Items

1. Analyze documentation update scope
2. Review project manifest and milestones
3. Assess sprint documentation status
4. Update ARCHITECTURE.md if needed
5. Update milestone requirements documentation
6. Update sprint documentation
7. Review and update PROJECT_MANIFEST.md
8. Update README.md and project documentation
9. Update additional documentation folders
10. Generate documentation update summary

Follow step by step and adhere closely to the following instructions for each step.

## DETAILS on every TODO item

### 1. Analyze documentation update scope

Check: <$ARGUMENTS>

If empty, perform full documentation review. Otherwise interpret <$ARGUMENTS> to identify specific focus areas (milestone, sprint, architecture component, etc.).

**CRITICAL:** Read `.aiwf/00_PROJECT_MANIFEST.md` FIRST to understand:
- Current milestone and sprint status
- What work is complete vs in-progress vs planned
- Recent changes that need documentation

### 2. Review project manifest and milestones

**USE PARALLEL AGENTS** to:
- READ `.aiwf/00_PROJECT_MANIFEST.md` for current status
- READ all milestone requirements in `.aiwf/02_REQUIREMENTS/`
- IDENTIFY what has changed since last documentation update
- CHECK for any milestones marked as completed that need status updates

### 3. Assess sprint documentation status

**USE PARALLEL AGENTS** to:
- NAVIGATE to `.aiwf/03_SPRINTS/` to find current and completed sprints
- READ sprint meta files to understand deliverables
- CHECK task completion status within each sprint
- IDENTIFY sprints that need status updates or completion markers

### 4. Update ARCHITECTURE.md if needed

- READ `.aiwf/01_PROJECT_DOCS/ARCHITECTURE.md`
- REVIEW implementation to see if architecture has evolved
- UPDATE diagrams if structure has changed
- ADD new components or modules discovered during implementation
- DOCUMENT any architectural decisions made during recent sprints

**IMPORTANT:** Only update if architecture has actually changed. Don't modify for minor details.

### 5. Update milestone requirements documentation

For each active or recently completed milestone:
- NAVIGATE to `.aiwf/02_REQUIREMENTS/M{N}_*/`
- UPDATE `requirements.md` with:
  - ✅ Completed requirements
  - 🚧 In-progress items with % complete
  - 📋 Planned items not yet started
  - ❌ Deferred or removed requirements with justification
- ADD implementation notes for complex features
- DOCUMENT any requirement changes or clarifications

### 6. Update sprint documentation

For current and recently completed sprints:
- NAVIGATE to `.aiwf/03_SPRINTS/S{N}_*/`
- UPDATE sprint meta file with:
  - Current status (PLANNED/IN_PROGRESS/COMPLETED)
  - Completion percentage
  - Actual vs planned deliverables
- UPDATE individual task files:
  - Mark completed tasks with ✅
  - Add implementation notes
  - Document any blockers or challenges
  - Link to relevant code files

### 7. Review and update PROJECT_MANIFEST.md

Update the manifest with:
- **Current Status**: Update milestone and sprint progress
- **Sprint Tracking**: Mark completed sprints, update current sprint
- **Deliverables**: Update completion status for each deliverable
- **Recent Achievements**: Add notable completions
- **Known Issues**: Document any blockers or technical debt
- **Next Steps**: Update based on completed work

**Format Example:**
```markdown
## Current Status
- **Active Milestone**: M01 - [Name] (75% complete)
- **Current Sprint**: S03 - [Focus] (IN PROGRESS - 40% complete)
- **Last Updated**: YYYY-MM-DD HH:MM

## Sprint Progress

### Current Sprint (S03)
**Status**: IN PROGRESS (40% complete)
**Deliverables**:
- ✅ [Completed feature] - Done
- 🚧 [In-progress feature] - 60% complete
- 📋 [Planned feature] - Not started
```

### 8. Update README.md and project documentation

**Review and update the project's main README.md:**
- CHECK if README.md exists in project root
- UPDATE project description if scope has evolved
- REFRESH installation/setup instructions based on recent changes
- UPDATE usage examples with new features
- ADD/UPDATE badges (build status, test coverage, version)
- DOCUMENT new dependencies or requirements
- UPDATE contributing guidelines if process changed
- REFRESH API documentation if endpoints changed

**Key sections to review:**
- Project overview and purpose
- Features list (mark completed/in-progress/planned)
- Installation and setup instructions
- Usage examples and code snippets
- Configuration options
- API reference (if applicable)
- Contributing guidelines
- License information

### 9. Update additional documentation folders

**Search and update all documentation across the project:**

**Common documentation locations to check:**
- `docs/` - Main documentation folder
- `documentation/` - Alternative documentation folder
- `doc/` - Short form documentation folder
- `api-docs/` - API-specific documentation
- `*.md` files in project root (CONTRIBUTING.md, CHANGELOG.md, etc.)

**For each documentation folder found:**
- REVIEW all markdown files for outdated information
- UPDATE technical specifications with implementation details
- REFRESH user guides with new features
- UPDATE API documentation with new endpoints/changes
- ADD migration guides if breaking changes introduced
- UPDATE troubleshooting sections with known issues/solutions

**Specific files to check:**
- `CHANGELOG.md` - Add recent changes and version updates
- `CONTRIBUTING.md` - Update development workflow if changed
- `docs/setup.md` - Refresh installation/configuration steps
- `docs/api.md` - Update API endpoints and examples
- `docs/deployment.md` - Update deployment procedures
- `docs/testing.md` - Document new test procedures

**Documentation consistency checks:**
- Ensure version numbers are consistent across all docs
- Verify code examples still work with current implementation
- Update screenshots/diagrams if UI/architecture changed
- Check that all links (internal and external) are valid
- Ensure terminology is consistent throughout

### 10. Generate documentation update summary

Create a summary report of all documentation updates:

```markdown
# Documentation Update Summary - [YYYY-MM-DD]

## Files Updated

### AIWF Documentation
- `.aiwf/00_PROJECT_MANIFEST.md` - [brief description of changes]
- `.aiwf/01_PROJECT_DOCS/ARCHITECTURE.md` - [if updated]
- `.aiwf/02_REQUIREMENTS/M01_*/requirements.md` - [status updates]
- `.aiwf/03_SPRINTS/S0N_*/meta.md` - [sprint status changes]

### Project Documentation
- `README.md` - [main project documentation updates]
- `CHANGELOG.md` - [version and change history updates]
- `CONTRIBUTING.md` - [contribution guideline updates]
- `docs/*.md` - [specific documentation file updates]
- Other documentation folders - [list any additional updates]

## Key Changes
1. [Major documentation change or update]
2. [New sections added]
3. [Status updates applied]

## Project Status After Update
- **Milestone Progress**: M01 at X% (was Y%)
- **Sprint Progress**: S0N at X% (was Y%)
- **Documentation Coverage**: [assessment of documentation completeness]

## Recommendations
- [Any documentation gaps identified]
- [Suggested documentation improvements]
- [Areas needing clarification]
```

## Guidelines

- PRESERVE original requirements and plans (use strikethrough or status markers)
- MAINTAIN consistent status indicators (✅, 🚧, 📋, ❌)
- UPDATE percentages based on actual implementation
- DOCUMENT deviations from original plan with justification
- KEEP documentation concise but comprehensive
- ENSURE all dates and timestamps are current
- CROSS-REFERENCE related documentation sections
- SEARCH for all .md files across the project, not just in expected locations
- CHECK root directory for standalone documentation files
- VERIFY all code examples in documentation still work
- ENSURE documentation is accessible to new team members

**IMPORTANT:** Documentation should reflect reality. Update based on actual implementation status, not aspirational goals.

**CRITICAL:** Don't assume documentation locations. Always search the entire project for:
- `*.md` files in any directory
- Common names: README, CHANGELOG, CONTRIBUTING, LICENSE, INSTALL, USAGE
- Documentation in unexpected places (e.g., inside src/, lib/, or other code directories)