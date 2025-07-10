# Augment AIWF Integration Guide

## Overview

This guide configures Augment Code to deeply understand and work with AIWF projects. Augment's codebase comprehension and team collaboration features are enhanced with AIWF's structured approach.

## Core Integration Concepts

### 1. Deep Codebase Understanding

Augment learns your AIWF structure:
- **Feature Ledger**: Understands all features and their relationships
- **Sprint Tasks**: Knows current work and priorities
- **AI Personas**: Applies appropriate context based on personas
- **Architecture**: Comprehends system design through ADRs

### 2. Team Collaboration

AIWF + Augment enables:
- Shared understanding of features across team
- Task assignment based on expertise
- Consistent code patterns
- Automated knowledge sharing

### 3. Intelligent Assistance

Augment provides AIWF-aware help:
- Suggests relevant features for new code
- Warns about feature conflicts
- Recommends appropriate personas
- Tracks sprint progress

## Configuration

### Feature Ledger Integration

Augment automatically indexes:
```
.aiwf/feature-ledger/
├── FL-001-authentication.json
├── FL-002-user-profiles.json
└── feature-map.json
```

Understanding includes:
- Feature specifications
- Dependencies
- Implementation status
- Related code locations

### Sprint Awareness

Current sprint context:
```
.aiwf/03_SPRINTS/S03_M02_ecosystem_integration/
├── sprint_metadata.json
├── T13_S03_AI_도구_통합.md
└── sprint_goals.md
```

Augment knows:
- Active tasks
- Task assignments
- Progress status
- Acceptance criteria

### AI Persona Application

Available personas:
```
.aiwf/personas/
├── analyst.json
├── architect.json
├── developer.json
├── reviewer.json
└── tester.json
```

Augment applies persona-specific:
- Code suggestions
- Review criteria
- Documentation style
- Testing approaches

## Usage Patterns

### 1. Feature-Aware Coding

When writing code, Augment:
- Suggests feature references
- Validates against ledger
- Maintains consistency
- Updates documentation

Example:
```javascript
// Start typing a function
function processPayment() {
  // Augment suggests:
  // Feature: FL-003 - Payment Processing
  // Dependencies: FL-001 (Auth), FL-002 (User)
  // Sprint Task: T14_S03
}
```

### 2. Smart Code Completion

Context-aware suggestions:

```javascript
// When implementing authentication
user.authenticate() // Augment knows this relates to FL-001

// Suggests methods from feature spec:
user.validateCredentials()
user.generateToken()
user.setupTwoFactor()
```

### 3. Team Collaboration

Shared understanding:

```javascript
// Team member A implements feature
// @augment FL-001 implementation by @alice

// Team member B sees context
// Augment shows: "Alice implemented FL-001, see patterns in auth.js"
```

### 4. Automated Documentation

Augment generates:

```javascript
/**
 * Processes user payment
 * 
 * @feature FL-003 - Payment Processing
 * @sprint S03
 * @task T14_S03
 * @dependencies FL-001, FL-002
 * @augment-generated
 */
function processPayment(userId, amount) {
  // Implementation
}
```

### 5. Code Review Integration

During reviews, Augment:
- Checks feature compliance
- Validates sprint alignment
- Ensures persona guidelines
- Suggests improvements

## Best Practices

### 1. Feature First

Always start with feature context:
```
@augment explain FL-001
@augment show dependencies for current file
@augment validate against feature spec
```

### 2. Team Sync

Keep team aligned:
```
@augment share feature understanding
@augment show team progress on S03
@augment who worked on FL-001?
```

### 3. Sprint Focus

Stay on track:
```
@augment current sprint tasks
@augment my assigned tasks
@augment task progress T13_S03
```

### 4. Documentation

Let Augment help:
```
@augment document this function
@augment update feature docs
@augment generate API docs
```

## Advanced Features

### 1. Codebase Analysis

Deep understanding commands:

```
@augment analyze feature coverage
@augment find feature gaps
@augment suggest refactoring for FL-001
@augment architecture review
```

### 2. Test Generation

AIWF-aware testing:

```javascript
// @augment generate tests for FL-001
// Generates:
describe('Authentication Feature (FL-001)', () => {
  it('should validate credentials', () => {
    // Test based on feature spec
  });
  
  it('should handle 2FA', () => {
    // Test for feature requirement
  });
});
```

### 3. Refactoring Suggestions

Intelligent improvements:

```
@augment refactor for feature FL-001
// Suggests:
// - Extract authentication logic to service
// - Implement strategy pattern for auth methods
// - Add feature flag for gradual rollout
```

### 4. Knowledge Queries

Ask about your codebase:

```
@augment how does authentication work?
@augment what features depend on user service?
@augment show architecture for payment system
@augment who has expertise in FL-003?
```

## Team Features

### 1. Expertise Mapping

Augment tracks:
- Who implemented which features
- Domain expertise by team member
- Code ownership patterns
- Review participation

### 2. Task Assignment

Smart suggestions:
```
@augment who should implement T14_S03?
// Based on:
// - Feature expertise
// - Current workload
// - Past performance
```

### 3. Knowledge Transfer

Automated documentation:
```
@augment create onboarding guide for FL-001
@augment explain payment flow to new developer
@augment document team decisions on auth
```

### 4. Code Consistency

Team-wide patterns:
```
@augment show team coding patterns
@augment enforce style for FL-001
@augment suggest consistent naming
```

## Performance Optimization

### 1. Context Management

- Augment automatically compresses large contexts
- Prioritizes relevant features
- Caches frequently accessed data
- Optimizes for quick responses

### 2. Indexing Strategy

- Incremental indexing on file changes
- Priority indexing for active features
- Background indexing for full codebase
- Smart cache invalidation

### 3. Team Sync

- Efficient delta syncing
- Compressed knowledge transfer
- Lazy loading of team data
- Local caching of common queries

## Integration Commands

Quick reference:

```bash
# Feature commands
@augment feature list
@augment feature show FL-001
@augment feature validate

# Sprint commands
@augment sprint current
@augment sprint tasks
@augment sprint progress

# Team commands
@augment team status
@augment team expertise
@augment team assign T14_S03

# Analysis commands
@augment analyze codebase
@augment analyze dependencies
@augment analyze architecture
```

## Troubleshooting

### Common Issues

1. **Augment not recognizing features**
   - Run `@augment reindex features`
   - Check .augment/config.json
   - Verify feature ledger structure

2. **Team sync issues**
   - Check network connectivity
   - Verify team permissions
   - Run `@augment team sync --force`

3. **Slow performance**
   - Enable compression: `@augment config set compression true`
   - Clear cache: `@augment cache clear`
   - Reduce context size

### Debug Mode

Enable detailed logging:

```json
{
  "augment": {
    "debug": {
      "enabled": true,
      "verbose": true,
      "log_file": ".augment/debug.log"
    }
  }
}
```

## Best Practices Summary

1. **Always reference features** in code and commits
2. **Keep sprint tasks updated** as you work
3. **Use appropriate personas** for different tasks
4. **Leverage team features** for collaboration
5. **Let Augment generate** documentation
6. **Trust codebase analysis** for decisions
7. **Share knowledge** through Augment
8. **Maintain feature specs** for accuracy

---

*Augment AIWF Integration v1.0.0*