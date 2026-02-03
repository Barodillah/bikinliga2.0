import React, { useState, useEffect } from 'react'
import { Search, MessageSquare, MoreVertical, Send, CheckCircle, Clock, Loader2, RefreshCw, Bot, User, MessageCircle } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Helper to get auth headers
function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
}

// Helper function to format relative time
function formatRelativeTime(date) {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Baru saja';
    if (minutes < 60) return `${minutes} menit lalu`;
    if (hours < 24) return `${hours} jam lalu`;
    if (days < 7) return `${days} hari lalu`;
    return new Date(date).toLocaleDateString('id-ID');
}

// Helper function to get initials
function getInitials(name) {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export default function AdminComplaint() {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [chatMessages, setChatMessages] = useState([]);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [filter, setFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [updating, setUpdating] = useState(false);

    // Fetch complaints on mount
    useEffect(() => {
        fetchComplaints();
    }, []);

    // Fetch chat messages when selected ticket changes and has session id
    useEffect(() => {
        if (selectedTicket?.chat_sessions_id) {
            fetchChatMessages(selectedTicket.id);
        } else {
            setChatMessages([]);
        }
    }, [selectedTicket?.id]);

    const fetchComplaints = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/complaints`, {
                credentials: 'include',
                headers: getAuthHeaders()
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    // Transform data to match UI expectations
                    const transformed = data.data.map(c => ({
                        id: c.id,
                        user: c.user_name || c.username || 'Anonymous',
                        email: c.email,
                        avatar: getInitials(c.user_name || c.username),
                        avatar_url: c.avatar_url,
                        subject: c.subject,
                        preview: c.message.slice(0, 100) + (c.message.length > 100 ? '...' : ''),
                        message: c.message,
                        status: c.status === 'open' ? 'Open' :
                            c.status === 'in_progress' ? 'In Progress' :
                                c.status === 'resolved' ? 'Resolved' : 'Closed',
                        rawStatus: c.status,
                        source: c.source,
                        chat_sessions_id: c.chat_sessions_id,
                        time: formatRelativeTime(c.created_at),
                        created_at: c.created_at,
                        admin_notes: c.admin_notes,
                        unread: c.status === 'open'
                    }));
                    setComplaints(transformed);
                }
            }
        } catch (error) {
            console.error('Failed to fetch complaints:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchChatMessages = async (complaintId) => {
        setLoadingMessages(true);
        try {
            const response = await fetch(`${API_URL}/complaints/${complaintId}/messages`, {
                credentials: 'include',
                headers: getAuthHeaders()
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setChatMessages(data.data);
                }
            }
        } catch (error) {
            console.error('Failed to fetch chat messages:', error);
        } finally {
            setLoadingMessages(false);
        }
    };

    const updateStatus = async (ticketId, newStatus) => {
        setUpdating(true);
        try {
            const response = await fetch(`${API_URL}/complaints/${ticketId}`, {
                method: 'PUT',
                credentials: 'include',
                headers: getAuthHeaders(),
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                await fetchComplaints();
                // Update selected ticket if it's the one being modified
                if (selectedTicket?.id === ticketId) {
                    const updated = complaints.find(c => c.id === ticketId);
                    if (updated) {
                        setSelectedTicket({
                            ...updated,
                            status: newStatus === 'open' ? 'Open' :
                                newStatus === 'in_progress' ? 'In Progress' :
                                    newStatus === 'resolved' ? 'Resolved' : 'Closed',
                            rawStatus: newStatus,
                            chat_sessions_id: updated.chat_sessions_id // Preserve this
                        });
                    }
                }
            }
        } catch (error) {
            console.error('Failed to update status:', error);
        } finally {
            setUpdating(false);
        }
    };

    // Filter complaints
    const filteredComplaints = complaints.filter(ticket => {
        const matchesFilter = filter === 'All' ||
            (filter === 'Open' && ticket.rawStatus === 'open') ||
            (filter === 'Resolved' && ticket.rawStatus === 'resolved');
        const matchesSearch = searchQuery === '' ||
            ticket.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ticket.message.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    return (
        <div className="flex h-[calc(100vh-8rem)] gap-6">
            {/* Ticket List (Left Column) */}
            <div className={`flex flex-col w-full lg:w-1/3 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden ${selectedTicket ? 'hidden lg:flex' : 'flex'}`}>
                {/* Header & Search */}
                <div className="p-4 border-b border-gray-200 space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-bold text-gray-900 font-display">Complaints</h2>
                            <button
                                onClick={fetchComplaints}
                                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                                title="Refresh"
                            >
                                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                        <div className="flex gap-1">
                            {['All', 'Open', 'Resolved'].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-3 py-1 rounded-full text-xs font-medium transition ${filter === f
                                        ? 'bg-gray-900 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari keluhan..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neonGreen/20 focus:border-neonGreen transition"
                        />
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
                    {loading ? (
                        <div className="flex items-center justify-center h-40">
                            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                        </div>
                    ) : filteredComplaints.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                            <MessageSquare className="w-8 h-8 mb-2 opacity-50" />
                            <p className="text-sm">Tidak ada keluhan</p>
                        </div>
                    ) : (
                        filteredComplaints.map((ticket) => (
                            <div
                                key={ticket.id}
                                onClick={() => setSelectedTicket(ticket)}
                                className={`p-4 cursor-pointer transition hover:bg-gray-50 ${selectedTicket?.id === ticket.id ? 'bg-blue-50/50 border-l-4 border-blue-500' : 'border-l-4 border-transparent'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <div className="flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${ticket.unread ? 'bg-blue-500' : 'bg-transparent'}`}></span>
                                        <span className="font-medium text-gray-900 text-sm truncate">{ticket.user}</span>
                                        {ticket.source === 'chatbot' && (
                                            <Bot className="w-3 h-3 text-neonGreen" title="Dari MinLiga" />
                                        )}
                                    </div>
                                    <span className="text-xs text-gray-400 whitespace-nowrap">{ticket.time}</span>
                                </div>
                                <h3 className={`text-sm mb-1 truncate ${ticket.unread ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                                    {ticket.subject}
                                </h3>
                                <p className="text-xs text-gray-500 line-clamp-2">{ticket.preview}</p>
                                <div className="mt-2 flex items-center gap-2">
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${ticket.status === 'Open' ? 'bg-green-100 text-green-700' :
                                        ticket.status === 'In Progress' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-gray-100 text-gray-600'
                                        }`}>
                                        {ticket.status}
                                    </span>
                                    <span className="text-[10px] text-gray-400">#{ticket.id.slice(0, 8)}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Detail (Right Column) */}
            <div className={`flex flex-col flex-1 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden ${!selectedTicket ? 'hidden lg:flex' : 'flex'}`}>
                {selectedTicket ? (
                    <>
                        {/* Header */}
                        <div className="h-16 px-6 border-b border-gray-200 flex items-center justify-between bg-white flex-shrink-0">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setSelectedTicket(null)}
                                    className="lg:hidden p-1 -ml-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                {selectedTicket.avatar_url ? (
                                    <img
                                        src={selectedTicket.avatar_url}
                                        alt={selectedTicket.user}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                                        {selectedTicket.avatar}
                                    </div>
                                )}
                                <div>
                                    <h3 className="font-bold text-gray-900 text-sm">{selectedTicket.user}</h3>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span>{selectedTicket.email || 'No email'}</span>
                                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                        <span className={selectedTicket.status === 'Open' ? 'text-green-600 font-medium' : ''}>{selectedTicket.status}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {/* Status update buttons */}
                                {selectedTicket.rawStatus === 'open' && (
                                    <button
                                        onClick={() => updateStatus(selectedTicket.id, 'in_progress')}
                                        disabled={updating}
                                        className="px-3 py-1.5 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition disabled:opacity-50"
                                    >
                                        Proses
                                    </button>
                                )}
                                {(selectedTicket.rawStatus === 'open' || selectedTicket.rawStatus === 'in_progress') && (
                                    <button
                                        onClick={() => updateStatus(selectedTicket.id, 'resolved')}
                                        disabled={updating}
                                        className="px-3 py-1.5 text-xs font-medium bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition disabled:opacity-50"
                                    >
                                        <CheckCircle className="w-3.5 h-3.5 inline mr-1" />
                                        Selesai
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-6 overflow-y-auto bg-gray-50/50 space-y-6">
                            {/* Date Separator */}
                            <div className="flex justify-center">
                                <span className="text-xs font-medium text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                                    {new Date(selectedTicket.created_at).toLocaleDateString('id-ID', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </span>
                            </div>

                            {/* Subject */}
                            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                                <h4 className="font-bold text-gray-900 mb-2">{selectedTicket.subject}</h4>
                                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{selectedTicket.message}</p>
                                {selectedTicket.source === 'chatbot' && (
                                    <div className="mt-3 flex items-center gap-1.5 text-xs text-neonGreen">
                                        <Bot className="w-3.5 h-3.5" />
                                        <span>Dikirim melalui MinLiga AI</span>
                                    </div>
                                )}
                            </div>

                            {/* Chat History */}
                            {selectedTicket.chat_sessions_id && (
                                <div className="mt-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <MessageCircle className="w-4 h-4 text-gray-400" />
                                        <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Riwayat Chat User</h5>
                                    </div>

                                    {loadingMessages ? (
                                        <div className="flex items-center justify-center p-4">
                                            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                                        </div>
                                    ) : chatMessages.length > 0 ? (
                                        <div className="space-y-4 bg-white rounded-xl p-4 border border-gray-200">
                                            {chatMessages.map((msg) => (
                                                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`flex gap-3 max-w-[90%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user'
                                                            ? 'bg-blue-100 text-blue-600'
                                                            : 'bg-green-100 text-green-600'
                                                            }`}>
                                                            {msg.role === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                                                        </div>
                                                        <div className={`p-3 rounded-2xl text-sm ${msg.role === 'user'
                                                            ? 'bg-blue-50 text-blue-900 rounded-tr-none'
                                                            : 'bg-gray-50 text-gray-700 rounded-tl-none'
                                                            }`}>
                                                            <div className="whitespace-pre-wrap">{msg.content}</div>
                                                            <div className={`text-[10px] mt-1 opacity-50 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                                                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center p-4 text-xs text-gray-400 italic">
                                            Riwayat chat tidak tersedia
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Admin Notes */}
                            {selectedTicket.admin_notes && (
                                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                                    <h5 className="text-xs font-medium text-blue-700 mb-1">Catatan Admin</h5>
                                    <p className="text-sm text-blue-900">{selectedTicket.admin_notes}</p>
                                </div>
                            )}
                        </div>

                        {/* Info Footer */}
                        <div className="p-4 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
                            <div className="flex items-center justify-between">
                                <span>ID: {selectedTicket.id}</span>
                                <span>
                                    {new Date(selectedTicket.created_at).toLocaleString('id-ID')}
                                </span>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                        <MessageSquare className="w-16 h-16 mb-4 opacity-50" />
                        <p className="text-lg font-medium">Pilih keluhan untuk melihat detail</p>
                    </div>
                )}
            </div>
        </div>
    )
}
