# aiwf compress-stats

Check compression statistics by persona.

## Execution

```javascript
const { spawn } = require('child_process');
const path = require('path');

// Execute command in the .aiwf directory
const cwd = path.join(process.cwd(), '.aiwf');
const proc = spawn('aiwf', [
  'compress',
  '--stats'
], { cwd, stdio: 'inherit' });

proc.on('error', (err) => {
  console.error('Command execution failed:', err.message);
});
```

## Description

View compression statistics by persona and the compression strategy for the currently active persona.

### Information Provided

1. **Current Persona Information**
   - Active persona name
   - Compression strategy details
   - Preserved pattern list

2. **Compression History Statistics**
   - Average compression rate by persona
   - Compression performance comparison

## Usage

- Compare compression efficiency by persona
- Select optimal compression mode
- Identify compression strategy improvements