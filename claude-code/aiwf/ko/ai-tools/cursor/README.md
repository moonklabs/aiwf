# Cursor AIWF Integration Template

## Overview

This template optimizes Cursor IDE for AIWF projects, providing deep integration with Feature Ledger, AI Personas, and Sprint Management systems. It enhances Cursor's AI capabilities with AIWF's structured development approach.

## Features

- **Multi-File Context Awareness**: Cursor understands AIWF's interconnected structure
- **Feature Ledger Integration**: Automatic feature tracking and referencing
- **AI Persona Optimization**: Context-aware code suggestions based on active persona
- **Sprint Task Tracking**: Real-time task status integration
- **Context Compression**: Efficient handling of large codebases
- **Composer Enhancement**: AIWF-aware prompts and completions

## Installation

```bash
# Install Cursor template
aiwf ai-tool install cursor

# Or manually copy template files
cp -r .aiwf/ai-tools/cursor/template/.cursorrules .
cp -r .aiwf/ai-tools/cursor/template/.cursor .
```

## Configuration

The template includes:

1. **.cursorrules**: Main configuration file
   - AIWF integration rules
   - Code generation patterns
   - Best practices
   - Project-specific guidelines

2. **.cursor/**: Directory for Cursor-specific settings
   - Context providers
   - Custom completions
   - AIWF shortcuts

## Usage

### 1. Feature-Aware Development

Cursor automatically:
- Checks Feature Ledger before suggesting implementations
- Includes feature IDs in generated code
- Maintains feature traceability

```javascript
// Start typing a function
// Cursor suggests:
/**
 * Feature: FL-001 - User Authentication
 * Task: T13_S03
 */
function authenticateUser(credentials) {
  // Feature-aware implementation
}
```

### 2. Composer Integration

Use AIWF context in Composer:

```
Composer> Implement the user profile feature following FL-002 specifications

Composer> Using architect persona, design the payment system architecture

Composer> Compress and analyze the authentication module for optimization
```

### 3. Multi-File Operations

Leverage Cursor's multi-file edit:

1. **Feature Implementation**
   - Opens feature file, implementation, tests together
   - Maintains consistency across files
   - Updates documentation automatically

2. **Sprint Task Completion**
   - Updates task status
   - Modifies related files
   - Commits with proper references

### 4. Context Management

Efficient context usage:

```javascript
// Large file handling
// @compress src/large-module.js
// Cursor automatically uses compressed version

// Feature reference
// @feature FL-001
// Cursor loads feature specification
```

### 5. AI Persona Integration

Switch personas for different contexts:

```javascript
// @persona architect
// Cursor provides architectural patterns and design suggestions

// @persona developer
// Cursor focuses on implementation details and optimization

// @persona reviewer
// Cursor highlights potential issues and suggests improvements
```

## Best Practices

### 1. Start with Context

Always provide AIWF context:

```javascript
/**
 * Working on: Sprint S03
 * Task: T13_S03 - AI Tool Integration
 * Feature: FL-010 - Tool Templates
 */
```

### 2. Use Feature References

Reference features in all code:

```javascript
// Good
import { UserAuth } from './features/FL001-auth'; // Feature: FL-001

// Avoid
import { UserAuth } from './auth'; // No feature reference
```

### 3. Maintain Task Flow

Follow task lifecycle:

```bash
# Start work
aiwf task start T13_S03

# During development (in Cursor)
// Task: T13_S03 - Status: in_progress

# Complete work
aiwf task complete T13_S03
```

### 4. Leverage Compression

For large files:

```bash
# Compress before including in context
aiwf context compress src/large-component.js

# Reference in Cursor
// @compressed large-component.js
```

## Advanced Features

### 1. Custom Context Providers

Create `.cursor/providers.json`:

```json
{
  "providers": [
    {
      "name": "feature-ledger",
      "path": ".aiwf/feature-ledger/",
      "pattern": "FL-*.json"
    },
    {
      "name": "current-sprint",
      "path": ".aiwf/03_SPRINTS/current/",
      "pattern": "*.md"
    }
  ]
}
```

### 2. AIWF Snippets

Define in `.cursor/snippets.json`:

```json
{
  "aiwf-feature": {
    "prefix": "aiwf-feat",
    "body": [
      "/**",
      " * Feature: FL-${1:XXX} - ${2:Feature Name}",
      " * Sprint: S${3:XX}",
      " * Task: T${4:XX}_S${3:XX}",
      " */"
    ]
  }
}
```

### 3. Workspace Settings

Configure `.cursor/settings.json`:

```json
{
  "aiwf": {
    "autoCheckFeatureLedger": true,
    "showTaskStatus": true,
    "enablePersonaHints": true,
    "contextCompression": {
      "threshold": 1000,
      "automatic": true
    }
  }
}
```

## Troubleshooting

### Common Issues

1. **Cursor not recognizing AIWF patterns**
   - Ensure .cursorrules is in project root
   - Restart Cursor to reload rules
   - Check file permissions

2. **Feature references missing**
   - Run `aiwf ledger sync`
   - Verify Feature Ledger structure
   - Update .cursorrules if needed

3. **Context overflow**
   - Use compression for large files
   - Reference features by ID
   - Clear unnecessary context

### Debug Mode

Enable AIWF debug in Cursor:

```json
{
  "aiwf.debug": true,
  "aiwf.logLevel": "verbose"
}
```

## Integration Tips

### 1. Composer Workflows

Effective Composer prompts:

```
"Implement FL-001 authentication with test coverage"
"Using reviewer persona, analyze the payment module"
"Update all files related to task T13_S03"
```

### 2. Multi-File Patterns

Common multi-file operations:

- Feature + Tests + Docs
- API Route + Controller + Service + Tests
- Component + Styles + Tests + Story

### 3. Context Optimization

Manage context efficiently:

- Use feature IDs instead of full descriptions
- Compress files over 1000 lines
- Reference ADRs by number
- Include only active sprint tasks

## Updates

Keep template synchronized:

```bash
# Check for updates
aiwf ai-tool check cursor

# Update template
aiwf ai-tool update cursor

# Verify installation
aiwf ai-tool verify cursor
```

## Resources

- [Cursor Documentation](https://cursor.sh/docs)
- [AIWF Documentation](https://aiwf.dev/docs)
- [Integration Guide](https://aiwf.dev/guides/cursor)
- [Community Forum](https://forum.aiwf.dev/cursor)

---

*Cursor Integration Template v1.0.0*