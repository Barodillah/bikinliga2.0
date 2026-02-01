import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2, User, Phone, Shield, Trophy, Users, Calendar, BarChart2 } from 'lucide-react'
import Card, { CardHeader, CardContent } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import SearchableSelect from '../../components/ui/SearchableSelect'
import AdSlot, { AdSlotWrapper } from '../../components/ui/AdSlot'
import { authFetch } from '../../utils/api'



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

import { useToast } from '../../contexts/ToastContext'

export default function AddPlayer() {
    const { success, error: showError } = useToast()
    const { id } = useParams()
    const navigate = useNavigate()
    const [tournamentData, setTournamentData] = useState(null)
    const [loadingTournament, setLoadingTournament] = useState(true)

    // Fetch tournament data
    useEffect(() => {
        const fetchTournament = async () => {
            try {
                const response = await authFetch(`/api/tournaments/${id}`)
                const data = await response.json()
                if (data.success) {
                    setTournamentData(data.data)
                } else {
                    showError(data.message || 'Gagal memuat data turnamen')
                }
            } catch (err) {
                console.error('Error fetching tournament:', err)
                showError('Terjadi kesalahan saat memuat data turnamen')
            } finally {
                setLoadingTournament(false)
            }
        }
        fetchTournament()
    }, [id])

    const [formData, setFormData] = useState({
        league: '',
        team: '',
        teamId: '',
        teamLogo: '',
        playerName: '',
        contact: ''
    })
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
                                    // Use standard logo format: _r_w_l
                                    const logoUrl = `https://api.efootballdb.com/assets/2022/clubs/e_${formattedTeamID}_r_w_l.png.webp`

                                    filteredTeams.push({
                                        id: teamID,
                                        name: teamName,
                                        logo: logoUrl, // Default to _f_l
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

    const validateForm = () => {
        // Required fields check
        if (!formData.league || !formData.team || !formData.playerName || !formData.contact) {
            // Check specific empty fields for better UX if needed, or just return false
            // But user wants toast on click if forced (or if we allow click)
            return { valid: false, message: 'Mohon lengkapi semua data (Liga, Tim, Nama, dan Kontak)' }
        }

        // Name validation (min 3 chars)
        if (formData.playerName.length < 3) {
            return { valid: false, message: 'Nama pemain minimal 3 karakter' }
        }

        // Phone validation (start with 08, numbers only)
        // Regex: ^08\d+$ -> Starts with 08, followed by one or more digits
        const phoneRegex = /^08\d+$/
        if (!phoneRegex.test(formData.contact)) {
            return { valid: false, message: 'Nomor telepon harus angka dan diawali 08 (contoh: 0812345...)' }
        }

        if (formData.contact.length < 10) {
            return { valid: false, message: 'Nomor telepon terlalu pendek' }
        }

        return { valid: true }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        // Validate
        const validation = validateForm()
        if (!validation.valid) {
            showError(validation.message)
            return
        }

        setIsSubmitting(true)
        setError('')

        try {
            const payload = {
                name: formData.playerName,
                team: formData.team,
                logo_url: formData.teamLogo,
                status: 'approved', // Admin added players are auto-approved
                stats: {
                    teamId: formData.teamId,
                    league: formData.league
                },
                phone: formData.contact
            }

            const response = await authFetch(`/api/tournaments/${id}/participants`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })

            const data = await response.json()

            if (data.success) {
                success(`Pemain "${formData.playerName}" dengan tim "${formData.team}" berhasil ditambahkan!`)
                navigate(`/dashboard/tournaments/${id}`)
            } else {
                setError(data.message || 'Gagal menambahkan pemain')
            }
        } catch (err) {
            console.error('Submit error:', err)
            setError('Gagal menambahkan pemain. Silakan coba lagi.')
        } finally {
            setIsSubmitting(false)
        }
    }

    // Create team options for select
    const teamOptions = [
        { value: '', label: loadingTeams ? 'Memuat tim...' : 'Pilih Tim...' },
        ...teams.map(team => ({
            value: String(team.id),
            label: team.name
        }))
    ]

    return (
        <div className="space-y-6 w-full mx-auto">
            {/* Header with Tournament Details */}
            <div>
                <button
                    onClick={() => navigate(`/dashboard/tournaments/${id}`)}
                    className="text-gray-400 hover:text-white flex items-center gap-2 mb-4 transition"
                >
                    <ArrowLeft className="w-4 h-4" /> Kembali ke Tournament
                </button>

                <h1 className="text-2xl md:text-3xl font-display font-bold mb-2">Tambah Pemain Baru</h1>

                {/* Tournament Detail Summary */}
                {loadingTournament ? (
                    <div className="flex items-center justify-center p-8 bg-white/5 rounded-xl">
                        <Loader2 className="w-6 h-6 animate-spin text-neonGreen" />
                    </div>
                ) : tournamentData && (
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-neonGreen/20 to-neonPink/20 flex items-center justify-center shrink-0 overflow-hidden">
                                {tournamentData.logo || tournamentData.logo_url ? (
                                    <img
                                        src={tournamentData.logo || tournamentData.logo_url}
                                        alt={tournamentData.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.parentElement.classList.add('flex', 'items-center', 'justify-center');
                                            // Fallback to showing Trophy icon if image fails
                                            const icon = document.createElement('div');
                                            icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 text-neonGreen"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg>';
                                            e.target.parentElement.appendChild(icon.firstChild);
                                        }}
                                    />
                                ) : (
                                    <Trophy className="w-6 h-6 text-neonGreen" />
                                )}
                            </div>
                            <div>
                                <div className="text-sm text-gray-400">Turnamen</div>
                                <div className="font-bold font-display text-lg">{tournamentData.name}</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-6 text-sm">
                            <div className="flex flex-col">
                                <span className="text-gray-500 text-xs">Tipe</span>
                                <span className="font-medium text-neonPink">{tournamentData.type}</span>
                            </div>
                            <div className="w-px h-8 bg-white/10 hidden md:block"></div>
                            <div className="flex flex-col">
                                <span className="text-gray-500 text-xs">Pemain</span>
                                <span className="font-medium flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    {tournamentData.players} Tim
                                </span>
                            </div>
                            <div className="w-px h-8 bg-white/10 hidden md:block"></div>
                            <div className="flex flex-col">
                                <span className="text-gray-500 text-xs">Status</span>
                                <span className="font-medium text-neonGreen capitalize">{tournamentData.status}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Participant Alerts */}


            <Card hover={false}>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                            <User className="w-5 h-5 text-neonGreen" />
                        </div>
                        <div>
                            <h3 className="font-display font-bold">Informasi Pemain</h3>
                            <p className="text-sm text-gray-400">Data pemain dan tim yang akan digunakan</p>
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
                                    Liga
                                </div>
                            </label>
                            <SearchableSelect
                                options={leagueOptions}
                                value={formData.league}
                                onChange={(e) => setFormData(prev => ({ ...prev, league: e.target.value }))}
                                placeholder="Pilih Liga..."
                            />
                        </div>

                        {/* Team Select */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                <div className="flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-neonPink" />
                                    Tim
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
                            {formData.teamLogo && (
                                <div className="mt-2 flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
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
                                    <span className="text-sm text-gray-400">Logo Preview</span>
                                </div>
                            )}
                        </div>

                        {/* Player Name */}
                        <Input
                            label={
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-neonGreen" />
                                    Nama Pemain
                                </div>
                            }
                            placeholder="contoh: Ahmad"
                            value={formData.playerName}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                playerName: e.target.value.replace(/\b\w/g, char => char.toUpperCase())
                            }))}
                        />

                        {/* Contact */}
                        <Input
                            label={
                                <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-neonPink" />
                                    Kontak (WhatsApp)
                                </div>
                            }
                            type="text"
                            inputMode="numeric"
                            placeholder="contoh: 081234567890"
                            value={formData.contact}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                contact: e.target.value.replace(/[^0-9]/g, '')
                            }))}
                        />

                        {/* Submit Buttons */}
                        <div className="flex gap-3 pt-4">
                            <Button
                                type="button"
                                variant="ghost"
                                className="flex-1"
                                onClick={() => navigate(`/dashboard/tournaments/${id}`)}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1"
                                disabled={isSubmitting || loadingTeams || !formData.league || !formData.team || !formData.playerName || !formData.contact}
                                onClick={(e) => {
                                    // If disabled, click won't fire. But user said: "jika dipaksa di klik".
                                    // If I disable it, they CANNOT force click unless they remove disabled attribute.
                                    // Usually "force click" implies the button IS enabled but validation fails.
                                    // But he ALSO said "jika belum diisi semua maka disabled".
                                    // This is contradictory.
                                    // Interpreting: Disable transparency/style BUT maybe allow click? No.
                                    // Best Practice Interpretation:
                                    // 1. Disable button if fields are empty.
                                    // 2. If fields are FILLED but INVALID (e.g. name < 3), button is ENABLED. clicking gives toast.

                                    // Wait, if I disable it when empty, they can't see the "Empty" toast.
                                    // Maybe I should NOT disable it, but style it as disabled?
                                    // Or simply rely on the Toast validation for EVERYTHING and keep it enabled?
                                    // "jika belum diisi semua maka tombol simpan disabled" -> MUST disable.
                                    // "jika dipaksa di klik" -> Maybe he means if I inspect element? Or maybe he means "Validate on click".
                                    // I will follow "Disable if empty". The "Toast on force click" might be a scenario where they typed 1 char (so not empty, so enabled) but it's invalid.
                                    // So validation logic handles "Format Errors" (Toast), while "Empty" handles "Disabled".
                                    // Let's stick to standard Disable if Empty.
                                }}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    'Simpan Pemain'
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Ad Slot - Sidebar style on desktop */}
            <div className="mt-6">
                <AdSlot variant="banner" adId="add-player-form" />
            </div>
        </div>
    )
}
