import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Trophy, Instagram } from 'lucide-react'

import { useToast } from '../../contexts/ToastContext'

const Tiktok = ({ className }) => (
    <svg
        className={className}
        viewBox="0 0 24 24"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
)

export default function Footer() {
    const { success } = useToast()
    const [email, setEmail] = useState('')

    const handleSubscribe = (e) => {
        e.preventDefault()
        // Handle newsletter subscription
        success(`Terima kasih telah subscribe: ${email}`)
        setEmail('')
    }

    return (
        <footer className="border-t border-white/10 bg-black pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                    {/* Logo & Description */}
                    <div className="col-span-1 md:col-span-1">
                        <Link to="/" className="flex items-center gap-2 mb-4">
                            <img src="/logo.png" alt="BikinLiga" className="h-7" />
                            <span className="font-display font-bold text-xl">
                                Bikin<span className="text-neonPink">Liga</span>
                            </span>
                        </Link>
                        <p className="text-gray-500 text-sm leading-relaxed">
                            Platform manajemen turnamen esport termudah untuk komunitas Indonesia.
                        </p>
                    </div>

                    {/* Produk */}
                    <div>
                        <h4 className="font-bold text-white mb-4">Produk</h4>
                        <ul className="space-y-2 text-sm text-gray-500">
                            {['Fitur', 'Harga', 'API', 'Changelog'].map(item => (
                                <li key={item}>
                                    <a href="#" className="hover:text-neonGreen transition">{item}</a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Dukungan */}
                    <div>
                        <h4 className="font-bold text-white mb-4">Dukungan</h4>
                        <ul className="space-y-2 text-sm text-gray-500">
                            <li>
                                <Link to="/terms" className="hover:text-neonGreen transition">Syarat & Ketentuan</Link>
                            </li>
                            <li>
                                <Link to="/privacy" className="hover:text-neonGreen transition">Privacy Policy</Link>
                            </li>
                            <li>
                                <a href="https://chat.whatsapp.com/F1tN9sGS6RfALDXOG33kvN" target="_blank" rel="noopener noreferrer" className="hover:text-neonGreen transition">Komunitas</a>
                            </li>
                            <li>
                                <a href="/tutorial" className="hover:text-neonGreen transition">Panduan</a>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-bold text-white mb-4">Kontak</h4>
                        <ul className="space-y-2 text-sm text-gray-500">
                            <li>
                                <a href="mailto:gmail@bikinliga.online" className="hover:text-neonGreen transition">gmail@bikinliga.online</a>
                            </li>
                            <li>
                                <a href="https://wa.me/6281999934451" target="_blank" rel="noopener noreferrer" className="hover:text-neonGreen transition">0819-9993-4451</a>
                            </li>
                            <li>Bogor, Indonesia</li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-gray-600 text-sm">
                        &copy; {new Date().getFullYear()} BikinLiga Indonesia. All rights reserved.
                    </div>
                    <div className="flex gap-4">
                        <a href="https://www.instagram.com/bikinligaonline/" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition"><Instagram className="w-5 h-5" /></a>
                        <a href="https://www.tiktok.com/@bikinligaonline" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition"><Tiktok className="w-[18px] h-[18px] mt-0.5" /></a>
                    </div>
                </div>
            </div>
        </footer>
    )
}
