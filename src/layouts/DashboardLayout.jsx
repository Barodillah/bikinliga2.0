import React, { useState } from 'react'
import { Outlet, NavLink, Link, useLocation } from 'react-router-dom'
import {
    Trophy, LayoutDashboard, List, Plus, Users, Tv,
    Calendar, BarChart2, Settings, LogOut, Menu, X,
    ChevronRight, Wallet, Shield, FileText, Globe, Bell
} from 'lucide-react'
import ChatWidget from '../components/ChatWidget'

const sidebarLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, exact: true },
    { name: 'Turnamen Saya', href: '/dashboard/tournaments', icon: List },
    { name: 'Buat Turnamen', href: '/dashboard/tournaments/new', icon: Plus },
    { name: 'Kompetisi', href: '/dashboard/competitions', icon: Globe },
    { name: 'Stream', href: '/dashboard/stream', icon: Tv },
    { name: 'Top Up', href: '/dashboard/topup', icon: Wallet },
    { name: 'eClub', href: '/dashboard/eclub', icon: Shield },
    { name: 'Ranking', href: '/dashboard/ranking', icon: BarChart2 },
]

export default function DashboardLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [notificationsOpen, setNotificationsOpen] = useState(false)
    const location = useLocation()

    // Mock notifications
    const notifications = [
        {
            id: 1,
            title: 'Turnamen Baru',
            message: 'Turnamen "Mobile Legends Season 5" telah dibuka pendaftaran.',
            time: '2 jam yang lalu',
            unread: true
        },
        {
            id: 2,
            title: 'Pembayaran Diterima',
            message: 'Top up sebesar 500 coin telah berhasil.',
            time: '5 jam yang lalu',
            unread: true
        },
        {
            id: 3,
            title: 'Jadwal Pertandingan',
            message: 'Pertandingan tim Anda dijadwalkan besok pukul 19:00.',
            time: '1 hari yang lalu',
            unread: false
        }
    ]

    const isActive = (href, exact = false) => {
        if (exact) return location.pathname === href
        return location.pathname.startsWith(href)
    }

    return (
        <div className="h-screen bg-darkBg flex overflow-hidden">
            {/* Sidebar - Desktop */}
            <aside className="hidden lg:flex lg:flex-col w-64 h-screen border-r border-white/10 bg-cardBg flex-shrink-0 sticky top-0">
                {/* Logo */}
                <div className="h-16 flex items-center gap-2 px-6 border-b border-white/10">
                    <img src="/logo.png" alt="BikinLiga" className="h-7" />
                    <span className="font-display font-bold text-xl">
                        Bikin<span className="text-neonPink">Liga</span>
                    </span>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2">
                    {sidebarLinks.map((link) => (
                        <NavLink
                            key={link.href}
                            to={link.href}
                            end={link.exact}
                            className={({ isActive }) => {
                                const isOverridden = link.href === '/dashboard/tournaments' && location.pathname === '/dashboard/tournaments/new'
                                const active = isActive && !isOverridden
                                return `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${active
                                    ? 'bg-neonGreen/10 text-neonGreen border-l-2 border-neonGreen'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`
                            }}
                        >
                            <link.icon className="w-5 h-5" />
                            {link.name}
                        </NavLink>
                    ))}
                </nav>

                {/* Subscription Card */}
                <div className="p-4 border-t border-white/10">
                    <div className="bg-gradient-to-br from-white/5 to-white/10 rounded-xl p-4 border border-white/10">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <img src="/coin.png" alt="Coin" className="w-5 h-5" />
                                <span className="font-display font-bold text-lg text-yellow-400">1,250</span>
                            </div>
                            <span className="text-xs px-2 py-1 rounded-full bg-neonGreen/20 text-neonGreen font-medium">
                                Free
                            </span>
                        </div>
                        <Link
                            to="/dashboard/upgrade"
                            className="block w-full text-center py-2 rounded-lg bg-gradient-to-r from-neonGreen to-neonPink text-black text-sm font-bold hover:opacity-90 transition"
                        >
                            Upgrade
                        </Link>
                    </div>
                </div>

                {/* Bottom Actions */}
                <div className="p-4 border-t border-white/10 space-y-2">
                    <Link
                        to="/dashboard/settings"
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${location.pathname === '/dashboard/settings'
                            ? 'bg-neonGreen/10 text-neonGreen border-l-2 border-neonGreen'
                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        <Settings className="w-5 h-5" />
                        Pengaturan
                    </Link>
                    <Link
                        to="/"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-red-400 transition"
                    >
                        <LogOut className="w-5 h-5" />
                        Keluar
                    </Link>
                </div>
            </aside>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="lg:hidden fixed inset-0 z-40 bg-black/60"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar - Mobile */}
            <aside className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-cardBg border-r border-white/10 transform transition-transform duration-300 flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="h-16 flex items-center justify-between px-6 border-b border-white/10">
                    <div className="flex items-center gap-2">
                        <img src="/logo.png" alt="BikinLiga" className="h-7" />
                        <span className="font-display font-bold text-xl">
                            Bikin<span className="text-neonPink">Liga</span>
                        </span>
                    </div>
                    <button onClick={() => setSidebarOpen(false)} className="p-2 text-gray-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    {sidebarLinks.map((link) => (
                        <NavLink
                            key={link.href}
                            to={link.href}
                            end={link.exact}
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) => {
                                const isOverridden = link.href === '/dashboard/tournaments' && location.pathname === '/dashboard/tournaments/new'
                                const active = isActive && !isOverridden
                                return `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${active
                                    ? 'bg-neonGreen/10 text-neonGreen border-l-2 border-neonGreen'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`
                            }}
                        >
                            <link.icon className="w-5 h-5" />
                            {link.name}
                        </NavLink>
                    ))}
                </nav>
                {/* Bottom Actions - Mobile */}
                <div className="p-4 border-t border-white/10 space-y-2">
                    <Link
                        to="/dashboard/settings"
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${location.pathname === '/dashboard/settings'
                            ? 'bg-neonGreen/10 text-neonGreen border-l-2 border-neonGreen'
                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        <Settings className="w-5 h-5" />
                        Pengaturan
                    </Link>
                    <Link
                        to="/"
                        onClick={() => setSidebarOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-red-400 transition"
                    >
                        <LogOut className="w-5 h-5" />
                        Keluar
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                {/* Top Header */}
                <header className="h-16 flex items-center justify-between px-4 lg:px-8 border-b border-white/10 bg-cardBg/80 backdrop-blur-sm flex-shrink-0 z-30">
                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5"
                    >
                        <Menu className="w-6 h-6" />
                    </button>

                    {/* Breadcrumb */}
                    <div className="hidden lg:flex items-center gap-2 text-sm text-gray-400">
                        <Link to="/dashboard" className="hover:text-white transition">Dashboard</Link>
                        {location.pathname !== '/dashboard' && (
                            <>
                                <ChevronRight className="w-4 h-4" />
                                <span className="text-white capitalize">
                                    {location.pathname.split('/').pop().replace('-', ' ') || 'Overview'}
                                </span>
                            </>
                        )}
                    </div>

                    {/* User Menu */}
                    <div className="flex items-center gap-4">
                        {/* Virtual Coins */}
                        <Link
                            to="/dashboard/topup"
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 transition"
                        >
                            <img src="/coin.png" alt="Coin" className="w-5 h-5" />
                            <span className="font-display font-bold text-yellow-400">1,250</span>
                        </Link>

                        {/* Notification Bell */}
                        <div className="relative">
                            <button
                                onClick={() => setNotificationsOpen(!notificationsOpen)}
                                className="text-gray-400 hover:text-white transition relative mr-2 p-1 rounded-full hover:bg-white/5"
                            >
                                <Bell className="w-6 h-6" />
                                {notifications.some(n => n.unread) && (
                                    <span className="absolute top-0 right-0 h-3 w-3 rounded-full bg-neonPink border-2 border-cardBg flex items-center justify-center"></span>
                                )}
                            </button>

                            {/* Dropdown */}
                            {notificationsOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40 bg-black/50 md:bg-transparent"
                                        onClick={() => setNotificationsOpen(false)}
                                    ></div>
                                    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 pointer-events-none md:block md:static md:p-0">
                                        <div className="w-[90vw] max-w-sm bg-cardBg border border-white/10 rounded-xl shadow-xl overflow-hidden pointer-events-auto md:absolute md:top-full md:left-auto md:right-0 md:w-80 md:mt-2">
                                            <div className="p-3 border-b border-white/10 flex items-center justify-between bg-white/5">
                                                <h3 className="font-medium text-white">Notifikasi</h3>
                                                <span className="text-xs text-neonPink cursor-pointer hover:underline">
                                                    Tandai dibaca
                                                </span>
                                            </div>
                                            <div className="max-h-96 overflow-y-auto">
                                                {notifications.map((notification) => (
                                                    <div
                                                        key={notification.id}
                                                        className={`p-4 border-b border-white/5 hover:bg-white/5 transition cursor-pointer ${notification.unread ? 'bg-white/[0.02]' : ''}`}
                                                    >
                                                        <div className="flex justify-between items-start mb-1">
                                                            <h4 className={`text-sm font-medium ${notification.unread ? 'text-white' : 'text-gray-400'}`}>
                                                                {notification.title}
                                                            </h4>
                                                            <span className="text-[10px] text-gray-500">{notification.time}</span>
                                                        </div>
                                                        <p className="text-xs text-gray-400 line-clamp-2">
                                                            {notification.message}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="p-2 text-center border-t border-white/10 bg-white/5">
                                                <button className="text-xs text-neonGreen hover:text-white transition">
                                                    Lihat Semua
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="text-right hidden sm:block">
                            <div className="text-sm font-medium">Admin User</div>
                            <div className="text-xs text-gray-500">admin@bikinliga.com</div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-neonGreen to-neonPink flex items-center justify-center text-black font-bold">
                            A
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 lg:p-8 overflow-y-auto overflow-x-hidden">
                    <Outlet />
                </main>

                {/* AI Chat Widget */}
                <ChatWidget />
            </div>
        </div>
    )
}
