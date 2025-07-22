# aiwf evaluate

Simply evaluate AI response quality.

## Execution

```javascript
const { spawn } = require('child_process');
const path = require('path');

// Execute command in the .aiwf directory
const cwd = path.join(process.cwd(), '.aiwf');
const args = process.argv.slice(2); // Pass additional arguments

const proc = spawn('aiwf', [
  'evaluate',
  ...args
], { cwd, stdio: 'inherit' });

proc.on('error', (err) => {
  console.error('Command execution failed:', err.message);
});
```

## Description

A lightweight evaluation system to monitor AI response quality. By default, it runs automatically in the background and displays detailed information only when needed.

## Usage Options

### Basic Usage (Quick Evaluation)
```bash
aiwf evaluate
```
Simply displays recent evaluation statistics for the current persona.

### Detailed Analysis
```bash
aiwf evaluate --detailed
# or
aiwf evaluate -d
```
Displays detailed statistics and improvement suggestions for all personas.

### Evaluation History
```bash
aiwf evaluate --history
# or
aiwf evaluate -h
```
Displays the last 10 evaluation records in chronological order.

### Weekly Statistics
```bash
aiwf evaluate --stats
# or
aiwf evaluate -s
```
Displays weekly evaluation statistics and persona utilization.

## Automatic Evaluation System

While this command can be run manually, background evaluation is automatically performed in the following situations:

- When switching personas
- When compressing context
- After AI response generation (future implementation)

Feedback is only displayed automatically when the evaluation score falls below 60%, ensuring it doesn't interrupt your workflow.

## Evaluation Criteria

### 3 Core Metrics
1. **Role Alignment (50%)**: Degree of persona characteristics reflection
2. **Task Relevance (30%)**: Relevance to requested task
3. **Basic Quality (20%)**: Response structure and content

### Score Interpretation
- 80% or higher: Excellent 🎉
- 60-79%: Good ✅
- Below 60%: Needs improvement 💡

## Example Output

```
🔍 Recent Response Evaluation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Current persona: architect
Average score: 0.75
Evaluations: 23
Trend: 📈 Improving
```