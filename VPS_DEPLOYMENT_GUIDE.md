# DIU Industrial Innovation Centre (IIC) Platform
## Complete VPS Deployment & Production Hosting Guide

This guide provides end-to-end instructions for deploying the **DIU Industrial Innovation Centre (IIC) Ambassador & Projects Platform** to any Linux Virtual Private Server (VPS) such as **DigitalOcean, Hetzner, Linode/Akamai, AWS EC2, Vultr, Contabo, or OVH**.

---

## Architecture Overview

- **Application Type**: High-performance Single Page Application (SPA) built with React 19, TypeScript, Vite, and Tailwind CSS.
- **Production Output**: Static optimized HTML, CSS, JavaScript, and image assets compiled into the `dist/` directory.
- **Target OS**: Ubuntu 22.04 LTS / 24.04 LTS or Debian 12 (recommended).
- **Recommended Web Server**: **Nginx** (industry standard for SPAs with gzip, HTTP/2, SSL, and client-side routing).
- **SSL / HTTPS**: Free automated certificates via **Let's Encrypt** (Certbot).

---

## Quick Navigation

1. [Prerequisites](#1-prerequisites)
2. [Method A: Production Deployment with Nginx & Let's Encrypt (Recommended)](#2-method-a-production-deployment-with-nginx--lets-encrypt-recommended)
3. [Method B: Docker & Docker Compose (Containerized)](#3-method-b-docker--docker-compose-containerized)
4. [Method C: Node.js & PM2 (Process Manager)](#4-method-c-nodejs--pm2-process-manager)
5. [Method D: Local Build & SFTP/FileZilla Upload](#5-method-d-local-build--sftpfilezilla-upload)
6. [Automated 1-Click Update Script (`deploy.sh`)](#6-automated-1-click-update-script-deploysh)
7. [Domain & DNS Configuration](#7-domain--dns-configuration)
8. [Troubleshooting & FAQ](#8-troubleshooting--faq)

---

## 1. Prerequisites

Before starting, ensure you have:
1. **A VPS instance** running Ubuntu 22.04 or 24.04 LTS (Minimum: 1 vCPU, 1 GB RAM, 20 GB SSD).
2. **Root or sudo SSH access** to your VPS (`ssh root@YOUR_SERVER_IP`).
3. **A Domain Name** (e.g., `iic.diu.edu.bd` or `yourdomain.com`) with an **A Record** pointing to your VPS IP address.

---

## 2. Method A: Production Deployment with Nginx & Let's Encrypt (Recommended)

This is the fastest, most reliable, and standard production setup for Vite React applications.

### Step 2.1: Connect to your VPS and Update System Packages
```bash
ssh root@YOUR_SERVER_IP

# Update package lists and upgrade system
apt update && apt upgrade -y
```

### Step 2.2: Install Node.js (v20+ LTS), Git, Nginx, and Certbot
```bash
# Install curl, git, and build tools
apt install -y curl git ufw nginx certbot python3-certbot-nginx

# Install Node.js 20.x (LTS) via NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Verify versions
node -v    # Should show v20.x.x
npm -v     # Should show 10.x.x
nginx -v   # Should show nginx/1.x.x
```

### Step 2.3: Configure the Linux Firewall (UFW)
```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable
ufw status
```

### Step 2.4: Clone or Upload the Codebase to the Server
Create the web root directory and clone your repository (or upload via SFTP/Git):
```bash
# Create directory
mkdir -p /var/www/iic-platform
cd /var/www/iic-platform

# If cloning via Git:
git clone YOUR_GIT_REPOSITORY_URL .

# If uploading files via SCP from your local machine:
# Run this on your LOCAL computer:
# scp -r ./* root@YOUR_SERVER_IP:/var/www/iic-platform/
```

### Step 2.5: Install Dependencies & Build Production Assets
```bash
cd /var/www/iic-platform

# Install npm packages
npm install

# Build production assets (outputs to /var/www/iic-platform/dist)
npm run build

# Set proper ownership and permissions
chown -R www-data:www-data /var/www/iic-platform/dist
chmod -R 755 /var/www/iic-platform/dist
```

### Step 2.6: Configure Nginx Virtual Host
Create a new Nginx server configuration:
```bash
nano /etc/nginx/sites-available/iic-platform
```

Paste the following configuration (replace `iic.yourdomain.com` with your actual domain or VPS IP):

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name iic.yourdomain.com YOUR_SERVER_IP;

    root /var/www/iic-platform/dist;
    index index.html index.htm;

    # Gzip compression for high speed
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml application/javascript application/json image/svg+xml;

    # Cache static assets (images, fonts, scripts)
    location ~* \.(?:ico|css|js|gif|jpe?g|png|woff2?|eot|ttf|svg|webp)$ {
        expires 6M;
        access_log off;
        add_header Cache-Control "public, max-age=15552000, immutable";
    }

    # CRITICAL: Handle React client-side routing (Single Page App)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Custom 404 handler falls back to index.html for SPA
    error_page 404 /index.html;
}
```

Save and exit (`Ctrl + O`, `Enter`, then `Ctrl + X`).

### Step 2.7: Enable the Site & Reload Nginx
```bash
# Link configuration to sites-enabled
ln -s /etc/nginx/sites-available/iic-platform /etc/nginx/sites-enabled/

# Remove default Nginx welcome page
rm -f /etc/nginx/sites-enabled/default

# Test Nginx syntax
nginx -t

# If output says "syntax is ok", restart Nginx
systemctl restart nginx
```

### Step 2.8: Enable Free HTTPS / SSL with Certbot
```bash
certbot --nginx -d iic.yourdomain.com
```
Follow the interactive prompts:
- Enter your email address.
- Agree to terms.
- Certbot will automatically configure HTTPS, rewrite HTTP requests to HTTPS, and schedule auto-renewing certificates!

---

## 3. Method B: Docker & Docker Compose (Containerized)

If you prefer containerized deployment, you can run the entire platform with one command using Docker.

### Step 3.1: Install Docker & Docker Compose on VPS
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
apt install -y docker-compose-plugin
```

### Step 3.2: Build and Run Container
In the project directory on your VPS:
```bash
cd /var/www/iic-platform

# Build and start in detached background mode
docker compose up -d --build

# Check running status
docker compose ps
```
The app will be available on port `80` (or `3000` depending on configuration).

---

## 4. Method C: Node.js & PM2 (Process Manager)

If you want to run via a Node.js process manager:

### Step 4.1: Install PM2 and `serve`
```bash
npm install -g pm2 serve
```

### Step 4.2: Build and Serve
```bash
cd /var/www/iic-platform
npm install
npm run build

# Start with PM2
pm2 serve dist 3000 --spa --name "diu-iic-platform"

# Save PM2 process list and configure auto-start on server reboot
pm2 save
pm2 startup
```

---

## 5. Method D: Local Build & SFTP/FileZilla Upload

If you prefer not to build the code on your server:

1. **Build locally on your computer**:
   ```bash
   npm install
   npm run build
   ```
2. Open **FileZilla** or **Cyberduck**.
3. Connect using SFTP:
   - Host: `YOUR_SERVER_IP`
   - Port: `22`
   - Username: `root` (or your sudo user)
   - Password / SSH Key
4. Upload the contents of your local `dist/` directory to `/var/www/iic-platform/dist/` on the VPS.
5. In your SSH terminal:
   ```bash
   chown -R www-data:www-data /var/www/iic-platform/dist
   systemctl reload nginx
   ```

---

## 6. Automated 1-Click Update Script (`deploy.sh`)

Whenever you make updates to the codebase in the future, you can update your live site in seconds using the included `deploy.sh` script:

```bash
chmod +x deploy.sh
./deploy.sh
```

What `deploy.sh` does automatically:
1. Pulls the latest changes from Git (`git pull origin main`).
2. Installs dependencies (`npm install --production=false`).
3. Compiles the Vite production build (`npm run build`).
4. Fixes file permissions for Nginx (`chown -R www-data:www-data dist`).
5. Reloads Nginx gracefully without downtime (`systemctl reload nginx`).

---

## 7. Domain & DNS Configuration

To connect your custom university domain (e.g., `iic.diu.edu.bd`):
1. Log in to your domain registrar or DNS management portal (Cloudflare, Namecheap, Route53, etc.).
2. Add an **A Record**:
   - **Type**: `A`
   - **Name / Host**: `@` (or `iic` for subdomain)
   - **IPv4 Value**: `YOUR_VPS_PUBLIC_IP`
   - **TTL**: `Auto` or `300` seconds
3. Wait 2-10 minutes for DNS propagation.
4. Verify DNS:
   ```bash
   ping iic.yourdomain.com
   ```

---

## 8. Troubleshooting & FAQ

### Issue: White Screen or 404 Error when refreshing inner pages
- **Cause**: React is an SPA with client-side routing. When refreshing `/projects` or `/admin-tasks`, Nginx searches for a physical directory named `/projects` which doesn't exist.
- **Fix**: Verify your Nginx configuration contains:
  ```nginx
  location / {
      try_files $uri $uri/ /index.html;
  }
  ```
  Then reload: `nginx -t && systemctl reload nginx`.

### Issue: "Permission Denied" (403 Forbidden)
- **Fix**: Ensure `www-data` user has read permissions:
  ```bash
  chown -R www-data:www-data /var/www/iic-platform/dist
  chmod -R 755 /var/www/iic-platform/dist
  ```

### Issue: Out of Memory during `npm run build` on a 1GB VPS
- **Fix**: Add temporary Linux Swap space (takes 30 seconds):
  ```bash
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
  ```
  Now re-run `npm run build`.

### Issue: Let's Encrypt Certificate Renewal
Let's Encrypt certificates renew automatically via a systemd timer. You can test renewal anytime with:
```bash
certbot renew --dry-run
```

---

**DIU Industrial Innovation Centre (IIC)**
Daffodil International University · Ashulia Smart Campus
Website: [https://daffodilvarsity.edu.bd](https://daffodilvarsity.edu.bd)
