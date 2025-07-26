# /update_adr - Update Existing ADR

## Purpose
Update existing ADR status, modify content, or add follow-up decisions.

## Usage
```
/update_adr [ADR_number] [--status proposed|accepted|deprecated|superseded] [--reason "reason"]
```

## Execution Steps

### 1. Check Existing ADR
```bash
# List ADRs
ls .aiwf/05_ARCHITECTURAL_DECISIONS/ADR*.md

# View specific ADR content
cat .aiwf/05_ARCHITECTURAL_DECISIONS/ADR{{number}}_*.md
```

### 2. Determine Update Type

#### A. Status Change
- **proposed → accepted**: Decision approved
- **proposed → deprecated**: No longer valid  
- **accepted → superseded**: Replaced by new decision

#### B. Content Modification
- Reflect implementation experience
- Add new constraints
- Update consequences

#### C. Add Related Information
- Link follow-up ADRs
- Enhance implementation notes
- Add impact analysis

### 3. Update ADR File

#### For Status Changes
```bash
# Update header status
sed -i 's/status: "{{old_status}}"/status: "{{new_status}}"/' ADR{{number}}_*.md

# Add status change history to body
echo -e "\n## Status History\n- {{date}}: {{old_status}} → {{new_status}} ({{reason}})" >> ADR{{number}}_*.md
```

#### For Content Modifications
```markdown
## Status
{{current_status}} - {{update_date}}

## Updates
### {{update_date}}
{{Changes and reasons}}

### Implementation Experience
{{Experience and lessons learned during actual implementation}}

## Actual Consequences
{{Comparison between expected and actual results}}
```

### 4. Update Related Files

#### When ADR is deprecated/superseded
```bash
# Create new ADR if needed
/create_adr "{{new_decision_title}}" --supersedes ADR{{number}}

# Reflect status change in related documents
grep -r "ADR{{number}}" .aiwf/ --include="*.md" -l | xargs sed -i 's/ADR{{number}}/~~ADR{{number}}~~ (deprecated)/'
```

### 5. Update Manifest
```bash
# Record status change in project manifest
echo "- ADR{{number}} status change: {{old_status}} → {{new_status}} ({{date}})" >> .aiwf/00_PROJECT_MANIFEST.md
```

### 6. Sync State Index
```bash
# Update workflow state  
aiwf state update
# Check current state
aiwf state show
```

## Status Change Scenarios

### 1. Proposed → Accepted
```markdown
## Status
accepted - {{date}}

## Status History
- {{proposal_date}}: proposed
- {{approval_date}}: accepted (team review completed, implementation approved)

## Implementation Timeline
- Start: {{date}}
- Expected completion: {{date}}
```

### 2. Accepted → Superseded  
```markdown
## Status
superseded - {{date}}

## Status History
- {{proposal_date}}: proposed
- {{approval_date}}: accepted  
- {{supersede_date}}: superseded by ADR{{new_number}}

## Superseded By
- ADR{{new_number}}: {{new_decision_title}}
- Reason: {{replacement_reason}}
```

### 3. Reflect Implementation Experience
```markdown
## Implementation Notes
### Planned ({{plan_date}})
{{Original plan}}

### Actual ({{implementation_date}})
{{Actual implementation and differences}}

## Lessons Learned
- {{Lesson 1}}
- {{Lesson 2}}

## Recommendations
{{Recommendations for future similar decisions}}
```

## Automation Scripts

### Batch ADR Status Check
```bash
#!/bin/bash
echo "=== ADR Status Summary ==="
for adr in .aiwf/05_ARCHITECTURAL_DECISIONS/ADR*.md; do
  status=$(grep "status:" "$adr" | cut -d'"' -f2)
  title=$(grep "title:" "$adr" | cut -d'"' -f2)
  echo "$(basename $adr): $status - $title"
done
```

### Check Expired ADRs
```bash
#!/bin/bash
echo "=== ADRs Requiring Review ==="
find .aiwf/05_ARCHITECTURAL_DECISIONS/ -name "ADR*.md" -exec grep -l 'status: "proposed"' {} \; | while read file; do
  date=$(grep "date:" "$file" | cut -d' ' -f2)
  days_ago=$(( ($(date +%s) - $(date -d "$date" +%s)) / 86400 ))
  if [ $days_ago -gt 30 ]; then
    echo "$(basename $file): $days_ago days old - review needed"
  fi
done
```

## Output Format

```
✅ ADR Update Completed

📁 File: ADR001_Database_Selection.md
📋 Status: proposed → accepted
📅 Updated: 2024-01-20
📝 Changes: Team review completed, implementation approved

🔗 Related Impact:
- Related Sprint: S02_Database_Implementation
- Related Task: T05_Schema_Design
- Follow-up ADR: None

📊 ADR Status:
- Active: 3
- Deprecated: 1
- Superseded: 0
```

## Important Notes
- Provide sufficient rationale when changing status
- Update related documents together
- Preserve deprecated/superseded ADRs - don't delete
- Always reflect implementation experience in documentation

**Important:** ADR history is organizational learning asset. Make all changes traceable.