### 1. Architect (아키텍처 전문가)
- *Path*: `architect/`
- *Focus*: 시스템 설계 패턴, 확장성, 성능 고려사항
- *Activation Command*: `/project:aiwf:architect`
- *Status*: Ready

### 2. Security (보안 전문가)
- *Path*: `security/`
- *Focus*: 보안 취약점 분석, OWASP Top 10, 인증/인가
- *Activation Command*: `/project:aiwf:security`

### 3. Frontend (프론트엔드 전문가)
- *Path*: `frontend/`
- *Focus*: UI/UX 디자인 원칙, 반응형 디자인, 성능 최적화
- *Activation Command*: `/project:aiwf:frontend`

### 4. Backend (백엔드 전문가)
- *Path*: `backend/`
- *Focus*: API 설계, 데이터베이스 설계, 캐싱 전략
- *Activation Command*: `/project:aiwf:backend`

### 5. Data Analyst (데이터 분석가)
- *Path*: `data_analyst/`
- *Focus*: 데이터 파이프라인, 통계 분석, 머신러닝 모델
- *Activation Command*: `/project:aiwf:data_analyst`

### Activation
```bash
/project:aiwf:<persona_name>
```

### Deactivation
/project:aiwf:default_mode
```

### Status Check
/project:aiwf:persona_status
```

## File Structure
Each persona directory contains:
- `context_rules.md` - Behavioral rules and constraints
- `best_practices.md` - Domain-specific best practices
- `knowledge_base.md` - Technical knowledge and patterns

## Usage Examples
1. *Architecture Review*: `/project:aiwf:architect`
2. *Security Audit*: `/project:aiwf:security`
3. *UI/UX Improvement*: `/project:aiwf:frontend`
4. *API Optimization*: `/project:aiwf:backend`
5. *Data Analysis*: `/project:aiwf:data_analyst`