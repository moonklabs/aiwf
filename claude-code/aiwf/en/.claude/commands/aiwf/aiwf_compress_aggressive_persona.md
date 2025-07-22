# aiwf compress-aggressive-persona

Compresses context in aggressive mode while considering the active persona.

## Execution

```javascript
const { spawn } = require('child_process');
const path = require('path');

// Execute command in the .aiwf directory
const cwd = path.join(process.cwd(), '.aiwf');
const proc = spawn('aiwf', [
  'compress',
  'aggressive',
  '--persona'
], { cwd, stdio: 'inherit' });

proc.on('error', (err) => {
  console.error('Command execution failed:', err.message);
});
```

## Description

Targets 50-70% compression rate while preserving persona-specific core information. Aggressively summarizes non-essential content while maintaining persona-relevant patterns.

### Features

- Persona-centric summary generation
- Preserves only essential patterns
- Replaces low-priority sections with summaries
- Applies persona-specific summarization focus

## Compression Results

After compression, persona-specific summaries are added at the document bottom:

```markdown
---
### [Persona Name] Perspective Summary

Key Points ([Persona's focus]):
- Core point 1
- Core point 2
- ...
---
```

## Important Notes

- Very high compression rate may result in loss of some details
- Backup important documents before use is recommended