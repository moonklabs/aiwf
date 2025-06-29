# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **aiwf** (AI Workflow Framework), an NPM package that installs the Moonklabs project management framework for AI-assisted development. It's an updated version of the Simone framework, specifically designed for Claude Code integration.

## Core Architecture

### Main Components

1. **CLI Installer (`index.js`)**: The main entry point that downloads and installs Moonklabs framework components from GitHub
2. **Moonklabs Framework**: A markdown-based project management system located in `claude-code/moonklabs/`
3. **Rules System**: Development guidelines in `rules/global/` and `rules/manual/` for Cursor and Windsurf IDEs

### Key Directories

```
aiwf/
├── index.js                    # Main CLI installer with GitHub API integration
├── package.json               # NPM package configuration
├── claude-code/moonklabs/      # Complete Moonklabs framework
│   ├── .claude/commands/       # Claude Code custom commands
│   └── .moonklabs/            # Project management structure
└── rules/                     # IDE-specific development rules
    ├── global/                # Always-apply rules
    └── manual/                # On-demand rules
```

## Development Commands

### Building and Testing

```bash
# Install dependencies
npm install

# Test the installer (creates .moonklabs/ and .claude/ in current directory)
node index.js

# Test with force flag (skips prompts)
node index.js --force

# Publish to NPM
npm publish
```

### Package Usage

```bash
# Install Moonklabs in any project
npx aiwf

# Force installation without prompts
npx aiwf --force
```

## Technical Implementation Details

### GitHub Integration

The installer (`index.js`) fetches content directly from the GitHub repository:

- **API URL**: `https://api.github.com/repos/moonklabs/aiwf`
- **Raw Content**: `https://raw.githubusercontent.com/moonklabs/aiwf/master`
- **Content Prefix**: `claude-code/moonklabs`

### Installation Process

1. **Detection**: Checks for existing `.moonklabs/` or `.claude/commands/moonklabs/`
2. **Backup**: Creates timestamped backups of existing files (`.bak` format)
3. **Download**: Fetches framework components from GitHub
4. **Setup**: Creates directory structure and copies files
5. **Rules Processing**: Converts rules to IDE-specific formats:
   - Cursor: `.mdc` files with frontmatter in `.cursor/rules/`
   - Windsurf: Plain `.md` files in `.windsurf/rules/`

### File Processing Logic

- **CLAUDE.md files**: Always updated to latest version
- **Commands**: Always updated from repository
- **Templates**: Downloaded on fresh installs only
- **User content**: Preserved during updates (sprints, tasks, etc.)

## Moonklabs Framework Integration

### Command Structure

Available via `/project:moonklabs:<command>` in Claude Code:

- **Setup**: `initialize`, `prime`, `prime_context`
- **Planning**: `plan_milestone`, `create_sprints_from_milestone`, `create_sprint_tasks`
- **Development**: `do_task`, `commit`, `test`, `code_review`
- **Automation**: `yolo` (autonomous execution)
- **GitHub**: `issue_create`, `pr_create` (with `gh` CLI integration)
- **Analysis**: `ultrathink_*`, `mermaid`, `project_review`

### GitHub Issue Integration

The framework supports seamless GitHub integration:

- Tasks can be linked to GitHub issues via `github_issue` field
- Automatic status synchronization using `gh` CLI
- PR creation with issue linking
- Commit message integration (`fixes #123`, `relates to #456`)

### Project Structure Created

```
target_project/
├── .moonklabs/                 # Project management root
│   ├── 00_PROJECT_MANIFEST.md  # Central tracking
│   ├── 02_REQUIREMENTS/        # Milestone requirements
│   ├── 03_SPRINTS/            # Sprint execution
│   ├── 04_GENERAL_TASKS/      # Standalone tasks
│   ├── 98_PROMPTS/            # Useful prompts
│   └── 99_TEMPLATES/          # Document templates
├── .claude/commands/moonklabs/ # Claude Code commands
└── .cursor/rules/             # Cursor IDE rules
```

## Development Patterns

### Error Handling

- Network failures during GitHub API calls are handled gracefully
- Backup/restore functionality for failed updates
- User prompts for dangerous operations

### CLI Design

Uses modern Node.js libraries:

- **commander**: CLI argument parsing
- **chalk**: Colored terminal output
- **ora**: Loading spinners
- **prompts**: Interactive user input

### File Management

- Recursive directory creation with `fs.mkdir({ recursive: true })`
- Stream-based file downloads using `pipeline()`
- Atomic operations with backup/restore capability

## Important Constraints

### Installation Safety

- Never overwrites user-created project content
- Always creates backups before updates
- Preserves existing work in sprints and tasks

### GitHub Dependency

- Requires internet connection for installation
- All content fetched from live GitHub repository
- Uses GitHub API rate limits (unauthenticated)

### Node.js Requirements

- Minimum Node.js 14.0.0
- Uses ES modules (`"type": "module"`)
- Requires `https` and `fs/promises` support

## Working with This Codebase

### Making Changes to Framework

1. Modify files in `claude-code/moonklabs/`
2. Test locally with `node index.js`
3. Commit and push to GitHub
4. Framework updates are automatically available via `npx aiwf`

### Adding New Commands

1. Create command files in `claude-code/moonklabs/.claude/commands/moonklabs/`
2. Include both English and Korean versions (`moonklabs/` and `moonklabs_kr/`)
3. Update documentation in `docs/COMMANDS_GUIDE.md`

### Modifying Installation Logic

- Main installer logic is in `index.js`
- GitHub API integration in `fetchGitHubContent()` and `downloadFile()`
- Directory processing in `downloadDirectory()`
- Backup logic in `backupCommandsAndDocs()`

The codebase is designed for stability and user safety, with extensive error handling and backup mechanisms to ensure reliable framework distribution.
