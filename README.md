[Read in Korean (한국어로 보기)](README.ko.md)

# aiwf

This project is an updated version of [Simone](https://github.com/Helmi/claude-simone).

> 🚀 Quick installer for the AIWF project management framework for Claude Code
> 
> **Multi-language support**: Available in Korean (한국어) and English

## What is AIWF?

AIWF is a markdown-based project management framework designed specifically for AI-assisted development with Claude Code. It helps break down software projects into manageable chunks for effective AI handling.

### Language Support

AIWF supports multiple languages with localized commands and documentation:
- **English**: Full English language support (default)
- **Korean (한국어)**: Complete Korean language support

## Installation

Install AIWF in any project directory:

```bash
npx aiwf
```

The installer will:

1. **Language Selection**: Choose between English and Korean (한국어)
2. **Directory Setup**: Create the `.aiwf/` directory structure for project management
3. **Commands**: Set up `.claude/commands/aiwf/` with localized Claude commands
4. **Content**: Download the latest templates and documentation in your selected language

## Usage

### First Time Installation

```bash
npx aiwf
```

### Update Existing Installation

If AIWF is already installed, the installer will detect it and offer options to:

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
- English version includes English commands and documentation (default)
- Korean version includes Korean commands and documentation

## What Gets Installed

### Directory Structure

```
your_project/
├── .aiwf/                     # Project management root
│   ├── 00_PROJECT_MANIFEST.md # Central tracking document
│   ├── 01_PROJECT_DOCS/       # Project documentation
│   ├── 02_REQUIREMENTS/       # Milestone requirements
│   ├── 03_SPRINTS/           # Sprint execution tracking
│   ├── 04_GENERAL_TASKS/     # Standalone tasks
│   ├── 05_ARCHITECTURE_DECISIONS/  # ADR documents
│   ├── 10_STATE_OF_PROJECT/  # Project state snapshots
│   ├── 98_PROMPTS/           # Useful AI prompts
│   └── 99_TEMPLATES/         # Document templates
├── .claude/commands/aiwf/    # Language-specific Claude commands
├── .cursor/rules/            # Cursor IDE development rules
└── .windsurf/rules/          # Windsurf IDE development rules
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

## Next Steps

After installation:

1. Open your project in Claude Code
2. Use `/project:aiwf` commands to manage your project
3. Start with `/project:aiwf:initialize` to set up your project

## Command Reference

For a full list of available AIWF commands and detailed usage, see [COMMANDS_GUIDE.md](docs/COMMANDS_GUIDE.md).

## Features

- 🌍 **Multi-language support** - Korean and English versions
- 🎨 Beautiful CLI with colors and progress indicators
- 🔄 Smart update detection with automatic backups
- 📦 Downloads directly from the official GitHub repository
- 🚀 Works with `npx` - no global installation needed
- 💾 Creates timestamped backups when updating
- 🎯 Language-specific commands and documentation
- 🔧 IDE integration (Cursor and Windsurf rules)

## Requirements

- Node.js 14.0.0 or higher
- Internet connection to download from GitHub

## Source

This installer fetches the AIWF framework from:
https://github.com/aiwf/aiwf

## License

MIT
