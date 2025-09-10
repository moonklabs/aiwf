# Backend 페르소나 Best Practices

## 개요
Backend 페르소나는 서버 사이드 로직, 데이터베이스 설계, API 개발에 중점을 둡니다. 확장성, 성능, 데이터 무결성을 최우선으로 고려합니다.

## 핵심 원칙

### 1. API 설계 원칙
- RESTful 원칙 준수
- GraphQL 스키마 최적화
- API 버전 관리
- 일관된 응답 형식

### 2. 데이터베이스 설계
```sql
-- 정규화와 성능의 균형
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 전략
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- 파티셔닝 (대용량 테이블)
CREATE TABLE orders (
    id BIGSERIAL,
    user_id UUID REFERENCES users(id),
    order_date DATE NOT NULL,
    total_amount DECIMAL(10,2),
    PRIMARY KEY (id, order_date)
) PARTITION BY RANGE (order_date);
```

### 3. 마이크로서비스 아키텍처
```javascript
// 서비스 간 통신 패턴
class OrderService {
  constructor(eventBus, userService, inventoryService) {
    this.eventBus = eventBus;
    this.userService = userService;
    this.inventoryService = inventoryService;
  }
  
  async createOrder(orderData) {
    // Saga 패턴으로 분산 트랜잭션 처리
    const saga = new OrderSaga();
    
    try {
      // 1. 사용자 검증
      const user = await this.userService.validateUser(orderData.userId);
      saga.addCompensation(() => this.userService.rollback(user));
      
      // 2. 재고 확인 및 예약
      const reservation = await this.inventoryService.reserve(orderData.items);
      saga.addCompensation(() => this.inventoryService.release(reservation));
      
      // 3. 주문 생성
      const order = await this.createOrderRecord(orderData);
      saga.addCompensation(() => this.deleteOrder(order.id));
      
      // 4. 이벤트 발행
      await this.eventBus.publish('order.created', {
        orderId: order.id,
        userId: user.id,
        items: orderData.items
      });
      
      return order;
    } catch (error) {
      await saga.compensate();
      throw error;
    }
  }
}
```

## API 개발 Best Practices

### RESTful API 설계
```javascript
// Express.js 라우터
class UserController {
  // GET /api/v1/users?page=1&limit=20&sort=created_at:desc
  async getUsers(req, res) {
    const { page = 1, limit = 20, sort, filter } = req.query;
    
    try {
      const users = await this.userService.findAll({
        pagination: { page, limit },
        sorting: this.parseSortParam(sort),
        filters: this.parseFilterParam(filter)
      });
      
      res.json({
        success: true,
        data: users,
        meta: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: users.total,
          totalPages: Math.ceil(users.total / limit)
        }
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }
  
  // POST /api/v1/users
  async createUser(req, res) {
    try {
      // 입력 검증
      const validatedData = await this.validator.validate(req.body, UserSchema);
      
      // 비즈니스 로직
      const user = await this.userService.create(validatedData);
      
      // 201 Created with Location header
      res.status(201)
         .location(`/api/v1/users/${user.id}`)
         .json({
           success: true,
           data: user
         });
    } catch (error) {
      this.handleError(error, res);
    }
  }
  
  // Error handling
  handleError(error, res) {
    if (error instanceof ValidationError) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message,
          details: error.details
        }
      });
    }
    
    if (error instanceof NotFoundError) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: error.message
        }
      });
    }
    
    // 500 Internal Server Error
    console.error('Unexpected error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred'
      }
    });
  }
}
```

### GraphQL 스키마 설계
```graphql
# Schema Definition
type User {
  id: ID!
  email: String!
  profile: Profile!
  orders(
    first: Int = 10
    after: String
    filter: OrderFilter
  ): OrderConnection!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Profile {
  firstName: String!
  lastName: String!
  avatar: String
  preferences: UserPreferences!
}

# Pagination using Relay specification
type OrderConnection {
  edges: [OrderEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type OrderEdge {
  node: Order!
  cursor: String!
}

# Input types
input CreateUserInput {
  email: String!
  password: String!
  profile: ProfileInput!
}

# Queries
type Query {
  user(id: ID!): User
  users(
    first: Int
    after: String
    filter: UserFilter
    orderBy: UserOrderBy
  ): UserConnection!
  me: User @auth
}

# Mutations
type Mutation {
  createUser(input: CreateUserInput!): CreateUserPayload!
  updateUser(id: ID!, input: UpdateUserInput!): UpdateUserPayload!
  deleteUser(id: ID!): DeleteUserPayload!
}

# Subscriptions
type Subscription {
  userUpdated(userId: ID!): User!
  orderCreated(userId: ID!): Order!
}
```

## 데이터베이스 최적화

### 쿼리 최적화
```javascript
// Query Builder Pattern
class UserRepository {
  constructor(db) {
    this.db = db;
  }
  
  // N+1 문제 방지
  async findWithOrders(userId) {
    const query = `
      SELECT 
        u.id, u.email, u.created_at,
        o.id as order_id, o.total_amount, o.order_date,
        oi.product_id, oi.quantity, oi.price
      FROM users u
      LEFT JOIN orders o ON u.id = o.user_id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE u.id = $1
      ORDER BY o.order_date DESC
    `;
    
    const result = await this.db.query(query, [userId]);
    return this.mapResultToUser(result.rows);
  }
  
  // Batch loading
  async findByIds(userIds) {
    if (userIds.length === 0) return [];
    
    const query = `
      SELECT * FROM users 
      WHERE id = ANY($1::uuid[])
    `;
    
    const result = await this.db.query(query, [userIds]);
    
    // 순서 보장
    const userMap = new Map(
      result.rows.map(row => [row.id, row])
    );
    
    return userIds.map(id => userMap.get(id)).filter(Boolean);
  }
  
  // 동적 쿼리 빌더
  async search(criteria) {
    let query = 'SELECT * FROM users WHERE 1=1';
    const params = [];
    let paramIndex = 1;
    
    if (criteria.email) {
      query += ` AND email ILIKE $${paramIndex}`;
      params.push(`%${criteria.email}%`);
      paramIndex++;
    }
    
    if (criteria.createdAfter) {
      query += ` AND created_at >= $${paramIndex}`;
      params.push(criteria.createdAfter);
      paramIndex++;
    }
    
    if (criteria.sortBy) {
      const validColumns = ['email', 'created_at'];
      if (validColumns.includes(criteria.sortBy)) {
        query += ` ORDER BY ${criteria.sortBy} ${
          criteria.sortOrder === 'desc' ? 'DESC' : 'ASC'
        }`;
      }
    }
    
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(criteria.limit || 20, criteria.offset || 0);
    
    return this.db.query(query, params);
  }
}
```

### 캐싱 전략
```javascript
// Redis 캐싱 레이어
class CacheService {
  constructor(redis, ttl = 3600) {
    this.redis = redis;
    this.ttl = ttl;
  }
  
  // Cache-Aside Pattern
  async get(key, fetchFn) {
    // 1. 캐시 확인
    const cached = await this.redis.get(key);
    if (cached) {
      return JSON.parse(cached);
    }
    
    // 2. 캐시 미스 시 데이터 조회
    const data = await fetchFn();
    
    // 3. 캐시 저장
    await this.redis.setex(
      key,
      this.ttl,
      JSON.stringify(data)
    );
    
    return data;
  }
  
  // Write-Through Pattern
  async set(key, data, ttl = this.ttl) {
    await this.redis.setex(
      key,
      ttl,
      JSON.stringify(data)
    );
    return data;
  }
  
  // Cache Invalidation
  async invalidate(pattern) {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
  
  // Distributed Lock (분산 환경)
  async acquireLock(lockKey, ttl = 10) {
    const identifier = uuidv4();
    const result = await this.redis.set(
      `lock:${lockKey}`,
      identifier,
      'NX',
      'EX',
      ttl
    );
    
    return result === 'OK' ? identifier : null;
  }
  
  async releaseLock(lockKey, identifier) {
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;
    
    return this.redis.eval(
      script,
      1,
      `lock:${lockKey}`,
      identifier
    );
  }
}
```

## 메시지 큐와 이벤트 처리

### RabbitMQ 패턴
```javascript
// Publisher/Subscriber Pattern
class EventPublisher {
  constructor(channel) {
    this.channel = channel;
  }
  
  async publish(exchange, routingKey, message) {
    const messageBuffer = Buffer.from(JSON.stringify({
      ...message,
      timestamp: new Date().toISOString(),
      messageId: uuidv4()
    }));
    
    await this.channel.publish(
      exchange,
      routingKey,
      messageBuffer,
      {
        persistent: true,
        contentType: 'application/json',
        headers: {
          'x-retry-count': 0
        }
      }
    );
  }
}

// Consumer with Error Handling
class EventConsumer {
  constructor(channel, options = {}) {
    this.channel = channel;
    this.maxRetries = options.maxRetries || 3;
  }
  
  async consume(queue, handler) {
    await this.channel.consume(queue, async (msg) => {
      if (!msg) return;
      
      try {
        const content = JSON.parse(msg.content.toString());
        await handler(content);
        
        // Acknowledge message
        this.channel.ack(msg);
      } catch (error) {
        console.error('Error processing message:', error);
        
        // Retry logic
        const retryCount = (msg.properties.headers['x-retry-count'] || 0) + 1;
        
        if (retryCount <= this.maxRetries) {
          // Requeue with delay
          setTimeout(() => {
            this.channel.sendToQueue(
              queue,
              msg.content,
              {
                ...msg.properties,
                headers: {
                  ...msg.properties.headers,
                  'x-retry-count': retryCount
                }
              }
            );
          }, Math.pow(2, retryCount) * 1000); // Exponential backoff
        } else {
          // Send to DLQ
          await this.sendToDeadLetter(msg, error);
        }
        
        // Reject without requeue
        this.channel.nack(msg, false, false);
      }
    });
  }
  
  async sendToDeadLetter(msg, error) {
    const dlq = `${msg.fields.routingKey}.dlq`;
    await this.channel.sendToQueue(
      dlq,
      msg.content,
      {
        headers: {
          'x-death-reason': error.message,
          'x-original-queue': msg.fields.routingKey
        }
      }
    );
  }
}
```

## 보안 구현

### 인증/인가 미들웨어
```javascript
// JWT Authentication
class AuthMiddleware {
  constructor(jwtService, userService) {
    this.jwtService = jwtService;
    this.userService = userService;
  }
  
  authenticate() {
    return async (req, res, next) => {
      try {
        const token = this.extractToken(req);
        if (!token) {
          return res.status(401).json({
            error: 'No authentication token provided'
          });
        }
        
        const payload = await this.jwtService.verify(token);
        
        // Token blacklist check
        if (await this.isTokenBlacklisted(payload.jti)) {
          return res.status(401).json({
            error: 'Token has been revoked'
          });
        }
        
        req.user = await this.userService.findById(payload.sub);
        next();
      } catch (error) {
        if (error.name === 'TokenExpiredError') {
          return res.status(401).json({
            error: 'Token has expired'
          });
        }
        
        return res.status(401).json({
          error: 'Invalid authentication token'
        });
      }
    };
  }
  
  authorize(...roles) {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required'
        });
      }
      
      if (roles.length > 0 && !roles.includes(req.user.role)) {
        return res.status(403).json({
          error: 'Insufficient permissions'
        });
      }
      
      next();
    };
  }
  
  extractToken(req) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    
    return req.cookies?.accessToken;
  }
}
```

## 테스팅 전략

### 단위 테스트
```javascript
describe('UserService', () => {
  let userService;
  let userRepository;
  let emailService;
  
  beforeEach(() => {
    userRepository = {
      findByEmail: jest.fn(),
      create: jest.fn(),
      update: jest.fn()
    };
    
    emailService = {
      sendWelcomeEmail: jest.fn()
    };
    
    userService = new UserService(userRepository, emailService);
  });
  
  describe('createUser', () => {
    it('should create user with hashed password', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123'
      };
      
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.create.mockResolvedValue({
        id: 'user-123',
        ...userData,
        password: 'hashed-password'
      });
      
      const user = await userService.createUser(userData);
      
      expect(userRepository.findByEmail).toHaveBeenCalledWith(userData.email);
      expect(userRepository.create).toHaveBeenCalledWith({
        email: userData.email,
        password: expect.stringMatching(/^\$2[aby]\$/)
      });
      expect(emailService.sendWelcomeEmail).toHaveBeenCalledWith(userData.email);
      expect(user).not.toHaveProperty('password');
    });
    
    it('should throw error if email already exists', async () => {
      userRepository.findByEmail.mockResolvedValue({ id: 'existing-user' });
      
      await expect(
        userService.createUser({ email: 'test@example.com', password: 'pass' })
      ).rejects.toThrow('Email already registered');
    });
  });
});
```

### 통합 테스트
```javascript
describe('API Integration Tests', () => {
  let app;
  let db;
  
  beforeAll(async () => {
    // Test database setup
    db = await createTestDatabase();
    app = createApp(db);
  });
  
  afterAll(async () => {
    await db.close();
  });
  
  describe('POST /api/users', () => {
    it('should create user and return 201', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          email: 'newuser@example.com',
          password: 'SecurePass123!',
          profile: {
            firstName: 'John',
            lastName: 'Doe'
          }
        });
      
      expect(response.status).toBe(201);
      expect(response.headers.location).toMatch(/\/api\/users\/[\w-]+/);
      expect(response.body).toMatchObject({
        success: true,
        data: {
          email: 'newuser@example.com',
          profile: {
            firstName: 'John',
            lastName: 'Doe'
          }
        }
      });
      
      // Verify database
      const user = await db.query(
        'SELECT * FROM users WHERE email = $1',
        ['newuser@example.com']
      );
      expect(user.rows).toHaveLength(1);
    });
  });
});
```

## 모니터링과 로깅

### 구조화된 로깅
```javascript
class Logger {
  constructor(service) {
    this.service = service;
    this.winston = winston.createLogger({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { service },
      transports: [
        new winston.transports.Console({
          format: winston.format.simple()
        }),
        new winston.transports.File({
          filename: 'error.log',
          level: 'error'
        }),
        new winston.transports.File({
          filename: 'combined.log'
        })
      ]
    });
  }
  
  log(level, message, meta = {}) {
    this.winston.log({
      level,
      message,
      ...meta,
      timestamp: new Date().toISOString()
    });
  }
  
  // Request logging middleware
  requestLogger() {
    return (req, res, next) => {
      const start = Date.now();
      
      res.on('finish', () => {
        const duration = Date.now() - start;
        
        this.log('info', 'HTTP Request', {
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          duration,
          ip: req.ip,
          userAgent: req.get('user-agent'),
          userId: req.user?.id
        });
      });
      
      next();
    };
  }
}
```

## 배포 전 체크리스트

### 성능
- [ ] 데이터베이스 인덱스 최적화
- [ ] N+1 쿼리 제거
- [ ] 캐싱 전략 구현
- [ ] 비동기 처리 적용

### 보안
- [ ] 환경 변수로 민감 정보 관리
- [ ] SQL Injection 방지
- [ ] Rate Limiting 설정
- [ ] CORS 정책 구성

### 안정성
- [ ] 에러 처리 및 복구 메커니즘
- [ ] 서킷 브레이커 패턴
- [ ] 헬스체크 엔드포인트
- [ ] 우아한 종료(Graceful Shutdown)