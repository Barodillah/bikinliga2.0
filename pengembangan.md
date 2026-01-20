# Rencana Pengembangan Aplikasi BikinLiga 2.0

Dokumen ini berisi daftar saran pengembangan fitur, perbaikan User Experience (UX), Sistem Monetisasi, Integrasi Kecerdasan Buatan (AI), dan Ekspansi Ekosistem untuk meningkatkan aplikasi BikinLiga.

---

## 1. Fitur Prioritas (High Impact)

### A. Public Tournament View (Guest Experience) & CTA Strategy
**Konsep:**
Halaman turnamen yang bisa diakses oleh siapa saja (tanpa login) namun dengan batasan informasi untuk memancing user agar mendaftar/login (Concept: *Teaser/Freemium*).

*   **Guest View (Read-Only):**
    *   Melihat Klasemen, Jadwal, dan Hasil Skor Akhir.
    *   Melihat Bracket Turnamen.
*   **Locked Features (CTA Trigger):**
    *   **Deep Stats:** Statistik mendalam (Shots on goal, possession) diburamkan dengan pesan *"Login untuk melihat analisis lengkap"*.
    *   **Player Profile:** Detail histori pemain hanya bisa dilihat user login.
    *   **Prediction:** Tombol "Tebak Skor" mengarahkan ke halaman login.

### B. Interaksi Live & Engagement (Social Features)
*   **Live Match Reactions:** Floating Emojis (🔥, 👏, ⚽) & Cheer Meter.
*   **Komentar & Diskusi:** Match Thread per pertandingan.
*   **Notifikasi Sosial:** Info aktivitas teman.

### C. League Hub: News, Registration & Community
*   **Sistem Pendaftaran:** Guest Registration & Paid Tournament Registration.
*   **League News:** Portal berita liga (Public & Premium).
*   **Group Chat Liga:** Komunitas eksklusif peserta.

---

## 2. Sistem Monetisasi (BikinLiga Coins)
**Kurs:** 10 Coin = Rp 1.000,-

### A. Fitur Berbayar User
*   **Premium Frame:** 50 Coins.
*   **Unlock Advanced Stats:** 20 Coins/Turnamen.
*   **Ad-Free:** 200 Coins/Bulan.
*   **Virtual Gifts (Sawer):** 5 - 1.000 Coins.

### B. Fitur Berbayar Organizer
*   **Verified Tournament:** 500 Coins.
*   **Sponsorship Slots:** 300 Coins (Pasang iklan sendiri).
*   **Broadcast Overlay Pro:** 400 Coins (Tanpa Watermark).

---

## 3. Integrasi Artificial Intelligence (AI)

### A. BikinLiga AI Chatbot (Smart Assistant)
*   User: Cek jadwal, insight tim lawan, penjelasan aturan.
*   Organizer: Generate deskripsi turnamen, cek bentrok jadwal, drafting pengumuman.

### B. Fitur AI Lainnya
*   **AI Match Commentary:** Komentator teks/suara otomatis real-time.
*   **AI Match Prediction:** Probabilitas kemenangan (Premium Feature).
*   **Automated Journalism:** Generate artikel berita match report otomatis.
*   **Smart Scheduling:** Algoritma penyusun jadwal otomatis.
*   **AI Logo Generator:** Buat logo tim instan dengan koin.

---

## 4. Fitur Ekspansi & Gamifikasi (New Suggestions)

Ide fitur baru untuk meningkatkan retensi pengguna (Retention) dan nilai hiburan aplikasi di luar fungsi dasar manajemen turnamen.

### A. Gamification System (Battle Pass / Season Pass)
**Konsep:**
Meningkatkan retensi dengan memberikan insentif bagi user yang aktif setiap hari.
*   **Daily & Weekly Missions:**
    *   "Login 5 hari berturut-turut."
    *   "Prediksi benar 3 pertandingan."
    *   "Tonton Live Match selama 10 menit."
*   **Reward:** XP untuk naik level profil, BikinLiga Coins receh, atau koleksi Sticker/Badge prestasi.
*   **Season Pass:** Jalur berbayar (Premium Pass) untuk hadiah lebih eksklusif (Skin tema aplikasi, Frame Emas).

### B. Fantasy League (Manager Mode)
**Konsep:**
Permainan "Fantasy Sport" di mana user bisa menyusun "Dream Team" mereka sendiri dengan merekrut pemain-pemain asli yang sedang bertanding di turnamen BikinLiga.
*   **Mekanisme:** User mendapat budget virtual untuk beli pemain. Poin didapat berdasarkan performa asli pemain di pertandingan (Gol = +5 poin, Clean Sheet = +4 poin).
*   **Engagement:** Membuat user peduli dengan pertandingan tim lain, bukan hanya timnya sendiri.

### C. Bursa Transfer & Scrimmage Finder (LFG)
**Konsep:**
Memfasilitasi kebutuhan tim di luar turnamen resmi.
*   **Scrimmage Finder (Cari Lawan Sparring):**
    *   Posting jadwal kosong tim: "Cari lawan sparing, Server Asia, Jam 20.00 WIB".
    *   Sistem challenge langsung via aplikasi.
*   **Bursa Transfer Pemain:**
    *   Listing pemain "Free Agent" yang mencari tim.
    *   Listing tim yang membuka "Open Recruitment".

### D. Merchandise & Ticketing Store
**Konsep:**
E-Commerce mini untuk penyelenggara menjual produk fisik/digital.
*   **Fitur:**
    *   Jual Jersey Tim / Jersey Official Turnamen.
    *   Jual Tiket Offline (QR Code Entry) untuk grand final di venue.
    *   Pembayaran terintegrasi dengan saldo Coin atau Payment Gateway.

---

## 5. Daftar Halaman Baru (Updated)

Berikut adalah rekapitulasi halaman-halaman yang direkomendasikan untuk dibuat (Total View):

| Kategori | Nama Halaman | Route | Deskripsi |
| :--- | :--- | :--- | :--- |
| **Utama** | Public Tournament | `/t/:slug` | Guest view (Ads & CTA heavy). |
| | League News | `/t/:slug/news` | Portal berita. |
| | League Register | `/t/:slug/register` | Form pendaftaran. |
| **Live** | Match Center | `/match/:id/live` | Live stats, chat, gift, reaction. |
| **AI** | AI Assistant | `/dashboard/ai-chat` | Full screen chatbot. |
| **Monetisasi** | Coin Shop | `/dashboard/topup` | Topup & Redeem. |
| | Store / Marketplace | `/store` | Jual beli merch & tiket. |
| **Gamifikasi** | Mission Center | `/dashboard/missions` | Klaim reward harian & Battle Pass. |
| | Fantasy Manager | `/fantasy/:ligaId` | Halaman susun tim fantasy. |
| **Community** | Scrim Finder | `/dashboard/scrim` | Cari lawan sparring. |
| **Tools** | Overlay View | `/tools/overlay/:id` | Tampilan khusus OBS. |

---

## 6. Roadmap Pengembangan Lengkap

1.  **Phase 1 - Core & Monetization:**
    *   Guest View, Social Features, Coin System.
2.  **Phase 2 - AI & Automation:**
    *   AI Chatbot, Auto-Journalism, Smart Scheduling.
3.  **Phase 3 - Retention & Expansion (Gamification):**
    *   Mission System, Fantasy League, Scrim Finder.
