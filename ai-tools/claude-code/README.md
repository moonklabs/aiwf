# Claude Code AIWF Integration Template

## Overview

This template provides seamless integration between Claude Code and the AI Workflow Framework (AIWF). It enhances Claude Code's capabilities with AIWF's structured development features.

## Features

- **Feature Ledger Integration**: Automatic synchronization with AIWF's feature tracking system
- **AI Persona Support**: Access to specialized AI personas for different development contexts
- **Sprint Management**: Integration with AIWF's sprint and task management
- **Context Compression**: Efficient handling of large codebases
- **Offline Cache**: Local caching for improved performance

## Installation

```bash
# Install Claude Code template
aiwf ai-tool install claude-code

# Or manually copy template files
cp -r .aiwf/ai-tools/claude-code/template/* .
```

## Configuration

The template includes:

1. **CLAUDE.md**: Main configuration file for Claude Code
   - AIWF feature documentation
   - Command quick reference
   - Best practices guide

2. **.claude/**: Directory for Claude-specific settings
   - Context rules
   - Custom instructions
   - Project metadata

## Usage

### 1. Feature Ledger Integration

Claude Code automatically recognizes Feature Ledger entries:

```bash
# View features directly in Claude Code
@features list
@features show <feature-id>
```

### 2. AI Personas

Activate specialized personas within Claude Code:

```
@persona architect
Design a microservices architecture for the payment system.

@persona reviewer  
Review the authentication module for security issues.
```

### 3. Sprint Tasks

Work with sprint tasks seamlessly:

```
@task start T13_S03
@task status
@task complete T13_S03
```

### 4. Context Management

Handle large files efficiently:

```
@compress src/large-module.js
@expand compressed/large-module.js
```

## Best Practices

1. **Start with Feature Ledger**: Always check existing features before implementing new ones
2. **Use Appropriate Personas**: Select the right AI persona for each task type
3. **Follow Sprint Structure**: Update task status as you progress
4. **Manage Context Wisely**: Use compression for large files to stay within limits
5. **Document Decisions**: Reference ADRs in your implementation

## Customization

### Adding Project-Specific Rules

Edit `CLAUDE.md` to add your project-specific guidelines:

```markdown
### Project-Specific Guidelines

- Use TypeScript for all new modules
- Follow Clean Architecture principles
- Implement comprehensive error handling
```

### Configuring AI Personas

Customize persona behavior in `.claude/personas.json`:

```json
{
  "custom_personas": {
    "backend_specialist": {
      "focus": "Node.js, API design, database optimization",
      "style": "pragmatic, performance-focused"
    }
  }
}
```

## Troubleshooting

### Common Issues

1. **Feature Ledger not syncing**
   - Run `aiwf ledger sync`
   - Check `.aiwf/feature-ledger/` permissions

2. **Personas not responding**
   - Verify persona files in `.aiwf/personas/`
   - Run `aiwf persona validate`

3. **Context overflow**
   - Use `aiwf context stats` to check usage
   - Compress large files with `aiwf context compress`

## Updates

Keep your template updated:

```bash
aiwf ai-tool update claude-code
```

## Support

- Documentation: [AIWF Docs](https://aiwf.dev/docs)
- Issues: [GitHub Issues](https://github.com/moonklabs/aiwf/issues)
- Community: [Discord Server](https://discord.gg/aiwf)

---

*Claude Code Integration Template v1.0.0*