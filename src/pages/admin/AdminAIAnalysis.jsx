import React, { useState } from 'react'
import { Send, Bot, User, Clock, MoreVertical, Search, MessageSquare, Trash2 } from 'lucide-react'

const mockMessages = [
    { id: 1, sender: 'ai', text: 'Halo! Saya AI Assistant Admin. Ada yang bisa saya bantu terkait data transaksi atau user hari ini?', time: '10:00 AM' },
    { id: 2, sender: 'user', text: 'Tolong tampilkan analisa pendapatan minggu ini.', time: '10:05 AM' },
    { id: 3, sender: 'ai', text: 'Berdasarkan data, pendapatan minggu ini meningkat 15% dibandingkan minggu lalu. Total pendapatan mencapai Rp 12.500.000. Grafik tren menunjukkan kenaikan signifikan di akhir pekan.', time: '10:06 AM' },
    { id: 4, sender: 'user', text: 'Bagaimana dengan user baru?', time: '10:08 AM' },
    { id: 5, sender: 'ai', text: 'Ada 120 user baru yang mendaftar minggu ini. 45 di antaranya sudah melakukan transaksi pertama.', time: '10:09 AM' },
]

const mockHistory = [
    { id: 1, title: 'Analisa Pendapatan Mingguan', date: 'Hari ini', preview: 'Pendapatan meningkat 15%...' },
    { id: 2, title: 'Cek Transaksi Mencurigakan', date: 'Kemarin', preview: 'Ditemukan 2 transaksi...' },
    { id: 3, title: 'Laporan User Churn', date: '21 Okt', preview: 'Rate churn turun 2%...' },
    { id: 4, title: 'Ide Turnamen Baru', date: '20 Okt', preview: 'Saran format turnamen...' },
    { id: 5, title: 'Evaluasi Server', date: '18 Okt', preview: 'Load server peak time...' },
]

export default function AdminAIAnalysis() {
    const [input, setInput] = useState('')
    const [messages, setMessages] = useState(mockMessages)

    const handleSend = () => {
        if (!input.trim()) return
        const newMessage = {
            id: messages.length + 1,
            sender: 'user',
            text: input,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
        setMessages([...messages, newMessage])
        setInput('')

        // Mock AI reply
        setTimeout(() => {
            setMessages(prev => [...prev, {
                id: prev.length + 1,
                sender: 'ai',
                text: 'Maaf, saya hanya demo saat ini. Fitur AI sebenarnya akan segera hadir!',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }])
        }, 1000)
    }

    return (
        <div className="h-[calc(100vh-100px)] flex gap-6">
            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                            <Bot className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="font-bold text-gray-900">Admin Assistant AI</h2>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                <p className="text-xs text-gray-500">Online & Ready</p>
                            </div>
                        </div>
                    </div>
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                        <MoreVertical className="w-5 h-5" />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex gap-3 max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.sender === 'user' ? 'bg-gray-900 text-white' : 'bg-indigo-100 text-indigo-600'
                                    }`}>
                                    {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                </div>
                                <div className={`p-4 rounded-2xl shadow-sm ${msg.sender === 'user'
                                        ? 'bg-gray-900 text-white rounded-tr-none'
                                        : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                                    }`}>
                                    <p className="text-sm leading-relaxed">{msg.text}</p>
                                    <p className={`text-[10px] mt-2 ${msg.sender === 'user' ? 'text-gray-400' : 'text-gray-400'
                                        }`}>{msg.time}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-gray-200">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Tanya sesuatu tentang data admin..."
                            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition placeholder-gray-400"
                        />
                        <button
                            onClick={handleSend}
                            className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Right Sidebar - History */}
            <div className="w-80 flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hidden lg:flex">
                <div className="p-4 border-b border-gray-200">
                    <h3 className="font-bold text-gray-900 mb-4">Chat History</h3>
                    <div className="relative">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Cari history..."
                            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {mockHistory.map((item) => (
                        <div key={item.id} className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer group transition border border-transparent hover:border-gray-100">
                            <div className="flex justify-between items-start mb-1">
                                <h4 className="font-medium text-sm text-gray-900 line-clamp-1">{item.title}</h4>
                                <span className="text-[10px] text-gray-400 whitespace-nowrap">{item.date}</span>
                            </div>
                            <p className="text-xs text-gray-500 line-clamp-2">{item.preview}</p>
                            <div className="mt-2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition">
                                <span className="text-[10px] text-indigo-600 font-medium">Lanjutkan Chat</span>
                                <button className="text-gray-400 hover:text-red-500">
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-4 border-t border-gray-200 bg-gray-50">
                    <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm transition shadow-sm">
                        <MessageSquare className="w-4 h-4" />
                        New Chat
                    </button>
                </div>
            </div>
        </div>
    )
}
