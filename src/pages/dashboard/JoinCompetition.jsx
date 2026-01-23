import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom'
import { ArrowLeft, Loader2, User, Phone, Shield, Trophy, Users, Calendar, Sparkles, ShieldCheck, Newspaper, ClipboardList } from 'lucide-react'
import Card, { CardHeader, CardContent } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import SearchableSelect from '../../components/ui/SearchableSelect'
import AdSlot from '../../components/ui/AdSlot'
import Navbar from '../../components/landing/Navbar'
import { useToast } from '../../contexts/ToastContext'

// Mock Data for Public Competitions (Duplicated from Competitions.jsx for independence)
const getCompetitionData = (id) => {
    const competitions = [
        {
            id: 101,
            name: 'Open Liga Nusantara',
            type: 'Liga',
            players: 16,
            currentPlayers: 12,
            startDate: '2024-05-01',
            registrationDeadline: '2024-04-28',
            description: 'Liga terbuka untuk umum, semua skill level welcome!',
            isPublic: true,
            creator: { name: 'Official IndoLeague', isTrusted: true }
        },
        {
            id: 102,
            name: 'Amateur Cup 2024',
            type: 'Knockout',
            players: 8,
            currentPlayers: 2,
            startDate: '2024-06-15',
            registrationDeadline: '2024-06-10',
            description: 'Turnamen santai akhir pekan.',
            isPublic: true,
            creator: { name: 'Komunitas Santai', isTrusted: false }
        },
        {
            id: 103,
            name: 'Pro Valorant Scrim',
            type: 'Liga',
            players: 6,
            currentPlayers: 6,
            startDate: '2024-05-10',
            registrationDeadline: '2024-05-08',
            description: 'Scrim mingguan untuk tim semi-pro.',
            isPublic: true,
            creator: { name: 'ProScouts ID', isTrusted: true }
        },
        {
            id: 104,
            name: 'Badminton Fun Match',
            type: 'Group',
            players: 16,
            currentPlayers: 10,
            startDate: '2024-05-20',
            registrationDeadline: '2024-05-18',
            description: 'Cari lawan sparing badminton.',
            isPublic: true,
            creator: { name: 'Gor Asoy', isTrusted: false }
        },
    ]
    return competitions.find(c => c.id === parseInt(id)) || competitions[0]
}

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
    const { success } = useToast()
    const { id } = useParams()
    const navigate = useNavigate()
    const location = useLocation()
    const isPublic = location.pathname.startsWith('/join')
    const competitionData = getCompetitionData(id)

    const [formData, setFormData] = useState({
        league: '',
        team: '',
        teamId: '',
        teamLogo: '',
        playerName: '',
        contact: ''
    })
    const [activeTab, setActiveTab] = useState('register')

    // Mock Data for Participants
    const participants = [
        { id: 1, name: 'Budi Santoso', team: 'Persija Esports', status: 'Verified', date: '2024-04-20' },
        { id: 2, name: 'Kevin Sanjaya', team: 'RRQ Hoshi', status: 'Pending', date: '2024-04-21' },
        { id: 3, name: 'Rahmat Hidayat', team: 'EVOS Legends', status: 'Verified', date: '2024-04-22' },
        { id: 4, name: 'Dedy Corbuzier', team: 'Alter Ego', status: 'Verified', date: '2024-04-23' },
    ]

    // Mock Data for League News
    const leagueNews = [
        { id: 1, title: 'Jadwal Pertandingan Babak Grup Resmi Dirilis', date: '2024-04-25', summary: 'Cek jadwal lengkap tim kamu di sini. Jangan sampai terlewat!' },
        { id: 2, title: 'Update Peraturan Teknis Musim 2024', date: '2024-04-24', summary: 'Ada beberapa perubahan minor pada aturan substitusi pemain. Simak detailnya.' },
        { id: 3, title: 'Wawancara Eksklusif dengan Juara Bertahan', date: '2024-04-23', summary: 'Tips dan trik dari juara musim lalu untuk menghadapi meta baru.' },
    ]
    const [teams, setTeams] = useState([])
    const [loadingTeams, setLoadingTeams] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')

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
                const response = await fetch('/api/teams')
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
                                    const logoUrl = `https://api.efootballdb.com/assets/2022/clubs/e_${formattedTeamID}_r_l.png.webp`

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

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formData.team || !formData.playerName) {
            setError('Harap pilih tim dan isi nama pemain.')
            return
        }

        setIsSubmitting(true)
        setError('')

        try {
            console.log('Registering for competition:', { competitionId: id, ...formData })
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500))

            success(`Berhasil mendaftar ke "${competitionData.name}"!\nSemoga beruntung!`)
            if (isPublic) {
                navigate('/')
            } else {
                navigate('/dashboard/competitions')
            }
        } catch (err) {
            setError('Gagal mendaftar. Silakan coba lagi.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const teamOptions = [
        { value: '', label: loadingTeams ? 'Memuat tim...' : 'Pilih Tim...' },
        ...teams.map(team => ({
            value: String(team.id),
            label: team.name
        }))
    ]

    return (
        <>
            {isPublic && <Navbar />}
            <div className={`space-y-6 mx-auto w-full ${isPublic ? 'pt-24 px-4 md:px-8' : ''}`}>
                {/* Header */}
                <div>
                    {!isPublic && (
                        <button
                            onClick={() => navigate('/dashboard/competitions')}
                            className="text-gray-400 hover:text-white flex items-center gap-2 mb-4 transition"
                        >
                            <ArrowLeft className="w-4 h-4" /> Kembali ke Kompetisi
                        </button>
                    )}

                    <h1 className="text-2xl md:text-3xl font-display font-bold mb-2">Registrasi Kompetisi</h1>

                    {/* Competition Detail Summary */}
                    <div className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 border border-white/10 rounded-xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Trophy className="w-32 h-32 rotate-12" />
                        </div>

                        <div className="relative z-10 flex flex-col gap-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="bg-blue-500/20 text-blue-400 text-xs font-bold px-2 py-1 rounded-full">{competitionData.type}</span>
                                        {competitionData.creator?.isTrusted && (
                                            <span className="bg-green-500/20 text-green-400 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                                <ShieldCheck className="w-3 h-3" /> OFFICIAL
                                            </span>
                                        )}
                                    </div>
                                    <h2 className="text-2xl font-display font-bold text-white">{competitionData.name}</h2>
                                    <p className="text-gray-400 text-sm mt-1">{competitionData.description}</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-4 text-sm mt-2">
                                <div className="flex items-center gap-2 text-gray-300 bg-black/20 px-3 py-1.5 rounded-lg">
                                    <Calendar className="w-4 h-4 text-neonGreen" />
                                    <span>Mulai: {competitionData.startDate}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-300 bg-black/20 px-3 py-1.5 rounded-lg">
                                    <Users className="w-4 h-4 text-blue-400" />
                                    <span>Slot: {competitionData.players - competitionData.currentPlayers} Tersisa</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex items-center gap-2 border-b border-white/10 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('register')}
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === 'register' ? 'border-neonGreen text-neonGreen' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
                    >
                        <User className="w-4 h-4" />
                        Form Pendaftaran
                    </button>
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
                </div>

                {/* Tab Content */}
                <div className="min-h-[400px]">
                    {activeTab === 'register' && (
                        <Card hover={false}>
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                                        <User className="w-5 h-5 text-neonGreen" />
                                    </div>
                                    <div>
                                        <h3 className="font-display font-bold">Data Pendaftar</h3>
                                        <p className="text-sm text-gray-400">Lengkapi data diri dan tim untuk mendaftar</p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-5">
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
                                        {/* Show selected team logo */}
                                        {formData.teamLogo && formData.team && (
                                            <div className="mt-3 flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                                                <img
                                                    src={formData.teamLogo}
                                                    alt={formData.team}
                                                    className="w-10 h-10 object-contain"
                                                    onError={(e) => {
                                                        const formattedId = String(formData.teamId).padStart(6, '0')
                                                        if (e.target.src.includes('_r_l')) {
                                                            e.target.src = `https://api.efootballdb.com/assets/2022/clubs/e_${formattedId}_f_l.png.webp`
                                                        } else if (e.target.src.includes('_f_l')) {
                                                            e.target.src = `https://api.efootballdb.com/assets/2022/clubs/e_${formattedId}_r_w_l.png.webp`
                                                        }
                                                    }}
                                                />
                                                <span className="font-medium">{formData.team}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Player Name */}
                                    <Input
                                        label={
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4 text-neonGreen" />
                                                Nama Manager / Pemain
                                            </div>
                                        }
                                        placeholder="Masukkan nama anda"
                                        value={formData.playerName}
                                        onChange={(e) => setFormData(prev => ({ ...prev, playerName: e.target.value }))}
                                    />

                                    {/* Contact */}
                                    <Input
                                        label={
                                            <div className="flex items-center gap-2">
                                                <Phone className="w-4 h-4 text-neonPink" />
                                                Nomor WhatsApp
                                            </div>
                                        }
                                        placeholder="08xxxxxxxxxx"
                                        value={formData.contact}
                                        onChange={(e) => setFormData(prev => ({ ...prev, contact: e.target.value }))}
                                    />

                                    {/* Submit Buttons */}
                                    <div className="flex gap-3 pt-4">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            className="flex-1"
                                            onClick={() => isPublic ? navigate('/') : navigate('/dashboard/competitions')}
                                        >
                                            Batal
                                        </Button>
                                        <Button
                                            type="submit"
                                            className="flex-1"
                                            disabled={isSubmitting || loadingTeams}
                                            icon={Sparkles}
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                                    Mendaftar...
                                                </>
                                            ) : (
                                                'Daftar Sekarang'
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === 'participants' && (
                        <div className="space-y-4 animate-fadeIn">
                            {participants.map((player) => (
                                <div key={player.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center text-blue-400 font-bold">
                                            {player.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white">{player.name}</h4>
                                            <p className="text-sm text-gray-400">{player.team}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-xs px-2 py-1 rounded-full ${player.status === 'Verified' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                            {player.status}
                                        </span>
                                        <p className="text-xs text-gray-500 mt-1">{player.date}</p>
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
                            {leagueNews.map((news) => (
                                <div key={news.id} className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition cursor-pointer group">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-lg text-white group-hover:text-neonGreen transition">{news.title}</h3>
                                        <span className="text-xs text-gray-500 bg-black/20 px-2 py-1 rounded">{news.date}</span>
                                    </div>
                                    <p className="text-gray-400 text-sm">{news.summary}</p>
                                    <div className="mt-4 flex items-center gap-2 text-xs text-blue-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                        Baca Selengkapnya
                                        <ArrowLeft className="w-3 h-3 rotate-180" />
                                    </div>
                                </div>
                            ))}
                            {leagueNews.length === 0 && (
                                <div className="text-center py-12 text-gray-500">
                                    <Newspaper className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    <p>Belum ada berita untuk liga ini.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="mt-6">
                    <AdSlot variant="banner" adId="join-comp-form" />
                </div>
            </div>
        </>
    )
}
