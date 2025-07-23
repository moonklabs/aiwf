# AIWF for Claude Code

## What is this?

AIWF is a directory-based project management system I created to work more effectively with Claude Code and Gemini-CLI. It's essentially a collection of folders, markdown files, and custom commands that help break down software projects into manageable units that AI can effectively process.

**🚀 NEW**: Enhanced YOLO mode can now automatically complete entire sprints or milestones at once!

**⚠️ Complexity Warning**: AIWF is a sophisticated system that takes time to understand properly. It's not a simple plug-and-play solution, but a framework that works best when you invest time to learn how it works and adapt it to your workflow.

**📋 Latest Updates**: See [CHANGELOG.md](CHANGELOG.md) for recent changes and improvements.

## Getting Started

### 1. Install AIWF

```bash
npx aiwf
```

**Multi-language Support**: AIWF features a comprehensive language management system with intelligent detection and preference storage. During installation, you can choose between English and Korean, and later switch languages using the built-in language management commands.

This sets up the folder structure and installs/updates command files in your project. You can also use it to update existing installations - command files are automatically backed up.

**Installation Options**:

- Interactive installation: Select language then install
- Force installation: `npx aiwf --force` (uses auto-detected language)
- Language management: Use `aiwf-lang` commands for post-installation language switching

### 2. Initialize Your Project

Open your project in Claude Code and run:

```
/project:aiwf:initialize
```

This guides you through the basic setup process. It works with both new and existing codebases, helping you create project documentation (PRD, architecture docs) or work with documents you already have.

### 3. Set Up Your First Milestone

Create a milestone folder in `.aiwf/02_REQUIREMENTS/` named `M01_Your_Milestone_Name` (e.g., `M01_Basic_Application`). Include at minimum:

- `M01_PRD.md` - Product Requirements Document
- Other specifications as needed: `M01_Database_Schema.md`, `M01_API_Specs.md`, etc.

_Note: There's no command for this yet. Use the existing chat from step 2 to guide Claude in creating the milestone, ensuring proper naming with the `M##_` prefix and underscores._

### 4. Break Down Into Sprints

```
/project:aiwf:create_sprints_from_milestone
```

This analyzes your milestone and breaks it down into logical sprints. It looks at the entire scope and creates meaningful sprint boundaries without detailed tasks yet.

### 5. Create Your First Tasks

```
/project:aiwf:create_sprint_tasks
```

This analyzes the sprint, reviews documentation, researches necessary information, and identifies knowledge gaps to gain comprehensive understanding of the project. It creates detailed, actionable tasks for the current sprint.

_Important: Don't pre-create tasks for all sprints, only create tasks for the next sprint. After completing Sprint 1, create tasks for Sprint 2. This allows the system to reference the existing codebase and incorporate completed work into future task creation._

### 6. Start Working on Tasks

```
/project:aiwf:do_task
```

This automatically selects a task from general tasks or sprints. For faster execution, specify the task ID:

```
/project:aiwf:do_task T01_S01
```

Claude will then perform the specified task with full project context.

That's the basic workflow to get started! You can also:

- Create general tasks with `/project:aiwf:create_general_task`
- Use YOLO mode to autonomously execute entire sprints or milestones
- Explore other commands in `.claude/commands/aiwf/`

### 7. YOLO Mode - The Core of AIWF

YOLO mode is the heart of AIWF, enabling autonomous task execution. It's not just a feature - it's the reason AIWF exists.

#### Independent Sprint Creation (NEW!)

Create sprints without needing milestones:

```bash
# Create sprint from README TODOs
aiwf sprint-independent --from-readme

# Create sprint from GitHub issue
aiwf sprint-independent --from-issue 123

# Create minimal sprint with custom name
aiwf sprint-independent "Quick Feature" --minimal

# Different engineering levels
aiwf sprint-independent "API Feature" --balanced
aiwf sprint-independent "Complex System" --complete
```

#### YOLO Execution Modes

**Basic YOLO mode:**

```
/project:aiwf:yolo
```

Processes general tasks first, then sprint tasks.

**Sprint-specific execution:**

```
/project:aiwf:yolo S03
```

Runs all tasks for the specified sprint (S03) until complete.

**Full Sprint Execution:**

```
/project:aiwf:yolo sprint-all
```

Runs all sprints sequentially without stopping until all are complete.

**Full Milestone Execution:**

```
/project:aiwf:yolo milestone-all
```

Runs all milestones and their related sprints and tasks until complete.

**Worktree Mode:**

```
/project:aiwf:yolo S03 worktree
/project:aiwf:yolo sprint-all worktree
```

When running in a Git worktree environment, pushes directly without creating branches.

#### YOLO Configuration

Create `.aiwf/yolo-config.yaml` to control YOLO behavior:

```yaml
engineering_level: minimal  # minimal, balanced, complete

focus_rules:
  requirement_first: true   # Only implement what's required
  simple_solution: true     # Prefer simple over complex
  no_gold_plating: true    # No unnecessary features
  stay_on_track: true      # Don't deviate from goals

execution:
  smart_mode: false        # Context-based decisions
  fast_mode: true          # Minimal validation
  run_tests: true          # Test after each task
  auto_commit: false       # Auto-commit on completion

breakpoints:
  critical_files:
    - .env
    - database/migrations/*
  test_failure_threshold: 10
  schema_changes: true
  security_changes: true

overengineering_prevention:
  max_file_lines: 300
  max_function_lines: 50
  max_nesting_depth: 4
  no_future_proofing: true
```

#### YOLO Mode Features

- ⚡ **Continuous execution**: Immediately moves to next task after completion
- 🎯 **Fully autonomous**: Proceeds without user input or confirmation
- 📊 **Progress tracking**: Real-time progress reporting with checkpoints
- 🛡️ **Overengineering prevention**: Built-in guards against complexity
- 💾 **Checkpoint/Recovery**: Resume from last checkpoint if interrupted
- 🔍 **Smart task selection**: Workflow-based prioritization
- 📈 **Detailed reports**: Full project status report on completion

#### Overengineering Prevention

YOLO mode actively prevents overengineering through:

1. **Code Complexity Checks**
   - File size limits (300 lines default)
   - Function size limits (50 lines default)
   - Nesting depth limits (4 levels default)

2. **Design Pattern Restrictions**
   - Limits excessive abstraction
   - Prevents unnecessary patterns
   - Enforces YAGNI principle

3. **Focus Rules**
   - Requirement-first approach
   - Simple solutions preferred
   - No gold plating allowed
   - Stay on track enforcement

4. **Real-time Feedback**
   - Warnings when approaching limits
   - Suggestions for simplification
   - Automatic complexity reports

#### Checkpoint System

YOLO mode includes automatic checkpointing:

```bash
# List available checkpoints
aiwf checkpoint list

# Restore from checkpoint
aiwf checkpoint restore cp_1234567890

# Manual checkpoint creation
aiwf checkpoint create "Before major refactor"

# Clean old checkpoints
aiwf checkpoint clean --keep-last 10
```

#### Safety Features

- **Critical File Protection**: Stops when modifying .env, migrations, etc.
- **Test Failure Handling**: Evaluates continuation when tests fail >10%
- **Schema Change Detection**: Pauses for database changes
- **Security Alerts**: Stops for security-related modifications
- **Backup Creation**: Automatic backups before major changes

**Important**: AIWF is a complex system, not a simple set-and-forget tool. It works most effectively when you understand how it operates. Take time to read through the commands and adjust them to your workflow.

## How It Works

AIWF organizes projects into:

- **Milestones**: Major features or project phases
- **Sprints**: Groups of related tasks within milestones
- **Tasks**: Individual work items scoped to fit in a single Claude session

Each task pulls in full project context so Claude knows exactly what to build and how it fits into the architecture.

## Why I Made This

AI coding tools have become incredibly powerful, but they all face the same fundamental challenge: context management. Context windows are limited in size, and we have little control over what stays in context and what doesn't.

The problem with long-running sessions is context decay - as you work, important project knowledge quietly falls off the end of the context window. You don't know what's been forgotten until something goes wrong.

My solution: Start fresh for each task but provide rich surrounding context. By keeping tasks focused and well-scoped, we can dedicate more of the context window to relevant project knowledge, requirements, and architectural decisions. This way:

- Each task starts with exactly the project context it needs
- Important knowledge doesn't get lost in long sessions
- Claude can work confidently with full understanding of requirements
- Surrounding context guides development beyond simple task descriptions

The result is a task-based workflow where Claude always has the right context for the job at hand.

## Key Components

### 00_PROJECT_MANIFEST.md

The core document containing your project's vision, goals, and high-level overview. Serves as Claude's starting point for understanding your project. **Important**: The manifest filename must be `00_PROJECT_MANIFEST.md`, not `MANIFEST.md`.

### 01_PROJECT_DOCS/

Contains general project documentation that Claude can reference - technical specifications, user guides, API documentation, etc.

### 02_REQUIREMENTS/

Organized by milestone, this directory holds Product Requirements Documents (PRDs) and amendments that clearly show what needs to be built. This is how Claude understands project requirements. Milestone folders should follow the format `M##_Milestone_Name/` (e.g., `M01_Backend_Setup/`).

### 03_SPRINTS/

Contains sprint plans and task definitions organized by milestone and sprint order. Each sprint folder contains individual task files with detailed information for Claude to work with.

### 04_GENERAL_TASKS/

Stores task definitions that don't belong to a specific sprint. Completed tasks use the `TX` prefix (e.g., `TX001_Completed_Task.md`)—this helps Claude easily identify completed work.

### 05_ARCHITECTURAL_DECISIONS/

Records important architectural decisions in ADR (Architecture Decision Record) format, documenting context, options considered, and rationale. This provides essential context for Claude when making technical decisions. Uses a structured ADR template for consistency.

### 10_STATE_OF_PROJECT/

Contains timestamped project review snapshots generated by the `project_review` command. This maintains a history of project state, technical decisions, and progress.

### 99_TEMPLATES/

Contains standardized templates for various document types to ensure consistency for both humans and Claude:

- Task templates with structured goals and acceptance criteria
- Sprint and milestone metadata templates
- ADR templates for documenting architectural decisions
- All templates use simplified date format (YYYY-MM-DD HH:MM)

### .claude/commands/aiwf/

Custom Claude Code commands that drive the AIWF workflow:

- `initialize` - Set up project structure and documentation
- `create_sprints_from_milestone` - Break milestones into logical sprints
- `create_sprint_tasks` - Generate detailed tasks from sprint plans
- `do_task` - Execute individual tasks with full context
- `yolo` - Powerful autonomous execution system:
  - Execute specific sprint: `yolo S03`
  - Execute all sprints: `yolo sprint-all`
  - Execute all milestones: `yolo milestone-all`
  - Worktree support: `yolo sprint-all worktree`
  - Provides continuous execution and detailed progress reports
- `language_manager` - Comprehensive language management system:
  - Check current language settings and status
  - Switch between languages interactively
  - Auto-detect system language preferences
- Many more commands for testing, review, and project management

**Language Support**: All commands are available in both English and Korean versions with complete functional equivalence and standardized quality.

## Directory Structure

```plaintext
.aiwf/
├── 00_PROJECT_MANIFEST.md
├── 01_PROJECT_DOCS/
├── 02_REQUIREMENTS/
│   ├── M01_Backend_Setup/
│   ├── M02_Frontend_Setup/
│   └── ...
├── 03_SPRINTS/
│   ├── S01_M01_Initial_API/
│   ├── S02_M01_Database_Schema/
│   └── ...
├── 04_GENERAL_TASKS/
│   ├── TX001_Refactor_Logging_Module.md  # Completed task
│   ├── T002_API_Rate_Limiting.md          # Open task
│   └── ...
├── 05_ARCHITECTURE_DECISIONS/
│   ├── ADR001_Database_Selection.md
│   └── ...
├── 10_STATE_OF_PROJECT/         # Project review snapshots
└── 99_TEMPLATES/
    ├── task_template.md
    ├── sprint_meta_template.md
    └── milestone_meta_template.md
```

## Configuration Tips

### Enable Parallel Task Execution

AIWF commands like `create_sprint_tasks` support the `useParallelSubagents` directive, but to actually execute tasks in parallel requires Claude Code configuration. By default, only one task runs at a time.

To enable parallel execution:

```bash
# Set the number of parallel tasks (example: 3)
claude config set --global "parallelTasksCount" 3

# Check your current configuration
claude config list -g
```

**Important Considerations:**

- Choose a number based on your system performance and rate limits
- Parallel execution significantly increases API usage
- Some tasks may conflict when run in parallel
- Start with a small number (2-3) and adjust based on experience

## Contributing and Feedback

I'd love to hear from you! This is tailored to my workflow, so there's plenty of room for improvement.

- **GitHub Issues**: Best place for bugs and feature requests
- **Anthropic Discord**: Find me at @helmi if you want to chat
- **Pull Requests**: Always welcome! Let's make this better together

I'm particularly interested in:

- How you're using it differently
- What's missing from your workflow
- Ideas for better Claude Code integration
- Different ways to organize things