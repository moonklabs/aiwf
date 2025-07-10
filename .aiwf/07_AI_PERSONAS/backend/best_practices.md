# Backend Best Practices

## API Design Best Practices

### 1. RESTful API Design
```
GET    /users           # List all users
GET    /users/{id}      # Get specific user
POST   /users           # Create new user
PUT    /users/{id}      # Update entire user
PATCH  /users/{id}      # Partial update
DELETE /users/{id}      # Delete user
```

### 2. HTTP Status Codes
- **200 OK**: Successful GET, PUT, PATCH
- **201 Created**: Successful POST
- **204 No Content**: Successful DELETE
- **400 Bad Request**: Invalid request data
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Access denied
- **404 Not Found**: Resource not found
- **422 Unprocessable Entity**: Validation errors
- **500 Internal Server Error**: Server error

### 3. Error Response Format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

## Database Best Practices

### 1. Schema Design
```sql
-- Users table with proper constraints
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    INDEX idx_users_email (email),
    INDEX idx_users_created_at (created_at)
);
```

### 2. Query Optimization
```sql
-- Bad: N+1 queries
SELECT * FROM users;
-- Then for each user:
SELECT * FROM orders WHERE user_id = ?;

-- Good: Join query
SELECT u.*, o.* 
FROM users u 
LEFT JOIN orders o ON u.id = o.user_id;
```

### 3. Connection Management
```javascript
// Connection pooling example
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20, // Maximum connections
  idle: 30000, // Idle timeout
  connectionTimeoutMillis: 2000
});
```

## Security Best Practices

### 1. Authentication & Authorization
```javascript
// JWT middleware example
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};
```

### 2. Input Validation
```javascript
const { body, validationResult } = require('express-validator');

const validateUser = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('name').trim().escape(),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ 
        error: 'Validation failed',
        details: errors.array()
      });
    }
    next();
  }
];
```

### 3. Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

app.use('/api/', limiter);
```

## Performance Optimization

### 1. Caching Strategy
```javascript
const Redis = require('redis');
const client = Redis.createClient();

// Cache with TTL
const cacheGet = async (key) => {
  const cached = await client.get(key);
  return cached ? JSON.parse(cached) : null;
};

const cacheSet = async (key, data, ttl = 3600) => {
  await client.setex(key, ttl, JSON.stringify(data));
};

// Usage in route
app.get('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const cacheKey = `user:${id}`;
  
  // Try cache first
  let user = await cacheGet(cacheKey);
  if (!user) {
    user = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    await cacheSet(cacheKey, user);
  }
  
  res.json(user);
});
```

### 2. Background Jobs
```javascript
const Queue = require('bull');
const emailQueue = new Queue('email processing');

// Add job to queue
emailQueue.add('send-email', {
  to: 'user@example.com',
  subject: 'Welcome!',
  template: 'welcome'
});

// Process jobs
emailQueue.process('send-email', async (job) => {
  const { to, subject, template } = job.data;
  await sendEmail(to, subject, template);
});
```

### 3. Database Optimization
```sql
-- Create indexes for frequently queried columns
CREATE INDEX CONCURRENTLY idx_orders_user_id ON orders(user_id);
CREATE INDEX CONCURRENTLY idx_orders_status ON orders(status);
CREATE INDEX CONCURRENTLY idx_orders_created_at ON orders(created_at);

-- Composite index for complex queries
CREATE INDEX CONCURRENTLY idx_orders_user_status 
ON orders(user_id, status, created_at);
```

## Error Handling

### 1. Structured Error Handling
```javascript
class ApiError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.name = 'ApiError';
  }
}

// Error middleware
const errorHandler = (err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message
      }
    });
  }
  
  // Log unexpected errors
  console.error('Unexpected error:', err);
  
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred'
    }
  });
};
```

### 2. Graceful Shutdown
```javascript
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});
```

## Testing Best Practices

### 1. Unit Testing
```javascript
// Jest example
describe('User Service', () => {
  beforeEach(() => {
    // Setup test data
  });
  
  test('should create user with valid data', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'securepassword'
    };
    
    const user = await userService.create(userData);
    
    expect(user.email).toBe(userData.email);
    expect(user.password_hash).toBeDefined();
    expect(user.id).toBeDefined();
  });
});
```

### 2. Integration Testing
```javascript
// Supertest example
const request = require('supertest');
const app = require('../app');

describe('User API', () => {
  test('POST /users should create user', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({
        email: 'test@example.com',
        password: 'securepassword'
      })
      .expect(201);
    
    expect(response.body.email).toBe('test@example.com');
  });
});
```

## Monitoring and Logging

### 1. Structured Logging
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Usage
logger.info('User created', { userId: user.id, email: user.email });
logger.error('Database error', { error: err.message, stack: err.stack });
```

### 2. Health Checks
```javascript
app.get('/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {}
  };
  
  try {
    // Database health check
    await db.query('SELECT 1');
    health.services.database = 'healthy';
  } catch (error) {
    health.services.database = 'unhealthy';
    health.status = 'degraded';
  }
  
  try {
    // Redis health check
    await redis.ping();
    health.services.redis = 'healthy';
  } catch (error) {
    health.services.redis = 'unhealthy';
    health.status = 'degraded';
  }
  
  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
});
```