# Feature 상세 정보 조회

특정 Feature Ledger의 상세 정보를 확인합니다.

```bash
cd .aiwf && node ../claude-code/aiwf/ko/commands/feature-ledger.js details "$@"
```

## 설명

Feature ID를 통해 해당 Feature의 모든 정보를 상세하게 조회합니다.

### 🎯 출력 형식
- `--format=full` - 전체 정보 (기본값)
- `--format=summary` - 요약 정보
- `--format=technical` - 기술적 세부사항
- `--format=progress` - 진행 상황 중심

### 📝 사용법
```bash
# 전체 상세 정보
/project:aiwf:get_feature_details FL001

# 요약 정보만 보기
/project:aiwf:get_feature_details FL001 --format=summary

# 기술적 세부사항 확인
/project:aiwf:get_feature_details FL001 --format=technical
```

### 📋 표시 정보
- Feature 메타데이터
- 개발 진행 상황
- 관련 태스크 및 커밋
- 담당자 및 리뷰어
- 타임라인 및 마일스톤
- 기술적 세부사항

## 예시 출력 (전체 정보)
```
🎯 Feature 상세 정보
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📌 기본 정보
Feature ID: FL001
제목: User Authentication System
상태: active
우선순위: high
카테고리: feature

📊 진행 상황
진행률: 75%
시작일: 2025-07-05
예상 완료일: 2025-07-12
소요 시간: 5일 경과

🎯 마일스톤 & 스프린트
마일스톤: M02 - Context Engineering Enhancement
스프린트: S01_M02 - context_foundation

👥 담당자
개발자: @developer1
리뷰어: @reviewer1, @reviewer2

📝 설명
JWT 기반 사용자 인증 시스템 구현. OAuth2.0 소셜 로그인 지원 포함.

🔧 기술 스택
- Backend: Node.js, Express, JWT
- Database: PostgreSQL
- Frontend: React, Redux

📈 진행 내역
[2025-07-05] Feature 생성
[2025-07-06] 데이터베이스 스키마 설계 완료
[2025-07-08] JWT 인증 기본 구현 완료
[2025-07-10] OAuth2.0 구현 진행 중
```