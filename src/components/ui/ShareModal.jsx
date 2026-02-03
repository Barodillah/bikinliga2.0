import React, { useState } from 'react';
import { X, Copy, Check, Twitter, Facebook, MessageCircle } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

export default function ShareModal({ isOpen, onClose, post, link, text, title }) {
    const { success } = useToast();
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const shareUrl = link || (post ? `${window.location.origin}/post/${post.id}` : window.location.href);
    const shareText = text || (post ? `Check out this post from ${post.user_name} on BikinLiga!` : 'Check out this community on BikinLiga!');
    const modalTitle = title || 'Bagikan';

    const handleCopy = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        success('Link berhasil disalin');
        setTimeout(() => setCopied(false), 2000);
    };

    const socialShares = [
        {
            name: 'WhatsApp',
            icon: <MessageCircle className="w-6 h-6" />,
            color: 'bg-green-500 hover:bg-green-600',
            url: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`
        },
        {
            name: 'Twitter',
            icon: <Twitter className="w-6 h-6" />,
            color: 'bg-blue-400 hover:bg-blue-500',
            url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
        },
        {
            name: 'Facebook',
            icon: <Facebook className="w-6 h-6" />,
            color: 'bg-blue-600 hover:bg-blue-700',
            url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
        }
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden relative shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <h3 className="text-lg font-bold text-white">{modalTitle}</h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Link Copy */}
                    <div className="space-y-2">
                        <label className="text-sm text-gray-400">Salin Link</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={shareUrl}
                                readOnly
                                className="flex-1 bg-black border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none"
                            />
                            <button
                                onClick={handleCopy}
                                className={`px-4 py-2 rounded-lg font-bold text-sm transition flex items-center gap-2 ${copied
                                    ? 'bg-green-500/20 text-green-500'
                                    : 'bg-white text-black hover:bg-gray-200'
                                    }`}
                            >
                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                {copied ? 'Disalin' : 'Salin'}
                            </button>
                        </div>
                    </div>

                    {/* Social Share */}
                    <div className="space-y-3">
                        <label className="text-sm text-gray-400">Bagikan ke Sosial Media</label>
                        <div className="grid grid-cols-3 gap-3">
                            {socialShares.map((social) => (
                                <a
                                    key={social.name}
                                    href={social.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`flex flex-col items-center justify-center gap-2 py-4 rounded-xl text-white transition ${social.color}`}
                                >
                                    {social.icon}
                                    <span className="text-xs font-medium">{social.name}</span>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
