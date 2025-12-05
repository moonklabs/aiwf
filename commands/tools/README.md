# AIWF Plugin Tools

This directory contains development tool commands converted to the AIWF plugin format.

## Overview

These commands provide specialized development tools that integrate with Claude Code's plugin system. Each command includes:

- **YAML frontmatter** with metadata
- **English descriptions** for plugin discovery
- **Original Korean content** maintained for compatibility
- **Model specifications** (claude-sonnet-4-0)

## Available Tools

### Test-Driven Development (TDD)
- **tdd-red.md** - Write failing tests following TDD red phase
- **tdd-green.md** - Implement code to pass TDD tests (green phase)
- **tdd-refactor.md** - Refactor code in TDD refactor phase

### API Development
- **api-scaffold.md** - Generate API scaffolding and boilerplate
- **api-mock.md** - Create API mock server for development

### Security & Compliance
- **security-scan.md** - Run comprehensive security vulnerability scan
- **compliance-check.md** - Check code compliance with standards
- **deps-audit.md** - Audit project dependencies for vulnerabilities

### DevOps & Infrastructure
- **docker-optimize.md** - Optimize Docker configuration and images
- **k8s-manifest.md** - Generate Kubernetes manifests and configs
- **db-migrate.md** - Database migration management
- **deploy-checklist.md** - Pre-deployment checklist verification

### Code Quality & Maintenance
- **refactor-clean.md** - Clean code refactoring
- **code-explain.md** - Explain code functionality and behavior
- **code-migrate.md** - Migrate code between versions or frameworks
- **tech-debt.md** - Track and manage technical debt

### Testing & Validation
- **test-harness.md** - Create comprehensive test harness
- **config-validate.md** - Validate configuration files
- **data-validation.md** - Validate data structures and schemas

### Debugging & Analysis
- **debug-trace.md** - Debug trace and analysis
- **error-trace.md** - Trace and analyze runtime errors
- **error-analysis.md** - Analyze error patterns and root causes
- **smart-debug.md** - Smart debugging with AI assistance

### Dependencies & Upgrades
- **deps-upgrade.md** - Upgrade project dependencies safely

### Documentation & Communication
- **doc-generate.md** - Generate project documentation
- **pr-enhance.md** - Enhance pull request quality and description
- **standup-notes.md** - Generate daily standup notes

### Monitoring & Optimization
- **monitor-setup.md** - Set up monitoring and observability
- **slo-implement.md** - Implement SLO monitoring and alerting
- **cost-optimize.md** - Optimize cloud infrastructure costs

### Accessibility & UX
- **accessibility-audit.md** - Audit web application for accessibility compliance

### AI & Advanced Features
- **ai-assistant.md** - AI-powered development assistant
- **ai-review.md** - AI code review and quality assessment
- **langchain-agent.md** - Create LangChain agent implementation
- **multi-agent-optimize.md** - Optimize multi-agent system performance
- **multi-agent-review.md** - Review multi-agent architecture
- **prompt-optimize.md** - Optimize AI prompts for better results

### Project Management
- **issue.md** - Track and manage project issues
- **onboard.md** - Onboard new team members to project
- **context-save.md** - Save current development context
- **context-restore.md** - Restore development context from previous session

### Data Engineering
- **data-pipeline.md** - Create data pipeline architecture

## Frontmatter Format

Each tool file includes YAML frontmatter with the following structure:

```yaml
---
model: claude-sonnet-4-0
description: <English description for plugin discovery>
---
```

## Conversion Process

These files were converted from the Korean Claude Code command directory using an automated conversion script:

- **Source**: `/claude-code/aiwf/ko/.claude/commands/tools/`
- **Target**: `/plugin/commands/tools/`
- **Conversion Script**: `/scripts/convert-tools-to-plugin.js`

### Conversion Rules Applied

1. ✓ Preserved existing frontmatter fields (like `model`)
2. ✓ Added `description` field with English descriptions
3. ✓ Kept original filenames (already in kebab-case)
4. ✓ Maintained original content (Korean content preserved)
5. ✓ Ensured proper YAML frontmatter formatting

## Usage

These tools are designed to be used with the AIWF plugin system in Claude Code. They provide specialized functionality for various development tasks while maintaining compatibility with the existing AIWF framework structure.

## Total Tools

**42 development tool commands** are available in this directory.

## Last Updated

Converted on: 2025-12-05

## Contributing

When adding new tools:

1. Follow the kebab-case naming convention
2. Include YAML frontmatter with `model` and `description` fields
3. Write descriptions in English for plugin discovery
4. Maintain content in the appropriate language for your use case
5. Update this README with the new tool entry
