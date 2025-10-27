# ABI Website - Strategic Energy & Resource Solutions

[![Security Status](https://img.shields.io/badge/security-A%2B-brightgreen)]()
[![License](https://img.shields.io/badge/license-Proprietary-blue)]()
[![PHP Version](https://img.shields.io/badge/php-%3E%3D7.4-blue)]()

A secure, modern, and responsive website for PT. Anugerah Bumikarya Indonesia (ABI), showcasing energy and resource solutions across Indonesia.

## 🌟 Features

- **Responsive Design** - Mobile-first design that works on all devices
- **Security-First** - Comprehensive security measures including CSRF protection, XSS prevention, rate limiting
- **Modern UI/UX** - Clean, professional interface with smooth animations
- **Contact Form** - Secure form with validation and spam protection
- **Performance Optimized** - Fast loading with optimized assets and caching

## 🔒 Security Features

- ✅ Content Security Policy (CSP)
- ✅ CSRF Protection
- ✅ Input Validation & Sanitization
- ✅ Rate Limiting & DDoS Protection
- ✅ Bot/Spam Protection (Honeypot)
- ✅ Email/Phone Obfuscation
- ✅ Security Headers (HSTS, X-Frame-Options, etc.)
- ✅ HTTPS Enforcement
- ✅ Secure Session Management
- ✅ Error Handling & Logging

## 📋 Prerequisites

- Web server (Apache 2.4+ or Nginx 1.18+)
- PHP 7.4 or higher
- SSL certificate (for HTTPS)
- Composer (optional, for dependencies)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/abi-website.git
cd abi-website
```

### 2. Configure Environment

```bash
# Copy environment configuration
cp .env.example .env

# Edit .env with your actual values
nano .env
```

**Important Environment Variables:**
```env
APP_URL=https://yourdomain.com
MAIL_FROM_ADDRESS=noreply@bumikarya.co.id
MAIL_TO_ADDRESS=contact@bumikarya.co.id
CSRF_SECRET=your-random-secret-here
```

### 3. Set Up Configuration

```bash
# Copy configuration file
cp config.example.php config.php

# Edit config.php if needed
nano config.php
```

### 4. Create Logs Directory

```bash
mkdir logs
chmod 755 logs
```

### 5. Set Proper Permissions

```bash
# Set file permissions
find . -type f -exec chmod 644 {} \;
find . -type d -exec chmod 755 {} \;

# Secure sensitive files
chmod 640 config.php
chmod 640 api.php
chmod 600 .env
```

### 6. Configure Web Server

**For Apache:**
```bash
# .htaccess is already included
# Make sure mod_rewrite and mod_headers are enabled
sudo a2enmod rewrite
sudo a2enmod headers
sudo systemctl restart apache2
```

**For Nginx:**
```nginx
# Add to your server block
include /path/to/website/nginx.conf;
```

### 7. Test Your Installation

```bash
# Test security headers
curl -I https://yourdomain.com

# Test API endpoint
curl https://yourdomain.com/api.php
```

## 📁 Project Structure

```
abi-website/
├── index.html              # Main HTML file
├── script-secure.js        # Secure JavaScript
├── styles.css              # Stylesheets
├── api.php                 # Backend API
├── .htaccess              # Apache configuration
├── .env.example           # Environment variables template
├── .gitignore             # Git ignore rules
├── config.example.php     # Configuration template
├── README.md              # This file
├── DEPLOYMENT.md          # Deployment guide
├── SECURITY_GUIDE.md      # Security documentation
├── Assets/                # Images and icons
├── Partners/              # Partner logos
├── Services/              # Service images
├── MEMBER/                # Team member photos
├── Background/            # Background images
└── logs/                  # Log files (not in git)
```

## 🔧 Configuration

### Email Setup

Edit `.env` file:

```env
# For SMTP (recommended)
MAIL_DRIVER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
```

### Security Settings

Adjust rate limits in `.env`:

```env
RATE_LIMIT_MAX_ATTEMPTS=5
RATE_LIMIT_WINDOW=3600
RATE_LIMIT_MIN_TIME=10
```

### Domain Configuration

Update CSP policy in `index.html` (line 14-25) with your domain.

## 🧪 Testing

### Run Security Tests

```bash
# Test HTTPS enforcement
curl -I http://yourdomain.com

# Test security headers
curl -I https://yourdomain.com

# Test CSRF protection
curl -X POST https://yourdomain.com/api.php \
  -H "Content-Type: application/json" \
  -d '{"test":"data"}'
```

### Online Security Scanners

- [Security Headers](https://securityheaders.com/)
- [SSL Labs](https://www.ssllabs.com/ssltest/)
- [Mozilla Observatory](https://observatory.mozilla.org/)

## 📦 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deployment Checklist

- [ ] Configure environment variables
- [ ] Set up SSL certificate
- [ ] Create logs directory
- [ ] Set file permissions
- [ ] Test security headers
- [ ] Test contact form
- [ ] Enable error logging
- [ ] Set up monitoring
- [ ] Configure backups

## 🔄 Updates & Maintenance

### Regular Tasks

**Daily:**
- Monitor error logs
- Check security logs for suspicious activity

**Weekly:**
- Review security logs
- Check for software updates
- Verify backups

**Monthly:**
- Run security scans
- Review and rotate logs
- Test disaster recovery
- Update dependencies

### Updating the Website

```bash
# Pull latest changes
git pull origin main

# Clear cache if needed
# (depends on your setup)

# Check logs for errors
tail -f logs/security.log
```

## 🐛 Troubleshooting

### Common Issues

**Form not submitting:**
- Check browser console for errors
- Verify CSRF token is being generated
- Check API endpoint is accessible
- Review error logs

**Email not sending:**
- Verify SMTP credentials
- Check spam folder
- Review mail configuration
- Test PHP mail function

**Security headers missing:**
- Verify .htaccess is being read
- Enable required Apache modules
- Check server configuration

See [SECURITY_GUIDE.md](SECURITY_GUIDE.md) for detailed troubleshooting.

## 📚 Documentation

- [Security Guide](SECURITY_GUIDE.md) - Comprehensive security documentation
- [Deployment Guide](DEPLOYMENT.md) - Step-by-step deployment instructions
- [Testing Guide](TESTING_GUIDE.md) - Testing procedures and best practices
- [API Documentation](API.md) - API endpoints and usage

## 🤝 Contributing

This is a proprietary project. For internal development:

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit for review
5. Merge to main after approval

### Development Guidelines

- Follow PSR-12 coding standards for PHP
- Use ESLint for JavaScript
- Write meaningful commit messages
- Document all changes
- Include security considerations

## 📄 License

Copyright © 2025 PT. Anugerah Bumikarya Indonesia. All Rights Reserved.

This is proprietary software. Unauthorized copying, modification, or distribution is prohibited.

## 👥 Team

- **Development Team** - ABI Development Team
- **Security** - security@bumikarya.co.id
- **Support** - tech@bumikarya.co.id

## 🔗 Links

- **Website:** https://bumikarya.co.id
- **Email:** contact@bumikarya.co.id
- **Location:** Jakarta, Indonesia

## 📞 Support

For technical support or security issues:

- **Email:** tech@bumikarya.co.id
- **Security:** security@bumikarya.co.id
- **Phone:** +123 456 789

## 🎯 Roadmap

### Planned Features

- [ ] Multi-language support (Indonesian/English)
- [ ] Client portal
- [ ] Blog/News section
- [ ] Advanced analytics dashboard
- [ ] API integration with CRM
- [ ] Mobile app

### Version History

- **v1.0.0** (2025-10-27) - Initial release
  - Responsive design
  - Secure contact form
  - Comprehensive security features
  - Performance optimization

---

**Built with ❤️ for ABI by the Development Team**

**Last Updated:** 2025-10-27

