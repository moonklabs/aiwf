# Security 페르소나 Knowledge Base

## 보안 위협 백과사전

### 웹 애플리케이션 공격

#### 1. SQL Injection
```sql
-- 취약한 코드
SELECT * FROM users WHERE username = '$username' AND password = '$password';

-- 공격 예시
username: admin' OR '1'='1' --
password: anything

-- 방어 코드 (파라미터화된 쿼리)
const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
db.query(query, [username, password]);
```

#### 2. Cross-Site Scripting (XSS)
```javascript
// 저장형 XSS 방어
function sanitizeUserInput(input) {
  // DOMPurify 라이브러리 사용
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
    ALLOWED_ATTR: ['href']
  });
}

// 반사형 XSS 방어
function renderUserContent(content) {
  const div = document.createElement('div');
  div.textContent = content; // innerHTML 대신 textContent 사용
  return div;
}

// CSP 헤더 설정
Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-{random}';
```

#### 3. Cross-Site Request Forgery (CSRF)
```javascript
// CSRF 토큰 생성
class CSRFProtection {
  generateToken(sessionId) {
    const token = crypto.randomBytes(32).toString('hex');
    this.storeToken(sessionId, token);
    return token;
  }
  
  validateToken(sessionId, token) {
    const storedToken = this.getToken(sessionId);
    if (!storedToken || storedToken !== token) {
      throw new SecurityError('Invalid CSRF token');
    }
    // 토큰 재생성 (일회용)
    return this.generateToken(sessionId);
  }
}

// Double Submit Cookie Pattern
app.use((req, res, next) => {
  const token = req.cookies.csrfToken || crypto.randomBytes(32).toString('hex');
  res.cookie('csrfToken', token, { httpOnly: false, sameSite: 'strict' });
  req.csrfToken = token;
  next();
});
```

### 인증 및 권한 관리

#### OAuth 2.0 구현
```javascript
class OAuth2Provider {
  // Authorization Code Flow
  async authorize(clientId, redirectUri, scope) {
    // 1. 사용자 인증
    const user = await this.authenticateUser();
    
    // 2. 클라이언트 검증
    const client = await this.validateClient(clientId, redirectUri);
    
    // 3. 권한 부여 코드 생성
    const code = crypto.randomBytes(32).toString('hex');
    await this.storeAuthCode(code, {
      clientId,
      userId: user.id,
      scope,
      expiresAt: Date.now() + 600000 // 10분
    });
    
    return code;
  }
  
  // Token Exchange
  async exchangeToken(code, clientId, clientSecret) {
    const authCode = await this.getAuthCode(code);
    
    // 검증
    if (!authCode || authCode.clientId !== clientId) {
      throw new Error('Invalid authorization code');
    }
    
    if (Date.now() > authCode.expiresAt) {
      throw new Error('Authorization code expired');
    }
    
    // 토큰 생성
    const accessToken = this.generateJWT(authCode.userId, authCode.scope);
    const refreshToken = crypto.randomBytes(32).toString('hex');
    
    await this.storeRefreshToken(refreshToken, authCode.userId);
    await this.revokeAuthCode(code);
    
    return { accessToken, refreshToken };
  }
}
```

#### JWT 보안
```javascript
class SecureJWT {
  constructor() {
    this.algorithm = 'RS256'; // 비대칭 키 사용
    this.issuer = 'secure-app';
    this.audience = 'api.secure-app.com';
  }
  
  generateToken(payload) {
    const token = jwt.sign(payload, this.privateKey, {
      algorithm: this.algorithm,
      expiresIn: '15m', // 짧은 만료 시간
      issuer: this.issuer,
      audience: this.audience,
      jwtid: uuidv4() // 토큰 ID로 재사용 방지
    });
    
    return token;
  }
  
  verifyToken(token) {
    try {
      const decoded = jwt.verify(token, this.publicKey, {
        algorithms: [this.algorithm],
        issuer: this.issuer,
        audience: this.audience
      });
      
      // 토큰 블랙리스트 확인
      if (this.isBlacklisted(decoded.jti)) {
        throw new Error('Token revoked');
      }
      
      return decoded;
    } catch (error) {
      throw new SecurityError('Invalid token: ' + error.message);
    }
  }
}
```

### 암호화 알고리즘

#### 대칭키 암호화 (AES)
```javascript
class AESEncryption {
  constructor(key) {
    this.algorithm = 'aes-256-gcm';
    this.key = Buffer.from(key, 'hex');
  }
  
  encrypt(plaintext) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  }
  
  decrypt(encryptedData) {
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      this.key,
      Buffer.from(encryptedData.iv, 'hex')
    );
    
    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}
```

#### 비대칭키 암호화 (RSA)
```javascript
class RSAEncryption {
  generateKeyPair() {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
        cipher: 'aes-256-cbc',
        passphrase: process.env.KEY_PASSPHRASE
      }
    });
    
    return { publicKey, privateKey };
  }
  
  encrypt(data, publicKey) {
    const buffer = Buffer.from(data, 'utf8');
    const encrypted = crypto.publicEncrypt(
      {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256'
      },
      buffer
    );
    
    return encrypted.toString('base64');
  }
  
  decrypt(encryptedData, privateKey) {
    const buffer = Buffer.from(encryptedData, 'base64');
    const decrypted = crypto.privateDecrypt(
      {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
        passphrase: process.env.KEY_PASSPHRASE
      },
      buffer
    );
    
    return decrypted.toString('utf8');
  }
}
```

### 네트워크 보안

#### TLS/SSL 설정
```javascript
// HTTPS 서버 설정
const https = require('https');
const tls = require('tls');

const options = {
  key: fs.readFileSync('private-key.pem'),
  cert: fs.readFileSync('certificate.pem'),
  
  // 보안 강화 설정
  secureOptions: tls.constants.SSL_OP_NO_TLSv1 | 
                 tls.constants.SSL_OP_NO_TLSv1_1,
  ciphers: [
    'ECDHE-RSA-AES128-GCM-SHA256',
    'ECDHE-RSA-AES256-GCM-SHA384',
    'ECDHE-RSA-AES128-SHA256',
    'ECDHE-RSA-AES256-SHA384'
  ].join(':'),
  honorCipherOrder: true,
  
  // HSTS
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
};

https.createServer(options, app).listen(443);
```

#### 방화벽 규칙
```bash
# iptables 기본 정책
iptables -P INPUT DROP
iptables -P FORWARD DROP
iptables -P OUTPUT ACCEPT

# 필요한 포트만 열기
iptables -A INPUT -p tcp --dport 443 -j ACCEPT  # HTTPS
iptables -A INPUT -p tcp --dport 22 -j ACCEPT   # SSH (IP 제한 권장)

# DDoS 방어
iptables -A INPUT -p tcp --syn -m limit --limit 25/s --limit-burst 50 -j ACCEPT
```

### 보안 모니터링

#### 이상 탐지 시스템
```javascript
class AnomalyDetector {
  constructor() {
    this.baseline = new Map();
    this.threshold = 2.5; // 표준편차 배수
  }
  
  // 사용자 행동 분석
  analyzeUserBehavior(userId, action) {
    const userBaseline = this.baseline.get(userId) || {
      loginTimes: [],
      ipAddresses: new Set(),
      requestRate: []
    };
    
    // 로그인 시간 이상 탐지
    if (action.type === 'login') {
      const hour = new Date(action.timestamp).getHours();
      const avgHour = average(userBaseline.loginTimes);
      const stdDev = standardDeviation(userBaseline.loginTimes);
      
      if (Math.abs(hour - avgHour) > stdDev * this.threshold) {
        this.alertSuspiciousLogin(userId, action);
      }
    }
    
    // IP 주소 변경 탐지
    if (!userBaseline.ipAddresses.has(action.ipAddress)) {
      this.alertNewLocation(userId, action);
    }
    
    // 요청 빈도 이상 탐지
    const requestsPerMinute = this.calculateRequestRate(userId);
    if (requestsPerMinute > userBaseline.avgRate * this.threshold) {
      this.alertHighRequestRate(userId, requestsPerMinute);
    }
  }
}
```

#### 보안 이벤트 상관 분석
```javascript
class SecurityEventCorrelator {
  correlateEvents(events) {
    const patterns = {
      bruteForce: this.detectBruteForce(events),
      privilegeEscalation: this.detectPrivilegeEscalation(events),
      dataExfiltration: this.detectDataExfiltration(events),
      lateralMovement: this.detectLateralMovement(events)
    };
    
    return patterns;
  }
  
  detectBruteForce(events) {
    const failedLogins = events.filter(e => 
      e.type === 'login_failed' && 
      e.timestamp > Date.now() - 300000 // 5분
    );
    
    const attempts = {};
    failedLogins.forEach(event => {
      const key = `${event.username}:${event.ipAddress}`;
      attempts[key] = (attempts[key] || 0) + 1;
    });
    
    return Object.entries(attempts)
      .filter(([_, count]) => count > 5)
      .map(([key, count]) => ({
        type: 'brute_force',
        target: key.split(':')[0],
        source: key.split(':')[1],
        attempts: count
      }));
  }
}
```

### 컴플라이언스 구현

#### GDPR 데이터 처리
```javascript
class GDPRCompliance {
  // 동의 관리
  async recordConsent(userId, purposes) {
    const consent = {
      userId,
      purposes,
      timestamp: new Date().toISOString(),
      ipAddress: getClientIP(),
      version: 'v1.2'
    };
    
    await this.store.saveConsent(consent);
    return consent;
  }
  
  // 데이터 이동권
  async exportUserData(userId) {
    const data = {
      profile: await this.getUserProfile(userId),
      activities: await this.getUserActivities(userId),
      preferences: await this.getUserPreferences(userId),
      consents: await this.getUserConsents(userId)
    };
    
    // 민감한 정보 마스킹
    data.profile = this.maskSensitiveData(data.profile);
    
    return {
      exportDate: new Date().toISOString(),
      format: 'json',
      data: data
    };
  }
  
  // 삭제권 (잊혀질 권리)
  async deleteUserData(userId) {
    // 감사 로그 생성
    await this.auditLog.record({
      action: 'user_data_deletion',
      userId,
      timestamp: new Date().toISOString(),
      reason: 'GDPR Article 17 Request'
    });
    
    // 데이터 삭제 (보존 의무가 있는 데이터 제외)
    await Promise.all([
      this.deleteProfile(userId),
      this.deleteActivities(userId),
      this.deletePreferences(userId),
      this.anonymizeTransactions(userId)
    ]);
  }
}
```

### 보안 테스트 자동화

#### 취약점 스캐닝 스크립트
```javascript
class SecurityScanner {
  async runSecurityChecks() {
    const results = {
      timestamp: new Date().toISOString(),
      vulnerabilities: []
    };
    
    // 의존성 취약점 검사
    const npmAudit = await this.runNpmAudit();
    results.vulnerabilities.push(...npmAudit);
    
    // 보안 헤더 검사
    const headers = await this.checkSecurityHeaders();
    results.vulnerabilities.push(...headers);
    
    // SSL/TLS 설정 검사
    const ssl = await this.checkSSLConfiguration();
    results.vulnerabilities.push(...ssl);
    
    // 설정 파일 검사
    const config = await this.checkConfigurationFiles();
    results.vulnerabilities.push(...config);
    
    return results;
  }
  
  async checkSecurityHeaders() {
    const requiredHeaders = [
      'Strict-Transport-Security',
      'X-Frame-Options',
      'X-Content-Type-Options',
      'Content-Security-Policy',
      'X-XSS-Protection'
    ];
    
    const response = await fetch(this.targetUrl);
    const missing = requiredHeaders.filter(header => 
      !response.headers.has(header)
    );
    
    return missing.map(header => ({
      severity: 'medium',
      type: 'missing_security_header',
      details: `Missing header: ${header}`
    }));
  }
}