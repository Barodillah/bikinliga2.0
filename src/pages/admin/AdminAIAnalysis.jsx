import React, { useState, useEffect, useRef } from 'react'
import { Send, Bot, User, Clock, MoreVertical, Search, MessageSquare, Trash2, Loader2, Plus } from 'lucide-react'
import { api } from '../../utils/api'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function AdminAIAnalysis() {
    const [input, setInput] = useState('')
    const [messages, setMessages] = useState([])
    const [history, setHistory] = useState([])
    const [sessionId, setSessionId] = useState(null)
    const [loading, setLoading] = useState(false)
    const [historyLoading, setHistoryLoading] = useState(true)
    const messagesEndRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    useEffect(() => {
        fetchHistory()
    }, [])

    const fetchHistory = async () => {
        try {
            const res = await api.get('/api/admin/ai/history')
            if (res.success || (res.data && res.data.success)) {
                setHistory(res.data.data || res.data)
            }
        } catch (error) {
            console.error('Failed to fetch history:', error)
        } finally {
            setHistoryLoading(false)
        }
    }

    const loadSession = async (id) => {
        try {
            setLoading(true)
            const res = await api.get(`/api/admin/ai/session/${id}`)
            if (res.success || (res.data && res.data.success)) {
                const sessionData = res.data.data || res.data
                setMessages(sessionData.messages || [])
                setSessionId(sessionData.id)
            }
        } catch (error) {
            console.error('Failed to load session:', error)
        } finally {
            setLoading(false)
        }
    }

    const deleteSession = async (e, id) => {
        e.stopPropagation()
        if (!window.confirm('Are you sure you want to delete this chat?')) return

        try {
            await api.delete(`/api/admin/ai/session/${id}`)
            setHistory(prev => prev.filter(item => item.id !== id))
            if (sessionId === id) {
                handleNewChat()
            }
        } catch (error) {
            console.error('Failed to delete session:', error)
        }
    }

    const handleNewChat = () => {
        setSessionId(null)
        setMessages([])
        setInput('')
    }

    const handleSend = async () => {
        if (!input.trim() || loading) return

        const userMessage = {
            role: 'user',
            content: input,
            timestamp: new Date().toISOString()
        }

        setMessages(prev => [...prev, userMessage])
        setInput('')
        setLoading(true)

        try {
            const res = await api.post('/api/admin/ai/analyze', {
                message: userMessage.content,
                sessionId: sessionId
            })

            if (res.success || (res.data && res.data.success)) {
                const data = res.data.data || res.data

                // Add AI response
                const aiMessage = {
                    role: 'assistant',
                    content: data.response,
                    timestamp: new Date().toISOString()
                }
                setMessages(prev => [...prev, aiMessage])

                // Update Session ID if new
                if (!sessionId && data.sessionId) {
                    setSessionId(data.sessionId)
                    fetchHistory() // Refresh history to show new title
                }
            } else {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: 'Error: Failed to get response from AI.',
                    timestamp: new Date().toISOString()
                }])
            }
        } catch (error) {
            console.error('AI Error:', error)
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Error: Something went wrong. Please check your connection or API key.',
                timestamp: new Date().toISOString()
            }])
        } finally {
            setLoading(false)
        }
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
                                <span className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></span>
                                <p className="text-xs text-gray-500">{loading ? 'Thinking...' : 'Online & Ready'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4">
                            <Bot className="w-16 h-16 opacity-20" />
                            <p>Start a new conversation with the AI Assistant</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-lg w-full">
                                <button onClick={() => setInput("Ringkasan statistik user hari ini")} className="p-3 bg-white border border-gray-200 rounded-lg text-sm hover:border-indigo-300 hover:text-indigo-600 transition text-left">
                                    "Ringkasan statistik user hari ini"
                                </button>
                                <button onClick={() => setInput("Berapa total pendapatan bulan ini?")} className="p-3 bg-white border border-gray-200 rounded-lg text-sm hover:border-indigo-300 hover:text-indigo-600 transition text-left">
                                    "Berapa total pendapatan bulan ini?"
                                </button>
                                <button onClick={() => setInput("Saran untuk meningkatkan jumlah turnamen")} className="p-3 bg-white border border-gray-200 rounded-lg text-sm hover:border-indigo-300 hover:text-indigo-600 transition text-left">
                                    "Saran untuk meningkatkan jumlah turnamen"
                                </button>
                                <button onClick={() => setInput("Analisa performa server")} className="p-3 bg-white border border-gray-200 rounded-lg text-sm hover:border-indigo-300 hover:text-indigo-600 transition text-left">
                                    "Analisa performa server"
                                </button>
                            </div>
                        </div>
                    )}

                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-gray-900 text-white' : 'bg-indigo-100 text-indigo-600'
                                    }`}>
                                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                </div>
                                <div className={`p-4 rounded-2xl shadow-sm ${msg.role === 'user'
                                    ? 'bg-gray-900 text-white rounded-tr-none'
                                    : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                                    }`}>
                                    <div className={`prose ${msg.role === 'user' ? 'prose-invert' : ''} max-w-none text-sm leading-relaxed`}>
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {msg.content}
                                        </ReactMarkdown>
                                    </div>
                                    <p className={`text-[10px] mt-2 ${msg.role === 'user' ? 'text-gray-400' : 'text-gray-400'}`}>
                                        {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
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
                            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition placeholder-gray-400 text-gray-900"
                            disabled={loading}
                        />
                        <button
                            onClick={handleSend}
                            disabled={loading || !input.trim()}
                            className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
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
                    {historyLoading ? (
                        <div className="text-center py-4 text-gray-400 text-xs">Loading history...</div>
                    ) : history.length === 0 ? (
                        <div className="text-center py-4 text-gray-400 text-xs">No history yet</div>
                    ) : (
                        history.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => loadSession(item.id)}
                                className={`p-3 rounded-lg cursor-pointer group transition border border-transparent hover:border-gray-100 ${sessionId === item.id ? 'bg-indigo-50 border-indigo-100' : 'hover:bg-gray-50'}`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className={`font-medium text-sm line-clamp-1 ${sessionId === item.id ? 'text-indigo-700' : 'text-gray-900'}`}>{item.title || 'New Chat'}</h4>
                                    <span className="text-[10px] text-gray-400 whitespace-nowrap">
                                        {new Date(item.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 line-clamp-2">{item.preview}</p>
                                <div className="mt-2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition">
                                    <span className="text-[10px] text-indigo-600 font-medium">Open</span>
                                    <button
                                        className="text-gray-400 hover:text-red-500 p-1"
                                        onClick={(e) => deleteSession(e, item.id)}
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-4 border-t border-gray-200 bg-gray-50">
                    <button
                        onClick={handleNewChat}
                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm transition shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        New Chat
                    </button>
                </div>
            </div>
        </div>
    )
}
