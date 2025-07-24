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

## 2 · 결과 분석 및 문제 식별

다음 순서로 일반적인 문제 확인:

### 언어별 문제:

**Python:**

- **__init__.py** 파일 누락 (import 오류, 테스트 미발견)
- Import 경로 문제
- Fixture 문제 (pytest)
- 가상 환경 문제

**JavaScript/TypeScript:**

- 모듈 해결 오류
- node_modules의 의존성 누락
- Jest/Vitest 구성 문제
- TypeScript 컴파일 오류

**모든 언어 공통:**

- 환경 변수 문제 (구성 누락)
- 데이터베이스/외부 서비스 연결 오류
- 파일 경로 문제 (절대 경로 vs 상대 경로)
- 권한 문제

## 3 · 발견된 일반적인 문제 수정

**오직** 다음 특정 문제들만 자동으로 수정:**

### Python 전용 수정:

- 필요한 곳에 빈 `__init__.py` 파일 생성
- 간단한 import 경로 문제 수정
- 필요한 경우 Python 경로에 누락된 테스트 디렉토리 추가

### JavaScript/TypeScript 수정:

- node_modules가 누락된 경우 `npm install` 실행
- jest.config.js의 간단한 모듈 해결 문제 수정
- 누락된 테스트 설정 파일 생성

### 일반 수정:

- 누락된 테스트 디렉토리 생성
- 가능한 경우 파일 권한 수정
- 누락된 환경 변수 식별 및 사용자에게 알림

**수정하지 않을 것:**

- 실제 테스트 로직 실패
- 비즈니스 로직 버그
- 복잡한 구성 문제
- 데이터베이스 스키마 문제
- 외부 서비스 의존성

## 4 · 테스트 요약 제공

간단한 요약 생성:

```
테스트 결과:
- 총 개수: X개 테스트
- 통과: Y개 (Z%)
- 실패: A개
- 건너뜀: B개
- 시간: C초

수정된 문제:
- [적용된 수정사항 목록]

발견된 문제 (수동 수정 필요):
- [주의가 필요한 문제 목록]

상태: PASSING | FAILING | BLOCKED
```

**상태 인덱스 동기화**:
```bash
# 테스트 결과를 반영하여 상태 업데이트
aiwf state update
# 워크플로우 컨텍스트 확인
aiwf state show
```

**중요:** 간결하게 유지하세요. 이 명령어는 빠르고 테스트 실행에 집중해야 하며, 상세한 분석에 집중하지 않아야 합니다.
