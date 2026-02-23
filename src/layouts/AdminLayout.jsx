import React, { useState } from 'react'
import { Outlet, NavLink, Link, useLocation, useNavigate } from 'react-router-dom'
import {
    LayoutDashboard, Users, MessageSquare,
    BarChart2, History, Menu, X,
    ChevronRight, Wallet, LogOut, ArrowLeft, Trophy, Mail, Coins
} from 'lucide-react'
import ChatWidget from '../components/ChatWidget'
import { useAuth } from '../contexts/AuthContext'
import { ToastProvider } from '../contexts/ToastContext'

const sidebarLinks = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
    { name: 'Tournaments', href: '/admin/tournaments', icon: Trophy },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Email Blast', href: '/admin/email-blast', icon: Mail },
    { name: 'Complaint', href: '/admin/complaint', icon: MessageSquare },
    { name: 'Transaction', href: '/admin/transaction', icon: Wallet },
    { name: 'Coin Stock', href: '/admin/coin-stock', icon: Coins },
    { name: 'AI Analysis', href: '/admin/ai-analysis', icon: BarChart2 },
    { name: 'History', href: '/admin/history', icon: History },
]

export default function AdminLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const location = useLocation()
    const navigate = useNavigate()
    const { logout, user } = useAuth()

    const handleLogout = async () => {
        await logout()
        navigate('/login')
    }

    return (
        <ToastProvider theme="light">
            <div className="h-screen bg-gray-50 flex overflow-hidden">
                {/* Sidebar - Desktop */}
                <aside className="hidden lg:flex lg:flex-col w-64 h-screen border-r border-gray-200 bg-white flex-shrink-0 sticky top-0">
                    {/* Logo */}
                    <div className="h-16 flex items-center gap-2 px-6 border-b border-gray-200">
                        <img src="/logo.png" alt="BikinLiga" className="h-7" />
                        <span className="font-display font-bold text-xl text-gray-900">
                            Bikin<span className="text-neonPink">Liga</span>
                            <span className="text-xs ml-1 px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-medium">
                                Admin
                            </span>
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
                                        ? 'bg-neonGreen/10 text-emerald-600 border-l-2 border-neonGreen'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`
                                }
                            >
                                <link.icon className="w-5 h-5" />
                                {link.name}
                            </NavLink>
                        ))}
                    </nav>

                    {/* Bottom Actions */}
                    <div className="p-4 border-t border-gray-200 space-y-2">
                        <Link
                            to="/dashboard"
                            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Kembali ke App
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-red-500 transition"
                        >
                            <LogOut className="w-5 h-5" />
                            Keluar
                        </button>
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
                <aside className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
                        <div className="flex items-center gap-2">
                            <img src="/logo.png" alt="BikinLiga" className="h-7" />
                            <span className="font-display font-bold text-xl text-gray-900">
                                Bikin<span className="text-neonPink">Liga</span>
                            </span>
                        </div>
                        <button onClick={() => setSidebarOpen(false)} className="p-2 text-gray-500 hover:text-gray-900">
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
                                        ? 'bg-neonGreen/10 text-emerald-600 border-l-2 border-neonGreen'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`
                                }
                            >
                                <link.icon className="w-5 h-5" />
                                {link.name}
                            </NavLink>
                        ))}
                    </nav>
                    {/* Bottom Actions - Mobile */}
                    <div className="p-4 border-t border-gray-200 space-y-2">
                        <Link
                            to="/dashboard"
                            onClick={() => setSidebarOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Kembali ke App
                        </Link>
                        <button
                            onClick={() => { setSidebarOpen(false); handleLogout(); }}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-red-500 transition"
                        >
                            <LogOut className="w-5 h-5" />
                            Keluar
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                    {/* Top Header */}
                    <header className="h-16 flex items-center justify-between px-4 lg:px-8 border-b border-gray-200 bg-white/80 backdrop-blur-sm flex-shrink-0 z-30">
                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-50"
                        >
                            <Menu className="w-6 h-6" />
                        </button>

                        {/* Breadcrumb */}
                        <div className="hidden lg:flex items-center gap-2 text-sm text-gray-500">
                            <span className="font-medium text-gray-900">Admin Panel</span>
                            <ChevronRight className="w-4 h-4" />
                            <span className="text-gray-700 capitalize">
                                {location.pathname.split('/').pop().replace('-', ' ') || 'Dashboard'}
                            </span>
                        </div>

                        {/* User Menu */}
                        <div className="flex items-center gap-4">
                            <div className="text-right hidden sm:block">
                                <div className="text-sm font-bold text-gray-900">{user?.name || user?.username || 'User'}</div>
                                <div className="text-xs text-gray-500 capitalize">{user?.role || 'Admin'}</div>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-white font-bold border-2 border-neonGreen overflow-hidden">
                                {user?.avatar_url || user?.profile_picture ? (
                                    <img src={user.avatar_url || user.profile_picture} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    (user?.name?.charAt(0) || user?.username?.charAt(0) || 'U').toUpperCase()
                                )}
                            </div>
                        </div>
                    </header>

                    {/* Page Content */}
                    <main className="flex-1 p-4 lg:p-8 overflow-y-auto overflow-x-hidden bg-gray-50">
                        <Outlet />
                    </main>

                    {/* AI Chat Widget */}
                    {/* <ChatWidget /> */}
                </div>
            </div>
        </ToastProvider >
    )
}
