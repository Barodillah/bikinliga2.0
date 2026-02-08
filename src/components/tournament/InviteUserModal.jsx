import React, { useState, useEffect } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import SearchableSelect from '../ui/SearchableSelect'
import { UserPlus, Mail, Loader2, CheckCircle, Search } from 'lucide-react'
import { useToast } from '../../contexts/ToastContext'
import { authFetch } from '../../utils/api'

export default function InviteUserModal({ isOpen, onClose, tournamentId }) {
    const [selectedUser, setSelectedUser] = useState('')
    const [loading, setLoading] = useState(false)
    const [users, setUsers] = useState([])
    const [fetchingUsers, setFetchingUsers] = useState(false)
    const { success, error: showError } = useToast()

    useEffect(() => {
        if (isOpen) {
            fetchUsers()
        }
    }, [isOpen])

    const fetchUsers = async () => {
        setFetchingUsers(true)
        try {
            // Using admin endpoint for now as it returns all users
            // ideally we should have a public search endpoint
            const response = await fetch('/api/admin/users')
            const result = await response.json()
            if (result.success) {
                setUsers(result.data)
            }
        } catch (err) {
            console.error('Failed to fetch users:', err)
        } finally {
            setFetchingUsers(false)
        }
    }

    // Transform users to options for SearchableSelect
    const userOptions = users.map(user => ({
        value: user.username,
        label: `${user.name} (@${user.username})`,
        user: user
    }))

    const handleInvite = async () => {
        if (!selectedUser || !selectedUserData) return

        setLoading(true)

        try {
            const response = await authFetch(`/api/tournaments/${tournamentId}/invite`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ user_id: selectedUserData.id })
            })

            const result = await response.json()

            if (result.success) {
                success(`Undangan berhasil dikirim ke @${selectedUser}`)
                setSelectedUser('')
                onClose()
            } else {
                showError(result.message || 'Gagal mengirim undangan')
            }
        } catch (err) {
            console.error('Error inviting user:', err)
            showError('Terjadi kesalahan saat mengirim undangan')
        } finally {
            setLoading(false)
        }
    }

    const selectedUserData = users.find(u => u.username === selectedUser)

    const censorEmail = (email) => {
        if (!email) return ''
        const [name, domain] = email.split('@')
        if (!name || !domain) return email
        return `${name.substring(0, 2)}***@${domain}`
    }

    return (
        <React.Fragment>
            {isOpen && (
                <Modal isOpen={isOpen} onClose={onClose} title="Undang Peserta">
                    <div className="space-y-6">
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 flex items-start gap-3">
                            <UserPlus className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                            <div className="text-sm text-gray-300">
                                <p className="font-bold text-blue-400 mb-1">Undang Pengguna Terdaftar</p>
                                <p>Cari pengguna terdaftar untuk diundang ke turnamen ini. Mereka akan menerima notifikasi dan email undangan.</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-300">
                                Cari Pengguna (Username / Nama)
                            </label>
                            <SearchableSelect
                                options={userOptions}
                                value={selectedUser}
                                onChange={(e) => setSelectedUser(e.target.value)}
                                placeholder={fetchingUsers ? "Memuat data pengguna..." : "Ketik username atau nama..."}
                                disabled={fetchingUsers}
                            />
                        </div>

                        {selectedUserData && (
                            <div className="bg-white/5 border border-white/10 rounded-lg p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="flex items-center gap-4">
                                    <img
                                        src={selectedUserData.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUserData.username}`}
                                        alt={selectedUserData.name}
                                        className="w-12 h-12 rounded-full border-2 border-white/10 bg-white/10"
                                    />
                                    <div>
                                        <h4 className="font-bold text-white">{selectedUserData.name}</h4>
                                        <p className="text-sm text-neonGreen">@{selectedUserData.username}</p>
                                        <p className="text-xs text-gray-500 mt-1">{censorEmail(selectedUserData.email)}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                            <Button variant="ghost" onClick={onClose} disabled={loading}>
                                Batal
                            </Button>
                            <Button
                                onClick={handleInvite}
                                disabled={!selectedUser || loading}
                                className="bg-neonGreen text-black hover:bg-neonGreen/80"
                            >
                                {loading ? (
                                    <React.Fragment>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Mengirim...
                                    </React.Fragment>
                                ) : (
                                    <React.Fragment>
                                        <Mail className="w-4 h-4 mr-2" />
                                        Kirim Undangan
                                    </React.Fragment>
                                )}
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </React.Fragment>
    )
}
