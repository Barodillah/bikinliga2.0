import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Trophy, Menu, X, User, Key, LogOut, LayoutDashboard } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
    const location = useLocation()
    const navigate = useNavigate()
    const isLandingPage = location.pathname === '/'

    const { user, logout } = useAuth()

    const handleLogout = async () => {
        try {
            await logout()
            navigate('/login')
        } catch (error) {
            console.error('Logout failed:', error)
        }
    }

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

                    {/* CTA Button or User Profile */}
                    <div className="hidden md:flex items-center gap-3">
                        {user ? (
                            <div className="relative">
                                {/* Profile Dropdown Trigger */}
                                <button
                                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                                    className="flex items-center gap-3 hover:bg-white/5 p-1 rounded-lg transition border border-transparent hover:border-white/10"
                                >
                                    <div className="text-right hidden sm:block">
                                        <div className="text-sm font-medium">{user?.name || 'User'}</div>
                                        <div className="text-xs text-gray-500">{user?.email}</div>
                                    </div>
                                    {user?.avatar_url ? (
                                        <img
                                            src={user.avatar_url}
                                            alt={user.name}
                                            className="w-10 h-10 rounded-full object-cover border-2 border-neonGreen"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-neonGreen to-neonPink flex items-center justify-center text-black font-bold">
                                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                        </div>
                                    )}
                                </button>

                                {/* Profile Dropdown */}
                                {profileDropdownOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-40 bg-black/50 md:bg-transparent"
                                            onClick={() => setProfileDropdownOpen(false)}
                                        ></div>
                                        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 pointer-events-none md:block md:static md:p-0">
                                            <div className="w-[90vw] max-w-sm bg-black/95 backdrop-blur-md border border-white/10 rounded-xl shadow-xl overflow-hidden pointer-events-auto md:absolute md:top-full md:right-0 md:w-56 md:mt-2">
                                                {/* Mobile User Info Header */}
                                                <div className="p-4 border-b border-white/10 flex items-center gap-3 md:hidden bg-white/5">
                                                    {user?.avatar_url ? (
                                                        <img
                                                            src={user.avatar_url}
                                                            alt={user.name}
                                                            className="w-10 h-10 rounded-full object-cover border-2 border-neonGreen"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-neonGreen to-neonPink flex items-center justify-center text-black font-bold">
                                                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="text-sm font-medium text-white">{user?.name || 'User'}</div>
                                                        <div className="text-xs text-gray-400">{user?.email}</div>
                                                    </div>
                                                </div>

                                                <div className="p-2 space-y-1">
                                                    <Link
                                                        to="/dashboard"
                                                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition"
                                                        onClick={() => setProfileDropdownOpen(false)}
                                                    >
                                                        <LayoutDashboard className="w-4 h-4" />
                                                        Dashboard
                                                    </Link>
                                                    <Link
                                                        to="/dashboard/my-profile"
                                                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition"
                                                        onClick={() => setProfileDropdownOpen(false)}
                                                    >
                                                        <User className="w-4 h-4" />
                                                        My Profile
                                                    </Link>
                                                    <Link
                                                        to="/dashboard/settings?tab=password"
                                                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition"
                                                        onClick={() => setProfileDropdownOpen(false)}
                                                    >
                                                        <Key className="w-4 h-4" />
                                                        Change Password
                                                    </Link>
                                                    <div className="h-px bg-white/10 my-1"></div>
                                                    <button
                                                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-white/5 transition"
                                                        onClick={() => { setProfileDropdownOpen(false); handleLogout(); }}
                                                    >
                                                        <LogOut className="w-4 h-4" />
                                                        Log Out
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <>
                                <Link to="/login" className="text-sm font-medium hover:text-neonGreen transition-colors">
                                    Masuk
                                </Link>
                                <Link to="/register" className="btn-primary px-5 py-2 rounded-full text-sm">
                                    Daftar
                                </Link>
                            </>
                        )}
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
                        {user ? (
                            <Link
                                to="/dashboard"
                                onClick={() => setMobileMenuOpen(false)}
                                className="mt-4 block w-full text-center btn-primary px-6 py-3 rounded-md text-base"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
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
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    )
}
