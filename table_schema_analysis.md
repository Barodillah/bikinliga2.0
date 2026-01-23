# Analisis Mendalam: Kelengkapan Table Schema BikinLiga 2.0

## Executive Summary

Setelah memeriksa secara mendalam `table_schema.md` dan membandingkannya dengan seluruh fitur yang ada di frontend aplikasi, **skema database sudah memiliki fondasi yang baik**, namun **memerlukan beberapa tambahan tabel** untuk mendukung fitur-fitur yang sudah diimplementasikan di UI.

---

## ✅ Tabel yang Sudah Lengkap & Sesuai

| Tabel | Status | Catatan |
|-------|--------|---------|
| `users` | ✅ Baik | Struktur cukup untuk auth |
| `user_profiles` | ✅ Baik | Preferences via JSONB sudah fleksibel |
| `wallets` | ✅ Baik | Mendukung sistem koin |
| `transactions` | ✅ Baik | Audit trail lengkap |
| `subscription_plans` | ✅ Baik | Tier system (Free/Captain/Pro Liga) |
| `user_subscriptions` | ✅ Baik | Tracking langganan user |
| `tournaments` | ✅ Baik | Core tournament data lengkap |
| `participants` | ✅ Baik | Tim/peserta turnamen |
| `matches` | ✅ Baik | Jadwal & hasil pertandingan |
| `standings` | ✅ Baik | Klasemen liga |
| `communities` | ✅ Baik | eClub data |
| `community_members` | ✅ Baik | Keanggotaan komunitas |
| `posts` | ✅ Baik | Feed sosial |
| `complaints` | ✅ Baik | Sistem laporan |
| `logs` | ✅ Baik | Audit log admin |

---

## ⚠️ Tabel yang PERLU DITAMBAHKAN

Berikut adalah tabel-tabel yang **belum ada** di skema namun **dibutuhkan oleh fitur frontend**:

### 1. 🎮 **`players`** (Daftar Pemain per Tim)

**Sumber Fitur**: `AddPlayer.jsx`, `TournamentDetail.jsx` (Player Cards, Top Scorer)

Saat ini peserta turnamen hanya ada di level `participants` (tim). Perlu tabel detail pemain per tim.

```sql
players
- id (UUID, PK)
- participant_id (UUID, FK -> participants.id)
- tournament_id (UUID, FK -> tournaments.id)
- user_id (UUID, FK -> users.id, Nullable) -- Jika pemain punya akun
- name (VARCHAR) -- Nama pemain
- jersey_number (INT)
- team_name (VARCHAR) -- Cache nama tim yang dipilih (dari API)
- position (VARCHAR) -- GK, DF, MF, FW
- avatar_url (VARCHAR)
- stats (JSONB) -- { goals: 0, assists: 0, yellowCards: 0, redCards: 0 }
- payment_status (ENUM: 'pending', 'paid', 'waived')
- status (ENUM: 'pending', 'approved', 'rejected')
- created_at (TIMESTAMP)
```

---

### 2. ⚽ **`match_events`** (Kejadian dalam Pertandingan)

**Sumber Fitur**: `MatchManagement.jsx` (Gol, Kartu, Subst)

Kolom `details` (JSONB) di tabel `matches` kurang optimal untuk query statistik. Perlu normalized table.

```sql
match_events
- id (UUID, PK)
- match_id (UUID, FK -> matches.id)
- player_id (UUID, FK -> players.id, Nullable)
- type (ENUM: 'goal', 'own_goal', 'yellow_card', 'red_card', 'substitution', 'penalty_scored', 'penalty_missed')
- minute (INT) -- Menit kejadian
- half (INT) -- 1 atau 2
- team_side (ENUM: 'home', 'away')
- detail (VARCHAR) -- Keterangan tambahan
- created_at (TIMESTAMP)
```

---

### 3. 🏆 **`tournament_prizes`** (Pengaturan Hadiah)

**Sumber Fitur**: `TournamentDetail.jsx` (Tab Prize/Hadiah)

```sql
tournament_prizes
- id (UUID, PK)
- tournament_id (UUID, FK -> tournaments.id)
- is_enabled (BOOLEAN)
- total_pool (DECIMAL) -- Total hadiah
- sources (JSONB) -- { registration: 500000, sponsor: 1000000, admin_contribution: 200000 }
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

---

### 4. 🥇 **`prize_recipients`** (Penerima Hadiah)

**Sumber Fitur**: `TournamentDetail.jsx` (Daftar penerima hadiah: Juara 1, 2, 3, Top Scorer, dll)

```sql
prize_recipients
- id (UUID, PK)
- tournament_prize_id (UUID, FK -> tournament_prizes.id)
- title (VARCHAR) -- "Juara 1", "Top Scorer", "Best Keeper"
- percentage (DECIMAL) -- Persentase dari total pool
- amount (DECIMAL) -- Nominal hadiah (calculated/manual)
- is_manual (BOOLEAN) -- True jika nominal diisi manual
- participant_id (UUID, FK -> participants.id, Nullable) -- Pemenang (diisi setelah turnamen selesai)
- player_id (UUID, FK -> players.id, Nullable) -- Untuk individual award
- order_index (INT) -- Urutan tampilan
```

---

### 5. 📰 **`tournament_news`** (Berita Turnamen)

**Sumber Fitur**: `TournamentDetail.jsx`, `UserTournamentDetail.jsx` (Tab News dengan fitur CRUD)

```sql
tournament_news
- id (UUID, PK)
- tournament_id (UUID, FK -> tournaments.id)
- author_id (UUID, FK -> users.id)
- title (VARCHAR)
- content (TEXT)
- image_url (VARCHAR, Nullable)
- is_pinned (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

---

### 6. 🤖 **`ai_chat_sessions`** (Sesi Chat AI)

**Sumber Fitur**: `UserTournamentDetail.jsx` (AI Analysis Tab), `AdminAIAnalysis.jsx`

```sql
ai_chat_sessions
- id (UUID, PK)
- user_id (UUID, FK -> users.id)
- tournament_id (UUID, FK -> tournaments.id, Nullable) -- Jika terkait turnamen
- context_type (ENUM: 'general', 'tournament_analysis', 'admin')
- title (VARCHAR) -- "Ide Turnamen Baru", auto-generated
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

---

### 7. 💬 **`ai_chat_messages`** (Pesan Chat AI)

**Sumber Fitur**: `UserTournamentDetail.jsx` (AI Analysis), Chatbot, `AdminAIAnalysis.jsx`

```sql
ai_chat_messages
- id (UUID, PK)
- session_id (UUID, FK -> ai_chat_sessions.id)
- role (ENUM: 'user', 'assistant')
- content (TEXT)
- metadata (JSONB, Nullable) -- Token usage, model info, etc.
- created_at (TIMESTAMP)
```

---

### 8. 🌟 **`gamification` / `user_xp`** (Sistem XP & Level)

**Sumber Fitur**: `pengembangan_utama.md` (Gamification System), `Ranking.jsx` (Leaderboard dengan points)

```sql
user_xp
- id (UUID, PK)
- user_id (UUID, FK -> users.id, Unique)
- total_xp (INT) -- Total XP
- level (INT) -- Current level
- current_rank (INT, Nullable) -- Rank di leaderboard
- updated_at (TIMESTAMP)

xp_logs
- id (UUID, PK)
- user_id (UUID, FK -> users.id)
- amount (INT) -- XP gained/lost
- source (ENUM: 'match_win', 'score_input', 'social_share', 'daily_login', 'achievement')
- reference_id (UUID, Nullable) -- ID terkait (match_id, etc)
- description (VARCHAR)
- created_at (TIMESTAMP)
```

---

### 9. 🏅 **`badges`** & **`user_badges`** (Sistem Badge/Achievement)

**Sumber Fitur**: `pengembangan_utama.md` (Award "Hat-trick Hero" Badge, Admin Rajin badge)

```sql
badges
- id (INT, PK)
- name (VARCHAR) -- "Hat-trick Hero"
- description (TEXT)
- icon_url (VARCHAR)
- category (ENUM: 'tournament', 'social', 'admin', 'special')
- requirement (JSONB) -- { type: 'consecutive_wins', count: 3 }
- created_at (TIMESTAMP)

user_badges
- id (UUID, PK)
- user_id (UUID, FK -> users.id)
- badge_id (INT, FK -> badges.id)
- earned_at (TIMESTAMP)
- reference_id (UUID, Nullable) -- Turnamen/match di mana badge didapat
```

---

### 10. 🔔 **`notifications`** (Sistem Notifikasi)

**Sumber Fitur**: `pengembangan_utama.md` (Notification System)

```sql
notifications
- id (UUID, PK)
- user_id (UUID, FK -> users.id)
- type (ENUM: 'match_reminder', 'tournament_update', 'social', 'system', 'payment')
- title (VARCHAR)
- message (TEXT)
- data (JSONB) -- { match_id, tournament_id, etc }
- is_read (BOOLEAN)
- channel (ENUM: 'in_app', 'email', 'whatsapp')
- sent_at (TIMESTAMP)
- read_at (TIMESTAMP, Nullable)
```

---

### 11. ❤️ **`post_likes`** & **`post_comments`** (Interaksi Sosial)

**Sumber Fitur**: `EClub.jsx` (Likes & Comments di posts)

```sql
post_likes
- post_id (UUID, FK -> posts.id)
- user_id (UUID, FK -> users.id)
- created_at (TIMESTAMP)
- PRIMARY KEY (post_id, user_id)

post_comments
- id (UUID, PK)
- post_id (UUID, FK -> posts.id)
- user_id (UUID, FK -> users.id)
- content (TEXT)
- parent_id (UUID, FK -> post_comments.id, Nullable) -- Untuk reply
- created_at (TIMESTAMP)
```

---

### 12. 📺 **`streams`** (Live Streaming Match)

**Sumber Fitur**: `Stream.jsx`, `StreamDetail.jsx`

```sql
streams
- id (UUID, PK)
- match_id (UUID, FK -> matches.id)
- hosted_by (UUID, FK -> users.id, Nullable)
- title (VARCHAR)
- thumbnail_url (VARCHAR)
- status (ENUM: 'scheduled', 'live', 'ended')
- viewer_count (INT)
- stats (JSONB) -- { likes: 0, shares: 0 }
- started_at (TIMESTAMP, Nullable)
- ended_at (TIMESTAMP, Nullable)
- created_at (TIMESTAMP)

stream_comments
- id (UUID, PK)
- stream_id (UUID, FK -> streams.id)
- user_id (UUID, FK -> users.id)
- content (TEXT)
- created_at (TIMESTAMP)
```

---

### 13. 👥 **`tournament_admins`** (Co-Admin Turnamen)

**Sumber Fitur**: `tier_plan.md` (Pro Liga: Unlimited co-admin)

```sql
tournament_admins
- tournament_id (UUID, FK -> tournaments.id)
- user_id (UUID, FK -> users.id)
- role (ENUM: 'owner', 'co_admin', 'scorer')
- invited_at (TIMESTAMP)
- accepted_at (TIMESTAMP, Nullable)
- PRIMARY KEY (tournament_id, user_id)
```

---

### 14. 📤 **`topup_requests`** (Request Top Up Manual)

**Sumber Fitur**: `TopUp.jsx` (Manual Top Up dengan bukti transfer), `AdminTransaction.jsx`

```sql
topup_requests
- id (UUID, PK)
- user_id (UUID, FK -> users.id)
- amount_idr (DECIMAL) -- Nominal transfer
- amount_coins (INT) -- Jumlah koin yang diminta
- proof_url (VARCHAR) -- Bukti transfer
- bank_name (VARCHAR)
- account_number (VARCHAR)
- account_holder (VARCHAR, Nullable)
- status (ENUM: 'pending', 'approved', 'rejected')
- reviewed_by (UUID, FK -> users.id, Nullable)
- reviewed_at (TIMESTAMP, Nullable)
- notes (TEXT, Nullable) -- Catatan admin
- created_at (TIMESTAMP)
```

---

## 📝 Perubahan Minor pada Tabel Existing

### `tournaments`
**Tambahan kolom yang mungkin diperlukan:**
```sql
+ registration_fee (DECIMAL) -- Biaya pendaftaran (untuk prize pool)
+ rules_text (TEXT) -- Plain text rules selain JSONB
+ sponsor_info (JSONB) -- { logo, name, banner_url }
+ custom_url (VARCHAR, Nullable) -- untuk tier Captain/Pro Liga
```

### `participants`
**Tambahan kolom:**
```sql
+ registration_fee_paid (BOOLEAN)
+ registered_at (TIMESTAMP)
+ payment_proof_url (VARCHAR, Nullable)
```

### `communities`
**Tambahan kolom:**
```sql
+ banner_url (VARCHAR) -- Cover image
+ type (ENUM: 'public', 'private')
+ member_count (INT) -- Cached count
```

---

## 📊 Summary Prioritas Implementasi

| Prioritas | Tabel | Alasan |
|-----------|-------|--------|
| 🔴 **HIGH** | `players`, `match_events` | Core feature turnamen sudah active di UI |
| 🔴 **HIGH** | `ai_chat_sessions`, `ai_chat_messages` | AI Analysis feature sudah ada |
| 🟡 **MEDIUM** | `tournament_prizes`, `prize_recipients` | Tab Prize sudah diimplementasi |
| 🟡 **MEDIUM** | `tournament_news` | CRUD News sudah ada di UI |
| 🟡 **MEDIUM** | `topup_requests` | Manual TopUp flow sudah ada |
| 🟢 **LOW** | `user_xp`, `xp_logs`, `badges` | Gamification belum fully implemented |
| 🟢 **LOW** | `notifications` | Fitur belum complete di frontend |
| 🟢 **LOW** | `streams`, `stream_comments` | Fitur preview saja |

---

## ✅ Rekomendasi Akhir

1. **Update `table_schema.md`** untuk memasukkan tabel-tabel baru di atas
2. **Buat migration** untuk tabel prioritas HIGH terlebih dahulu
3. **Review JSONB columns** - pastikan tidak terlalu banyak data penting di JSONB karena sulit di-query

> [!IMPORTANT]
> Tabel `players` dan `match_events` adalah **blocking** untuk fitur Player Cards, Top Scorer, dan Match Event recording yang sudah ada di UI.
