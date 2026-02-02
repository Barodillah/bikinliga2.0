import React, { useState, useEffect } from 'react'
import { MoreVertical, Search, Filter, Shield, Trophy, Swords, Calendar, Mail, Phone, Download, Loader2, Settings, Trash2, Edit } from 'lucide-react'
import UserBadge from '../../components/ui/UserBadge'
import UserSettingModal from '../../components/modals/UserSettingModal'
import ConfirmationModal from '../../components/ui/ConfirmationModal'
import { useToast } from '../../contexts/ToastContext'

export default function AdminUsers() {
    const toast = useToast()
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [filterRole, setFilterRole] = useState('all')
    const [searchTerm, setSearchTerm] = useState('')

    // Action States
    const [selectedUser, setSelectedUser] = useState(null)
    const [settingModalOpen, setSettingModalOpen] = useState(false)
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [actionLoading, setActionLoading] = useState(false)
    const [activeDropdown, setActiveDropdown] = useState(null)

    useEffect(() => {
        fetchUsers()
    }, [])

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setActiveDropdown(null)
        document.addEventListener('click', handleClickOutside)
        return () => document.removeEventListener('click', handleClickOutside)
    }, [])

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/admin/users')
            const result = await response.json()
            if (result.success) {
                setUsers(result.data)
            } else {
                setError(result.message)
            }
        } catch (err) {
            console.error('Error fetching users:', err)
            setError('Failed to load users')
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateUser = async (userId, data) => {
        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            const result = await response.json()
            if (result.success) {
                fetchUsers() // Refresh list
                toast.success('User updated successfully')
            } else {
                toast.error(result.message || 'Failed to update user')
            }
        } catch (error) {
            console.error('Update failed:', error)
            toast.error('Update failed')
        }
    }

    const handleAdjustWallet = async (userId, data) => {
        try {
            const response = await fetch(`/api/admin/users/${userId}/wallet`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            const result = await response.json()
            if (result.success) {
                fetchUsers() // Refresh list
                toast.success('Wallet adjusted successfully')
            } else {
                toast.error(result.message || 'Failed to adjust wallet')
            }
        } catch (error) {
            console.error('Wallet adjustment failed:', error)
            toast.error('Adjustment failed')
        }
    }

    const handleDeleteUser = async () => {
        if (!selectedUser) return
        setActionLoading(true)
        try {
            const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
                method: 'DELETE'
            })
            const result = await response.json()
            if (result.success) {
                setUsers(users.filter(u => u.id !== selectedUser.id))
                setDeleteModalOpen(false)
                setSelectedUser(null)
                toast.success('User deleted successfully')
            } else {
                toast.error(result.message || 'Failed to delete user')
            }
        } catch (error) {
            console.error('Delete failed:', error)
            toast.error('Delete failed')
        } finally {
            setActionLoading(false)
        }
    }

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'superadmin': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'admin': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    }

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.username?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesRole = filterRole === 'all' || user.role === filterRole
        return matchesSearch && matchesRole
    })

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-neonGreen" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px] text-red-500">
                <p>{error}</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 font-display">Users Management</h1>
                    <p className="text-sm text-gray-500">Manage user accounts, roles, and monitor activities</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 bg-white">
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                    <button className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition">
                        Add New User
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Total Users</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">{users.length}</h3>
                    </div>
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                        <Shield className="w-5 h-5" />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Active Users</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">
                            {users.filter(u => u.status === 'active').length}
                        </h3>
                    </div>
                    <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                        <Shield className="w-5 h-5" />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Total Coins</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">
                            {users.reduce((acc, curr) => acc + (curr.wallet_balance || 0), 0).toLocaleString()}
                        </h3>
                    </div>
                    <div className="p-2 bg-yellow-100 text-yellow-600 rounded-lg">
                        <img src="/coin.png" alt="Coin" className="w-5 h-5" />
                    </div>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden min-h-[500px]">
                <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name, email, or username..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neonGreen/20 focus:border-neonGreen transition"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <select
                            className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 focus:outline-none focus:border-neonGreen"
                            value={filterRole}
                            onChange={(e) => setFilterRole(e.target.value)}
                        >
                            <option value="all">All Roles</option>
                            <option value="superadmin">Superadmin</option>
                            <option value="admin">Admin</option>
                            <option value="user">User</option>
                        </select>
                        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
                            <Filter className="w-4 h-4" />
                            More Filters
                        </button>
                    </div>
                </div>

                <div className="overflow-visible">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-medium">
                            <tr>
                                <th className="px-6 py-3">User</th>
                                <th className="px-6 py-3">Role & Status</th>
                                <th className="px-6 py-3">Wallet Balance</th>
                                <th className="px-6 py-3">Statistics</th>
                                <th className="px-6 py-3">Joined Date</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                                                    alt={user.name}
                                                    className="w-10 h-10 rounded-full bg-gray-100"
                                                />
                                                <div>
                                                    <div className="font-medium text-gray-900 flex items-center gap-1.5">
                                                        {user.name}
                                                        <UserBadge tier={user.subscription_plan} size="sm" />
                                                    </div>
                                                    <div className="text-xs text-gray-500">@{user.username}</div>
                                                    <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                                        <Mail className="w-3 h-3" /> {user.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-2 items-start">
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${getRoleBadgeColor(user.role)}`}>
                                                    {user.role}
                                                </span>
                                                <span className={`flex items-center gap-1.5 text-xs font-medium ${user.status === 'active' ? 'text-green-600' : 'text-gray-500'
                                                    }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                                                        }`} />
                                                    Active
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 font-bold text-gray-900">
                                                <img src="/coin.png" alt="Coin" className="w-5 h-5" />
                                                {(user.wallet_balance || 0).toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-xs text-gray-600" title="Tournaments Created">
                                                    <Trophy className="w-3.5 h-3.5 text-yellow-600" />
                                                    <span className="font-medium">{user.tournaments_created || 0}</span> Created
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-gray-600" title="Competitions Joined">
                                                    <Swords className="w-3.5 h-3.5 text-red-600" />
                                                    <span className="font-medium">{user.competitions_joined || 0}</span> Joined
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                {new Date(user.created_at).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </div>
                                            <span className="text-xs text-gray-400 block mt-1">
                                                {new Date(user.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right relative">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setActiveDropdown(activeDropdown === user.id ? null : user.id);
                                                }}
                                                className={`text-gray-400 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-lg transition ${activeDropdown === user.id ? 'bg-gray-100 text-gray-900' : ''}`}
                                            >
                                                <MoreVertical className="w-5 h-5" />
                                            </button>

                                            {/* Dropdown Menu */}
                                            {activeDropdown === user.id && (
                                                <div className="absolute right-8 top-8 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-50 py-1 animate-in fade-in slide-in-from-top-2 duration-200">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedUser(user);
                                                            setSettingModalOpen(true);
                                                            setActiveDropdown(null);
                                                        }}
                                                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                    >
                                                        <Settings className="w-4 h-4" />
                                                        Settings
                                                    </button>
                                                    <div className="h-px bg-gray-100 my-1"></div>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedUser(user);
                                                            setDeleteModalOpen(true);
                                                            setActiveDropdown(null);
                                                        }}
                                                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                        Delete User
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                        No users found matching your criteria
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination (Static for now) */}
                <div className="p-4 border-t border-gray-200 flex items-center justify-between">
                    <p className="text-sm text-gray-500">Showing <span className="font-medium">{filteredUsers.length}</span> results</p>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 border border-gray-200 rounded text-sm disabled:opacity-50" disabled>Previous</button>
                        <button className="px-3 py-1 border border-gray-200 rounded text-sm disabled:opacity-50" disabled>Next</button>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <UserSettingModal
                isOpen={settingModalOpen}
                onClose={() => setSettingModalOpen(false)}
                user={selectedUser}
                onUpdate={handleUpdateUser}
                onAdjustWallet={handleAdjustWallet}
            />

            <ConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleDeleteUser}
                title="Delete User Account"
                message={`Are you sure you want to delete ${selectedUser?.name}? This action cannot be undone and will remove all associated data.`}
                confirmText="Yes, Delete User"
                variant="danger"
                isLoading={actionLoading}
            />
        </div>
    )
}
