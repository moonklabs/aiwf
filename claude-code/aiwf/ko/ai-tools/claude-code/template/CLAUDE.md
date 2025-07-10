# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## AIWF Integration

This project uses the AI Workflow Framework (AIWF) for AI-assisted development. Claude Code is configured to work seamlessly with AIWF features.

### Available AIWF Features

1. **Feature Ledger**: Track and reference all features through `.aiwf/feature-ledger/`
2. **AI Personas**: Access specialized AI personas for different contexts in `.aiwf/personas/`
3. **Sprint Management**: Follow structured sprints in `.aiwf/03_SPRINTS/`
4. **Templates**: Use standardized templates from `.aiwf/99_TEMPLATES/`

### Working with Feature Ledger

When implementing new features:
1. Check existing features in the ledger first
2. Reference feature IDs in commit messages
3. Update feature status as you work
4. Use `aiwf ledger show <feature-id>` to view details

### AI Persona Usage

Available personas can be activated with:
- `@persona analyst` - For system analysis tasks
- `@persona architect` - For architecture decisions
- `@persona developer` - For implementation tasks
- `@persona reviewer` - For code reviews
- `@persona tester` - For testing scenarios

### Context Compression

To manage context limits effectively:
- Use `aiwf context compress` to optimize large files
- Reference compressed files with `@compressed/<filename>`
- Claude Code will automatically expand when needed

### Sprint Task Workflow

1. View current sprint: `aiwf sprint current`
2. List tasks: `aiwf sprint tasks`
3. Start a task: `aiwf task start <task-id>`
4. Complete a task: `aiwf task complete <task-id>`

### Best Practices

1. **Always check Feature Ledger before implementing new features**
2. **Use appropriate AI personas for specialized tasks**
3. **Keep context focused using compression when needed**
4. **Follow sprint structure and update task status**
5. **Reference ADRs for architectural decisions**

### AIWF Commands Quick Reference

```bash
# Feature Ledger
aiwf ledger list              # List all features
aiwf ledger show <id>         # Show feature details
aiwf ledger add               # Add new feature

# Sprint Management
aiwf sprint current           # Show current sprint
aiwf sprint tasks            # List sprint tasks
aiwf task start <id>         # Start a task
aiwf task complete <id>      # Complete a task

# AI Personas
aiwf persona list            # List available personas
aiwf persona use <name>      # Activate a persona

# Context Management
aiwf context compress <file> # Compress large file
aiwf context stats          # Show context usage
```

### Project-Specific Guidelines

<!-- Project-specific guidelines will be added here by the development team -->

### Integration Notes

- Feature Ledger is automatically synchronized
- AI Personas enhance Claude Code's contextual understanding
- Sprint tasks provide structured development workflow
- Context compression helps manage large codebases efficiently

---

*This template is part of AIWF's Claude Code integration. Version: 1.0.0*