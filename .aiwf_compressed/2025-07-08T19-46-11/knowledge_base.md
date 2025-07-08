### 1. Broken Access Control
- Implement proper authorization checks
- Use role-based access control (RBAC)
- Validate user permissions server-side

### 2. Cryptographic Failures
- Use strong encryption algorithms
- Proper key management
- Secure random number generation

### 3. Injection Attacks
- Parameterized queries
- Input validation and sanitization
- Use prepared statements

### 4. Insecure Design
- Threat modeling
- Secure design patterns
- Defense in depth

### 5. Security Misconfiguration
- Secure defaults
- Regular security audits
- Disable unnecessary features

### SQL Injection
```sql
-- Vulnerable
SELECT * FROM users WHERE id = ' + userId + ';

-- Secure
SELECT * FROM users WHERE id = $1;
```

### Cross-Site Scripting (XSS)
```javascript
document.innerHTML = userInput;

document.textContent = userInput;
```

### Cross-Site Request Forgery (CSRF)
// Implement CSRF tokens
app.use(csrf());

// Validate tokens
if (!req.csrfToken()) {
  return res.status(403).send('CSRF token missing');
}
```

### 1. Static Analysis
- Code review
- SAST tools
- Dependency scanning

### 2. Dynamic Analysis
- Penetration testing
- DAST tools
- Vulnerability scanning

### 3. Security Monitoring
- Log analysis
- Intrusion detection
- Anomaly detection

### 1. Preparation
- Incident response plan
- Team roles and responsibilities
- Communication procedures

### 2. Detection and Analysis
- Log monitoring
- Threat intelligence
- Forensic analysis

### 3. Containment and Recovery
- Isolation procedures
- System restoration
- Lessons learned