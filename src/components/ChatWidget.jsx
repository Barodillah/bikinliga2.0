import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Maximize2, Minimize2, Sparkles, User, Bot, Trash2, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Helper to get auth headers
function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
}

export default function ChatWidget() {
    const { user, isAuthenticated } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [isExpanded, setIsExpanded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const [isInitializing, setIsInitializing] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    // Initialize or load chat session when widget opens
    useEffect(() => {
        if (isOpen && isAuthenticated && !sessionId && !isInitializing) {
            initializeSession();
        }
    }, [isOpen, isAuthenticated]);

    const initializeSession = async () => {
        setIsInitializing(true);
        try {
            // Create new session
            const response = await fetch(`${API_URL}/ai/minliga/sessions`, {
                method: 'POST',
                credentials: 'include',
                headers: getAuthHeaders()
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setSessionId(data.data.id);
                    setMessages(data.data.messages.map(msg => ({
                        id: msg.id,
                        text: msg.content,
                        sender: msg.role === 'user' ? 'user' : 'ai',
                        timestamp: new Date(msg.created_at)
                    })));
                }
            } else {
                console.error('Session creation failed:', response.status);
                throw new Error('Failed to create session');
            }
        } catch (error) {
            console.error('Failed to initialize chat session:', error);
            // Fallback to local only mode
            setMessages([{
                id: 'welcome',
                text: 'Halo! Saya MinLiga, asisten AI BikinLiga. Ada yang bisa saya bantu? 🏆',
                sender: 'ai',
                timestamp: new Date()
            }]);
        } finally {
            setIsInitializing(false);
        }
    };

    const sendMessage = async (content) => {
        if (!content.trim() || isLoading) return;

        const userMessage = {
            id: Date.now(),
            text: content,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        try {
            if (isAuthenticated && sessionId) {
                // Send to backend API
                const response = await fetch(`${API_URL}/ai/minliga/message`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: getAuthHeaders(),
                    body: JSON.stringify({
                        sessionId: sessionId,
                        content: content
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        setMessages(prev => [...prev, {
                            id: data.data.aiMessage.id,
                            text: data.data.aiMessage.content,
                            sender: 'ai',
                            timestamp: new Date(data.data.aiMessage.created_at)
                        }]);
                    } else {
                        throw new Error(data.message);
                    }
                } else {
                    throw new Error('Failed to get response');
                }
            } else {
                // Fallback for non-authenticated users or no session
                setTimeout(() => {
                    setMessages(prev => [...prev, {
                        id: Date.now(),
                        text: 'Silakan login terlebih dahulu untuk menggunakan fitur chat AI MinLiga secara penuh!',
                        sender: 'ai',
                        timestamp: new Date()
                    }]);
                    setIsLoading(false);
                }, 1000);
            }
        } catch (error) {
            console.error('Send message error:', error);
            setMessages(prev => [...prev, {
                id: Date.now(),
                text: 'Maaf, terjadi kesalahan. Silakan coba lagi.',
                sender: 'ai',
                timestamp: new Date()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        const content = inputValue;
        setInputValue("");
        await sendMessage(content);
    };

    const handleClearChat = async () => {
        if (!sessionId) return;

        try {
            const response = await fetch(`${API_URL}/ai/minliga/sessions/${sessionId}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: getAuthHeaders()
            });

            if (response.ok) {
                setSessionId(null);
                setMessages([]);
                // Reinitialize session
                initializeSession();
            }
        } catch (error) {
            console.error('Clear chat error:', error);
        }
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
                            <h3 className="font-bold text-white text-sm">MinLiga</h3>
                            <div className="flex items-center gap-1.5">
                                <span className={`w-2 h-2 rounded-full ${isLoading ? 'bg-yellow-500 animate-pulse' : 'bg-neonGreen animate-pulse'}`} />
                                <span className="text-xs text-neonGreen font-medium">
                                    {isLoading ? 'Mengetik...' : 'Online'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Clear Chat Button */}
                        {sessionId && messages.length > 1 && (
                            <button
                                onClick={handleClearChat}
                                className="p-2 text-gray-400 hover:text-red-400 hover:bg-white/10 rounded-lg transition"
                                title="Bersihkan Chat"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
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
                    {isInitializing ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="flex items-center gap-2 text-gray-400">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Memuat chat...</span>
                            </div>
                        </div>
                    ) : (
                        messages.map((msg) => (
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
                                        className={`p-3 rounded-2xl text-sm leading-relaxed overflow-hidden ${msg.sender === 'user'
                                            ? 'bg-neonPink/10 border border-neonPink/20 text-white rounded-tr-none'
                                            : 'bg-white/5 border border-white/10 text-gray-200 rounded-tl-none'
                                            }`}
                                    >
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            components={{
                                                strong: ({ node, ...props }) => <span className="font-bold text-neonGreen/80" {...props} />,
                                                em: ({ node, ...props }) => <span className="italic opacity-80" {...props} />,
                                                p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                                                ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
                                                ol: ({ node, ...props }) => <ol className="list-decimal pl-4 mb-2 space-y-1" {...props} />,
                                                li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                                                h1: ({ node, ...props }) => <h1 className="text-lg font-bold my-2 border-b border-white/10 pb-1" {...props} />,
                                                h2: ({ node, ...props }) => <h2 className="text-base font-bold my-2" {...props} />,
                                                h3: ({ node, ...props }) => <h3 className="text-sm font-bold my-1" {...props} />,
                                                blockquote: ({ node, ...props }) => <blockquote className="border-l-2 border-neonGreen/50 pl-2 italic my-2 opacity-70" {...props} />,
                                                code: ({ node, inline, className, children, ...props }) => {
                                                    return inline ? (
                                                        <code className="bg-black/30 text-neonGreen rounded px-1 py-0.5 text-xs font-mono" {...props}>{children}</code>
                                                    ) : (
                                                        <code className="block bg-black/50 p-2 rounded-lg my-2 text-xs font-mono overflow-x-auto border border-white/10" {...props}>{children}</code>
                                                    )
                                                },
                                                a: ({ node, ...props }) => <a className="text-neonGreen hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                                                img: ({ node, ...props }) => <img className="rounded-lg my-2 max-w-full border border-white/10" {...props} />,
                                                hr: ({ node, ...props }) => <hr className="border-white/10 my-4" {...props} />,
                                                table: ({ node, ...props }) => <div className="overflow-x-auto my-2"><table className="min-w-full border-collapse border border-white/10 text-xs" {...props} /></div>,
                                                th: ({ node, ...props }) => <th className="border border-white/10 px-2 py-1 bg-white/5 font-bold text-left" {...props} />,
                                                td: ({ node, ...props }) => <td className="border border-white/10 px-2 py-1" {...props} />,
                                                del: ({ node, ...props }) => <del className="opacity-60" {...props} />,
                                            }}
                                        >
                                            {msg.text}
                                        </ReactMarkdown>
                                        <div className={`text-[10px] mt-1 opacity-50 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}

                    {/* Loading indicator */}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="flex gap-3 max-w-[85%]">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-neonGreen/20 text-neonGreen">
                                    <Bot className="w-4 h-4" />
                                </div>
                                <div className="p-3 rounded-2xl rounded-tl-none bg-white/5 border border-white/10">
                                    <div className="flex items-center gap-1">
                                        <div className="w-2 h-2 bg-neonGreen rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="w-2 h-2 bg-neonGreen rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="w-2 h-2 bg-neonGreen rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Quick Questions (Visible when chat is empty or messages are few) */}
                {messages.length < 3 && !isLoading && (
                    <div className="px-4 pb-2">
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {[
                                "Cara buat turnamen?",
                                "Apa fitur BikinLiga?",
                                "Saya mau lapor bug"
                            ].map((q, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => sendMessage(q)}
                                    className="whitespace-nowrap px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300 hover:bg-neonGreen/10 hover:text-neonGreen hover:border-neonGreen/30 transition-colors"
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Input Area */}
                <div className="p-4 border-t border-white/10 bg-white/5 backdrop-blur-md">
                    <form onSubmit={handleSendMessage} className="relative flex items-center gap-2">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder={isAuthenticated ? "Tanya MinLiga..." : "Login untuk chat..."}
                            disabled={isLoading}
                            className="w-full bg-black/20 text-white placeholder-gray-500 rounded-xl py-3 pl-4 pr-12 border border-white/10 focus:outline-none focus:border-neonGreen/50 focus:ring-1 focus:ring-neonGreen/50 transition disabled:opacity-50"
                        />
                        <button
                            type="submit"
                            disabled={!inputValue.trim() || isLoading}
                            className="absolute right-2 p-2 bg-neonGreen/20 text-neonGreen rounded-lg hover:bg-neonGreen hover:text-black disabled:opacity-50 disabled:hover:bg-neonGreen/20 disabled:hover:text-neonGreen transition-all duration-300"
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}
