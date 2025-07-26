# AIWF Framework

AIWF is a project management system designed to work with Claude Code's strengths and limitations. It provides structure for breaking down software projects into manageable, context-aware tasks.

## Core Concept

The fundamental challenge: AI context windows are limited and we can't control what information stays or leaves during long sessions. AIWF solves this by starting fresh for each task while providing rich, relevant context.

## How AIWF Works

### 1. Requirements First

Projects begin with well-documented requirements and specifications:

**In `01_PROJECT_DOCS/`:**

- Architecture specifications (ARCHITECTURE.md is required)
- Technical design documents
- API specifications
- Database schemas
- Integration guides

**In `02_REQUIREMENTS/`:**

- Product Requirements Documents (PRDs) organized by milestone
- Feature specifications
- User stories and acceptance criteria

Both directories work together to define what gets built and how.

### 2. Structured Breakdown

Work is organized hierarchically:

- **Milestones** (M01, M02...) - Major project phases
- **Sprints** (S01, S02...) - Focused work periods within milestones
- **Tasks** (T01, T02...) - Atomic units of work

### 3. Task Execution Flow

Each task follows a strict workflow:

1. Task selected from sprint or general tasks
2. Status updated to `in_progress`
3. Work performed following acceptance criteria
4. Automatic code review against requirements
5. Task marked `done` only after review passes
6. File renamed with `TX` prefix to indicate completion

### 4. Context Management

For each task, AIWF provides:

- The specific task description and criteria
- Relevant sprint and milestone context
- Architecture and requirements documentation
- Project manifest for current state awareness

This ensures Claude has exactly what's needed without information overload.

### 5. Quality Control

Built-in review processes maintain standards:

- **Code Review**: Every task completion triggers requirement validation
- **Project Review**: Regular health checks create timestamped snapshots
- **Zero Tolerance**: Any deviation from specifications fails review

## Directory Purpose

- `00_PROJECT_MANIFEST.md` - Current project state and focus
- `01_PROJECT_DOCS/` - Technical foundation (architecture, APIs, schemas)
- `02_REQUIREMENTS/` - Business requirements organized by milestone
- `03_SPRINTS/` - Sprint organization and task definitions
- `04_GENERAL_TASKS/` - Non-sprint specific tasks
- `05_ARCHITECTURAL_DECISIONS/` - ADRs for key decisions
- `10_STATE_OF_PROJECT/` - Project review history
- `99_TEMPLATES/` - Standardized file templates

## Commands Overview

AIWF commands (`/project:AIWF:command`) automate the workflow:

- Planning: `plan_milestone`, `create_sprint`
- Execution: `create_task`, `do_task`, `code_review`
- Maintenance: `commit`, `project_review`, `discuss_review`
- Utilities: `initialize`

## Key Principles

1. **Fresh Context**: Each task starts with a clean slate
2. **Focused Scope**: Tasks are sized for single-session completion
3. **Rich Context**: Surrounding documentation guides development
4. **Strict Validation**: Requirements are enforced, not suggested
5. **Progressive Documentation**: Knowledge accumulates in structured form

The result: Claude can always work confidently with full project awareness, regardless of session history.
