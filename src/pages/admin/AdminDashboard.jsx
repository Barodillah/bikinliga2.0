import React, { useState, useEffect } from 'react'
import { Users, AlertCircle, TrendingUp, Activity, Trophy, Swords, CreditCard, UserPlus, Banknote } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format, subDays } from 'date-fns'
import { api } from '../../utils/api'

export default function AdminDashboard() {
    const [statsData, setStatsData] = useState(null)
    const [recentActivity, setRecentActivity] = useState([])
    const [loading, setLoading] = useState(true)
    const [midtransRevenue, setMidtransRevenue] = useState(0)
    const [midtransLoading, setMidtransLoading] = useState(true)
    const [loginChartData, setLoginChartData] = useState([])
    const [engagementPercentage, setEngagementPercentage] = useState(0)
    const [engagementChange, setEngagementChange] = useState(0)
    const [engagementDetail, setEngagementDetail] = useState({ activeThisMonth: 0, totalUsers: 0 })
    const [newUserChartData, setNewUserChartData] = useState([])
    const [growthPercentage, setGrowthPercentage] = useState(0)
    const [growthDetail, setGrowthDetail] = useState({ newThisMonth: 0, newLastMonth: 0 })

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, historyRes, topupRes, loginChartRes, newUserChartRes] = await Promise.all([
                    api.get('/api/admin/dashboard-stats'),
                    api.get('/api/admin/history'),
                    api.get('/api/admin/transactions/topup'),
                    api.get('/api/admin/dashboard-chart/logins'),
                    api.get('/api/admin/dashboard-chart/new-users')
                ])

                if (statsRes.success) {
                    setStatsData(statsRes.data)
                } else if (statsRes.data && statsRes.data.success) {
                    setStatsData(statsRes.data.data)
                } else {
                    setStatsData(statsRes.data || statsRes)
                }

                if (historyRes.success) {
                    setRecentActivity(historyRes.data.slice(0, 10))
                } else if (historyRes.data && historyRes.data.success) {
                    setRecentActivity(historyRes.data.data.slice(0, 10))
                } else {
                    setRecentActivity(historyRes.data || historyRes)
                }

                if (topupRes.success || (topupRes.data && topupRes.data.success)) {
                    const topupData = topupRes.success ? topupRes.data : topupRes.data.data
                    await calculateMidtransRevenue(topupData)
                } else {
                    setMidtransLoading(false)
                }

                // Process login chart data
                const loginData = loginChartRes.success ? loginChartRes.data : loginChartRes.data?.data
                if (loginData) {
                    const filledLoginData = fillMissingDays(loginData.chart || [], 'logins')
                    setLoginChartData(filledLoginData)
                    const change = parseFloat(loginData.engagementChange || 0)
                    setEngagementPercentage(parseFloat(loginData.engagementPercentage || 0))
                    setEngagementChange(change)
                    setEngagementDetail({
                        activeThisMonth: loginData.activeThisMonth || 0,
                        totalUsers: loginData.totalUsers || 0
                    })
                }

                // Process new user chart data
                const newUserData = newUserChartRes.success ? newUserChartRes.data : newUserChartRes.data?.data
                if (newUserData) {
                    const filledNewUserData = fillMissingDays(newUserData.chart || [], 'users')
                    setNewUserChartData(filledNewUserData)
                    const growth = parseFloat(newUserData.growthPercentage || 0)
                    setGrowthPercentage(growth)
                    setGrowthDetail({
                        newThisMonth: newUserData.newThisMonth || 0,
                        newLastMonth: newUserData.newLastMonth || 0
                    })
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error)
                setMidtransLoading(false)
            } finally {
                setLoading(false)
            }
        }

        const calculateMidtransRevenue = async (transactions) => {
            try {
                const withRef = transactions.filter(t => t.reference_id)
                if (withRef.length === 0) {
                    setMidtransLoading(false)
                    return
                }

                const results = {}
                const chunks = []
                for (let i = 0; i < withRef.length; i += 10) {
                    chunks.push(withRef.slice(i, i + 10))
                }

                for (const chunk of chunks) {
                    const promises = chunk.map(async (t) => {
                        try {
                            const res = await api.get(`/api/admin/transactions/midtrans-status/${t.reference_id}`)
                            if (res.success && res.data) {
                                results[t.reference_id] = res.data
                            }
                        } catch (err) {
                            console.error(`Failed to fetch Midtrans status for ${t.reference_id}:`, err)
                        }
                    })
                    await Promise.all(promises)
                }

                // Calculate total revenue from successful top ups
                const totalRev = transactions.reduce((sum, item) => {
                    let realStatus = item.status
                    let nominal = null

                    if (item.reference_id && results[item.reference_id]) {
                        const mt = results[item.reference_id]
                        const txStatus = mt?.transaction_status
                        if (txStatus) {
                            if (txStatus === 'settlement' || txStatus === 'capture') realStatus = 'success'
                            else if (txStatus === 'pending') realStatus = 'pending'
                            else realStatus = 'failed'
                        }
                        const amount = mt?.gross_amount
                        if (amount) {
                            nominal = parseInt(amount)
                        }
                    }

                    if ((realStatus || '').toLowerCase() === 'success') {
                        return sum + (nominal ? nominal : 0)
                    }
                    return sum
                }, 0)

                setMidtransRevenue(totalRev)
            } catch (error) {
                console.error('Error calculating Midtrans revenue:', error)
            } finally {
                setMidtransLoading(false)
            }
        }

        // Fill missing days with 0 for a complete 14-day chart
        const fillMissingDays = (data, valueKey) => {
            const result = []
            for (let i = 13; i >= 0; i--) {
                const d = subDays(new Date(), i)
                const dateStr = format(d, 'yyyy-MM-dd')
                const label = format(d, 'dd MMM')
                const found = data.find(item => {
                    const itemDate = format(new Date(item.date), 'yyyy-MM-dd')
                    return itemDate === dateStr
                })
                result.push({ date: label, [valueKey]: found ? Number(found[valueKey]) : 0 })
            }
            return result
        }

        fetchData()
    }, [])

    const stats = [
        {
            title: 'Active Users',
            value: statsData?.total_users || '0',
            change: 'Recently Joined',
            icon: Users,
            color: 'text-blue-600',
            bg: 'bg-blue-100'
        },
        {
            title: 'Active Complaints',
            value: statsData?.active_complaints || '0',
            change: 'Needs Attention',
            icon: AlertCircle,
            color: 'text-red-600',
            bg: 'bg-red-100'
        },
        {
            title: 'Total Revenue',
            value: midtransLoading ? 'Loading...' : `Rp ${midtransRevenue.toLocaleString('id-ID')}`,
            change: 'From Top Up',
            icon: Banknote,
            color: 'text-green-600',
            bg: 'bg-green-100'
        },
        {
            title: 'System Health',
            value: statsData?.system_health || '98%',
            change: 'Stable',
            icon: Activity,
            color: 'text-purple-600',
            bg: 'bg-purple-100'
        },
        {
            title: 'Total Tournaments',
            value: statsData?.total_tournaments || '0',
            change: 'All Time',
            icon: Trophy,
            color: 'text-yellow-600',
            bg: 'bg-yellow-100'
        },
        {
            title: 'Total Matches',
            value: statsData?.total_matches || '0',
            change: 'Played',
            icon: Swords,
            color: 'text-indigo-600',
            bg: 'bg-indigo-100'
        },
        {
            title: 'Active Subscriptions',
            value: statsData?.active_subscriptions || '0',
            change: 'Recurring',
            icon: CreditCard,
            color: 'text-pink-600',
            bg: 'bg-pink-100'
        },
        {
            title: 'New Users Today',
            value: statsData?.new_users_today || '0',
            change: 'Growth',
            icon: UserPlus,
            color: 'text-cyan-600',
            bg: 'bg-cyan-100'
        },
    ]

    if (loading) {
        return <div className="p-6 text-center text-gray-500">Loading dashboard...</div>
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 font-display">Dashboard Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</h3>
                            <span className="text-xs font-medium text-green-600 mt-1 block">{stat.change}</span>
                        </div>
                        <div className={`p-3 rounded-lg ${stat.bg}`}>
                            <stat.icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Daily User Logins Chart Card */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Daily User Logins (Last 14 Days)</h2>
                            <p className="text-sm text-gray-500 mt-1">
                                User engagement bulan ini:{' '}
                                <span className="relative group inline-block">
                                    <span className={`font-semibold cursor-help border-b border-dashed ${engagementChange >= 0 ? 'text-green-600 border-green-400' : 'text-red-600 border-red-400'}`}>
                                        {engagementPercentage}% ({engagementChange >= 0 ? '+' : ''}{engagementChange}%)
                                    </span>
                                    <span className="invisible group-hover:visible absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg">
                                        <span className="font-semibold block mb-1">📊 Detail Perhitungan</span>
                                        <span className="block">User aktif bulan ini: <b>{engagementDetail.activeThisMonth}</b></span>
                                        <span className="block">Total user terdaftar: <b>{engagementDetail.totalUsers}</b></span>
                                        <span className="block mt-1 border-t border-gray-700 pt-1">Engagement = {engagementDetail.activeThisMonth} / {engagementDetail.totalUsers} × 100% = <b>{engagementPercentage}%</b></span>
                                        <span className="block mt-1 text-gray-400">Perubahan dari bulan lalu: {engagementChange >= 0 ? '+' : ''}{engagementChange}%</span>
                                        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></span>
                                    </span>
                                </span>
                            </p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <TrendingUp className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={loginChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6B7280', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6B7280', fontSize: 12 }}
                                />
                                <Tooltip
                                    labelFormatter={(label) => `Tanggal: ${label}`}
                                    labelStyle={{ color: '#111827', fontWeight: 600 }}
                                    formatter={(value) => [value, 'User Logins']}
                                    cursor={{ fill: '#F3F4F6' }}
                                    contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Bar
                                    dataKey="logins"
                                    fill="#3B82F6"
                                    radius={[4, 4, 0, 0]}
                                    barSize={32}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Daily New Users Chart Card */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">New Users (Last 14 Days)</h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Growth dari bulan lalu:{' '}
                                <span className="relative group inline-block">
                                    <span className={`font-semibold cursor-help border-b border-dashed ${growthPercentage >= 0 ? 'text-green-600 border-green-400' : 'text-red-600 border-red-400'}`}>
                                        {growthPercentage >= 0 ? '+' : ''}{growthPercentage}%
                                    </span>
                                    <span className="invisible group-hover:visible absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg">
                                        <span className="font-semibold block mb-1">📊 Detail Perhitungan</span>
                                        <span className="block">User baru bulan ini: <b>{growthDetail.newThisMonth}</b></span>
                                        <span className="block">User baru bulan lalu: <b>{growthDetail.newLastMonth}</b></span>
                                        <span className="block mt-1 border-t border-gray-700 pt-1">
                                            Growth = ({growthDetail.newThisMonth} - {growthDetail.newLastMonth}) / {growthDetail.newLastMonth || 1} × 100% = <b>{growthPercentage >= 0 ? '+' : ''}{growthPercentage}%</b>
                                        </span>
                                        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></span>
                                    </span>
                                </span>
                            </p>
                        </div>
                        <div className="p-3 bg-cyan-50 rounded-lg">
                            <UserPlus className="w-6 h-6 text-cyan-600" />
                        </div>
                    </div>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={newUserChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6B7280', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6B7280', fontSize: 12 }}
                                />
                                <Tooltip
                                    labelFormatter={(label) => `Tanggal: ${label}`}
                                    labelStyle={{ color: '#111827', fontWeight: 600 }}
                                    formatter={(value) => [value, 'User Baru']}
                                    cursor={{ fill: '#F3F4F6' }}
                                    contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Bar
                                    dataKey="users"
                                    fill="#06B6D4"
                                    radius={[4, 4, 0, 0]}
                                    barSize={32}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h2>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto">
                        {recentActivity.length > 0 ? (
                            recentActivity.map((log) => (
                                <div key={log.id} className="flex items-center gap-4 py-2 border-b border-gray-100 last:border-0">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                                        {log.user_avatar ? (
                                            <img src={log.user_avatar} alt={log.user_name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-xs font-bold text-gray-500">{log.user_name?.charAt(0).toUpperCase()}</span>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{log.description}</p>
                                        <p className="text-xs text-gray-500">{new Date(log.created_at).toLocaleString()}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500 text-center py-4">No recent activity.</p>
                        )}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">System Status</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Server Load (Memory)</span>
                            <span className={`text-sm font-medium ${(statsData?.server_load || 0) > 90 ? 'text-red-600' :
                                (statsData?.server_load || 0) > 70 ? 'text-yellow-600' : 'text-green-600'
                                }`}>
                                {statsData?.server_load ? `${statsData.server_load}%` : 'Calculating...'}
                            </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                            <div
                                className={`h-2 rounded-full transition-all duration-500 ${(statsData?.server_load || 0) > 90 ? 'bg-red-500' :
                                    (statsData?.server_load || 0) > 70 ? 'bg-yellow-500' : 'bg-green-500'
                                    }`}
                                style={{ width: `${statsData?.server_load || 0}%` }}
                            ></div>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                            <span className="text-sm text-gray-600">Database Usage</span>
                            <span className={`text-sm font-medium ${(statsData?.db_usage || 0) > 90 ? 'text-red-600' :
                                (statsData?.db_usage || 0) > 70 ? 'text-yellow-600' : 'text-blue-600'
                                }`}>
                                {statsData?.db_usage || 0}% {statsData?.db_size_mb ? `(${statsData.db_size_mb} MB / ${statsData.db_max_mb} MB)` : ''}
                            </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                            <div
                                className={`h-2 rounded-full transition-all duration-500 ${(statsData?.db_usage || 0) > 90 ? 'bg-red-500' :
                                    (statsData?.db_usage || 0) > 70 ? 'bg-yellow-500' : 'bg-blue-500'
                                    }`}
                                style={{ width: `${statsData?.db_usage || 0}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
