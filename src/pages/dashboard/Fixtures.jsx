import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, Plus, Filter } from 'lucide-react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import MatchCard from '../../components/tournament/MatchCard'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import AdSlot from '../../components/ui/AdSlot'

const matchweeks = [
    {
        week: 5,
        date: '15-21 Jan 2024',
        matches: [
            { id: 1, home: 'FCB', away: 'RMA', time: 'Hari ini, 20:00', status: 'upcoming' },
            { id: 2, home: 'MU', away: 'ARS', time: 'Besok, 19:30', status: 'upcoming' },
            { id: 3, home: 'LIV', away: 'CHE', time: 'Besok, 21:00', status: 'upcoming' },
            { id: 4, home: 'PSG', away: 'BAY', time: 'Sabtu, 20:00', status: 'upcoming' },
        ]
    },
    {
        week: 4,
        date: '8-14 Jan 2024',
        matches: [
            { id: 5, home: 'FCB', away: 'MU', homeScore: 3, awayScore: 1, status: 'completed' },
            { id: 6, home: 'RMA', away: 'ARS', homeScore: 2, awayScore: 2, status: 'completed' },
            { id: 7, home: 'LIV', away: 'PSG', homeScore: 1, awayScore: 0, status: 'completed' },
            { id: 8, home: 'CHE', away: 'BAY', homeScore: 0, awayScore: 2, status: 'completed' },
        ]
    }
]

export default function Fixtures() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [showScoreModal, setShowScoreModal] = useState(false)
    const [selectedMatch, setSelectedMatch] = useState(null)
    const [homeScore, setHomeScore] = useState('')
    const [awayScore, setAwayScore] = useState('')

    const handleInputScore = (match) => {
        setSelectedMatch(match)
        setHomeScore('')
        setAwayScore('')
        setShowScoreModal(true)
    }

    const handleSaveScore = () => {
        console.log('Saving score:', { match: selectedMatch, homeScore, awayScore })
        alert(`Skor tersimpan: ${selectedMatch.home} ${homeScore} - ${awayScore} ${selectedMatch.away}`)
        setShowScoreModal(false)
    }

    return (
        <div className="space-y-6">
            <div>
                <button
                    onClick={() => navigate(`/dashboard/tournaments/${id}`)}
                    className="text-gray-400 hover:text-white flex items-center gap-2 mb-4 transition"
                >
                    <ArrowLeft className="w-4 h-4" /> Kembali ke turnamen
                </button>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-display font-bold">Jadwal Pertandingan</h1>
                        <p className="text-gray-400 mt-1">Warkop Cup Season 5</p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="ghost" icon={Filter}>Filter</Button>
                        <Button icon={Plus}>Tambah Match</Button>
                    </div>
                </div>
            </div>

            {/* Matchweeks */}
            {matchweeks.map((mw, index) => (
                <React.Fragment key={mw.week}>
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <Calendar className="w-5 h-5 text-neonPink" />
                                <div>
                                    <h3 className="font-display font-bold">Matchweek {mw.week}</h3>
                                    <div className="text-sm text-gray-500">{mw.date}</div>
                                </div>
                            </div>
                            <span className="text-sm text-gray-400">{mw.matches.length} pertandingan</span>
                        </div>
                        <div className="space-y-3">
                            {mw.matches.map((match) => (
                                <MatchCard
                                    key={match.id}
                                    {...match}
                                    onInputScore={match.status === 'upcoming' ? () => handleInputScore(match) : undefined}
                                />
                            ))}
                        </div>
                    </Card>
                    {/* Ad between matchweeks */}
                    {index === 0 && <AdSlot variant="inline" adId="fixtures-between" />}
                </React.Fragment>
            ))}

            {/* Score Input Modal */}
            <Modal
                isOpen={showScoreModal}
                onClose={() => setShowScoreModal(false)}
                title="Input Skor Pertandingan"
            >
                {selectedMatch && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between gap-4">
                            <div className="text-center flex-1">
                                <div className="w-16 h-16 rounded-full bg-blue-500 mx-auto mb-2 flex items-center justify-center text-2xl font-bold">
                                    {selectedMatch.home.charAt(0)}
                                </div>
                                <div className="font-bold">{selectedMatch.home}</div>
                            </div>
                            <div className="text-gray-500 font-display text-2xl">VS</div>
                            <div className="text-center flex-1">
                                <div className="w-16 h-16 rounded-full bg-red-500 mx-auto mb-2 flex items-center justify-center text-2xl font-bold">
                                    {selectedMatch.away.charAt(0)}
                                </div>
                                <div className="font-bold">{selectedMatch.away}</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <Input
                                type="number"
                                min="0"
                                max="99"
                                placeholder="0"
                                value={homeScore}
                                onChange={(e) => setHomeScore(e.target.value)}
                                className="text-center text-3xl font-display font-bold py-4"
                            />
                            <span className="text-2xl text-gray-500">-</span>
                            <Input
                                type="number"
                                min="0"
                                max="99"
                                placeholder="0"
                                value={awayScore}
                                onChange={(e) => setAwayScore(e.target.value)}
                                className="text-center text-3xl font-display font-bold py-4"
                            />
                        </div>

                        <div className="flex gap-3">
                            <Button variant="ghost" className="flex-1" onClick={() => setShowScoreModal(false)}>
                                Batal
                            </Button>
                            <Button className="flex-1" onClick={handleSaveScore}>
                                Simpan Skor
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    )
}
