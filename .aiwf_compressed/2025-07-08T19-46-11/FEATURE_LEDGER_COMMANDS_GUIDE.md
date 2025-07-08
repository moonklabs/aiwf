# Feature Ledger 명령어 사용 가이드
Feature Ledger 시스템을 효과적으로 사용하기 위한 Claude Code 명령어 가이드입니다.

## 명령어 개요
Feature Ledger 시스템은 다음 5개의 핵심 명령어를 제공합니다:

1. *create_feature_ledger* - 새로운 Feature 생성
2. *update_feature_status* - Feature 상태 변경
3. *list_features* - Feature 목록 조회
4. *get_feature_details* - Feature 상세 정보 확인
5. *link_feature_to_milestone* - Feature를 마일스톤에 연결

### 1. create_feature_ledger - Feature 생성
새로운 기능 개발을 시작할 때 Feature Ledger를 생성합니다.

*사용법:*
```
/project:aiwf:create_feature_ledger <feature_name>
```

*예시:*
```
/project:aiwf:create_feature_ledger user_authentication
/project:aiwf:create_feature_ledger "Dashboard Redesign"
```

*대화형 모드:*
인수 없이 실행하면 대화형으로 정보를 입력받습니다:
```
/project:aiwf:create_feature_ledger
```

*생성 과정:*
1. 자동으로 다음 Feature ID 할당 (FL001, FL002...)
2. `.aiwf/06_FEATURE_LEDGERS/active/` 디렉토리에 파일 생성
3. FEATURE_LEDGER_INDEX.md 자동 업데이트
4. Git 브랜치 생성 명령어 제안

### 2. update_feature_status - 상태 업데이트
Feature의 개발 상태를 변경합니다.

```
/project:aiwf:update_feature_status <feature_id> <new_status>
```

*지원 상태:*
- `active` - 현재 개발 중
- `completed` - 개발 완료
- `paused` - 일시 중지
- `archived` - 보관됨

```
/project:aiwf:update_feature_status FL001 completed
/project:aiwf:update_feature_status FL002 paused
```

*상태 전이 규칙:*
- active → completed, paused, archived
- paused → active, archived
- completed → archived
- archived → (전이 불가)

### 3. list_features - Feature 목록 조회
Feature들을 다양한 필터로 조회합니다.

```
/project:aiwf:list_features [옵션들]
```

*필터 옵션:*
- `--status=<status>` - 상태별 필터 (active, completed, paused, archived, all)
- `--milestone=<milestone>` - 마일스톤별 필터 (예: M02)
- `--assignee=<assignee>` - 담당자별 필터
- `--priority=<priority>` - 우선순위별 필터 (critical, high, medium, low)
- `--category=<category>` - 카테고리별 필터 (feature, enhancement, bugfix, refactor)

*출력 형식:*
- `--format=table` - 테이블 형식 (기본값)
- `--format=list` - 리스트 형식
- `--format=dashboard` - 대시보드 형식

*정렬 옵션:*
- `--sort=id` - Feature ID 순 (기본값)
- `--sort=title` - 제목 순
- `--sort=updated` - 최근 업데이트 순
- `--sort=priority` - 우선순위 순
- `--sort=progress` - 진행률 순

```

# 모든 active Feature 조회
/project:aiwf:list_features

# M02 마일스톤의 high 우선순위 Feature
/project:aiwf:list_features --milestone=M02 --priority=high

# 대시보드 형식으로 전체 현황 보기
/project:aiwf:list_features --status=all --format=dashboard

# 최근 업데이트 순으로 정렬
/project:aiwf:list_features --sort=updated
```

### 4. get_feature_details - 상세 정보 조회
특정 Feature의 상세 정보를 확인합니다.

```
/project:aiwf:get_feature_details <feature_id> [--format=<format>]
```

- `--format=full` - 전체 정보 (기본값)
- `--format=summary` - 요약 정보
- `--format=technical` - 기술적 세부사항
- `--format=progress` - 진행 상황 중심

```

# 전체 상세 정보
/project:aiwf:get_feature_details FL001

# 요약 정보만 보기
/project:aiwf:get_feature_details FL001 --format=summary

# 기술적 세부사항 확인
/project:aiwf:get_feature_details FL001 --format=technical
```

### 5. link_feature_to_milestone - 마일스톤 연결
Feature를 마일스톤 및 스프린트와 연결합니다.

```
/project:aiwf:link_feature_to_milestone <feature_id> <milestone_id> [옵션]
```

*옵션:*
- `--sprint=<sprint_id>` - 스프린트 연결 (복수 가능)
- `--tasks=<task_ids>` - 태스크 연결 (쉼표로 구분)

```

# 기본 마일스톤 연결
/project:aiwf:link_feature_to_milestone FL001 M02

# 스프린트와 함께 연결
/project:aiwf:link_feature_to_milestone FL001 M02 --sprint=S01_M02 --sprint=S02_M02

# 태스크까지 연결
/project:aiwf:link_feature_to_milestone FL001 M02 --tasks=T01_S01,T02_S01
```

### 새 기능 개발 시작
1. Feature 생성:
```
/project:aiwf:create_feature_ledger authentication_system
```

2. Git 브랜치 생성:
```bash
git checkout -b feature/FL001-authentication-system
```

3. 마일스톤 연결:
```
/project:aiwf:link_feature_to_milestone FL001 M02 --sprint=S01_M02
```

### 진행 상황 관리
1. Feature 목록 확인:
```
/project:aiwf:list_features --status=active --sort=progress
```

2. 상세 진행 상황 확인:
```
/project:aiwf:get_feature_details FL001 --format=progress
```

3. 완료 시 상태 업데이트:
```
```

### 프로젝트 현황 파악
1. 전체 대시보드 보기:
```
```

2. 특정 마일스톤 현황:
```
/project:aiwf:list_features --milestone=M02 --format=list
```

3. 우선순위별 정렬:
```
/project:aiwf:list_features --sort=priority --status=active
```

### Feature 생성 시
- 명확하고 구체적인 이름 사용
- 적절한 우선순위 설정
- 관련 마일스톤과 즉시 연결

### 상태 관리
- 정기적으로 진행 상황 업데이트
- paused 상태 사용 시 이유 명시
- completed 전에 모든 체크리스트 확인

### 협업
- 담당자와 기여자 명확히 구분
- PR 생성 시 Feature ID 포함
- 커밋 메시지에 Feature ID 참조

### Git 통합
- 브랜치명 규칙 준수: `feature/FL###-feature-name`
- 커밋 메시지에 Feature ID 포함: `[FL001] Add login API`
- PR 제목에 Feature 참조: `FL001: Implement user authentication`

### Feature를 찾을 수 없을 때
```
/project:aiwf:list_features --status=all
```

### 상태 전이가 거부될 때
- 상태 전이 규칙 확인
- 필수 조건 충족 여부 검증

### 인덱스 불일치 시
- 수동으로 인덱스 재생성 필요
- 백업 후 진행 권장