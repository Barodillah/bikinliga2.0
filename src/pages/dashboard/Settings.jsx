import React, { useState } from 'react'
import { User, Lock, Users, Plus, Shield, Check } from 'lucide-react'

// Mock Data for Communities
const MOCK_ADMIN_COMMUNITIES = [
    {
        id: 1,
        name: 'Mobile Legends Indo',
        members: '12.5k',
        type: 'public',
        role: 'admin',
        image: 'https://ui-avatars.com/api/?name=ML&background=ef4444&color=fff'
    },
    {
        id: 4,
        name: 'Valorant Tactics',
        members: '3.4k',
        type: 'private',
        role: 'admin',
        image: 'https://ui-avatars.com/api/?name=VL&background=ef4444&color=fff'
    }
]

export default function Settings() {
    const [activeTab, setActiveTab] = useState('profile')
    const [isLoading, setIsLoading] = useState(false)

    // Form States
    const [profileForm, setProfileForm] = useState({
        name: 'Admin User',
        email: 'admin@bikinliga.com',
        phone: '+62 812 3456 7890',
        bio: 'Just a regular admin loving esports.'
    })

    const [passwordForm, setPasswordForm] = useState({
        current: '',
        new: '',
        confirm: ''
    })

    // eClub Create State
    const [showCreateClub, setShowCreateClub] = useState(false)
    const [newClub, setNewClub] = useState({
        name: '',
        type: 'public',
        description: ''
    })

    const handleProfileUpdate = (e) => {
        e.preventDefault()
        setIsLoading(true)
        setTimeout(() => setIsLoading(false), 1000)
    }

    const handlePasswordUpdate = (e) => {
        e.preventDefault()
        setIsLoading(true)
        setTimeout(() => {
            setIsLoading(false)
            setPasswordForm({ current: '', new: '', confirm: '' })
        }, 1000)
    }

    const handleCreateClub = (e) => {
        e.preventDefault()
        setIsLoading(true)
        // Simulate coin payment and creation
        setTimeout(() => {
            setIsLoading(false)
            setShowCreateClub(false)
            alert('Komunitas berhasil dibuat! Saldo koin telah dikurangi.')
        }, 1500)
    }

    const renderTabContent = () => {
        switch (activeTab) {
            case 'profile':
                return (
                    <div className="bg-cardBg border border-white/10 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <User className="w-5 h-5 text-neonGreen" />
                            Profile Akun
                        </h2>
                        <form onSubmit={handleProfileUpdate} className="space-y-4 max-w-2xl">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-neonGreen to-neonPink flex items-center justify-center text-black font-bold text-3xl">
                                    A
                                </div>
                                <button type="button" className="text-sm text-neonGreen hover:text-white transition">
                                    Ubah Foto
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Nama Lengkap</label>
                                    <input
                                        type="text"
                                        value={profileForm.name}
                                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                                        className="w-full bg-darkBg border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-neonGreen"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={profileForm.email}
                                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                                        className="w-full bg-darkBg border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-neonGreen"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Nomor Telepon</label>
                                    <input
                                        type="text"
                                        value={profileForm.phone}
                                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                                        className="w-full bg-darkBg border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-neonGreen"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Bio</label>
                                <textarea
                                    value={profileForm.bio}
                                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                                    rows="3"
                                    className="w-full bg-darkBg border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-neonGreen"
                                />
                            </div>
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="bg-gradient-to-r from-neonGreen to-neonPink text-black font-bold px-6 py-2 rounded-lg hover:opacity-90 transition disabled:opacity-50"
                                >
                                    {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </button>
                            </div>
                        </form>
                    </div>
                )

            case 'password':
                return (
                    <div className="bg-cardBg border border-white/10 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Lock className="w-5 h-5 text-neonGreen" />
                            Ganti Password
                        </h2>
                        <form onSubmit={handlePasswordUpdate} className="space-y-4 max-w-lg">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Password Saat Ini</label>
                                <input
                                    type="password"
                                    value={passwordForm.current}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                                    className="w-full bg-darkBg border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-neonGreen"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Password Baru</label>
                                <input
                                    type="password"
                                    value={passwordForm.new}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                                    className="w-full bg-darkBg border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-neonGreen"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Konfirmasi Password Baru</label>
                                <input
                                    type="password"
                                    value={passwordForm.confirm}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                                    className="w-full bg-darkBg border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-neonGreen"
                                />
                            </div>
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="bg-gradient-to-r from-neonGreen to-neonPink text-black font-bold px-6 py-2 rounded-lg hover:opacity-90 transition disabled:opacity-50"
                                >
                                    {isLoading ? 'Memproses...' : 'Update Password'}
                                </button>
                            </div>
                        </form>
                    </div>
                )

            case 'eclub':
                return (
                    <div className="space-y-6">
                        {/* Section Header with Action */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-neonGreen" />
                                    Manajemen eClub
                                </h2>
                                <p className="text-gray-400 text-sm mt-1">Kelola komunitas yang Anda pimpin.</p>
                            </div>
                            <button
                                onClick={() => setShowCreateClub(!showCreateClub)}
                                className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-4 py-2 rounded-lg transition flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                {showCreateClub ? 'Batal' : 'Buat Komunitas'}
                            </button>
                        </div>

                        {/* Create Community Form */}
                        {showCreateClub && (
                            <div className="bg-cardBg border border-white/10 rounded-xl p-6 animate-fade-in relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <Shield className="w-32 h-32 text-neonGreen" />
                                </div>
                                <h3 className="font-bold text-white mb-4">Buat Komunitas Baru</h3>
                                <form onSubmit={handleCreateClub} className="max-w-2xl relative z-10">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1">Nama Komunitas</label>
                                            <input
                                                type="text"
                                                required
                                                value={newClub.name}
                                                onChange={(e) => setNewClub({ ...newClub, name: e.target.value })}
                                                className="w-full bg-darkBg border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-neonGreen"
                                                placeholder="Contoh: Mobile Legends Surabaya"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1">Tipe</label>
                                            <select
                                                value={newClub.type}
                                                onChange={(e) => setNewClub({ ...newClub, type: e.target.value })}
                                                className="w-full bg-darkBg border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-neonGreen"
                                            >
                                                <option value="public">Public (Terbuka untuk semua)</option>
                                                <option value="private">Private (Perlu persetujuan)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1">Deskripsi</label>
                                            <textarea
                                                value={newClub.description}
                                                onChange={(e) => setNewClub({ ...newClub, description: e.target.value })}
                                                rows="3"
                                                className="w-full bg-darkBg border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-neonGreen"
                                                placeholder="Deskripsikan komunitas anda..."
                                            />
                                        </div>

                                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 flex items-center gap-4">
                                            <div className="bg-yellow-500/20 p-2 rounded-full">
                                                <img src="/coin.png" alt="Coin" className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-yellow-400">Biaya Pembuatan: 500 Koin</h4>
                                                <p className="text-xs text-yellow-200/70">Koin akan dipotong dari saldo akun Anda.</p>
                                            </div>
                                        </div>

                                        <div className="pt-2">
                                            <button
                                                type="submit"
                                                disabled={isLoading}
                                                className="bg-gradient-to-r from-neonGreen to-neonPink text-black font-bold px-6 py-2 rounded-lg hover:opacity-90 transition disabled:opacity-50 w-full md:w-auto"
                                            >
                                                {isLoading ? 'Memproses...' : 'Bayar & Buat Komunitas'}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Admin Communities Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {MOCK_ADMIN_COMMUNITIES.map((community) => (
                                <div key={community.id} className="bg-cardBg border border-white/10 rounded-xl p-4 hover:border-neonGreen/50 transition group">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <img src={community.image} alt={community.name} className="w-12 h-12 rounded-lg" />
                                            <div>
                                                <h3 className="font-bold text-white group-hover:text-neonGreen transition">{community.name}</h3>
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-neonGreen/10 text-neonGreen border border-neonGreen/20">
                                                    Admin
                                                </span>
                                            </div>
                                        </div>
                                        <button className="text-gray-400 hover:text-white">
                                            <Check className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between text-sm text-gray-400 border-t border-white/10 pt-3">
                                        <span className="flex items-center gap-1">
                                            <Users className="w-4 h-4" />
                                            {community.members}
                                        </span>
                                        <span className="capitalize">{community.type}</span>
                                    </div>
                                    <button className="w-full mt-4 bg-white/5 hover:bg-white/10 text-white font-medium py-2 rounded-lg transition text-sm">
                                        Kelola Komunitas
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )

            default:
                return null
        }
    }

    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-display font-bold text-white mb-2">Pengaturan</h1>
                <p className="text-gray-400">Kelola akun, keamanan, dan komunitas eClub Anda.</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar / Tabs */}
                <div className="w-full lg:w-64 flex-shrink-0 space-y-2">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === 'profile'
                            ? 'bg-gradient-to-r from-neonGreen to-neonGreen/80 text-black shadow-lg shadow-neonGreen/20'
                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        <User className="w-5 h-5" />
                        Profile Akun
                    </button>
                    <button
                        onClick={() => setActiveTab('password')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === 'password'
                            ? 'bg-gradient-to-r from-neonGreen to-neonGreen/80 text-black shadow-lg shadow-neonGreen/20'
                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        <Lock className="w-5 h-5" />
                        Password
                    </button>
                    <button
                        onClick={() => setActiveTab('eclub')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === 'eclub'
                            ? 'bg-gradient-to-r from-neonGreen to-neonGreen/80 text-black shadow-lg shadow-neonGreen/20'
                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        <Shield className="w-5 h-5" />
                        eClub Manager
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1">
                    {renderTabContent()}
                </div>
            </div>
        </div>
    )
}
