[Read in Korean (한국어로 보기)](PRD.ko.md)

# AIWF - AI Workflow Framework

_Version: 0.3.0_

## Overview

A comprehensive, `npx`-executable command-line tool to install the AIWF (AI Workflow Framework) into any project. It provides a structured directory layout and command-line tools for streamlined AI-assisted project management, with full support for multiple languages (English and Korean).

## Core Functionality

### Installation Command

The tool is executed via `npx`:

```bash
npx aiwf          # Interactive language selection
npx aiwf --force  # Skip prompts (defaults to Korean)
```

### Key Features

1.  **Multi-language Support**:
    - Interactive language selection (English/Korean)
    - Language-specific command files and documentation
    - Localized user interface and messages

2.  **Creates Directory Structure**:
    - Initializes the `.aiwf/` directory with standardized subdirectories for documents, requirements, sprints, and more
    - Sets up the `.claude/commands/aiwf/` directory for custom Claude commands
    - Configures IDE-specific rules for Cursor and Windsurf

3.  **Fetches from GitHub**:
    - Downloads the latest framework files from the `aiwf/aiwf` repository on GitHub
    - Sources language-specific files from `claude-code/aiwf/ko/` or `claude-code/aiwf/en/`
    - Installs commands, documentation templates, and the project manifest

4.  **Handles Existing Installations**:
    - Detects if AIWF framework is already present
    - Prompts the user to **Update**, **Skip**, or **Cancel**
    - The update process preserves user-created files (tasks, sprints) while updating command scripts and `CLAUDE.md` documents
    - Automatically backs up overwritten files with timestamped `.bak` extension

5.  **IDE Integration**:
    - Automatically converts and installs rules for Cursor IDE (`.mdc` format)
    - Supports Windsurf IDE with plain markdown rules
    - Seamless integration with Claude Code

## Technical Approach

- **Node.js Script**: A single executable script built with Node.js.
- **Dependencies**: Uses external libraries to enhance the command-line interface:
  - `commander`: For command-line argument parsing.
  - `ora`: To display loading spinners.
  - `prompts`: For interactive user prompts.
  - `chalk`: To add color to console output.
- **GitHub Fetching**: Downloads files directly from the `raw.githubusercontent.com` source, using the GitHub API to list directory contents.

## Installation Flow

1.  A welcome message is displayed
2.  Language selection prompt (English/Korean) unless `--force` flag is used
3.  The script checks for an existing installation
4.  If one exists, it prompts the user to choose an action (Update, Skip, Cancel)
5.  If proceeding, a spinner indicates that files are being fetched from GitHub
6.  The required directory structure is created based on selected language
7.  Framework files (manifest, templates, docs, commands) are downloaded from language-specific directories
8.  IDE rules are processed and installed (Cursor/Windsurf)
9.  A success message is shown with next steps for getting started
10. If any step fails, an error message is displayed and existing files are restored from backups if available

## File Structure Created

The installer creates the following structure in your project

```
your_project/
├── .aiwf/                              # AIWF project management structure
│   ├── 00_PROJECT_MANIFEST.md          # Central project tracking
│   ├── 01_PROJECT_DOCS/                # Project documentation
│   │   └── ARCHITECTURE.md             # System architecture docs
│   ├── 02_REQUIREMENTS/                # Milestone-based requirements
│   │   └── M01_*/                      # Milestone folders
│   ├── 03_SPRINTS/                     # Sprint execution folders
│   │   └── S01_*/                      # Sprint folders with tasks
│   ├── 04_GENERAL_TASKS/               # Non-sprint tasks
│   ├── 98_PROMPTS/                     # Useful prompts
│   └── 99_TEMPLATES/                   # Document templates
├── .claude/commands/aiwf/              # Claude Code custom commands
│   ├── initialize.md                   # Project initialization
│   ├── prime_context.md                # Context loading
│   ├── plan_milestone.md               # Milestone planning
│   ├── create_sprints_from_milestone.md # Sprint creation
│   ├── do_task.md                      # Task execution
│   ├── commit.md                       # Git commit workflow
│   ├── yolo.md                         # Autonomous execution
│   └── ... (20+ more commands)
├── .cursor/rules/                      # Cursor IDE integration (if detected)
│   ├── code-style-guide.mdc
│   ├── coding-principles.mdc
│   └── ... (converted rules)
└── .windsurf/rules/                    # Windsurf IDE integration (if detected)
    ├── code-style-guide.md
    ├── coding-principles.md
    └── ... (plain markdown rules)
```

## Features in Detail

### Multi-language Support
- **Language Selection**: Interactive prompt during installation
- **Supported Languages**: English and Korean
- **Language-specific Files**: Commands and documentation are installed based on selected language
- **Fallback**: Defaults to Korean when using `--force` flag

### Command System
The framework includes 25+ specialized commands for AI-assisted development:
- **Setup**: `initialize`, `prime`, `prime_context`
- **Planning**: `plan_milestone`, `create_sprints_from_milestone`, `create_sprint_tasks`
- **Development**: `do_task`, `commit`, `test`, `code_review`
- **Automation**: `yolo` (autonomous task execution)
- **GitHub Integration**: `issue_create`, `pr_create`
- **Analysis**: `ultrathink_*`, `mermaid`, `project_review`

### IDE Integration
- **Cursor IDE**: Converts rules to `.mdc` format with frontmatter
- **Windsurf IDE**: Uses plain markdown format
- **Claude Code**: Native integration with custom commands

## Current Status (v0.3.0)

### Completed Features
- ✅ NPM package deployment (`npx aiwf`)
- ✅ Multi-language support (Korean/English)
- ✅ IDE integration (Cursor, Windsurf)
- ✅ 25+ Claude Code commands
- ✅ Backup/restore mechanism
- ✅ GitHub API integration

### Known Issues
- `update_docs` command file missing (only `aiwf_docs.md` exists)
- GitHub repository URL still references `moonklabs/aiwf` in some places

### Roadmap
- [ ] Offline installation option
- [ ] Additional language support
- [ ] VS Code extension
- [ ] Enhanced project templates
- [ ] Community marketplace for custom commands
