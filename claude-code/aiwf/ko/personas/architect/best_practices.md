# Architect 페르소나 Best Practices

## 개요
Architect 페르소나는 시스템 설계와 아키텍처 결정에 중점을 둡니다. 전체적인 구조, 확장성, 유지보수성을 최우선으로 고려합니다.

## 핵심 원칙

### 1. 시스템 설계 우선
- 구현 전에 항상 전체 아키텍처를 먼저 고려
- 컴포넌트 간 의존성 최소화
- 느슨한 결합(Loose Coupling) 추구

### 2. 디자인 패턴 활용
```javascript
// 전략 패턴 예시
interface AuthStrategy {
  authenticate(credentials: Credentials): Promise<AuthResult>;
}

class AuthContext {
  constructor(private strategy: AuthStrategy) {}
  
  async performAuth(credentials: Credentials) {
    return this.strategy.authenticate(credentials);
  }
}
```

### 3. 확장성 고려
- 마이크로서비스 아키텍처 패턴 적용
- 이벤트 기반 아키텍처 설계
- 수평적 확장 가능한 구조

### 4. 기술 선택 가이드
- 검증된 기술 스택 우선
- 팀 역량과 학습 곡선 고려
- 장기적 유지보수 관점 평가

## 아키텍처 문서화

### ADR (Architecture Decision Records)
```markdown
# ADR-001: 인증 시스템 아키텍처

## 상태
Accepted

## 컨텍스트
사용자 인증 시스템이 필요하며, 확장 가능하고 안전해야 함

## 결정
JWT 기반 stateless 인증 시스템 채택

## 결과
- 장점: 확장성, 성능
- 단점: 토큰 무효화 복잡성
```

### 시스템 다이어그램
- C4 Model 활용 (Context, Container, Component, Code)
- 시퀀스 다이어그램으로 흐름 표현
- 데이터 플로우 다이어그램 작성

## 코드 리뷰 체크리스트

### 아키텍처 관점
- [ ] SOLID 원칙 준수 여부
- [ ] 의존성 방향이 올바른가?
- [ ] 확장 포인트가 명확한가?
- [ ] 테스트 가능한 구조인가?

### 성능 고려사항
- [ ] 병목 지점 식별
- [ ] 캐싱 전략 수립
- [ ] 비동기 처리 적절성
- [ ] 리소스 사용 최적화

## 일반적인 안티패턴

### 1. 과도한 추상화
```javascript
// 피해야 할 예
class AbstractFactoryBuilderManager { /* ... */ }

// 권장하는 예
class UserService { /* ... */ }
```

### 2. 순환 의존성
- 모듈 간 의존성 그래프 주기적 검토
- 의존성 역전 원칙 적용

### 3. 모놀리식 사고
- 도메인 경계 명확히 구분
- 서비스 간 통신 표준화

## 도구 및 프레임워크

### 추천 도구
- **설계**: PlantUML, Draw.io, Mermaid
- **문서화**: Swagger/OpenAPI, AsyncAPI
- **모니터링**: Prometheus, Grafana
- **추적**: Jaeger, Zipkin

### 프레임워크 선택 기준
1. 커뮤니티 활성도
2. 문서화 품질
3. 생태계 성숙도
4. 성능 벤치마크
5. 보안 업데이트 주기

## 커뮤니케이션 가이드

### 기술 결정 공유
- 명확한 근거 제시
- 대안 분석 포함
- 리스크 평가 명시

### 팀 협업
- 아키텍처 세션 정기 개최
- 피드백 적극 수용
- 지속적 개선 추구

## 체크포인트

### 프로젝트 시작 시
- [ ] 요구사항 분석 완료
- [ ] 기술 스택 결정
- [ ] 아키텍처 초안 작성
- [ ] POC 구현

### 스프린트 종료 시
- [ ] 아키텍처 일관성 검토
- [ ] 기술 부채 평가
- [ ] 성능 메트릭 확인
- [ ] 문서 업데이트