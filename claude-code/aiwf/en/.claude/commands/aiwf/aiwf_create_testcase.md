# 프로젝트 테스트 케이스 병렬 생성 커맨드

이 커맨드는 프로젝트의 소스 코드를 분석하여 포괄적인 테스트(단위/통합/E2E)를 병렬로 생성합니다.

## 사용법

```bash
/aiwf:aiwf_create_testcase [test_type] [subagent_count]
```

**파라미터:**
- `test_type` (선택사항): 생성할 테스트 타입 (기본값: unit)
  - `unit`: 단위 테스트
  - `e2e`: End-to-End 테스트
  - `integration`: 통합 테스트
  - `all`: 모든 종류의 테스트
- `subagent_count` (선택사항): 생성할 Subagent 수 (기본값: 5, 최대: 10)

## 예시

```bash
# 기본 단위 테스트 생성 (5개 Subagent)
/aiwf:aiwf_create_testcase

# E2E 테스트 생성 (5개 Subagent)
/aiwf:aiwf_create_testcase e2e

# 통합 테스트를 8개 Subagent로 생성
/aiwf:aiwf_create_testcase integration 8

# 모든 종류의 테스트를 10개 Subagent로 생성
/aiwf:aiwf_create_testcase all 10

# 단위 테스트를 3개 Subagent로 생성
/aiwf:aiwf_create_testcase unit 3
```

---

# 프로젝트 테스트 케이스 병렬 생성 워크플로우

**목표**: 프로젝트의 모든 주요 비즈니스 로직에 대한 포괄적인 테스트를 병렬로 생성하여 90% 이상의 테스트 커버리지를 달성

## 정확히 다음 5개 항목으로 TODO 생성

1. 인수 파싱 및 프로젝트 구조 분석
2. 테스트 대상 파일 식별 및 Subagent 작업 분할
3. 병렬 Subagent 실행으로 테스트 코드 생성
4. 테스트 실행 및 커버리지 검증
5. 결과 보고 및 최적화 제안

---

## 1 · 인수 파싱 및 프로젝트 구조 분석

### 인수 처리
- `<$ARGUMENTS>`에서 테스트 타입과 Subagent 수 파싱
- 첫 번째 인수가 테스트 타입인지 확인 (unit, e2e, integration, all)
  - 테스트 타입이 아니면 숫자로 간주하고 unit 테스트로 설정
  - 유효한 테스트 타입: unit(기본값), e2e, integration, all
- 두 번째 인수가 있으면 Subagent 수로 파싱 (기본값: 5, 최대: 10)
- 잘못된 값이면 기본값 사용 및 사용자에게 알림

### 프로젝트 구조 분석
다음 명령어들을 **병렬로 실행**하여 프로젝트 타입과 상태 파악:

```bash
# 프로젝트 언어 감지
find . -name "*.py" -o -name "*.js" -o -name "*.ts" -o -name "*.java" -o -name "*.go" -o -name "*.rb" -o -name "*.cs" | grep -v node_modules | grep -v venv | head -20

# 프로젝트 관리 파일 확인
ls -la | grep -E "package.json|requirements.txt|pom.xml|go.mod|Gemfile|*.csproj|Cargo.toml"

# 기존 테스트 파일 확인
find . -type f \( -name "*test*" -o -name "*spec*" \) -not -path "*/node_modules/*" -not -path "*/venv/*" -not -path "*/.git/*" | head -20

# 테스트 설정 파일 확인
find . -maxdepth 2 -name "jest.config.*" -o -name "pytest.ini" -o -name "phpunit.xml" -o -name "go.mod" -o -name ".rspec" -o -name "test.config.*"

# 빌드/테스트 스크립트 확인
if [ -f "package.json" ]; then
    cat package.json | jq '.scripts' 2>/dev/null || grep -A 10 '"scripts"' package.json
elif [ -f "Makefile" ]; then
    grep -E "^test:|^check:" Makefile
elif [ -f "build.gradle" ] || [ -f "pom.xml" ]; then
    echo "Java/Kotlin project detected"
fi
```

### 테스트 환경 검증
- **언어 자동 감지**: Python, JavaScript/TypeScript, Java, Go, Ruby, C# 등
- **테스트 프레임워크 감지**: Jest, Pytest, JUnit, Go test, RSpec, xUnit 등
- **패키지 매니저 확인**: npm, pip, maven, go mod, bundler, nuget 등
- **빌드 시스템 확인**: Make, Gradle, Maven, npm scripts 등

## 2 · 테스트 대상 파일 식별 및 Subagent 작업 분할

### 테스트 대상 식별
테스트 타입에 따라 대상 파일들을 식별:

```bash
# 테스트 타입에 따른 대상 파일 식별
TEST_TYPE="${1:-unit}"  # 첫 번째 인수 또는 기본값 unit

case "$TEST_TYPE" in
  "unit")
    echo "단위 테스트 대상 파일 검색..."
    # 개별 클래스/모듈/함수 파일 검색
    find . -type f \( -name "*.service.*" -o -name "*.controller.*" -o -name "*.helper.*" -o -name "*.util.*" -o -name "*.model.*" -o -name "*Service.*" -o -name "*Controller.*" -o -name "*Repository.*" -o -name "*Utils.*" \) | grep -v test | grep -v spec
    ;;
    
  "integration")
    echo "통합 테스트 대상 파일 검색..."
    # API 엔드포인트, 데이터베이스 연동, 서비스 간 통합 파일 검색
    find . -type f \( -name "*api*" -o -name "*route*" -o -name "*endpoint*" -o -name "*repository*" -o -name "*dao*" \) | grep -v test | grep -v spec
    # 설정 파일도 포함
    find . -maxdepth 3 -name "*config*" -o -name "*setup*" | grep -v node_modules | grep -v venv
    ;;
    
  "e2e")
    echo "E2E 테스트 대상 검색..."
    # 전체 애플리케이션 플로우, 페이지, 시나리오 검색
    find . -type f \( -name "*page*" -o -name "*view*" -o -name "*screen*" -o -name "*flow*" \) | grep -v test | grep -v spec
    # 메인 엔트리 포인트 검색
    find . -maxdepth 2 \( -name "main.*" -o -name "app.*" -o -name "index.*" -o -name "server.*" \)
    ;;
    
  "all")
    echo "모든 테스트 대상 파일 검색..."
    # 모든 소스 코드 파일 검색 (테스트 파일 제외)
    find . -type f \( -name "*.js" -o -name "*.ts" -o -name "*.py" -o -name "*.java" -o -name "*.kt" -o -name "*.go" -o -name "*.rb" -o -name "*.cs" \) | grep -v test | grep -v spec | grep -v node_modules | grep -v venv | grep -v vendor
    ;;
esac
```

### 작업 분할 전략
**테스트 타입별 분할 방식:**

#### 단위 테스트 (unit)
**3개 Subagent:**
1. **Agent 1**: 핵심 비즈니스 로직 (서비스, 도메인 모델)
2. **Agent 2**: 컨트롤러/핸들러 계층
3. **Agent 3**: 유틸리티/헬퍼 + 모킹 인프라

**5개 Subagent (기본):**
1. **Agent 1**: 인증/보안 관련 단위 테스트
2. **Agent 2**: 핵심 도메인 로직 단위 테스트
3. **Agent 3**: 데이터 접근 계층 단위 테스트
4. **Agent 4**: 외부 서비스 모킹 및 단위 테스트
5. **Agent 5**: 유틸리티 함수 + 테스트 헬퍼

#### 통합 테스트 (integration)
**3개 Subagent:**
1. **Agent 1**: API 엔드포인트 통합 테스트
2. **Agent 2**: 데이터베이스 연동 테스트
3. **Agent 3**: 서비스 간 통합 테스트

**5개 Subagent (기본):**
1. **Agent 1**: REST API 통합 테스트
2. **Agent 2**: 데이터베이스 트랜잭션 테스트
3. **Agent 3**: 외부 서비스 통합 테스트
4. **Agent 4**: 메시징/이벤트 시스템 테스트
5. **Agent 5**: 설정 및 환경 통합 테스트

#### E2E 테스트 (e2e)
**3개 Subagent:**
1. **Agent 1**: 주요 사용자 시나리오 테스트
2. **Agent 2**: 페이지/화면 네비게이션 테스트
3. **Agent 3**: 크로스 브라우저/플랫폼 테스트

**5개 Subagent (기본):**
1. **Agent 1**: 사용자 인증 플로우 E2E
2. **Agent 2**: 핵심 기능 시나리오 E2E
3. **Agent 3**: 데이터 입력/검증 플로우 E2E
4. **Agent 4**: 에러 처리 및 복구 시나리오
5. **Agent 5**: 성능 및 부하 테스트 시나리오

#### 전체 테스트 (all)
**8개+ Subagent 권장:**
- 단위, 통합, E2E를 모두 포함하여 분할
- 각 테스트 타입별로 2-3개 Agent 할당
- 테스트 인프라와 리포팅을 별도 Agent로 분리

### 우선순위 매트릭스 생성
각 파일에 대해 다음 기준으로 우선순위 설정:
- **비즈니스 중요도**: 핵심 기능 vs 부가 기능
- **복잡도**: 로직 복잡성, 의존성 수
- **테스트 부족도**: 기존 테스트 커버리지
- **변경 빈도**: Git 히스토리 기반 변경 빈도

## 3 · 병렬 Subagent 실행으로 테스트 코드 생성

### Subagent 작업 템플릿
각 Subagent에게 테스트 타입에 맞는 작업 지시:

```
/**
 * Subagent {번호}: {도메인명} {테스트 타입} 테스트 구현
 * 
 * 프로젝트 언어: {감지된 언어}
 * 테스트 프레임워크: {감지된 테스트 프레임워크}
 * 테스트 타입: {unit|integration|e2e}
 * 
 * 담당 파일/영역:
 * - {파일/기능 목록}
 * 
 * 테스트 타입별 요구사항:
 * 
 * [단위 테스트인 경우]
 * - 각 함수/메서드를 독립적으로 테스트
 * - 모든 의존성을 모킹/스터빙
 * - 빠른 실행 속도 유지
 * - 단일 책임 원칙 준수
 * 
 * [통합 테스트인 경우]
 * - 실제 데이터베이스/외부 서비스 연동
 * - 트랜잭션 롤백 처리
 * - API 엔드포인트 전체 플로우 검증
 * - 에러 전파 및 처리 검증
 * 
 * [E2E 테스트인 경우]
 * - 실제 사용자 시나리오 시뮬레이션
 * - UI 자동화 도구 활용 (Selenium, Playwright, Cypress 등)
 * - 크로스 브라우저 호환성 검증
 * - 성능 메트릭 수집
 * 
 * 공통 요구사항:
 * 1. 프로젝트의 기존 테스트 패턴 분석 후 동일한 스타일 적용
 * 2. 90% 이상 코드 커버리지 달성 (해당 테스트 타입 범위 내)
 * 3. 명확한 테스트 설명 작성
 * 4. 테스트 데이터 관리 전략 수립
 * 
 * 출력:
 * 완성된 테스트 파일들의 전체 코드
 * (테스트 타입별 명명 규칙 준수)
 */
```

### 동시 실행 관리
- 모든 Subagent를 **단일 메시지에서 동시 실행**
- 각 Agent의 진행상황 추적
- 의존성 충돌 방지 (동일 파일을 여러 Agent가 처리하지 않도록)

### 언어 및 테스트 타입별 특화 지시사항

#### JavaScript/TypeScript
**단위 테스트:**
- Jest, Mocha, Vitest의 모킹 기능 활용
- 함수/클래스 단위로 격리된 테스트

**통합 테스트:**
- Supertest로 API 엔드포인트 테스트
- 실제 데이터베이스 연결 (테스트 DB)

**E2E 테스트:**
- Playwright, Cypress, Puppeteer 활용
- 페이지 객체 모델 패턴 적용

#### Python
**단위 테스트:**
- unittest.mock, pytest-mock 활용
- 데코레이터와 context manager 테스트

**통합 테스트:**
- Django: TestCase와 TransactionTestCase
- FastAPI: TestClient와 실제 DB 연동

**E2E 테스트:**
- Selenium WebDriver, Playwright
- Behave로 BDD 스타일 테스트

#### Java/Kotlin
**단위 테스트:**
- Mockito로 의존성 모킹
- @Mock, @InjectMocks 활용

**통합 테스트:**
- @SpringBootTest, @DataJpaTest
- TestContainers로 실제 DB 테스트

**E2E 테스트:**
- Selenium Grid, Appium
- Rest Assured로 API 시나리오 테스트

#### Go
**단위 테스트:**
- 인터페이스 기반 모킹
- 테이블 드리븐 테스트

**통합 테스트:**
- httptest로 HTTP 핸들러 테스트
- 실제 DB 연결 테스트

**E2E 테스트:**
- Chromedp, Rod로 브라우저 자동화
- Ginkgo로 BDD 스타일 테스트

#### Ruby
**단위 테스트:**
- RSpec doubles, stubs
- 격리된 클래스/모듈 테스트

**통합 테스트:**
- Rails: request specs
- Database cleaner로 트랜잭션 관리

**E2E 테스트:**
- Capybara + Selenium
- 시나리오 기반 feature specs

#### C#
**단위 테스트:**
- Moq, NSubstitute로 모킹
- async/await 테스트 패턴

**통합 테스트:**
- WebApplicationFactory 활용
- In-memory DB 또는 실제 DB

**E2E 테스트:**
- Selenium, SpecFlow
- Page Object 패턴 적용

## 4 · 테스트 실행 및 커버리지 검증

### 테스트 실행
테스트 타입과 언어별로 적절한 테스트 명령어를 **병렬로 실행**:

```bash
TEST_TYPE="${1:-unit}"  # 테스트 타입

# JavaScript/TypeScript
if [ -f "package.json" ]; then
    case "$TEST_TYPE" in
        "unit")
            npm test || npm run test:unit
            ;;
        "integration")
            npm run test:integration || npm run test:int
            ;;
        "e2e")
            npm run test:e2e || npm run e2e || npm run cypress:run
            ;;
        "all")
            npm test && npm run test:integration && npm run test:e2e
            ;;
    esac
    npm run test:coverage || npm run test:cov || jest --coverage
fi

# Python
if [ -f "requirements.txt" ] || [ -f "setup.py" ]; then
    case "$TEST_TYPE" in
        "unit")
            pytest tests/unit || pytest -m unit
            ;;
        "integration")
            pytest tests/integration || pytest -m integration
            ;;
        "e2e")
            pytest tests/e2e || pytest -m e2e || behave
            ;;
        "all")
            pytest
            ;;
    esac
    pytest --cov || coverage run -m pytest
fi

# Java/Kotlin
if [ -f "pom.xml" ]; then
    case "$TEST_TYPE" in
        "unit")
            mvn test -Dtest="*Test"
            ;;
        "integration")
            mvn test -Dtest="*IT"
            ;;
        "e2e")
            mvn test -Dtest="*E2E"
            ;;
        "all")
            mvn test
            ;;
    esac
    mvn jacoco:report
elif [ -f "build.gradle" ]; then
    case "$TEST_TYPE" in
        "unit")
            ./gradlew test
            ;;
        "integration")
            ./gradlew integrationTest
            ;;
        "e2e")
            ./gradlew e2eTest
            ;;
        "all")
            ./gradlew check
            ;;
    esac
    ./gradlew jacocoTestReport
fi

# Go
if [ -f "go.mod" ]; then
    case "$TEST_TYPE" in
        "unit")
            go test -short ./...
            ;;
        "integration")
            go test -run Integration ./...
            ;;
        "e2e")
            go test -run E2E ./...
            ;;
        "all")
            go test ./...
            ;;
    esac
    go test -cover ./...
fi

# Ruby
if [ -f "Gemfile" ]; then
    case "$TEST_TYPE" in
        "unit")
            bundle exec rspec spec/unit
            ;;
        "integration")
            bundle exec rspec spec/integration
            ;;
        "e2e")
            bundle exec rspec spec/features || bundle exec cucumber
            ;;
        "all")
            bundle exec rspec
            ;;
    esac
fi

# C#
if ls *.csproj 1> /dev/null 2>&1; then
    case "$TEST_TYPE" in
        "unit")
            dotnet test --filter "Category=Unit"
            ;;
        "integration")
            dotnet test --filter "Category=Integration"
            ;;
        "e2e")
            dotnet test --filter "Category=E2E"
            ;;
        "all")
            dotnet test
            ;;
    esac
    dotnet test /p:CollectCoverage=true
fi
```

### 커버리지 분석
- 전체 커버리지 % 확인
- 파일별 커버리지 상세 분석
- 90% 미달 파일 식별
- 미커버 라인 분석

### 실패 테스트 처리
**테스트 실패 시 자동 수정:**
- 컴파일/문법 에러 수정
- 모킹/스텁 설정 오류 수정
- 의존성 문제 해결
- 비동기 테스트 타이밍 이슈 수정
- import/require 경로 문제 수정

**3회 재시도 후에도 실패 시:**
- 문제 분석 보고서 생성
- 수동 수정이 필요한 부분 명시
- 임시 해결책 제안

## 5 · 결과 보고 및 최적화 제안

### 성과 요약 보고
```markdown
## 🎯 테스트 생성 결과

### 📊 커버리지 성과
- **이전**: {이전_커버리지}%
- **현재**: {현재_커버리지}%
- **개선도**: +{개선도}%

### 📁 생성된 테스트 파일
- **총 파일 수**: {파일수}개
- **총 테스트 케이스**: {테스트케이스수}개
- **성공률**: {성공률}%

### ⚡ 성능 지표  
- **작업 시간**: {시간}
- **병렬 효율성**: {효율성}% 향상
- **품질 점수**: {품질점수}/100
```

### 최적화 제안사항
**높은 우선순위:**
- 90% 미달 파일에 대한 추가 테스트 제안
- 테스트 성능 최적화 방안
- CI/CD 파이프라인 통합 제안

**중간 우선순위:**
- E2E 테스트 확장 계획
- 테스트 데이터 관리 개선
- 테스트 문서화 방안

**낮은 우선순위:**  
- 성능 테스트 추가
- 접근성 테스트 고려
- 국제화 테스트 방안

### 다음 단계 액션 아이템
1. **즉시 실행**: 90% 미달 파일 보완
2. **1주일 내**: CI/CD 테스트 자동화 설정
3. **1개월 내**: E2E 테스트 스위트 구축

---

## 🚨 중요 사항

### 지원되는 프로젝트 타입
- **JavaScript/TypeScript**: Node.js, React, Vue, Angular 등
- **Python**: Django, Flask, FastAPI, 일반 Python 프로젝트
- **Java/Kotlin**: Spring Boot, Micronaut, 일반 Java 프로젝트
- **Go**: 표준 Go 프로젝트, Gin, Echo 등
- **Ruby**: Rails, Sinatra, 일반 Ruby 프로젝트
- **C#**: ASP.NET Core, .NET 프로젝트

### 지원되는 테스트 프레임워크
- **JavaScript/TypeScript**: Jest, Mocha, Vitest, Jasmine
- **Python**: pytest, unittest, nose
- **Java/Kotlin**: JUnit, TestNG, Spock
- **Go**: 내장 testing 패키지, testify
- **Ruby**: RSpec, Minitest
- **C#**: xUnit, NUnit, MSTest

### 전제 조건
- 프로젝트에 적절한 빌드 시스템이 설정되어 있어야 함
- 기본적인 테스트 실행 환경이 구성되어 있어야 함
- 의존성 패키지가 설치되어 있어야 함

### 제한사항
- 매우 복잡한 레거시 코드의 경우 수동 수정 필요할 수 있음
- 외부 API 의존성이 매우 복잡한 경우 추가 모킹 작업 필요
- 데이터베이스 스키마가 복잡한 경우 추가 설정 필요
- GUI 관련 테스트는 단위 테스트 범위에서 제외

### 안전장치
- 기존 테스트 파일은 백업 후 수정
- 실패한 테스트는 건너뛰고 계속 진행
- 프로젝트에 손상을 주지 않는 안전한 실행
- 언어별 관례에 따른 테스트 파일 명명

이 커맨드를 통해 어떤 프로젝트든 빠르고 효율적으로 고품질 테스트 스위트를 구축할 수 있습니다!