# Windsurf AIWF Integration Rules

## Overview

These rules configure Windsurf IDE to work seamlessly with the AI Workflow Framework (AIWF), leveraging Windsurf's Cascade AI and flow-based development features.

## Core Integration Principles

### 1. Feature-Driven Flow

Every development flow in Windsurf should:
- Start with Feature Ledger validation
- Reference feature IDs throughout the flow
- Update feature status upon completion
- Maintain feature dependency tracking

### 2. Cascade + AIWF Synergy

Leverage Cascade AI with AIWF context:
- Cascade understands Feature Ledger structure
- AI suggestions align with current sprint tasks
- Persona-based responses for different contexts
- Automatic context compression for large files

### 3. Sprint Task Flow

Windsurf flows are aligned with sprint tasks:
- Each flow corresponds to a sprint task
- Task status updates automatically
- Acceptance criteria guide the flow
- Progress tracked in real-time

## Windsurf-Specific Features

### 1. Cascade Prompts with AIWF Context

```
@cascade implement feature FL-001 following the ledger specification

@cascade using architect persona, design the system architecture

@cascade check current sprint tasks and suggest next steps
```

### 2. Flow Templates

**Feature Implementation Flow**:
1. Check Feature Ledger
2. Verify dependencies
3. Implement with tests
4. Update documentation
5. Complete task status

**Sprint Task Flow**:
1. Load task details
2. Review acceptance criteria
3. Implement solution
4. Run tests
5. Update task log

### 3. Multi-Agent Collaboration

Different Cascade agents for different personas:
- **Architect Agent**: System design and patterns
- **Developer Agent**: Implementation and optimization
- **Reviewer Agent**: Code quality and security
- **Tester Agent**: Test scenarios and validation

## Code Generation Rules

### Feature Reference Pattern

```javascript
/**
 * @flow Feature Implementation
 * @feature FL-XXX - Feature Name
 * @sprint S##
 * @task T##_S##
 * @cascade-model cascade-large
 */

import { FeatureLedger } from '@aiwf/core';

class FeatureImplementation {
  featureId = 'FL-XXX';
  
  constructor() {
    this.validateWithLedger();
  }
  
  async validateWithLedger() {
    const ledger = new FeatureLedger();
    const feature = await ledger.getFeature(this.featureId);
    // Validate implementation against specification
  }
}
```

### Flow Metadata

```javascript
// @flow-start Task Implementation
// @windsurf-flow-id: T##_S##
// @aiwf-context: {
//   "feature": "FL-XXX",
//   "sprint": "S##",
//   "persona": "developer"
// }

// Implementation follows...

// @flow-end Update task status to completed
```

## Cascade Configuration

### Model Selection by Task Type

```javascript
// @cascade-config
{
  "feature_design": {
    "model": "cascade-architect",
    "persona": "architect",
    "context": ["feature-ledger", "adrs"]
  },
  "implementation": {
    "model": "cascade-large",
    "persona": "developer",
    "context": ["current-task", "related-features"]
  },
  "review": {
    "model": "cascade-reviewer",
    "persona": "reviewer",
    "context": ["code-changes", "test-results"]
  }
}
```

## Context Management

### Automatic Compression

Files over 1000 lines are automatically compressed:

```javascript
// @windsurf-compress auto
// Large file will be compressed for context efficiency
// Original: 5000 lines -> Compressed: 500 tokens
```

### Feature Context Loading

```javascript
// @load-feature FL-001
// Automatically loads feature specification into context

// @load-sprint-context
// Loads current sprint and active tasks

// @load-persona architect
// Switches to architect persona context
```

## Workflow Automation

### Task Status Updates

```javascript
// @auto-task-status
// Windsurf automatically updates task status based on:
// - File saves (in_progress)
// - Test completion (testing)
// - All tests passing (review)
// - PR merged (done)
```

### Documentation Sync

```javascript
// @auto-doc-sync
// Changes to implementation automatically update:
// - Feature documentation
// - API documentation  
// - README files
// - ADRs if architectural changes
```

## Best Practices

### 1. Flow Initialization

Always start flows with:
```
@cascade init-aiwf-flow --task T##_S## --feature FL-XXX
```

### 2. Context Optimization

Keep context focused:
- Load only relevant features
- Use compressed versions of large files
- Reference by ID when possible
- Clear context between major tasks

### 3. Persona Switching

Use appropriate personas:
```
@cascade switch-persona architect
// For design decisions

@cascade switch-persona developer  
// For implementation

@cascade switch-persona reviewer
// For code review
```

### 4. Progress Tracking

Maintain flow progress:
```
@cascade flow-progress
// Shows current task progress and remaining steps

@cascade flow-checkpoint
// Saves current state for later continuation
```

## Integration Commands

Quick commands for Windsurf command palette:

- `AIWF: Check Feature` - Validate against Feature Ledger
- `AIWF: Update Task` - Update current task status
- `AIWF: Switch Persona` - Change active AI persona
- `AIWF: Compress Context` - Compress current file
- `AIWF: Load Sprint` - Load current sprint context
- `AIWF: Flow Status` - Show current flow progress

## Prohibited Actions

- NO skipping Feature Ledger validation
- NO implementing without task assignment
- NO merging without updating task status
- NO ignoring sprint boundaries
- NO bypassing test requirements

## Windsurf + AIWF Advantages

1. **Flow-Based Development**: Natural alignment with AIWF's structured approach
2. **Multi-Agent Support**: Different AI agents for different personas
3. **Visual Progress**: See task progress in Windsurf's flow view
4. **Automatic Context**: Smart context loading based on current work
5. **Integrated Testing**: Test flows integrated with task completion

---

*Windsurf AIWF Integration Rules v1.0.0*