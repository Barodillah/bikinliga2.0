import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Trophy, Instagram, Twitter, Facebook, Youtube } from 'lucide-react'

import { useToast } from '../../contexts/ToastContext'

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
                                <a href="https://chat.whatsapp.com/IixJt1jmzTj8KITMMH0nsr" target="_blank" rel="noopener noreferrer" className="hover:text-neonGreen transition">Komunitas</a>
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
                        <a href="#" className="text-gray-500 hover:text-white transition"><Instagram className="w-5 h-5" /></a>
                        <a href="#" className="text-gray-500 hover:text-white transition"><Twitter className="w-5 h-5" /></a>
                        <a href="#" className="text-gray-500 hover:text-white transition"><Facebook className="w-5 h-5" /></a>
                        <a href="#" className="text-gray-500 hover:text-white transition"><Youtube className="w-5 h-5" /></a>
                    </div>
                </div>
            </div>
        </footer>
    )
}
