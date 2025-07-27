# AIWF Architecture Decision Record (ADR) Management Guide

> A comprehensive guide to managing architectural decisions using ADRs in AIWF projects

[한국어](ADR_MANAGEMENT_GUIDE.ko.md) | [English](ADR_MANAGEMENT_GUIDE.md)

## Table of Contents

1. [What are ADRs?](#what-are-adrs)
2. [Why Use ADRs in AIWF?](#why-use-adrs-in-aiwf)
3. [ADR Structure](#adr-structure)
4. [Integration with AIWF](#integration-with-aiwf)
5. [Creating ADRs](#creating-adrs)
6. [Managing ADRs](#managing-adrs)
7. [ADR Templates](#adr-templates)
8. [Best Practices](#best-practices)
9. [Automation and Tools](#automation-and-tools)
10. [Examples](#examples)

## What are ADRs?

Architecture Decision Records (ADRs) are short text documents that capture important architectural decisions made in a project, along with their context and consequences. They serve as a historical record of why certain decisions were made and help future developers understand the reasoning behind architectural choices.

### Key Characteristics

- **Immutable**: Once written, ADRs should not be changed (only superseded)
- **Numbered**: Sequential numbering for easy reference
- **Context-Rich**: Includes the situation that led to the decision
- **Consequence-Aware**: Documents the results and trade-offs

## Why Use ADRs in AIWF?

### Benefits for AI-Assisted Development

1. **AI Context**: Provides Claude Code with historical context for decisions
2. **Autonomous Guidance**: Helps YOLO mode make informed architectural choices
3. **Consistency**: Ensures AI follows established architectural patterns
4. **Documentation**: Maintains architectural knowledge across development sessions

### AIWF-Specific Advantages

- **Sprint Planning**: ADRs inform task creation and priority
- **Persona Context**: Different AI personas can reference relevant decisions
- **Quality Control**: Engineering Guard can validate compliance with decisions
- **Recovery**: Checkpoint system can reference ADRs for context restoration

## ADR Structure

### Standard ADR Format

```markdown
# ADR-001: Decision Title

**Date**: YYYY-MM-DD
**Status**: [Proposed | Accepted | Deprecated | Superseded]
**Context**: AIWF Project Context

## Context

Description of the issue or situation that prompted this decision.

## Decision

The architectural decision that was made.

## Consequences

### Positive
- Benefits and advantages of this decision

### Negative
- Drawbacks and trade-offs

### Neutral
- Other effects and considerations

## Implementation Notes

Specific guidance for implementation within AIWF.

## Related Decisions
- Links to related ADRs
- References to AIWF components affected

## Compliance Validation
- How to verify adherence to this decision
- Engineering Guard rules if applicable
```

### AIWF-Enhanced Structure

```markdown
# ADR-001: Decision Title

**Date**: YYYY-MM-DD
**Status**: Accepted
**Context**: AIWF v0.3.16+ Project
**Affects**: [CLI | YOLO | Personas | Templates]
**Persona Relevance**: [architect | developer | security]

## Context
[Standard context section]

## Decision
[Standard decision section]

## AIWF Integration

### CLI Impact
How this decision affects CLI commands and workflows.

### YOLO Mode Considerations
Implications for autonomous execution and safety mechanisms.

### Persona Guidelines
Specific guidance for different AI personas.

### Template Updates
Required changes to project templates.

## Consequences
[Standard consequences section]

## Validation Rules

### Engineering Guard Rules
```yaml
# .aiwf/yolo-config.yaml additions
custom_rules:
  - name: "ADR-001 Compliance"
    pattern: "validation_pattern"
    severity: "warning"
```

### Automated Checks
- Unit tests to validate compliance
- CI/CD pipeline validations
- AIWF command integrations

## Implementation Guide

### Step-by-Step Implementation
1. [Detailed implementation steps]
2. [AIWF-specific considerations]
3. [Validation checkpoints]

### Code Examples
```javascript
// Implementation examples
```

## Related Documents
- [Link to relevant AIWF documentation]
- [Related ADRs]
- [AIWF module documentation]
```

## Integration with AIWF

### Directory Structure

```
.aiwf/
├── adrs/
│   ├── 0001-module-architecture.md
│   ├── 0002-yolo-safety-mechanisms.md
│   ├── 0003-persona-selection-strategy.md
│   └── template.md
├── yolo-config.yaml
└── state.json
```

### AIWF Command Integration

#### Planned Commands (Future Enhancement)
```bash
# Create new ADR
aiwf adr create "Database Migration Strategy"

# List ADRs
aiwf adr list

# Show specific ADR
aiwf adr show 001

# Link ADR to current work
aiwf adr link 001 --to-task T001

# Validate current code against ADRs
aiwf adr validate
```

### Claude Code Integration

#### ADR-Aware Commands
```markdown
# In Claude Code
/aiwf_prime  # Now includes ADR context loading
/aiwf_create_milestone_plan  # References relevant ADRs
/aiwf_yolo  # Considers ADR constraints
```

## Creating ADRs

### When to Create an ADR

1. **Major Architectural Changes**: Database schema, API design, module structure
2. **Technology Choices**: Framework selection, library adoption, tool integration
3. **AIWF-Specific Decisions**: YOLO behavior, persona configuration, template design
4. **Security Decisions**: Authentication, authorization, data protection
5. **Performance Decisions**: Caching strategies, optimization approaches

### Creation Process

#### Manual Creation
```bash
# 1. Copy template
cp .aiwf/adrs/template.md .aiwf/adrs/0001-your-decision.md

# 2. Edit the ADR
vim .aiwf/adrs/0001-your-decision.md

# 3. Link to current work
# Add ADR reference to task or sprint documentation

# 4. Commit
git add .aiwf/adrs/0001-your-decision.md
git commit -m "docs: add ADR-001 for your decision"
```

#### Using AIWF (Future)
```bash
# Create from template
aiwf adr create "Microservices Communication Pattern"

# Create with context
aiwf adr create "YOLO Safety Mechanism" --context="yolo-mode"

# Create from persona perspective
aiwf adr create "Security Policy" --persona="security"
```

## Managing ADRs

### Lifecycle Management

#### Status Transitions
```
Proposed → Accepted → [Deprecated | Superseded]
    ↓
 Rejected
```

#### Updating Status
```markdown
# To deprecate an ADR
## Status Update
**Previous Status**: Accepted
**New Status**: Deprecated
**Date**: 2025-01-27
**Reason**: Superseded by ADR-015
```

### Linking and References

#### Task Integration
```markdown
# In task files
## Architectural Context
- ADR-001: Module Architecture Pattern
- ADR-003: API Design Principles

## Compliance Requirements
- Follow ADR-001 module structure
- Implement ADR-003 error handling
```

#### Sprint Planning
```markdown
# In sprint documentation
## Architectural Decisions to Consider
- [ ] Review ADR-002 for database access patterns
- [ ] Apply ADR-004 security guidelines
- [ ] Validate against ADR-001 module structure
```

## ADR Templates

### Basic Template

```markdown
# ADR-{NUMBER}: {TITLE}

**Date**: {DATE}
**Status**: Proposed
**Context**: AIWF Project

## Context

What is the issue we're facing? What factors are relevant?

## Decision

What is the change we're making?

## Consequences

What becomes easier or more difficult as a result?
```

### AIWF-Specific Template

```markdown
# ADR-{NUMBER}: {TITLE}

**Date**: {DATE}
**Status**: Proposed
**Context**: AIWF v{VERSION}+ Project
**Affects**: [CLI | YOLO | Personas | Templates | Core]
**Persona Relevance**: [architect | developer | security | tester]

## Context

### Problem Statement
[Description of the architectural challenge]

### AIWF Context
[How this relates to AIWF workflows and components]

### Constraints
[Technical, business, or project constraints]

## Decision

### Chosen Approach
[The architectural decision made]

### Alternatives Considered
[Other options that were evaluated]

### Rationale
[Why this decision was made]

## AIWF Integration

### CLI Impact
[How this affects command-line operations]

### YOLO Mode Considerations
[Implications for autonomous execution]

### Persona Guidelines
[Guidance for different AI personas]

### Template Changes
[Required updates to project templates]

## Consequences

### Positive
- [Benefits and improvements]

### Negative
- [Trade-offs and limitations]

### Neutral
- [Other effects]

## Implementation

### Action Items
- [ ] [Specific implementation steps]
- [ ] [AIWF configuration updates]
- [ ] [Documentation updates]

### Validation
[How to verify correct implementation]

### Timeline
[Implementation schedule if applicable]

## Compliance

### Engineering Guard Rules
```yaml
# Additional rules for .aiwf/yolo-config.yaml
adr_compliance:
  adr_{NUMBER}:
    enabled: true
    severity: warning
    pattern: "{validation_pattern}"
```

### Automated Checks
[Unit tests, CI/CD validations, etc.]

## Related Documents
- [Links to relevant documentation]
- [Related ADRs]
- [AIWF module references]

## Review and Approval

### Reviewers
- [ ] Architect: {NAME}
- [ ] Lead Developer: {NAME}
- [ ] Security Lead: {NAME} (if security-related)

### Approval Date
[Date when ADR was accepted]
```

## Best Practices

### Writing Effective ADRs

1. **Be Concise**: Keep ADRs focused and readable
2. **Be Specific**: Avoid vague language and generalities
3. **Include Context**: Explain the situation that led to the decision
4. **Document Trade-offs**: Be honest about consequences
5. **Link to Code**: Reference specific implementations

### AIWF-Specific Best Practices

1. **Persona Alignment**: Consider how different personas will interpret the ADR
2. **YOLO Compatibility**: Ensure decisions work with autonomous execution
3. **Template Integration**: Update project templates to reflect decisions
4. **Engineering Guard Rules**: Add validation rules where applicable
5. **Sprint Planning**: Reference ADRs in task and sprint documentation

### Maintenance Practices

1. **Regular Reviews**: Periodically review and update ADR status
2. **Link Validation**: Ensure references remain accurate
3. **Implementation Tracking**: Monitor compliance with decisions
4. **Knowledge Transfer**: Use ADRs for onboarding new team members

## Automation and Tools

### Git Hooks Integration

```bash
# .git/hooks/pre-commit
#!/bin/bash
# Validate ADR references in commit messages
if git log -1 --pretty=%B | grep -q "ADR-[0-9]"; then
    echo "✅ ADR reference found in commit message"
else
    echo "ℹ️  Consider referencing relevant ADRs in commit message"
fi
```

### Future AIWF Integration

#### Planned Features
- **ADR Command**: `aiwf adr` command suite
- **Context Loading**: Automatic ADR context in Claude Code
- **Validation**: Engineering Guard ADR compliance checks
- **Templates**: ADR-aware project templates

#### Proposed Workflow
```bash
# 1. Create ADR with AIWF
aiwf adr create "API Rate Limiting Strategy"

# 2. Link to current work
aiwf task link ADR-001 --to-current

# 3. Validate implementation
aiwf adr validate --against=ADR-001

# 4. Generate compliance report
aiwf adr report --sprint=S01
```

## Examples

### Example 1: Module Architecture ADR

```markdown
# ADR-001: Modular Component Architecture

**Date**: 2025-01-27
**Status**: Accepted
**Context**: AIWF v0.3.16+ Project
**Affects**: Core, CLI, Templates
**Persona Relevance**: architect, developer

## Context

AIWF grew organically and components became tightly coupled, making it difficult to test, maintain, and extend individual features.

## Decision

Adopt a modular architecture with clear dependency boundaries:
- Core utilities (paths, messages, language-utils)
- Feature modules (persona, checkpoint, compression)
- Plugin system for extensions

## AIWF Integration

### CLI Impact
Commands will load modules dynamically based on functionality needed.

### YOLO Mode Considerations
Modular design allows YOLO to load only necessary components, improving performance.

### Engineering Guard Rules
```yaml
module_architecture:
  enforce_boundaries: true
  max_dependencies: 5
  circular_dependency_check: true
```

## Consequences

### Positive
- Improved testability and maintainability
- Faster development cycles
- Better plugin support

### Negative
- Increased initial complexity
- Need for dependency management

## Implementation
- Refactor existing monolithic components
- Implement dependency injection
- Update documentation and templates
```

### Example 2: YOLO Safety Mechanism ADR

```markdown
# ADR-002: YOLO Safety Mechanism Framework

**Date**: 2025-01-27
**Status**: Accepted
**Context**: AIWF v0.3.16+ YOLO Mode
**Affects**: YOLO, Engineering Guard, Checkpoint
**Persona Relevance**: architect, security

## Context

Autonomous execution needs robust safety mechanisms to prevent data loss, security issues, and code quality degradation.

## Decision

Implement multi-layered safety framework:
1. Engineering Guard for code quality
2. Checkpoint system for recovery
3. Breakpoint system for critical operations
4. Real-time monitoring and intervention

## YOLO Mode Considerations

The safety framework is specifically designed for autonomous execution:
- Non-blocking quality checks
- Automatic rollback on failures
- Progressive escalation of interventions

## Engineering Guard Rules
```yaml
yolo_safety:
  critical_file_protection: true
  test_failure_threshold: 10
  complexity_monitoring: true
  automatic_checkpoints: 5
```

## Implementation
- Deploy engineering-guard.js with YOLO templates
- Integrate checkpoint-manager.js with session tracking
- Add safety configuration to yolo-config.yaml
```

## Related Commands

### Current AIWF Commands
- `/aiwf_prime` - Load project context (can include ADR context)
- `/aiwf_create_milestone_plan` - Reference ADRs in planning
- `/aiwf_do_task` - Consider ADR constraints during implementation

### Planned Commands
- `aiwf adr create` - Create new ADR
- `aiwf adr list` - List all ADRs
- `aiwf adr validate` - Validate code against ADRs
- `aiwf adr link` - Link ADRs to tasks

## Related Documents

- [ARCHITECTURE.md](ARCHITECTURE.md) - Overall system architecture
- [MODULE_MANAGEMENT_GUIDE.md](MODULE_MANAGEMENT_GUIDE.md) - Module dependency management
- [YOLO_SYSTEM_GUIDE.md](YOLO_SYSTEM_GUIDE.md) - YOLO mode documentation
- [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md) - Development practices

---

**Last Updated**: 2025-01-27  
**Version**: Compatible with AIWF v0.3.16+  
**Status**: Documentation Framework (ADR commands to be implemented)