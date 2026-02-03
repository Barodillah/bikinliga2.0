# Rencana Implementasi E-Club & Komunitas

Dokumen ini berisi rencana detail untuk implementasi backend dan database fitur E-Club (Timeline & Komunitas).

## 1. Struktur Database

Kita akan membuat tabel-tabel baru untuk menghandle postingan, komunitas, dan interaksi user.

### A. Tabel `communities`
Menyimpan data komunitas.

```sql
CREATE TABLE IF NOT EXISTS communities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    type ENUM('public', 'private') DEFAULT 'public',
    creator_id VARCHAR(36) NOT NULL,
    banner_url VARCHAR(500),
    icon_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### B. Tabel `community_members`
Menyimpan relasi user yang bergabung ke komunitas.

```sql
CREATE TABLE IF NOT EXISTS community_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    community_id INT NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    role ENUM('member', 'moderator', 'admin') DEFAULT 'member',
    status ENUM('active', 'banned', 'pending') DEFAULT 'active',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_member (community_id, user_id)
);
```

### C. Tabel `posts`
Menyimpan postingan user, baik di timeline utama maupun dalam komunitas.

```sql
CREATE TABLE IF NOT EXISTS posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    community_id INT NULL, -- NULL jika postingan timeline umum
    content TEXT,
    image_url VARCHAR(500),
    is_pinned BOOLEAN DEFAULT FALSE,
    shared_content_type ENUM('none', 'tournament', 'match', 'standing', 'bracket', 'market_player') DEFAULT 'none',
    shared_content_id VARCHAR(36) NULL, -- ID dari item yang dishare (TournamentID / MatchID)
    metadata JSON NULL, -- Snapshot data (e.g. Score, Team Names, Standings Top 3) untuk rendering cepat
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE SET NULL,
    INDEX idx_shared (shared_content_type, shared_content_id)
);
```

### D. Tabel `post_likes`
Menyimpan like pada postingan.

```sql
CREATE TABLE IF NOT EXISTS post_likes (
    post_id INT NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (post_id, user_id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### E. Tabel `post_comments`
Menyimpan komentar pada postingan.

```sql
CREATE TABLE IF NOT EXISTS post_comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## 2. Implementasi Backend (Node.js + Express)

Kita akan membuat file route dan controller baru.

### Route: `server/routes/communities.js`
- `GET /` - List semua public communities (dengan filter/search).
- `POST /` - Buat community baru.
- `GET /:id` - Get detail community + stats (member count, online count).
- `POST /:id/join` - Join community.
- `POST /:id/leave` - Leave community.
- `GET /:id/members` - List members.

### Route: `server/routes/posts.js`
- `GET /` - Get global timeline posts (support filter `?community_id=X` untuk post komunitas).
- `POST /` - Create post (bisa attach `community_id`).
- `DELETE /:id` - Hapus post (user owner / admin community / superadmin).
- `POST /:id/like` - Toggle like.
- `GET /:id/comments` - Get comments.
- `POST /:id/comments` - Add comment.

### Integrasi Router
File `server/index.js` perlu diupdate untuk me-mount route ini:
```javascript
app.use('/api/communities', communityRoutes);
app.use('/api/posts', postRoutes);
```

---

## 3. Rencana Eksekusi

1.  **Database Migration**:
    -   Buat file `server/migrations/013_create_eclub_tables.sql` berisi schema di atas.
    -   Jalankan script migrasi.

2.  **Backend Logic**:
    -   Buat `server/routes/communities.js`.
    -   Buat `server/routes/posts.js`.
    -   Daftarkan routes di `server/index.js`.

3.  **Frontend Integration**:
    -   Update `src/pages/dashboard/EClub.jsx` untuk fetch data posts & communities dari API.
    -   Update `src/pages/dashboard/CommunityDetail.jsx` untuk fetch detail komunitas & posts-nya.

## 4. Fitur Sharing Konten

User dan Admin dapat membagikan konten turnamen ke E-Club.

### A. Tipe Konten & Metadata
Kita akan menyimpan snapshot data di kolom `metadata` (JSON) agar tampilan di feed tidak perlu query berat ke banyak tabel.

1.  **Match Result / Schedule (`shared_content_type: 'match'`)**
    -   Source: `UserMatchDetail.jsx`, `MatchManagement.jsx`.
    -   Metadata:
        ```json
        {
          "homeTeam": "Nama Tim A", "homeScore": 2, "homeLogo": "url...",
          "awayTeam": "Nama Tim B", "awayScore": 1, "awayLogo": "url...",
          "status": "finished", "tournamentName": "Liga A"
        }
        ```

2.  **Tournament / Bracket (`shared_content_type: 'tournament'`)**
    -   Source: `UserTournamentDetail.jsx`, `TournamentDetail.jsx`.
    -   Metadata:
        ```json
        {
          "name": "Turnamen A", "type": "knockout",
          "participants": 32, "status": "ongoing"
        }
        ```

3.  **Standings (`shared_content_type: 'standing'`)**
    -   Source: `UserTournamentDetail.jsx` (Tab Klasemen).
    -   Metadata:
        ```json
        {
           "groupName": "Group A",
           "top3": [
              { "team": "Tim A", "points": 9 },
              { "team": "Tim B", "points": 6 },
              { "team": "Tim C", "points": 3 }
           ]
        }
        ```

### B. Implementasi Frontend Sharing
Menambahkan tombol **"Share to E-Club"** (Icon `Share2`) pada:

1.  **`UserTournamentDetail.jsx`** & **`TournamentDetail.jsx`**:
    -   HeaderTurnamen: Share Turnamen umum.
    -   Tab Klasemen: Share Klasemen per Grup/Global.
    -   Tab Bracket: Share kondisi Bracket saat ini.
2.  **`UserMatchDetail.jsx`** & **`MatchManagement.jsx`**:
    -   Header Scoreboard: Share Hasil Pertandingan / Jadwal.

**Flow:**
1.  Klik Button Share -> Modal "Bagikan ke E-Club".
2.  User input caption tambahan.
3.  Preview kartu konten yang akan dishare.
4.  POST ke `/api/posts` dengan payload `shared_content_type`, `shared_content_id`, `metadata`.
