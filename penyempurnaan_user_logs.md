# Analisis User Logs (Log Aktivitas Pengguna)

Dokumen ini mencatat status implementasi pencatatan aktivitas pengguna (`user_logs`) di seluruh sistem.

## Ringkasan
- **Tabel Database**: `user_logs` (Sudah ada)
- **Fungsi Utility**: `logActivity` di `server/utils/activity.js` (Sudah ada)
- **Status Cakupan**: Implementasi saat ini masih terpusat pada Manajemen Turnamen dan Registrasi. Banyak fitur krusial lain (Match, Community, Admin) belum memiliki pencatatan log.

---

## 1. Authentication & User Profile
| Fitur | Aksi | Status | Catatan |
| :--- | :--- | :--- | :--- |
| **Register** | Register via Email (OTP) | ✅ Ada | Dicatat saat verifikasi OTP berhasil |
| **Register** | Register via Google | ✅ Ada | |
| **Login** | Login via Google | ✅ Ada | |
| **Login** | Login via Email/Password | ❌ **Belum** | Perlu ditambahkan di endpoint `/login` |
| **Profile** | Update Profil (Nama/Username) | ❌ **Belum** | Perlu dicatat untuk audit perubahan data diri |
| **Profile** | Ganti Password | ❌ **Belum** | Penting untuk keamanan |
| **Profile** | Update Preferences | ❌ **Belum** | |
| **Wallet** | Transaksi (Topup/Spend) | ⚠️ Parsial | Masuk tabel `transactions`, tapi tidak masuk `user_logs` (Mungkin cukup di transactions) |

## 2. Tournament Management (Penyelenggara)
| Fitur | Aksi | Status | Catatan |
| :--- | :--- | :--- | :--- |
| **Tournament** | Create Tournament | ✅ Ada | |
| **Tournament** | Update Tournament | ✅ Ada | Mencakup perubahan info, status, dll |
| **Participant** | Add Participant (Manual) | ✅ Ada | |
| **Participant** | Approve/Reject Participant | ✅ Ada | |
| **Participant** | Delete Participant | ✅ Ada | |

## 3. Match Management (Pertandingan)
| Fitur | Aksi | Status | Catatan |
| :--- | :--- | :--- | :--- |
| **Match** | Update Skor / Status | ❌ **Belum** | Krusial. Admin/Panitia mengubah skor harus dicatat |
| **Match** | Tambah Event (Gol/Kartu) | ❌ **Belum** | Event masuk tabel `match_events`, tapi log aktivitas user (siapa yg input) tidak ada di `user_logs` |
| **Match** | Rollback Event | ❌ **Belum** | Penting untuk audit jika panitia membatalkan gol |

## 4. Community & Social
| Fitur | Aksi | Status | Catatan |
| :--- | :--- | :--- | :--- |
| **Post** | Buat Postingan | ❌ **Belum** | |
| **Post** | Hapus Postingan | ❌ **Belum** | |
| **Calculations** | Like Post | ❌ **Belum** | Mungkin terlalu berisik (spammy) jika dicatat semua, opsional |
| **Calculations** | Comment Post | ❌ **Belum** | Perlu dipertimbangkan untuk moderasi |
| **Communities** | Join/Leave Community | ❓ Perlu Cek | Belum dicek di file `communities.js` |

## 5. Admin Panel (Superadmin)
| Fitur | Aksi | Status | Catatan |
| :--- | :--- | :--- | :--- |
| **Users** | Update Role / Subscription | ❌ **Belum** | Perubahan role admin/user harus dicatat |
| **Users** | Banned / Hapus User | ❌ **Belum** | Audit trail penghapusan user wajib ada |
| **Wallet** | Adjust Balance (Manual) | ✅ Ada (Partial) | Dicatat di tabel `transactions` sebagai 'Admin Bonus/Deduction', tapi `user_logs` sebaiknya juga mencatat aktivitas admin ini |
| **System** | Send Announcement | ❌ **Belum** | |

## 6. Lain-lain
| Fitur | Aksi | Status | Catatan |
| :--- | :--- | :--- | :--- |
| **Complaints** | Buat Laporan | ❌ **Belum** | |
| **Complaints** | Update Status Laporan | ❌ **Belum** | Aktivitas admin merespon laporan |
| **Achievements** | Update Showcase | ❌ **Belum** | |

---

## Rekomendasi Prioritas Implementasi

Berikut adalah urutan prioritas untuk melengkapi User Logs:

1.  **High Priority (Keamanan & Integritas Data)**
    *   Auth: Login Email (untuk memantau akses alur biasa).
    *   Auth: Ganti Password & Update Profil.
    *   Match: Update Skor & Status (Mencegah kecurangan panitia/admin).
    *   Admin: Update User Role & Subscription.

2.  **Medium Priority (Moderasi)**
    *   Community: Create/Delete Post.
    *   Complaints: Update Status Laporan.

3.  **Low Priority (Aktivitas Ringan)**
    *   Community: Like/Comment (Bisa memenuhi database dengan cepat).
    *   Achievements: Showcase.
