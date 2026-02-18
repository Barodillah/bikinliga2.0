
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'
import { Trophy, Users, Calendar, BarChart2, Settings, Share2, Download, ArrowLeft, Edit, Copy, Check, GitMerge, Grid3X3, UserPlus, Clock, CheckCircle, XCircle, CreditCard, TrendingUp, Activity, Info, Newspaper, Plus, Trash2, Gift, DollarSign, Percent, Save, Loader2, User, Phone, Shield, Sparkles, Medal, Crown, Target, ListFilter, MessageSquare, MessageCircle, Send, ChevronDown, UserCheck, ShieldCheck, Mail } from 'lucide-react'
import confetti from 'canvas-confetti'
import { motion } from 'framer-motion'
import Card, { CardContent, CardHeader } from '../../components/ui/Card'
import Modal from '../../components/ui/Modal'
import ConfirmationModal from '../../components/ui/ConfirmationModal'
import Button from '../../components/ui/Button'
import Input, { Textarea } from '../../components/ui/Input'
import StandingsTable from '../../components/tournament/StandingsTable'
import TopScorerList from '../../components/tournament/TopScorerList'
import TournamentStatistics from '../../components/tournament/TournamentStatistics'
import MatchCard from '../../components/tournament/MatchCard'
import Bracket from '../../components/tournament/Bracket'
import AdSlot from '../../components/ui/AdSlot'
import { useToast } from '../../contexts/ToastContext'
import { useAuth } from '../../contexts/AuthContext'
import SearchableSelect from '../../components/ui/SearchableSelect'
import UserBadge from '../../components/ui/UserBadge'
import AdaptiveLogo from '../../components/ui/AdaptiveLogo'
import ShareModal from '../../components/ui/ShareModal'
import InviteUserModal from '../../components/tournament/InviteUserModal'
import { exportStandingsToImage, exportBracketToImage, exportToImage, exportTopScorersToImage } from '../../utils/exportImage'

// Helper function for authenticated fetch
const authFetch = (url, options = {}) => {
    const token = localStorage.getItem('token')
    return fetch(url, {
        ...options,
        credentials: 'include',
        headers: {
            ...options.headers,
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
    })
}

// Helper to format date like "30 Jan 2026, 19:13"
const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, '0')
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const month = months[date.getMonth()]
    const year = date.getFullYear()
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${day} ${month} ${year}, ${hours}:${minutes}`
}

// Sample data - simulate different tournament types based on ID
const getTournamentData = (id) => {
    return null
}

// League options from eFootball DB API
const leagueOptions = [
    { value: '', label: 'Pilih Liga...' },
    { value: '全国都道府県対抗eスポーツ選手権 2024 SAGA', label: '全国都道府県対抗eスポーツ選手権 2024 SAGA' },
    { value: 'English League', label: 'English League' },
    { value: 'Lega Italia', label: 'Lega Italia' },
    { value: 'Spanish League', label: 'Spanish League' },
    { value: "Ligue 1 McDonald’s", label: "Ligue 1 McDonald's" },
    { value: 'VriendenLoterij Eredivisie', label: 'VriendenLoterij Eredivisie' },
    { value: 'Liga Portugal Betclic', label: 'Liga Portugal Betclic' },
    { value: 'European Cup', label: 'European Cup' },
    { value: 'English 2nd Division', label: 'English 2nd Division' },
    { value: 'Spanish 2nd Division', label: 'Spanish 2nd Division' },
    { value: 'Ligue 2 BKT', label: 'Ligue 2 BKT' },
    { value: 'Italian 2nd Division', label: 'Italian 2nd Division' },
    { value: 'Swiss League', label: 'Swiss League' },
    { value: 'Trendyol Süper Lig', label: 'Trendyol Süper Lig' },
    { value: 'Scottish Premiership', label: 'Scottish Premiership' },
    { value: 'Danish League', label: 'Danish League' },
    { value: 'Belgian League', label: 'Belgian League' },
    { value: 'AFC Champions League Elite™', label: 'AFC Champions League Elite™' },
    { value: 'AFC Asian Qualifiers™', label: 'AFC Asian Qualifiers™' },
    { value: 'MEIJI YASUDA J1 LEAGUE', label: 'MEIJI YASUDA J1 LEAGUE' },
    { value: 'MEIJI YASUDA J2 LEAGUE', label: 'MEIJI YASUDA J2 LEAGUE' },
    { value: 'BYD SEALION 6 LEAGUE 1', label: 'BYD SEALION 6 LEAGUE 1' },
    { value: 'Korean League', label: 'Korean League' },
    { value: 'AFC Champions League Two™', label: 'AFC Champions League Two™' },
    { value: 'Brazilian League', label: 'Brazilian League' },
    { value: 'Argentine League', label: 'Argentine League' },
    { value: 'American Cup', label: 'American Cup' },
    { value: 'Chilean League', label: 'Chilean League' },
    { value: 'Colombian League', label: 'Colombian League' },
    { value: 'Brazilian 2nd Division', label: 'Brazilian 2nd Division' },
    { value: 'CAF AFRICA CUP OF NATIONS 25', label: 'CAF AFRICA CUP OF NATIONS 25' },
    { value: 'American League', label: 'American League' },
]

// Sample draft players data
// Draft Players List Component
function DraftPlayerList({ players, tournamentId, navigate, onStatusUpdate, onEdit, onInvite, isPrivate }) {
    const [filter, setFilter] = useState('all')
    const [loadingStatus, setLoadingStatus] = useState({ playerId: null, action: null })
    const [reinviteModal, setReinviteModal] = useState({ isOpen: false, player: null })

    const filteredPlayers = filter === 'all'
        ? players
        : players.filter(p => p.status === filter)

    const getStatusBadge = (status) => {
        switch (status) {
            case 'approved':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-neonGreen/20 text-neonGreen">
                        <CheckCircle className="w-3 h-3" /> Approved
                    </span>
                )
            case 'rejected':
            case 'declined':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
                        <XCircle className="w-3 h-3" /> {status === 'declined' ? 'Declined' : 'Rejected'}
                    </span>
                )
            case 'pending':
            case 'queued':
            case 'invited':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                        <Mail className="w-3 h-3" /> Diundang
                    </span>
                )
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
                        <Clock className="w-3 h-3" /> Pending
                    </span>
                )
        }
    }

    const statusCounts = {
        all: players.length,
        invited: players.filter(p => p.status === 'invited').length,
        pending: players.filter(p => p.status === 'pending' || p.status === 'queued').length,
        approved: players.filter(p => p.status === 'approved').length,
        rejected: players.filter(p => p.status === 'rejected').length,
        declined: players.filter(p => p.status === 'declined').length,
    }

    return (
        <>
            <Card hover={false}>
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h3 className="font-display font-bold flex items-center gap-2">
                            <Users className="w-5 h-5 text-neonGreen" />
                            Daftar Pendaftar
                        </h3>
                        <p className="text-sm text-gray-400 mt-1">Kelola pemain yang mendaftar di turnamen ini</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <Button size="sm" onClick={() => navigate(`/dashboard/tournaments/${tournamentId}/players/add`)} className="w-full sm:w-auto justify-center">
                            <UserPlus className="w-4 h-4 mr-2" />
                            Tambah Pemain
                        </Button>
                        {isPrivate && (
                            <Button size="sm" variant="outline" onClick={onInvite} className="w-full sm:w-auto justify-center">
                                <Mail className="w-4 h-4 mr-2" />
                                Undang User
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Filter Tabs */}
                    <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-white/10">
                        {['all', ...(isPrivate ? ['invited'] : []), 'pending', 'approved', 'rejected', ...(isPrivate ? ['declined'] : [])].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${filter === status
                                    ? 'bg-neonGreen/20 text-neonGreen'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                {status === 'all' ? 'Semua' : status.charAt(0).toUpperCase() + status.slice(1)}
                                <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs bg-white/10">
                                    {statusCounts[status]}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Players List */}
                    {filteredPlayers.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>Belum ada pemain dengan status ini</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredPlayers.map((player) => (
                                <div key={player.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="flex items-center gap-4 w-full sm:w-auto">
                                        {player.logo_url ? (
                                            <img src={player.logo_url} alt={player.name} className="w-10 h-10 rounded-lg object-contain" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center text-blue-400 font-bold">
                                                {player.team_name?.charAt(0) || player.name?.charAt(0)}
                                            </div>
                                        )}
                                        <div>
                                            <h4 className="font-bold text-white">{player.team_name || 'No Team'}</h4>
                                            <div className="flex items-center gap-1">
                                                <p className="text-sm text-gray-400">{player.name}</p>
                                                {(player.tier || player.user?.tier) && (
                                                    <UserBadge
                                                        tier={player.tier || player.user?.tier}
                                                        size="sm"
                                                        className="scale-75 origin-left"
                                                    />
                                                )}
                                            </div>
                                            {(player.username || player.user?.username) && (
                                                <p className="text-xs text-neonGreen mt-0.5">@{player.username || player.user?.username}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
                                        <div className="text-right">
                                            {getStatusBadge(player.status)}
                                            <p className="text-xs text-gray-500 mt-2 hidden sm:block">{formatDate(player.created_at)}</p>
                                        </div>

                                        <div className="flex items-center gap-1 border-l border-white/10 pl-4 ml-2">
                                            {player.status !== 'invited' && player.status !== 'declined' && (
                                                <Button variant="ghost" size="sm" onClick={() => onEdit && onEdit(player)}>
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                            )}

                                            {/* Action Buttons for Pending */}
                                            {player.status === 'pending' && (
                                                <div className="flex gap-1">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="text-green-400 hover:text-green-300"
                                                        disabled={loadingStatus.playerId === player.id}
                                                        onClick={async () => {
                                                            if (onStatusUpdate) {
                                                                setLoadingStatus({ playerId: player.id, action: 'approved' })
                                                                try {
                                                                    await onStatusUpdate(player.id, 'approved')
                                                                } finally {
                                                                    setLoadingStatus({ playerId: null, action: null })
                                                                }
                                                            }
                                                        }}
                                                    >
                                                        {loadingStatus.playerId === player.id && loadingStatus.action === 'approved' ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <Check className="w-4 h-4" />
                                                        )}
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="text-red-400 hover:text-red-300"
                                                        disabled={loadingStatus.playerId === player.id}
                                                        onClick={async () => {
                                                            if (onStatusUpdate) {
                                                                setLoadingStatus({ playerId: player.id, action: 'rejected' })
                                                                try {
                                                                    await onStatusUpdate(player.id, 'rejected')
                                                                } finally {
                                                                    setLoadingStatus({ playerId: null, action: null })
                                                                }
                                                            }
                                                        }}
                                                    >
                                                        {loadingStatus.playerId === player.id && loadingStatus.action === 'rejected' ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <XCircle className="w-4 h-4" />
                                                        )}
                                                    </Button>
                                                </div>
                                            )}

                                            {/* Reinvite Button for Declined */}
                                            {player.status === 'declined' && (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="text-blue-400 hover:text-blue-300"
                                                    disabled={loadingStatus.playerId === player.id}
                                                    onClick={() => setReinviteModal({ isOpen: true, player })}
                                                >
                                                    {loadingStatus.playerId === player.id && loadingStatus.action === 'reinvite' ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <Mail className="w-4 h-4" />
                                                    )}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Reinvite Confirmation Modal - Outside Card to prevent clipping */}
            <ConfirmationModal
                isOpen={reinviteModal.isOpen}
                onClose={() => setReinviteModal({ isOpen: false, player: null })}
                onConfirm={async () => {
                    if (onStatusUpdate && reinviteModal.player) {
                        setLoadingStatus({ playerId: reinviteModal.player.id, action: 'reinvite' })
                        try {
                            await onStatusUpdate(reinviteModal.player.id, 'invited')
                        } finally {
                            setLoadingStatus({ playerId: null, action: null })
                            setReinviteModal({ isOpen: false, player: null })
                        }
                    }
                }}
                title="Undang Ulang Peserta"
                message={`Apakah Anda yakin ingin mengundang ulang ${reinviteModal.player?.name || 'peserta ini'}? Mereka akan menerima notifikasi undangan baru.`}
                confirmText="Undang Ulang"
                variant="primary"
                isLoading={loadingStatus.action === 'reinvite'}
            />
        </>
    )
}

// Edit Participant Modal
function EditParticipantModal({ isOpen, onClose, participant, onSave, onDelete, isDeleting }) {
    const [formData, setFormData] = useState({
        name: '',
        team_name: '',
        phone: '',
        status: '',
        logo_url: '',
        league: '' // Add league for filtering
    })
    const [teams, setTeams] = useState([])
    const [loadingTeams, setLoadingTeams] = useState(false)
    const [loading, setLoading] = useState(false)

    // Initialize data
    React.useEffect(() => {
        if (participant) {
            // Try to guess league if not stored, or just leave empty
            // Ideally we should store league in participant stats, but for now we start empty or parse from known data if possible
            const stats = participant.stats ? (typeof participant.stats === 'string' ? JSON.parse(participant.stats) : participant.stats) : {}

            setFormData({
                name: participant.name || '',
                team_name: participant.team_name || '',
                phone: participant.phone || '',
                status: participant.status || 'pending',
                logo_url: participant.logo_url || '',
                league: stats.league || ''
            })
        }
    }, [participant])

    // Fetch teams when league changes (copied logic from AddPlayer)
    React.useEffect(() => {
        if (!formData.league) {
            setTeams([])
            return
        }

        const fetchTeams = async () => {
            setLoadingTeams(true)
            setTeams([])

            try {
                const response = await authFetch('/api/teams')
                const data = await response.json()

                if (data?.data) {
                    const filteredTeams = []

                    data.data.forEach(entry => {
                        entry.entries?.forEach(teamEntry => {
                            const teamID = teamEntry.team?.pes_id
                            const teamName = teamEntry.team?.english_name

                            teamEntry.team?.competitions?.forEach(competition => {
                                const ligaName = competition.competition?.competition_name

                                if (ligaName === formData.league) {
                                    const formattedTeamID = String(teamID).padStart(6, '0')
                                    // Default to _r_w_l (regular white logo?) which is most reliable
                                    const logoUrl = `https://api.efootballdb.com/assets/2022/clubs/e_${formattedTeamID}_r_w_l.png.webp`

                                    filteredTeams.push({
                                        id: teamID,
                                        name: teamName,
                                        logo: logoUrl,
                                        formattedId: formattedTeamID
                                    })
                                }
                            })
                        })
                    })

                    // Remove duplicates
                    const uniqueTeams = filteredTeams.filter((team, index, self) =>
                        index === self.findIndex(t => t.id === team.id)
                    )

                    setTeams(uniqueTeams)
                }
            } catch (err) {
                console.error('Error fetching teams:', err)
            } finally {
                setLoadingTeams(false)
            }
        }

        fetchTeams()
    }, [formData.league])

    const handleTeamChange = (e) => {
        const selectedTeamId = e.target.value
        const selectedTeam = teams.find(t => String(t.id) === selectedTeamId)

        if (selectedTeam) {
            setFormData(prev => ({
                ...prev,
                team_name: selectedTeam.name, // Update team name
                logo_url: selectedTeam.logo   // Update logo
            }))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        // Only send necessary updates
        const updateData = {
            name: formData.name,
            team_name: formData.team_name,
            phone: formData.phone,
            status: formData.status,
            logo_url: formData.logo_url
        }
        await onSave(participant.id, updateData)
        setLoading(false)
        onClose()
    }

    // Toggle logic
    const handleToggleStatus = () => {
        const newStatus = formData.status === 'approved' ? 'rejected' : 'approved'
        setFormData(prev => ({ ...prev, status: newStatus }))
    }

    if (!isOpen) return null

    // Prepare team options
    const teamOptions = [
        { value: '', label: loadingTeams ? 'Memuat tim...' : 'Pilih Tim (Opsional)...' },
        ...teams.map(team => ({
            value: String(team.id),
            label: team.name
        }))
    ]

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Peserta">
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Status Toggle Banner */}
                <div className={`p-3 rounded-lg flex items-center justify-between ${formData.status === 'approved' ? 'bg-neonGreen/10 border border-neonGreen/30' :
                    formData.status === 'rejected' ? 'bg-red-500/10 border border-red-500/30' :
                        'bg-yellow-500/10 border border-yellow-500/30'
                    }`}>
                    <div className="flex items-center gap-2">
                        {formData.status === 'approved' && <CheckCircle className="w-5 h-5 text-neonGreen" />}
                        {formData.status === 'rejected' && <XCircle className="w-5 h-5 text-red-500" />}
                        {formData.status === 'pending' && <Clock className="w-5 h-5 text-yellow-500" />}

                        <span className={`font-medium capitalize ${formData.status === 'approved' ? 'text-neonGreen' :
                            formData.status === 'rejected' ? 'text-red-500' :
                                'text-yellow-500'
                            }`}>Status: {formData.status}</span>
                    </div>

                    {/* Toggle Button */}
                    <Button
                        type="button"
                        size="sm"
                        variant={formData.status === 'approved' ? 'danger' : 'primary'}
                        className={formData.status === 'approved' ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-neonGreen/20 text-neonGreen hover:bg-neonGreen/30'}
                        onClick={handleToggleStatus}
                    >
                        {formData.status === 'approved' ? 'Reject' : 'Approve'}
                    </Button>
                </div>

                {/* Section Keterangan for Registered Users */}
                {participant?.user_id && (
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 flex items-start gap-3">
                        <UserCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                        <div className="text-xs text-gray-300 space-y-1">
                            <p className="font-bold text-blue-400">Akun Terverifikasi</p>
                            <p>Peserta ini mendaftar menggunakan akun <strong>{participant.name}</strong>.</p>
                            {(participant.phone || participant.user?.phone) && (
                                <div className="mt-2 p-2 bg-black/20 rounded border border-white/5 flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-neonGreen" />
                                    <span className="text-sm font-mono text-neonGreen">{participant.phone || participant.user?.phone}</span>
                                </div>
                            )}
                            <p className="mt-2 text-xs opacity-70">Nama dan kontak dikelola langsung oleh pengguna dan tidak dapat diubah oleh admin.</p>
                        </div>
                    </div>
                )}

                {!participant?.user_id && (
                    <Input
                        label="Nama Pemain"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Nama Pemain"
                    />
                )}

                {/* League & Team Selection for editing Logo/Team */}
                <div className="space-y-3 pt-2 border-t border-white/5">
                    <label className="block text-xs font-semibold text-gray-400 uppercase">Update Tim & Logo (Opsional)</label>

                    <SearchableSelect
                        options={leagueOptions}
                        value={formData.league}
                        onChange={(e) => setFormData(prev => ({ ...prev, league: e.target.value }))}
                        placeholder="Pilih Liga untuk cari tim..."
                    />

                    <SearchableSelect
                        options={teamOptions}
                        value="" // Always reset select to empty to allow re-selection
                        onChange={handleTeamChange}
                        placeholder={loadingTeams ? 'Memuat...' : 'Pilih Tim untuk update...'}
                        disabled={!formData.league || loadingTeams}
                    />
                </div>

                <Input
                    label="Nama Tim (Saat Ini)"
                    value={formData.team_name}
                    onChange={(e) => setFormData({ ...formData, team_name: e.target.value })}
                    placeholder="Nama Tim"
                />

                {formData.logo_url && (
                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                        <img
                            src={formData.logo_url}
                            alt="Team Logo"
                            className="w-10 h-10 object-contain"
                            onError={(e) => {
                                // Fallback logic same as AddPlayer
                                const currentSrc = e.target.src
                                let newUrl = ''

                                if (currentSrc.includes('_r_w_l')) {
                                    newUrl = currentSrc.replace('_r_w_l', '_f_l')
                                } else if (currentSrc.includes('_f_l')) {
                                    newUrl = currentSrc.replace('_f_l', '_r_l')
                                }

                                if (newUrl) {
                                    e.target.src = newUrl
                                    // IMPORTANT: Update state so the valid URL is saved!
                                    setFormData(prev => ({ ...prev, logo_url: newUrl }))
                                }
                            }}
                        />
                        <span className="text-sm text-gray-400">Logo Preview</span>
                    </div>
                )}

                {!participant?.user_id && (
                    <Input
                        label="Kontak / WhatsApp"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="08..."
                    />
                )}

                <div className="flex gap-3 pt-4 border-t border-white/10 mt-6">
                    <Button
                        type="button"
                        variant="ghost"
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 mr-auto"
                        onClick={() => onDelete(participant.id)}
                        disabled={isDeleting || loading}
                    >
                        {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                        Hapus Peserta
                    </Button>
                    <Button type="button" variant="ghost" onClick={onClose} disabled={loading || isDeleting}>
                        Batal
                    </Button>
                    <Button type="submit" disabled={loading || isDeleting}>
                        {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </Button>
                </div>
            </form>
        </Modal>
    )
}

// Group Stage Component
function GroupStage({ groups }) {
    return (
        <div className="grid md:grid-cols-2 gap-6">
            {groups.map((group) => (
                <Card key={group.name} hover={false} className="min-w-0">
                    <CardHeader className="py-3">
                        <h3 className="font-display font-bold text-neonGreen">{group.name}</h3>
                    </CardHeader>
                    <CardContent className="p-0 overflow-x-auto scroll-container">
                        <table className="w-full text-sm" style={{ minWidth: '500px' }}>
                            <thead>
                                <tr className="border-b border-white/10 text-gray-400">
                                    <th className="py-2 px-1 text-center w-8 sticky left-0 z-10 bg-[#0a0a0a]">#</th>
                                    <th className="py-2 px-1 text-left sticky left-8 z-10 bg-[#0a0a0a] border-r border-white/5 shadow-xl w-12 md:w-32">Tim</th>
                                    <th className="py-2 px-3 text-center">P</th>
                                    <th className="py-2 px-3 text-center">W</th>
                                    <th className="py-2 px-3 text-center">D</th>
                                    <th className="py-2 px-3 text-center">L</th>
                                    <th className="py-2 px-3 text-center">GD</th>
                                    <th className="py-2 px-3 text-center">Pts</th>
                                </tr>
                            </thead>
                            <tbody>
                                {group.teams.map((team, i) => (
                                    <tr key={team.name} className={`border-b border-white/5 ${i < 2 ? 'bg-neonGreen/5' : ''}`}>
                                        <td className="py-2 px-1 sticky left-0 z-10 bg-[#0a0a0a]">
                                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${i < 2 ? 'bg-neonGreen text-black' : 'bg-white/10'
                                                }`}>
                                                {i + 1}
                                            </div>
                                        </td>
                                        <td className="py-2 px-1 font-medium sticky left-8 z-10 bg-[#0a0a0a] border-r border-white/5 shadow-xl w-12 md:w-32">
                                            <div className="flex items-center gap-2">
                                                {team.logo ? (
                                                    <img src={team.logo} alt={team.name} className="w-6 h-6 rounded-lg object-cover flex-shrink-0" />
                                                ) : (
                                                    <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center text-[8px] font-bold flex-shrink-0">
                                                        {team.name?.substring(0, 2).toUpperCase()}
                                                    </div>
                                                )}
                                                <span className="whitespace-normal leading-tight text-[10px] md:text-sm break-words">{team.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-2 px-3 text-center text-gray-400">{team.played}</td>
                                        <td className="py-2 px-3 text-center text-neonGreen">{team.won}</td>
                                        <td className="py-2 px-3 text-center text-yellow-400">{team.drawn}</td>
                                        <td className="py-2 px-3 text-center text-red-400">{team.lost}</td>
                                        <td className="py-2 px-3 text-center">
                                            <span className={team.gd > 0 ? 'text-neonGreen' : team.gd < 0 ? 'text-red-400' : ''}>
                                                {team.gd > 0 ? '+' : ''}{team.gd}
                                            </span>
                                        </td>
                                        <td className="py-2 px-3 text-center font-display font-bold">{team.pts}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="p-2 text-xs text-gray-500 flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-neonGreen/30"></div>
                            Lolos ke Knockout Stage
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

// Sample group stage data
const groupsData = [
    {
        name: 'Group A',
        teams: [
            { name: 'Barcelona', played: 3, won: 3, drawn: 0, lost: 0, gd: 7, pts: 9 },
            { name: 'Arsenal', played: 3, won: 2, drawn: 0, lost: 1, gd: 2, pts: 6 },
            { name: 'PSG', played: 3, won: 1, drawn: 0, lost: 2, gd: -3, pts: 3 },
            { name: 'Ajax', played: 3, won: 0, drawn: 0, lost: 3, gd: -6, pts: 0 },
        ]
    },
    {
        name: 'Group B',
        teams: [
            { name: 'Real Madrid', played: 3, won: 2, drawn: 1, lost: 0, gd: 5, pts: 7 },
            { name: 'Liverpool', played: 3, won: 2, drawn: 0, lost: 1, gd: 3, pts: 6 },
            { name: 'Juventus', played: 3, won: 1, drawn: 0, lost: 2, gd: -2, pts: 3 },
            { name: 'Porto', played: 3, won: 0, drawn: 1, lost: 2, gd: -6, pts: 1 },
        ]
    },
    {
        name: 'Group C',
        teams: [
            { name: 'Man United', played: 3, won: 2, drawn: 1, lost: 0, gd: 4, pts: 7 },
            { name: 'Bayern', played: 3, won: 2, drawn: 1, lost: 0, gd: 3, pts: 7 },
            { name: 'Inter', played: 3, won: 1, drawn: 0, lost: 2, gd: -1, pts: 3 },
            { name: 'Benfica', played: 3, won: 0, drawn: 0, lost: 3, gd: -6, pts: 0 },
        ]
    },
    {
        name: 'Group D',
        teams: [
            { name: 'Man City', played: 3, won: 3, drawn: 0, lost: 0, gd: 8, pts: 9 },
            { name: 'Chelsea', played: 3, won: 1, drawn: 1, lost: 1, gd: 1, pts: 4 },
            { name: 'Dortmund', played: 3, won: 1, drawn: 1, lost: 1, gd: 0, pts: 4 },
            { name: 'Napoli', played: 3, won: 0, drawn: 0, lost: 3, gd: -9, pts: 0 },
        ]
    }
]

// Sample knockout bracket data
const knockoutRounds = [
    {
        name: 'Quarter Finals',
        matches: [
            { id: 1, home: 'Barcelona', away: 'Liverpool', homeScore: 3, awayScore: 1, homeWin: true },
            { id: 2, home: 'Real Madrid', away: 'Arsenal', homeScore: 2, awayScore: 2, pen: '4-3', homeWin: true },
            { id: 3, home: 'Man United', away: 'Man City', homeScore: 1, awayScore: 2, awayWin: true },
            { id: 4, home: 'Bayern', away: 'Chelsea', homeScore: 3, awayScore: 0, homeWin: true },
        ]
    },
    {
        name: 'Semi Finals',
        matches: [
            { id: 5, home: 'Barcelona', away: 'Real Madrid', homeScore: 2, awayScore: 1, homeWin: true },
            { id: 6, home: 'Man City', away: 'Bayern', homeScore: null, awayScore: null },
        ]
    },
    {
        name: 'Final',
        matches: [
            { id: 7, home: 'Barcelona', away: null, homeScore: null, awayScore: null },
        ]
    },
]

// Helper to duplicate players for seamless loop
const duplicatePlayers = (players) => {
    if (players.length < 10) {
        return [...players, ...players, ...players, ...players] // Repeat more for small lists
    }
    return [...players, ...players]
}

function PlayerCarousel({ players }) {
    const approvedPlayers = players.filter(p => p.status === 'approved')

    if (approvedPlayers.length === 0) return null

    const loopedPlayers = duplicatePlayers(approvedPlayers)
    const duration = Math.max(20, approvedPlayers.length * 3)

    return (
        <div className="w-full overflow-hidden bg-black/20 border-b border-white/5 py-3 mb-6 relative group">
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-cardBg to-transparent z-10 pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-cardBg to-transparent z-10 pointer-events-none"></div>

            <style>
                {`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    animation: marquee ${duration}s linear infinite;
                }
                .animate-marquee:hover {
                    animation-play-state: paused;
                }
                `}
            </style>

            <div className="flex gap-4 w-max animate-marquee pl-4">
                {loopedPlayers.map((player, idx) => (
                    <motion.div
                        key={`${player.id}-${idx}`}
                        className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/10 flex-shrink-0 min-w-[200px] cursor-pointer"
                        whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                        {player.logo_url ? (
                            <img src={player.logo_url} alt={player.name} className="w-8 h-8 rounded-full object-contain bg-white/5 p-0.5" />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center text-blue-400 font-bold text-xs">
                                {player.team_name?.charAt(0) || player.name?.charAt(0)}
                            </div>
                        )}
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-white leading-tight">{player.team_name || 'No Team'}</span>
                            <span className="text-[10px] text-gray-400 leading-tight">{player.name}</span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}

// Helper functions omitted for brevity

export default function TournamentDetail() {
    const { id } = useParams() // This is now a slug or id
    const navigate = useNavigate()
    const location = useLocation()
    const { user } = useAuth()
    const [tournamentData, setTournamentData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)


    const isOrganizer = user && tournamentData && user.id === tournamentData.organizer_id
    const isDraft = tournamentData?.status === 'draft'
    const { success: showSuccess, error: showError, warning: showWarning } = useToast()

    // Core Content State
    const [activeTab, setActiveTab] = useState('overview')
    const [copied, setCopied] = useState(false)
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
    const [isShareModalOpen, setIsShareModalOpen] = useState(false)
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)

    // Data States
    const [matches, setMatches] = useState([])
    const [matchesLoading, setMatchesLoading] = useState(false)
    const [standings, setStandings] = useState([])
    const [topScorers, setTopScorers] = useState([])
    const [statistics, setStatistics] = useState(null)
    const [statisticsLoading, setStatisticsLoading] = useState(false)
    const [winnerData, setWinnerData] = useState(null)

    // Export Image Refs
    const standingsRef = useRef(null)
    const bracketRef = useRef(null)
    const topScorersRef = useRef(null)
    const fixturesRefs = useRef({})
    const [exportLoading, setExportLoading] = useState(null) // 'standings' | 'bracket' | 'round_X' | null

    // Participant Management State
    const [editingParticipant, setEditingParticipant] = useState(null)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isDeletingParticipant, setIsDeletingParticipant] = useState(false)
    const [isCompleting, setIsCompleting] = useState(false)
    const [deleteConfirmation, setDeleteConfirmation] = useState({
        isOpen: false,
        participantId: null,
        participantName: ''
    })

    // Prize Management State
    const [isSaving, setIsSaving] = useState(false)
    const [isPrizeLoading, setIsPrizeLoading] = useState(false)
    const [isEditingPrizes, setIsEditingPrizes] = useState(false)
    const [prizeSettings, setPrizeSettings] = useState({
        enabled: false,
        sources: {
            registrationFee: 50000,
            playerCount: 0,
            sponsor: 1000000,
            adminFee: 200000
        },
        recipients: [
            { id: 1, label: 'Juara 1', percentage: 50, amount: 0 },
            { id: 2, label: 'Juara 2', percentage: 25, amount: 0 },
            { id: 3, label: 'Juara 3', percentage: 15, amount: 0 },
            { id: 4, label: 'Top Scorer', percentage: 10, amount: 0 },
        ],
        totalPrizePool: 0
    })

    // News & Social State
    const [isNewsModalOpen, setIsNewsModalOpen] = useState(false)
    const [newsList, setNewsList] = useState([])
    const [isNewsLoading, setIsNewsLoading] = useState(false)
    const [currentNewsIdForComments, setCurrentNewsIdForComments] = useState(null)
    const [commentsMap, setCommentsMap] = useState({})

    const isKnockout = tournamentData?.type === 'knockout'
    const isGroupKO = tournamentData?.type === 'group' || tournamentData?.type === 'group_knockout'
    const isLeague = tournamentData?.type === 'league'

    // Logic to check if 3rd place match can be generated
    const canGenerate3rdPlace = useMemo(() => {
        if (!tournamentData || (!isKnockout && !isGroupKO)) return false;
        if (tournamentData.status === 'completed') return false;

        const koMatches = isGroupKO
            ? matches.filter(m => {
                try {
                    const d = typeof m.details === 'string' ? JSON.parse(m.details) : m.details || {};
                    return d.stage === 'knockout';
                } catch (e) { return false; }
            })
            : matches;

        if (koMatches.length === 0) return false;

        // Check if 3rd place already exists
        const exists = koMatches.some(m => {
            try {
                const d = typeof m.details === 'string' ? JSON.parse(m.details) : m.details || {};
                return d.is3rdPlace === true;
            } catch (e) { return false; }
        });
        if (exists) return false;

        // Find Semi-Final matches (maxRound - 1)
        const maxRound = Math.max(...koMatches.map(m => m.round));
        const sfRound = maxRound - 1;
        if (sfRound < 1) return false;

        const sfMatches = koMatches.filter(m => m.round === sfRound);
        if (sfMatches.length === 0) return false;

        // Check if SF matches are completed
        const sfCompleted = sfMatches.every(m => m.status === 'completed');

        return sfCompleted;
    }, [isKnockout, isGroupKO, tournamentData?.status, matches]);

    // Auto-scroll to scheduled matches when opening fixtures tab
    useEffect(() => {
        if (activeTab === 'fixtures' && matches.length > 0) {
            // Find the first match that is scheduled
            const scheduledMatch = matches.find(m => m.status === 'scheduled');

            if (scheduledMatch) {
                const roundKey = scheduledMatch.round;
                // Small delay to ensure rendering is complete
                setTimeout(() => {
                    const element = fixturesRefs.current[roundKey];
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }, 300);
            }
        }
    }, [activeTab, matches]);

    const isReadyForThirdPlace = canGenerate3rdPlace; // Simplified: exists check is already inside canGenerate3rdPlace logic


    const [newComment, setNewComment] = useState('')
    const [openThreadNewsId, setOpenThreadNewsId] = useState(null)
    const [newNews, setNewNews] = useState({
        title: '',
        content: '',
        is_welcome: false,
        contact_info: '',
        group_link: '',
        open_thread: false
    })
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        newsId: null
    })

    // Competition Logic State
    const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false)
    const [is3rdPlaceModalOpen, setIs3rdPlaceModalOpen] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)
    const [generationStep, setGenerationStep] = useState('')
    const [shufflingTeams, setShufflingTeams] = useState({
        home: { name: '???', logo: null },
        away: { name: '???', logo: null }
    })
    const [filterStatus, setFilterStatus] = useState('all')

    // LOGIC HANDLERS & HELPERS
    const calculatePrizePool = () => {
        const { registrationFee, playerCount, sponsor, adminFee } = prizeSettings.sources
        const total = (registrationFee * playerCount) + Number(sponsor) - Number(adminFee)
        return Math.max(0, total)
    }

    const handleSourceChange = (field, value) => {
        setPrizeSettings(prev => ({
            ...prev,
            sources: {
                ...prev.sources,
                [field]: Number(value)
            }
        }))
    }

    const handleRecipientChange = (id, field, value) => {
        setPrizeSettings(prev => {
            const updatedRecipients = prev.recipients.map(r =>
                r.id === id ? { ...r, [field]: field === 'label' ? value : Number(value) } : r
            )
            return { ...prev, recipients: updatedRecipients }
        })
    }

    const addRecipient = () => {
        const newId = Math.max(...prizeSettings.recipients.map(r => r.id), 0) + 1
        setPrizeSettings(prev => ({
            ...prev,
            recipients: [...prev.recipients, { id: newId, label: 'Pemenang Baru', percentage: 0, amount: 0 }]
        }))
    }

    const removeRecipient = (id) => {
        setPrizeSettings(prev => ({
            ...prev,
            recipients: prev.recipients.filter(r => r.id !== id)
        }))
    }

    const getAutomaticWinner = (recipient) => {
        const label = (recipient.label || '').toLowerCase();

        // Top Scorer Logic
        if (label.includes('top scorer') || label.includes('pencetak gol')) {
            const scorer = topScorers?.[0] || statistics?.scorers?.[0];
            if (scorer) return { name: scorer.name, logo: null, sub: `${scorer.goals} Gol` };
            return null;
        }

        // League Logic
        if (isLeague && standings && standings.length > 0) {
            // Standings are usually already sorted by the backend or processedGroups
            // but let's be sure or use processedGroups which are sorted
            const allTeams = standings.sort((a, b) => {
                if (b.points !== a.points) return b.points - a.points;
                return b.goal_difference - a.goal_difference;
            });

            if (label.includes('1')) return { name: allTeams[0]?.team_name || allTeams[0]?.participant_name, logo: allTeams[0]?.team_logo };
            if (label.includes('2')) return { name: allTeams[1]?.team_name || allTeams[1]?.participant_name, logo: allTeams[1]?.team_logo };
            if (label.includes('3')) return { name: allTeams[2]?.team_name || allTeams[2]?.participant_name, logo: allTeams[2]?.team_logo };
        }

        // Knockout Logic
        if ((isKnockout || isGroupKO) && matches && matches.length > 0) {
            // Filter matches based on stage
            const bracketMatches = matches.filter(m => {
                try {
                    const d = typeof m.details === 'string' ? JSON.parse(m.details) : m.details || {};
                    return isGroupKO ? d.stage === 'knockout' : true;
                } catch (e) { return false; }
            });

            const maxRound = Math.max(...bracketMatches.map(m => m.round), 0);

            // Find Final match (the one that is NOT a 3rd place match in the max round)
            const finalMatch = bracketMatches.find(m => {
                try {
                    const d = typeof m.details === 'string' ? JSON.parse(m.details) : m.details || {};
                    return m.round === maxRound && !d.is3rdPlace;
                } catch (e) { return false; }
            });

            // Find 3rd Place match
            const thirdPlaceMatch = bracketMatches.find(m => {
                try {
                    const d = typeof m.details === 'string' ? JSON.parse(m.details) : m.details || {};
                    return d.is3rdPlace;
                } catch (e) { return false; }
            });

            if (finalMatch) {
                const fm = finalMatch;
                const homeWin = fm.home_score > fm.away_score || (fm.home_score === fm.away_score && (fm.home_penalty_score || 0) > (fm.away_penalty_score || 0));
                const awayWin = fm.away_score > fm.home_score || (fm.home_score === fm.away_score && (fm.away_penalty_score || 0) > (fm.home_penalty_score || 0));

                if (label.includes('1')) {
                    if (homeWin) return { name: fm.home_team_name || fm.home_player_name, logo: fm.home_logo };
                    if (awayWin) return { name: fm.away_team_name || fm.away_player_name, logo: fm.away_logo };
                }
                if (label.includes('2')) {
                    if (homeWin) return { name: fm.away_team_name || fm.away_player_name, logo: fm.away_logo };
                    if (awayWin) return { name: fm.home_team_name || fm.home_player_name, logo: fm.home_logo };
                }
            }

            if (thirdPlaceMatch && label.includes('3')) {
                const tm = thirdPlaceMatch;
                const homeWin = tm.home_score > tm.away_score || (tm.home_score === tm.away_score && (tm.home_penalty_score || 0) > (tm.away_penalty_score || 0));
                const awayWin = tm.away_score > tm.home_score || (tm.home_score === tm.away_score && (tm.away_penalty_score || 0) > (tm.home_penalty_score || 0));

                if (homeWin) return { name: tm.home_team_name || tm.home_player_name, logo: tm.home_logo };
                if (awayWin) return { name: tm.away_team_name || tm.away_player_name, logo: tm.away_logo };
            }
        }

        return null;
    };

    async function handleSavePrizes() {
        setIsSaving(true)
        try {
            const payload = {
                enabled: prizeSettings.enabled,
                totalPool: prizeSettings.totalPrizePool,
                sources: prizeSettings.sources,
                recipients: prizeSettings.recipients.map(r => ({
                    title: r.label,
                    percentage: r.percentage,
                    amount: r.amount,
                    isManual: r.isManual,
                    participantId: r.participantId,
                    playerId: r.playerId
                }))
            }

            const response = await authFetch(`/api/tournaments/${id}/prizes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            const data = await response.json()

            if (data.success) {
                showSuccess('Pengaturan hadiah berhasil disimpan')
                setIsEditingPrizes(false)
            } else {
                showError(data.message || 'Gagal menyimpan pengaturan hadiah')
            }
        } catch (err) {
            console.error('Save prizes error:', err)
            showError('Terjadi kesalahan saat menyimpan data')
        } finally {
            setIsSaving(false)
        }
    }

    function handleGeneratePrizes() {
        const totalPool = calculatePrizePool()
        const updatedRecipients = prizeSettings.recipients.map(recipient => ({
            ...recipient,
            amount: (totalPool * recipient.percentage) / 100
        }))

        setPrizeSettings(prev => ({
            ...prev,
            totalPrizePool: totalPool,
            recipients: updatedRecipients
        }))
    }



    // Fetch Prizes when tab is active
    React.useEffect(() => {
        if (activeTab === 'prize' && id) {
            const fetchPrizes = async () => {
                setIsPrizeLoading(true)
                try {
                    const response = await authFetch(`/api/tournaments/${id}/prizes`)
                    const data = await response.json()
                    if (data.success && data.data && data.data.id) {
                        const { enabled, totalPool, sources, recipients } = data.data;
                        setIsEditingPrizes(false)
                        setPrizeSettings({
                            enabled: enabled || false,
                            sources: {
                                registrationFee: sources.registrationFee || 0,
                                playerCount: sources.playerCount || (tournamentData ? tournamentData.players : 0),
                                sponsor: sources.sponsor || 0,
                                adminFee: sources.adminFee || 0
                            },
                            recipients: recipients.length > 0 ? recipients.map(r => ({
                                id: r.id,
                                label: r.title,
                                percentage: r.percentage,
                                amount: r.amount,
                                isManual: r.isManual,
                                participantId: r.participantId,
                                playerId: r.playerId
                            })) : [
                                { id: 1, label: 'Juara 1', percentage: 50, amount: 0 },
                                { id: 2, label: 'Juara 2', percentage: 25, amount: 0 },
                                { id: 3, label: 'Juara 3', percentage: 15, amount: 0 },
                                { id: 4, label: 'Top Scorer', percentage: 10, amount: 0 },
                            ],
                            totalPrizePool: totalPool || 0
                        })
                    }
                } catch (err) {
                    console.error('Failed to fetch prizes:', err)
                } finally {
                    setIsPrizeLoading(false)
                }
            }
            fetchPrizes()
        }
    }, [activeTab, id, tournamentData])

    // Auto-calculate prizes when sources or percentages change
    React.useEffect(() => {
        const totalPool = calculatePrizePool()
        const updatedRecipients = prizeSettings.recipients.map(recipient => ({
            ...recipient,
            amount: recipient.isManual ? recipient.amount : (totalPool * recipient.percentage) / 100
        }))

        // Check if anything actually changed (pool or any recipient amount)
        const poolChanged = totalPool !== prizeSettings.totalPrizePool
        const recipientsChanged = JSON.stringify(updatedRecipients) !== JSON.stringify(prizeSettings.recipients)

        if (poolChanged || recipientsChanged) {
            setPrizeSettings(prev => ({
                ...prev,
                totalPrizePool: totalPool,
                recipients: updatedRecipients
            }))
        }
    }, [prizeSettings.sources, JSON.stringify(prizeSettings.recipients.map(r => ({ percentage: r.percentage, label: r.label })))])

    // Update prize settings when tournament data loads
    React.useEffect(() => {
        if (tournamentData) {
            setPrizeSettings(prev => ({
                ...prev,
                sources: {
                    ...prev.sources,
                    playerCount: tournamentData.players || 0
                }
            }))
        }
    }, [tournamentData])


    // Process Standings into Groups (Moved up to avoid conditional hook call error)
    const processedGroups = React.useMemo(() => {
        if (!standings || standings.length === 0) return [];

        // Group by group_name
        const groups = {};
        standings.forEach(s => {
            const gName = s.group_name || 'Unassigned';
            if (!groups[gName]) groups[gName] = [];
            groups[gName].push({
                name: s.team_name || s.participant_name || 'Team',
                played: s.played,
                won: s.won,
                drawn: s.drawn,
                lost: s.lost,
                gd: s.goal_difference,
                pts: s.points,
                logo: s.team_logo
            });
        });

        // Convert to array and sort
        return Object.entries(groups)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([name, teams]) => ({ name, teams }));
    }, [standings]);

    const handleEditParticipant = (participant) => {
        setEditingParticipant(participant)
        setIsEditModalOpen(true)
    }

    const handleRequestDelete = (participantId) => {
        // Find participant name for better UX
        const pName = tournamentData.participants.find(p => p.id === participantId)?.name || 'Peserta'
        setDeleteConfirmation({
            isOpen: true,
            participantId: participantId,
            participantName: pName
        })
    }

    const handleConfirmDelete = async () => {
        const participantId = deleteConfirmation.participantId
        if (!participantId) return

        setIsDeletingParticipant(true)
        try {
            const response = await authFetch(`/api/tournaments/${id}/participants/${participantId}`, {
                method: 'DELETE'
            })
            const data = await response.json()

            if (data.success) {
                showSuccess('Peserta berhasil dihapus')
                // Refresh data
                setTournamentData(prev => ({
                    ...prev,
                    participants: prev.participants.filter(p => p.id !== participantId),
                    players: Math.max(0, (prev.players || 0) - 1)
                }))
                setIsEditModalOpen(false)
                setDeleteConfirmation({ isOpen: false, participantId: null, participantName: '' })
            } else {
                showError(data.message || 'Gagal menghapus peserta')
            }
        } catch (err) {
            console.error('Delete participant error:', err)
            showError('Terjadi kesalahan saat menghapus peserta')
        } finally {
            setIsDeletingParticipant(false)
        }
    }

    React.useEffect(() => {
        const fetchTournament = async () => {
            try {
                const response = await authFetch(`/api/tournaments/${id}`)
                const data = await response.json()

                if (data.success) {
                    // Check if user is the organizer
                    // Loose equality check to handle string/number differences
                    // or ensure both are strings/numbers
                    // NEW: Redirect Logic for Public Users (Non-Organizer)
                    if (user && String(data.data.organizer_id) !== String(user.id)) {
                        // If public, redirect to user view/join pages
                        if (data.data.visibility === 'public') {
                            if (data.data.status === 'draft') {
                                navigate(`/dashboard/competitions/${data.data.slug}/join`)
                            } else {
                                navigate(`/dashboard/competitions/${data.data.slug}/view`)
                            }
                            return // Stop execution here
                        }

                        // If private and not organizer, show error
                        setError('Anda tidak memiliki izin untuk mengakses turnamen ini.')
                        setTournamentData(null)
                        return
                    }
                    setTournamentData(data.data)
                } else {
                    throw new Error(data.message)
                }
            } catch (err) {
                console.error('Failed to fetch tournament:', err)
                setError(err.message || 'Gagal memuat detail turnamen')
            } finally {
                setLoading(false)
            }
        }

        if (id) {
            fetchTournament()
        }
    }, [id, user?.id])

    // Fetch necessary data for Winner Card if completed or ready to complete
    React.useEffect(() => {
        if (!tournamentData) return

        const isComplete = tournamentData.status === 'completed'
        const isReadyToComplete = tournamentData.progress === 100

        // Also fetch data if Prize tab is active to show winners
        if (isComplete || isReadyToComplete || activeTab === 'prize') {
            // Fetch stats if not already fetched
            if (!statistics && !statisticsLoading) {
                const fetchStatistics = async () => {
                    try {
                        const response = await authFetch(`/api/tournaments/${id}/statistics`)
                        const data = await response.json()
                        if (data.success) {
                            setStatistics(data.data)
                        }
                    } catch (err) {
                        console.error('Failed to fetch statistics for winner:', err)
                    }
                }
                fetchStatistics()
            }

            // Fetch top scorers if not already fetched
            if (topScorers.length === 0) {
                const fetchTopScorersWinner = async () => {
                    try {
                        const response = await authFetch(`/api/tournaments/${id}/top-scorers`)
                        const data = await response.json()
                        if (data.success) setTopScorers(data.data)
                    } catch (e) {
                        console.error('Failed to fetch top scorers for winner:', e)
                    }
                }
                fetchTopScorersWinner()
            }

            // Fetch matches/standings if needed for winner determination
            if (isKnockout || isGroupKO) {
                if (matches.length === 0 && !matchesLoading) {
                    const fetchMatchesWinner = async () => {
                        try {
                            const response = await authFetch(`/api/tournaments/${id}/matches`)
                            const data = await response.json()
                            if (data.success) setMatches(data.data)
                        } catch (e) { }
                    }
                    fetchMatchesWinner()
                }
            } else if (isLeague) {
                if (standings.length === 0) {
                    const fetchStandingsWinner = async () => {
                        try {
                            const response = await authFetch(`/api/tournaments/${id}/standings`)
                            const data = await response.json()
                            if (data.success) setStandings(data.data)
                        } catch (e) { }
                    }
                    fetchStandingsWinner()
                }
            }
        }
    }, [tournamentData, id])

    // Confetti Effect
    React.useEffect(() => {
        if (tournamentData?.status === 'completed') {
            const duration = 3000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

            const randomInRange = (min, max) => Math.random() * (max - min) + min;

            const interval = setInterval(function () {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 50 * (timeLeft / duration);
                // since particles fall down, start a bit higher than random
                confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
                confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
            }, 250);

            return () => clearInterval(interval);
        }
    }, [tournamentData?.status])

    // Calculate Winner
    React.useEffect(() => {
        if (!tournamentData || !statistics) return;

        let potentialWinner = null;

        if (isLeague) {
            if (standings.length > 0) {
                potentialWinner = {
                    id: standings[0].participant_id,
                    name: standings[0].team_name || standings[0].name,
                    logo: standings[0].logo_url,
                };
            }
        } else if ((isKnockout || isGroupKO) && matches.length > 0) {
            // Find final match
            const maxRound = Math.max(...matches.map(m => m.round));
            const finalMatches = matches.filter(m => {
                let d = {};
                try { d = typeof m.details === 'string' ? JSON.parse(m.details) : m.details || {}; } catch (e) { }
                return m.round === maxRound && !d.is3rdPlace;
            });

            if (finalMatches.length === 1) {
                const final = finalMatches[0];
                if (final.status === 'completed' || final.status === 'finished') {
                    // Determine winner logic (simplified, assuming single match final for now or aggregations handled previously)
                    let homeWin = final.home_score > final.away_score;
                    let awayWin = final.away_score > final.home_score;

                    if (final.home_score == final.away_score) {
                        if ((final.home_penalty_score || 0) > (final.away_penalty_score || 0)) homeWin = true;
                        else if ((final.away_penalty_score || 0) > (final.home_penalty_score || 0)) awayWin = true;
                    }

                    if (homeWin) {
                        potentialWinner = {
                            id: final.home_participant_id, // We need participant ID to link with stats
                            name: final.home_team_name,
                            logo: final.home_logo
                        };
                    } else if (awayWin) {
                        potentialWinner = {
                            id: final.away_participant_id,
                            name: final.away_team_name,
                            logo: final.away_logo
                        };
                    }
                }
            }
        }

        if (potentialWinner) {
            // Find detailed stats
            const statsArray = statistics.teamStats || (Array.isArray(statistics) ? statistics : []);
            const winnerStats = statsArray.find(s => s.id === potentialWinner.id);

            // Enrich with participant data if available for correct names
            let enrichedWinner = { ...potentialWinner };
            if (tournamentData.participants) {
                const winnerParticipant = tournamentData.participants.find(p => p.id === potentialWinner.id);
                if (winnerParticipant) {
                    enrichedWinner.name = winnerParticipant.team_name || winnerParticipant.name; // Prefer Team Name for main display
                    enrichedWinner.playerName = winnerParticipant.name;
                    enrichedWinner.logo = winnerParticipant.logo_url || enrichedWinner.logo;
                }
            }

            setWinnerData({
                ...enrichedWinner,
                stats: winnerStats || {}
            });
        }

    }, [tournamentData, matches, standings, statistics]);

    const handleCompleteTournament = async () => {
        setIsCompleting(true)
        try {
            const response = await authFetch(`/api/tournaments/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'completed' })
            })
            const data = await response.json()
            if (data.success) {
                showSuccess('Turnamen berhasil diselesaikan!')
                // Refresh data
                const refreshRes = await authFetch(`/api/tournaments/${id}`)
                const refreshData = await refreshRes.json()
                if (refreshData.success) {
                    setTournamentData(refreshData.data)
                }
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 }
                });
            } else {
                showError(data.message || 'Gagal menyelesaikan turnamen')
            }
        } catch (err) {
            showError('Terjadi kesalahan sistem')
        } finally {
            setIsCompleting(false)
        }
    }





    // Update active tab when data loads
    // Update active tab when data loads or URL param changes
    React.useEffect(() => {
        if (tournamentData) {
            const searchParams = new URLSearchParams(location.search)
            const tabParam = searchParams.get('tab')
            if (tabParam) {
                setActiveTab(tabParam)
            } else {
                setActiveTab(tournamentData.status === 'draft' ? 'players' : 'overview')
            }
        }
    }, [tournamentData, location.search])

    // Fetch Matches or Standings when tab is active
    React.useEffect(() => {
        if ((activeTab === 'fixtures' || activeTab === 'bracket' || activeTab === 'overview' || activeTab === 'groups') && id) {
            const fetchMatches = async () => {
                setMatchesLoading(true)
                try {
                    const response = await authFetch(`/api/tournaments/${id}/matches`)
                    const data = await response.json()
                    if (data.success) {
                        setMatches(data.data)
                    }
                } catch (err) {
                    console.error('Failed to fetch matches:', err)
                } finally {
                    setMatchesLoading(false)
                }
            }
            fetchMatches()
        }

        if ((activeTab === 'standings' || activeTab === 'overview' || activeTab === 'groups') && id) {
            const fetchStandings = async () => {
                try {
                    const response = await authFetch(`/api/tournaments/${id}/standings`)
                    const data = await response.json()
                    if (data.success) {
                        setStandings(data.data)
                    }
                } catch (err) {
                    console.error('Failed to fetch standings:', err)
                }
            }
            fetchStandings()
        }

        if (activeTab === 'statistics' && id) {
            const fetchStatistics = async () => {
                setStatisticsLoading(true)
                try {
                    const response = await authFetch(`/api/tournaments/${id}/statistics`)
                    const data = await response.json()
                    if (data.success) {
                        setStatistics(data.data)
                    }
                } catch (err) {
                    console.error('Failed to fetch statistics:', err)
                } finally {
                    setStatisticsLoading(false)
                }
            }
            fetchStatistics()
        }

        if (activeTab === 'top_scores' && id) {
            const fetchTopScorers = async () => {
                try {
                    const response = await authFetch(`/api/tournaments/${id}/top-scorers`)
                    const data = await response.json()
                    if (data.success) {
                        setTopScorers(data.data)
                    }
                } catch (err) {
                    console.error('Failed to fetch top scorers:', err)
                }
            }
            fetchTopScorers()
        }
    }, [activeTab, id])

    // Fetch News when tab is active
    React.useEffect(() => {
        if (activeTab === 'news' && id) {
            const fetchNews = async () => {
                setIsNewsLoading(true)
                try {
                    const response = await authFetch(`/api/tournaments/${id}/news`)
                    const data = await response.json()
                    if (data.success) {
                        setNewsList(data.data)
                    }
                } catch (err) {
                    console.error('Failed to fetch news:', err)
                } finally {
                    setIsNewsLoading(false)
                }
            }
            fetchNews()
        }
    }, [activeTab, id])






    // Loading and Error States (Rendered after all hooks but BEFORE accessing derived data)
    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neonGreen"></div>
        </div>
    )

    if (error || !tournamentData) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <Trophy className="w-16 h-16 text-gray-600 mb-4" />
            <h2 className="text-xl font-bold mb-2">Turnamen Tidak Ditemukan</h2>
            <p className="text-gray-500 mb-6">{error || 'Turnamen yang kamu cari tidak ada.'}</p>
            <Button onClick={() => navigate('/dashboard/tournaments')}>Kembali ke Daftar</Button>
        </div>
    )




    // Dynamic tabs based on tournament type
    const getTabs = () => {
        // Validation for generating fixtures
        const currentParticipants = tournamentData.participants
            ? tournamentData.participants.filter(p => p.status === 'approved').length
            : 0
        const maxParticipants = parseInt(tournamentData.max_participants || tournamentData.maxParticipants || tournamentData.players || 0, 10)

        let canGenerateFixtures = false
        if (isLeague) {
            canGenerateFixtures = currentParticipants >= 3 // Min 3 for league
        } else {
            // For Knockout/Group, need exact max participants
            canGenerateFixtures = currentParticipants > 0 && currentParticipants === maxParticipants
        }


        // Draft tournaments only show players tab
        if (isDraft) {
            const tabs = [
                { id: 'players', label: 'Pendaftar', icon: Users },
            ]

            if (canGenerateFixtures) {
                tabs.push({ id: 'fixtures', label: 'Jadwal', icon: Calendar })
            }

            tabs.push({ id: 'news', label: 'League News', icon: Newspaper })

            return tabs
        }

        const baseTabs = [
            { id: 'overview', label: 'Overview', icon: Trophy },
        ]

        if (isLeague) {
            baseTabs.push({ id: 'standings', label: 'Klasemen', icon: BarChart2 })
        }

        if (isGroupKO) {
            baseTabs.push({ id: 'groups', label: 'Group Stage', icon: Grid3X3 })
            baseTabs.push({ id: 'bracket', label: 'Knockout', icon: GitMerge })
        }

        if (isKnockout) {
            baseTabs.push({ id: 'bracket', label: 'Bracket', icon: GitMerge })
        }


        baseTabs.push({ id: 'fixtures', label: 'Jadwal', icon: Calendar })
        baseTabs.push({ id: 'top_scores', label: 'Top Score', icon: TrendingUp })
        baseTabs.push({ id: 'statistics', label: 'Statistic', icon: Activity })
        baseTabs.push({ id: 'news', label: 'League News', icon: Newspaper })
        baseTabs.push({ id: 'prize', label: 'Hadiah', icon: Gift })
        baseTabs.push({ id: 'players', label: 'Pemain', icon: Users })

        return baseTabs
    }

    const tabs = getTabs()

    const copyShareLink = () => {
        navigator.clipboard.writeText(tournamentData.shareLink)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleMatchClick = (matchId = 1) => {
        navigate(`/dashboard/tournaments/${id}/match/${matchId}`)
    }

    const getAggregateInfo = (match) => {
        if (!match) return null;
        let details = {};
        try {
            details = typeof match.details === 'string' ? JSON.parse(match.details) : match.details || {};
        } catch (e) { return null; }

        // Only show aggregate for leg 2 matches
        if (details.leg !== 2) return null;

        // Check if this is a knockout match:
        // - knockout type: all matches are knockout, check if it has groupId (for 2-leg format)
        // - group_knockout type: only matches with stage === 'knockout'
        const isKnockoutType = tournamentData?.type === 'knockout';
        const isGroupKOKnockoutStage = tournamentData?.type === 'group_knockout' && details.stage === 'knockout';

        if (!isKnockoutType && !isGroupKOKnockoutStage) return null;

        // Need groupId to find leg 1
        if (!details.groupId) return null;

        const leg1 = matches.find(m => {
            let d = {};
            try {
                d = typeof m.details === 'string' ? JSON.parse(m.details) : m.details || {};
            } catch (e) { }
            return d.groupId === details.groupId && d.leg === 1;
        });

        if (!leg1) return null;

        // Calculate aggregate based on participant IDs
        const currentHomeId = match.home_participant_id;
        const currentAwayId = match.away_participant_id;

        const l1HomeId = leg1.home_participant_id;
        const l1AwayId = leg1.away_participant_id;
        const l1HomeScore = Number(leg1.home_score || 0);
        const l1AwayScore = Number(leg1.away_score || 0);

        // Find leg 1 scores for current match's home and away teams
        let leg1ScoreForHome = 0;
        let leg1ScoreForAway = 0;

        if (l1HomeId === currentHomeId) {
            leg1ScoreForHome = l1HomeScore;
            leg1ScoreForAway = l1AwayScore;
        } else if (l1AwayId === currentHomeId) {
            leg1ScoreForHome = l1AwayScore;
            leg1ScoreForAway = l1HomeScore;
        }

        const l2HomeScore = Number(match.home_score || 0);
        const l2AwayScore = Number(match.away_score || 0);

        const aggHome = l2HomeScore + leg1ScoreForHome;
        const aggAway = l2AwayScore + leg1ScoreForAway;

        return `(Agg ${aggHome}-${aggAway})`;
    }

    const handleSaveNews = async (e) => {
        e.preventDefault()

        // Prepare payload with forced template for welcome messages
        const payload = { ...newNews }

        // Manual Validation with Toasts
        if (payload.is_welcome) {
            payload.title = `Selamat Datang di ${tournamentData.name}`
            payload.content = `Halo peserta! Selamat datang di ${tournamentData.name}. Turnamen ini akan segera dimulai. Silakan hubungi admin di bawah ini jika ada pertanyaan, atau bergabung ke grup WhatsApp kami untuk update terbaru.`

            if (!payload.contact_info) {
                showWarning('Nomor WhatsApp Admin wajib diisi')
                return
            }
        } else {
            if (!payload.title) {
                showWarning('Judul Berita wajib diisi')
                return
            }
            if (!payload.content) {
                showWarning('Isi Berita wajib diisi')
                return
            }
        }

        try {
            const response = await authFetch(`/api/tournaments/${id}/news`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            const data = await response.json()

            if (data.success) {
                showSuccess('Berita berhasil dipublish')
                // Refresh list
                const refreshRes = await authFetch(`/api/tournaments/${id}/news`)
                const refreshData = await refreshRes.json()
                if (refreshData.success) setNewsList(refreshData.data)

                setNewNews({ title: '', content: '', is_welcome: false, contact_info: '', group_link: '', open_thread: false })
                setIsNewsModalOpen(false)
            } else {
                showError(data.message || 'Gagal memposting berita')
            }
        } catch (err) {
            console.error('Post news error:', err)
            showError('Terjadi kesalahan sistem')
        }
    }

    const handleDeleteNews = (newsId) => {
        setDeleteModal({ isOpen: true, newsId })
    }

    const confirmDeleteNews = async () => {
        if (deleteModal.newsId) {
            try {
                const response = await authFetch(`/api/tournaments/${id}/news/${deleteModal.newsId}`, {
                    method: 'DELETE'
                })
                const data = await response.json()

                if (data.success) {
                    showSuccess('Berita berhasil dihapus')
                    setNewsList(newsList.filter(n => n.id !== deleteModal.newsId))
                } else {
                    showError(data.message || 'Gagal menghapus berita')
                }
            } catch (err) {
                showError('Terjadi kesalahan sistem')
            } finally {
                setDeleteModal({ isOpen: false, newsId: null })
            }
        }
    }

    const toggleComments = async (newsId) => {
        if (openThreadNewsId === newsId) {
            setOpenThreadNewsId(null)
            return
        }

        setOpenThreadNewsId(newsId)
        // Fetch comments if not already cached or to refresh
        try {
            const response = await authFetch(`/api/tournaments/${id}/news/${newsId}/comments`)
            const data = await response.json()
            if (data.success) {
                setCommentsMap(prev => ({ ...prev, [newsId]: data.data }))
            }
        } catch (err) { console.error(err) }
    }

    const handleOpenCreateNews = () => {
        const hasWelcome = newsList.some(n => n.is_welcome)
        const isFirst = !hasWelcome
        setNewNews({
            title: isFirst ? `Selamat Datang di ${tournamentData.name}` : '',
            content: isFirst ? `Halo peserta! Selamat datang di ${tournamentData.name}. Turnamen ini akan segera dimulai. Silakan hubungi admin di bawah ini jika ada pertanyaan, atau bergabung ke grup WhatsApp kami untuk update terbaru.` : '',
            is_welcome: isFirst,
            contact_info: '',
            group_link: '',
            open_thread: false
        })
        setIsNewsModalOpen(true)
    }

    const handlePostComment = async (e, newsId) => {
        e.preventDefault()
        if (!newComment.trim()) return

        try {
            const response = await authFetch(`/api/tournaments/${id}/news/${newsId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newComment })
            })
            const data = await response.json()

            if (data.success) {
                setNewComment('')
                // Refresh comments
                const res = await authFetch(`/api/tournaments/${id}/news/${newsId}/comments`)
                const d = await res.json()
                if (d.success) {
                    setCommentsMap(prev => ({ ...prev, [newsId]: d.data }))
                }
            } else {
                showError(data.message || 'Gagal mengirim komentar')
            }
        } catch (err) {
            showError('Gagal mengirim komentar')
        }
    }

    const handleSaveParticipant = async (participantId, data) => {
        try {
            const response = await authFetch(`/api/tournaments/${id}/participants/${participantId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            const result = await response.json()

            if (result.success) {
                showSuccess('Data peserta berhasil diperbarui')
                // Refresh data
                const refreshRes = await authFetch(`/api/tournaments/${id}`)
                const refreshData = await refreshRes.json()
                if (refreshData.success) {
                    setTournamentData(refreshData.data)
                }
            } else {
                showError(result.message || 'Gagal memperbarui data')
            }
        } catch (err) {
            console.error('Update error:', err)
            showError('Terjadi kesalahan saat menyimpan data')
        }
    }



    // Legacy/Unused direct delete handler replaced by handleConfirmDelete

    const handleStatusUpdate = async (participantId, newStatus) => {
        try {
            const response = await authFetch(`/api/tournaments/${id}/participants/${participantId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            })
            const result = await response.json()

            if (result.success) {
                showSuccess(`Status peserta diperbarui menjadi ${newStatus}`)
                // Optimistic update or refresh
                const refreshRes = await authFetch(`/api/tournaments/${id}`)
                const refreshData = await refreshRes.json()
                if (refreshData.success) {
                    setTournamentData(refreshData.data)
                }
            } else {
                showError(result.message || 'Gagal memperbarui status')
            }
        } catch (err) {
            console.error('Status update error:', err)
            showError('Terjadi kesalahan saat memperbarui status')
        }
    }

    // Handler for Mock Generate
    const handleGenerateSchedule = () => {
        setIsGenerateModalOpen(true)
    }

    const handleGenerate3rdPlace = () => {
        setIs3rdPlaceModalOpen(true)
    }

    const start3rdPlaceGeneration = async () => {
        setIs3rdPlaceModalOpen(false)
        setIsGenerating(true)
        setGenerationStep('MENYIAPKAN PEREBUTAN JUARA 3...')

        try {
            const response = await authFetch(`/api/tournaments/${id}/matches/generate-3rd-place`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            const data = await response.json()

            setTimeout(async () => {
                if (data.success) {
                    showSuccess('Pertandingan Juara 3 Berhasil Dibuat!')
                    // Refresh tournament data and matches
                    try {
                        const [tourneyRes, matchesRes] = await Promise.all([
                            authFetch(`/api/tournaments/${id}`),
                            authFetch(`/api/tournaments/${id}/matches`)
                        ]);
                        const tourneyData = await tourneyRes.json();
                        const matchesData = await matchesRes.json();

                        if (tourneyData.success) setTournamentData(tourneyData.data);
                        if (matchesData.success) setMatches(matchesData.data);
                    } catch (err) {
                        console.error('Failed to refresh data after 3rd place generation:', err);
                    }
                    setIsGenerating(false)
                    setActiveTab('fixtures')
                } else {
                    showError(data.message || 'Gagal membuat pertandingan juara 3')
                    setIsGenerating(false)
                }
            }, 1500)
        } catch (error) {
            console.error('3rd place generation error:', error)
            showError('Terjadi kesalahan sistem')
            setIsGenerating(false)
        }
    }

    // Mock Generation Process
    const startGenerationProcess = async () => {
        setIsGenerateModalOpen(false)
        setIsGenerating(true)
        setGenerationStep('INITIALIZING PROTOCOL...')

        const participants = tournamentData.participants || []
        // Process participants to valid team objects
        const validTeams = participants.length > 0
            ? participants.map(p => ({
                name: p.team_name || p.name,
                logo: p.logo_url
            }))
            : [{ name: 'Team A', logo: null }, { name: 'Team B', logo: null }]

        if (validTeams.length < 2) {
            // Fallback if not enough teams
            validTeams.push({ name: 'Team Mock 1', logo: null })
            validTeams.push({ name: 'Team Mock 2', logo: null })
        }

        // Shuffle Animation Interval - purely visual
        const shuffleInterval = setInterval(() => {
            const randomHome = validTeams[Math.floor(Math.random() * validTeams.length)]
            const randomAway = validTeams[Math.floor(Math.random() * validTeams.length)]
            setShufflingTeams({ home: randomHome, away: randomAway })
        }, 80) // Fast shuffle

        try {
            // Call API
            setGenerationStep('GENERATING FIXTURES...')
            const response = await authFetch(`/api/tournaments/${id}/matches/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            const data = await response.json()

            setTimeout(() => {
                setGenerationStep('FINALIZING BRACKET...')
            }, 2000)

            setTimeout(() => {
                clearInterval(shuffleInterval)
                setIsGenerating(false)
                setGenerationStep('')

                if (data.success) {
                    showSuccess('Jadwal Pertandingan Berhasil Dibuat!')
                    // Refresh tournament data to update status
                    const fetchTournament = async () => {
                        try {
                            const response = await authFetch(`/api/tournaments/${id}`)
                            const data = await response.json()
                            if (data.success) {
                                setTournamentData(data.data)
                            }
                        } catch (err) {
                            console.error('Failed to refresh tournament:', err)
                        }
                    }
                    fetchTournament()
                    setActiveTab('fixtures')
                } else {
                    showError(data.message || 'Gagal membuat jadwal')
                }
            }, 4000)

        } catch (error) {
            clearInterval(shuffleInterval)
            setIsGenerating(false)
            showError('Terjadi kesalahan sistem')
            console.error(error)
        }
    }

    if (!tournamentData) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="w-10 h-10 animate-spin text-neonGreen" />
            </div>
        )
    }

    const statusCounts = {
        invited: tournamentData?.participants?.filter(p => p.status === 'invited').length || 0
    }

    return (
        <div className="space-y-4 md:space-y-6 overflow-x-hidden">
            {/* Header */}
            <div className="space-y-4">
                <button
                    onClick={() => navigate('/dashboard/tournaments')}
                    className="text-gray-400 hover:text-white flex items-center gap-2 transition text-sm"
                >
                    <ArrowLeft className="w-4 h-4" /> Kembali ke daftar
                </button>

                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <AdaptiveLogo
                            src={tournamentData.logo}
                            alt={tournamentData.name}
                            className="w-12 h-12 sm:w-14 h-14 flex-shrink-0"
                            fallbackSize="w-6 h-6 sm:w-7 sm:h-7"
                        />
                        <div className="min-w-0">
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-bold truncate">{tournamentData.name}</h1>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <span className={`text-xs sm:text-sm px-2 py-0.5 rounded ${isKnockout ? 'bg-neonPink/20 text-neonPink' :
                                    isGroupKO ? 'bg-blue-500/20 text-blue-400' :
                                        'bg-gray-500/20 text-gray-300'
                                    }`}>
                                    {isLeague ? 'Liga' : isKnockout ? 'Knockout' : 'Group + Knockout'}
                                </span>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${isDraft
                                    ? 'bg-yellow-500/20 text-yellow-400'
                                    : 'bg-neonGreen/20 text-neonGreen'
                                    }`}>
                                    {isDraft ? 'Draft' : 'Aktif'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2 sm:gap-3 flex-shrink-0">
                        <Button variant="secondary" size="sm" onClick={() => setIsShareModalOpen(true)}>
                            <Share2 className="w-4 h-4" />
                            <span className="hidden sm:inline">Share</span>
                        </Button>
                        {isDraft ? (
                            <Button variant="ghost" size="sm" onClick={() => navigate(`/dashboard/tournaments/${id}/settings`)}>
                                <Settings className="w-4 h-4" />
                                <span className="hidden sm:inline">Pengaturan</span>
                            </Button>
                        ) : (
                            <Button variant="ghost" size="sm" onClick={() => setIsDetailModalOpen(true)}>
                                <Info className="w-4 h-4" />
                                <span className="hidden sm:inline">Detail</span>
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Winner Card */}
            {tournamentData.status === 'completed' && winnerData && (
                <div className="relative mb-8 animate-fadeIn">
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 via-neonGreen/10 to-neonPink/20 rounded-2xl blur-xl"></div>
                    <Card className="relative border-yellow-500/50 overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Crown className="w-64 h-64 text-yellow-500 transform rotate-12" />
                        </div>

                        <CardContent className="p-6 md:p-8 flex flex-col items-center justify-center text-center relative z-10">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 text-sm font-bold mb-6 animate-bounce">
                                <Trophy className="w-4 h-4" />
                                TOURNAMENT CHAMPION
                            </div>

                            <div className="w-24 h-24 md:w-32 md:h-32 rounded-lg p-1 bg-gradient-to-br from-yellow-400 via-yellow-200 to-yellow-600 mb-6 shadow-[0_0_30px_rgba(234,179,8,0.4)]">
                                <div className="w-full h-full rounded-lg bg-black flex items-center justify-center overflow-hidden border-4 border-black">
                                    {winnerData.logo ? (
                                        <img src={winnerData.logo} alt={winnerData.name} className="w-full h-full object-contain" />
                                    ) : (
                                        <Trophy className="w-12 h-12 text-yellow-400" />
                                    )}
                                </div>
                            </div>

                            <h2 className="text-3xl md:text-5xl font-black font-display text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 to-yellow-600 mb-2">
                                {winnerData.name}
                            </h2>
                            <p className="text-lg text-yellow-500/80 font-medium mb-8">
                                {winnerData.playerName || winnerData.stats.team_name || 'Champion Player'}
                            </p>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl">
                                <div className="p-4 rounded-xl bg-black/40 border border-yellow-500/20 backdrop-blur-sm">
                                    <div className="text-yellow-500/60 text-xs font-bold uppercase tracking-wider mb-2 flex items-center justify-center gap-1">
                                        <Percent className="w-3 h-3" /> Win Rate
                                    </div>
                                    <div className="text-2xl md:text-3xl font-black text-white">
                                        {winnerData.stats.winRate}%
                                    </div>
                                </div>
                                <div className="p-4 rounded-xl bg-black/40 border border-yellow-500/20 backdrop-blur-sm">
                                    <div className="text-yellow-500/60 text-xs font-bold uppercase tracking-wider mb-2 flex items-center justify-center gap-1">
                                        <Activity className="w-3 h-3" /> Productivity
                                    </div>
                                    <div className="text-2xl md:text-3xl font-black text-white">
                                        {winnerData.stats.productivity} <span className="text-xs text-gray-500 font-normal">G/M</span>
                                    </div>
                                </div>
                                <div className="p-4 rounded-xl bg-black/40 border border-yellow-500/20 backdrop-blur-sm col-span-2 md:col-span-2">
                                    <div className="text-yellow-500/60 text-xs font-bold uppercase tracking-wider mb-2 flex items-center justify-center gap-1">
                                        <Target className="w-3 h-3" /> Top Scorer
                                    </div>
                                    <div className="text-xl md:text-2xl font-black text-white flex items-center justify-center gap-2">
                                        {winnerData.stats.topScorer !== '-' ? winnerData.stats.topScorer : 'N/A'}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Share Link */}
            <Card className="p-3 sm:p-4">
                <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                        <div className="text-xs sm:text-sm text-gray-400 mb-1">Link Publik</div>
                        <div className="font-mono text-xs sm:text-sm text-neonGreen truncate">{tournamentData.shareLink}</div>
                    </div>
                    <button
                        onClick={copyShareLink}
                        className="p-2 rounded-lg hover:bg-white/10 transition flex-shrink-0"
                    >
                        {copied ? <Check className="w-5 h-5 text-neonGreen" /> : <Copy className="w-5 h-5 text-gray-400" />}
                    </button>
                </div>
            </Card>

            {/* Ad Slot */}
            <AdSlot variant="banner" adId="tournament-detail" />

            {/* Quick Stats - different for draft vs active */}
            {isDraft ? (
                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                    <Card className="p-3 sm:p-4 text-center">
                        <Clock className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-yellow-400" />
                        <div className="text-xl sm:text-2xl font-display font-bold">
                            {(tournamentData.participants || []).filter(p => p.status === 'pending' || p.status === 'invited').length}
                        </div>
                        <div className="text-xs text-gray-500">Menunggu</div>
                    </Card>
                    <Card className="p-3 sm:p-4 text-center">
                        <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-neonGreen" />
                        <div className="text-xl sm:text-2xl font-display font-bold">
                            {(tournamentData.participants || []).filter(p => p.status === 'approved').length}
                        </div>
                        <div className="text-xs text-gray-500">Diterima</div>
                    </Card>
                    <Card className="p-3 sm:p-4 text-center">
                        <XCircle className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-red-400" />
                        <div className="text-xl sm:text-2xl font-display font-bold">
                            {(tournamentData.participants || []).filter(p => p.status === 'rejected' || p.status === 'declined').length}
                        </div>
                        <div className="text-xs text-gray-500">Ditolak</div>
                    </Card>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-2 sm:gap-4">
                    <Card className="p-3 sm:p-4 text-center">
                        <Users className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-neonPink" />
                        <div className="text-xl sm:text-2xl font-display font-bold">{tournamentData.players}</div>
                        <div className="text-xs text-gray-500">Pemain</div>
                    </Card>
                    <Card className="p-3 sm:p-4 text-center">
                        <Calendar className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-blue-400" />
                        <div className="text-xl sm:text-2xl font-display font-bold">{tournamentData.matches}</div>
                        <div className="text-xs text-gray-500">Total Match</div>
                    </Card>
                    <Card className="p-3 sm:p-4 text-center">
                        <BarChart2 className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-neonGreen" />
                        <div className="text-xl sm:text-2xl font-display font-bold">{tournamentData.completed}</div>
                        <div className="text-xs text-gray-500">Selesai</div>
                    </Card>
                    <Card className="p-3 sm:p-4 text-center">
                        <Trophy className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-yellow-400" />
                        <div className="text-xl sm:text-2xl font-display font-bold">{tournamentData.matches > 0 ? Math.round((tournamentData.completed / tournamentData.matches) * 100) : 0}%</div>
                        <div className="text-xs text-gray-500">Progress</div>
                    </Card>
                </div>
            )}

            {/* Complete Action */}
            {!isDraft && tournamentData.status !== 'completed' && tournamentData.matches > 0 && Math.round((tournamentData.completed / tournamentData.matches) * 100) >= 100 && (
                <div className="bg-gradient-to-r from-neonGreen/20 to-blue-500/20 border border-neonGreen/30 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 animate-pulse-glow">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-neonGreen/20 flex items-center justify-center text-neonGreen">
                            <CheckCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-white">Turnamen Selesai!</h3>
                            <p className="text-gray-400 text-sm">Semua pertandingan telah dimainkan. Anda dapat menyelesaikan turnamen ini sekarang.</p>
                        </div>
                    </div>
                    <Button
                        size="lg"
                        onClick={handleCompleteTournament}
                        disabled={isCompleting}
                        className="bg-neonGreen hover:bg-neonGreen/80 text-black font-bold shadow-[0_0_20px_rgba(57,255,20,0.3)] hover:shadow-[0_0_30px_rgba(57,255,20,0.5)] transition-all transform hover:scale-105"
                    >
                        {isCompleting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Trophy className="w-5 h-5 mr-2" />}
                        Selesaikan Turnamen
                    </Button>
                </div>
            )}


            {/* Tabs */}
            <div className="border-b border-white/10 -mx-4 px-4 lg:mx-0 lg:px-0">
                <div className="flex gap-1 overflow-x-auto scrollbar-hide">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap ${activeTab === tab.id
                                ? 'border-neonGreen text-neonGreen'
                                : 'border-transparent text-gray-400 hover:text-white'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}

            {/* League News */}
            {
                activeTab === 'news' && (
                    <div className="space-y-4 animate-fadeIn">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                            <h3 className="font-display font-bold text-lg">Berita & Pengumuman</h3>
                            {tournamentData.organizer_id === user?.id && (
                                <Button size="sm" onClick={handleOpenCreateNews} className="w-full sm:w-auto justify-center">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Tambah Berita
                                </Button>
                            )}
                        </div>

                        {/* Welcome Message Card */}
                        {newsList.filter(n => n.is_welcome).map(news => (
                            <div key={news.id} className="bg-gradient-to-br from-neonGreen/20 to-blue-600/20 border border-neonGreen/30 rounded-xl p-6 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <MessageSquare className="w-24 h-24 text-neonGreen" />
                                </div>
                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className="bg-neonGreen text-black text-[10px] font-bold px-2 py-0.5 rounded uppercase">Pinned</span>
                                            <h3 className="font-bold text-xl text-white">{news.title}</h3>
                                        </div>
                                        {tournamentData.organizer_id === user?.id && (
                                            <button
                                                onClick={() => handleDeleteNews(news.id)}
                                                className="text-gray-400 hover:text-red-400 transition"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-gray-200 mb-6 whitespace-pre-wrap">{news.content}</p>

                                    <div className="flex flex-wrap gap-3">
                                        {news.contact_info && (
                                            <a href={`https://wa.me/${news.contact_info.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer"
                                                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition">
                                                <Phone className="w-4 h-4" />
                                                Hubungi Admin
                                            </a>
                                        )}
                                        {news.group_link && (
                                            <a href={news.group_link} target="_blank" rel="noreferrer"
                                                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition">
                                                <Users className="w-4 h-4" />
                                                Gabung Grup
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Regular News List */}
                        {isNewsLoading ? (
                            <div className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin mx-auto text-neonGreen" /></div>
                        ) : newsList.length === 0 ? (
                            <div className="text-center py-12 text-gray-500 bg-white/5 rounded-xl border border-white/10">
                                <Newspaper className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p>Belum ada berita yang dipublish.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {newsList.filter(n => !n.is_welcome).map((news) => (
                                    <div key={news.id} className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition group relative">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-lg text-white">{news.title}</h3>
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs text-gray-500 bg-black/20 px-2 py-1 rounded">
                                                    {new Date(news.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                </span>
                                                {tournamentData.organizer_id === user?.id && (
                                                    <button
                                                        onClick={() => handleDeleteNews(news.id)}
                                                        className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"
                                                        title="Hapus berita"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-gray-300 text-sm whitespace-pre-wrap mb-4">{news.content}</p>

                                        {/* Interaction Bar */}
                                        {news.open_thread && (
                                            <div className="border-t border-white/10 pt-3">
                                                <button
                                                    onClick={() => toggleComments(news.id)}
                                                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition"
                                                >
                                                    <MessageCircle className="w-4 h-4" />
                                                    {news.comment_count || 0} Komentar
                                                    <ChevronDown className={`w-3 h-3 transition-transform ${openThreadNewsId === news.id ? 'rotate-180' : ''}`} />
                                                </button>

                                                {/* Comments Section */}
                                                {openThreadNewsId === news.id && (
                                                    <div className="mt-4 space-y-4 pl-4 border-l-2 border-white/10">
                                                        {/* Comment List */}
                                                        {commentsMap[news.id]?.length > 0 ? (
                                                            <div className="space-y-3">
                                                                {commentsMap[news.id].map(comment => (
                                                                    <div key={comment.id} className="flex gap-3">
                                                                        <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden flex-shrink-0">
                                                                            {comment.participant_logo || comment.user_avatar ? (
                                                                                <img src={comment.participant_logo || comment.user_avatar} alt="" className="w-full h-full object-cover" />
                                                                            ) : (
                                                                                <Users className="w-4 h-4 m-auto text-gray-400 h-full" />
                                                                            )}
                                                                        </div>
                                                                        <div className="flex-1">
                                                                            <div className="flex items-center gap-2 mb-1">
                                                                                <span className="text-sm font-bold text-white">{comment.team_name || comment.participant_name || comment.user_name || 'User'}</span>
                                                                                <span className="text-[10px] text-gray-500">{new Date(comment.created_at).toLocaleString()}</span>
                                                                            </div>
                                                                            <p className="text-sm text-gray-300">{comment.content}</p>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <p className="text-sm text-gray-500 italic">Belum ada komentar.</p>
                                                        )}

                                                        {/* Comment Input */}
                                                        {(user && (tournamentData.organizer_id === user.id || tournamentData.participants.some(p => String(p.user_id) === String(user.id)))) ? (
                                                            <form onSubmit={(e) => handlePostComment(e, news.id)} className="flex gap-2 mt-4">
                                                                <Input
                                                                    value={newComment}
                                                                    onChange={(e) => setNewComment(e.target.value)}
                                                                    placeholder="Tulis komentar..."
                                                                    className="flex-1 bg-black/20"
                                                                />
                                                                <Button type="submit" size="sm" icon={Send}>
                                                                    Kirim
                                                                </Button>
                                                            </form>
                                                        ) : (
                                                            <p className="text-xs text-gray-500 mt-2">Hanya peserta yang dapat berkomentar.</p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* News Modal */}
                        <Modal
                            isOpen={isNewsModalOpen}
                            onClose={() => setIsNewsModalOpen(false)}
                            title={newNews.is_welcome ? "Buat Pesan Selamat Datang" : "Tambah Berita"}
                        >
                            <form onSubmit={handleSaveNews} className="space-y-4" noValidate>
                                {/* Title Input - Visible only for Regular News */}
                                {!newNews.is_welcome && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Judul Berita</label>
                                        <Input
                                            value={newNews.title}
                                            onChange={(e) => setNewNews({ ...newNews, title: e.target.value })}
                                            placeholder="Contoh: Jadwal Technical Meeting"
                                        />
                                    </div>
                                )}

                                {/* Post Type Selector - Shown only if Welcome Info hasn't been used yet */}
                                {newsList.filter(n => n.is_welcome).length === 0 && (
                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        <div
                                            onClick={() => setNewNews(prev => ({
                                                ...prev,
                                                is_welcome: true,
                                                title: `Selamat Datang di ${tournamentData.name}`,
                                                content: `Halo peserta! Selamat datang di ${tournamentData.name}. Turnamen ini akan segera dimulai. Silakan hubungi admin di bawah ini jika ada pertanyaan, atau bergabung ke grup WhatsApp kami untuk update terbaru.`
                                            }))}
                                            className={`cursor-pointer p-3 rounded-xl border transition-all ${newNews.is_welcome
                                                ? 'border-neonGreen bg-neonGreen/10 ring-1 ring-neonGreen'
                                                : 'border-white/10 bg-white/5 hover:bg-white/10'
                                                }`}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${newNews.is_welcome ? 'border-neonGreen' : 'border-gray-500'}`}>
                                                    {newNews.is_welcome && <div className="w-2 h-2 rounded-full bg-neonGreen" />}
                                                </div>
                                                <span className={`font-bold text-sm ${newNews.is_welcome ? 'text-neonGreen' : 'text-gray-400'}`}>Welcome Info</span>
                                            </div>
                                            <p className="text-xs text-gray-500 ml-6">Pesan sambutan pin & kontak info</p>
                                        </div>

                                        <div
                                            onClick={() => setNewNews(prev => ({
                                                ...prev,
                                                is_welcome: false,
                                                title: '',
                                                content: ''
                                            }))}
                                            className={`cursor-pointer p-3 rounded-xl border transition-all ${!newNews.is_welcome
                                                ? 'border-neonGreen bg-neonGreen/10 ring-1 ring-neonGreen'
                                                : 'border-white/10 bg-white/5 hover:bg-white/10'
                                                }`}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${!newNews.is_welcome ? 'border-neonGreen' : 'border-gray-500'}`}>
                                                    {!newNews.is_welcome && <div className="w-2 h-2 rounded-full bg-neonGreen" />}
                                                </div>
                                                <span className={`font-bold text-sm ${!newNews.is_welcome ? 'text-neonGreen' : 'text-gray-400'}`}>Berita Biasa</span>
                                            </div>
                                            <p className="text-xs text-gray-500 ml-6">Update info & pengumuman rutin</p>
                                        </div>
                                    </div>
                                )}

                                {newNews.is_welcome && (
                                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-sm text-blue-400 flex items-start gap-3">
                                        <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-bold mb-1">Judul & Isi Berita Otomatis</p>
                                            <p className="text-blue-400/80">Sistem akan membuat pesan sambutan standar secara otomatis. Anda cukup mengisi kontak di bawah ini (opsional).</p>
                                        </div>
                                    </div>
                                )}

                                {newNews.is_welcome && (
                                    <div className="space-y-4 pl-4 border-l-2 border-neonGreen animate-fadeIn bg-white/5 p-4 rounded-r-lg">
                                        <div>
                                            <h4 className="text-sm font-bold text-neonGreen mb-3 flex items-center gap-2">
                                                <Info className="w-4 h-4" />
                                                Informasi Kontak (Optional)
                                            </h4>
                                            <label className="block text-sm font-medium text-gray-400 mb-1">Nomor WhatsApp Admin</label>
                                            <Input
                                                value={newNews.contact_info}
                                                onChange={(e) => setNewNews({ ...newNews, contact_info: e.target.value })}
                                                placeholder="Contoh: 628123456789 (Gunakan format internasional)"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-1">Link Grup Peserta</label>
                                            <Input
                                                value={newNews.group_link}
                                                onChange={(e) => setNewNews({ ...newNews, group_link: e.target.value })}
                                                placeholder="https://chat.whatsapp.com/..."
                                            />
                                        </div>
                                    </div>
                                )}



                                {/* Content Input - Visible only for Regular News */}
                                {!newNews.is_welcome && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Isi Berita</label>
                                        <textarea
                                            value={newNews.content}
                                            onChange={(e) => setNewNews({ ...newNews, content: e.target.value })}
                                            className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-neonGreen h-32"
                                            placeholder="Tulis informasi lengkap di sini..."
                                        />
                                    </div>
                                )}

                                {/* Comment Toggle UI - Polished */}
                                {!newNews.is_welcome && (
                                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <label className="text-sm font-bold text-white flex items-center gap-2">
                                                <MessageCircle className="w-4 h-4 text-neonGreen" />
                                                Interaksi Peserta (Komentar)
                                            </label>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setNewNews({ ...newNews, open_thread: true })}
                                                className={`flex items-center justify-center gap-2 py-2.5 rounded-lg border text-xs font-medium transition-all ${newNews.open_thread === true
                                                    ? 'bg-neonGreen/10 border-neonGreen text-neonGreen shadow-[0_0_10px_rgba(57,255,20,0.1)]'
                                                    : 'bg-black/20 border-white/5 text-gray-500 hover:border-white/10 hover:text-gray-400'
                                                    }`}
                                            >
                                                <MessageSquare className="w-3.5 h-3.5" />
                                                Aktifkan Komentar
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setNewNews({ ...newNews, open_thread: false })}
                                                className={`flex items-center justify-center gap-2 py-2.5 rounded-lg border text-xs font-medium transition-all ${newNews.open_thread === false
                                                    ? 'bg-red-500/10 border-red-500/30 text-red-500'
                                                    : 'bg-black/20 border-white/5 text-gray-500 hover:border-white/10 hover:text-gray-400'
                                                    }`}
                                            >
                                                <XCircle className="w-3.5 h-3.5" />
                                                Nonaktifkan
                                            </button>
                                        </div>
                                        <p className="text-[10px] text-gray-500 mt-2.5 pl-1 italic">
                                            {newNews.open_thread
                                                ? "Peserta dapat berdiskusi atau bertanya tentang berita ini."
                                                : "Hanya satu arah, peserta tidak dapat memberikan komentar."}
                                        </p>
                                    </div>
                                )}

                                <div className="flex justify-end gap-3 pt-4">
                                    <Button variant="ghost" type="button" onClick={() => setIsNewsModalOpen(false)}>
                                        Batal
                                    </Button>
                                    <Button type="submit" className="bg-neonGreen text-black">
                                        Publish
                                    </Button>
                                </div>
                            </form>
                        </Modal>

                        {/* Delete News Confirmation Modal */}
                        <Modal
                            isOpen={deleteModal.isOpen}
                            onClose={() => setDeleteModal({ isOpen: false, newsId: null })}
                            title="Hapus Berita"
                        >
                            <div className="space-y-4">
                                <p className="text-gray-300">Apakah Anda yakin ingin menghapus berita ini?</p>
                                <div className="flex justify-end gap-3">
                                    <Button variant="ghost" onClick={() => setDeleteModal({ isOpen: false, newsId: null })}>
                                        Batal
                                    </Button>
                                    <Button className="bg-red-500 hover:bg-red-600 text-white" onClick={confirmDeleteNews}>
                                        Hapus
                                    </Button>
                                </div>
                            </div>
                        </Modal>

                    </div>
                )
            }

            {/* Overview - different based on type */}
            {
                activeTab === 'overview' && (
                    <div className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            {isLeague && (
                                <Card hover={false} className="min-w-0">
                                    <CardHeader>
                                        <h3 className="font-display font-bold">Klasemen Sementara</h3>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <StandingsTable compact standings={standings} />
                                    </CardContent>
                                </Card>
                            )}

                            {/* Next Match Card - League Only */}
                            {isLeague && (
                                <Card hover={false} className="min-w-0">
                                    <CardHeader>
                                        <h3 className="font-display font-bold flex items-center gap-2">
                                            <Calendar className="w-5 h-5 text-neonGreen" />
                                            Pertandingan Selanjutnya
                                        </h3>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {(() => {
                                                const upcomingMatches = matches
                                                    .filter(m => m.status === 'scheduled')
                                                    .slice(0, 4);

                                                if (upcomingMatches.length === 0) {
                                                    return (
                                                        <div className="text-sm text-gray-500 text-center py-4">
                                                            Tidak ada pertandingan terjadwal
                                                        </div>
                                                    );
                                                }

                                                return (
                                                    <>
                                                        {upcomingMatches.map(match => (
                                                            <MatchCard
                                                                key={match.id}
                                                                home={{
                                                                    name: match.home_team_name || match.home_player_name || 'TBD',
                                                                    logo: match.home_logo
                                                                }}
                                                                away={{
                                                                    name: match.away_team_name || match.away_player_name || 'TBD',
                                                                    logo: match.away_logo
                                                                }}
                                                                homeScore={match.home_score}
                                                                awayScore={match.away_score}
                                                                status={match.status}
                                                                onClick={() => handleMatchClick(match.id)}
                                                                compact
                                                                logoShape="square"
                                                            />
                                                        ))}
                                                        <button
                                                            onClick={() => setActiveTab('fixtures')}
                                                            className="w-full text-center text-xs text-gray-400 hover:text-white py-2 mt-2 border-t border-white/5"
                                                        >
                                                            Lihat Semua Jadwal
                                                        </button>
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {(isKnockout || isGroupKO) && (
                                <Card hover={false} className="min-w-0">
                                    <CardHeader>
                                        <h3 className="font-display font-bold flex items-center gap-2">
                                            <GitMerge className="w-5 h-5 text-neonPink" />
                                            Bracket Preview
                                        </h3>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {matches.length > 0 ? (
                                                (() => {
                                                    // Filter for Knockout matches if Group+KO
                                                    const bracketMatches = isGroupKO
                                                        ? matches.filter(m => {
                                                            try {
                                                                const d = typeof m.details === 'string' ? JSON.parse(m.details) : m.details || {};
                                                                return d.stage === 'knockout';
                                                            } catch (e) { return false; }
                                                        })
                                                        : matches;

                                                    // If Group+KO and no knockout matches yet OR no participants in knockout matches
                                                    const hasStartedKnockout = bracketMatches.some(m => m.home_participant_id || m.away_participant_id || m.home_player_id || m.away_player_id);

                                                    if (isGroupKO && (!bracketMatches.length || !hasStartedKnockout)) {
                                                        const upcomingGroupMatches = matches
                                                            .filter(m => m.status === 'scheduled' && (typeof m.details === 'string' ? m.details.includes('groupName') : m.details?.groupName))
                                                            .slice(0, 3);

                                                        if (upcomingGroupMatches.length === 0) return null;

                                                        return (
                                                            <>
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <ListFilter className="w-4 h-4 text-neonGreen" />
                                                                    <span className="text-sm font-bold text-gray-300">Jadwal Group Stage</span>
                                                                </div>
                                                                {upcomingGroupMatches.map(match => (
                                                                    <MatchCard
                                                                        key={match.id}
                                                                        home={{
                                                                            name: match.home_team_name || match.home_player_name || 'TBD',
                                                                            logo: match.home_logo
                                                                        }}
                                                                        away={{
                                                                            name: match.away_team_name || match.away_player_name || 'TBD',
                                                                            logo: match.away_logo
                                                                        }}
                                                                        homeScore={match.home_score}
                                                                        awayScore={match.away_score}
                                                                        status={match.status}
                                                                        onClick={() => handleMatchClick(match.id)}
                                                                        compact
                                                                        logoShape="square"
                                                                    />
                                                                ))}
                                                                {upcomingGroupMatches.length > 0 && (
                                                                    <button
                                                                        onClick={() => setActiveTab('fixtures')}
                                                                        className="w-full text-center text-xs text-gray-400 hover:text-white py-2 mt-2 border-t border-white/5"
                                                                    >
                                                                        Lihat Semua Jadwal
                                                                    </button>
                                                                )}
                                                            </>
                                                        );
                                                    }

                                                    // Find the highest round that has at least one participant filled
                                                    // This indicates the round has started or is ready to start
                                                    const uniqueRounds = [...new Set(bracketMatches.map(m => m.round))].sort((a, b) => b - a);

                                                    let activeRound = uniqueRounds[0]; // Default to max

                                                    for (const r of uniqueRounds) {
                                                        const roundMatches = bracketMatches.filter(m => m.round === r);
                                                        const hasParticipants = roundMatches.some(m => m.home_participant_id || m.away_participant_id || m.home_player_id || m.away_player_id);
                                                        if (hasParticipants) {
                                                            activeRound = r;
                                                            break;
                                                        }
                                                    }

                                                    const currentRoundMatches = bracketMatches
                                                        .filter(m => m.round === activeRound)
                                                        .map(m => {
                                                            let d = {};
                                                            try { d = typeof m.details === 'string' ? JSON.parse(m.details) : m.details || {}; } catch (e) { }
                                                            return { ...m, _details: d };
                                                        })
                                                        .sort((a, b) => (a._details.leg || 0) - (b._details.leg || 0));

                                                    let roundName = `Round ${activeRound}`;
                                                    // Simple naming logic
                                                    if (currentRoundMatches.length === 1) roundName = "Final";
                                                    else if (currentRoundMatches.length === 2 && !currentRoundMatches[0]._details.leg) roundName = "Semi Final";
                                                    else if (currentRoundMatches.length === 4) roundName = "Quarter Final";

                                                    return (
                                                        <>
                                                            <div className="text-sm text-gray-400 mb-2">{roundName}</div>
                                                            {currentRoundMatches.map(match => (
                                                                <MatchCard
                                                                    key={match.id}
                                                                    home={{
                                                                        name: match.home_team_name || match.home_player_name || 'TBD',
                                                                        logo: match.home_logo
                                                                    }}
                                                                    away={{
                                                                        name: match.away_team_name || match.away_player_name || 'TBD',
                                                                        logo: match.away_logo
                                                                    }}
                                                                    homeScore={match.home_score}
                                                                    awayScore={match.away_score}
                                                                    homePenalty={match.home_penalty_score}
                                                                    awayPenalty={match.away_penalty_score}
                                                                    status={match.status}
                                                                    leg={match._details.leg}
                                                                    onClick={() => handleMatchClick(match.id)} // Use correct match.id
                                                                    aggregate={getAggregateInfo(match)}
                                                                    logoShape="square"
                                                                />
                                                            ))}
                                                        </>
                                                    );
                                                })()
                                            ) : (
                                                <div className="text-sm text-gray-500 text-center py-4">Jadwal belum tersedia</div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {isGroupKO && (
                                <>
                                    <Card hover={false} className="min-w-0">
                                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                                            <h3 className="font-display font-bold flex items-center gap-2">
                                                <Grid3X3 className="w-5 h-5 text-blue-400" />
                                                Group Stage Status
                                            </h3>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="text-xs h-7 px-2"
                                                onClick={() => setActiveTab('groups')}
                                            >
                                                Lihat Semua
                                            </Button>
                                        </CardHeader>
                                        <CardContent className="pt-0">
                                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                                {processedGroups.slice(0, 4).map(group => (
                                                    <div key={group.name} className="bg-white/5 border border-white/5 rounded-lg overflow-hidden flex flex-col">
                                                        <div className="bg-white/5 px-3 py-1.5 flex justify-between items-center border-b border-white/5">
                                                            <span className="text-xs font-bold text-neonGreen uppercase tracking-wider">{group.name}</span>
                                                            <span className="text-[10px] text-gray-400 font-mono">Top 2 Promosi</span>
                                                        </div>
                                                        <div className="flex-1 p-0">
                                                            <table className="w-full text-xs">
                                                                <thead>
                                                                    <tr className="text-gray-500 border-b border-white/5">
                                                                        <th className="py-1 px-2 text-left w-6">#</th>
                                                                        <th className="py-1 px-2 text-left">Tim</th>
                                                                        <th className="py-1 px-2 text-center w-8" title="Main">MP</th>
                                                                        <th className="py-1 px-2 text-center w-8" title="Goal Difference">GD</th>
                                                                        <th className="py-1 px-2 text-center w-8 font-bold text-white">Pts</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {group.teams.slice(0, 4).map((team, idx) => (
                                                                        <tr key={idx} className={`border-b border-white/5 last:border-0 ${idx < 2 ? 'bg-neonGreen/5' : ''}`}>
                                                                            <td className="py-1.5 px-2 text-left">
                                                                                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${idx < 2 ? 'bg-neonGreen text-black' : 'bg-gray-700 text-gray-300'}`}>
                                                                                    {idx + 1}
                                                                                </span>
                                                                            </td>
                                                                            <td className="py-1.5 px-2 font-medium truncate max-w-[100px] sm:max-w-[140px]">
                                                                                <div className="flex items-center gap-1.5">
                                                                                    {team.logo && <img src={team.logo} alt="" className="w-3 h-3 object-contain" />}
                                                                                    <span className="truncate">{team.name}</span>
                                                                                </div>
                                                                            </td>
                                                                            <td className="py-1.5 px-2 text-center text-gray-400">{team.played}</td>
                                                                            <td className={`py-1.5 px-2 text-center ${team.gd > 0 ? 'text-green-400' : team.gd < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                                                                                {team.gd > 0 ? '+' : ''}{team.gd}
                                                                            </td>
                                                                            <td className="py-1.5 px-2 text-center font-bold text-neonGreen">{team.pts}</td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                            {group.teams.length > 4 && (
                                                                <div className="text-[10px] text-center py-1 text-gray-500 bg-black/20">
                                                                    +{group.teams.length - 4} tim lainnya
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                                {processedGroups.length === 0 && (
                                                    <div className="col-span-1 xl:col-span-2 text-center text-gray-500 py-8 bg-white/5 rounded-lg border border-dashed border-white/10">
                                                        Belum ada data grup
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>


                                </>
                            )}

                            <Card hover={false} className="min-w-0">
                                <CardHeader>
                                    <h3 className="font-display font-bold">Pertandingan Terakhir</h3>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {matches.length > 0 ? (
                                        (() => {
                                            const completedMatches = matches
                                                .filter(m => m.status === 'completed' || m.status === 'finished')
                                                .sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at))
                                                .slice(0, 3);

                                            if (completedMatches.length === 0) {
                                                return <div className="text-sm text-gray-500 text-center py-4">Belum ada pertandingan selesai</div>
                                            }

                                            return completedMatches.map(match => {
                                                // Parse match details
                                                let details = {};
                                                try {
                                                    details = typeof match.details === 'string' ? JSON.parse(match.details) : (match.details || {});
                                                } catch (e) { }

                                                // Build subtitle parts
                                                const subtitleParts = [];

                                                // Round/Matchday/Stage info
                                                if (tournamentData.type === 'league') {
                                                    subtitleParts.push(`Matchday ${match.round}`);
                                                } else if (details.roundName) {
                                                    subtitleParts.push(details.roundName);
                                                } else if (details.groupName) {
                                                    subtitleParts.push(details.groupName);
                                                } else {
                                                    // Calculate proper round name for knockout tournaments
                                                    const maxRound = Math.max(...matches.map(m => m.round));
                                                    const r = parseInt(match.round);
                                                    if (r === maxRound) {
                                                        subtitleParts.push('Final');
                                                    } else if (r === maxRound - 1) {
                                                        subtitleParts.push('Semi Final');
                                                    } else if (r === maxRound - 2) {
                                                        subtitleParts.push('Quarter Final');
                                                    } else {
                                                        subtitleParts.push(`Round ${match.round}`);
                                                    }
                                                }

                                                // Leg info
                                                if (details.leg) {
                                                    subtitleParts.push(`Leg ${details.leg}`);
                                                }

                                                // Calculate aggregate for leg 2
                                                let aggregateText = null;
                                                if (details.leg === 2 && details.groupId) {
                                                    // Find leg 1 match
                                                    const leg1 = matches.find(m => {
                                                        let d = {};
                                                        try { d = typeof m.details === 'string' ? JSON.parse(m.details) : (m.details || {}); } catch (e) { }
                                                        return d.groupId === details.groupId && d.leg === 1;
                                                    });

                                                    if (leg1) {
                                                        const currentHomeId = match.home_participant_id;
                                                        const currentAwayId = match.away_participant_id;

                                                        let leg1HomeScore = 0, leg1AwayScore = 0;
                                                        if (leg1.home_participant_id === currentHomeId) {
                                                            leg1HomeScore = leg1.home_score || 0;
                                                            leg1AwayScore = leg1.away_score || 0;
                                                        } else {
                                                            leg1HomeScore = leg1.away_score || 0;
                                                            leg1AwayScore = leg1.home_score || 0;
                                                        }

                                                        const aggHome = (match.home_score || 0) + leg1HomeScore;
                                                        const aggAway = (match.away_score || 0) + leg1AwayScore;
                                                        aggregateText = `Agg ${aggHome}-${aggAway}`;
                                                    }
                                                }

                                                return (
                                                    <div key={match.id} className="space-y-1">
                                                        {/* Match info subtitle */}
                                                        <div className="flex items-center gap-2 text-xs text-gray-500 px-1">
                                                            <span>{subtitleParts.join(' • ')}</span>
                                                            {aggregateText && (
                                                                <span className="text-neonPink font-bold">({aggregateText})</span>
                                                            )}
                                                        </div>
                                                        <MatchCard
                                                            home={{
                                                                name: match.home_team_name || match.home_player_name || 'TBD',
                                                                team: match.home_team_name,
                                                                logo: match.home_logo
                                                            }}
                                                            away={{
                                                                name: match.away_team_name || match.away_player_name || 'TBD',
                                                                team: match.away_team_name,
                                                                logo: match.away_logo
                                                            }}
                                                            homeScore={match.home_score}
                                                            awayScore={match.away_score}
                                                            homePenalty={match.home_penalty_score}
                                                            awayPenalty={match.away_penalty_score}
                                                            status={match.status}
                                                            logoShape="square"
                                                            onClick={() => handleMatchClick(match.id)}
                                                        />
                                                    </div>
                                                );
                                            });
                                        })()
                                    ) : (
                                        <div className="text-sm text-gray-500 text-center py-4">Belum ada jadwal</div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )
            }



            {/* Standings - Liga only */}
            {
                activeTab === 'standings' && isLeague && (
                    <Card hover={false} ref={standingsRef}>
                        <CardHeader className="flex items-center justify-between">
                            <h3 className="font-display font-bold">Klasemen Liga</h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                disabled={exportLoading === 'standings'}
                                onClick={async () => {
                                    if (standingsRef.current) {
                                        setExportLoading('standings')
                                        try {
                                            await exportStandingsToImage(standingsRef.current, tournamentData?.name || 'tournament')
                                        } finally {
                                            setExportLoading(null)
                                        }
                                    }
                                }}
                            >
                                {exportLoading === 'standings' ? (
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                ) : null}
                                Export Gambar
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            <StandingsTable standings={standings} />
                        </CardContent>
                    </Card>
                )
            }

            {/* Group Stage - Group+KO only */}
            {
                activeTab === 'groups' && isGroupKO && (
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <h3 className="font-display font-bold text-lg flex items-center gap-2">
                                <Grid3X3 className="w-5 h-5 text-blue-400" />
                                Group Stage
                            </h3>
                            <div className="text-xs sm:text-sm text-gray-400">
                                Top 2 dari setiap grup lolos ke Knockout Stage
                            </div>
                        </div>
                        {processedGroups.length > 0 ? (
                            <GroupStage groups={processedGroups} />
                        ) : (
                            <Card className="text-center py-12">
                                <CardContent>
                                    <p className="text-gray-500">Belum ada pembagian grup. Silakan generate jadwal terlebih dahulu.</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )
            }

            {/* Bracket - Knockout & Group+KO */}
            {
                activeTab === 'bracket' && (isKnockout || isGroupKO) && (
                    <Card hover={false} ref={bracketRef}>
                        <CardHeader className="flex items-center justify-between">
                            <h3 className="font-display font-bold flex items-center gap-2">
                                <GitMerge className="w-5 h-5 text-neonPink" />
                                {isGroupKO ? 'Knockout Stage' : 'Tournament Bracket'}
                            </h3>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    disabled={exportLoading === 'bracket'}
                                    onClick={async () => {
                                        if (bracketRef.current) {
                                            setExportLoading('bracket')
                                            try {
                                                await exportBracketToImage(bracketRef.current, tournamentData?.name || 'tournament')
                                            } finally {
                                                setExportLoading(null)
                                            }
                                        }
                                    }}
                                >
                                    {exportLoading === 'bracket' ? (
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    ) : null}
                                    Export Gambar
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {matches.length > 0 ? (
                                <Bracket
                                    {...(() => {
                                        // Transform flat matches to bracket rounds structure
                                        const roundsMap = {};

                                        // Filter matches for Bracket logic
                                        // For Group+Knockout, we only want to show the knockout stage in the bracket view
                                        const bracketMatches = isGroupKO
                                            ? matches.filter(m => {
                                                try {
                                                    const d = typeof m.details === 'string' ? JSON.parse(m.details) : m.details || {};
                                                    return d.stage === 'knockout';
                                                } catch (e) { return false; }
                                            })
                                            : matches;

                                        const maxRound = Math.max(...bracketMatches.map(m => m.round));

                                        bracketMatches.forEach(m => {
                                            let details = {};
                                            try {
                                                details = typeof m.details === 'string' ? JSON.parse(m.details) : m.details || {};
                                            } catch (e) {
                                                console.error("Parse error", e);
                                            }

                                            if (!roundsMap[m.round]) {
                                                let roundName = details.roundName || `Round ${m.round}`;

                                                // Fallback naming for standard knockout if no name in details
                                                if ((isKnockout || isGroupKO) && !details.roundName) {
                                                    if (m.round === maxRound) roundName = 'Final';
                                                    else if (m.round === maxRound - 1) roundName = 'Semi Final';
                                                }

                                                // If it's the final round and has 3rd place match, we might want to keep the name generic or handle specifically in Bracket component
                                                if (m.round === maxRound && bracketMatches.some(bm => {
                                                    try {
                                                        const d = typeof bm.details === 'string' ? JSON.parse(bm.details) : bm.details || {};
                                                        return bm.round === m.round && d.is3rdPlace;
                                                    } catch (e) { return false; }
                                                })) {
                                                    roundName = 'Finals';
                                                }

                                                roundsMap[m.round] = {
                                                    name: roundName,
                                                    matchesMap: {}
                                                };
                                            }

                                            const groupId = details.groupId || m.id;

                                            if (!roundsMap[m.round].matchesMap[groupId]) {
                                                roundsMap[m.round].matchesMap[groupId] = {
                                                    id: m.id,
                                                    home: {
                                                        name: m.home_team_name || m.home_player_name || 'TBD',
                                                        logo: m.home_logo,
                                                        id: m.home_team_id || m.home_player_id
                                                    },
                                                    away: {
                                                        name: m.away_team_name || m.away_player_name || 'TBD',
                                                        logo: m.away_logo,
                                                        id: m.away_team_id || m.away_player_id
                                                    },
                                                    scores: [],
                                                    homeWin: false,
                                                    awayWin: false,
                                                    isDoubleLeg: false,
                                                    matchIndex: details.matchIndex !== undefined ? Number(details.matchIndex) : 999,
                                                    is3rdPlace: details.is3rdPlace || false,
                                                    homePenalty: null,
                                                    awayPenalty: null
                                                };
                                            }

                                            const bracketMatch = roundsMap[m.round].matchesMap[groupId];

                                            const normalizeHomeName = (name) => (name || '').toLowerCase().trim();
                                            const isHome =
                                                (m.home_team_id && m.home_team_id === bracketMatch.home.id) ||
                                                (m.home_player_id && m.home_player_id === bracketMatch.home.id) ||
                                                (normalizeHomeName(m.home_team_name || m.home_player_name) === normalizeHomeName(bracketMatch.home.name));

                                            const homeScore = isHome ? m.home_score : m.away_score;
                                            const awayScore = isHome ? m.away_score : m.home_score;

                                            bracketMatch.scores.push({
                                                leg: details.leg || 1,
                                                home: homeScore,
                                                away: awayScore
                                            });

                                            // Capture penalty scores (from the relevant match, usually single leg or 2nd leg)
                                            if (m.home_penalty_score != null || m.away_penalty_score != null) {
                                                bracketMatch.homePenalty = isHome ? m.home_penalty_score : m.away_penalty_score;
                                                bracketMatch.awayPenalty = isHome ? m.away_penalty_score : m.home_penalty_score;
                                            }

                                            bracketMatch.scores.sort((a, b) => a.leg - b.leg);

                                            if (details.leg && bracketMatches.filter(mx => {
                                                const d = typeof mx.details === 'string' ? JSON.parse(mx.details) : mx.details || {};
                                                return (d.groupId === groupId);
                                            }).length > 1) {
                                                bracketMatch.isDoubleLeg = true;
                                                const allScoresPresent = bracketMatch.scores.length === 2 &&
                                                    bracketMatch.scores.every(s => s.home !== null && s.away !== null);

                                                if (allScoresPresent) {
                                                    const aggHome = bracketMatch.scores.reduce((sum, s) => sum + Number(s.home), 0);
                                                    const aggAway = bracketMatch.scores.reduce((sum, s) => sum + Number(s.away), 0);
                                                    bracketMatch.homeWin = aggHome > aggAway;
                                                    bracketMatch.awayWin = aggAway > aggHome;
                                                }
                                            } else {
                                                if (m.home_score !== null && m.away_score !== null) {
                                                    if (m.home_score !== null && m.away_score !== null) {
                                                        if (m.home_score > m.away_score) {
                                                            bracketMatch.homeWin = true;
                                                        } else if (m.away_score > m.home_score) {
                                                            bracketMatch.awayWin = true;
                                                        } else {
                                                            // Check penalties
                                                            const hp = m.home_penalty_score || 0;
                                                            const ap = m.away_penalty_score || 0;
                                                            if (hp > ap) bracketMatch.homeWin = true;
                                                            else if (ap > hp) bracketMatch.awayWin = true;
                                                            // else draw
                                                        }
                                                    }
                                                }
                                            }
                                        });

                                        const bracketData = Object.values(roundsMap).map(r => {
                                            const matches = Object.values(r.matchesMap);
                                            matches.sort((a, b) => (a.matchIndex ?? 999) - (b.matchIndex ?? 999));
                                            return {
                                                name: r.name,
                                                matches: matches
                                            };
                                        });

                                        let champion = null;
                                        if (bracketData.length > 0) {
                                            const finalRound = bracketData[bracketData.length - 1];
                                            if (finalRound) {
                                                const finalMatch = finalRound.matches.find(m => !m.is3rdPlace);
                                                if (finalMatch) {
                                                    if (finalMatch.homeWin) champion = finalMatch.home;
                                                    else if (finalMatch.awayWin) champion = finalMatch.away;
                                                }
                                            }
                                        }

                                        return { rounds: bracketData, champion };
                                    })()}
                                    onMatchClick={handleMatchClick}
                                    onGenerate3rdPlace={handleGenerate3rdPlace}
                                    show3rdPlaceButton={isOrganizer && canGenerate3rdPlace}
                                />
                            ) : (
                                <div className="p-8 text-center text-gray-500">
                                    Jadwal belum tersedia
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )
            }

            {/* Fixtures */}
            {
                activeTab === 'fixtures' && (
                    <div className="space-y-4">
                        {/* Show Generate Button if NO matches exist */}
                        {matches.length === 0 ? (
                            <Card className="text-center py-12 overflow-hidden relative">
                                <CardContent className="p-0">
                                    <div className="pt-12 px-6">
                                        <div className="w-16 h-16 bg-neonGreen/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Calendar className="w-8 h-8 text-neonGreen" />
                                        </div>
                                        <h3 className="text-xl font-bold font-display mb-2">Generate Jadwal Pertandingan</h3>
                                        <p className="text-gray-400 mb-8 max-w-md mx-auto">
                                            Jumlah peserta sudah memenuhi syarat. Anda dapat membuat jadwal pertandingan secara otomatis sekarang.
                                        </p>
                                    </div>

                                    {/* Player Carousel */}
                                    <div className="mb-8">
                                        <PlayerCarousel players={tournamentData.participants || []} />
                                    </div>

                                    <div className="pb-12 px-6">
                                        <Button onClick={handleGenerateSchedule} className="bg-neonGreen hover:bg-neonGreen/80 text-black mx-auto">
                                            <Sparkles className="w-4 h-4 mr-2" />
                                            Generate Jadwal
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-8">
                                {/* Group Matches by Round */}
                                {Object.entries(matches.reduce((acc, match) => {
                                    const roundKey = match.round;
                                    if (!acc[roundKey]) acc[roundKey] = [];
                                    acc[roundKey].push(match);
                                    return acc;
                                }, {})).map(([round, roundMatches]) => (
                                    <div
                                        key={round}
                                        className="space-y-4 p-4 rounded-xl transition-colors hover:bg-white/5"
                                        ref={el => fixturesRefs.current[round] = el}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="h-px bg-white/10 flex-1"></div>
                                            <h3 className="font-display font-bold text-neonGreen">
                                                {(() => {
                                                    if (isLeague) return `Matchday ${round}`;
                                                    const maxRound = Math.max(...matches.map(m => m.round));
                                                    const r = parseInt(round);

                                                    // Special case for 3rd Place round if it's mixed with Final
                                                    // In Fixtures tab, we group by round. If 3rd place is in the same round as final,
                                                    // we might need to show both names or just 'Finals'

                                                    if (r === maxRound) return 'Final';
                                                    if (r === maxRound - 1) return 'Semi Final';
                                                    return `Round ${round}`;
                                                })()}
                                            </h3>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-gray-500 hover:text-white"
                                                disabled={exportLoading === `round_${round}`}
                                                onClick={async () => {
                                                    const ref = fixturesRefs.current[round]
                                                    if (ref) {
                                                        setExportLoading(`round_${round}`)
                                                        try {
                                                            await exportToImage(ref, `fixtures_round_${round}_${Date.now()}.png`, {
                                                                backgroundColor: '#0a0a0a',
                                                                padding: 30,
                                                            })
                                                        } finally {
                                                            setExportLoading(null)
                                                        }
                                                    }
                                                }}
                                            >
                                                {exportLoading === `round_${round}` ? (
                                                    <Loader2 className="w-3 h-3 animate-spin" />
                                                ) : (
                                                    <Download className="w-3 h-3" />
                                                )}
                                            </Button>
                                            <div className="h-px bg-white/10 flex-1"></div>
                                        </div>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            {roundMatches
                                                .map(m => {
                                                    let d = {};
                                                    try { d = typeof m.details === 'string' ? JSON.parse(m.details) : m.details || {}; } catch (e) { }
                                                    return { ...m, _details: d };
                                                })
                                                .sort((a, b) => (a._details.leg || 0) - (b._details.leg || 0))
                                                .map(match => {
                                                    let roundName = '';
                                                    if (match._details.is3rdPlace) roundName = 'Perebutan Juara 3';

                                                    return (
                                                        <div key={match.id} className="space-y-2">
                                                            {roundName && (
                                                                <div className="text-[10px] uppercase tracking-widest font-bold text-gray-500 px-1">
                                                                    {roundName}
                                                                </div>
                                                            )}
                                                            <MatchCard
                                                                key={match.id}
                                                                home={{
                                                                    name: match.home_team_name || match.home_player_name || 'TBD',
                                                                    team: match.home_team_name, // If team name exists, use it as main
                                                                    player: match.home_team_name ? match.home_player_name : null, // If team name exists, showing player name as sub
                                                                    logo: match.home_logo
                                                                }}
                                                                away={{
                                                                    name: match.away_team_name || match.away_player_name || 'TBD',
                                                                    team: match.away_team_name,
                                                                    player: match.away_team_name ? match.away_player_name : null,
                                                                    logo: match.away_logo
                                                                }}
                                                                homeScore={match.home_score}
                                                                awayScore={match.away_score}
                                                                homePenalty={match.home_penalty_score}
                                                                awayPenalty={match.away_penalty_score}
                                                                status={match.status}
                                                                leg={match._details.leg}
                                                                group={match._details.groupName} // Pass group name
                                                                time={match.start_time ? new Date(match.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD'}
                                                                onClick={() => handleMatchClick(match.id)}
                                                                aggregate={getAggregateInfo(match)}
                                                                logoShape="square"
                                                            />
                                                        </div>
                                                    );
                                                })}
                                        </div>

                                        {/* Generate 3rd Place Button for Final Round */}
                                        {(() => {
                                            const maxRound = Math.max(...matches.map(m => m.round));
                                            if (parseInt(round) === maxRound && isOrganizer && canGenerate3rdPlace) {
                                                return (
                                                    <div className="flex justify-center mt-6">
                                                        <Button
                                                            size="sm"
                                                            onClick={handleGenerate3rdPlace}
                                                            className="bg-neonGreen/10 hover:bg-neonGreen/20 text-neonGreen border-neonGreen/30 px-8"
                                                        >
                                                            <Sparkles className="w-4 h-4 mr-2" />
                                                            Generate Perebutan Juara 3
                                                        </Button>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        })()}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )
            }
            {/* Statistics */}
            {
                activeTab === 'top_scores' && (
                    <div className="animate-fadeIn">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-display font-bold text-lg">Top Scorers</h3>
                            <div className="text-sm text-gray-400">Total: {topScorers.length} players</div>
                        </div>
                        <TopScorerList
                            scorers={topScorers}
                            ref={topScorersRef}
                            onExport={async () => {
                                if (topScorersRef.current) {
                                    setExportLoading('top_scorers')
                                    try {
                                        await exportTopScorersToImage(topScorersRef.current, tournamentData?.name || 'tournament')
                                        // showSuccess('Top Scorer berhasil diexport!') // Optional: Add success toast if desired, though export usually speaks for itself
                                    } catch (error) {
                                        console.error('Export failed:', error)
                                        // showError('Gagal mengexport gambar.') // Optional: Add error toast
                                    } finally {
                                        setExportLoading(null)
                                    }
                                }
                            }}
                        />
                    </div>
                )
            }

            {/* Statistics */}
            {
                activeTab === 'statistics' && (
                    <TournamentStatistics stats={statistics} loading={statisticsLoading} />
                )
            }

            {/* Prize Tab */}
            {
                activeTab === 'prize' && (
                    <div className="space-y-6 animate-fadeIn pb-20">
                        {/* Header Section */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/5 p-6 rounded-2xl border border-white/10">
                            <div>
                                <h3 className="text-2xl font-display font-bold text-white flex items-center gap-2">
                                    <Gift className="w-6 h-6 text-neonPink" />
                                    Hadiah Turnamen
                                </h3>
                                <p className="text-gray-400 text-sm mt-1">Kelola sumber dana dan distribusi hadiah peserta</p>
                            </div>
                            {isOrganizer && (
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-3 px-4 py-2 bg-black/40 border border-white/10 rounded-xl">
                                        <span className="text-sm font-medium text-gray-400">Status Fitur:</span>
                                        <button
                                            onClick={() => setPrizeSettings(prev => ({ ...prev, enabled: !prev.enabled }))}
                                            className={`relative w-12 h-6 rounded-full transition-all duration-300 ${prizeSettings.enabled ? 'bg-neonGreen shadow-[0_0_10px_rgba(57,255,20,0.4)]' : 'bg-gray-600'}`}
                                        >
                                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${prizeSettings.enabled ? 'left-7' : 'left-1'}`} />
                                        </button>
                                        <span className={`text-xs font-black tracking-widest ${prizeSettings.enabled ? 'text-neonGreen' : 'text-gray-500'}`}>
                                            {prizeSettings.enabled ? 'AKTIF' : 'NONAKTIF'}
                                        </span>
                                    </div>

                                    {prizeSettings.enabled && !isEditingPrizes && (
                                        <Button
                                            onClick={() => setIsEditingPrizes(true)}
                                            variant="secondary"
                                            className="bg-white/10 hover:bg-white/20 text-white border-white/10"
                                        >
                                            <Edit className="w-4 h-4 mr-2" />
                                            Ubah Pengaturan
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>

                        {prizeSettings.enabled ? (
                            isPrizeLoading ? (
                                <div className="flex items-center justify-center py-20">
                                    <Loader2 className="w-8 h-8 text-neonGreen animate-spin" />
                                </div>
                            ) : (
                                <>
                                    {/* Calculation Section */}
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        {/* Sources Card */}
                                        <Card hover={false} className="lg:col-span-2 overflow-hidden border-white/5 bg-black/40 backdrop-blur-sm">
                                            <CardHeader className="border-b border-white/5 bg-white/5">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className="p-1.5 bg-blue-500/10 rounded-lg">
                                                            <DollarSign className="w-4 h-4 text-blue-400" />
                                                        </div>
                                                        <h4 className="font-bold">Sumber Dana</h4>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="p-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                    <div className="space-y-6">
                                                        <div>
                                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Pendaftaran / Peserta</label>
                                                            <div className="flex items-center gap-3">
                                                                <div className="relative flex-1">
                                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">Rp</span>
                                                                    {isEditingPrizes ? (
                                                                        <Input
                                                                            type="text"
                                                                            inputMode="numeric"
                                                                            value={prizeSettings.sources.registrationFee}
                                                                            onChange={(e) => handleSourceChange('registrationFee', e.target.value.replace(/\D/g, ''))}
                                                                            className="pl-10 bg-white/5 border-white/10"
                                                                        />
                                                                    ) : (
                                                                        <div className="pl-10 py-2 border border-transparent font-bold">
                                                                            {Number(prizeSettings.sources.registrationFee).toLocaleString('id-ID')}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="text-gray-500">×</div>
                                                                <div className="w-20 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-center font-bold">
                                                                    {prizeSettings.sources.playerCount}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Sponsor / Tambahan</label>
                                                            <div className="relative">
                                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">Rp</span>
                                                                {isEditingPrizes ? (
                                                                    <Input
                                                                        type="text"
                                                                        inputMode="numeric"
                                                                        value={prizeSettings.sources.sponsor}
                                                                        onChange={(e) => handleSourceChange('sponsor', e.target.value.replace(/\D/g, ''))}
                                                                        className="pl-10 bg-white/5 border-white/10"
                                                                    />
                                                                ) : (
                                                                    <div className="pl-10 py-2 border border-transparent font-bold">
                                                                        {Number(prizeSettings.sources.sponsor).toLocaleString('id-ID')}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-6">
                                                        <div>
                                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Biaya Admin (Pengurangan)</label>
                                                            <div className="relative">
                                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">Rp</span>
                                                                {isEditingPrizes ? (
                                                                    <Input
                                                                        type="text"
                                                                        inputMode="numeric"
                                                                        value={prizeSettings.sources.adminFee}
                                                                        onChange={(e) => handleSourceChange('adminFee', e.target.value.replace(/\D/g, ''))}
                                                                        className="pl-10 bg-white/5 border-red-500/30 text-red-500 font-bold"
                                                                    />
                                                                ) : (
                                                                    <div className="pl-10 py-2 border border-transparent font-bold text-red-500">
                                                                        {Number(prizeSettings.sources.adminFee).toLocaleString('id-ID')}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="p-4 bg-neonGreen/5 border border-neonGreen/20 rounded-xl shadow-lg shadow-neonGreen/5">
                                                            <div className="text-xs font-bold text-neonGreen uppercase tracking-wider mb-1">Total Prize Pool</div>
                                                            <div className="text-3xl font-display font-black text-white">
                                                                Rp {prizeSettings.totalPrizePool.toLocaleString('id-ID')}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Summary Card */}
                                        <Card hover={false} className="border-white/5 bg-gradient-to-br from-gray-900 to-black relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-500">
                                                <Trophy className="w-32 h-32 text-neonGreen" />
                                            </div>
                                            <CardHeader>
                                                <h4 className="font-bold">Ringkasan Distribusi</h4>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                                                    <span className="text-sm text-gray-400">Total Kategori</span>
                                                    <span className="font-bold text-white">{prizeSettings.recipients.length}</span>
                                                </div>
                                                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                                                    <span className="text-sm text-gray-400">Persentase Terpakai</span>
                                                    <span className={`font-bold ${prizeSettings.recipients.reduce((sum, r) => sum + (Number(r.percentage) || 0), 0) === 100 ? 'text-neonGreen' : 'text-red-400'}`}>
                                                        {prizeSettings.recipients.reduce((sum, r) => sum + (Number(r.percentage) || 0), 0)}%
                                                    </span>
                                                </div>
                                                <div className="mt-6">
                                                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Preview Hadiah</div>
                                                    <div className="space-y-3">
                                                        {prizeSettings.recipients.slice(0, 4).map((r, i) => (
                                                            <div key={i} className="flex items-center gap-3">
                                                                <div className={`w-1 h-6 rounded-full ${i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-gray-400' : 'bg-orange-500'}`} />
                                                                <div className="flex-1">
                                                                    <div className="text-xs font-bold truncate">{r.label}</div>
                                                                    <div className="text-[10px] text-gray-400">Rp {Number(r.amount).toLocaleString('id-ID')}</div>
                                                                </div>
                                                                <div className="text-xs font-mono font-bold text-gray-500">{r.percentage}%</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* Recipients Management */}
                                    <Card hover={false} className="border-white/5 bg-black/40 backdrop-blur-sm overflow-hidden">
                                        <CardHeader className="border-b border-white/5 flex flex-row items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 bg-neonPink/10 rounded-lg">
                                                    <Medal className="w-4 h-4 text-neonPink" />
                                                </div>
                                                <h4 className="font-bold">Penerima Hadiah</h4>
                                            </div>
                                            {isOrganizer && isEditingPrizes && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={addRecipient}
                                                    className="text-neonPink hover:bg-neonPink/10"
                                                >
                                                    <Plus className="w-4 h-4 mr-1" /> Tambah Kategori
                                                </Button>
                                            )}
                                        </CardHeader>
                                        <CardContent className="p-0">
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left border-collapse">
                                                    <thead>
                                                        <tr className="bg-white/5 border-b border-white/5">
                                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Kategori / Gelar</th>
                                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Persentase</th>
                                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Nominal Hadiah</th>
                                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Pemenang</th>
                                                            {isOrganizer && isEditingPrizes && <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Aksi</th>}
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-white/5">
                                                        {prizeSettings.recipients.map((recipient) => (
                                                            <tr key={recipient.id} className="group hover:bg-white/[0.02] transition-colors">
                                                                <td className="px-6 py-4">
                                                                    {isEditingPrizes ? (
                                                                        <Input
                                                                            value={recipient.label}
                                                                            onChange={(e) => handleRecipientChange(recipient.id, 'label', e.target.value)}
                                                                            className="h-9 bg-white/5 border-white/10 font-bold text-sm"
                                                                            placeholder="Contoh: Juara 1"
                                                                        />
                                                                    ) : (
                                                                        <div className="font-bold text-white">{recipient.label}</div>
                                                                    )}
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <div className="flex items-center gap-2 w-24">
                                                                        {isEditingPrizes ? (
                                                                            <>
                                                                                <Input
                                                                                    type="text"
                                                                                    inputMode="numeric"
                                                                                    value={recipient.percentage}
                                                                                    onChange={(e) => handleRecipientChange(recipient.id, 'percentage', e.target.value.replace(/\D/g, ''))}
                                                                                    className="h-9 bg-white/5 border-white/10 text-center font-mono"
                                                                                />
                                                                                <span className="text-gray-500">%</span>
                                                                            </>
                                                                        ) : (
                                                                            <span className="font-mono text-gray-300">{recipient.percentage}%</span>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4 font-mono">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-gray-500 text-xs">Rp</span>
                                                                        <span className="font-bold text-white">
                                                                            {Number(recipient.amount).toLocaleString('id-ID')}
                                                                        </span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    {(() => {
                                                                        const autoWinner = tournamentData.status === 'completed' ? getAutomaticWinner(recipient) : null;
                                                                        if (autoWinner) {
                                                                            return (
                                                                                <div className="flex items-center gap-2">
                                                                                    <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                                                                                        {autoWinner.logo ? (
                                                                                            <img src={autoWinner.logo} alt="" className="w-full h-full object-cover" />
                                                                                        ) : (
                                                                                            <User className="w-4 h-4 text-neonPink" />
                                                                                        )}
                                                                                    </div>
                                                                                    <div className="flex flex-col">
                                                                                        <span className="text-sm font-bold text-white">{autoWinner.name}</span>
                                                                                        {autoWinner.sub && <span className="text-[10px] text-gray-500">{autoWinner.sub}</span>}
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        }
                                                                        return (
                                                                            <div className="flex items-center gap-2">
                                                                                <div className="w-8 h-8 rounded-lg bg-white/5 border border-dashed border-white/10 flex items-center justify-center">
                                                                                    <User className="w-4 h-4 text-gray-600" />
                                                                                </div>
                                                                                <span className="text-xs text-gray-500 italic">Belum ditentukan</span>
                                                                            </div>
                                                                        );
                                                                    })()}
                                                                </td>
                                                                {isOrganizer && isEditingPrizes && (
                                                                    <td className="px-6 py-4 text-right">
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={() => removeRecipient(recipient.id)}
                                                                            className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                        >
                                                                            <Trash2 className="w-4 h-4" />
                                                                        </Button>
                                                                    </td>
                                                                )}
                                                            </tr>
                                                        ))}
                                                        {prizeSettings.recipients.length === 0 && (
                                                            <tr>
                                                                <td colSpan={isOrganizer && isEditingPrizes ? 5 : 4} className="px-6 py-12 text-center text-gray-600 italic">
                                                                    Belum ada kategori hadiah. {isEditingPrizes ? 'Klik "Tambah Kategori" untuk memulai.' : ''}
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Save Button for Edit Mode */}
                                    {isOrganizer && isEditingPrizes && (
                                        <div className="flex justify-end gap-3 mt-8">
                                            <Button
                                                variant="secondary"
                                                onClick={() => setIsEditingPrizes(false)}
                                                className="bg-white/5 hover:bg-white/10 text-white border-white/10"
                                            >
                                                Batal
                                            </Button>
                                            <Button
                                                onClick={handleSavePrizes}
                                                disabled={isSaving}
                                                className="bg-neonGreen hover:bg-neonGreen/80 text-black font-black px-8"
                                            >
                                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                                Simpan Perubahan
                                            </Button>
                                        </div>
                                    )}
                                </>
                            )
                        ) : (
                            /* Disabled State Placeholder */
                            <div className="flex flex-col items-center justify-center py-20 bg-white/5 rounded-2xl border border-dashed border-white/10">
                                <Gift className="w-16 h-16 text-gray-700 mb-4 opacity-20" />
                                <h4 className="text-gray-500 font-bold">Fitur Hadiah Dinonaktifkan</h4>
                                <p className="text-gray-600 text-sm mt-1">Aktifkan status di atas untuk mulai mengatur hadiah turnamen</p>
                            </div>
                        )}
                    </div>
                )
            }

            {/* Players - Unified view with Alerts */}
            {
                activeTab === 'players' && (
                    <div className="space-y-4">
                        {/* Participant Alerts */}
                        {(() => {
                            const participants = tournamentData.participants || []
                            const approvedCount = participants.filter(p => p.status === 'approved').length
                            // Ensure maxParticipants is an integer
                            const maxParticipants = parseInt(tournamentData.max_participants || tournamentData.maxParticipants || tournamentData.players || 0, 10)
                            const type = (tournamentData.type || '').toLowerCase()

                            if (type === 'knockout' || type === 'group_knockout') {
                                if (approvedCount < maxParticipants) {
                                    return (
                                        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-start gap-3">
                                            <Trophy className="w-5 h-5 text-yellow-500 mt-0.5" />
                                            <div>
                                                <h4 className="font-bold text-yellow-500">Peserta Belum Cukup</h4>
                                                <p className="text-sm text-gray-400">
                                                    Saat ini baru {approvedCount} dari {maxParticipants} peserta.
                                                    Silakan tambahkan peserta sampai jumlahnya pas.
                                                </p>
                                            </div>
                                        </div>
                                    )
                                } else if (approvedCount === maxParticipants) {
                                    return (
                                        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex items-start gap-3">
                                            <Shield className="w-5 h-5 text-green-500 mt-0.5" />
                                            <div>
                                                <h4 className="font-bold text-green-500">Jumlah Peserta Pas!</h4>
                                                <p className="text-sm text-gray-400">
                                                    Slot terpenuhi ({approvedCount}/{maxParticipants}).
                                                    Segera generate jadwal pada tab <strong>Jadwal</strong>.
                                                </p>
                                            </div>
                                        </div>
                                    )
                                } else {
                                    // Over capacity - Danger Alert
                                    return (
                                        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
                                            <Users className="w-5 h-5 text-red-500 mt-0.5" />
                                            <div>
                                                <h4 className="font-bold text-red-500">Peserta Berlebih!</h4>
                                                <p className="text-sm text-gray-400">
                                                    Total {approvedCount} peserta (Maksimal: {maxParticipants}).
                                                    Silakan hapus {approvedCount - maxParticipants} peserta agar sesuai slot.
                                                </p>
                                            </div>
                                        </div>
                                    )
                                }
                            } else if (type === 'league') {
                                if (approvedCount < 3) {
                                    return (
                                        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-start gap-3">
                                            <Trophy className="w-5 h-5 text-yellow-500 mt-0.5" />
                                            <div>
                                                <h4 className="font-bold text-yellow-500">Peserta Kurang</h4>
                                                <p className="text-sm text-gray-400">
                                                    Minimal 3 peserta untuk format Liga (Round Robin). Saat ini: {approvedCount}.
                                                </p>
                                            </div>
                                        </div>
                                    )
                                } else {
                                    return (
                                        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex items-start gap-3">
                                            <Shield className="w-5 h-5 text-green-500 mt-0.5" />
                                            <div>
                                                <h4 className="font-bold text-green-500">Peserta Siap</h4>
                                                <p className="text-sm text-gray-400">
                                                    Terkumpul {approvedCount} peserta. Siap untuk generate jadwal.
                                                </p>
                                            </div>
                                        </div>
                                    )
                                }
                            }
                            return null
                        })()}

                        {/* Owner Join Alert */}
                        {isDraft && isOrganizer && !(tournamentData.participants || []).some(p => p.user_id === user?.id) && (
                            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fadeIn">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-blue-500/20 rounded-lg shrink-0">
                                        <User className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-blue-400">Ikut Serta dalam Kompetisi</h4>
                                        <p className="text-sm text-gray-400">
                                            Anda bisa mendaftarkan diri Anda sendiri ke dalam turnamen ini.
                                        </p>
                                    </div>
                                </div>
                                <Link to={`/dashboard/competitions/${tournamentData.slug || id}/join`} className="w-full sm:w-auto">
                                    <Button size="sm" className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white border-none whitespace-nowrap justify-center">
                                        Gabung Kompetisi
                                    </Button>
                                </Link>
                            </div>
                        )}

                        {isDraft ? (
                            <DraftPlayerList
                                players={tournamentData.participants || []}
                                tournamentId={id}
                                navigate={navigate}
                                onStatusUpdate={handleStatusUpdate}
                                onEdit={handleEditParticipant}
                                isPrivate={tournamentData.visibility === 'private'}
                                onInvite={() => setIsInviteModalOpen(true)}
                            />
                        ) : (
                            <Card hover={false}>
                                <CardHeader className="flex items-center justify-between">
                                    <h3 className="font-display font-bold">Daftar Pemain</h3>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="space-y-3 p-4">
                                        {(tournamentData.participants || []).map((participant, i) => (
                                            <div key={participant.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                                                <div className="flex items-center gap-4 w-full sm:w-auto">
                                                    {participant.logo_url ? (
                                                        <img src={participant.logo_url} alt={participant.name} className="w-10 h-10 object-contain" />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center text-blue-400 font-bold">
                                                            {participant.team_name?.charAt(0) || participant.name?.charAt(0)}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <h4 className="font-bold text-white">{participant.team_name || 'No Team'}</h4>
                                                        <div className="flex items-center gap-1">
                                                            <p className="text-sm text-gray-400">{participant.name}</p>
                                                            {(participant.tier || participant.user?.tier) && (
                                                                <UserBadge tier={participant.tier || participant.user?.tier} size="sm" className="scale-75 origin-left" />
                                                            )}
                                                        </div>
                                                        {(participant.username || participant.user?.username) && (
                                                            <p className="text-xs text-neonGreen mt-0.5">@{participant.username || participant.user?.username}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                                                    <div className="text-right">
                                                        <span className="text-xs px-2 py-1 rounded-full bg-gray-500/20 text-gray-400 border border-gray-500/30 capitalize">
                                                            {participant.status}
                                                        </span>
                                                        <p className="text-xs text-gray-500 mt-2">{formatDate(participant.created_at)}</p>
                                                    </div>
                                                    <Button variant="ghost" size="sm">
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                        {(tournamentData.participants || []).length === 0 && (
                                            <div className="p-4 text-center text-gray-500">
                                                Belum ada pemain yang terdaftar.
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )
            }

            {/* Detail Modal */}
            <Modal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                title="Detail Pengaturan Turnamen"
            >
                <div className="space-y-4">
                    <div className="p-4 bg-white/5 rounded-lg flex items-center gap-4">
                        <div className="w-14 h-14 rounded-lg bg-white/10 flex items-center justify-center">
                            <Trophy className="w-6 h-6 text-neonGreen" />
                        </div>
                        <div>
                            <div className="text-sm text-gray-500 mb-1">Nama Turnamen</div>
                            <div className="font-bold text-lg">{tournamentData.name}</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white/5 rounded-lg">
                            <div className="text-sm text-gray-500 mb-1">Jenis</div>
                            <div className="font-medium">{tournamentData.type}</div>
                        </div>
                        <div className="p-4 bg-white/5 rounded-lg">
                            <div className="text-sm text-gray-500 mb-1">Total Peserta</div>
                            <div className="font-medium">{tournamentData.players} Tim</div>
                        </div>
                        <div className="p-4 bg-white/5 rounded-lg">
                            <div className="text-sm text-gray-500 mb-1">Sistem Poin</div>
                            <div className="font-medium">{tournamentData.pointSystem || '3-1-0'}</div>
                        </div>
                        <div className="p-4 bg-white/5 rounded-lg">
                            <div className="text-sm text-gray-500 mb-1">Format</div>
                            <div className="font-medium">{tournamentData.homeAway ? 'Home & Away' : 'Single Match'}</div>
                        </div>
                        <div className="p-4 bg-white/5 rounded-lg">
                            <div className="text-sm text-gray-500 mb-1">Visibilitas</div>
                            <div className="font-medium capitalize">{tournamentData.visibility || 'public'}</div>
                        </div>
                        <div className="p-4 bg-white/5 rounded-lg">
                            <div className="text-sm text-gray-500 mb-1">Pembayaran</div>
                            <div className="font-medium">
                                {tournamentData.paymentMode === 'system' ? 'System (Auto)' : 'Manual'}
                            </div>
                        </div>
                        <div className="p-4 bg-white/5 rounded-lg col-span-2">
                            <div className="text-sm text-gray-500 mb-1">Batas Pendaftaran</div>
                            <div className="font-medium">
                                {tournamentData.lastRegistrationDate || new Date(tournamentData.startDate).toLocaleDateString()}
                            </div>
                        </div>
                    </div>

                    {tournamentData.description && (
                        <div className="p-4 bg-white/5 rounded-lg border border-white/5">
                            <div className="text-sm text-gray-500 mb-1">Deskripsi Turnamen</div>
                            <p className="text-gray-300 italic">"{tournamentData.description}"</p>
                        </div>
                    )}

                    <div className="flex justify-end pt-2">
                        <Button onClick={() => setIsDetailModalOpen(false)}>Tutup</Button>
                    </div>
                </div>
            </Modal>



            {/* Edit Participant Modal */}
            <EditParticipantModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false)
                    setEditingParticipant(null)
                }}
                participant={editingParticipant}
                onSave={handleSaveParticipant}
                onDelete={handleRequestDelete}
                isDeleting={isDeletingParticipant}
            />

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={deleteConfirmation.isOpen}
                onClose={() => setDeleteConfirmation({ isOpen: false, participantId: null, participantName: '' })}
                onConfirm={handleConfirmDelete}
                title="Hapus Peserta?"
                message={`Apakah Anda yakin ingin menghapus "${deleteConfirmation.participantName}"?`}
                confirmText={isDeletingParticipant ? 'Menghapus...' : 'Ya, Hapus'}
                confirmVariant="danger"
                isLoading={isDeletingParticipant}
            />

            {/* Generate Confirmation Modal */}
            <ConfirmationModal
                isOpen={isGenerateModalOpen}
                onClose={() => setIsGenerateModalOpen(false)}
                onConfirm={startGenerationProcess}
                title="Generate Jadwal Pertandingan?"
                message="Sistem akan mengacak tim dan membuat jadwal pertandingan secara otomatis. Pastikan semua peserta sudah terdaftar."
                confirmText="Ya, Buat Jadwal"
                confirmVariant="primary"
            />

            {/* HEBOH Loading Overlay */}
            {
                isGenerating && createPortal(
                    <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[9999] flex flex-col items-center justify-center p-4">
                        {/* Background Effects */}
                        <div className="absolute inset-0 overflow-hidden">
                            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neonGreen/20 rounded-full blur-[100px] animate-pulse"></div>
                            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neonPink/20 rounded-full blur-[100px] animate-pulse delay-700"></div>
                        </div>

                        <div className="relative z-10 w-full max-w-2xl text-center">
                            <div className="mb-12">
                                <div className="text-neonGreen font-mono text-sm tracking-[0.3em] mb-2 animate-pulse">{generationStep}</div>
                                <div className="h-1 w-64 mx-auto bg-gray-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-neonGreen animate-[shimmer_2s_infinite]"></div>
                                </div>
                            </div>

                            {/* VS Container */}
                            <div className="flex items-center justify-center gap-4 sm:gap-12 perspective-1000">
                                {/* Home Team Card */}
                                <div className="w-40 sm:w-64 aspect-video bg-black/50 border-2 border-neonGreen/50 rounded-xl flex items-center justify-center relative overflow-hidden group shadow-[0_0_30px_rgba(57,255,20,0.2)]">
                                    <div className="absolute inset-0 bg-neonGreen/10 animate-pulse"></div>
                                    <div className="relative z-10 p-4 flex flex-col items-center justify-center text-center">
                                        {shufflingTeams.home.logo ? (
                                            <img src={shufflingTeams.home.logo} alt="Home" className="w-12 h-12 sm:w-16 sm:h-16 object-contain mb-3" />
                                        ) : (
                                            <div className="text-4xl mb-2 opacity-50"><Shield /></div>
                                        )}
                                        <div className="font-display font-bold text-lg sm:text-2xl text-white truncate max-w-full px-2 animate-[bounce_0.5s_infinite]">{shufflingTeams.home.name}</div>
                                    </div>
                                </div>

                                {/* VS Badge */}
                                <div className="relative">
                                    <div className="absolute inset-0 bg-white blur-xl opacity-20 animate-pulse"></div>
                                    <div className="text-4xl sm:text-6xl font-black font-display italic text-transparent bg-clip-text bg-gradient-to-br from-neonGreen to-neonPink transform -skew-x-12 scale-110">
                                        VS
                                    </div>
                                </div>

                                {/* Away Team Card */}
                                <div className="w-40 sm:w-64 aspect-video bg-black/50 border-2 border-neonPink/50 rounded-xl flex items-center justify-center relative overflow-hidden group shadow-[0_0_30px_rgba(255,20,147,0.2)]">
                                    <div className="absolute inset-0 bg-neonPink/10 animate-pulse"></div>
                                    <div className="relative z-10 p-4 flex flex-col items-center justify-center text-center">
                                        {shufflingTeams.away.logo ? (
                                            <img src={shufflingTeams.away.logo} alt="Away" className="w-12 h-12 sm:w-16 sm:h-16 object-contain mb-3" />
                                        ) : (
                                            <div className="text-4xl mb-2 opacity-50"><Shield /></div>
                                        )}
                                        <div className="font-display font-bold text-lg sm:text-2xl text-white truncate max-w-full px-2 animate-[bounce_0.5s_infinite]">{shufflingTeams.away.name}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Scrolling Log / Decoration */}
                            <div className="mt-12 text-xs font-mono text-gray-500 opacity-50">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="truncate max-w-md mx-auto py-1">
                                        [SYSTEM] Processing algorithm node_{Math.random().toString(36).substr(2, 5)}... OK
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    , document.body)
            }

            {/* Generate 3rd Place Confirmation Modal */}
            <Modal
                isOpen={is3rdPlaceModalOpen}
                onClose={() => setIs3rdPlaceModalOpen(false)}
                title="Generate Perebutan Juara 3"
            >
                <div className="space-y-6">
                    <div className="w-16 h-16 bg-neonGreen/10 rounded-full flex items-center justify-center mx-auto">
                        <Sparkles className="w-8 h-8 text-neonGreen" />
                    </div>
                    <div className="text-center">
                        <h3 className="text-xl font-bold text-white mb-2">Buat Pertandingan Juara 3?</h3>
                        <p className="text-gray-400 text-sm">
                            Sistem akan otomatis mengambil tim yang kalah di Semi Final untuk dipertemukan dalam pertandingan perebutan juara 3.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="ghost" onClick={() => setIs3rdPlaceModalOpen(false)} className="flex-1">
                            Batal
                        </Button>
                        <Button onClick={start3rdPlaceGeneration} className="flex-1 bg-neonGreen hover:bg-neonGreen/80 text-black">
                            Ya, Generate
                        </Button>
                    </div>
                </div>
            </Modal>

            <InviteUserModal
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                tournamentId={id}
            />

            {/* Share Modal */}
            <ShareModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                link={tournamentData?.shareLink}
                text={`Lihat turnamen ${tournamentData?.name} di BikinLiga!`}
                title="Bagikan Turnamen"
            />
        </div>
    )
}

