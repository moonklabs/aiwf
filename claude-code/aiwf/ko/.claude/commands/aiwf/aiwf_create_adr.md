# /create_adr - 아키텍처 결정 기록(ADR) 생성

## 목적
아키텍처 또는 기술적 결정이 필요할 때 체계적인 ADR 문서를 생성합니다.

## 사용법
```
/create_adr [제목] [--template basic|detailed] [--status proposed|accepted]
```

## 실행 단계

### 1. ADR 번호 결정
```bash
# 기존 ADR 번호 확인
ls .aiwf/05_ARCHITECTURAL_DECISIONS/ | grep "ADR" | sort -V | tail -1
```

### 2. ADR 생성 정보 수집

다음 정보를 수집합니다:
- **제목**: 결정의 핵심 내용
- **컨텍스트**: 왜 이 결정이 필요한가?
- **대안들**: 고려된 다른 옵션들
- **결정**: 선택된 해결책
- **결과**: 예상되는 긍정적/부정적 영향

### 3. ADR 파일 생성

```markdown
---
adr_id: ADR{{next_number}}
title: "{{제목}}"
status: "proposed"
date: {{오늘날짜}}
authors: ["{{현재사용자}}"]
---

# ADR{{next_number}}: {{제목}}

## Status
proposed - {{오늘날짜}}

## Context
{{결정이 필요한 상황과 배경 설명}}

## Decision
{{채택할 해결책과 그 이유}}

## Consequences

### Positive
- {{긍정적 영향}}

### Negative  
- {{부정적 영향 또는 트레이드오프}}

## Alternatives Considered

### {{대안 1}}
{{고려했지만 채택하지 않은 이유}}

### {{대안 2}}
{{고려했지만 채택하지 않은 이유}}

## Implementation Notes
{{구현시 고려사항, 마이그레이션 단계}}

## Related
- {{관련 ADR, 이슈, 문서 링크}}
```

### 4. 파일 저장
```bash
# ADR 파일 생성
echo "{{ADR내용}}" > .aiwf/05_ARCHITECTURAL_DECISIONS/ADR{{번호}}_{{제목}}.md
```

### 5. 프로젝트 매니페스트 업데이트
```bash
# 매니페스트에 ADR 추가 기록
echo "- ADR{{번호}}: {{제목}} ({{날짜}})" >> .aiwf/00_PROJECT_MANIFEST.md
```

### 6. 상태 인덱스 동기화
```bash
# 워크플로우 상태 업데이트
aiwf state update
# 현재 상태 확인
aiwf state show
```

## 입력 예시

**사용자 입력:**
```
/create_adr "데이터베이스 선택: PostgreSQL vs MongoDB"
```

**생성되는 파일:**
- `.aiwf/05_ARCHITECTURAL_DECISIONS/ADR001_Database_Selection_PostgreSQL_vs_MongoDB.md`

## 고급 사용법

### 기존 ADR 업데이트
```bash
# 상태 변경 (proposed → accepted)
# 파일 헤더의 status 필드 수정
sed -i 's/status: "proposed"/status: "accepted"/' ADR001_*.md
```

### ADR 연결
```bash
# 관련 ADR 링크 추가
echo "- Related to ADR002: API Authentication" >> ADR001_*.md
```

## 출력 형식

```
✅ ADR 생성 완료

📁 파일 위치: .aiwf/05_ARCHITECTURAL_DECISIONS/ADR001_Database_Selection.md
📋 상태: proposed
📅 생성일: 2024-01-15
👤 작성자: user

🔗 다음 단계:
1. 팀 리뷰 진행
2. 결정 확정시 상태를 'accepted'로 변경
3. 구현 시작
```

## 주의사항
- ADR 번호는 자동으로 증가합니다
- 중요한 아키텍처 결정만 ADR로 기록하세요
- 상태 변경시 날짜도 함께 업데이트하세요
- 구현 완료 후 실제 결과를 문서에 반영하세요

**중요:** 간결하게 유지하세요. ADR은 결정의 핵심과 근거에 집중해야 합니다.