import React from 'react'
import { Trophy, Medal, TrendingUp, Download } from 'lucide-react'
import Card, { CardContent, CardHeader } from '../ui/Card'
import Button from '../ui/Button'
import AdSlot from '../ui/AdSlot'

// Sample data for top scorers
const topScorersData = [
    { id: 1, name: 'Lionel Messi', team: 'Barcelona FC', goals: 12, assists: 5, matches: 8 },
    { id: 2, name: 'Erling Haaland', team: 'Manchester City', goals: 10, assists: 1, matches: 7 },
    { id: 3, name: 'Kylian Mbappe', team: 'PSG', goals: 8, assists: 2, matches: 8 },
    { id: 4, name: 'Mohamed Salah', team: 'Liverpool', goals: 7, assists: 3, matches: 8 },
    { id: 5, name: 'Harry Kane', team: 'Bayern Munich', goals: 6, assists: 4, matches: 8 },
    { id: 6, name: 'Robert Lewandowski', team: 'Barcelona FC', goals: 6, assists: 1, matches: 8 },
    { id: 7, name: 'Jude Bellingham', team: 'Real Madrid', goals: 5, assists: 6, matches: 8 },
    { id: 8, name: 'Vinicius Jr', team: 'Real Madrid', goals: 5, assists: 4, matches: 7 },
    { id: 9, name: 'Bukayo Saka', team: 'Arsenal', goals: 4, assists: 5, matches: 8 },
    { id: 10, name: 'Phil Foden', team: 'Manchester City', goals: 4, assists: 3, matches: 7 },
]

const TopScorerList = React.forwardRef(({ compact = false, scorers = [], highlightParticipantId, onExport }, ref) => {
    const data = compact ? scorers.slice(0, 5) : scorers
    const topScorer = data[0]

    const [faceUrl, setFaceUrl] = React.useState('https://www.efootballdb.com/img/players/player_noface.png');

    React.useEffect(() => {
        let isMounted = true;
        setFaceUrl('https://www.efootballdb.com/img/players/player_noface.png');

        const fetchFace = async () => {
            if (!topScorer?.name) return;
            try {
                const res = await fetch(`/api/external/player-face?q=${encodeURIComponent(topScorer.name)}`);
                if (!res.ok) throw new Error('Network error');
                const json = await res.json();
                if (isMounted) {
                    if (json.status === true && json.data && json.data.length > 0) {
                        setFaceUrl(json.data[0].link);
                    } else {
                        setFaceUrl('https://www.efootballdb.com/img/players/player_noface.png');
                    }
                }
            } catch (error) {
                console.error('Error fetching face:', error);
                if (isMounted) {
                    setFaceUrl('https://www.efootballdb.com/img/players/player_noface.png');
                }
            }
        };

        fetchFace();

        return () => { isMounted = false; };
    }, [topScorer?.name]);

    return (
        <div className="space-y-6" ref={ref}>
            {!compact && topScorer && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Top 1 Highlight Card */}
                    <div className="md:col-span-3">
                        <Card className="bg-gradient-to-r from-neonGreen/10 to-transparent border-neonGreen/50 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <Trophy className="w-48 h-48 text-neonGreen" />
                            </div>
                            <CardContent className="flex items-center gap-6 relative z-10 p-6">
                                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full ring-4 ring-neonGreen/50 bg-black flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.3)] overflow-hidden">
                                    <img
                                        src={faceUrl}
                                        alt={topScorer.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => { e.target.src = 'https://www.efootballdb.com/img/players/player_noface.png' }}
                                    />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="px-3 py-1 rounded-full bg-neonGreen text-black font-bold text-xs uppercase tracking-wider">
                                            Top Scorer
                                        </span>
                                        <span className="text-gray-400 text-sm">{topScorer.team_name || topScorer.team}</span>
                                    </div>
                                    <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
                                        {topScorer.name}
                                    </h2>
                                    <div className="flex items-center gap-6">
                                        <div>
                                            <div className="text-4xl font-bold text-neonGreen leading-none">{topScorer.goals}</div>
                                            <div className="text-xs text-gray-400 mt-1">GOALS</div>
                                        </div>

                                        <div className="w-px h-10 bg-white/10"></div>
                                        <div>
                                            <div className="text-2xl font-bold text-white leading-none">{topScorer.matches ? (topScorer.goals / topScorer.matches).toFixed(2) : '-'}</div>
                                            <div className="text-xs text-gray-400 mt-1">RATIO</div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <div data-html2canvas-ignore>
                            <AdSlot variant="banner" className="mt-6" />
                        </div>
                    </div>
                </div>
            )}

            <Card hover={false}>
                <CardHeader className="flex items-center justify-between">
                    <h3 className="font-display font-bold flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-neonGreen" />
                        Pencetak Gol Terbanyak
                    </h3>
                    <div data-html2canvas-ignore>
                        {onExport && (
                            <Button variant="ghost" size="sm" onClick={onExport}>
                                <Download className="w-4 h-4 mr-2" />
                                Export Image
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 text-xs uppercase text-gray-400">
                                    <th className="p-4 w-16 text-center">Rank</th>
                                    <th className="p-4">Player</th>
                                    <th className="p-4 text-center">Matches</th>
                                    <th className="p-4 text-center">Goals</th>
                                    <th className="p-4 text-center hidden sm:table-cell">Ratio</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {data.map((player, index) => {
                                    const isUserTeam = String(player.participant_id) === String(highlightParticipantId);
                                    return (
                                        <tr key={player.id} className={`hover:bg-white/5 transition ${isUserTeam ? 'bg-neonGreen/10' : (index === 0 && !compact ? 'bg-neonGreen/5' : '')}`}>
                                            <td className="p-4 text-center">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mx-auto
                                               ${index === 0 ? 'bg-neonGreen text-black ring-4 ring-neonGreen/20' :
                                                        index === 1 ? 'bg-white/20 text-white' :
                                                            index === 2 ? 'bg-orange-500/20 text-orange-400' :
                                                                'text-gray-500'}`}>
                                                    {index + 1}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className={`font-bold ${isUserTeam ? 'text-neonGreen' : 'text-white'}`}>{player.name}</div>
                                                <div className="text-xs text-gray-400">{player.team_name || player.team}</div>
                                            </td>
                                            <td className="p-4 text-center text-gray-400">{player.matches || '-'}</td>
                                            <td className="p-4 text-center">
                                                <span className={`font-bold text-lg ${index === 0 || isUserTeam ? 'text-neonGreen' : 'text-white'}`}>
                                                    {player.goals}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center text-gray-400 hidden sm:table-cell">
                                                {player.matches ? (player.goals / player.matches).toFixed(2) : '-'}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
})

export default TopScorerList
