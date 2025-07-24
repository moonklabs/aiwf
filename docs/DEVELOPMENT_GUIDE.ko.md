# aiwf 개발 가이드

aiwf (AI Workflow Framework)는 Claude Code와 통합된 AIWF 프로젝트 관리 프레임워크를 설치하는 NPM CLI 패키지입니다. 이 문서는 aiwf 프로젝트에 기여하고자 하는 개발자들을 위한 종합적인 개발 환경 설정 및 워크플로우 가이드입니다.

## 목차

1. [시작하기](#1-시작하기)
2. [개발 도구 설정](#2-개발-도구-설정)
3. [개발 워크플로우](#3-개발-워크플로우)
4. [코딩 표준](#4-코딩-표준)
5. [테스트 작성](#5-테스트-작성)
6. [CI/CD 파이프라인](#6-cicd-파이프라인)
7. [문제 해결](#7-문제-해결)
8. [기여하기](#8-기여하기)

---

## 1. 시작하기

### 1.1 개발 환경 요구사항

aiwf 프로젝트 개발을 위해 다음 도구들이 필요합니다:

- **Node.js**: 14.0.0 이상 (ES 모듈 지원)
- **npm**: Node.js와 함께 설치됨
- **Git**: 버전 관리
- **추천 IDE**: VS Code, Cursor, 또는 Windsurf

### 1.2 프로젝트 클론 및 설정

```bash
# 1. 리포지토리 클론
git clone https://github.com/moonklabs/aiwf.git
cd aiwf

# 2. 의존성 설치
npm install

# 3. 로컬 테스트 실행
node index.js --force

# 4. 개발 환경 검증
npm test  # Jest 테스트 실행 (설정 후)
npm run lint  # ESLint 검사 (설정 후)
```

### 1.3 프로젝트 구조 이해

```
aiwf/
├── src/                    # 소스 코드 디렉토리
│   ├── cli/               # CLI 진입점 및 도구
│   ├── commands/          # AIWF 명령어 구현
│   ├── lib/               # 핵심 라이브러리 모듈
│   └── utils/             # 유틸리티 함수
├── ai-tools/              # AI 도구별 설정
├── config/                # 설정 파일
├── docs/                  # 프로젝트 문서
├── feature-ledger/        # 기능 추적 시스템
├── hooks/                 # Git hooks
├── personas/              # AI 페르소나 정의
├── templates/             # 프로젝트 템플릿
├── tests/                 # 테스트 스위트
├── package.json           # NPM 설정
└── CLAUDE.md             # Claude Code 가이드
```

---

## 2. 개발 도구 설정

### 2.1 VS Code 설정

`.vscode/settings.json` 생성:

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "files.exclude": {
    "node_modules": true,
    ".aiwf/backup_*": true
  },
  "eslint.validate": ["javascript"],
  "javascript.preferences.importModuleSpecifier": "relative"
}
```

### 2.2 ESLint 설정

`.eslintrc.json` 생성:

```json
{
  "env": {
    "es2021": true,
    "node": true
  },
  "extends": ["eslint:recommended"],
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "rules": {
    "indent": ["error", 2],
    "quotes": ["error", "single"],
    "semi": ["error", "always"]
  }
}
```

### 2.3 Git Hooks 설정

```bash
# Git hooks 설치
./hooks/install-hooks.sh

# 또는 수동 설치
cp hooks/pre-commit .git/hooks/
cp hooks/post-commit .git/hooks/
chmod +x .git/hooks/*
```

---

## 3. 개발 워크플로우

### 3.1 브랜치 전략

```bash
# 기능 브랜치 생성
git checkout -b feature/your-feature-name

# 버그 수정 브랜치
git checkout -b fix/bug-description

# 문서 업데이트 브랜치
git checkout -b docs/update-description
```

### 3.2 개발 프로세스

1. **기능 계획**
   ```bash
   # Feature Ledger에 새 기능 추가
   node commands/feature-create.js "새 기능 설명"
   ```

2. **구현**
   ```bash
   # 코드 작성
   # 테스트 작성
   # 문서 업데이트
   ```

3. **테스트**
   ```bash
   npm test
   npm run test:watch  # 감시 모드
   ```

4. **커밋**
   ```bash
   # Feature ID와 함께 커밋
   git commit -m "feat(FL001): 새 기능 구현"
   ```

### 3.3 디버깅

```bash
# Node.js 디버거로 실행
node --inspect index.js

# VS Code 디버그 설정 (.vscode/launch.json)
{
  "version": "0.2.0",
  "configurations": [{
    "type": "node",
    "request": "launch",
    "name": "Debug AIWF",
    "program": "${workspaceFolder}/index.js",
    "args": ["--force"],
    "console": "integratedTerminal"
  }]
}
```

---

## 4. 코딩 표준

### 4.1 명명 규칙

```javascript
// 파일명: kebab-case
// create-project.js, resource-loader.js

// 클래스명: PascalCase
class ResourceLoader {}
class EngineeringGuard {}

// 함수/변수명: camelCase
function createProject() {}
const projectRoot = '/path/to/project';

// 상수: UPPER_SNAKE_CASE
const MAX_RETRIES = 3;
const DEFAULT_TIMEOUT = 5000;
```

### 4.2 ES 모듈 사용

```javascript
// 올바른 예시
import fs from 'fs/promises';
import path from 'path';
import { createRequire } from 'module';

// 잘못된 예시 (CommonJS)
const fs = require('fs');  // 사용하지 않음
```

### 4.3 비동기 프로그래밍

```javascript
// async/await 선호
async function loadResource(path) {
  try {
    const data = await fs.readFile(path, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Failed to load resource: ${path}`, error);
    throw error;
  }
}

// Promise 체이닝보다 async/await 사용
```

### 4.4 오류 처리

```javascript
// 구체적인 오류 메시지
throw new Error(`File not found: ${filePath}`);

// 오류 타입 구분
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}
```

---

## 5. 테스트 작성

### 5.1 단위 테스트

```javascript
// tests/unit/resource-loader.test.js
import { describe, it, expect, jest } from '@jest/globals';
import ResourceLoader from '../../src/lib/resource-loader.js';

describe('ResourceLoader', () => {
  it('should load bundled resources', async () => {
    const loader = new ResourceLoader();
    const resource = await loader.loadResource('personas/architect.json');
    expect(resource).toBeDefined();
    expect(resource.name).toBe('architect');
  });
});
```

### 5.2 통합 테스트

```javascript
// tests/integration/cli.test.js
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

describe('CLI Integration', () => {
  it('should install AIWF successfully', async () => {
    const { stdout } = await execAsync('node index.js --force');
    expect(stdout).toContain('AIWF installed successfully');
  });
});
```

### 5.3 테스트 커버리지

```bash
# 커버리지 보고서 생성
npm run test:coverage

# 커버리지 임계값 설정 (package.json)
"jest": {
  "coverageThreshold": {
    "global": {
      "branches": 80,
      "functions": 80,
      "lines": 80,
      "statements": 80
    }
  }
}
```

---

## 6. CI/CD 파이프라인

### 6.1 GitHub Actions 워크플로우

`.github/workflows/ci.yml`:

```yaml
name: CI
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [14.x, 16.x, 18.x]
    
    steps:
    - uses: actions/checkout@v3
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
    
    - run: npm ci
    - run: npm test
    - run: npm run lint
```

### 6.2 릴리스 프로세스

```bash
# 버전 업데이트
npm version patch  # 0.3.11 -> 0.3.12
npm version minor  # 0.3.12 -> 0.4.0
npm version major  # 0.4.0 -> 1.0.0

# 릴리스 태그 생성
git tag -a v0.3.12 -m "Release v0.3.12"
git push origin v0.3.12

# NPM 배포
npm publish
```

---

## 7. 문제 해결

### 7.1 일반적인 문제

**ES 모듈 오류**
```bash
# package.json에 "type": "module" 확인
# import 문에서 파일 확장자 포함
```

**권한 오류**
```bash
# 실행 권한 부여
chmod +x index.js
chmod +x src/cli/*.js
```

**캐시 문제**
```bash
# npm 캐시 정리
npm cache clean --force
rm -rf node_modules
npm install
```

### 7.2 디버깅 팁

```javascript
// 상세 로깅 활성화
const DEBUG = process.env.DEBUG === 'true';
if (DEBUG) console.log('Debug info:', data);

// 실행 시간 측정
console.time('operation');
await someOperation();
console.timeEnd('operation');
```

---

## 8. 기여하기

### 8.1 기여 프로세스

1. **이슈 생성**: 버그 리포트나 기능 제안
2. **포크 및 브랜치**: 자신의 저장소에서 작업
3. **개발**: 코딩 표준 준수
4. **테스트**: 모든 테스트 통과 확인
5. **PR 생성**: 상세한 설명과 함께

### 8.2 PR 체크리스트

- [ ] 모든 테스트 통과
- [ ] 새 기능에 대한 테스트 추가
- [ ] 문서 업데이트
- [ ] CHANGELOG.md 업데이트
- [ ] 린트 오류 없음
- [ ] 커밋 메시지 규칙 준수

### 8.3 코드 리뷰 가이드라인

- 건설적인 피드백 제공
- 코드 스타일보다 로직에 집중
- 개선 제안 시 예시 포함
- 긍정적인 부분도 언급

---

## 추가 리소스

- [AIWF 공식 문서](https://github.com/moonklabs/aiwf/docs)
- [Node.js ES 모듈 가이드](https://nodejs.org/api/esm.html)
- [Jest 테스팅 가이드](https://jestjs.io/docs/getting-started)
- [GitHub Actions 문서](https://docs.github.com/en/actions)

---

이 가이드는 지속적으로 업데이트됩니다. 개선 사항이나 제안이 있으면 이슈를 생성해 주세요.