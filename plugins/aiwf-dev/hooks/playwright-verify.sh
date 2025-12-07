#!/bin/bash
# AIWF Playwright E2E Verification Hook
# Anthropic Long-Running Agent Pattern: 브라우저 자동화 검증
#
# 이 훅은 Playwright를 사용하여 E2E 테스트를 실행합니다.
# 세션 시작 시 또는 태스크 완료 전에 자동으로 실행됩니다.

set -e

echo "🎭 AIWF E2E Verification"
echo "========================"

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 결과 변수
E2E_PASSED=true
E2E_RESULTS=""

# 1. Playwright 설정 확인
echo ""
echo "📋 Step 1: Checking Playwright configuration..."

PLAYWRIGHT_CONFIG=""
if [ -f "playwright.config.ts" ]; then
    PLAYWRIGHT_CONFIG="playwright.config.ts"
elif [ -f "playwright.config.js" ]; then
    PLAYWRIGHT_CONFIG="playwright.config.js"
elif [ -f "playwright.config.mjs" ]; then
    PLAYWRIGHT_CONFIG="playwright.config.mjs"
fi

if [ -z "$PLAYWRIGHT_CONFIG" ]; then
    echo -e "${YELLOW}⚠️ No Playwright configuration found.${NC}"
    echo "   To enable E2E testing, run: npx playwright init"
    echo ""
    echo "E2E_SKIPPED"
    exit 0
fi

echo -e "${GREEN}✓${NC} Found: $PLAYWRIGHT_CONFIG"

# 2. 개발 서버 상태 확인
echo ""
echo "🌐 Step 2: Checking development server..."

# package.json에서 개발 서버 포트 추출 시도
DEV_PORT=${DEV_PORT:-3000}

# 커스텀 포트 확인 (환경 변수 또는 .env)
if [ -f ".env" ]; then
    PORT_FROM_ENV=$(grep -E "^PORT=" .env | cut -d'=' -f2)
    if [ -n "$PORT_FROM_ENV" ]; then
        DEV_PORT=$PORT_FROM_ENV
    fi
fi

# 서버 상태 확인
SERVER_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$DEV_PORT" 2>/dev/null || echo "000")

if [ "$SERVER_STATUS" = "200" ] || [ "$SERVER_STATUS" = "304" ]; then
    echo -e "${GREEN}✓${NC} Server running on port $DEV_PORT (HTTP $SERVER_STATUS)"
elif [ "$SERVER_STATUS" = "000" ]; then
    echo -e "${YELLOW}⚠️${NC} Server not responding on port $DEV_PORT"
    echo "   Make sure to start the development server before E2E tests."
    echo ""
    echo "   For example:"
    echo "   - npm run dev"
    echo "   - yarn dev"
    echo "   - pnpm dev"
    echo ""
    E2E_PASSED=false
    E2E_RESULTS="Server not running"
else
    echo -e "${GREEN}✓${NC} Server responding on port $DEV_PORT (HTTP $SERVER_STATUS)"
fi

# 3. Playwright 브라우저 설치 확인
echo ""
echo "🌍 Step 3: Checking Playwright browsers..."

if ! npx playwright --version > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️${NC} Playwright not installed."
    echo "   Run: npm install -D @playwright/test"
    echo "        npx playwright install"
    E2E_PASSED=false
    E2E_RESULTS="Playwright not installed"
fi

# 4. E2E 테스트 실행
echo ""
echo "🧪 Step 4: Running E2E tests..."

if [ "$E2E_PASSED" = true ]; then
    # 테스트 실행
    if npx playwright test --reporter=list 2>&1; then
        echo ""
        echo -e "${GREEN}✓${NC} All E2E tests passed!"
        E2E_RESULTS="All tests passed"
    else
        TEST_EXIT_CODE=$?
        echo ""
        echo -e "${RED}✗${NC} E2E tests failed (exit code: $TEST_EXIT_CODE)"
        E2E_PASSED=false
        E2E_RESULTS="Tests failed with exit code $TEST_EXIT_CODE"
    fi
fi

# 5. 결과 요약
echo ""
echo "========================"
echo "📊 E2E Verification Summary"
echo "========================"

if [ "$E2E_PASSED" = true ]; then
    echo -e "${GREEN}✅ E2E_VERIFICATION_PASSED${NC}"
    echo ""
    echo "Results: $E2E_RESULTS"
    echo ""
    exit 0
else
    echo -e "${RED}❌ E2E_VERIFICATION_FAILED${NC}"
    echo ""
    echo "Results: $E2E_RESULTS"
    echo ""
    echo "💡 Troubleshooting:"
    echo "   1. Start the development server: npm run dev"
    echo "   2. Install Playwright browsers: npx playwright install"
    echo "   3. Check test output above for specific failures"
    echo "   4. Run tests in debug mode: npx playwright test --debug"
    echo ""
    exit 1
fi
