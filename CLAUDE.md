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
├── src/                          # Main source code directory
│   ├── cli/                      # CLI entry points (aiwf, aiwf-lang, aiwf-sprint, etc.)
│   │   ├── index.js              # Main CLI entry
│   │   ├── language-cli.js       # Language management CLI
│   │   ├── checkpoint-cli.js     # Checkpoint CLI
│   │   ├── sprint-cli.js         # Sprint CLI
│   │   └── cache-cli.js          # Template cache CLI
│   ├── commands/                 # AIWF command implementations
│   │   ├── ai-tool.js
│   │   ├── compress.js
│   │   ├── create-project.js
│   │   ├── evaluate.js
│   │   ├── persona.js
│   │   ├── sprint-independent.js
│   │   ├── sprint-task.js
│   │   ├── state.js
│   │   ├── token.js
│   │   └── yolo-config.js
│   ├── lib/
│   │   ├── resource-loader.js    # Unified resource management
│   │   └── resources/            # Bundled resources included in NPM package
│   │       ├── commands/
│   │       ├── config/
│   │       ├── personas/
│   │       ├── templates/
│   │       └── utils/
│   └── utils/                    # Framework utility modules
├── ai-tools/                     # AI tool-specific configurations
│   ├── claude-code/
│   ├── cursor/
│   ├── windsurf/
│   ├── github-copilot/
│   └── augment/
├── docs/                         # Project documentation
├── rules/                        # Global/manual rules for the framework
├── scripts/                      # Dev scripts (validation, tests, updates)
├── tests/                        # Jest tests (unit, integration)
├── claude-code/                  # Claude Code command content (en/ko)
├── package.json                  # NPM package configuration
├── README.md
├── README.ko.md
└── CLAUDE.md                     # This file - Claude Code guidance
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

## Resource Management System

AIWF now uses a unified resource management system to ensure compatibility for NPM-installed users:

### ResourceLoader Module
The `src/lib/resource-loader.js` module manages resources for both development and production environments:

- **Bundled Resources**: Resources packaged with NPM installation (`src/lib/resources/`)
- **User Resources**: User-specific resources in `~/.aiwf/`
- **Priority System**: User resources override bundled resources when available

### Key Features
- Dynamic resource loading from multiple sources
- Template management for project creation
- Persona definitions and knowledge bases
- Utility functions and command implementations
- Seamless fallback from user to bundled resources

## Commands Directory

The `src/commands/` directory contains all AIWF command implementations:

- **ai-tool.js**: Manages AI tool integrations
- **compress.js**: Compresses context to optimize token usage
- **create-project.js**: Creates new AIWF projects from templates
- **evaluate.js**: Evaluates AI responses and code quality
- **persona.js**: Manages AI personas and their behaviors
- **token.js**: Monitors and reports token usage
- **sprint-independent.js**: Independent sprint management
- **sprint-task.js**: Sprint task execution and management
- **state.js**: Project state management
- **yolo-config.js**: YOLO mode configuration management

All commands use the ResourceLoader system to access bundled resources, ensuring they work in both development and installed environments.

## Templates Directory

The template files distributed with the package are bundled under `src/lib/resources/templates/`. These templates are copied to the user project (e.g., `.aiwf/99_TEMPLATES/`) when needed.

Common categories include:
- API server templates (TypeScript, Swagger-ready, testing setup)
- NPM library templates (TypeScript, bundling, tests)
- Web app templates (React + Vite, Tailwind, dashboard components)

## Hooks

A dedicated `hooks/` directory is not part of the current repository layout. If Git hooks are required, manage them within your consuming projects as needed.

## Utils Directory

The framework utilities live in `src/utils/`, and additional utility content shipped for end-user projects is under `src/lib/resources/utils/`.

- Compression utilities
- Git-related helpers
- Token management helpers
- Text processing helpers
- Persona utilities

## Key Files and Configurations

### package.json Configuration
- **Type**: ES Module (`"type": "module"`)
- **Version**: 0.3.19
- **Main binaries**:
  - `aiwf` - Main CLI command
  - `aiwf-lang` - Language management CLI
  - `aiwf-sprint` - Sprint management CLI
  - `aiwf-checkpoint` - Checkpoint management CLI
  - `aiwf-cache` - Template cache management CLI

### Available Commands

AIWF provides a comprehensive set of CLI commands:

### Core Commands
- `aiwf install` - Install AIWF framework in current project
- `aiwf create-project` - Create a new AIWF project from templates
- `aiwf compress [mode] [path]` - Compress context for token optimization
- `aiwf feature <subcommand>` - Manage feature development tracking
- `aiwf token <subcommand>` - Monitor and manage token usage
- `aiwf evaluate <subcommand>` - Evaluate AI responses and code quality
- `aiwf persona <subcommand>` - Manage AI personas
- `aiwf lang <subcommand>` - Language settings management
- `aiwf state <subcommand>` - Project state management
- `aiwf yolo-config <subcommand>` - YOLO mode configuration

### Sprint Management Commands
- `aiwf-sprint create` - Create new independent sprint
- `aiwf-sprint list` - List all sprints
- `aiwf-sprint status` - Show sprint status
- `aiwf-sprint task <subcommand>` - Manage sprint tasks

### Checkpoint Commands
- `aiwf-checkpoint create` - Create project checkpoint
- `aiwf-checkpoint list` - List all checkpoints
- `aiwf-checkpoint restore` - Restore from checkpoint

### Cache Management Commands
- `aiwf-cache download` - Download templates to cache
- `aiwf-cache list` - List cached templates
- `aiwf-cache clean` - Clean cache storage
- `aiwf-cache update` - Update cached templates
- `aiwf-cache status` - Show cache status

### Feature Commands
- `aiwf feature list` - List all features
- `aiwf feature create <name> [description]` - Create new feature
- `aiwf feature update <id> <status>` - Update feature status
- `aiwf feature status [id]` - Show feature status
- `aiwf feature sync` - Sync with git commits

### Token Commands
- `aiwf token status` - Show token usage statistics
- `aiwf token report [period]` - Generate usage reports
- `aiwf token track <input> <output>` - Manually record token usage
- `aiwf token limit <type> <value>` - Set usage limits
- `aiwf token reset` - Reset tracking data

### Evaluation Commands
- `aiwf evaluate response <file>` - Evaluate AI response quality
- `aiwf evaluate code <file>` - Evaluate code quality
- `aiwf evaluate persona <file> <persona>` - Check persona appropriateness
- `aiwf evaluate report` - Generate evaluation reports
- `aiwf evaluate criteria` - Show evaluation criteria

## Available Scripts
- `npm test` - Run Jest tests with ES module support
- `npm run check:deps` - Check dependencies compatibility
- `npm run lang:status` - Check language settings
- `npm run lang:set` - Set language preference
- `npm run lang:reset` - Reset to auto-detection
- `npm run validate:commands` - Validate command implementations
- `npm run update:file-lists` - Update file lists configuration
- `npm run update:file-lists:dry-run` - Preview file list updates
- `npm run update:file-lists:verbose` - Update with verbose output

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
- Language selection is handled at runtime through `.aiwf/config/language.json`
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
- Personas distributed with the package are defined in JSON format under `src/lib/resources/personas/`
- Each persona has associated knowledge bases and best practices
- The system supports dynamic persona switching and context application

### Token Management
- Built-in token tracking and optimization
- Multiple compression strategies for context management
- Real-time monitoring and reporting capabilities

### Template System
- Project templates are bundled under `src/lib/resources/templates/` and are copied into user projects (e.g., `.aiwf/99_TEMPLATES/`) when used by the CLI
- Each template is a complete, working project setup
- Templates include AIWF integration out of the box

### Multi-Language Support
- Runtime language switching via `aiwf-lang` command
- Localized documentation and user interfaces
- Unified codebase with language-specific resources

## Installation Validation System

AIWF includes a robust validation system that ensures proper installation and configuration of all framework components and AI tools.

### Enhanced Validation Architecture

The validation system has been significantly improved with a clean, maintainable architecture:

#### VALIDATION_CONSTANTS Structure
```javascript
const VALIDATION_CONSTANTS = {
  MIN_FILE_SIZE: 10,              // Minimum file size in bytes
  MIN_RULE_FILE_SIZE: 50,         // Minimum size for rule files
  MIN_FILE_COUNT: {
    CURSOR_MDC: 2,                // Minimum .mdc files for Cursor
    WINDSURF_MD: 2,               // Minimum .md files for Windsurf
    CLAUDE_COMMANDS: 4            // Minimum command files for Claude
  }
};
```

#### Simplified Validation Interface
The validation system now uses a single, unified function `validateInstallation()` that:
- Validates core AIWF files automatically
- Supports selective tool validation
- Provides detailed error reporting
- Returns structured results with success/failure status

#### Key Improvements
- **Reduced Complexity**: Consolidated from 348 lines to 48 lines (300 lines removed)
- **Eliminated Duplication**: Merged 3 redundant validation functions into 1
- **Constants-Based Configuration**: All magic numbers moved to VALIDATION_CONSTANTS
- **Enhanced Error Messages**: Specific, actionable error information
- **Improved Maintainability**: Clean separation of concerns

### Validation Features

#### Tool-Specific Validation
- **Claude Code**: Validates command files and file sizes
- **Cursor**: Checks for .mdc rule files and directory structure
- **Windsurf**: Validates .md rule files and configuration
- **Gemini CLI**: Verifies prompt directory structure
- **Core AIWF**: Validates essential framework files

#### File Validation Criteria
- **Size Validation**: Ensures files meet minimum size requirements
- **Count Validation**: Verifies sufficient number of required files
- **Content Validation**: Checks file accessibility and readability
- **Structure Validation**: Confirms proper directory organization

### Performance Optimizations

The validation system improvements deliver significant performance benefits:
- **Faster Execution**: Streamlined validation logic reduces processing time
- **Memory Efficiency**: Reduced code footprint and eliminated redundant operations
- **Better Caching**: Optimized file access patterns
- **Error Handling**: Improved error recovery and reporting mechanisms
