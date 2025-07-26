# Check Persona Status

Displays the status of the currently active AI persona.

## Usage
```bash
cd .aiwf && node ../claude-code/aiwf/en/commands/ai-persona.js status
```

## Persona Context Application

This command displays the current persona context status, showing which expert mode is active and its configuration details.

## Display Information

The command shows:
- Current active persona name
- Persona description and expertise area
- Activation time
- Usage statistics (usage count, average session time)
- Key behavior characteristics
- Active context rules

## Output Format
```
🎭 AI Persona Status
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Current Persona: [Persona Name]
Description: [Persona Description]
Active Time: [Time]

Key Behaviors:
• [Behavior 1]
• [Behavior 2]
• [Behavior 3]

Context Rules:
• [Rule 1]
• [Rule 2]
• [Rule 3]

Usage Statistics:
• Total Usage: [Count]
• Average Session Time: [Time]
• Last Used: [Date/Time]
```

## Available Personas
- `architect` - System architecture expert
- `security` - Security expert
- `frontend` - Frontend development expert
- `backend` - Backend development expert
- `data_analyst` - Data analysis expert

## Context Rule Categories

### Primary Focus
The main area of expertise and decision-making priorities

### Communication Style
How the AI communicates and presents information

### Problem-Solving Approach
The systematic approach to tackling problems

## Related Commands
- `/project:aiwf:architect` - Activate Architect persona
- `/project:aiwf:security` - Activate Security persona
- `/project:aiwf:frontend` - Activate Frontend persona
- `/project:aiwf:backend` - Activate Backend persona
- `/project:aiwf:data_analyst` - Activate Data Analyst persona
- `/project:aiwf:default_mode` - Restore to default mode