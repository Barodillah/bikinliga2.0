import React, { useState } from 'react'
import { Outlet, NavLink, Link, useLocation } from 'react-router-dom'
import {
    Trophy, LayoutDashboard, List, Plus, Users,
    Calendar, BarChart2, Settings, LogOut, Menu, X,
    ChevronRight, Wallet, Shield, FileText
} from 'lucide-react'

const sidebarLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, exact: true },
    { name: 'Turnamen Saya', href: '/dashboard/tournaments', icon: List },
    { name: 'Buat Turnamen', href: '/dashboard/tournaments/new', icon: Plus },
    { name: 'Top Up', href: '/dashboard/topup', icon: Wallet },
    { name: 'eClub', href: '/dashboard/eclub', icon: Shield },
    { name: 'Ranking', href: '/dashboard/ranking', icon: BarChart2 },
]

export default function DashboardLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const location = useLocation()

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
            </div>
        </div>
    )
}
