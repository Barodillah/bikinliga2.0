# Database Schema Design for BikinLiga 2.0

Dokumen ini mendetailkan struktur database relasional (PostgreSQL recommended) untuk mendukung seluruh fitur aplikasi BikinLiga 2.0, mulai dari manajemen turnamen, sosial, hingga sistem ekonomi/transaksi.

## 1. Authentication & Users

### `users`
Tabel utama untuk menyimpan data akun pengguna.
- `id` (UUID, PK): Unique identifier.
- `username` (VARCHAR, Unique): Username unik.
- `email` (VARCHAR, Unique): Email user.
- `password` (VARCHAR): Password terenkripsi (hash bcrypt).
- `name` (VARCHAR): Nama lengkap.
- `phone` (VARCHAR): Nomor telepon.
- `avatar_url` (VARCHAR): URL foto profil.
- `role` (ENUM: 'superadmin', 'admin', 'user'): Peran user dalam sistem.
- `created_at` (TIMESTAMP): Waktu pendaftaran.
- `updated_at` (TIMESTAMP): Waktu update profil terakhir.

### `user_profiles`
Menyimpan data tambahan/detail user.
- `user_id` (UUID, PK, FK -> users.id): Relasi ke tabel user.
- `bio` (TEXT): Deskripsi singkat profil.
- `city` (VARCHAR): Kota domisili.
- `birth_date` (DATE): Tanggal lahir (untuk fitur spiritual/zodiac).
- `preferences` (JSONB): Konfigurasi user (notifikasi, tema, dll).

## 2. Economy & Subscription

### `wallets`
Menyimpan saldo koin user.
- `id` (UUID, PK): ID Wallet.
- `user_id` (UUID, Unique, FK -> users.id): Pemilik wallet.
- `balance` (DECIMAL): Saldo koin saat ini. Default: 0.
- `updated_at` (TIMESTAMP): Terakhir saldo berubah.

### `transactions`
Mencatat riwayat keluar-masuk koin (Audit Trail).
- `id` (UUID, PK): ID Transaksi.
- `wallet_id` (UUID, FK -> wallets.id): Wallet yang terdampak.
- `type` (ENUM: 'topup', 'spend', 'reward', 'refund'): Jenis transaksi.
- `amount` (DECIMAL): Jumlah koin (positif untuk masuk, negatif untuk keluar).
- `category` (VARCHAR): Label (e.g., 'Deposit', 'Create Tournament', 'Ad Reward').
- `description` (TEXT): Detail transaksi.
- `status` (ENUM: 'pending', 'success', 'failed'): Status pembayaran.
- `reference_id` (VARCHAR): ID referensi eksternal (midtrans ID, atau ID turnamen terkait).
- `created_at` (TIMESTAMP): Waktu transaksi.

### `subscription_plans`
Daftar paket langganan yang tersedia (Free, Pro, Visionary).
- `id` (INT, PK): ID Plan.
- `name` (ENUM: 'free', 'captain', 'pro_league'): Nama paket.
- `price` (DECIMAL): Harga dalam Rupiah.
- `duration_days` (INT): Durasi aktif dalam hari (30, 365, dll).
- `features` (JSONB): List fitur yang didapat.

### `user_subscriptions`
Status langganan user saat ini.
- `id` (UUID, PK): ID Subscription.
- `user_id` (UUID, FK -> users.id): User yang berlangganan.
- `plan_id` (INT, FK -> subscription_plans.id): Paket yang diambil.
- `start_date` (TIMESTAMP): Mulai aktif.
- `end_date` (TIMESTAMP): Berakhir.
- `status` (ENUM: 'active', 'expired', 'cancelled').

## 3. Tournament System

### `tournaments`
Data utama turnamen.
- `id` (UUID, PK): ID Turnamen.
- `organizer_id` (UUID, FK -> users.id): Pembuat turnamen.
- `name` (VARCHAR): Nama turnamen.
- `slug` (VARCHAR, Unique): URL friendly name.
- `description` (TEXT): Deskripsi turnamen.
- `banner_url` (VARCHAR): Foto banner.
- `logo_url` (VARCHAR): Logo turnamen.
- `type` (ENUM: 'league', 'knockout', 'group_knockout'): Format kompetisi.
- `visibility` (ENUM: 'public', 'private'): Visibilitas.
- `status` (ENUM: 'draft', 'open', 'active', 'completed', 'archived'): Status turnamen.
- `max_participants` (INT): Kapasitas maksimal.
- `current_participants` (INT): Jumlah peserta saat ini.
- `start_date` (DATE): Rencana mulai.
- `end_date` (DATE): Rencana selesai.
- `rules` (JSONB): Aturan khusus (poin menang, seri, kalah, sistem tie-breaker).
- `created_at` (TIMESTAMP).

### `participants`
Tim atau individu yang bergabung ke turnamen.
- `id` (UUID, PK): ID Peserta.
- `tournament_id` (UUID, FK -> tournaments.id): Turnamen terkait.
- `user_id` (UUID, FK -> users.id, Nullable): Jika user terdaftar di aplikasi.
- `name` (VARCHAR): Nama Tim/Peserta (bisa input manual jika guest).
- `logo_url` (VARCHAR): Logo tim.
- `status` (ENUM: 'pending', 'approved', 'rejected', 'disqualified').
- `stats` (JSONB): Cache statistik di turnamen ini (Main, Menang, Gol, Poin).

### `matches`
Jadwal dan hasil pertandingan.
- `id` (UUID, PK): ID Pertandingan.
- `tournament_id` (UUID, FK -> tournaments.id).
- `home_participant_id` (UUID, FK -> participants.id): Tim Kandang. (Bisa null jika type knockout/ TBD)
- `away_participant_id` (UUID, FK -> participants.id): Tim Tandang. (Bisa null jika type knockout/ TBD)
- `round` (INT): Minggu ke-/Babak ke-.
- `start_time` (TIMESTAMP): Jadwal kick-off.
- `status` (ENUM: 'scheduled', 'live', 'completed', 'postponed').
- `home_score` (INT): Skor kandang.
- `away_score` (INT): Skor tandang.
- `details` (JSONB): Detail kejadian (pencetak gol, kartu, dll).

### `standings` (Biasanya View atau Cached Table)
Klasemen sementara/akhir (khusus format Liga/Group).
- `id` (UUID, PK).
- `tournament_id` (UUID, FK).
- `participant_id` (UUID, FK).
- `group_name` (VARCHAR, Nullable): Nama grup (e.g., 'Group A') untuk format Group.
- `points` (INT): Total Poin.
- `played` (INT): Main.
- `won` (INT): Menang.
- `drawn` (INT): Seri.
- `lost` (INT): Kalah.
- `goals_for` (INT): Gol memasukkan.
- `goals_against` (INT): Kemasukan.
- `goal_difference` (INT): Selisih gol.

## 4. Community & Social (eClub)

### `communities`
Komunitas atau eClub.
- `id` (UUID, PK).
- `owner_id` (UUID, FK -> users.id).
- `name` (VARCHAR).
- `description` (TEXT).
- `logo_url` (VARCHAR).
- `is_verified` (BOOLEAN).
- `created_at` (TIMESTAMP).

### `community_members`
Anggota komunitas.
- `community_id` (UUID, FK).
- `user_id` (UUID, FK).
- `role` (ENUM: 'member', 'moderator', 'admin').
- `joined_at` (TIMESTAMP).

### `posts`
Postingan di feed komunitas atau turnamen.
- `id` (UUID, PK).
- `author_id` (UUID, FK -> users.id).
- `community_id` (UUID, FK, Nullable).
- `tournament_id` (UUID, FK, Nullable).
- `content` (TEXT).
- `image_url` (VARCHAR).
- `created_at` (TIMESTAMP).

## 5. Admin & Support

### `complaints`
Laporan user.
- `id` (UUID, PK).
- `user_id` (UUID, FK -> users.id): Pelapor.
- `subject` (VARCHAR).
- `message` (TEXT).
- `status` (ENUM: 'open', 'in_progress', 'resolved', 'closed').
- `created_at` (TIMESTAMP).

### `logs`
Log aktivitas sistem untuk admin.
- `id` (UUID, PK).
- `admin_id` (UUID, FK -> users.id, Nullable).
- `action` (VARCHAR).
- `target_type` (VARCHAR): e.g., 'tournament', 'user'.
- `target_id` (UUID).
- `details` (JSONB).
- `ip_address` (VARCHAR).
- `created_at` (TIMESTAMP).

## 6. Players & Match Events

### `players`
Daftar pemain per tim dalam turnamen.
- `id` (UUID, PK): ID Pemain.
- `participant_id` (UUID, FK -> participants.id): Tim parent.
- `tournament_id` (UUID, FK -> tournaments.id): Turnamen terkait.
- `user_id` (UUID, FK -> users.id, Nullable): Jika pemain punya akun.
- `name` (VARCHAR): Nama pemain.
- `jersey_number` (INT): Nomor punggung.
- `team_name` (VARCHAR): Cache nama tim yang dipilih.
- `position` (ENUM: 'GK', 'DF', 'MF', 'FW', 'SUB').
- `avatar_url` (VARCHAR).
- `stats` (JSONB): { goals, assists, yellowCards, redCards }.
- `payment_status` (ENUM: 'pending', 'paid', 'waived').
- `status` (ENUM: 'pending', 'approved', 'rejected').
- `created_at` (TIMESTAMP).

### `match_events`
Kejadian dalam pertandingan (gol, kartu, dll).
- `id` (UUID, PK): ID Event.
- `tournament_id` (UUID, FK -> tournaments.id).
- `match_id` (UUID, FK -> matches.id).
- `participant_id` (UUID, FK -> participants.id, Nullable).
- `type` (ENUM: 'goal', 'penalty_goal', 'own_goal', 'yellow_card', 'red_card', 'substitution', 'penalty_missed', 'kickoff', 'halftime', 'fulltime').
- `player_name` (VARCHAR): Nama pemain. (Bisa null jika event tidak melibatkan pemain)
- `minute` (INT): Menit kejadian.
- `half` (INT): 1 atau 2.
- `team_side` (ENUM: 'home', 'away').
- `detail` (VARCHAR): Keterangan tambahan.
- `created_at` (TIMESTAMP).

## 7. Prize System

### `tournament_prizes`
Pengaturan hadiah turnamen.
- `id` (UUID, PK).
- `tournament_id` (UUID, FK -> tournaments.id).
- `is_enabled` (BOOLEAN): Apakah hadiah aktif.
- `total_pool` (DECIMAL): Total hadiah.
- `sources` (JSONB): { registration, sponsor, admin_contribution }.
- `created_at` (TIMESTAMP).
- `updated_at` (TIMESTAMP).

### `prize_recipients`
Penerima hadiah (Juara 1, Top Scorer, dll).
- `id` (UUID, PK).
- `tournament_prize_id` (UUID, FK -> tournament_prizes.id).
- `title` (VARCHAR): "Juara 1", "Top Scorer".
- `percentage` (DECIMAL): Persentase dari total pool.
- `amount` (DECIMAL): Nominal hadiah.
- `is_manual` (BOOLEAN): True jika nominal diisi manual.
- `participant_id` (UUID, FK -> participants.id, Nullable): Pemenang tim.
- `player_id` (UUID, FK -> players.id, Nullable): Pemenang individu.
- `order_index` (INT): Urutan tampilan.

## 8. Tournament Content

### `tournament_news`
Berita/pengumuman turnamen.
- `id` (UUID, PK).
- `tournament_id` (UUID, FK -> tournaments.id).
- `author_id` (UUID, FK -> users.id).
- `title` (VARCHAR).
- `content` (TEXT).
- `image_url` (VARCHAR, Nullable).
- `is_pinned` (BOOLEAN).
- `created_at` (TIMESTAMP).
- `updated_at` (TIMESTAMP).

### `tournament_admins`
Co-admin turnamen (untuk tier Captain/Pro Liga).
- `tournament_id` (UUID, FK -> tournaments.id).
- `user_id` (UUID, FK -> users.id).
- `role` (ENUM: 'owner', 'co_admin', 'scorer').
- `invited_at` (TIMESTAMP).
- `accepted_at` (TIMESTAMP, Nullable).
- PRIMARY KEY (tournament_id, user_id).

## 9. AI Chat System

### `ai_chat_sessions`
Sesi percakapan AI.
- `id` (UUID, PK).
- `user_id` (UUID, FK -> users.id).
- `tournament_id` (UUID, FK -> tournaments.id, Nullable).
- `context_type` (ENUM: 'general', 'tournament_analysis', 'admin').
- `title` (VARCHAR): Judul sesi (auto-generated).
- `created_at` (TIMESTAMP).
- `updated_at` (TIMESTAMP).

### `ai_chat_messages`
Pesan dalam sesi AI.
- `id` (UUID, PK).
- `session_id` (UUID, FK -> ai_chat_sessions.id).
- `role` (ENUM: 'user', 'assistant').
- `content` (TEXT).
- `metadata` (JSONB, Nullable): Token usage, model info.
- `created_at` (TIMESTAMP).

## 10. Gamification System

### `user_xp`
Data XP & level user.
- `id` (UUID, PK).
- `user_id` (UUID, FK -> users.id, Unique).
- `total_xp` (INT): Total XP akumulasi.
- `level` (INT): Level saat ini.
- `current_rank` (INT, Nullable): Rank di leaderboard.
- `updated_at` (TIMESTAMP).

### `xp_logs`
Riwayat perolehan XP.
- `id` (UUID, PK).
- `user_id` (UUID, FK -> users.id).
- `amount` (INT): XP gained/lost.
- `source` (ENUM: 'match_win', 'score_input', 'social_share', 'daily_login', 'achievement').
- `reference_id` (UUID, Nullable).
- `description` (VARCHAR).
- `created_at` (TIMESTAMP).

### `badges`
Definisi badge/achievement.
- `id` (INT, PK).
- `name` (VARCHAR): "Hat-trick Hero".
- `description` (TEXT).
- `icon_url` (VARCHAR).
- `category` (ENUM: 'tournament', 'social', 'admin', 'special').
- `requirement` (JSONB): { type, count }.
- `created_at` (TIMESTAMP).

### `user_badges`
Badge yang diperoleh user.
- `id` (UUID, PK).
- `user_id` (UUID, FK -> users.id).
- `badge_id` (INT, FK -> badges.id).
- `earned_at` (TIMESTAMP).
- `reference_id` (UUID, Nullable).

## 11. Notifications

### `notifications`
Notifikasi user (in-app, email, WA).
- `id` (UUID, PK).
- `user_id` (UUID, FK -> users.id).
- `type` (ENUM: 'match_reminder', 'tournament_update', 'social', 'system', 'payment').
- `title` (VARCHAR).
- `message` (TEXT).
- `data` (JSONB): { match_id, tournament_id, dll }.
- `is_read` (BOOLEAN).
- `channel` (ENUM: 'in_app', 'email', 'whatsapp').
- `sent_at` (TIMESTAMP).
- `read_at` (TIMESTAMP, Nullable).

## 12. Social Interactions

### `post_likes`
Like pada post komunitas.
- `post_id` (UUID, FK -> posts.id).
- `user_id` (UUID, FK -> users.id).
- `created_at` (TIMESTAMP).
- PRIMARY KEY (post_id, user_id).

### `post_comments`
Komentar pada post.
- `id` (UUID, PK).
- `post_id` (UUID, FK -> posts.id).
- `user_id` (UUID, FK -> users.id).
- `content` (TEXT).
- `parent_id` (UUID, FK -> post_comments.id, Nullable): Reply.
- `created_at` (TIMESTAMP).

## 13. Live Streaming

### `streams`
Data live stream pertandingan.
- `id` (UUID, PK).
- `match_id` (UUID, FK -> matches.id).
- `hosted_by` (UUID, FK -> users.id, Nullable).
- `title` (VARCHAR).
- `thumbnail_url` (VARCHAR).
- `status` (ENUM: 'scheduled', 'live', 'ended').
- `viewer_count` (INT).
- `stats` (JSONB): { likes, shares }.
- `started_at` (TIMESTAMP, Nullable).
- `ended_at` (TIMESTAMP, Nullable).
- `created_at` (TIMESTAMP).

### `stream_comments`
Komentar live di stream.
- `id` (UUID, PK).
- `stream_id` (UUID, FK -> streams.id).
- `user_id` (UUID, FK -> users.id).
- `content` (TEXT).
- `created_at` (TIMESTAMP).

## 14. Manual Top Up

### `topup_requests`
Request top up manual dengan bukti transfer.
- `id` (UUID, PK).
- `user_id` (UUID, FK -> users.id).
- `amount_idr` (DECIMAL): Nominal transfer.
- `amount_coins` (INT): Jumlah koin diminta.
- `proof_url` (VARCHAR): Bukti transfer.
- `bank_name` (VARCHAR).
- `account_number` (VARCHAR).
- `account_holder` (VARCHAR, Nullable).
- `status` (ENUM: 'pending', 'approved', 'rejected').
- `reviewed_by` (UUID, FK -> users.id, Nullable).
- `reviewed_at` (TIMESTAMP, Nullable).
- `notes` (TEXT, Nullable).
- `created_at` (TIMESTAMP).

---

## Penjelasan Relasi Penting

1.  **User -> Wallets**: One-to-One. Setiap user pasti punya 1 dompet koin.
2.  **User -> Tournaments**: One-to-Many. User bisa bikin banyak turnamen.
3.  **Tournaments -> Matches**: One-to-Many. Turnamen punya banyak match.
4.  **Transactions**: Bersifat *immutable* (tidak boleh diedit/hapus). Digunakan untuk menghitung ulang saldo jika ada dispute.
5.  **Participants**: Bisa berupa User (linked account) atau "Ghost Profile" (hanya nama) jika organizer input manual tim yang belum punya akun.
6.  **Participants -> Players**: One-to-Many. Setiap tim bisa punya banyak pemain.
7.  **Matches -> Match Events**: One-to-Many. Setiap pertandingan punya banyak kejadian (gol, kartu).
8.  **Tournaments -> Tournament Prizes**: One-to-One. Setiap turnamen punya 1 konfigurasi hadiah.
9.  **AI Chat Sessions -> Messages**: One-to-Many. Setiap sesi punya banyak pesan.
