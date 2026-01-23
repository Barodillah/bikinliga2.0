import React from 'react'
import { Clock } from 'lucide-react'

export default function AdminHistory() {
    const history = [
        { id: 1, action: 'User Login', user: 'John Doe', time: '2 mins ago' },
        { id: 2, action: 'Tournament Created', user: 'Jane Smith', time: '1 hour ago' },
        { id: 3, action: 'TopUp Success', user: 'Bob Johnson', time: '3 hours ago' },
    ]

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 font-display">System History</h1>
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
                <div className="divide-y divide-gray-200">
                    {history.map((item) => (
                        <div key={item.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition">
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                <Clock className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900">{item.action} by <span className="font-bold">{item.user}</span></p>
                                <p className="text-xs text-gray-500">{item.time}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
