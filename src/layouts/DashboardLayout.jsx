import React, { useState } from 'react'
import { Outlet, NavLink, Link, useLocation } from 'react-router-dom'
import {
    Trophy, LayoutDashboard, List, Plus, Users,
    Calendar, BarChart2, Settings, LogOut, Menu, X,
    ChevronRight
} from 'lucide-react'

const sidebarLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, exact: true },
    { name: 'Turnamen Saya', href: '/dashboard/tournaments', icon: List, exact: true },
    { name: 'Buat Turnamen', href: '/dashboard/tournaments/new', icon: Plus },
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
                    <Trophy className="w-6 h-6 text-neonGreen" />
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
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${isActive
                                    ? 'bg-neonGreen/10 text-neonGreen border-l-2 border-neonGreen'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                }`
                            }
                        >
                            <link.icon className="w-5 h-5" />
                            {link.name}
                        </NavLink>
                    ))}
                </nav>

                {/* Bottom Actions */}
                <div className="p-4 border-t border-white/10 space-y-2">
                    <Link
                        to="#"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-white transition"
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
                        <Trophy className="w-6 h-6 text-neonGreen" />
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
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${isActive
                                    ? 'bg-neonGreen/10 text-neonGreen border-l-2 border-neonGreen'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                }`
                            }
                        >
                            <link.icon className="w-5 h-5" />
                            {link.name}
                        </NavLink>
                    ))}
                </nav>
                {/* Bottom Actions - Mobile */}
                <div className="p-4 border-t border-white/10 space-y-2">
                    <Link
                        to="#"
                        onClick={() => setSidebarOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-white transition"
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
