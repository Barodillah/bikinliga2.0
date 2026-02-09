# Analisis Migrasi Backend ke Native PHP

## Analisis Saat Ini
Backend saat ini dibangun menggunakan **Node.js (Express)** dengan database **MySQL**.
- **Struktur**: Modular, dengan route terpisah di folder `server/routes/`.
- **Database**: Menggunakan library `mysql2` dengan query raw (SQL manual).
- **Autentikasi**: JWT (JSON Web Token) untuk session, Google OAuth untuk login sosial, dan OTP via email.
- **Dependency Utama**: `bcryptjs` (hash password), `jsonwebtoken`, `nodemailer` (email), `google-auth-library`.

## Apakah Mungkin Diubah ke PHP Native?
**Sangat Mungkin.**
Struktur backend saat ini sangat cocok untuk di-porting ke PHP karena:
1.  **Database**: Menggunakan raw SQL yang bisa langsung disalin ke PHP menggunakan **PDO**. Tidak ada ORM kompleks (seperti Prisma) yang menyulitkan migrasi.
2.  **Stateless**: Backend bersifat stateless (menggunakan JWT), yang merupakan sifat alami PHP.
3.  **Hosting**: Share hosting (cPanel) adalah lingkungan native untuk PHP dan MySQL, yang akan menyelesaikan masalah "lemot" jika dikonfigurasi dengan benar (dibandingkan Vercel serverless yang memiliki cold boot).

## Langkah Migrasi & File yang Perlu Diupdate (Dibuat Ulang)
Anda tidak bisa sekadar "mengupdate" file JS. Anda harus **menulis ulang** logika backend ke syntax PHP.

### 1. Struktur Folder PHP (Saran)
```
/public_html
  /api              <-- Entry point API
    index.php       <-- Router utama
    .htaccess       <-- Aturan rewrite
  /backend
    /config
      db.php        <-- Koneksi Database (PDO)
      mail.php      <-- Konfigurasi Email
    /controllers    <-- Logika bisnis (pengganti server/routes/)
      AuthController.php
      UserController.php
      TournamentController.php
      ...
    /middleware
      AuthMiddleware.php
    /utils
      Helper.php
  /frontend         <-- Hasil build React (dist folder)
```

### 2. Dependency PHP (via Composer)
Meskipun "Native", disarankan menggunakan **Composer** untuk library standar agar aman dan cepat:
- `vlucas/phpdotenv` (untuk baca .env)
- `firebase/php-jwt` (untuk token JWT)
- `phpmailer/phpmailer` (untuk kirim email OTP)
- `ramsey/uuid` (untuk generate ID)
- `google/apiclient` (untuk Google Login)

### 3. Daftar File yang Harus Dikonversi
Semua file di `server/routes/` harus dibuatkan Controller PHP-nya:
1.  `routes/auth.js` -> `backend/controllers/AuthController.php`
2.  `routes/user.js` -> `backend/controllers/UserController.php`
3.  `routes/tournament.js` -> `backend/controllers/TournamentController.php`
4.  `routes/teams.js` -> `backend/controllers/TeamsController.php`
5.  `routes/matches.js` -> `backend/controllers/MatchesController.php`
6.  ... dan 14 file route lainnya.

## Langkah Deployment ke Share Hosting (cPanel)

### A. Persiapan Database
1.  Login ke cPanel > **MySQL Databases**.
2.  Buat database baru (misal: `u12345_bikinliga`).
3.  Import file SQL schema yang ada (jika belum ada, export dari local/server lama).
4.  Update file `.env` (atau `config/db.php`) dengan user/pass database hosting.

### B. Persiapan Kode Backend (PHP)
1.  Upload folder `backend` dan `api` ke root folder hosting (biasanya `/home/u12345/public_html` atau sejajar dengannya).
2.  Pastikan `composer install` dijalankan (atau upload folder `vendor` dari local).

### C. Persiapan Frontend (React)
1.  Di komputer lokal, buka terminal project.
2.  Update `.env` frontend:
    ```
    VITE_API_URL=https://namadomain.com/api
    ```
3.  Jalankan build:
    ```bash
    npm run build
    ```
4.  Akan muncul folder `dist`.
5.  Upload **isi** folder `dist` ke `public_html` di hosting.

### D. Konfigurasi `public_html/.htaccess`
Buat file `.htaccess` di `public_html` untuk mengatur routing React Router dan API:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # Bypass API requests to api folder
  RewriteRule ^api/ - [L]

  # React Router: Redirect all other requests to index.html
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

### E. Konfigurasi `public_html/api/.htaccess`
Buat file `.htaccess` di dalam folder `api` untuk mengarahkan semua request API ke `index.php`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^(.*)$ index.php [QSA,L]
</IfModule>
```

## Kesimpulan
Migrasi ini **sangat direkomendasikan** untuk mengatasi masalah performance (speed) dan cost pada aplikasi tipe ini di Vercel. Namun, ini adalah pekerjaan **besar** karena memindahkan logika dari ~20 file JavaScript ke PHP.

**Waktu Estimasi**: 1-2 Minggu (untuk programmer berpengalaman melakukan porting manual).
