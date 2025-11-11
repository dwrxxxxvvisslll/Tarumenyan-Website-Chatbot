# Demo Prompts (ID) — Variasi Natural per Intent

Catatan penggunaan:
- Gunakan kalimat natural di bawah untuk memicu intent saat demo.
- Untuk memaksa intent, kirim payload slash (mis. `/info_paket`) lewat UI/chat API.
- Setelah tombol cepat muncul, gunakan untuk menjaga alur tetap stabil.

## Slash Commands
`/greet`, `/isi_kuesioner`, `/cerita_kisah_cinta`, `/kisah_cinta_bali`, `/rekomendasi_dari_kisah`, `/lihat_detail_konsep`, `/info_paket`, `/info_konsep`, `/info_lokasi`, `/booking`, `/out_of_scope`, `/finance_oos`, `/pilih_tema_romantis`, `/pilih_tema_perdamaian`, `/pilih_tema_perjuangan`, `/jelaskan_legenda`

---

## greet
- Hai kak, boleh tanya?
- Halo min
- Om swastyastu
- Selamat pagi
- Permisi
- Hi there
- Rahajeng semeng
- Bisa dibantu?

## isi_kuesioner
- Tolong bantu pilih
- Butuh saran tema
- Tema apa yang recommended?
- Bisa kasih insight?
- Cocoknya yang mana?
- Bantu isi form
- Mau konsultasi
- Bingung pilih tema

## cerita_kisah_cinta
- Kami LDR sudah 4 tahun
- Orangtua sempat tidak setuju karena beda agama
- Jarak jauh bikin makin kuat
- Ketemu di acara langsung klik
- Pernah lewat fase toxic, sudah belajar
- Hubungan kami beda budaya
- Virtual couple
- Kerja beda kota

## kisah_cinta_bali
- Kisah cinta Bali
- Cerita legenda Bali
- Tunjukkan kisah Jayaprana Layonsari
- Referensi cerita dari Bali
- Mau lihat cerita cinta lokal
- Cerita Trunyan dan Danau Batur
- Ada kisah klasik romantis?

## rekomendasi_dari_kisah
- Rekomendasikan tema dari kisah ini
- Pilihkan tema yang cocok dari cerita ini
- Tema apa yang pas dari Sri Jaya Pangus?
- Minta rekomendasi dari Api Cinta
- Dari kisah pribumi turis, cocoknya tema apa?
- Cocoknya tema apa dari kisah ini?

## pilih_tema_romantis
- Pilih tema romantis ya
- Romantis yang soft
- Ambil konsep romantis
- Request tema romantis
- Classic romantic aja
- Soft and romantic

## pilih_tema_perdamaian
- Pilih tema perdamaian
- Konsep unity
- Tema ratu pantai kuta
- Meaningful concept
- Love conquers all
- Epic romance

## pilih_tema_perjuangan
- Tema perjuangan
- Konsep petualangan
- Journey together
- Overcoming obstacles
- Adventure couple
- Fighter couple

## lihat_detail_konsep
- Mau lihat detail Putri Ayu
- Tunjukkan detail Ratu Pantai Kuta
- Detail Manik Angkeran
- Jelaskan detail konsep romantis
- Lihat spesifikasi tema perdamaian

## jelaskan_legenda
- Jelaskan legenda Sri Jaya Pangus
- Ceritakan kisah Jayaprana Layonsari
- Jelaskan cerita Manik Angkeran
- Jelaskan legenda pantai kuta
- Cerita legenda Ulun Danu

## info_konsep
- Bisa jelasin konsep yang tersedia?
- Tema apa yang cocok buat kami?
- List tema apa saja?
- Ada konsep favorit belakangan ini?
- Minta info konsep terbaru
- Jelaskan konsep legenda yang ada

## info_paket
- Kisaran biaya prewedding gimana?
- Harga berapa?
- Budget berapa?
- Info pricing
- Minta price list
- Harga paket lengkap berapa

## info_lokasi
- Lokasinya di mana saja?
- Tempat foto di mana?
- Spot favorit apa?
- Bisa outdoor?
- Ada lokasi indoor?

## booking
- Mau booking paket
- Cara pesan gimana?
- Bisa reservasi?
- Hubungi siapa untuk pesanan?
- Saya mau order
- Tolong bantu booking

## out_of_scope
- Hahaha
- Cerita lucu dong
- Lagi ngapain?
- Tebak-tebakan
- Rental mobil bali
- Siapa presiden indonesia?

## finance_oos
- Harga bitcoin berapa sekarang?
- Berapa harga emas hari ini?
- Kurs dolar ke rupiah berapa?
- IHSG sekarang berapa?
- Suku bunga deposito berapa?
- Harga saham BCA berapa?
- Nilai tukar IDR ke USD berapa?
- Harga USD sekarang berapa?

## affirm
- Ya
- Iya
- Oke
- Baik
- Siap
- Betul

## deny
- Tidak
- Enggak
- Batal
- Skip
- Nanti dulu
- Kagak

## goodbye
- Terima kasih
- Makasih banyak
- Sampai jumpa
- Oke thanks
- Udah jelas
- See you

---

## Demo Alur Singkat A (end-to-end)
1. `/greet` atau "Halo kak, boleh tanya?"
2. `/isi_kuesioner` → "Butuh saran tema"
3. `/cerita_kisah_cinta` → "Kami LDR sudah 4 tahun"
4. `/rekomendasi_dari_kisah` → "Rekomendasikan tema dari kisah ini"
5. `/pilih_tema_romantis` → "Romantis yang soft"
6. `/lihat_detail_konsep` → "Mau lihat detail Putri Ayu"
7. `/info_paket` → "Kisaran biaya prewedding gimana?"
8. `/booking` → "Mau booking paket"
9. `/goodbye` → "Terima kasih"

## Demo Alur Singkat B (browsing kisah)
1. `/greet` atau "Om swastyastu"
2. `/kisah_cinta_bali` → "Kisah cinta Bali"
3. `/rekomendasi_dari_kisah` → "Cocoknya tema apa dari kisah ini?"
4. `/pilih_tema_perdamaian` → "Tema ratu pantai kuta"
5. `/info_lokasi` → "Lokasinya di mana saja?"
6. `/goodbye` → "Sampai jumpa"

## Tips Presentasi
- Mulai dengan tombol cepat, lanjutkan ke bahasa natural.
- Jika OOS finansial muncul, tunjukkan alternatif tombol relevan.
- Uji fallback dengan variasi tidak jelas; pastikan alur kembali ke fitur inti.
