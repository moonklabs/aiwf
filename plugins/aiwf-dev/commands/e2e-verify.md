---
description: Run E2E verification tests using Playwright for browser automation
---

# E2E 검증 도구

Playwright MCP를 활용한 브라우저 자동화 E2E 검증 도구입니다.

## 개요

이 도구는 Anthropic 장시간 에이전트 패턴의 "상태 검증" 단계를 자동화합니다.
세션 시작 시 또는 태스크 완료 후 브라우저에서 실제 기능이 작동하는지 확인합니다.

## 사용 시점

1. **세션 시작 시**: 개발 서버가 정상 작동하는지 확인
2. **기능 구현 후**: 새로 구현한 기능이 브라우저에서 작동하는지 확인
3. **태스크 완료 전**: 최종 E2E 검증

## 기본 검증 단계

### 1. 개발 서버 상태 확인

```bash
# 서버가 실행 중인지 확인
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
```

예상 결과: `200`

### 2. 기본 페이지 로드 테스트

Playwright를 사용하여:

```javascript
// 페이지 로드 확인
await page.goto('http://localhost:3000');
await expect(page).toHaveTitle(/.*App.*/);
```

### 3. 핵심 기능 테스트

프로젝트에 맞는 핵심 기능 테스트 실행:

```bash
# Playwright 테스트 실행
npx playwright test --reporter=list
```

## Playwright MCP 통합

### MCP 설정

`.claude/mcp.json`에 Playwright MCP 추가:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@anthropic/playwright-mcp-server"]
    }
  }
}
```

### MCP를 통한 검증

```markdown
Claude에게 요청:
"Playwright MCP를 사용하여 http://localhost:3000 페이지가
정상적으로 로드되는지 확인해주세요"
```

## 검증 체크리스트

### 세션 시작 검증

```yaml
E2E Session Start Verification:
  - [ ] 개발 서버 실행 중 (localhost:3000 또는 해당 포트)
  - [ ] 메인 페이지 로드 성공
  - [ ] 콘솔 에러 없음
  - [ ] 네트워크 에러 없음
```

### 기능 검증

```yaml
E2E Feature Verification:
  - [ ] 타겟 페이지 접근 가능
  - [ ] UI 요소 렌더링 완료
  - [ ] 사용자 상호작용 가능
  - [ ] 예상 결과 표시
  - [ ] 에러 상태 없음
```

## 검증 스크립트

### 자동 검증 훅

`./hooks/playwright-verify.sh` 실행:

```bash
#!/bin/bash
# E2E 검증 훅

# Playwright 설정 파일 존재 확인
if [ -f "playwright.config.ts" ] || [ -f "playwright.config.js" ]; then
    echo "🎭 Running Playwright E2E tests..."
    npx playwright test --reporter=list
    exit $?
else
    echo "⚠️ No Playwright configuration found. Skipping E2E tests."
    exit 0
fi
```

### 수동 검증 가이드

Playwright가 설정되지 않은 경우:

1. **브라우저 열기**
   ```bash
   open http://localhost:3000  # macOS
   xdg-open http://localhost:3000  # Linux
   ```

2. **콘솔 확인**
   - 브라우저 개발자 도구 열기 (F12)
   - Console 탭에서 에러 확인

3. **기능 테스트**
   - 구현한 기능 수동 테스트
   - 예상대로 작동하는지 확인

## 스크린샷 검증

Playwright MCP를 통한 스크린샷 기반 검증:

```markdown
Claude에게 요청:
"Playwright MCP로 http://localhost:3000/dashboard 페이지의
스크린샷을 찍고 UI가 정상적으로 렌더링되었는지 확인해주세요"
```

### 스크린샷 저장

```javascript
// 검증 스크린샷 저장
await page.screenshot({
  path: '.aiwf/10_STATE_OF_PROJECT/screenshots/verify-{date}.png',
  fullPage: true
});
```

## 결과 기록

검증 결과를 진행 파일에 기록:

```markdown
## E2E Verification Results

### Session: {session_id}
- **Timestamp**: 2024-01-15T14:30:00Z
- **Server Status**: ✓ Running
- **Page Load**: ✓ Success
- **Console Errors**: ✓ None
- **Feature Tests**: ✓ 3/3 Passed

### Screenshots
- [Dashboard](./screenshots/dashboard-20240115.png)
- [Login](./screenshots/login-20240115.png)
```

## 문제 해결

### 서버가 응답하지 않음

```bash
# 포트 확인
lsof -i :3000

# 서버 재시작
npm run dev
```

### Playwright 테스트 실패

```bash
# 디버그 모드로 실행
npx playwright test --debug

# 특정 테스트만 실행
npx playwright test tests/e2e/specific-test.spec.ts

# 브라우저 열어서 실행
npx playwright test --headed
```

### 스크린샷 비교 실패

```bash
# 스냅샷 업데이트
npx playwright test --update-snapshots
```

## 통합 워크플로우

```
세션 시작
    │
    ▼
┌─────────────────┐
│ /tools:e2e-verify│
│ 서버 상태 확인   │
└────────┬────────┘
         │
    ┌────┴────┐
    │ 성공?    │
    └────┬────┘
   YES   │   NO
    │    │    │
    ▼    │    ▼
작업 진행 │  서버 시작
    │    │    │
    └────┴────┘
         │
         ▼
    작업 루프
         │
         ▼
┌─────────────────┐
│ /tools:e2e-verify│
│ 기능 검증       │
└────────┬────────┘
         │
    ┌────┴────┐
    │ 성공?    │
    └────┬────┘
   YES   │   NO
    │    │    │
    ▼    │    ▼
태스크완료│  수정
         │
    세션 종료
```

## 주의사항

- **개발 서버 필수**: E2E 테스트 전 서버 실행 확인
- **포트 충돌**: 다른 프로세스가 포트 사용 중인지 확인
- **테스트 격리**: 각 테스트는 독립적으로 실행
- **타임아웃**: 네트워크 지연을 고려한 적절한 타임아웃 설정
