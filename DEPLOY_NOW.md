# 🚀 Deploy Tarumenyan ke VPS - Tutorial Super Mudah!

## ✅ Persiapan (Sudah Selesai)
- ✅ Code sudah di-push ke GitHub
- ✅ Deployment script sudah siap
- ✅ VPS sudah aktif
- ✅ Domain sudah dikonfigurasi

---

## 📝 LANGKAH 1: Buka Terminal

**Mac:**
1. Buka **Spotlight** (Cmd + Space)
2. Ketik **"Terminal"**
3. Tekan Enter

**Windows:**
1. Tekan **Win + R**
2. Ketik **"cmd"** atau **"powershell"**
3. Tekan Enter

---

## 📝 LANGKAH 2: SSH ke VPS

Copy-paste command ini ke terminal:

```bash
ssh Wiradanaputra@212.85.27.193
```

**Akan muncul pertanyaan:**
```
The authenticity of host '212.85.27.193' can't be established.
Are you sure you want to continue connecting (yes/no)?
```

**Ketik:** `yes` lalu Enter

**Akan minta password:**
```
Wiradanaputra@212.85.27.193's password:
```

**Copy-paste password ini:**
```
ikRho'NhvN?spzXLv)K9
```

**⚠️ PENTING:** Password tidak akan terlihat saat Anda paste. Ini normal! Langsung tekan Enter saja.

**Jika berhasil, akan muncul:**
```
Welcome to Ubuntu 22.04 LTS
Wiradanaputra@vps-xxxxx:~$
```

🎉 **Anda sudah masuk ke VPS!**

---

## 📝 LANGKAH 3: Download & Jalankan Deployment Script

Copy-paste command ini **SATU PER SATU**:

### 3.1. Download deployment script dari GitHub
```bash
wget https://raw.githubusercontent.com/dwrxxxxvvisslll/Tarumenyan-Website-Chatbot/main/deploy-vps.sh
```

### 3.2. Beri permission untuk execute
```bash
chmod +x deploy-vps.sh
```

### 3.3. Jalankan deployment script
```bash
./deploy-vps.sh
```

---

## ⏳ LANGKAH 4: Tunggu Proses Deployment (20-30 menit)

Script akan otomatis:
- ✅ Install Node.js, Python, Nginx
- ✅ Clone project dari GitHub
- ✅ Install dependencies
- ✅ Setup backend & Rasa
- ✅ Build frontend
- ✅ Configure Nginx
- ✅ Setup SSL/HTTPS

**Anda akan diminta input beberapa kali:**

### 4.1. Pertama kali run
```
Press Enter to continue or Ctrl+C to cancel...
```
**→ Tekan Enter**

### 4.2. Saat setup SSL (di akhir)
```
Make sure DNS has propagated before continuing!
Press Enter when DNS is ready (check: ping dwraputradev.com)...
```

**→ Test DNS dulu dengan buka tab terminal baru:**
```bash
ping dwraputradev.com
```

**Jika sudah muncul IP 212.85.27.193, berarti DNS sudah ready!**

**→ Kembali ke terminal VPS dan tekan Enter**

---

## 📝 LANGKAH 5: Cek Status Deployment

Setelah script selesai, cek status dengan:

```bash
pm2 list
```

**Harusnya muncul:**
```
┌─────┬──────────────────────┬─────────┬─────────┐
│ id  │ name                 │ status  │ restart │
├─────┼──────────────────────┼─────────┼─────────┤
│ 0   │ tarumenyan-backend   │ online  │ 0       │
│ 1   │ tarumenyan-rasa-...  │ online  │ 0       │
└─────┴──────────────────────┴─────────┴─────────┘
```

**✅ Status "online" = Berhasil!**

---

## 🌐 LANGKAH 6: Test Website

Buka browser dan akses:

### Test 1: Frontend
```
https://dwraputradev.com
```
**✅ Harusnya muncul website Tarumenyan**

### Test 2: Backend API
```
https://dwraputradev.com/api/packages
```
**✅ Harusnya muncul data JSON (bisa kosong [])**

### Test 3: Chatbot
```
https://dwraputradev.com
```
**→ Klik icon chat di pojok kanan bawah**
**→ Ketik "Halo"**
**✅ Bot harusnya merespons**

---

## 🎯 Troubleshooting

### ❌ Problem: "Connection refused" saat SSH
**Solusi:**
- Pastikan VPS sudah aktif di Hostinger panel
- Cek IP benar: `212.85.27.193`
- Coba restart VPS dari panel Hostinger

### ❌ Problem: "Permission denied" saat SSH
**Solusi:**
- Pastikan password benar (copy-paste dari sini)
- Pastikan username: `Wiradanaputra` (huruf W besar)

### ❌ Problem: Website belum bisa diakses
**Solusi:**
- Tunggu DNS propagate (bisa sampai 1 jam)
- Cek DNS: `ping dwraputradev.com` harusnya 212.85.27.193
- Clear browser cache (Ctrl + Shift + Delete)
- Coba incognito mode

### ❌ Problem: PM2 status "errored"
**Solusi:**
```bash
# Lihat error log
pm2 logs tarumenyan-backend

# Restart service
pm2 restart tarumenyan-backend
```

### ❌ Problem: SSL gagal
**Solusi:**
- Tunggu DNS propagate dulu (15-60 menit)
- Jalankan manual:
```bash
sudo certbot --nginx -d dwraputradev.com -d www.dwraputradev.com
```

---

## 📊 Monitoring (Opsional)

### Lihat log backend real-time:
```bash
pm2 logs tarumenyan-backend
```

### Lihat log Nginx:
```bash
sudo tail -f /var/log/nginx/error.log
```

### Restart semua service:
```bash
pm2 restart all
```

---

## 🎓 Untuk Sidang/Presentasi

**Pastikan ready:**
- ✅ Website bisa diakses dari berbagai device
- ✅ Chatbot bisa merespons
- ✅ Admin panel bisa login (jika ada)
- ✅ Test semua fitur (Gallery, Packages, FAQ, Review)

**Siapkan backup plan:**
- Ambil screenshot website yang sudah jalan
- Buat video demo chatbot
- Print log deployment sebagai bukti

---

## ⚠️ PENTING: Setelah Sidang

Jika Anda mau cancel VPS (untuk hemat biaya):

1. **Backup dulu:**
   - Download code dari GitHub (sudah ada)
   - Export chat history dari Supabase (jika perlu untuk laporan)

2. **Cancel VPS:**
   - Login ke Hostinger panel
   - Cancel subscription VPS

3. **Keep domain:**
   - Domain bisa tetap aktif (untuk portfolio)
   - Bisa point ke GitHub Pages atau Vercel gratis

---

## 📞 Contact

Jika ada masalah saat deployment:
- Check logs: `pm2 logs`
- Check Nginx: `sudo nginx -t`
- Restart services: `pm2 restart all && sudo systemctl restart nginx`

---

**Good luck dengan sidang! 🎓🚀**
