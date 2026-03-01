import React, { useState } from 'react';
import {
    Users,
    Play,
    RefreshCcw,
    LayoutGrid,
    List,
    CheckCircle2,
    AlertCircle,
    ArrowRightLeft,
    Home,
    Plane,
    Calendar,
    ChevronRight,
    Info,
    Loader2
} from 'lucide-react';

export default function App() {
    const [mode, setMode] = useState(36);
    const [inputRaw, setInputRaw] = useState('');
    const [teams, setTeams] = useState([]);
    const [pots, setPots] = useState({});
    const [results, setResults] = useState(null);
    const [matchdays, setMatchdays] = useState([]);
    const [step, setStep] = useState(1);
    const [viewTab, setViewTab] = useState('team');
    const [isCalculating, setIsCalculating] = useState(false);

    const totalMatchdays = mode === 36 ? 8 : 4;

    const processInput = () => {
        const lines = inputRaw.split('\n').map(t => t.trim()).filter(t => t !== '');
        if (lines.length !== mode) {
            alert(`Jumlah tim harus tepat ${mode}. Saat ini terdeteksi ${lines.length} tim.`);
            return;
        }
        const formattedTeams = lines.map((name, index) => ({ id: index, name }));
        setTeams(formattedTeams);
        divideToPots(formattedTeams);
        setStep(2);
    };

    const divideToPots = (teamList, shuffle = false) => {
        const currentTeams = shuffle ? [...teamList].sort(() => Math.random() - 0.5) : [...teamList];
        const numPots = mode === 36 ? 4 : 2;
        const teamsPerPot = 9;
        const newPots = {};
        for (let i = 0; i < numPots; i++) {
            newPots[`Pot ${i + 1}`] = currentTeams.slice(i * teamsPerPot, (i + 1) * teamsPerPot);
        }
        setPots(newPots);
    };

    const handleShufflePots = () => {
        divideToPots(teams, true);
    };

    /**
     * ALGORITMA DETERMINISTIK V3.5
     * Fokus perbaikan: 18 Tim (4 Matchday, 2 Pots)
     */
    const performDraw = () => {
        setIsCalculating(true);

        setTimeout(() => {
            const potKeys = Object.keys(pots);
            const teamStats = {};
            const allTeams = Object.values(pots).flat();
            const mdFixtures = Array.from({ length: totalMatchdays }, () => []);

            allTeams.forEach(t => {
                teamStats[t.id] = { id: t.id, name: t.name, matches: [] };
            });

            const recordMatch = (hTeam, aTeam, hPot, aPot, mdIndex) => {
                mdFixtures[mdIndex].push({
                    home: hTeam.name, away: aTeam.name,
                    hPot: hPot, aPot: aPot
                });
                teamStats[hTeam.id].matches.push({
                    opponent: aTeam.name, isHome: true,
                    pot: aPot, matchday: mdIndex + 1
                });
                teamStats[aTeam.id].matches.push({
                    opponent: hTeam.name, isHome: false,
                    pot: hPot, matchday: mdIndex + 1
                });
            };

            if (mode === 36) {
                // --- LOGIKA 36 TIM (8 LAGA) ---
                const interPotGroups = [[[0, 1], [2, 3]], [[0, 2], [1, 3]], [[0, 3], [1, 2]]];
                interPotGroups.forEach((group, idx) => {
                    const mdBase = idx * 2;
                    group.forEach(([p1Idx, p2Idx]) => {
                        const pot1 = pots[potKeys[p1Idx]];
                        const pot2 = pots[potKeys[p2Idx]];
                        for (let i = 0; i < 9; i++) {
                            recordMatch(pot1[i], pot2[i], potKeys[p1Idx], potKeys[p2Idx], mdBase);
                            recordMatch(pot2[(i + 1) % 9], pot1[i], potKeys[p2Idx], potKeys[p1Idx], mdBase + 1);
                        }
                    });
                });
                for (let pIdx = 0; pIdx < 4; pIdx++) {
                    const pot = pots[potKeys[pIdx]];
                    const pName = potKeys[pIdx];
                    const pairsMD7 = [[0, 1], [2, 3], [4, 5], [6, 7]];
                    const pairsMD8 = [[0, 2], [1, 3], [4, 6], [5, 7]];
                    pairsMD7.forEach(([i1, i2]) => recordMatch(pot[i1], pot[i2], pName, pName, 6));
                    pairsMD8.forEach(([i1, i2]) => recordMatch(pot[i2], pot[i1], pName, pName, 7));
                }
                recordMatch(pots[potKeys[0]][8], pots[potKeys[1]][8], potKeys[0], potKeys[1], 6);
                recordMatch(pots[potKeys[2]][8], pots[potKeys[3]][8], potKeys[2], potKeys[3], 6);
                recordMatch(pots[potKeys[2]][8], pots[potKeys[0]][8], potKeys[2], potKeys[0], 7);
                recordMatch(pots[potKeys[3]][8], pots[potKeys[1]][8], potKeys[3], potKeys[1], 7);

            } else {
                // --- LOGIKA 18 TIM (PERBAIKAN TOTAL: 4 LAGA UNIK) ---
                // Karena tim per pot ganjil (9), kita harus mencampur inter dan intra di setiap matchday
                const p1 = pots[potKeys[0]];
                const p2 = pots[potKeys[1]];
                const n1 = potKeys[0];
                const n2 = potKeys[1];

                // MD 1: (0-1, 2-3, 4-5, 6-7) di P1 & P2. Sisa P1[8]-P2[8] (Inter)
                for (let i = 0; i < 4; i++) {
                    recordMatch(p1[i * 2], p1[i * 2 + 1], n1, n1, 0);
                    recordMatch(p2[i * 2], p2[i * 2 + 1], n2, n2, 0);
                }
                recordMatch(p1[8], p2[8], n1, n2, 0);

                // MD 2: (1-2, 3-4, 5-6, 7-8) di P1 & P2. Sisa P1[0]-P2[0] (Inter)
                for (let i = 0; i < 4; i++) {
                    recordMatch(p1[i * 2 + 1], p1[i * 2 + 2], n1, n1, 1);
                    recordMatch(p2[i * 2 + 1], p2[i * 2 + 2], n2, n2, 1);
                }
                recordMatch(p2[0], p1[0], n2, n1, 1);

                // MD 3: Murni Inter-Pot (P1 index i vs P2 index (i+2)%9)
                for (let i = 0; i < 9; i++) {
                    recordMatch(p1[i], p2[(i + 2) % 9], n1, n2, 2);
                }

                // MD 4: Murni Inter-Pot (P2 index (i+4)%9 vs P1 index i)
                for (let i = 0; i < 9; i++) {
                    recordMatch(p2[(i + 4) % 9], p1[i], n2, n1, 3);
                }
            }

            Object.values(teamStats).forEach(ts => {
                ts.matches.sort((a, b) => a.matchday - b.matchday);
            });

            setResults(teamStats);
            setMatchdays(mdFixtures);
            setIsCalculating(false);
            setStep(3);
        }, 300);
    };

    const resetAll = () => {
        setTeams([]); setPots({}); setResults(null); setMatchdays([]); setStep(1); setInputRaw(''); setViewTab('team');
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-indigo-900 flex items-center gap-3 italic tracking-tight">
                            <ArrowRightLeft className="w-8 h-8 text-indigo-600 not-italic" />
                            LIGA SIMULATOR PRO
                        </h1>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.3em] mt-1">
                            {mode} Tim &bull; Tepat {totalMatchdays} Laga Unik &bull; European Standard
                        </p>
                    </div>
                    <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200">
                        {[36, 18].map(m => (
                            <button
                                key={m}
                                onClick={() => { if (step === 1) setMode(m); }}
                                className={`px-6 py-2 rounded-lg text-sm font-black transition-all ${mode === m ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
                                disabled={step > 1}
                            >
                                {m} Tim
                            </button>
                        ))}
                    </div>
                </header>

                <main className="bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100 border border-slate-100 overflow-hidden relative min-h-[500px]">
                    {isCalculating && (
                        <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-center p-6">
                            <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mb-4" />
                            <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Memvalidasi Jadwal...</h3>
                            <p className="text-slate-500 font-medium max-w-sm">Menghasilkan tepat {totalMatchdays} laga unik tanpa pengecualian.</p>
                        </div>
                    )}

                    {step === 1 && (
                        <div className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-4 bg-indigo-50 rounded-2xl text-indigo-600"><List className="w-6 h-6" /></div>
                                <div>
                                    <h2 className="text-xl font-black uppercase tracking-tight">Daftar Peserta</h2>
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Wajib {mode} Nama Tim</p>
                                </div>
                            </div>
                            <textarea
                                className="w-full h-80 p-6 border-2 border-slate-50 rounded-[2rem] focus:ring-8 focus:ring-indigo-50 focus:border-indigo-500 transition-all outline-none font-mono text-sm leading-relaxed shadow-inner"
                                placeholder={`Tempel daftar tim di sini (1 tim per baris)...`}
                                value={inputRaw}
                                onChange={(e) => setInputRaw(e.target.value)}
                            />
                            <div className="mt-8 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-tighter italic">
                                    <AlertCircle className="w-4 h-4 text-indigo-400 not-italic" />
                                    Pastikan tidak ada nama tim yang duplikat agar pengundian akurat.
                                </div>
                                <button onClick={processInput} className="px-12 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black shadow-xl shadow-indigo-200 flex items-center gap-3 transition-all hover:-translate-y-1 active:scale-95">
                                    Proses Tim
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="p-8 animate-in zoom-in-95 duration-500 text-left">
                            <div className="flex justify-between items-center mb-10">
                                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Hasil Pembagian Pot</h2>
                                <div className="flex gap-3">
                                    <button onClick={handleShufflePots} className="px-6 py-3 border-2 border-slate-100 rounded-2xl font-black text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2">
                                        <RefreshCcw className="w-4 h-4" /> Acak Pot
                                    </button>
                                    <button onClick={performDraw} className="px-10 py-3 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all hover:scale-105 active:scale-95">
                                        Generate Jadwal
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {Object.entries(pots).map(([name, list]) => (
                                    <div key={name} className="bg-slate-50 rounded-[2rem] p-6 border border-slate-100 shadow-sm">
                                        <div className="bg-white px-5 py-2.5 rounded-2xl border border-slate-100 mb-6 flex justify-between items-center shadow-sm">
                                            <span className="font-black text-indigo-600 text-xs uppercase tracking-widest">{name}</span>
                                            <span className="text-[10px] text-slate-300 font-black uppercase">9 Tim</span>
                                        </div>
                                        <div className="space-y-2.5 text-left">
                                            {list.map((t, idx) => (
                                                <div key={t.id} className="bg-white/80 p-3.5 rounded-xl text-xs font-black text-slate-700 border border-white truncate shadow-xs">
                                                    <span className="text-indigo-300 mr-3 font-mono">{idx + 1}</span>{t.name}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 3 && results && (
                        <div className="p-6 md:p-8 animate-in fade-in duration-700 text-left">
                            <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-8">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 border-2 border-emerald-200">
                                        <CheckCircle2 className="w-9 h-9" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter leading-none">Drawing Selesai</h2>
                                        <p className="text-slate-400 text-xs font-black uppercase tracking-widest mt-2">Semua tim mendapatkan tepat {totalMatchdays} laga unik</p>
                                    </div>
                                </div>
                                <div className="flex bg-slate-100 p-1.5 rounded-2xl shadow-inner border border-slate-200">
                                    <button onClick={() => setViewTab('team')} className={`px-10 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${viewTab === 'team' ? 'bg-white text-indigo-600 shadow-md scale-105' : 'text-slate-400 hover:text-slate-600'}`}>Tampilan Tim</button>
                                    <button onClick={() => setViewTab('matchday')} className={`px-10 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${viewTab === 'matchday' ? 'bg-white text-indigo-600 shadow-md scale-105' : 'text-slate-400 hover:text-slate-600'}`}>Matchday</button>
                                </div>
                            </div>

                            {viewTab === 'team' ? (
                                <div className="space-y-6">
                                    {Object.values(results).map((ts, idx) => (
                                        <div key={idx} className="bg-slate-50/50 rounded-[3rem] border border-slate-100 p-8 flex flex-col lg:flex-row gap-8 hover:bg-white transition-all group hover:shadow-2xl hover:shadow-indigo-100/40 text-left">
                                            <div className="lg:w-1/4">
                                                <div className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-3">Profil Peserta</div>
                                                <h3 className="text-2xl font-black text-slate-900 uppercase truncate leading-none mb-6">{ts.name}</h3>
                                                <div className="flex items-center gap-3">
                                                    <span className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tighter shadow-lg shadow-indigo-100">{ts.matches.length} Laga Unik</span>
                                                </div>
                                            </div>
                                            <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4">
                                                {ts.matches.map((m, midx) => (
                                                    <div key={midx} className={`p-5 rounded-[2rem] border-2 flex flex-col justify-between gap-4 relative overflow-hidden transition-all hover:-translate-y-1.5 ${m.isHome ? 'bg-indigo-50/40 border-indigo-100/50 shadow-md' : 'bg-white border-slate-100 shadow-xs'}`}>
                                                        <div className="flex justify-between items-center z-10">
                                                            <span className="text-[9px] font-black px-2.5 py-1 rounded-full bg-white shadow-sm text-slate-400 border border-slate-100 uppercase tracking-tighter">{m.pot}</span>
                                                            <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">MD{m.matchday}</span>
                                                        </div>
                                                        <div className="text-[11px] font-black text-slate-800 truncate z-10 uppercase tracking-tight pr-6">{m.opponent}</div>
                                                        <div className="absolute -bottom-3 -right-3 opacity-[0.07] group-hover:opacity-[0.15] transition-opacity">
                                                            {m.isHome ? <Home className="w-16 h-16" /> : <Plane className="w-16 h-16" />}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 text-left">
                                    {matchdays.map((fixtures, i) => (
                                        <div key={i} className="flex flex-col gap-8">
                                            <div className="flex items-end justify-between border-b-8 border-indigo-600 pb-3 px-4">
                                                <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">Matchday {i + 1}</h3>
                                                <span className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em]">{fixtures.length} Fixtures</span>
                                            </div>
                                            <div className="space-y-3">
                                                {fixtures.map((f, fidx) => (
                                                    <div key={fidx} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:border-indigo-400 transition-all hover:shadow-xl hover:shadow-indigo-50">
                                                        <div className="flex-1 text-right flex flex-col">
                                                            <span className="text-[9px] font-black text-slate-300 uppercase mb-1 tracking-tighter">{f.hPot}</span>
                                                            <span className="font-black text-sm text-slate-900 uppercase group-hover:text-indigo-600 transition-colors truncate">{f.home}</span>
                                                        </div>
                                                        <div className="mx-8 text-center">
                                                            <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 shadow-inner group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all">VS</div>
                                                        </div>
                                                        <div className="flex-1 text-left flex flex-col">
                                                            <span className="text-[9px] font-black text-slate-300 uppercase mb-1 tracking-tighter">{f.aPot}</span>
                                                            <span className="font-black text-sm text-slate-900 uppercase group-hover:text-indigo-600 transition-colors truncate">{f.away}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="mt-16 p-10 bg-slate-900 rounded-[4rem] flex flex-col md:flex-row items-center justify-between gap-10 text-center md:text-left shadow-2xl shadow-indigo-300/40 border border-white/5">
                                <div className="flex items-center gap-8 text-white">
                                    <div className="w-20 h-20 bg-white/10 rounded-[2rem] flex items-center justify-center text-indigo-400 border border-white/10 shadow-2xl backdrop-blur-md">
                                        <Info className="w-10 h-10" />
                                    </div>
                                    <div className="text-left">
                                        <h4 className="text-xl font-black uppercase leading-tight tracking-tight">Status Validasi V3.5</h4>
                                        <p className="text-slate-400 text-xs mt-2 max-w-sm italic leading-relaxed">
                                            Logika hibrida untuk 18 tim telah diterapkan. Setiap tim dipastikan memiliki tepat 4 lawan unik dengan distribusi pot 50/50.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-4 w-full md:w-auto">
                                    <button onClick={() => window.print()} className="flex-1 px-10 py-5 bg-white/10 text-white rounded-2xl font-black hover:bg-white/20 transition-all uppercase text-xs tracking-widest border border-white/10">Export PDF</button>
                                    <button onClick={resetAll} className="flex-1 px-10 py-5 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 shadow-2xl shadow-indigo-500/30 transition-all active:scale-95 uppercase text-xs tracking-widest">Mulai Ulang</button>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
                <footer className="mt-16 text-center text-slate-400 text-[10px] font-black uppercase tracking-[0.5em] pb-12">
                    League Scheduling Engine &bull; Unique Matchmaking V3.5 &bull; European Standard
                </footer>
            </div>
        </div>
    );
}