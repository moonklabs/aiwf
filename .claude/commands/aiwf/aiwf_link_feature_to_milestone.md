# Feature를 마일스톤에 연결

Feature Ledger를 마일스톤 및 스프린트와 연결합니다.

```bash
cd .aiwf && node ../claude-code/aiwf/ko/commands/feature-ledger.js link-milestone "$@"
```

## 설명

Feature를 특정 마일스톤과 스프린트에 연결하여 프로젝트 계획과 동기화합니다.

### 🎯 연결 옵션
- 마일스톤 연결 (필수)
- 스프린트 연결 (선택)
- 태스크 연결 (선택)
- 우선순위 자동 조정

### 📝 사용법
```bash
# 마일스톤에만 연결
/project:aiwf:link_feature_to_milestone FL001 M02

# 마일스톤과 스프린트에 연결
/project:aiwf:link_feature_to_milestone FL001 M02 --sprint=S01_M02

# 태스크까지 연결
/project:aiwf:link_feature_to_milestone FL001 M02 --sprint=S01_M02 --task=TX01_S01

# 대화형 모드
/project:aiwf:link_feature_to_milestone
```

### 🔄 자동 업데이트
- Feature 파일에 마일스톤 정보 추가
- 마일스톤 파일에 Feature 참조 추가
- 스프린트 메타데이터 업데이트
- 우선순위 동기화

## 예시 출력
```
✅ Feature-마일스톤 연결 완료
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Feature: FL001 - User Authentication System
마일스톤: M02 - Context Engineering Enhancement
스프린트: S01_M02 - context_foundation

📊 연결 결과:
- Feature 파일 업데이트 ✓
- 마일스톤 참조 추가 ✓
- 스프린트 메타 업데이트 ✓

🔗 관련 파일:
- .aiwf/06_FEATURE_LEDGERS/active/FL001_user_authentication.md
- .aiwf/02_REQUIREMENTS/M02_Context_Engineering_Enhancement/M02_milestone_meta.md
- .aiwf/03_SPRINTS/S01_M02_context_foundation/S01_M02_sprint_meta.md
```