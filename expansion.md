# Rencana Ekspansi Global BikinLiga

Dokumen ini berisi roadmap dan strategi untuk memperluas jangkauan platform BikinLiga ke pasar internasional (Global Expansion).

## 1. Fondasi Teknis (Technical Foundation)

Sebelum melakukan ekspansi, infrastruktur teknis perlu disiapkan untuk mendukung audiens global:

*   **Lokalisasi Bahasa (Internationalization / i18n)**
    *   Implementasi framework i18n (misal: `react-i18next`).
    *   Dukungan bahasa utama: Inggris (Global), Mandarin (Asia), Spanyol (Global), Arab (MENA).
    *   Sistem deteksi bahasa otomatis berdasarkan browser/IP.

*   **Sistem Mata Uang & Pembayaran (Multi-currency & Payments)**
    *   Konversi mata uang otomatis (IDR ke USD, SGD, EUR).
    *   Integrasi Payment Gateway Global (Stripe, PayPal) selain Xendit/Midtrans.
    *   Penanganan format harga dinamis.

*   **Waktu & Penjadwalan (Timezone Management)**
    *   Semua waktu di database harus UTC.
    *   Konversi waktu otomatis di frontend sesuai zona waktu user lokal.
    *   Fitur "Server Time" untuk sinkronisasi turnamen real-time.

*   **Performa & Infrastruktur**
    *   Penggunaan CDN (Content Delivery Network) untuk aset statis.
    *   Multi-region deployment (jika diperlukan untuk mengurangi latency).

## 2. Pengembangan Produk (Product Development)

Fitur baru untuk menarik dan mempertahankan user global:

*   **Cross-Region Tournaments**: Turnamen yang mempertemukan pemain dari berbagai region.
*   **Global Leaderboard**: Sistem ranking terintegrasi seluruh dunia.
*   **Regional Hubs**: Halaman khusus untuk komunitas di negara tertentu (misal: BikinLiga ID, BikinLiga PH, BikinLiga SG).

## 3. Kepatuhan & Legal (Compliance)

*   **Data Privacy**: Kepatuhan terhadap GDPR (Eropa) dan CCPA (US).
*   **Terms of Service**: Pembaruan syarat dan ketentuan untuk cakupan hukum internasional.

---

## 4. Saran Penambahan Menu Sidebar

Untuk mendukung fitur-fitur baru dan memberikan kesan platform skala global, berikut adalah saran penambahan menu pada Sidebar:

### A. Menu Baru yang Disarankan

1.  **Discover / Jelajahi** (Icon: `Globe`)
    *   **Fungsi**: Menampilkan turnamen populer dari berbagai negara/region.
    *   **Kenapa**: User perlu melihat aktivitas di luar lingkungan lokal mereka.

2.  **Marketplace / Store** (Icon: `ShoppingBag`)
    *   **Fungsi**: Menjual tiket turnamen premium, merchandise tim, atau aset digital.
    *   **Kenapa**: Monetisasi tambahan dan dukungan ekosistem ekonomi kreator/tim.

3.  **Community / Forum** (Icon: `MessageCircle` atau `Users`)
    *   **Fungsi**: Tempat diskusi strategi, cari tim (LFG - Looking For Group), dan pengumuman.
    *   **Kenapa**: Membangun keterikatan (engagement) komunitas global.

4.  **Live Stream / Watch** (Icon: `Tv` atau `Youtube`)
    *   **Fungsi**: Agregasi live streaming turnamen yang sedang berlangsung.
    *   **Kenapa**: Meningkatkan "Time on Site" dan eksposur turnamen.

5.  **Analytics / Statistik** (Icon: `Activity` atau `PieChart`)
    *   **Fungsi**: Data performa mendalam untuk tim/organizer profesional.
    *   **Kenapa**: Fitur premium untuk menarik user serius/profesional.

### B. Posisi Menu di Sidebar (Mockup)

```javascript
const sidebarLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    
    // --- UTAMA ---
    { name: 'Turnamen (Global)', href: '/dashboard/explore', icon: Globe }, // NEW
    { name: 'Turnamen Saya', href: '/dashboard/tournaments', icon: List },
    
    // --- FITUR SOSIAL & KONTEN ---
    { name: 'Komunitas', href: '/dashboard/community', icon: MessageCircle }, // NEW
    { name: 'Live Stream', href: '/dashboard/watch', icon: Tv }, // NEW
    
    // --- EKONOMI ---
    { name: 'Marketplace', href: '/dashboard/store', icon: ShoppingBag }, // NEW
    { name: 'Top Up', href: '/dashboard/topup', icon: Wallet },
    
    // --- KOMPETISI ---
    { name: 'Ranking Global', href: '/dashboard/ranking', icon: BarChart2 },
    { name: 'eClub', href: '/dashboard/eclub', icon: Shield },
]
```
