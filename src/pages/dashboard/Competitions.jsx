import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import ReactJoyride, { EVENTS, STATUS } from 'react-joyride'
import { Search, Trophy, Calendar, Users, Grid, List as ListIcon, PlayCircle, ShieldCheck, Sparkles, Clock, TrendingUp, Filter, Crown, Shield, Mail } from 'lucide-react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import AdSlot from '../../components/ui/AdSlot'

import UserBadge from '../../components/ui/UserBadge'
import AdaptiveLogo from '../../components/ui/AdaptiveLogo'
import WhatsAppModal from '../../components/modals/WhatsAppModal'

import { authFetch } from '../../utils/api'
import { useAuth } from '../../contexts/AuthContext'

export default function Competitions() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [competitions, setCompetitions] = useState([])
    const [highlighted, setHighlighted] = useState(null)
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [viewMode, setViewMode] = useState('grid')
    const [searchParams] = useSearchParams()
    const [filterType, setFilterType] = useState(searchParams.get('tab') === 'participating' ? 'participating' : 'all')

    const [showWhatsAppModal, setShowWhatsAppModal] = useState(false)

    // Tour State
    const [runTour, setRunTour] = useState(false);
    const [tourSteps, setTourSteps] = useState([
        {
            target: '#tour-comp-header',
            content: 'Halaman ini menampilkan semua kompetisi publik yang bisa kamu ikuti.',
            title: 'Kompetisi Publik',
            disableBeacon: true,
        },
        {
            target: '#tour-comp-featured',
            content: 'Kompetisi Highlight adalah turnamen pilihan atau yang paling banyak diminati saat ini.',
            title: 'Kompetisi Highlight',
        },
        {
            target: '#tour-comp-featured-btn',
            content: 'Klik tombol ini untuk mendaftar atau melihat detail kompetisi highlight tersebut.',
            title: 'Daftar Sekarang',
        },
        {
            target: '#tour-comp-filters',
            content: 'Gunakan filter ini untuk melihat semua kompetisi publik atau kompetisi yang sudah kamu ikuti.',
            title: 'Filter Kompetisi',
        }
    ]);

    useEffect(() => {
        const tourSeen = localStorage.getItem('competitions_tour_seen');
        if (!tourSeen && !loading) { // Wait for loading to finish so elements exist
            setRunTour(true);
        }
    }, [loading]);

    const handleJoyrideCallback = (data) => {
        const { status } = data;
        const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];
        if (finishedStatuses.includes(status)) {
            setRunTour(false);
            localStorage.setItem('competitions_tour_seen', 'true');
        }
    };

    useEffect(() => {
        if (user && !user.phone) {
            setShowWhatsAppModal(true)
        }
    }, [user])

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const res = await authFetch('/api/tournaments/public')
                const data = await res.json()
                if (data.success) {
                    setCompetitions(data.data.competitions)
                    setHighlighted(data.data.highlighted)

                    // Auto-switch to 'participating' if no public tournaments (register/draft) are found
                    const hasPublic = data.data.competitions.some(c => (c.status === 'register' || c.status === 'draft') && c.isPublic)
                    if (!hasPublic) {
                        setFilterType('participating')
                    }
                }
            } catch (error) {
                console.error('Error fetching competitions:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])



    const featuredCompetition = highlighted

    const filteredCompetitions = competitions.filter(c => {
        // ... (existing filter logic) ...
        const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase())

        // Filter logic based on filterType
        let matchesFilter = false;
        if (filterType === 'all') {
            // Show competitions that are 'register' or 'draft' (Open/Not Started)
            // AND implicitly public (as per original logic)
            matchesFilter = (c.status === 'register' || c.status === 'draft') && c.isPublic
        } else if (filterType === 'participating') {
            // Show competitions where userStatus exists (registered, pending, playing, finished, etc.)
            matchesFilter = !!c.userStatus
        }

        // Exclude featured competition from list if it is already displayed as highlighted (no search query)
        if (!searchQuery && featuredCompetition && c.id === featuredCompetition.id) {
            return false
        }

        return matchesSearch && matchesFilter
    })

    const getStatusColor = (status) => {
        // ... (existing getStatusColor logic) ...
        switch (status) {
            case 'register': return 'bg-neonGreen/20 text-neonGreen'
            case 'draft': return 'bg-yellow-500/20 text-yellow-400'
            case 'ongoing': return 'bg-blue-500/20 text-blue-400'
            case 'finished': return 'bg-gray-500/20 text-gray-400'
            default: return 'bg-gray-500/20 text-gray-400'
        }
    }

    const getStatusLabel = (status) => {
        // ... (existing getStatusLabel logic) ...
        switch (status) {
            case 'register': return 'Registrasi Buka'
            case 'draft': return 'Coming Soon'
            case 'ongoing': return 'Sedang Berlangsung'
            case 'finished': return 'Selesai'
            default: return status
        }
    }

    const getUserStatusLabel = (comp) => {
        if (!comp.userStatus) return null

        const status = comp.userStatus
        const isApproved = status === 'approved'
        const isPending = status === 'pending'
        const isOngoingOrFinished = comp.status === 'ongoing' || comp.status === 'finished'

        if (isPending) return { label: 'Menunggu Konfirmasi', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' }

        if (isApproved) {
            // If tournament is not actually playing yet (draft/register)
            if (!isOngoingOrFinished) {
                return { label: 'Disetujui', color: 'bg-neonGreen/20 text-neonGreen border-neonGreen/30' }
            }

            // If tournament is ongoing or finished, show progress
            if (comp.userProgress) {
                if (comp.type === 'league' && comp.userProgress.rank) {
                    return { label: `Rank ${comp.userProgress.rank}`, color: 'bg-blue-500/20 text-blue-400 border-blue-500/30 font-bold' }
                }
                if (comp.userProgress.roundName) {
                    return { label: comp.userProgress.roundName, color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30 font-bold' }
                }
            }

            return { label: 'Terdaftar', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' }
        }

        switch (status) {
            case 'registered': return { label: 'Terdaftar', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' }
            case 'playing': return { label: 'Sedang Main', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' }
            case 'finished': return { label: 'Selesai', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' }
            case 'rejected': return { label: 'Ditolak', color: 'bg-red-500/20 text-red-400 border-red-500/30' }
            default: return { label: status, color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' }
        }
    }

    const calculateProgress = (current, max) => {
        return Math.min(100, (current / max) * 100)
    }

    const renderVerifiedLabel = (tier) => {
        if (!tier || tier === 'free') return null

        const isPro = tier === 'pro_liga'
        const labelText = isPro ? 'Verified Pro' : 'Verified Community'
        const colorClass = isPro ? 'text-yellow-400' : 'text-blue-400'

        return (
            <span className={`text-[10px] ${colorClass} flex items-center gap-1`}>
                <ShieldCheck className="w-3 h-3" /> {labelText}
            </span>
        )
    }

    const renderRecommendedBadge = (tier) => {
        if (!tier || tier === 'free') return null

        const isPro = tier === 'pro_liga' || tier === 'pro_league'
        const Icon = isPro ? Crown : Shield
        // Rules: Pro Liga = Gold Crown. Captain/Others = Blue Shield.
        const colorClass = isPro ? 'text-yellow-400' : 'text-blue-400'
        const bgClass = isPro ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20' : 'bg-blue-500/10'
        const borderClass = isPro ? 'border-yellow-500/50' : 'border-blue-500/30'
        const animateClass = isPro ? 'animate-shimmer overflow-hidden relative' : ''

        return (
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${bgClass} ${borderClass} ${colorClass} ${animateClass}`}>
                <Icon className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">
                    Recommended
                </span>
                {isPro && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                )}
            </div>
        )
    }

    const formatDate = (dateString) => {
        if (!dateString || dateString === '-') return '-'
        const options = { day: '2-digit', month: 'short', year: 'numeric' }
        return new Date(dateString).toLocaleDateString('id-ID', options)
    }

    return (
        <div className="space-y-6">
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
            {/* ... Header ... */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4" id="tour-comp-header">
                <div>
                    <h1 className="text-2xl md:text-3xl font-display font-bold">Kompetisi Publik</h1>
                    <p className="text-gray-400 mt-1">Temukan dan ikuti turnamen yang terbuka untuk umum</p>
                </div>
            </div>

            {/* Featured Competition */}
            {featuredCompetition && !searchQuery && (
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-900/50 to-purple-900/50 border border-white/10 p-6 sm:p-8" id="tour-comp-featured">
                    {/* ... (existing featured content) ... */}
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Trophy className="w-64 h-64 rotate-12" />
                    </div>

                    <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-center">
                        {featuredCompetition.logo && (
                            <AdaptiveLogo
                                src={featuredCompetition.logo}
                                alt={featuredCompetition.name}
                                className="w-24 h-24 rounded-2xl object-cover shadow-2xl"
                                fallbackSize="w-10 h-10"
                            />
                        )}
                        <div className="flex-1 space-y-4">
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                                    <Sparkles className="w-3 h-3" /> FEATURED
                                </span>
                                {renderRecommendedBadge(featuredCompetition.creator?.tier)}

                            </div>

                            <div>
                                <h2 className="text-3xl font-display font-bold text-white mb-2">{featuredCompetition.name}</h2>
                                <p className="text-gray-300 max-w-xl">{featuredCompetition.description}</p>
                            </div>

                            <div className="flex flex-wrap gap-4 text-sm text-gray-300">
                                {/* ... (existing badges) ... */}
                                <div className="flex items-center gap-2 bg-black/20 px-3 py-2 rounded-lg">
                                    <Clock className="w-4 h-4 text-neonGreen" />
                                    <span>Deadline: {formatDate(featuredCompetition.registrationDeadline)}</span>
                                </div>
                                <div className="flex items-center gap-2 bg-black/20 px-3 py-2 rounded-lg">
                                    <Users className="w-4 h-4 text-blue-400" />
                                    <span>{featuredCompetition.players - featuredCompetition.currentPlayers} Slot Tersisa</span>
                                </div>
                                <div className="flex items-center gap-2 bg-black/20 px-3 py-2 rounded-lg">
                                    <Trophy className="w-4 h-4 text-purple-400" />
                                    <span className="uppercase">{featuredCompetition.type.replace('_', ' ')}</span>
                                </div>
                                {featuredCompetition.payment != null && (
                                    <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 px-3 py-2 rounded-lg">
                                        <img src="/coin.png" alt="Coin" className="w-4 h-4" />
                                        <span className="text-yellow-400 font-medium">{featuredCompetition.payment} Coin</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ... Right Side Card ... */}
                        <div className="w-full md:w-auto bg-black/20 backdrop-blur-sm p-6 rounded-xl border border-white/10 min-w-[300px]">
                            <div className="space-y-4">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-400">Kuota Pemain</span>
                                    <span className="text-white font-medium">{featuredCompetition.currentPlayers}/{featuredCompetition.players}</span>
                                </div>
                                <div className="w-full bg-white/10 rounded-full h-2">
                                    <div
                                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-1000"
                                        style={{ width: `${calculateProgress(featuredCompetition.currentPlayers, featuredCompetition.players)}%` }}
                                    ></div>
                                </div>
                                <Button
                                    className="w-full"
                                    size="lg"
                                    icon={PlayCircle}
                                    id="tour-comp-featured-btn"
                                    onClick={() => navigate(`/dashboard/competitions/${featuredCompetition.slug}/join`)}
                                >
                                    {featuredCompetition.userStatus ? 'Lihat Detail' : 'Daftar Sekarang'}
                                </Button>
                                <div className="flex items-center justify-center gap-2 pt-2 border-t border-white/5">
                                    <span className="text-xs text-gray-500">By</span>
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-xs font-medium text-gray-300">{featuredCompetition.creator?.name}</span>
                                        <UserBadge tier={featuredCompetition.creator?.tier} size="sm" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ... Filters ... */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="w-5 h-5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2 z-10" />
                    <Input
                        placeholder="Cari kompetisi..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="flex gap-2">
                    {/* ... Filter Buttons ... */}
                    <div className="flex border border-white/10 rounded-lg overflow-hidden bg-black/20 p-1 gap-1" id="tour-comp-filters">
                        <button
                            onClick={() => setFilterType('all')}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${filterType === 'all'
                                ? 'bg-white/10 text-white shadow-sm'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            Publik
                        </button>
                        <button
                            onClick={() => setFilterType('participating')}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${filterType === 'participating'
                                ? 'bg-white/10 text-white shadow-sm'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            Diikuti
                        </button>
                    </div>

                    <div className="flex border border-white/10 rounded-lg overflow-hidden">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-3 ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}
                        >
                            <Grid className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-3 ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}
                        >
                            <ListIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Competitions Grid/List */}
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCompetitions.map((comp, index) => (
                        <React.Fragment key={comp.id}>
                            <Card className="p-6 hover:border-neonGreen/30 transition-all group flex flex-col h-full">
                                <div className="flex items-start justify-between mb-4">
                                    <AdaptiveLogo
                                        src={comp.logo}
                                        alt={comp.name}
                                        className="w-12 h-12 flex-shrink-0 group-hover:scale-105 transition duration-300"
                                        fallbackSize="w-6 h-6"
                                    />
                                    <div className="flex flex-col items-end gap-1">
                                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(comp.status)}`}>
                                            {getStatusLabel(comp.status)}
                                        </span>
                                        {/* Verified Label Logic */}
                                        {renderVerifiedLabel(comp.creator?.tier)}
                                        {comp.userStatus && (() => {
                                            const statusInfo = getUserStatusLabel(comp)
                                            if (!statusInfo) return null
                                            return (
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${statusInfo.color}`}>
                                                    {statusInfo.label}
                                                </span>
                                            )
                                        })()}
                                    </div>
                                </div>
                                <h3 className="font-display font-bold text-lg mb-2 group-hover:text-blue-400 transition">{comp.name}</h3>
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                    <span className="text-xs text-gray-500">by {comp.creator?.name}</span>
                                    <UserBadge tier={comp.creator?.tier} size="sm" className="scale-75 origin-left" />
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-gray-400 border border-white/10 uppercase">
                                        {comp.type.replace('_', ' ')}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-grow">{comp.description}</p>

                                <div className="space-y-3 mb-6">
                                    {(() => {
                                        const isJoinedAndActive = comp.userStatus && (comp.status === 'ongoing' || comp.status === 'finished' || comp.matches > 0);

                                        let current, max, label, percentage;

                                        if (isJoinedAndActive && comp.matches > 0) {
                                            current = comp.completedMatches || 0;
                                            max = comp.matches || 0;
                                            percentage = max > 0 ? Math.min(100, Math.round((current / max) * 100)) : 0;
                                            label = (
                                                <span className="flex items-center gap-1">
                                                    <Trophy className="w-4 h-4" /> {current}/{max} Match Selesai
                                                </span>
                                            );
                                        } else {
                                            // Default: Participant Progress
                                            current = comp.participants
                                                ? comp.participants.filter(p => p.status === 'approved').length
                                                : (comp.currentPlayers || 0);
                                            max = parseInt(comp.players || 0, 10);
                                            percentage = max > 0 ? Math.min(100, Math.round((current / max) * 100)) : 0;
                                            label = (
                                                <span className="flex items-center gap-1">
                                                    <Users className="w-4 h-4" /> {current}/{max} Peserta
                                                </span>
                                            );
                                        }

                                        return (
                                            <>
                                                <div className="flex items-center justify-between text-xs text-gray-400">
                                                    {label}
                                                    <span>{percentage}%</span>
                                                </div>
                                                <div className="w-full bg-white/5 rounded-full h-1.5">
                                                    <div
                                                        className={`h-1.5 rounded-full transition-all duration-1000 ${percentage >= 100 ? 'bg-neonGreen' : 'bg-gradient-to-r from-blue-500 to-purple-500'}`}
                                                        style={{ width: `${percentage}%` }}
                                                    ></div>
                                                </div>
                                            </>
                                        )
                                    })()}
                                    <div className="flex items-center gap-4 text-xs text-gray-400">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" /> Jadwal Selesai: {formatDate(comp.endDate)}
                                        </span>
                                    </div>
                                </div>

                                <Button className={`w-full mt-auto ${comp.userStatus === 'invited' ? 'bg-orange-500 hover:bg-orange-600' : ''}`} icon={comp.userStatus === 'invited' ? Mail : PlayCircle} onClick={() => {
                                    if (comp.status !== 'draft' && comp.userStatus && comp.userStatus !== 'invited') {
                                        navigate(`/dashboard/competitions/${comp.slug}/view`)
                                    } else {
                                        navigate(`/dashboard/competitions/${comp.slug}/join`)
                                    }
                                }}>
                                    {comp.userStatus && comp.userStatus !== 'invited' ? 'Lihat Detail' : (comp.userStatus === 'invited' ? 'Buka Undangan' : 'Ikuti Kompetisi')}
                                </Button>
                            </Card>
                            {/* Insert AdSlot after every 3 items */}
                            {(index + 1) % 3 === 0 && (
                                <div className="col-span-full py-4">
                                    <AdSlot variant="banner" adId={`comp-grid-ad-${index}`} />
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            ) : (
                <Card hover={false} className="overflow-hidden">
                    <div className="divide-y divide-white/5">
                        {filteredCompetitions.map((comp) => (
                            <div
                                key={comp.id}
                                className="flex items-center justify-between p-4 hover:bg-white/5 transition"
                            >
                                <div className="flex items-center gap-4">
                                    <AdaptiveLogo
                                        src={comp.logo}
                                        alt={comp.name}
                                        className="w-10 h-10 flex-shrink-0"
                                        fallbackSize="w-5 h-5"
                                    />
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <div className="font-medium">{comp.name}</div>
                                            <UserBadge tier={comp.creator?.tier} size="sm" />
                                        </div>
                                        <div className="text-xs text-gray-500">{comp.type} • {comp.description}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right hidden sm:block">
                                        <div className="text-xs text-gray-400">{comp.currentPlayers}/{comp.players} Slot</div>
                                        <div className="text-[10px] text-gray-500">Deadline: {formatDate(comp.registrationDeadline)}</div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(comp.status)}`}>
                                            {getStatusLabel(comp.status)}
                                        </span>
                                        {/* Verified Label Logic for List View */}
                                        {renderVerifiedLabel(comp.creator?.tier)}
                                        {comp.userStatus && (() => {
                                            const statusInfo = getUserStatusLabel(comp)
                                            if (!statusInfo) return null
                                            return (
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${statusInfo.color}`}>
                                                    {statusInfo.label}
                                                </span>
                                            )
                                        })()}
                                    </div>
                                    <Button size="sm" icon={comp.userStatus === 'invited' ? Mail : PlayCircle} onClick={() => {
                                        if (comp.status !== 'draft' && comp.userStatus && comp.userStatus !== 'invited') {
                                            navigate(`/dashboard/competitions/${comp.slug}/view`)
                                        } else {
                                            navigate(`/dashboard/competitions/${comp.slug}/join`)
                                        }
                                    }} className={comp.userStatus === 'invited' ? 'bg-orange-500 hover:bg-orange-600' : ''}>
                                        {comp.userStatus && comp.userStatus !== 'invited' ? 'Detail' : (comp.userStatus === 'invited' ? 'Buka Undangan' : 'Ikuti')}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )
            }

            {
                filteredCompetitions.length === 0 && !loading && (
                    <div className="text-center py-12">
                        <Trophy className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                        <h3 className="font-display font-bold text-xl mb-2">Belum ada kompetisi publik</h3>
                        <p className="text-gray-500 mb-6">Cek lagi nanti untuk turnamen terbaru!</p>
                    </div>
                )
            }
            <WhatsAppModal
                isOpen={showWhatsAppModal}
                onClose={() => setShowWhatsAppModal(false)}
                onCancel={() => navigate('/dashboard')}
            />
        </div >
    )
}
