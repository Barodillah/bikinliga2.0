# Master Plan: BikinLiga 2.0 (Updated)

Strategi utama: **Community Engine → Engagement Loop → Monetisasi Natural**.

---

## ✅ 1. Status Saat Ini (Implemented Features)

Berikut adalah fondasi yang sudah terbangun di codebase:

### **A. Core System & Auth**
- [x] **Authentication**: Login & Register dengan Supabase + Google OAuth.
- [x] **User Management**: Context untuk user session & role.
- [x] **Subscription Logic**: Deteksi Plan (Free/Pro/Visionary) di `AuthContext`.

### **B. Dashboard & League Management**
- [x] **Dashboard UI**: Layout responsif dengan sidebar & header.
- [x] **Tournament Creation**: Flow pembuatan liga/turnamen.
- [x] **Management Tools**:
    - [x] Bracket Generator (Sistem Gugur).
    - [x] Standings Table (Klasemen Otomatis).
    - [x] Match Scorer (Input skor & statistik).
    - [x] Top Scorer List.
    - [x] Player Cards.
- [x] **Spiritual Insight**: Widget unik (Zodiac, Shio) untuk personal touch.

### **C. User Engagement & AI**
- [x] **Chatbot Assistant**: Fitur chat AI untuk bantuan teknis/fun.
- [x] **Ad Integration**: `AdSlot` component untuk monetisasi dasar (iklan).
- [x] **TIER System**: Struktur data untuk pembagian fitur Free vs Premium.

### **D. Public Facing**
- [x] **Landing Page**: Modern landing page (Hero, Features, Pricing).

---

## 🚀 2. Roadmap: Fitur Belum Terimplementasi (Prioritized)

Fokus selanjutnya adalah mengubah aplikasi dari "Tools Admin" menjadi "Ekosistem Komunitas".

### **PRIORITAS 1: Engagement & "Sticky" Features (Agar User Balik Terus)**
> Target: Meningkatkan Daily Active Users (DAU) & Retensi.

1.  **Gamification System (XP & Level)**
    *   **Detail**: User dapat XP setiap input skor, menang match, atau share ke sosmed. Level tinggi membuka avatar frame atau badge khusus.
    *   **Tech Stack**: Database trigger untuk update XP, UI Progress Bar di dashboard.

2.  **Notification System (WA / Email / In-App)**
    *   **Detail**: Notifikasi otomatis: "Match kamu besok jam 19:00", "Lawanmu baru saja menang 5-0!".
    *   **Implementation**: Integrasi dengan layanan WA Gateway (misal: Fonnte/Wablas) atau Email Service (Resend/SendGrid).

3.  **Interactive League Home (Mobile First)**v
    *   **Detail**: Halaman khusus liga yang *scrollable* seperti IG Feed. Isinya: Hasil match terakhir, Jadwal next match, Klasemen mini.
    *   **Why**: Ini halaman yang akan dicek player setiap hari.

### **PRIORITAS 2: Monetization Engine (Uang Masuk)**
> Target: Mengubah user gratisan menjadi user berbayar.

4.  **Payment Gateway Integration**
    *   **Detail**: Integrasi Midtrans atau Xendit untuk auto-confirm pembayaran subscription.
    *   **Scope**: Handle webhook success/failure, update status subscription real-time.

5.  **Coin System (Virtual Currency)**
    *   **Detail**: Mata uang internal untuk beli item "renyah".
    *   **Flow**: Beli Coin via Midtrans -> Tukar Coin untuk Fitur (misal: Reset Jadwal, Highlight Match).
    *   **Implementation**: Table `user_coins`, `transaction_history`.

6.  **Premium Locking Mechanism (Hard Enforcement)**
    *   **Detail**: Mencegah user Free membuat >1 turnamen secara sistem (bukan cuma UI hidden).
    *   **Tech**: Logic check di API/Server Actions saat create tournament.

### **PRIORITAS 3: Social & Viral Loop (Marketing Gratis)**
> Target: User mengajak teman-temannya masuk.

7.  **Auto-Generator Share Image**
    *   **Detail**: Tombol "Share Klasemen" yang generate gambar 1080x1920 (Story size) dengan statistik terkini + Logo Sponsor + Logo BikinLiga.
    *   **Tech**: Library `html2canvas` atau `satori`.

8.  **Public League Page (SEO Friendly)**
    *   **Detail**: Halaman liga yang bisa diakses publik tanpa login (read-only).
    *   **SEO**: Meta tags dinamis agar muncul di Google ("Klasemen Liga Kantor PT Maju").

---

## 🛠️ 3. Detail Implementasi Teknis (Next Steps)

### **A. Gamification: Badge & XP**
Buat table `user_achievements` dan `badges`.
- **Trigger**:
    - Win 3 matches in a row -> Award "Hat-trick Hero" Badge.
    - Input skor < 1 jam setelah match selesai -> +10 XP (Admin Rajin).

### **B. Share Image Generator (Viral Machine)**
Gunakan **html2canvas**.
- Buat component hidden yang layout-nya Story-ready.
- Isi data klasemen/score.
- Saat klik "Share", convert component tsb jadi BLOB image -> Download/Share API.

### **C. Coin Economy System**
Jangan hanya jual fitur admin. Jual "Emosi".
- **Coin Sink Ideas**:
    - "Sewa" Wasit AI untuk analisa match (sudah ada basic-nya).
    - Custom Frame untuk profil tim.
    - Taunting sticker di chat liga.

---

## 📊 Summary Strategy

1.  **Fase Sekarang**: **Fondasi Admin Selesai**. App sudah berguna sebagai *utility*.
2.  **Next Month**: **Engagement**. Fokus bikin *addictive* dengan Badge & Social Share.
3.  **Next Quarter**: **Monetization**. Nyalakan Payment Gateway setelah user base terbentuk & "nyangkut".
