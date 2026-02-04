import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Shield, Eye, Database, Lock, Share2, Cookie, Mail } from 'lucide-react'

export default function PrivacyPage() {
    const sections = [
        {
            icon: Database,
            title: "1. Informasi yang Kami Kumpulkan",
            content: [
                "Informasi akun: nama, email, username, dan foto profil.",
                "Data penggunaan: aktivitas di platform, turnamen yang diikuti, dan riwayat transaksi.",
                "Informasi perangkat: jenis browser, alamat IP, dan perangkat yang digunakan.",
                "Data pembayaran: informasi transaksi yang diproses melalui payment gateway resmi."
            ]
        },
        {
            icon: Eye,
            title: "2. Penggunaan Informasi",
            content: [
                "Menyediakan dan mengelola layanan BikinLiga.",
                "Memproses transaksi dan mengirimkan notifikasi terkait.",
                "Meningkatkan pengalaman pengguna dan mengembangkan fitur baru.",
                "Mengirimkan informasi tentang pembaruan, promosi, dan turnamen (dengan persetujuan).",
                "Menjaga keamanan platform dan mencegah aktivitas penipuan."
            ]
        },
        {
            icon: Lock,
            title: "3. Keamanan Data",
            content: [
                "Kami menggunakan enkripsi SSL/TLS untuk melindungi data yang ditransmisikan.",
                "Data sensitif seperti password disimpan dalam bentuk terenkripsi (hashed).",
                "Akses ke data pribadi dibatasi hanya untuk personel yang berwenang.",
                "Kami melakukan audit keamanan secara berkala untuk memastikan perlindungan data.",
                "Payment gateway yang digunakan telah tersertifikasi PCI-DSS."
            ]
        },
        {
            icon: Share2,
            title: "4. Berbagi Informasi",
            content: [
                "Kami TIDAK menjual data pribadi Anda kepada pihak ketiga.",
                "Informasi dapat dibagikan dengan penyedia layanan yang membantu operasional (payment gateway, hosting).",
                "Data dapat dibagikan jika diwajibkan oleh hukum atau perintah pengadilan.",
                "Profil publik (username, foto, statistik) dapat dilihat oleh pengguna lain sesuai pengaturan privasi Anda."
            ]
        },
        {
            icon: Cookie,
            title: "5. Cookies & Teknologi Pelacakan",
            content: [
                "Kami menggunakan cookies untuk menyimpan preferensi dan sesi login.",
                "Analytics cookies membantu kami memahami cara pengguna berinteraksi dengan platform.",
                "Anda dapat mengatur browser untuk menolak cookies, namun beberapa fitur mungkin tidak berfungsi optimal.",
                "Kami tidak menggunakan cookies untuk melacak aktivitas Anda di situs lain."
            ]
        },
        {
            icon: Shield,
            title: "6. Hak Pengguna",
            content: [
                "Hak akses: Anda dapat meminta salinan data pribadi yang kami simpan.",
                "Hak koreksi: Anda dapat memperbarui atau memperbaiki data yang tidak akurat.",
                "Hak penghapusan: Anda dapat meminta penghapusan akun dan data terkait.",
                "Hak portabilitas: Anda dapat meminta data Anda dalam format yang dapat dibaca mesin.",
                "Untuk menjalankan hak-hak ini, hubungi kami melalui email."
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
                        Privacy <span className="text-neonPink">Policy</span>
                    </h1>
                    <p className="text-gray-400">Terakhir diperbarui: Februari 2026</p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 py-12">
                <div className="prose prose-invert max-w-none">
                    <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                        BikinLiga berkomitmen untuk melindungi privasi Anda. Kebijakan privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi pribadi Anda saat menggunakan platform kami.
                    </p>

                    <div className="space-y-8">
                        {sections.map((section, index) => (
                            <div key={index} className="bg-cardBg rounded-xl p-6 border border-white/10">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-neonPink/10 flex items-center justify-center">
                                        <section.icon className="w-5 h-5 text-neonPink" />
                                    </div>
                                    <h2 className="text-xl font-bold text-white">{section.title}</h2>
                                </div>
                                <ul className="space-y-3">
                                    {section.content.map((item, i) => (
                                        <li key={i} className="flex gap-3 text-gray-400">
                                            <span className="text-neonPink mt-1">•</span>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    {/* Retention */}
                    <div className="mt-8 bg-cardBg rounded-xl p-6 border border-white/10">
                        <h2 className="text-xl font-bold text-white mb-4">7. Penyimpanan Data</h2>
                        <p className="text-gray-400 mb-4">
                            Kami menyimpan data pribadi Anda selama akun Anda aktif atau selama diperlukan untuk menyediakan layanan. Data transaksi disimpan sesuai dengan kewajiban hukum dan peraturan perpajakan yang berlaku di Indonesia.
                        </p>
                        <p className="text-gray-400">
                            Setelah akun dihapus, data pribadi akan dihapus dalam waktu 30 hari, kecuali data yang harus disimpan untuk keperluan hukum atau audit.
                        </p>
                    </div>

                    {/* Updates */}
                    <div className="mt-8 bg-cardBg rounded-xl p-6 border border-white/10">
                        <h2 className="text-xl font-bold text-white mb-4">8. Perubahan Kebijakan</h2>
                        <p className="text-gray-400">
                            Kami dapat memperbarui kebijakan privasi ini dari waktu ke waktu. Perubahan signifikan akan diberitahukan melalui email atau notifikasi di platform. Dengan terus menggunakan BikinLiga setelah perubahan, Anda menyetujui kebijakan yang diperbarui.
                        </p>
                    </div>

                    {/* Contact */}
                    <div className="mt-12 p-6 bg-gradient-to-r from-neonPink/10 to-transparent rounded-xl border border-neonPink/20">
                        <div className="flex items-center gap-3 mb-4">
                            <Mail className="w-6 h-6 text-neonPink" />
                            <h3 className="text-lg font-bold text-white">Hubungi Kami</h3>
                        </div>
                        <p className="text-gray-400 mb-4">
                            Jika Anda memiliki pertanyaan tentang kebijakan privasi ini atau ingin menjalankan hak-hak Anda, silakan hubungi kami.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <a href="mailto:gmail@bikinliga.online" className="text-neonPink hover:underline">
                                gmail@bikinliga.online
                            </a>
                            <a href="https://wa.me/6281999934451" target="_blank" rel="noopener noreferrer" className="text-neonPink hover:underline">
                                0819-9993-4451
                            </a>
                        </div>
                        <p className="text-gray-500 text-sm mt-4">
                            Alamat: Bogor, Indonesia
                        </p>
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
