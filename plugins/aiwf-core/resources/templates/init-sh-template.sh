#!/bin/bash
# AIWF Project Initialization Script
# Anthropic Long-Running Agent Pattern: 환경 설정 자동화
#
# 이 스크립트는 AIWF 장시간 세션을 위한 프로젝트 환경을 초기화합니다.
# 각 프로젝트에 맞게 커스터마이즈하세요.

set -e

echo "🚀 AIWF Project Initialization"
echo "=============================="
echo ""

PROJECT_NAME="{{PROJECT_NAME}}"
PROJECT_ROOT="$(pwd)"

# 1. Check project root
echo "📍 Step 1: Verifying project root..."
if [ ! -f "package.json" ] && [ ! -f "pyproject.toml" ] && [ ! -f "Cargo.toml" ]; then
    echo "⚠️ Warning: No project manifest found. Are you in the project root?"
fi
echo "  → Project root: $PROJECT_ROOT"

# 2. Install dependencies
echo ""
echo "📦 Step 2: Installing dependencies..."

if [ -f "package.json" ]; then
    if [ -f "yarn.lock" ]; then
        echo "  → Using yarn..."
        yarn install
    elif [ -f "pnpm-lock.yaml" ]; then
        echo "  → Using pnpm..."
        pnpm install
    else
        echo "  → Using npm..."
        npm install
    fi
fi

if [ -f "requirements.txt" ]; then
    echo "  → Installing Python dependencies..."
    pip install -r requirements.txt
fi

if [ -f "Cargo.toml" ]; then
    echo "  → Building Rust project..."
    cargo build
fi

# 3. Setup AIWF structure
echo ""
echo "📁 Step 3: Setting up AIWF structure..."

mkdir -p .aiwf
mkdir -p .aiwf/01_PROJECT_DOCS
mkdir -p .aiwf/02_REQUIREMENTS
mkdir -p .aiwf/03_SPRINTS
mkdir -p .aiwf/04_GENERAL_TASKS
mkdir -p .aiwf/05_ARCHITECTURAL_DECISIONS
mkdir -p .aiwf/10_STATE_OF_PROJECT
mkdir -p .aiwf/99_TEMPLATES

# 4. Initialize progress file
echo ""
echo "📝 Step 4: Initializing progress file..."

if [ ! -f ".aiwf/aiwf-progress.md" ]; then
    cat > .aiwf/aiwf-progress.md << 'PROGRESS_EOF'
# AIWF Progress Log

## Current Session

- **Session ID**: init-{{TIMESTAMP}}
- **Started**: {{TIMESTAMP}}
- **Current Task**: None
- **Task Status**: not_started

## Project Context

- **Project**: {{PROJECT_NAME}}
- **Current Milestone**: M01
- **Current Sprint**: None

## Recent Activity

### Last Commits (최근 5개)
```
(초기화됨)
```

### Completed Tasks (이번 세션)
- 프로젝트 초기화 완료

## Pending Tasks

### High Priority
- [ ] 첫 번째 마일스톤 생성

### Normal Priority
- (없음)

## Session Verification Checklist

- [x] 프로젝트 루트 디렉토리 확인 (`pwd`)
- [x] Git 상태 확인
- [ ] 개발 서버 실행 가능 확인
- [ ] 이전 태스크 상태 검토 완료
- [ ] 다음 태스크 선택 완료

## Blockers & Issues

(없음)

## Checkpoints

| Checkpoint | Task | Commit | Timestamp |
|------------|------|--------|-----------|
| init | 프로젝트 초기화 | (pending) | {{TIMESTAMP}} |

---

**Last Updated**: {{TIMESTAMP}}
**Updated By**: init.sh
PROGRESS_EOF
    echo "  → Created .aiwf/aiwf-progress.md"
fi

# 5. Git setup
echo ""
echo "🔧 Step 5: Git setup..."

if [ ! -d ".git" ]; then
    git init
    echo "  → Initialized git repository"
fi

# Create initial commit
git add .
git commit -m "[AIWF] 프로젝트 초기화 - init.sh 실행" || true
echo "  → Created initial commit"

# 6. Environment check
echo ""
echo "🔍 Step 6: Environment check..."

echo "  → Node.js: $(node --version 2>/dev/null || echo 'not installed')"
echo "  → npm: $(npm --version 2>/dev/null || echo 'not installed')"
echo "  → Python: $(python --version 2>/dev/null || echo 'not installed')"
echo "  → Git: $(git --version 2>/dev/null || echo 'not installed')"

# Summary
echo ""
echo "=============================="
echo "✅ AIWF Project Initialization Complete!"
echo ""
echo "📍 Project: $PROJECT_NAME"
echo "📁 Root: $PROJECT_ROOT"
echo ""
echo "💡 Next steps:"
echo "   1. Run /aiwf:session-start to begin a session"
echo "   2. Create your first milestone with /aiwf:create-milestone"
echo "   3. Start working on tasks!"
echo ""
echo "🔄 Remember: One task at a time, commit often!"
