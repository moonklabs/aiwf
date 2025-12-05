# AIWF Project Structure

AIWF (AI Workflow Framework) uses a structured directory organization for project management.

## Directory Structure

```
.aiwf/
├── 00_PROJECT_MANIFEST.md          # Central project reference
├── 01_PROJECT_DOCS/                # Technical documentation
│   └── ARCHITECTURE.md             # System architecture
├── 02_REQUIREMENTS/                # Milestone-based requirements
│   ├── CLAUDE.md                   # Requirements guide
│   └── M01_Milestone_Name/         # Milestone folders
│       └── M01_milestone_meta.md   # Milestone metadata
├── 03_SPRINTS/                     # Sprint execution
│   ├── CLAUDE.md                   # Sprint guide
│   └── S01_M01_Sprint_Name/        # Sprint folders
│       ├── S01_M01_sprint_meta.md  # Sprint metadata
│       └── TASK_01_task_name.md    # Task files
├── 04_GENERAL_TASKS/               # Non-sprint tasks
│   └── CLAUDE.md                   # Task guide
├── 05_ARCHITECTURAL_DECISIONS/     # ADR documentation
│   └── ADR_001_decision.md         # Decision records
├── 10_STATE_OF_PROJECT/            # Project snapshots
│   └── YYYY-MM-DD_HH-MM_snapshot/  # State snapshots
├── 98_PROMPTS/                     # Useful prompts
│   └── useful-prompts.md
└── 99_TEMPLATES/                   # Document templates
    ├── project_manifest_template.md
    ├── milestone_meta_template.md
    ├── sprint_meta_template.md
    ├── task_template.md
    └── adr_template.md
```

## Naming Conventions

### Files
- **Project Manifest**: `00_PROJECT_MANIFEST.md` (exact name required)
- **Milestone Meta**: `M##_milestone_meta.md`
- **Sprint Meta**: `S##_M##_sprint_meta.md`
- **Task Files**: `TASK_##_task_name.md`
- **ADR Files**: `ADR_###_decision_name.md`

### Folders
- **Milestones**: `M##_Milestone_Name/`
- **Sprints**: `S##_M##_Sprint_Name/`
- **State Snapshots**: `YYYY-MM-DD_HH-MM_snapshot/`

## Key Files

### 00_PROJECT_MANIFEST.md
The central reference file tracking:
- Project name and status
- Current milestone and sprint
- Project metadata
- Last updated timestamp

**IMPORTANT**: Always use exact filename `00_PROJECT_MANIFEST.md`

### Milestone Meta
Tracks milestone progress:
- Requirements list
- Sprint references
- Completion status
- Timeline

### Sprint Meta
Tracks sprint execution:
- Task list
- Velocity metrics
- Blockers
- Review notes

## Workflow

1. **Initialize**: Run `/aiwf:initialize` to set up structure
2. **Create Milestone**: Define project phase with `/aiwf:create-milestone`
3. **Plan Sprints**: Break down with `/aiwf:create-sprint`
4. **Execute Tasks**: Work on tasks with `/aiwf:do-task`
5. **Track Progress**: Update manifest and sprint meta
6. **Review**: Create state snapshots for retrospectives

## Integration

AIWF integrates with:
- Git workflow (commits linked to tasks)
- Claude Code commands
- MCP servers for enhanced capabilities
- TDD and development workflows
