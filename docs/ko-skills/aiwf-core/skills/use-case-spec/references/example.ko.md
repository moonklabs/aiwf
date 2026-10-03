# 유스케이스 예시: 예약 생성 (Use Case: Create Reservation)

> 휴먼 리뷰용 한글 번역입니다. 실행 원문: [원문](../../../../../../plugins/aiwf-core/skills/use-case-spec/references/example.md). 번역과 자동 검사는 승인을 뜻하지 않으며, 검토 상태와 원문 SHA256은 [관리 목록](../../../../manifest.json)에서 확인합니다.

아래는 `/use-case-spec`가 생성하는 완성된 유스케이스 명세의 예시다. 절 제목과 필드 라벨(`## Overview`, `**Use Case ID:**` 등)은 AI Unified Process Studio 파서와 검사기가 인식하는 표기이므로 원문 그대로 유지했고, 사람이 읽는 값과 문장은 한국어로 옮겼다. 괄호 안은 해당 표기나 용어의 원문이다.

- `## Overview` — 개요
- `## Preconditions` — 사전 조건
- `## Main Success Scenario` — 주 성공 시나리오
- `## Alternative Flows` — 대안 흐름
- `## Postconditions` — 사후 조건
- `### Success Postconditions` — 성공 사후 조건
- `### Failure Postconditions` — 실패 사후 조건
- `## Business Rules` — 비즈니스 규칙

이 예시의 `../requirements.md` 링크는 소비 프로젝트의 `docs/use_cases/` 문서를 기준으로 한 상대 경로이며 이 저장소의 실제 파일이 아니다. 아래에서 링크 텍스트를 인라인 코드로 감싼 것은 이것이 활성 내비게이션 링크로 해석되지 않게 하기 위함이다.

## Overview

**Use Case ID:** UC-001  
**Use Case Name:** 예약 생성 (Create Reservation)  
**Primary Actor:** 프런트 데스크 직원 (Front Desk Clerk)  
**Secondary Actors:** 결제 서비스 (Payment Service)  
**Goal:** 고객을 위한 새 객실 예약을 생성한다  
**Trigger:** 고객이 프런트 데스크에 객실 예약을 요청한다  
**Status:** Approved  

**Requirements:** `[FR-001, FR-002, NFR-001](../requirements.md)`

## Preconditions

- 프런트 데스크 직원이 인증되어 있다 (Front Desk Clerk is authenticated)
- 객실 재고가 구성되어 있다 (Room inventory is configured)

## Main Success Scenario

1. 직원이 메뉴에서 "New Reservation"을 선택한다.
2. 시스템이 예약 양식을 표시한다.
3. 직원이 고객 정보(이름, 이메일, 전화번호)를 입력한다.
4. 직원이 체크인과 체크아웃 날짜를 선택한다.
5. 시스템이 선택한 날짜에 사용 가능한 객실 유형을 표시한다.
6. 직원이 객실 유형을 선택한다.
7. 시스템이 총 가격을 계산한다.
8. 직원이 예약을 확정한다.
9. 시스템이 예약을 생성하고 확인 번호를 표시한다.

## Alternative Flows

### A1: 고객이 이미 존재함 (Guest Already Exists)

**Trigger:** 고객 이메일이 기존 레코드와 일치함 (step 3)  
**Flow:**

1. 시스템이 기존 고객 정보를 표시한다.
2. 직원이 고객 세부 정보를 확인하거나 갱신한다.
3. Use case continues at step 4.

### A2: 사용 가능한 객실 없음 (No Rooms Available)

**Trigger:** 선택한 날짜에 사용 가능한 객실이 없음 (step 5)  
**Flow:**

1. 시스템이 "No availability" 메시지를 표시한다.
2. 직원이 날짜를 조정하거나 작업을 취소한다.
3. Use case continues at step 4 or ends.

### A3: 결제 필요 (Payment Required)

**Trigger:** 비즈니스 규칙이 보증금을 요구함 (step 8)  
**Flow:**

1. 시스템이 결제 정보를 요청한다.
2. 직원이 결제 세부 정보를 입력한다.
3. 시스템이 결제를 처리한다.
4. Use case continues at step 9.

## Postconditions

### Success Postconditions

- 예약이 "Confirmed" 상태로 시스템에 저장된다 (Reservation is stored in the system with status "Confirmed")
- 예약된 날짜에 대해 객실 가용성이 갱신된다 (Room availability is updated for the reserved dates)
- 고객에게 확인 이메일이 발송된다 (Confirmation email is sent to the guest)

### Failure Postconditions

- 예약이 생성되지 않는다 (No reservation is created)
- 객실 가용성이 변경되지 않는다 (Room availability remains unchanged)
- 저장된 예약 없이 결제가 청구되지 않는다 (No payment is charged without a stored reservation)

## Business Rules

### BR-001: 최소 숙박 (Minimum Stay)

예약은 최소 1박이어야 한다.

### BR-002: 사전 예약 한도 (Advance Booking Limit)

예약은 365일을 초과하여 미리 할 수 없다.

### BR-003: 보증금 요구 (Deposit Requirement)

3박 이상의 예약은 50% 보증금을 요구한다.
