# BikinLiga Upload API - Deployment Guide

## Struktur Folder

```
bikinligaupload/          ← Root folder di shared hosting
├── .htaccess             ← Security, caching, CORS
├── upload.php            ← Main upload endpoint
├── test.php              ← Test endpoint (bisa dihapus setelah deploy)
└── uploads/
    └── logos/
        └── index.html    ← Placeholder, cegah directory listing
```

## Cara Deploy ke Shared Hosting

### 1. Upload Files
Upload semua file di folder `php_upload_api/` ke shared hosting di path:
```
public_html/bikinligaupload/
```
Atau sesuai konfigurasi domain `cuma.click/bikinligaupload/`

### 2. Set Permission Folder
Pastikan folder `uploads/logos/` memiliki permission **755** atau **775**:
```
chmod -R 755 uploads/
```

### 3. Edit Config di upload.php
Buka `upload.php` dan sesuaikan:
- `API_KEY` → Ganti dengan key aman (simpan juga di frontend `.env`)
- `BASE_URL` → Pastikan `https://cuma.click/bikinligaupload`
- `$allowed_origins` → Tambahkan domain frontend Vercel yang benar

### 4. Test
Buka di browser:
```
https://cuma.click/bikinligaupload/test.php
```

Harus muncul JSON dengan status:
- `upload_dir`: "exists"
- `dir_writable`: "yes"

### 5. Test Upload via cURL
```bash
curl -X POST https://cuma.click/bikinligaupload/upload.php \
  -H "X-Upload-Key: bkl_upload_2024_s3cur3_k3y" \
  -F "file=@test_image.png"
```

Response yang benar:
```json
{
  "success": true,
  "message": "Upload berhasil!",
  "url": "https://cuma.click/bikinligaupload/uploads/logos/20260222_010000_abcdef12.png"
}
```

## Troubleshooting

| Problem | Solusi |
|---------|--------|
| `dir_writable: no` | Set permission folder `uploads/logos/` ke 755 atau 775 |
| CORS error | Tambahkan domain frontend ke `$allowed_origins` di `upload.php` |
| 413 Entity Too Large | Edit `.htaccess` → naikkan `upload_max_filesize` dan `post_max_size` |
| 500 Internal Server Error | Cek error log hosting, biasanya masalah permission atau PHP version |
