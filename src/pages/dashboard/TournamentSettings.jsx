import React, { useState, useEffect, useRef } from 'react'
import { authFetch } from '../../utils/api'
import { useParams, useNavigate } from 'react-router-dom'
import { Trophy, Users, Calendar, ArrowLeft, Save, Upload, Link, Loader2, Sparkles, Pencil, X, Image, Check, Trash2 } from 'lucide-react'
import Card, { CardContent } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import SearchableSelect from '../../components/ui/SearchableSelect'
import AdSlot from '../../components/ui/AdSlot'
import DatePicker from '../../components/ui/DatePicker'
import ConfirmationModal from '../../components/ui/ConfirmationModal'

const tournamentTypes = [
    { value: 'league', label: 'Liga (Round Robin)', desc: 'Semua tim bermain melawan satu sama lain' },
    { value: 'knockout', label: 'Knockout (Gugur)', desc: 'Kalah berarti tersingkir langsung' },
    { value: 'group_knockout', label: 'Group Stage + Knockout', desc: 'Babak grup lalu babak gugur' },
]

const pointSystems = [
    { value: '3-1-0', label: '3-1-0 (Standard)' },
    { value: '2-1-0', label: '2-1-0 (Classic)' },
    { value: '3-0', label: '3-0 (No Draw)' },
]

import { useToast } from '../../contexts/ToastContext'
import { useAuth } from '../../contexts/AuthContext'

export default function TournamentSettings() {
    const { user } = useAuth()
    const { error, success } = useToast()
    const { id } = useParams()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)

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
        lastRegistrationDate: '',
        status: 'draft'
    })

    const [selectedLeague, setSelectedLeague] = useState('')
    const [leagues, setLeagues] = useState([])
    const [leagueOptions, setLeagueOptions] = useState([{ value: '', label: 'Pilih Liga untuk Logo...' }])
    const [loadingLogos, setLoadingLogos] = useState(false)
    const [logoUrl, setLogoUrl] = useState('')
    const fileInputRef = useRef(null)
    const errorShownRef = useRef(false)

    useEffect(() => {
        const fetchTournament = async () => {
            setLoading(true)
            try {
                const response = await authFetch(`/api/tournaments/${id}`)
                const data = await response.json()

                if (data.success) {
                    const t = data.data

                    // Security Check
                    if (user && String(t.organizer_id) !== String(user.id)) {
                        if (!errorShownRef.current) {
                            error('Akses ditolak, anda melanggar berpotensi dibanned!')
                            errorShownRef.current = true
                        }
                        navigate('/dashboard/tournaments')
                        return
                    }

                    // Smart Logo Detection
                    let initialLogoType = 'url'
                    let initialLeague = ''

                    if (t.logo) {
                        const presetMatch = t.logo.match(/media\.api-sports\.io\/football\/leagues\/(\d+)\.png/)
                        if (presetMatch) {
                            initialLogoType = 'preset'
                            initialLeague = presetMatch[1]
                        } else if (t.logo.startsWith('data:image')) {
                            initialLogoType = 'upload'
                        } else {
                            initialLogoType = 'url'
                        }
                    } else {
                        initialLogoType = 'preset'
                    }

                    // Fix date format
                    let validDate = ''
                    if (t.lastRegistrationDate) {
                        try {
                            validDate = new Date(t.lastRegistrationDate).toISOString().split('T')[0]
                        } catch (e) {
                            console.log('Invalid date format', t.lastRegistrationDate)
                        }
                    }

                    setFormData({
                        name: t.name,
                        logo: t.logo || '',
                        logoType: initialLogoType,
                        type: t.type,
                        playerCount: t.maxParticipants || t.players || 0,
                        pointSystem: t.pointSystem,
                        homeAway: t.homeAway,
                        description: t.description || '',
                        visibility: t.visibility,
                        paymentMode: 'manual',
                        lastRegistrationDate: validDate,
                        status: t.status
                    })
                    setLogoUrl(t.logo || '')
                    setSelectedLeague(initialLeague)

                } else {
                    error(data.message || 'Gagal memuat data turnamen')
                }
            } catch (err) {
                console.error('Fetch error:', err)
                error('Gagal memuat data turnamen')
            } finally {
                setLoading(false)
            }
        }
        if (id) fetchTournament()
    }, [id, user, navigate, error])

    const getLogoUrl = (leagueId) => {
        return `https://media.api-sports.io/football/leagues/${leagueId}.png`
    }
    useEffect(() => {
        const fetchLeagues = async () => {
            setLoadingLogos(true)
            try {
                // Use local proxy to avoid CORS issues
                const response = await authFetch("/api/leagues")
                const data = await response.json()

                if (data?.response) {
                    // Extract leagues with their IDs and logos
                    const leaguesData = data.response.map(item => ({
                        id: item.league.id,
                        name: item.league.name,
                        country: item.country?.name || 'International',
                        logo: getLogoUrl(item.league.id)
                    }))

                    // Sort by country then name
                    leaguesData.sort((a, b) => {
                        if (a.country !== b.country) return a.country.localeCompare(b.country)
                        return a.name.localeCompare(b.name)
                    })

                    setLeagues(leaguesData)

                    // Create options for select dropdown
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

    // Event Handlers
    const handleChange = (field, value) => {
        let finalValue = value;
        if (field === 'name') {
            // Capitalize first letter of every word
            finalValue = value.replace(/\b\w/g, (char) => char.toUpperCase());
        }
        setFormData(prev => ({
            ...prev,
            [field]: finalValue
        }))
    }

    const handleLeagueLogoSelect = (leagueId) => {
        setSelectedLeague(leagueId)
        if (leagueId) {
            const logoUrl = getLogoUrl(leagueId)
            setFormData(prev => ({ ...prev, logo: logoUrl, logoType: 'preset' }))
            setLogoUrl(logoUrl)
        } else {
            setFormData(prev => ({ ...prev, logo: '', logoType: 'preset' }))
            setLogoUrl('')
        }
    }

    const handleUrlInput = (url) => {
        setLogoUrl(url)
        setFormData(prev => ({ ...prev, logo: url }))
    }

    const handleFileUpload = (e) => {
        const file = e.target.files[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, logo: reader.result }))
                setLogoUrl(reader.result)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)

        try {
            const payload = {
                name: formData.name,
                description: formData.description,
                type: formData.type,
                max_participants: parseInt(formData.playerCount),
                point_system: formData.pointSystem,
                match_format: formData.homeAway ? 'home_away' : 'single',
                visibility: formData.visibility,
                last_registration_date: formData.lastRegistrationDate,
                logo_url: formData.logo,
                // paymentMode not yet in backend
            }

            const response = await authFetch(`/api/tournaments/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })

            const data = await response.json()

            if (data.success) {
                success('Data turnamen berhasil disimpan')
                navigate(`/dashboard/tournaments/${id}`)
            } else {
                error(data.message || 'Gagal menyimpan perubahan')
            }
        } catch (err) {
            console.error('Save error:', err)
            error('Terjadi kesalahan saat menyimpan')
        } finally {
            setSaving(false)
        }
    }

    const handleDeleteTournament = async () => {
        setDeleting(true)
        try {
            const response = await authFetch(`/api/tournaments/${id}`, {
                method: 'DELETE'
            })
            const data = await response.json()

            if (data.success) {
                success('Turnamen berhasil dihapus')
                navigate('/dashboard/tournaments')
            } else {
                error(data.message || 'Gagal menghapus turnamen')
            }
        } catch (err) {
            console.error('Delete error:', err)
            error('Terjadi kesalahan saat menghapus turnamen')
        } finally {
            setDeleting(false)
            setShowDeleteModal(false)
        }
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
                                    {loadingLogos && (
                                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Memuat logo liga...
                                        </div>
                                    )}
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
                        <DatePicker
                            label="Tanggal Terakhir Pendaftaran"
                            value={formData.lastRegistrationDate}
                            onChange={(date) => handleChange('lastRegistrationDate', date)}
                        />

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Jumlah Peserta (Max)</label>

                            {/* LEAGUE Logic */}
                            {formData.type === 'league' && (
                                <div className="space-y-4">
                                    <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg flex gap-3">
                                        <div className="mt-1">
                                            <Users className="w-5 h-5 text-blue-400" />
                                        </div>
                                        <div>
                                            <h4 className="text-blue-400 font-medium mb-1">Liga (Round Robin)</h4>
                                            <p className="text-sm text-gray-400">
                                                Tidak ada batasan kaku jumlah peserta. Liga akan berjalan sesuai jumlah tim yang mendaftar.
                                                <span className="block mt-1 text-white/80">Minimal 3 tim diperlukan.</span>
                                            </p>
                                        </div>
                                    </div>
                                    <Input
                                        type="text"
                                        inputMode="numeric"
                                        value={formData.playerCount}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/[^0-9]/g, '');
                                            handleChange('playerCount', val ? parseInt(val) : 0);
                                        }}
                                        placeholder="Masukkan jumlah tim..."
                                        label="Estimasi Jumlah Tim"
                                    />
                                </div>
                            )}

                            {/* KNOCKOUT Logic */}
                            {formData.type === 'knockout' && (
                                <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                                    {[4, 8, 16, 32, 64].map((num) => (
                                        <button
                                            key={num}
                                            type="button"
                                            onClick={() => handleChange('playerCount', num)}
                                            className={`py-3 rounded-lg border text-center font-bold transition ${formData.playerCount === num
                                                ? 'border-neonGreen bg-neonGreen/10 text-neonGreen'
                                                : 'border-white/10 hover:border-white/30'
                                                }`}
                                        >
                                            {num} Tim
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* GROUP STAGE Logic */}
                            {formData.type === 'group_knockout' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {[
                                        { total: 6, label: '6 Tim', sub: '2 Grup @ 3 Tim' },
                                        { total: 8, label: '8 Tim', sub: '2 Grup @ 4 Tim' },
                                        { total: 12, label: '12 Tim', sub: '4 Grup @ 3 Tim' },
                                        { total: 16, label: '16 Tim', sub: '4 Grup @ 4 Tim' },
                                        { total: 24, label: '24 Tim', sub: '4 Grup @ 6 Tim' },
                                        { total: 32, label: '32 Tim', sub: '8 Grup @ 4 Tim' },
                                    ].map((opt) => (
                                        <button
                                            key={opt.total}
                                            type="button"
                                            onClick={() => handleChange('playerCount', opt.total)}
                                            className={`p-4 rounded-lg border text-left transition ${formData.playerCount === opt.total
                                                ? 'border-neonGreen bg-neonGreen/10'
                                                : 'border-white/10 hover:border-white/30'
                                                }`}
                                        >
                                            <div className={`font-bold ${formData.playerCount === opt.total ? 'text-neonGreen' : 'text-white'}`}>
                                                {opt.label}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {opt.sub}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
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
                    {/* Delete Section */}
                    <div className="flex justify-between gap-3 mt-8 pt-6 border-t border-white/10">
                        {formData.status === 'draft' && (
                            <Button
                                type="button"
                                variant="destructive"
                                className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20"
                                onClick={() => setShowDeleteModal(true)}
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Hapus Turnamen
                            </Button>
                        )}
                        <div className="flex gap-3 ml-auto">
                            <Button type="button" variant="ghost" onClick={() => navigate(`/dashboard/tournaments/${id}`)}>
                                Batal
                            </Button>
                            <Button type="submit" icon={Save} disabled={saving}>
                                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </Button>
                        </div>
                    </div>
                </Card>
            </form>

            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDeleteTournament}
                title="Hapus Turnamen?"
                message={`Apakah Anda yakin ingin menghapus turnamen "${formData.name}"? Data yang sudah dihapus tidak dapat dikembalikan.`}
                confirmText={deleting ? 'Menghapus...' : 'Ya, Hapus'}
                confirmVariant="danger"
                isLoading={deleting}
            />
        </div >
    )
}
