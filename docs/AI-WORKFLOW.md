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

**Multi-language Support**: During installation, you can choose between English and Korean. The selected language determines which commands and documentation are installed.

This sets up the folder structure and installs/updates command files in your project. You can also use it to update existing installations - command files are automatically backed up.

**Installation Options**:

- Interactive installation: Select language then install
- Force installation: `npx aiwf --force` (defaults to English)

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

### 7. YOLO Mode - Autonomous Execution

YOLO mode is a powerful feature that executes tasks continuously without user intervention:

**Basic YOLO mode:**

```
/project:aiwf:yolo
```

Processes general tasks first, then executes active sprint tasks.

**Sprint-specific execution:**

```
/project:aiwf:yolo S03
```

Runs until all tasks in the specified sprint (S03) are complete.

**🚀 NEW: Full Sprint Execution:**

```
/project:aiwf:yolo sprint-all
```

Runs continuously without stopping until all sprints are completed sequentially.

**🚀 NEW: Full Milestone Execution:**

```
/project:aiwf:yolo milestone-all
```

Runs until all milestones and their associated sprints and tasks are complete.

**🔧 Worktree Mode:**

```
/project:aiwf:yolo S03 worktree
/project:aiwf:yolo sprint-all worktree
```

When running in a Git worktree environment, pushes directly without creating branches.

**YOLO Mode Features:**

- ⚡ Continuous execution: Moves to next task immediately after each completion
- 🎯 Fully autonomous: Proceeds without user input or confirmation
- 📊 Progress tracking: Reports current progress in real-time
- 🛡️ Safety guards: Stops on test failures or critical errors
- 📈 Detailed reports: Provides comprehensive project status report on completion

**⚠️ Cautions:**

- Stops when modifying critical files (.env, migrations)
- Evaluates whether to continue if tests fail by more than 10%
- Stops if database schema changes are required

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
- Many more commands for testing, review, and project management

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