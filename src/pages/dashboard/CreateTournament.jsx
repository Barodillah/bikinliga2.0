import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trophy, Users, Calendar, ArrowLeft, ArrowRight, Check, Image, Upload, Link, Loader2 } from 'lucide-react'
import Card, { CardContent } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'

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

// League options for logo selection (2025 Update)
const leagueOptions = [
    { value: '', label: 'Pilih Liga untuk Logo...' },
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

export default function CreateTournament() {
    const navigate = useNavigate()
    const [step, setStep] = useState(1)
    const [formData, setFormData] = useState({
        name: '',
        logo: '',
        logoType: 'preset', // 'preset', 'upload', 'url'
        type: 'league',
        playerCount: 8,
        pointSystem: '3-1-0',
        homeAway: true,
        description: ''
    })

    // Logo states
    const [selectedLeague, setSelectedLeague] = useState('')
    const [competitions, setCompetitions] = useState([])
    const [loadingLogos, setLoadingLogos] = useState(false)
    const [logoUrl, setLogoUrl] = useState('')
    const fileInputRef = useRef(null)

    // Helper to generate logo URL based on ID (Consistent with PHP logic)
    const getLogoUrl = (id) => {
        const paddedId = String(id).padStart(4, '0')
        return `https://api.efootballdb.com/assets/2022/competitions/emb_${paddedId}_f_l.png.webp`
    }

    // Fetch competitions for logo selection
    useEffect(() => {
        const fetchCompetitions = async () => {
            setLoadingLogos(true)
            try {
                const response = await fetch('/api/teams')
                const data = await response.json()
                if (data?.data) {
                    // Extract unique competitions with logos
                    const comps = []
                    data.data.forEach(entry => {
                        entry.entries?.forEach(teamEntry => {
                            teamEntry.team?.competitions?.forEach(comp => {
                                const compData = comp.competition

                                // Use pes_id if available, otherwise fallback to id
                                const compId = compData.pes_id || compData.id

                                if (compData && !comps.find(c => c.id === compId)) {
                                    comps.push({
                                        id: compId,
                                        name: compData.competition_name,
                                        // Generate logo URL using the specific format requested
                                        logo: getLogoUrl(compId)
                                    })
                                }
                            })
                        })
                    })
                    setCompetitions(comps)
                }
            } catch (err) {
                console.error('Error fetching competitions:', err)
            } finally {
                setLoadingLogos(false)
            }
        }
        fetchCompetitions()
    }, [])

    // Handle league selection for preset logo
    const handleLeagueLogoSelect = (leagueName) => {
        setSelectedLeague(leagueName)
        const comp = competitions.find(c => c.name === leagueName)
        if (comp) {
            setFormData(prev => ({ ...prev, logo: comp.logo, logoType: 'preset' }))
        } else {
            console.warn(`Competition not found for: ${leagueName}`)
            // Try to find by partial match if exact match fails
            const partialMatch = competitions.find(c => c.name && c.name.includes(leagueName))
            if (partialMatch) {
                setFormData(prev => ({ ...prev, logo: partialMatch.logo, logoType: 'preset' }))
            }
        }
    }

    // Handle file upload
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

    // Handle URL input
    const handleUrlInput = (url) => {
        setLogoUrl(url)
        setFormData(prev => ({ ...prev, logo: url, logoType: 'url' }))
    }

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        // In real app, would call API here
        console.log('Creating tournament:', formData)
        alert('Turnamen berhasil dibuat!')
        navigate('/dashboard/tournaments')
    }

    return (
        <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <button
                    onClick={() => navigate(-1)}
                    className="text-gray-400 hover:text-white flex items-center gap-2 mb-4 transition"
                >
                    <ArrowLeft className="w-4 h-4" /> Kembali
                </button>
                <h1 className="text-2xl md:text-3xl font-display font-bold">Buat Turnamen Baru</h1>
                <p className="text-gray-400 mt-1">Setup kompetisi eFootballmu dalam beberapa langkah</p>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-between mb-8">
                {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition ${step >= s
                            ? 'bg-neonGreen text-black'
                            : 'bg-white/10 text-gray-500'
                            }`}>
                            {step > s ? <Check className="w-5 h-5" /> : s}
                        </div>
                        {s < 3 && (
                            <div className={`w-16 md:w-24 h-1 mx-2 rounded ${step > s ? 'bg-neonGreen' : 'bg-white/10'}`} />
                        )}
                    </div>
                ))}
            </div>

            <form onSubmit={handleSubmit}>
                {/* Step 1: Basic Info */}
                {step === 1 && (
                    <Card className="p-6 md:p-8">
                        <h2 className="text-xl font-display font-bold mb-6 flex items-center gap-3">
                            <Trophy className="w-6 h-6 text-neonGreen" />
                            Informasi Turnamen
                        </h2>

                        <div className="space-y-6">
                            <Input
                                label="Nama Turnamen"
                                placeholder="contoh: Warkop Cup Season 5"
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                required
                            />

                            {/* Logo Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-3">
                                    <div className="flex items-center gap-2">
                                        <Image className="w-4 h-4 text-neonPink" />
                                        Logo Turnamen
                                    </div>
                                </label>

                                {/* Logo Type Tabs */}
                                <div className="flex gap-2 mb-4">
                                    <button
                                        type="button"
                                        onClick={() => handleChange('logoType', 'preset')}
                                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 ${formData.logoType === 'preset'
                                            ? 'bg-neonGreen/20 text-neonGreen border border-neonGreen/50'
                                            : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/30'
                                            }`}
                                    >
                                        <Trophy className="w-4 h-4" />
                                        Liga
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleChange('logoType', 'upload')}
                                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 ${formData.logoType === 'upload'
                                            ? 'bg-neonGreen/20 text-neonGreen border border-neonGreen/50'
                                            : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/30'
                                            }`}
                                    >
                                        <Upload className="w-4 h-4" />
                                        Upload
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleChange('logoType', 'url')}
                                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 ${formData.logoType === 'url'
                                            ? 'bg-neonGreen/20 text-neonGreen border border-neonGreen/50'
                                            : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/30'
                                            }`}
                                    >
                                        <Link className="w-4 h-4" />
                                        URL
                                    </button>
                                </div>

                                {/* Preset Logo Selection */}
                                {formData.logoType === 'preset' && (
                                    <div className="space-y-3">
                                        <Select
                                            options={leagueOptions}
                                            value={selectedLeague}
                                            onChange={(e) => handleLeagueLogoSelect(e.target.value)}
                                        />
                                        {loadingLogos && (
                                            <div className="flex items-center gap-2 text-gray-400 text-sm">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Memuat logo liga...
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Upload Logo */}
                                {formData.logoType === 'upload' && (
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center cursor-pointer hover:border-neonGreen/50 transition"
                                    >
                                        <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                                        <p className="text-sm text-gray-400">
                                            Klik untuk upload gambar
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Format: JPG, PNG, GIF, WebP
                                        </p>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileUpload}
                                            className="hidden"
                                        />
                                    </div>
                                )}

                                {/* URL Input */}
                                {formData.logoType === 'url' && (
                                    <Input
                                        placeholder="https://example.com/logo.png"
                                        value={logoUrl}
                                        onChange={(e) => handleUrlInput(e.target.value)}
                                    />
                                )}

                                {/* Logo Preview */}
                                {formData.logo && (
                                    <div className="mt-4 flex items-center gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
                                        <img
                                            src={formData.logo}
                                            alt="Logo Preview"
                                            className="w-16 h-16 object-contain rounded-lg bg-white/10 p-2"
                                            onError={(e) => {
                                                e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🏆</text></svg>'
                                            }}
                                        />
                                        <div>
                                            <p className="text-sm font-medium text-white">Preview Logo</p>
                                            <p className="text-xs text-gray-500">
                                                {formData.logoType === 'preset' && 'Logo dari Liga'}
                                                {formData.logoType === 'upload' && 'Logo dari Upload'}
                                                {formData.logoType === 'url' && 'Logo dari URL'}
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setFormData(prev => ({ ...prev, logo: '' }))
                                                    setSelectedLeague('')
                                                    setLogoUrl('')
                                                }}
                                                className="text-xs text-red-400 hover:text-red-300 mt-1"
                                            >
                                                Hapus Logo
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-3">Jenis Kompetisi</label>
                                <div className="grid gap-3">
                                    {tournamentTypes.map((type) => (
                                        <label
                                            key={type.value}
                                            className={`p-4 rounded-lg border cursor-pointer transition ${formData.type === type.value
                                                ? 'border-neonGreen bg-neonGreen/10'
                                                : 'border-white/10 hover:border-white/30'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="radio"
                                                    name="type"
                                                    value={type.value}
                                                    checked={formData.type === type.value}
                                                    onChange={(e) => handleChange('type', e.target.value)}
                                                    className="sr-only"
                                                />
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.type === type.value ? 'border-neonGreen' : 'border-white/30'
                                                    }`}>
                                                    {formData.type === type.value && (
                                                        <div className="w-2.5 h-2.5 rounded-full bg-neonGreen" />
                                                    )}
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
                                label="Deskripsi (opsional)"
                                placeholder="Deskripsi singkat turnamen..."
                                value={formData.description}
                                onChange={(e) => handleChange('description', e.target.value)}
                            />
                        </div>

                        <div className="flex justify-end mt-8">
                            <Button type="button" onClick={() => setStep(2)} icon={ArrowRight}>
                                Lanjut
                            </Button>
                        </div>
                    </Card>
                )}

                {/* Step 2: Settings */}
                {step === 2 && (
                    <Card className="p-6 md:p-8">
                        <h2 className="text-xl font-display font-bold mb-6 flex items-center gap-3">
                            <Users className="w-6 h-6 text-neonPink" />
                            Pengaturan Peserta
                        </h2>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Jumlah Peserta</label>
                                <div className="grid grid-cols-4 gap-3">
                                    {[4, 8, 12, 16, 20, 24, 28, 32].map((num) => (
                                        <button
                                            key={num}
                                            type="button"
                                            onClick={() => handleChange('playerCount', num)}
                                            className={`py-3 rounded-lg border text-center font-bold transition ${formData.playerCount === num
                                                ? 'border-neonGreen bg-neonGreen/10 text-neonGreen'
                                                : 'border-white/10 hover:border-white/30'
                                                }`}
                                        >
                                            {num}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <Select
                                label="Sistem Poin"
                                options={pointSystems}
                                value={formData.pointSystem}
                                onChange={(e) => handleChange('pointSystem', e.target.value)}
                            />

                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                                <div>
                                    <div className="font-medium">Home & Away</div>
                                    <div className="text-sm text-gray-500">Setiap tim main 2x (kandang & tandang)</div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleChange('homeAway', !formData.homeAway)}
                                    className={`w-12 h-6 rounded-full transition ${formData.homeAway ? 'bg-neonGreen' : 'bg-white/20'}`}
                                >
                                    <div className={`w-5 h-5 rounded-full bg-white shadow transition transform ${formData.homeAway ? 'translate-x-6' : 'translate-x-0.5'}`} />
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-between mt-8">
                            <Button type="button" variant="ghost" onClick={() => setStep(1)}>
                                <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
                            </Button>
                            <Button type="button" onClick={() => setStep(3)} icon={ArrowRight}>
                                Lanjut
                            </Button>
                        </div>
                    </Card>
                )}

                {/* Step 3: Confirm */}
                {step === 3 && (
                    <Card className="p-6 md:p-8">
                        <h2 className="text-xl font-display font-bold mb-6 flex items-center gap-3">
                            <Calendar className="w-6 h-6 text-blue-400" />
                            Konfirmasi
                        </h2>

                        <div className="space-y-4 mb-8">
                            {/* Logo & Name Preview */}
                            <div className="p-4 bg-white/5 rounded-lg flex items-center gap-4">
                                {formData.logo ? (
                                    <img
                                        src={formData.logo}
                                        alt="Tournament Logo"
                                        className="w-14 h-14 object-contain rounded-lg bg-white/10 p-2"
                                        onError={(e) => {
                                            e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🏆</text></svg>'
                                        }}
                                    />
                                ) : (
                                    <div className="w-14 h-14 rounded-lg bg-white/10 flex items-center justify-center">
                                        <Trophy className="w-6 h-6 text-gray-500" />
                                    </div>
                                )}
                                <div>
                                    <div className="text-sm text-gray-500 mb-1">Nama Turnamen</div>
                                    <div className="font-bold text-lg">{formData.name || '-'}</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-white/5 rounded-lg">
                                    <div className="text-sm text-gray-500 mb-1">Jenis</div>
                                    <div className="font-medium">{tournamentTypes.find(t => t.value === formData.type)?.label}</div>
                                </div>
                                <div className="p-4 bg-white/5 rounded-lg">
                                    <div className="text-sm text-gray-500 mb-1">Peserta</div>
                                    <div className="font-medium">{formData.playerCount} Tim</div>
                                </div>
                                <div className="p-4 bg-white/5 rounded-lg">
                                    <div className="text-sm text-gray-500 mb-1">Sistem Poin</div>
                                    <div className="font-medium">{formData.pointSystem}</div>
                                </div>
                                <div className="p-4 bg-white/5 rounded-lg">
                                    <div className="text-sm text-gray-500 mb-1">Format</div>
                                    <div className="font-medium">{formData.homeAway ? 'Home & Away' : 'Single Match'}</div>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 rounded-lg border border-neonGreen/30 bg-neonGreen/10 mb-8">
                            <div className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-neonGreen mt-0.5" />
                                <div>
                                    <div className="font-medium text-neonGreen">Siap untuk dibuat!</div>
                                    <div className="text-sm text-gray-400">Kamu bisa menambahkan peserta dan jadwal setelah turnamen dibuat.</div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between">
                            <Button type="button" variant="ghost" onClick={() => setStep(2)}>
                                <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
                            </Button>
                            <Button type="submit">
                                <Trophy className="w-4 h-4 mr-2" /> Buat Turnamen
                            </Button>
                        </div>
                    </Card>
                )}
            </form>
        </div>
    )
}

