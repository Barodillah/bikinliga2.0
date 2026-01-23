import React, { useState } from 'react'
import { ArrowUpRight, ArrowDownLeft, Wallet, Search, Filter, Download, Users, Activity, Banknote } from 'lucide-react'

const mockTopUpHistory = [
    { id: 'TRX-001', user: 'John Doe', amount: 500, nominal: 75000, method: 'BCA VA', date: '2023-10-25 14:30', status: 'Success' },
    { id: 'TRX-002', user: 'Sarah Smith', amount: 1000, nominal: 150000, method: 'GoPay', date: '2023-10-25 10:15', status: 'Pending' },
    { id: 'TRX-003', user: 'Mike Ross', amount: 250, nominal: 37500, method: 'OVO', date: '2023-10-24 18:45', status: 'Success' },
    { id: 'TRX-004', user: 'Rachel Green', amount: 500, nominal: 75000, method: 'BCA VA', date: '2023-10-24 09:20', status: 'Failed' },
    { id: 'TRX-005', user: 'Monica Geller', amount: 100, nominal: 15000, method: 'Dana', date: '2023-10-23 16:10', status: 'Success' },
]

const stats = [
    { title: 'Total Pendapatan', value: 'Rp 125.000.000', change: '+12.5%', icon: Banknote, color: 'text-green-600', bg: 'bg-green-100' },
    { title: 'Total Transaksi', value: '1,429', change: '+8.2%', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'Rata-rata Nilai', value: 'Rp 85.000', change: '-2.4%', icon: Wallet, color: 'text-purple-600', bg: 'bg-purple-100' },
    { title: 'Pembayar Aktif', value: '892', change: '+5.7%', icon: Users, color: 'text-orange-600', bg: 'bg-orange-100' },
]

const mockCoinUsage = [
    { id: 'USG-001', user: 'John Doe', action: 'Create Tournament', detail: 'MLBB Season 5', amount: 100, date: '2023-10-26 08:00' },
    { id: 'USG-002', user: 'Mike Ross', action: 'Join Tournament', detail: 'Pubg Fast Cup', amount: 50, date: '2023-10-25 20:00' },
    { id: 'USG-003', user: 'Chandler Bing', action: 'Boost Tournament', detail: 'Valorant Pro', amount: 20, date: '2023-10-25 15:30' },
    { id: 'USG-004', user: 'Joey Tribbiani', action: 'Create Community', detail: 'Friends Gaming', amount: 200, date: '2023-10-24 12:45' },
    { id: 'USG-005', user: 'Phoebe Buffay', action: 'Join Tournament', detail: 'Magic Chess Cup', amount: 50, date: '2023-10-23 10:00' },
]

export default function AdminTransaction() {
    const [activeTab, setActiveTab] = useState('topup')

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
                            <span className={`text-xs font-medium ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                                {stat.change} <span className="text-gray-400 font-normal">vs last month</span>
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
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg border border-gray-200">
                        <Download className="w-4 h-4" />
                    </button>
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
                            {mockTopUpHistory.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.id}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">{item.user}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{item.method}</td>
                                    <td className="px-6 py-4 text-xs text-gray-400">{item.date}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                                        Rp {item.nominal.toLocaleString('id-ID')}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-gray-900">
                                        <div className="flex items-center gap-1">
                                            <img src="/coin.png" alt="Coin" className="w-4 h-4" />
                                            {item.amount}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${item.status === 'Success' ? 'bg-green-100 text-green-700' :
                                            item.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                            {item.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
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
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg border border-gray-200">
                        <Download className="w-4 h-4" />
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-medium">
                            <tr>
                                <th className="px-6 py-3">Usage ID</th>
                                <th className="px-6 py-3">User</th>
                                <th className="px-6 py-3">Action</th>
                                <th className="px-6 py-3">Detail</th>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {mockCoinUsage.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.id}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">{item.user}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{item.action}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500 italic">{item.detail}</td>
                                    <td className="px-6 py-4 text-xs text-gray-400">{item.date}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-red-600">
                                        <div className="flex items-center gap-1">
                                            -<img src="/coin.png" alt="Coin" className="w-4 h-4" />
                                            {item.amount}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div >
    )
}
