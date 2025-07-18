# 페르소나 상태 확인

현재 활성화된 AI 페르소나의 상태를 확인합니다.

```bash
cd .aiwf && node ../claude-code/aiwf/ko/commands/ai-persona.js status
```

## 설명
이 명령어는 현재 활성화된 페르소나의 정보와 통계를 표시합니다:

- 현재 활성 페르소나 이름
- 페르소나 설명 및 전문 분야
- 활성화 시간
- 사용 통계 (사용 횟수, 평균 세션 시간)
- 주요 동작 특성

## 표시 정보
```
🎭 AI 페르소나 상태
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
현재 페르소나: [페르소나명]
설명: [페르소나 설명]
활성화 시간: [시간]

주요 동작:
• [동작 특성 1]
• [동작 특성 2]
• [동작 특성 3]

사용 통계:
• 총 사용 횟수: [횟수]
• 평균 세션 시간: [시간]
• 마지막 사용: [날짜/시간]
```

## 사용 가능한 페르소나
- `architect` - 시스템 아키텍처 전문가
- `security` - 보안 전문가
- `frontend` - 프론트엔드 개발 전문가
- `backend` - 백엔드 개발 전문가
- `data_analyst` - 데이터 분석 전문가

## 관련 명령어
- `/project:aiwf:architect` - Architect 페르소나 활성화
- `/project:aiwf:security` - Security 페르소나 활성화
- `/project:aiwf:frontend` - Frontend 페르소나 활성화
- `/project:aiwf:backend` - Backend 페르소나 활성화
- `/project:aiwf:data_analyst` - Data Analyst 페르소나 활성화
- `/project:aiwf:default_mode` - 기본 모드로 복원