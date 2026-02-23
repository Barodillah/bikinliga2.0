# Dokumentasi Algoritma Harga Koin Dinamis BikinLiga (Hybrid Model)

Dokumen ini memuat rumusan matematika yang digunakan untuk menentukan harga koin secara *real-time* di dalam aplikasi. Model ini menggabungkan **Polynomial Bonding Curve** (faktor kelangkaan suplai) dengan **Dynamic Surge Pricing** (faktor keramaian turnamen).

## 1. Rumus Utama

Harga koin per transaksi dihitung menggunakan fungsi matematika berikut:

$$P(S, C) = \left[ P_0 + (\alpha \cdot S) + (\beta \cdot S^\gamma) \right] \cdot \max \left( M_{min}, 1 + \kappa \left( \frac{C - C_{target}}{C_{target}} \right) \right)$$

## 2. Definisi Variabel

### Komponen Suplai Dasar (Base & Supply)
* $P(S, C)$ : Harga koin dinamis akhir yang ditampilkan ke *user*.
* $P_0$ : **Harga dasar absolut (*Floor Price*) yang ditetapkan sebesar Rp 150 IDR**. Angka ini adalah fondasi ekonomi aplikasi. Artinya, dalam kondisi aplikasi paling sepi sekalipun, atau saat koin yang beredar sangat banyak (inflasi), sistem tidak akan pernah menjual koin di bawah harga Rp 150 per keping.
* $S$ : *Circulating Supply*. Total koin yang saat ini ditahan (*hold*) oleh *user* dan belum dibakar/digunakan untuk membuat kompetisi.

### Komponen Pertumbuhan (Curve Coefficients)
* $\alpha$ : Koefisien linear. Mengontrol kenaikan harga yang stabil pada fase awal adopsi, bertolak dari titik Rp 150.
* $\beta$ : Koefisien eksponensial. Mengontrol lonjakan harga (*hype/FOMO*) ketika suplai menipis atau koin yang ditahan sangat banyak.
* $\gamma$ : Eksponen pertumbuhan. Menentukan seberapa melengkung kurva harga (umumnya bernilai antara $1.5$ hingga $2.0$).

### Komponen Keramaian Aplikasi (Surge Multiplier)
* $C$ : Jumlah kompetisi/turnamen yang sedang berstatus aktif saat ini.
* $C_{target}$ : Kapasitas ideal atau target rata-rata turnamen aktif.
* $\kappa$ : Koefisien sensitivitas keramaian. Semakin besar nilai ini, semakin mahal harga koin saat server sedang penuh.
* $M_{min}$ : Batas bawah pengali (*Minimum Multiplier*). Jika diatur ke $1.0$, maka harga termurah adalah murni berdasarkan suplai (dimulai dari Rp 150). Jika diatur di bawah $1.0$ (misal $0.8$), sistem bisa memberikan "diskon otomatis" saat sepi, namun hitungan akhirnya tetap tidak boleh menembus di bawah Rp 150.

---

## 3. Simulasi Pergerakan Harga (Base Rp 150)

Tabel di bawah ini mengilustrasikan bagaimana algoritma merespons kondisi aplikasi yang berbeda:

| Kondisi Aplikasi | Suplai Koin ($S$) | Turnamen Aktif ($C$) | Efek pada Algoritma | Estimasi Harga |
| :--- | :--- | :--- | :--- | :--- |
| **Sepi / Awal Rilis** | 0 - Sangat Rendah | Di Bawah Target | Kurva berada di titik nol, multiplier netral/diskon. | **~Rp 150 (Harga Dasar)** |
| **Normal / Stabil** | Sedang | Sesuai Target | Kurva linear berjalan perlahan bertolak dari Rp 150. | **> Rp 150 (Naik perlahan)** |
| **Viral / Overload** | Tinggi | Melebihi Target | Kurva eksponensial meledak, multiplier menaikkan harga berlipat ganda. | **Jauh di atas Rp 150** |

## 4. Catatan Implementasi Backend
* Rumus ini harus dikalkulasi ulang setiap kali ada *request* ke *endpoint* pembelian koin.
* Terapkan validasi *hardcode* di dalam kode Node.js: `if (finalPrice < 150) return 150;` untuk memastikan sistem tidak pernah membocorkan harga di bawah batas dasar.
* Pastikan untuk melakukan pembulatan nilai (*rounding*) ke satuan Rupiah terdekat sebelum dikirimkan ke *frontend* React.