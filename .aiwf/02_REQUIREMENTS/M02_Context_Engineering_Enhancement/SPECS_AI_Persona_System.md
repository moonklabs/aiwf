# Technical Specification: AI Persona System

## Overview

AI 페르소나 시스템은 AIWF에서 도메인별 전문가 모드를 제공하여, 특정 분야에 특화된 조언과 가이드를 제공하는 시스템입니다. SuperClaude의 인지 페르소나 개념을 AIWF의 구조에 맞게 구현합니다.

## Architecture

### Directory Structure
```
.aiwf/
├── 07_AI_PERSONAS/
│   ├── architect/
│   │   ├── context_rules.md
│   │   ├── best_practices.md
│   │   └── knowledge_base.md
│   ├── security/
│   │   ├── context_rules.md
│   │   ├── security_checklist.md
│   │   └── vulnerability_patterns.md
│   ├── frontend/
│   │   ├── context_rules.md
│   │   ├── ui_ux_guidelines.md
│   │   └── component_patterns.md
│   ├── backend/
│   │   ├── context_rules.md
│   │   ├── api_design_guide.md
│   │   └── performance_tips.md
│   ├── data_analyst/
│   │   ├── context_rules.md
│   │   ├── analysis_methodologies.md
│   │   └── visualization_guide.md
│   └── PERSONA_INDEX.md
```

## Persona Definitions

### 1. Architect (아키텍처 전문가)
**Focus Areas**:
- 시스템 설계 패턴
- 확장성 및 성능 고려사항
- 기술 스택 선택
- 마이크로서비스 vs 모놀리스
- 도메인 주도 설계 (DDD)

**Activation Command**: `/project:aiwf:architect`

**Context Rules**:
```yaml
persona: architect
focus:
  - system_design
  - scalability
  - architecture_patterns
  - technology_decisions
priorities:
  - maintainability: high
  - scalability: high
  - performance: medium
  - simplicity: medium
```

### 2. Security (보안 전문가)
**Focus Areas**:
- 보안 취약점 분석
- OWASP Top 10
- 인증/인가 시스템
- 데이터 암호화
- 보안 감사

**Activation Command**: `/project:aiwf:security`

**Context Rules**:
```yaml
persona: security
focus:
  - vulnerability_assessment
  - secure_coding
  - authentication
  - encryption
  - compliance
priorities:
  - security: critical
  - data_protection: high
  - compliance: high
  - usability: medium
```

### 3. Frontend (프론트엔드 전문가)
**Focus Areas**:
- UI/UX 디자인 원칙
- 반응형 디자인
- 성능 최적화
- 접근성 (a11y)
- 상태 관리

**Activation Command**: `/project:aiwf:frontend`

**Context Rules**:
```yaml
persona: frontend
focus:
  - user_interface
  - user_experience
  - performance
  - accessibility
  - state_management
priorities:
  - user_experience: critical
  - performance: high
  - accessibility: high
  - maintainability: medium
```

### 4. Backend (백엔드 전문가)
**Focus Areas**:
- API 설계 (REST/GraphQL)
- 데이터베이스 설계
- 캐싱 전략
- 메시지 큐
- 서버 최적화

**Activation Command**: `/project:aiwf:backend`

**Context Rules**:
```yaml
persona: backend
focus:
  - api_design
  - database_optimization
  - caching_strategies
  - message_queuing
  - server_architecture
priorities:
  - reliability: critical
  - performance: high
  - scalability: high
  - security: high
```

### 5. Data Analyst (데이터 분석가)
**Focus Areas**:
- 데이터 파이프라인
- 통계 분석
- 머신러닝 모델
- 데이터 시각화
- ETL 프로세스

**Activation Command**: `/project:aiwf:data_analyst`

**Context Rules**:
```yaml
persona: data_analyst
focus:
  - data_pipelines
  - statistical_analysis
  - machine_learning
  - visualization
  - etl_processes
priorities:
  - accuracy: critical
  - insights: high
  - performance: medium
  - automation: medium
```

## Command Specifications

### Persona Activation
```bash
/project:aiwf:<persona_name>
```

**Process**:
1. Load persona-specific context rules
2. Apply domain knowledge filters
3. Activate specialized response patterns
4. Display activation confirmation

**Response Format**:
```
🎭 AI 페르소나 활성화: [페르소나 이름]
📚 전문 분야: [주요 도메인]
🎯 현재 초점: [활성화된 초점 영역]
```

### Persona Deactivation
```bash
/project:aiwf:default_mode
```

**Process**:
1. Clear persona-specific contexts
2. Return to general-purpose mode
3. Display deactivation confirmation

### Persona Status Check
```bash
/project:aiwf:persona_status
```

**Output**:
```markdown
## 현재 AI 페르소나 상태

**활성 페르소나**: Backend Expert
**활성화 시간**: 15분 전
**적용된 규칙**: 5개
**제공된 조언**: 12건
```

## Integration Features

### 1. Context Injection
각 페르소나 활성화 시 자동으로 주입되는 컨텍스트:
- 도메인별 best practices
- 일반적인 anti-patterns
- 추천 도구 및 라이브러리
- 성능 벤치마크 참고자료

### 2. Response Adaptation
페르소나별 응답 특성:
- **Architect**: 높은 수준의 추상화, 패턴 중심
- **Security**: 위험 중심, 방어적 접근
- **Frontend**: 사용자 중심, 시각적 설명
- **Backend**: 데이터 흐름 중심, 성능 지향
- **Data Analyst**: 통계적 근거, 시각화 중심

### 3. Knowledge Base Integration
```
.aiwf/07_AI_PERSONAS/<persona>/knowledge_base.md
```
- 각 페르소나별 참고 자료
- 업계 표준 및 규약
- 도구별 설정 예시
- 실제 프로젝트 패턴

## Implementation Requirements

### Performance
- 페르소나 전환 < 500ms
- 컨텍스트 로딩 < 1초
- 메모리 오버헤드 < 50MB per persona

### Validation
- 페르소나 명령어 유효성 검사
- 중복 활성화 방지
- 충돌하는 규칙 감지

### Multi-language Support
모든 페르소나는 한국어/영어 양방향 지원:
- 명령어는 동일하게 유지
- 응답은 사용자 언어 설정 따름
- 전문 용어는 원어 병기

## Future Enhancements

1. **Custom Personas**: 사용자 정의 페르소나 생성
2. **Persona Combinations**: 복수 페르소나 동시 활성화
3. **Learning Mode**: 사용 패턴 학습 및 개인화
4. **Team Personas**: 팀별 맞춤 페르소나 설정
5. **Persona Analytics**: 페르소나별 사용 통계 및 효과 분석

## Example Use Cases

### 1. 아키텍처 리뷰
```bash
/project:aiwf:architect
"이 마이크로서비스 구조를 검토해주세요"
# → 확장성, 복잡도, 통신 오버헤드 등 아키텍처 관점 분석
```

### 2. 보안 감사
```bash
/project:aiwf:security
"이 인증 시스템의 취약점을 찾아주세요"
# → OWASP 기준, 일반적인 공격 벡터 등 보안 중심 분석
```

### 3. UI 개선
```bash
/project:aiwf:frontend
"이 대시보드의 UX를 개선하고 싶습니다"
# → 사용성, 접근성, 반응형 디자인 등 프론트엔드 관점 제안
```

### 4. API 최적화
```bash
/project:aiwf:backend
"이 API의 응답 속도를 개선하려면?"
# → 캐싱, 쿼리 최적화, 비동기 처리 등 백엔드 관점 솔루션
```

### 5. 데이터 인사이트
```bash
/project:aiwf:data_analyst
"이 사용자 행동 데이터에서 패턴을 찾아주세요"
# → 통계 분석, 시각화, 예측 모델 등 데이터 분석 접근법
```