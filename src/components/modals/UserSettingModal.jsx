import React, { useState, useEffect } from 'react'
import Modal from '../ui/Modal'
import { Save, Wallet, UserCog, Award } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

export default function UserSettingModal({ isOpen, onClose, user, onUpdate, onAdjustWallet }) {
    const [formData, setFormData] = useState({
        role: 'user',
        subscription_plan: 'free'
    })
    const [walletAdjustment, setWalletAdjustment] = useState({
        amount: 0,
        reason: ''
    })
    const [loading, setLoading] = useState(false)
    const [activeTab, setActiveTab] = useState('profile') // profile, wallet
    const { user: currentUser } = useAuth()

    useEffect(() => {
        if (user) {
            setFormData({
                role: user.role || 'user',
                subscription_plan: user.subscription_plan || 'free'
            })
            setWalletAdjustment({ amount: 0, reason: '' })
        }
    }, [user])

    const handleUpdateProfile = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            await onUpdate(user.id, formData)
            onClose()
        } catch (error) {
            console.error('Failed to update profile:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleWalletAdjust = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            await onAdjustWallet(user.id, walletAdjustment)
            onClose()
        } catch (error) {
            console.error('Failed to adjust wallet:', error)
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen || !user) return null

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Settings: ${user.name}`} size="md" variant="light">
            <div className="flex gap-2 mb-6 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('profile')}
                    className={`pb-2 px-4 text-sm font-medium transition flex items-center gap-2 ${activeTab === 'profile'
                        ? 'border-b-2 border-neonGreen text-neonGreen'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <UserCog className="w-4 h-4" />
                    Profile & Plan
                </button>
                <button
                    onClick={() => setActiveTab('wallet')}
                    className={`pb-2 px-4 text-sm font-medium transition flex items-center gap-2 ${activeTab === 'wallet'
                        ? 'border-b-2 border-neonGreen text-neonGreen'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <Wallet className="w-4 h-4" />
                    Wallet Adjustment
                </button>
            </div>

            {activeTab === 'profile' ? (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                    {currentUser?.role === 'superadmin' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">User Role</label>
                            <select
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neonGreen/20 focus:border-neonGreen"
                            >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                                <option value="superadmin">Superadmin</option>
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Subscription Plan</label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {['free', 'captain', 'pro_league'].map((plan) => (
                                <button
                                    key={plan}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, subscription_plan: plan })}
                                    className={`p-3 border rounded-lg text-sm font-medium capitalize flex flex-col items-center gap-2 transition ${formData.subscription_plan === plan
                                        ? 'border-neonGreen bg-neonGreen/10 text-emerald-900'
                                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    <Award className={`w-5 h-5 ${plan === 'free' ? 'text-gray-400' : plan === 'captain' ? 'text-blue-500' : 'text-yellow-500'}`} />
                                    {plan.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 mr-2"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading ? 'Saving...' : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </form>
            ) : (
                <form onSubmit={handleWalletAdjust} className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg flex items-center justify-between border border-gray-200">
                        <span className="text-sm font-medium text-gray-600">Current Balance</span>
                        <div className="flex items-center gap-1 font-bold text-gray-900 text-lg">
                            <img src="/coin.png" alt="Coin" className="w-5 h-5" />
                            {user.wallet_balance.toLocaleString()}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Adjustment Amount</label>
                        <div className="relative">
                            <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9\-]*"
                                value={walletAdjustment.amount === 0 && walletAdjustment.amount !== '-' ? '' : walletAdjustment.amount}
                                onChange={(e) => {
                                    // Hanya izinkan angka dan tanda minus di awal
                                    let val = e.target.value.replace(/[^0-9-]/g, '');

                                    // Pastikan minus hanya ada di awal
                                    if (val.indexOf('-') > 0) {
                                        val = val.replace(/-/g, '');
                                    }

                                    // Jika value cuma '-', simpan sebagai string sementara
                                    if (val === '-') {
                                        setWalletAdjustment({ ...walletAdjustment, amount: '-' });
                                        return;
                                    }

                                    // Kalau kosong, jadi 0
                                    setWalletAdjustment({ ...walletAdjustment, amount: val === '' ? 0 : parseInt(val) || 0 });
                                }}
                                className={`w-full pl-4 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${(typeof walletAdjustment.amount === 'number' && walletAdjustment.amount >= 0) || walletAdjustment.amount === ''
                                        ? 'border-gray-300 focus:border-neonGreen focus:ring-neonGreen/20 text-black'
                                        : 'border-red-300 focus:border-red-500 focus:ring-red-500/20 text-red-600'
                                    }`}
                                placeholder="Enter amount (negative to subtract)"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Use negative values (e.g. -100) to deduct coins.
                            </p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Reason (Required)</label>
                        <textarea
                            value={walletAdjustment.reason}
                            onChange={(e) => setWalletAdjustment({ ...walletAdjustment, reason: e.target.value })}
                            required
                            rows="2"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neonGreen/20 focus:border-neonGreen"
                            placeholder="Why are you adjusting the balance?"
                        />
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 mr-2"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || walletAdjustment.amount === 0 || !walletAdjustment.reason}
                            className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading ? 'Processing...' : (
                                <>
                                    <Wallet className="w-4 h-4" />
                                    Confirm Adjustment
                                </>
                            )}
                        </button>
                    </div>
                </form>
            )}
        </Modal>
    )
}
