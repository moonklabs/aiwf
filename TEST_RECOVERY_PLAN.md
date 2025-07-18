# AIWF 테스트 복구 계획

## 현재 상황
- 리팩토링 후 테스트 파일들이 손실되거나 불일치 상태
- GitHub API → file-downloader.js 리팩토링 완료
- 테스트 실행 시 다수 실패 발생

## 복구 전략

### Phase 1: Critical Tests (필수 테스트)
**우선순위: 최고**
- [ ] `basic.test.js` - 기본 프로젝트 구조
- [ ] `installer.test.js` - 설치 프로그램 기능
- [ ] `language-utils.test.js` - 언어 관리 유틸리티

### Phase 2: Core Functionality Tests (핵심 기능)
**우선순위: 높음**
- [ ] `application.test.js` - 메인 애플리케이션
- [ ] `commands.test.js` - 명령어 파일 검증
- [ ] `integration/command-integration.test.js` - 명령어 통합

### Phase 3: Advanced Features (고급 기능)
**우선순위: 중간**
- [ ] `unit/ai-persona-manager.test.js` - AI 페르소나 관리
- [ ] `integration/context-compression.test.js` - 컨텍스트 압축
- [ ] `token-tracking.test.js` - 토큰 추적

### Phase 4: Optional Tests (선택적 테스트)
**우선순위: 낮음**
- [ ] `integration/feature-ledger.test.js` - Feature Ledger
- [ ] `integration/git-integration.test.js` - Git 통합
- [ ] `s02-integration.test.js` - S02 통합

## 복구 방법

### 1. 즉시 수정 가능한 테스트
- 경로 불일치 수정
- 설정 값 업데이트
- Import 경로 수정

### 2. 리팩토링 필요한 테스트
- 삭제된 모듈 참조 제거
- 새로운 API에 맞게 테스트 수정
- Mock 객체 업데이트

### 3. 완전히 새로 작성할 테스트
- 새로운 file-downloader.js 테스트
- 업데이트된 installer 로직 테스트

## 실행 계획

1. **Phase 1 복구** (1-2시간)
   - basic.test.js 수정
   - installer.test.js 업데이트
   - language-utils.test.js 검증

2. **Phase 2 복구** (2-3시간)
   - 핵심 기능 테스트 복구
   - 통합 테스트 수정

3. **Phase 3-4 검토** (필요시)
   - 고급 기능 테스트 평가
   - 불필요한 테스트 제거

## 성공 기준
- [ ] 모든 Critical 테스트 통과
- [ ] 80% 이상 테스트 커버리지
- [ ] CI/CD 파이프라인 정상 작동
