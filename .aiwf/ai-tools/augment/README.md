# Augment AIWF Integration Template

## Overview

This template integrates Augment Code's deep codebase understanding and team collaboration features with AIWF's structured development framework. It creates a powerful combination for AI-assisted team development.

## Features

- **Deep Codebase Understanding**: Augment comprehends your entire AIWF structure
- **Team Collaboration**: Shared feature knowledge and task coordination
- **Intelligent Code Completion**: Context-aware suggestions based on features
- **Automated Documentation**: Generate docs aligned with AIWF standards
- **Smart Refactoring**: Feature-aware code improvements
- **Knowledge Queries**: Ask questions about your AIWF project

## Installation

```bash
# Install Augment template
aiwf ai-tool install augment

# Or manually copy template files
cp -r .aiwf/ai-tools/augment/template/* .
```

## Configuration

The template includes:

1. **augment.config.json**: Main configuration
   - AIWF integration settings
   - Team collaboration options
   - AI model preferences
   - Automation rules

2. **.augment/aiwf-integration.md**: Integration guide
   - Usage patterns
   - Team features
   - Best practices
   - Command reference

## Core Capabilities

### 1. Feature-Aware Development

Augment understands your Feature Ledger:

```javascript
// Start typing code
function createUser() {
  // Augment suggests:
  // This relates to Feature FL-002 - User Management
  // Dependencies: FL-001 (Authentication)
  // Current status: in_progress
}
```

### 2. Team Knowledge Sharing

Share understanding across your team:

```
@augment who implemented authentication?
// Alice implemented FL-001 last week

@augment show alice's patterns for error handling
// Shows consistent patterns from Alice's code
```

### 3. Sprint Task Management

Stay aligned with sprints:

```
@augment my current tasks
// T13_S03 - AI Tool Integration (in_progress)
// T14_S03 - Performance Optimization (pending)

@augment suggest next task
// Based on your expertise and dependencies
```

### 4. Intelligent Documentation

Auto-generate AIWF-compliant docs:

```javascript
// @augment document this class
/**
 * UserService handles user management operations
 * 
 * @feature FL-002 - User Management
 * @sprint S03
 * @implements Requirements from FL-002 specification
 * @dependencies FL-001 (Authentication)
 * 
 * @example
 * const userService = new UserService();
 * const user = await userService.createUser(data);
 */
class UserService {
  // Implementation
}
```

## Usage Examples

### 1. Feature Development

```javascript
// @augment implement FL-003 payment processing

// Augment provides:
// - Feature specification summary
// - Required methods from spec
// - Integration points with other features
// - Test requirements
// - Documentation template
```

### 2. Code Review

```javascript
// @augment review this PR for FL-001 compliance

// Augment checks:
// ✓ Implements all required features
// ✓ Follows team patterns
// ✓ Has appropriate tests
// ⚠ Missing error handling for edge case X
// ⚠ Consider using established pattern from auth.js
```

### 3. Refactoring

```javascript
// @augment refactor payment module for better feature separation

// Augment suggests:
// 1. Extract FL-003 logic to PaymentService
// 2. Move FL-001 auth checks to middleware
// 3. Create feature flags for gradual rollout
// 4. Add monitoring for new architecture
```

### 4. Knowledge Queries

```
@augment how does our authentication flow work?
// Augment explains FL-001 implementation with code examples

@augment what depends on the user service?
// Features: FL-003 (payments), FL-004 (notifications)
// Files: 15 controllers, 8 services, 23 tests

@augment show architecture diagram
// Generates visual representation of feature dependencies
```

## Team Collaboration Features

### 1. Expertise Mapping

```
@augment team expertise
// Alice: FL-001 (auth), FL-002 (users) - Senior
// Bob: FL-003 (payments), FL-005 (analytics) - Expert
// Carol: FL-004 (notifications) - Intermediate
```

### 2. Task Assignment

```
@augment assign T14_S03
// Recommends: Bob (payment expertise, available capacity)
// Alternative: Alice (general expertise, higher load)
```

### 3. Code Patterns

```
@augment show team patterns for error handling
// Consistent patterns across team:
// - Custom error classes per feature
// - Centralized error logging
// - User-friendly error messages
```

### 4. Onboarding

```
@augment create onboarding guide for new developer
// Generates comprehensive guide:
// - Project structure
// - Feature overview
// - Team patterns
// - Development workflow
// - Key architecture decisions
```

## Advanced Features

### 1. Codebase Analysis

```
@augment analyze feature coverage
// FL-001: 95% implemented, 90% tested
// FL-002: 80% implemented, 85% tested
// FL-003: 60% implemented, 70% tested

@augment find technical debt
// - Duplicated auth logic in 3 files
// - Missing tests for edge cases in FL-002
// - Outdated dependencies in payment module
```

### 2. Architecture Insights

```
@augment analyze architecture
// - Clean separation between features
// - Some circular dependencies detected
// - Opportunity to extract shared utilities
// - Consider implementing event system
```

### 3. Performance Analysis

```
@augment analyze performance bottlenecks
// - Database queries in user service (N+1)
// - Synchronous payment processing
// - Large bundle size from unused imports
```

### 4. Test Generation

```javascript
// @augment generate tests for UserService

describe('UserService (FL-002)', () => {
  // Generates comprehensive test suite
  // based on feature specifications
});
```

## Best Practices

### 1. Feature-First Approach

Always start with feature context:
- Check Feature Ledger before coding
- Reference features in all code
- Update feature status regularly

### 2. Team Alignment

Leverage team features:
- Share knowledge through Augment
- Follow team patterns
- Document decisions

### 3. Sprint Discipline

Stay focused on current work:
- Check sprint tasks daily
- Update progress regularly
- Complete tasks fully

### 4. Continuous Learning

Let Augment teach:
- Ask about unfamiliar code
- Learn team patterns
- Understand architecture

## Configuration Options

### 1. Model Selection

```json
{
  "models": {
    "completion": "augment-fast",      // Quick suggestions
    "understanding": "augment-deep",   // Complex analysis
    "documentation": "augment-doc",    // Doc generation
    "review": "augment-review"         // Code review
  }
}
```

### 2. Team Settings

```json
{
  "team": {
    "sync_interval": "5m",
    "share_patterns": true,
    "expertise_tracking": true,
    "automated_assignment": false
  }
}
```

### 3. Automation

```json
{
  "automation": {
    "auto_document": true,
    "suggest_refactoring": true,
    "update_feature_status": true,
    "generate_tests": false
  }
}
```

## Troubleshooting

### Common Issues

1. **Slow indexing**
   ```
   @augment config set indexing.incremental true
   @augment reindex --fast
   ```

2. **Team sync problems**
   ```
   @augment team sync --reset
   @augment team verify
   ```

3. **Feature recognition**
   ```
   @augment feature reindex
   @augment feature validate
   ```

### Performance Tips

1. Enable caching for faster responses
2. Use incremental indexing
3. Compress large contexts
4. Limit analysis scope when needed

## Updates

Keep Augment template current:

```bash
# Check version
aiwf ai-tool version augment

# Update template
aiwf ai-tool update augment

# Verify installation
aiwf ai-tool verify augment
```

## Resources

- [Augment Documentation](https://augmentcode.com/docs)
- [AIWF Documentation](https://aiwf.dev/docs)
- [Integration Examples](https://github.com/aiwf/augment-examples)
- [Team Playbook](https://aiwf.dev/guides/team-collaboration)

---

*Augment Integration Template v1.0.0*