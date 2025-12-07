# AIWF (AI Workflow Framework)

[Read in Korean (한국어로 보기)](README.ko.md)

[![NPM Version](https://img.shields.io/npm/v/aiwf.svg)](https://www.npmjs.com/package/aiwf)
[![License](https://img.shields.io/npm/l/aiwf.svg)](https://github.com/moonklabs/aiwf/blob/main/LICENSE)
[![Downloads](https://img.shields.io/npm/dm/aiwf.svg)](https://www.npmjs.com/package/aiwf)

## What is AIWF?

AIWF is an AI-powered workflow framework that enables autonomous software development with Claude Code. It provides intelligent command sets and workflow definitions that allow AI to manage entire project lifecycles - from planning to deployment - with minimal human intervention.

This project is an updated version of [Simone](https://github.com/Helmi/claude-simone).

## 🔌 Claude Code Plugin System

AIWF is built as a **Claude Code Plugin** following the official Anthropic plugin architecture. The framework is organized into 4 specialized plugins:

```
aiwf/
├── .claude-plugin/
│   └── marketplace.json    # Plugin registry
└── plugins/
    ├── aiwf-core/     (26 files) → Session, YOLO, Sprint/Task management
    ├── aiwf-dev/      (19 files) → TDD, DevOps automation
    ├── aiwf-experts/  (24 files) → Expert agents (architects, reviewers)
    └── aiwf-tools/    (51 files) → Development tools
```

### Plugin Overview

| Plugin | Description | Key Features |
|--------|-------------|--------------|
| **aiwf-core** | Core framework | Session management, YOLO mode, Sprint/Task execution |
| **aiwf-dev** | Development workflow | TDD (red/green/refactor), DevOps, CI/CD |
| **aiwf-experts** | Expert agents | Build fixers, architects, code reviewers |
| **aiwf-tools** | Utility tools | Refactoring, debugging, API scaffolding, docs |

## ✨ Core Features

### 🤖 **Agent-Based Autonomous Development**
Multi-agent architecture where AIWF acts as the master orchestrator managing entire development workflows, while Claude Code operates as specialized subagents handling specific tasks. YOLO mode enables completely autonomous development - AI handles planning, coding, testing, and deployment without human intervention. Built-in checkpoint system ensures resilience and recovery.

### 🧠 **Intelligent Task Management**  
Workflow-based state management with dependency tracking, priority calculation, and smart task recommendations. AI understands project context and suggests optimal next actions.

### 🎭 **Specialized AI Personas**
Five expert personas (Architect, Security, Frontend, Backend, Data Analyst) with specialized knowledge bases and context-aware compression for domain-specific optimization.

### 🧬 **Advanced Context Engineering**
Intelligent context construction and optimization that maximizes AI effectiveness while minimizing token usage. Dynamic context compression, workflow-aware prompt engineering, and automatic relevance filtering ensure AI always has the right information at the right time.

### 💡 **Smart Context Management**
Token-efficient context strategies with automatic compression, intelligent chunking, and relevance scoring. Maintains comprehensive project understanding while optimizing for AI model limits and performance.

### 🔄 **Multi-Agent Architecture** 
AIWF operates as the master orchestration agent that coordinates complex development workflows. Claude Code instances function as specialized subagents, each handling specific domains like coding, testing, or documentation. This distributed approach enables parallel processing, fault tolerance, and specialized expertise application.

### 🔗 **Seamless Integration**
Native support for Claude Code, Cursor, Windsurf, GitHub, and Git with automated hooks, issue creation, and PR management.

### ✅ **Robust Validation System**
Advanced installation validation with intelligent file checking, dependency verification, and automated troubleshooting. Enhanced validation architecture ensures reliable framework setup and operation.

## 📦 Installation

### Option 1: Claude Code Plugin (Recommended)

Install AIWF as a Claude Code plugin directly:

```bash
# From GitHub repository
claude plugin add https://github.com/moonklabs/aiwf

# Or from local path (for development)
claude plugin add /path/to/aiwf
```

After installation, verify the plugins are loaded:

```bash
claude plugin list
```

You should see 4 AIWF plugins:
- `aiwf-core` - Session, YOLO, Sprint/Task
- `aiwf-dev` - TDD, DevOps
- `aiwf-experts` - Expert agents
- `aiwf-tools` - Development tools

### Option 2: NPM Global Installation

```bash
npm install -g aiwf
```

After global installation, navigate to your project directory and run:

```bash
aiwf install
```

The installer will guide you through:

1. **Language Selection**: Choose between English and Korean
2. **Project Setup**: Initialize AIWF in your current directory
3. **Plugin Installation**: Install Claude Code plugins
4. **Documentation**: Download guides and templates
5. **Validation**: Comprehensive installation verification

## 🚀 Getting Started Guide

### Step 1: Installation
```bash
# Option A: Claude Code Plugin (Recommended)
claude plugin add https://github.com/moonklabs/aiwf

# Option B: NPM + Manual Setup
npm install -g aiwf
cd your-project
aiwf install
```

### Step 2: Project Planning Phase
Enter **Plan Mode** - describe what you want to build and your project goals. **Do not start coding yet.**
- Engage in thorough Q&A to clarify objectives
- Define project scope and requirements
- Set clear success criteria

### Step 3: Initialize Project Framework
```bash
# Create/update Claude configuration
/init

# Initialize AIWF framework (creates first milestone)
/aiwf:initialize
```

### Step 4: Create Sprint Plans
```bash
# Generate sprints from milestone (first sprint becomes active)
/aiwf:create-sprint M01

# If only one milestone exists, you can omit the milestone code
/aiwf:create-sprint
```

### Step 5: Review and Refine
Review generated plans and refine through Q&A until satisfied with the approach.

### Step 6: Generate Task Lists
```bash
# Create detailed tasks for active sprint (first task becomes active)
/aiwf:create-sprint-tasks
```

### Step 7: Execute Development
```bash
# Execute individual task
/aiwf:do-task [task-id]

# OR run autonomous development for entire sprint
/aiwf:yolo
```

**YOLO Mode** orchestrates multiple Claude Code subagents to execute all sprint tasks continuously without interruption. The master agent coordinates planning while specialized subagents handle coding, testing, documentation, and commits automatically.

### Key Commands

**aiwf-core (Core Framework)**
- `/aiwf:initialize` - Initial project setup
- `/aiwf:session-start` - Start a new session
- `/aiwf:session-end` - End current session with summary
- `/aiwf:yolo` - Autonomous development mode
- `/aiwf:do-task` - Execute individual task
- `/aiwf:create-sprint` - Create sprint from milestone
- `/aiwf:create-sprint-tasks` - Generate tasks for sprint
- `/aiwf:commit` - Smart commit with context

**aiwf-dev (Development Workflow)**
- `/tdd:tdd-red` - Write failing test first
- `/tdd:tdd-green` - Implement to pass test
- `/tdd:tdd-refactor` - Refactor with tests passing
- `/devops:deploy-checklist` - Deployment verification
- `/devops:docker-optimize` - Docker optimization

**aiwf-tools (Utilities)**
- `/refactoring:refactor-clean` - Clean code refactoring
- `/debugging:error-trace` - Error tracing and analysis
- `/api:api-scaffold` - API scaffolding
- `/docs:doc-generate` - Documentation generation

### 🚀 YOLO Mode - Autonomous AI Development

Revolutionary multi-agent orchestration that enables completely autonomous development workflows. AIWF acts as the master agent coordinating multiple Claude Code subagents:

```bash
# Full autonomous development - AI handles everything
/aiwf:yolo

# Target specific sprint execution
/aiwf:yolo S03

# Continuous multi-sprint development
/aiwf:yolo sprint-all
```

Master agent analyzes requirements and coordinates specialized subagents that create tasks, write code, run tests, and commit changes - achieving true multi-agent autonomous software development.

## 🛠️ CLI Tools

AIWF provides several specialized CLI tools for different aspects of project management:

### Main CLI Commands
- `aiwf install` - Install AIWF framework in current project
- `aiwf create-project` - Create new project from templates
- `aiwf compress` - Context compression for token optimization
- `aiwf token` - Token usage monitoring and management
- `aiwf persona` - AI persona management
- `aiwf evaluate` - AI response and code quality evaluation

### Sprint Management (`aiwf-sprint`)
- `aiwf-sprint create` - Create new independent sprint
- `aiwf-sprint list` - List all sprints
- `aiwf-sprint status` - Show sprint status and progress
- `aiwf-sprint task create` - Add tasks to sprint
- `aiwf-sprint task execute` - Execute sprint tasks

### Checkpoint System (`aiwf-checkpoint`)
- `aiwf-checkpoint create` - Create project checkpoint for rollback
- `aiwf-checkpoint list` - List all available checkpoints
- `aiwf-checkpoint restore` - Restore project to previous checkpoint

### Language Management (`aiwf-lang`)
- `aiwf-lang status` - Check current language settings
- `aiwf-lang set ko` - Switch to Korean
- `aiwf-lang set en` - Switch to English

### Cache Management (`aiwf-cache`)
- `aiwf-cache download` - Download templates to local cache
- `aiwf-cache list` - List all cached templates
- `aiwf-cache clean` - Clean cache storage
- `aiwf-cache update` - Update cached templates
- `aiwf-cache status` - Check cache status and usage

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
├── .claude-plugin/              # Plugin registry
│   └── marketplace.json         # 4 plugins registered
├── plugins/                     # Plugin content
│   ├── aiwf-core/              # Core: session, yolo, sprint
│   ├── aiwf-dev/               # Dev: TDD, DevOps
│   ├── aiwf-experts/           # Expert agents
│   └── aiwf-tools/             # Development tools
├── .cursor/rules/               # Cursor IDE development rules
└── .windsurf/rules/             # Windsurf IDE development rules
```

### Language-Specific Content

Based on your language selection (`aiwf-lang set en/ko`):

| Language | Commands | Documentation |
|----------|----------|---------------|
| **English** (default) | Standard commands | English docs & templates |
| **Korean** | `_kr` suffix available | Korean docs & templates |

## 🏗️ Code Architecture

### Optimized Validation System

AIWF features a significantly improved validation system that ensures reliable installation and operation:

#### Key Improvements in v0.3.18+
- **86% Code Reduction**: Streamlined validator.js from 348 lines to 48 lines
- **Unified Interface**: Single `validateInstallation()` function replaces 3 redundant methods
- **Constants-Based Configuration**: All validation parameters centralized in `VALIDATION_CONSTANTS`
- **Enhanced Error Reporting**: Specific, actionable error messages with detailed diagnostics

#### VALIDATION_CONSTANTS Structure
```javascript
const VALIDATION_CONSTANTS = {
  MIN_FILE_SIZE: 10,              // Minimum file size requirement
  MIN_RULE_FILE_SIZE: 50,         // Minimum size for AI tool rule files
  MIN_FILE_COUNT: {
    CURSOR_MDC: 2,                // Required .mdc files for Cursor
    WINDSURF_MD: 2,               // Required .md files for Windsurf  
    CLAUDE_COMMANDS: 4            // Required command files for Claude
  }
};
```

#### Validation Features
- **Multi-Tool Support**: Validates Claude Code, Cursor, Windsurf, and Gemini CLI
- **File Integrity Checks**: Size validation, accessibility verification, and structure validation
- **Intelligent Error Recovery**: Detailed troubleshooting guidance for failed validations
- **Performance Optimized**: Faster execution with reduced memory footprint

### Clean Architecture Principles

The codebase follows clean architecture principles for maintainability and extensibility:

#### Eliminated Code Duplication
- **Unified Validation Logic**: Consolidated validation functions eliminate redundancy
- **Shared Constants**: Centralized configuration reduces maintenance overhead
- **Streamlined Error Handling**: Consistent error reporting across all validation types

#### Improved Developer Experience
- **Clear Separation of Concerns**: Validation, file management, and error reporting are properly isolated
- **Maintainable Code Structure**: Reduced complexity makes the codebase easier to understand and modify
- **Performance Benefits**: Optimized code paths improve installation speed and reliability

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
- [Validator API Reference](docs/VALIDATOR_API.md) - Validation system API documentation
- [Code Cleanup Guide](docs/CODE_CLEANUP_GUIDE.md) - Code cleanup principles and patterns
- [Troubleshooting](docs/TROUBLESHOOTING.md) - Common issues and solutions

## 📖 Source

This installer fetches the AIWF framework from:
<https://github.com/moonklabs/aiwf>

## 📝 License

MIT
