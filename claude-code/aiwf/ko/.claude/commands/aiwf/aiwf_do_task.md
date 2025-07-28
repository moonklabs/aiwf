# 인수 기반 AIWF 태스크 처리

**중요:** 위에서 아래로 순서대로 진행하세요 - 단계를 건너뛰지 마세요!

**정확히 다음 8개 항목으로 할 일 목록을 생성하세요**

1. 인수에서 범위 분석
2. 태스크 파일 식별
3. 태스크 분석
4. 상태를 진행 중으로 설정
5. 태스크 작업 실행
6. 플레이스홀더
7. 코드 리뷰 실행
8. 태스크 상태 완료 처리

## 1 · 인수에서 범위 분석

<$ARGUMENTS> ⇒ 태스크 ID, 스프린트 ID, 또는 빈 값 (현재 스프린트에서 다음 열린 태스크 선택).

## 2 · 태스크 파일 식별

.aiwf/03_SPRINTS/와 .aiwf/04_GENERAL_TASKS/에서 검색합니다.
일치하는 열린 태스크가 없으면 일시정지하고 사용자에게 진행 방법을 문의합니다.

## 3 · 태스크 분석 (전문 서브에이전트 활용)

태스크 설명을 읽습니다. 불분명한 점이 있으면 계속하기 전에 명확화 질문을 합니다.

**태스크 유형 자동 분석 및 서브에이전트 선택:**

```bash
# 태스크 파일에서 유형/카테고리 추출
TASK_TYPE=$(grep -E "type:|category:|area:" "${TASK_FILE}" | head -1 | cut -d: -f2 | xargs)
TASK_KEYWORDS=$(grep -E "keywords:|tags:" "${TASK_FILE}" | cut -d: -f2 | xargs)

# 태스크 설명에서 키워드 분석
TASK_DESC=$(sed -n '/## 설명/,/##/p' "${TASK_FILE}" | grep -v "##")

# 지능적 서브에이전트 매칭
if [[ "$TASK_DESC" =~ (React|Vue|Angular|프론트엔드|UI|컴포넌트) ]]; then
    RECOMMENDED_AGENT="react-ai-frontend-developer"
elif [[ "$TASK_DESC" =~ (NestJS|Express|API|백엔드|서버) ]]; then
    RECOMMENDED_AGENT="nestjs-backend-specialist"
elif [[ "$TASK_DESC" =~ (AWS|Lambda|서버리스|클라우드) ]]; then
    RECOMMENDED_AGENT="aws-serverless-architect"
elif [[ "$TASK_DESC" =~ (아키텍처|설계|SOLID|클린) ]]; then
    RECOMMENDED_AGENT="backend-clean-architect"
elif [[ "$TASK_DESC" =~ (데이터|분석|BigQuery|SQL) ]]; then
    RECOMMENDED_AGENT="data-analyst"
elif [[ "$TASK_DESC" =~ (보안|취약점|스캔|감사) ]]; then
    RECOMMENDED_AGENT="security-vulnerability-scanner"
elif [[ "$TASK_DESC" =~ (버그|오류|디버그|문제해결) ]]; then
    RECOMMENDED_AGENT="debug-specialist"
else
    RECOMMENDED_AGENT="general-purpose"
fi

echo "🤖 추천 서브에이전트: $RECOMMENDED_AGENT"
```

**중요한 맥락 검증:** 태스크를 실행하기 전에 다음 작업들을 위한 병렬 서브에이전트를 실행합니다:

1. **스프린트 맥락:** 태스크가 현재 스프린트 범위에 속하는지 확인
2. **의존성:** 먼저 완료해야 할 의존 태스크가 있는지 확인
3. **요구사항:** `.aiwf/02_REQUIREMENTS/`에서 관련 요구사항 문서 읽기
4. **범위 검증:** 태스크가 현재 스프린트 목표와 일치하는지 확인
5. **GitHub 이슈 확인:** 태스크 파일에 `github_issue` 필드가 있는지 확인

**중요:** 태스크가 미래 스프린트의 기능을 참조하거나 충족되지 않은 의존성이 있으면 일시정지하고 명확화를 요청합니다.

**GitHub 이슈 생성 (선택사항):**

- 태스크에 GitHub 이슈가 없고 사용자가 이슈 추적을 원하는 경우
- `/project:aiwf:issue_create {task_id}` 명령어 사용을 제안합니다

## 4 · 상태를 진행 중으로 설정

- 현재 로컬 타임스탬프 확인 (YYYY-MM-DD HH:MM)
- 프론트매터의 **status: in_progress**로 업데이트하고 업데이트 시간 설정
- ./aiwf/00_PROJECT_MANIFEST.md에서 태스크 진행 중, 업데이트 시간, 현재 스프린트 상태로 업데이트
- **상태 인덱스 동기화:**
  ```bash
  # 전체 상태 업데이트
  aiwf state update
  # 현재 태스크에 포커스 설정
  aiwf state focus {task_id}
  ```
- **GitHub 이슈 업데이트 (존재하는 경우):**
  ```bash
  gh issue comment {issue_number} --body "🚀 태스크 작업이 시작되었습니다."
  gh issue edit {issue_number} --add-label "in-progress"
  ```

## 5 · 태스크 작업 실행 (전문 서브에이전트 활용)

**🤖 태스크 유형별 서브에이전트 실행 전략:**

태스크 유형에 따라 전문 서브에이전트를 활용하여 최적의 솔루션을 구현합니다.

**서브에이전트 실행 예시:**

```
# 프론트엔드 태스크인 경우
만약 태스크가 React 컴포넌트 개발이라면:
- Task 도구로 react-ai-frontend-developer 서브에이전트 실행
- Firebase 인증 통합, TypeScript 타입 안전성, 테스트 코드 작성 등 처리

# 백엔드 태스크인 경우  
만약 태스크가 API 개발이라면:
- Task 도구로 nestjs-backend-specialist 서브에이전트 실행
- RESTful 엔드포인트, 인증 가드, 데이터베이스 통합 등 처리

# 아키텍처 태스크인 경우
만약 태스크가 시스템 설계라면:
- Task 도구로 backend-clean-architect 서브에이전트 실행
- SOLID 원칙, Clean Architecture 패턴 적용

# 디버깅 태스크인 경우
만약 태스크가 버그 수정이라면:
- Task 도구로 debug-specialist 서브에이전트 실행
- 체계적인 문제 분석 및 해결

# 보안 태스크인 경우
만약 태스크가 보안 강화라면:
- Task 도구로 security-vulnerability-scanner 서브에이전트 실행
- 취약점 스캔 및 보안 개선사항 적용
```

**실행 프로세스:**

- 설명, 목표, 승인 기준을 따릅니다
- .aiwf/01_PROJECT_DOCS/와 .aiwf/02_REQUIREMENTS/의 지원 문서를 참조합니다
- 하위 태스크를 반복 처리:
  1. 다음 미완료 하위 태스크를 선택합니다
  2. 태스크 성격에 맞는 서브에이전트를 Task 도구로 실행합니다
  3. 서브에이전트가 전문적인 관점에서 구현을 수행합니다
  4. 결과를 통합하고 하위 태스크를 완료로 표시합니다
  5. `[YYYY-MM-DD HH:MM]: <메시지>` 형식으로 **## 출력 로그**에 로그 항목을 추가합니다
  6. 모든 하위 태스크가 완료될 때까지 반복합니다

**🛡️ 품질 보증:**
- 각 서브에이전트는 해당 분야의 베스트 프랙티스를 자동 적용
- 코드 품질, 보안, 성능 최적화가 기본적으로 포함됨
- 오버엔지니어링 방지 규칙이 모든 서브에이전트에 적용됨

## 6 · 플레이스홀더

플레이스홀더 - 다음 단계로 진행하세요

## 7 · 코드 리뷰 실행 (Code Reviewer 서브에이전트 활용)

**🔍 전문적인 코드 리뷰 프로세스:**

코드 리뷰를 위해 전문 서브에이전트를 활용합니다:

```
# Code Reviewer 서브에이전트 실행
Task 도구로 code-reviewer 서브에이전트 실행:
- 태스크 ID 범위의 모든 변경사항 분석
- 코드 품질, 보안, 성능, 유지보수성 평가
- 베스트 프랙티스 준수 여부 확인
- 잠재적 버그 및 개선점 식별
```

**리뷰 프로세스:**

1. **자동 코드 리뷰 실행:**
   - Task 도구로 code-reviewer 서브에이전트를 실행합니다
   - 태스크 ID와 관련된 모든 코드 변경사항을 분석합니다
   - 보안 취약점, 성능 문제, 코드 스멜 등을 체계적으로 검토합니다

2. **보안 스캔 (필요시):**
   - 보안이 중요한 코드의 경우 security-vulnerability-scanner 서브에이전트도 추가 실행
   - OWASP Top 10, SQL 인젝션, XSS 등 취약점 검사

3. **문서화 검증:**
   - 코드 변경사항에 대한 적절한 문서화 확인
   - 필요시 technical-documentation-writer 서브에이전트로 문서 업데이트

4. **결과 처리:**
   - **실패** 시:
     - 식별된 문제들을 하위 태스크로 변환
     - 각 문제에 대해 적절한 서브에이전트를 할당하여 수정
     - "5 · 태스크 작업 실행"으로 돌아가서 개선사항 적용
   - **통과** 시:
     - 코드 품질 메트릭스 기록
     - 다음 단계로 진행

**🛡️ 자동 품질 보증:**
- 코드 리뷰어는 해당 언어/프레임워크의 베스트 프랙티스를 자동 적용
- 순환 복잡도, 중복 코드, 테스트 커버리지 등 자동 측정
- 팀 코딩 표준 및 컨벤션 준수 확인

## 8 · 태스크 상태 완료 처리

- 태스크 상태를 **completed**로 설정합니다
- 파일명에서 완료 인식이 가능하도록 태스크 파일명을 적절히 변경합니다 (TX[TASK_ID]...)
- .aiwf/00_PROJECT_MANIFEST.md를 업데이트하여 새 상태를 반영합니다
- **상태 인덱스 동기화:**
  ```bash
  # 태스크 완료 처리
  aiwf state complete {task_id}
  # 전체 상태 업데이트
  aiwf state update
  # 다음 작업 추천 확인
  aiwf state next
  ```
- **GitHub 이슈 업데이트 (존재하는 경우):**
  ```bash
  gh issue comment {issue_number} --body "✅ 태스크가 완료되었습니다."
  gh issue edit {issue_number} --remove-label "in-progress" --add-label "completed"
  ```
- 사용자에게 **결과 보고**

  ✅ **결과**: 성공에 대한 간단한 설명

  🔎 **범위**: 식별된 태스크 또는 처리되지 않은 이유

  💬 **요약**: 수행된 작업 또는 차단된 이유에 대한 한 문단 요약

  ⏭️ **다음 단계**: 권장 후속 조치

- **아키텍처 변경사항 확인**:
  ```bash
  # 아키텍처 관련 파일 변경 감지
  ARCH_CHANGES=$(git diff --name-only | grep -E "(package\.json|config/|docker|infrastructure/|.*\.yaml)" | wc -l)
  if [ $ARCH_CHANGES -gt 0 ]; then
    echo "🏗️ 아키텍처 변경사항이 감지되었습니다!"
    echo "💡 ADR(Architecture Decision Record) 작성을 고려하세요:"
    echo "   /create_adr \"[결정 제목]\" - 새로운 아키텍처 결정 문서화"
    echo "   /update_adr [ADR번호] - 기존 ADR 업데이트"
  fi
  ```

- 사용자를 위한 **제안**:

  - 🛠️ /project:aiwf:commit `TASK_ID`를 사용하여 변경사항을 git에 커밋
  - 🔀 /project:aiwf:pr_create `TASK_ID`를 사용하여 Pull Request 생성
  - 📋 /create_adr 또는 /update_adr로 아키텍처 결정 문서화 (필요시)
  - 🧹 /clear를 사용하여 다음 태스크 시작 전 컨텍스트 정리
