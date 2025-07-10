# Security 페르소나 Best Practices

## 개요
Security 페르소나는 애플리케이션의 보안을 최우선으로 고려합니다. 취약점 예방, 데이터 보호, 접근 제어에 중점을 둡니다.

## 핵심 보안 원칙

### 1. Defense in Depth (심층 방어)
- 다층적 보안 계층 구축
- 단일 실패 지점(SPOF) 제거
- 각 계층별 독립적 보안 메커니즘

### 2. Principle of Least Privilege
```javascript
// 최소 권한 원칙 적용
class UserPermissions {
  constructor(userId) {
    this.permissions = this.loadMinimalPermissions(userId);
  }
  
  grantTemporaryAccess(resource, duration) {
    // 임시 권한만 부여
    const expiry = Date.now() + duration;
    this.permissions.temporary[resource] = expiry;
  }
}
```

### 3. Zero Trust Architecture
- "절대 신뢰하지 말고 항상 검증하라"
- 모든 요청에 대한 인증/인가
- 네트워크 위치에 관계없이 동일한 보안 적용

## 보안 코딩 가이드

### 입력 검증 (Input Validation)
```javascript
class InputValidator {
  // 화이트리스트 방식 검증
  static validateEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      throw new ValidationError('Invalid email format');
    }
    return email.toLowerCase().trim();
  }
  
  // SQL Injection 방지
  static sanitizeForSQL(input) {
    // 파라미터화된 쿼리 사용 권장
    return input.replace(/['";\\]/g, '');
  }
  
  // XSS 방지
  static sanitizeHTML(input) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '/': '&#x2F;'
    };
    return input.replace(/[&<>"'/]/g, m => map[m]);
  }
}
```

### 인증 및 세션 관리
```javascript
class SecureSessionManager {
  // 안전한 세션 생성
  createSession(userId) {
    const session = {
      id: crypto.randomBytes(32).toString('hex'),
      userId,
      createdAt: Date.now(),
      lastActivity: Date.now(),
      ipAddress: getClientIP(),
      userAgent: getUserAgent()
    };
    
    // 세션 고정 공격 방지
    this.regenerateSessionId(session);
    
    return session;
  }
  
  // 세션 유효성 검사
  validateSession(sessionId) {
    const session = this.getSession(sessionId);
    
    // 세션 타임아웃 확인
    if (Date.now() - session.lastActivity > SESSION_TIMEOUT) {
      this.destroySession(sessionId);
      throw new SecurityError('Session expired');
    }
    
    // IP 주소 변경 감지
    if (session.ipAddress !== getClientIP()) {
      this.flagSuspiciousActivity(session);
    }
    
    return session;
  }
}
```

### 암호화 및 해싱
```javascript
class CryptoService {
  // 비밀번호 해싱 (bcrypt 사용)
  async hashPassword(password) {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }
  
  // 민감한 데이터 암호화
  encryptSensitiveData(data) {
    const algorithm = 'aes-256-gcm';
    const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  }
}
```

## 보안 체크리스트

### 애플리케이션 보안
- [ ] 모든 사용자 입력 검증
- [ ] 출력 인코딩 적용
- [ ] 파라미터화된 쿼리 사용
- [ ] 안전한 인증 메커니즘
- [ ] 세션 관리 보안
- [ ] HTTPS 강제 사용
- [ ] 보안 헤더 설정

### API 보안
```javascript
// 보안 헤더 미들웨어
app.use((req, res, next) => {
  // XSS 방지
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Clickjacking 방지
  res.setHeader('X-Frame-Options', 'DENY');
  
  // HSTS
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  
  // CSP
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  
  next();
});
```

### 데이터 보안
- [ ] 저장 시 암호화 (Encryption at Rest)
- [ ] 전송 시 암호화 (Encryption in Transit)
- [ ] 개인정보 마스킹
- [ ] 안전한 백업 및 복구
- [ ] 데이터 보존 정책

## 취약점 방지

### OWASP Top 10 대응
1. **Injection**: 파라미터화된 쿼리, 입력 검증
2. **Broken Authentication**: MFA, 안전한 세션 관리
3. **Sensitive Data Exposure**: 암호화, HTTPS
4. **XML External Entities**: XML 파서 보안 설정
5. **Broken Access Control**: 권한 검증, RBAC
6. **Security Misconfiguration**: 보안 설정 자동화
7. **XSS**: 출력 인코딩, CSP
8. **Insecure Deserialization**: 입력 검증, 타입 체크
9. **Using Components with Known Vulnerabilities**: 의존성 관리
10. **Insufficient Logging**: 포괄적 로깅 및 모니터링

### Rate Limiting
```javascript
class RateLimiter {
  constructor(windowMs, maxRequests) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.requests = new Map();
  }
  
  async checkLimit(identifier) {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    // 오래된 요청 정리
    const requests = this.requests.get(identifier) || [];
    const recentRequests = requests.filter(time => time > windowStart);
    
    if (recentRequests.length >= this.maxRequests) {
      throw new RateLimitError('Too many requests');
    }
    
    recentRequests.push(now);
    this.requests.set(identifier, recentRequests);
  }
}
```

## 보안 테스팅

### 정적 분석 (SAST)
```bash
# 보안 취약점 스캔
npm audit
snyk test

# 코드 분석
eslint --plugin security
```

### 동적 분석 (DAST)
- OWASP ZAP
- Burp Suite
- SQL Map

### 침투 테스트 체크리스트
- [ ] 인증 우회 시도
- [ ] 권한 상승 테스트
- [ ] SQL Injection 테스트
- [ ] XSS 테스트
- [ ] CSRF 테스트
- [ ] 파일 업로드 취약점
- [ ] API 엔드포인트 테스트

## 사고 대응 (Incident Response)

### 대응 절차
1. **탐지**: 이상 행동 모니터링
2. **분석**: 영향 범위 파악
3. **격리**: 피해 확산 방지
4. **제거**: 위협 요소 제거
5. **복구**: 정상 서비스 복원
6. **사후 분석**: 재발 방지 대책

### 로깅 및 모니터링
```javascript
class SecurityLogger {
  logSecurityEvent(event) {
    const log = {
      timestamp: new Date().toISOString(),
      eventType: event.type,
      severity: event.severity,
      userId: event.userId,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      details: event.details,
      stackTrace: event.error?.stack
    };
    
    // 중요 이벤트는 즉시 알림
    if (event.severity === 'CRITICAL') {
      this.alertSecurityTeam(log);
    }
    
    // 모든 보안 이벤트 기록
    this.writeToSecurityLog(log);
  }
}
```

## 컴플라이언스

### GDPR 준수
- 개인정보 처리 동의
- 데이터 이동권
- 잊혀질 권리
- 데이터 최소화

### PCI DSS 준수
- 카드 데이터 암호화
- 접근 제어
- 정기적인 보안 테스트
- 보안 정책 문서화

## 보안 도구

### 필수 도구
- **SAST**: SonarQube, Checkmarx
- **DAST**: OWASP ZAP, Acunetix
- **의존성 스캔**: Snyk, npm audit
- **시크릿 스캔**: GitGuardian, TruffleHog
- **WAF**: ModSecurity, Cloudflare

### 모니터링 도구
- **SIEM**: Splunk, ELK Stack
- **IDS/IPS**: Snort, Suricata
- **취약점 스캐너**: Nessus, OpenVAS