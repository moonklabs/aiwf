# AIWF Plugin for Claude Code

AI Workflow Framework (AIWF) - A comprehensive project management and development workflow plugin for Claude Code.

## Features

- **Project Management**: Milestone, Sprint, and Task tracking with structured templates
- **Development Workflows**: TDD cycle, feature development, code review workflows
- **40+ Development Tools**: API scaffolding, security scanning, database migration, and more
- **Multi-language Support**: Korean and English documentation
- **Skill Library**: Backend/Frontend development guidelines, spec-driven development
- **Agent Collection**: Specialized agents for code review, architecture, DevOps

## Installation

### Via Plugin Marketplace

```bash
/plugin marketplace add moonklabs/aiwf-marketplace
/plugin install aiwf@aiwf-marketplace
```

### Via NPM (Alternative)

```bash
npm install -g aiwf
aiwf install
```

## Quick Start

1. Initialize AIWF in your project:
   ```
   /aiwf:initialize
   ```

2. Create your first milestone:
   ```
   /aiwf:create-milestone
   ```

3. Create sprints from milestone:
   ```
   /aiwf:create-sprint
   ```

4. Start working on tasks:
   ```
   /aiwf:do-task
   ```

## Available Commands

### Core AIWF Commands (`/aiwf:*`)

| Command | Description |
|---------|-------------|
| `/aiwf:initialize` | Initialize AIWF framework in project |
| `/aiwf:prime` | Main AIWF prime command |
| `/aiwf:create-milestone` | Create milestone plan |
| `/aiwf:create-sprint` | Create sprints from milestone |
| `/aiwf:do-task` | Execute sprint task |
| `/aiwf:commit` | Git commit with AIWF conventions |
| `/aiwf:yolo` | YOLO mode configuration |

### Development Tools (`/aiwf-tool:*`)

| Command | Description |
|---------|-------------|
| `/aiwf-tool:api-scaffold` | Generate API scaffolding |
| `/aiwf-tool:security-scan` | Run security scan |
| `/aiwf-tool:db-migrate` | Database migration |
| `/aiwf-tool:tdd-red` | TDD Red phase |
| `/aiwf-tool:tdd-green` | TDD Green phase |
| `/aiwf-tool:tdd-refactor` | TDD Refactor phase |

### Workflows (`/aiwf-workflow:*`)

| Command | Description |
|---------|-------------|
| `/aiwf-workflow:tdd-cycle` | Complete TDD cycle |
| `/aiwf-workflow:feature-development` | Feature development workflow |
| `/aiwf-workflow:full-stack-feature` | Full-stack feature implementation |
| `/aiwf-workflow:incident-response` | Incident response workflow |

## Project Structure

When initialized, AIWF creates the following structure:

```
.aiwf/
├── 00_PROJECT_MANIFEST.md      # Project manifest
├── 01_PROJECT_DOCS/            # Technical documentation
├── 02_REQUIREMENTS/            # Milestone requirements
├── 03_SPRINTS/                 # Sprint execution
├── 04_GENERAL_TASKS/           # Non-sprint tasks
├── 05_ARCHITECTURAL_DECISIONS/ # ADR files
├── 10_STATE_OF_PROJECT/        # Project snapshots
└── 99_TEMPLATES/               # Document templates
```

## Skills

The plugin includes these skills:

- `aiwf:project-management` - AIWF project workflow
- `aiwf:backend-dev-guidelines` - Node.js/Express/TypeScript patterns
- `aiwf:frontend-dev-guidelines` - React/Vue development patterns
- `aiwf:spec-driven-development` - Spec-driven development approach
- `aiwf:error-tracking` - Error tracking and debugging
- `aiwf:route-tester` - API route testing

## Agents

Available specialized agents:

- `aiwf-code-reviewer` - Code review agent
- `aiwf-backend-architect` - Backend architecture agent
- `aiwf-devops-engineer` - DevOps automation agent
- `aiwf-technical-writer` - Documentation agent

## License

MIT License - see LICENSE file for details.

## Contributing

Contributions are welcome! Please read our contributing guidelines.

## Support

- GitHub Issues: https://github.com/moonklabs/aiwf/issues
- Documentation: https://github.com/moonklabs/aiwf/wiki
