# Rencana Implementasi: Sistem Ranking & Statistik (Final Decision)

## 1. Keputusan Arsitektur
User memutuskan: **Pisahkan Table**.
*   Tabel `users`: Fokus Auth & Profile dasar.
*   Tabel `user_statistics`: Fokus Data Ranking (Points, Winrate).

Ini keputusan yang bagus untuk **Separation of Concern**. Jika DB berkembang, tabel auth tidak terganggu frequent update dari tabel stats.

---

## 2. Struktur Database Baru

Kita akan membuat 2 tabel baru via Migration.

### A. Tabel `user_statistics` (Live Ranking)
Menyimpan total poin dan statistik akumulatif. Update setiap match selesai.

| Kolom | Tipe | Keterangan |
| :--- | :--- | :--- |
| `user_id` | VARCHAR(36) (PK) | One-to-One dengan `users.id`. Menggunakan ID yang sama agar join cepat. |
| `total_points` | INT | **INDEXED**. Default 0. |
| `total_matches` | INT | Default 0. |
| `total_wins` | INT | Default 0. |
| `total_losses` | INT | Default 0. |
| `total_draws` | INT | Default 0. |
| `goals_for` | INT | Default 0. (Total Goal) |
| `goals_against` | INT | Default 0. (Kemasukan) |
| `goal_difference`| INT | Default 0. (Selisih) |
| `win_rate` | DECIMAL(5,2)| Default 0.00. |
| `previous_points_daily`| INT | Default 0. Snapshot jam 00:00. |
| `updated_at` | TIMESTAMP | Waktu update terakhir. |

### B. Tabel `user_statistics_history` (Grafik chart)
Untuk fitur grafik di Profile Page. Insert 1 row per user setiap kali ada status pertandingan `finished`/`completed` (Realtime).

| Kolom | Tipe | Keterangan |
| :--- | :--- | :--- |
| `id` | INT (PK) | Auto Increment. |
| `user_id` | VARCHAR(36)| FK ke `users.id`. |
| `points` | INT | Snapshot poin. |
| `rank_position` | INT | (Optional) Snapshot ranking saat itu. |
| `win_rate` | DECIMAL | Snapshot win rate. |
| `recorded_at` | TIMESTAMP | Waktu pencatatan. |

> [!NOTE]
> **Season Reset**: Nantinya akan ada sistem reset season. Saat reset, data stats mungkin direset atau di-archive.
> **Logic Update**: Setiap pertandingan selesai, update `user_statistics`. Record `user_statistics_history` ditambahkan pada setiap user yang mengalami perubahan (biasanya efek domino perubahan rank).

---

## 3. Workflow & Trigger

### A. Trigger: Match Completed (`matches.js`)
Saat match status berubah jadi `finished` atau `completed`:
1.  **Hitung Poin**: 
    *   **Menang**: +6 poin
    *   **Imbang**: +2 poin
    *   **Kalah**: -4 poin
2.  **Upsert `user_statistics`**:
    *   Cek apakah user sudah ada di `user_statistics`.
    *   Jika belum, insert new row.
    *   Jika sudah, update `total_points + new_points`, `total_wins + 1` (jika menang), `goals_for`, `goals_against`.
    *   Recalculate `win_rate` dan `goal_difference`.
3.  **Insert History**:
    *   Insert row baru ke `user_statistics_history` untuk user terkait, mencatat poin & stats terbaru.
3.  **Ranking Priority**:
        1.  **Total Poin** (Tertinggi)
        2.  **Win Rate** (Tertinggi)
        3.  **Selisih Gol** (`goal_difference`) (Tertinggi)
        4.  **Produktivitas Gol** (`goals_for`) (Tertinggi) - *Reward untuk permainan menyerang.*


### B. Trigger: Cron Job (Jadwal Harian)
(Hanya untuk cleanup atau reset gap harian jika diperlukan)
1.  Update `previous_points_daily` (Snapshot Harian untuk logika Gap).

---

## 4. API Endpoints

### A. `GET /api/rankings`
*   Query `user_statistics`.
*   JOIN `users` (ambil username, avatar).
*   JOIN `user_subscriptions` (ambil tier badge).
*   ORDER BY `total_points` DESC.
*   Limit 100.

### B. `GET /api/users/:username/stats`
*   Untuk Profile page.
*   Ambil data dari `user_statistics` berdasarkan user.
*   Ambil data history untuk chart.

---

**Status**: Plan disetujui. Siap dieksekusi.