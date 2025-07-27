# AIWF (AI Workflow Framework)

[Read in Korean (한국어로 보기)](README.ko.md)

[![NPM Version](https://img.shields.io/npm/v/aiwf.svg)](https://www.npmjs.com/package/aiwf)
[![License](https://img.shields.io/npm/l/aiwf.svg)](https://github.com/moonklabs/aiwf/blob/main/LICENSE)
[![Downloads](https://img.shields.io/npm/dm/aiwf.svg)](https://www.npmjs.com/package/aiwf)

## What is AIWF?

AIWF is a markdown-based project management framework designed specifically for AI-assisted development with Claude Code. It helps break down software projects into manageable units that AI can effectively handle, maximizing productivity.

This project is an updated version of [Simone](https://github.com/Helmi/claude-simone).

## 📦 Installation

### Global Installation (Recommended)

```bash
npm install -g aiwf
```

### First Time Setup

After global installation, navigate to your project directory and run:

```bash
aiwf install
```

The installer will guide you through:

1. **Language Selection**: Choose between English and Korean
2. **Project Setup**: Initialize AIWF in your current directory
3. **Claude Commands**: Install language-specific commands
4. **Documentation**: Download guides and templates

## 🚀 Usage

### Basic Commands

```bash
# Install AIWF in current project
aiwf install

# Force complete reinstall (skip prompts, overwrite everything)
aiwf install --force

# Show help
aiwf --help

# Check version
aiwf --version
```

### Language Management

```bash
# Check current language
aiwf-lang status

# Change language
aiwf-lang set en    # English
aiwf-lang set ko    # Korean

# Reset to auto-detection
aiwf-lang reset
```

### Update Existing Installation

When running `aiwf install` in a project with existing AIWF, you'll get these options:

#### Interactive Mode
1. **Update**: Updates commands and docs only, preserves work content
2. **Complete Reinstall**: Fresh installation, overwrites existing project
3. **Skip**: Cancel installation

#### Command Line Options
- `--force`: Skip all prompts and perform complete reinstall

#### What Gets Preserved/Updated
- **Always Preserved**: Your work files, sprints, tasks, and project content
- **Always Updated**: Claude commands, documentation, templates, and rules
- **Backup Created**: Automatic backup of updated files (*.bak)

## 📁 What Gets Installed

### Directory Structure

```text
your_project/
├── .aiwf/                        # Project management root
│   ├── 00_PROJECT_MANIFEST.md    # Central tracking document
│   ├── 01_PROJECT_DOCS/          # Project documentation
│   ├── 02_REQUIREMENTS/          # Milestone requirements
│   ├── 03_SPRINTS/              # Sprint execution tracking
│   ├── 04_GENERAL_TASKS/        # Standalone tasks
│   ├── 05_ARCHITECTURAL_DECISIONS/ # ADR documents
│   ├── 10_STATE_OF_PROJECT/     # Project state snapshots
│   ├── 98_PROMPTS/              # Useful AI prompts
│   └── 99_TEMPLATES/            # Document templates
├── .claude/commands/aiwf/       # Language-specific Claude commands
├── .cursor/rules/               # Cursor IDE development rules
└── .windsurf/rules/             # Windsurf IDE development rules
```

### Language-Specific Content

Based on your language selection, you'll get:

**English Version (`en/`)** (Default):

- English Claude commands
- English documentation and templates
- Standard project management content

**Korean Version (`ko/`)**:

- Korean Claude commands (with `_kr` suffix available)
- Korean documentation and templates
- Localized project management content

## 🎯 Getting Started

After installation:

1. Open your project in Claude Code
2. Use `/project:aiwf` commands to manage your project
3. Start with `/project:aiwf:initialize` to set up your project

### Key Commands

- **Initialize**: `/project:aiwf:initialize` - Initial project setup
- **Plan**: `/project:aiwf:plan_milestone` - Create milestone plans
- **Sprint**: `/project:aiwf:create_sprints_from_milestone` - Generate sprints
- **Task**: `/project:aiwf:do_task` - Execute tasks
- **Review**: `/project:aiwf:code_review` - Code review
- **GitHub Integration**: `/project:aiwf:issue_create`, `/project:aiwf:pr_create`
- **AI Personas**: `/project:aiwf:ai_persona:architect`, `/project:aiwf:ai_persona:debugger`, etc.

### 🚀 YOLO Mode - The Core Feature

YOLO mode is the heart of AIWF, enabling autonomous task execution:

```bash
# Basic YOLO - processes general tasks then sprint tasks
/project:aiwf:yolo

# Sprint-specific execution
/project:aiwf:yolo S03

# Execute all sprints continuously
/project:aiwf:yolo sprint-all

# Execute all milestones
/project:aiwf:yolo milestone-all

# Independent sprint creation (no milestone required)
aiwf sprint-independent --from-readme
aiwf sprint-independent --from-issue 123
aiwf sprint-independent "Quick Feature" --minimal
```

## 📚 Documentation

### Core Documentation
- [Commands Guide](docs/COMMANDS_GUIDE.md) - Complete list of AIWF commands
- [CLI Usage Guide](docs/CLI_USAGE_GUIDE.md) - Detailed CLI tool documentation
- [Getting Started](docs/GETTING_STARTED.md) - Quick start guide for new users
- [Development Guide](docs/DEVELOPMENT_GUIDE.md) - Contributing to AIWF

### Feature Guides
- [Independent Sprint Guide](docs/guides/independent-sprint-guide.md) - YOLO-focused sprint creation
- [Checkpoint System Guide](docs/guides/checkpoint-system-guide.md) - Recovery and progress tracking
- [AI Personas Guide](docs/guides/ai-personas-guide.md) - Using specialized AI personas
- [Context Compression Guide](docs/guides/context-compression-guide.md) - Token optimization strategies
- [Feature Git Integration Guide](docs/guides/feature-git-integration-guide.md) - Git hooks and tracking

### Technical Documentation
- [Architecture](docs/ARCHITECTURE.md) - System architecture and design
- [State Management Guide](docs/STATE_MANAGEMENT_GUIDE.md) - Workflow-based state system
- [AI Workflow](docs/AI-WORKFLOW.md) - AI integration patterns
- [API Reference](docs/API_REFERENCE.md) - Programmatic usage
- [Complete API Reference](docs/API_REFERENCE_FULL.md) - Comprehensive API documentation
- [Troubleshooting](docs/TROUBLESHOOTING.md) - Common issues and solutions

## ✨ Features

- 🌍 **Multi-language Support** - Complete English and Korean support
- 🎨 **Beautiful CLI** - User-friendly interface with colors and progress indicators
- 🔄 **Smart Updates** - Intelligent update detection with automatic backups
- 📦 **Direct Download** - Downloads directly from official GitHub repository
- 🚀 **Easy to Use** - Works with `npx` - no global installation needed
- 💾 **Safe Backups** - Creates timestamped backups when updating
- 🎯 **Language-Specific** - Language-specific commands and documentation
- 🔧 **IDE Integration** - Cursor and Windsurf development rules support
- 🔗 **GitHub Integration** - Automated issue and PR creation
- 📊 **Project Tracking** - Systematic management of milestones, sprints, and tasks
- 🎭 **AI Personas** - 5 specialized personas (Architect, Security, Frontend, Backend, Data Analyst)
- 🧠 **Persona-Aware Compression** - Intelligent context compression optimized for active persona
- 📈 **Lightweight Evaluation** - Automatic background quality monitoring with minimal overhead
- 🔍 **AI Tool Templates** - Support for GitHub Copilot, Cursor, Windsurf, and Augment
- 🪝 **Git Hooks Integration** - Automated feature tracking with git commits
- 🤖 **Workflow-Based State Management** - Intelligent task prioritization and dependency tracking
- 🎯 **Smart Task Recommendations** - AI-powered next action suggestions based on project state
- 🔄 **Adaptive Sprint Management** - Automatic sprint generation at 80% completion
- 🔍 **Dependency Analysis** - Circular dependency detection and blocking task identification
- 🏃 **Independent Sprints** - Create and run sprints without milestone dependencies
- 🛡️ **Overengineering Prevention** - Built-in guards to maintain simplicity and focus
- 💾 **Checkpoint System** - Save and restore YOLO execution state for resilience

## 🤖 Workflow-Based State Management (NEW!)

AIWF now includes an advanced state management system that helps AI maintain project context:

### State Management Commands

```bash
# Update project state index
aiwf state update

# Show current state and recommendations
aiwf state show

# Get AI-powered next task recommendations
aiwf state next

# Validate workflow consistency
aiwf state validate

# Mark task as started
aiwf state start <task-id>

# Mark task as completed  
aiwf state complete <task-id>
```

### Key Features

- **Priority Matrix**: Tasks are scored based on urgency (40%), importance (30%), dependencies (20%), and effort (10%)
- **Dependency Tracking**: Automatically identifies blocking tasks and circular dependencies
- **80% Rule**: Recommends preparing next sprint when current sprint reaches 80% completion
- **Workflow Validation**: Ensures state consistency across milestones, sprints, and tasks
- **Smart Recommendations**: AI suggests optimal next actions based on project state

### Integration with YOLO Mode

The enhanced YOLO mode now uses workflow intelligence:

```bash
# Run YOLO with workflow-based task selection
/project:aiwf:yolo

# Sprint-specific with workflow optimization
/project:aiwf:yolo S03

# Adaptive sprint management
/project:aiwf:yolo sprint-all
```

### 🛡️ Overengineering Prevention

AIWF includes built-in guards to prevent overengineering:

- **Configurable Engineering Levels**: minimal, balanced, complete
- **Focus Rules**: requirement_first, simple_solution, no_gold_plating
- **Code Complexity Checks**: file size, function length, nesting depth limits
- **Design Pattern Limits**: prevents excessive abstraction
- **YAGNI Enforcement**: no future-proofing without current need

Configure in `.aiwf/yolo-config.yaml`:

```yaml
engineering_level: minimal
focus_rules:
  requirement_first: true
  simple_solution: true
  no_gold_plating: true
```

## 📁 Project Structure

```
aiwf/
├── ai-tools/           # AI tool-specific configurations
├── commands/           # AIWF command implementations
├── config/             # Configuration files
├── docs/               # Project documentation
├── hooks/              # Git hooks for automated workflows
├── lib/                # Core library modules
├── personas/           # AI persona definitions
├── rules/              # Development rules and guidelines
├── scripts/            # Build and utility scripts
├── templates/          # Project templates (api-server, npm-library, web-app)
├── tests/              # Test suites
└── utils/              # Utility modules
```

### Key Directories

- **hooks/**: Contains git hooks (post-commit) for automatic feature tracking

## 🔧 Requirements

- Node.js 14.0.0 or higher
- Internet connection to download from GitHub

## 📖 Source

This installer fetches the AIWF framework from:
<https://github.com/moonklabs/aiwf>

## 📝 License

MIT
