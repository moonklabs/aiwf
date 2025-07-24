# Independent Sprint Guide

[한국어로 보기](independent-sprint-guide-ko.md)

## Overview

Independent Sprints are a core feature of AIWF v0.3.12+, designed to enable rapid YOLO execution without the overhead of milestone management. They are perfect for:

- Quick prototypes
- Standalone features
- Bug fix batches
- README TODO implementations
- GitHub issue resolutions

## Key Benefits

### 🚀 Speed
- No milestone planning required
- Direct TODO extraction from README
- Immediate YOLO execution capability
- Minimal setup overhead

### 🛡️ Overengineering Prevention
- Built-in engineering level controls
- Focus rules enforcement
- Complexity limits
- YAGNI principle by default

### 💾 Recovery
- Automatic checkpoint creation
- Safe interruption handling
- Progress preservation
- Git state tracking

## Creating Independent Sprints

### From README TODOs

```bash
aiwf sprint independent --from-readme
```

This command:
1. Scans README.md for TODO items, checkboxes, or feature lists
2. Extracts them as tasks
3. Creates a sprint with minimal engineering level
4. Prepares for immediate YOLO execution

Example README format:
```markdown
## TODO
- [ ] Add user authentication
- [ ] Implement API endpoints
- [ ] Create dashboard UI
```

### From GitHub Issues

```bash
aiwf sprint independent --from-issue 123
```

This command:
1. Fetches issue #123 from GitHub using `gh` CLI
2. Extracts title and checklist items
3. Creates tasks from the issue content
4. Links back to the original issue

### Interactive Creation

```bash
aiwf sprint independent "Quick Feature Implementation"
```

This prompts for:
- Sprint name
- Main goal
- Engineering level preference

### With Engineering Levels

```bash
# Minimal - Fast prototype, bare essentials only
aiwf sprint independent "MVP Feature" --minimal

# Balanced - Good quality with reasonable speed
aiwf sprint independent "API Feature" --balanced  

# Complete - Full implementation with all bells and whistles
aiwf sprint independent "Core System" --complete
```

## Engineering Levels Explained

### Minimal Level
- **Goal**: Working prototype ASAP
- **Focus**: Core functionality only
- **Testing**: Basic smoke tests
- **Documentation**: Inline comments only
- **Refactoring**: None unless broken
- **Use When**: POCs, demos, experiments

### Balanced Level
- **Goal**: Production-ready with good practices
- **Focus**: Clean, maintainable code
- **Testing**: Unit tests for critical paths
- **Documentation**: README + key functions
- **Refactoring**: As needed for clarity
- **Use When**: Regular features, APIs

### Complete Level
- **Goal**: Enterprise-grade implementation
- **Focus**: Scalability and extensibility
- **Testing**: Comprehensive test coverage
- **Documentation**: Full API docs + guides
- **Refactoring**: Proactive optimization
- **Use When**: Core systems, libraries

## YOLO Execution with Independent Sprints

### Basic Execution

After creating a sprint, execute it with:

```
/project:aiwf:yolo S03
```

### With Configuration

1. Create YOLO config:
```bash
aiwf yolo-config wizard
```

2. Select options matching your sprint's engineering level

3. Execute with confidence that overengineering is prevented

### Checkpoint Recovery

If execution is interrupted:

```bash
# Check status
aiwf checkpoint status

# List available checkpoints  
aiwf checkpoint list

# Restore and continue
aiwf checkpoint restore cp_1234567890
```

## Best Practices

### 1. Start Small
- Use `--minimal` for initial implementations
- Upgrade engineering level in subsequent sprints
- Avoid premature optimization

### 2. Focus on Requirements
- Let README TODOs drive development
- Resist adding "nice to have" features
- Follow YAGNI principle strictly

### 3. Use Checkpoints Wisely
- Create manual checkpoints before risky changes
- Clean old checkpoints regularly
- Trust automatic checkpointing for normal flow

### 4. Match Level to Purpose
- Prototypes → Minimal
- User-facing features → Balanced
- Core infrastructure → Complete

## Common Workflows

### Quick Feature from README

```bash
# 1. Update README with feature list
echo "- [ ] Add search functionality" >> README.md

# 2. Create sprint from README
aiwf sprint independent --from-readme --minimal

# 3. Execute with YOLO
# In Claude Code: /project:aiwf:yolo S01
```

### Issue-Driven Development

```bash
# 1. Create sprint from issue
aiwf sprint independent --from-issue 456 --balanced

# 2. Review generated tasks
aiwf-sprint status S01

# 3. Execute with monitoring
# In Claude Code: /project:aiwf:yolo S01
```

### Prototype to Production

```bash
# 1. Start with minimal prototype
aiwf sprint independent "User Auth" --minimal
# Execute: /project:aiwf:yolo S01

# 2. Enhance with balanced implementation
aiwf sprint independent "User Auth Enhanced" --balanced
# Execute: /project:aiwf:yolo S02

# 3. Complete with full features
aiwf sprint independent "User Auth Complete" --complete
# Execute: /project:aiwf:yolo S03
```

## Troubleshooting

### Sprint Creation Fails

**Issue**: Can't find .aiwf directory
**Solution**: Run from project root with AIWF installed

**Issue**: No TODOs found in README
**Solution**: Add TODO section with checkbox format

### YOLO Execution Issues

**Issue**: Overengineering detected
**Solution**: Adjust engineering level to minimal

**Issue**: Tests failing
**Solution**: Check YOLO config test threshold settings

### Checkpoint Problems

**Issue**: Can't restore checkpoint
**Solution**: Ensure Git state matches checkpoint

**Issue**: Too many checkpoints
**Solution**: Run `aiwf checkpoint clean --keep 10`

## Advanced Usage

### Custom Task Extraction

Create a `.aiwf/todo-patterns.json`:
```json
{
  "patterns": [
    "TODO:",
    "FIXME:",
    "- [ ]",
    "Feature:"
  ]
}
```

### Sprint Templates

Create `.aiwf/sprint-templates/`:
```yaml
# api-sprint.yaml
name_prefix: "API Feature"
engineering_level: balanced
default_tasks:
  - "Design API endpoints"
  - "Implement controllers"
  - "Add tests"
  - "Update documentation"
```

### Automation Scripts

```bash
#!/bin/bash
# create-weekly-sprint.sh

# Extract this week's issues
ISSUES=$(gh issue list --label "this-week" --json number -q '.[].number')

# Create sprint from issues
for issue in $ISSUES; do
  aiwf sprint independent --from-issue $issue --minimal
done
```

## Integration with CI/CD

### GitHub Actions Example

```yaml
name: Create Sprint from Issues
on:
  issues:
    types: [labeled]

jobs:
  create-sprint:
    if: github.event.label.name == 'ready-for-sprint'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install AIWF
        run: npm install -g aiwf
      - name: Create Sprint
        run: |
          aiwf sprint independent \
            --from-issue ${{ github.event.issue.number }} \
            --minimal
```

## Summary

Independent Sprints represent the evolution of AIWF towards rapid, focused development. By removing the overhead of milestone management and integrating overengineering prevention, they enable developers to move from idea to implementation with minimal friction.

Remember: **YOLO is not reckless - it's focused execution with safety rails.**