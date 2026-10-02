#!/bin/bash
# AIWF Task Verification Hook
# Anthropic Long-Running Agent Pattern: 태스크 완료 전 자동 검증
#
# 이 스크립트는 태스크 완료를 선언하기 전에 자동으로 테스트를 실행합니다.
# 테스트가 실패하면 태스크를 완료로 표시하지 않도록 경고합니다.

set -e

echo "🔍 AIWF Task Verification Starting..."
echo "================================================"

VERIFICATION_PASSED=true
VERIFICATION_RESULTS=""

# 1. Check for test framework and run tests
echo ""
echo "📋 Step 1: Running automated tests..."

if [ -f "package.json" ]; then
    # Node.js project
    if grep -q '"test"' package.json 2>/dev/null; then
        echo "  → Found npm test script"
        if npm test 2>/dev/null; then
            VERIFICATION_RESULTS="${VERIFICATION_RESULTS}\n✅ npm test: PASSED"
        else
            VERIFICATION_RESULTS="${VERIFICATION_RESULTS}\n❌ npm test: FAILED"
            VERIFICATION_PASSED=false
        fi
    fi
fi

if [ -f "yarn.lock" ] && [ -f "package.json" ]; then
    if grep -q '"test"' package.json 2>/dev/null; then
        echo "  → Found yarn test script"
        if yarn test 2>/dev/null; then
            VERIFICATION_RESULTS="${VERIFICATION_RESULTS}\n✅ yarn test: PASSED"
        else
            VERIFICATION_RESULTS="${VERIFICATION_RESULTS}\n❌ yarn test: FAILED"
            VERIFICATION_PASSED=false
        fi
    fi
fi

if [ -f "pytest.ini" ] || [ -f "setup.py" ] || [ -f "pyproject.toml" ]; then
    # Python project
    echo "  → Found Python project"
    if python -m pytest 2>/dev/null; then
        VERIFICATION_RESULTS="${VERIFICATION_RESULTS}\n✅ pytest: PASSED"
    else
        VERIFICATION_RESULTS="${VERIFICATION_RESULTS}\n❌ pytest: FAILED"
        VERIFICATION_PASSED=false
    fi
fi

# 2. TypeScript type check
echo ""
echo "📋 Step 2: Running type check..."

if [ -f "tsconfig.json" ]; then
    echo "  → Found TypeScript config"
    if npx tsc --noEmit 2>/dev/null; then
        VERIFICATION_RESULTS="${VERIFICATION_RESULTS}\n✅ TypeScript: PASSED"
    else
        VERIFICATION_RESULTS="${VERIFICATION_RESULTS}\n❌ TypeScript: FAILED"
        VERIFICATION_PASSED=false
    fi
fi

# 3. Linting
echo ""
echo "📋 Step 3: Running linter..."

if [ -f ".eslintrc.json" ] || [ -f ".eslintrc.js" ] || [ -f ".eslintrc" ]; then
    echo "  → Found ESLint config"
    if npx eslint . --max-warnings=0 2>/dev/null; then
        VERIFICATION_RESULTS="${VERIFICATION_RESULTS}\n✅ ESLint: PASSED"
    else
        VERIFICATION_RESULTS="${VERIFICATION_RESULTS}\n⚠️ ESLint: WARNINGS (non-blocking)"
    fi
fi

# 4. Build check
echo ""
echo "📋 Step 4: Running build check..."

if [ -f "package.json" ] && grep -q '"build"' package.json 2>/dev/null; then
    echo "  → Found build script"
    if npm run build 2>/dev/null; then
        VERIFICATION_RESULTS="${VERIFICATION_RESULTS}\n✅ Build: PASSED"
    else
        VERIFICATION_RESULTS="${VERIFICATION_RESULTS}\n❌ Build: FAILED"
        VERIFICATION_PASSED=false
    fi
fi

# Summary
echo ""
echo "================================================"
echo "📊 Verification Summary:"
echo -e "$VERIFICATION_RESULTS"
echo ""

if [ "$VERIFICATION_PASSED" = true ]; then
    echo "✅ VERIFICATION_PASSED"
    echo ""
    echo "태스크를 완료로 표시해도 됩니다."
    exit 0
else
    echo "❌ VERIFICATION_FAILED"
    echo ""
    echo "⚠️ 경고: 일부 검증이 실패했습니다."
    echo "태스크를 완료로 표시하기 전에 문제를 해결하세요."
    exit 1
fi
