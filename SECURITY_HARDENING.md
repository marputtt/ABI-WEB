# Security Hardening Implementation Guide

## ✅ Priority Fixes Completed

### 1. GET Endpoint for CSRF Token Fetching ✓
- **Location:** `api.php:36-40` (updated)
- **Implementation:** GET requests now return CSRF tokens without requiring POST
- **Security:** Token generation and validation remain secure
- **Usage:** Frontend can fetch token via `GET /api.php`

### 2. Filesystem-Based Rate Limiting ✓
- **Location:** `api.php:87-147` (rewritten)
- **Implementation:** Rate limiting now uses filesystem storage keyed by `IP|User-Agent`
- **Storage:** `logs/rate_limits/` directory with JSON files
- **Benefits:** 
  - Attackers cannot bypass throttling by dropping cookies
  - Persistent across sessions
  - IP+UA combination provides better tracking

### 3. Removed 'unsafe-inline' from CSP ✓
- **Location:** `index.html:14-27` and `.htaccess:44-47`
- **Implementation:** Removed `'unsafe-inline'` from both CSP policies
- **Status:** Placeholder SRI hashes added - **ACTION REQUIRED** (see below)

### 4. Synced CSP Policies ✓
- **Location:** `index.html:16-26` and `.htaccess:47`
- **Implementation:** Both now use identical CSP directives
- **Fixed:** `connect-src` now allows `https://api.yourbackend.com` in both

### 5. Environment Variable Configuration ✓
- **Location:** `api.php:7-10, 43-52` (updated)
- **Implementation:** All secrets loaded from `config.php`
- **Benefits:**
  - No hardcoded credentials
  - Easy environment-specific configuration
  - Safe for version control

### 6. Server-Side Canonical Validation ✓
- **Location:** `api.php:124-177` (new function)
- **Implementation:** `validateInputCanonical()` replaces client-side sanitization
- **Security:** All input validated and sanitized server-side before use
- **Client-Side:** `script-secure.js` sanitization kept for UX only (documented)

### 7. Enhanced Logging with Anomaly Detection ✓
- **Location:** `api.php:214-252` (enhanced)
- **Implementation:** 
  - Per-request logging with IP, UA, method, URI
  - Anomaly detection for repeated failures
  - Alert logging to `logs/alerts.log`
- **Features:**
  - Tracks failure patterns by IP
  - Alerts after 3+ failures
  - Comprehensive request metadata

### 8. Additional Security Headers ✓
- **Location:** `api.php:12-18`
- **Headers Added:**
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: geolocation=(), microphone=(), camera=()`
  - Enhanced HSTS with preload

---

## ⚠️ Action Required Items

### 1. Generate and Update SRI Hashes

**Status:** Placeholder hashes added - **MUST BE REPLACED**

**Steps:**
1. Visit https://www.srihash.org/
2. For each CDN resource, generate SHA-384 hash:
   - `https://cdn.tailwindcss.com`
   - `https://unpkg.com/lucide@latest`
   - `https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css`
   - `https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js`
   - Google Fonts CSS (from the full URL)
3. Replace `REPLACE_WITH_SRI_HASH` in `index.html:34,38,39,42,44`

**Alternative for Tailwind:**
- Tailwind CDN is dynamic and problematic for SRI
- **Recommendation:** Replace with built Tailwind CSS file:
  ```bash
  npx tailwindcss -i ./src/input.css -o ./styles/tailwind.css --minify
  ```
  Then use the built file with SRI hash

### 2. Set File Permissions

**Required Permissions:**
```bash
# API file - readable by web server, not writable
chmod 640 api.php

# Config file - readable by web server only
chmod 600 config.php

# Logs directory - writable by web server, not publicly readable
chmod 750 logs/
chmod 640 logs/*.log
chmod 750 logs/rate_limits/

# Ensure logs directory is not web-accessible (already in .htaccess)
```

**Verification:**
```bash
ls -la api.php config.php logs/
```

### 3. Create Production Config

**Steps:**
1. Copy `config.example.php` to `config.php`
2. Create `.env` file with production values:
   ```env
   APP_NAME="ABI Website"
   APP_ENV=production
   APP_DEBUG=false
   APP_URL=https://yourdomain.com
   
   MAIL_FROM_ADDRESS=noreply@bumikarya.co.id
   MAIL_FROM_NAME="ABI Contact Form"
   MAIL_TO_ADDRESS=contact@bumikarya.co.id
   
   CSRF_SECRET=<generate-strong-secret>
   RATE_LIMIT_MAX_ATTEMPTS=5
   RATE_LIMIT_WINDOW=3600
   RATE_LIMIT_MIN_TIME=10
   
   ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
   ```
3. Update `config.php` if needed for custom settings
4. **NEVER commit** `.env` or `config.php` to Git

---

## 🔒 Hardening Improvements

### Server-Side Validation
- ✅ All input validated server-side via `validateInputCanonical()`
- ✅ Client-side sanitization documented as UX-only
- ✅ Email template uses pre-sanitized data only
- ✅ No XSS vectors in generated emails

### Rate Limiting
- ✅ Filesystem-based (persistent across sessions)
- ✅ IP + User-Agent keyed (prevents cookie-based bypass)
- ✅ Automatic cleanup of old entries
- ✅ Per-request logging of rate limit violations

### Logging & Monitoring
- ✅ Comprehensive security logging
- ✅ Anomaly detection for repeated failures
- ✅ Alert system for suspicious patterns
- ✅ Per-request metadata (IP, UA, method, URI)

### Configuration Security
- ✅ Environment variables via `.env`
- ✅ Config loaded from `config.php`
- ✅ No hardcoded secrets
- ✅ Safe for version control

---

## 📋 Testing Checklist

### CSRF Token Fetching
- [ ] GET `/api.php` returns valid CSRF token
- [ ] Token can be used in subsequent POST request
- [ ] Invalid tokens are rejected

### Rate Limiting
- [ ] Multiple requests from same IP are throttled
- [ ] Rate limit persists after clearing cookies
- [ ] Rate limit files created in `logs/rate_limits/`
- [ ] Old entries are automatically cleaned

### CSP & SRI
- [ ] All CDN resources load with SRI hashes
- [ ] No inline scripts/styles (or properly nonced)
- [ ] CSP violations logged in browser console
- [ ] Test with CSP evaluator: https://csp-evaluator.withgoogle.com/

### Configuration
- [ ] `config.php` loads from `.env`
- [ ] Email settings come from config
- [ ] Rate limit settings come from config
- [ ] CORS origins configurable

### Server-Side Validation
- [ ] Malicious input blocked server-side
- [ ] XSS attempts in email template prevented
- [ ] Input sanitized before email generation
- [ ] Validation errors returned to client

### Logging
- [ ] Security events logged to `logs/security.log`
- [ ] Alerts generated for repeated failures
- [ ] Logs rotated regularly
- [ ] Log directory not web-accessible

---

## 🔍 Security Scanning Tools

### Recommended Tools:
1. **Mozilla Observatory**
   - URL: https://observatory.mozilla.org/
   - Tests: Security headers, CSP, HSTS

2. **OWASP ZAP**
   - Download: https://www.zaproxy.org/
   - Tests: Rate limiting, CSRF, injection attacks

3. **Security Headers**
   - URL: https://securityheaders.com/
   - Tests: Header configuration

4. **CSP Evaluator**
   - URL: https://csp-evaluator.withgoogle.com/
   - Tests: CSP policy effectiveness

### Automated Scanning:
```bash
# Add to CI/CD pipeline
npm install -g @mozilla/observatory-cli
observatory --url https://yourdomain.com

# OWASP ZAP baseline scan
docker run -t owasp/zap2docker-stable zap-baseline.py -t https://yourdomain.com
```

---

## 📝 Configuration Reference

### Environment Variables (.env)
```env
# Application
APP_NAME=ABI Website
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.com

# Email
MAIL_FROM_ADDRESS=noreply@bumikarya.co.id
MAIL_FROM_NAME=ABI Contact Form
MAIL_TO_ADDRESS=contact@bumikarya.co.id

# Security
CSRF_SECRET=<generate-strong-secret>
RATE_LIMIT_MAX_ATTEMPTS=5
RATE_LIMIT_WINDOW=3600
RATE_LIMIT_MIN_TIME=10

# API
ALLOWED_ORIGINS=https://yourdomain.com
```

### File Permissions
```
api.php             640 (rw-r-----)
config.php          600 (rw-------)
.env                600 (rw-------)
logs/               750 (rwxr-x---)
logs/*.log          640 (rw-r-----)
logs/rate_limits/   750 (rwxr-x---)
```

---

## 🚀 Next Steps

1. **Immediate:**
   - [ ] Generate SRI hashes and update `index.html`
   - [ ] Set correct file permissions
   - [ ] Create production `.env` and `config.php`

2. **Before Production:**
   - [ ] Run Mozilla Observatory scan
   - [ ] Test rate limiting with OWASP ZAP
   - [ ] Verify CSP with CSP Evaluator
   - [ ] Test CSRF token rotation

3. **Ongoing:**
   - [ ] Monitor `logs/security.log` regularly
   - [ ] Review `logs/alerts.log` for anomalies
   - [ ] Rotate logs weekly
   - [ ] Update dependencies regularly

---

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CSP Best Practices](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [SRI Hash Generator](https://www.srihash.org/)
- [Mozilla Observatory](https://observatory.mozilla.org/)
- [OWASP ZAP](https://www.zaproxy.org/)

---

**Last Updated:** 2025-01-27
**Version:** 2.0.0

