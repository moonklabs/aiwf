# /create_adr - Create Architecture Decision Record (ADR)

## Purpose
Create a systematic ADR document when architectural or technical decisions are required.

## Usage
```
/create_adr [title] [--template basic|detailed] [--status proposed|accepted]
```

## Execution Steps

### 1. Determine ADR Number
```bash
# Check existing ADR numbers
ls .aiwf/05_ARCHITECTURAL_DECISIONS/ | grep "ADR" | sort -V | tail -1
```

### 2. Collect ADR Information

Gather the following information:
- **Title**: Core content of the decision
- **Context**: Why is this decision needed?
- **Alternatives**: Other options considered
- **Decision**: Chosen solution
- **Consequences**: Expected positive/negative impacts

### 3. Create ADR File

```markdown
---
adr_id: ADR{{next_number}}
title: "{{title}}"
status: "proposed"
date: {{today_date}}
authors: ["{{current_user}}"]
---

# ADR{{next_number}}: {{title}}

## Status
proposed - {{today_date}}

## Context
{{Situation and background requiring the decision}}

## Decision
{{Solution to adopt and reasoning}}

## Consequences

### Positive
- {{Positive impacts}}

### Negative  
- {{Negative impacts or trade-offs}}

## Alternatives Considered

### {{Alternative 1}}
{{Considered but not adopted - reasons}}

### {{Alternative 2}}
{{Considered but not adopted - reasons}}

## Implementation Notes
{{Implementation considerations, migration steps}}

## Related
- {{Links to related ADRs, issues, or documentation}}
```

### 4. Save File
```bash
# Create ADR file
echo "{{ADR_content}}" > .aiwf/05_ARCHITECTURAL_DECISIONS/ADR{{number}}_{{title}}.md
```

### 5. Update Project Manifest
```bash
# Add ADR record to manifest
echo "- ADR{{number}}: {{title}} ({{date}})" >> .aiwf/00_PROJECT_MANIFEST.md
```

### 6. Sync State Index
```bash
# Update workflow state
aiwf state update
# Check current state
aiwf state show
```

## Input Example

**User Input:**
```
/create_adr "Database Selection: PostgreSQL vs MongoDB"
```

**Generated File:**
- `.aiwf/05_ARCHITECTURAL_DECISIONS/ADR001_Database_Selection_PostgreSQL_vs_MongoDB.md`

## Advanced Usage

### Update Existing ADR
```bash
# Change status (proposed → accepted)
# Modify status field in file header
sed -i 's/status: "proposed"/status: "accepted"/' ADR001_*.md
```

### Link ADRs
```bash
# Add related ADR links
echo "- Related to ADR002: API Authentication" >> ADR001_*.md
```

## Output Format

```
✅ ADR Created Successfully

📁 File Location: .aiwf/05_ARCHITECTURAL_DECISIONS/ADR001_Database_Selection.md
📋 Status: proposed
📅 Created: 2024-01-15
👤 Author: user

🔗 Next Steps:
1. Conduct team review
2. Change status to 'accepted' when decision is finalized
3. Begin implementation
```

## Important Notes
- ADR numbers auto-increment
- Only record important architectural decisions as ADRs
- Update date when changing status
- Reflect actual results in documentation after implementation

**Important:** Keep it concise. ADRs should focus on the core decision and rationale.