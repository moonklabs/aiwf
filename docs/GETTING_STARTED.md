# Getting Started with AIWF

Welcome to AIWF (AI Workflow Framework)! This guide will help you get up and running quickly with AIWF and Claude Code.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Your First Project](#your-first-project)
4. [Understanding the Structure](#understanding-the-structure)
5. [Essential Commands](#essential-commands)
6. [Working with Claude Code](#working-with-claude-code)
7. [Best Practices](#best-practices)
8. [Next Steps](#next-steps)

---

## Prerequisites

Before you begin, ensure you have:

- **Node.js** version 14.0.0 or higher
  ```bash
  node --version  # Should output v14.0.0 or higher
  ```

- **npm** (comes with Node.js)
  ```bash
  npm --version
  ```

- **Git** for version control
  ```bash
  git --version
  ```

- **Claude Code** access ([claude.ai/code](https://claude.ai/code))

## Quick Start

### 1. Install AIWF

```bash
# Navigate to your project directory
cd my-project

# Install AIWF
npx aiwf
```

### 2. Choose Your Language

During installation, you'll be prompted to select a language:

```
? Select your preferred language:
❯ English
  한국어 (Korean)
```

### 3. Verify Installation

```bash
# Check that AIWF directories were created
ls -la .aiwf/
ls -la .claude/commands/aiwf/
```

You should see:
- `.aiwf/` - Project management directory
- `.claude/commands/aiwf/` - Claude Code commands
- `.cursor/rules/` - Cursor IDE rules (if using Cursor)
- `.windsurf/rules/` - Windsurf IDE rules (if using Windsurf)

## Your First Project

Let's create a simple task management application to demonstrate AIWF workflow.

### Step 1: Initialize the Project

Open your project in Claude Code and run:

```bash
/project:aiwf:initialize
```

Claude will help you set up the project structure and create initial documentation.

### Step 2: Define Your Project Vision

```bash
/project:aiwf:create_project_doc "Task Manager" "A simple task management app with CRUD operations"
```

This creates:
- Project manifest in `.aiwf/00_PROJECT_MANIFEST.md`
- Project documentation in `.aiwf/01_PROJECT_DOCS/`

### Step 3: Plan Your First Milestone

```bash
/project:aiwf:plan_milestone "Basic Task Management"
```

Claude will guide you through:
1. Defining milestone objectives
2. Breaking down into features
3. Setting acceptance criteria
4. Estimating timeline

Example milestone structure:
```markdown
## M01: Basic Task Management

### Objectives
- Create, read, update, delete tasks
- Mark tasks as complete
- Filter tasks by status
- Basic UI for task management

### Timeline: 2 weeks
```

### Step 4: Generate Sprints

```bash
/project:aiwf:create_sprints_from_milestone M01
```

This automatically creates sprint directories:
- `S01_M01_backend_setup/` - API and database setup
- `S02_M01_frontend_development/` - UI implementation
- `S03_M01_integration_testing/` - Testing and polish

### Step 5: Start Your First Task

```bash
# List tasks in current sprint
/project:aiwf:list_tasks S01

# Start a specific task
/project:aiwf:do_task T01_S01
```

Claude will:
1. Load task requirements
2. Suggest implementation approach
3. Help you write code
4. Track progress

## Understanding the Structure

### Directory Layout

```
my-project/
├── .aiwf/                          # AIWF project management
│   ├── 00_PROJECT_MANIFEST.md      # Central tracking document
│   ├── 01_PROJECT_DOCS/            # Project documentation
│   │   └── OVERVIEW.md
│   ├── 02_REQUIREMENTS/            # Milestone definitions
│   │   └── M01_Basic_Task_Management/
│   ├── 03_SPRINTS/                 # Sprint execution
│   │   ├── S01_M01_backend_setup/
│   │   ├── S02_M01_frontend_development/
│   │   └── S03_M01_integration_testing/
│   ├── 04_GENERAL_TASKS/           # Non-sprint tasks
│   ├── 05_ARCHITECTURE_DECISIONS/  # ADRs
│   ├── 06_FEATURE_LEDGERS/         # Feature tracking
│   └── 99_TEMPLATES/               # Reusable templates
├── .claude/commands/aiwf/          # Claude commands
├── src/                            # Your source code
└── package.json                    # Node.js project file
```

### File Naming Conventions

- **Milestones**: `M01_`, `M02_`, etc.
- **Sprints**: `S01_M01_`, `S02_M01_`, etc.
- **Tasks**: `T01_S01_`, `T02_S01_`, etc.
- **Features**: `FL001`, `FL002`, etc.
- **Completed items**: Prefix with `X` (e.g., `XT01_S01_`)

## Essential Commands

### Project Management

| Command | Description |
|---------|-------------|
| `/project:aiwf:initialize` | Initialize AIWF in your project |
| `/project:aiwf:status` | View project status |
| `/project:aiwf:review` | Comprehensive project review |

### Milestone & Sprint Management

| Command | Description |
|---------|-------------|
| `/project:aiwf:plan_milestone` | Create a new milestone |
| `/project:aiwf:create_sprints_from_milestone` | Generate sprints |
| `/project:aiwf:sprint_status` | Check sprint progress |

### Task Management

| Command | Description |
|---------|-------------|
| `/project:aiwf:create_task` | Create a new task |
| `/project:aiwf:do_task` | Work on a specific task |
| `/project:aiwf:list_tasks` | List tasks in sprint |
| `/project:aiwf:complete_task` | Mark task as done |

### Feature Management

| Command | Description |
|---------|-------------|
| `/project:aiwf:create_feature_ledger` | Create feature entry |
| `/project:aiwf:update_feature_status` | Update feature status |
| `/project:aiwf:feature_changelog` | Generate feature changelog |

### AI Personas

AIWF includes an AI Persona system that optimizes Claude Code's behavior for different development tasks:

| Command | Description |
|---------|-------------|
| `/project:aiwf:ai_persona:architect` | System design mode |
| `/project:aiwf:ai_persona:debugger` | Debugging mode |
| `/project:aiwf:ai_persona:reviewer` | Code review mode |
| `/project:aiwf:ai_persona:documenter` | Documentation mode |
| `/project:aiwf:ai_persona:optimizer` | Performance optimization |
| `/project:aiwf:ai_persona:developer` | General development (default) |

#### Additional Persona Commands

| Command | Description |
|---------|-------------|
| `/project:aiwf:ai_persona:switch <name>` | Switch to specific persona |
| `/project:aiwf:ai_persona:status` | View current persona |
| `/project:aiwf:ai_persona:list` | List all available personas |
| `/project:aiwf:ai_persona:auto on/off` | Enable/disable auto-detection |
| `/project:aiwf:ai_persona:detect <task>` | Detect optimal persona for task |
| `/project:aiwf:ai_persona:report` | Generate performance report |
| `/project:aiwf:ai_persona:stats [persona]` | View persona statistics |
| `/project:aiwf:ai_persona:reset` | Reset to default persona |

See the [AI Personas Guide](guides/ai-personas-guide.md) for detailed information.

### Context Management

| Command | Description |
|---------|-------------|
| `/project:aiwf:compress_context:aggressive` | Maximum compression |
| `/project:aiwf:compress_context:balanced` | Balanced compression |
| `/project:aiwf:compress_context:conservative` | Minimal compression |

## Working with Claude Code

### 1. Effective Communication

**Be Specific:**
```bash
# Good
/project:aiwf:do_task T01_S01
"Implement the POST /api/tasks endpoint with validation"

# Less effective
"Make the API"
```

### 2. Use Personas Appropriately

AIWF's AI Persona system helps Claude Code focus on specific aspects of development:

```bash
# For design decisions
/project:aiwf:ai_persona:architect
"Design the database schema for tasks"

# For bug fixing
/project:aiwf:ai_persona:debugger
"Fix the issue where completed tasks still appear as active"

# For documentation
/project:aiwf:ai_persona:documenter
"Create API documentation for the task endpoints"

# For performance optimization
/project:aiwf:ai_persona:optimizer
"Optimize the task query performance"

# For code review
/project:aiwf:ai_persona:reviewer
"Review the authentication module for security issues"
```

**Auto-Detection Feature:**
```bash
# Enable automatic persona switching
/project:aiwf:ai_persona:auto on

# Claude will automatically switch personas based on your task
"Debug the login error"  # → Automatically switches to debugger persona
```

**Check Persona Performance:**
```bash
# View current session metrics
/project:aiwf:ai_persona:status

# Generate performance report
/project:aiwf:ai_persona:report

# Check specific persona statistics
/project:aiwf:ai_persona:stats debugger
```

### 3. Manage Context Efficiently

For large codebases:
```bash
# Start with overview
/project:aiwf:compress_context:aggressive
"Show me the overall project structure"

# Then focus on specifics
/project:aiwf:compress_context:balanced
"Now let's work on the user authentication module"
```

### 4. Track Progress

```bash
# Regular status checks
/project:aiwf:status

# Detailed sprint review
/project:aiwf:sprint_status S01

# Feature progress
/project:aiwf:feature_status FL001
```

## Best Practices

### 1. Commit Conventions

Always reference features in commits:
```bash
git commit -m "feat(FL001): add task creation endpoint"
git commit -m "fix(FL001): validate task title length"
git commit -m "docs(FL001): update API documentation"
```

### 2. Task Breakdown

Keep tasks small and focused:
- ✅ "Implement GET /api/tasks endpoint"
- ✅ "Add pagination to task list"
- ❌ "Build entire API" (too large)

### 3. Regular Reviews

```bash
# Daily
/project:aiwf:sprint_status

# Weekly
/project:aiwf:review

# Per milestone
/project:aiwf:milestone_review M01
```

### 4. Documentation

Document as you go:
```bash
# After implementing a feature
/project:aiwf:ai_persona:documenter
"Document the task API endpoints we just created"

# Update architecture decisions
/project:aiwf:create_adr "Use PostgreSQL for task storage"
```

## Next Steps

### 1. Explore Advanced Features

**Feature-Git Integration:**
```bash
# Link commits to features automatically
/project:aiwf:install_git_hooks
```

**Performance Monitoring:**
```javascript
// Use built-in performance tools
import { PerformanceBenchmark } from '@aiwf/performance';
```

**Team Collaboration:**
```bash
# Generate team reports
/project:aiwf:team_status_report

# Create shared documentation
/project:aiwf:export_project_docs
```

### 2. Learn More

- Read the [Commands Guide](COMMANDS_GUIDE.md) for all available commands
- Check out [Examples](EXAMPLES.md) for real-world scenarios
- Review [API Reference](API_REFERENCE.md) for programmatic usage
- See [Troubleshooting](TROUBLESHOOTING.md) if you encounter issues

### 3. Join the Community

- **GitHub**: [github.com/aiwf/aiwf](https://github.com/aiwf/aiwf)
- **Discord**: [discord.gg/aiwf](https://discord.gg/aiwf)
- **Discussions**: Share your experiences and learn from others

### 4. Customize for Your Workflow

Create custom templates:
```bash
# Add your own templates
cp my-template.md .aiwf/99_TEMPLATES/

# Customize personas
echo "Custom rules" > .aiwf/personas/custom.json
```

## Quick Reference Card

```bash
# Start new feature
/project:aiwf:create_feature_ledger "Feature Name"  # → FL001
git checkout -b feature/FL001-feature-name

# Work on tasks
/project:aiwf:list_tasks S01
/project:aiwf:do_task T01_S01

# Switch personas
/project:aiwf:ai_persona:architect    # Design
/project:aiwf:ai_persona:developer     # Code
/project:aiwf:ai_persona:debugger      # Debug
/project:aiwf:ai_persona:reviewer      # Review
/project:aiwf:ai_persona:documenter    # Document
/project:aiwf:ai_persona:optimizer     # Optimize

# Persona management
/project:aiwf:ai_persona:auto on      # Enable auto-detection
/project:aiwf:ai_persona:status        # Check current persona
/project:aiwf:ai_persona:report        # Performance report

# Manage context
/project:aiwf:compress_context:aggressive    # Overview
/project:aiwf:compress_context:balanced      # Normal work
/project:aiwf:compress_context:conservative  # Detailed work

# Track progress
/project:aiwf:status                   # Overall
/project:aiwf:sprint_status S01        # Sprint
/project:aiwf:feature_status FL001     # Feature
```

---

## Congratulations! 🎉

You now have the foundation to effectively use AIWF with Claude Code. Remember:

1. **Start small** - Begin with simple tasks and gradually take on more complex features
2. **Use the right tools** - Leverage personas and compression modes appropriately
3. **Stay organized** - Follow the naming conventions and project structure
4. **Collaborate** - Share your learnings with the community

Happy coding with AIWF! 🚀