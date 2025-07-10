# Get Feature Details

View detailed information for a specific Feature Ledger.

```bash
cd .aiwf && node ../claude-code/aiwf/en/commands/feature-ledger.js details "$@"
```

## Description

Query all information for a Feature in detail using the Feature ID.

### 🎯 Output Formats
- `--format=full` - Full information (default)
- `--format=summary` - Summary information
- `--format=technical` - Technical details
- `--format=progress` - Progress-focused

### 📝 Usage
```bash
# Full detailed information
/project:aiwf:get_feature_details FL001

# View summary only
/project:aiwf:get_feature_details FL001 --format=summary

# Check technical details
/project:aiwf:get_feature_details FL001 --format=technical
```

### 📋 Display Information
- Feature metadata
- Development progress
- Related tasks and commits
- Assignees and reviewers
- Timeline and milestones
- Technical details

## Example Output (Full Information)
```
🎯 Feature Details
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📌 Basic Information
Feature ID: FL001
Title: User Authentication System
Status: active
Priority: high
Category: feature

📊 Progress
Progress: 75%
Start Date: 2025-07-05
Expected Completion: 2025-07-12
Elapsed Time: 5 days

🎯 Milestone & Sprint
Milestone: M02 - Context Engineering Enhancement
Sprint: S01_M02 - context_foundation

👥 Assignees
Developer: @developer1
Reviewers: @reviewer1, @reviewer2

📝 Description
Implement JWT-based user authentication system. Includes OAuth2.0 social login support.

🔧 Tech Stack
- Backend: Node.js, Express, JWT
- Database: PostgreSQL
- Frontend: React, Redux

📈 Progress History
[2025-07-05] Feature created
[2025-07-06] Database schema design completed
[2025-07-08] Basic JWT authentication implemented
[2025-07-10] OAuth2.0 implementation in progress
```