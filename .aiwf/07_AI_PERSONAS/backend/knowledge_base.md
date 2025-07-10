# Backend Knowledge Base

## Technology Stack Reference

### 1. Node.js Backend
```javascript
// Express.js Application Structure
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/users', require('./routes/users'));
app.use('/api/orders', require('./routes/orders'));

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

module.exports = app;
```

### 2. Python FastAPI
```python
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
import uvicorn

app = FastAPI(title="My API", version="1.0.0")

class UserCreate(BaseModel):
    email: str
    password: str
    name: Optional[str] = None

class User(BaseModel):
    id: int
    email: str
    name: Optional[str] = None
    
    class Config:
        orm_mode = True

@app.post("/users/", response_model=User)
async def create_user(user: UserCreate):
    # Database logic here
    return {"id": 1, "email": user.email, "name": user.name}

@app.get("/users/{user_id}", response_model=User)
async def get_user(user_id: int):
    # Database logic here
    if user_id not in users_db:
        raise HTTPException(status_code=404, detail="User not found")
    return users_db[user_id]

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

### 3. Java Spring Boot
```java
@RestController
@RequestMapping("/api/users")
public class UserController {
    
    @Autowired
    private UserService userService;
    
    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody @Valid UserCreateRequest request) {
        User user = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(user);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<User> getUser(@PathVariable Long id) {
        User user = userService.findById(id);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(user);
    }
    
    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ErrorResponse> handleValidation(ValidationException e) {
        ErrorResponse error = new ErrorResponse("VALIDATION_ERROR", e.getMessage());
        return ResponseEntity.badRequest().body(error);
    }
}
```

## Database Patterns

### 1. Repository Pattern
```javascript
// User Repository
class UserRepository {
  constructor(database) {
    this.db = database;
  }
  
  async findById(id) {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await this.db.query(query, [id]);
    return result.rows[0];
  }
  
  async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await this.db.query(query, [email]);
    return result.rows[0];
  }
  
  async create(userData) {
    const { email, password_hash, name } = userData;
    const query = `
      INSERT INTO users (email, password_hash, name) 
      VALUES ($1, $2, $3) 
      RETURNING *
    `;
    const result = await this.db.query(query, [email, password_hash, name]);
    return result.rows[0];
  }
  
  async update(id, userData) {
    const fields = Object.keys(userData);
    const values = Object.values(userData);
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    
    const query = `
      UPDATE users 
      SET ${setClause}, updated_at = NOW()
      WHERE id = $1 
      RETURNING *
    `;
    const result = await this.db.query(query, [id, ...values]);
    return result.rows[0];
  }
  
  async delete(id) {
    const query = 'DELETE FROM users WHERE id = $1 RETURNING *';
    const result = await this.db.query(query, [id]);
    return result.rows[0];
  }
}
```

### 2. Active Record Pattern
```javascript
// User Model with Active Record
class User extends Model {
  static get tableName() {
    return 'users';
  }
  
  static get jsonSchema() {
    return {
      type: 'object',
      required: ['email', 'password_hash'],
      properties: {
        id: { type: 'integer' },
        email: { type: 'string', format: 'email' },
        password_hash: { type: 'string' },
        name: { type: 'string' },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' }
      }
    };
  }
  
  async $beforeInsert() {
    this.created_at = new Date().toISOString();
    this.updated_at = new Date().toISOString();
  }
  
  async $beforeUpdate() {
    this.updated_at = new Date().toISOString();
  }
  
  static get relationMappings() {
    return {
      orders: {
        relation: Model.HasManyRelation,
        modelClass: Order,
        join: {
          from: 'users.id',
          to: 'orders.user_id'
        }
      }
    };
  }
}
```

## API Documentation

### 1. OpenAPI Specification
```yaml
openapi: 3.0.0
info:
  title: User Management API
  version: 1.0.0
  description: API for managing users

paths:
  /users:
    post:
      summary: Create a new user
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UserCreate'
      responses:
        '201':
          description: User created successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        '400':
          description: Invalid input
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /users/{id}:
    get:
      summary: Get user by ID
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
      responses:
        '200':
          description: User found
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        '404':
          description: User not found

components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: integer
        email:
          type: string
          format: email
        name:
          type: string
        created_at:
          type: string
          format: date-time
    
    UserCreate:
      type: object
      required:
        - email
        - password
      properties:
        email:
          type: string
          format: email
        password:
          type: string
          minLength: 8
        name:
          type: string
    
    Error:
      type: object
      properties:
        code:
          type: string
        message:
          type: string
        details:
          type: array
          items:
            type: object
```

## Message Queue Patterns

### 1. Redis Queue
```javascript
const Queue = require('bull');
const redis = require('redis');

// Create queue
const emailQueue = new Queue('email processing', {
  redis: {
    host: 'localhost',
    port: 6379
  }
});

// Producer - Add jobs to queue
const sendWelcomeEmail = async (userId) => {
  await emailQueue.add('send-welcome-email', {
    userId,
    template: 'welcome'
  }, {
    delay: 5000, // 5 second delay
    attempts: 3,
    backoff: 'exponential'
  });
};

// Consumer - Process jobs
emailQueue.process('send-welcome-email', async (job) => {
  const { userId, template } = job.data;
  
  try {
    const user = await getUserById(userId);
    await emailService.send(user.email, template);
    
    job.progress(100);
  } catch (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }
});

// Event handlers
emailQueue.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});

emailQueue.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed: ${err.message}`);
});
```

### 2. RabbitMQ
```javascript
const amqp = require('amqplib');

class RabbitMQService {
  constructor() {
    this.connection = null;
    this.channel = null;
  }
  
  async connect() {
    this.connection = await amqp.connect('amqp://localhost');
    this.channel = await this.connection.createChannel();
  }
  
  async publishToQueue(queue, message) {
    await this.channel.assertQueue(queue, { durable: true });
    
    const buffer = Buffer.from(JSON.stringify(message));
    await this.channel.sendToQueue(queue, buffer, { persistent: true });
  }
  
  async consumeFromQueue(queue, callback) {
    await this.channel.assertQueue(queue, { durable: true });
    await this.channel.prefetch(1);
    
    await this.channel.consume(queue, async (msg) => {
      if (msg) {
        try {
          const content = JSON.parse(msg.content.toString());
          await callback(content);
          this.channel.ack(msg);
        } catch (error) {
          console.error('Error processing message:', error);
          this.channel.nack(msg, false, false);
        }
      }
    });
  }
}
```

## Caching Strategies

### 1. Redis Caching
```javascript
const redis = require('redis');
const client = redis.createClient();

// Cache aside pattern
const getUserFromCache = async (userId) => {
  const cacheKey = `user:${userId}`;
  const cached = await client.get(cacheKey);
  
  if (cached) {
    return JSON.parse(cached);
  }
  
  // Fetch from database
  const user = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
  
  // Cache for 1 hour
  await client.setex(cacheKey, 3600, JSON.stringify(user));
  
  return user;
};

// Cache invalidation
const invalidateUserCache = async (userId) => {
  const cacheKey = `user:${userId}`;
  await client.del(cacheKey);
};

// Write-through cache
const updateUser = async (userId, userData) => {
  const user = await db.query(
    'UPDATE users SET name = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
    [userData.name, userId]
  );
  
  // Update cache
  const cacheKey = `user:${userId}`;
  await client.setex(cacheKey, 3600, JSON.stringify(user));
  
  return user;
};
```

### 2. Application-Level Caching
```javascript
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 600 }); // 10 minutes default TTL

// Memory cache with TTL
const getCachedData = (key) => {
  return cache.get(key);
};

const setCachedData = (key, data, ttl = 600) => {
  cache.set(key, data, ttl);
};

// Cache with callback
const getOrSetCache = async (key, callback, ttl = 600) => {
  let data = cache.get(key);
  
  if (!data) {
    data = await callback();
    cache.set(key, data, ttl);
  }
  
  return data;
};
```

## Performance Monitoring

### 1. Application Metrics
```javascript
const promClient = require('prom-client');

// Create metrics
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code']
});

const httpRequestsTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

// Middleware to track metrics
const metricsMiddleware = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const labels = {
      method: req.method,
      route: req.route?.path || req.path,
      status_code: res.statusCode
    };
    
    httpRequestDuration.labels(labels).observe(duration);
    httpRequestsTotal.labels(labels).inc();
  });
  
  next();
};

// Metrics endpoint
app.get('/metrics', (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(promClient.register.metrics());
});
```

### 2. Database Query Monitoring
```javascript
const { Pool } = require('pg');

class MonitoredPool extends Pool {
  async query(text, params) {
    const start = Date.now();
    
    try {
      const result = await super.query(text, params);
      const duration = Date.now() - start;
      
      // Log slow queries
      if (duration > 1000) {
        console.warn(`Slow query (${duration}ms):`, text);
      }
      
      return result;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }
}

const pool = new MonitoredPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});
```

## Common Patterns and Solutions

### 1. Circuit Breaker Pattern
```javascript
class CircuitBreaker {
  constructor(threshold = 5, timeout = 60000) {
    this.threshold = threshold;
    this.timeout = timeout;
    this.failures = 0;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.nextAttempt = Date.now();
  }
  
  async execute(fn) {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        throw new Error('Circuit breaker is OPEN');
      }
      this.state = 'HALF_OPEN';
    }
    
    try {
      const result = await fn();
      this.reset();
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }
  
  recordFailure() {
    this.failures++;
    if (this.failures >= this.threshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.timeout;
    }
  }
  
  reset() {
    this.failures = 0;
    this.state = 'CLOSED';
  }
}
```

### 2. Retry Pattern
```javascript
const retry = async (fn, maxRetries = 3, delay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
};

// Usage
const result = await retry(async () => {
  return await externalAPICall();
}, 3, 1000);
```