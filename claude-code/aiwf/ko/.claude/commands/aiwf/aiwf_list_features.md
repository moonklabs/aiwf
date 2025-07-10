# Feature 목록 조회

Feature Ledger 목록을 다양한 필터와 형식으로 조회합니다.

```bash
cd .aiwf && node ../claude-code/aiwf/ko/commands/feature-ledger.js list "$@"
```

## 설명

프로젝트의 모든 Feature를 상태, 우선순위, 카테고리 등으로 필터링하여 조회합니다.

### 🎯 필터 옵션
- `--status=<status>` - 상태별 필터 (active, completed, paused, archived, all)
- `--milestone=<milestone>` - 마일스톤별 필터 (예: M02)
- `--priority=<priority>` - 우선순위별 필터 (critical, high, medium, low)
- `--category=<category>` - 카테고리별 필터 (feature, enhancement, bugfix, refactor)

### 📊 출력 형식
- `--format=table` - 테이블 형식 (기본값)
- `--format=list` - 리스트 형식
- `--format=dashboard` - 대시보드 형식

### 🔄 정렬 옵션
- `--sort=id` - Feature ID 순 (기본값)
- `--sort=updated` - 최근 업데이트 순
- `--sort=priority` - 우선순위 순
- `--sort=progress` - 진행률 순

### 📝 사용법
```bash
# 모든 active Feature 조회
/project:aiwf:list_features

# M02 마일스톤의 high 우선순위 Feature
/project:aiwf:list_features --milestone=M02 --priority=high

# 대시보드 형식으로 전체 현황 보기
/project:aiwf:list_features --status=all --format=dashboard
```

## 예시 출력 (테이블 형식)
```
📋 Feature Ledger 목록
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ID    | Title                  | Status    | Priority | Progress
------+------------------------+-----------+----------+---------
FL001 | User Authentication    | active    | high     | 75%
FL002 | Dashboard Redesign     | active    | medium   | 40%
FL003 | API Rate Limiting      | completed | critical | 100%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

총 3개 Feature | Active: 2 | Completed: 1
```