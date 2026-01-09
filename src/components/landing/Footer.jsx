import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Trophy, Instagram, Twitter, Facebook, Youtube } from 'lucide-react'

export default function Footer() {
    const [email, setEmail] = useState('')

    const handleSubscribe = (e) => {
        e.preventDefault()
        // Handle newsletter subscription
        alert(`Terima kasih telah subscribe: ${email}`)
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
                            {['Pusat Bantuan', 'Komunitas Discord', 'Tutorial Video', 'Kontak Kami'].map(item => (
                                <li key={item}>
                                    <a href="#" className="hover:text-neonGreen transition">{item}</a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h4 className="font-bold text-white mb-4">Newsletter</h4>
                        <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
                            <input
                                type="email"
                                placeholder="Email kamu"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="bg-white/5 border border-white/10 rounded px-4 py-2 text-sm focus:outline-none focus:border-neonGreen text-white"
                            />
                            <button
                                type="submit"
                                className="bg-neonGreen text-black font-bold text-sm py-2 rounded hover:bg-[#00c400] transition"
                            >
                                Subscribe
                            </button>
                        </form>
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
