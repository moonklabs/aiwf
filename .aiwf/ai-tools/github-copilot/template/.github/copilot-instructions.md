# GitHub Copilot Instructions for AIWF Project

## Project Context

This project uses the AI Workflow Framework (AIWF) for structured AI-assisted development. Copilot should understand and work with AIWF conventions.

## AIWF Structure

```
.aiwf/
├── feature-ledger/      # Feature tracking system
├── personas/            # AI persona definitions
├── 03_SPRINTS/         # Sprint organization
└── 99_TEMPLATES/       # Project templates
```

## Coding Guidelines

### 1. Feature References

Always reference Feature Ledger IDs in:
- Function documentation
- Commit messages  
- TODO comments

Example:
```javascript
/**
 * Implements user authentication
 * @feature FL001 - User Authentication System
 */
function authenticateUser(credentials) {
  // Implementation
}
```

### 2. Sprint Task Integration

When implementing sprint tasks:
- Reference task ID in comments
- Update task status after completion
- Follow task acceptance criteria

Example:
```javascript
// Task: T13_S03 - AI Tool Integration
// Implementing Claude Code template configuration
```

### 3. AI Persona Patterns

Use persona-specific patterns:

**Architect Persona**:
- Focus on system design patterns
- Emphasize scalability and maintainability
- Document architectural decisions

**Developer Persona**:
- Implement clean, efficient code
- Follow SOLID principles
- Add comprehensive error handling

**Reviewer Persona**:
- Check for security vulnerabilities
- Verify performance implications
- Ensure code quality standards

### 4. Code Generation Rules

1. **Always check Feature Ledger first**
   - Don't duplicate existing features
   - Reference related features in comments

2. **Follow AIWF conventions**
   - Use standardized file naming
   - Maintain consistent structure
   - Update relevant documentation

3. **Include AIWF metadata**
   ```javascript
   // AIWF Metadata
   // Feature: FL001
   // Sprint: S03
   // Task: T13_S03
   // Persona: developer
   ```

### 5. Snippets and Shortcuts

**Feature Ledger Check**:
```javascript
// TODO: Check Feature Ledger for existing implementation
// aiwf ledger search <feature-name>
```

**Task Status Update**:
```javascript
// Task completed: Update status
// aiwf task complete <task-id>
```

**Persona Activation**:
```javascript
// Switching to architect persona for design
// aiwf persona use architect
```

## Best Practices

1. **Feature-First Development**
   - Always start by checking the Feature Ledger
   - Create new ledger entries for new features
   - Update feature status as you progress

2. **Sprint Alignment**
   - Keep code aligned with current sprint goals
   - Reference sprint tasks in implementations
   - Update task logs regularly

3. **Documentation Standards**
   - Include AIWF references in all documentation
   - Link to relevant ADRs
   - Maintain feature traceability

4. **Testing Integration**
   - Test features according to ledger specifications
   - Verify persona-specific requirements
   - Ensure sprint acceptance criteria are met

## Common Patterns

### Feature Implementation Pattern
```javascript
// Feature: FL-[ID] - [Name]
// Sprint: S[XX]
// Task: T[XX]_S[XX]

import { FeatureLedger } from '@aiwf/core';

export class NewFeature {
  constructor() {
    this.featureId = 'FL-[ID]';
    this.validateAgainstLedger();
  }
  
  validateAgainstLedger() {
    const ledger = new FeatureLedger();
    return ledger.validateFeature(this.featureId);
  }
}
```

### Sprint Task Pattern
```javascript
// Sprint Task: T[XX]_S[XX]
// Status: in_progress
// Started: [timestamp]

async function implementTask() {
  // Update task status
  await aiwf.task.updateStatus('T[XX]_S[XX]', 'in_progress');
  
  // Implementation
  
  // Complete task
  await aiwf.task.updateStatus('T[XX]_S[XX]', 'completed');
}
```

## Integration Commands

Quick reference for AIWF commands to use in comments:

```bash
# Feature Ledger
aiwf ledger list
aiwf ledger show <id>
aiwf ledger add

# Sprint Management  
aiwf sprint current
aiwf sprint tasks
aiwf task start <id>
aiwf task complete <id>

# AI Personas
aiwf persona list
aiwf persona use <name>
```

## Copilot Behavior Customization

1. **Prioritize AIWF patterns** in suggestions
2. **Include feature references** in generated code
3. **Follow sprint structure** for task implementations
4. **Apply persona-specific** coding styles
5. **Maintain traceability** through comments and documentation

---

*This instruction set is part of AIWF's GitHub Copilot integration. Version: 1.0.0*