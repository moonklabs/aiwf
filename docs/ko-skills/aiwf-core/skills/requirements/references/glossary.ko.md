# 용어집

> 휴먼 리뷰용 한글 번역입니다. 실행 원문: [원문](../../../../../../plugins/aiwf-core/skills/requirements/references/glossary.md). 번역과 자동 검사는 승인을 뜻하지 않으며, 검토 상태와 원문 SHA256은 [관리 목록](../../../../manifest.json)에서 확인합니다.

이 파일은 기능 요구사항 스킬이 `docs/glossary.md`를 만들 때 구조로 사용하는 예시입니다. 원문 첫 줄은 `# Glossary`이며, 표의 행은 호텔 도메인 예시 데이터입니다. 생성될 문서의 형식을 그대로 보여 주기 위해 아래 표는 원문을 유지했고, 각 행의 한국어 뜻을 함께 적었습니다.

| Term        | Definition                                                                    | Avoid             |
|-------------|-------------------------------------------------------------------------------|-------------------|
| Guest       | A person who stays at the hotel, whether or not they made the reservation.   | Customer, Client  |
| Reservation | A guest's claim on a room type for a date range, before check-in.             | Booking           |
| Clerk       | An employee at the front desk who records reservations and check-ins.         |                   |

행별 의미:

- `Guest` — 호텔에 묵는 사람이며, 예약을 했는지와 무관하다. (Customer, Client는 사용하지 않음)
- `Reservation` — 체크인 전, 날짜 범위에 대해 손님이 객실 유형에 갖는 청구권이다. (Booking은 사용하지 않음)
- `Clerk` — 예약과 체크인을 기록하는 프런트 데스크 직원이다. (Avoid 없음)

열 설명: `Term`은 선호하는 용어 이름(단수), `Definition`은 이 개념을 이웃 개념과 구별하는 정의, `Avoid`는 이 개념에 사용해서는 안 되는 쉼표 구분 동의어입니다.
