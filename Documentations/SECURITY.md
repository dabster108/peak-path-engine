# 🔒 Security Hardening Guide

## Security Checklist for Production

### 🔐 Secrets & Credentials

- [ ] Generate strong `SECRET_KEY`
  ```bash
  python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
  ```
- [ ] Store all secrets in `.env` (never in code)
- [ ] Use `.env.example` as template (without secrets)
- [ ] Add `.env` to `.gitignore`
- [ ] Rotate credentials regularly
- [ ] Use GitHub Secrets for CI/CD
- [ ] Use managed secrets service (AWS Secrets Manager, GCP Secret Manager)

### 🔐 Authentication & Authorization

- [ ] **Strong Passwords Required**
  ```python
  AUTH_PASSWORD_VALIDATORS = [
      'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
      'django.contrib.auth.password_validation.MinimumLengthValidator',
      'django.contrib.auth.password_validation.CommonPasswordValidator',
      'django.contrib.auth.password_validation.NumericPasswordValidator',
  ]
  PASSWORD_MIN_LENGTH = 12
  ```

- [ ] **JWT Token Security**
  ```python
  SIMPLE_JWT = {
      'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),  # Short-lived
      'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
      'ROTATE_REFRESH_TOKENS': True,  # Invalidate old refresh tokens
      'BLACKLIST_AFTER_ROTATION': True,  # Blacklist old tokens
      'ALGORITHM': 'HS256',
  }
  ```

- [ ] **HTTPS/SSL Enforcement**
  ```python
  SECURE_SSL_REDIRECT = True
  SESSION_COOKIE_SECURE = True
  CSRF_COOKIE_SECURE = True
  SECURE_HSTS_SECONDS = 31536000  # 1 year
  SECURE_HSTS_INCLUDE_SUBDOMAINS = True
  SECURE_HSTS_PRELOAD = True
  ```

- [ ] **CORS Configuration** (Whitelist only trusted origins)
  ```python
  CORS_ALLOWED_ORIGINS = [
      "https://yourdomain.com",
      "https://www.yourdomain.com",
  ]
  ```

- [ ] **Security Headers**
  ```python
  MIDDLEWARE += [
      'django.middleware.security.SecurityMiddleware',
  ]
  
  SECURE_CONTENT_SECURITY_POLICY = {
      "default-src": ("'self'",),
      "script-src": ("'self'", "trusted-cdn.com"),
      "style-src": ("'self'", "'unsafe-inline'"),
      "img-src": ("'self'", "data:", "https:"),
  }
  
  SECURE_BROWSER_XSS_FILTER = True
  SECURE_CONTENT_TYPE_NOSNIFF = True
  X_FRAME_OPTIONS = 'DENY'
  ```

### 🔐 Database Security

- [ ] **Use PostgreSQL** (not SQLite)
- [ ] **Strong Database Passwords**
  ```bash
  # Generate strong password
  head -c 32 /dev/urandom | base64
  ```

- [ ] **Principle of Least Privilege**
  ```sql
  -- Create limited user
  CREATE USER app_user WITH PASSWORD 'strong_password';
  GRANT CONNECT ON DATABASE shikharoutdoor TO app_user;
  GRANT USAGE ON SCHEMA public TO app_user;
  GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
  
  -- Don't grant superuser or backslash commands
  ```

- [ ] **Encrypted Connections**
  ```env
  # Use SSL for database connections
  DATABASE_URL=postgresql+psycopg://user:pass@host:5432/db?sslmode=require
  ```

- [ ] **Database Backup Encryption**
  ```bash
  # Encrypted backup
  pg_dump -U postgres shikharoutdoor | openssl enc -aes-256-cbc -out backup.sql.enc
  
  # Restore encrypted backup
  openssl enc -d -aes-256-cbc -in backup.sql.enc | psql -U postgres shikharoutdoor
  ```

### 🔐 File Upload Security

- [ ] **Whitelist Allowed File Types**
  ```python
  ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
  MAX_UPLOAD_SIZE = 5 * 1024 * 1024  # 5MB
  ```

- [ ] **Store Uploads Outside Web Root**
  ```python
  MEDIA_ROOT = '/var/www/media'  # Not in public directory
  ```

- [ ] **Use S3 for Production Files**
  ```python
  if not DEBUG:
      DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
  ```

- [ ] **Virus Scanning** (for malware)
  ```python
  # Consider using ClamAV or similar
  ```

### 🔐 API Security

- [ ] **Input Validation**
  ```python
  # All serializers validate inputs
  class ProductSerializer(serializers.ModelSerializer):
      price = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=0)
  ```

- [ ] **Rate Limiting** (prevent abuse)
  ```python
  # Install django-ratelimit
  from django_ratelimit.decorators import ratelimit
  
  @ratelimit(key='ip', rate='5/m', method='POST')  # 5 per minute
  def login(request):
      pass
  ```

- [ ] **API Key Rotation** (if applicable)
  - Document rotation schedule
  - Support multiple keys during rotation
  - Implement key versioning

- [ ] **Disable Debug Toolbar in Production**
  ```python
  if DEBUG:
      INSTALLED_APPS += ['debug_toolbar']
  ```

### 🔐 Frontend Security

- [ ] **Content Security Policy** (CSP)
  ```html
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'">
  ```

- [ ] **X-XSS-Protection Header**
  ```python
  # Django automatically adds this
  SECURE_BROWSER_XSS_FILTER = True
  ```

- [ ] **Secure Cookies**
  ```python
  SESSION_COOKIE_SECURE = True
  SESSION_COOKIE_HTTPONLY = True
  SESSION_COOKIE_SAMESITE = 'Strict'
  ```

- [ ] **HttpOnly Tokens** (not localStorage)
  ```python
  # Consider using HttpOnly cookies instead of localStorage for tokens
  # This prevents XSS attacks from stealing tokens
  ```

### 🔐 Infrastructure Security

- [ ] **Network Segmentation**
  - Database not accessible from internet
  - Redis only accessible to app servers
  - Admin endpoints protected

- [ ] **Firewall Rules**
  ```
  - Allow: 443 (HTTPS) from anywhere
  - Allow: 80 (HTTP) from anywhere → redirect to HTTPS
  - Allow: 22 (SSH) from authorized IPs only
  - Deny: Database ports from internet
  - Deny: Admin panels from internet (use VPN)
  ```

- [ ] **Always Use HTTPS**
  - Redirect HTTP to HTTPS
  - Use SSL/TLS certificates (Let's Encrypt)
  - Implement HSTS

- [ ] **VPN for Admin Access**
  - Access admin panel only via VPN
  - SSH access only via VPN/Bastion host

### 🔐 Monitoring & Logging

- [ ] **Error Tracking** (Sentry)
  ```python
  import sentry_sdk
  sentry_sdk.init(
      dsn=os.getenv('SENTRY_DSN'),
      traces_sample_rate=0.1,
      profiles_sample_rate=0.1,
  )
  ```

- [ ] **Audit Logging**
  ```python
  LOGGING = {
      'handlers': {
          'audit': {
              'class': 'logging.handlers.RotatingFileHandler',
              'filename': '/var/log/app/audit.log',
          }
      },
      'loggers': {
          'audit': {
              'handlers': ['audit'],
              'level': 'INFO',
          }
      }
  }
  ```

- [ ] **Monitor for Suspicious Activity**
  - Failed login attempts
  - Unusual API activity
  - Large data exports
  - Admin panel access

---

## Threat Model & Mitigations

### Threat: SQL Injection
- **Mitigation**: Use Django ORM (parameterized queries)
- **Test**: Verify with OWASP SQL injection tests

### Threat: Cross-Site Scripting (XSS)
- **Mitigation**: 
  - Never render unsafe user input
  - Use React (auto-escapes by default)
  - Implement CSP headers
- **Test**: Check with XSS payloads

### Threat: Cross-Site Request Forgery (CSRF)
- **Mitigation**: 
  - CSRF middleware enabled
  - CSRF tokens on forms
  - SameSite cookies
- **Test**: Verify CSRF protection

### Threat: Brute Force Attacks
- **Mitigation**:
  - Rate limiting on login
  - Account lockout after failed attempts
  - CAPTCHA on repeated failures
- **Monitor**: Track failed login attempts

### Threat: Data Breach
- **Mitigation**:
  - Encrypt sensitive data
  - Database encryption at rest
  - Regular backups with encryption
  - Access controls
- **Monitor**: Audit logs

### Threat: Man-in-the-Middle (MITM)
- **Mitigation**:
  - HTTPS everywhere
  - HSTS headers
  - Certificate pinning (optional)
  - TLS 1.2+

### Threat: Privilege Escalation
- **Mitigation**:
  - Role-based access control (RBAC)
  - Permissions checks on all endpoints
  - Admin endpoints require admin role
  - Audit admin actions
- **Test**: Try accessing endpoints as different users

### Threat: Information Disclosure
- **Mitigation**:
  - Debug mode off
  - Generic error messages
  - No stack traces in responses
  - No PII in logs

---

## Security Testing Checklist

### Manual Testing
- [ ] Test authentication bypass
- [ ] Test authorization bypass
- [ ] Test SQL injection
- [ ] Test XSS attacks
- [ ] Test CSRF attacks
- [ ] Test file upload attacks
- [ ] Test rate limiting
- [ ] Test privilege escalation

### Automated Testing
- [ ] OWASP ZAP scanning
- [ ] Bandit for Python code
- [ ] npm audit for JavaScript
- [ ] Security headers check

### Regular Audits
- [ ] Code review for security
- [ ] Dependency updates (security patches)
- [ ] Penetration testing
- [ ] Red team exercises

---

## Incident Response Plan

### 1. Detect & Alert
- Monitor error tracking (Sentry)
- Monitor authentication logs
- Monitor admin actions
- Set up alerts

### 2. Investigate
- Review logs
- Identify affected data
- Assess severity
- Document timeline

### 3. Contain
- Disable compromised accounts
- Revoke tokens
- Block IPs
- Enable maintenance mode if needed

### 4. Eradicate
- Remove malware
- Patch vulnerabilities
- Rotate compromised credentials
- Deploy fix

### 5. Recovery
- Restore from backups
- Verify integrity
- Re-enable systems
- Resume operations

### 6. Post-Incident
- Root cause analysis
- Implement preventive measures
- Update incident response plan
- Conduct security training

---

## Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Django Security Documentation](https://docs.djangoproject.com/en/6.0/topics/security/)
- [Django Security Releases](https://www.djangoproject.com/weblog/releases/security/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework/)
- [CWE/SANS Top 25](https://cwe.mitre.org/top25/)

---

## Security Contacts

- **Security Issues**: security@yourdomain.com
- **Incident Response**: response@yourdomain.com
- **Report Vulnerability**: https://yourdomain.com/security

Never post security issues publicly. Use responsible disclosure.

---

Last Updated: April 4, 2026
Review Frequency: Quarterly
