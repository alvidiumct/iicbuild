import React, { useState } from 'react';
import {
  Server,
  Terminal,
  Copy,
  Check,
  X,
  Shield,
  Layers,
  Globe,
  FileCode,
  HardDrive,
  Cpu,
  Download,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';

interface VpsDeploymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VpsDeploymentModal: React.FC<VpsDeploymentModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'nginx' | 'docker' | 'pm2' | 'sftp' | 'script'>('nginx');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const nginxConfigSnippet = `server {
    listen 80;
    listen [::]:80;
    server_name iic.yourdomain.com YOUR_SERVER_IP;

    root /var/www/iic-platform/dist;
    index index.html index.htm;

    # Gzip compression for high performance
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/javascript application/javascript application/json image/svg+xml;

    # Cache static assets
    location ~* \\.(?:ico|css|js|gif|jpe?g|png|woff2?|svg)$ {
        expires 6M;
        access_log off;
        add_header Cache-Control "public, max-age=15552000, immutable";
    }

    # CRITICAL: SPA Fallback for client-side routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    error_page 404 /index.html;
}`;

  const deployScriptSnippet = `#!/usr/bin/env bash
set -e
cd /var/www/iic-platform
git pull origin main || true
npm install --silent
npm run build
chown -R www-data:www-data dist/
chmod -R 755 dist/
systemctl reload nginx
echo "Deployment completed successfully!"`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-start justify-between gap-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#214FA2] text-white flex items-center justify-center shadow-md">
              <Server className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                  VPS Production Deployment Guide
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Production Ready
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Step-by-step instructions for hosting on Ubuntu/Debian VPS with Nginx, Docker, or PM2
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Close Guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50 px-4 sm:px-6 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('nginx')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'nginx'
                ? 'border-[#214FA2] text-[#214FA2]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Method 1: Nginx (Recommended)</span>
          </button>
          <button
            onClick={() => setActiveTab('docker')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'docker'
                ? 'border-[#214FA2] text-[#214FA2]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Method 2: Docker</span>
          </button>
          <button
            onClick={() => setActiveTab('pm2')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'pm2'
                ? 'border-[#214FA2] text-[#214FA2]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Method 3: Node / PM2</span>
          </button>
          <button
            onClick={() => setActiveTab('sftp')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'sftp'
                ? 'border-[#214FA2] text-[#214FA2]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>Method 4: SFTP / FileZilla</span>
          </button>
          <button
            onClick={() => setActiveTab('script')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'script'
                ? 'border-[#214FA2] text-[#214FA2]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Automated 1-Click Script</span>
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-slate-800">
          {/* Quick Specs Callout */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px] block">
                Recommended OS
              </span>
              <span className="font-bold text-slate-900">Ubuntu 22.04 or 24.04 LTS</span>
            </div>
            <div>
              <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px] block">
                Hardware Specs
              </span>
              <span className="font-bold text-slate-900">1 vCPU · 1 GB RAM · 20GB SSD</span>
            </div>
            <div>
              <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px] block">
                Free SSL HTTPS
              </span>
              <span className="font-bold text-emerald-600">Let's Encrypt (Certbot)</span>
            </div>
          </div>

          {/* TAB 1: NGINX */}
          {activeTab === 'nginx' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#214FA2] text-white text-[11px] font-bold flex items-center justify-center">
                    1
                  </span>
                  <span>Connect to your VPS & Install Node.js + Nginx</span>
                </h3>
                <p className="text-xs text-slate-600">
                  SSH into your server and run this command to install Git, Node.js 20 LTS, Nginx, and Certbot:
                </p>
                <div className="relative group">
                  <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg text-xs font-mono overflow-x-auto">
{`# Connect to your server
ssh root@YOUR_SERVER_IP

# Update packages and install prerequisites
apt update && apt upgrade -y
apt install -y curl git ufw nginx certbot python3-certbot-nginx

# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs`}
                  </pre>
                  <button
                    onClick={() =>
                      handleCopy(
                        'nginx-step1',
                        'apt update && apt upgrade -y\napt install -y curl git ufw nginx certbot python3-certbot-nginx\ncurl -fsSL https://deb.nodesource.com/setup_20.x | bash -\napt install -y nodejs'
                      )
                    }
                    className="absolute top-2 right-2 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium flex items-center gap-1 border border-slate-700"
                  >
                    {copiedKey === 'nginx-step1' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'nginx-step1' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#214FA2] text-white text-[11px] font-bold flex items-center justify-center">
                    2
                  </span>
                  <span>Set Up Project Directory & Build Static Assets</span>
                </h3>
                <div className="relative group">
                  <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg text-xs font-mono overflow-x-auto">
{`# Create target directory
mkdir -p /var/www/iic-platform
cd /var/www/iic-platform

# Clone repository or upload your files here
# git clone <YOUR_REPO_URL> .

# Install dependencies and build
npm install
npm run build

# Set permissions for web server
chown -R www-data:www-data /var/www/iic-platform/dist
chmod -R 755 /var/www/iic-platform/dist`}
                  </pre>
                  <button
                    onClick={() =>
                      handleCopy(
                        'nginx-step2',
                        'mkdir -p /var/www/iic-platform\ncd /var/www/iic-platform\nnpm install\nnpm run build\nchown -R www-data:www-data /var/www/iic-platform/dist\nchmod -R 755 /var/www/iic-platform/dist'
                      )
                    }
                    className="absolute top-2 right-2 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium flex items-center gap-1 border border-slate-700"
                  >
                    {copiedKey === 'nginx-step2' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'nginx-step2' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#214FA2] text-white text-[11px] font-bold flex items-center justify-center">
                    3
                  </span>
                  <span>Create Nginx Server Block with SPA Routing</span>
                </h3>
                <p className="text-xs text-slate-600">
                  Save this in <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">/etc/nginx/sites-available/iic-platform</code>:
                </p>
                <div className="relative group">
                  <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg text-xs font-mono overflow-x-auto">
{nginxConfigSnippet}
                  </pre>
                  <button
                    onClick={() => handleCopy('nginx-config', nginxConfigSnippet)}
                    className="absolute top-2 right-2 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium flex items-center gap-1 border border-slate-700"
                  >
                    {copiedKey === 'nginx-config' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'nginx-config' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#214FA2] text-white text-[11px] font-bold flex items-center justify-center">
                    4
                  </span>
                  <span>Enable Site, Reload Nginx & Secure with SSL (Certbot)</span>
                </h3>
                <div className="relative group">
                  <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg text-xs font-mono overflow-x-auto">
{`# Enable configuration
ln -s /etc/nginx/sites-available/iic-platform /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test syntax and reload
nginx -t
systemctl restart nginx

# Configure free SSL with Let's Encrypt
certbot --nginx -d iic.yourdomain.com`}
                  </pre>
                  <button
                    onClick={() =>
                      handleCopy(
                        'nginx-step4',
                        'ln -s /etc/nginx/sites-available/iic-platform /etc/nginx/sites-enabled/\nrm -f /etc/nginx/sites-enabled/default\nnginx -t\nsystemctl restart nginx\ncertbot --nginx -d iic.yourdomain.com'
                      )
                    }
                    className="absolute top-2 right-2 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium flex items-center gap-1 border border-slate-700"
                  >
                    {copiedKey === 'nginx-step4' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'nginx-step4' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DOCKER */}
          {activeTab === 'docker' && (
            <div className="space-y-5">
              <p className="text-xs text-slate-600">
                Docker allows containerized execution with zero host dependencies other than Docker itself. The repository includes a production multi-stage <code className="font-mono bg-slate-100 px-1">Dockerfile</code> and <code className="font-mono bg-slate-100 px-1">docker-compose.yml</code>.
              </p>

              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  1. Install Docker on your VPS
                </h4>
                <div className="relative group">
                  <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg text-xs font-mono overflow-x-auto">
{`curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
apt install -y docker-compose-plugin`}
                  </pre>
                  <button
                    onClick={() => handleCopy('docker-install', 'curl -fsSL https://get.docker.com -o get-docker.sh\nsh get-docker.sh\napt install -y docker-compose-plugin')}
                    className="absolute top-2 right-2 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium flex items-center gap-1 border border-slate-700"
                  >
                    {copiedKey === 'docker-install' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'docker-install' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  2. Build and Launch with Docker Compose
                </h4>
                <div className="relative group">
                  <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg text-xs font-mono overflow-x-auto">
{`cd /var/www/iic-platform
docker compose up -d --build`}
                  </pre>
                  <button
                    onClick={() => handleCopy('docker-up', 'cd /var/www/iic-platform\ndocker compose up -d --build')}
                    className="absolute top-2 right-2 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium flex items-center gap-1 border border-slate-700"
                  >
                    {copiedKey === 'docker-up' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'docker-up' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PM2 */}
          {activeTab === 'pm2' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600">
                You can serve the static build using Node.js and PM2's built-in static server:
              </p>
              <div className="relative group">
                <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg text-xs font-mono overflow-x-auto">
{`# Install PM2 and serve globally
npm install -g pm2 serve

# Build application
cd /var/www/iic-platform
npm install
npm run build

# Start persistent process
pm2 serve dist 3000 --spa --name "diu-iic-platform"

# Save for auto-reboot
pm2 save
pm2 startup`}
                </pre>
                <button
                  onClick={() =>
                    handleCopy(
                      'pm2-run',
                      'npm install -g pm2 serve\ncd /var/www/iic-platform\nnpm install\nnpm run build\npm2 serve dist 3000 --spa --name "diu-iic-platform"\npm2 save\npm2 startup'
                    )
                  }
                  className="absolute top-2 right-2 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium flex items-center gap-1 border border-slate-700"
                >
                  {copiedKey === 'pm2-run' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'pm2-run' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: SFTP */}
          {activeTab === 'sftp' && (
            <div className="space-y-4 text-xs text-slate-600">
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900">
                <span className="font-bold block mb-1">Local Build Workflow (No terminal on server required)</span>
                If you prefer not to build on the VPS:
              </div>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Run <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">npm run build</code> locally on your computer.</li>
                <li>Open <strong>FileZilla</strong>, <strong>WinSCP</strong>, or <strong>Cyberduck</strong>.</li>
                <li>Connect using <strong>SFTP (SSH File Transfer Protocol)</strong> to your VPS IP on Port 22.</li>
                <li>Upload the entire generated <code className="font-mono bg-slate-100 px-1">dist/</code> folder into <code className="font-mono bg-slate-100 px-1">/var/www/iic-platform/dist/</code>.</li>
                <li>Set file permissions to <code className="font-mono bg-slate-100 px-1">www-data</code> and reload Nginx.</li>
              </ol>
            </div>
          )}

          {/* TAB 5: SCRIPT */}
          {activeTab === 'script' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600">
                Use the included <code className="font-mono bg-slate-100 px-1">deploy.sh</code> script to automate future updates with zero downtime:
              </p>
              <div className="relative group">
                <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg text-xs font-mono overflow-x-auto">
{deployScriptSnippet}
                </pre>
                <button
                  onClick={() => handleCopy('script-code', deployScriptSnippet)}
                  className="absolute top-2 right-2 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium flex items-center gap-1 border border-slate-700"
                >
                  {copiedKey === 'script-code' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'script-code' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Important Troubleshooting Tips */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-amber-950">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Critical Tip for React SPAs: Fix 404 on Refresh</span>
            </div>
            <p>
              In Single Page Applications, if a visitor refreshes on <code className="font-mono bg-amber-100 px-1">/projects</code> or <code className="font-mono bg-amber-100 px-1">/admin-tasks</code>, Nginx will return a 404 unless you configure <code className="font-mono bg-amber-100 px-1 font-semibold">try_files $uri $uri/ /index.html;</code> in your Nginx config. This forwards routing back to React!
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500 hidden sm:inline">
            Full documentation is also available in <code className="font-mono text-slate-700">/VPS_DEPLOYMENT_GUIDE.md</code>
          </span>
          <button
            onClick={onClose}
            className="ml-auto px-4 py-2 bg-[#214FA2] hover:bg-[#1a3f82] text-white font-semibold rounded-lg transition-colors"
          >
            Done Reading
          </button>
        </div>
      </div>
    </div>
  );
};
