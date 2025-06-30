# aiwf 프로젝트 기여 가이드

aiwf (AI Workflow Framework) 프로젝트에 기여해 주셔서 감사합니다! 이 문서는 프로젝트에 효과적으로 기여하는 방법을 안내합니다.

## 목차

1. [기여하기 전에](#기여하기-전에)
2. [개발 환경 설정](#개발-환경-설정)
3. [기여 방법](#기여-방법)
4. [코드 스타일 가이드](#코드-스타일-가이드)
5. [테스트 작성](#테스트-작성)
6. [Pull Request 가이드](#pull-request-가이드)
7. [이슈 리포팅](#이슈-리포팅)
8. [커뮤니티 가이드라인](#커뮤니티-가이드라인)

## 기여하기 전에

### 프로젝트 이해

aiwf는 Claude Code와 통합된 AIWF 프로젝트 관리 프레임워크를 설치하는 NPM CLI 패키지입니다. 기여하기 전에 다음을 이해해 주세요:

- **목적**: AI 기반 개발 워크플로우 프레임워크 배포
- **대상 사용자**: Claude Code, Cursor, Windsurf 사용자
- **핵심 기능**: GitHub에서 프레임워크 다운로드 및 설치

### 행동강령

우리는 모든 기여자가 존중받고 포용적인 환경을 만들기 위해 다음 원칙을 따릅니다:

- **존중**: 모든 의견과 기여를 존중합니다
- **포용성**: 다양한 배경과 경험을 가진 기여자를 환영합니다
- **건설적 피드백**: 비판적 피드백도 건설적이고 도움이 되는 방향으로 제공합니다
- **협력**: 문제 해결을 위해 함께 협력합니다

## 개발 환경 설정

### 필수 요구사항

- **Node.js**: 14.0.0 이상
- **npm**: Node.js와 함께 설치됨
- **Git**: 최신 버전

### 초기 설정

```bash
# 1. 리포지토리 포크
# GitHub에서 https://github.com/aiwf/aiwf를 개인 계정으로 포크

# 2. 로컬에 클론
git clone https://github.com/YOUR_USERNAME/aiwf.git
cd aiwf

# 3. 원본 리포지토리를 upstream으로 추가
git remote add upstream https://github.com/aiwf/aiwf.git

# 4. 의존성 설치
npm install

# 5. 개발 환경 검증
node index.js --force  # 로컬 테스트 실행
npm test               # 테스트 실행 (설정 후)
npm run lint           # 코드 스타일 검사 (설정 후)
```

## 기여 방법

### 1. 이슈 기반 기여

가장 권장하는 기여 방법입니다:

1. **이슈 찾기**: [GitHub Issues](https://github.com/aiwf/aiwf/issues)에서 작업할 이슈 선택
2. **이슈 할당**: 댓글로 작업 의사 표현
3. **브랜치 생성**: `feature/issue-번호-간단한-설명` 형식

### 2. 새로운 기능 제안

새로운 기능을 제안하고 싶다면:

1. **이슈 생성**: Feature Request 템플릿 사용
2. **토론 참여**: 커뮤니티와 기능에 대해 논의
3. **승인 후 개발**: 승인된 후 개발 시작

### 3. 버그 수정

버그를 발견했다면:

1. **이슈 확인**: 이미 리포트된 버그인지 확인
2. **새 이슈 생성**: Bug Report 템플릿 사용
3. **재현 가능한 예제**: 최소한의 재현 가능한 예제 포함

## 코드 스타일 가이드

### JavaScript 스타일

```javascript
// 좋음: ES6+ 문법 사용
const apiUrl = "https://api.github.com";
const fetchData = async (url) => {
  try {
    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    console.error("API 호출 실패:", error);
    throw error;
  }
};

// 피하기: var 사용, 콜백 헬
var oldUrl = "https://api.github.com";
function fetchDataOld(url, callback) {
  // 구식 패턴
}
```

### 명명 규칙

- **변수/함수**: camelCase (`fetchGitHubContent`)
- **상수**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **파일명**: kebab-case (`github-api.js`)
- **클래스**: PascalCase (`GitHubClient`)

### 주석 가이드

```javascript
/**
 * GitHub API에서 리포지토리 내용을 가져옵니다.
 * @param {string} repoUrl - 리포지토리 URL
 * @param {string} path - 가져올 파일/디렉토리 경로
 * @returns {Promise<Object>} API 응답 데이터
 * @throws {Error} 네트워크 오류 또는 API 제한 시 발생
 */
async function fetchRepositoryContent(repoUrl, path) {
  // 입력 검증
  if (!repoUrl || !path) {
    throw new Error("리포지토리 URL과 경로는 필수입니다");
  }

  // API 호출 구현...
}
```

### ESLint 및 Prettier

프로젝트는 ESLint와 Prettier를 사용합니다:

```bash
# 코드 스타일 검사
npm run lint

# 자동 수정
npm run lint:fix

# 코드 포맷팅
npm run format
```

## 테스트 작성

### 테스트 철학

- **모든 새로운 기능**에는 테스트가 필요합니다
- **버그 수정** 시 해당 버그를 확인하는 테스트를 추가합니다
- **기존 테스트를 깨뜨리지** 않도록 합니다

### 테스트 구조

```javascript
// tests/unit/github-api.test.js
import { jest } from "@jest/globals";
import { fetchGitHubContent } from "../../index.js";

describe("GitHub API 함수들", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("fetchGitHubContent", () => {
    test("성공적으로 데이터를 가져와야 함", async () => {
      // Given (준비)
      const mockUrl = "https://api.github.com/repos/test/repo";
      const expectedData = { name: "test-repo" };

      // When (실행)
      const result = await fetchGitHubContent(mockUrl);

      // Then (검증)
      expect(result).toEqual(expectedData);
    });

    test("잘못된 URL에 대해 에러를 발생시켜야 함", async () => {
      // Given & When & Then
      await expect(fetchGitHubContent("invalid-url")).rejects.toThrow(
        "올바르지 않은 URL입니다"
      );
    });
  });
});
```

### 테스트 실행

```bash
# 모든 테스트 실행
npm test

# 감시 모드로 실행
npm run test:watch

# 커버리지 포함
npm run test:coverage
```

## Pull Request 가이드

### PR 생성 전 체크리스트

- [ ] 최신 `develop` 브랜치로부터 생성된 브랜치
- [ ] 모든 테스트 통과 (`npm test`)
- [ ] 린팅 검사 통과 (`npm run lint`)
- [ ] 관련된 기존 이슈가 있다면 링크 포함
- [ ] 변경사항에 대한 테스트 추가

### PR 제목 형식

```
<type>(<scope>): <description>

예시:
feat(cli): GitHub API 재시도 로직 추가
fix(installer): 백업 파일 타임스탬프 오류 수정
docs(readme): 설치 가이드 업데이트
```

### PR 설명 템플릿

```markdown
## 변경사항 요약

<!-- 이 PR에서 무엇을 변경했는지 간단히 설명 -->

## 관련 이슈

<!-- 관련된 이슈가 있다면 링크 -->

Closes #123

## 변경 유형

- [ ] 버그 수정 (기존 기능을 깨뜨리지 않는 변경사항)
- [ ] 새로운 기능 (기존 기능을 깨뜨리지 않는 새로운 기능)
- [ ] Breaking change (기존 기능에 영향을 주는 변경사항)
- [ ] 문서 업데이트

## 테스트 방법

<!-- 이 변경사항을 어떻게 테스트했는지 설명 -->

1. 단계 1
2. 단계 2
3. 예상 결과

## 스크린샷 (해당하는 경우)

<!-- 시각적 변경사항이 있다면 스크린샷 포함 -->

## 추가 참고사항

<!-- 리뷰어가 알아야 할 추가 정보 -->
```

### 코드 리뷰 과정

1. **자동 검사**: GitHub Actions가 자동으로 테스트 실행
2. **코드 리뷰**: 프로젝트 유지보수자가 코드 검토
3. **피드백 대응**: 리뷰 댓글에 적극적으로 응답
4. **승인 및 머지**: 승인 후 squash merge로 병합

## 이슈 리포팅

### 버그 리포트

다음 정보를 포함해 주세요:

```markdown
## 버그 설명

<!-- 버그에 대한 명확하고 간단한 설명 -->

## 재현 단계

1. '...'로 이동
2. '...'를 클릭
3. 아래로 스크롤하여 '...'를 확인
4. 오류 발생

## 예상 동작

<!-- 예상했던 동작에 대한 설명 -->

## 실제 동작

<!-- 실제로 일어난 일에 대한 설명 -->

## 환경

- OS: [예: macOS 12.0]
- Node.js 버전: [예: 18.0.0]
- aiwf 버전: [예: 1.0.0]

## 추가 컨텍스트

<!-- 문제에 대한 추가 정보나 스크린샷 -->
```

### 기능 요청

```markdown
## 기능 설명

<!-- 원하는 기능에 대한 설명 -->

## 문제점

<!-- 이 기능이 해결할 문제에 대한 설명 -->

## 제안하는 해결책

<!-- 어떻게 구현되었으면 하는지에 대한 설명 -->

## 대안

<!-- 고려한 다른 해결책들 -->

## 추가 컨텍스트

<!-- 기능 요청에 대한 추가 정보나 스크린샷 -->
```

## 커뮤니티 가이드라인

### 소통 채널

- **GitHub Issues**: 버그 리포트, 기능 요청
- **GitHub Discussions**: 일반적인 질문, 아이디어 논의
- **Pull Request**: 코드 리뷰, 기술적 논의

### 질문하기

좋은 질문을 위한 가이드:

1. **검색 먼저**: 이미 답변된 질문인지 확인
2. **구체적으로**: 애매한 질문보다는 구체적인 상황 설명
3. **재현 가능한 예제**: 문제를 재현할 수 있는 최소한의 예제 제공
4. **환경 정보**: OS, Node.js 버전, aiwf 버전 등

### 답변하기

다른 기여자의 질문에 답변할 때:

1. **친절하게**: 초보자도 이해하기 쉽게 설명
2. **정확하게**: 확실하지 않다면 "잘 모르겠다"고 솔직히 말하기
3. **완전하게**: 부분적인 답변보다는 완전한 해결책 제시

## 릴리스 과정

### 버전 관리

aiwf는 [Semantic Versioning](https://semver.org/)을 따릅니다:

- **MAJOR**: 호환되지 않는 API 변경
- **MINOR**: 기존 기능과 호환되는 새로운 기능
- **PATCH**: 기존 기능과 호환되는 버그 수정

### 릴리스 일정

- **메이저 릴리스**: 필요에 따라 (Breaking changes)
- **마이너 릴리스**: 월 1회 또는 주요 기능 완성 시
- **패치 릴리스**: 중요한 버그 수정 시 수시로

## 도구 및 리소스

### 개발 도구

- **IDE**: VS Code, Cursor, Windsurf (Claude Code 지원)
- **터미널**: 현대적인 터미널 (zsh, fish 등)
- **Git GUI**: SourceTree, GitHub Desktop 등 (선택사항)

### 학습 리소스

- [Node.js 공식 문서](https://nodejs.org/docs/)
- [Jest 테스팅 가이드](https://jestjs.io/docs/getting-started)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Flow](https://guides.github.com/introduction/flow/)

## 인정과 감사

기여해 주신 모든 분들께 감사드립니다! 주요 기여자들은 다음에서 확인할 수 있습니다:

- [Contributors 페이지](https://github.com/aiwf/aiwf/graphs/contributors)
- [릴리스 노트](https://github.com/aiwf/aiwf/releases)에서 각 릴리스별 기여자 언급

---

궁금한 점이 있으시면 언제든지 [이슈를 생성](https://github.com/aiwf/aiwf/issues/new)하거나 [토론](https://github.com/aiwf/aiwf/discussions)에 참여해 주세요!

함께 더 나은 aiwf를 만들어 나가요! 🚀
