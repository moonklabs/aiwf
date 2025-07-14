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
├── claude-code/           # Template files for AIWF installation
│   ├── aiwf/             # Core AIWF templates
│   │   ├── en/           # English language templates
│   │   └── ko/           # Korean language templates
│   └── docker/           # Docker configuration
├── docs/                 # Project documentation
├── lib/                  # Core library modules
├── src/                  # Source code
├── tests/                # Test suites
│   ├── integration/      # Integration tests
│   └── unit/            # Unit tests
├── scripts/              # Build and validation scripts
├── rules/                # Development rules and guidelines
├── package.json          # NPM package configuration
├── CLAUDE.md            # This file - Claude Code guidance
└── README.md            # Project documentation
```

## claude-code Directory

The `claude-code/` directory contains template files that are copied during AIWF installation. It's structured by language:

### Language Structure (en/ and ko/)
- **commands/**: Claude Code command implementations
  - ai-persona.js - AI persona management
  - compress-context.js - Context compression utilities
  - feature_commit_report.js - Git commit reporting
  - scan_git_history.js - Git history analysis
  - sync_feature_commits.js - Feature commit synchronization
  - token-tracking.js - Token usage monitoring

- **utils/**: Utility modules
  - compression-*.js - Various compression strategies
  - git-utils.js - Git operation utilities
  - token-*.js - Token tracking and optimization
  - text-summarizer.js - Text summarization utilities

- **config/**: Configuration files
  - commit-patterns.js - Git commit pattern definitions

- **hooks/**: Git hooks
  - post-commit - Post-commit hook script
  - install-hooks.sh - Hook installation script

- **tests/**: Test files for the templates

### Korean Version Additional Features
The Korean version (`ko/`) includes additional features:
- persona-context-apply.js - Persona context application
- context-rule-parser.js - Context rule parsing
- persona-behavior-validator.js - Behavior validation
- persona-quality-evaluator.js - Quality evaluation
- prompt-injector.js - Prompt injection utilities

## Key Files and Configurations

### package.json Configuration
- **Type**: ES Module (`"type": "module"`)
- **Version**: 0.3.1
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

- **CRITICAL**: All development and source code modifications for the AIWF framework itself **MUST** occur within the `claude-code/aiwf/{en|ko}/` directories.
- The root `.aiwf/` directory is a "live" instance for testing and demonstration purposes **ONLY**. Do **NOT** modify files in the root `.aiwf/` as part of framework development.
- Before modifying any file, confirm that the target path is within `claude-code/aiwf/`.

## Development Guidelines

### ES Module Usage
This project uses ES modules. Always use:
- `import` instead of `require`
- `export` instead of `module.exports`
- File extensions in imports when needed

### Language Support
- Maintain feature parity between `en/` and `ko/` versions
- Document any language-specific features clearly
- Use appropriate language codes in file paths

### Language Content Rules
**IMPORTANT**: Strict language separation must be maintained:
- `claude-code/aiwf/en/` - MUST contain ONLY English content
  - All code comments, documentation, and strings must be in English
  - No Korean text should appear in any files under this directory
- `claude-code/aiwf/ko/` - MUST contain ONLY Korean content
  - All code comments, documentation, and strings must be in Korean
  - No English text should appear except for:
    - Technical terms (e.g., API, function names, variable names)
    - Library/framework names
    - File paths and URLs

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

[... rest of the existing content remains unchanged ...]
