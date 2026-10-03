# 테스트 케이스 예시: 주문 이행 (Test Case: Order Fulfillment)

> 휴먼 리뷰용 한글 번역입니다. 실행 원문: [원문](../../../../../../plugins/aiwf-core/skills/test-case/references/example.md). 번역과 자동 검사는 승인을 뜻하지 않으며, 검토 상태와 원문 SHA256은 [관리 목록](../../../../manifest.json)에서 확인합니다.

아래는 `/test-case`가 생성하는 완성된 테스트 케이스 문서의 예시다. 절 제목과 필드 라벨(`## Overview`, `**ID:**` 등)과 Priority·Status 값은 파서와 엔드투엔드 테스트 자동화가 인식하는 표기이므로 원문 그대로 유지했고, 사람이 읽는 값과 문장은 한국어로 옮겼다. 괄호 안은 해당 값의 원문이다.

- `## Overview` — 개요
- `## Roles` — 역할
- `## Preconditions` — 사전 조건
- `## Flow` — 흐름
- `## Validation` — 검증
- `## Postconditions` — 사후 조건

이 예시의 `../use_cases/...` 링크는 소비 프로젝트의 `docs/test_cases/` 문서를 기준으로 한 상대 경로이며 이 저장소의 실제 파일이 아니다. 활성 내비게이션 링크로 해석되지 않도록 링크 텍스트를 인라인 코드로 감쌌다. 테스트 데이터 값(Acme Corp, Widget, 5)과 상태 값(New, Shipped)은 자동화가 입력하고 확인할 리터럴 값이므로 원문을 유지했다.

## Overview

**ID:** TC-001  
**Goal:** 서기가 새 주문을 만들고 창고 운영자가 이를 발송한다 — 주문 생명주기를 생성부터 발송까지 엔드투엔드로 검증한다  
**Priority:** Critical  
**Status:** Approved

## Roles

- Clerk (주문 생성)
- Warehouse Operator (주문 발송)

## Preconditions

- 고객 "Acme Corp"가 존재한다 (Flyway 테스트 데이터 `V900__test_data.sql`)
- 상품 "Widget"이 충분한 재고와 함께 존재한다 (Flyway 테스트 데이터 `V900__test_data.sql`)

## Flow

| Step | Name                | Description                                                              | Test Data            | Use Case                                      |
|------|---------------------|--------------------------------------------------------------------------|----------------------|-----------------------------------------------|
| 1    | Create order (주문 생성) | 서기가 고객을 위해 상품과 수량으로 새 주문을 생성한다                 | Acme Corp, Widget, 5 | `[UC-010](../use_cases/UC-010-create-order.md)` |
| 2    | Verify order listed (주문 목록 확인) | 새 주문이 상태 "New"로 주문 그리드에 나타난다         | -                    | -                                             |
| 3    | Ship order (주문 발송) | 창고 운영자가 열린 주문을 발송한다                                    | -                    | `[UC-011](../use_cases/UC-011-ship-order.md)`   |
| 4    | Verify shipment (발송 확인) | 발송 확인 알림이 표시된다                                        | -                    | -                                             |

## Validation

1. **Order count (주문 수)**: 흐름이 끝난 뒤, 주문 그리드에 테스트 케이스 시작 전보다 정확히 하나 많은 주문이 있다.
2. **Final status (최종 상태)**: 1단계에서 생성한 주문이 주문 그리드에서 상태 "Shipped"를 가진다.

## Postconditions

- "Acme Corp"에 대한 주문 하나(Widget, 수량 5)가 상태 "Shipped"로 존재한다.
- 그 주문에 대한 발송 하나가 존재한다.
- 발송은 그것이 속한 주문보다 먼저 삭제되어야 한다. 시드된 고객과 상품은 그대로 남는다.
