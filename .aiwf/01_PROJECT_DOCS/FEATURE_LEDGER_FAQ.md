# Feature Ledger FAQ & Troubleshooting Guide

## 자주 묻는 질문 (FAQ)

### 일반 질문

#### Q: Feature Ledger와 일반 Task의 차이점은 무엇인가요?

**A:** Feature Ledger는 더 큰 범위의 기능 개발을 추적합니다:

| 항목 | Feature Ledger | Task |
|------|----------------|------|
| 범위 | 전체 기능 (1-2주) | 단일 작업 (1-2일) |
| 추적 | Git, PR, 진행률 | 완료 여부 |
| 팀 | 여러 명 가능 | 보통 1명 |
| 출력물 | 배포 가능한 기능 | 코드 변경 |

#### Q: Feature ID는 어떻게 생성되나요?

**A:** Feature ID는 자동으로 순차 생성됩니다:
- 형식: `FL###` (FL001, FL002, ...)
- 재사용 불가
- 삭제된 ID도 재사용하지 않음
- 수동 지정 불가

#### Q: 완료된 Feature를 다시 활성화할 수 있나요?

**A:** 아니요, 완료된 Feature는 다시 활성화할 수 없습니다. 추가 작업이 필요한 경우:
1. 새로운 Feature를 생성하여 개선 사항 추적
2. 원본 Feature를 참조 (`depends_on: [FL001]`)
3. 명확한 범위로 새 작업 정의

#### Q: Feature와 GitHub Issue를 어떻게 연결하나요?

**A:** 여러 방법이 있습니다:

1. **자동 연결**: PR 제목에 Feature ID 포함
   ```
   feat(FL001): Implement user authentication
   ```

2. **수동 연결**: 명령어 사용
   ```bash
   /project:aiwf:link_feature_issue FL001 #42
   ```

3. **Issue 본문에 참조**:
   ```markdown
   Related Feature: FL001
   ```

### 사용법 질문

#### Q: 여러 스프린트에 걸친 Feature는 어떻게 관리하나요?

**A:** `sprint_ids` 배열을 사용합니다:

```yaml
sprint_ids: [S01_M02, S02_M02, S03_M02]
```

각 스프린트에서:
1. 해당 스프린트의 작업만 Task로 생성
2. Feature 진행률은 전체 기준으로 업데이트
3. 스프린트별 진행 상황을 Progress Log에 기록

#### Q: Feature 진행률은 어떻게 계산하나요?

**A:** 세 가지 방법이 있습니다:

1. **수동 업데이트**:
   ```bash
   /project:aiwf:update_feature_progress FL001 75
   ```

2. **체크리스트 기반**:
   ```
   완료 항목 / 전체 항목 × 100
   ```

3. **연결된 Task 기반**:
   ```
   완료 Task / 전체 Task × 100
   ```

#### Q: Feature 템플릿을 커스터마이징할 수 있나요?

**A:** 네, 가능합니다:

1. 기본 템플릿 복사:
   ```bash
   cp .aiwf/99_TEMPLATES/feature_template.md .aiwf/99_TEMPLATES/my_feature_template.md
   ```

2. 템플릿 수정

3. 사용:
   ```bash
   /project:aiwf:create_feature_ledger new_feature --template my_feature_template
   ```

### 통합 질문

#### Q: CI/CD 파이프라인과 어떻게 통합하나요?

**A:** GitHub Actions 예제:

```yaml
- name: Update Feature on Deploy
  if: success()
  run: |
    FEATURE_ID=$(git log -1 --pretty=%B | grep -oP 'FL\d{3}')
    if [ ! -z "$FEATURE_ID" ]; then
      npx aiwf update_feature_progress $FEATURE_ID 90 --comment "Deployed to staging"
    fi
```

#### Q: 여러 저장소에서 하나의 Feature를 작업할 때는?

**A:** Cross-repo Feature 추적:

1. 메인 저장소에 Feature Ledger 생성
2. 다른 저장소에서 커밋 시 Feature ID 참조
3. 정기적으로 동기화:
   ```bash
   /project:aiwf:feature_sync --cross-repo
   ```

## 문제 해결 가이드

### 일반적인 오류

#### Error E001: Feature ID not found

**증상**:
```
Error E001: Feature ID 'FL099' not found
```

**원인**:
- 잘못된 Feature ID
- Feature가 다른 디렉토리에 있음

**해결**:
```bash
# 올바른 ID 확인
cat .aiwf/06_FEATURE_LEDGERS/FEATURE_LEDGER_INDEX.md

# 모든 Feature 검색
find .aiwf/06_FEATURE_LEDGERS -name "*.md" | grep -v INDEX
```

#### Error E002: Invalid status transition

**증상**:
```
Error E002: Cannot transition from 'completed' to 'active'
```

**원인**:
- 허용되지 않는 상태 전환
- Feature가 이미 archived 상태

**해결**:
1. 현재 상태 확인
2. [상태 전이 다이어그램](./FEATURE_LEDGER_SYSTEM_OVERVIEW.md#상태-전이-다이어그램) 참조
3. 필요시 새 Feature 생성

#### Error E003: Duplicate feature ID

**증상**:
```
Error E003: Feature ID 'FL001' already exists
```

**원인**:
- ID 생성 시퀀스 오류
- 수동으로 파일 생성

**해결**:
```bash
# 인덱스 재구성
/project:aiwf:feature_index --rebuild

# 다음 가용 ID 확인
/project:aiwf:feature_next_id
```

### Git 통합 문제

#### 브랜치 생성 실패

**증상**:
```
Failed to create branch: feature/FL001-user-auth
```

**원인**:
- 브랜치가 이미 존재
- Git 저장소가 아님
- 권한 부족

**해결**:
```bash
# 기존 브랜치 확인
git branch -a | grep FL001

# 강제 생성
/project:aiwf:feature_branch FL001 create --force

# 수동 생성
git checkout -b feature/FL001-user-auth
```

#### 커밋 연결 안 됨

**증상**: 커밋했는데 Feature에 반영되지 않음

**원인**:
- 커밋 메시지에 Feature ID 없음
- 자동 동기화 비활성화

**해결**:
```bash
# 수동 연결
/project:aiwf:link_feature_commit FL001 --commit HEAD

# 자동 동기화 활성화
export AIWF_AUTO_SYNC=true
```

### 성능 문제

#### 대시보드 생성이 느림

**증상**: Feature가 많을 때 대시보드 생성 지연

**해결**:
```bash
# 캐시 재구성
/project:aiwf:feature_cache --rebuild

# 특정 범위만 표시
/project:aiwf:feature_dashboard --limit 50 --status active
```

#### 검색이 느림

**증상**: Feature 검색 시 응답 지연

**해결**:
```bash
# 인덱스 최적화
/project:aiwf:feature_index --optimize

# 검색 범위 제한
/project:aiwf:feature_search "query" --status active --limit 20
```

### 데이터 복구

#### Feature 파일 손상

**증상**: Feature 파일을 열 수 없음

**해결**:
```bash
# 백업에서 복구
cp .aiwf/backups/FL001_*.md .aiwf/06_FEATURE_LEDGERS/active/

# Git 히스토리에서 복구
git checkout HEAD~1 -- .aiwf/06_FEATURE_LEDGERS/active/FL001_*.md
```

#### 인덱스 불일치

**증상**: 인덱스와 실제 파일이 다름

**해결**:
```bash
# 전체 인덱스 재구성
/project:aiwf:feature_index --rebuild --verbose

# 무결성 검사
/project:aiwf:feature_validate --fix
```

## 고급 문제 해결

### 디버깅 모드

상세한 로그를 보려면:

```bash
# 디버그 모드 활성화
export AIWF_DEBUG=true

# 상세 로그와 함께 실행
/project:aiwf:create_feature_ledger test_feature --verbose
```

### 로그 분석

```bash
# 오류 로그만 보기
grep ERROR .aiwf/logs/feature_ledger.log

# 특정 Feature 추적
grep FL001 .aiwf/logs/feature_ledger.log | tail -20

# 시간대별 분석
grep "2025-07-09" .aiwf/logs/feature_ledger.log | grep ERROR
```

### 수동 수정

직접 파일을 수정해야 할 때:

1. **백업 생성**:
   ```bash
   cp -r .aiwf/06_FEATURE_LEDGERS .aiwf/06_FEATURE_LEDGERS.backup
   ```

2. **파일 수정**

3. **검증**:
   ```bash
   /project:aiwf:feature_validate FL001
   ```

4. **인덱스 업데이트**:
   ```bash
   /project:aiwf:feature_index --update FL001
   ```

## 지원 받기

### 1. 문서 참조
- [User Guide](./FEATURE_LEDGER_USER_GUIDE.md)
- [API Reference](./FEATURE_LEDGER_API_REFERENCE.md)
- [System Overview](./FEATURE_LEDGER_SYSTEM_OVERVIEW.md)

### 2. 커뮤니티
- GitHub Issues: `https://github.com/aiwf/aiwf/issues`
- Discord: AIWF 커뮤니티 채널

### 3. 버그 리포트

버그 발견 시:
1. 재현 가능한 단계 기록
2. 로그 파일 수집
3. GitHub Issue 생성:
   ```markdown
   **버그 설명**: [간단한 설명]
   **재현 단계**:
   1. ...
   2. ...
   **예상 동작**: [예상했던 결과]
   **실제 동작**: [실제 발생한 결과]
   **로그**: [관련 로그 첨부]
   ```

---

*이 문서는 지속적으로 업데이트됩니다. 최신 버전은 [GitHub](https://github.com/aiwf/aiwf)에서 확인하세요.*