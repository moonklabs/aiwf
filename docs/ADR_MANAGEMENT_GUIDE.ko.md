# AIWF Architecture Decision Record (ADR) 관리 가이드

> AIWF 프로젝트에서 ADR을 사용하여 아키텍처 결정을 관리하는 종합 가이드

[한국어](ADR_MANAGEMENT_GUIDE.ko.md) | [English](ADR_MANAGEMENT_GUIDE.md)

## 목차

1. [ADR이란?](#adr이란)
2. [AIWF에서 ADR을 사용하는 이유](#aiwf에서-adr을-사용하는-이유)
3. [ADR 구조](#adr-구조)
4. [AIWF와의 통합](#aiwf와의-통합)
5. [ADR 생성](#adr-생성)
6. [ADR 관리](#adr-관리)
7. [ADR 템플릿](#adr-템플릿)
8. [모범 사례](#모범-사례)
9. [자동화 및 도구](#자동화-및-도구)
10. [예제](#예제)

## ADR이란?

Architecture Decision Record(ADR)는 프로젝트에서 내려진 중요한 아키텍처 결정을 컨텍스트와 결과와 함께 기록하는 짧은 텍스트 문서입니다. 특정 결정이 내려진 이유의 역사적 기록 역할을 하며, 미래의 개발자들이 아키텍처 선택의 배경을 이해하는 데 도움을 줍니다.

### 주요 특징

- **불변성**: 작성된 후에는 변경되지 않음 (대체만 가능)
- **번호 체계**: 쉬운 참조를 위한 순차적 번호 매기기
- **풍부한 컨텍스트**: 결정에 이르게 된 상황 포함
- **결과 인식**: 결과와 트레이드오프 문서화

## AIWF에서 ADR을 사용하는 이유

### AI 지원 개발의 이점

1. **AI 컨텍스트**: Claude Code에 결정의 역사적 컨텍스트 제공
2. **자율 가이던스**: YOLO 모드가 정보에 기반한 아키텍처 선택을 하도록 도움
3. **일관성**: AI가 확립된 아키텍처 패턴을 따르도록 보장
4. **문서화**: 개발 세션 간 아키텍처 지식 유지

### AIWF 특화 장점

- **스프린트 계획**: ADR이 태스크 생성과 우선순위에 정보 제공
- **페르소나 컨텍스트**: 다른 AI 페르소나가 관련 결정 참조 가능
- **품질 제어**: Engineering Guard가 결정 준수 여부 검증 가능
- **복구**: 체크포인트 시스템이 컨텍스트 복원을 위해 ADR 참조 가능

## ADR 구조

### 표준 ADR 형식

```markdown
# ADR-001: 결정 제목

**날짜**: YYYY-MM-DD
**상태**: [제안됨 | 승인됨 | 폐기됨 | 대체됨]
**컨텍스트**: AIWF 프로젝트 컨텍스트

## 컨텍스트

이 결정을 촉발한 문제나 상황에 대한 설명.

## 결정

내려진 아키텍처 결정.

## 결과

### 긍정적
- 이 결정의 이점과 장점

### 부정적
- 단점과 트레이드오프

### 중립적
- 기타 효과와 고려사항

## 구현 참고사항

AIWF 내에서의 구현을 위한 구체적인 가이던스.

## 관련 결정
- 관련 ADR에 대한 링크
- 영향받는 AIWF 구성요소에 대한 참조

## 준수 검증
- 이 결정에 대한 준수 여부를 확인하는 방법
- 해당되는 경우 Engineering Guard 규칙
```

### AIWF 강화 구조

```markdown
# ADR-001: 결정 제목

**날짜**: YYYY-MM-DD
**상태**: 승인됨
**컨텍스트**: AIWF v0.3.16+ 프로젝트
**영향 범위**: [CLI | YOLO | Personas | Templates]
**페르소나 관련성**: [architect | developer | security]

## 컨텍스트
[표준 컨텍스트 섹션]

## 결정
[표준 결정 섹션]

## AIWF 통합

### CLI 영향
이 결정이 CLI 명령어와 워크플로에 미치는 영향.

### YOLO 모드 고려사항
자율 실행과 안전 메커니즘에 대한 의미.

### 페르소나 가이드라인
다른 AI 페르소나를 위한 구체적인 가이던스.

### 템플릿 업데이트
프로젝트 템플릿에 필요한 변경사항.

## 결과
[표준 결과 섹션]

## 검증 규칙

### Engineering Guard 규칙
```yaml
# .aiwf/yolo-config.yaml 추가사항
custom_rules:
  - name: "ADR-001 준수"
    pattern: "validation_pattern"
    severity: "warning"
```

### 자동화된 검사
- 준수 검증을 위한 단위 테스트
- CI/CD 파이프라인 검증
- AIWF 명령어 통합

## 구현 가이드

### 단계별 구현
1. [상세한 구현 단계]
2. [AIWF 특화 고려사항]
3. [검증 체크포인트]

### 코드 예제
```javascript
// 구현 예제
```

## 관련 문서
- [관련 AIWF 문서에 대한 링크]
- [관련 ADR]
- [AIWF 모듈 문서]
```

## AIWF와의 통합

### 디렉토리 구조

```
.aiwf/
├── adrs/
│   ├── 0001-module-architecture.md
│   ├── 0002-yolo-safety-mechanisms.md
│   ├── 0003-persona-selection-strategy.md
│   └── template.md
├── yolo-config.yaml
└── state.json
```

### AIWF 명령어 통합

#### 계획된 명령어 (향후 개선)
```bash
# 새 ADR 생성
aiwf adr create "데이터베이스 마이그레이션 전략"

# ADR 목록
aiwf adr list

# 특정 ADR 표시
aiwf adr show 001

# 현재 작업에 ADR 연결
aiwf adr link 001 --to-task T001

# ADR에 대한 현재 코드 검증
aiwf adr validate
```

### Claude Code 통합

#### ADR 인식 명령어
```markdown
# Claude Code에서
/aiwf_prime  # 이제 ADR 컨텍스트 로딩 포함
/aiwf_create_milestone_plan  # 관련 ADR 참조
/aiwf_yolo  # ADR 제약사항 고려
```

## ADR 생성

### ADR을 생성해야 할 때

1. **주요 아키텍처 변경**: 데이터베이스 스키마, API 설계, 모듈 구조
2. **기술 선택**: 프레임워크 선택, 라이브러리 채택, 도구 통합
3. **AIWF 특화 결정**: YOLO 동작, 페르소나 설정, 템플릿 설계
4. **보안 결정**: 인증, 권한 부여, 데이터 보호
5. **성능 결정**: 캐싱 전략, 최적화 접근법

### 생성 과정

#### 수동 생성
```bash
# 1. 템플릿 복사
cp .aiwf/adrs/template.md .aiwf/adrs/0001-your-decision.md

# 2. ADR 편집
vim .aiwf/adrs/0001-your-decision.md

# 3. 현재 작업에 연결
# 태스크나 스프린트 문서에 ADR 참조 추가

# 4. 커밋
git add .aiwf/adrs/0001-your-decision.md
git commit -m "docs: ADR-001 추가 for your decision"
```

#### AIWF 사용 (향후)
```bash
# 템플릿으로 생성
aiwf adr create "마이크로서비스 통신 패턴"

# 컨텍스트와 함께 생성
aiwf adr create "YOLO 안전 메커니즘" --context="yolo-mode"

# 페르소나 관점에서 생성
aiwf adr create "보안 정책" --persona="security"
```

## ADR 관리

### 생명주기 관리

#### 상태 전환
```
제안됨 → 승인됨 → [폐기됨 | 대체됨]
    ↓
 거부됨
```

#### 상태 업데이트
```markdown
# ADR을 폐기하려면
## 상태 업데이트
**이전 상태**: 승인됨
**새 상태**: 폐기됨
**날짜**: 2025-01-27
**이유**: ADR-015에 의해 대체됨
```

### 연결 및 참조

#### 태스크 통합
```markdown
# 태스크 파일에서
## 아키텍처 컨텍스트
- ADR-001: 모듈 아키텍처 패턴
- ADR-003: API 설계 원칙

## 준수 요구사항
- ADR-001 모듈 구조 따르기
- ADR-003 오류 처리 구현
```

#### 스프린트 계획
```markdown
# 스프린트 문서에서
## 고려할 아키텍처 결정
- [ ] 데이터베이스 접근 패턴을 위해 ADR-002 검토
- [ ] ADR-004 보안 가이드라인 적용
- [ ] ADR-001 모듈 구조에 대한 검증
```

## ADR 템플릿

### 기본 템플릿

```markdown
# ADR-{번호}: {제목}

**날짜**: {날짜}
**상태**: 제안됨
**컨텍스트**: AIWF 프로젝트

## 컨텍스트

우리가 직면한 문제는 무엇인가? 어떤 요소들이 관련이 있는가?

## 결정

우리가 만드는 변화는 무엇인가?

## 결과

그 결과로 무엇이 더 쉬워지거나 어려워지는가?
```

### AIWF 특화 템플릿

```markdown
# ADR-{번호}: {제목}

**날짜**: {날짜}
**상태**: 제안됨
**컨텍스트**: AIWF v{버전}+ 프로젝트
**영향 범위**: [CLI | YOLO | Personas | Templates | Core]
**페르소나 관련성**: [architect | developer | security | tester]

## 컨텍스트

### 문제 설명
[아키텍처 챌린지에 대한 설명]

### AIWF 컨텍스트
[AIWF 워크플로 및 구성요소와의 관련성]

### 제약사항
[기술적, 비즈니스적, 또는 프로젝트 제약사항]

## 결정

### 선택된 접근법
[내려진 아키텍처 결정]

### 고려된 대안
[평가된 다른 옵션들]

### 근거
[이 결정이 내려진 이유]

## AIWF 통합

### CLI 영향
[명령줄 작업에 미치는 영향]

### YOLO 모드 고려사항
[자율 실행에 대한 의미]

### 페르소나 가이드라인
[다른 AI 페르소나를 위한 가이던스]

### 템플릿 변경
[프로젝트 템플릿에 필요한 업데이트]

## 결과

### 긍정적
- [이점과 개선사항]

### 부정적
- [트레이드오프와 제한사항]

### 중립적
- [기타 효과]

## 구현

### 액션 아이템
- [ ] [구체적인 구현 단계]
- [ ] [AIWF 설정 업데이트]
- [ ] [문서 업데이트]

### 검증
[올바른 구현을 확인하는 방법]

### 일정
[해당되는 경우 구현 일정]

## 준수

### Engineering Guard 규칙
```yaml
# .aiwf/yolo-config.yaml에 추가할 규칙
adr_compliance:
  adr_{번호}:
    enabled: true
    severity: warning
    pattern: "{validation_pattern}"
```

### 자동화된 검사
[단위 테스트, CI/CD 검증 등]

## 관련 문서
- [관련 문서에 대한 링크]
- [관련 ADR]
- [AIWF 모듈 참조]

## 검토 및 승인

### 검토자
- [ ] 아키텍트: {이름}
- [ ] 리드 개발자: {이름}
- [ ] 보안 리드: {이름} (보안 관련인 경우)

### 승인 날짜
[ADR이 승인된 날짜]
```

## 모범 사례

### 효과적인 ADR 작성

1. **간결하게**: ADR을 집중되고 읽기 쉽게 유지
2. **구체적으로**: 모호한 언어와 일반화 피하기
3. **컨텍스트 포함**: 결정에 이르게 된 상황 설명
4. **트레이드오프 문서화**: 결과에 대해 솔직하게 기술
5. **코드에 연결**: 구체적인 구현 참조

### AIWF 특화 모범 사례

1. **페르소나 정렬**: 다른 페르소나가 ADR을 어떻게 해석할지 고려
2. **YOLO 호환성**: 결정이 자율 실행과 호환되는지 확인
3. **템플릿 통합**: 결정을 반영하여 프로젝트 템플릿 업데이트
4. **Engineering Guard 규칙**: 해당되는 경우 검증 규칙 추가
5. **스프린트 계획**: 태스크와 스프린트 문서에서 ADR 참조

### 유지보수 관행

1. **정기 검토**: 주기적으로 ADR 상태 검토 및 업데이트
2. **링크 검증**: 참조가 정확한지 확인
3. **구현 추적**: 결정 준수 모니터링
4. **지식 전수**: 새 팀원 온보딩에 ADR 활용

## 자동화 및 도구

### Git 훅 통합

```bash
# .git/hooks/pre-commit
#!/bin/bash
# 커밋 메시지에서 ADR 참조 검증
if git log -1 --pretty=%B | grep -q "ADR-[0-9]"; then
    echo "✅ 커밋 메시지에서 ADR 참조 발견"
else
    echo "ℹ️  커밋 메시지에 관련 ADR 참조 고려하기"
fi
```

### 향후 AIWF 통합

#### 계획된 기능
- **ADR 명령어**: `aiwf adr` 명령어 세트
- **컨텍스트 로딩**: Claude Code에서 자동 ADR 컨텍스트
- **검증**: Engineering Guard ADR 준수 검사
- **템플릿**: ADR 인식 프로젝트 템플릿

#### 제안된 워크플로
```bash
# 1. AIWF로 ADR 생성
aiwf adr create "API 속도 제한 전략"

# 2. 현재 작업에 연결
aiwf task link ADR-001 --to-current

# 3. 구현 검증
aiwf adr validate --against=ADR-001

# 4. 준수 리포트 생성
aiwf adr report --sprint=S01
```

## 예제

### 예제 1: 모듈 아키텍처 ADR

```markdown
# ADR-001: 모듈러 컴포넌트 아키텍처

**날짜**: 2025-01-27
**상태**: 승인됨
**컨텍스트**: AIWF v0.3.16+ 프로젝트
**영향 범위**: Core, CLI, Templates
**페르소나 관련성**: architect, developer

## 컨텍스트

AIWF가 유기적으로 성장하면서 컴포넌트들이 긴밀하게 결합되어 개별 기능을 테스트, 유지보수, 확장하기 어려워졌습니다.

## 결정

명확한 의존성 경계를 가진 모듈러 아키텍처 채택:
- 핵심 유틸리티 (paths, messages, language-utils)
- 기능 모듈 (persona, checkpoint, compression)
- 확장을 위한 플러그인 시스템

## AIWF 통합

### CLI 영향
명령어들이 필요한 기능에 따라 모듈을 동적으로 로드합니다.

### YOLO 모드 고려사항
모듈러 설계로 YOLO가 필요한 컴포넌트만 로드하여 성능을 향상시킵니다.

### Engineering Guard 규칙
```yaml
module_architecture:
  enforce_boundaries: true
  max_dependencies: 5
  circular_dependency_check: true
```

## 결과

### 긍정적
- 향상된 테스트 가능성과 유지보수성
- 더 빠른 개발 사이클
- 더 나은 플러그인 지원

### 부정적
- 초기 복잡성 증가
- 의존성 관리 필요

## 구현
- 기존 모놀리식 컴포넌트 리팩토링
- 의존성 주입 구현
- 문서 및 템플릿 업데이트
```

### 예제 2: YOLO 안전 메커니즘 ADR

```markdown
# ADR-002: YOLO 안전 메커니즘 프레임워크

**날짜**: 2025-01-27
**상태**: 승인됨
**컨텍스트**: AIWF v0.3.16+ YOLO 모드
**영향 범위**: YOLO, Engineering Guard, Checkpoint
**페르소나 관련성**: architect, security

## 컨텍스트

자율 실행은 데이터 손실, 보안 문제, 코드 품질 저하를 방지하기 위한 강력한 안전 메커니즘이 필요합니다.

## 결정

다층 안전 프레임워크 구현:
1. 코드 품질을 위한 Engineering Guard
2. 복구를 위한 체크포인트 시스템
3. 중요 작업을 위한 중단점 시스템
4. 실시간 모니터링 및 개입

## YOLO 모드 고려사항

안전 프레임워크는 자율 실행을 위해 특별히 설계됨:
- 논블로킹 품질 검사
- 실패 시 자동 롤백
- 개입의 점진적 에스컬레이션

## Engineering Guard 규칙
```yaml
yolo_safety:
  critical_file_protection: true
  test_failure_threshold: 10
  complexity_monitoring: true
  automatic_checkpoints: 5
```

## 구현
- YOLO 템플릿과 함께 engineering-guard.js 배포
- 세션 추적과 checkpoint-manager.js 통합
- yolo-config.yaml에 안전 설정 추가
```

## 관련 명령어

### 현재 AIWF 명령어
- `/aiwf_prime` - 프로젝트 컨텍스트 로드 (ADR 컨텍스트 포함 가능)
- `/aiwf_create_milestone_plan` - 계획에서 ADR 참조
- `/aiwf_do_task` - 구현 중 ADR 제약사항 고려

### 계획된 명령어
- `aiwf adr create` - 새 ADR 생성
- `aiwf adr list` - 모든 ADR 목록
- `aiwf adr validate` - ADR에 대한 코드 검증
- `aiwf adr link` - ADR을 태스크에 연결

## 관련 문서

- [ARCHITECTURE.md](ARCHITECTURE.ko.md) - 전체 시스템 아키텍처
- [MODULE_MANAGEMENT_GUIDE.md](MODULE_MANAGEMENT_GUIDE.ko.md) - 모듈 의존성 관리
- [YOLO_SYSTEM_GUIDE.md](YOLO_SYSTEM_GUIDE.ko.md) - YOLO 모드 문서
- [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.ko.md) - 개발 관행

---

**마지막 업데이트**: 2025-01-27  
**버전**: AIWF v0.3.16+ 호환  
**상태**: 문서 프레임워크 (ADR 명령어는 구현 예정)