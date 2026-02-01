import React, { useState, useEffect } from 'react'
import { User, Lock, Users, Plus, Shield, Check, Loader2, X } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { useToast } from '../../contexts/ToastContext'
import { authFetch } from '../../utils/api'
import { useAuth } from '../../contexts/AuthContext'

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
    const { success, error } = useToast()
    const { user, checkUsername } = useAuth()
    const [searchParams, setSearchParams] = useSearchParams()
    const [activeTab, setActiveTabState] = useState(searchParams.get('tab') || 'profile')
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        const tab = searchParams.get('tab')
        if (tab) {
            setActiveTabState(tab)
        }
    }, [searchParams])

    const setActiveTab = (tab) => {
        setActiveTabState(tab)
        setSearchParams({ tab })
    }

    // Form States
    const [profileForm, setProfileForm] = useState({
        name: '',
        username: '',
        email: '',
        phone: '',
        bio: ''
    })

    // Username Validation State
    const [usernameAvailability, setUsernameAvailability] = useState(null) // null, 'available', 'taken', 'invalid'
    const [isCheckingUsername, setIsCheckingUsername] = useState(false)

    useEffect(() => {
        if (user) {
            setProfileForm(prev => ({
                ...prev,
                name: user.name || '',
                username: user.username || '',
                email: user.email || '',
                phone: user.phone || '',
                bio: user.bio || ''
            }))
        }
    }, [user])

    // Live Username Check
    useEffect(() => {
        const check = async () => {
            const username = profileForm.username;

            // If empty or short
            if (!username || username.length < 5) {
                setUsernameAvailability(null);
                return;
            }

            // If same as current user's username, it's valid
            if (user && username === user.username) {
                setUsernameAvailability('available');
                return;
            }

            setIsCheckingUsername(true);
            try {
                const result = await checkUsername(username);
                if (!result.success && !result.available) {
                    setUsernameAvailability('invalid');
                } else {
                    setUsernameAvailability(result.available ? 'available' : 'taken');
                }
            } catch (err) {
                console.error('Check username error:', err);
                setUsernameAvailability('invalid');
            } finally {
                setIsCheckingUsername(false);
            }
        };

        const timer = setTimeout(check, 500);
        return () => clearTimeout(timer);
    }, [profileForm.username, user, checkUsername]);

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

    const handleProfileUpdate = async (e) => {
        e.preventDefault()

        if (profileForm.username.length < 5) {
            return error('Username minimal 5 karakter')
        }

        if (usernameAvailability === 'taken') {
            return error('Username sudah digunakan')
        }

        if (usernameAvailability === 'invalid') {
            return error('Username tidak valid')
        }

        setIsLoading(true)
        try {
            const res = await authFetch('/api/auth/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: profileForm.name,
                    username: profileForm.username,
                    phone: profileForm.phone,
                    bio: profileForm.bio
                })
            })
            const data = await res.json()

            if (data.success) {
                success(data.message)
                // Optionally update local user context here if method available
                // window.location.reload() // Brute force update useful for now to reflect changes everywhere
            } else {
                error(data.message)
            }
        } catch (err) {
            console.error('Update profile error:', err)
            error('Gagal memperbarui profil')
        } finally {
            setIsLoading(false)
        }
    }

    // ... (rest of component) ...

    const handlePasswordUpdate = async (e) => {
        e.preventDefault()

        if (passwordForm.new !== passwordForm.confirm) {
            return error('Konfirmasi password tidak cocok')
        }

        // Allow any character as long as it meets complexity requirements
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*.,\-_]).{8,}$/;
        if (!passwordRegex.test(passwordForm.new)) {
            return error('Password harus minimal 8 karakter, mengandung huruf besar, huruf kecil, angka, dan simbol (!@#$%^&*.,-_)')
        }

        setIsLoading(true)
        try {
            const payload = {
                currentPassword: passwordForm.current,
                newPassword: passwordForm.new
            };

            const res = await authFetch('/api/auth/password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })
            const data = await res.json()

            if (data.success) {
                success(data.message)
                setPasswordForm({ current: '', new: '', confirm: '' })
            } else {
                error(data.message)
            }
        } catch (err) {
            console.error('Password update error:', err)
            error('Gagal memperbarui password')
        } finally {
            setIsLoading(false)
        }
    }

    const handleCreateClub = (e) => {
        e.preventDefault()
        setIsLoading(true)
        // Simulate coin payment and creation
        setTimeout(() => {
            setIsLoading(false)
            setShowCreateClub(false)
            success('Komunitas berhasil dibuat! Saldo koin telah dikurangi.')
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
                                    {(user?.name || 'A').charAt(0).toUpperCase()}
                                </div>
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
                                    <label className="block text-sm text-gray-400 mb-1">Username</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                            @
                                        </div>
                                        <input
                                            type="text"
                                            value={profileForm.username}
                                            onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, '') })}
                                            className={`w-full bg-darkBg border rounded-lg pl-8 pr-12 py-2 text-white focus:outline-none transition-colors ${usernameAvailability === 'available' ? 'border-neonGreen focus:border-neonGreen' :
                                                (usernameAvailability === 'taken' || usernameAvailability === 'invalid' || (profileForm.username.length > 0 && profileForm.username.length < 5)) ? 'border-red-500 focus:border-red-500' :
                                                    'border-white/10 focus:border-neonGreen'
                                                }`}
                                            placeholder="username"
                                            maxLength={20}
                                        />
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            {isCheckingUsername ? (
                                                <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                                            ) : usernameAvailability === 'available' ? (
                                                <Check className="w-4 h-4 text-neonGreen" />
                                            ) : usernameAvailability === 'taken' || usernameAvailability === 'invalid' || (profileForm.username.length > 0 && profileForm.username.length < 5) ? (
                                                <X className="w-4 h-4 text-red-500" />
                                            ) : null}
                                        </div>
                                    </div>
                                    <div className="mt-1 min-h-[16px]">
                                        {profileForm.username.length > 0 && profileForm.username.length < 5 && (
                                            <p className="text-xs text-red-500">Minimal 5 karakter</p>
                                        )}
                                        {usernameAvailability === 'available' && (
                                            <p className="text-xs text-neonGreen flex items-center gap-1">
                                                Username tersedia
                                            </p>
                                        )}
                                        {usernameAvailability === 'taken' && (
                                            <p className="text-xs text-red-500 flex items-center gap-1">
                                                Username sudah digunakan
                                            </p>
                                        )}
                                        {usernameAvailability === 'invalid' && (
                                            <p className="text-xs text-red-500 flex items-center gap-1">
                                                Hanya huruf, angka, titik, dan underscore
                                            </p>
                                        )}
                                        {!usernameAvailability && profileForm.username.length >= 5 && (
                                            <p className="text-xs text-gray-500">Minimal 5 karakter, unik.</p>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Email (Tidak dapat diubah)</label>
                                    <input
                                        type="email"
                                        value={profileForm.email}
                                        readOnly
                                        className="w-full bg-darkBg/50 border border-white/5 rounded-lg px-4 py-2 text-gray-400 cursor-not-allowed focus:outline-none"
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
                            {user?.hasPassword ? 'Ganti Password' : 'Atur Password'}
                        </h2>
                        <form onSubmit={handlePasswordUpdate} className="space-y-4 max-w-lg">
                            {/* Only show current password if user has one */}
                            {user?.hasPassword && (
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Password Saat Ini</label>
                                    <input
                                        type="password"
                                        value={passwordForm.current}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                                        className="w-full bg-darkBg border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-neonGreen"
                                    />
                                </div>
                            )}
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
                            <div className="pt-2 space-y-2">
                                <p className="text-xs text-gray-400 mb-2">Syarat Password:</p>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div className={`flex items-center gap-2 ${passwordForm.new.length >= 8 ? 'text-neonGreen' : 'text-gray-500'}`}>
                                        <Check className="w-3 h-3" /> Minimal 8 karakter
                                    </div>
                                    <div className={`flex items-center gap-2 ${/[A-Z]/.test(passwordForm.new) ? 'text-neonGreen' : 'text-gray-500'}`}>
                                        <Check className="w-3 h-3" /> Huruf kapital
                                    </div>
                                    <div className={`flex items-center gap-2 ${/[a-z]/.test(passwordForm.new) ? 'text-neonGreen' : 'text-gray-500'}`}>
                                        <Check className="w-3 h-3" /> Huruf kecil
                                    </div>
                                    <div className={`flex items-center gap-2 ${/\d/.test(passwordForm.new) ? 'text-neonGreen' : 'text-gray-500'}`}>
                                        <Check className="w-3 h-3" /> Angka (0-9)
                                    </div>
                                    <div className={`flex items-center gap-2 ${/[!@#$%^&*.,\-_]/.test(passwordForm.new) ? 'text-neonGreen' : 'text-gray-500'}`}>
                                        <Check className="w-3 h-3" /> Simbol (!@#$%^&*.,-_)
                                    </div>
                                    <div className={`flex items-center gap-2 ${passwordForm.new && passwordForm.new === passwordForm.confirm ? 'text-neonGreen' : 'text-gray-500'}`}>
                                        <Check className="w-3 h-3" /> Password cocok
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={isLoading || !(
                                        passwordForm.new.length >= 8 &&
                                        /[A-Z]/.test(passwordForm.new) &&
                                        /[a-z]/.test(passwordForm.new) &&
                                        /\d/.test(passwordForm.new) &&
                                        /[!@#$%^&*.,\-_]/.test(passwordForm.new) &&
                                        passwordForm.new === passwordForm.confirm &&
                                        (!user?.hasPassword || passwordForm.current)
                                    )}
                                    className="bg-gradient-to-r from-neonGreen to-neonPink text-black font-bold px-6 py-2 rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? 'Memproses...' : (user?.hasPassword ? 'Update Password' : 'Simpan Password')}
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
