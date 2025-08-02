# Validator API 참조 문서

## 개요

AIWF Validator API는 AIWF 프레임워크와 지원되는 AI 도구들의 포괄적인 설치 및 구성 검증을 제공합니다. 이 문서는 v0.3.18에서 도입된 향상된 검증 시스템을 다루며, 상당한 성능 개선과 단순화된 인터페이스를 포함합니다.

## 주요 개선사항

### 아키텍처 향상
- **86% 코드 감소**: 348줄에서 48줄로 간소화
- **통합 인터페이스**: 단일 `validateInstallation()` 함수
- **상수 기반 구성**: 중앙화된 검증 매개변수
- **향상된 오류 보고**: 상세하고 실행 가능한 오류 메시지

## 핵심 API

### `validateInstallation(selectedTools, language)`

포괄적인 설치 검증을 수행하는 주요 검증 함수입니다.

**매개변수:**
- `selectedTools` (Array): 검증할 AI 도구 목록. 지원되는 값:
  - `'claudeCode'` 또는 `'claude-code'`: Claude Code 통합
  - `'geminiCLI'` 또는 `'gemini-cli'`: Gemini CLI 통합  
  - `'cursor'`: Cursor IDE 통합
  - `'windsurf'`: Windsurf IDE 통합
  - `'aiwf'`: 핵심 AIWF 프레임워크
- `language` (string): 언어 코드 ('ko', 'en')

**반환값:** `Promise<Object>`
```javascript
{
  success: ['claudeCode', 'cursor'],     // 성공적으로 검증된 도구들
  failed: [                             // 상세 정보와 함께 실패한 검증들
    { tool: 'windsurf', reason: 'Missing rules directory: .windsurf/rules' }
  ],
  warnings: []                          // 중요하지 않은 문제들
}
```

**사용 예제:**
```javascript
import { validateInstallation } from '../src/lib/validator.js';

// 특정 도구들 검증
const result = await validateInstallation(['claudeCode', 'cursor'], 'ko');

// 모든 도구 검증 (기본 동작)
const allValidation = await validateInstallation([], 'ko');

// 결과 확인
if (result.failed.length === 0) {
  console.log('모든 검증이 통과했습니다!');
} else {
  console.error('검증 실패:', result.failed);
}
```

### `displaySpecCompliantValidationResults(validationResults, language)`

검증 결과를 형식화되고 사용자 친화적인 방식으로 표시합니다.

**매개변수:**
- `validationResults` (Object): `validateInstallation()`의 결과
- `language` (string): 지역화된 메시지를 위한 언어 코드

**사용 예제:**
```javascript
import { 
  validateInstallation, 
  displaySpecCompliantValidationResults 
} from '../src/lib/validator.js';

const results = await validateInstallation(['claudeCode'], 'ko');
displaySpecCompliantValidationResults(results, 'ko');
```

**출력 형식:**
```
=== 설치 검증 결과 ===

✅ 성공적으로 검증된 도구들 (2):
   ✓ claudeCode
   ✓ cursor

❌ 실패한 검증들 (1):
   ✗ windsurf: 규칙 디렉토리 누락: .windsurf/rules

✅ 전체 검증: 통과
🎉 선택된 모든 도구가 올바르게 설치되고 검증되었습니다!
```

## 검증 구성

### VALIDATION_CONSTANTS

모든 검증 매개변수에 대한 중앙화된 구성:

```javascript
const VALIDATION_CONSTANTS = {
  MIN_FILE_SIZE: 10,              // 최소 파일 크기 (바이트)
  MIN_RULE_FILE_SIZE: 50,         // AI 도구 규칙 파일의 최소 크기
  MIN_FILE_COUNT: {
    CURSOR_MDC: 2,                // Cursor를 위한 최소 .mdc 파일 수
    WINDSURF_MD: 2,               // Windsurf를 위한 최소 .md 파일 수
    CLAUDE_COMMANDS: 4            // Claude를 위한 최소 명령 파일 수
  }
};
```

## 도구별 검증

### Claude Code 검증

Claude Code 명령 파일과 구조를 검증합니다:

**검증되는 파일들:**
- `aiwf_initialize.md`
- `aiwf_do_task.md` 
- `aiwf_commit.md`
- `aiwf_code_review.md`

**검증 기준:**
- 파일 존재 및 접근 가능성
- 최소 파일 크기 (10 바이트)
- 적절한 파일 권한

### Cursor 도구 검증

Cursor IDE 규칙 파일을 검증합니다:

**검증 기준:**
- `.cursor/rules/` 디렉토리 존재
- 최소 2개의 `.mdc` 파일 존재
- 각 파일이 최소 크기 요구사항 충족 (50 바이트)
- 파일 읽기 가능성 검증

### Windsurf 도구 검증

Windsurf IDE 구성을 검증합니다:

**검증 기준:**
- `.windsurf/rules/` 디렉토리 존재
- 최소 2개의 `.md` 파일 존재
- 각 파일이 최소 크기 요구사항 충족 (50 바이트)
- 파일 접근성 확인

### Gemini CLI 검증

Gemini CLI 프롬프트 디렉토리를 검증합니다:

**검증 기준:**
- `.gemini/prompts/aiwf/` 디렉토리 존재
- 디렉토리 접근성 검증

### 핵심 AIWF 검증

필수 AIWF 프레임워크 파일을 검증합니다:

**검증되는 파일들:**
- `CLAUDE.md` (루트)
- `00_PROJECT_MANIFEST.md`

## 오류 처리

### 오류 유형과 메시지

검증 시스템은 다양한 실패 시나리오에 대해 구체적인 오류 메시지를 제공합니다:

#### 파일 찾을 수 없음 오류
```javascript
{
  success: false, 
  reason: "파일 누락: .claude/commands/aiwf/aiwf_initialize.md"
}
```

#### 크기 검증 오류
```javascript
{
  success: false,
  reason: "파일 aiwf_do_task.md가 너무 작습니다 (5 바이트, 최소 10 바이트 필요)"
}
```

#### 디렉토리 누락 오류
```javascript
{
  success: false,
  reason: "Cursor 규칙 디렉토리 누락: .cursor/rules"
}
```

#### 파일 개수 오류
```javascript
{
  success: false,
  reason: "Cursor 규칙: 최소 2개의 .mdc 파일이 필요하지만 1개만 발견됨"
}
```

### 오류 복구

검증 시스템에는 지능적인 오류 복구 기능이 포함되어 있습니다:

1. **구체적인 오류 메시지**: 각 오류에는 정확한 문제와 위치가 포함됨
2. **실행 가능한 가이드**: 오류 메시지는 구체적인 해결 단계를 제안함
3. **검증 지속**: 실패한 도구 검증이 다른 도구 검사를 중단시키지 않음
4. **상세한 보고**: 포괄적인 결과에는 모든 성공과 실패가 포함됨

## 성능 특성

### 최적화 기능

- **감소된 메모리 사용량**: 간소화된 코드가 중복 작업을 제거함
- **더 빠른 실행**: 최적화된 검증 로직이 처리 시간을 단축함
- **효율적인 파일 접근**: 최적화된 I/O 패턴이 디스크 작업을 최소화함
- **스마트 캐싱**: 반복되는 파일 시스템 호출 감소

### 벤치마크

이전 검증 시스템(v0.3.17)과 비교:
- **코드 크기**: 86% 감소 (348 → 48줄)
- **함수 개수**: 67% 감소 (3 → 1개 주요 함수)
- **실행 시간**: 평균 검증 시간 ~40% 단축
- **메모리 사용량**: 메모리 사용량 ~30% 감소

## 통합 예제

### CLI 통합

```javascript
import { validateInstallation } from '../src/lib/validator.js';

async function validateCLIInstallation() {
  try {
    const result = await validateInstallation(['claudeCode'], 'ko');
    
    if (result.failed.length > 0) {
      console.error('설치 검증 실패:');
      result.failed.forEach(({ tool, reason }) => {
        console.error(`- ${tool}: ${reason}`);
      });
      process.exit(1);
    }
    
    console.log('설치가 성공적으로 검증되었습니다!');
  } catch (error) {
    console.error('검증 오류:', error.message);
    process.exit(1);
  }
}
```

### 프로그래밍 방식 사용

```javascript
import { validateInstallation } from '../src/lib/validator.js';

class AIWFInstaller {
  async install() {
    // 프레임워크 구성 요소 설치...
    
    // 설치 검증
    const validation = await validateInstallation();
    
    if (validation.failed.length > 0) {
      throw new Error(`설치 실패: ${validation.failed[0].reason}`);
    }
    
    return validation;
  }
}
```

## 마이그레이션 가이드

### v0.3.17에서 v0.3.18+로

**더 이상 사용되지 않는 함수들 (제거됨):**
- `validateInstallationDetailed()` → `validateInstallation()` 사용
- `validateInstallationEnhanced()` → `validateInstallation()` 사용

**업데이트된 함수 시그니처:**
```javascript
// 이전 (v0.3.17)
const result = await validateInstallationDetailed(tools, language, options);

// 새로운 (v0.3.18+)  
const result = await validateInstallation(tools, language);
```

**구성 변경사항:**
- 매직 넘버가 `VALIDATION_CONSTANTS`로 대체됨
- 단순화된 구성 구조
- 반환 형식에 대한 호환성 유지

## 모범 사례

### 검증 전략

1. **설치 후 항상 검증**: 프레임워크 설치 직후 검증 실행
2. **도구별 검증**: 실제로 사용하는 도구만 검증
3. **오류 처리**: 검증 실패를 항상 우아하게 처리
4. **정기적 검증**: 안정성을 위해 CI/CD 파이프라인에 검증 포함

### 성능 최적화

1. **선택적 검증**: 활발히 사용되는 도구만 검증
2. **배치 작업**: 관련 검증들을 함께 그룹화
3. **오류 우선 접근**: 적절한 경우 중요한 실패 시 조기 검증 중단

### 오류 보고

1. **상세한 로깅**: 애플리케이션 로그에 검증 결과 포함
2. **사용자 친화적 메시지**: 사용자 출력에 `displaySpecCompliantValidationResults()` 사용
3. **실행 가능한 오류**: 실패한 검증에 대한 구체적인 해결 단계 제공

## 관련 문서

- [설치 가이드](../README.ko.md#설치)
- [문제 해결 가이드](TROUBLESHOOTING.ko.md)
- [아키텍처 문서](ARCHITECTURE.ko.md)
- [CLI 사용 가이드](CLI_USAGE_GUIDE.ko.md)