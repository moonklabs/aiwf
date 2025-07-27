# 스마트 태스크 완료 - 워크플로우 인식 태스크 종료

워크플로우 규칙과 상태를 고려하여 지능적으로 태스크를 완료 처리합니다.

## 개요

이 명령은 다음을 자동화합니다:
- 태스크 완료 검증
- 상태 인덱스 업데이트
- 다음 작업 추천
- 스프린트/마일스톤 전환 처리
- 자동 커밋 및 문서화

## 정확히 다음 8개 항목으로 TODO 생성

1. 현재 태스크 상태 확인
2. 완료 조건 검증
3. 코드 리뷰 및 테스트 실행
4. 태스크 파일 업데이트 및 완료 처리
5. 변경사항 커밋
6. 상태 인덱스 업데이트
7. 워크플로우 전환 확인
8. 다음 작업 추천 및 보고

## 세부 실행 프로세스

### 1. 현재 태스크 상태 확인

**태스크 식별:**
- <$ARGUMENTS>에서 태스크 ID 추출
- 비어있으면 현재 포커스된 태스크 확인:
  ```bash
  aiwf state show | grep "current_focus"
  ```

**상태 검증:**
- 태스크가 'in_progress' 상태인지 확인
- 태스크 파일 읽어서 세부사항 파악
- 작업 로그 확인

### 2. 완료 조건 검증

**승인 기준 확인:**
- 태스크 파일의 "승인 기준" 섹션 검토
- 모든 체크리스트 항목 완료 여부 확인
- 필수 결과물 생성 여부 확인

**기술적 검증:**
```bash
# 린트 실행
npm run lint

# 타입 체크
npm run typecheck

# 테스트 실행
npm test
```

### 3. 코드 리뷰 및 테스트 실행

**자동 코드 리뷰:**
- 서브에이전트로 @.claude/commands/aiwf/aiwf_code_review.md 실행
- 태스크 ID를 범위로 전달
- 리뷰 결과 분석

**문제 발견 시:**
- 치명적 문제: 완료 차단, 수정 필요
- 경미한 문제: 경고 후 진행 가능
- 개선 제안: 다음 태스크로 기록

### 4. 태스크 파일 업데이트 및 완료 처리

**태스크 메타데이터 업데이트:**
```yaml
status: completed
completed_at: YYYY-MM-DD HH:MM
actual_time: [실제 소요 시간]
```

**OUTPUT LOG 작성:**
- 구현 결과 요약
- 주요 변경사항 기록
- 테스트 결과 포함
- 남은 개선사항 기록

**파일명 변경:**
- `T##_S##_*.md` → `TX##_S##_*.md`
- 완료 표시를 위한 'X' 추가

### 5. 변경사항 커밋

**아키텍처 변경 감지 및 ADR 프롬프트:**
```bash
# 아키텍처 관련 변경사항 감지
ARCH_CHANGES=$(git diff --cached --name-only | grep -E "(package\.json|\.env|config/|src/.*\.config\.|docker|infrastructure/|.*\.yaml|.*\.yml)" | wc -l)

if [ $ARCH_CHANGES -gt 0 ]; then
  echo "🏗️ 아키텍처 변경사항 감지!"
  echo "변경된 파일:"
  git diff --cached --name-only | grep -E "(package\.json|\.env|config/|src/.*\.config\.|docker|infrastructure/|.*\.yaml|.*\.yml)"
  
  # ADR 생성 제안
  echo -e "\n💡 ADR 생성을 고려하세요:"
  echo "다음 중 하나라도 해당되면 ADR을 생성해야 합니다:"
  echo "- [ ] 새로운 기술 스택이나 라이브러리 도입"
  echo "- [ ] 기존 아키텍처 패턴 변경"
  echo "- [ ] 중요한 설정 변경"
  echo "- [ ] 인프라 구조 변경"
  
  # 관련 ADR 검색
  RELATED_ADRS=$(find .aiwf/05_ARCHITECTURAL_DECISIONS/ -name "ADR*.md" -exec grep -l "$(git log -1 --pretty=%s)" {} \; 2>/dev/null)
  if [ -n "$RELATED_ADRS" ]; then
    echo -e "\n📋 관련 ADR 발견:"
    echo "$RELATED_ADRS"
    echo "→ /update_adr 명령어로 업데이트하세요"
  else
    echo -e "\n📝 새 ADR 생성 권장:"
    echo "→ /create_adr \"[결정 제목]\" 명령어 사용"
  fi
fi
```

**스마트 커밋:**
```bash
# 서브에이전트로 커밋 실행
# @.claude/commands/aiwf/aiwf_commit.md 포함
# 태스크 ID와 YOLO를 인수로 전달
```

**GitHub 이슈 업데이트:**
- 연결된 이슈가 있으면 자동 업데이트
- 완료 코멘트 추가
- 라벨 변경: in-progress → completed

### 6. 상태 인덱스 업데이트

**상태 동기화:**
```bash
# 태스크 완료 처리
aiwf state complete {task_id}

# 전체 상태 업데이트
aiwf state update

# 워크플로우 검증
aiwf validate workflow
```

**진행률 계산:**
- 스프린트 완료율 업데이트
- 마일스톤 진행률 갱신
- 전체 프로젝트 상태 반영

### 7. 워크플로우 전환 확인

**전환 조건 확인:**
- 스프린트의 모든 태스크 완료 여부
- 마일스톤의 모든 스프린트 완료 여부
- 80% 규칙 확인 (다음 스프린트 준비)

**자동 전환 처리:**
```bash
# 필요시 전환 실행
aiwf transition sprint  # 스프린트 완료 시
aiwf transition milestone  # 마일스톤 완료 시
```

### 8. 다음 작업 추천 및 보고

**다음 작업 분석:**
```bash
# 추천 작업 확인
aiwf state next
```

**최종 보고서 생성:**
- 완료된 태스크 요약
- 스프린트/마일스톤 진행률
- 다음 추천 작업
- 주의사항 및 리스크

## 스마트 기능

### 자동 품질 관리
- 코드 품질 자동 검증
- 테스트 커버리지 확인
- 문서화 완성도 체크

### 지능형 전환 관리
- 스프린트 완료 시 자동 마무리
- 다음 스프린트 자동 준비
- 마일스톤 전환 시 리뷰 요청

### 연속성 보장
- 다음 작업 자동 추천
- 의존성 체인 업데이트
- 병렬 작업 기회 식별

## 사용 예시

### 기본 사용법
```
/aiwf:smart_complete
```
→ 현재 포커스된 태스크 완료 처리

### 특정 태스크 완료
```
/aiwf:smart_complete T03_S02
```
→ 지정된 태스크 완료 처리

### 스킵 옵션
```
/aiwf:smart_complete T03_S02 --skip-review
```
→ 코드 리뷰 건너뛰기 (주의 필요)

## 출력 형식

### 성공적인 완료
```
✅ 스마트 태스크 완료

📋 태스크 정보:
- ID: T03_S02
- 제목: API 엔드포인트 구현
- 소요 시간: 6시간 (예상: 8시간)

🔍 검증 결과:
- 승인 기준: 모두 충족 ✓
- 코드 리뷰: 통과 ✓
- 테스트: 100% 통과 ✓
- 린트: 문제 없음 ✓

📊 진행률 업데이트:
- 스프린트 S02: 60% → 80% 완료
- 마일스톤 M01: 45% → 52% 완료
- 전체 프로젝트: 38% → 41% 완료

💾 커밋 완료:
- SHA: abc123def
- 메시지: "feat(api): complete T03_S02 API endpoints implementation"

🎯 다음 추천 작업:
1. T04_S02 - 데이터베이스 스키마 설계 (우선순위: 높음)
2. T05_S02 - 인증 미들웨어 구현 (병렬 가능)

⚡ 스프린트 80% 도달!
→ 다음 스프린트 S03 준비를 시작하세요
```

### 문제 발견 시
```
⚠️ 태스크 완료 보류

❌ 발견된 문제:
1. 테스트 실패: 3개 테스트 미통과
   - test/api/endpoints.test.js:45
   - test/api/validation.test.js:23
   - test/integration/flow.test.js:89

2. 린트 오류: 2개 파일
   - src/api/handlers.js: 사용하지 않는 변수
   - src/utils/validator.js: 타입 오류

📝 필요한 조치:
1. 실패한 테스트 수정
2. 린트 오류 해결
3. 다시 /aiwf:smart_complete 실행

💡 도움말:
- 테스트 디버그: npm test -- --verbose
- 린트 자동 수정: npm run lint:fix
```

## 워크플로우 통합

연관 명령어:
- `/aiwf:smart_start` - 지능형 태스크 시작
- `/aiwf:transition` - 수동 전환
- `/aiwf:project_status` - 전체 상태 확인
- `/aiwf:sprint_review` - 스프린트 리뷰

## 주의사항

- 검증 단계를 건너뛰지 마세요
- 자동 전환은 되돌리기 어려울 수 있습니다
- 문제 발생 시 수동으로 상태를 조정해야 할 수 있습니다
- 중요한 마일스톤 완료 시 추가 리뷰 권장