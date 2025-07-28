# AIWF (AI Workflow Framework)

[Read in Korean (한국어로 보기)](README.ko.md)

[![NPM Version](https://img.shields.io/npm/v/aiwf.svg)](https://www.npmjs.com/package/aiwf)
[![License](https://img.shields.io/npm/l/aiwf.svg)](https://github.com/moonklabs/aiwf/blob/main/LICENSE)
[![Downloads](https://img.shields.io/npm/dm/aiwf.svg)](https://www.npmjs.com/package/aiwf)

## What is AIWF?

AIWF is an AI-powered workflow framework that enables autonomous software development with Claude Code. It provides intelligent command sets and workflow definitions that allow AI to manage entire project lifecycles - from planning to deployment - with minimal human intervention.

This project is an updated version of [Simone](https://github.com/Helmi/claude-simone).

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

## 🚀 Getting Started Guide

### Step 1: Installation
```bash
# Install globally
npm install -g aiwf

# Setup in your project directory
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
/project:aiwf:aiwf_initialize
```

### Step 4: Create Sprint Plans
```bash
# Generate sprints from milestone (first sprint becomes active)
/project:aiwf:aiwf_create_sprints_from_milestone M01

# If only one milestone exists, you can omit the milestone code
/project:aiwf:aiwf_create_sprints_from_milestone
```

### Step 5: Review and Refine
Review generated plans and refine through Q&A until satisfied with the approach.

### Step 6: Generate Task Lists
```bash
# Create detailed tasks for active sprint (first task becomes active)
/project:aiwf:aiwf_create_sprint_tasks
```

### Step 7: Execute Development
```bash
# Execute individual task
/project:aiwf:aiwf_do_task [task-id]

# OR run autonomous development for entire sprint
/project:aiwf:aiwf_yolo
```

**YOLO Mode** orchestrates multiple Claude Code subagents to execute all sprint tasks continuously without interruption. The master agent coordinates planning while specialized subagents handle coding, testing, documentation, and commits automatically.

### Key Commands

- **Initialize**: `/project:aiwf:aiwf_initialize` - Initial project setup
- **Plan**: `/project:aiwf:aiwf_create_milestone_plan` - Create milestone plans
- **Sprint**: `/project:aiwf:aiwf_create_sprints_from_milestone` - Generate sprints
- **Task**: `/project:aiwf:aiwf_do_task` - Execute tasks
- **Review**: `/project:aiwf:aiwf_code_review` - Code review
- **GitHub Integration**: `/project:aiwf:aiwf_issue_create`, `/project:aiwf:aiwf_pr_create`
- **AI Personas**: `/project:aiwf:aiwf_ai_persona_architect`, `/project:aiwf:aiwf_ai_persona_debugger`, etc.

### 🚀 YOLO Mode - Autonomous AI Development

Revolutionary multi-agent orchestration that enables completely autonomous development workflows. AIWF acts as the master agent coordinating multiple Claude Code subagents:

```bash
# Full autonomous development - AI handles everything
/project:aiwf:aiwf_yolo

# Target specific sprint execution  
/project:aiwf:aiwf_yolo S03

# Continuous multi-sprint development
/project:aiwf:aiwf_yolo sprint-all
```

Master agent analyzes requirements and coordinates specialized subagents that create tasks, write code, run tests, and commit changes - achieving true multi-agent autonomous software development.

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

## 📖 Source

This installer fetches the AIWF framework from:
<https://github.com/moonklabs/aiwf>

## 📝 License

MIT
