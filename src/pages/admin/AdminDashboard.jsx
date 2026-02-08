import React, { useState, useEffect } from 'react'
import { Users, AlertCircle, TrendingUp, Activity, Trophy, Swords, CreditCard, UserPlus } from 'lucide-react'
import { api } from '../../utils/api'

export default function AdminDashboard() {
    const [statsData, setStatsData] = useState(null)
    const [recentActivity, setRecentActivity] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, historyRes] = await Promise.all([
                    api.get('/api/admin/dashboard-stats'),
                    api.get('/api/admin/history')
                ])

                if (statsRes.success) {
                    setStatsData(statsRes.data)
                } else if (statsRes.data && statsRes.data.success) {
                    // Handle case where api.get returns full response or just data
                    // reliable api.js returns res.json() so it should be the body
                    setStatsData(statsRes.data.data)
                } else {
                    // Fallback if structure is different
                    setStatsData(statsRes.data || statsRes)
                }

                if (historyRes.success) {
                    setRecentActivity(historyRes.data.slice(0, 10))
                } else if (historyRes.data && historyRes.data.success) {
                    setRecentActivity(historyRes.data.data.slice(0, 10))
                } else {
                    setRecentActivity(historyRes.data || historyRes)
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    const stats = [
        {
            title: 'Total Users',
            value: statsData?.total_users || '0',
            change: 'Active',
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
            value: `IDR ${(statsData?.total_revenue || 0).toLocaleString()}`,
            change: 'Lifetime',
            icon: TrendingUp,
            color: 'text-emerald-600',
            bg: 'bg-emerald-100'
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
                            <span className="text-sm font-medium text-blue-600">{statsData?.db_usage || 0}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${statsData?.db_usage || 0}%` }}></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
