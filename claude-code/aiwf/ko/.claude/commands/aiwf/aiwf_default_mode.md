# 기본 모드로 복원

AI를 기본 모드로 복원합니다.

```bash
cd .aiwf && node ../claude-code/aiwf/ko/commands/ai-persona.js default
```

## 설명
이 명령어는 현재 활성화된 페르소나를 비활성화하고 AI를 기본 범용 모드로 복원합니다.

## 동작
- 현재 페르소나 비활성화
- 페르소나별 컨텍스트 규칙 해제
- 기본 AI 동작 모드로 전환
- 세션 통계 저장

## 사용 시나리오
- 특정 페르소나가 더 이상 필요하지 않을 때
- 일반적인 개발 작업으로 돌아갈 때
- 다른 페르소나로 전환하기 전
- 페르소나 관련 문제 해결 시

## 출력 예시
```
🎭 페르소나 모드 해제
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
이전 페르소나: [페르소나명]
세션 시간: [시간]
기본 모드로 복원되었습니다.
```

## 참고사항
- 페르소나 세션 통계는 자동으로 저장됩니다
- 언제든지 다른 페르소나를 활성화할 수 있습니다
- 기본 모드에서도 모든 AI 기능을 사용할 수 있습니다

## 관련 명령어
- `/project:aiwf:persona_status` - 페르소나 상태 확인
- `/project:aiwf:architect` - Architect 페르소나 활성화
- `/project:aiwf:security` - Security 페르소나 활성화
- `/project:aiwf:frontend` - Frontend 페르소나 활성화
- `/project:aiwf:backend` - Backend 페르소나 활성화
- `/project:aiwf:data_analyst` - Data Analyst 페르소나 활성화