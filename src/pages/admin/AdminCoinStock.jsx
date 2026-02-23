import React, { useState, useEffect } from 'react'
import {
    TrendingUp, TrendingDown, Coins, RefreshCw,
    ArrowUpRight, ArrowDownRight, DollarSign,
    BarChart3, Activity, Clock, Info, Loader2
} from 'lucide-react'
import { api } from '../../utils/api'

// Mini sparkline SVG component
function Sparkline({ data, width = 120, height = 40, color = '#10b981' }) {
    if (!data || data.length < 2) return null
    const prices = data.map(d => d.price)
    const min = Math.min(...prices)
    const max = Math.max(...prices)
    const range = max - min || 1

    const points = prices.map((p, i) => {
        const x = (i / (prices.length - 1)) * width
        const y = height - ((p - min) / range) * (height - 4) - 2
        return `${x},${y}`
    }).join(' ')

    return (
        <svg width={width} height={height} className="inline-block">
            <polyline
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
            />
        </svg>
    )
}

// Simple bar chart for volume or supply
function VolumeChart({ data, width = '100%', height = 80 }) {
    if (!data || data.length === 0) return null
    const supplies = data.map(d => d.supply || 0)
    const maxVol = Math.max(...supplies) || 1

    return (
        <div className="flex items-end gap-[2px]" style={{ width, height }}>
            {data.map((d, i) => {
                const h = (d.supply / maxVol) * 100
                const isLast = i === data.length - 1
                return (
                    <div
                        key={i}
                        className={`flex-1 rounded-t transition-all hover:opacity-80 ${isLast ? 'bg-emerald-500' : 'bg-emerald-200'}`}
                        style={{ height: `${h}%`, minWidth: '3px' }}
                        title={`${d.date}: ${d.supply?.toLocaleString('id-ID')} coins circulating`}
                    />
                )
            })}
        </div>
    )
}

// Price chart area
function PriceChart({ data }) {
    if (!data || data.length === 0) {
        return <div className="h-[200px] flex items-center justify-center text-gray-400 text-sm">Belum ada data history harga</div>
    }

    const prices = data.map(d => d.price)
    const min = Math.min(...prices)
    const max = Math.max(...prices)
    const range = max - min || 1
    const w = 600
    const h = 200

    const points = prices.map((p, i) => {
        const x = (i / (prices.length - 1)) * w
        const y = h - ((p - min) / range) * (h - 20) - 10
        return `${x},${y}`
    }).join(' ')

    const areaPoints = `0,${h} ${points} ${w},${h}`

    const lineColor = prices[prices.length - 1] >= prices[0] ? '#10b981' : '#ef4444'
    const gradientId = 'priceGradient'

    return (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 200 }}>
            <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={lineColor} stopOpacity="0.15" />
                    <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
                </linearGradient>
            </defs>
            {/* Grid lines */}
            {[0, 1, 2, 3, 4].map(i => (
                <line
                    key={i}
                    x1="0" y1={i * (h / 4)}
                    x2={w} y2={i * (h / 4)}
                    stroke="#e5e7eb"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                />
            ))}
            {/* Area fill */}
            <polygon
                fill={`url(#${gradientId})`}
                points={areaPoints}
            />
            {/* Line */}
            <polyline
                fill="none"
                stroke={lineColor}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
            />
            {/* Current price dot */}
            {data.length > 1 && (() => {
                const lastX = w
                const lastY = h - ((prices[prices.length - 1] - min) / range) * (h - 20) - 10
                return (
                    <>
                        <circle cx={lastX} cy={lastY} r="5" fill={lineColor} />
                        <circle cx={lastX} cy={lastY} r="8" fill={lineColor} opacity="0.2">
                            <animate attributeName="r" values="8;14;8" dur="2s" repeatCount="indefinite" />
                            <animate attributeName="opacity" values="0.2;0;0.2" dur="2s" repeatCount="indefinite" />
                        </circle>
                    </>
                )
            })()}
            {/* Labels */}
            <text x="4" y="14" className="text-[10px]" fill="#9ca3af">
                Rp {max.toLocaleString('id-ID')}
            </text>
            <text x="4" y={h - 4} className="text-[10px]" fill="#9ca3af">
                Rp {min.toLocaleString('id-ID')}
            </text>
        </svg>
    )
}

export default function AdminCoinStock() {
    const [timeRange, setTimeRange] = useState('30d')
    const [lastUpdated, setLastUpdated] = useState(new Date())
    const [loading, setLoading] = useState(true)

    // Data states
    const [stats, setStats] = useState({
        currentPrice: 150,
        supply: 0,
        activeTournaments: 0,
        yesterdayPrice: 150,
        weekAgoPrice: 150,
        monthAgoPrice: 150
    })
    const [historyData, setHistoryData] = useState([])
    const [recentTransactions, setRecentTransactions] = useState([])
    const [conversionInput, setConversionInput] = useState(1000)

    useEffect(() => {
        fetchData()
    }, [lastUpdated])

    const fetchData = async () => {
        try {
            setLoading(true)
            const [statsRes, historyRes, recentRes] = await Promise.all([
                api.get('/api/admin/transactions/coin-price/current'),
                api.get('/api/admin/transactions/coin-price/history'),
                api.get('/api/admin/transactions/recent-coin-usage')
            ])

            if (statsRes.success) setStats(statsRes.data)

            if (historyRes.success) {
                // If the history array is empty or lacks today's data, append current stats as today's data point
                const hist = historyRes.data || []

                // Add current value to history array for graph continuity if history is small
                if (hist.length > 0) {
                    const latestDate = new Date(hist[hist.length - 1].date).toISOString().split('T')[0]
                    const todayDate = new Date().toISOString().split('T')[0]
                    if (latestDate !== todayDate) {
                        hist.push({
                            date: todayDate,
                            price: statsRes.data?.currentPrice || 150,
                            supply: statsRes.data?.supply || 0,
                            tournaments: statsRes.data?.activeTournaments || 0
                        })
                    } else if (statsRes.data?.currentPrice) {
                        // Update today's entry with the exact current price
                        hist[hist.length - 1].price = statsRes.data.currentPrice
                        hist[hist.length - 1].supply = statsRes.data.supply
                    }
                } else if (statsRes.data) {
                    // Seed history with today's value if it's completely empty
                    hist.push({
                        date: new Date().toISOString().split('T')[0],
                        price: statsRes.data.currentPrice,
                        supply: statsRes.data.supply,
                        tournaments: statsRes.data.activeTournaments
                    })
                }

                setHistoryData(hist)
            }
            if (recentRes.success) setRecentTransactions(recentRes.data)
        } catch (error) {
            console.error('Error fetching coin stock data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleRefresh = () => {
        setLastUpdated(new Date())
    }

    // Calculations for cards
    const { currentPrice, yesterdayPrice, weekAgoPrice, monthAgoPrice, supply, activeTournaments } = stats

    const calcChange = (current, previous) => current - previous
    const calcChangePercent = (current, previous) => previous > 0 ? ((current - previous) / previous * 100).toFixed(2) : '0.00'

    const priceChange = calcChange(currentPrice, yesterdayPrice)
    const priceChangePercent = calcChangePercent(currentPrice, yesterdayPrice)
    const isUp = priceChange >= 0

    const weekChange = calcChange(currentPrice, weekAgoPrice)
    const weekChangePercent = calcChangePercent(currentPrice, weekAgoPrice)

    const monthChange = calcChange(currentPrice, monthAgoPrice)
    const monthChangePercent = calcChangePercent(currentPrice, monthAgoPrice)

    const highPrice = historyData.length > 0 ? Math.max(...historyData.map(d => d.price)) : currentPrice
    const lowPrice = historyData.length > 0 ? Math.min(...historyData.map(d => d.price)) : currentPrice
    const avgPrice = historyData.length > 0 ? Math.round(historyData.reduce((a, b) => a + b.price, 0) / historyData.length) : currentPrice

    const statsCards = [
        {
            title: 'Harga Saat Ini',
            value: `Rp ${currentPrice.toLocaleString('id-ID')}`,
            change: `${isUp ? '+' : ''}${priceChangePercent}%`,
            sub: 'vs kemarin',
            icon: Coins,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            changeColor: isUp ? 'text-emerald-600' : 'text-red-500',
        },
        {
            title: 'Perubahan 7 Hari',
            value: `${weekChange >= 0 ? '+' : ''}Rp ${Math.abs(weekChange).toLocaleString('id-ID')}`,
            change: `${weekChange >= 0 ? '+' : ''}${weekChangePercent}%`,
            sub: 'minggu ini',
            icon: weekChange >= 0 ? TrendingUp : TrendingDown,
            color: weekChange >= 0 ? 'text-blue-600' : 'text-red-600',
            bg: weekChange >= 0 ? 'bg-blue-50' : 'bg-red-50',
            changeColor: weekChange >= 0 ? 'text-emerald-600' : 'text-red-500',
        },
        {
            title: 'Perubahan 30 Hari',
            value: `${monthChange >= 0 ? '+' : ''}Rp ${Math.abs(monthChange).toLocaleString('id-ID')}`,
            change: `${monthChange >= 0 ? '+' : ''}${monthChangePercent}%`,
            sub: 'bulan ini',
            icon: BarChart3,
            color: monthChange >= 0 ? 'text-purple-600' : 'text-red-600',
            bg: monthChange >= 0 ? 'bg-purple-50' : 'bg-red-50',
            changeColor: monthChange >= 0 ? 'text-emerald-600' : 'text-red-500',
        },
        {
            title: 'Circulating Supply',
            value: supply.toLocaleString('id-ID'),
            change: `${activeTournaments}`,
            sub: 'turnamen aktif saat ini',
            icon: Activity,
            color: 'text-orange-600',
            bg: 'bg-orange-50',
            changeColor: 'text-gray-900',
        },
    ]

    // Formatter
    const formatDate = (dateStr) => {
        if (!dateStr) return '-'
        return new Date(dateStr).toLocaleString('id-ID', {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        })
    }

    if (loading && stats.currentPrice === 150 && historyData.length === 0) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                <span className="ml-3 text-gray-500">Loading coin stock data...</span>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 font-display flex items-center gap-2">
                        <Coins className="w-7 h-7 text-yellow-500" />
                        Coin Stock
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Monitor pergerakan harga coin berbanding IDR dengan model hybrid</p>
                </div>
                <div className="flex items-center gap-3">
                    {loading && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <Clock className="w-3.5 h-3.5" />
                        Update: {lastUpdated.toLocaleTimeString('id-ID')}
                    </div>
                    <button
                        onClick={handleRefresh}
                        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition shadow-sm"
                        disabled={loading}
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statsCards.map((stat, index) => (
                    <div key={index} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{stat.title}</p>
                                <h3 className="text-xl font-bold text-gray-900 mt-1">{stat.value}</h3>
                                <div className="flex items-center gap-1.5 mt-1">
                                    <span className={`text-xs font-semibold ${stat.changeColor}`}>{stat.change}</span>
                                    <span className="text-xs text-gray-400">{stat.sub}</span>
                                </div>
                            </div>
                            <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Chart Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Price Chart */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                        <div>
                            <h2 className="text-sm font-bold text-gray-900">Grafik Harga Coin</h2>
                            <p className="text-xs text-gray-400 mt-0.5">Pergerakan dinamis harga 1 Coin = IDR</p>
                        </div>
                        <div className="flex bg-gray-100 rounded-lg p-0.5">
                            {['7d', '14d', '30d'].map(r => (
                                <button
                                    key={r}
                                    onClick={() => setTimeRange(r)}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${timeRange === r
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    {r === '7d' ? '7 Hari' : r === '14d' ? '14 Hari' : '30 Hari'}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="p-4">
                        {/* Large price display */}
                        <div className="mb-4">
                            <div className="flex items-baseline gap-3">
                                <span className="text-3xl font-bold text-gray-900">
                                    Rp {currentPrice.toLocaleString('id-ID')}
                                </span>
                                <span className={`flex items-center gap-0.5 text-sm font-semibold ${isUp ? 'text-emerald-600' : 'text-red-500'}`}>
                                    {isUp ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                                    {isUp ? '+' : ''}{priceChangePercent}%
                                </span>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">per 1 Coin (Based on {supply.toLocaleString('id-ID')} supply & {activeTournaments} active comps)</p>
                        </div>
                        <PriceChart
                            data={timeRange === '7d'
                                ? historyData.slice(-7)
                                : timeRange === '14d'
                                    ? historyData.slice(-14)
                                    : historyData
                            }
                        />
                        {/* Date range labels */}
                        <div className="flex justify-between mt-2 text-[10px] text-gray-400">
                            <span>{historyData[timeRange === '7d' ? Math.max(0, historyData.length - 7) : timeRange === '14d' ? Math.max(0, historyData.length - 14) : 0]?.date || '-'}</span>
                            <span>{historyData[historyData.length - 1]?.date || 'Hari ini'}</span>
                        </div>
                    </div>
                </div>

                {/* Side Panel: Market Info */}
                <div className="space-y-4">
                    {/* Market Summary */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                        <h3 className="text-sm font-bold text-gray-900 mb-3">Ikhtisar Pasar</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-500">Harga Dasar (Floor)</span>
                                <span className="text-sm font-semibold text-gray-900">Rp 150</span>
                            </div>
                            <div className="h-px bg-gray-100" />
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-500">Harga Tertinggi (30h)</span>
                                <span className="text-sm font-semibold text-gray-900">Rp {highPrice.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="h-px bg-gray-100" />
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-500">Harga Terendah (30h)</span>
                                <span className="text-sm font-semibold text-gray-900">Rp {lowPrice.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="h-px bg-gray-100" />
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-500">Market Cap Terkunci</span>
                                <span className="text-sm font-semibold text-gray-900">Rp {(currentPrice * supply).toLocaleString('id-ID')}</span>
                            </div>
                        </div>
                    </div>

                    {/* Supply/Volume Chart */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                        <h3 className="text-sm font-bold text-gray-900 mb-1">Riwayat Supply (Coins)</h3>
                        <p className="text-xs text-gray-400 mb-3">30 hari terakhir</p>
                        <VolumeChart data={historyData} />
                    </div>

                    {/* Conversion Calculator */}
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-4 text-white shadow-sm">
                        <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-yellow-400" />
                            Kalkulator Konversi
                        </h3>
                        <div className="space-y-2">
                            <div className="bg-white/10 rounded-lg p-3">
                                <label className="text-[10px] text-gray-400 uppercase tracking-wide">Jumlah Coin</label>
                                <div className="text-lg font-bold mt-0.5 flex items-center gap-2">
                                    <img src="/coin.png" alt="Coin" className="w-5 h-5" />
                                    <input
                                        type="number"
                                        value={conversionInput}
                                        onChange={(e) => setConversionInput(Number(e.target.value) || 0)}
                                        className="bg-transparent border-none text-white focus:outline-none w-24 p-0 m-0"
                                        min="0"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-center">
                                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs">≈</div>
                            </div>
                            <div className="bg-white/10 rounded-lg p-3">
                                <label className="text-[10px] text-gray-400 uppercase tracking-wide">Setara IDR</label>
                                <div className="text-lg font-bold mt-0.5">
                                    Rp {(conversionInput * currentPrice).toLocaleString('id-ID')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                            <Activity className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="font-bold text-gray-900">Aktivitas Terakhir</h2>
                            <p className="text-xs text-gray-500">Transaksi coin terbaru di platform yang mempengaruhi harga</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
                        <Info className="w-3 h-3" />
                        Live Data
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-medium">
                            <tr>
                                <th className="px-6 py-3">Tipe</th>
                                <th className="px-6 py-3">User</th>
                                <th className="px-6 py-3">Jumlah</th>
                                <th className="px-6 py-3">Estimasi Total IDR (saat ini)</th>
                                <th className="px-6 py-3">Waktu</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {recentTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-400">
                                        Belum ada aktivitas transaksi coin.
                                    </td>
                                </tr>
                            ) : recentTransactions.map((tx, i) => (
                                <tr key={i} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${tx.type !== 'spend'
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : 'bg-red-100 text-red-700'
                                            }`}>
                                            {tx.type !== 'spend' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                            {tx.type !== 'spend' ? 'BUY (MINT)' : 'SPEND (BURN)'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">{tx.user}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-gray-900">
                                        <div className="flex items-center gap-1">
                                            <img src="/coin.png" alt="Coin" className="w-4 h-4" />
                                            {tx.amount.toLocaleString('id-ID')}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                                        Rp {(tx.amount * currentPrice).toLocaleString('id-ID')}
                                    </td>
                                    <td className="px-6 py-4 text-xs text-gray-400">{formatDate(tx.created_at)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Price Info Box */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <Info className="w-4 h-4 text-gray-400" />
                    Info Algoritma Harga Koin (Hybrid Model)
                </h3>
                <p className="text-xs text-gray-500 mb-3">
                    Harga koin tidak lagi menggunakan tier statis, melainkan bergerak secara dinamis sesuai perputaran ekonomi platform menggunakan rumus:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg font-mono text-xs text-gray-600 overflow-x-auto whitespace-nowrap mb-3 border border-gray-200 shadow-inner">
                    P(S,C) = [ Rp 150 + (0.001 × S) + (0.000001 × S^1.6) ] × max(1.0, 1 + 0.2 × ((C - 50)/50))
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                        <h4 className="font-bold text-blue-900 text-xs uppercase mb-1">Floor Price (P0)</h4>
                        <p className="text-xs text-blue-800">Harga dasar mutlak adalah <strong>Rp 150</strong>. Sistem akan menjamin harga tidak akan pernah jatuh di bawah angka ini meskipun koin yang beredar sangat banyak atau turnamen sepi.</p>
                    </div>
                    <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
                        <h4 className="font-bold text-emerald-900 text-xs uppercase mb-1">Circulating Supply (S)</h4>
                        <p className="text-xs text-emerald-800">Semakin banyak koin yang di-<span className="italic">hold</span> pengguna di dompet mereka (belum digunakan untuk turnamen), harga koin akan <strong>naik perlahan (Kurva Bonding)</strong>. (S: {supply.toLocaleString()})</p>
                    </div>
                    <div className="p-3 bg-orange-50 border border-orange-100 rounded-lg">
                        <h4 className="font-bold text-orange-900 text-xs uppercase mb-1">Surge Multiplier (C)</h4>
                        <p className="text-xs text-orange-800">Jika lebih dari <strong>50 Turnamen Aktif</strong>, beban server meningkat, memicu kenaikan eksponensial untuk mencegah spam kompetisi. (C: {activeTournaments})</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
