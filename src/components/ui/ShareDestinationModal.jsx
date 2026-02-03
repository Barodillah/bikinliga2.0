import React, { useState, useEffect } from 'react';
import { X, Globe, Users, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authFetch } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';

export default function ShareDestinationModal({ isOpen, onClose, sharedContent }) {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [communities, setCommunities] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchJoinedCommunities();
        }
    }, [isOpen]);

    const fetchJoinedCommunities = async () => {
        setLoading(true);
        try {
            const res = await authFetch('/api/communities');
            const data = await res.json();

            if (data.success) {
                const joined = data.data.filter(c => c.is_joined === true || c.is_joined === 1);
                setCommunities(joined);
            }
        } catch (error) {
            console.error("Error fetching communities:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleShareToEclub = () => {
        navigate('/dashboard/eclub', {
            state: { shared_content: sharedContent }
        });
        onClose();
    };

    const handleShareToCommunity = (communityId) => {
        navigate(`/dashboard/eclub/community/${communityId}`, {
            state: { shared_content: sharedContent }
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden relative shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <h3 className="text-lg font-bold text-white">Bagikan ke...</h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4">
                    {/* Public E-Club Option */}
                    <button
                        onClick={handleShareToEclub}
                        className="w-full flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition group text-left"
                    >
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neonGreen/20 to-blue-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                            <Globe className="w-6 h-6 text-neonGreen" />
                        </div>
                        <div>
                            <h4 className="font-bold text-white text-lg">Public E-Club</h4>
                            <p className="text-sm text-gray-400">Bagikan ke timeline global</p>
                        </div>
                    </button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-[#1a1a1a] px-2 text-gray-500">Atau komunitas kamu</span>
                        </div>
                    </div>

                    {/* Communities List */}
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {loading ? (
                            <div className="flex justify-center py-4">
                                <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
                            </div>
                        ) : communities.length > 0 ? (
                            communities.map(comm => (
                                <button
                                    key={comm.id}
                                    onClick={() => handleShareToCommunity(comm.id)}
                                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition text-left group"
                                >
                                    {comm.logo ? (
                                        <img src={comm.logo} alt={comm.name} className="w-10 h-10 rounded-lg object-cover" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                                            <Users className="w-5 h-5 text-gray-400" />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <h5 className="font-bold text-gray-200 group-hover:text-white truncate">{comm.name}</h5>
                                        <p className="text-xs text-gray-500">{comm.member_count || 0} anggota</p>
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="text-center py-4 text-gray-500 text-sm">
                                Kamu belum bergabung dengan komunitas apapun.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
