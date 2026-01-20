import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Maximize2, Minimize2, Sparkles, User, Bot } from 'lucide-react';

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: "Halo! Saya AI Assistant BikinLiga. Ada yang bisa saya bantu untuk turnamen Anda?", sender: 'ai', timestamp: new Date() }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isExpanded, setIsExpanded] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const newUserMessage = {
            id: messages.length + 1,
            text: inputValue,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, newUserMessage]);
        setInputValue("");

        // Mock AI Response
        setTimeout(() => {
            const aiResponse = {
                id: messages.length + 2,
                text: "Terima kasih atas pesan Anda. Fitur chat AI ini akan segera terhubung dengan sistem cerdas kami!",
                sender: 'ai',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiResponse]);
        }, 1000);
    };

    // Toggle scroll lock on body when mobile chat is open
    useEffect(() => {
        if (window.innerWidth < 768 && isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    return (
        <>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-6 right-6 z-50 p-4 rounded-full bg-gradient-to-r from-neonGreen to-neonPink shadow-lg hover:shadow-neonGreen/20 transition-all duration-300 transform hover:-translate-y-1 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
            >
                <MessageSquare className="w-6 h-6 text-black fill-current" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            </button>

            {/* Chat Window Overlay (Mobile Background) */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Chat Window */}
            <div
                className={`fixed z-[70] transition-all duration-300 flex flex-col overflow-hidden
                    ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none translate-y-10'}
                    ${isExpanded
                        ? 'inset-4 md:inset-10 rounded-2xl glass-panel'
                        : 'bottom-0 left-0 w-full h-[100dvh] md:w-96 md:h-[600px] md:bottom-6 md:right-6 md:left-auto md:rounded-2xl glass-panel'
                    }
                `}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neonGreen/20 to-neonPink/20 flex items-center justify-center border border-white/10 ring-2 ring-white/5">
                            <Sparkles className="w-5 h-5 text-neonGreen" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-sm">AI Assistant</h3>
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-neonGreen animate-pulse" />
                                <span className="text-xs text-neonGreen font-medium">Online</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="hidden md:flex p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition"
                            title={isExpanded ? "Minimize" : "Maximize"}
                        >
                            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                        </button>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                {/* Avatar */}
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.sender === 'user'
                                        ? 'bg-neonPink/20 text-neonPink'
                                        : 'bg-neonGreen/20 text-neonGreen'
                                    }`}>
                                    {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                </div>

                                {/* Bubble */}
                                <div
                                    className={`p-3 rounded-2xl text-sm leading-relaxed ${msg.sender === 'user'
                                            ? 'bg-neonPink/10 border border-neonPink/20 text-white rounded-tr-none'
                                            : 'bg-white/5 border border-white/10 text-gray-200 rounded-tl-none'
                                        }`}
                                >
                                    {msg.text}
                                    <div className={`text-[10px] mt-1 opacity-50 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-white/10 bg-white/5 backdrop-blur-md">
                    <form onSubmit={handleSendMessage} className="relative flex items-center gap-2">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Tanya sesuatu..."
                            className="w-full bg-black/20 text-white placeholder-gray-500 rounded-xl py-3 pl-4 pr-12 border border-white/10 focus:outline-none focus:border-neonGreen/50 focus:ring-1 focus:ring-neonGreen/50 transition"
                        />
                        <button
                            type="submit"
                            disabled={!inputValue.trim()}
                            className="absolute right-2 p-2 bg-neonGreen/20 text-neonGreen rounded-lg hover:bg-neonGreen hover:text-black disabled:opacity-50 disabled:hover:bg-neonGreen/20 disabled:hover:text-neonGreen transition-all duration-300"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}
