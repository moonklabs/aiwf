# Use Case: 지출 내역 제출

## Overview

**Use Case ID:** UC-001  
**Use Case Name:** 지출 내역 제출  
**Primary Actor:** 제출자  
**Goal:** 제출자가 지출 내역을 제출하여 승인자가 검토할 수 있게 한다.  
**Trigger:** 제출자가 지출 내역 제출을 요청한다.  
**Status:** Reviewed  

**Requirements:** [FR-001](../requirements.md)

## Preconditions

- 제출자가 시스템에 로그인되어 있다
- 제출할 지출 내역의 금액과 사용 내용을 알고 있다

## Main Success Scenario

1. 제출자가 지출 내역 제출을 시작한다.
2. 시스템이 지출 내역 입력 화면을 표시한다.
3. 제출자가 지출 금액과 사용 내용을 입력한다.
4. 시스템이 입력한 금액이 0보다 큰지 확인한다.
5. 제출자가 제출을 확정한다.
6. 시스템이 지출 내역을 제출 상태로 기록하고 접수 번호를 표시한다.

## Alternative Flows

### A1: 유효하지 않은 금액

**Trigger:** 입력한 금액이 0 이하이다 (step 4)  
**Flow:**

1. 시스템이 금액은 0보다 커야 한다는 메시지를 표시한다.
2. 제출자가 금액을 수정한다.
3. Use case continues at step 4.

### A2: 제출 처리 실패

**Trigger:** 시스템이 지출 내역을 기록할 수 없다 (step 6)  
**Flow:**

1. 시스템이 제출을 완료하지 못했음을 알린다.
2. Use case ends.

## Postconditions

### Success Postconditions

- 지출 내역이 제출 상태로 기록되어 있다
- 제출자에게 접수 번호가 부여되어 있다

### Failure Postconditions

- 지출 내역이 제출 상태로 기록되지 않는다
- 기존에 기록된 지출 내역은 변경되지 않는다

## Business Rules

### BR-001: 금액 조건

제출하는 지출 금액은 0보다 커야 한다.
