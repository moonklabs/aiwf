# Backend 페르소나 Knowledge Base

## 서버 아키텍처 패턴

### Clean Architecture
```
┌─────────────────────────────────────┐
│          Controllers/Routes          │
├─────────────────────────────────────┤
│            Use Cases                 │
├─────────────────────────────────────┤
│          Domain/Entities             │
├─────────────────────────────────────┤
│    Data Access/Repositories          │
└─────────────────────────────────────┘
```

```javascript
// Domain Entity
class User {
  constructor(id, email, passwordHash) {
    this.id = id;
    this.email = email;
    this.passwordHash = passwordHash;
  }
  
  static create(email, password) {
    if (!this.isValidEmail(email)) {
      throw new DomainError('Invalid email format');
    }
    
    if (!this.isStrongPassword(password)) {
      throw new DomainError('Password does not meet requirements');
    }
    
    return new User(
      generateId(),
      email.toLowerCase(),
      hashPassword(password)
    );
  }
  
  static isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
  
  static isStrongPassword(password) {
    return password.length >= 8 &&
           /[A-Z]/.test(password) &&
           /[a-z]/.test(password) &&
           /[0-9]/.test(password);
  }
}

// Use Case
class RegisterUserUseCase {
  constructor(userRepository, emailService) {
    this.userRepository = userRepository;
    this.emailService = emailService;
  }
  
  async execute(request) {
    // 비즈니스 규칙 검증
    const existingUser = await this.userRepository.findByEmail(request.email);
    if (existingUser) {
      throw new ConflictError('Email already registered');
    }
    
    // 도메인 객체 생성
    const user = User.create(request.email, request.password);
    
    // 영속성 계층에 저장
    await this.userRepository.save(user);
    
    // 부가 작업
    await this.emailService.sendWelcomeEmail(user.email);
    
    return {
      id: user.id,
      email: user.email
    };
  }
}

// Repository Interface
class UserRepository {
  async save(user) {
    throw new Error('Method not implemented');
  }
  
  async findByEmail(email) {
    throw new Error('Method not implemented');
  }
  
  async findById(id) {
    throw new Error('Method not implemented');
  }
}

// Repository Implementation
class PostgresUserRepository extends UserRepository {
  constructor(db) {
    super();
    this.db = db;
  }
  
  async save(user) {
    const query = `
      INSERT INTO users (id, email, password_hash, created_at)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        password_hash = EXCLUDED.password_hash,
        updated_at = NOW()
      RETURNING *
    `;
    
    const result = await this.db.query(query, [
      user.id,
      user.email,
      user.passwordHash
    ]);
    
    return this.toDomainEntity(result.rows[0]);
  }
  
  async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await this.db.query(query, [email.toLowerCase()]);
    
    if (result.rows.length === 0) return null;
    return this.toDomainEntity(result.rows[0]);
  }
  
  toDomainEntity(row) {
    return new User(row.id, row.email, row.password_hash);
  }
}
```

### Event-Driven Architecture
```javascript
// Event Bus Implementation
class EventBus {
  constructor() {
    this.handlers = new Map();
    this.middlewares = [];
  }
  
  subscribe(eventType, handler) {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    
    this.handlers.get(eventType).push(handler);
    
    // Return unsubscribe function
    return () => {
      const handlers = this.handlers.get(eventType);
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    };
  }
  
  async publish(eventType, payload) {
    const event = {
      type: eventType,
      payload,
      timestamp: new Date().toISOString(),
      id: generateId()
    };
    
    // Apply middlewares
    for (const middleware of this.middlewares) {
      await middleware(event);
    }
    
    // Execute handlers
    const handlers = this.handlers.get(eventType) || [];
    const promises = handlers.map(handler => 
      this.executeHandler(handler, event)
    );
    
    await Promise.allSettled(promises);
  }
  
  async executeHandler(handler, event) {
    try {
      await handler(event);
    } catch (error) {
      console.error(`Handler error for ${event.type}:`, error);
      // Could publish error event here
    }
  }
  
  use(middleware) {
    this.middlewares.push(middleware);
  }
}

// Domain Events
class OrderCreatedEvent {
  constructor(order) {
    this.orderId = order.id;
    this.userId = order.userId;
    this.items = order.items;
    this.total = order.total;
    this.timestamp = new Date().toISOString();
  }
}

// Event Handlers
class EmailNotificationHandler {
  constructor(emailService, userRepository) {
    this.emailService = emailService;
    this.userRepository = userRepository;
  }
  
  async handleOrderCreated(event) {
    const user = await this.userRepository.findById(event.payload.userId);
    
    await this.emailService.send({
      to: user.email,
      subject: 'Order Confirmation',
      template: 'order-confirmation',
      data: {
        orderNumber: event.payload.orderId,
        items: event.payload.items,
        total: event.payload.total
      }
    });
  }
}

// Event Sourcing
class EventStore {
  constructor(db) {
    this.db = db;
  }
  
  async append(streamId, events) {
    const query = `
      INSERT INTO events (stream_id, event_type, payload, version, timestamp)
      VALUES ($1, $2, $3, $4, $5)
    `;
    
    const client = await this.db.connect();
    try {
      await client.query('BEGIN');
      
      for (const event of events) {
        await client.query(query, [
          streamId,
          event.type,
          JSON.stringify(event.payload),
          event.version,
          event.timestamp
        ]);
      }
      
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
  
  async getEvents(streamId, fromVersion = 0) {
    const query = `
      SELECT * FROM events 
      WHERE stream_id = $1 AND version > $2
      ORDER BY version ASC
    `;
    
    const result = await this.db.query(query, [streamId, fromVersion]);
    
    return result.rows.map(row => ({
      type: row.event_type,
      payload: row.payload,
      version: row.version,
      timestamp: row.timestamp
    }));
  }
}
```

## 데이터베이스 패턴

### Repository Pattern with Unit of Work
```javascript
// Unit of Work
class UnitOfWork {
  constructor(db) {
    this.db = db;
    this.client = null;
    this.repositories = new Map();
  }
  
  async begin() {
    this.client = await this.db.connect();
    await this.client.query('BEGIN');
  }
  
  async commit() {
    if (!this.client) {
      throw new Error('No transaction in progress');
    }
    
    await this.client.query('COMMIT');
    this.client.release();
    this.client = null;
  }
  
  async rollback() {
    if (!this.client) {
      throw new Error('No transaction in progress');
    }
    
    await this.client.query('ROLLBACK');
    this.client.release();
    this.client = null;
  }
  
  getRepository(name, RepositoryClass) {
    if (!this.repositories.has(name)) {
      this.repositories.set(
        name, 
        new RepositoryClass(this.client || this.db)
      );
    }
    
    return this.repositories.get(name);
  }
}

// Usage
class OrderService {
  constructor(unitOfWork) {
    this.unitOfWork = unitOfWork;
  }
  
  async createOrder(orderData) {
    await this.unitOfWork.begin();
    
    try {
      const userRepo = this.unitOfWork.getRepository('user', UserRepository);
      const orderRepo = this.unitOfWork.getRepository('order', OrderRepository);
      const inventoryRepo = this.unitOfWork.getRepository('inventory', InventoryRepository);
      
      // Validate user
      const user = await userRepo.findById(orderData.userId);
      if (!user) throw new Error('User not found');
      
      // Check inventory
      for (const item of orderData.items) {
        const available = await inventoryRepo.checkAvailability(
          item.productId, 
          item.quantity
        );
        if (!available) {
          throw new Error(`Insufficient inventory for ${item.productId}`);
        }
      }
      
      // Create order
      const order = await orderRepo.create(orderData);
      
      // Update inventory
      for (const item of orderData.items) {
        await inventoryRepo.decrementStock(item.productId, item.quantity);
      }
      
      await this.unitOfWork.commit();
      return order;
    } catch (error) {
      await this.unitOfWork.rollback();
      throw error;
    }
  }
}
```

### Database Migration Management
```javascript
// Migration System
class MigrationRunner {
  constructor(db, migrationsPath) {
    this.db = db;
    this.migrationsPath = migrationsPath;
  }
  
  async run() {
    await this.ensureMigrationTable();
    
    const appliedMigrations = await this.getAppliedMigrations();
    const migrations = await this.loadMigrations();
    
    for (const migration of migrations) {
      if (!appliedMigrations.includes(migration.id)) {
        await this.applyMigration(migration);
      }
    }
  }
  
  async ensureMigrationTable() {
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id VARCHAR(255) PRIMARY KEY,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }
  
  async getAppliedMigrations() {
    const result = await this.db.query('SELECT id FROM migrations');
    return result.rows.map(row => row.id);
  }
  
  async loadMigrations() {
    const files = fs.readdirSync(this.migrationsPath);
    const migrations = [];
    
    for (const file of files) {
      if (file.endsWith('.js')) {
        const migration = require(path.join(this.migrationsPath, file));
        migrations.push({
          id: file,
          up: migration.up,
          down: migration.down
        });
      }
    }
    
    return migrations.sort((a, b) => a.id.localeCompare(b.id));
  }
  
  async applyMigration(migration) {
    const client = await this.db.connect();
    
    try {
      await client.query('BEGIN');
      
      console.log(`Applying migration: ${migration.id}`);
      await migration.up(client);
      
      await client.query(
        'INSERT INTO migrations (id) VALUES ($1)',
        [migration.id]
      );
      
      await client.query('COMMIT');
      console.log(`Migration ${migration.id} applied successfully`);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`Failed to apply migration ${migration.id}:`, error);
      throw error;
    } finally {
      client.release();
    }
  }
}

// Migration Example
// migrations/001_create_users_table.js
module.exports = {
  async up(db) {
    await db.query(`
      CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await db.query(`
      CREATE INDEX idx_users_email ON users(email);
      CREATE INDEX idx_users_created_at ON users(created_at);
    `);
  },
  
  async down(db) {
    await db.query('DROP TABLE IF EXISTS users');
  }
};
```

## API 패턴

### GraphQL DataLoader Pattern
```javascript
// DataLoader for N+1 query prevention
class UserLoader {
  constructor(userRepository) {
    this.userRepository = userRepository;
    this.loader = new DataLoader(
      keys => this.batchLoadUsers(keys),
      { cache: true }
    );
  }
  
  async batchLoadUsers(userIds) {
    const users = await this.userRepository.findByIds(userIds);
    
    // Map users to maintain order
    const userMap = new Map();
    users.forEach(user => userMap.set(user.id, user));
    
    return userIds.map(id => userMap.get(id) || null);
  }
  
  async load(userId) {
    return this.loader.load(userId);
  }
  
  async loadMany(userIds) {
    return this.loader.loadMany(userIds);
  }
  
  clearCache(userId) {
    this.loader.clear(userId);
  }
}

// GraphQL Resolvers with DataLoader
const resolvers = {
  Query: {
    user: async (parent, { id }, { dataloaders }) => {
      return dataloaders.user.load(id);
    },
    
    users: async (parent, args, { userRepository }) => {
      return userRepository.findAll(args);
    }
  },
  
  User: {
    orders: async (user, args, { dataloaders }) => {
      return dataloaders.ordersByUser.load(user.id);
    },
    
    profile: async (user, args, { dataloaders }) => {
      return dataloaders.profile.load(user.id);
    }
  },
  
  Order: {
    user: async (order, args, { dataloaders }) => {
      return dataloaders.user.load(order.userId);
    },
    
    items: async (order, args, { dataloaders }) => {
      return dataloaders.orderItems.load(order.id);
    }
  }
};

// Context Factory
function createGraphQLContext(req) {
  const repositories = {
    user: new UserRepository(db),
    order: new OrderRepository(db),
    profile: new ProfileRepository(db)
  };
  
  const dataloaders = {
    user: new UserLoader(repositories.user),
    ordersByUser: new OrdersByUserLoader(repositories.order),
    profile: new ProfileLoader(repositories.profile),
    orderItems: new OrderItemsLoader(repositories.order)
  };
  
  return {
    req,
    repositories,
    dataloaders,
    user: req.user // From auth middleware
  };
}
```

### REST API Versioning
```javascript
// API Version Management
class APIVersionManager {
  constructor() {
    this.versions = new Map();
  }
  
  register(version, routes) {
    this.versions.set(version, routes);
  }
  
  middleware() {
    return (req, res, next) => {
      // Extract version from header or URL
      const version = this.extractVersion(req);
      
      if (!this.versions.has(version)) {
        return res.status(400).json({
          error: 'Unsupported API version'
        });
      }
      
      req.apiVersion = version;
      next();
    };
  }
  
  extractVersion(req) {
    // Priority: Header > URL > Default
    if (req.headers['api-version']) {
      return req.headers['api-version'];
    }
    
    const urlMatch = req.path.match(/^\/api\/v(\d+)/);
    if (urlMatch) {
      return `v${urlMatch[1]}`;
    }
    
    return 'v1'; // Default version
  }
  
  getRouter(version) {
    return this.versions.get(version);
  }
}

// Version-specific implementations
// v1/users.js
const v1UserRoutes = {
  getUser: async (req, res) => {
    const user = await userService.findById(req.params.id);
    res.json({
      id: user.id,
      email: user.email,
      name: `${user.firstName} ${user.lastName}`
    });
  }
};

// v2/users.js
const v2UserRoutes = {
  getUser: async (req, res) => {
    const user = await userService.findById(req.params.id);
    res.json({
      id: user.id,
      email: user.email,
      profile: {
        firstName: user.firstName,
        lastName: user.lastName,
        displayName: user.displayName
      },
      preferences: user.preferences
    });
  }
};
```

## 성능 최적화

### Connection Pooling
```javascript
// Database Connection Pool
class DatabasePool {
  constructor(config) {
    this.config = config;
    this.pool = new Pool({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
      password: config.password,
      max: config.maxConnections || 20,
      idleTimeoutMillis: config.idleTimeout || 30000,
      connectionTimeoutMillis: config.connectionTimeout || 2000
    });
    
    // Connection lifecycle events
    this.pool.on('connect', (client) => {
      console.log('New client connected');
      client.query('SET search_path TO public');
    });
    
    this.pool.on('error', (err, client) => {
      console.error('Unexpected error on idle client', err);
    });
  }
  
  async query(text, params) {
    const start = Date.now();
    
    try {
      const result = await this.pool.query(text, params);
      const duration = Date.now() - start;
      
      // Log slow queries
      if (duration > 1000) {
        console.warn('Slow query detected:', {
          query: text,
          duration,
          rows: result.rowCount
        });
      }
      
      return result;
    } catch (error) {
      console.error('Query error:', error);
      throw error;
    }
  }
  
  async transaction(callback) {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
  
  async end() {
    await this.pool.end();
  }
}
```

### Caching Strategies
```javascript
// Multi-layer Cache
class CacheManager {
  constructor(memoryCache, redisCache) {
    this.L1 = memoryCache; // In-memory cache
    this.L2 = redisCache;  // Redis cache
  }
  
  async get(key, options = {}) {
    // Check L1 cache
    const l1Value = this.L1.get(key);
    if (l1Value !== undefined) {
      return l1Value;
    }
    
    // Check L2 cache
    const l2Value = await this.L2.get(key);
    if (l2Value !== null) {
      // Populate L1 cache
      this.L1.set(key, l2Value, options.ttl);
      return l2Value;
    }
    
    return null;
  }
  
  async set(key, value, options = {}) {
    // Set in both caches
    this.L1.set(key, value, options.ttl);
    await this.L2.set(key, value, options.ttl || 3600);
  }
  
  async invalidate(pattern) {
    // Clear from L1
    this.L1.clear(pattern);
    
    // Clear from L2
    await this.L2.invalidate(pattern);
  }
}

// Query Result Cache
class QueryCache {
  constructor(cache, db) {
    this.cache = cache;
    this.db = db;
  }
  
  async query(sql, params, options = {}) {
    const cacheKey = this.generateCacheKey(sql, params);
    
    // Try cache first
    const cached = await this.cache.get(cacheKey);
    if (cached && !options.skipCache) {
      return cached;
    }
    
    // Execute query
    const result = await this.db.query(sql, params);
    
    // Cache result
    if (options.cache !== false) {
      await this.cache.set(
        cacheKey,
        result.rows,
        options.ttl || 300
      );
    }
    
    return result.rows;
  }
  
  generateCacheKey(sql, params) {
    const hash = crypto
      .createHash('sha256')
      .update(sql + JSON.stringify(params))
      .digest('hex');
    
    return `query:${hash}`;
  }
  
  async invalidatePattern(table) {
    // Invalidate all queries related to a table
    await this.cache.invalidate(`query:*${table}*`);
  }
}
```

## 보안 구현

### OAuth 2.0 Server Implementation
```javascript
// OAuth 2.0 Authorization Server
class OAuth2Server {
  constructor(clientStore, tokenStore, userStore) {
    this.clientStore = clientStore;
    this.tokenStore = tokenStore;
    this.userStore = userStore;
  }
  
  // Authorization Code Grant
  async authorize(request) {
    const { 
      client_id, 
      redirect_uri, 
      response_type, 
      scope, 
      state 
    } = request.query;
    
    // Validate client
    const client = await this.clientStore.findById(client_id);
    if (!client) {
      throw new OAuth2Error('invalid_client');
    }
    
    // Validate redirect URI
    if (!client.redirectUris.includes(redirect_uri)) {
      throw new OAuth2Error('invalid_redirect_uri');
    }
    
    // Generate authorization code
    const code = crypto.randomBytes(32).toString('hex');
    
    await this.tokenStore.saveAuthCode({
      code,
      clientId: client_id,
      userId: request.user.id,
      redirectUri: redirect_uri,
      scope: scope.split(' '),
      expiresAt: Date.now() + 600000 // 10 minutes
    });
    
    // Redirect with code
    const redirectUrl = new URL(redirect_uri);
    redirectUrl.searchParams.set('code', code);
    if (state) {
      redirectUrl.searchParams.set('state', state);
    }
    
    return redirectUrl.toString();
  }
  
  // Token Exchange
  async token(request) {
    const { grant_type } = request.body;
    
    switch (grant_type) {
      case 'authorization_code':
        return this.authorizationCodeGrant(request.body);
      case 'refresh_token':
        return this.refreshTokenGrant(request.body);
      case 'client_credentials':
        return this.clientCredentialsGrant(request.body);
      default:
        throw new OAuth2Error('unsupported_grant_type');
    }
  }
  
  async authorizationCodeGrant(params) {
    const { code, client_id, client_secret, redirect_uri } = params;
    
    // Validate client credentials
    const client = await this.clientStore.findById(client_id);
    if (!client || client.secret !== client_secret) {
      throw new OAuth2Error('invalid_client');
    }
    
    // Validate authorization code
    const authCode = await this.tokenStore.getAuthCode(code);
    if (!authCode || authCode.clientId !== client_id) {
      throw new OAuth2Error('invalid_grant');
    }
    
    if (Date.now() > authCode.expiresAt) {
      throw new OAuth2Error('invalid_grant', 'Code expired');
    }
    
    if (authCode.redirectUri !== redirect_uri) {
      throw new OAuth2Error('invalid_grant');
    }
    
    // Generate tokens
    const accessToken = this.generateAccessToken(
      authCode.userId,
      client_id,
      authCode.scope
    );
    
    const refreshToken = crypto.randomBytes(32).toString('hex');
    
    // Save tokens
    await this.tokenStore.saveTokens({
      accessToken: accessToken.token,
      refreshToken,
      userId: authCode.userId,
      clientId: client_id,
      scope: authCode.scope,
      accessTokenExpiresAt: accessToken.expiresAt,
      refreshTokenExpiresAt: Date.now() + 2592000000 // 30 days
    });
    
    // Revoke authorization code
    await this.tokenStore.revokeAuthCode(code);
    
    return {
      access_token: accessToken.token,
      token_type: 'Bearer',
      expires_in: 3600,
      refresh_token: refreshToken,
      scope: authCode.scope.join(' ')
    };
  }
  
  generateAccessToken(userId, clientId, scope) {
    const payload = {
      sub: userId,
      client: clientId,
      scope,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600
    };
    
    const token = jwt.sign(payload, process.env.JWT_SECRET);
    
    return {
      token,
      expiresAt: Date.now() + 3600000
    };
  }
}
```

### API Key Management
```javascript
// API Key Service
class APIKeyService {
  constructor(db, crypto) {
    this.db = db;
    this.crypto = crypto;
  }
  
  async generateAPIKey(userId, name, permissions = []) {
    // Generate secure random key
    const keyValue = this.generateSecureKey();
    const keyHash = await this.hashAPIKey(keyValue);
    
    // Store key metadata
    const apiKey = await this.db.query(`
      INSERT INTO api_keys 
      (user_id, name, key_hash, permissions, last_used_at)
      VALUES ($1, $2, $3, $4, NULL)
      RETURNING id, created_at
    `, [userId, name, keyHash, JSON.stringify(permissions)]);
    
    // Return key value only once
    return {
      id: apiKey.rows[0].id,
      key: `sk_live_${keyValue}`,
      name,
      permissions,
      createdAt: apiKey.rows[0].created_at
    };
  }
  
  generateSecureKey() {
    return crypto.randomBytes(32).toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }
  
  async hashAPIKey(key) {
    return crypto
      .createHash('sha256')
      .update(key)
      .digest('hex');
  }
  
  async validateAPIKey(keyValue) {
    // Extract actual key
    const key = keyValue.replace(/^sk_(live|test)_/, '');
    const keyHash = await this.hashAPIKey(key);
    
    // Find key in database
    const result = await this.db.query(`
      UPDATE api_keys 
      SET last_used_at = NOW(), usage_count = usage_count + 1
      WHERE key_hash = $1 AND revoked_at IS NULL
      RETURNING *
    `, [keyHash]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const apiKey = result.rows[0];
    
    // Check rate limits
    if (apiKey.rate_limit) {
      const rateLimitExceeded = await this.checkRateLimit(
        apiKey.id,
        apiKey.rate_limit
      );
      
      if (rateLimitExceeded) {
        throw new Error('Rate limit exceeded');
      }
    }
    
    return {
      id: apiKey.id,
      userId: apiKey.user_id,
      permissions: apiKey.permissions,
      rateLimit: apiKey.rate_limit
    };
  }
  
  async revokeAPIKey(keyId, userId) {
    const result = await this.db.query(`
      UPDATE api_keys 
      SET revoked_at = NOW()
      WHERE id = $1 AND user_id = $2 AND revoked_at IS NULL
      RETURNING id
    `, [keyId, userId]);
    
    return result.rows.length > 0;
  }
}
```