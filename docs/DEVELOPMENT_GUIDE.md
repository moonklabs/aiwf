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
├── index.js                    # 메인 CLI 실행 파일
├── package.json               # NPM 패키지 설정
├── claude-code/aiwf/      # AIWF 프레임워크 소스
│   ├── .claude/commands/       # Claude Code 커스텀 명령어
│   └── .aiwf/            # 프로젝트 관리 구조
├── rules/                     # IDE별 개발 규칙
│   ├── global/                # 항상 적용되는 규칙
│   └── manual/                # 필요시 적용하는 규칙
├── docs/                      # 프로젝트 문서
├── tests/                     # 테스트 파일 (생성 예정)
└── scripts/                   # 빌드/배포 스크립트
```

---

## 2. 개발 도구 설정

### 2.1 Jest 테스트 프레임워크 설정

aiwf는 ES 모듈 기반 프로젝트이므로 Jest 설정 시 ES 모듈 지원이 필요합니다.

#### 설치

```bash
npm install --save-dev jest @jest/globals
```

#### jest.config.js 설정

```javascript
export default {
  preset: "jest-esm",
  extensionsToTreatAsEsm: [".js"],
  globals: {
    "ts-jest": {
      useESM: true,
    },
  },
  moduleNameMapping: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  transform: {},
  testEnvironment: "node",
  collectCoverageFrom: ["index.js", "!node_modules/**", "!coverage/**"],
  coverageReporters: ["text", "lcov", "html"],
  testMatch: ["<rootDir>/tests/**/*.test.js"],
};
```

#### package.json 테스트 스크립트

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --watchAll=false"
  }
}
```

### 2.2 ESLint & Prettier 설정

코드 품질과 일관성을 위한 린팅 및 포맷팅 도구 설정입니다.

#### 설치

```bash
npm install --save-dev eslint prettier eslint-config-prettier eslint-plugin-prettier
```

#### .eslintrc.json 설정

```json
{
  "env": {
    "es2022": true,
    "node": true,
    "jest": true
  },
  "extends": ["eslint:recommended", "prettier"],
  "plugins": ["prettier"],
  "parserOptions": {
    "ecmaVersion": 2022,
    "sourceType": "module"
  },
  "rules": {
    "prettier/prettier": "error",
    "no-console": "off",
    "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

#### .prettierrc 설정

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

#### package.json 린팅 스크립트

```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write ."
  }
}
```

### 2.3 IDE 통합 설정

#### VS Code 설정 (.vscode/settings.json)

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": ["javascript"],
  "files.associations": {
    "*.md": "markdown"
  }
}
```

---

## 3. 개발 워크플로우

### 3.1 Git 브랜치 전략

aiwf 프로젝트는 Git Flow 기반의 브랜치 전략을 사용합니다:

- **main**: 프로덕션 준비 코드
- **develop**: 개발용 통합 브랜치
- **feature/**: 기능 개발 브랜치
- **hotfix/**: 긴급 수정 브랜치
- **release/**: 릴리스 준비 브랜치

#### 기능 개발 워크플로우

```bash
# 1. develop 브랜치에서 기능 브랜치 생성
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name

# 2. 개발 진행
# 코드 작성 및 테스트

# 3. 변경사항 커밋
git add .
git commit -m "feat: 새로운 기능 설명"

# 4. 원격 저장소에 푸시
git push origin feature/your-feature-name

# 5. Pull Request 생성
# GitHub에서 PR 생성하여 코드 리뷰 요청
```

### 3.2 커밋 메시지 컨벤션

Conventional Commits 형식을 따릅니다:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

#### 커밋 타입

- **feat**: 새로운 기능 추가
- **fix**: 버그 수정
- **docs**: 문서 변경
- **style**: 코드 포맷팅 변경
- **refactor**: 코드 리팩토링
- **test**: 테스트 추가/수정
- **chore**: 빌드 과정 또는 도구 변경

#### 예시

```bash
feat(cli): GitHub API 에러 처리 개선
fix(installer): 백업 파일 생성 시 타임스탬프 오류 수정
docs(readme): 설치 가이드 업데이트
```

### 3.3 코드 리뷰 프로세스

1. **자체 검토**: PR 생성 전 자신의 코드 검토
2. **테스트 통과**: 모든 테스트가 통과하는지 확인
3. **린팅 통과**: ESLint 및 Prettier 검사 통과
4. **PR 생성**: 명확한 제목과 설명으로 PR 생성
5. **리뷰 대응**: 리뷰어의 피드백에 적극적으로 대응
6. **승인 후 머지**: 승인 받은 후 squash merge 수행

---

## 4. 코딩 표준

### 4.1 JavaScript/ES6+ 스타일 가이드

#### 변수 선언

```javascript
// 좋음: const 우선 사용
const apiUrl = "https://api.github.com";
let mutableValue = 0;

// 피하기: var 사용 금지
var oldStyle = "avoid";
```

#### 함수 선언

```javascript
// 좋음: 화살표 함수 사용
const fetchData = async (url) => {
  try {
    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    console.error("데이터 가져오기 실패:", error);
    throw error;
  }
};

// 좋음: 명시적 함수 선언
function processData(data) {
  return data.filter((item) => item.isValid);
}
```

#### 객체와 배열

```javascript
// 좋음: 구조 분해 할당 사용
const { name, version } = packageJson;
const [first, ...rest] = items;

// 좋음: 스프레드 연산자 사용
const newObject = { ...existingObject, newProperty: "value" };
const newArray = [...existingArray, newItem];
```

### 4.2 파일 및 디렉토리 명명 규칙

- **파일명**: kebab-case 또는 camelCase
  - `github-api.js`, `fileOperations.js`
- **디렉토리명**: kebab-case
  - `test-fixtures/`, `github-api/`
- **상수**: UPPER_SNAKE_CASE
  - `const API_BASE_URL = 'https://api.github.com';`

### 4.3 주석 및 문서화

```javascript
/**
 * GitHub API에서 파일 콘텐츠를 가져옵니다.
 * @param {string} url - GitHub API URL
 * @param {Object} options - 요청 옵션
 * @returns {Promise<Object>} API 응답 데이터
 * @throws {Error} 네트워크 또는 API 오류 시 발생
 */
async function fetchGitHubContent(url, options = {}) {
  // 구현 내용...
}

// 복잡한 로직에 대한 인라인 주석
const backupTimestamp = new Date().toISOString().replace(/[:.]/g, "-");
// ISO 문자열에서 파일명에 사용할 수 없는 문자들을 대시로 변경
```

### 4.4 에러 처리 가이드라인

```javascript
// 좋음: 구체적인 에러 처리
try {
  const result = await someAsyncOperation();
  return result;
} catch (error) {
  if (error.code === "ENOENT") {
    console.error("파일을 찾을 수 없습니다:", error.path);
  } else if (error.code === "EACCES") {
    console.error("파일 접근 권한이 없습니다:", error.path);
  } else {
    console.error("예상치 못한 오류:", error.message);
  }

  throw new Error(`작업 실패: ${error.message}`);
}
```

---

## 5. 테스트 작성

### 5.1 테스트 디렉토리 구조

```
tests/
├── unit/                       # 단위 테스트
│   ├── github-api.test.js
│   ├── file-operations.test.js
│   └── cli-interface.test.js
├── integration/                # 통합 테스트
│   └── installer.test.js
├── fixtures/                   # 테스트 데이터
│   ├── mock-github-response.json
│   └── sample-project-structure/
└── helpers/                    # 테스트 헬퍼
    ├── test-utils.js
    └── mock-setup.js
```

### 5.2 단위 테스트 작성 가이드

```javascript
// github-api.test.js
import { jest } from "@jest/globals";
import { fetchGitHubContent } from "../../index.js";

// 네트워크 호출 모킹
jest.mock("https");

describe("GitHub API functions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("fetchGitHubContent", () => {
    test("성공적으로 데이터를 가져와야 함", async () => {
      // Given
      const mockUrl = "https://api.github.com/repos/test/repo";
      const mockResponse = { name: "test-repo" };

      // Mock 설정
      // ...

      // When
      const result = await fetchGitHubContent(mockUrl);

      // Then
      expect(result).toEqual(mockResponse);
    });

    test("네트워크 오류 시 적절한 에러를 발생시켜야 함", async () => {
      // Given & When & Then
      await expect(fetchGitHubContent("invalid-url")).rejects.toThrow(
        "네트워크 오류"
      );
    });
  });
});
```

### 5.3 통합 테스트 작성 가이드

```javascript
// installer.test.js
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe("Installer Integration Tests", () => {
  let tempDir;

  beforeEach(async () => {
    // 임시 디렉토리 생성
    tempDir = await fs.mkdtemp(path.join(__dirname, "temp-"));
  });

  afterEach(async () => {
    // 임시 디렉토리 정리
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  test("전체 설치 프로세스가 정상 동작해야 함", async () => {
    // 전체 설치 프로세스 테스트
    // ...
  });
});
```

### 5.4 테스트 베스트 프랙티스

1. **AAA 패턴**: Arrange, Act, Assert 구조 사용
2. **명확한 테스트명**: 테스트가 무엇을 검증하는지 명확히 표현
3. **독립성**: 각 테스트는 독립적으로 실행 가능해야 함
4. **모킹**: 외부 의존성은 적절히 모킹하여 테스트 안정성 확보
5. **커버리지**: 중요한 비즈니스 로직은 높은 커버리지 유지

---

## 6. CI/CD 파이프라인

### 6.1 GitHub Actions 워크플로우

aiwf 프로젝트는 GitHub Actions를 사용하여 CI/CD를 구성합니다.

#### .github/workflows/ci.yml

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [14.x, 16.x, 18.x]

    steps:
      - uses: actions/checkout@v3

      - name: Node.js ${{ matrix.node-version }} 설정
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
          cache: "npm"

      - name: 의존성 설치
        run: npm ci

      - name: 린팅 검사
        run: npm run lint

      - name: 테스트 실행
        run: npm run test:ci

      - name: 커버리지 업로드
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v3

      - name: Node.js 설정
        uses: actions/setup-node@v3
        with:
          node-version: "18.x"
          registry-url: "https://registry.npmjs.org"

      - name: 의존성 설치
        run: npm ci

      - name: NPM 배포
        run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### 6.2 배포 프로세스

1. **자동 배포**: main 브랜치에 머지 시 자동으로 NPM에 배포
2. **버전 관리**: semantic versioning 사용
3. **릴리스 노트**: GitHub Releases를 통한 변경사항 문서화

### 6.3 모니터링 및 알림

- **빌드 상태**: GitHub Actions 배지를 통한 빌드 상태 확인
- **커버리지**: Codecov를 통한 테스트 커버리지 모니터링
- **의존성 보안**: Dependabot을 통한 의존성 보안 검사

---

## 7. 문제 해결

### 7.1 일반적인 설치 문제

#### Node.js 버전 문제

```bash
# 문제: Node.js 버전이 14.0.0 미만
# 해결: nvm을 사용하여 적절한 버전 설치
nvm install 18
nvm use 18
```

#### 권한 문제

```bash
# 문제: npm install 시 권한 오류
# 해결: npm 글로벌 디렉토리 권한 변경
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH
```

### 7.2 테스트 관련 문제 해결

#### ES 모듈 관련 오류

```javascript
// 문제: Jest에서 ES 모듈을 인식하지 못함
// 해결: jest.config.js에서 ES 모듈 설정 확인

// package.json에 다음 추가
{
  "type": "module",
  "jest": {
    "preset": "jest-esm"
  }
}
```

#### 네트워크 테스트 불안정성

```javascript
// 문제: GitHub API 호출 테스트가 불안정함
// 해결: 적절한 모킹과 타임아웃 설정

jest.setTimeout(10000); // 10초 타임아웃

// 네트워크 호출 모킹
jest.mock("https", () => ({
  request: jest.fn(),
}));
```

### 7.3 빌드 및 배포 문제

#### GitHub Actions 실패

```yaml
# 문제: CI 파이프라인에서 테스트 실패
# 해결: 로컬에서 CI 환경과 동일한 조건으로 테스트

# 로컬에서 CI 테스트 실행
npm run test:ci

# 환경 변수 확인
env | grep NODE
```

### 7.4 IDE 설정 문제

#### VS Code에서 ESLint 동작하지 않음

```json
// .vscode/settings.json
{
  "eslint.workingDirectories": ["./"],
  "eslint.validate": ["javascript"]
}
```

---

## 8. 기여하기

### 8.1 기여 가이드라인

aiwf 프로젝트에 기여하기 위한 단계별 가이드입니다.

#### 첫 번째 기여 준비

1. **이슈 확인**: GitHub Issues에서 작업할 이슈 선택
2. **포크 생성**: 개인 계정으로 프로젝트 포크
3. **로컬 설정**: 개발 환경 설정 및 테스트 실행
4. **브랜치 생성**: feature/issue-번호-설명 형식으로 브랜치 생성

#### 코드 작성 가이드

1. **코딩 표준 준수**: ESLint 및 Prettier 규칙 따르기
2. **테스트 작성**: 새로운 기능에 대한 테스트 포함
3. **문서 업데이트**: 필요시 관련 문서 업데이트
4. **커밋 메시지**: Conventional Commits 형식 준수

### 8.2 코드 리뷰 기준

#### 리뷰어 체크리스트

- [ ] 코딩 표준 준수 여부
- [ ] 테스트 커버리지 적절성
- [ ] 에러 처리 적절성
- [ ] 성능 영향 고려
- [ ] 보안 취약점 여부
- [ ] 문서화 완성도

#### 기여자 체크리스트

- [ ] 모든 테스트 통과
- [ ] 린팅 검사 통과
- [ ] 브랜치 최신 상태 유지
- [ ] PR 설명 명확히 작성
- [ ] 관련 이슈 링크 포함

### 8.3 커뮤니티 가이드라인

#### 행동강령

1. **존중**: 모든 기여자를 존중하고 건설적인 피드백 제공
2. **포용성**: 다양한 배경의 기여자들을 환영
3. **투명성**: 의사결정 과정을 투명하게 공유
4. **협력**: 문제 해결을 위한 협력적 자세 유지

#### 커뮤니케이션 채널

- **GitHub Issues**: 버그 리포트 및 기능 요청
- **GitHub Discussions**: 일반적인 토론 및 질문
- **Pull Requests**: 코드 리뷰 및 기술적 논의

---

## 부록

### A. 유용한 명령어

```bash
# 프로젝트 초기 설정
npm install
npm run setup  # 개발 환경 초기 설정 (구현 예정)

# 개발 중 자주 사용하는 명령어
npm run dev     # 개발 모드 실행
npm test        # 테스트 실행
npm run lint    # 린팅 검사
npm run format  # 코드 포맷팅

# 배포 관련
npm run build   # 프로덕션 빌드
npm run release # 릴리스 준비 (구현 예정)
```

### B. 참고 자료

- [Node.js 공식 문서](https://nodejs.org/docs/)
- [Jest 공식 문서](https://jestjs.io/docs/getting-started)
- [ESLint 공식 문서](https://eslint.org/docs/user-guide/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Actions 문서](https://docs.github.com/en/actions)

### C. 문의 및 지원

프로젝트 관련 문의나 지원이 필요한 경우:

1. **GitHub Issues**: 버그 리포트 및 기능 요청
2. **GitHub Discussions**: 일반적인 질문 및 토론
3. **이메일**: 긴급한 보안 문제 등

---

이 문서는 aiwf 프로젝트의 발전과 함께 지속적으로 업데이트됩니다. 개선 사항이나 추가할 내용이 있다면 언제든지 기여해 주세요!
