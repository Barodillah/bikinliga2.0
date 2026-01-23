import React, { useState } from 'react'
import { Search, Filter, MessageSquare, MoreVertical, Send, Paperclip, CheckCircle, Clock } from 'lucide-react'

const mockTickets = [
    {
        id: 'T-1001',
        user: 'John Doe',
        avatar: 'JD',
        subject: 'Cannot top up coins',
        preview: 'I tried to top up using BCA VA but it failed...',
        status: 'Open',
        priority: 'High',
        time: '5 mins ago',
        unread: true,
        messages: [
            { id: 1, sender: 'John Doe', text: 'I tried to top up using BCA VA but it failed multiple times. Can you help?', time: '10:30 AM', isUser: true },
            { id: 2, sender: 'Admin', text: 'Hi John, sorry to hear that. Can you provide the transaction ID?', time: '10:32 AM', isUser: false },
        ]
    },
    {
        id: 'T-1002',
        user: 'Sarah Smith',
        avatar: 'SS',
        subject: 'Tournament registration issue',
        preview: 'My team cannot join the MLBB tournament...',
        status: 'In Progress',
        priority: 'Medium',
        time: '1 hour ago',
        unread: false,
        messages: [
            { id: 1, sender: 'Sarah Smith', text: 'My team cannot join the MLBB tournament. It says "Team Full" but we only have 4 members.', time: '09:00 AM', isUser: true },
        ]
    },
    {
        id: 'T-1003',
        user: 'Mike Ross',
        avatar: 'MR',
        subject: 'Withdrawal delay',
        preview: 'It has been 3 days since I requested withdrawal...',
        status: 'Resolved',
        priority: 'Low',
        time: '1 day ago',
        unread: false,
        messages: [
            { id: 1, sender: 'Mike Ross', text: 'It has been 3 days since I requested withdrawal. When will it be processed?', time: 'Yesterday', isUser: true },
            { id: 2, sender: 'Admin', text: 'Hi Mike, your withdrawal has been processed this morning. Please check your account.', time: 'Yesterday', isUser: false },
        ]
    },
]

export default function AdminComplaint() {
    const [selectedTicket, setSelectedTicket] = useState(mockTickets[0])
    const [filter, setFilter] = useState('All')

    return (
        <div className="flex h-[calc(100vh-8rem)] gap-6">
            {/* Ticket List (Left Column) */}
            <div className={`flex flex-col w-full lg:w-1/3 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden ${selectedTicket ? 'hidden lg:flex' : 'flex'}`}>
                {/* Header & Search */}
                <div className="p-4 border-b border-gray-200 space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-900 font-display">Tickets</h2>
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
                            placeholder="Search tickets..."
                            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neonGreen/20 focus:border-neonGreen transition"
                        />
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
                    {mockTickets.map((ticket) => (
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
                                <span className="text-[10px] text-gray-400">#{ticket.id}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Detail (Right Column) */}
            <div className={`flex flex-col flex-1 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden ${!selectedTicket ? 'hidden lg:flex' : 'flex'}`}>
                {selectedTicket ? (
                    <>
                        {/* Chat Header */}
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
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                                    {selectedTicket.avatar}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-sm">{selectedTicket.user}</h3>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span>Ticket #{selectedTicket.id}</span>
                                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                        <span className={selectedTicket.status === 'Open' ? 'text-green-600 font-medium' : ''}>{selectedTicket.status}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition">
                                    <CheckCircle className="w-5 h-5" />
                                </button>
                                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition">
                                    <MoreVertical className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Chat Messages */}
                        <div className="flex-1 p-6 overflow-y-auto bg-gray-50/50 space-y-6">
                            {/* Date Separator */}
                            <div className="flex justify-center">
                                <span className="text-xs font-medium text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                                    Today
                                </span>
                            </div>

                            {selectedTicket.messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.isUser ? 'justify-start' : 'justify-end'}`}>
                                    <div className={`max-w-[80%] lg:max-w-[70%] ${msg.isUser ? 'order-2 ml-3' : 'order-1 mr-3'}`}>
                                        <div className={`p-4 rounded-2xl text-sm leading-relaxed ${msg.isUser
                                                ? 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm'
                                                : 'bg-gray-900 text-white rounded-tr-none shadow-md'
                                            }`}>
                                            {msg.text}
                                        </div>
                                        <div className={`mt-1 flex items-center gap-1 text-[10px] text-gray-400 ${msg.isUser ? 'justify-start' : 'justify-end'}`}>
                                            <span>{msg.time}</span>
                                            {!msg.isUser && <Clock className="w-3 h-3" />}
                                        </div>
                                    </div>
                                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${msg.isUser
                                            ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white order-1'
                                            : 'bg-gray-200 text-gray-600 order-2'
                                        }`}>
                                        {msg.isUser ? selectedTicket.avatar : 'A'}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-gray-200">
                            <div className="flex items-end gap-3 max-w-4xl mx-auto">
                                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition">
                                    <Paperclip className="w-5 h-5" />
                                </button>
                                <div className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl p-3 focus-within:ring-2 focus-within:ring-gray-900/10 focus-within:border-gray-300 transition">
                                    <textarea
                                        placeholder="Type your reply..."
                                        rows={1}
                                        className="w-full bg-transparent border-none text-sm text-gray-900 placeholder-gray-500 focus:outline-none resize-none max-h-32"
                                        style={{ minHeight: '24px' }}
                                    />
                                </div>
                                <button className="p-3 bg-gray-900 text-white rounded-full hover:bg-gray-800 shadow-lg hover:shadow-xl transition transform hover:-translate-y-1">
                                    <Send className="w-5 h-5 ml-0.5" />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                        <MessageSquare className="w-16 h-16 mb-4 opacity-50" />
                        <p className="text-lg font-medium">Select a ticket to view details</p>
                    </div>
                )}
            </div>
        </div>
    )
}
