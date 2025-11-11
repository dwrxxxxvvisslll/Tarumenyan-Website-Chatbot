# Setup Supabase untuk Data Riset Prewedding

Tujuan: menyimpan data dari `/Users/dwraputra/Code/ChatbotV2/data_riset_prewedding.csv` ke database Supabase dan otomatis menyimpan setiap kali action `action_simpan_data_riset` dipanggil.

## 1) Buat proyek Supabase
- Masuk ke https://supabase.com dan buat project baru.
- Catat `Project URL` (contoh: `https://xyzcompany.supabase.co`). (https://bkyaunwnobgfikbktttp.supabase.co)
- Catat `Service role key` dari tab `Settings > API` (jaga rahasia, jangan commit ke repo).

## 2) Buat tabel
- Buka menu `SQL` di Supabase.
- Copy-paste isi file `scripts/supabase_schema.sql` lalu `Run`.

## 3) Set environment variables
Action server membaca env berikut:
- `SUPABASE_URL`  → Project URL Supabase
- `SUPABASE_SERVICE_KEY` → Service role key
- Opsional: `SUPABASE_TABLE` (default: `data_riset_prewedding`)
 - Opsional: `SUPABASE_ENABLED` (default: `true`) — set ke `false` untuk menonaktifkan insert Supabase tanpa mengubah env lain.

Contoh menjalankan action server dengan env:

```bash
export SUPABASE_URL="https://<YOUR_PROJECT>.supabase.co"
export SUPABASE_SERVICE_KEY="<YOUR_SERVICE_ROLE_KEY>"
# default-nya aktif; untuk eksplisit bisa set:
export SUPABASE_ENABLED=true
RASA_TELEMETRY_ENABLED=false ./venv/bin/rasa run actions --port 5055
```

Jika menggunakan `server.js` atau proses lain, pastikan env tersebut tersedia untuk proses action server.

## 4) Impor CSV historis
Jalankan skrip impor untuk mengunggah isi CSV saat ini:

```bash
export SUPABASE_URL="https://<YOUR_PROJECT>.supabase.co"
export SUPABASE_SERVICE_KEY="<YOUR_SERVICE_ROLE_KEY>"
python scripts/import_csv_to_supabase.py /Users/dwraputra/Code/ChatbotV2/data_riset_prewedding.csv
```

Skrip akan melakukan upsert berdasarkan pasangan `(conversation_id, timestamp)` sehingga duplikasi dihindari.

## 5) Verifikasi
- Buka `Table Editor` Supabase dan cek tabel `data_riset_prewedding`.
- Lakukan satu percakapan di chatbot hingga data tersimpan; periksa bahwa baris baru tampil di tabel.
- Atau jalankan skrip verifikasi otomatis:

```bash
export SUPABASE_URL="https://<YOUR_PROJECT>.supabase.co"
# gunakan ANON KEY bila RLS mengizinkan read publik; jika tidak, SERVICE ROLE KEY
export SUPABASE_ANON_KEY="<YOUR_ANON_KEY>"
# fallback (opsional): export SUPABASE_SERVICE_KEY="<YOUR_SERVICE_ROLE_KEY>"

python scripts/verify_supabase_and_csv.py --limit 3
# filter percakapan tertentu
python scripts/verify_supabase_and_csv.py --cid supabase-test-1 --limit 1
```

## 6) Kebijakan akses (opsional)
File `supabase_schema.sql` mengaktifkan RLS dan menambahkan kebijakan dasar: semua user bisa baca, user `authenticated` bisa insert. Proses impor dan penyimpanan action memakai `Service role key` sehingga melewati RLS secara aman. Sesuaikan kebijakan bila diperlukan.

## 7) Jalankan/Hentikan server dengan skrip

Agar mudah, tersedia skrip untuk menjalankan kedua server (Actions dan Rasa) sekaligus, menyimpan log, dan membuat file PID untuk shutdown mudah.

Langkah persiapan:

```bash
cp scripts/.env.local.example scripts/.env.local
# Edit scripts/.env.local dan isi SUPABASE_URL serta SUPABASE_SERVICE_KEY (opsional: SUPABASE_ANON_KEY)
```

Jalankan server:

```bash
bash scripts/run_servers.sh
```

Hentikan server:

```bash
bash scripts/stop_servers.sh
```

Lokasi log:

- Action server: `scripts/logs/actions_server.log`
- Rasa server: `scripts/logs/rasa_server.log`

PID file: `scripts/server_pids.json`

Catatan:

- Jika `SUPABASE_ENABLED=true` tetapi kredensial tidak diisi, server tetap berjalan; insert ke Supabase akan dilewati.
- Penyimpanan ke CSV selalu aktif terlepas dari toggle Supabase.
- Port default: `ACTIONS_PORT=5055`, `RASA_PORT=5005`, `CORS=*` (semua origin). Konfigurasi via `.env.local`.
