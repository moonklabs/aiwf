# aiwf compress-with-persona

Compresses context considering the active persona.

## Execution

```javascript
const { spawn } = require('child_process');
const path = require('path');

// Execute command in the .aiwf directory
const cwd = path.join(process.cwd(), '.aiwf');
const proc = spawn('aiwf', [
  'compress',
  'balanced',
  '--persona'
], { cwd, stdio: 'inherit' });

proc.on('error', (err) => {
  console.error('Command execution failed:', err.message);
});
```

## Description

Compresses context considering the characteristics of the currently active persona. Preserves patterns and keywords important to each persona while more aggressively compressing less relevant content.

### Persona-Specific Compression Strategies

- **Architect**: Preserves system design and architecture patterns
- **Security**: Fully preserves security warnings and vulnerability information
- **Frontend**: Preserves UI/UX descriptions and visual elements
- **Backend**: Preserves API specifications and database schemas
- **Data Analyst**: Fully preserves data descriptions and insights

## Usage Examples

```bash
# Persona-aware compression with default mode (balanced)
aiwf compress-with-persona

# Use with other compression modes
aiwf compress-aggressive-persona  # aggressive mode
aiwf compress-minimal-persona     # minimal mode
```

## Notes

- General compression is performed if no persona is active
- Compressed files are saved in the `.aiwf_compressed/` directory
- Persona-specific pattern preservation rates are included in the report