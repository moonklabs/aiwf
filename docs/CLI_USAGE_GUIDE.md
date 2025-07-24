# AIWF CLI Usage Guide

## 📋 Table of Contents
1. [Installation and Initial Setup](#installation-and-initial-setup)
2. [Basic Commands](#basic-commands)
3. [AI Tool Management](#ai-tool-management)
4. [Cache Management](#cache-management)
5. [Language Management](#language-management)
6. [Independent Sprint Management (YOLO-focused)](#independent-sprint-management-yolo-focused)
7. [Checkpoint System (YOLO Recovery)](#checkpoint-system-yolo-recovery)
8. [YOLO Configuration Management](#yolo-configuration-management)
9. [Claude Code Integration Commands](#claude-code-integration-commands)
10. [Git Integration and Feature Tracking](#git-integration-and-feature-tracking)
11. [Common Workflows](#common-workflows)
12. [Troubleshooting](#troubleshooting)

---

## 🚀 Installation and Initial Setup

### First Installation
```bash
# Run in your project directory
cd my-project
npx aiwf

# Or global installation
npm install -g aiwf
aiwf
```

Installation process:
1. Language selection (Korean/English)
2. Automatic download of necessary files
3. Project structure creation

### Force Installation (without prompts)
```bash
aiwf install --force
# or
aiwf install -f
```

### Structure Created After Installation
```
your-project/
├── .aiwf/                    # AIWF project management
├── .claude/commands/aiwf/    # Claude Code commands
├── .cursor/rules/            # Cursor IDE rules
├── .windsurf/rules/          # Windsurf IDE rules
└── [existing project files]
```

---

## 📌 Basic Commands

### aiwf Main Commands
```bash
# Basic installation (install is the default action)
aiwf

# Explicit installation
aiwf install

# Force installation
aiwf install --force

# Help
aiwf --help

# Version check
aiwf --version
```

---

## 🤖 AI Tool Management

### Installing AI Tools
```bash
# Install specific AI tool templates
aiwf ai-tool install claude-code
aiwf ai-tool install cursor
aiwf ai-tool install windsurf
aiwf ai-tool install github-copilot
aiwf ai-tool install augment
```

### List AI Tools
```bash
# List available and installed tools
aiwf ai-tool list
```

Example output:
```
🤖 AI Tool Templates

claude-code
  Status: ✓ Installed
  Version: 1.0.0
  Features: custom_instructions, project_context, command_integration

cursor
  Status: Available
  Version: 1.0.0
  Features: smart_completion, aiwf_context_awareness, project_structure_recognition

windsurf
  Status: Available
  Version: 1.0.0
  Features: ai_assistance, code_generation, context_awareness
```

### Update AI Tools
```bash
# Update specific tool
aiwf ai-tool update claude-code

# Check for updates
aiwf ai-tool check
aiwf ai-tool check claude-code  # Specific tool only
```

### Verify AI Tools
```bash
# Verify installation status
aiwf ai-tool verify claude-code
```

### Check AI Tool Version
```bash
aiwf ai-tool version claude-code
```

---

## 💾 Cache Management

### Download Templates (Offline Use)
```bash
# Interactive selection
aiwf cache download

# Download all templates
aiwf cache download --all

# Download specific type only
aiwf cache download --type ai-tools
aiwf cache download --type projects
```

### List Cache
```bash
# Full cache list
aiwf cache list

# Filter by type
aiwf cache list --type ai-tools
```

### Clean Cache
```bash
# Clean only expired cache (default 7 days)
aiwf cache clean

# Delete all cache
aiwf cache clean --all

# Delete cache older than specific period
aiwf cache clean --max-age 30  # 30 days or older
```

### Update Cache
```bash
# Check for updates
aiwf cache update

# Check for updates and auto-install
aiwf cache update --install
```

### Check Cache Status
```bash
aiwf cache status
```

Example output:
```
📊 AIWF Cache Status

Cache Location: /Users/username/.aiwf-cache
Network Status: Online

Cache Statistics:
  Total Size: 24.3 MB
  Templates: 12
  AI Tools: 5
  Oldest Entry: 2024-01-13

By Status:
  Valid: 10 templates
  Expired: 2 templates
  Corrupted: 0 templates
```

---

## 🌐 Language Management

### Check Language Status
```bash
# Check current language settings
aiwf-lang
aiwf-lang status
aiwf-lang s  # Alias
```

### Change Language
```bash
# Change to Korean
aiwf-lang set ko

# Change to English
aiwf-lang set en

# Interactive selection
aiwf-lang set

# Auto-detection settings
aiwf-lang set --auto-detect true
aiwf-lang set --auto-detect false
```

### Reset Language
```bash
# Reset to auto-detection mode
aiwf-lang reset
aiwf-lang r  # Alias
```

---

## 🚀 Independent Sprint Management (YOLO-focused)

### Create Independent Sprint
```bash
# Auto-extract from README TODOs
aiwf sprint independent --from-readme

# Create from GitHub issue
aiwf sprint independent --from-issue 123

# Interactive creation
aiwf sprint independent "Quick Prototype"

# Specify engineering level
aiwf sprint independent "API Development" --minimal    # Minimal implementation
aiwf sprint independent "API Development" --balanced   # Balanced implementation
aiwf sprint independent "API Development" --complete   # Complete implementation
```

### Sprint List and Status
```bash
# List all sprints
aiwf-sprint list
aiwf-sprint ls

# Filter by status
aiwf-sprint list --status active
aiwf-sprint list --status completed

# Check specific sprint status
aiwf-sprint status S01
```

### Dedicated CLI Tool (aiwf-sprint)
```bash
# Help
aiwf-sprint help

# Create independent sprint
aiwf-sprint independent --from-readme --minimal
aiwf-sprint ind "Quick Feature" --balanced
```

Example output:
```
🚀 Creating independent sprint...

✅ Independent sprint created successfully!
  Sprint ID: S03
  Tasks: 5

🚀 Next steps:
  Run /project:aiwf:yolo S03 in Claude Code
```

---

## 💾 Checkpoint System (YOLO Recovery)

### Checkpoint Management
```bash
# List checkpoints
aiwf checkpoint list
aiwf checkpoint ls
aiwf checkpoint list --limit 20

# Current YOLO session status
aiwf checkpoint status

# Restore from checkpoint
aiwf checkpoint restore cp_1234567890

# Create manual checkpoint
aiwf checkpoint create "Before major refactoring"

# Clean old checkpoints
aiwf checkpoint clean --keep 10
aiwf checkpoint clean --keep 5 --dry-run  # Preview without actual deletion
```

### Dedicated CLI Tool (aiwf-checkpoint)
```bash
# Help
aiwf-checkpoint help

# Progress report
aiwf-checkpoint report

# Checkpoint details
aiwf-checkpoint show cp_1234567890
```

Example output:
```
📊 Checkpoint List:

🚀 cp_1703123456789 - session_start
    Tasks: 0 completed

✅ cp_1703123556789 - task_complete
    Tasks: 5 completed

🔄 cp_1703123656789 - auto
    Tasks: 10 completed
```

---

## 🛠️ YOLO Configuration Management

### Initialize YOLO Configuration
```bash
# Create default configuration file
aiwf yolo-config init

# Overwrite existing file
aiwf yolo-config init --force

# Interactive configuration wizard
aiwf yolo-config wizard
aiwf yolo-config interactive

# Show current configuration
aiwf yolo-config show
aiwf yolo-config status
```

### Configuration Wizard Options
Items you can configure in the interactive wizard:
- Engineering level (minimal/balanced/complete)
- Focus rules (requirement first, simple solution, etc.)
- Execution mode (fast/smart/safe)
- Checkpoint settings
- Overengineering prevention rules

Example output:
```
🛠️ YOLO Configuration Wizard

Select engineering level:
❯ Minimal - Fast prototype, minimal implementation
  Balanced - Balance between quality and speed
  Complete - Complete implementation, high quality

✅ Custom YOLO configuration created!
📁 Location: .aiwf/yolo-config.yaml
```

---

## 🤝 Claude Code Integration Commands

Available `/aiwf_*` commands in Claude Code:

### Project Initialization
```
/aiwf_initialize          # Initial project setup
/aiwf_prime              # Load project context
```

### Planning and Task Management
```
/aiwf_create_milestone_plan      # Create milestone plan
/aiwf_create_sprints_from_milestone  # Create sprints
/aiwf_create_sprint_tasks        # Create sprint tasks
/aiwf_create_general_task        # Create general task
/aiwf_create_prd                 # Create product requirements document
```

### Development Tasks
```
/aiwf_do_task                    # Execute task
/aiwf_commit                     # Create Git commit
/aiwf_test                       # Run tests
```

### Code Review
```
/aiwf_code_review                # Code review
/aiwf_project_review             # Full project review
/aiwf_testing_review             # Test coverage review
/aiwf_discuss_review             # Discuss review results
```

### AI Personas
```
/project:aiwf:ai_persona:architect      # Architect persona
/project:aiwf:ai_persona:backend        # Backend developer
/project:aiwf:ai_persona:frontend       # Frontend developer
/project:aiwf:ai_persona:security       # Security expert
/project:aiwf:ai_persona:data_analyst   # Data analyst
/project:aiwf:ai_persona:status         # Current persona status
/project:aiwf:ai_persona:auto on        # Auto persona switching
```

### GitHub Integration
```
/aiwf_pr_create                  # Create Pull Request
/aiwf_issue_create               # Create GitHub Issue
```

### Advanced Features
```
/aiwf_yolo                       # Automated task execution
/aiwf_infinite                   # Continuous task mode
/aiwf_ultrathink_code_advanced   # Advanced code analysis
```

---

## 🔗 Git Integration and Feature Tracking

### Install Git Hooks
```bash
# Run from project root
./hooks/install-hooks.sh

# Or manual installation
cp hooks/pre-commit .git/hooks/
cp hooks/post-commit .git/hooks/
chmod +x .git/hooks/*
```

### Feature-Related Scripts
```bash
# Scan Feature IDs from Git history
node commands/scan-git-history.js --since 2025-01-01

# Sync commits for specific Feature
node commands/sync-feature-commits.js FL001

# Generate Feature commit report
node commands/feature-commit-report.js --format markdown
```

### Automatic Feature Tracking with Git Commits
```bash
# Commit with Feature ID
git commit -m "feat(FL001): Implement authentication system"
# post-commit hook automatically updates Feature Ledger
```

---

## 💡 Common Workflows

### 1. Starting a New Project
```bash
# 1. Create project
mkdir my-awesome-project
cd my-awesome-project

# 2. Install AIWF
npx aiwf

# 3. Install Git hooks
git init
./hooks/install-hooks.sh

# 4. Set up AI tools
aiwf ai-tool install claude-code
aiwf ai-tool install cursor

# 5. Open project in Claude Code
# Then run /aiwf_initialize
```

### 2. Adding to Existing Project
```bash
# 1. Navigate to project directory
cd existing-project

# 2. Install AIWF
npx aiwf

# 3. Integrate with existing structure
/aiwf_prime  # In Claude Code
```

### 3. Team Collaboration Setup
```bash
# 1. Unify language settings
aiwf-lang set en  # or ko

# 2. Standardize AI tools
aiwf ai-tool install claude-code
aiwf ai-tool install cursor

# 3. Set up Git hooks
./hooks/install-hooks.sh

# 4. Add to .gitignore
echo ".aiwf/backup_*" >> .gitignore
echo "token-data/" >> .gitignore
```

### 4. Preparing for Offline Development
```bash
# 1. Download all templates
aiwf cache download --all

# 2. Check cache status
aiwf cache status

# 3. Works normally offline
# Cached templates are used automatically
```

---

## 🔧 Troubleshooting

### Installation Failure
```bash
# 1. Force reinstall
aiwf install --force

# 2. Clean cache and retry
aiwf cache clean --all
aiwf install

# 3. Manual cleanup
rm -rf .aiwf .claude .cursor .windsurf
aiwf install
```

### Language Issues
```bash
# Reset language settings
aiwf-lang reset

# Manually set language
aiwf-lang set en --auto-detect false
```

### Network Issues
```bash
# 1. Use cache mode
aiwf cache download --all  # Run while online

# 2. Proxy settings (if needed)
export HTTPS_PROXY=http://proxy.company.com:8080
aiwf install
```

### Permission Issues
```bash
# Grant execution permissions
chmod +x hooks/install-hooks.sh
chmod +x hooks/post-commit
chmod +x index.js
chmod +x language-cli.js
```

### Issues After Update
```bash
# Restore from backup
# Backup location: .aiwf/backup_YYYY-MM-DD_HHMMSS
cp -r .aiwf/backup_2024-01-20_143052/* .aiwf/
```

---

## 📚 Additional Resources

- **GitHub Repository**: https://github.com/aiwf/aiwf
- **Issue Reporting**: https://github.com/aiwf/aiwf/issues
- **Documentation**: [COMMANDS_GUIDE.md](docs/COMMANDS_GUIDE.md)
- **Korean Documentation**: [COMMANDS_GUIDE.ko.md](docs/COMMANDS_GUIDE.ko.md)

---

## 🎯 Quick Reference

```bash
# Installation
npx aiwf

# AI Tools
aiwf ai-tool install claude-code
aiwf ai-tool list

# Cache
aiwf cache download --all
aiwf cache status

# Language
aiwf-lang set en
aiwf-lang status

# Git hooks
./hooks/install-hooks.sh
```