# AIWF (AI Workflow Framework)

[Read in Korean (한국어로 보기)](README.ko.md)

[![NPM Version](https://img.shields.io/npm/v/aiwf.svg)](https://www.npmjs.com/package/aiwf)
[![License](https://img.shields.io/npm/l/aiwf.svg)](https://github.com/aiwf/aiwf/blob/main/LICENSE)
[![Downloads](https://img.shields.io/npm/dm/aiwf.svg)](https://www.npmjs.com/package/aiwf)

## What is AIWF?

AIWF is a markdown-based project management framework designed specifically for AI-assisted development with Claude Code. It helps break down software projects into manageable units that AI can effectively handle, maximizing productivity.

This project is an updated version of [Simone](https://github.com/Helmi/claude-simone).

## 📦 Installation

Install AIWF in any project directory:

```bash
npx aiwf
```

The installer will:

1. **Language Selection**: Choose between English and Korean
2. **Directory Setup**: Create the `.aiwf/` directory structure for project management
3. **Commands**: Set up `.claude/commands/aiwf/` with localized Claude commands
4. **Content**: Download the latest templates and documentation in your selected language

## 🚀 Usage

### First Time Installation

```bash
npx aiwf
```

### Update Existing Installation

If AIWF is already installed, the installer will automatically detect it and offer options to:

- Update (with automatic backup)
- Skip installation
- Cancel

### Force Installation

Skip all prompts and force installation (defaults to English):

```bash
npx aiwf --force
```

### Language-Specific Installation

The installer automatically selects the appropriate language version based on your choice:

- English version: English commands and documentation (default)
- Korean version: Korean commands and documentation

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
│   ├── 05_ARCHITECTURE_DECISIONS/ # ADR documents
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

## 📚 Documentation

For a complete list of AIWF commands and detailed usage, see [COMMANDS_GUIDE.md](docs/COMMANDS_GUIDE.md).

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

## 🔧 Requirements

- Node.js 14.0.0 or higher
- Internet connection to download from GitHub

## 📖 Source

This installer fetches the AIWF framework from:
<https://github.com/aiwf/aiwf>

## 📝 License

MIT
