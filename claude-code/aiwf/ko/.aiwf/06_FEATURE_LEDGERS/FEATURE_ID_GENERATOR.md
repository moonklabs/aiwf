# Feature ID 생성 규칙

## 개요

Feature ID는 AIWF 프레임워크에서 각 Feature를 고유하게 식별하는 데 사용되는 식별자입니다.

## ID 형식

```
FL### (예: FL001, FL002, FL010, FL999)
```

- **접두사**: `FL` (Feature Ledger)
- **번호**: 3자리 숫자 (001-999)
- **총 길이**: 5자리

## 생성 규칙

### 1. 자동 증분 방식
- Feature ID는 자동으로 증분됩니다
- 마지막 생성된 ID를 기준으로 다음 번호를 할당

### 2. 번호 할당 로직
```
다음 ID = max(기존_모든_Feature_ID) + 1
```

### 3. 번호 범위
- **시작**: FL001
- **최대**: FL999 (총 999개 Feature 지원)
- **예약**: FL000 (시스템 예약)

### 4. ID 검색 순서
1. `active/` 디렉토리 검색
2. `completed/` 디렉토리 검색  
3. `archived/` 디렉토리 검색
4. 최대값 확인 후 +1

## 구현 예시

### JavaScript 구현
```javascript
function generateNextFeatureId() {
  const directories = ['active', 'completed', 'archived'];
  let maxId = 0;
  
  directories.forEach(dir => {
    const files = fs.readdirSync(`06_FEATURE_LEDGERS/${dir}`);
    files.forEach(file => {
      const match = file.match(/^FL(\d{3})_/);
      if (match) {
        const idNumber = parseInt(match[1], 10);
        maxId = Math.max(maxId, idNumber);
      }
    });
  });
  
  const nextId = maxId + 1;
  return `FL${nextId.toString().padStart(3, '0')}`;
}
```

### CLI 명령어 구현
```bash
# 다음 Feature ID 조회
/aiwf_next_feature_id

# Feature 생성 시 자동 ID 할당
/aiwf_create_feature_ledger "제목" "설명"
```

## 파일명 생성 규칙

### 1. 기본 구조
```
{feature_id}_{sanitized_title}.md
```

### 2. 제목 정제 규칙
- 공백 → 언더스코어 (`_`)
- 특수문자 제거 (알파벳, 숫자, 언더스코어, 하이픈만 허용)
- 최대 길이: 50자
- 소문자 변환

### 3. 예시
```
입력: "사용자 인증 시스템 개발"
출력: "FL001_사용자_인증_시스템_개발.md"

입력: "API 응답 속도 최적화 (Redis 캐시 적용)"
출력: "FL002_api_응답_속도_최적화_redis_캐시_적용.md"
```

## 중복 방지 메커니즘

### 1. ID 중복 검사
- 새 ID 생성 전 기존 ID 전체 검색
- 동시성 제어를 위한 락 메커니즘 필요

### 2. 파일명 충돌 처리
```
기본: FL001_사용자_인증.md
충돌 시: FL001_사용자_인증_2.md
```

### 3. 삭제된 ID 재사용 금지
- 한 번 사용된 ID는 영구적으로 예약
- 아카이브된 Feature의 ID도 재사용하지 않음

## 검증 규칙

### 1. ID 형식 검증
```regex
^FL[0-9]{3}$
```

### 2. 범위 검증
- 001-999 범위 내에서만 생성
- FL000은 시스템 예약으로 사용 불가

### 3. 고유성 검증
- 모든 디렉토리에서 ID 고유성 보장
- 대소문자 구분하여 검증

## 마이그레이션 전략

### 1. 기존 Feature 마이그레이션
- 기존 Feature들에 순차적으로 ID 할당
- 생성 날짜 순으로 정렬 후 ID 부여

### 2. 백업 및 복구
- ID 생성 전 현재 상태 백업
- 롤백 가능한 마이그레이션 수행

---

*생성일: 2025-07-08*
*최종 업데이트: 2025-07-08 20:55*