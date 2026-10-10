#!/usr/bin/env bash
# ==============================================================================
# DIU Industrial Innovation Centre (IIC) Platform
# Production VPS Automated Deployment & Update Script
# ==============================================================================

set -e # Exit immediately if a command exits with a non-zero status

APP_DIR="/var/www/iic-platform"
WEB_USER="www-data"

echo "======================================================"
echo " Starting DIU IIC Platform Production Deployment"
echo "======================================================"

# 1. Navigate to application directory
if [ -d "$APP_DIR" ]; then
    cd "$APP_DIR"
else
    echo "Directory $APP_DIR does not exist. Using current directory: $(pwd)"
fi

# 2. Pull latest git changes if in a git repo
if [ -d ".git" ]; then
    echo ">> Fetching latest code from Git..."
    git pull origin main || echo "Git pull skipped or failed, continuing with local files..."
fi

# 3. Install NPM dependencies
echo ">> Installing dependencies..."
npm install --silent

# 4. Build production assets with Vite
echo ">> Compiling production bundle..."
npm run build

# 5. Fix permissions for Nginx
if id "$WEB_USER" >/dev/null 2>&1; then
    echo ">> Setting permissions for $WEB_USER..."
    chown -R $WEB_USER:$WEB_USER dist/
    chmod -R 755 dist/
fi

# 6. Test and Reload Nginx if installed
if command -v nginx >/dev/null 2>&1; then
    echo ">> Validating Nginx configuration..."
    nginx -t
    echo ">> Reloading Nginx..."
    systemctl reload nginx
fi

echo "======================================================"
echo " Deployment Successfully Completed!"
echo " DIU IIC Platform is live."
echo "======================================================"
