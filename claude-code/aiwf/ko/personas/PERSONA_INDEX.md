# AI 페르소나 인덱스

이 디렉토리는 AIWF의 AI 페르소나 시스템을 위한 컨텍스트 규칙과 지식 베이스를 포함합니다.

## 사용 가능한 페르소나

### 1. Architect (아키텍처 전문가)
- **활성화**: `/project:aiwf:architect`
- **전문 분야**: 시스템 설계, 확장성, 기술 스택 선정
- **디렉토리**: `architect/`

### 2. Security (보안 전문가)
- **활성화**: `/project:aiwf:security`
- **전문 분야**: 보안 취약점 분석, 인증/인가, 암호화
- **디렉토리**: `security/`

### 3. Frontend (프론트엔드 전문가)
- **활성화**: `/project:aiwf:frontend`
- **전문 분야**: UI/UX, 반응형 디자인, 프론트엔드 프레임워크
- **디렉토리**: `frontend/`

### 4. Backend (백엔드 전문가)
- **활성화**: `/project:aiwf:backend`
- **전문 분야**: API 설계, 데이터베이스, 서버 아키텍처
- **디렉토리**: `backend/`

### 5. Data Analyst (데이터 분석가)
- **활성화**: `/project:aiwf:data_analyst`
- **전문 분야**: 데이터 분석, 머신러닝, 통계 분석
- **디렉토리**: `data_analyst/`

## 각 페르소나 디렉토리 구조

```
[persona_name]/
├── context_rules.md    # 페르소나별 컨텍스트 규칙
├── best_practices.md   # 전문 분야 베스트 프랙티스
└── knowledge_base.md   # 도메인 특화 지식 베이스
```

## 관리 명령어

- **상태 확인**: `/project:aiwf:persona_status`
- **기본 모드 복원**: `/project:aiwf:default_mode`

## 사용 방법

1. 원하는 페르소나 활성화: `/project:aiwf:[persona_name]`
2. 전문적인 도움 받기: 해당 분야의 질문이나 작업 요청
3. 다른 페르소나로 전환 또는 기본 모드로 복원

## 페르소나 시스템 특징

- **즉시 전환**: 2초 이내 페르소나 전환
- **컨텍스트 유지**: 페르소나별 전문 지식 자동 로드
- **통계 추적**: 사용 패턴 및 효율성 분석
- **다국어 지원**: 한국어/영어 완벽 지원