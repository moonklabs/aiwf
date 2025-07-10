# Feature Ledger 생성

새로운 Feature Ledger를 생성하여 기능 개발을 추적합니다.

```bash
cd .aiwf && node ../claude-code/aiwf/ko/commands/feature-ledger.js create "$@"
```

## 설명

Feature Ledger는 프로젝트의 각 기능 개발을 체계적으로 추적하고 관리하는 시스템입니다. 새로운 기능을 개발하기 시작할 때 이 명령어로 Feature를 생성합니다.

### 🎯 주요 기능
- 자동 Feature ID 할당 (FL001, FL002...)
- 표준화된 디렉토리 구조 생성
- Feature 인덱스 자동 업데이트
- Git 브랜치 생성 가이드 제공

### 📝 사용법
```bash
# 대화형 모드 (권장)
/project:aiwf:create_feature_ledger

# 직접 이름 지정
/project:aiwf:create_feature_ledger user_authentication
/project:aiwf:create_feature_ledger "Dashboard Redesign"
```

### 📂 생성 위치
- `.aiwf/06_FEATURE_LEDGERS/active/FL###_feature_name.md`
- 인덱스 파일 자동 업데이트

### ✅ 생성 과정
1. 다음 사용 가능한 Feature ID 확인
2. Feature 메타데이터 입력 받기
3. Feature 파일 생성
4. 인덱스 업데이트
5. Git 브랜치 생성 안내

## 예시 출력
```
🎯 Feature Ledger 생성 완료!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Feature ID: FL001
제목: User Authentication System
상태: active
우선순위: high
카테고리: feature

📁 파일 위치: .aiwf/06_FEATURE_LEDGERS/active/FL001_user_authentication.md

💡 다음 단계:
git checkout -b feature/FL001-user-authentication
```