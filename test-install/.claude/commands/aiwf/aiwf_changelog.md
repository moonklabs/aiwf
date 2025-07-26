# Generate Changelog from Git Commit History

Analyzes git commit history to generate a structured changelog.

## Work Steps

### 1. Analyze Git History
- Analyze recent commits to understand changes
- Check tag information (if available)
- Parse conventional commit format from commit messages

### 2. Categorize Changes
Classify commits into the following categories:
- ✨ Features (feat)
- 🐛 Bug Fixes (fix)
- 📝 Documentation (docs)
- 🎨 Code Style (style)
- ♻️ Refactoring (refactor)
- ⚡ Performance (perf)
- ✅ Tests (test)
- 🔧 Build/Config (build, chore)

### 3. Generate Changelog
- Create or update CHANGELOG.md file
- Organize sections by version (based on tags)
- Group changes by category
- Display with commit SHA

### 4. Usage
```bash
# Basic execution (full history)
/project:aiwf:changelog

# Specify commit range
/project:aiwf:changelog v1.0.0..HEAD

# Recent commits with count
/project:aiwf:changelog -n 50
```

### 5. Example Output
```markdown
# Changelog

## [Unreleased]

### ✨ Features
- feat(auth): add social login functionality (abc1234)
- feat(api): implement RESTful API v2 (def5678)

### 🐛 Bug Fixes
- fix(ui): correct mobile responsive layout (ghi9012)

### 📝 Documentation
- docs(readme): update installation guide (jkl3456)
```

## Implementation Details

1. Parse Git Log:
```bash
git log --pretty=format:"%h|%s|%an|%ad" --date=short
```

2. Conventional Commit Pattern Matching:
```regex
^(feat|fix|docs|style|refactor|perf|test|build|chore)(\(.+\))?:\s+(.+)$
```

3. Utilize Tag Information:
```bash
git describe --tags --abbrev=0
```

4. Apply changelog template and generate file

5. Merge appropriately if existing CHANGELOG.md exists

## Notes
- Commits not following Conventional Commit format are classified as "Other Changes"
- Merge commits are excluded by default
- Generated changelog can be manually edited after review