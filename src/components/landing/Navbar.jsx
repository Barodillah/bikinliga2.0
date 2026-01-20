import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Trophy, Menu, X } from 'lucide-react'

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const location = useLocation()
    const isLandingPage = location.pathname === '/'

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const navLinks = [
        { name: 'Fitur', href: '#fitur' },
        { name: 'Cara Kerja', href: '#cara-kerja' },
        { name: 'Harga', href: '#harga' },
        { name: 'FAQ', href: '#faq' },
    ]

    return (
        <nav className={`fixed w-full z-50 glass-panel border-b border-white/10 transition-all duration-300 ${isScrolled ? 'bg-black/80 shadow-lg' : ''}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <Link to="/" className="flex items-center gap-2">
                        <img src="/logo.png" alt="BikinLiga" className="h-7" />
                        <span className="font-display font-bold text-2xl tracking-tight">
                            Bikin<span className="text-neonPink">Liga</span>
                        </span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-8">
                            {isLandingPage && navLinks.map(link => (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    className="hover:text-neonGreen transition-colors px-3 py-2 rounded-md text-sm font-medium"
                                >
                                    {link.name}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* CTA Button */}
                    <div className="hidden md:flex items-center gap-3">
                        <Link to="/login" className="text-sm font-medium hover:text-neonGreen transition-colors">
                            Masuk
                        </Link>
                        <Link to="/register" className="btn-primary px-5 py-2 rounded-full text-sm">
                            Daftar
                        </Link>
                    </div>

                    {/* Mobile menu button */}
                    <div className="-mr-2 flex md:hidden">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden glass-panel border-t border-white/10">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {isLandingPage && navLinks.map(link => (
                            <a
                                key={link.name}
                                href={link.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className="text-gray-300 hover:text-neonGreen block px-3 py-2 rounded-md text-base font-medium"
                            >
                                {link.name}
                            </a>
                        ))}
                        <Link
                            to="/login"
                            onClick={() => setMobileMenuOpen(false)}
                            className="mt-4 block w-full text-center border border-white/20 hover:bg-white/10 px-6 py-3 rounded-md text-base transition-colors"
                        >
                            Masuk
                        </Link>
                        <Link
                            to="/register"
                            onClick={() => setMobileMenuOpen(false)}
                            className="mt-2 block w-full text-center btn-primary px-6 py-3 rounded-md text-base"
                        >
                            Daftar
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    )
}
