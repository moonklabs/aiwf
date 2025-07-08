[Read in Korean (한국어로 보기)](ai-personas-guide-ko.md)

# AI Personas User Guide

## Overview

AIWF's AI Persona system is a feature that optimizes Claude Code's behavior patterns according to the characteristics of development tasks. Through 5 specialized personas, you can leverage the most suitable AI assistant for each task.

## Persona Types

### 1. Architect
**Purpose**: System design and architecture decisions

**Characteristics**:
- Focus on big picture and overall system structure
- Prioritize scalability and maintainability
- Apply design patterns and architectural principles
- Establish technology stack selection and integration strategies

**Use Cases**:
- Design phase of new features
- System refactoring planning
- Technology stack decisions
- Inter-module interface design

**Commands**:
```bash
/project:aiwf:ai_persona:architect
# or in Korean
/프로젝트:aiwf:ai_페르소나:아키텍트
```

### 2. Debugger
**Purpose**: Bug detection and problem solving

**Characteristics**:
- Detailed code analysis and error tracking
- Step-by-step execution flow verification
- Consider edge cases and exception scenarios
- Identify performance bottlenecks

**Use Cases**:
- Bug reproduction and root cause analysis
- Performance issue resolution
- Memory leak tracking
- Exception handling improvements

**Commands**:
```bash
/project:aiwf:ai_persona:debugger
# or in Korean
/프로젝트:aiwf:ai_페르소나:디버거
```

### 3. Reviewer
**Purpose**: Code quality review and improvement

**Characteristics**:
- Verify compliance with coding standards
- Identify security vulnerabilities
- Find optimization opportunities
- Evaluate readability and maintainability

**Use Cases**:
- PR review preparation
- Code quality improvement
- Security audits
- Refactoring suggestions

**Commands**:
```bash
/project:aiwf:ai_persona:reviewer
# or in Korean
/프로젝트:aiwf:ai_페르소나:리뷰어
```

### 4. Documenter
**Purpose**: Documentation writing and management

**Characteristics**:
- Clear and understandable explanations
- Automatic API documentation generation
- Write usage examples and tutorials
- Support for multilingual documentation

**Use Cases**:
- README writing
- API documentation
- User guide creation
- Technical specification writing

**Commands**:
```bash
/project:aiwf:ai_persona:documenter
# or in Korean
/프로젝트:aiwf:ai_페르소나:문서화전문가
```

### 5. Optimizer
**Purpose**: Performance optimization and efficiency improvement

**Characteristics**:
- Algorithm complexity analysis
- Memory usage optimization
- Execution time reduction
- Resource efficiency improvement

**Use Cases**:
- Performance bottleneck improvements
- Algorithm optimization
- Database query improvements
- Memory usage reduction

**Commands**:
```bash
/project:aiwf:ai_persona:optimizer
# or in Korean
/프로젝트:aiwf:ai_페르소나:최적화전문가
```

## How to Switch Personas

### Basic Usage
1. Select appropriate persona before starting work
2. Activate persona by entering command
3. Perform work
4. Switch to different persona if needed

### Example Workflow
```bash
# 1. Design new feature
/project:aiwf:ai_persona:architect
"Please design a new user authentication system"

# 2. Debug after implementation
/project:aiwf:ai_persona:debugger
"Please solve the issue where session is not maintained during login"

# 3. Code review
/project:aiwf:ai_persona:reviewer
"Please review the implemented authentication system code"

# 4. Write documentation
/project:aiwf:ai_persona:documenter
"Please write authentication API documentation"
```

## Context Rules by Persona

Each persona has unique context processing rules:

### Architect Context
- **Priority**: System design documents, architecture diagrams
- **Focus**: Interfaces, module structure, dependencies
- **Exclude**: Implementation details, temporary code

### Debugger Context
- **Priority**: Error logs, stack traces, test results
- **Focus**: Execution flow, variable states, conditional statements
- **Exclude**: Documentation, comments, style-related code

### Reviewer Context
- **Priority**: Changed code, commit history
- **Focus**: Coding standards, security patterns, performance impact
- **Exclude**: Test data, build files

### Documenter Context
- **Priority**: Public APIs, usage examples, README
- **Focus**: User perspective, clarity, completeness
- **Exclude**: Internal implementation, debug code

### Optimizer Context
- **Priority**: Performance measurement results, profiling data
- **Focus**: Time complexity, space complexity, resource usage
- **Exclude**: Documentation, UI code, test code

## Best Practices

### 1. Select Appropriate Persona for Task
- Choose the most suitable persona considering the nature of the task
- Switch sequentially when multiple personas are needed for one task

### 2. Persona Switching Timing
- Switch to appropriate persona when work phase changes
- Maintain consistency with same persona for same type of tasks

### 3. Context Management
- Clearly convey previous work results when switching personas
- Distribute work leveraging each persona's strengths

### 4. Collaboration Scenarios
```bash
# Persona utilization in team projects
1. Architect: Overall system design
2. Developer: Feature implementation (default mode)
3. Debugger: Integration testing and bug fixing
4. Reviewer: Code review and improvements
5. Documenter: Final documentation
```

## Troubleshooting

### When Persona Doesn't Work as Expected
1. Check if command was entered correctly
2. Verify current project context is AIWF
3. Wait 2-3 seconds after persona switch
4. If problem persists, reset to default mode and retry

### Performance Degradation
- Minimize persona switching for complex tasks
- Include only relevant files in large codebases
- Use exclusion settings for unnecessary context

### Context Conflicts
- Check context rules for each persona
- Explicitly set priority for conflicting information
- Manually clean up context when necessary

## Advanced Usage

### 1. Persona Chaining
Use multiple personas consecutively for complex tasks:
```bash
Architect → Developer → Debugger → Optimizer → Documenter
```

### 2. Persona Customization
Adjust persona behavior for project-specific requirements
(Planned for future updates)

### 3. Team Workflow Integration
Automatic persona switching based on Git branch or PR status
(Use with Feature-Git integration feature)

## Conclusion

The AI Persona system is a powerful tool that can significantly improve the efficiency and quality of development work. By understanding the characteristics of each persona and utilizing them appropriately, collaboration with Claude Code becomes more productive and effective.

We encourage you to develop persona utilization strategies optimized for each project through continuous use and feedback.