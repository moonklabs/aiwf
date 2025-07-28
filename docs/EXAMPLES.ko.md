# AIWF 실제 사용 예제 및 활용 사례

이 문서는 다양한 개발 시나리오에서 AIWF 프레임워크를 활용하는 방법을 보여주는 실용적인 예제와 활용 사례를 제공합니다.

[한국어](EXAMPLES.ko.md) | [English](EXAMPLES.md)

## 목차

1. [새 프로젝트 시작하기](#새-프로젝트-시작하기)
2. [기능 개발 워크플로](#기능-개발-워크플로)
3. [팀 협업 시나리오](#팀-협업-시나리오)
4. [성능 최적화](#성능-최적화)
5. [대규모 코드베이스 관리](#대규모-코드베이스-관리)
6. [CI/CD 통합](#cicd-통합)
7. [다국어 프로젝트](#다국어-프로젝트)
8. [긴급 디버깅](#긴급-디버깅)

---

## 새 프로젝트 시작하기

### 시나리오: 이커머스 플랫폼 개발

Claude Code로 새로운 이커머스 플랫폼 프로젝트를 시작합니다.

#### 1단계: 프로젝트 초기화

```bash
# 프로젝트 디렉토리 생성
mkdir my-ecommerce
cd my-ecommerce

# AIWF 설치
aiwf install

# AIWF로 프로젝트 초기화
/project:aiwf:initialize
```

#### 2단계: 프로젝트 비전 정의

```bash
/project:aiwf:aiwf_create_prd "이커머스 플랫폼" "AI 기반 추천 시스템을 갖춘 현대적인 이커머스 솔루션"
```

#### 3단계: 첫 마일스톤 계획

```bash
/project:aiwf:aiwf_create_milestone_plan "MVP 핵심 기능"
```

**Claude Code가 다음을 정의해줍니다:**
- 사용자 인증 시스템
- 상품 카탈로그
- 장바구니
- 주문 관리
- 결제 통합

#### 4단계: 스프린트 생성

```bash
/project:aiwf:create_sprints_from_milestone M01
```

**결과:** 3개의 스프린트 생성
- S01: 인증 및 사용자 관리
- S02: 상품 카탈로그 및 검색
- S03: 장바구니 및 결제

#### 5단계: 개발 시작

```bash
# 시스템 설계를 위해 아키텍트 페르소나로 전환
/project:aiwf:ai_persona:architect

# 전체 아키텍처 설계
"이커머스 플랫폼의 전체 아키텍처를 설계해주세요"

# 인증을 위한 기능 생성
/project:aiwf:aiwf_create_general_task "사용자 인증 시스템"
# 반환: FL001

# Git 브랜치 생성
git checkout -b feature/FL001-user-authentication

# 적절한 페르소나로 코딩 시작
/project:aiwf:ai_persona:developer
```

---

## 기능 개발 워크플로

### 시나리오: 실시간 알림 구현

#### 1단계: 기능 항목 생성

```bash
/project:aiwf:aiwf_create_general_task "실시간 알림 시스템"
# 반환: FL002

# 상세한 기능 명세 생성
/project:aiwf:feature_spec FL002
```

#### 2단계: 설계 단계

```bash
# 아키텍트 페르소나 사용
/project:aiwf:ai_persona:architect

"WebSocket을 사용한 확장 가능한 실시간 알림 시스템을 설계해주세요"
```

#### 3단계: 구현

```bash
# 기능 브랜치 생성
git checkout -b feature/FL002-realtime-notifications

# 균형 잡힌 컨텍스트 압축으로 구현
/project:aiwf:compress_context:balanced

# 구현 시작
"알림을 위한 WebSocket 서버를 구현해주세요"
```

#### 4단계: 테스트 및 디버깅

```bash
# 디버거 페르소나로 전환
/project:aiwf:ai_persona:debugger

"WebSocket 구현에서 연결이 끊어지는 문제를 디버깅해주세요"

# 테스트 실행
npm test

# 테스트 태스크 생성
/project:aiwf:create_task "알림 시스템을 위한 통합 테스트 작성"
```

#### 5단계: 코드 리뷰

```bash
# 리뷰어 페르소나로 전환
/project:aiwf:ai_persona:reviewer

"알림 시스템 구현의 보안성과 성능을 검토해주세요"

# 리뷰 피드백 반영
/project:aiwf:do_task T15_S02
```

#### 6단계: 문서화

```bash
# 문서 작성자 페르소나로 전환
/project:aiwf:ai_persona:documenter

"알림 엔드포인트를 위한 API 문서를 작성해주세요"

# 기능 변경 로그 생성
# Feature changelog 명령어가 제거됨 - 대신 aiwf_project_review 사용
```

#### 7단계: 기능 완료

```bash
# 기능 참조와 함께 커밋
git add .
git commit -m "feat(FL002): 실시간 알림 시스템 구현"

# Pull Request 생성
gh pr create --title "[FL002] 실시간 알림 시스템" \
  --body "WebSocket 기반 실시간 알림 구현"

# 기능 상태 업데이트
# Feature status 명령어가 제거됨 - 대신 aiwf_smart_complete 사용
```

---

## 팀 협업 시나리오

### 시나리오: 마이크로서비스를 작업하는 분산 팀

#### 팀 워크플로 설정

```bash
# 팀 리더가 프로젝트 구조 생성
/project:aiwf:initialize

# CLAUDE.md에 팀 규칙 정의
cat > CLAUDE.md << 'EOF'
# 팀 규칙

## 커밋 메시지 형식
- feat(FLXXX): 새로운 기능
- fix(FLXXX): 버그 수정
- docs(FLXXX): 문서
- test(FLXXX): 테스트
- refactor(FLXXX): 코드 리팩토링

## 코드 리뷰 프로세스
1. 모든 PR은 2명의 승인 필요
2. CI/CD 파이프라인 통과 필수
3. 테스트 포함 필수
4. 문서 업데이트 필수

## 페르소나 사용법
- 아키텍트: 시스템 설계 결정
- 개발자: 구현
- 리뷰어: PR 검토
- 문서 작성자: API 문서
EOF
```

#### 병렬 개발

**개발자 A: 인증 서비스**
```bash
# 기능 생성
/project:aiwf:aiwf_create_general_task "인증 마이크로서비스"
# FL003

# 인증 서비스 작업
cd services/auth
/project:aiwf:ai_persona:developer
git checkout -b feature/FL003-auth-service
```

**개발자 B: 상품 서비스**
```bash
# 기능 생성
/project:aiwf:aiwf_create_general_task "상품 카탈로그 마이크로서비스"
# FL004

# 상품 서비스 작업
cd services/products
/project:aiwf:ai_persona:developer
git checkout -b feature/FL004-product-service
```

#### 일일 동기화

```bash
# 팀 상태 리포트 생성
/project:aiwf:team_status_report

# 모든 활성 기능 확인
/project:aiwf:list_features --status=in_progress

# 스프린트 진행 상황 검토
/project:aiwf:sprint_status S02
```

#### 코드 리뷰 프로세스

```bash
# 리뷰어가 페르소나 전환
/project:aiwf:ai_persona:reviewer

# 특정 PR 검토
gh pr checkout 42
/project:aiwf:code_review --pr=42

# 리뷰 댓글 추가
gh pr review 42 --comment -b "인증 실패에 대한 오류 처리를 추가해주세요"
```

---

## 성능 최적화

### 시나리오: 느린 API 엔드포인트 최적화

#### 1단계: 성능 프로파일링

```bash
# 최적화 페르소나로 전환
/project:aiwf:ai_persona:optimizer

# 성능 태스크 생성
/project:aiwf:create_task "/api/search 엔드포인트 성능 최적화"
```

#### 2단계: 현재 성능 벤치마크

```javascript
// benchmark-search.js
import { PerformanceBenchmark } from '@aiwf/performance';

const benchmark = new PerformanceBenchmark({
  iterations: 100,
  memoryProfiling: true
});

const searchBenchmark = {
  name: '검색 API 벤치마크',
  tests: [{
    name: '복합 검색 쿼리',
    fn: async () => {
      await fetch('/api/search?q=laptop&filters=price:100-1000');
    }
  }]
};

const baseline = await benchmark.run(searchBenchmark);
await benchmark.saveReport('./baseline-performance.json');
```

#### 3단계: 메모리 프로파일러로 분석

```javascript
// memory-analysis.js
import { MemoryProfiler } from '@aiwf/memory';

const profiler = new MemoryProfiler({
  heapThreshold: 100 * 1024 * 1024 // 100MB
});

profiler.startProfiling();

// 검색 작업 실행
for (let i = 0; i < 1000; i++) {
  await performSearch('테스트 쿼리');
}

const report = profiler.generateReport();
const suggestions = profiler.getOptimizationSuggestions();

console.log('메모리 최적화 제안:', suggestions);
```

#### 4단계: 최적화 구현

```bash
# 최적화 페르소나로 제안 받기
"이 검색 구현을 분석하고 최적화 방안을 제안해주세요"

# 캐싱 구현
/project:aiwf:implement_caching search-results
```

#### 5단계: 개선 사항 검증

```javascript
// 성능 비교
const optimized = await benchmark.run(searchBenchmark);
const regression = benchmark.detectPerformanceRegression(optimized, baseline);

if (regression.hasRegression) {
  console.error('성능 저하 감지!');
} else {
  console.log(`성능이 ${regression.improvement}% 향상되었습니다`);
}
```

---

## 대규모 코드베이스 관리

### 시나리오: 10만 라인 이상의 레거시 시스템 작업

#### 1단계: 초기 분석

```bash
# 개요를 위한 적극적 압축 사용
/project:aiwf:compress_context:aggressive

# 프로젝트 구조 파악
"이 코드베이스의 전체 아키텍처를 분석해주세요"
```

#### 2단계: 현대화 계획 수립

```bash
# 현대화를 위한 마일스톤 생성
/project:aiwf:aiwf_create_milestone_plan "레거시 시스템 현대화"

# 기능별로 세분화
/project:aiwf:aiwf_create_general_task "데이터베이스 마이그레이션"      # T001
/project:aiwf:aiwf_create_general_task "API 현대화"                 # T002
/project:aiwf:aiwf_create_general_task "프론트엔드 리팩토링"          # T003
```

#### 3단계: 점진적 리팩토링

```bash
# 특정 모듈에 균형 잡힌 압축 사용
/project:aiwf:compress_context:balanced

# 한 번에 하나의 모듈에 집중
"사용자 관리 모듈을 현대적인 패턴으로 리팩토링해주세요"
```

#### 4단계: 진행 상황 추적

```javascript
// progress-tracker.js
import { FeatureLedger } from '@aiwf/features';

const ledger = new FeatureLedger();
await ledger.init();

// 현대화 리포트 생성
const features = await ledger.searchFeatures({
  tags: ['modernization'],
  dateRange: {
    start: '2024-01-01',
    end: '2024-12-31'
  }
});

features.forEach(feature => {
  console.log(`${feature.id}: ${feature.name} - ${feature.progress}%`);
});
```

---

## CI/CD 통합

### 시나리오: 자동화된 품질 게이트

#### 1단계: GitHub Actions 설정

```yaml
# .github/workflows/aiwf-quality.yml
name: AIWF 품질 검사

on:
  pull_request:
    branches: [ main ]

jobs:
  quality-check:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Node.js 설정
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: AIWF 설치
      run: |
        npm install -g aiwf
        aiwf install --ci
    
    - name: 성능 벤치마크 실행
      run: |
        node scripts/run-benchmarks.js
        
    - name: 기능 완료 상태 확인
      run: |
        aiwf check-feature-status ${{ github.event.pull_request.title }}
        
    - name: 리포트 생성
      run: |
        aiwf generate-ci-report
        
    - name: PR에 댓글 달기
      uses: actions/github-script@v6
      with:
        script: |
          const report = require('./aiwf-ci-report.json');
          github.rest.issues.createComment({
            issue_number: context.issue.number,
            owner: context.repo.owner,
            repo: context.repo.repo,
            body: `## AIWF 품질 리포트\n\n${report.summary}`
          });
```

#### 2단계: Pre-commit 훅

```bash
# 훅 설치
/project:aiwf:install_git_hooks

# 커스텀 pre-commit 훅
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash

# 기능 참조 확인
feature_id=$(git diff --cached --name-only | xargs grep -l "FL[0-9]\{3\}" | head -1)

if [ -z "$feature_id" ]; then
  echo "경고: 변경사항에서 기능 참조를 찾을 수 없습니다"
  echo "코드나 커밋 메시지에 기능 ID (FLXXX)를 추가하세요"
fi

# 빠른 테스트 실행
npm run test:quick

# 코드 품질 검사
aiwf code-quality-check
EOF

chmod +x .git/hooks/pre-commit
```

---

## 다국어 프로젝트

### 시나리오: 국제 고객을 둔 한국 팀

#### 1단계: 이중 언어 환경 설정

```bash
# 한국어를 주 언어로 AIWF 설치
aiwf-lang set ko

# 이중 언어 문서 구조 생성
mkdir -p docs/{ko,en}
```

#### 2단계: 한국어로 팀 커뮤니케이션

```bash
# 한국어 명령어 사용
/프로젝트:aiwf:초기화

# 한국어 태스크 생성
/프로젝트:aiwf:태스크_생성 "사용자 인증 시스템 구현"

# 한국어 커밋 메시지
git commit -m "기능(FL001): JWT 토큰 생성 구현"
```

#### 3단계: 영어로 고객 문서

```bash
# 문서 작성자 페르소나로 전환
/project:aiwf:ai_persona:documenter

# 한국어 코드베이스에서 영어 API 문서 생성
"한국어 코드베이스에서 영어 API 문서를 생성해주세요"

# 이중 언어 기능 요약 생성
/project:aiwf:feature_summary FL001 --lang=en,ko
```

#### 4단계: 자동화된 번역 워크플로

```javascript
// bilingual-docs.js
import { DocumentProcessor } from '@aiwf/utils';

async function generateBilingualDocs() {
  const processor = new DocumentProcessor();
  
  // 한국어 문서 처리
  const koreanDocs = await processor.loadDirectory('./docs/ko');
  
  // 영어 버전 생성
  for (const doc of koreanDocs) {
    const englishVersion = await processor.translate(doc, 'ko', 'en');
    await processor.save(`./docs/en/${doc.name}`, englishVersion);
  }
}
```

---

## 긴급 디버깅

### 시나리오: 새벽 3시 프로덕션 이슈

#### 1단계: 빠른 컨텍스트 로딩

```bash
# 속도를 위한 적극적 압축 사용
/project:aiwf:compress_context:aggressive

# 중요한 파일만 로드
"결제 처리 모듈과 최근 오류 로그만 로드해주세요"
```

#### 2단계: 신속한 진단

```bash
# 디버거 페르소나로 전환
/project:aiwf:ai_persona:debugger

# 오류 분석
"이 스택 트레이스를 분석하고 근본 원인을 찾아주세요"

# 최근 변경사항 확인
git log --oneline -10 -- src/payments/
```

#### 3단계: 응급 수정

```bash
# 핫픽스 브랜치 생성
git checkout -b hotfix/payment-processing-error

# 검증과 함께 빠른 수정
"결제 프로세서의 null 포인터 예외를 적절한 검증으로 수정해주세요"

# 수정 테스트
npm run test:payments
```

#### 4단계: 배포 및 문서화

```bash
# 명확한 메시지로 커밋
git commit -m "hotfix: 결제 프로세서의 null 포인터 수정

- 결제 방법에 대한 null 검사 추가
- 방어적 프로그래밍 추가
- 엣지 케이스에 대한 단위 테스트 추가

Fixes #456"

# 긴급 PR 생성
gh pr create --title "HOTFIX: 결제 처리 오류" \
  --body "프로덕션 이슈에 대한 긴급 수정" \
  --label "hotfix,urgent"

# 사고 문서화
/project:aiwf:create_incident_report "결제 처리 실패"
```

#### 5단계: 사후 분석

```bash
# 분석을 위해 아키텍트 페르소나로 전환
/project:aiwf:ai_persona:architect

"이 사고를 분석하고 유사한 문제를 방지하기 위한 아키텍처 개선사항을 제안해주세요"

# 개선 태스크 생성
/project:aiwf:create_task "결제 처리 안전장치 구현"
```

---

## 모범 사례 요약

### 1. 페르소나 사용 패턴
```bash
설계 → Architect (아키텍트)
코딩 → Developer (개발자)
디버깅 → Debugger (디버거)
리뷰 → Reviewer (리뷰어)
문서화 → Documenter (문서 작성자)
최적화 → Optimizer (최적화)
```

### 2. 압축 모드 선택
```bash
개요/탐색 → Aggressive (적극적)
일반 개발 → Balanced (균형)
중요/디버깅 → Conservative (보수적)
```

### 3. 기능-Git 워크플로
```bash
기능 → 브랜치 → 커밋 → PR → 병합 → 완료
FL001 → feature/FL001-desc → feat(FL001): msg → PR#42 → main → ✓
```

### 4. 토큰 관리
- 정기적으로 사용량 모니터링
- 사전에 압축 사용
- 불필요한 파일 제외
- 주요 태스크 간 컨텍스트 정리

### 5. 팀 협업
- 일관된 커밋 형식
- 정기적인 상태 업데이트
- 명확한 기능 소유권
- 문서화된 규칙

---

## 결론

이러한 예제들은 실제 시나리오에서 AIWF의 유연성과 강력함을 보여줍니다. 성공의 핵심은:

1. **상황에 맞는 도구**: 적절한 페르소나와 압축 모드 사용
2. **일관된 워크플로**: 확립된 패턴 따르기
3. **명확한 소통**: 기능 참조와 구조화된 커밋 사용
4. **사전 관리**: 토큰, 성능, 진행 상황 모니터링
5. **팀 정렬**: 규칙 문서화 및 공유

더 많은 예제와 커뮤니티 기여를 보려면 [GitHub 저장소](https://github.com/moonklabs/aiwf/tree/main/examples)를 방문하세요.