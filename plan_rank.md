# Rencana Implementasi: Sistem Ranking & Statistik

## 1. Analisis dan Jawaban Pertanyaan User

User mengajukan pertanyaan kritis:
> "Jika perhitungan winrate dan poin sama dengan Profile.jsx, apakah perlu table baru?"

**Jawaban: YA, Sangat Perlu.**

### Alasan:
1.  **Isu Skalabilitas & Performa**:
    *   Halaman **Profile** hanya menghitung data untuk **1 user**. Melakukan query `SUM(points)` dari ribuan match history untuk 1 user masih tergolong cepat.
    *   Halaman **Ranking** menampilkan Top 100 user dari ribuan/jutaan user. Jika database harus melakukan kalkulasi `SUM` on-the-fly untuk *setiap user* di database lalu mengurutkannya (`ORDER BY total_points`), website akan "hang" atau extremely slow.
2.  **Indexing**: Database membutuhkan kolom fisik (bukan kalkulasi) untuk bisa di-index agar sorting Ranking instan.

**Kesimpulan**: Kita membutuhkan tabel khusus (misal: `user_statistics`) yang menyimpan *nilai akhir* (Total Points, Total Wins, dll) yang selalu di-update increment saat match selesai.

---

## 2. Struktur Database Baru

Sesuai permintaan user, kita akan menghapus `rank_tier` (karena ambil dari subscription) dan menambahkan logika untuk `gaps` dan `chart record`.

### A. Tabel Utama: `user_statistics`
Tabel ini menyimpan data "Live" untuk keperluan Leaderboard/Ranking Page yang cepat.

| Nama Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id` | INT (PK) | Auto increment. |
| `user_id` | INT (FK) | Relasi ke table `users`. |
| `total_points` | INT | **Indexed**. Poin saat ini. Sumber utama sorting ranking. |
| `total_matches` | INT | Jumlah total pertandingan. |
| `total_wins` | INT | Jumlah kemenangan. |
| `total_losses` | INT | Jumlah kekalahan. |
| `win_rate` | DECIMAL(5,2)| Cache winrate (e.g., 65.50). Update setiap match selesai. |
| `previous_points_daily` | INT | Snapshot poin pada jam 00:00 hari ini. |
| `previous_rank_daily` | INT | Snapshot ranking pada jam 00:00 hari ini. |
| `updated_at` | TIMESTAMPTZ | Waktu update terakhir. |

> [!NOTE]
> Kolom **`rank_tier`** tidak dimasukkan. Saat query Ranking, kita akan melakukan `JOIN` ke tabel `user_subscriptions` untuk mendapatkan Tier/Badge user.

### B. Tabel History: `user_ranking_history` (Untuk Grafik Chart)
Tabel ini menyimpan rekam jejak (snapshot) historis untuk divisualisasikan menjadi grafik di Profile Page.

| Nama Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id` | INT (PK) | Auto increment. |
| `user_id` | INT (FK) | Relasi ke user. |
| `points` | INT | Poin saat dicatat. |
| `rank_position` | INT | Posisi ranking global saat dicatat. |
| `win_rate` | DECIMAL | Winrate saat dicatat. |
| `recorded_at` | DATE | Tanggal pencatatan (misal: 2026-02-01). |

---

## 3. Logika & Workflow

### A. Logika "Gaps" (+/- Poin)
User ingin melihat naik/turun poin (Gap).
*   **Cara Hitung**: `Gap = total_points - previous_points_daily`.
*   **Di Frontend**: Jika `Gap > 0`, tampilkan dengan warna hijau (`+25 pts`). Jika `Gap < 0`, merah.
*   **Reset**: Setiap jam 00:00, jalankan Cron Job untuk mengupdate `previous_points_daily` menjadi sama dengan `total_points` saat itu.

### B. Trigger Update Data
1.  **Saat Match Selesai**:
    *   System menghitung poin match (Win=3, Draw=1, etc).
    *   Update `user_statistics`:
        *   `total_points = total_points + new_points`
        *   `total_wins = total_wins + 1` (jika menang)
        *   Recalculate `win_rate`.
2.  **Cron Job Harian (00:00)**:
    *   Untuk setiap user, *insert* row baru ke `user_ranking_history` (snapshot hari kemarin).
    *   Update `user_statistics`: Set `previous_points_daily` = `total_points`.

---

## 4. Rencana Perubahan Code (Frontend)

Sesuai instruksi "Jangan Eksekusi", bagian ini adalah panduan untuk tahap selanjutnya.

### `src/pages/dashboard/Ranking.jsx`
*   **Hapus**: `MOCK_RANKINGS`.
*   **Ubah**: Gunakan `useFetch('/api/rankings')`.
*   **Tampilan**:
    *   Map data API ke UI.
    *   Tampilkan Badge Tier dari data `subscription` (hasil JOIN).
    *   Tampilkan indikator **Gap** di sebelah poin.

### `src/pages/dashboard/Profile.jsx`
*   **Tambah**: Komponen Chart (misal menggunakan `recharts`).
*   **Fetch**: Endpoint baru `/api/users/:username/history` untuk data grafik.

---

## 5. Saran Tambahan (Saran Lain)

1.  **Sistem Archive / Season**:
    *   Agar user baru punya kesempatan mengejar user lama, pertimbangkan sistem **Season** (misal reset poin setiap 3 bulan). Poin lama disimpan di tabel `season_history`.
2.  **Redis Caching**:
    *   Untuk Ranking Top 100 yang sangat sering diakses, sangat disarankan menggunakan **Redis Cache** (cache query selama 5-10 menit) untuk mengurangi beban database.
3.  **Lazy Loading**:
    *   Jika user mencapai ribuan, jangan load semua sekaligus. Gunakan pagination (Load More) atau Virtual Scroller di `Ranking.jsx`.

---

**Status**: Plan siap dieksekusi.