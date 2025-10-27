# GitHub Setup Guide - ABI Website

This guide explains how to safely push your ABI website to GitHub while keeping sensitive information secure.

## 🔒 Security First

**NEVER commit these files to GitHub:**
- `.env` - Contains sensitive credentials
- `config.php` - Contains production configuration
- `logs/` - Contains security and error logs
- Any files with passwords, API keys, or sensitive data

## ✅ Pre-Push Checklist

Before pushing to GitHub, verify:

- [ ] `.gitignore` file is present
- [ ] `.env.example` file is created (without real values)
- [ ] `config.example.php` file is created (without real values)
- [ ] Removed all hardcoded credentials
- [ ] No log files are tracked
- [ ] No backup files are tracked
- [ ] README.md is complete with setup instructions

## 🚀 Step-by-Step GitHub Setup

### 1. Initialize Git Repository (if not already done)

```bash
cd "/Users/marsyaputra22/Downloads/ABI/PT ABI"

# Initialize git
git init

# Add .gitignore first!
git add .gitignore
git commit -m "Add .gitignore to protect sensitive files"
```

### 2. Verify What Will Be Committed

```bash
# Check status
git status

# Verify .env and config.php are NOT listed
# They should be ignored by .gitignore

# If they appear, add them to .gitignore
echo ".env" >> .gitignore
echo "config.php" >> .gitignore
echo "logs/" >> .gitignore
```

### 3. Review Files Before Adding

```bash
# See what files will be added
git add --dry-run .

# If everything looks good, add files
git add .
```

### 4. Create Initial Commit

```bash
git commit -m "Initial commit: Secure ABI website with comprehensive security features

Features:
- Responsive design with mobile optimization
- Secure contact form with CSRF protection
- Input validation and sanitization
- Rate limiting and bot protection
- Security headers and CSP
- Error handling and logging
- Email/phone obfuscation
- Performance optimization"
```

### 5. Create GitHub Repository

1. Go to https://github.com
2. Click "New Repository"
3. Name: `abi-website` (or your preferred name)
4. **Important:** Choose "Private" for security
5. Don't initialize with README (we already have one)
6. Click "Create Repository"

### 6. Connect to GitHub

```bash
# Add GitHub remote
git remote add origin https://github.com/yourusername/abi-website.git

# Or use SSH (recommended)
git remote add origin git@github.com:yourusername/abi-website.git

# Verify remote
git remote -v
```

### 7. Push to GitHub

```bash
# Push to main branch
git branch -M main
git push -u origin main
```

### 8. Verify on GitHub

1. Go to your repository on GitHub
2. Verify these files are **NOT** present:
   - `.env`
   - `config.php`
   - `logs/` directory
   - Any backup files (*.bak, *.old, etc.)

3. Verify these files **ARE** present:
   - `.gitignore`
   - `.env.example`
   - `config.example.php`
   - `README.md`
   - All source files

## 🔐 Setting Up for Team Members

### For Team Members Cloning the Repository:

```bash
# Clone the repository
git clone https://github.com/yourusername/abi-website.git
cd abi-website

# Create .env from example
cp .env.example .env

# Edit .env with your credentials
nano .env

# Create config.php from example
cp config.example.php config.php

# Create logs directory
mkdir logs
chmod 755 logs

# Set proper permissions
chmod 600 .env
chmod 640 config.php
```

## 📋 Repository Settings

### 1. Configure Branch Protection

On GitHub, go to Settings > Branches > Add rule:

- Branch name pattern: `main`
- ✅ Require pull request reviews before merging
- ✅ Require status checks to pass before merging
- ✅ Include administrators

### 2. Add Collaborators

Settings > Collaborators > Add people
- Add team members with appropriate permissions

### 3. Set Up Secrets (for CI/CD)

Settings > Secrets and variables > Actions > New repository secret

Add these secrets:
- `PRODUCTION_SERVER_IP`
- `PRODUCTION_SSH_KEY`
- `PRODUCTION_USER`
- (Add others as needed)

### 4. Enable Security Features

Settings > Security:
- ✅ Enable Dependabot alerts
- ✅ Enable Dependabot security updates
- ✅ Enable private vulnerability reporting

## 🔄 Daily Git Workflow

### Making Changes

```bash
# Create a feature branch
git checkout -b feature/your-feature-name

# Make your changes
# ... edit files ...

# Stage changes
git add .

# Commit with descriptive message
git commit -m "Add: Description of your changes"

# Push to GitHub
git push origin feature/your-feature-name
```

### Commit Message Guidelines

Use conventional commits:
```
Add: New feature
Fix: Bug fix
Update: Changes to existing feature
Refactor: Code restructuring
Docs: Documentation changes
Security: Security improvements
Style: Code style changes
```

### Pull Request Process

1. Push your feature branch to GitHub
2. Create a Pull Request on GitHub
3. Request review from team member
4. Address review comments
5. Merge when approved

## 🛡️ Security Best Practices

### 1. Never Commit Sensitive Data

```bash
# Before committing, always check:
git diff

# Search for potential secrets
git grep -i "password"
git grep -i "api_key"
git grep -i "secret"
```

### 2. Use Git Secrets Tool

```bash
# Install git-secrets
brew install git-secrets  # macOS
# or
apt-get install git-secrets  # Linux

# Set up
cd "/Users/marsyaputra22/Downloads/ABI/PT ABI"
git secrets --install
git secrets --register-aws
```

### 3. Review Before Pushing

```bash
# Always review what you're about to push
git log origin/main..HEAD
git diff origin/main..HEAD
```

### 4. Regular Security Audits

```bash
# Check for accidentally committed secrets
git log -p | grep -i "password\|api_key\|secret"

# If found, use BFG Repo-Cleaner to remove
# https://rtyley.github.io/bfg-repo-cleaner/
```

## 🔧 Git Configuration

### Set Up Git User

```bash
git config user.name "Your Name"
git config user.email "your.email@bumikarya.co.id"
```

### Useful Git Aliases

```bash
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.unstage 'reset HEAD --'
git config --global alias.last 'log -1 HEAD'
git config --global alias.visual '!gitk'
```

## 📊 .gitignore Explanation

Our `.gitignore` protects:

1. **Environment files** (`.env`, `config.php`) - Contain credentials
2. **Logs** (`logs/`, `*.log`) - May contain sensitive data
3. **Backups** (`*.bak`, `*.backup`) - Old code versions
4. **IDE files** (`.vscode/`, `.idea/`) - Personal settings
5. **OS files** (`.DS_Store`, `Thumbs.db`) - System files
6. **Dependencies** (`node_modules/`, `vendor/`) - Can be reinstalled

## 🚨 Emergency: Sensitive Data Committed

If you accidentally commit sensitive data:

### 1. If Not Yet Pushed

```bash
# Remove file from staging
git reset HEAD .env

# Amend last commit
git commit --amend

# Or reset to previous commit
git reset --soft HEAD~1
```

### 2. If Already Pushed

```bash
# !!! WARNING: This rewrites history !!!
# Coordinate with team before doing this

# Remove file from all history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (dangerous!)
git push origin --force --all

# Notify team members to re-clone
```

### 3. Better Solution: Use BFG Repo-Cleaner

```bash
# Download BFG
# https://rtyley.github.io/bfg-repo-cleaner/

# Remove file from history
java -jar bfg.jar --delete-files .env

# Clean up
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push
git push origin --force --all
```

### 4. Rotate Compromised Credentials

After removing sensitive data:
- Change all passwords immediately
- Rotate API keys
- Update CSRF secrets
- Review security logs
- Monitor for unauthorized access

## 📝 Repository Documentation

Keep these files updated:
- `README.md` - Project overview and quick start
- `DEPLOYMENT.md` - Deployment instructions
- `SECURITY_GUIDE.md` - Security documentation
- `CONTRIBUTING.md` - Contribution guidelines (if needed)
- `CHANGELOG.md` - Version history

## 🔍 Useful Git Commands

### Check What's Ignored

```bash
# List all ignored files
git status --ignored

# Check if specific file is ignored
git check-ignore -v .env
```

### View Commit History

```bash
# Pretty log
git log --oneline --graph --all --decorate

# Show file changes
git log --stat

# Search commits
git log --grep="security"
```

### Inspect Changes

```bash
# Show changes not yet staged
git diff

# Show changes staged for commit
git diff --staged

# Show changes between branches
git diff main..feature-branch
```

## 🎯 GitHub Actions (Optional)

Create `.github/workflows/security-check.yml`:

```yaml
name: Security Check

on: [push, pull_request]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Check for secrets
        run: |
          ! git grep -i "password\|api_key\|secret_key" -- ':!*.md'
      
      - name: Run security scanner
        run: |
          # Add your security scanning tools here
```

## 📞 Support

If you have questions about GitHub setup:
- **Technical:** tech@bumikarya.co.id
- **Security:** security@bumikarya.co.id

## 📚 Additional Resources

- [GitHub Documentation](https://docs.github.com/)
- [Git Documentation](https://git-scm.com/doc)
- [Git Secrets Tool](https://github.com/awslabs/git-secrets)
- [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/)

---

**Remember:** Security is everyone's responsibility. Always double-check before pushing!

**Last Updated:** 2025-10-27

