import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Trophy, Calendar, Users, TrendingUp, ArrowRight, BarChart2, Search } from 'lucide-react'
import Card, { CardContent, CardHeader } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import AdSlot from '../../components/ui/AdSlot'
import AdaptiveLogo from '../../components/ui/AdaptiveLogo'
import { useToast } from '../../contexts/ToastContext'
import { authFetch } from '../../utils/api'

// Formatters
const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const isToday = date.toDateString() === today.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();

    const timeStr = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    if (isToday) return `Hari ini, ${timeStr}`;
    if (isTomorrow) return `Besok, ${timeStr}`;

    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
};

export default function Dashboard() {
    const { error } = useToast();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalTournaments: 0,
        activeTournaments: 0,
        totalMatches: 0,
        totalParticipants: 0
    });
    const [recentTournaments, setRecentTournaments] = useState([]);
    const [joinedTournaments, setJoinedTournaments] = useState([]);
    const [upcomingMatches, setUpcomingMatches] = useState([]);
    const [quickActions, setQuickActions] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await authFetch('/api/dashboard/stats');
                const data = await response.json();

                if (data.success) {
                    setStats(data.data.stats);
                    setRecentTournaments(data.data.recentTournaments);
                    setJoinedTournaments(data.data.joinedTournaments || []);
                    setUpcomingMatches(data.data.upcomingMatches);
                    setQuickActions(data.data.quickActions);
                } else {
                    throw new Error(data.message);
                }
            } catch (err) {
                console.error('Failed to fetch dashboard stats:', err);
                error('Gagal memuat data dashboard');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const statCards = [
        { label: 'Total Turnamen', value: stats.totalTournaments, icon: Trophy, color: 'text-neonGreen' },
        { label: 'Pertandingan', value: stats.totalMatches, icon: BarChart2, color: 'text-neonPink' },
        { label: 'Pemain Terdaftar', value: stats.totalParticipants, icon: Users, color: 'text-blue-400' },
        { label: 'Turnamen Aktif', value: stats.activeTournaments, icon: TrendingUp, color: 'text-yellow-400' },
    ];

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neonGreen"></div>
            </div>
        );
    }

    const getQuickActionLink = (type) => {
        if (!quickActions) return '/dashboard/tournaments/new';
        const { latestDraft, latestActive, latestAny } = quickActions;

        let targetSlug = null;

        if (type === 'players') {
            if (latestDraft) targetSlug = latestDraft.slug || latestDraft.id;
            else if (latestActive) targetSlug = latestActive.slug || latestActive.id;
            else if (latestAny) targetSlug = latestAny.slug || latestAny.id;
        } else if (type === 'schedule' || type === 'stats') {
            if (latestActive) targetSlug = latestActive.slug || latestActive.id;
            else if (latestAny) targetSlug = latestAny.slug || latestAny.id;
        }

        if (!targetSlug) return '/dashboard/tournaments/new';

        switch (type) {
            case 'players': return `/dashboard/tournaments/${targetSlug}?tab=players`;
            case 'schedule': return `/dashboard/tournaments/${targetSlug}?tab=fixtures`;
            case 'stats': return `/dashboard/tournaments/${targetSlug}?tab=statistics`;
            default: return '/dashboard/tournaments';
        }
    };

    return (
        <div className="space-y-6 sm:space-y-8 w-full max-w-full overflow-hidden">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-1">
                <div>
                    <h1 className="text-2xl md:text-3xl font-display font-bold">Dashboard</h1>
                    <p className="text-gray-400 mt-1">Selamat datang kembali di BikinLiga!</p>
                </div>
                <Link to="/dashboard/tournaments/new">
                    <Button icon={Plus} className="w-full sm:w-auto">Buat Turnamen Baru</Button>
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {statCards.map((stat) => (
                    <Card key={stat.label} className="p-4 sm:p-6">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-white/5 flex items-center justify-center ${stat.color}`}>
                                <stat.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div className="min-w-0">
                                <div className="text-xl sm:text-2xl font-display font-bold truncate">{stat.value}</div>
                                <div className="text-xs sm:text-sm text-gray-400 truncate">{stat.label}</div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Ad Slot - Banner */}
            <div className="w-full overflow-hidden rounded-lg">
                <AdSlot variant="banner" adId="dashboard-main" />
            </div>




            <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
                {/* Recent Tournaments */}
                <Card hover={false} className="w-full">
                    <CardHeader className="flex items-center justify-between p-4 sm:p-6">
                        <h2 className="text-lg font-display font-bold">Turnamen Terbaru</h2>
                        <Link to="/dashboard/tournaments" className="text-sm text-neonGreen hover:text-neonGreen/80 flex items-center gap-1">
                            Lihat Semua <ArrowRight className="w-4 h-4" />
                        </Link>
                    </CardHeader>
                    <CardContent className="p-0">
                        {recentTournaments.length > 0 ? (
                            <div className="divide-y divide-white/5">
                                {recentTournaments.map((tournament) => (
                                    <Link
                                        key={tournament.id}
                                        to={`/dashboard/tournaments/${tournament.slug || tournament.id}`}
                                        className="flex items-center justify-between p-3 sm:p-4 hover:bg-white/5 transition"
                                    >
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <AdaptiveLogo
                                                src={tournament.logo_url}
                                                alt={tournament.name}
                                                className="w-10 h-10 flex-shrink-0"
                                                fallbackSize="w-5 h-5"
                                            />
                                            <div className="min-w-0 flex-1">
                                                <div className="font-medium truncate text-sm sm:text-base">{tournament.name}</div>
                                                <div className="text-xs text-gray-500 capitalize truncate">{tournament.type} • {tournament.players || 0} Pemain</div>
                                            </div>
                                        </div>
                                        <div className="text-right flex-shrink-0 pl-2">
                                            <span className={`text-[10px] sm:text-xs px-2 py-1 rounded-full whitespace-nowrap block w-fit ml-auto ${tournament.status === 'active' ? 'bg-neonGreen/20 text-neonGreen' :
                                                tournament.status === 'open' ? 'bg-blue-500/20 text-blue-400' :
                                                    tournament.status === 'completed' ? 'bg-gray-500/20 text-gray-400' :
                                                        'bg-yellow-500/20 text-yellow-400' // draft
                                                }`}>
                                                {tournament.status === 'active' ? 'Aktif' :
                                                    tournament.status === 'open' ? 'Terbuka' :
                                                        tournament.status === 'completed' ? 'Selesai' : 'Draft'}
                                            </span>
                                            <div className="text-[10px] sm:text-xs text-gray-500 mt-1">{tournament.matches || 0} pertandingan</div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center text-gray-500">
                                Belum ada turnamen yang dibuat
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Upcoming Matches */}
                <Card hover={false} className="w-full">
                    <CardHeader className="flex items-center justify-between p-4 sm:p-6">
                        <h2 className="text-lg font-display font-bold">Pertandingan</h2>
                        <Link to={getQuickActionLink('schedule')} className="text-sm text-neonGreen hover:text-neonGreen/80 flex items-center gap-1">
                            Lihat Semua <ArrowRight className="w-4 h-4" />
                        </Link>
                    </CardHeader>
                    <CardContent className="p-0">
                        {upcomingMatches.length > 0 ? (
                            <div className="divide-y divide-white/5">
                                {upcomingMatches.map((match) => (
                                    <div
                                        key={match.id}
                                        className="relative block p-3 sm:p-4 hover:bg-white/5 transition group w-full"
                                    >
                                        {/* Main Match Link Background */}
                                        <Link
                                            to={`/dashboard/tournaments/${match.tournament_slug || match.tournament_id}/match/${match.id}`}
                                            className="absolute inset-0 z-0"
                                            aria-label="View Match Details"
                                        />

                                        {/* Header Row */}
                                        <div className="relative z-10 flex items-center justify-between mb-2 sm:mb-3 pointer-events-none w-full">
                                            {/* Tournament Link - Clickable */}
                                            <Link
                                                to={`/dashboard/tournaments/${match.tournament_slug || match.tournament_id}`}
                                                className="pointer-events-auto text-xs text-gray-500 flex items-center gap-1 group-hover:text-neonGreen hover:scale-110 transition-all origin-left duration-200 truncate max-w-[65%]"
                                            >
                                                {match.tournament} <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition flex-shrink-0" />
                                            </Link>

                                            {/* Status Badge */}
                                            <span className={`text-[10px] sm:text-xs whitespace-nowrap ml-2 flex-shrink-0 ${match.type === 'upcoming' ? 'text-neonPink' : 'text-gray-400'}`}>
                                                {match.type === 'upcoming' ? formatDate(match.time) : match.status === 'completed' ? 'Selesai' : 'Full Time'}
                                            </span>
                                        </div>

                                        {/* Content Row - Pass through clicks to background */}
                                        <div className="relative z-10 grid grid-cols-[1fr_auto_1fr] gap-2 items-center pointer-events-none w-full">
                                            {/* Home Team */}
                                            <div className="flex items-center gap-2 min-w-0">
                                                <div className={`w-8 h-8 rounded-lg flex-shrink-0 ${match.winner === 'home' ? 'bg-yellow-500/10 ring-1 ring-yellow-500' : 'bg-gray-800'} flex items-center justify-center overflow-hidden`}>
                                                    {match.home_logo ? (
                                                        <img src={match.home_logo} alt={match.home_team} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="text-xs font-bold text-white capitalize">{match.home_team?.charAt(0) || match.home_player?.charAt(0) || '?'}</div>
                                                    )}
                                                </div>
                                                <div className="min-w-0 overflow-hidden">
                                                    <div className={`font-bold text-xs sm:text-sm truncate ${match.winner === 'home' ? 'text-yellow-500' : 'text-gray-200'}`}>
                                                        {match.home_team || 'Tim Home'}
                                                    </div>
                                                    <div className="text-[10px] sm:text-xs text-gray-500 truncate">{match.home_player || 'Player 1'}</div>
                                                </div>
                                            </div>

                                            {/* Center Info */}
                                            <div className="flex flex-col items-center justify-center min-w-[60px] sm:min-w-[80px]">
                                                {match.type === 'result' ? (
                                                    <div className="flex flex-col items-center gap-1">
                                                        <div className="bg-white/5 px-2 py-1 rounded-lg border border-white/10 font-mono font-bold text-sm sm:text-base tracking-wider flex items-center justify-center gap-1">
                                                            {match.home_penalty_score !== null && (
                                                                <span className="text-[10px] text-gray-400 font-normal">({match.home_penalty_score})</span>
                                                            )}
                                                            <span>{match.home_score ?? 0}</span>
                                                            <span className="text-gray-600">-</span>
                                                            <span>{match.away_score ?? 0}</span>
                                                            {match.away_penalty_score !== null && (
                                                                <span className="text-[10px] text-gray-400 font-normal">({match.away_penalty_score})</span>
                                                            )}
                                                        </div>
                                                        {match.leg === 2 && match.prev_leg_home_score !== null && (
                                                            <div className="text-[10px] text-gray-400 bg-white/5 px-1.5 py-0.5 rounded border border-white/5 whitespace-nowrap text-center">
                                                                Agg: {(match.home_score || 0) + match.prev_leg_home_score}-{(match.away_score || 0) + match.prev_leg_away_score}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="text-gray-600 font-display font-black text-xs sm:text-sm">VS</div>
                                                )}
                                            </div>

                                            {/* Away Team */}
                                            <div className="flex items-center gap-2 justify-end min-w-0 text-right">
                                                <div className="min-w-0 overflow-hidden">
                                                    <div className={`font-bold text-xs sm:text-sm truncate ${match.winner === 'away' ? 'text-yellow-500' : 'text-gray-200'}`}>
                                                        {match.away_team || 'Tim Away'}
                                                    </div>
                                                    <div className="text-[10px] sm:text-xs text-gray-500 truncate">{match.away_player || 'Player 2'}</div>
                                                </div>
                                                <div className={`w-8 h-8 rounded-lg flex-shrink-0 ${match.winner === 'away' ? 'bg-yellow-500/10 ring-1 ring-yellow-500' : 'bg-gray-800'} flex items-center justify-center overflow-hidden`}>
                                                    {match.away_logo ? (
                                                        <img src={match.away_logo} alt={match.away_team} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="text-xs font-bold text-white capitalize">{match.away_team?.charAt(0) || match.away_player?.charAt(0) || '?'}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center text-gray-500">
                                Tidak ada pertandingan mendatang
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>


            {/* Joined Tournaments / CTA Section */}
            {joinedTournaments.length > 0 ? (
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <h2 className="text-lg font-display font-bold">Kompetisi Diikuti</h2>
                        <Link to="/dashboard/competitions?tab=participating" className="text-sm text-neonGreen hover:text-neonGreen/80 flex items-center gap-1">
                            Lihat Semua <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {joinedTournaments.map((tournament) => (
                            <Link
                                key={tournament.id}
                                to={`/dashboard/competitions/${tournament.slug || tournament.id}/view`}
                                className="block group"
                            >
                                <Card className="h-full hover:border-neonGreen/30 transition-all p-4 relative overflow-hidden">
                                    <div className="flex items-start justify-between mb-4">
                                        <AdaptiveLogo
                                            src={tournament.logo_url}
                                            alt={tournament.name}
                                            className="w-12 h-12"
                                            fallbackSize="w-6 h-6"
                                        />
                                        <span className={`text-[10px] px-2 py-1 rounded-full whitespace-nowrap ${tournament.user_status === 'approved' ? 'bg-neonGreen/20 text-neonGreen' :
                                            tournament.user_status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                                'bg-red-500/20 text-red-400'
                                            }`}>
                                            {tournament.user_status === 'approved' ? 'Disetujui' :
                                                tournament.user_status === 'pending' ? 'Menunggu' :
                                                    tournament.user_status}
                                        </span>
                                    </div>

                                    <h3 className="font-display font-bold text-base mb-1 truncate group-hover:text-blue-400 transition">{tournament.name}</h3>
                                    <p className="text-xs text-gray-500 capitalize mb-4">{tournament.type.replace('_', ' ')}</p>

                                    {tournament.total_matches > 0 ? (
                                        <div>
                                            <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                                                <span>Progress</span>
                                                <span>{Math.round((tournament.played_matches / tournament.total_matches) * 100)}%</span>
                                            </div>
                                            <div className="w-full bg-white/5 rounded-full h-1">
                                                <div
                                                    className="bg-neonGreen h-1 rounded-full transition-all duration-500"
                                                    style={{ width: `${(tournament.played_matches / tournament.total_matches) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="pt-2 border-t border-white/5 mt-auto">
                                            <div className="text-xs text-gray-500">Belum ada pertandingan</div>
                                        </div>
                                    )}
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="w-full relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-white/10 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                        <Trophy className="w-48 h-48 rotate-12" />
                    </div>
                    <div className="relative z-10 max-w-xl">
                        <h2 className="text-xl sm:text-2xl font-display font-bold mb-2">Belum Mengikuti Turnamen?</h2>
                        <p className="text-gray-400 text-sm sm:text-base">
                            Temukan berbagai kompetisi seru, daftarkan timmu, dan tunjukkan kemampuan terbaikmu di lapangan!
                        </p>
                    </div>
                    <div className="relative z-10 flex-shrink-0 w-full sm:w-auto">
                        <Link to="/dashboard/competitions">
                            <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-none">
                                <Search className="w-5 h-5 mr-2" />
                                Cari Kompetisi
                            </Button>
                        </Link>
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            <Card className="p-6">
                <h2 className="text-lg font-display font-bold mb-4">Aksi Cepat</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Link to="/dashboard/tournaments/new" className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition text-center">
                        <Plus className="w-8 h-8 mx-auto mb-2 text-neonGreen" />
                        <div className="text-sm font-medium">Buat Turnamen</div>
                    </Link>
                    <Link to={getQuickActionLink('players')} className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition text-center">
                        <Users className="w-8 h-8 mx-auto mb-2 text-neonPink" />
                        <div className="text-sm font-medium">Kelola Pemain</div>
                    </Link>
                    <Link to={getQuickActionLink('schedule')} className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition text-center">
                        <Calendar className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                        <div className="text-sm font-medium">Atur Jadwal</div>
                    </Link>
                    <Link to={getQuickActionLink('stats')} className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition text-center">
                        <BarChart2 className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
                        <div className="text-sm font-medium">Lihat Statistik</div>
                    </Link>
                </div>
            </Card>
        </div>
    )
}
