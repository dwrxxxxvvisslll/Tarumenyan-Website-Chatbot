#!/bin/bash

#########################################################
# Tarumenyan Chatbot - Automated VPS Deployment Script
# Server: 212.85.27.193 (Hostinger VPS)
# Domain: dwraputradev.com
#########################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="dwraputradev.com"
BACKEND_PORT=3001
RASA_CORE_PORT=5005
RASA_ACTIONS_PORT=5055
PROJECT_DIR="/var/www/tarumenyan"
GIT_REPO="https://github.com/dwrxxxxvvisslll/Tarumenyan-Website-Chatbot.git"

# Print colored message
print_msg() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_header() {
    echo ""
    echo -e "${BLUE}════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}════════════════════════════════════════${NC}"
    echo ""
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    print_error "Please do not run this script as root. Run as normal user (Wiradanaputra)"
    exit 1
fi

print_header "🚀 TARUMENYAN CHATBOT - AUTOMATED DEPLOYMENT"

echo "This script will deploy the full stack to your VPS:"
echo "  ✓ Node.js Backend (port $BACKEND_PORT)"
echo "  ✓ Rasa Chatbot (ports $RASA_CORE_PORT, $RASA_ACTIONS_PORT)"
echo "  ✓ React Frontend (served by Nginx)"
echo "  ✓ Nginx Reverse Proxy"
echo "  ✓ SSL Certificate (HTTPS)"
echo ""
echo "Estimated time: 20-30 minutes"
echo ""
read -p "Press Enter to continue or Ctrl+C to cancel..."

#########################################################
# STEP 1: System Update & Dependencies
#########################################################
print_header "📦 STEP 1/8: Installing System Dependencies"

print_msg "Updating system packages..."
sudo apt update -qq

print_msg "Installing essential tools..."
sudo apt install -y curl wget git build-essential software-properties-common ufw

#########################################################
# STEP 2: Install Node.js
#########################################################
print_header "📦 STEP 2/8: Installing Node.js 18 LTS"

if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    print_warning "Node.js already installed: $NODE_VERSION"
else
    print_msg "Installing Node.js via NodeSource..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt install -y nodejs
    print_msg "Node.js installed: $(node -v)"
fi

print_msg "Installing PM2 process manager..."
sudo npm install -g pm2

#########################################################
# STEP 3: Install Python & Rasa
#########################################################
print_header "🐍 STEP 3/8: Installing Python & Rasa"

print_msg "Installing Python 3.10..."
sudo apt install -y python3 python3-pip python3-venv python3-dev

PYTHON_VERSION=$(python3 --version)
print_msg "Python installed: $PYTHON_VERSION"

#########################################################
# STEP 4: Install Nginx
#########################################################
print_header "🌐 STEP 4/8: Installing Nginx"

if command -v nginx &> /dev/null; then
    print_warning "Nginx already installed"
else
    sudo apt install -y nginx
    print_msg "Nginx installed"
fi

#########################################################
# STEP 5: Clone Project from Git
#########################################################
print_header "📥 STEP 5/8: Cloning Project from GitHub"

if [ -d "$PROJECT_DIR" ]; then
    print_warning "Project directory exists. Backing up..."
    sudo mv "$PROJECT_DIR" "${PROJECT_DIR}_backup_$(date +%s)"
fi

print_msg "Cloning repository..."
sudo mkdir -p $(dirname "$PROJECT_DIR")
sudo git clone "$GIT_REPO" "$PROJECT_DIR" || {
    print_error "Failed to clone repository. Please check:"
    print_error "1. Git URL is correct"
    print_error "2. Repository is public OR you have SSH key configured"
    exit 1
}

sudo chown -R $USER:$USER "$PROJECT_DIR"
cd "$PROJECT_DIR"

print_msg "Repository cloned successfully!"

#########################################################
# STEP 6: Setup Backend
#########################################################
print_header "⚙️  STEP 6/8: Setting up Backend"

cd "$PROJECT_DIR/tarumenyan/backend-trm"

print_msg "Installing backend dependencies..."
npm install --production

print_msg "Checking .env file..."
if [ ! -f ".env" ]; then
    print_warning ".env not found. Creating from template..."
    cat > .env << 'EOF'
# Supabase Configuration
SUPABASE_URL=https://zwcyoejxbgqgrvzrcmtc.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3Y3lvZWp4YmdxZ3J2enJjbXRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1MjQ5NTcsImV4cCI6MjA4MDEwMDk1N30.2xZFg0Ia7BusegTYvMVzN8ZrMFG8WlS0io9f2lhvuUU
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3Y3lvZWp4YmdxZ3J2enJjbXRjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDUyNDk1NywiZXhwIjoyMDgwMTAwOTU3fQ.JVpZzb4CZ2Xvy-7fPl5rIRQOS1J85ZQAFJWdwb42LUs

# JWT Secret
JWT_SECRET=tarumenyan_jwt_production_secret_$(openssl rand -hex 32)

# Server Configuration
PORT=3001
NODE_ENV=production
EOF
    print_msg ".env file created"
fi

print_msg "Starting backend with PM2..."
pm2 delete tarumenyan-backend 2>/dev/null || true
pm2 start server.js --name tarumenyan-backend --env production
pm2 save
pm2 startup | grep -v "PM2" | sudo bash || true

print_msg "Backend is running on port $BACKEND_PORT"

#########################################################
# STEP 7: Setup Rasa
#########################################################
print_header "🤖 STEP 7/8: Setting up Rasa Chatbot"

cd "$PROJECT_DIR"

# Check if Rasa directory exists
if [ ! -d "actions" ] || [ ! -d "data" ]; then
    print_warning "Rasa files not found in root. Skipping Rasa setup."
    print_warning "You can setup Rasa manually later if needed."
else
    print_msg "Creating Python virtual environment..."
    python3 -m venv rasa-venv
    source rasa-venv/bin/activate

    print_msg "Installing Rasa (this may take 5-10 minutes)..."
    pip install --upgrade pip
    pip install rasa

    # Check if model exists
    if [ -f "models/*.tar.gz" ]; then
        print_msg "Rasa model found"
    else
        print_warning "No Rasa model found. Training model..."
        rasa train
    fi

    print_msg "Starting Rasa Action Server..."
    pm2 delete tarumenyan-rasa-actions 2>/dev/null || true
    pm2 start rasa-venv/bin/rasa --name tarumenyan-rasa-actions -- run actions --port $RASA_ACTIONS_PORT

    sleep 3

    print_msg "Starting Rasa Core Server..."
    pm2 delete tarumenyan-rasa-core 2>/dev/null || true
    pm2 start rasa-venv/bin/rasa --name tarumenyan-rasa-core -- run --enable-api --cors "*" --port $RASA_CORE_PORT

    pm2 save

    deactivate
    print_msg "Rasa is running!"
fi

#########################################################
# STEP 8: Build & Deploy Frontend
#########################################################
print_header "🎨 STEP 8/8: Building & Deploying Frontend"

cd "$PROJECT_DIR/tarumenyan/tarumenyan-web"

# Create production env file
print_msg "Creating production environment config..."
cat > .env.production << EOF
VITE_BACKEND_URL=https://$DOMAIN
VITE_RASA_URL=https://$DOMAIN/rasa
EOF

print_msg "Installing frontend dependencies..."
npm install

print_msg "Building frontend for production..."
npm run build

print_msg "Deploying frontend to Nginx..."
sudo mkdir -p /var/www/html/tarumenyan
sudo cp -r dist/* /var/www/html/tarumenyan/
sudo chown -R www-data:www-data /var/www/html/tarumenyan

#########################################################
# STEP 9: Configure Nginx
#########################################################
print_header "🌐 Configuring Nginx"

print_msg "Creating Nginx configuration..."
sudo tee /etc/nginx/sites-available/tarumenyan > /dev/null << 'NGINXCONF'
server {
    listen 80;
    server_name dwraputradev.com www.dwraputradev.com;

    root /var/www/html/tarumenyan;
    index index.html;

    # Frontend - React SPA
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache";
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Rasa Webhook
    location /rasa/ {
        proxy_pass http://localhost:5005/webhooks/rest/webhook;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
NGINXCONF

print_msg "Enabling site..."
sudo ln -sf /etc/nginx/sites-available/tarumenyan /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

print_msg "Testing Nginx configuration..."
sudo nginx -t

print_msg "Restarting Nginx..."
sudo systemctl restart nginx
sudo systemctl enable nginx

#########################################################
# STEP 10: Setup Firewall
#########################################################
print_header "🔒 Configuring Firewall"

print_msg "Setting up UFW firewall..."
sudo ufw --force reset
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp comment 'SSH'
sudo ufw allow 80/tcp comment 'HTTP'
sudo ufw allow 443/tcp comment 'HTTPS'
sudo ufw --force enable

print_msg "Firewall configured!"

#########################################################
# STEP 11: Setup SSL (HTTPS)
#########################################################
print_header "🔐 Setting up SSL Certificate"

print_msg "Installing Certbot..."
sudo apt install -y certbot python3-certbot-nginx

print_msg "Obtaining SSL certificate for $DOMAIN..."
print_warning "Make sure DNS has propagated before continuing!"
read -p "Press Enter when DNS is ready (check: ping $DOMAIN)..."

sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email noreply@$DOMAIN --redirect || {
    print_warning "SSL setup failed. You can run this manually later:"
    print_warning "sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
}

#########################################################
# DEPLOYMENT COMPLETE!
#########################################################
print_header "✅ DEPLOYMENT COMPLETED SUCCESSFULLY!"

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}   🎉 Tarumenyan Chatbot is now LIVE! 🎉${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}🌐 Your Website:${NC}"
echo "   Frontend:  https://$DOMAIN"
echo "   Backend:   https://$DOMAIN/api/packages"
echo "   Chatbot:   https://$DOMAIN (test the chat widget)"
echo ""
echo -e "${BLUE}📊 Server Status:${NC}"
pm2 list
echo ""
echo -e "${BLUE}📝 Useful Commands:${NC}"
echo "   View backend logs:    pm2 logs tarumenyan-backend"
echo "   View Rasa logs:       pm2 logs tarumenyan-rasa-core"
echo "   Restart backend:      pm2 restart tarumenyan-backend"
echo "   Restart Nginx:        sudo systemctl restart nginx"
echo "   View Nginx logs:      sudo tail -f /var/log/nginx/error.log"
echo ""
echo -e "${BLUE}🔧 Next Steps:${NC}"
echo "   1. Test website: https://$DOMAIN"
echo "   2. Login as admin (if needed)"
echo "   3. Test chatbot functionality"
echo "   4. Upload gallery images, packages, FAQ, reviews"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT:${NC}"
echo "   - Keep this terminal session for monitoring"
echo "   - PM2 will auto-restart services if they crash"
echo "   - SSL certificate will auto-renew every 90 days"
echo "   - Firewall is enabled (only ports 22, 80, 443 open)"
echo ""
echo -e "${GREEN}Deployment finished at: $(date)${NC}"
echo ""
