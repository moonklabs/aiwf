# 테스트 실행 및 일반적인 문제 수정

다음 지시사항을 위에서 아래로 순서대로 따르세요.

## 정확히 다음 4개 항목으로 TODO 생성

1. 테스트 스위트 실행
2. 결과 분석 및 문제 식별
3. 발견된 일반적인 문제 수정
4. 테스트 요약 제공

---

## 1 · 테스트 스위트 실행

### 먼저 프로젝트의 테스트 러너 감지:

1. **Python 프로젝트:**

   - `[tool.poetry]`가 있는 `pyproject.toml`이 존재하면: `poetry run pytest` 시도
   - `setup.py` 또는 `requirements.txt`가 있으면: `pytest` 또는 `python -m pytest` 시도
   - 커스텀 테스트 스크립트 존재시 (예: `run_tests.py`, `run_dev.py`): 해당 스크립트 사용
   - 일반적인 플래그 추가: pytest용 `--tb=short`

2. **JavaScript/TypeScript 프로젝트:**

   - `package.json`이 존재하면: "scripts" 섹션에서 "test" 명령어 확인
   - 일반적인 명령어: `npm test`, `npm run test`, `yarn test`, `pnpm test`
   - 프레임워크별: `jest`, `vitest`, `mocha`

3. **기타 언어:**
   - Rust: `cargo test`
   - Go: `go test ./...`
   - Java: `mvn test` 또는 `gradle test`
   - Ruby: `bundle exec rspec` 또는 `rake test`
   - PHP: `composer test` 또는 `phpunit`

### 감지된 테스트 명령어 실행:

- 적절한 테스트 명령어 실행
- 오류를 포함한 전체 출력 캡처
- 실행 시간 및 테스트 개수 기록

**테스트 러너를 찾을 수 없는 경우:** 사용자에게 보고하고 올바른 테스트 명령어 요청

## 2 · Analyze results and identify issues

Check for common issues in this order:

### Language-specific issues:

**Python:**

- Missing **init**.py files (import errors, tests not discovered)
- Import path problems
- Fixture issues (pytest)
- Virtual environment problems

**JavaScript/TypeScript:**

- Module resolution errors
- Missing dependencies in node_modules
- Jest/Vitest configuration issues
- TypeScript compilation errors

**Common across languages:**

- Environment variable issues (missing config)
- Database/external service connection errors
- File path problems (absolute vs relative)
- Permission issues

## 3 · Fix common problems if found

**ONLY** fix these specific issues automatically:\*\*

### Python-specific fixes:

- CREATE empty `__init__.py` files where needed
- FIX simple import path issues
- ADD missing test directory to Python path if needed

### JavaScript/TypeScript fixes:

- RUN `npm install` if node_modules missing
- FIX simple module resolution in jest.config.js
- CREATE missing test setup files

### General fixes:

- CREATE missing test directories
- FIX file permissions if possible
- IDENTIFY missing env vars and inform user

**DO NOT** fix:

- Actual test logic failures
- Business logic bugs
- Complex configuration issues
- Database schema problems
- External service dependencies

## 4 · Provide test summary

Create a brief summary:

```
Test Results:
- Total: X tests
- Passed: Y (Z%)
- Failed: A
- Skipped: B
- Time: C seconds

Issues Fixed:
- [List any fixes applied]

Issues Found (requires manual fix):
- [List problems that need attention]

Status: PASSING | FAILING | BLOCKED
```

**IMPORTANT:** Keep it concise. This command should be quick and focused on running tests, not detailed analysis.
EOF < /dev/null
