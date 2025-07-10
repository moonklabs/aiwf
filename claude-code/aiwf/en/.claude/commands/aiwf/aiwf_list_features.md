# List Features

View Feature Ledger list with various filters and formats.

```bash
cd .aiwf && node ../claude-code/aiwf/en/commands/feature-ledger.js list "$@"
```

## Description

Query all Features in the project by filtering by status, priority, category, etc.

### 🎯 Filter Options
- `--status=<status>` - Filter by status (active, completed, paused, archived, all)
- `--milestone=<milestone>` - Filter by milestone (e.g., M02)
- `--priority=<priority>` - Filter by priority (critical, high, medium, low)
- `--category=<category>` - Filter by category (feature, enhancement, bugfix, refactor)

### 📊 Output Formats
- `--format=table` - Table format (default)
- `--format=list` - List format
- `--format=dashboard` - Dashboard format

### 🔄 Sort Options
- `--sort=id` - Sort by Feature ID (default)
- `--sort=updated` - Sort by most recent update
- `--sort=priority` - Sort by priority
- `--sort=progress` - Sort by progress

### 📝 Usage
```bash
# View all active Features
/project:aiwf:list_features

# High priority Features in M02 milestone
/project:aiwf:list_features --milestone=M02 --priority=high

# View overall status in dashboard format
/project:aiwf:list_features --status=all --format=dashboard
```

## Example Output (Table Format)
```
📋 Feature Ledger List
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ID    | Title                  | Status    | Priority | Progress
------+------------------------+-----------+----------+---------
FL001 | User Authentication    | active    | high     | 75%
FL002 | Dashboard Redesign     | active    | medium   | 40%
FL003 | API Rate Limiting      | completed | critical | 100%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Total 3 Features | Active: 2 | Completed: 1
```