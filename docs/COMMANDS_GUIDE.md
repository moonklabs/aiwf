# AIWF (AI Workflow Framework) Commands Guide

This guide explains the available AIWF commands and how to use them effectively in your projects.

> **Multi-language Support**: AIWF supports both Korean and English. Commands and documentation are provided in the language selected during installation.

## Command Overview

AIWF commands follow the format `/aiwf_<command_name> [arguments]`.

> **Note**:
> - The `/aiwf_<command_name>` format is still supported for backward compatibility.
> - Korean commands may have a `_kr` suffix (e.g., `/aiwf_initialize_kr`)

## Language Management System

### Language Support Features

AIWF includes a comprehensive language management system with:

- **Intelligent Language Detection**: Automatically detects system language preferences
- **Persistent Language Storage**: Saves your language preference for future installations
- **Interactive Language Switching**: Switch between languages with simple commands
- **Command-Line Language Tools**: Dedicated CLI tools for language management

### Language Commands

#### 🌐 `/aiwf_language_manager`

**Purpose**: Comprehensive language management interface

**Usage**:
```
/aiwf_language_manager
```

**Behavior**:
- Shows current language settings and preferences
- Provides options to change language interactively
- Manages language detection and storage
- Validates language settings across the system

#### 🔍 `/aiwf_language_status`

**Purpose**: Check current language configuration and status

**Usage**:
```
/aiwf_language_status
```

**Behavior**:
- Displays current active language
- Shows detected system language preferences
- Reports language file availability and consistency
- Provides language-specific installation status

#### 🔄 `/aiwf_switch_language`

**Purpose**: Switch between supported languages

**Usage**:
```
/aiwf_switch_language
# Interactive language selection

/aiwf_switch_language ko
# Switch to Korean

/aiwf_switch_language en
# Switch to English
```

**Behavior**:
- Updates language preferences
- Reinstalls commands in selected language
- Maintains project settings and data
- Provides confirmation of successful language switch

### Command Versions

- **Default Commands**: English or standardized multilingual
- **Korean Commands**: Complete Korean versions with full feature parity
- **Language Management**: Available in both languages with identical functionality

## Setup & Context Commands

### 🚀 `/aiwf_initialize`

**Purpose**: Initialize AIWF in a new or existing project

**Usage**:

```
/aiwf_initialize
```

**Behavior**:

1. Scans and analyzes the project
2. Requests project type confirmation
3. Checks for existing AIWF documents
4. Guides document creation (import existing or create new)
5. Creates first milestone
6. Generates project manifest

**When to Use**: When first setting up AIWF in a project

---

### 🧠 `/aiwf_prime`

**Purpose**: Load project context at the start of a coding session

**Usage**:

```
/aiwf_prime
```

**Behavior**:

- Reads project manifest
- Loads current milestone and sprint information
- Identifies active tasks
- Provides quick status overview

**When to Use**: At the start of a coding session to quickly understand the overall situation

## Planning Commands

### 📅 `/aiwf_create_sprints_from_milestone`

**Purpose**: Break down milestones into manageable sprints

**Usage**:

```
/aiwf_create_sprints_from_milestone 001_MVP_FOUNDATION
```

**Behavior**:

1. Analyzes milestone requirements
2. Groups related requirements into ~1 week sprints
3. Creates sprint folders and META files
4. Updates sprint information in manifest

**When to Use**: After creating a new milestone

---

### 📋 `/aiwf_create_sprint_tasks`

**Purpose**: Create detailed task breakdown for a sprint

**Usage**:

```
/aiwf_create_sprint_tasks S01
# or for specific sprint:
/aiwf_create_sprint_tasks S02_001_MVP_FOUNDATION
```

**Behavior**:

1. Analyzes sprint requirements
2. Breaks them into concrete, actionable tasks
3. Creates task files with clear goals
4. Handles inter-task dependencies

**When to Use**: At the start of each sprint

---

### ✏️ `/aiwf_create_general_task`

**Purpose**: Create standalone tasks not tied to sprints

**Usage**:

```
/aiwf_create_general_task
# Then describe your task when prompted
```

**Example Tasks**:

- "Fix memory leak in physics engine"
- "Update documentation for API changes"
- "Refactor database connection pooling"

**When to Use**: For maintenance, bug fixes, or work outside sprint scope

## Development Commands

### 💻 `/aiwf_do_task`

**Purpose**: Execute a specific task

**Usage**:

```
/aiwf_do_task
# Lists available tasks and prompts for selection

# Or specify task directly:
/aiwf_do_task T001_S01_setup_tauri
```

**Behavior**:

1. Read task requirements
2. Implement solution
3. Run tests if applicable
4. Update task status
5. Create necessary files/changes

**When to Use**: When ready to work on a specific task

---

### 📝 `/aiwf_commit`

**Purpose**: Create well-structured git commits and link with GitHub issues

**Usage**:

```
/aiwf_commit
# Reviews changes and creates commit

# Or for specific task:
/aiwf_commit T001_S01_setup_tauri

# With review:
/aiwf_commit --review
```

**Behavior**:

1. Analyze changes
2. Group related changes
3. Generate meaningful commit messages
4. Link commits to tasks/requirements
5. Integrate with GitHub issues (fixes #123, relates to #456)
6. Optionally run code review first

**When to Use**: When you want to save completed work

---

### 🧪 `/aiwf_test`

**Purpose**: Run tests and fix common issues

**Usage**:

```
/aiwf_test
# Run all tests

/aiwf_test unit
# Run specific test suite
```

**Behavior**:

1. Identify test commands from package.json
2. Run appropriate tests
3. Fix common issues (missing dependencies, config)
4. Report results clearly

**When to Use**: Before committing or when tests fail

## Code Review Commands

### 🔍 `/aiwf_code_review`

**Purpose**: Review code against specifications

**Usage**:

```
/aiwf_code_review
# Review uncommitted changes

/aiwf_code_review src/app/components/GameCanvas.tsx
# Review specific file
```

**Behavior**:

1. Check code against requirements
2. Verify patterns and conventions
3. Identify bugs and issues
4. Suggest improvements
5. Ensure spec compliance

**When to Use**: Before committing significant changes

---

### 📊 `/aiwf_project_review`

**Purpose**: Overall project health check

**Usage**:

```
/aiwf_project_review
```

**Behavior**:

1. Review overall architecture
2. Identify technical debt
3. Analyze progress vs schedule
4. Identify risks and blockers
5. Suggest improvements

**When to Use**: Weekly or at sprint boundaries

---

### 🧪 `/aiwf_testing_review`

**Purpose**: Analyze test coverage and quality

**Usage**:

```
/aiwf_testing_review
```

**Behavior**:

1. Review test coverage
2. Identify missing test cases
3. Check test quality
4. Suggest improvements

**When to Use**: After implementing features

---

### 💬 `/aiwf_discuss_review`

**Purpose**: Technical discussion about review findings

**Usage**:

```
/aiwf_discuss_review
# After running other review commands
```

**Behavior**:

- Provide detailed explanations
- Discuss pros and cons
- Suggest solutions
- Answer questions

**When to Use**: To better understand review feedback

## Automation Commands

### 🚀 `/aiwf_yolo`

**Purpose**: Autonomous task execution

**Usage**:

```
/aiwf_yolo
# Execute all open tasks sequentially

/aiwf_yolo S02
# Execute specific sprint sequentially

/aiwf_yolo sprint-all
# Execute all sprints sequentially

/aiwf_yolo milestone-all
# Execute all milestones sequentially

/aiwf_yolo S02 worktree
# Execute in Git worktree mode
```

**Behavior**:

1. Identify open tasks
2. Execute in order
3. Handle dependencies
4. Commit completed tasks
5. Update progress
6. Update GitHub issue status

**Safety Features**:

- Won't modify schema without confirmation
- Skips dangerous operations
- Maintains code quality
- Creates logical commits
- Stops on test failures

**When to Use**: When you want autonomous progress

## Additional/Advanced Commands

### 📌 `/aiwf_pr_create`

**Purpose**: Create Pull Request with templates to organize changes

**Usage**:

```
/aiwf_pr_create
# Create PR interactively

/aiwf_pr_create "Add authentication to API"
# Create PR with title
```

**Behavior**:

1. Analyze current branch changes
2. Identify related issues and tasks
3. Generate PR title and description
4. Include test checklist
5. Create PR on GitHub

---

### 🗂️ `/aiwf_issue_create`

**Purpose**: Create GitHub Issue for bug reports and feature requests

**Usage**:

```
/aiwf_issue_create
# Create issue interactively

/aiwf_issue_create "Bug: login fails on Safari"
# Create issue with title
```

**Behavior**:

1. Get issue title and description
2. Auto-assign appropriate labels and milestones
3. Apply bug/feature request templates
4. Create issue on GitHub
5. Convert to task if needed

---

### 🛠️ `/aiwf_create_milestone_plan`

**Purpose**: Plan new milestone through interactive process and auto-generate `.aiwf/02_REQUIREMENTS/` structure

**Usage**:

```
/aiwf_create_milestone_plan
```

**Behavior**:

1. Define milestone goals and scope
2. Create requirements document structure
3. Generate PRD and technical spec templates
4. Set up milestone directory structure
5. Update project manifest

---

### 📝 `/aiwf_create_prd`

**Purpose**: Create Product Requirements Document (PRD) with detailed feature specifications

**Usage**:

```
/aiwf_create_prd
# Create PRD interactively

/aiwf_create_prd "User Authentication System"
# Create PRD for specific feature
```

**Behavior**:

1. Define feature purpose and scope
2. Write user stories and scenarios
3. Specify technical requirements
4. Identify constraints and dependencies
5. Create PRD document structure

**When to Use**: When detailed specifications are needed before implementing new features

---

### 📈 `/aiwf_mermaid`

**Purpose**: Generate Mermaid diagrams by analyzing codebase

**Usage**:

```
/aiwf_mermaid
# Generate overall architecture diagram

/aiwf_mermaid flowchart
# Generate flowchart

/aiwf_mermaid sequence
# Generate sequence diagram
```

**Behavior**:

1. Analyze codebase structure
2. Identify component and module relationships
3. Select appropriate diagram type
4. Generate diagram in Mermaid syntax
5. Output in document-ready format

---

### ♾️ `/aiwf_infinite`

**Purpose**: Run advanced iteration loop to generate outputs repeatedly according to specifications

**Usage**:

```
/aiwf_infinite
# Infinite iteration mode

/aiwf_infinite 5
# 5 iteration mode
```

**Behavior**:

1. Define iteration generation rules
2. Set initial conditions
3. Execute specified number of iterations
4. Validate results each iteration
5. Integrate final outputs

---

### 🤖 `/aiwf_tm-run-all-subtask`

**Purpose**: Execute all Task Master subtasks at once to automate progress

**Usage**:

```
/aiwf_tm-run-all-subtask
```

**Behavior**:

1. Identify active subtasks
2. Determine dependency order
3. Judge parallel execution feasibility
4. Execute subtasks sequentially
5. Update overall progress

---

### 🧠 `/aiwf_ultrathink_general`

**Purpose**: Ultra thinking session for deep analysis of broad problems

**Usage**:

```
/aiwf_ultrathink_general "Complex business logic design"
```

---

### 🧠 `/aiwf_ultrathink_code_basic`

**Purpose**: Ultra thinking session for deep analysis of code-based problems at basic level

**Usage**:

```
/aiwf_ultrathink_code_basic "Performance optimization approaches"
```

---

### 🧠 `/aiwf_ultrathink_code_advanced`

**Purpose**: Ultra thinking session for deep analysis of complex code and architecture problems at advanced level

**Usage**:

```
/aiwf_ultrathink_code_advanced "Microservices architecture design"
```

---

### ⚙️ `/aiwf_update_docs`

**Purpose**: Update and synchronize project documentation

**Usage**:

```
/aiwf_update_docs
```

**Behavior**:

1. Scan project documentation structure
2. Identify outdated or missing documentation
3. Update documentation to reflect current project state
4. Synchronize documentation across different formats
5. Validate documentation consistency and completeness

### ⚙️ `/aiwf_prime_context`

**Purpose**: Quickly load and prime project context

**Usage**:

```
/aiwf_prime_context
```

**Behavior**:

1. Scan project file list
2. Identify key documents
3. Summarize current state
4. Load context information
5. Set task-ready state

## Best Practices

### Daily Workflow

```bash
# Start of day
/aiwf_prime

# Work on tasks
/aiwf_do_task
/aiwf_test
/aiwf_commit

# End of day
/aiwf_project_review
```

### Sprint Workflow

```bash
# Sprint planning
/aiwf_create_sprint_tasks S02

# Sprint execution
/aiwf_do_task T001_S02_first_task
/aiwf_do_task T002_S02_second_task
/aiwf_commit --review

# Sprint review
/aiwf_project_review
```

### Quick Fixes

```bash
# Bug fix workflow
/aiwf_create_general_task
# Description: "Fix memory leak in /src/foo.bar"
/aiwf_do_task T003
/aiwf_test
/aiwf_commit T003
```

## Tips & Tricks

1. **Use YOLO for routine work**: Useful for simple feature implementation
2. **Always run prime first**: Ensures commands have proper context
3. **Review before major commits**: Catch issues early
4. **Create bugs as general tasks**: Keep them trackable
5. **Use task-specific commits**: Better traceability

## Command Safety Features

AIWF commands include the following safety features:

- Won't delete important files
- Requests confirmation before schema changes
- Validates changes against specifications
- Maintains code quality standards
- Creates incremental commits

## Getting Help

If you need help with commands:

1. Run commands without arguments to see usage info
2. Check this guide
3. Look at task examples in `.aiwf/`
4. Review command sources in `.claude/commands/`

## Document Updates

**📝 Important**: This document is automatically updated when new features are added or existing commands are modified. Always refer to the latest version for accurate command information.

**Language Versions**: Both English and Korean versions of this guide are maintained and updated simultaneously to ensure consistency across language installations.

**Last Updated**: 2025-07-03 - Language Management System and Korean Commands Standardization