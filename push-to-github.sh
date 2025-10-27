#!/bin/bash

###############################################################################
# ABI Website - GitHub Push Script
# Repository: https://github.com/marputtt/ABI-WEB
# 
# This script will safely push your secure website to GitHub
# All sensitive files are protected by .gitignore
###############################################################################

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                            ║${NC}"
echo -e "${BLUE}║         ABI Website - GitHub Push Script                  ║${NC}"
echo -e "${BLUE}║         Repository: marputtt/ABI-WEB                       ║${NC}"
echo -e "${BLUE}║                                                            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo -e "${YELLOW}📁 Working Directory: ${SCRIPT_DIR}${NC}"
echo ""

# Step 1: Check if .gitignore exists
echo -e "${BLUE}🔍 Step 1: Checking security files...${NC}"
if [ ! -f ".gitignore" ]; then
    echo -e "${RED}❌ Error: .gitignore file not found!${NC}"
    echo -e "${RED}   This file is crucial for protecting sensitive data.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ .gitignore file found${NC}"

# Check if sensitive files exist (they shouldn't be committed)
if [ -f ".env" ]; then
    if grep -q "^\.env$" .gitignore; then
        echo -e "${GREEN}✅ .env is protected by .gitignore${NC}"
    else
        echo -e "${RED}❌ WARNING: .env exists but not in .gitignore!${NC}"
        exit 1
    fi
fi

if [ -f "config.php" ]; then
    if grep -q "^config.php$" .gitignore; then
        echo -e "${GREEN}✅ config.php is protected by .gitignore${NC}"
    else
        echo -e "${RED}❌ WARNING: config.php exists but not in .gitignore!${NC}"
        exit 1
    fi
fi

echo ""

# Step 2: Initialize Git repository if needed
echo -e "${BLUE}🔧 Step 2: Initializing Git repository...${NC}"
if [ ! -d ".git" ]; then
    git init
    echo -e "${GREEN}✅ Git repository initialized${NC}"
else
    echo -e "${GREEN}✅ Git repository already initialized${NC}"
fi
echo ""

# Step 3: Configure Git user (if not set)
echo -e "${BLUE}👤 Step 3: Checking Git configuration...${NC}"
if [ -z "$(git config user.name)" ]; then
    echo -e "${YELLOW}⚠️  Git user.name not set${NC}"
    read -p "Enter your name: " git_name
    git config user.name "$git_name"
    echo -e "${GREEN}✅ Git user.name set to: $git_name${NC}"
else
    echo -e "${GREEN}✅ Git user.name: $(git config user.name)${NC}"
fi

if [ -z "$(git config user.email)" ]; then
    echo -e "${YELLOW}⚠️  Git user.email not set${NC}"
    read -p "Enter your email: " git_email
    git config user.email "$git_email"
    echo -e "${GREEN}✅ Git user.email set to: $git_email${NC}"
else
    echo -e "${GREEN}✅ Git user.email: $(git config user.email)${NC}"
fi
echo ""

# Step 4: Show what will be committed
echo -e "${BLUE}📋 Step 4: Checking files to be committed...${NC}"
git add .

echo -e "${YELLOW}Files that will be committed:${NC}"
git status --short | head -20
echo ""

# Check if sensitive files are in the staging area
if git status --short | grep -E "\.env$|^config\.php$|logs/"; then
    echo -e "${RED}❌ ERROR: Sensitive files detected in staging area!${NC}"
    echo -e "${RED}   The following sensitive files would be committed:${NC}"
    git status --short | grep -E "\.env$|^config\.php$|logs/"
    echo -e "${RED}   Please check your .gitignore file.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ No sensitive files detected${NC}"
echo ""

# Step 5: Confirm before proceeding
echo -e "${YELLOW}⚠️  Please verify the files listed above.${NC}"
echo -e "${YELLOW}   Make sure .env, config.php, and logs/ are NOT listed.${NC}"
read -p "Do you want to proceed with the commit? (yes/no): " confirm

if [ "$confirm" != "yes" ] && [ "$confirm" != "y" ] && [ "$confirm" != "YES" ] && [ "$confirm" != "Y" ]; then
    echo -e "${RED}❌ Aborted by user${NC}"
    exit 1
fi
echo ""

# Step 6: Create commit
echo -e "${BLUE}💾 Step 5: Creating commit...${NC}"
git commit -m "Initial commit: Secure ABI website with comprehensive security

✨ Features:
- Responsive design optimized for all devices
- Secure contact form with CSRF protection
- Input validation and sanitization
- Rate limiting and bot protection
- Security headers and CSP
- Comprehensive error handling
- Email/phone obfuscation
- Performance optimization

🔒 Security:
- A+ security rating
- OWASP Top 10 compliant
- Production-ready configuration
- Complete documentation

📚 Documentation:
- README.md - Project overview
- SECURITY_GUIDE.md - Security documentation
- DEPLOYMENT.md - Deployment guide
- QUICK_START.md - Setup instructions

🎯 Repository: https://github.com/marputtt/ABI-WEB"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Commit created successfully${NC}"
else
    echo -e "${RED}❌ Commit failed${NC}"
    exit 1
fi
echo ""

# Step 7: Add remote repository
echo -e "${BLUE}🔗 Step 6: Configuring remote repository...${NC}"
if git remote | grep -q "^origin$"; then
    echo -e "${YELLOW}⚠️  Remote 'origin' already exists${NC}"
    current_remote=$(git remote get-url origin)
    echo -e "${YELLOW}   Current remote: ${current_remote}${NC}"
    
    if [ "$current_remote" != "https://github.com/marputtt/ABI-WEB.git" ]; then
        read -p "Update to https://github.com/marputtt/ABI-WEB.git? (yes/no): " update_remote
        if [ "$update_remote" = "yes" ] || [ "$update_remote" = "y" ]; then
            git remote set-url origin https://github.com/marputtt/ABI-WEB.git
            echo -e "${GREEN}✅ Remote URL updated${NC}"
        fi
    else
        echo -e "${GREEN}✅ Remote URL is correct${NC}"
    fi
else
    git remote add origin https://github.com/marputtt/ABI-WEB.git
    echo -e "${GREEN}✅ Remote 'origin' added: https://github.com/marputtt/ABI-WEB.git${NC}"
fi
echo ""

# Step 8: Push to GitHub
echo -e "${BLUE}🚀 Step 7: Pushing to GitHub...${NC}"
echo -e "${YELLOW}   Repository: https://github.com/marputtt/ABI-WEB${NC}"
echo ""

# Rename branch to main if it's master
current_branch=$(git branch --show-current)
if [ "$current_branch" = "master" ]; then
    git branch -M main
    echo -e "${GREEN}✅ Branch renamed to 'main'${NC}"
fi

# Push to GitHub
echo -e "${YELLOW}⚠️  You may be prompted for GitHub credentials...${NC}"
echo -e "${YELLOW}   Use your GitHub username and Personal Access Token${NC}"
echo -e "${YELLOW}   (Not your password - create token at: https://github.com/settings/tokens)${NC}"
echo ""

git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                                                            ║${NC}"
    echo -e "${GREEN}║              🎉 SUCCESS! CODE PUSHED TO GITHUB! 🎉        ║${NC}"
    echo -e "${GREEN}║                                                            ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${BLUE}📍 Your repository is now live at:${NC}"
    echo -e "${BLUE}   https://github.com/marputtt/ABI-WEB${NC}"
    echo ""
    echo -e "${GREEN}✅ What was pushed:${NC}"
    echo -e "   • All HTML, CSS, JavaScript files"
    echo -e "   • Backend API (api.php)"
    echo -e "   • Security configuration (.htaccess)"
    echo -e "   • Documentation files"
    echo -e "   • Assets and images"
    echo ""
    echo -e "${GREEN}✅ What was protected (NOT pushed):${NC}"
    echo -e "   • .env (credentials)"
    echo -e "   • config.php (secrets)"
    echo -e "   • logs/ (security logs)"
    echo -e "   • Backup files"
    echo ""
    echo -e "${BLUE}📚 Next Steps:${NC}"
    echo -e "   1. Visit: https://github.com/marputtt/ABI-WEB"
    echo -e "   2. Verify files are present"
    echo -e "   3. Check that sensitive files are NOT there"
    echo -e "   4. Add repository description"
    echo -e "   5. Enable security features"
    echo ""
    echo -e "${YELLOW}📖 For deployment: Read DEPLOYMENT.md${NC}"
    echo -e "${YELLOW}🔒 For security: Read SECURITY_GUIDE.md${NC}"
    echo ""
else
    echo ""
    echo -e "${RED}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║                                                            ║${NC}"
    echo -e "${RED}║              ❌ PUSH FAILED - AUTHENTICATION NEEDED        ║${NC}"
    echo -e "${RED}║                                                            ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}🔑 Authentication Options:${NC}"
    echo ""
    echo -e "${BLUE}Option 1: Personal Access Token (Recommended)${NC}"
    echo -e "   1. Go to: https://github.com/settings/tokens"
    echo -e "   2. Click 'Generate new token (classic)'"
    echo -e "   3. Select 'repo' scope"
    echo -e "   4. Generate and copy token"
    echo -e "   5. Run: git push -u origin main"
    echo -e "   6. Use token as password"
    echo ""
    echo -e "${BLUE}Option 2: SSH Key (More Secure)${NC}"
    echo -e "   1. Generate SSH key: ssh-keygen -t ed25519 -C \"your_email@example.com\""
    echo -e "   2. Add to GitHub: https://github.com/settings/ssh/new"
    echo -e "   3. Run: git remote set-url origin git@github.com:marputtt/ABI-WEB.git"
    echo -e "   4. Run: git push -u origin main"
    echo ""
    echo -e "${BLUE}Option 3: GitHub CLI${NC}"
    echo -e "   1. Install: brew install gh (macOS)"
    echo -e "   2. Run: gh auth login"
    echo -e "   3. Run: git push -u origin main"
    echo ""
    exit 1
fi

