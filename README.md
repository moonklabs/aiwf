[Read in Korean (한국어로 보기)](README.ko.md)

# aiwf

This project is an updated version of [Simone](https://github.com/Helmi/claude-simone).

> 🚀 Quick installer for the Moonklabs project management framework for Claude Code

## What is Moonklabs?

Moonklabs is a markdown-based project management framework designed specifically for AI-assisted development with Claude Code. It helps break down software projects into manageable chunks for effective AI handling.

## Installation

Install Moonklabs in any project directory:

```bash
npx aiwf
```

That's it! The installer will:

- Create the `.moonklabs/` directory structure for project management
- Set up `.claude/commands/moonklabs/` for custom Claude commands
- Download the latest templates and documentation

## Usage

### First Time Installation

```bash
npx aiwf
```

### Update Existing Installation

If Moonklabs is already installed, the installer will detect it and offer options to:

- Update (with automatic backup)
- Skip installation
- Cancel

### Force Installation

Skip all prompts and force installation:

```bash
npx aiwf --force
```

## What Gets Installed

```
aiwf/
├── AI-WORKFLOW.md
├── CHANGELOG.md
├── claude-code/
│   ├── docker/
│   │   └── Dockerfile
│   ├── moonklabs/
│   └── simone/
│       ├── CHANGELOG.md
│       ├── LICENSE
│       ├── README.md
│       ├── SYNC_GUIDE.md
│       └── sync-simone.sh
├── COMMANDS_GUIDE.md
├── LICENSE
├── package-lock.json
├── package.json
├── PRD.ko.md
├── PRD.md
├── README.ko.md
├── README.md
└── rules/
    ├── global/
    │   ├── code-style-guide.md
    │   ├── coding-principles.md
    │   ├── development-process.md
    │   └── global-rules.md
    └── manual/
        └── generate-plan-docs.md
```

## Next Steps

After installation:

1. Open your project in Claude Code
2. Use `/project:moonklabs` commands to manage your project
3. Start with `/project:moonklabs:initialize` to set up your project

## Command Reference

For a full list of available Moonklabs commands and detailed usage, see [COMMANDS_GUIDE.md](docs/COMMANDS_GUIDE.md).

## Features

- 🎨 Beautiful CLI with colors and progress indicators
- 🔄 Smart update detection with automatic backups
- 📦 Downloads directly from the official GitHub repository
- 🚀 Works with `npx` - no global installation needed
- 💾 Creates timestamped backups when updating

## Requirements

- Node.js 14.0.0 or higher
- Internet connection to download from GitHub

## Source

This installer fetches the Moonklabs framework from:
https://github.com/moonklabs/aiwf

## License

MIT
