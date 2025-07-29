# AIWF AI Tool Integration Templates

This directory contains integration templates for various AI development tools to work seamlessly with the AI Workflow Framework (AIWF).

## Available Tools

### 1. Claude Code (`claude-code`)
- **Description**: Official Anthropic Claude Code integration
- **Features**: Deep AIWF integration, feature ledger sync, AI personas
- **Installation**: `aiwf ai-tool install claude-code`

### 2. GitHub Copilot (`github-copilot`)
- **Description**: GitHub Copilot configuration for AIWF projects
- **Features**: Feature-aware suggestions, sprint task integration
- **Installation**: `aiwf ai-tool install github-copilot`

### 3. Cursor (`cursor`)
- **Description**: Cursor IDE integration with AIWF
- **Features**: Multi-file context, composer enhancement, task tracking
- **Installation**: `aiwf ai-tool install cursor`

### 4. Windsurf (`windsurf`)
- **Description**: Windsurf IDE with Cascade AI integration
- **Features**: Flow-based development, multi-agent support, visual progress
- **Installation**: `aiwf ai-tool install windsurf`

### 5. Augment (`augment`)
- **Description**: Augment Code with deep codebase understanding
- **Features**: Team collaboration, knowledge queries, smart refactoring
- **Installation**: `aiwf ai-tool install augment`

## Quick Start

1. **List available tools**:
   ```bash
   aiwf ai-tool list
   ```

2. **Install a tool**:
   ```bash
   aiwf ai-tool install <tool-name>
   ```

3. **Update installed tools**:
   ```bash
   aiwf ai-tool update <tool-name>
   ```

4. **Verify installation**:
   ```bash
   aiwf ai-tool verify <tool-name>
   ```

## Integration Features

All templates provide:
- ✅ Feature Ledger integration
- ✅ AI Persona support
- ✅ Sprint task management
- ✅ Context optimization
- ✅ Offline cache support

## Directory Structure

```
ai-tools/
├── claude-code/
│   ├── template/
│   ├── config.json
│   └── README.md
├── github-copilot/
│   ├── template/
│   ├── config.json
│   └── README.md
├── cursor/
│   ├── template/
│   ├── config.json
│   └── README.md
├── windsurf/
│   ├── template/
│   ├── config.json
│   └── README.md
└── augment/
    ├── template/
    ├── config.json
    └── README.md
```

## Customization

Each tool template can be customized:
1. Edit the template files in the tool directory
2. Modify config.json for tool-specific settings
3. Add project-specific rules to the template files

## Support

For issues or questions:
- Check individual tool README files
- Visit [AIWF Documentation](https://aiwf.dev)
- Submit issues on GitHub

---

*AIWF AI Tool Integration System v1.0.0*