# Rencana Implementasi Sistem Achievement

Dokumen ini merinci rencana teknis untuk menambahkan fitur Achievement (Pencapaian) ke dalam BikinLiga 2.0.

## 1. Skema Database (MySQL)

Kita perlu membuat dua tabel baru menggunakan file migrasi SQL.

### Tabel `achievements`
Menyimpan **definisi** semua achievement yang tersedia di sistem.

```sql
CREATE TABLE IF NOT EXISTS achievements (
    id VARCHAR(50) PRIMARY KEY, -- kode unik, misal: 'tour_winner_1', 'eco_first_topup'
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50) NOT NULL, -- Nama icon Lucide atau path gambar
    category ENUM('tournament', 'match', 'social', 'economy', 'membership', 'special') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Tabel `user_achievements`
Mencatat achievement apa yang sudah didapatkan oleh user.

```sql
CREATE TABLE IF NOT EXISTS user_achievements (
    id VARCHAR(36) PRIMARY KEY, -- UUID
    user_id VARCHAR(36) NOT NULL,
    achievement_id VARCHAR(50) NOT NULL,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_showcased BOOLEAN DEFAULT FALSE, -- Untuk fitur "Select up to 3 achievements" di profile
    metadata JSON, -- Menyimpan detail konteks (misal: "Turnamen ABC Season 1" termasuk poin, menang berapa kali, dll)
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_achievement (user_id, achievement_id) -- Mencegah duplikat achievement yang sama
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 2. Daftar Achievement Dasar (Seed Data)

Berikut adalah daftar achievement awal yang akan dimasukkan ke database:

| ID | Nama | Deskripsi | Kategori | Trigger Logic |
| :--- | :--- | :--- | :--- | :--- |
| `tour_champ` | **Champion** | Menangkan juara 1 di turnamen apapun | Tournament | Saat status turnamen 'completed' & user ada di rank 1 |
| `tour_runner_up` | **Finalist** | Meraih juara 2 di turnamen | Tournament | Saat status turnamen 'completed' & user ada di rank 2 |
| `tour_3rd_place` | **Podium Finisher** | Meraih juara 3 di turnamen | Tournament | Saat status turnamen 'completed' & user ada di rank 3 |
| `tour_top_scorer` | **Golden Boot** | Menjadi Top Scorer di turnamen | Tournament | Agregasi stats pemain saat turnamen selesai |
| `sub_caption` | **Captain** | Berlangganan paket Captain | Membership | Saat webhook payment sukses untuk plan 'captain' |
| `sub_pro` | **Pro Player** | Berlangganan paket Pro League | Membership | Saat webhook payment sukses untuk plan 'pro_league' |
| `eco_first_topup` | **First Blood** | Melakukan Top Up koin pertama kali | Economy | Saat webhook payment sukses untuk tipe 'topup' & count trx == 1 |
| `eco_wealthy` | **High Roller** | Memiliki saldo 1000 koin | Economy | Cek saldo wallet setiap kali transaksi sukses |
| `social_verified` | **Verified** | Akun terverifikasi | Social | Saat `users.is_verified` berubah menjadi true |
| `comm_founder` | **Community Founder** | Membuat komunitas baru | Social | Saat user sukses membuat E-Club/Community |
| `comm_member` | **Team Player** | Bergabung ke dalam komunitas | Social | Saat user sukses join ke E-Club/Community |
| `early_adopter` | **Early Adopter** | Bergabung sebelum 1 April 2026 | Special | Script khusus atau cek `users.created_at` < '2026-04-01' |
| `rank_1` | **Rank 1** | Menjadi rank 1 di season tertentu | Season | Saat reset season user ada di rank 1 |
| `rank_2` | **Rank 2** | Menjadi rank 2 di season tertentu | Season | Saat reset season user ada di rank 2 |
| `rank_3` | **Rank 3** | Menjadi rank 3 di season tertentu | Season | Saat reset season user ada di rank 3 |

---

## 3. Alur Logic (Backend Flow)

Implementasi logic akan tersebar di beberapa bagian backend (`server/routes/` atau `server/controllers/`). Disarankan membuat helper function `unlockAchievement(userId, achievementId, metadata)` untuk dipakai ulang.

### A. Helper Function `unlockAchievement`
1.  Cek apakah user sudah punya achievement ini di `user_achievements`.
2.  Jika belum, `INSERT` ke `user_achievements`.
3.  Kirim notifikasi (realtime/db notification) ke user: "Achievement Unlocked: [Name]!"

### B. Trigger: Selesai Turnamen (`TournamentCompleted`)
Lokasi: `server/routes/tournament.js` (saat update status ke `completed`)

1.  **Ambil Data Klasemen Akhir**: Query tabel `standings` atau kalkulasi dari `matches`.
2.  **Juara 1, 2, 3**:
    - Loop peserta rank 1-3.
    - Panggil `unlockAchievement(userId, 'tour_champ')` untuk rank 1, dst.
3.  **Top Scorer**:
    - Query `match_scorers` / `player_statistics` filter by tournament_id.
    - Sort by `goals DESC`.
    - Panggil `unlockAchievement(userId, 'tour_top_scorer')`.

### C. Trigger: Pembayaran & Langganan (`PaymentSuccess`)
Lokasi: `server/routes/external.js` (Midtrans webhook) atau `checkTransactionStatus`

1.  **Subscription**:
    - Jika `transaction_status` == `settlement` DAN tipe == `subscription`.
    - Cek `plan_id` atau nama plan.
    - Panggil `unlockAchievement(userId, 'sub_captain')` jika Captain.
    - Panggil `unlockAchievement(userId, 'sub_pro')` jika Pro League.
2.  **Top Up**:
    - Jika tipe == `topup`.
    - Cek history transaksi user. Jika ini transaksi sukses pertama -> `unlockAchievement(userId, 'eco_first_topup')`.
    - Cek saldo wallet user (`wallets.balance`). Jika >= 1000 -> `unlockAchievement(userId, 'eco_wealthy')`.

### D. Trigger: Komunitas (`CommunityAction`)
Lokasi: `server/routes/communities.js`

1.  **Create Community**:
    - Saat endpoint `POST /api/communities` sukses.
    - Panggil `unlockAchievement(userId, 'comm_founder')`.
2.  **Join Community**:
    - Saat endpoint `POST /api/communities/:id/join` sukses.
    - Panggil `unlockAchievement(userId, 'comm_member')`.

---

## 4. Implementasi Frontend

### A. Update `Profile.jsx` (Public View)
Mengganti placeholder statis dengan data dari API.

1.  **Fetch Data**: Endpoint `/api/user/public/:username` perlu diupdate (atau buat endpoint baru `/api/user/:username/achievements`) untuk return list achievement user.
2.  **Render Grid**: Map data API ke component grid yg sudah ada.
    - Active State: Grayscale `0` (berwarna).
    - Locked State: Grayscale `1` (hitam putih) + Opacity.

### B. Update `MyProfile.jsx` (Dashboard/Private View)
Mengelola showcase achievement.

1.  **Selection Logic**: User memilih max 3 achievement dari list achievement yang **sudah di-unlock**.
2.  **Save Config**:
    - Kirim array `[ach_id_1, ach_id_2]` ke backend.
    - Backend update kolom `is_showcased = true` di tabel `user_achievements` (set false untuk yang tidak dipilih).

---

## 5. Langkah Pengerjaan

1.  [ ] Buat migrasi SQL: `server/migrations/XXX_create_achievements_table.sql`.
2.  [ ] Jalankan migrasi: `npm run migrate`.
3.  [ ] Seed data achievement dasar (masukkan list ID di atas ke DB).
4.  [ ] Buat fungsi backend `unlockAchievement`.
5.  [ ] Pasang trigger `unlockAchievement` di logic Turnamen Selesai & Webhook Payment.
6.  [ ] Buat API Endpoint: `GET /api/achievements/me` (untuk dashboard) dan `GET /api/achievements/user/:username` (untuk public profile).
7.  [ ] Integrasi Frontend `MyProfile.jsx` dan `Profile.jsx`.
