import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Edit, Trash2, Search, Users } from 'lucide-react'
import Card, { CardHeader, CardContent } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'

const playersData = [
    { id: 1, name: 'Barcelona FC', playerName: 'Andi', contact: '081234567890', wins: 5, draws: 2, losses: 1 },
    { id: 2, name: 'Real Madrid', playerName: 'Budi', contact: '081234567891', wins: 4, draws: 3, losses: 1 },
    { id: 3, name: 'Manchester United', playerName: 'Candra', contact: '081234567892', wins: 4, draws: 2, losses: 2 },
    { id: 4, name: 'Arsenal', playerName: 'Dodi', contact: '081234567893', wins: 3, draws: 3, losses: 2 },
    { id: 5, name: 'Liverpool', playerName: 'Eko', contact: '081234567894', wins: 3, draws: 2, losses: 3 },
    { id: 6, name: 'Chelsea', playerName: 'Fajar', contact: '081234567895', wins: 2, draws: 4, losses: 2 },
    { id: 7, name: 'PSG', playerName: 'Gilang', contact: '081234567896', wins: 2, draws: 2, losses: 4 },
    { id: 8, name: 'Bayern Munich', playerName: 'Hadi', contact: '081234567897', wins: 1, draws: 2, losses: 5 },
]

export default function Players() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [searchQuery, setSearchQuery] = useState('')
    const [showAddModal, setShowAddModal] = useState(false)
    const [newPlayer, setNewPlayer] = useState({ name: '', playerName: '', contact: '' })

    const filteredPlayers = playersData.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.playerName.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleAddPlayer = () => {
        console.log('Adding player:', newPlayer)
        alert(`Pemain ditambahkan: ${newPlayer.name}`)
        setShowAddModal(false)
        setNewPlayer({ name: '', playerName: '', contact: '' })
    }

    return (
        <div className="space-y-6">
            <div>
                <button
                    onClick={() => navigate(`/dashboard/tournaments/${id}`)}
                    className="text-gray-400 hover:text-white flex items-center gap-2 mb-4 transition"
                >
                    <ArrowLeft className="w-4 h-4" /> Kembali ke turnamen
                </button>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-display font-bold">Daftar Pemain</h1>
                        <p className="text-gray-400 mt-1">Warkop Cup Season 5 • {playersData.length} Pemain</p>
                    </div>
                    <Button icon={Plus} onClick={() => setShowAddModal(true)}>Tambah Pemain</Button>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Input
                    placeholder="Cari pemain atau tim..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                />
                <Search className="w-5 h-5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            {/* Players Table */}
            <Card hover={false}>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">#</th>
                                <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">Tim</th>
                                <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">Nama Pemain</th>
                                <th className="text-left py-4 px-4 text-sm font-medium text-gray-400 hidden md:table-cell">Kontak</th>
                                <th className="text-center py-4 px-4 text-sm font-medium text-gray-400">W</th>
                                <th className="text-center py-4 px-4 text-sm font-medium text-gray-400">D</th>
                                <th className="text-center py-4 px-4 text-sm font-medium text-gray-400">L</th>
                                <th className="text-right py-4 px-4 text-sm font-medium text-gray-400">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPlayers.map((player, i) => (
                                <tr key={player.id} className="border-b border-white/5 hover:bg-white/5 transition">
                                    <td className="py-4 px-4">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-neonGreen/30 to-neonPink/30 flex items-center justify-center font-bold text-sm">
                                            {i + 1}
                                        </div>
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="font-medium">{player.name}</div>
                                    </td>
                                    <td className="py-4 px-4 text-gray-400">{player.playerName}</td>
                                    <td className="py-4 px-4 text-gray-500 text-sm hidden md:table-cell">{player.contact}</td>
                                    <td className="py-4 px-4 text-center">
                                        <span className="text-neonGreen font-bold">{player.wins}</span>
                                    </td>
                                    <td className="py-4 px-4 text-center">
                                        <span className="text-yellow-400 font-bold">{player.draws}</span>
                                    </td>
                                    <td className="py-4 px-4 text-center">
                                        <span className="text-red-400 font-bold">{player.losses}</span>
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="flex justify-end gap-2">
                                            <button className="p-2 rounded-lg hover:bg-white/10 transition text-gray-400 hover:text-white">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 rounded-lg hover:bg-red-500/20 transition text-gray-400 hover:text-red-400">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {filteredPlayers.length === 0 && (
                <div className="text-center py-12">
                    <Users className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                    <h3 className="font-display font-bold text-xl mb-2">Tidak ada pemain</h3>
                    <p className="text-gray-500 mb-6">Tambahkan pemain untuk memulai turnamen</p>
                    <Button icon={Plus} onClick={() => setShowAddModal(true)}>Tambah Pemain</Button>
                </div>
            )}

            {/* Add Player Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title="Tambah Pemain Baru"
            >
                <div className="space-y-4">
                    <Input
                        label="Nama Tim"
                        placeholder="contoh: Barcelona FC"
                        value={newPlayer.name}
                        onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
                    />
                    <Input
                        label="Nama Pemain"
                        placeholder="contoh: Andi"
                        value={newPlayer.playerName}
                        onChange={(e) => setNewPlayer({ ...newPlayer, playerName: e.target.value })}
                    />
                    <Input
                        label="Kontak (WhatsApp)"
                        placeholder="contoh: 081234567890"
                        value={newPlayer.contact}
                        onChange={(e) => setNewPlayer({ ...newPlayer, contact: e.target.value })}
                    />
                    <div className="flex gap-3 pt-4">
                        <Button variant="ghost" className="flex-1" onClick={() => setShowAddModal(false)}>
                            Batal
                        </Button>
                        <Button className="flex-1" onClick={handleAddPlayer}>
                            Simpan
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
