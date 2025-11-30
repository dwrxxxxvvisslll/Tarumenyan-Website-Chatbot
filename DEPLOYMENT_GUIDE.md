# 🚀 Tarumenyan Chatbot - VPS Deployment Guide

## Server Information
- **VPS IP**: 212.85.27.193
- **Domain**: dwraputradev.com
- **SSH User**: Wiradanaputra
- **OS**: Ubuntu 22.04 LTS (assumed)

---

## 📋 Deployment Checklist

### Pre-deployment (Local)
- [ ] Test local backend: `node server.js`
- [ ] Test local frontend: `npm run dev`
- [ ] Build frontend: `npm run build`
- [ ] Verify Supabase credentials in `.env`
- [ ] Commit all changes to Git (optional backup)

### VPS Setup
- [ ] SSH connection successful
- [ ] System updated (apt update & upgrade)
- [ ] Node.js 18+ installed
- [ ] Python 3.8-3.10 installed
- [ ] Nginx installed
- [ ] PM2 installed
- [ ] UFW firewall configured

### Backend Deployment
- [ ] Backend files uploaded to VPS
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` configured
- [ ] PM2 running backend
- [ ] Backend accessible on port 3001

### Rasa Deployment
- [ ] Python virtual environment created
- [ ] Rasa installed
- [ ] Rasa model uploaded
- [ ] Rasa Actions running (port 5055)
- [ ] Rasa Core running (port 5005)

### Frontend Deployment
- [ ] Frontend build uploaded
- [ ] Served by Nginx
- [ ] Accessible on port 80

### Nginx Configuration
- [ ] Reverse proxy for backend (/api)
- [ ] Reverse proxy for Rasa (/rasa)
- [ ] Static files serving (React)
- [ ] Domain configured

### SSL/HTTPS
- [ ] Certbot installed
- [ ] SSL certificate generated
- [ ] Auto-renewal configured
- [ ] HTTPS redirect enabled

### Final Testing
- [ ] Frontend loads: https://dwraputradev.com
- [ ] API works: https://dwraputradev.com/api/packages
- [ ] Chatbot works: Test chat functionality
- [ ] Admin login works
- [ ] Gallery/Packages/FAQ CRUD works

---

## 🔧 Troubleshooting Checklist

### If Backend Fails
- [ ] Check PM2 logs: `pm2 logs backend`
- [ ] Check port 3001: `lsof -i:3001`
- [ ] Verify `.env` file exists
- [ ] Check Supabase connection

### If Rasa Fails
- [ ] Check Rasa logs in `logs/` folder
- [ ] Verify Python version: `python3 --version`
- [ ] Check virtual environment activated
- [ ] Verify model file exists

### If Nginx Fails
- [ ] Check config: `nginx -t`
- [ ] Check error log: `tail -f /var/log/nginx/error.log`
- [ ] Verify permissions on build folder
- [ ] Check if port 80/443 open

### If Domain Not Working
- [ ] Check DNS propagation: `nslookup dwraputradev.com`
- [ ] Wait 15-60 minutes for DNS
- [ ] Clear browser cache
- [ ] Try incognito mode

---

## 📞 Quick Commands Reference

### SSH Connection
```bash
ssh Wiradanaputra@212.85.27.193
```

### PM2 Management
```bash
pm2 list                    # List all processes
pm2 logs backend            # View backend logs
pm2 restart backend         # Restart backend
pm2 stop backend            # Stop backend
pm2 delete backend          # Remove from PM2
```

### Nginx Management
```bash
sudo nginx -t               # Test config
sudo systemctl restart nginx
sudo systemctl status nginx
```

### Check Running Services
```bash
lsof -i:3001    # Backend
lsof -i:5005    # Rasa Core
lsof -i:5055    # Rasa Actions
lsof -i:80      # Nginx HTTP
lsof -i:443     # Nginx HTTPS
```

---

## 🔐 Security Notes

- **IMPORTANT**: Change SSH password after first login:
  ```bash
  passwd
  ```

- **Firewall Rules** (will be configured):
  - Port 22: SSH (restricted to your IP)
  - Port 80: HTTP (public)
  - Port 443: HTTPS (public)
  - Ports 3001, 5005, 5055: Internal only (blocked from public)

---

## 📝 Post-Deployment Maintenance

### Daily
- Monitor PM2 processes: `pm2 monit`
- Check disk space: `df -h`

### Weekly
- Check logs for errors
- Update system: `apt update && apt upgrade`

### Monthly
- Renew SSL (auto via Certbot cron)
- Backup database (Supabase auto-backup)
- Check PM2 startup script

---

## 🆘 Emergency Contacts

- **Hostinger Support**: https://www.hostinger.com/cpanel-login
- **Supabase Support**: https://supabase.com/dashboard
- **DNS Check**: https://dnschecker.org

---

Generated: 2025-12-01
Server: VPS Hostinger (212.85.27.193)
