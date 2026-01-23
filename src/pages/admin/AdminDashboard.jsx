import React from 'react'
import { Users, AlertCircle, TrendingUp, Activity } from 'lucide-react'

export default function AdminDashboard() {
    const stats = [
        { title: 'Total Users', value: '1,234', change: '+12%', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
        { title: 'Active Complaints', value: '5', change: '-2', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100' },
        { title: 'Total Revenue', value: 'IDR 15.4M', change: '+8%', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-100' },
        { title: 'System Health', value: '98%', change: 'Stable', icon: Activity, color: 'text-purple-600', bg: 'bg-purple-100' },
    ]

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 font-display">Dashboard Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</h3>
                            <span className="text-xs font-medium text-green-600 mt-1 block">{stat.change} from last month</span>
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
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center gap-4 py-2 border-b border-gray-100 last:border-0">
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500">
                                    U{i}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">User updated tournament settings</p>
                                    <p className="text-xs text-gray-500">2 minutes ago</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">System Status</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Server Load</span>
                            <span className="text-sm font-medium text-green-600">Normal (24%)</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{ width: '24%' }}></div>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                            <span className="text-sm text-gray-600">Database Usage</span>
                            <span className="text-sm font-medium text-blue-600">45%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
