# 엔티티 모델 참고 자료

> 휴먼 리뷰용 한글 번역입니다. 실행 원문: [원문](../../../../../../plugins/aiwf-core/skills/entity-model/references/REFERENCE.md). 번역과 자동 검사는 승인을 뜻하지 않으며, 검토 상태와 원문 SHA256은 [관리 목록](../../../../manifest.json)에서 확인합니다.

<!--
Copyright 2025-2026 Simon Martinelli and the AI Unified Process contributors.
Part of the AI Unified Process — https://unifiedprocess.ai
Licensed under the Apache License, Version 2.0. See LICENSE and NOTICE.
-->

## 검증 규칙

"Validation Rules" 열에는 다음 값을 사용합니다(절대 비워 두지 않습니다):

| Attribute Type                | Validation Rules Value              |
|-------------------------------|-------------------------------------|
| 기본 키                        | Primary Key, Sequence               |
| 자연 키 또는 복합 키            | Primary Key                         |
| 복합 키이면서 외래 키           | Primary Key, Foreign Key (TABLE.id) |
| 필수 필드                      | Not Null                            |
| 고유 필드                      | Not Null, Unique                    |
| 외래 키                        | Not Null, Foreign Key (TABLE.id)    |
| 선택 필드                      | Optional                            |
| 범위 지정                      | Not Null, Min: X, Max: Y            |
| 값 목록                        | Not Null, Values: A, B, C           |
| 이메일                         | Not Null, Format: Email             |

## 데이터 타입

| Data Type | Length/Precision | Usage                 |
|-----------|------------------|-----------------------|
| Long      | 19               | ID, 외래 키            |
| String    | varies (50-500)  | 텍스트 필드            |
| Integer   | 10               | 정수                   |
| Decimal   | 10,2             | 통화, 백분율           |
| Boolean   | 1                | 참/거짓 플래그         |
| Date      | -                | 날짜만                 |
| DateTime  | -                | 날짜와 시간            |
