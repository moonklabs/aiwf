# /update_adr - 기존 ADR 업데이트

## 목적
기존 ADR의 상태 변경, 내용 수정, 또는 후속 결정 사항을 업데이트합니다.

## 사용법
```
/update_adr [ADR번호] [--status proposed|accepted|deprecated|superseded] [--reason "이유"]
```

## 실행 단계

### 1. 기존 ADR 확인
```bash
# ADR 목록 보기
ls .aiwf/05_ARCHITECTURAL_DECISIONS/ADR*.md

# 특정 ADR 내용 확인
cat .aiwf/05_ARCHITECTURAL_DECISIONS/ADR{{번호}}_*.md
```

### 2. 업데이트 유형 결정

#### A. 상태 변경
- **proposed → accepted**: 결정 승인됨
- **proposed → deprecated**: 더 이상 유효하지 않음  
- **accepted → superseded**: 새로운 결정으로 대체됨

#### B. 내용 수정
- 구현 경험 반영
- 새로운 제약사항 추가
- 결과 업데이트

#### C. 관련 정보 추가
- 후속 ADR 연결
- 구현 노트 보강
- 영향도 분석 추가

### 3. ADR 파일 업데이트

#### 상태 변경시
```bash
# 헤더 상태 업데이트
sed -i 's/status: "{{이전상태}}"/status: "{{새상태}}"/' ADR{{번호}}_*.md

# 본문에 상태 변경 이력 추가
echo -e "\n## Status History\n- {{날짜}}: {{이전상태}} → {{새상태}} ({{이유}})" >> ADR{{번호}}_*.md
```

#### 내용 수정시
```markdown
## Status
{{현재상태}} - {{업데이트날짜}}

## Updates
### {{업데이트날짜}}
{{변경 내용과 이유}}

### Implementation Experience
{{실제 구현 과정에서 얻은 경험과 교훈}}

## Actual Consequences
{{예상했던 결과와 실제 결과 비교}}
```

### 4. 연관 파일 업데이트

#### ADR이 deprecated/superseded된 경우
```bash
# 새로운 ADR 생성이 필요한 경우
/create_adr "{{새로운 결정 제목}}" --supersedes ADR{{번호}}

# 관련 문서들에 상태 변경 반영
grep -r "ADR{{번호}}" .aiwf/ --include="*.md" -l | xargs sed -i 's/ADR{{번호}}/~~ADR{{번호}}~~ (deprecated)/'
```

### 5. 매니페스트 업데이트
```bash
# 프로젝트 매니페스트에 상태 변경 기록
echo "- ADR{{번호}} 상태 변경: {{이전상태}} → {{새상태}} ({{날짜}})" >> .aiwf/00_PROJECT_MANIFEST.md
```

### 6. 상태 인덱스 동기화
```bash
# 워크플로우 상태 업데이트  
aiwf state update
# 현재 상태 확인
aiwf state show
```

## 상태 변경 시나리오

### 1. Proposed → Accepted
```markdown
## Status
accepted - {{날짜}}

## Status History
- {{제안날짜}}: proposed
- {{승인날짜}}: accepted (팀 리뷰 완료, 구현 승인)

## Implementation Timeline
- 시작: {{날짜}}
- 완료 예정: {{날짜}}
```

### 2. Accepted → Superseded  
```markdown
## Status
superseded - {{날짜}}

## Status History
- {{제안날짜}}: proposed
- {{승인날짜}}: accepted  
- {{대체날짜}}: superseded by ADR{{새번호}}

## Superseded By
- ADR{{새번호}}: {{새결정제목}}
- 이유: {{대체 이유}}
```

### 3. 구현 경험 반영
```markdown
## Implementation Notes
### Planned ({{계획날짜}})
{{원래 계획}}

### Actual ({{구현날짜}})
{{실제 구현 방식과 차이점}}

## Lessons Learned
- {{교훈 1}}
- {{교훈 2}}

## Recommendations
{{향후 유사한 결정을 위한 권장사항}}
```

## 자동화 스크립트

### ADR 상태 일괄 확인
```bash
#!/bin/bash
echo "=== ADR Status Summary ==="
for adr in .aiwf/05_ARCHITECTURAL_DECISIONS/ADR*.md; do
  status=$(grep "status:" "$adr" | cut -d'"' -f2)
  title=$(grep "title:" "$adr" | cut -d'"' -f2)
  echo "$(basename $adr): $status - $title"
done
```

### 만료된 ADR 검사
```bash
#!/bin/bash
echo "=== 리뷰가 필요한 ADR ==="
find .aiwf/05_ARCHITECTURAL_DECISIONS/ -name "ADR*.md" -exec grep -l 'status: "proposed"' {} \; | while read file; do
  date=$(grep "date:" "$file" | cut -d' ' -f2)
  days_ago=$(( ($(date +%s) - $(date -d "$date" +%s)) / 86400 ))
  if [ $days_ago -gt 30 ]; then
    echo "$(basename $file): $days_ago days old - 리뷰 필요"
  fi
done
```

## 출력 형식

```
✅ ADR 업데이트 완료

📁 파일: ADR001_Database_Selection.md
📋 상태: proposed → accepted
📅 업데이트: 2024-01-20
📝 변경사항: 팀 리뷰 완료, 구현 승인

🔗 연관 영향:
- 관련 스프린트: S02_Database_Implementation
- 관련 태스크: T05_Schema_Design
- 후속 ADR: 없음

📊 ADR 현황:
- Active: 3개
- Deprecated: 1개
- Superseded: 0개
```

## 주의사항
- 상태 변경 시 충분한 근거를 제공하세요
- 관련된 문서들도 함께 업데이트하세요
- deprecated/superseded ADR은 삭제하지 말고 보존하세요
- 구현 경험은 반드시 문서에 반영하세요

**중요:** ADR의 이력은 조직의 학습 자산입니다. 모든 변경 사항을 추적 가능하게 기록하세요.