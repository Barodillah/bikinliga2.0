import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Trophy, Users, Calendar, ArrowLeft, Save, Upload, Link, Loader2, Sparkles, Pencil, X, Image, Check } from 'lucide-react'
import Card, { CardContent } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import SearchableSelect from '../../components/ui/SearchableSelect'
import AdSlot from '../../components/ui/AdSlot'

const tournamentTypes = [
    { value: 'league', label: 'Liga (Round Robin)', desc: 'Semua tim bermain melawan satu sama lain' },
    { value: 'knockout', label: 'Knockout (Gugur)', desc: 'Kalah berarti tersingkir langsung' },
    { value: 'group', label: 'Group Stage + Knockout', desc: 'Babak grup lalu babak gugur' },
]

const pointSystems = [
    { value: '3-1-0', label: '3-1-0 (Standard)' },
    { value: '2-1-0', label: '2-1-0 (Classic)' },
    { value: '3-0', label: '3-0 (No Draw)' },
]

// Mock data (replace with actual fetch in production)
const getTournamentData = (id) => {
    // Return sample draft data
    return {
        id: id,
        name: 'Weekend Warriors Cup',
        logo: '',
        logoType: 'preset',
        type: 'league',
        playerCount: 8,
        pointSystem: '3-1-0',
        homeAway: true,
        description: 'Turnamen akhir pekan untuk komunitas gaming',
        visibility: 'public',
        paymentMode: 'manual',
        status: 'draft',
        lastRegistrationDate: '2024-03-30', // New field
    }
}

export default function TournamentSettings() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)

    const [formData, setFormData] = useState({
        name: '',
        logo: '',
        logoType: 'preset',
        type: 'league',
        playerCount: 8,
        pointSystem: '3-1-0',
        homeAway: true,
        description: '',
        visibility: 'public',
        paymentMode: 'manual',
        lastRegistrationDate: ''
    })

    // Logo states
    const [selectedLeague, setSelectedLeague] = useState('')
    const [leagues, setLeagues] = useState([])
    const [leagueOptions, setLeagueOptions] = useState([{ value: '', label: 'Pilih Liga untuk Logo...' }])
    const [loadingLogos, setLoadingLogos] = useState(false)
    const [logoUrl, setLogoUrl] = useState('')
    const fileInputRef = useRef(null)

    // Load initial data
    useEffect(() => {
        // Simulate fetch
        const data = getTournamentData(id)
        setFormData(data)
    }, [id])

    // Fetch leagues from api-sports.io via proxy (copied from CreateTournament)
    useEffect(() => {
        const fetchLeagues = async () => {
            setLoadingLogos(true)
            try {
                const response = await fetch("/api/leagues")
                const data = await response.json()

                if (data?.response) {
                    const leaguesData = data.response.map(item => ({
                        id: item.league.id,
                        name: item.league.name,
                        country: item.country?.name || 'International',
                        logo: `https://media.api-sports.io/football/leagues/${item.league.id}.png`
                    }))

                    leaguesData.sort((a, b) => {
                        if (a.country !== b.country) return a.country.localeCompare(b.country)
                        return a.name.localeCompare(b.name)
                    })

                    setLeagues(leaguesData)

                    const options = [
                        { value: '', label: 'Pilih Liga untuk Logo...' },
                        ...leaguesData.map(league => ({
                            value: league.id.toString(),
                            label: `${league.name} (${league.country})`
                        }))
                    ]
                    setLeagueOptions(options)
                }
            } catch (err) {
                console.error('Error fetching leagues:', err)
            } finally {
                setLoadingLogos(false)
            }
        }
        fetchLeagues()
    }, [])

    const handleLeagueLogoSelect = (leagueId) => {
        setSelectedLeague(leagueId)
        if (leagueId) {
            const logoUrl = `https://media.api-sports.io/football/leagues/${leagueId}.png`
            setFormData(prev => ({ ...prev, logo: logoUrl, logoType: 'preset' }))
        } else {
            setFormData(prev => ({ ...prev, logo: '', logoType: 'preset' }))
        }
    }

    const handleFileUpload = (e) => {
        const file = e.target.files?.[0]
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('Hanya file gambar yang diperbolehkan!')
                return
            }
            const reader = new FileReader()
            reader.onload = (event) => {
                setFormData(prev => ({ ...prev, logo: event.target.result, logoType: 'upload' }))
            }
            reader.readAsDataURL(file)
        }
    }

    const handleUrlInput = (url) => {
        setLogoUrl(url)
        setFormData(prev => ({ ...prev, logo: url, logoType: 'url' }))
    }

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)

        // Simulate API save
        await new Promise(resolve => setTimeout(resolve, 1000))

        console.log('Updating tournament:', formData)
        setSaving(false)
        navigate(`/dashboard/tournaments/${id}`)
    }

    return (
        <div className="w-full mx-auto max-w-4xl space-y-6">
            {/* Header */}
            <div>
                <button
                    onClick={() => navigate(`/dashboard/tournaments/${id}`)}
                    className="text-gray-400 hover:text-white flex items-center gap-2 mb-4 transition"
                >
                    <ArrowLeft className="w-4 h-4" /> Kembali ke Detail
                </button>
                <h1 className="text-2xl md:text-3xl font-display font-bold">Pengaturan Turnamen</h1>
                <p className="text-gray-400 mt-1">Ubah informasi dan pengaturan kompetisi</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <Card className="p-6 md:p-8">
                    <h2 className="text-xl font-display font-bold mb-6 flex items-center gap-3">
                        <Trophy className="w-6 h-6 text-neonGreen" />
                        Informasi Dasar
                    </h2>

                    <div className="space-y-6">
                        <Input
                            label="Nama Turnamen"
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            required
                        />

                        {/* Logo Section */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-3">
                                <div className="flex items-center gap-2">
                                    <Image className="w-4 h-4 text-neonPink" />
                                    Logo Turnamen
                                </div>
                            </label>

                            <div className="flex gap-2 mb-4">
                                <button type="button" onClick={() => handleChange('logoType', 'preset')} className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 ${formData.logoType === 'preset' ? 'bg-neonGreen/20 text-neonGreen border border-neonGreen/50' : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/30'}`}><Trophy className="w-4 h-4" /> Liga</button>
                                <button type="button" onClick={() => handleChange('logoType', 'upload')} className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 ${formData.logoType === 'upload' ? 'bg-neonGreen/20 text-neonGreen border border-neonGreen/50' : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/30'}`}><Upload className="w-4 h-4" /> Upload</button>
                                <button type="button" onClick={() => handleChange('logoType', 'url')} className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 ${formData.logoType === 'url' ? 'bg-neonGreen/20 text-neonGreen border border-neonGreen/50' : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/30'}`}><Link className="w-4 h-4" /> URL</button>
                            </div>

                            {formData.logoType === 'preset' && (
                                <div className="space-y-3">
                                    <SearchableSelect options={leagueOptions} value={selectedLeague} onChange={(e) => handleLeagueLogoSelect(e.target.value)} placeholder="Pilih Liga untuk Logo..." />
                                </div>
                            )}

                            {formData.logoType === 'upload' && (
                                <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center cursor-pointer hover:border-neonGreen/50 transition">
                                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                                </div>
                            )}

                            {formData.logoType === 'url' && (
                                <Input placeholder="https://example.com/logo.png" value={logoUrl} onChange={(e) => handleUrlInput(e.target.value)} />
                            )}

                            {formData.logo && (
                                <div className="mt-4 flex items-center gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
                                    <img src={formData.logo} alt="Preview" className="w-16 h-16 object-contain rounded-lg bg-white/10 p-2" onError={(e) => { e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🏆</text></svg>' }} />
                                    <button type="button" onClick={() => { setFormData(prev => ({ ...prev, logo: '' })); setSelectedLeague(''); setLogoUrl('') }} className="text-xs text-red-400">Hapus Logo</button>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-3">Jenis Kompetisi</label>
                            <div className="grid gap-3">
                                {tournamentTypes.map((type) => (
                                    <label key={type.value} className={`p-4 rounded-lg border cursor-pointer transition ${formData.type === type.value ? 'border-neonGreen bg-neonGreen/10' : 'border-white/10 hover:border-white/30'}`}>
                                        <div className="flex items-center gap-3">
                                            <input type="radio" name="type" value={type.value} checked={formData.type === type.value} onChange={(e) => handleChange('type', e.target.value)} className="sr-only" />
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.type === type.value ? 'border-neonGreen' : 'border-white/30'}`}>
                                                {formData.type === type.value && <div className="w-2.5 h-2.5 rounded-full bg-neonGreen" />}
                                            </div>
                                            <div>
                                                <div className="font-medium">{type.label}</div>
                                                <div className="text-sm text-gray-500">{type.desc}</div>
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <Input
                            label="Deskripsi"
                            placeholder="Deskripsi singkat turnamen..."
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                        />
                    </div>
                </Card>

                {/* Settings */}
                <Card className="p-6 md:p-8">
                    <h2 className="text-xl font-display font-bold mb-6 flex items-center gap-3">
                        <Users className="w-6 h-6 text-neonPink" />
                        Pengaturan & Jadwal
                    </h2>

                    <div className="space-y-6">
                        <Input
                            type="date"
                            label="Tanggal Terakhir Pendaftaran"
                            value={formData.lastRegistrationDate}
                            onChange={(e) => handleChange('lastRegistrationDate', e.target.value)}
                            required
                        />

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Jumlah Peserta (Max)</label>
                            <Input
                                type="number"
                                min="2"
                                value={formData.playerCount}
                                onChange={(e) => handleChange('playerCount', parseInt(e.target.value) || 0)}
                            />
                        </div>

                        <Select
                            label="Sistem Poin"
                            options={pointSystems}
                            value={formData.pointSystem}
                            onChange={(e) => handleChange('pointSystem', e.target.value)}
                        />

                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                            <div>
                                <div className="font-medium">Format Pertandingan</div>
                                <div className="text-sm text-gray-500">{formData.homeAway ? 'Home & Away' : 'Single Match'}</div>
                            </div>
                            <button type="button" onClick={() => handleChange('homeAway', !formData.homeAway)} className={`w-12 h-6 rounded-full transition ${formData.homeAway ? 'bg-neonGreen' : 'bg-white/20'}`}>
                                <div className={`w-5 h-5 rounded-full bg-white shadow transition transform ${formData.homeAway ? 'translate-x-6' : 'translate-x-0.5'}`} />
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                            <div>
                                <div className="font-medium">Visibility</div>
                                <div className="text-sm text-gray-500">{formData.visibility === 'public' ? 'Public' : 'Private'}</div>
                            </div>
                            <button type="button" onClick={() => handleChange('visibility', formData.visibility === 'public' ? 'private' : 'public')} className={`w-12 h-6 rounded-full transition ${formData.visibility === 'public' ? 'bg-neonGreen' : 'bg-white/20'}`}>
                                <div className={`w-5 h-5 rounded-full bg-white shadow transition transform ${formData.visibility === 'public' ? 'translate-x-6' : 'translate-x-0.5'}`} />
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                            <div>
                                <div className="font-medium">Payment System</div>
                                <div className="text-sm text-gray-500">{formData.paymentMode === 'system' ? 'Paid on System' : 'Manual'}</div>
                            </div>
                            <button type="button" onClick={() => handleChange('paymentMode', formData.paymentMode === 'system' ? 'manual' : 'system')} className={`w-12 h-6 rounded-full transition ${formData.paymentMode === 'system' ? 'bg-neonGreen' : 'bg-white/20'}`}>
                                <div className={`w-5 h-5 rounded-full bg-white shadow transition transform ${formData.paymentMode === 'system' ? 'translate-x-6' : 'translate-x-0.5'}`} />
                            </button>
                        </div>
                    </div>
                </Card>

                <div className="flex justify-end gap-3">
                    <Button type="button" variant="ghost" onClick={() => navigate(`/dashboard/tournaments/${id}`)}>
                        Batal
                    </Button>
                    <Button type="submit" icon={Save} disabled={saving}>
                        {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </Button>
                </div>
            </form>
        </div>
    )
}
