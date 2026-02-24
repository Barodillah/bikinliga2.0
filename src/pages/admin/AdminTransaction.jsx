import React, { useState, useEffect } from 'react'
import { ArrowUpRight, ArrowDownLeft, Wallet, Search, Filter, Download, Users, Activity, Banknote, Loader2 } from 'lucide-react'
import { api } from '../../utils/api'

export default function AdminTransaction() {
    const [activeTab, setActiveTab] = useState('topup')
    const [topupData, setTopupData] = useState([])
    const [spendData, setSpendData] = useState([])
    const [statsData, setStatsData] = useState(null)
    const [dokuStatuses, setDokuStatuses] = useState({}) // keyed by reference_id
    const [loading, setLoading] = useState(true)
    const [dokuLoading, setDokuLoading] = useState({}) // keyed by reference_id

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            setLoading(true)
            const [statsRes, topupRes, spendRes] = await Promise.all([
                api.get('/api/admin/transactions/stats'),
                api.get('/api/admin/transactions/topup'),
                api.get('/api/admin/transactions/spend')
            ])

            if (statsRes.success) setStatsData(statsRes.data)
            if (topupRes.success) {
                setTopupData(topupRes.data)
                // Fetch DOKU status for topup rows that have reference_id
                fetchDokuStatuses(topupRes.data)
            }
            if (spendRes.success) setSpendData(spendRes.data)
        } catch (error) {
            console.error('Error fetching transaction data:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchDokuStatuses = async (transactions) => {
        // Only fetch for rows with reference_id and status pending or we want fresh data
        const withRef = transactions.filter(t => t.reference_id)
        if (withRef.length === 0) return

        const loadingState = {}
        withRef.forEach(t => { loadingState[t.reference_id] = true })
        setDokuLoading(loadingState)

        const results = {}
        // Fetch all DOKU statuses in parallel (max 10 at a time to avoid hammering)
        const chunks = []
        for (let i = 0; i < withRef.length; i += 10) {
            chunks.push(withRef.slice(i, i + 10))
        }

        for (const chunk of chunks) {
            const promises = chunk.map(async (t) => {
                try {
                    const res = await api.get(`/api/admin/transactions/doku-status/${t.reference_id}`)
                    if (res.success && res.data) {
                        results[t.reference_id] = res.data
                    }
                } catch (err) {
                    console.error(`Failed to fetch DOKU status for ${t.reference_id}:`, err)
                }
            })
            await Promise.all(promises)
        }

        setDokuStatuses(results)
        setDokuLoading({})
    }

    // Extract payment method from DOKU response
    const getDokuMethod = (referenceId) => {
        const doku = dokuStatuses[referenceId]
        if (!doku) return null
        // DOKU response structure: { transaction: { status, ... }, channel: { id: 'EMONEY_OVO' }, ... }
        const channelId = doku?.channel?.id || doku?.service?.id || null
        if (channelId) {
            // Convert channel ID to readable name
            const channelMap = {
                'EMONEY_OVO': 'OVO',
                'EMONEY_DANA': 'DANA',
                'EMONEY_SHOPEEPAY': 'ShopeePay',
                'EMONEY_LINKAJA': 'LinkAja',
                'QRIS': 'QRIS',
                'VIRTUAL_ACCOUNT_BCA': 'BCA VA',
                'VIRTUAL_ACCOUNT_BNI': 'BNI VA',
                'VIRTUAL_ACCOUNT_BRI': 'BRI VA',
                'VIRTUAL_ACCOUNT_MANDIRI': 'Mandiri VA',
                'VIRTUAL_ACCOUNT_PERMATA': 'Permata VA',
                'VIRTUAL_ACCOUNT_CIMB': 'CIMB VA',
                'CREDIT_CARD': 'Credit Card',
            }
            return channelMap[channelId] || channelId
        }
        return null
    }

    // Extract nominal IDR from DOKU response
    const getDokuNominal = (referenceId) => {
        const doku = dokuStatuses[referenceId]
        if (!doku) return null
        const amount = doku?.order?.amount
        return amount ? parseInt(amount) : null
    }

    // Extract status from DOKU response
    const getDokuStatus = (referenceId, dbStatus) => {
        const doku = dokuStatuses[referenceId]
        if (!doku) return dbStatus // fallback to DB status
        const dokuTxStatus = doku?.transaction?.status
        if (dokuTxStatus) {
            return dokuTxStatus.toLowerCase() // 'SUCCESS' -> 'success', 'PENDING' -> 'pending', 'FAILED' -> 'failed'
        }
        return dbStatus
    }

    const formatDate = (dateStr) => {
        if (!dateStr) return '-'
        return new Date(dateStr).toLocaleString('id-ID', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        })
    }

    const getStatusBadge = (status) => {
        const s = (status || '').toLowerCase()
        if (s === 'success') return 'bg-green-100 text-green-700'
        if (s === 'pending') return 'bg-yellow-100 text-yellow-700'
        if (s === 'failed' || s === 'expired') return 'bg-red-100 text-red-700'
        return 'bg-gray-100 text-gray-700'
    }

    // Calculate total revenue from successful top ups
    const totalRevenue = topupData.reduce((sum, item) => {
        const realStatus = item.reference_id ? getDokuStatus(item.reference_id, item.status) : item.status
        if ((realStatus || '').toLowerCase() === 'success') {
            const nominal = item.reference_id ? getDokuNominal(item.reference_id) : null
            return sum + (nominal ? parseInt(nominal) : 0)
        }
        return sum
    }, 0)

    const stats = [
        { title: 'Total Revenue', value: `Rp ${totalRevenue.toLocaleString('id-ID')}`, change: 'From Top Up', icon: Banknote, color: 'text-green-600', bg: 'bg-green-100' },
        { title: 'Total Top Up Transaksi', value: statsData?.total_topup_count?.toLocaleString('id-ID') || '0', change: 'All Time', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-100' },
        { title: 'Total Spend Transaksi', value: statsData?.total_spend_count?.toLocaleString('id-ID') || '0', change: 'All Time', icon: Wallet, color: 'text-purple-600', bg: 'bg-purple-100' },
        { title: 'Total Top Up Coins', value: statsData?.total_topup_coins?.toLocaleString('id-ID') || '0', change: 'Successful', icon: Users, color: 'text-orange-600', bg: 'bg-orange-100' },
    ]

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                <span className="ml-3 text-gray-500">Loading transactions...</span>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 font-display">Transaction History</h1>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-start justify-between">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">{stat.title}</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</h3>
                            <span className="text-xs font-medium text-green-600">
                                {stat.change}
                            </span>
                        </div>
                        <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                            <stat.icon className="w-5 h-5" />
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex bg-white rounded-lg border border-gray-200 p-1 w-fit">
                <button
                    onClick={() => setActiveTab('topup')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'topup' ? 'bg-gray-100 text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Top Up History
                </button>
                <button
                    onClick={() => setActiveTab('usage')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'usage' ? 'bg-gray-100 text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Coin Usage
                </button>
            </div>

            {/* Top Up History Card */}
            <div className={`bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden ${activeTab === 'topup' ? 'block' : 'hidden'}`}>
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                            <ArrowDownLeft className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="font-bold text-gray-900">Top Up History</h2>
                            <p className="text-xs text-gray-500">Incoming transactions from user top-ups</p>
                        </div>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-medium">
                            <tr>
                                <th className="px-6 py-3">Transaction ID</th>
                                <th className="px-6 py-3">User</th>
                                <th className="px-6 py-3">Method</th>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">Nominal (IDR)</th>
                                <th className="px-6 py-3">Amount (Coin)</th>
                                <th className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {topupData.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-8 text-center text-sm text-gray-400">
                                        Belum ada transaksi top up.
                                    </td>
                                </tr>
                            ) : (
                                topupData.map((item) => {
                                    const realStatus = item.reference_id ? getDokuStatus(item.reference_id, item.status) : item.status
                                    const method = item.reference_id ? getDokuMethod(item.reference_id) : null
                                    const nominal = item.reference_id ? getDokuNominal(item.reference_id) : null
                                    const isLoadingDoku = dokuLoading[item.reference_id]

                                    return (
                                        <tr key={item.id} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900 font-mono">
                                                {item.id}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 font-medium">{item.user_name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {isLoadingDoku ? (
                                                    <Loader2 className="w-4 h-4 animate-spin text-gray-300" />
                                                ) : (
                                                    method || <span className="text-gray-300">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-xs text-gray-400">{formatDate(item.created_at)}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                                                {isLoadingDoku ? (
                                                    <Loader2 className="w-4 h-4 animate-spin text-gray-300" />
                                                ) : (
                                                    nominal ? `Rp ${nominal.toLocaleString('id-ID')}` : <span className="text-gray-300">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-bold text-gray-900">
                                                <div className="flex items-center gap-1">
                                                    <img src="/coin.png" alt="Coin" className="w-4 h-4" />
                                                    {item.amount}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {isLoadingDoku ? (
                                                    <Loader2 className="w-4 h-4 animate-spin text-gray-300" />
                                                ) : (
                                                    <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${getStatusBadge(realStatus)}`}>
                                                        {realStatus}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Coin Usage History Card */}
            <div className={`bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden ${activeTab === 'usage' ? 'block' : 'hidden'}`}>
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                            <ArrowUpRight className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="font-bold text-gray-900">Coin Usage History</h2>
                            <p className="text-xs text-gray-500">Coins spent by users on platform activities</p>
                        </div>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-medium">
                            <tr>
                                <th className="px-6 py-3">Usage ID</th>
                                <th className="px-6 py-3">User</th>
                                <th className="px-6 py-3">Category</th>
                                <th className="px-6 py-3">Description</th>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {spendData.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-400">
                                        Belum ada penggunaan coin.
                                    </td>
                                </tr>
                            ) : (
                                spendData.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900 font-mono">{item.id}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600 font-medium">{item.user_name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{item.category}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500 italic max-w-[200px] truncate" title={item.description}>
                                            {item.description}
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-400">{formatDate(item.created_at)}</td>
                                        <td className="px-6 py-4 text-sm font-bold text-red-600">
                                            <div className="flex items-center gap-1">
                                                -<img src="/coin.png" alt="Coin" className="w-4 h-4" />
                                                {Math.abs(item.amount)}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div >
    )
}
