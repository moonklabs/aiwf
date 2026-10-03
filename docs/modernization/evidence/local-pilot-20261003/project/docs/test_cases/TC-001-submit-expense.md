# Test Case: 지출 내역 제출

## Overview

**ID:** TC-001  
**Goal:** 제출자가 지출 내역을 제출하고 접수 번호를 받는 흐름을 끝까지 확인한다.  
**Priority:** High  
**Status:** Reviewed  

## Roles

- 제출자 (지출 금액과 사용 내용을 입력하고 제출한다)

## Preconditions

- 제출자 계정이 준비되어 있다 (테스트 데이터 시드)

## Flow

| Step | Name | Description | Test Data | Use Case |
|------|------|-------------|-----------|----------|
| 1 | 제출 시작 | 제출자가 지출 내역 제출을 시작한다 | - | [UC-001](../use_cases/UC-001-submit-expense.md) |
| 2 | 잘못된 금액 입력 | 제출자가 금액과 사용 내용을 입력한다 | -100, 팀 회식 | [UC-001](../use_cases/UC-001-submit-expense.md) |
| 3 | 오류 확인 | 금액 오류 메시지가 표시되고 제출된 내역이 없음을 확인한다 | - | - |
| 4 | 금액 수정 | 제출자가 금액을 수정한다 | 12000 | [UC-001](../use_cases/UC-001-submit-expense.md) |
| 5 | 제출 확정 | 제출자가 제출을 확정한다 | - | [UC-001](../use_cases/UC-001-submit-expense.md) |
| 6 | 접수 확인 | 접수 번호가 표시되는지 확인한다 | - | - |

## Validation

1. **접수 상태**: 최종 지출 내역이 제출 상태로 표시된다.
2. **금액 보존**: 기록된 금액이 12000으로 표시된다.

## Postconditions

- 지출 내역 1건이 제출 상태로 남는다 (금액 12000, 사용 내용 팀 회식).
- 접수 번호가 기록된다.
