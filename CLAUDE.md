# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **aiwf** (AI Workflow Framework), an NPM package that installs the AIWF project management framework for AI-assisted development. It's an updated version of the Simone framework, specifically designed for Claude Code integration.

## Changelog Guidelines

- **Changelog Best Practices**: Always summarize changes concisely by feature or component
- Aim for clear, brief descriptions that highlight the key modifications in each update
- Group changes by type: Added, Changed, Fixed, Removed
- Provide context for significant changes without unnecessary details
- Always use English

## Project Structure

The AIWF project is organized as follows:

```
aiwf/
├── ai-tools/             # AI tool-specific configurations
│   ├── claude-code/      # Claude Code specific settings
│   ├── cursor/           # Cursor AI integration
│   ├── windsurf/        # Windsurf integration
│   └── github-copilot/   # GitHub Copilot integration
├── commands/             # AIWF command implementations
│   ├── ai-persona.js     # AI persona management
│   ├── compress-context.js # Context compression
│   ├── evaluate.js       # Evaluation functionality
│   ├── feature-ledger.js # Feature tracking
│   └── token-tracking.js # Token usage monitoring
├── config/               # Configuration files
│   ├── commit-patterns.js # Git commit patterns
│   └── language.json     # Language settings
├── docs/                 # Project documentation
├── feature-ledger/       # Feature tracking JSON files
│   ├── FL-001-authentication.json
│   └── feature-index.json
├── hooks/                # Git hooks and installation scripts
│   ├── install-hooks.sh  # Hook installation script
│   └── post-commit       # Post-commit hook
├── lib/                  # Core library modules
├── personas/             # AI persona definitions and knowledge bases
├── rules/                # Development rules and guidelines
│   ├── global/          # Global development rules
│   └── manual/          # Manual operation guides
├── scripts/              # Build and utility scripts
├── templates/            # Project templates
│   ├── api-server/      # Express.js API server template
│   ├── npm-library/     # NPM library template
│   └── web-app/         # React web app template
├── tests/                # Test suites
│   ├── integration/      # Integration tests
│   └── unit/            # Unit tests
├── utils/                # Utility modules
├── package.json          # NPM package configuration
├── CLAUDE.md            # This file - Claude Code guidance
└── README.md            # Project documentation
```

## AI Tools Directory

The `ai-tools/` directory contains configurations for various AI coding assistants:

- **claude-code/**: Claude Code specific settings and templates
- **cursor/**: Cursor AI integration files
- **windsurf/**: Windsurf configuration
- **github-copilot/**: GitHub Copilot integration
- **augment/**: Augment AI tool configuration

Each tool directory includes:
- `config.json`: Tool-specific configuration
- `template/`: Template files for that specific AI tool
- `README.md`: Documentation for the integration

## Commands Directory

The `commands/` directory contains all AIWF command implementations:

- **ai-persona.js**: Manages AI personas and their behaviors
- **compress-context.js**: Compresses context to optimize token usage
- **evaluate.js**: Evaluates code quality and AI responses
- **feature-ledger.js**: Tracks features and their development status
- **feature-commit-report.js**: Generates reports from git commits
- **persona-context-apply.js**: Applies persona contexts to AI interactions
- **scan-git-history.js**: Analyzes git history for insights
- **sync-feature-commits.js**: Synchronizes feature commits with ledger
- **token-tracking.js**: Monitors and reports token usage

## Templates Directory

The `templates/` directory provides starter templates for different project types:

- **api-server/**: Express.js API server with TypeScript
  - Includes Swagger documentation
  - AIWF middleware integration
  - Jest testing setup
  
- **npm-library/**: NPM package template
  - TypeScript configuration
  - Rollup bundling
  - Complete testing setup
  
- **web-app/**: React + Vite web application
  - TypeScript + Tailwind CSS
  - AIWF dashboard components
  - State management setup

## Feature Ledger Directory

The `feature-ledger/` directory contains JSON files for tracking feature development:

- **FL-001-authentication.json**: Authentication feature tracking
- **feature-index.json**: Index of all features and their status

Feature ledgers help track:
- Feature status (planned, in-progress, completed)
- Related git commits
- Development milestones
- Integration with git workflow through hooks

## Hooks Directory

The `hooks/` directory contains Git hooks for automated workflow:

- **install-hooks.sh**: Script to install git hooks into the project
- **post-commit**: Automatically syncs feature ledger with git commits

To install hooks:
```bash
./hooks/install-hooks.sh
```

The post-commit hook automatically:
- Parses commit messages for feature references
- Updates feature status in the ledger
- Maintains feature-commit relationships

## Utils Directory

The `utils/` directory contains utility modules for various AIWF features:

- **Compression utilities**: Various strategies for context compression
- **Git utilities**: Git operation helpers and integrations
- **Token management**: Token counting, tracking, and optimization
- **Text processing**: Summarization and content normalization
- **Persona utilities**: Context parsing and behavior validation

## Key Files and Configurations

### package.json Configuration
- **Type**: ES Module (`"type": "module"`)
- **Version**: 0.3.3
- **Main binaries**:
  - `aiwf` - Main CLI command
  - `aiwf-lang` - Language management CLI

### Available Scripts
- `npm test` - Run Jest tests with ES module support
- `npm run lang:status` - Check language settings
- `npm run lang:set` - Set language preference
- `npm run lang:reset` - Reset to auto-detection
- `npm run validate:commands` - Validate command implementations

## AIWF Framework Development Rules

- **CRITICAL**: All development and source code modifications for the AIWF framework occur directly in the root project directories.
- When developing new features or modifying existing ones, work directly with the files in `commands/`, `utils/`, `lib/`, etc.
- The `.aiwf/` directory (when created in user projects) is a generated instance for the end user. Framework development happens in the main repository.
- Always test changes thoroughly before committing, as modifications directly affect the framework.

## Development Guidelines

### ES Module Usage
This project uses ES modules. Always use:
- `import` instead of `require`
- `export` instead of `module.exports`
- File extensions in imports when needed

### Language Support
- AIWF supports both English and Korean languages
- Language is managed through the `aiwf-lang` CLI command
- Documentation is provided in both languages (e.g., README.md, README.ko.md)
- Commands and interfaces adapt based on the selected language

### Language Content Rules
**IMPORTANT**: Language management approach:
- The framework uses a unified codebase with language-specific resources
- Language selection is handled at runtime through `config/language.json`
- Documentation files use language suffixes:
  - English: `GUIDE.md`
  - Korean: `GUIDE.ko.md`
- Code comments and inline documentation should be in English for maintainability
- User-facing messages and prompts are loaded from language-specific resources
- Technical terms, function names, and variable names remain in English

### Testing
- Write tests for all new features
- Maintain integration tests in `tests/integration/`
- Unit tests go in `tests/unit/`
- Use Jest with ES module configuration

### Git Workflow
- Follow the commit patterns defined in `config/commit-patterns.js`
- Use meaningful commit messages
- Group related changes together

## Language-Specific Features

### Switching Languages
Users can switch languages using:
```bash
aiwf-lang set ko  # Switch to Korean
aiwf-lang set en  # Switch to English
```

### Language Detection
The system automatically detects system language on first install, with fallback to English.

### Localization
- Commands can have language-specific suffixes (e.g., `_kr`)
- Documentation is available in both languages
- Template content is fully localized

## Core Architecture

AIWF is built on a modular architecture designed for extensibility and AI tool integration:

### Command System
- Commands are self-contained modules in the `commands/` directory
- Each command exports a default function that handles the command logic
- Commands can utilize utilities from `utils/` and libraries from `lib/`

### AI Persona System
- Personas are defined in JSON format in the `personas/` directory
- Each persona has associated knowledge bases and best practices
- The system supports dynamic persona switching and context application

### Token Management
- Built-in token tracking and optimization
- Multiple compression strategies for context management
- Real-time monitoring and reporting capabilities

### Template System
- Project templates are stored in the `templates/` directory
- Each template is a complete, working project setup
- Templates include AIWF integration out of the box

### Multi-Language Support
- Runtime language switching via `aiwf-lang` command
- Localized documentation and user interfaces
- Unified codebase with language-specific resources
