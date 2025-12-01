from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker, FormValidationAction
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet, FollowupAction, ActiveLoop
import re
import pandas as pd
from datetime import datetime
import os
import requests

# ========== 1. VALIDATION FORM ==========
class ValidateKuesionerForm(FormValidationAction):
    """Validasi input form dengan feedback lebih baik"""
    
    def name(self) -> Text:
        return "validate_kuesioner_form"
    
    def validate_nama_pasangan(
        self,
        slot_value: Any,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> Dict[Text, Any]:
        """Validasi nama pasangan"""
        if not slot_value or len(slot_value.strip()) < 3:
            dispatcher.utter_message(
                text="Nama terlalu pendek. Mohon masukkan nama lengkap kalian berdua ya! 😊\nContoh: Budi & Ani"
            )
            return {"nama_pasangan": None}
        return {"nama_pasangan": slot_value.strip()}
    
    def validate_kisah_cinta(
        self,
        slot_value: Any,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> Dict[Text, Any]:
        """Validasi kisah cinta"""
        if not slot_value or len(slot_value.strip()) < 10:
            dispatcher.utter_message(
                text="Cerita terlalu singkat nih! Bisa cerita lebih detail? Misalnya gimana kalian ketemu, apa yang spesial dari hubungan kalian? 💕"
            )
            return {"kisah_cinta": None}
        return {"kisah_cinta": slot_value.strip()}
    
    def validate_kepuasan(
        self,
        slot_value: Any,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> Dict[Text, Any]:
        """Validasi rating kepuasan (legacy: jika masih ada di kuesioner_form)"""
        try:
            angka = re.findall(r'\d+', str(slot_value))
            if angka:
                rating = int(angka[0])
                if 1 <= rating <= 5:
                    return {"kepuasan": str(rating)}
            
            dispatcher.utter_message(
                text="Mohon masukkan angka 1-5 ya!\n(1=tidak puas, 5=sangat puas)"
            )
            return {"kepuasan": None}
        except:
            dispatcher.utter_message(text="Mohon masukkan angka antara 1-5.")
            return {"kepuasan": None}
    
    def validate_budget(
        self,
        slot_value: Any,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> Dict[Text, Any]:
        """Validasi budget"""
        value = str(slot_value).lower().strip()
        
        if value in ['a', 'b', 'c']:
            return {"budget": value}
        
        if 'juta' in value or any(char.isdigit() for char in value):
            if any(x in value for x in ['<5', 'kurang 5', 'dibawah 5', 'di bawah 5']):
                return {"budget": "a"}
            elif any(x in value for x in ['>10', 'lebih 10', 'diatas 10', 'di atas 10']):
                return {"budget": "c"}
            else:
                return {"budget": "b"}
        
        dispatcher.utter_message(
            text="Mohon pilih:\na = kurang dari 5 juta\nb = 5-10 juta\nc = lebih dari 10 juta"
        )
        return {"budget": None}


# ========== 1b. RESET KUESIONER ==========
class ActionResetKuesioner(Action):
    """Reset semua slot terkait kuesioner agar tidak auto-submit dari sesi sebelumnya"""

    def name(self) -> Text:
        return "action_reset_kuesioner"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        slots_to_reset = [
            "nama_pasangan",
            "kisah_cinta",
            "latar_belakang",
            "tahu_legenda",
            "budget",
            "rekomendasi_tema",
        ]

        events: List[Dict[Text, Any]] = []
        for s in slots_to_reset:
            events.append(SlotSet(s, None))
        # Pastikan requested_slot bersih
        events.append(SlotSet("requested_slot", None))

        dispatcher.utter_message(text="Baik, mari mulai kuesioner dari awal. Saya akan menanyakan beberapa hal singkat ya.")
        return events

# ========== 2. ANALISIS KISAH CINTA ==========
class ActionAnalisisKisahCinta(Action):
    """Analisis kisah cinta dengan scoring system"""
    
    def name(self) -> Text:
        return "action_analisis_kisah_cinta"
    
    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        kisah = (tracker.get_slot("kisah_cinta") or "").lower()
        latar_belakang = (tracker.get_slot("latar_belakang") or "").lower()
        
        combined_text = f"{kisah} {latar_belakang}"
        
        # Keyword sets dengan bobot
        keywords_perdamaian = {
            'strong': ['beda agama', 'beda suku', 'beda budaya', 'orang tua tidak setuju', 
                      'keluarga melarang', 'bertentangan', 'perbedaan'],
            'medium': ['berbeda', 'tidak setuju', 'melarang', 'rintangan keluarga'],
            'weak': ['beda', 'susah']
        }
        
        keywords_romantis = {
            'strong': ['cinta pandangan pertama', 'love at first sight', 'langsung jatuh cinta',
                      'cinta pertama', 'pertama kali lihat'],
            'medium': ['takdir', 'jodoh', 'ditakdirkan', 'chemistry'],
            'weak': ['romantis', 'manis', 'indah']
        }
        
        keywords_perjuangan = {
            'strong': ['ldr', 'jarak jauh', 'banyak rintangan', 'banyak masalah', 
                      'hampir putus', 'bertahan'],
            'medium': ['rintangan', 'tantangan', 'perjuangan', 'sulit', 'susah'],
            'weak': ['masalah', 'ujian']
        }
        # Tambahan: akulturasi (Sri Jaya Pangus), alam (Ulun Danu), tragis/abadi (Jayaprana–Layonsari)
        keywords_akulturasi = {
            'strong': ['akulturasi', 'lintas budaya', 'kawin campur', 'perpaduan budaya', 'tionghoa', 'tradisi lokal'],
            'medium': ['beragam budaya', 'dua budaya', 'gabungan budaya', 'perbedaan budaya'],
            'weak': ['budaya', 'kultur']
        }
        keywords_alam = {
            'strong': ['ulun danu', 'bedugul', 'beratan', 'danau', 'pura ulun danu', 'alam', 'keseimbangan alam'],
            'medium': ['kabut', 'sejuk', 'air', 'hijau', 'tenang'],
            'weak': ['natural', 'nature']
        }
        keywords_tragis = {
            'strong': ['tragis', 'abadi', 'kesetiaan', 'jayaprana', 'layonsari', 'kehilangan'],
            'medium': ['duka', 'pengorbanan', 'setia'],
            'weak': ['sedih', 'melankolis']
        }
        
        def calculate_score(keywords_dict):
            score = 0
            matched = []
            for strength, keywords in keywords_dict.items():
                weight = 3 if strength == 'strong' else 2 if strength == 'medium' else 1
                for keyword in keywords:
                    if keyword in combined_text:
                        score += weight
                        matched.append(keyword)
            return score, matched
        
        score_perdamaian, match_perdamaian = calculate_score(keywords_perdamaian)
        score_romantis, match_romantis = calculate_score(keywords_romantis)
        score_perjuangan, match_perjuangan = calculate_score(keywords_perjuangan)
        score_akulturasi, match_akulturasi = calculate_score(keywords_akulturasi)
        score_alam, match_alam = calculate_score(keywords_alam)
        score_tragis, match_tragis = calculate_score(keywords_tragis)
        
        scores = {
            "ratu_pantai": score_perdamaian,
            "putri_ayu": score_romantis,
            "manik_angkeran": score_perjuangan,
            "sri_jaya_pangus": score_akulturasi,
            "ulun_danu": score_alam,
            "jayaprana_layonsari": score_tragis,
        }
        
        tema_terpilih = max(scores, key=scores.get)
        max_score = scores[tema_terpilih]
        
        if max_score == 0:
            dispatcher.utter_message(
                text="Hmm, saya butuh info lebih detail untuk rekomendasikan tema yang tepat. Bisa cerita lebih banyak tentang:\n\n"
                     "• Bagaimana kalian bertemu?\n"
                     "• Apa tantangan terbesar hubungan kalian?\n"
                     "• Apa yang membuat kalian spesial?\n\n"
                     "Atau bisa langsung pilih dari 3 tema kami! Ketik: info konsep"
            )
            return []
        
        analisis_map = {
            "ratu_pantai": f"💭 ANALISIS KISAH CINTA:\n\nDari cerita Anda, saya menangkap ada perbedaan signifikan yang kalian hadapi bersama. Ini menunjukkan kekuatan cinta yang melampaui batasan.\n\nCinta kalian adalah bukti bahwa perbedaan bukan penghalang! 💪❤️",
            
            "putri_ayu": f"💭 ANALISIS KISAH CINTA:\n\nKisah Anda penuh dengan keajaiban takdir dan chemistry yang kuat. Ini adalah bentuk cinta yang pure dan natural.\n\nConnection kalian menunjukkan ini bukan cinta biasa! ✨💕",
            
            "manik_angkeran": f"💭 ANALISIS KISAH CINTA:\n\nSaya lihat kalian telah melewati banyak tantangan. Setiap rintangan membuat kalian semakin kuat bersama.\n\nIni adalah cinta yang matang dan penuh komitmen! 🔥💪",
            "sri_jaya_pangus": f"💭 ANALISIS KISAH CINTA:\n\nKisah kalian menyorot perpaduan lintas budaya dan saling menghormati tradisi.\n\nCinta kalian merayakan keberagaman dan persatuan! 🕊️✨",
            "ulun_danu": f"💭 ANALISIS KISAH CINTA:\n\nAda penekanan pada ketenangan, keseimbangan, dan kedekatan dengan alam dalam kisah kalian.\n\nHarmoni alam menjadi inti narasi cinta kalian! 🌿💖",
            "jayaprana_layonsari": f"💭 ANALISIS KISAH CINTA:\n\nTerasa kuat nuansa kesetiaan, ketulusan, dan keindahan yang lahir dari ujian.\n\nKomitmen mendalam kalian menyentuh dan menginspirasi! 🌺🕯️",
        }
        
        dispatcher.utter_message(text=analisis_map[tema_terpilih])
        
        return [SlotSet("rekomendasi_tema", tema_terpilih)]

class ActionAnalisisKisahCintaV2(Action):
    def name(self) -> Text:
        return "action_analisis_kisah_cinta_v2"
    
    def run(self, dispatcher, tracker, domain):
        # Ambil intent terakhir user
        latest_intent = tracker.latest_message.get('intent', {}).get('name')
        
        # Mapping intent → tema
        intent_to_tema = {
            'cerita_perbedaan': 'ratu_pantai',
            'cerita_takdir': 'putri_ayu',
            'cerita_ldr': 'manik_angkeran',
            'cerita_perjuangan': 'manik_angkeran',
        }
        
        # Deteksi tema
        if latest_intent in intent_to_tema:
            tema_terpilih = intent_to_tema[latest_intent]
        else:
            # Fallback ke analisis keyword (backup)
            kisah = (tracker.get_slot("kisah_cinta") or "").lower()
            # ... (logika lama sebagai backup)
            tema_terpilih = "putri_ayu"  # default
        
        # Analisis response map
        analisis_map = {
            'ratu_pantai': "💭 Dari cerita Anda tentang perbedaan yang kalian hadapi...",
            'putri_ayu': "💭 Kisah takdir dan chemistry instant Anda...",
            'manik_angkeran': "💭 Perjuangan dan transformasi Anda berdua..."
        }
        
        dispatcher.utter_message(text=analisis_map[tema_terpilih])
        
        return [SlotSet("rekomendasi_tema", tema_terpilih)]



# ========== 3. REKOMENDASI TEMA ==========
class ActionRekomendasiTema(Action):
    """Memberikan rekomendasi tema"""
    
    def name(self) -> Text:
        return "action_rekomendasi_tema"
    
    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        tema = tracker.get_slot("rekomendasi_tema")
        budget = tracker.get_slot("budget") or "b"
        nama = tracker.get_slot("nama_pasangan") or "Anda"
        
        if not tema:
            dispatcher.utter_message(
                text="Saya belum bisa rekomendasikan tema. Mau cerita dulu tentang kisah cinta kalian?"
            )
            return []
        
        paket_map = {
            "a": "💰 BASIC - Rp 4.500.000\n• 1 lokasi, 4 jam\n• 50+ edited photos\n• Fotografer profesional",
            "b": "💰 PREMIUM - Rp 8.500.000\n• 2 lokasi, 6 jam\n• 100+ edited photos\n• Fotografer + MUA\n• Video 2 menit",
            "c": "💰 DIAMOND - Rp 15.000.000\n• 3 lokasi, 8-10 jam\n• 150+ edited photos\n• Full team\n• Video 5 menit"
        }
        
        templates = {
            "ratu_pantai": f"""
🌊 REKOMENDASI: RATU PANTAI KUTA 🌊

📖 FILOSOFI:
Cinta yang menyatukan dua dunia berbeda melalui perdamaian.

✨ KENAPA COCOK:
Kisah cinta Anda mencerminkan kekuatan melampaui perbedaan.

📍 LOKASI:
• Pantai Kuta (lokasi legenda)
• Pantai Melasti
• Pura Tanah Lot

{paket_map[budget]}

📞 BOOKING: WA +62 812-3456-7890
💝 Quote 'CHATBOT' dapat diskon 10%!
""",
            "putri_ayu": f"""
💎 REKOMENDASI: PUTRI AYU BALI 💎

📖 FILOSOFI:
Cinta pada pandangan pertama dan keajaiban takdir.

✨ KENAPA COCOK:
Chemistry instant Anda menunjukkan pertemuan yang ditakdirkan.

📍 LOKASI:
• Tegalalang Rice Terrace
• Danau Beratan
• Taman Ujung

{paket_map[budget]}

📞 BOOKING: WA +62 812-3456-7890
💝 Quote 'CHATBOT' dapat diskon 10%!
""",
            "manik_angkeran": f"""
🐉 REKOMENDASI: MANIK ANGKERAN 🐉

📖 FILOSOFI:
Cinta yang membuat kita tumbuh melalui tantangan.

✨ KENAPA COCOK:
Anda telah melewati ujian dan keluar lebih kuat.

📍 LOKASI:
• Gunung Batur (lokasi legenda)
• Sekumpul Waterfall
• Campuhan Ridge

{paket_map[budget]}

📞 BOOKING: WA +62 812-3456-7890
💝 Quote 'CHATBOT' dapat diskon 10%!
"""
            ,
            "ulun_danu": f"""
🌿 REKOMENDASI: ULUN DANU BERATAN 🌿

📖 FILOSOFI:
Keseimbangan alam, berkah kesuburan, dan harmoni.

✨ KENAPA COCOK:
Kisah Anda menekankan keseimbangan, ketenangan, dan kedekatan dengan alam.

📍 LOKASI:
• Pura Ulun Danu Beratan
• Danau Beratan (Bedugul)
• Kebun Raya Bedugul

{paket_map[budget]}

📞 BOOKING: WA +62 812-3456-7890
💝 Quote 'CHATBOT' dapat diskon 10%!
""",
            "jayaprana_layonsari": f"""
🌺 REKOMENDASI: JAYAPRANA–LAYONSARI 🌺

📖 FILOSOFI:
Kesetiaan abadi, ketulusan, dan keindahan yang lahir dari ujian.

✨ KENAPA COCOK:
Kisah Anda menyorot komitmen mendalam dan keabadian kenangan.

📍 LOKASI:
• Pura Jayaprana (Teluk Terima)
• Taman Nasional Bali Barat
• Menjangan (nuansa tenang)

{paket_map[budget]}

📞 BOOKING: WA +62 812-3456-7890
💝 Quote 'CHATBOT' dapat diskon 10%!
""",
            "sri_jaya_pangus": f"""
🕊️ REKOMENDASI: SRI JAYA PANGUS & KANG CING WIE 🕊️

📖 FILOSOFI:
Akulturasi, pengorbanan, dan tradisi yang menyatukan dua budaya.

✨ KENAPA COCOK:
Kisah Anda merayakan keberagaman dan persatuan lintas budaya.

📍 LOKASI:
• Desa Batur / Kintamani
• Pura Beji
• Lanskap Bali Aga vibes

{paket_map[budget]}

📞 BOOKING: WA +62 812-3456-7890
💝 Quote 'CHATBOT' dapat diskon 10%!
"""
        }
        
        buttons = [
            {
                "title": "Lihat detail konsep",
                "payload": f"/lihat_detail_konsep{{\"tema\": \"{tema}\"}}",
            },
            {
                "title": "Jelaskan legenda",
                "payload": "/jelaskan_legenda",
            },
            {
                "title": "Beri rating",
                "payload": "/mulai_feedback",
            },
        ]
        dispatcher.utter_message(text=templates[tema], buttons=buttons)
        return []


# ========== 4. SIMPAN DATA RISET ==========
class ActionSimpanDataRiset(Action):
    """Simpan data untuk riset skripsi"""
    
    def name(self) -> Text:
        return "action_simpan_data_riset"
    
    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        data = {
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "nama_pasangan": tracker.get_slot("nama_pasangan"),
            "kisah_cinta": tracker.get_slot("kisah_cinta"),
            "latar_belakang": tracker.get_slot("latar_belakang"),
            "tahu_legenda_sebelumnya": tracker.get_slot("tahu_legenda"),
            "rekomendasi_tema": tracker.get_slot("rekomendasi_tema"),
            "kepuasan": tracker.get_slot("kepuasan"),
            "budget": tracker.get_slot("budget"),
            "conversation_id": tracker.sender_id
        }
        
        try:
            df = pd.DataFrame([data])
            try:
                existing_df = pd.read_csv("data_riset_prewedding.csv")
                df = pd.concat([existing_df, df], ignore_index=True)
            except FileNotFoundError:
                pass
            
            df.to_csv("data_riset_prewedding.csv", index=False)
            
            # Supabase insert (optional via env, can be toggled)
            supabase_url = os.environ.get("SUPABASE_URL")
            supabase_key = os.environ.get("SUPABASE_SERVICE_KEY") or os.environ.get("SUPABASE_KEY")
            table = os.environ.get("SUPABASE_TABLE", "data_riset_prewedding")
            supabase_enabled = str(os.environ.get("SUPABASE_ENABLED", "true")).strip().lower() not in ("false", "0", "no", "off")

            if supabase_url and supabase_key and supabase_enabled:
                endpoint = f"{supabase_url.rstrip('/')}/rest/v1/{table}?on_conflict=conversation_id,timestamp"
                headers = {
                    "apikey": supabase_key,
                    "Authorization": f"Bearer {supabase_key}",
                    "Content-Type": "application/json",
                    "Prefer": "resolution=merge-duplicates",
                }
                payload = {
                    "timestamp": datetime.strptime(data["timestamp"], "%Y-%m-%d %H:%M:%S").isoformat(),
                    "nama_pasangan": data["nama_pasangan"],
                    "kisah_cinta": data["kisah_cinta"],
                    "latar_belakang": data["latar_belakang"],
                    "tahu_legenda_sebelumnya": data["tahu_legenda_sebelumnya"],
                    "rekomendasi_tema": data["rekomendasi_tema"],
                    "kepuasan": float(data["kepuasan"]) if data.get("kepuasan") not in [None, "", "None"] else None,
                    "budget": data["budget"],
                    "conversation_id": data["conversation_id"],
                }
                try:
                    r = requests.post(endpoint, headers=headers, json=[payload], timeout=10)
                    if r.status_code < 200 or r.status_code >= 300:
                        print(f"Supabase insert failed: {r.status_code} {r.text}")
                except Exception as e:
                    print(f"Supabase error: {e}")
            elif supabase_url and supabase_key and not supabase_enabled:
                # Explicitly disabled via env toggle
                pass

            dispatcher.utter_message(text="✅ Data tersimpan untuk riset. Terima kasih! 🙏")
        except Exception as e:
            print(f"Error saving data: {e}")
        
        return []


class ActionDetailKonsep(Action):
    """Tampilkan detail konsep lengkap dengan cerita dan referensi"""

    def name(self) -> Text:
        return "action_detail_konsep"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        tema_slot = tracker.get_slot("tema") or tracker.get_slot("rekomendasi_tema")

        # Detail lengkap setiap konsep dengan cerita dan referensi
        all_concepts = {
            "ratu_pantai": {
                "emoji": "🌊",
                "title": "RATU PANTAI KUTA",
                "subtitle": "Cinta yang Mendamaikan Perbedaan",
                "story": (
                    "Legenda Ratu Pantai Kuta menceritakan sosok penjaga pantai yang membawa kedamaian "
                    "di tengah perbedaan budaya dan latar belakang. Sang Ratu menyatukan dua dunia yang berbeda "
                    "dengan kebijaksanaan dan cinta kasih, mengajarkan bahwa perbedaan bukan penghalang melainkan "
                    "kekayaan yang harus dirayakan."
                ),
                "philosophy": "💭 Filosofi: Cinta sejati melampaui batasan agama, suku, dan budaya.",
                "cocok_untuk": "✨ Cocok untuk: Pasangan beda latar belakang (agama/suku/budaya) yang ingin menonjolkan harmoni.",
                "locations": "📍 Lokasi: Pantai Kuta • Pantai Melasti • Pura Tanah Lot",
                "style": "🎨 Style: Sunset di pantai, warna pastel & emas, nuansa damai & elegan",
                "source": "📖 Referensi: Sastra Bali - Cerita Rakyat Pantai Kuta"
            },
            "putri_ayu": {
                "emoji": "💎",
                "title": "PUTRI AYU BALI",
                "subtitle": "Cinta pada Pandangan Pertama",
                "story": (
                    "Putri Ayu adalah simbol kecantikan dan keanggunan Bali. Legenda menceritakan "
                    "seorang putri jelita yang memiliki chemistry kuat dengan pasangannya sejak pertemuan pertama. "
                    "Kisah ini menekankan takdir, keajaiban pertemuan, dan cinta yang tumbuh natural tanpa paksaan. "
                    "Ini adalah cinta yang ditakdirkan — pure, elegan, dan penuh keajaiban."
                ),
                "philosophy": "💭 Filosofi: Takdir mempertemukan jiwa-jiwa yang saling melengkapi.",
                "cocok_untuk": "✨ Cocok untuk: Pasangan yang percaya pada 'love at first sight' dan chemistry yang kuat.",
                "locations": "📍 Lokasi: Tegalalang Rice Terrace • Danau Beratan • Taman Ujung",
                "style": "🎨 Style: Elegant, fairytale vibes, warna soft & putih, nuansa romantis",
                "source": "📖 Referensi: Cerita Rakyat Bali - Legenda Putri Kerajaan"
            },
            "manik_angkeran": {
                "emoji": "🐉",
                "title": "MANIK ANGKERAN",
                "subtitle": "Cinta yang Menguat melalui Tantangan",
                "story": (
                    "Manik Angkeran adalah legenda tentang pengorbanan dan transformasi. "
                    "Kisah ini menceritakan pasangan yang harus melewati berbagai rintangan besar — "
                    "dari tantangan keluarga hingga ujian kehidupan yang berat. Namun setiap rintangan justru "
                    "membuat cinta mereka semakin kuat dan matang. Ini adalah simbol ketahanan, komitmen, "
                    "dan cinta yang tumbuh karena perjuangan."
                ),
                "philosophy": "💭 Filosofi: Cinta sejati diuji oleh waktu dan rintangan, bukan dihancurkan.",
                "cocok_untuk": "✨ Cocok untuk: Pasangan LDR, perjuangan panjang, atau yang melewati banyak tantangan.",
                "locations": "📍 Lokasi: Gunung Batur • Air Terjun Sekumpul • Campuhan Ridge",
                "style": "🎨 Style: Dramatic, epic vibes, alam liar, warna gelap & kontras tinggi",
                "source": "📖 Referensi: Sastra Bali - Legenda Manik Angkeran dan Pengorbanan"
            },
            "sri_jaya_pangus": {
                "emoji": "🕊️",
                "title": "SRI JAYA PANGUS & KANG CING WIE",
                "subtitle": "Akulturasi & Tradisi Lintas Budaya",
                "story": (
                    "Kisah cinta Raja Sri Jaya Pangus dengan Putri Kang Cing Wie dari Tiongkok "
                    "adalah simbol akulturasi budaya. Pernikahan mereka melahirkan tradisi baru yang memadukan "
                    "budaya Bali dan Tionghoa. Ini adalah cerita tentang pengorbanan, saling menghormati, "
                    "dan kesetiaan yang melahirkan warisan budaya hingga kini."
                ),
                "philosophy": "💭 Filosofi: Cinta yang sejati merayakan perbedaan dan melahirkan tradisi baru.",
                "cocok_untuk": "✨ Cocok untuk: Pasangan beda etnis/budaya yang ingin merayakan perpaduan tradisi.",
                "locations": "📍 Lokasi: Pura Beji Kintamani • Desa Batur • Area Bali Aga",
                "style": "🎨 Style: Traditional mix, warna merah-emas & putih, properti adat",
                "source": "📖 Referensi: https://koranbuleleng.com/2019/09/20/akulturasi-budaya-dari-kisah-cinta-sri-jaya-pangus-dan-kang-cing-wie/"
            },
            "ulun_danu": {
                "emoji": "🌿",
                "title": "ULUN DANU BERATAN",
                "subtitle": "Harmoni & Keseimbangan Alam",
                "story": (
                    "Legenda Ulun Danu mengisahkan keseimbangan antara manusia dan alam. "
                    "Pura Ulun Danu Beratan dibangun untuk menghormati Dewi Danu, dewi air dan kesuburan. "
                    "Konsep ini menekankan harmoni, ketenangan, dan penghormatan pada alam sebagai bagian "
                    "dari perjalanan cinta yang seimbang dan damai."
                ),
                "philosophy": "💭 Filosofi: Cinta yang seimbang seperti harmoni alam — tenang, damai, dan berkelanjutan.",
                "cocok_untuk": "✨ Cocok untuk: Pasangan yang mencintai alam, spiritualitas, dan ketenangan.",
                "locations": "📍 Lokasi: Pura Ulun Danu Beratan • Danau Beratan • Kebun Raya Bedugul",
                "style": "🎨 Style: Nature vibes, warna hijau & biru, suasana sejuk & sakral",
                "source": "📖 Referensi: Legenda Dewi Danu & Keseimbangan Alam Bali"
            },
            "jayaprana_layonsari": {
                "emoji": "🌺",
                "title": "JAYAPRANA & LAYONSARI",
                "subtitle": "Kesetiaan Abadi & Ketulusan",
                "story": (
                    "Jayaprana dan Layonsari adalah kisah cinta tragis yang abadi. "
                    "Jayaprana, seorang pemuda tampan dan setia, jatuh cinta pada Layonsari. "
                    "Namun cinta mereka diuji oleh pengkhianatan dan kematian. Kisah ini mengajarkan "
                    "tentang kesetiaan yang tak tergoyahkan, ketulusan cinta, dan kenangan yang abadi "
                    "melampaui kehidupan."
                ),
                "philosophy": "💭 Filosofi: Cinta sejati tidak mengenal akhir — kenangan dan komitmen tetap abadi.",
                "cocok_untuk": "✨ Cocok untuk: Pasangan yang menekankan kesetiaan, komitmen mendalam, dan romansa timeless.",
                "locations": "📍 Lokasi: Pura Jayaprana (Teluk Terima) • Taman Nasional Bali Barat • Pulau Menjangan",
                "style": "🎨 Style: Emotional, timeless, warna natural & earth tone, nuansa melankolis indah",
                "source": "📖 Referensi: https://tatkala.co/2021/01/04/api-cinta-di-dasar-hati-prihal-cinta-sejati-dalam-sastra-bali/"
            },
        }

        # Jika ada tema specific di slot, tampilkan detail 1 konsep
        if tema_slot and tema_slot in all_concepts:
            concept = all_concepts[tema_slot]
            message = f"""
{concept['emoji']} {concept['title']}
{concept['subtitle']}

📖 CERITA LEGENDA:
{concept['story']}

{concept['philosophy']}

{concept['cocok_untuk']}

{concept['locations']}

{concept['style']}

{concept['source']}

💰 PAKET PREWEDDING:
• BASIC: Rp 4.500.000 (1 lokasi, 4 jam, 50+ foto)
• PREMIUM: Rp 8.500.000 (2 lokasi, 6 jam, 100+ foto, video)
• DIAMOND: Rp 15.000.000 (3 lokasi, 8-10 jam, 150+ foto, full team)

📞 Booking: https://wa.me/6281236559230
"""
            dispatcher.utter_message(text=message.strip())

            buttons = [
                {"title": "Lihat konsep lain", "payload": "/info_konsep"},
                {"title": "Analisis kisah kami", "payload": "/isi_kuesioner"},
                {"title": "Info paket lengkap", "payload": "/info_paket"},
            ]
            dispatcher.utter_message(text="Pilih opsi berikut:", buttons=buttons)

            return [SlotSet("tema", tema_slot)]

        # Jika tidak ada tema, tampilkan SEMUA konsep (overview)
        else:
            intro = """
✨ KONSEP PREWEDDING LEGENDA BALI ✨

Berikut adalah 6 konsep prewedding kami yang terinspirasi dari legenda dan cerita cinta Bali. Setiap konsep memiliki filosofi dan style unik:

Klik salah satu tombol di bawah untuk melihat CERITA LENGKAP! 📖
"""
            dispatcher.utter_message(text=intro.strip())

            # Kirim overview singkat untuk semua konsep
            for key, concept in all_concepts.items():
                # Truncate story dengan smart sentence boundary
                story_preview = concept['story']
                if len(story_preview) > 200:
                    # Cari titik terakhir sebelum 200 karakter untuk memotong di kalimat
                    last_period = story_preview[:200].rfind('. ')
                    if last_period > 100:
                        story_preview = story_preview[:last_period + 1]
                    else:
                        story_preview = story_preview[:200].strip()
                    story_preview += "..."

                short_message = f"""
{concept['emoji']} {concept['title']}
{concept['subtitle']}

{story_preview}

{concept['cocok_untuk']}
"""
                dispatcher.utter_message(text=short_message.strip())

            # Tampilkan buttons untuk pilih detail - dengan payload yang set slot tema
            buttons = [
                {"title": "📖 Cerita Lengkap: Ratu Pantai", "payload": "/lihat_detail_konsep{\"tema\": \"ratu_pantai\"}"},
                {"title": "📖 Cerita Lengkap: Putri Ayu", "payload": "/lihat_detail_konsep{\"tema\": \"putri_ayu\"}"},
                {"title": "📖 Cerita Lengkap: Manik Angkeran", "payload": "/lihat_detail_konsep{\"tema\": \"manik_angkeran\"}"},
                {"title": "📖 Cerita Lengkap: Jayaprana", "payload": "/lihat_detail_konsep{\"tema\": \"jayaprana_layonsari\"}"},
                {"title": "📖 Cerita Lengkap: Sri Jaya Pangus", "payload": "/lihat_detail_konsep{\"tema\": \"sri_jaya_pangus\"}"},
                {"title": "📖 Cerita Lengkap: Ulun Danu", "payload": "/lihat_detail_konsep{\"tema\": \"ulun_danu\"}"},
            ]

            footer_text = "\nAtau ketik 'analisis kisah kami' untuk rekomendasi tema berdasarkan cerita cinta kalian!"
            dispatcher.utter_message(text=footer_text, buttons=buttons)

            return []


class ActionJelaskanLegenda(Action):
    """Berikan penjelasan singkat legenda sesuai tema"""

    def name(self) -> Text:
        return "action_jelaskan_legenda"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        # Ambil nilai slot yang mungkin berisi tema/legenda
        tema_slot = (tracker.get_slot("tema") or tracker.get_slot("rekomendasi_tema") or "").strip()
        kisah_id_slot = (tracker.get_slot("kisah_id") or "").strip()
        # Ambil teks mentah untuk deteksi berbasis substring (robust terhadap akurasi 0.85–0.90)
        raw_text = (getattr(tracker, "latest_message", {}) or {}).get("text", "").lower()

        # Makna inti per tema (diperluas - semua 6 konsep legenda Bali)
        theme_explanations = {
            "ratu_pantai": (
                "Legenda Ratu Pantai Kuta menggambarkan figur penjaga yang membawa kedamaian. "
                "Tema ini cocok untuk pasangan yang menyatukan perbedaan (agama/suku/budaya) "
                "dan ingin menonjolkan harmoni sebagai inti kisah cintanya."
            ),
            "putri_ayu": (
                "Putri Ayu melambangkan cinta pada pandangan pertama dan keajaiban takdir. "
                "Tema ini menekankan chemistry yang natural, nuansa elegan, dan momen yang terasa 'ditakdirkan'."
            ),
            "manik_angkeran": (
                "Manik Angkeran adalah kisah pengorbanan dan transformasi diri. "
                "Tema ini ideal untuk pasangan yang tumbuh melalui tantangan—menguat lewat rintangan yang dihadapi bersama."
            ),
            "sri_jaya_pangus": (
                "Sri Jaya Pangus & Kang Cing Wie adalah kisah akulturasi dan pengorbanan yang melahirkan tradisi. "
                "Tema ini cocok untuk pasangan beda etnis/budaya yang ingin merayakan perpaduan tradisi dan saling menghormati."
            ),
            "ulun_danu": (
                "Legenda Ulun Danu (Danau Beratan) berkisah tentang keseimbangan alam dan berkah kesuburan. "
                "Tema ini menekankan harmoni, keseimbangan, penghormatan pada alam, dan spiritualitas."
            ),
            "jayaprana_layonsari": (
                "Jayaprana & Layonsari menuturkan cinta tragis yang abadi sebagai simbol kemurnian dan kesetiaan. "
                "Tema ini ideal untuk pasangan yang menekankan kesetiaan, komitmen mendalam, dan romansa timeless."
            ),
            # Tema tambahan (generic style)
            "fairytale": (
                "Fairytale menonjolkan nuansa magis dan dongeng: palet lembut, properti etereal, dan storytelling romantis. "
                "Cocok untuk pasangan yang ingin suasana mimpi dan keajaiban."
            ),
            "classic": (
                "Classic berfokus pada keanggunan timeless: komposisi formal, busana elegan, dan estetika bersih. "
                "Ideal untuk menekankan keabadian cinta dalam gaya yang rapi."
            ),
            "vintage": (
                "Vintage memanfaatkan nostalgia: tekstur filmic, aksesori retro, dan lokasi sejarah. "
                "Pas untuk pasangan yang menyukai nuansa masa lampau yang hangat."
            ),
            "bohemian": (
                "Bohemian menghadirkan kebebasan artistik: elemen natural, layering kain, dan mood santai. "
                "Cocok bagi jiwa petualang yang ekspresif dan earthy."
            ),
            "soft": (
                "Soft menggambarkan kelembutan: warna pastel, pencahayaan lembut, dan gesture intim. "
                "Menonjolkan kehangatan tanpa dramatisasi berlebihan."
            ),
            "dramatic": (
                "Dramatic menekankan kontras kuat: siluet, shadow, dan ekspresi intens. "
                "Pas untuk pasangan yang ingin menonjolkan kekuatan emosi dan dinamika."
            ),
            "unity": (
                "Unity menekankan persatuan: simbol-simbol penyatuan dua latar, gesture saling dukung, dan narasi kebersamaan. "
                "Ideal untuk pasangan lintas perbedaan yang merayakan harmoni."
            ),
            # Kategori makna (alias umum)
            "perdamaian": (
                "Perdamaian mengangkat rekonsiliasi dan harmoni lintas perbedaan. "
                "Menekankan simbol-simbol penyatuan dan ketenangan batin."
            ),
            "romantis": (
                "Romantis menonjolkan keintiman dan takdir pertemuan: momen spontan, tatapan, dan detail elegan."
            ),
            "perjuangan": (
                "Perjuangan memotret proses tumbuh bersama melalui rintangan: ketahanan, komitmen, dan transformasi."
            ),
        }

        # Penjelasan ringkas per legenda populer (opsional, bila user menyebut nama legenda)
        legend_explanations = {
            "sri_jaya_pangus": (
                "Sri Jaya Pangus & Kang Cing Wie adalah kisah akulturasi dan pengorbanan yang melahirkan tradisi. "
                "Maknanya: cinta lintas budaya, kesetiaan, dan kehormatan pada nilai lokal."
            ),
            "jayaprana_layonsari": (
                "Jayaprana & Layonsari menuturkan cinta tragis yang abadi sebagai simbol kemurnian dan kesetiaan. "
                "Maknanya: ketulusan, pengorbanan, dan keabadian kenangan."
            ),
            "ulun_danu": (
                "Legenda Ulun Danu (Danau Beratan) berkisah tentang keseimbangan alam dan berkah kesuburan. "
                "Maknanya: harmoni, keseimbangan, dan penghormatan pada alam."
            ),
            "manik_angkeran": (
                "Manik Angkeran menekankan pengorbanan dan transformasi diri menuju kematangan cinta."
            ),
            "ratu_pantai": (
                "Ratu Pantai Kuta melambangkan penjaga yang membawa damai di tengah perbedaan."
            ),
            "putri_ayu": (
                "Putri Ayu menghadirkan nuansa takdir dan keanggunan yang memikat."
            ),
        }

        # Sinonim untuk kanonisasi input (tema/legenda)
        synonyms_map = {
            # Tema inti
            "ratu_pantai": ["ratu pantai", "ratu pantai kuta", "pantai kuta", "tema perdamaian", "damai", "peace", "unity"],
            "putri_ayu": ["putri ayu", "ayu", "tema romantis", "romantis", "takdir", "love at first sight"],
            "manik_angkeran": ["manik angkeran", "manik", "angkeran", "tema perjuangan", "perjuangan", "ldr", "jarak jauh", "fighter"],
            # Tema gaya
            "fairytale": ["fairytale", "dongeng", "magical", "fantasy"],
            "classic": ["classic", "klasik", "elegan"],
            "vintage": ["vintage", "retro", "nostalgia"],
            "bohemian": ["bohemian", "boho", "artistik"],
            "soft": ["soft", "lembut", "pastel"],
            "dramatic": ["dramatic", "dramatik", "kontras"],
            "unity": ["unity", "harmoni", "rekonsiliasi"],
            # Legenda
            "sri_jaya_pangus": ["sri jaya pangus", "jayapangus", "kang cing wie"],
            "jayaprana_layonsari": ["jayaprana layonsari", "jayaprana", "layonsari"],
            "ulun_danu": ["ulun danu", "bedugul", "pura ulun danu"],
        }

        def normalize_key(value: str) -> Text:
            v = (value or "").lower().strip().replace("_", " ")
            for key, syns in synonyms_map.items():
                if v == key or v in syns:
                    return key
                # deteksi substring untuk akurasi yang tidak presisi
                if any(s in v for s in syns):
                    return key
            # deteksi dari raw_text bila value kosong
            rt = raw_text
            for key, syns in synonyms_map.items():
                if key in rt:
                    return key
                if any(s in rt for s in syns):
                    return key
            return ""

        # Tentukan target berdasarkan prioritas: slot tema → slot kisah_id → teks mentah
        target = normalize_key(tema_slot) or normalize_key(kisah_id_slot) or normalize_key("")

        if target:
            # Prioritaskan penjelasan tema; bila tidak ada, coba legenda
            if target in theme_explanations:
                dispatcher.utter_message(text=theme_explanations[target])
            elif target in legend_explanations:
                dispatcher.utter_message(text=legend_explanations[target])
            else:
                # fallback aman ke tema perdamaian
                dispatcher.utter_message(text=theme_explanations["ratu_pantai"])
        else:
            # Tidak ada deteksi: tampilkan SEMUA 6 konsep legenda Bali
            message = (
                "📖 CERITA CINTA DARI SASTRA BALI\n\n"
                "Kami memiliki 6 konsep prewedding yang terinspirasi dari legenda dan cerita cinta Bali:\n\n"
                "🌊 Ratu Pantai Kuta — " + theme_explanations["ratu_pantai"] + "\n\n"
                "💎 Putri Ayu Bali — " + theme_explanations["putri_ayu"] + "\n\n"
                "🐉 Manik Angkeran — " + theme_explanations["manik_angkeran"] + "\n\n"
                "🕊️ Sri Jaya Pangus & Kang Cing Wie — " + theme_explanations["sri_jaya_pangus"] + "\n\n"
                "🌿 Ulun Danu Beratan — " + theme_explanations["ulun_danu"] + "\n\n"
                "🌺 Jayaprana & Layonsari — " + theme_explanations["jayaprana_layonsari"] + "\n\n"
                "Pilih salah satu untuk melihat detail lengkap!"
            )

            buttons = [
                {"title": "📖 Detail Ratu Pantai", "payload": "/lihat_detail_konsep{\"tema\": \"ratu_pantai\"}"},
                {"title": "📖 Detail Putri Ayu", "payload": "/lihat_detail_konsep{\"tema\": \"putri_ayu\"}"},
                {"title": "📖 Detail Manik Angkeran", "payload": "/lihat_detail_konsep{\"tema\": \"manik_angkeran\"}"},
                {"title": "📖 Detail Sri Jaya Pangus", "payload": "/lihat_detail_konsep{\"tema\": \"sri_jaya_pangus\"}"},
                {"title": "📖 Detail Ulun Danu", "payload": "/lihat_detail_konsep{\"tema\": \"ulun_danu\"}"},
                {"title": "📖 Detail Jayaprana", "payload": "/lihat_detail_konsep{\"tema\": \"jayaprana_layonsari\"}"},
            ]

            dispatcher.utter_message(text=message, buttons=buttons)

        return []


# ========== 5. FALLBACK HANDLER ==========
class ActionDefaultFallback(Action):
    """Handle pertanyaan yang tidak dimengerti"""
    
    def name(self) -> Text:
        return "action_default_fallback"
    
    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        message = "Maaf, saya kurang paham 😅\n\n" \
                  "Saya bisa bantu dengan:\n" \
                  "✅ Info konsep prewedding legenda Bali\n" \
                  "✅ Rekomendasi tema sesuai kisah cinta\n" \
                  "✅ Info paket dan harga\n\n" \
                  "Mau tanya yang mana?"
        
        dispatcher.utter_message(text=message)
        return []
class ValidateFeedbackForm(FormValidationAction):
    """Validasi untuk feedback_form yang hanya mengumpulkan kepuasan"""

    def name(self) -> Text:
        return "validate_feedback_form"

    def validate_kepuasan(
        self,
        slot_value: Any,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> Dict[Text, Any]:
        try:
            angka = re.findall(r"\d+", str(slot_value))
            if angka:
                rating = int(angka[0])
                if 1 <= rating <= 5:
                    return {"kepuasan": str(rating)}
            dispatcher.utter_message(text="Mohon masukkan angka 1-5 ya! (1=tidak puas, 5=sangat puas)")
            return {"kepuasan": None}
        except Exception:
            dispatcher.utter_message(text="Format tidak valid. Masukkan angka 1-5.")
            return {"kepuasan": None}


# ========== 6. KISAH CINTA BALi & OUT OF SCOPE ==========
class ActionKisahCintaBali(Action):
    """Cerita cinta dari sastra/legenda Bali dengan ide konsep prewedding"""

    def name(self) -> Text:
        return "action_kisah_cinta_bali"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        # Kurasi ringkas berdasarkan referensi publik yang diberikan user
        stories = [
            {
                "id": "pribumi_turis",
                "title": "Percintaan Pribumi–Turis dalam Sastra Bali",
                "summary": (
                    "Relasi lintas budaya yang kompleks: ketertarikan, negosiasi identitas, dan dinamika sosial. "
                    "Cocok untuk pasangan yang merayakan keberagaman dan perjalanan cinta yang terbuka."),
                "themes": ["akulturasi", "harmoni", "keberagaman"],
                "locations": ["Pantai Kuta", "Canggu", "Sanur"],
                "photo_ideas": [
                    "Konsep travel diary (paspor, peta, surfing board)",
                    "Street candid di kawasan turistik",
                    "Golden hour di pantai dengan elemen budaya lokal",
                ],
                "sources": [
                    {
                        "title": "Percintaan Pribumi–Turis warnai sastra Bali",
                        "url": "https://www.antaranews.com/berita/253166/percintaan-pribumi-turis-warnai-sastra-bali",
                    }
                ],
            },
            {
                "id": "api_cinta",
                "title": "Api Cinta di Dasar Hati",
                "summary": (
                    "Refleksi tentang cinta sejati: daya tahan batin, komitmen, dan kejujuran rasa. "
                    "Cocok bagi pasangan yang ingin menonjolkan kedalaman emosi dan ketulusan."),
                "themes": ["kedalaman", "komitmen", "kontemplatif"],
                "locations": ["Campuhan Ridge", "Ubud Paddies", "Pura Taman Saraswati"],
                "photo_ideas": [
                    "Konsep minimalis dengan permainan cahaya dan shadow",
                    "Close-up ekspresi emosi dengan kain tradisional",
                    "Silhouette di senja sebagai simbol keabadian cinta",
                ],
                "sources": [
                    {
                        "title": "Api Cinta di Dasar Hati – Tatkala.co",
                        "url": "https://tatkala.co/2021/01/04/api-cinta-di-dasar-hati-prihal-cinta-sejati-dalam-sastra-bali/",
                    }
                ],
            },
            {
                "id": "sri_jaya_pangus",
                "title": "Sri Jaya Pangus & Kang Cing Wie",
                "summary": (
                    "Legenda akulturasi dan pengorbanan: cinta lintas budaya yang melahirkan tradisi. "
                    "Pas untuk pasangan yang ingin merayakan perpaduan budaya dan kesetiaan."),
                "themes": ["akulturasi", "pengorbanan", "tradisi"],
                "locations": ["Pura Beji Kintamani", "Desa Batur", "Bali Aga vibes"],
                "photo_ideas": [
                    "Busana perpaduan Bali–Tionghoa (nuansa merah-emas dan putih)",
                    "Gate temple framing dengan properti tradisi",
                    "Storytelling sequence: janji, pengorbanan, penyatuan",
                ],
                "sources": [
                    {
                        "title": "Akulturasi budaya dari kisah cinta Sri Jaya Pangus & Kang Cing Wie",
                        "url": "https://koranbuleleng.com/2019/09/20/akulturasi-budaya-dari-kisah-cinta-sri-jaya-pangus-dan-kang-cing-wie/",
                    }
                ],
            },
            {
                "id": "modern_2011",
                "title": "Sastra Bali Modern (sayup 2011)",
                "summary": (
                    "Lanskap sastra Bali modern: tema cinta yang bergerak dari tradisi ke modernitas. "
                    "Untuk pasangan yang ingin gaya kontemporer namun berakar pada lokalitas."),
                "themes": ["modernitas", "lokalitas", "kontemporer"],
                "locations": ["Seminyak", "Nusa Dua", "Museum Nyoman Gunarsa"],
                "photo_ideas": [
                    "Mix and match street fashion dengan kain Bali",
                    "Editorial look di ruang arsitektur modern",
                    "Series foto dengan puisi pendek sebagai narasi",
                ],
                "sources": [
                    {
                        "title": "Sastra Bali Modern 2011 – Blog I Wayan Jatiya Satumingal",
                        "url": "https://iwayanjatiyasatumingal.blogspot.com/2012/05/sastra-bali-modern-sepanjang-2011-sayup.html",
                    }
                ],
            },
        ]

        # Cek apakah user memilih kisah spesifik melalui slot
        selected_id = (tracker.get_slot("kisah_id") or "").strip()

        # Payload interaktif untuk front-end chat
        payload = {
            "type": "kisah_bali",
            "title": "Kisah Cinta Bali – Inspirasi Konsep Prewedding",
            "stories": stories,
            "cta": {
                "text": "Rekomendasikan tema dari kisah ini",
                "payload": "/rekomendasi_dari_kisah",
            },
            "suggestions": [
                {"title": "Analisis kisah kami", "payload": "/isi_kuesioner"},
                {"title": "Lihat detail konsep", "payload": "/lihat_detail_konsep"},
                # Gunakan intent yang sudah terikat rules agar selalu memanggil action_jelaskan_legenda
                {"title": "Tanya makna tiap tema", "payload": "/jelaskan_legenda"},
            ],
        }

        if selected_id:
            # Filter ke satu kisah bila ada slot yang cocok
            selected = next((s for s in stories if s["id"] == selected_id), None)
            if selected:
                payload["stories"] = [selected]
                payload["title"] = f"Kisah Cinta Bali – {selected['title']}"

        dispatcher.utter_message(json_message=payload)
        return []


class ActionHandleOutOfScope(Action):
    """Menangani pertanyaan di luar cakupan dengan opsi yang jelas"""

    def name(self) -> Text:
        return "action_handle_out_of_scope"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        text = (
            "Maaf, topik itu di luar cakupan layanan prewedding legenda Bali. "
            "Saya bisa bantu rekomendasi tema, kisah cinta Bali, atau info paket.")
        buttons = [
            {"title": "Kisah cinta Bali", "payload": "/cerita_kisah_cinta"},
            {"title": "Analisis kisah kami", "payload": "/isi_kuesioner"},
            {"title": "Info paket", "payload": "/info_paket"},
        ]

        dispatcher.utter_message(text=text, buttons=buttons)
        return []


class ActionRekomendasiDariKisah(Action):
    """Map kisah_id ke tema dan tampilkan detail konsep otomatis"""

    def name(self) -> Text:
        return "action_rekomendasi_dari_kisah"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        kisah_id = (tracker.get_slot("kisah_id") or "").strip()

        mapping = {
            # lintas budaya & harmoni
            "pribumi_turis": "ratu_pantai",
            "sri_jaya_pangus": "sri_jaya_pangus",
            # komitmen, kedalaman, ketahanan
            "api_cinta": "jayaprana_layonsari",
            # kontemporer romantis
            "modern_2011": "putri_ayu",
        }

        tema = mapping.get(kisah_id)
        if not tema:
            msg = "Pilih dulu kisahnya ya, lalu saya rekomendasikan temanya."
            buttons = [
                {"title": "Sri Jaya Pangus", "payload": '/kisah_cinta_bali{"kisah_id":"sri_jaya_pangus"}'},
                {"title": "Api Cinta", "payload": '/kisah_cinta_bali{"kisah_id":"api_cinta"}'},
                {"title": "Pribumi–Turis", "payload": '/kisah_cinta_bali{"kisah_id":"pribumi_turis"}'},
                {"title": "Sastra Bali Modern", "payload": '/kisah_cinta_bali{"kisah_id":"modern_2011"}'},
            ]
            dispatcher.utter_message(text=msg, buttons=buttons)
            return []

        # Set slot tema lalu tampilkan detail konsep yang sudah ada
        dispatcher.utter_message(text=f"Saya merekomendasikan tema: {tema.replace('_', ' ').title()} berdasarkan kisah yang dipilih.")
        return [SlotSet("tema", tema), FollowupAction("action_detail_konsep")]

class ActionInfoLokasiKontekstual(Action):
    def name(self) -> Text:
        return "action_info_lokasi_kontekstual"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        text = (tracker.latest_message.get("text") or "").lower()
        prev = tracker.get_slot("lokasi_kategori") or ""
        tema = tracker.get_slot("tema") or ""
        cat = ""
        if any(k in text for k in ["pantai", "kuta", "melasti", "tanah lot", "uluwatu", "sanur", "nusa dua"]):
            cat = "pantai"
        elif any(k in text for k in ["gunung", "batur", "campuhan", "sekumpul", "ridge"]):
            cat = "gunung"
        elif any(k in text for k in ["danau", "beratan", "ulun danu", "danu"]):
            cat = "danau"
        elif prev:
            cat = prev
        elif tema in ["ratu_pantai"]:
            cat = "pantai"
        elif tema in ["manik_angkeran"]:
            cat = "gunung"
        elif tema in ["ulun_danu"]:
            cat = "danau"
        else:
            cat = "pantai"
        by_cat = {
            "pantai": "• Pantai Kuta\n• Pantai Melasti\n• Pura Tanah Lot",
            "gunung": "• Gunung Batur\n• Air Terjun Sekumpul\n• Campuhan Ridge",
            "danau": "• Ulun Danu Beratan\n• Danau Batur",
        }
        msg_map = {
            "pantai": "📍 LOKASI PANTAI\n\n",
            "gunung": "📍 LOKASI GUNUNG\n\n",
            "danau": "📍 LOKASI DANAU\n\n",
        }
        body = msg_map.get(cat, msg_map["pantai"]) + by_cat.get(cat, by_cat["pantai"]) + "\n\nLokasi bisa disesuaikan dengan tema dan budget. Mau lihat detail konsepnya?"
        buttons = [
            {"title": "Detail konsep", "payload": "/lihat_detail_konsep"},
            {"title": "Analisis kisah kami", "payload": "/isi_kuesioner"},
            {"title": "Info paket", "payload": "/info_paket"},
        ]
        dispatcher.utter_message(text=body, buttons=buttons)
        return [SlotSet("lokasi_kategori", cat), ActiveLoop(None), SlotSet("requested_slot", None)]

class ActionInfoPaketKontekstual(Action):
    def name(self) -> Text:
        return "action_info_paket_kontekstual"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        cat = tracker.get_slot("lokasi_kategori") or ""
        label = "pantai" if cat == "pantai" else "gunung" if cat == "gunung" else "lokasi"
        text = (
            "💼 INFO PAKET & HARGA\n\n"
            + "• BASIC — Rp 4.500.000\n  1 "
            + label
            + ", 4 jam, 50+ foto\n\n  Cocok untuk pasangan dengan waktu terbatas.\n\n"
            + "• PREMIUM — Rp 8.500.000\n  2 "
            + label
            + ", 6 jam, 100+ foto, MUA, video 2 menit\n\n  Paket paling populer, balance hasil & harga.\n\n"
            + "• DIAMOND — Rp 15.000.000\n  3 "
            + label
            + ", 8–10 jam, 150+ foto, full team, video 5 menit\n\n  Maksimalkan storytelling konsep legenda.\n\n"
            + "Mau saya bantu rekomendasikan paket berdasarkan tema dan budget?"
        )
        buttons = [
            {"title": "Analisis kisah kami", "payload": "/isi_kuesioner"},
            {"title": "Lihat detail konsep", "payload": "/lihat_detail_konsep"},
            {"title": "Booking sekarang", "payload": "/booking"},
        ]
        dispatcher.utter_message(text=text, buttons=buttons)
        return []
