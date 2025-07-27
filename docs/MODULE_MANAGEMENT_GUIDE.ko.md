# AIWF 모듈 관리 가이드

> AIWF의 모듈러 아키텍처와 의존성을 이해하고 관리하기 위한 종합 가이드

[한국어](MODULE_MANAGEMENT_GUIDE.ko.md) | [English](MODULE_MANAGEMENT_GUIDE.md)

## 목차

1. [개요](#개요)
2. [모듈 분류](#모듈-분류)
3. [의존성 매트릭스](#의존성-매트릭스)
4. [중요 모듈](#중요-모듈)
5. [안전한 모듈 관리](#안전한-모듈-관리)
6. [문제 해결](#문제-해결)
7. [모범 사례](#모범-사례)

## 개요

AIWF는 기능이 전문화된 모듈들에 분산되어 있는 모듈러 아키텍처를 따릅니다. 이러한 모듈들 간의 의존성 관계를 이해하는 것은 다음과 같은 작업에 중요합니다:

- **안전한 리팩토링**: 다른 모듈을 깨뜨리지 않고 수정할 수 있는 모듈 파악
- **기능 개발**: 새로운 기능을 어디에 배치할지 이해
- **디버깅**: 의존성 체인을 통한 문제 추적
- **성능 최적화**: 모듈 로딩의 병목 지점 식별

## 모듈 분류

### 🔧 핵심 유틸리티 (중요 - 절대 삭제 금지)

시스템 전체에서 사용되는 기반 모듈들:

#### `utils/paths.js`
- **사용처**: CLI 및 명령어 전반 8개 이상 위치
- **목적**: 크로스 플랫폼 호환을 위한 중앙화된 경로 관리
- **의존성**: 없음
- **중요한 이유**: 모든 파일 작업, 템플릿 해결, 리소스 로딩

#### `utils/messages.js`
- **사용처**: CLI 및 사용자 대면 명령어 5개 이상 위치
- **목적**: 다국어 메시지 시스템
- **의존성**: `language-utils.js`
- **중요한 이유**: 사용자 인터페이스, 오류 메시지, 국제화

#### `utils/language-utils.js`
- **사용처**: 언어 관리 3개 이상 위치
- **목적**: 언어 감지 및 설정
- **의존성**: `paths.js`
- **중요한 이유**: 언어 전환, 로케일 감지

### 🚀 YOLO 시스템 (중요 - 절대 삭제 금지)

자율 실행을 위한 전문 모듈들:

#### `utils/engineering-guard.js`
- **사용처**: YOLO 템플릿에서 동적 import
- **목적**: 자율 실행 중 오버엔지니어링 방지
- **의존성**: 없음 (자체 포함)
- **중요한 이유**: YOLO 모드 품질 제어
- **⚠️ 경고**: 동적 로딩 - 정적 분석에서 보이지 않음

#### `utils/checkpoint-manager.js`
- **사용처**: YOLO 명령어 및 복구 시스템
- **목적**: 자율 실행을 위한 진행률 추적 및 복구
- **의존성**: 없음
- **중요한 이유**: YOLO 세션 관리, 진행률 복구

### 🎯 명령어별 전용 모듈

#### AI 페르소나 시스템
```
ai-persona-manager.js (메인)
├── context-engine.js
├── metrics-collector.js
├── task-analyzer.js
└── token-optimizer.js (context-engine에서 사용)
```

#### 설치 및 백업 시스템
```
installer.js (메인)
├── backup-manager.js
├── file-downloader.js
├── rollback-manager.js
└── validator.js
```

#### 캐시 시스템
```
template-cache-system.js (메인)
├── offline-detector.js
├── template-downloader.js
└── template-version-manager.js
```

#### GitHub 통합
```
github-integration.js (메인)
├── state/state-index.js
├── state/priority-calculator.js
└── state/task-scanner.js
```

### 🌐 공유 리소스

#### `lib/resource-loader.js`
- **사용처**: 5개 이상 명령어 (compress, token, evaluate 등)
- **목적**: 번들 및 사용자 리소스를 위한 통합 리소스 관리
- **의존성**: `paths.js`
- **중요한 이유**: 템플릿 로딩, 페르소나 관리, 리소스 해결

## 의존성 매트릭스

### CLI 명령어 의존성

| 명령어 | 직접 의존성 | 간접 의존성 | 특수 사항 |
|--------|-------------|-------------|-----------|
| `aiwf install` | installer.js | backup-manager.js, file-downloader.js, rollback-manager.js, validator.js | - |
| `aiwf persona` | persona.js, ai-persona-manager.js | context-engine.js, metrics-collector.js, task-analyzer.js, token-optimizer.js | - |
| `aiwf compress` | compress.js, resource-loader.js | - | - |
| `aiwf token` | token.js, resource-loader.js | - | - |
| `aiwf evaluate` | evaluate.js, resource-loader.js | - | - |
| `aiwf checkpoint` | checkpoint-manager.js | - | ⚠️ YOLO 전용 |
| `aiwf-checkpoint` | checkpoint-manager.js | - | ⚠️ YOLO 전용 |
| `aiwf cache` | cache-cli.js | template-cache-system.js, offline-detector.js, template-downloader.js, template-version-manager.js | - |
| `YOLO 모드` | engineering-guard.js | - | ⚠️ 동적 import |

## 중요 모듈

### ⚠️ 동적 로딩 모듈

런타임에 로드되며 정적 의존성 분석에서 나타나지 않는 모듈들:

1. **`engineering-guard.js`**: YOLO 템플릿에서 `import()` 사용
2. **상태 시스템 모듈들**: GitHub 통합에서 사용
3. **페르소나 하위 모듈들**: 활성 페르소나에 따라 로드

### 삭제 위험도 평가

#### ❌ 절대 삭제 금지
- `paths.js`, `messages.js`, `language-utils.js` (핵심 유틸리티)
- `engineering-guard.js`, `checkpoint-manager.js` (YOLO 시스템)
- `resource-loader.js` (여러 명령어에서 공유)

#### ⚠️ 주의해서 삭제
- AI 페르소나 시스템 모듈들 (페르소나 명령어 사용 여부 확인)
- 캐시 시스템 모듈들 (오프라인 기능에 영향)
- GitHub 통합 모듈들 (GitHub 명령어에 영향)

#### ✅ 조건부 삭제 가능
- 명령어별 전용 모듈들 (해당 명령어가 사용되지 않는 경우)
- 템플릿별 리소스들 (템플릿이 필요하지 않은 경우)

## 안전한 모듈 관리

### 모듈 수정 전 확인 사항

1. **의존성 맵 확인**: `src/DEPENDENCY_MAP.md` 검토
2. **사용처 검색**: `grep -r "모듈명" src/`로 모든 참조 확인
3. **동적 import 확인**: `import()` 구문 검색
4. **CLI 통합 확인**: CLI 명령어에서의 모듈 사용 여부 확인
5. **YOLO 기능 검증**: YOLO 모듈 수정 시 YOLO 모드 작동 확인

### 안전한 수정 단계

```bash
# 1. 정적 의존성 확인
grep -r "your-module.js" src/

# 2. 동적 import 확인
grep -r "import.*your-module" src/

# 3. YOLO 통합 확인
grep -r "your-module" claude-code/

# 4. CLI 명령어 매핑 확인
grep -r "your-module" src/cli/

# 5. 중요 기능 테스트
npm test
aiwf install --force
aiwf-checkpoint list
```

### 모듈 추가 가이드라인

새 모듈 추가 시:

1. **의존성 맵 업데이트**: `src/DEPENDENCY_MAP.md`에 항목 추가
2. **경고 주석 추가**: 중요 모듈에 `@warning` 주석 포함
3. **사용처 문서화**: 어떤 명령어나 시스템에서 사용하는지 명시
4. **동적 로딩 고려**: `import()` 지연 로딩 사용 시 표시
5. **통합 테스트**: 개발 및 프로덕션 환경에서 모듈 작동 확인

## 문제 해결

### 일반적인 문제들

#### "Module not found" 오류
```bash
# 모듈 존재 확인
ls -la src/utils/your-module.js

# import 경로 정확성 확인
grep -r "your-module" src/

# 모듈 export 확인
node -e "console.log(require('./src/utils/your-module.js'))"
```

#### YOLO 모드 실패
```bash
# engineering-guard 가용성 확인
ls -la src/utils/engineering-guard.js

# 동적 import 테스트
node -e "import('./src/utils/engineering-guard.js').then(m => console.log('OK'))"

# 체크포인트 시스템 확인
aiwf checkpoint status
```

#### 순환 의존성
```bash
# 순환 의존성 감지
npm install -g madge
madge --circular src/
```

### 복구 절차

#### 핵심 유틸리티 실수로 삭제한 경우
1. git에서 복원: `git checkout HEAD -- src/utils/paths.js`
2. AIWF 재설치: `aiwf install --force`
3. 기능 확인: `aiwf --version`

#### YOLO 시스템이 손상된 경우
1. YOLO 설정 확인: `cat .aiwf/yolo-config.yaml`
2. 체크포인트 매니저 복원: `git checkout HEAD -- src/utils/checkpoint-manager.js`
3. YOLO 모드 테스트: `aiwf-checkpoint status`

## 모범 사례

### 모듈 개발

1. **단일 책임**: 각 모듈은 하나의 명확한 목적을 가져야 함
2. **최소 의존성**: 결합도를 줄이기 위해 불필요한 의존성 피하기
3. **명확한 인터페이스**: 필요한 함수/클래스만 export
4. **문서화**: 사용법 주석 및 의존성 정보 포함
5. **오류 처리**: 누락된 의존성을 우아하게 처리

### 의존성 관리

1. **정기 감사**: 의존성 맵을 주기적으로 검토하고 업데이트
2. **영향 분석**: 변경 전 종속 모듈에 대한 잠재적 영향 분석
3. **테스트 전략**: 직접 및 간접 의존성 모두 테스트
4. **버전 제어**: git을 사용하여 모듈 변경 및 의존성 추적
5. **문서화**: 의존성 문서를 최신 상태로 유지

### 성능 고려사항

1. **지연 로딩**: 중요하지 않은 모듈에 동적 import 사용
2. **캐싱**: 자주 액세스하는 모듈 캐시
3. **번들 최적화**: 의존성 추가 시 모듈 크기 고려
4. **트리 셰이킹**: 모듈이 데드 코드 제거를 지원하는지 확인

## 모듈 통합 체크리스트

새 모듈 통합 또는 기존 모듈 수정 시:

- [ ] `src/DEPENDENCY_MAP.md` 업데이트
- [ ] 적절한 경고 주석 추가
- [ ] 사용 패턴 문서화
- [ ] CLI 및 YOLO 모드에서 테스트
- [ ] 리소스 로딩 작동 확인
- [ ] 순환 의존성 확인
- [ ] 관련 문서 업데이트
- [ ] 필요 시 통합 테스트 추가

## 관련 문서

- [DEPENDENCY_MAP.md](../src/DEPENDENCY_MAP.md) - 상세 의존성 매트릭스
- [ARCHITECTURE.md](ARCHITECTURE.ko.md) - 전체 시스템 아키텍처
- [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.ko.md) - 개발 가이드라인
- [YOLO_SYSTEM_GUIDE.md](YOLO_SYSTEM_GUIDE.ko.md) - YOLO 시스템 세부사항

---

**마지막 업데이트**: 2025-01-27  
**검증 방법**: `grep -r "모듈명" src/`를 사용하여 사용 패턴 확인