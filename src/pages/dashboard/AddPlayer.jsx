import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2, User, Phone, Shield, Trophy } from 'lucide-react'
import Card, { CardHeader, CardContent } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'

// League options from eFootball DB API (2025 Update)
const leagueOptions = [
    { value: '', label: 'Pilih Liga...' },
    { value: '全国都道府県対抗eスポーツ選手権 2024 SAGA', label: '全国都道府県対抗eスポーツ選手権 2024 SAGA' },
    { value: 'English League', label: 'English League' },
    { value: 'Lega Italia', label: 'Lega Italia' },
    { value: 'Spanish League', label: 'Spanish League' },
    { value: "Ligue 1 McDonald's", label: "Ligue 1 McDonald's" },
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

export default function AddPlayer() {
    const { id } = useParams()
    const navigate = useNavigate()

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
                                    // Try different logo formats
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

        // Validation
        if (!formData.team || !formData.playerName) {
            setError('Harap pilih tim dan isi nama pemain.')
            return
        }

        setIsSubmitting(true)
        setError('')

        try {
            // Simulate API call - replace with actual implementation
            console.log('Submitting player data:', formData)

            // Show success and redirect
            alert(`Pemain "${formData.playerName}" dengan tim "${formData.team}" berhasil ditambahkan!`)
            navigate(`/dashboard/tournaments/${id}/players`)
        } catch (err) {
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
        <div className="space-y-6 max-w-2xl mx-auto">
            <div>
                <button
                    onClick={() => navigate(`/dashboard/tournaments/${id}/players`)}
                    className="text-gray-400 hover:text-white flex items-center gap-2 mb-4 transition"
                >
                    <ArrowLeft className="w-4 h-4" /> Kembali ke daftar pemain
                </button>
                <h1 className="text-2xl md:text-3xl font-display font-bold">Tambah Pemain Baru</h1>
                <p className="text-gray-400 mt-1">Daftarkan pemain baru untuk turnamen</p>
            </div>

            <Card hover={false}>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-neonGreen/20 to-neonPink/20 flex items-center justify-center">
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
                            <Select
                                options={leagueOptions}
                                value={formData.league}
                                onChange={(e) => setFormData(prev => ({ ...prev, league: e.target.value }))}
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
                            <Select
                                options={teamOptions}
                                value={formData.teamId}
                                onChange={handleTeamChange}
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
                                            // Try alternate logo format on error
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
                                    Nama Pemain
                                </div>
                            }
                            placeholder="contoh: Ahmad"
                            value={formData.playerName}
                            onChange={(e) => setFormData(prev => ({ ...prev, playerName: e.target.value }))}
                        />

                        {/* Contact */}
                        <Input
                            label={
                                <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-neonPink" />
                                    Kontak (WhatsApp)
                                </div>
                            }
                            placeholder="contoh: 081234567890"
                            value={formData.contact}
                            onChange={(e) => setFormData(prev => ({ ...prev, contact: e.target.value }))}
                        />

                        {/* Submit Buttons */}
                        <div className="flex gap-3 pt-4">
                            <Button
                                type="button"
                                variant="ghost"
                                className="flex-1"
                                onClick={() => navigate(`/dashboard/tournaments/${id}/players`)}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1"
                                disabled={isSubmitting || loadingTeams}
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
        </div>
    )
}
