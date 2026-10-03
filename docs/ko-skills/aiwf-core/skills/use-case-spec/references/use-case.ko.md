# 유스케이스 템플릿: [유스케이스 이름] (Use Case: [Use Case Name])

> 휴먼 리뷰용 한글 번역입니다. 실행 원문: [원문](../../../../../../plugins/aiwf-core/skills/use-case-spec/references/use-case.md). 번역과 자동 검사는 승인을 뜻하지 않으며, 검토 상태와 원문 SHA256은 [관리 목록](../../../../manifest.json)에서 확인합니다.

아래는 `/use-case-spec`가 채우는 빈 템플릿이다. 절 제목과 필드 라벨(`## Overview`, `**Use Case ID:**` 등)과 상태 값은 Studio 파서와 검사기가 인식하는 표기이므로 원문 그대로 두었고, 대괄호 안의 작성 지침은 한국어로 옮겼다.

위 `**Requirements:**` 줄의 `../requirements.md` 링크는 소비 프로젝트의 `docs/use_cases/` 문서를 기준으로 한 상대 경로의 예시이며 이 저장소의 실제 파일이 아니다. 링크 텍스트를 인라인 코드로 감싼 것은 이것이 활성 내비게이션 링크로 해석되지 않게 하기 위함이다.

## Overview

**Use Case ID:** UC-XXX  
**Use Case Name:** [서술적 이름]  
**Primary Actor:** [목표를 추구하는 역할 — 각 역할이 스스로 유스케이스를 시작하고 같은 목표를 추구할 때는 쉼표로 구분하여 여럿]  
**Secondary Actors:** [지원 역할 또는 외부 시스템, 쉼표 구분 — 없으면 이 줄을 생략]  
**Goal:** [한 문장으로: 액터가 달성하는 관찰 가능한 결과와 그 이유 — "시스템을 사용한다"가 아님]  
**Trigger:** [유스케이스를 시작하는 이벤트 — 액터의 요청, 시점, 또는 외부 시스템의 메시지; 이미 참인 상태가 아님]  
**Status:** Draft | Reviewed | Approved | Implemented | Tested | Done | Obsolete  

**Requirements:** `[FR-XXX, NFR-XXX, C-XXX](../requirements.md)`

## Preconditions

- [유스케이스가 시작되기 전에 참이어야 하는 조건]

## Main Success Scenario

1. [액터 행동 또는 시스템 응답]
2. [다음 단계]
3. [목표가 달성될 때까지 계속]

## Alternative Flows

### A1: [대안 흐름 이름]

**Trigger:** [이 흐름을 트리거하는 조건] (step N)  
**Flow:**

1. [주 흐름에서 벗어나는 단계]
2. [계속]
3. Use case continues at step N. *(또는: Use case ends.)*

## Postconditions

### Success Postconditions

- [성공적으로 완료된 뒤의 시스템 상태]

### Failure Postconditions

- [유스케이스의 모든 비성공적 종료에 성립하는 최소 보장, 예: 부분 데이터가 저장되지 않음]

## Business Rules

### BR-XXX: [규칙 이름]

[이 유스케이스에 적용되는 비즈니스 규칙 설명]
