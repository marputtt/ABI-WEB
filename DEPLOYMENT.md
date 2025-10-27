# Deployment Guide - ABI Website

This guide provides step-by-step instructions for deploying the ABI website securely to a production environment.

## 📋 Pre-Deployment Checklist

Before deploying, ensure you have:

- [ ] Domain name configured
- [ ] SSL certificate obtained
- [ ] Web server access (SSH)
- [ ] Database setup (if needed)
- [ ] Email account for form submissions
- [ ] Backup solution in place
- [ ] Monitoring tools ready

## 🚀 Deployment Steps

### 1. Prepare Your Server

#### Update System
```bash
sudo apt update
sudo apt upgrade -y
```

#### Install Required Software
```bash
# Apache, PHP, and required modules
sudo apt install apache2 php7.4 php7.4-cli php7.4-common php7.4-curl php7.4-mbstring php7.4-xml -y

# Enable Apache modules
sudo a2enmod rewrite
sudo a2enmod headers
sudo a2enmod ssl
sudo a2enmod deflate
sudo a2enmod expires

# Restart Apache
sudo systemctl restart apache2
```

### 2. Configure Domain and SSL

#### Install Certbot (Let's Encrypt)
```bash
sudo apt install certbot python3-certbot-apache -y

# Obtain SSL certificate
sudo certbot --apache -d yourdomain.com -d www.yourdomain.com
```

#### Configure Apache Virtual Host
```bash
sudo nano /etc/apache2/sites-available/abi-website.conf
```

Add:
```apache
<VirtualHost *:80>
    ServerName yourdomain.com
    ServerAlias www.yourdomain.com
    DocumentRoot /var/www/abi-website
    
    # Redirect to HTTPS
    RewriteEngine On
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</VirtualHost>

<VirtualHost *:443>
    ServerName yourdomain.com
    ServerAlias www.yourdomain.com
    DocumentRoot /var/www/abi-website
    
    # SSL Configuration
    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/yourdomain.com/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/yourdomain.com/privkey.pem
    
    # Security Headers
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-Frame-Options "DENY"
    Header always set X-XSS-Protection "1; mode=block"
    
    # Directory Configuration
    <Directory /var/www/abi-website>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    
    # Logs
    ErrorLog ${APACHE_LOG_DIR}/abi-error.log
    CustomLog ${APACHE_LOG_DIR}/abi-access.log combined
</VirtualHost>
```

Enable the site:
```bash
sudo a2ensite abi-website.conf
sudo systemctl reload apache2
```

### 3. Deploy Application Files

#### Clone from Private Repository
```bash
# Create directory
sudo mkdir -p /var/www/abi-website
cd /var/www/abi-website

# Clone repository (if private repo)
sudo git clone https://github.com/yourusername/abi-website.git .

# Or upload via SFTP/SCP
# scp -r /local/path/* user@server:/var/www/abi-website/
```

### 4. Configure Environment

#### Create .env File
```bash
sudo cp .env.example .env
sudo nano .env
```

Update with production values:
```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.com

MAIL_FROM_ADDRESS=noreply@bumikarya.co.id
MAIL_TO_ADDRESS=contact@bumikarya.co.id

# Generate CSRF secret
CSRF_SECRET=$(openssl rand -hex 32)
```

#### Create config.php
```bash
sudo cp config.example.php config.php
sudo nano config.php
```

### 5. Set Permissions

```bash
# Set ownership
sudo chown -R www-data:www-data /var/www/abi-website

# Set directory permissions
sudo find /var/www/abi-website -type d -exec chmod 755 {} \;

# Set file permissions
sudo find /var/www/abi-website -type f -exec chmod 644 {} \;

# Secure sensitive files
sudo chmod 640 /var/www/abi-website/config.php
sudo chmod 640 /var/www/abi-website/api.php
sudo chmod 600 /var/www/abi-website/.env

# Create and secure logs directory
sudo mkdir -p /var/www/abi-website/logs
sudo chmod 755 /var/www/abi-website/logs
sudo chown www-data:www-data /var/www/abi-website/logs
```

### 6. Configure PHP

```bash
sudo nano /etc/php/7.4/apache2/php.ini
```

Update these settings:
```ini
; Security Settings
display_errors = Off
display_startup_errors = Off
log_errors = On
error_log = /var/log/php/error.log
expose_php = Off

; Session Security
session.cookie_httponly = 1
session.cookie_secure = 1
session.cookie_samesite = Strict
session.use_strict_mode = 1

; Upload Limits
upload_max_filesize = 10M
post_max_size = 10M
max_execution_time = 30
memory_limit = 128M

; Timezone
date.timezone = Asia/Jakarta
```

Restart Apache:
```bash
sudo systemctl restart apache2
```

### 7. Configure Firewall

```bash
# Allow SSH, HTTP, and HTTPS
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

### 8. Install Fail2Ban (Optional but Recommended)

```bash
# Install
sudo apt install fail2ban -y

# Create local configuration
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo nano /etc/fail2ban/jail.local
```

Add Apache jail:
```ini
[apache-auth]
enabled = true
port = http,https
filter = apache-auth
logpath = /var/log/apache2/*error.log
maxretry = 3
bantime = 3600

[apache-noscript]
enabled = true
port = http,https
filter = apache-noscript
logpath = /var/log/apache2/*error.log
maxretry = 3
bantime = 3600
```

Start Fail2Ban:
```bash
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 9. Set Up Logging

```bash
# Create log rotation
sudo nano /etc/logrotate.d/abi-website
```

Add:
```
/var/www/abi-website/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        /usr/sbin/service apache2 reload > /dev/null
    endscript
}
```

### 10. Configure Monitoring

#### Install Monitoring Tools
```bash
# Install monitoring packages
sudo apt install sysstat htop iotop -y
```

#### Create Monitoring Script
```bash
sudo nano /usr/local/bin/abi-monitor.sh
```

Add:
```bash
#!/bin/bash

LOG_DIR="/var/www/abi-website/logs"
ALERT_EMAIL="admin@bumikarya.co.id"

# Check for security events
CSRF_FAILURES=$(grep -c "CSRF token validation failed" $LOG_DIR/security.log)
RATE_LIMIT=$(grep -c "Rate limit exceeded" $LOG_DIR/security.log)
SPAM=$(grep -c "Honeypot triggered" $LOG_DIR/security.log)

if [ $CSRF_FAILURES -gt 10 ] || [ $RATE_LIMIT -gt 20 ] || [ $SPAM -gt 5 ]; then
    echo "Security Alert: Unusual activity detected" | mail -s "ABI Website Security Alert" $ALERT_EMAIL
fi

# Check disk space
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "Warning: Disk usage is at ${DISK_USAGE}%" | mail -s "ABI Website Disk Alert" $ALERT_EMAIL
fi
```

Make executable and add to cron:
```bash
sudo chmod +x /usr/local/bin/abi-monitor.sh
sudo crontab -e
```

Add:
```cron
# Run monitoring every hour
0 * * * * /usr/local/bin/abi-monitor.sh
```

### 11. Set Up Backups

#### Create Backup Script
```bash
sudo nano /usr/local/bin/abi-backup.sh
```

Add:
```bash
#!/bin/bash

BACKUP_DIR="/backups/abi-website"
WEBSITE_DIR="/var/www/abi-website"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup files
tar -czf $BACKUP_DIR/abi_files_$DATE.tar.gz $WEBSITE_DIR

# Keep only last 30 days
find $BACKUP_DIR -name "abi_files_*.tar.gz" -mtime +30 -delete

echo "Backup completed: abi_files_$DATE.tar.gz"
```

Make executable and schedule:
```bash
sudo chmod +x /usr/local/bin/abi-backup.sh
sudo crontab -e
```

Add:
```cron
# Daily backup at 2 AM
0 2 * * * /usr/local/bin/abi-backup.sh
```

### 12. Final Testing

#### Test Website Functionality
```bash
# Test homepage
curl https://yourdomain.com

# Test SSL
curl -I https://yourdomain.com | grep "HTTP/2 200"

# Test security headers
curl -I https://yourdomain.com | grep -E "X-Content-Type-Options|X-Frame-Options|Strict-Transport-Security"

# Test API endpoint
curl https://yourdomain.com/api.php
```

#### Run Security Scanners
- Visit https://securityheaders.com/?q=yourdomain.com
- Visit https://www.ssllabs.com/ssltest/analyze.html?d=yourdomain.com
- Visit https://observatory.mozilla.org/analyze/yourdomain.com

#### Test Contact Form
1. Open website in browser
2. Fill out contact form
3. Submit and verify email receipt
4. Check logs for any errors

### 13. Post-Deployment

#### Create Documentation
```bash
# Document your server details (keep secure!)
sudo nano /root/server-info.txt
```

Add:
```
Server IP: XXX.XXX.XXX.XXX
Domain: yourdomain.com
SSH User: youruser
SSL Expiry: [date]
Backup Location: /backups/abi-website
Contact Email: admin@bumikarya.co.id
```

#### Set Up Uptime Monitoring
Use services like:
- UptimeRobot (https://uptimerobot.com/)
- Pingdom (https://www.pingdom.com/)
- StatusCake (https://www.statuscake.com/)

#### Configure Email Alerts
Set up email notifications for:
- Server downtime
- High CPU/memory usage
- Disk space warnings
- Security events
- SSL certificate expiration

## 🔄 Updating the Website

### Pull Latest Changes
```bash
cd /var/www/abi-website

# Backup current version
sudo tar -czf /backups/pre-update-$(date +%Y%m%d).tar.gz .

# Pull updates
sudo git pull origin main

# Clear cache if needed
sudo rm -rf cache/*

# Set permissions
sudo chown -R www-data:www-data .

# Restart Apache
sudo systemctl restart apache2

# Check logs
sudo tail -f logs/security.log
```

## 🚨 Rollback Procedure

If something goes wrong:

```bash
# Stop Apache
sudo systemctl stop apache2

# Restore from backup
cd /var/www/abi-website
sudo rm -rf *
sudo tar -xzf /backups/abi_files_YYYYMMDD_HHMMSS.tar.gz -C /var/www/abi-website --strip-components=4

# Set permissions
sudo chown -R www-data:www-data /var/www/abi-website

# Start Apache
sudo systemctl start apache2

# Verify
curl https://yourdomain.com
```

## 📊 Performance Optimization

### Enable OpCache
```bash
sudo nano /etc/php/7.4/apache2/php.ini
```

Add:
```ini
opcache.enable=1
opcache.memory_consumption=128
opcache.max_accelerated_files=10000
opcache.revalidate_freq=60
```

### Enable Apache MPM Event
```bash
sudo a2dismod mpm_prefork
sudo a2enmod mpm_event
sudo systemctl restart apache2
```

## 📞 Support Contacts

- **Technical Issues:** tech@bumikarya.co.id
- **Security Issues:** security@bumikarya.co.id
- **Emergency:** +123 456 789

---

**Last Updated:** 2025-10-27  
**Version:** 1.0.0

