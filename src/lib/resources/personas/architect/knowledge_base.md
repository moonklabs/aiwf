# Architect 페르소나 Knowledge Base

## 아키텍처 패턴

### 1. 레이어드 아키텍처 (Layered Architecture)
```
┌─────────────────────────────┐
│   Presentation Layer        │
├─────────────────────────────┤
│   Application Layer         │
├─────────────────────────────┤
│   Domain/Business Layer     │
├─────────────────────────────┤
│   Data Access Layer         │
└─────────────────────────────┘
```

**특징**:
- 관심사의 분리
- 각 레이어는 하위 레이어만 의존
- 테스트 용이성

### 2. 헥사고날 아키텍처 (Ports & Adapters)
```
         ┌─────────────┐
         │   UI Port   │
         └──────┬──────┘
                │
    ┌───────────┴───────────┐
    │                       │
┌───┴────┐           ┌─────┴───┐
│DB Port │  Domain   │API Port │
└───┬────┘           └─────┬───┘
    │                       │
    └───────────┬───────────┘
                │
         ┌──────┴──────┐
         │External Port│
         └─────────────┘
```

**장점**:
- 비즈니스 로직 격리
- 테스트 용이성 극대화
- 기술 독립성

### 3. 마이크로서비스 아키텍처
```yaml
services:
  user-service:
    responsibilities:
      - 사용자 관리
      - 인증/인가
    database: PostgreSQL
    
  order-service:
    responsibilities:
      - 주문 처리
      - 재고 확인
    database: MongoDB
    
  notification-service:
    responsibilities:
      - 이메일 발송
      - SMS 발송
    queue: RabbitMQ
```

## 디자인 패턴 카탈로그

### 생성 패턴 (Creational Patterns)

#### 1. Factory Pattern
```javascript
class PaymentFactory {
  static createPayment(type) {
    switch(type) {
      case 'card': return new CardPayment();
      case 'bank': return new BankTransfer();
      case 'crypto': return new CryptoPayment();
      default: throw new Error('Unknown payment type');
    }
  }
}
```

#### 2. Builder Pattern
```javascript
class ServerConfigBuilder {
  constructor() {
    this.config = {};
  }
  
  setHost(host) {
    this.config.host = host;
    return this;
  }
  
  setPort(port) {
    this.config.port = port;
    return this;
  }
  
  enableSSL(cert) {
    this.config.ssl = { enabled: true, cert };
    return this;
  }
  
  build() {
    return new ServerConfig(this.config);
  }
}
```

### 구조 패턴 (Structural Patterns)

#### 1. Adapter Pattern
```javascript
// 외부 라이브러리 어댑터
class PaymentGatewayAdapter {
  constructor(externalGateway) {
    this.gateway = externalGateway;
  }
  
  async processPayment(amount, currency) {
    // 외부 API를 내부 인터페이스로 변환
    const result = await this.gateway.charge({
      value: amount * 100, // cents로 변환
      curr: currency
    });
    
    return {
      success: result.status === 'OK',
      transactionId: result.ref_id
    };
  }
}
```

#### 2. Facade Pattern
```javascript
class OrderFacade {
  constructor(inventory, payment, shipping, notification) {
    this.inventory = inventory;
    this.payment = payment;
    this.shipping = shipping;
    this.notification = notification;
  }
  
  async placeOrder(orderData) {
    // 복잡한 프로세스를 단순한 인터페이스로 제공
    await this.inventory.checkAvailability(orderData.items);
    const paymentResult = await this.payment.process(orderData.payment);
    const trackingId = await this.shipping.schedule(orderData.shipping);
    await this.notification.sendConfirmation(orderData.customer, trackingId);
    
    return { orderId: generateId(), trackingId };
  }
}
```

### 행위 패턴 (Behavioral Patterns)

#### 1. Strategy Pattern
```javascript
class PricingContext {
  constructor(strategy) {
    this.strategy = strategy;
  }
  
  calculatePrice(basePrice) {
    return this.strategy.calculate(basePrice);
  }
}

class RegularPricing {
  calculate(price) { return price; }
}

class PremiumPricing {
  calculate(price) { return price * 0.8; }
}

class SeasonalPricing {
  calculate(price) { return price * 0.7; }
}
```

## 시스템 설계 원칙

### SOLID 원칙

#### S - Single Responsibility Principle
```javascript
// 잘못된 예
class User {
  save() { /* DB 저장 */ }
  sendEmail() { /* 이메일 발송 */ }
  validatePassword() { /* 패스워드 검증 */ }
}

// 올바른 예
class User { /* 사용자 도메인 로직만 */ }
class UserRepository { /* DB 저장 */ }
class EmailService { /* 이메일 발송 */ }
class PasswordValidator { /* 패스워드 검증 */ }
```

#### O - Open/Closed Principle
```javascript
// 확장에는 열려있고 수정에는 닫혀있는 설계
interface PaymentProcessor {
  process(amount: number): Promise<PaymentResult>;
}

class PaymentService {
  constructor(private processors: PaymentProcessor[]) {}
  
  // 새로운 결제 방식 추가 시 이 클래스 수정 불필요
  async processPayment(type: string, amount: number) {
    const processor = this.processors.find(p => p.type === type);
    return processor.process(amount);
  }
}
```

### CAP 이론
- **Consistency**: 모든 노드가 동일한 데이터를 보유
- **Availability**: 시스템이 항상 응답
- **Partition Tolerance**: 네트워크 분할 시에도 작동

**트레이드오프 예시**:
- CP 시스템: MongoDB, HBase
- AP 시스템: Cassandra, DynamoDB
- CA 시스템: 단일 노드 RDBMS

## 성능 최적화 전략

### 1. 캐싱 전략
```javascript
class CacheStrategy {
  // Cache-Aside Pattern
  async get(key) {
    let value = await cache.get(key);
    if (!value) {
      value = await database.get(key);
      await cache.set(key, value, TTL);
    }
    return value;
  }
  
  // Write-Through Pattern
  async set(key, value) {
    await database.set(key, value);
    await cache.set(key, value, TTL);
  }
}
```

### 2. 데이터베이스 최적화
- 인덱싱 전략
- 쿼리 최적화
- 샤딩 및 파티셔닝
- 읽기 전용 복제본

### 3. 비동기 처리
```javascript
// 이벤트 기반 아키텍처
class OrderService {
  async createOrder(orderData) {
    const order = await this.saveOrder(orderData);
    
    // 비동기 이벤트 발행
    await eventBus.publish('order.created', {
      orderId: order.id,
      customerId: order.customerId,
      items: order.items
    });
    
    return order;
  }
}
```

## 보안 아키텍처

### 1. 인증/인가 패턴
```javascript
// JWT 기반 인증
class AuthMiddleware {
  async authenticate(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).send('No token');
    
    try {
      const payload = jwt.verify(token, SECRET);
      req.user = payload;
      next();
    } catch (error) {
      res.status(401).send('Invalid token');
    }
  }
}

// RBAC (Role-Based Access Control)
class AuthorizationMiddleware {
  requireRole(role) {
    return (req, res, next) => {
      if (!req.user.roles.includes(role)) {
        return res.status(403).send('Insufficient permissions');
      }
      next();
    };
  }
}
```

### 2. API 보안
- Rate Limiting
- CORS 설정
- Input Validation
- SQL Injection 방지
- XSS 방지

## 모니터링 및 관찰성

### 1. 로깅 전략
```javascript
class StructuredLogger {
  log(level, message, context) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...context,
      correlationId: context.correlationId || generateId()
    };
    
    console.log(JSON.stringify(logEntry));
  }
}
```

### 2. 메트릭 수집
- 응답 시간
- 처리량
- 에러율
- 리소스 사용률

### 3. 분산 추적
- Correlation ID를 통한 요청 추적
- 서비스 간 호출 체인 시각화
- 병목 지점 식별

## 기술 스택 가이드

### 백엔드
- **Node.js**: 이벤트 기반, 비동기 처리
- **Java/Spring**: 엔터프라이즈, 안정성
- **Go**: 고성능, 동시성
- **Python**: 데이터 처리, ML/AI

### 데이터베이스
- **PostgreSQL**: ACID, 복잡한 쿼리
- **MongoDB**: 유연한 스키마, 확장성
- **Redis**: 캐싱, 세션 저장
- **Elasticsearch**: 전문 검색, 로그 분석

### 메시지 큐
- **RabbitMQ**: 신뢰성, 라우팅
- **Kafka**: 대용량, 스트리밍
- **Redis Pub/Sub**: 간단한 pub/sub

### 컨테이너 & 오케스트레이션
- **Docker**: 컨테이너화
- **Kubernetes**: 오케스트레이션
- **Istio**: 서비스 메시