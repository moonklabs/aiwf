# CONTEXT.md 용어집 형식

> 휴먼 리뷰용 한글 번역입니다. 실행 원문: [원문 스냅샷](source/CONTEXT-FORMAT.md). 번역과 자동 검사는 승인을 뜻하지 않으며, 검토 상태와 원문 SHA256은 [관리 목록](../../manifest.json)에서 확인합니다.

## 구조

아래는 원문 템플릿이다. 컨텍스트의 이름과 존재 이유를 한두 문장으로 적고, `Language` 아래에 용어별 짧은 정의와 피할 표현을 둔다.

```md
# {Context Name}

{One or two sentence description of what this context is and why it exists.}

## Language

**Order**:
{A one or two sentence description of the term}
_Avoid_: Purchase, transaction

**Invoice**:
A request for payment sent to a customer after delivery.
_Avoid_: Bill, payment request

**Customer**:
A person or organization that places orders.
_Avoid_: Client, buyer, account
```

예제에서 Invoice는 인도 후 고객에게 보내는 지급 요청이고, Customer는 주문하는 개인 또는 조직이다. `_Avoid_`에는 그 개념에 쓰지 않을 대체 표현을 적는다.

## 규칙

- **용어를 명확히 선택한다.** 같은 개념을 가리키는 단어가 여러 개라면 가장 적절한 하나를 선택하고 나머지를 `_Avoid_`에 적는다.
- **정의를 짧게 유지한다.** 최대 한두 문장으로 개념 자체가 무엇인지 정의한다. 무엇을 하는지 나열하는 설명으로 대신하지 않는다.
- **프로젝트 컨텍스트에 특화된 용어만 포함한다.** 타임아웃, 오류 유형, 유틸리티 패턴 같은 일반 프로그래밍 개념은 프로젝트에서 많이 써도 넣지 않는다. 추가하기 전에 해당 컨텍스트에 고유한 개념인지 일반 프로그래밍 개념인지 확인한다. 전자만 포함한다.
- **자연스러운 묶음이 생기면 소제목으로 분류한다.** 모든 용어가 하나의 응집된 영역에 속하면 단순 목록도 적절하다.

## 단일 컨텍스트와 여러 컨텍스트

**단일 컨텍스트인 대부분의 저장소:** 루트에 `CONTEXT.md` 하나를 둔다.

**여러 컨텍스트:** 루트의 `CONTEXT-MAP.md`에 컨텍스트, 위치와 관계를 적는다.

```md
# Context Map

## Contexts

- [Ordering](./src/ordering/CONTEXT.md) — receives and tracks customer orders
- [Billing](./src/billing/CONTEXT.md) — generates invoices and processes payments
- [Fulfillment](./src/fulfillment/CONTEXT.md) — manages warehouse picking and shipping

## Relationships

- **Ordering → Fulfillment**: Ordering emits `OrderPlaced` events; Fulfillment consumes them to start picking
- **Fulfillment → Billing**: Fulfillment emits `ShipmentDispatched` events; Billing consumes them to generate invoices
- **Ordering ↔ Billing**: Shared types for `CustomerId` and `Money`
```

예제에서는 Ordering이 주문을 접수·추적하고, Billing이 청구서·지급을 처리하며, Fulfillment가 창고 피킹·배송을 관리한다. 주문 이벤트로 피킹을 시작하고, 발송 이벤트로 청구서를 생성하며, 일부 식별자와 금액 타입을 공유한다.

스킬은 다음과 같이 적용 구조를 판단한다.

- `CONTEXT-MAP.md`가 있으면 이를 읽어 컨텍스트 위치를 찾는다.
- 루트 `CONTEXT.md`만 있으면 단일 컨텍스트다.
- 둘 다 없으면 첫 용어가 확정될 때 루트 `CONTEXT.md`를 만든다.

여러 컨텍스트가 있으면 현재 주제가 어느 컨텍스트에 해당하는지 판단한다. 불명확하면 질문한다.
