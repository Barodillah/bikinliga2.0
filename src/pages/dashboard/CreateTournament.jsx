import React, { useState, useEffect, useRef } from 'react'
import { authFetch } from '../../utils/api'
import { useNavigate } from 'react-router-dom'
import { Trophy, Users, Calendar, ArrowLeft, ArrowRight, Check, Image, Upload, Link, Loader2, Sparkles, Pencil, X } from 'lucide-react'
import ReactJoyride, { EVENTS, STATUS } from 'react-joyride'
import Card, { CardContent } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import SearchableSelect from '../../components/ui/SearchableSelect'
import AdSlot, { AdSlotWrapper } from '../../components/ui/AdSlot'

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

export default function CreateTournament() {
    const { success, error } = useToast()
    const navigate = useNavigate()
    const [step, setStep] = useState(1)

    // Tour State
    const [runTour, setRunTour] = useState(false);
    const [tourSteps, setTourSteps] = useState([]);

    const steps1 = [
        {
            target: '#tour-tournament-name',
            content: 'Mulai dengan memberi nama untuk turnamenmu. Buat yang unik dan mudah diingat!',
            title: 'Nama Turnamen',
            disableBeacon: true,
        },
        {
            target: '#tour-logo-section',
            content: 'Pilih logo turnamen. Kamu bisa gunakan preset Liga yang tersedia, upload sendiri, atau gunakan URL.',
            title: 'Logo Turnamen',
        },
        {
            target: '#tour-competition-type',
            content: 'Pilih format kompetisimu: Liga (Round Robin), Knockout (Gugur), atau Group Stage + Knockout.',
            title: 'Jenis Kompetisi',
        },
        {
            target: '#tour-ai-desc',
            content: 'Bingung nulis deskripsi? Gunakan AI kami untuk membuatkan deskripsi yang menarik secara instan!',
            title: 'Bantuan AI',
        }
    ];

    const steps2 = [
        {
            target: '#tour-participant-count',
            content: 'Tentukan jumlah peserta yang akan mengikuti turnamen ini. Sesuaikan dengan format yang kamu pilih.',
            title: 'Jumlah Peserta',
            disableBeacon: true,
        },
        {
            target: '#tour-points-system',
            content: 'Pilih sistem poin yang akan digunakan untuk menentukan peringkat (hanya untuk Liga/Group).',
            title: 'Sistem Poin',
        },
        {
            target: '#tour-match-format',
            content: 'Tentukan apakah pertandingan berjalan 1 leg (Single Match) atau 2 leg (Home & Away).',
            title: 'Format Pertandingan',
        },
        {
            target: '#tour-visibility',
            content: 'Atur visibilitas turnamenmu. Public bisa dilihat semua orang, Private hanya bisa diakses lewat link.',
            title: 'Visibilitas',
        }
    ];

    const steps3 = [
        {
            target: '#tour-summary',
            content: 'Periksa kembali semua data turnamenmu sebelum dibuat. Pastikan semuanya sudah benar.',
            title: 'Konfirmasi Data',
            disableBeacon: true,
        },
        {
            target: '#tour-submit',
            content: 'Jika sudah yakin, klik tombol ini untuk membuat turnamenmu!',
            title: 'Buat Turnamen',
        }
    ];

    useEffect(() => {
        const tourSeen = localStorage.getItem('create_tournament_tour_seen');
        if (!tourSeen) {
            if (step === 1) setTourSteps(steps1);
            if (step === 2) setTourSteps(steps2);
            if (step === 3) setTourSteps(steps3);
            setRunTour(true);
        }
    }, [step]);

    const handleJoyrideCallback = (data) => {
        const { status } = data;

        if (status === STATUS.SKIPPED) {
            setRunTour(false);
            localStorage.setItem('create_tournament_tour_seen', 'true');
        } else if (status === STATUS.FINISHED) {
            setRunTour(false);
            if (step === 3) {
                localStorage.setItem('create_tournament_tour_seen', 'true');
            }
        }
    };

    const [formData, setFormData] = useState({
        name: '',
        logo: '',
        logoType: 'preset', // 'preset', 'upload', 'url'
        type: 'league',
        playerCount: 8,
        pointSystem: '3-1-0',
        homeAway: true,
        description: '',
        visibility: 'public',
        paymentMode: 'manual'
    })

    // Logo states
    const [selectedLeague, setSelectedLeague] = useState('')
    const [leagues, setLeagues] = useState([])
    const [leagueOptions, setLeagueOptions] = useState([{ value: '', label: 'Pilih Liga untuk Logo...' }])
    const [loadingLogos, setLoadingLogos] = useState(false)
    const [logoUrl, setLogoUrl] = useState('')
    const fileInputRef = useRef(null)

    // AI Modal State
    const [showAIModal, setShowAIModal] = useState(false)
    const [isGeneratingAI, setIsGeneratingAI] = useState(false)
    const [aiPrompt, setAiPrompt] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleGenerateAI = async () => {
        setIsGeneratingAI(true)
        // Simulate AI generation
        setTimeout(() => {
            const generatedDesc = `Turnamen ${formData.name || 'ini'} mempertandingkan tim-tim terbaik dalam format ${formData.type} yang kompetitif. Tujuan utama adalah menjunjung tinggi sportivitas dan mencari juara sejati Season ini!`
            setFormData(prev => ({ ...prev, description: generatedDesc }))
            setIsGeneratingAI(false)
            setShowAIModal(false)
            setAiPrompt('')
        }, 1500)
    }

    // Helper to generate logo URL based on league ID from api-sports.io
    const getLogoUrl = (leagueId) => {
        return `https://media.api-sports.io/football/leagues/${leagueId}.png`
    }

    // Fetch leagues from api-sports.io via proxy
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

    // Handle league selection for preset logo
    const handleLeagueLogoSelect = (leagueId) => {
        setSelectedLeague(leagueId)
        if (leagueId) {
            const logoUrl = getLogoUrl(leagueId)
            setFormData(prev => ({ ...prev, logo: logoUrl, logoType: 'preset' }))
        } else {
            setFormData(prev => ({ ...prev, logo: '', logoType: 'preset' }))
        }
    }

    // Handle file upload
    const handleFileUpload = (e) => {
        const file = e.target.files?.[0]
        if (file) {
            if (!file.type.startsWith('image/')) {
                error('Hanya file gambar yang diperbolehkan!')
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

    // Validation for steps
    const isStepValid = () => {
        if (step === 1) {
            // Step 1: Name and Logo required
            // Note: User said "semua wajib diisi kecuali deskripsi"
            // For logo, we check if logo string is not empty
            return formData.name.trim() !== '' && formData.logo !== ''
        }
        if (step === 2) {
            // Step 2: Player count validation
            if (formData.type === 'league') {
                return formData.playerCount >= 3
            }
            return formData.playerCount > 1 // Simplest check for other types
        }
        return true
    }

    const handleChange = (field, value) => {
        let finalValue = value;
        if (field === 'name') {
            // Capitalize first letter of every word
            finalValue = value.replace(/\b\w/g, (char) => char.toUpperCase());
        }

        setFormData(prev => {
            const newState = { ...prev, [field]: finalValue };

            // If user selects Knockout, default to Single Match (homeAway = false)
            if (field === 'type' && finalValue === 'knockout') {
                newState.homeAway = false;
            }

            return newState;
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (isSubmitting) return
        setIsSubmitting(true)

        try {
            const response = await authFetch('/api/tournaments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            })

            const data = await response.json()

            if (!data.success) {
                throw new Error(data.message)
            }

            success('Turnamen berhasil dibuat!')
            navigate('/dashboard/tournaments')
        } catch (err) {
            console.error('Failed to create tournament:', err)
            error(err.message || 'Gagal membuat turnamen')
            setIsSubmitting(false)
        }
    }

    return (
        <div className="w-full mx-auto">
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
                            <div id="tour-tournament-name">
                                <Input
                                    label="Nama Turnamen"
                                    placeholder="contoh: Warkop Cup Season 5"
                                    value={formData.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    required
                                />
                            </div>

                            {/* Logo Selection */}
                            <div id="tour-logo-section">
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
                                        <SearchableSelect
                                            options={leagueOptions}
                                            value={selectedLeague}
                                            onChange={(e) => handleLeagueLogoSelect(e.target.value)}
                                            placeholder="Pilih Liga untuk Logo..."
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

                            <div id="tour-competition-type">
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

                            <div className="relative">
                                <Input
                                    label={
                                        <div className="flex items-center justify-between w-full">
                                            <span>Deskripsi (opsional)</span>
                                            <button
                                                type="button"
                                                id="tour-ai-desc"
                                                onClick={() => setShowAIModal(true)}
                                                className="text-xs flex items-center gap-1 text-neonGreen hover:text-white transition group"
                                                title="Generate with AI"
                                            >
                                                <div className="relative">
                                                    <Pencil className="w-3 h-3 relative z-10" />
                                                    <Sparkles className="w-3 h-3 absolute -top-1 -right-1.5 text-neonPink group-hover:scale-110 transition animate-pulse" />
                                                </div>
                                                <span className="ml-1">Generate AI</span>
                                            </button>
                                        </div>
                                    }
                                    placeholder="Deskripsi singkat turnamen..."
                                    value={formData.description}
                                    onChange={(e) => handleChange('description', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end mt-8">
                            <Button
                                type="button"
                                onClick={() => setStep(2)}
                                icon={ArrowRight}
                                disabled={!isStepValid()}
                            >
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
                            <div id="tour-participant-count">
                                <label className="block text-sm font-medium text-gray-300 mb-2">Jumlah Peserta</label>

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
                                                    ```
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

                            <div id="tour-points-system">
                                {formData.type !== 'knockout' && (
                                    <Select
                                        label="Sistem Poin"
                                        options={pointSystems}
                                        value={formData.pointSystem}
                                        onChange={(e) => handleChange('pointSystem', e.target.value)}
                                    />
                                )}
                            </div>

                            <div id="tour-match-format" className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                                <div>
                                    <div className="font-medium">Format Pertandingan</div>
                                    <div className="text-sm text-gray-500">
                                        {formData.homeAway
                                            ? 'Home & Away (Bertemu 2x - Kandang & Tandang)'
                                            : 'Single Match (Bertemu 1x - Satu Putaran)'}
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleChange('homeAway', !formData.homeAway)}
                                    className={`w-12 h-6 rounded-full transition ${formData.homeAway ? 'bg-neonGreen' : 'bg-white/20'}`}
                                >
                                    <div className={`w-5 h-5 rounded-full bg-white shadow transition transform ${formData.homeAway ? 'translate-x-6' : 'translate-x-0.5'}`} />
                                </button>
                            </div>

                            {/* Visibility Toggle */}
                            <div id="tour-visibility" className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                                <div>
                                    <div className="font-medium">Visibility</div>
                                    <div className="text-sm text-gray-500">
                                        {formData.visibility === 'public' ? 'Public (Terlihat oleh semua)' : 'Private (Hanya via link/undangan)'}
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleChange('visibility', formData.visibility === 'public' ? 'private' : 'public')}
                                    className={`w-12 h-6 rounded-full transition ${formData.visibility === 'public' ? 'bg-neonGreen' : 'bg-white/20'}`}
                                >
                                    <div className={`w-5 h-5 rounded-full bg-white shadow transition transform ${formData.visibility === 'public' ? 'translate-x-6' : 'translate-x-0.5'}`} />
                                </button>
                            </div>

                            {/* Payment Mode Toggle */}
                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                                <div>
                                    <div className="font-medium">Payment System</div>
                                    <div className="text-sm text-gray-500">
                                        {formData.paymentMode === 'system' ? 'Paid on System (Otomatis)' : 'Manual (Transfer Admin)'}
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleChange('paymentMode', formData.paymentMode === 'system' ? 'manual' : 'system')}
                                    className={`w-12 h-6 rounded-full transition ${formData.paymentMode === 'system' ? 'bg-neonGreen' : 'bg-white/20'}`}
                                >
                                    <div className={`w-5 h-5 rounded-full bg-white shadow transition transform ${formData.paymentMode === 'system' ? 'translate-x-6' : 'translate-x-0.5'}`} />
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-between mt-8">
                            <Button type="button" variant="ghost" onClick={() => setStep(1)}>
                                <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
                            </Button>
                            <Button
                                type="button"
                                onClick={() => {
                                    if (formData.type === 'league' && formData.playerCount < 3) {
                                        error('Minimal 3 tim untuk Liga!')
                                        return
                                    }
                                    setStep(3)
                                }}
                                icon={ArrowRight}
                                disabled={!isStepValid()}
                            >
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

                        <div id="tour-summary" className="space-y-4 mb-8">
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
                                <div className="p-4 bg-white/5 rounded-lg">
                                    <div className="text-sm text-gray-500 mb-1">Visibilitas</div>
                                    <div className="font-medium capitalize">{formData.visibility}</div>
                                </div>
                                <div className="p-4 bg-white/5 rounded-lg">
                                    <div className="text-sm text-gray-500 mb-1">Pembayaran</div>
                                    <div className="font-medium">
                                        {formData.paymentMode === 'system' ? 'System (Auto)' : 'Manual'}
                                    </div>
                                </div>
                            </div>

                            {formData.description && (
                                <div className="p-4 bg-white/5 rounded-lg border border-white/5">
                                    <div className="text-sm text-gray-500 mb-1">Deskripsi Turnamen</div>
                                    <p className="text-gray-300 italic">"{formData.description}"</p>
                                </div>
                            )}
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
                            <Button type="submit" disabled={isSubmitting} id="tour-submit">
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Memproses...
                                    </>
                                ) : (
                                    <>
                                        <Trophy className="w-4 h-4 mr-2" /> Buat Turnamen
                                    </>
                                )}
                            </Button>
                        </div>
                    </Card>
                )}
            </form>

            {/* Ad Slot */}
            <div className="mt-6">
                <AdSlot variant="banner" adId="create-tournament" />
            </div>

            {/* AI Generation Modal */}
            {
                showAIModal && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                        <div className="bg-cardBg border border-neonGreen/30 rounded-2xl w-full max-w-md p-6 relative animate-in fade-in zoom-in duration-200">
                            <button
                                onClick={() => setShowAIModal(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-full bg-neonGreen/20 flex items-center justify-center">
                                    <Sparkles className="w-5 h-5 text-neonGreen" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Generate Deskripsi</h3>
                                    <p className="text-xs text-gray-400">Gunakan AI untuk membuat deskripsi menarik</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-300 mb-2">Prompt / Keywords (Opsional)</label>
                                    <Input
                                        placeholder="cth: kompetisi sengit, hadiah besar..."
                                        value={aiPrompt}
                                        onChange={(e) => setAiPrompt(e.target.value)}
                                    />
                                </div>

                                <Button
                                    type="button"
                                    onClick={handleGenerateAI}
                                    disabled={isGeneratingAI}
                                    className="w-full"
                                    icon={isGeneratingAI ? Loader2 : Sparkles}
                                >
                                    {isGeneratingAI ? 'Generating...' : 'Generate Now'}
                                </Button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    )
}
