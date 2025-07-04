# 테스팅 리뷰 - 탑 다운 실행

아키텍처, 진행 상황, 기술 결정에 초점을 맞춘 포괄적인 프로젝트 수준 리뷰를 수행합니다.

## 전제조건 확인

**먼저**, 테스팅 전략 문서가 존재하는지 확인하세요:

- `.aiwf/01_PROJECT_DOCS/TESTING_STRATEGY.md` 확인
- 찾을 수 없는 경우, 사용자에게 알립니다: "테스팅 전략 문서가 없습니다. 새로 만들어드릴까요, 아니면 일반적인 테스트 품질 검토로 진행할까요?"
- 사용자가 전략 없이 진행하려는 경우, 일반적인 테스트 품질 원칙에 초점을 맞춰 검토를 조정합니다

## 정확히 다음 7개 항목으로 TODO 생성

1. 테스팅 전략 문서 로드 (또는 검토 기준 정의)
2. 테스트 구현 구조 분석
3. 테스트-코드 정렬 평가
4. 잘못 정렬되거나 불필요한 테스트 식별
5. 핵심 기능 커버리지 평가
6. 수정 권장사항 생성
7. 정렬 보고서 생성

단계별로 따라가며 각 단계에 대한 다음 지침을 엄격히 준수하세요.

## 모든 TODO 항목에 대한 세부사항

### 1. 테스팅 전략 문서 로드 (또는 검토 기준 정의)

**옵션 A - 전략 문서가 존재하는 경우:**

- `.aiwf/01_PROJECT_DOCS/TESTING_STRATEGY.md` 로드
- 주요 원칙과 우선순위 추출
- 테스트해야 할 것과 하지 말아야 할 것 식별
- 커버리지 기대치와 품질 게이트 주목
- 테스팅 철학 이해

**옵션 B - 전략 문서가 없는 경우:**
검토 기준으로 일반적인 모범 사례를 사용:

- 테스트는 구현이 아닌 동작에 초점을 맞춰야 함
- 핵심 경로에는 커버리지가 있어야 함
- 테스트는 유지보수 가능하고 명확해야 함
- 단순한 getter/setter 과도 테스트 피하기
- 커버리지와 유지보수 부담 간의 균형

이 검토에 사용되는 접근법을 **문서화**하세요.

### 2. 테스트 구현 구조 분석

현재 테스트 코드베이스를 **검토**하세요:

- 테스트 실행을 위해 test.md 명령 사용 (@.claude/commands/aiwf/aiwf_test.md)
- 테스트 디렉토리 구조와 조직 탐색
- 테스트 카테고리와 그 목적 식별
- 테스트 명명 규칙과 패턴 확인
- 테스트 인프라나 유틸리티 주목

**개수 세기가 아닌 존재하는 것을 이해하는 데 집중하세요.**

### 3. 테스트-코드 정렬 평가

테스트를 실제 구현과 **비교**하세요:

- 각 주요 구성요소에 대해 테스트가 기능과 일치하는지 확인
- 동작 대 구현 세부사항을 테스트하는 테스트 식별
- 과도한 설정이나 모킹이 있는 테스트 찾기
- 리팩토링 시 자주 깨지는 테스트 찾기
- 테스트 복잡성이 코드 복잡성과 일치하는지 확인

**핵심 질문:** 테스트가 사용자가 중요하게 여기는 것을 검증하는가?

### 4. 잘못 정렬되거나 불필요한 테스트 식별

가치를 제공하지 않는 테스트를 **검색**하세요:

**전략 문서를 사용하는 경우:**

- 전략에서 "건너뛰기"로 표시된 영역의 테스트
- 정의된 범위를 벗어난 테스트
- 전략 가이드라인에 따라 과도하게 명시된 테스트

**일반 원칙을 사용하는 경우:**

- 단순한 기능에 대한 과도하게 설계된 테스트
- 모든 리팩토링에서 깨지는 테스트
- 중요하지 않은 기능의 에지 케이스 테스트
- 과도한 모킹/설정이 있는 테스트
- 성능 요구사항 없는 성능 테스트

**수정하거나 제거할 특정 테스트 목록을 생성하세요.**

### 5. 핵심 기능 커버리지 평가

필수 기능에 적절한 테스트가 있는지 **검증**하세요:

**전략 문서를 사용하는 경우:**

- 전략에서 정의된 높은 우선순위 영역의 커버리지 확인
- 전략별 요구사항이 테스트되는지 검증

**모든 검토에 대해:**

- 핵심 경로 테스트의 차이 식별
- 해당되는 경우 인증/권한 확인
- 중요한 작업의 오류 처리 검증
- 필요한 곳에 데이터 무결성 테스트 존재 보장
- 통합 지점이 테스트되는지 확인

**해결이 필요한 특정 차이를 기록하세요.**

### 6. 수정 권장사항 생성

구체적이고 실행 가능한 권장사항을 **생성**하세요:

각 발견사항에 대해:

- 테스트 파일과 함수 명시
- 수정이 필요한 이유 설명
- 구체적인 변경사항 제안 (제거, 단순화, 추가)
- 도움이 된다면 개선된 접근법의 예시 제공

**형식:**

```
파일: tests/test_example.py::test_function_name
문제: [문제점]
조치: [해야 할 일]
이유: [전략과 일치하는 이유]
```

### 7. 정렬 보고서 생성

테스트-전략 정렬에 대한 집중된 보고서를 **생성**하세요:

- 시스템 날짜 명령을 사용하여 현재 타임스탬프 가져오기
- `.aiwf/10_STATE_OF_PROJECT/YYYY-MM-DD-HH-MM-test-alignment.md`에 보고서 생성

**보고서 구조:**

```markdown
# 테스트-전략 정렬 검토 - [YYYY-MM-DD HH:MM]

## 정렬 요약

테스팅 전략과의 전반적인 정렬: [우수 | 양호 | 개선 필요 | 부족]

주요 발견사항:

- [테스트 스위트 건강상태에 대한 주요 발견사항]
- [커버리지에 대한 주요 발견사항]
- [유지보수 부담에 대한 주요 발견사항]

## 수정이 필요한 테스트

### 제거 (과도하게 설계되었거나 범위를 벗어남)

[이유와 함께 특정 테스트 목록]

### 단순화 (목적에 비해 너무 복잡함)

[단순화 접근법과 함께 특정 테스트 목록]

### 추가 (핵심 격차)

[핵심 경로에 대한 특정 누락된 테스트 목록]

## 권장 조치

### 즉시 (차단 문제)

- [ ] [파일/테스트 참조와 함께 구체적인 조치]

### 단기 (품질 개선)

- [ ] [파일/테스트 참조와 함께 구체적인 조치]

### 장기 (기술 부채)

- [ ] [파일/테스트 참조와 함께 구체적인 조치]

## 테스트 건강 지표

- 테스트가 코드 목적과 일치: [예 | 부분적으로 | 아니오]
- 핵심 경로 커버됨: [예 | 부분적으로 | 아니오]
- 유지보수 부담 합리적: [예 | 부분적으로 | 아니오]
- 테스트가 개발 속도 지원: [예 | 부분적으로 | 아니오]

## 구현 예시

[필요한 경우, 테스트 개선의 전후 예시 표시]

## 다음 검토

권장 검토 시기: [X주/스프린트]
다음 검토 집중 영역: [모니터링할 특정 영역]
```

**중요:** 메트릭이 아닌 정렬과 균형에 초점을 맞추세요. 목표는 프로젝트의 실제 요구를 충족하는 테스트입니다.
