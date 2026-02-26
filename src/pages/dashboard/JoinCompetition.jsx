import React, { useState, useEffect } from 'react'
import { authFetch } from '../../utils/api'
import ReactJoyride, { EVENTS, STATUS } from 'react-joyride'
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom'
import { ArrowLeft, Loader2, User, Phone, Shield, Trophy, Users, Calendar, Sparkles, ShieldCheck, Newspaper, ClipboardList, MessageSquare, MessageCircle, ChevronDown, Send, CheckCircle, XCircle, Clock, Trash2, Edit, Share2, Mail, ImagePlus, Gift, DollarSign, Medal, Activity } from 'lucide-react'
import Card, { CardHeader, CardContent, CardTitle, CardDescription } from '../../components/ui/Card'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import SearchableSelect from '../../components/ui/SearchableSelect'
import AdSlot from '../../components/ui/AdSlot'
import Navbar from '../../components/landing/Navbar'
import { useToast } from '../../contexts/ToastContext'
import { useAuth } from '../../contexts/AuthContext'
import UserBadge from '../../components/ui/UserBadge'
import AdaptiveLogo from '../../components/ui/AdaptiveLogo'
import ShareDestinationModal from '../../components/ui/ShareDestinationModal'
import WhatsAppModal from '../../components/modals/WhatsAppModal'
import ConfirmationModal from '../../components/ui/ConfirmationModal'

// League options from eFootball DB API (2025 Update)
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

export default function JoinCompetition() {
    const { user } = useAuth()
    const { success: showSuccess, error: showError, warning: showWarning } = useToast()
    const { id } = useParams()
    const navigate = useNavigate()
    const location = useLocation()
    const isPublic = location.pathname.startsWith('/join')

    // Move participants state up so isJoined can use it
    const [participants, setParticipants] = useState([])
    // Move isJoined definition up before effects
    // user is already defined above
    const isJoined = participants.some(p => p.user_id === user?.id)

    const [competitionData, setCompetitionData] = useState(null)
    const [loadingData, setLoadingData] = useState(true)

    const [formData, setFormData] = useState({
        league: '',
        team: '',
        teamId: '',
        teamLogo: '',
    })

    // Invite Acceptance State - leveraging existing formData
    const [loading, setLoading] = useState(false)
    const [activeTab, setActiveTab] = useState('register')

    const [showWhatsAppModal, setShowWhatsAppModal] = useState(false)
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)
    const [isPaymentConfirmOpen, setIsPaymentConfirmOpen] = useState(false)
    const [isSponsorModalOpen, setIsSponsorModalOpen] = useState(false)
    const [sponsorAmount, setSponsorAmount] = useState('')
    const [isSponsorSubmitting, setIsSponsorSubmitting] = useState(false)

    // Tour State
    const [runTour, setRunTour] = useState(false);
    const [tourSteps, setTourSteps] = useState([
        {
            target: '#tour-join-header',
            content: 'Selamat datang di halaman pendaftaran! Di sini kamu bisa mendaftar untuk mengikuti kompetisi.',
            title: 'Registrasi Kompetisi',
            disableBeacon: true,
        },
        {
            target: '#tour-join-info',
            content: 'Cek detail kompetisi, jadwal, format pertandingan, tier, serta slot yang tersedia sebelum mendaftar.',
            title: 'Detail Kompetisi',
        },
        {
            target: '#tour-join-tabs',
            content: 'Gunakan tab ini untuk melihat daftar peserta yang sudah bergabung atau berita terbaru seputar liga.',
            title: 'Navigasi Tab',
        },
        {
            target: '#tour-join-form',
            content: 'Isi formulir ini dengan lengkap untuk mendaftarkan tim kamu.',
            title: 'Formulir Pendaftaran',
        },
        {
            target: '#tour-join-league',
            content: 'Pilih liga asal tim kamu (misalnya: English League, Spanish League, dsb).',
            title: 'Pilih Liga',
        },
        {
            target: '#tour-join-team',
            content: 'Pilih tim yang akan kamu gunakan dalam kompetisi ini. Pastikan pilihanmu sudah benar.',
            title: 'Pilih Tim',
        },
        {
            target: '#tour-join-submit',
            content: 'Klik tombol ini untuk mengirim pendaftaranmu. Semoga beruntung!',
            title: 'Kirim Pendaftaran',
        }
    ]);

    useEffect(() => {
        // Only run tour if data is loaded, user is logged in, and hasn't seen it yet
        if (!loadingData && competitionData && user) {
            const tourSeen = localStorage.getItem('join_competition_tour_seen');
            if (!tourSeen && !isJoined) { // Don't run if already joined
                setRunTour(true);
            }
        }
    }, [loadingData, competitionData, user, isJoined]);

    const handleJoyrideCallback = (data) => {
        const { status } = data;
        const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];
        if (finishedStatuses.includes(status)) {
            setRunTour(false);
            localStorage.setItem('join_competition_tour_seen', 'true');
        }
    };

    useEffect(() => {
        if (user && !user.phone) {
            setShowWhatsAppModal(true)
        }
    }, [user])

    useEffect(() => {
        if (user && !user.phone) {
            setShowWhatsAppModal(true)
        }
    }, [user])

    // Redirect logic if user is joined and status is NOT pending (e.g. approved)
    // Redirect logic if user is joined and status is NOT pending (e.g. approved)
    useEffect(() => {
        if (isJoined && competitionData) {
            const myParticipant = participants.find(p => p.user_id === user?.id)

            // If invited, stay here to show invite UI
            if (myParticipant?.status === 'invited') {
                return
            }

            // Only redirect to view if tournament is NOT in draft mode
            // If draft, stay here (so they see the "Waiting for start" or similar state implicitly by being in Join page)
            if (myParticipant && myParticipant.status !== 'pending' && competitionData.status !== 'draft') {
                navigate(`/dashboard/competitions/${id}/view`)
                return
            }

            // If status is pending, show participants tab but stay here (to allow edit)
            if (activeTab === 'register') {
                setActiveTab('participants')
            }
        }
    }, [isJoined, activeTab, participants, user?.id, id, navigate, competitionData])

    const [newsList, setNewsList] = useState([])
    const [isNewsLoading, setIsNewsLoading] = useState(false)
    const [commentsMap, setCommentsMap] = useState({})
    const [newComment, setNewComment] = useState('')
    const [openThreadNewsId, setOpenThreadNewsId] = useState(null)
    const [shareModalOpen, setShareModalOpen] = useState(false)
    const [teams, setTeams] = useState([])
    const [loadingTeams, setLoadingTeams] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [error, setError] = useState('')

    const teamOptions = [
        { value: '', label: loadingTeams ? 'Memuat tim...' : 'Pilih Tim...' },
        ...teams.map(team => ({
            value: String(team.id),
            label: team.name
        }))
    ]

    const handleTeamChange = (e) => {
        const selectedTeamId = e.target.value
        const selectedTeam = teams.find(t => String(t.id) === selectedTeamId)

        setFormData(prev => ({
            ...prev,
            team: selectedTeam?.name || '',
            teamId: selectedTeamId,
            teamLogo: selectedTeam?.logo || ''
        }))
    }

    // Fetch teams when league changes
    useEffect(() => {
        if (!formData.league) {
            setTeams([])
            return
        }

        const fetchTeams = async () => {
            setLoadingTeams(true)
            setError('')
            setTeams([])
            setFormData(prev => ({ ...prev, team: '', teamId: '', teamLogo: '' }))

            try {
                // Use proxy API to avoid CORS issues on Vercel
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

                    // Remove duplicates based on team ID
                    const uniqueTeams = filteredTeams.filter((team, index, self) =>
                        index === self.findIndex(t => t.id === team.id)
                    )

                    setTeams(uniqueTeams)
                }
            } catch (err) {
                console.error('Error fetching teams:', err)
                setError('Gagal memuat data tim. Silakan coba lagi.')
            } finally {
                setLoadingTeams(false)
            }
        }

        fetchTeams()
    }, [formData.league])

    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [editingParticipant, setEditingParticipant] = useState(null)

    const handleEditClick = (player) => {
        setEditingParticipant(player)
        setIsEditModalOpen(true)
    }

    const handleSaveParticipant = async (participantId, updateData) => {
        try {
            const res = await authFetch(`/api/tournaments/${id}/participants/${participantId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData)
            })
            const data = await res.json()
            if (data.success) {
                showSuccess('Data tim berhasil diperbarui')
                setIsEditModalOpen(false)
                // Refresh data
                const resList = await authFetch(`/api/tournaments/${id}`)
                const dataList = await resList.json()
                if (dataList.success) {
                    setParticipants(dataList.data.participants || [])
                }
            } else {
                showError(data.message || 'Gagal memperbarui data')
            }
        } catch (err) {
            console.error(err)
            showError('Terjadi kesalahan saat menyimpan data')
        }
    }

    // Fetch Competition and Participants data
    useEffect(() => {
        const fetchCompetition = async () => {
            try {
                setLoadingData(true)
                const res = await authFetch(`/api/tournaments/${id}`)
                const data = await res.json()
                if (data.success) {
                    setCompetitionData(data.data)
                    setParticipants(data.data.participants || [])
                } else {
                    setError('Gagal memuat data kompetisi.')
                }
            } catch (error) {
                console.error('Error fetching competition:', error)
                navigate('/dashboard/competitions')
            } finally {
                setLoadingData(false)
            }
        }
        if (id) fetchCompetition()
    }, [id, navigate])

    useEffect(() => {
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

    const isInvited = participants.find(p => p.user_id === user?.id && p.status === 'invited')

    const handleAcceptInvite = async (e) => {
        e.preventDefault()
        if (!formData.team) {
            showError('Mohon lengkapi semua data required (*)')
            return
        }

        setLoading(true)
        try {
            const myParticipant = participants.find(p => p.user_id === user?.id)
            const response = await authFetch(`/api/tournaments/${id}/participants/${myParticipant.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    status: 'pending', // Changing status to pending means accepting
                    team_name: formData.team,
                    phone: user?.phone || user?.whatsapp || '-',
                    logo_url: formData.teamLogo
                })
            })

            const result = await response.json()

            if (result.success) {
                showSuccess('Undangan berhasil diterima! Menunggu persetujuan final penyelenggara.')
                // Refresh data
                const event = new CustomEvent('tournamentUpdated')
                window.dispatchEvent(event)
                navigate(`/dashboard/competitions/${id}/view`)
            } else {
                showError(result.message || 'Gagal menerima undangan')
            }
        } catch (err) {
            console.error('Error accepting invite:', err)
            showError('Terjadi kesalahan saat menerima undangan')
        } finally {
            setLoading(false)
        }
    }

    const handleRejectInvite = () => {
        setIsRejectModalOpen(true)
    }

    const confirmReject = async () => {
        setLoading(true)
        try {
            const myParticipant = participants.find(p => p.user_id === user?.id)
            const response = await authFetch(`/api/tournaments/${id}/participants/${myParticipant.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    status: 'declined'
                })
            })

            const result = await response.json()

            if (result.success) {
                showSuccess('Undangan telah ditolak')
                navigate('/dashboard/competitions')
            } else {
                showError(result.message || 'Gagal menolak undangan')
            }
        } catch (err) {
            console.error('Error rejecting invite:', err)
            showError('Terjadi kesalahan saat menolak undangan')
        } finally {
            setLoading(false)
            setIsRejectModalOpen(false)
        }
    }

    if (loadingData) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-red-500 mb-4">{error}</p>
                <Button onClick={() => navigate('/dashboard/competitions')}>
                    Kembali
                </Button>
            </div>
        )
    }

    if (!competitionData) return null







    const handleSubmitWithPaymentCheck = (e) => {
        e.preventDefault()

        if (!formData.team) {
            setError('Harap pilih tim.')
            return
        }

        // If payment system, show confirmation modal first
        if (competitionData?.payment != null) {
            setIsPaymentConfirmOpen(true)
            return
        }

        // Otherwise submit directly
        executeSubmit()
    }

    const executeSubmit = async () => {
        if (!formData.team) {
            setError('Harap pilih tim.')
            return
        }

        setIsSubmitting(true)
        setError('')

        try {
            console.log('Registering for competition:', { competitionId: id, ...formData })

            const payload = {
                user_id: user.id,
                name: user.name,
                team: formData.team,
                logo_url: formData.teamLogo,
                status: 'pending',
                stats: { contact: user.phone || user.whatsapp || '-' } // Fallback if phone is not in user object
            }

            const res = await authFetch(`/api/tournaments/${id}/participants`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            const data = await res.json()
            if (!data.success) throw new Error(data.message)

            showSuccess(`Berhasil mendaftar ke "${competitionData.name}"!\nSemoga beruntung!`)
            if (isPublic) {
                navigate('/')
            } else {
                navigate('/dashboard/competitions')
            }
        } catch (err) {
            setError(err.message || 'Gagal mendaftar. Silakan coba lagi.')
        } finally {
            setIsSubmitting(false)
        }
    }



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

    const getStatusColor = (status) => {
        switch (String(status).toLowerCase()) {
            case 'approved': return 'bg-green-500/20 text-green-400 border border-green-500/30'
            case 'pending': return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
            case 'rejected':
            case 'declined': return 'bg-red-500/20 text-red-400 border border-red-500/30'
            case 'disqualified': return 'bg-red-500/20 text-red-400 border border-red-500/30'
            default: return 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
        }
    }

    // News handlers
    const toggleComments = async (newsId) => {
        if (openThreadNewsId === newsId) {
            setOpenThreadNewsId(null)
            return
        }

        setOpenThreadNewsId(newsId)
        try {
            const response = await authFetch(`/api/tournaments/${id}/news/${newsId}/comments`)
            const data = await response.json()
            if (data.success) {
                setCommentsMap(prev => ({ ...prev, [newsId]: data.data }))
            }
        } catch (err) { console.error(err) }
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
                const res = await authFetch(`/api/tournaments/${id}/news/${newsId}/comments`)
                const d = await res.json()
                if (d.success) {
                    setCommentsMap(prev => ({ ...prev, [newsId]: d.data }))
                }
            } else {
                showError(data.message || 'Gagal mengirim komentar')
            }
        } catch (err) {
            console.error('Post comment error:', err)
            showError('Gagal mengirim komentar')
        }
    }



    const isMemberOfTournament = participants.some(p => String(p.user_id) === String(user?.id))
    const isOrganizer = competitionData && user && String(competitionData.organizer_id) === String(user.id)

    // Share functionality
    const handleShare = () => {
        if (!competitionData) return;
        setShareModalOpen(true);
    };

    const sharedContent = competitionData ? {
        type: 'tournament',
        id: competitionData.id,
        metadata: {
            name: competitionData.name,
            type: competitionData.type?.replace('_', ' '),
            participants: participants.length || 0,
            visibility: competitionData.visibility || 'public',
            status: competitionData.status,
            progress: 'Open Registration'
        }
    } : null;

    return (
        <>
            <ConfirmationModal
                isOpen={isRejectModalOpen}
                onClose={() => setIsRejectModalOpen(false)}
                onConfirm={confirmReject}
                title="Tolak Undangan"
                message="Apakah Anda yakin ingin menolak undangan ini? Anda tidak akan dapat bergabung kecuali diundang kembali."
                confirmText="Tolak Undangan"
                variant="danger"
                isLoading={loading}
            />
            {isPublic && <Navbar />}
            <ConfirmationModal
                isOpen={isPaymentConfirmOpen}
                onClose={() => setIsPaymentConfirmOpen(false)}
                onConfirm={() => {
                    setIsPaymentConfirmOpen(false)
                    executeSubmit()
                }}
                title="Pendaftaran Berbayar"
                message={`Kompetisi ini memerlukan biaya pendaftaran sebesar ${competitionData?.payment || 0} Coin. Jika organizer/admin menyetujui pendaftaran Anda, coin Anda akan berkurang secara otomatis. Lanjutkan?`}
                confirmText="Ya, Daftar"
                variant="warning"
                isLoading={isSubmitting}
            />
            <ReactJoyride
                steps={tourSteps}
                run={runTour}
                continuous
                showProgress
                showSkipButton
                callback={handleJoyrideCallback}
                styles={{
                    options: {
                        arrowColor: '#121212',
                        backgroundColor: '#121212',
                        overlayColor: 'rgba(5, 5, 5, 0.5)',
                        primaryColor: '#02FE02',
                        textColor: '#fff',
                        zIndex: 1000,
                    },
                    tooltipContainer: {
                        textAlign: 'left'
                    },
                    buttonNext: {
                        backgroundColor: '#02FE02',
                        color: '#000',
                        fontFamily: 'Space Grotesk, sans-serif',
                        fontWeight: 'bold',
                        outline: 'none',
                    },
                    buttonBack: {
                        color: '#fff',
                        fontFamily: 'Space Grotesk, sans-serif',
                        outline: 'none',
                    },
                    buttonSkip: {
                        color: '#fff',
                        fontFamily: 'Space Grotesk, sans-serif'
                    }
                }}
                locale={{
                    back: 'Kembali',
                    close: 'Tutup',
                    last: 'Selesai',
                    next: 'Lanjut',
                    skip: 'Lewati',
                }}
            />
            <div className={`space-y-6 mx-auto w-full ${isPublic ? 'pt-24 px-4 md:px-8' : ''}`}>
                {/* Header */}
                <div id="tour-join-header">
                    {!isPublic && (
                        <button
                            onClick={() => navigate('/dashboard/competitions')}
                            className="text-gray-400 hover:text-white flex items-center gap-2 mb-4 transition"
                        >
                            <ArrowLeft className="w-4 h-4" /> Kembali ke Kompetisi
                        </button>
                    )}

                    {loadingData ? (
                        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-neonGreen" /></div>
                    ) : competitionData ? (
                        <>
                            <h1 className="text-2xl md:text-3xl font-display font-bold mb-2">Registrasi Kompetisi</h1>

                            {/* Competition Detail Summary */}
                            <div className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 border border-white/10 rounded-xl p-6 relative overflow-hidden" id="tour-join-info">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <Trophy className="w-32 h-32 rotate-12" />
                                </div>

                                <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start">
                                    {competitionData.logo ? (
                                        <AdaptiveLogo
                                            src={competitionData.logo}
                                            alt={competitionData.name}
                                            className="w-24 h-24 rounded-2xl object-cover shadow-lg"
                                            fallbackSize="w-10 h-10"
                                        />
                                    ) : (
                                        <div className="w-24 h-24 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                                            <Trophy className="w-10 h-10 text-white/20" />
                                        </div>
                                    )}

                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="bg-blue-500/20 text-blue-400 text-xs font-bold px-3 py-1 rounded-full border border-blue-500/30 uppercase">
                                                {competitionData.type?.replace('_', ' ')}
                                            </span>
                                            {competitionData.match_format && (
                                                <span className="bg-purple-500/20 text-purple-400 text-xs font-bold px-3 py-1 rounded-full border border-purple-500/30 uppercase">
                                                    {competitionData.match_format?.replace('_', ' ')}
                                                </span>
                                            )}
                                            {competitionData.creator?.tier && (
                                                <UserBadge
                                                    tier={competitionData.creator.tier.toLowerCase().replace(' ', '_')}
                                                    size="sm"
                                                    className="origin-left"
                                                />
                                            )}
                                        </div>

                                        <div>
                                            <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-1">{competitionData.name}</h2>
                                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                                <span>Diselenggarakan oleh</span>
                                                <span className="text-white font-medium">{competitionData.creator?.name}</span>
                                            </div>
                                        </div>
                                        <p className="text-gray-400 text-sm leading-relaxed max-w-2xl">{competitionData.description}</p>
                                    </div>

                                    <div className="flex flex-wrap gap-4 text-sm mt-2">
                                        <div className="flex items-center gap-2 text-gray-300 bg-black/20 px-3 py-1.5 rounded-lg">
                                            <Calendar className="w-4 h-4 text-neonGreen" />
                                            <span>Mulai: {competitionData.startDate}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-300 bg-black/20 px-3 py-1.5 rounded-lg">
                                            <Users className="w-4 h-4 text-blue-400" />
                                            <span>Slot: {competitionData.max_participants - (competitionData.current_participants || 0)} Tersisa</span>
                                        </div>
                                        {!isPublic && (
                                            <button
                                                onClick={handleShare}
                                                className="flex items-center gap-2 text-gray-300 bg-black/20 hover:bg-neonGreen/20 hover:text-neonGreen px-3 py-1.5 rounded-lg transition"
                                                title="Bagikan ke E-Club"
                                            >
                                                <Share2 className="w-4 h-4" />
                                                <span>Bagikan</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Tab Navigation */}
                            <div className="flex items-center gap-2 border-b border-white/10 overflow-x-auto mt-6" id="tour-join-tabs">
                                {(!isJoined || isInvited) && (
                                    <button
                                        onClick={() => setActiveTab('register')}
                                        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === 'register' ? (isInvited ? 'border-orange-500 text-orange-500' : 'border-neonGreen text-neonGreen') : 'border-transparent text-gray-400 hover:text-gray-200'}`}
                                    >
                                        {isInvited ? <Mail className="w-4 h-4" /> : <User className="w-4 h-4" />}
                                        {isInvited ? 'Undangan' : 'Form Pendaftaran'}
                                    </button>
                                )}
                                <button
                                    onClick={() => setActiveTab('participants')}
                                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === 'participants' ? 'border-neonGreen text-neonGreen' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
                                >
                                    <ClipboardList className="w-4 h-4" />
                                    Peserta ({participants.length})
                                </button>
                                <button
                                    onClick={() => setActiveTab('news')}
                                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === 'news' ? 'border-neonGreen text-neonGreen' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
                                >
                                    <Newspaper className="w-4 h-4" />
                                    League News
                                </button>
                                {competitionData.prizeSettings?.enabled && (
                                    <button
                                        onClick={() => setActiveTab('prize')}
                                        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === 'prize' ? 'border-neonPink text-neonPink' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
                                    >
                                        <Gift className="w-4 h-4" />
                                        Hadiah
                                    </button>
                                )}
                            </div>

                            {/* Tab Content */}
                            <div className="min-h-[400px] mt-6">
                                {activeTab === 'register' && (
                                    <Card hover={false} className={isInvited ? "border-orange-500/50 bg-orange-500/5" : ""} id="tour-join-form">
                                        {competitionData.payment != null && (
                                            <div className="flex items-center gap-3 mx-6 mt-6 px-4 py-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                                                <img src="/coin.png" alt="Coin" className="w-5 h-5" />
                                                <div>
                                                    <p className="text-sm font-medium text-yellow-400">Kompetisi Berbayar</p>
                                                    <p className="text-xs text-gray-400">Biaya pendaftaran: <span className="text-yellow-400 font-bold">{competitionData.payment} Coin</span></p>
                                                </div>
                                            </div>
                                        )}
                                        <CardHeader>
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-lg ${isInvited ? 'bg-orange-500/20 text-orange-500' : 'bg-white/5 text-neonGreen'} flex items-center justify-center`}>
                                                    {isInvited ? <Mail className="w-5 h-5" /> : <User className="w-5 h-5" />}
                                                </div>
                                                <div>
                                                    <h3 className={`font-display font-bold ${isInvited ? 'text-orange-500' : ''}`}>{isInvited ? 'Undangan Kompetisi' : 'Data Pendaftar'}</h3>
                                                    <p className="text-sm text-gray-400">{isInvited ? 'Terima undangan untuk bergabung' : 'Lengkapi data diri dan tim untuk mendaftar'}</p>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            {/* Login Required Check */}
                                            {!user ? (
                                                <div className="text-center py-12">
                                                    <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-4">
                                                        <ShieldCheck className="w-8 h-8 text-yellow-400" />
                                                    </div>
                                                    <h4 className="text-lg font-bold text-white mb-2">Login Diperlukan</h4>
                                                    <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">
                                                        Anda harus login terlebih dahulu untuk mendaftar ke kompetisi ini.
                                                    </p>
                                                    <div className="flex justify-center">
                                                        <Button
                                                            onClick={() => navigate(`/login?redirect=/dashboard/competitions/${id}/join`)}
                                                            icon={User}
                                                        >
                                                            Login Sekarang
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : isInvited ? (
                                                <form onSubmit={handleAcceptInvite} className="space-y-5">
                                                    {/* User Info Header - Copied from Register Form */}
                                                    <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-4">
                                                        <div className="flex items-center gap-3 mb-3 pb-3 border-b border-white/5">
                                                            <div className="w-8 h-8 rounded-full bg-neonGreen/20 flex items-center justify-center text-neonGreen font-bold">
                                                                {user?.name?.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-white">{user?.name}</p>
                                                                <p className="text-xs text-gray-500">@{user?.username || 'user'}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-xs text-gray-400 space-y-1">
                                                            <div className="flex justify-between">
                                                                <span>WhatsApp:</span>
                                                                <span className="text-white">{user?.phone || user?.whatsapp || '-'}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span>Email:</span>
                                                                <span className="text-white">{user?.email}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* League Select */}
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <Trophy className="w-4 h-4 text-neonGreen" />
                                                                Pilih Liga
                                                            </div>
                                                        </label>
                                                        <SearchableSelect
                                                            options={leagueOptions}
                                                            value={formData.league}
                                                            onChange={(e) => setFormData(prev => ({ ...prev, league: e.target.value }))}
                                                            placeholder="Pilih Liga Asal Tim..."
                                                        />
                                                    </div>

                                                    {/* Team Select */}
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <Shield className="w-4 h-4 text-neonPink" />
                                                                Pilih Tim
                                                                {loadingTeams && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
                                                            </div>
                                                        </label>
                                                        <SearchableSelect
                                                            options={teamOptions}
                                                            value={formData.teamId}
                                                            onChange={handleTeamChange}
                                                            placeholder={loadingTeams ? 'Memuat tim...' : 'Pilih Tim...'}
                                                            disabled={!formData.league || loadingTeams}
                                                        />

                                                        {/* Editable Team Name */}
                                                        <div className="mt-3">
                                                            <Input
                                                                label={
                                                                    <div className="flex items-center gap-2">
                                                                        <Shield className="w-4 h-4 text-neonPink" />
                                                                        Nama Tim
                                                                    </div>
                                                                }
                                                                placeholder="Nama tim akan muncul di sini..."
                                                                value={formData.team}
                                                                onChange={(e) => setFormData(prev => ({
                                                                    ...prev,
                                                                    team: e.target.value.replace(/\b\w/g, char => char.toUpperCase())
                                                                }))}
                                                            />
                                                        </div>
                                                        {/* Show selected team logo */}
                                                        {formData.teamLogo && formData.team && (
                                                            <div className="mt-3 flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                                                                <img
                                                                    src={formData.teamLogo}
                                                                    alt={formData.team}
                                                                    className="w-10 h-10 object-contain"
                                                                    onError={(e) => {
                                                                        const formattedId = String(formData.teamId).padStart(6, '0')
                                                                        let newUrl = ''

                                                                        // Fallback chain similar to register form: _r_w_l -> _f_l -> _r_l
                                                                        if (e.target.src.includes('_r_w_l')) {
                                                                            newUrl = `https://api.efootballdb.com/assets/2022/clubs/e_${formattedId}_f_l.png.webp`
                                                                        } else if (e.target.src.includes('_f_l')) {
                                                                            newUrl = `https://api.efootballdb.com/assets/2022/clubs/e_${formattedId}_r_l.png.webp`
                                                                        }

                                                                        if (newUrl) {
                                                                            e.target.src = newUrl
                                                                            // IMPORTANT: Update state so the valid URL is saved!
                                                                            setFormData(prev => ({ ...prev, teamLogo: newUrl }))
                                                                        }
                                                                    }}
                                                                />
                                                                <span className="font-medium">{formData.team}</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={handleRejectInvite}
                                                            className="border-red-500/50 text-red-500 hover:bg-red-500/10"
                                                            disabled={loading}
                                                        >
                                                            Tolak Undangan
                                                        </Button>
                                                        <Button
                                                            type="submit"
                                                            className="bg-orange-600 hover:bg-orange-700 text-white min-w-[150px]"
                                                            disabled={loading || isSubmitting}
                                                        >
                                                            {loading ? (
                                                                <span className="flex items-center">
                                                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                                                    Memproses...
                                                                </span>
                                                            ) : (
                                                                'Terima Undangan'
                                                            )}
                                                        </Button>
                                                    </div>
                                                </form>
                                            ) : (
                                                <form onSubmit={handleSubmitWithPaymentCheck} className="space-y-5">
                                                    {/* User Info Header */}
                                                    <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-4">
                                                        <div className="flex items-center gap-3 mb-3 pb-3 border-b border-white/5">
                                                            <div className="w-8 h-8 rounded-full bg-neonGreen/20 flex items-center justify-center text-neonGreen font-bold">
                                                                {user?.name?.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-white">{user?.name}</p>
                                                                <p className="text-xs text-gray-500">@{user?.username || 'user'}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-xs text-gray-400 space-y-1">
                                                            <div className="flex justify-between">
                                                                <span>WhatsApp:</span>
                                                                <span className="text-white">{user?.phone || user?.whatsapp || '-'}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span>Email:</span>
                                                                <span className="text-white">{user?.email}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {error && (
                                                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
                                                            {error}
                                                        </div>
                                                    )}

                                                    {/* League Select */}
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <Trophy className="w-4 h-4 text-neonGreen" />
                                                                Pilih Liga
                                                            </div>
                                                        </label>
                                                        <SearchableSelect
                                                            options={leagueOptions}
                                                            value={formData.league}
                                                            onChange={(e) => setFormData(prev => ({ ...prev, league: e.target.value }))}
                                                            placeholder="Pilih Liga Asal Tim..."
                                                        />
                                                    </div>

                                                    {/* Team Select */}
                                                    <div id="tour-join-team">
                                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <Shield className="w-4 h-4 text-neonPink" />
                                                                Pilih Tim
                                                                {loadingTeams && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
                                                            </div>
                                                        </label>
                                                        <SearchableSelect
                                                            options={teamOptions}
                                                            value={formData.teamId}
                                                            onChange={handleTeamChange}
                                                            placeholder={loadingTeams ? 'Memuat tim...' : 'Pilih Tim...'}
                                                            disabled={!formData.league || loadingTeams}
                                                        />

                                                        {/* Editable Team Name */}
                                                        <div className="mt-3">
                                                            <Input
                                                                label={
                                                                    <div className="flex items-center gap-2">
                                                                        <Shield className="w-4 h-4 text-neonPink" />
                                                                        Nama Tim
                                                                    </div>
                                                                }
                                                                placeholder="Nama tim akan muncul di sini..."
                                                                value={formData.team}
                                                                onChange={(e) => setFormData(prev => ({
                                                                    ...prev,
                                                                    team: e.target.value.replace(/\b\w/g, char => char.toUpperCase())
                                                                }))}
                                                            />
                                                        </div>
                                                        {/* Show selected team logo */}
                                                        {formData.teamLogo && formData.team && (
                                                            <div className="mt-3 flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                                                                <img
                                                                    src={formData.teamLogo}
                                                                    alt={formData.team}
                                                                    className="w-10 h-10 object-contain"
                                                                    onError={(e) => {
                                                                        // Try alternate logo format on error
                                                                        const formattedId = String(formData.teamId).padStart(6, '0')
                                                                        let newUrl = ''

                                                                        // Fallback chain: _r_w_l -> _f_l -> _r_l
                                                                        if (e.target.src.includes('_r_w_l')) {
                                                                            newUrl = `https://api.efootballdb.com/assets/2022/clubs/e_${formattedId}_f_l.png.webp`
                                                                        } else if (e.target.src.includes('_f_l')) {
                                                                            newUrl = `https://api.efootballdb.com/assets/2022/clubs/e_${formattedId}_r_l.png.webp`
                                                                        }

                                                                        if (newUrl) {
                                                                            e.target.src = newUrl
                                                                            // IMPORTANT: Update state so the valid URL is saved!
                                                                            setFormData(prev => ({ ...prev, teamLogo: newUrl }))
                                                                        }
                                                                    }}
                                                                />
                                                                <span className="font-medium">{formData.team}</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Submit Buttons */}
                                                    <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                                                        <Button
                                                            variant="secondary"
                                                            onClick={() => navigate('/dashboard/competitions')}
                                                            disabled={isSubmitting}
                                                        >
                                                            Batal
                                                        </Button>
                                                        <Button
                                                            loading={isSubmitting}
                                                            type="submit"
                                                            className="flex-1"
                                                            disabled={isSubmitting || loadingTeams}
                                                            icon={Sparkles}
                                                            id="tour-join-submit"
                                                        >
                                                            {isInvited ? 'Terima Undangan' : 'Kirim Pendaftaran'}
                                                        </Button>
                                                    </div>
                                                </form>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}

                                {activeTab === 'participants' && (
                                    <div className="space-y-4 animate-fadeIn">
                                        {participants.map((player) => (
                                            <div key={player.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between">

                                                <div className="flex items-center gap-4">
                                                    {player.logo_url ? (
                                                        <img src={player.logo_url} alt={player.team_name} className="w-10 h-10 object-contain" />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center text-blue-400 font-bold">
                                                            {player.team_name?.charAt(0) || player.name?.charAt(0)}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <h4 className="font-bold text-white">{player.team_name || player.team}</h4>
                                                        <div className="flex items-center gap-1">
                                                            <p className="text-sm text-gray-400">{player.name}</p>
                                                            {player.tier_name && (
                                                                <UserBadge
                                                                    tier={player.tier_name.toLowerCase().replace(' ', '_')}
                                                                    size="sm"
                                                                    className="scale-75 origin-left"
                                                                />
                                                            )}
                                                        </div>
                                                        {player.username && (
                                                            <p className="text-xs text-neonGreen mt-0.5">@{player.username}</p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="text-right">
                                                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(player.status)}`}>
                                                        {player.status}
                                                    </span>

                                                    <p className="text-xs text-gray-500 mt-2">{formatDate(player.created_at)}</p>

                                                    {/* Edit Button for pending user */}
                                                    {user && String(player.user_id) === String(user.id) && player.status === 'pending' && (
                                                        <div className="mt-2 flex justify-end">
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="text-neonGreen hover:bg-neonGreen/10 h-7 text-xs"
                                                                onClick={() => handleEditClick(player)}
                                                            >
                                                                <Sparkles className="w-3 h-3 mr-1" />
                                                                Edit Tim
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        <div className="text-center p-4">
                                            <p className="text-sm text-gray-500">Menampilkan {participants.length} peserta terdaftar.</p>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'news' && (
                                    <div className="space-y-4 animate-fadeIn">
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
                                                    </div>
                                                    <p className="text-gray-200 mb-6 whitespace-pre-wrap">{news.content}</p>

                                                    <div className="flex flex-wrap gap-3">
                                                        {news.contact_info && (
                                                            <a href={`https://wa.me/62${news.contact_info.replace(/[^0-9]/g, '').replace(/^0/, '').replace(/^62/, '')}`} target="_blank" rel="noreferrer"
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
                                                            <span className="text-xs text-gray-500 bg-black/20 px-2 py-1 rounded">
                                                                {new Date(news.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                            </span>
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
                                                                        {(isOrganizer || isMemberOfTournament) ? (
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
                                    </div>
                                )}

                                {/* Prize Tab */}
                                {activeTab === 'prize' && competitionData.prizeSettings?.enabled && (
                                    <div className="space-y-6 animate-fadeIn pb-20">
                                        {/* Header Section */}
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/5 p-6 rounded-2xl border border-white/10">
                                            <div>
                                                <h3 className="text-2xl font-display font-bold text-white flex items-center gap-2">
                                                    <Gift className="w-6 h-6 text-neonPink" />
                                                    Hadiah Turnamen
                                                </h3>
                                                <p className="text-gray-400 text-sm mt-1">Informasi distribusi hadiah turnamen dan para pemenang.</p>
                                            </div>
                                            {competitionData.payment != null && user && (
                                                <Button
                                                    onClick={() => setIsSponsorModalOpen(true)}
                                                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold border-0 shadow-lg shadow-purple-500/20"
                                                >
                                                    <Sparkles className="w-4 h-4 mr-2" />
                                                    Sponsorship
                                                </Button>
                                            )}
                                        </div>

                                        {/* Source & Total Prize Pool */}
                                        <Card hover={false} className="overflow-hidden border-white/5 bg-black/40 backdrop-blur-sm">
                                            <CardContent className="p-0">
                                                {/* Source Items Grid */}
                                                <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/5">
                                                    {/* Registration */}
                                                    <div className="p-5 md:p-6 group/item hover:bg-white/[0.02] transition-colors">
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                                                <Users className="w-4 h-4 text-blue-400" />
                                                            </div>
                                                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pendaftaran</span>
                                                        </div>
                                                        <div className="flex items-baseline gap-1.5">
                                                            {competitionData.payment != null ? (
                                                                <img src="/coin.png" alt="coin" className="w-4 h-4 object-contain self-center" />
                                                            ) : (
                                                                <span className="text-sm text-gray-500">Rp</span>
                                                            )}
                                                            <span className="text-xl font-display font-black text-white">
                                                                {Number(competitionData.prizeSettings.sources?.registrationFee || 0).toLocaleString('id-ID')}
                                                            </span>
                                                        </div>
                                                        <div className="text-[11px] text-gray-500 mt-1.5 flex items-center gap-1">
                                                            × <span className="text-white font-bold">{competitionData.status === 'draft' ? (competitionData.maxParticipants || 0) : (competitionData.prizeSettings.sources?.playerCount || 0)}</span> peserta
                                                            {competitionData.status === 'draft' && <span className="text-gray-600">(maks)</span>}
                                                        </div>
                                                    </div>

                                                    {/* Sponsor */}
                                                    <div className="p-5 md:p-6 group/item hover:bg-white/[0.02] transition-colors">
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                                                <Sparkles className="w-4 h-4 text-purple-400" />
                                                            </div>
                                                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Sponsor</span>
                                                        </div>
                                                        <div className="flex items-baseline gap-1.5">
                                                            {competitionData.payment != null ? (
                                                                <img src="/coin.png" alt="coin" className="w-4 h-4 object-contain self-center" />
                                                            ) : (
                                                                <span className="text-sm text-gray-500">Rp</span>
                                                            )}
                                                            <span className="text-xl font-display font-black text-white">
                                                                {Number(competitionData.prizeSettings.sources?.sponsor || 0).toLocaleString('id-ID')}
                                                            </span>
                                                        </div>
                                                        <div className="text-[11px] text-gray-500 mt-1.5">Tambahan dari sponsor</div>
                                                    </div>

                                                    {/* Admin Fee */}
                                                    <div className="p-5 md:p-6 group/item hover:bg-white/[0.02] transition-colors">
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                                                                <DollarSign className="w-4 h-4 text-red-400" />
                                                            </div>
                                                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Biaya Admin</span>
                                                        </div>
                                                        <div className="flex items-baseline gap-1.5">
                                                            {competitionData.payment != null ? (
                                                                <img src="/coin.png" alt="coin" className="w-4 h-4 object-contain self-center" />
                                                            ) : (
                                                                <span className="text-sm text-gray-500">Rp</span>
                                                            )}
                                                            <span className="text-xl font-display font-black text-red-400">
                                                                -{Number(competitionData.prizeSettings.sources?.adminFee || 0).toLocaleString('id-ID')}
                                                            </span>
                                                        </div>
                                                        <div className="text-[11px] text-gray-500 mt-1.5">Pengurangan biaya operasional</div>
                                                    </div>
                                                </div>

                                                {/* Total Prize Pool - Hero */}
                                                <div className="p-6 md:p-8 bg-gradient-to-r from-neonGreen/5 via-neonGreen/10 to-neonGreen/5 border-t border-neonGreen/20 relative overflow-hidden">
                                                    <div className="absolute -right-4 -top-4 opacity-5 pointer-events-none">
                                                        <Trophy className="w-32 h-32 text-neonGreen" />
                                                    </div>
                                                    <div className="relative flex flex-col sm:flex-row items-center justify-between gap-4">
                                                        <div>
                                                            <div className="text-xs font-bold text-neonGreen uppercase tracking-widest mb-1">Total Prize Pool</div>
                                                            <div className="text-sm text-gray-400">Total hadiah yang diperebutkan</div>
                                                        </div>
                                                        <div className="text-4xl md:text-5xl font-display font-black text-white flex items-center gap-3">
                                                            {competitionData.payment != null && <img src="/coin.png" alt="coin" className="w-10 h-10 object-contain" />}
                                                            {competitionData.payment == null && <span className="text-2xl text-gray-400 font-bold">Rp</span>}
                                                            {parseInt(competitionData.prizeSettings.totalPrizePool || 0).toLocaleString('id-ID')}
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Recipients Table */}
                                        <Card hover={false} className="border-white/5 bg-black/40 backdrop-blur-sm overflow-hidden">
                                            <CardHeader className="border-b border-white/5 flex flex-row items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-1.5 bg-neonPink/10 rounded-lg">
                                                        <Medal className="w-4 h-4 text-neonPink" />
                                                    </div>
                                                    <h4 className="font-bold">Daftar Pemenang & Distribusi</h4>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="p-0">
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-left border-collapse">
                                                        <thead>
                                                            <tr className="bg-white/5 border-b border-white/5">
                                                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Kategori / Gelar</th>
                                                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Nominal Hadiah</th>
                                                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Pemenang</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-white/5">
                                                            {competitionData.prizeSettings.recipients.map((recipient) => (
                                                                <tr key={recipient.id} className="group hover:bg-white/[0.02] transition-colors">
                                                                    <td className="px-6 py-4">
                                                                        <div className="font-bold text-white">{recipient.label}</div>
                                                                    </td>
                                                                    <td className="px-6 py-4 font-mono">
                                                                        <div className="flex items-center gap-2">
                                                                            {competitionData.payment != null ? (
                                                                                <img src="/coin.png" alt="coin" className="w-4 h-4 object-contain" />
                                                                            ) : (
                                                                                <span className="text-gray-500 text-xs">Rp</span>
                                                                            )}
                                                                            <span className="font-bold text-white text-lg">
                                                                                {Number(recipient.amount).toLocaleString('id-ID')}
                                                                            </span>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-6 py-4">
                                                                        <div className="flex items-center gap-2 opacity-50">
                                                                            <div className="w-8 h-8 rounded-full bg-white/5 border border-dashed border-white/10 flex items-center justify-center">
                                                                                <Users className="w-4 h-4 text-gray-600" />
                                                                            </div>
                                                                            <span className="text-xs text-gray-500 italic">Belum ditentukan</span>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Terms & Conditions */}
                                        <Card className="h-full">
                                            <CardHeader>
                                                <h3 className="font-display font-bold flex items-center gap-2">
                                                    <Activity className="w-5 h-5 text-blue-400" />
                                                    Syarat & Ketentuan
                                                </h3>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <ul className="list-disc list-inside space-y-2 text-sm text-gray-400">
                                                    <li>Hadiah akan didistribusikan selambat-lambatnya 3 hari setelah turnamen selesai.</li>
                                                    <li>Pajak hadiah ditanggung oleh pemenang (jika ada).</li>
                                                    <li>Keputusan panitia bersifat mutlak dan tidak dapat diganggu gugat.</li>
                                                    <li>Pemenang wajib memiliki rekening bank yang aktif untuk proses transfer.</li>
                                                </ul>
                                                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs text-blue-300 mt-4">
                                                    <span className="font-bold block mb-1">Informasi Penting:</span>
                                                    Pastikan data profil Anda sudah lengkap untuk memudahkan proses klaim hadiah.
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                )}
                            </div>

                        </>
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            <Trophy className="w-16 h-16 mx-auto mb-4 opacity-20" />
                            <h3 className="text-xl font-bold">Kompetisi Tidak Ditemukan</h3>
                            <button onClick={() => navigate('/dashboard/competitions')} className="text-neonGreen hover:underline mt-2">Kembali ke Daftar Kompetisi</button>
                        </div>
                    )}
                </div>

                <div className="mt-6">
                    <AdSlot variant="banner" adId="join-comp-form" />
                </div>
            </div >
            {/* Sponsorship Modal */}
            <Modal
                isOpen={isSponsorModalOpen}
                onClose={() => { setIsSponsorModalOpen(false); setSponsorAmount(''); }}
                title="Sponsorship Turnamen"
            >
                <div className="space-y-6">
                    <div className="flex items-center gap-4 p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                        <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                            <Sparkles className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                            <h4 className="font-bold text-white text-sm">Dukung Turnamen Ini</h4>
                            <p className="text-xs text-gray-400 mt-0.5">Coin sponsor Anda akan ditambahkan ke prize pool turnamen.</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Jumlah Coin</label>
                        <div className="relative">
                            <img src="/coin.png" alt="coin" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 object-contain" />
                            <Input
                                type="text"
                                inputMode="numeric"
                                value={sponsorAmount}
                                onChange={(e) => setSponsorAmount(e.target.value.replace(/\D/g, ''))}
                                placeholder="Masukkan jumlah coin..."
                                className="pl-11 bg-white/5 border-white/10 text-lg font-bold"
                            />
                        </div>
                        {sponsorAmount && (
                            <div className="mt-2 text-xs text-gray-400 flex items-center gap-1">
                                Anda akan mensponsori <img src="/coin.png" alt="" className="w-3 h-3 inline" /> <span className="text-white font-bold">{Number(sponsorAmount).toLocaleString('id-ID')}</span> coin
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <Button
                            variant="secondary"
                            onClick={() => { setIsSponsorModalOpen(false); setSponsorAmount(''); }}
                            className="flex-1 bg-white/5 hover:bg-white/10 text-white border-white/10"
                        >
                            Batal
                        </Button>
                        <Button
                            onClick={() => {
                                if (!sponsorAmount || Number(sponsorAmount) <= 0) {
                                    showError('Masukkan jumlah coin yang valid')
                                    return
                                }
                                setIsSponsorSubmitting(true)
                                setTimeout(() => {
                                    showSuccess(`Sponsorship ${Number(sponsorAmount).toLocaleString('id-ID')} coin berhasil dikirim!`)
                                    setIsSponsorModalOpen(false)
                                    setSponsorAmount('')
                                    setIsSponsorSubmitting(false)
                                }, 1000)
                            }}
                            disabled={isSponsorSubmitting || !sponsorAmount}
                            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold border-0"
                        >
                            {isSponsorSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                            {isSponsorSubmitting ? 'Mengirim...' : 'Kirim Sponsorship'}
                        </Button>
                    </div>
                </div>
            </Modal>

            <EditParticipantModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                participant={editingParticipant}
                onSave={handleSaveParticipant}
            />
            <ShareDestinationModal
                isOpen={shareModalOpen}
                onClose={() => setShareModalOpen(false)}
                sharedContent={sharedContent}
            />
            <WhatsAppModal
                isOpen={showWhatsAppModal}
                onClose={() => setShowWhatsAppModal(false)}
                onCancel={() => navigate('/dashboard/competitions')}
            />
        </>
    )
}

// Edit Participant Modal Component
function EditParticipantModal({ isOpen, onClose, participant, onSave }) {
    const [formData, setFormData] = useState({
        team_name: '',
        logo_url: '',
        league: ''
    })
    const [teams, setTeams] = useState([])
    const [loadingTeams, setLoadingTeams] = useState(false)
    const [loading, setLoading] = useState(false)

    // Initialize data
    useEffect(() => {
        if (participant) {
            const stats = participant.stats ? (typeof participant.stats === 'string' ? JSON.parse(participant.stats) : participant.stats) : {}
            setFormData({
                team_name: participant.team_name || participant.team || '',
                logo_url: participant.logo_url || '',
                league: stats.league || ''
            })
        }
    }, [participant])

    // Fetch teams when league changes
    useEffect(() => {
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
                team_name: selectedTeam.name,
                logo_url: selectedTeam.logo
            }))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        // Only send updated team/logo data
        const updateData = {
            team: formData.team_name, // Backend expects 'team' usually, need to check if it maps to team_name
            // Wait, standard update usually updates 'team' or 'team_name'. 
            // In TournamentDetail, it sends 'team_name'. 
            // JoinCompetition submit uses 'team'. 
            // I'll send both to be safe or check backend. 
            // Let's assume backend handles 'team_name' or 'team'.
            team_name: formData.team_name,
            logo_url: formData.logo_url,
            // Preserve other fields? Usually PUT merges or overwrites. 
            // The logic in TournamentDetail sends explicit fields.
            // I should only send what I want to update.
        }
        await onSave(participant.id, updateData)
        setLoading(false)
    }

    if (!isOpen) return null

    const teamOptions = [
        { value: '', label: loadingTeams ? 'Memuat tim...' : 'Pilih Tim Baru (Opsional)...' },
        ...teams.map(team => ({
            value: String(team.id),
            label: team.name
        }))
    ]

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Tim Saya">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mb-4">
                    <p className="text-xs text-yellow-200">
                        Anda hanya dapat mengubah data tim selama status pendaftaran masih <strong>Pending</strong>.
                    </p>
                </div>

                <div className="space-y-3">
                    <label className="block text-xs font-semibold text-gray-400 uppercase">Ganti Tim & Logo (Opsional)</label>

                    <SearchableSelect
                        options={leagueOptions}
                        value={formData.league}
                        onChange={(e) => setFormData(prev => ({ ...prev, league: e.target.value }))}
                        placeholder="Pilih Liga..."
                    />

                    <SearchableSelect
                        options={teamOptions}
                        value=""
                        onChange={handleTeamChange}
                        placeholder={loadingTeams ? 'Memuat...' : 'Pilih Tim...'}
                        disabled={!formData.league || loadingTeams}
                    />
                </div>

                <Input
                    label="Nama Tim"
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
                                const formattedId = String(formData.teamId || '').padStart(6, '0') // teamId might not be available directly if just string url
                                // Better fallback logic based on URL pattern
                                const currentSrc = e.target.src
                                let newUrl = ''
                                if (currentSrc.includes('_r_w_l')) {
                                    newUrl = currentSrc.replace('_r_w_l', '_f_l')
                                } else if (currentSrc.includes('_f_l')) {
                                    newUrl = currentSrc.replace('_f_l', '_r_l')
                                }
                                if (newUrl) {
                                    e.target.src = newUrl
                                    setFormData(prev => ({ ...prev, logo_url: newUrl }))
                                }
                            }}
                        />
                        <span className="text-sm text-gray-400">Logo Preview</span>
                    </div>
                )}

                <div className="flex gap-3 pt-4 border-t border-white/10 mt-6 md:justify-end">
                    <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
                        Batal
                    </Button>
                    <Button type="submit" disabled={loading} icon={Sparkles}>
                        {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </Button>
                </div>
            </form>
        </Modal>
    )
}
