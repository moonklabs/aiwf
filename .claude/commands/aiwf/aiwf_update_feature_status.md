# Feature 상태 업데이트

Feature Ledger의 상태를 변경합니다.

```bash
cd .aiwf && node ../claude-code/aiwf/ko/commands/feature-ledger.js update-status "$@"
```

## 설명

Feature의 개발 진행 상태를 업데이트합니다. 상태 전이 규칙에 따라 올바른 상태로만 변경 가능합니다.

### 🎯 지원 상태
- `active` - 현재 개발 중
- `completed` - 개발 완료
- `paused` - 일시 중지
- `archived` - 보관됨

### 📝 사용법
```bash
# 상태 변경
/project:aiwf:update_feature_status FL001 completed
/project:aiwf:update_feature_status FL002 paused

# 대화형 모드
/project:aiwf:update_feature_status
```

### ⚡ 상태 전이 규칙
- active → completed, paused, archived
- paused → active, archived
- completed → archived
- archived → (전이 불가)

### 📋 업데이트 내용
- 상태 변경 기록
- 타임스탬프 자동 추가
- 변경 사유 입력 (선택)
- 인덱스 파일 자동 업데이트

## 예시 출력
```
✅ Feature 상태 업데이트 완료
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Feature ID: FL001
이전 상태: active → 새 상태: completed
업데이트 시간: 2025-07-10 11:30:00

📊 완료 통계:
- 소요 시간: 5일
- 커밋 수: 23개
- 관련 PR: #45, #47
```