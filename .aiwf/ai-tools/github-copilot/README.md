# GitHub Copilot AIWF Integration Template

## Overview

This template configures GitHub Copilot to work seamlessly with the AI Workflow Framework (AIWF), ensuring code suggestions align with AIWF patterns and conventions.

## Features

- **Feature Ledger Awareness**: Copilot suggestions reference existing features
- **Sprint Task Integration**: Code generation aligned with current sprint tasks
- **AI Persona Patterns**: Different coding styles based on active persona
- **AIWF Snippets**: Quick access to common AIWF commands and patterns
- **Automatic Documentation**: Feature and task references in generated code

## Installation

```bash
# Install GitHub Copilot template
aiwf ai-tool install github-copilot

# Or manually copy template files
cp -r .aiwf/ai-tools/github-copilot/template/.github .
```

## Configuration

The template includes:

1. **copilot-instructions.md**: Main configuration for Copilot behavior
   - AIWF structure documentation
   - Coding guidelines
   - Pattern examples
   - Integration commands

## Usage

### 1. Feature-Aware Suggestions

Copilot will automatically:
- Check Feature Ledger before suggesting new implementations
- Include feature IDs in documentation
- Reference related features in comments

```javascript
// Copilot will suggest:
/**
 * Implements user profile management
 * @feature FL002 - User Profile System
 * @related FL001 - User Authentication System
 */
```

### 2. Sprint Task Context

When working on sprint tasks:

```javascript
// Type: "Implement task T13_S03"
// Copilot will generate task-aware code:

// Task: T13_S03 - AI Tool Integration
// Status: in_progress
// Acceptance Criteria: Create tool templates

async function createToolTemplate(toolName) {
  // Implementation following task requirements
}
```

### 3. Persona-Based Patterns

Activate different coding styles:

```javascript
// Comment: "Using architect persona"
// Copilot suggests design patterns and architecture

// Comment: "Using developer persona"  
// Copilot suggests implementation details

// Comment: "Using reviewer persona"
// Copilot suggests validation and security checks
```

### 4. AIWF Command Snippets

Type AIWF commands in comments for quick suggestions:

```javascript
// aiwf ledger -> Suggests feature ledger operations
// aiwf sprint -> Suggests sprint management code
// aiwf task -> Suggests task update patterns
```

## Best Practices

1. **Start with Comments**: Begin files with AIWF metadata comments
2. **Use Feature Tags**: Include @feature tags in function documentation
3. **Reference Tasks**: Add task IDs when implementing sprint work
4. **Update Status**: Include task status updates in your workflow
5. **Maintain Traceability**: Keep clear links between code and AIWF elements

## Customization

### Project-Specific Instructions

Add to `.github/copilot-instructions.md`:

```markdown
## Project-Specific Rules

- Use TypeScript for all new files
- Follow REST API conventions
- Implement comprehensive logging
```

### Custom Snippets

Define project-specific patterns:

```markdown
### Custom Patterns

**Service Implementation**:
```javascript
// Pattern: AIWF Service
// Feature: FL-[ID]
export class ${ServiceName}Service {
  constructor(private ledger: FeatureLedger) {}
}
```

## Tips for Effective Use

1. **Comment-Driven Development**
   - Start with descriptive comments
   - Include AIWF references
   - Let Copilot expand on your intent

2. **Feature Checking**
   - Always verify against Feature Ledger
   - Avoid duplicating existing features
   - Link related implementations

3. **Task Alignment**
   - Keep implementations focused on current task
   - Reference acceptance criteria
   - Update task status regularly

4. **Persona Switching**
   - Use appropriate personas for different tasks
   - Architect for design decisions
   - Developer for implementation
   - Reviewer for quality checks

## Troubleshooting

### Common Issues

1. **Copilot not recognizing AIWF patterns**
   - Ensure copilot-instructions.md is in .github/
   - Restart your IDE
   - Check file permissions

2. **Incorrect feature references**
   - Update Feature Ledger cache: `aiwf ledger sync`
   - Verify feature IDs in comments

3. **Missing sprint context**
   - Run `aiwf sprint current` to verify active sprint
   - Include sprint ID in file headers

## Integration with Other Tools

- **VS Code**: Works automatically with Copilot extension
- **JetBrains IDEs**: Configure in Copilot settings
- **Neovim**: Use copilot.vim with AIWF paths

## Updates

Keep your template updated:

```bash
aiwf ai-tool update github-copilot
```

## Resources

- [GitHub Copilot Docs](https://docs.github.com/copilot)
- [AIWF Documentation](https://aiwf.dev/docs)
- [Integration Examples](https://github.com/aiwf/examples)

---

*GitHub Copilot Integration Template v1.0.0*