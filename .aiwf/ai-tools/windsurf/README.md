# Windsurf AIWF Integration Template

## Overview

This template provides deep integration between Windsurf IDE and the AI Workflow Framework (AIWF). It leverages Windsurf's Cascade AI and flow-based development to create a seamless AIWF development experience.

## Features

- **Cascade AI + AIWF**: AI-powered development with AIWF context awareness
- **Flow-Based Task Management**: Visual task flows aligned with sprint tasks  
- **Multi-Agent Personas**: Different AI agents for different development contexts
- **Automatic Context Management**: Smart compression and loading
- **Visual Progress Tracking**: See AIWF task progress in Windsurf's UI
- **Integrated Feature Validation**: Real-time Feature Ledger checking

## Installation

```bash
# Install Windsurf template
aiwf ai-tool install windsurf

# Or manually copy template files
cp -r .aiwf/ai-tools/windsurf/template/* .
```

## Configuration

The template includes:

1. **windsurf.config.json**: Main configuration
   - AIWF integration settings
   - Cascade AI configuration
   - Automation rules
   - Keyboard shortcuts

2. **.windsurf/aiwf-rules.md**: Integration rules
   - Code generation patterns
   - Flow templates
   - Best practices
   - Context management

## Usage

### 1. Cascade AI with AIWF Context

Use Cascade with AIWF awareness:

```
@cascade Show me feature FL-001 implementation status

@cascade Using architect persona, design the payment system

@cascade What tasks are in the current sprint?

@cascade Implement task T13_S03 following acceptance criteria
```

### 2. Flow-Based Development

Create AIWF-aligned flows:

**Start a Feature Flow**:
```
@cascade start-flow --feature FL-001 --task T13_S03
```

Windsurf creates a flow with:
- Feature validation
- Implementation steps
- Test requirements
- Documentation updates
- Task completion

### 3. AI Persona Switching

Different agents for different tasks:

```javascript
// @persona architect
// Cascade switches to architecture-focused responses

// @persona developer
// Cascade provides implementation details

// @persona reviewer  
// Cascade analyzes code quality
```

### 4. Visual Task Management

See AIWF tasks in Windsurf UI:
- Current sprint tasks in sidebar
- Task progress indicators
- Feature dependencies graph
- Real-time status updates

### 5. Smart Context Loading

Automatic context management:

```javascript
// @load-feature FL-001
// Loads feature spec into context

// @load-sprint
// Loads current sprint tasks

// @compress-context
// Compresses large files automatically
```

## Windsurf-Specific Features

### 1. Flow Templates

Pre-built AIWF flows:

**Feature Implementation Flow**:
- Validates against Feature Ledger
- Creates implementation structure
- Generates tests
- Updates documentation
- Completes task

**Bug Fix Flow**:
- Identifies related feature
- Implements fix
- Adds regression tests
- Updates feature status

**Architecture Flow**:
- Uses architect persona
- Creates ADR
- Updates system design
- Validates with ledger

### 2. Multi-Agent Collaboration

Cascade agents by persona:

```json
{
  "agents": {
    "architect": {
      "model": "cascade-architect",
      "focus": "design patterns, system architecture"
    },
    "developer": {
      "model": "cascade-large",
      "focus": "implementation, optimization"
    },
    "reviewer": {
      "model": "cascade-reviewer",
      "focus": "code quality, security"
    }
  }
}
```

### 3. Keyboard Shortcuts

Quick AIWF actions:

- `Cmd+Shift+F`: Check Feature Ledger
- `Cmd+Shift+T`: Update task status
- `Cmd+Shift+P`: Switch persona
- `Cmd+Shift+C`: Compress context
- `Cmd+Shift+S`: Show sprint tasks

### 4. Automation Features

Automatic workflows:

- **Task Status**: Updates based on file changes
- **Documentation**: Syncs docs with code
- **Feature Validation**: Checks on save
- **Context Compression**: For large files
- **Test Running**: On task completion

## Best Practices

### 1. Flow-First Development

Start with flows:

```
@cascade create-flow --type feature --id FL-001
```

### 2. Context Efficiency

Manage context smartly:

```javascript
// Good - Reference by ID
// @feature FL-001

// Avoid - Full feature description
// @feature "Complete user authentication system with OAuth..."
```

### 3. Progressive Enhancement

Build incrementally:

1. Start with feature validation
2. Implement core functionality
3. Add tests progressively
4. Update documentation
5. Complete task

### 4. Visual Feedback

Use Windsurf's UI:
- Check flow progress visually
- Monitor task status in sidebar
- View feature dependencies
- Track sprint progress

## Advanced Configuration

### 1. Custom Flow Templates

Create `.windsurf/flows/`:

```json
{
  "name": "api-endpoint",
  "steps": [
    "validate-feature",
    "create-route",
    "implement-controller",
    "add-validation",
    "write-tests",
    "update-docs"
  ]
}
```

### 2. Cascade Fine-Tuning

Configure AI behavior:

```json
{
  "cascade": {
    "temperature": {
      "architect": 0.7,
      "developer": 0.3,
      "reviewer": 0.1
    },
    "max_tokens": {
      "design": 2000,
      "implementation": 5000,
      "review": 1000
    }
  }
}
```

### 3. Integration Hooks

Add to `windsurf.config.json`:

```json
{
  "hooks": {
    "pre-commit": "aiwf task validate",
    "post-save": "aiwf ledger sync",
    "flow-complete": "aiwf task complete"
  }
}
```

## Troubleshooting

### Common Issues

1. **Cascade not recognizing AIWF**
   - Check windsurf.config.json
   - Verify AIWF rules loaded
   - Restart Windsurf

2. **Flow not updating tasks**
   - Ensure task ID is correct
   - Check automation settings
   - Verify permissions

3. **Context overflow**
   - Enable auto-compression
   - Clear old context
   - Use feature references

### Debug Mode

Enable debugging:

```json
{
  "debug": {
    "aiwf": true,
    "cascade": true,
    "flows": true
  }
}
```

## Performance Tips

### 1. Context Optimization

- Compress files > 1000 lines
- Use feature IDs not descriptions  
- Clear context between tasks
- Cache frequently used features

### 2. Flow Efficiency

- Create reusable flow templates
- Use checkpoints for long flows
- Parallelize independent steps
- Cache flow results

### 3. Cascade Optimization

- Use appropriate model sizes
- Batch similar requests
- Cache common queries
- Minimize context switches

## Updates

Stay current:

```bash
# Check for updates
aiwf ai-tool check windsurf

# Update template
aiwf ai-tool update windsurf

# Verify integration
aiwf ai-tool verify windsurf
```

## Resources

- [Windsurf Documentation](https://windsurf.ai/docs)
- [AIWF Documentation](https://aiwf.dev/docs)
- [Cascade AI Guide](https://windsurf.ai/cascade)
- [Community Forum](https://forum.aiwf.dev/windsurf)

---

*Windsurf Integration Template v1.0.0*