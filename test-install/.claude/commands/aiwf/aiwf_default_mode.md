# Restore Default Mode

Restores AI to default mode.

## Usage
```bash
cd .aiwf && node ../claude-code/aiwf/en/commands/ai-persona.js default
```

## Persona Context Application

This command deactivates any active persona context and restores the AI to its default general-purpose mode.

## Actions Performed

- Deactivate current persona
- Remove persona-specific context rules
- Clear specialized behavior patterns
- Switch to default AI behavior mode
- Save session statistics

## Usage Scenarios

- When specific persona is no longer needed
- Returning to general development tasks
- Before switching to another persona
- When troubleshooting persona-related issues
- Resetting AI behavior to baseline

## Output Example
```
🎭 Persona Mode Deactivated
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Previous Persona: [Persona Name]
Session Time: [Time]
Context Rules Removed: [Count]
Restored to default mode.
```

## Default Mode Characteristics

### General Purpose AI
- Balanced approach to all tasks
- No specialized context rules
- Standard communication style
- Flexible problem-solving

### Available Capabilities
- All AI features remain accessible
- Can handle any type of request
- No domain-specific biases
- Ready for persona activation

## Notes
- Persona session statistics are automatically saved
- You can activate any other persona at any time
- Default mode is the baseline AI behavior
- No performance impact in default mode

## Related Commands
- `/project:aiwf:persona_status` - Check persona status
- `/project:aiwf:architect` - Activate Architect persona
- `/project:aiwf:security` - Activate Security persona
- `/project:aiwf:frontend` - Activate Frontend persona
- `/project:aiwf:backend` - Activate Backend persona
- `/project:aiwf:data_analyst` - Activate Data Analyst persona