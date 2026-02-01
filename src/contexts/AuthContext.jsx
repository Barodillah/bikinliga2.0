import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthContext = createContext(null);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [subscription, setSubscription] = useState(null);
    const [wallet, setWallet] = useState({ balance: 0 });
    const [loading, setLoading] = useState(true);
    const [showUsernameModal, setShowUsernameModal] = useState(false);
    const [showCoinClaimModal, setShowCoinClaimModal] = useState(false);

    const fetchUser = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }

            const response = await fetch(`${API_URL}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                credentials: 'include'
            });

            const data = await response.json();

            if (data.success) {
                setUser(data.data.user);
                setSubscription(data.data.subscription || { plan: 'free', name: 'Free' });

                // Fetch wallet balance
                await fetchWallet(token);

                // Check if user needs to set username
                if (data.data.user.needsUsername) {
                    setShowUsernameModal(true);
                } else if (data.data.user.needsCoinClaim) {
                    setShowCoinClaimModal(true);
                }
            } else {
                localStorage.removeItem('token');
            }
        } catch (error) {
            console.error('Fetch user error:', error);
            localStorage.removeItem('token');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchWallet = async (token) => {
        try {
            const authToken = token || localStorage.getItem('token');
            if (!authToken) return;

            const response = await fetch(`${API_URL}/user/wallet`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                },
                credentials: 'include'
            });

            const data = await response.json();
            if (data.success) {
                setWallet(data.data);
            }
        } catch (error) {
            console.error('Fetch wallet error:', error);
        }
    };

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    const login = async (email, password) => {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message);
        }

        localStorage.setItem('token', data.data.token);
        setUser(data.data.user);
        setSubscription(data.data.subscription || { plan: 'free', name: 'Free' });

        if (data.data.user.needsUsername) {
            setShowUsernameModal(true);
        } else if (data.data.user.needsCoinClaim) {
            setShowCoinClaimModal(true);
        }

        return data;
    };

    const register = async (name, email, password) => {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message);
        }

        return data;
    };

    const verifyOtp = async (userId, code) => {
        const response = await fetch(`${API_URL}/auth/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ userId, code })
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message);
        }

        localStorage.setItem('token', data.data.token);
        setUser(data.data.user);
        setSubscription(data.data.subscription || { plan: 'free', name: 'Free' });

        if (data.data.user.needsUsername) {
            setShowUsernameModal(true);
        } else if (data.data.user.needsCoinClaim) {
            setShowCoinClaimModal(true);
        }

        return data;
    };

    const resendOtp = async (userId) => {
        const response = await fetch(`${API_URL}/auth/resend-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId })
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message);
        }

        return data;
    };

    const googleAuth = async (credential) => {
        const response = await fetch(`${API_URL}/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ credential })
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message);
        }

        localStorage.setItem('token', data.data.token);
        setUser(data.data.user);
        setSubscription(data.data.subscription || { plan: 'free', name: 'Free' });

        if (data.data.user.needsUsername) {
            setShowUsernameModal(true);
        } else if (data.data.user.needsCoinClaim) {
            setShowCoinClaimModal(true);
        }

        return data;
    };

    const setUsername = async (username) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/user/set-username`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include',
            body: JSON.stringify({ username })
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message);
        }

        setUser(prev => ({ ...prev, username: data.data.username, needsUsername: false }));
        setShowUsernameModal(false);

        // Show coin claim modal if not claimed
        if (user && !user.has_claimed_login_coin) {
            setShowCoinClaimModal(true);
        }

        return data;
    };

    const claimLoginCoin = async () => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/user/claim-login-coin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include'
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message);
        }

        setUser(prev => ({ ...prev, needsCoinClaim: false, has_claimed_login_coin: true }));
        setShowCoinClaimModal(false);

        return data;
    };

    const checkUsername = async (username) => {
        const response = await fetch(`${API_URL}/user/check-username?username=${encodeURIComponent(username)}`);
        const data = await response.json();
        return data;
    };

    const logout = async () => {
        try {
            await fetch(`${API_URL}/auth/logout`, {
                method: 'POST',
                credentials: 'include'
            });
        } catch (error) {
            console.error('Logout error:', error);
        }

        localStorage.removeItem('token');
        setUser(null);
        setSubscription(null);
        setWallet({ balance: 0 });
        setShowUsernameModal(false);
        setShowCoinClaimModal(false);
    };

    const value = {
        user,
        subscription,
        wallet,
        loading,
        isAuthenticated: !!user,
        showUsernameModal,
        showCoinClaimModal,
        setShowUsernameModal,
        setShowCoinClaimModal,
        login,
        register,
        verifyOtp,
        resendOtp,
        googleAuth,
        setUsername,
        claimLoginCoin,
        checkUsername,
        logout,
        refreshUser: fetchUser,
        refreshWallet: fetchWallet
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

// Protected Route Component - redirects to login if not authenticated
export function RequireAuth({ children }) {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen bg-darkBg flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neonGreen"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        // Redirect to login with return URL
        window.location.href = `/login?redirect=${encodeURIComponent(location.pathname)}`;
        return null;
    }

    return children;
}

// Guest Route Component - redirects to dashboard if already authenticated
export function RequireGuest({ children }) {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen bg-darkBg flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neonGreen"></div>
            </div>
        );
    }

    if (isAuthenticated) {
        // Check for redirect param, otherwise go to dashboard
        const params = new URLSearchParams(location.search);
        const redirect = params.get('redirect') || '/dashboard';
        window.location.href = redirect;
        return null;
    }

    return children;
}

// Admin Route Component - redirects if not admin/superadmin
export function RequireAdmin({ children }) {
    const { isAuthenticated, loading, user } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen bg-darkBg flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neonGreen"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        window.location.href = `/login?redirect=${encodeURIComponent(location.pathname)}`;
        return null;
    }

    // Check if user has admin or superadmin role
    if (user?.role !== 'admin' && user?.role !== 'superadmin') {
        window.location.href = '/dashboard';
        return null;
    }

    return children;
}

export default AuthContext;
