# aiwf compress-minimal-persona

Compresses context in minimal mode while considering the active persona.

## Execution

```javascript
const { spawn } = require('child_process');
const path = require('path');

// Execute command in the .aiwf directory
const cwd = path.join(process.cwd(), '.aiwf');
const proc = spawn('aiwf', [
  'compress',
  'minimal',
  '--persona'
], { cwd, stdio: 'inherit' });

proc.on('error', (err) => {
  console.error('Command execution failed:', err.message);
});
```

## Description

Performs minimal compression while considering persona characteristics. Maintains 10-30% low compression rate to preserve original content as much as possible.

### Compression Strategy

- 100% preservation of persona-related patterns
- Removes only duplicate content
- Cleans unnecessary whitespace and formatting
- Sections with above-average persona importance scores remain unchanged

## Suitable Use Cases

- Important technical documentation
- Detailed API documentation
- Security-related documents
- Data analysis reports

## Results

After compression, the following is guaranteed:
- All persona-related keywords preserved
- Document structure fully maintained
- Code blocks and examples preserved
- Tables and diagrams maintained