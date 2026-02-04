import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Shield, FileText, CreditCard, Users, AlertTriangle, Scale } from 'lucide-react'

export default function TermsPage() {
    const sections = [
        {
            icon: FileText,
            title: "1. Ketentuan Umum",
            content: [
                "BikinLiga adalah platform manajemen turnamen esport yang memungkinkan pengguna untuk membuat, mengelola, dan berpartisipasi dalam kompetisi gaming.",
                "Dengan menggunakan layanan BikinLiga, Anda menyetujui untuk terikat dengan syarat dan ketentuan ini.",
                "BikinLiga berhak mengubah ketentuan ini sewaktu-waktu dengan pemberitahuan melalui platform."
            ]
        },
        {
            icon: Users,
            title: "2. Akun Pengguna",
            content: [
                "Pengguna wajib memberikan informasi yang akurat dan lengkap saat mendaftar.",
                "Setiap pengguna bertanggung jawab penuh atas keamanan akun dan kata sandi mereka.",
                "Pengguna dilarang membagikan akses akun kepada pihak lain.",
                "BikinLiga berhak menangguhkan atau menghapus akun yang melanggar ketentuan."
            ]
        },
        {
            icon: CreditCard,
            title: "3. Pembayaran & Transaksi",
            content: [
                "Semua transaksi pembayaran di BikinLiga menggunakan mata uang Rupiah (IDR).",
                "Pembelian koin atau layanan premium bersifat final dan tidak dapat dikembalikan kecuali terjadi kesalahan teknis dari pihak BikinLiga.",
                "BikinLiga menggunakan payment gateway resmi dan terenkripsi untuk menjamin keamanan transaksi.",
                "Pengguna bertanggung jawab atas semua transaksi yang dilakukan melalui akun mereka.",
                "Biaya pendaftaran turnamen ditentukan oleh penyelenggara dan dapat bervariasi."
            ]
        },
        {
            icon: Shield,
            title: "4. Penggunaan Platform",
            content: [
                "Pengguna dilarang menggunakan platform untuk aktivitas ilegal atau melanggar hukum.",
                "Dilarang melakukan manipulasi hasil pertandingan atau tindakan curang lainnya.",
                "Konten yang diunggah harus bebas dari unsur SARA, pornografi, dan kekerasan.",
                "BikinLiga berhak menghapus konten yang melanggar tanpa pemberitahuan."
            ]
        },
        {
            icon: AlertTriangle,
            title: "5. Batasan Tanggung Jawab",
            content: [
                "BikinLiga tidak bertanggung jawab atas kerugian yang timbul dari penggunaan platform oleh pihak ketiga.",
                "Kami tidak menjamin layanan akan tersedia tanpa gangguan atau bebas dari kesalahan.",
                "BikinLiga tidak bertanggung jawab atas sengketa antar pengguna.",
                "Pengguna bertanggung jawab atas semua aktivitas yang dilakukan melalui akun mereka."
            ]
        },
        {
            icon: Scale,
            title: "6. Penyelesaian Sengketa",
            content: [
                "Setiap sengketa akan diselesaikan secara musyawarah untuk mufakat.",
                "Jika tidak tercapai kesepakatan, sengketa akan diselesaikan melalui pengadilan yang berwenang di Indonesia.",
                "Hukum yang berlaku adalah hukum Negara Republik Indonesia."
            ]
        }
    ]

    return (
        <div className="min-h-screen bg-darkBg text-white">
            {/* Header */}
            <div className="bg-gradient-to-b from-cardBg to-darkBg border-b border-white/10">
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-neonGreen transition mb-6">
                        <ArrowLeft className="w-4 h-4" />
                        Kembali ke Beranda
                    </Link>
                    <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
                        Syarat & <span className="text-neonGreen">Ketentuan</span>
                    </h1>
                    <p className="text-gray-400">Terakhir diperbarui: Februari 2026</p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 py-12">
                <div className="prose prose-invert max-w-none">
                    <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                        Selamat datang di BikinLiga. Dengan mengakses dan menggunakan layanan kami, Anda menyetujui untuk mematuhi syarat dan ketentuan berikut. Harap baca dengan seksama sebelum menggunakan platform kami.
                    </p>

                    <div className="space-y-8">
                        {sections.map((section, index) => (
                            <div key={index} className="bg-cardBg rounded-xl p-6 border border-white/10">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-neonGreen/10 flex items-center justify-center">
                                        <section.icon className="w-5 h-5 text-neonGreen" />
                                    </div>
                                    <h2 className="text-xl font-bold text-white">{section.title}</h2>
                                </div>
                                <ul className="space-y-3">
                                    {section.content.map((item, i) => (
                                        <li key={i} className="flex gap-3 text-gray-400">
                                            <span className="text-neonGreen mt-1">•</span>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    {/* Contact */}
                    <div className="mt-12 p-6 bg-gradient-to-r from-neonGreen/10 to-transparent rounded-xl border border-neonGreen/20">
                        <h3 className="text-lg font-bold text-white mb-2">Ada Pertanyaan?</h3>
                        <p className="text-gray-400 mb-4">
                            Jika Anda memiliki pertanyaan mengenai Syarat & Ketentuan ini, silakan hubungi kami.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <a href="mailto:gmail@bikinliga.online" className="text-neonGreen hover:underline">
                                gmail@bikinliga.online
                            </a>
                            <a href="https://wa.me/6281999934451" target="_blank" rel="noopener noreferrer" className="text-neonGreen hover:underline">
                                0819-9993-4451
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="border-t border-white/10 py-8">
                <div className="max-w-4xl mx-auto px-4 text-center text-gray-500 text-sm">
                    © {new Date().getFullYear()} BikinLiga Indonesia. All rights reserved.
                </div>
            </div>
        </div>
    )
}
