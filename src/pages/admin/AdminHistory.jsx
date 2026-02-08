import React, { useState, useEffect } from 'react'
import { Clock, Loader2, AlertCircle } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

export default function AdminHistory() {
    const [history, setHistory] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const { token } = useAuth()

    useEffect(() => {
        fetchHistory()
    }, [])

    const fetchHistory = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/history`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            const data = await response.json()

            if (data.success) {
                setHistory(data.data)
            } else {
                setError(data.message)
            }
        } catch (err) {
            setError('Failed to fetch history')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-green-500" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center gap-2 p-4 text-red-700 bg-red-100 rounded-lg">
                <AlertCircle className="w-5 h-5" />
                <p>{error}</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 font-display">System History</h1>
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="divide-y divide-gray-200">
                    {history.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            No history logs found.
                        </div>
                    ) : (
                        history.map((item) => (
                            <div key={item.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition">
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                                    {item.user_avatar ? (
                                        <img src={item.user_avatar} alt={item.user_name} className="w-10 h-10 rounded-full object-cover" />
                                    ) : (
                                        <Clock className="w-5 h-5" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">
                                        <span className="text-blue-600 font-semibold">{item.action}</span> by <span className="font-bold">{item.user_name || item.user_email || 'Unknown User'}</span>
                                    </p>
                                    <p className="text-sm text-gray-600 mt-0.5">{item.description}</p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {new Date(item.created_at).toLocaleString('id-ID', {
                                            day: 'numeric', month: 'short', year: 'numeric',
                                            hour: '2-digit', minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
