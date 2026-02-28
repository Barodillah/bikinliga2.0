import React, { useState } from 'react'
import { useToast } from '../../contexts/ToastContext'
import { Gift, Edit, Loader2, DollarSign, Trophy, Medal, Plus, Trash2, User, Save } from 'lucide-react'
import Card, { CardHeader, CardContent } from '../ui/Card'
import Button from '../ui/Button'
import Input from '../ui/Input'
import ConfirmationModal from '../ui/ConfirmationModal'

export default function PrizeTab({
    prizeSettings,
    setPrizeSettings,
    isOrganizer,
    isEditingPrizes,
    setIsEditingPrizes,
    isPrizeLoading,
    handleSourceChange,
    handleRecipientChange,
    addRecipient,
    removeRecipient,
    getAutomaticWinner,
    tournamentData,
    handleSavePrizes,
    isSaving
}) {
    const toast = useToast();
    const [isDistributeModalOpen, setIsDistributeModalOpen] = useState(false);
    const [isDistributing, setIsDistributing] = useState(false);

    const isPaid = tournamentData?.payment != null;
    const hasPayout = tournamentData?.wallet_transactions?.some(t => t.type === 'prize_payout') || false;

    return (
        <div className="space-y-6 animate-fadeIn pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/5 p-6 rounded-2xl border border-white/10">
                <div>
                    <h3 className="text-2xl font-display font-bold text-white flex items-center gap-2">
                        <Gift className="w-6 h-6 text-neonPink" />
                        Hadiah Turnamen
                    </h3>
                    <p className="text-gray-400 text-sm mt-1">Kelola sumber dana dan distribusi hadiah peserta</p>
                </div>
                {isOrganizer && (
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 px-4 py-2 bg-black/40 border border-white/10 rounded-xl">
                            <span className="text-sm font-medium text-gray-400 whitespace-nowrap">Status Fitur:</span>
                            {isPaid ? (
                                <span className={`text-xs font-black tracking-widest whitespace-nowrap text-neonGreen`}>
                                    AKTIF (SISTEM)
                                </span>
                            ) : (
                                <>
                                    <button
                                        onClick={() => setPrizeSettings(prev => ({ ...prev, enabled: !prev.enabled }))}
                                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-300 focus:outline-none ${prizeSettings.enabled ? 'bg-neonGreen shadow-[0_0_10px_rgba(57,255,20,0.3)]' : 'bg-gray-600'}`}
                                    >
                                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-300 ease-in-out ${prizeSettings.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                                    </button>
                                    <span className={`text-xs font-black tracking-widest whitespace-nowrap w-[60px] ${prizeSettings.enabled ? 'text-neonGreen' : 'text-gray-500'}`}>
                                        {prizeSettings.enabled ? 'AKTIF' : 'NONAKTIF'}
                                    </span>
                                </>
                            )}
                        </div>

                        {prizeSettings.enabled && !isEditingPrizes && (
                            <Button
                                onClick={() => setIsEditingPrizes(true)}
                                variant="secondary"
                                className="bg-white/10 hover:bg-white/20 text-white border-white/10"
                            >
                                <Edit className="w-4 h-4 mr-2" />
                                Ubah Pengaturan
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {prizeSettings.enabled ? (
                isPrizeLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-neonGreen animate-spin" />
                    </div>
                ) : (
                    <>
                        {/* Calculation Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Sources Card */}
                            <Card hover={false} className="lg:col-span-2 overflow-hidden border-white/5 bg-black/40 backdrop-blur-sm">
                                <CardHeader className="border-b border-white/5 bg-white/5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 bg-blue-500/10 rounded-lg">
                                                <DollarSign className="w-4 h-4 text-blue-400" />
                                            </div>
                                            <h4 className="font-bold">Sumber Dana</h4>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Pendaftaran / Peserta</label>
                                                <div className="flex items-center gap-3">
                                                    <div className="relative flex-1">
                                                        {isPaid ? (
                                                            <img src="/coin.png" alt="coin" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 object-contain" />
                                                        ) : (
                                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">Rp</span>
                                                        )}
                                                        {isEditingPrizes && !isPaid ? (
                                                            <Input
                                                                type="text"
                                                                inputMode="numeric"
                                                                value={prizeSettings.sources.registrationFee}
                                                                onChange={(e) => handleSourceChange('registrationFee', e.target.value.replace(/\D/g, ''))}
                                                                className="pl-10 bg-white/5 border-white/10"
                                                            />
                                                        ) : (
                                                            <div className="pl-10 py-2 border border-transparent font-bold">
                                                                {Number(prizeSettings.sources.registrationFee).toLocaleString('id-ID')}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="text-gray-500">×</div>
                                                    <div className="w-20 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-center font-bold" title={tournamentData?.status === 'draft' ? "Berdasarkan Maksimal Peserta (Draft)" : "Jumlah Peserta Valid"}>
                                                        {tournamentData?.status === 'draft' ? (tournamentData?.maxParticipants || 0) : (tournamentData?.participants?.filter(p => p.status === 'approved').length || 0)}
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Sponsor / Tambahan</label>
                                                <div className="relative">
                                                    {isPaid ? (
                                                        <img src="/coin.png" alt="coin" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 object-contain" />
                                                    ) : (
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">Rp</span>
                                                    )}
                                                    <div className="pl-10 py-2 border border-transparent font-bold">
                                                        {Number(prizeSettings.sources.sponsor || 0).toLocaleString('id-ID')}
                                                        <span className="text-[10px] text-gray-500 font-normal ml-2 italic">(Otomatis dari donasi sponsor)</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Biaya Admin (Pengurangan)</label>
                                                <div className="relative">
                                                    {isPaid ? (
                                                        <img src="/coin.png" alt="coin" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 object-contain" />
                                                    ) : (
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">Rp</span>
                                                    )}
                                                    {isEditingPrizes ? (
                                                        <Input
                                                            type="text"
                                                            inputMode="numeric"
                                                            value={prizeSettings.sources.adminFee}
                                                            onChange={(e) => handleSourceChange('adminFee', e.target.value.replace(/\D/g, ''))}
                                                            className="pl-10 bg-white/5 border-red-500/30 text-red-500 font-bold"
                                                        />
                                                    ) : (
                                                        <div className="pl-10 py-2 border border-transparent font-bold text-red-500">
                                                            {Number(prizeSettings.sources.adminFee).toLocaleString('id-ID')}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="p-4 bg-neonGreen/5 border border-neonGreen/20 rounded-xl shadow-lg shadow-neonGreen/5">
                                                <div className="text-xs font-bold text-neonGreen uppercase tracking-wider mb-1">Total Prize Pool</div>
                                                <div className="text-3xl font-display font-black text-white flex items-center gap-2">
                                                    {isPaid && <img src="/coin.png" alt="coin" className="w-8 h-8 object-contain" />}
                                                    {!isPaid && 'Rp '}{prizeSettings.totalPrizePool.toLocaleString('id-ID')}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Summary Card */}
                            <Card hover={false} className="border-white/5 bg-gradient-to-br from-gray-900 to-black relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-500">
                                    <Trophy className="w-32 h-32 text-neonGreen" />
                                </div>
                                <CardHeader>
                                    <h4 className="font-bold">Ringkasan Distribusi</h4>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                                        <span className="text-sm text-gray-400">Total Kategori</span>
                                        <span className="font-bold text-white">{prizeSettings.recipients.length}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                                        <span className="text-sm text-gray-400">Persentase Terpakai</span>
                                        <span className={`font-bold ${prizeSettings.recipients.reduce((sum, r) => sum + (Number(r.percentage) || 0), 0) === 100 ? 'text-neonGreen' : 'text-red-400'}`}>
                                            {prizeSettings.recipients.reduce((sum, r) => sum + (Number(r.percentage) || 0), 0)}%
                                        </span>
                                    </div>
                                    <div className="mt-6">
                                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Preview Hadiah</div>
                                        <div className="space-y-3">
                                            {prizeSettings.recipients.slice(0, 4).map((r, i) => (
                                                <div key={i} className="flex items-center gap-3">
                                                    <div className={`w-1 h-6 rounded-full ${i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-gray-400' : 'bg-orange-500'}`} />
                                                    <div className="flex-1">
                                                        <div className="text-xs font-bold truncate">{r.label}</div>
                                                        <div className="text-[10px] text-gray-400 flex items-center gap-1">
                                                            {isPaid ? <img src="/coin.png" alt="coin" className="w-3 h-3 object-contain" /> : 'Rp '}
                                                            {Number(r.amount).toLocaleString('id-ID')}
                                                        </div>
                                                    </div>
                                                    <div className="text-xs font-mono font-bold text-gray-500">{r.percentage}%</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Recipients Management */}
                        <Card hover={false} className="border-white/5 bg-black/40 backdrop-blur-sm overflow-hidden">
                            <CardHeader className="border-b border-white/5 flex flex-row items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-neonPink/10 rounded-lg">
                                        <Medal className="w-4 h-4 text-neonPink" />
                                    </div>
                                    <h4 className="font-bold">Penerima Hadiah</h4>
                                </div>
                                {isOrganizer && isEditingPrizes && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={addRecipient}
                                        className="text-neonPink hover:bg-neonPink/10"
                                    >
                                        <Plus className="w-4 h-4 mr-1" /> Tambah Kategori
                                    </Button>
                                )}
                                {isOrganizer && tournamentData?.status === 'completed' && isPaid && !hasPayout && !isEditingPrizes && (
                                    <Button
                                        size="sm"
                                        onClick={() => setIsDistributeModalOpen(true)}
                                        className="bg-gradient-to-r from-neonPink to-purple-600 hover:from-neonPink/80 hover:to-purple-600/80 text-white border-0 shadow-[0_0_15px_rgba(255,10,120,0.3)] ml-auto"
                                    >
                                        <Gift className="w-4 h-4 mr-2" />
                                        Distribusikan Hadiah
                                    </Button>
                                )}
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-white/5 border-b border-white/5">
                                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Kategori / Gelar</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Persentase</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Nominal Hadiah</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Pemenang</th>
                                                {isOrganizer && isEditingPrizes && <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Aksi</th>}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {prizeSettings.recipients.map((recipient) => (
                                                <tr key={recipient.id} className="group hover:bg-white/[0.02] transition-colors">
                                                    <td className="px-6 py-4">
                                                        {isEditingPrizes ? (
                                                            <Input
                                                                value={recipient.label}
                                                                onChange={(e) => handleRecipientChange(recipient.id, 'label', e.target.value)}
                                                                className="h-9 bg-white/5 border-white/10 font-bold text-sm"
                                                                placeholder="Contoh: Juara 1"
                                                            />
                                                        ) : (
                                                            <div className="font-bold text-white">{recipient.label}</div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2 w-24">
                                                            {isEditingPrizes ? (
                                                                <>
                                                                    <Input
                                                                        type="text"
                                                                        inputMode="numeric"
                                                                        value={recipient.percentage}
                                                                        onChange={(e) => handleRecipientChange(recipient.id, 'percentage', e.target.value.replace(/\D/g, ''))}
                                                                        className="h-9 bg-white/5 border-white/10 text-center font-mono"
                                                                    />
                                                                    <span className="text-gray-500">%</span>
                                                                </>
                                                            ) : (
                                                                <span className="font-mono text-gray-300">{recipient.percentage}%</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 font-mono">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex items-center gap-2">
                                                                {isPaid ? (
                                                                    <img src="/coin.png" alt="coin" className="w-4 h-4 object-contain" />
                                                                ) : (
                                                                    <span className="text-gray-500 text-xs">Rp</span>
                                                                )}
                                                                <span className="font-bold text-white">
                                                                    {Number(recipient.amount).toLocaleString('id-ID')}
                                                                </span>
                                                            </div>
                                                            {tournamentData?.status === 'completed' && isPaid && (
                                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${hasPayout ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                                    {hasPayout ? 'Paid' : 'Unpaid'}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {(() => {
                                                            const autoWinner = tournamentData.status === 'completed' ? getAutomaticWinner(recipient) : null;
                                                            if (autoWinner) {
                                                                return (
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                                                                            {autoWinner.logo ? (
                                                                                <img src={autoWinner.logo} alt="" className="w-full h-full object-cover" />
                                                                            ) : (
                                                                                <User className="w-4 h-4 text-neonPink" />
                                                                            )}
                                                                        </div>
                                                                        <div className="flex flex-col">
                                                                            <span className="text-sm font-bold text-white">{autoWinner.name}</span>
                                                                            {autoWinner.sub && <span className="text-[10px] text-gray-500">{autoWinner.sub}</span>}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            }
                                                            return (
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-8 h-8 rounded-lg bg-white/5 border border-dashed border-white/10 flex items-center justify-center">
                                                                        <User className="w-4 h-4 text-gray-600" />
                                                                    </div>
                                                                    <span className="text-xs text-gray-500 italic">Belum ditentukan</span>
                                                                </div>
                                                            );
                                                        })()}
                                                    </td>
                                                    {isOrganizer && isEditingPrizes && (
                                                        <td className="px-6 py-4 text-right">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => removeRecipient(recipient.id)}
                                                                className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </td>
                                                    )}
                                                </tr>
                                            ))}
                                            {prizeSettings.recipients.length === 0 && (
                                                <tr>
                                                    <td colSpan={isOrganizer && isEditingPrizes ? 5 : 4} className="px-6 py-12 text-center text-gray-600 italic">
                                                        Belum ada kategori hadiah. {isEditingPrizes ? 'Klik "Tambah Kategori" untuk memulai.' : ''}
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Save Button for Edit Mode */}
                        {isOrganizer && isEditingPrizes && (
                            <div className="flex justify-end gap-3 mt-8">
                                <Button
                                    variant="secondary"
                                    onClick={() => setIsEditingPrizes(false)}
                                    className="bg-white/5 hover:bg-white/10 text-white border-white/10"
                                >
                                    Batal
                                </Button>
                                <Button
                                    onClick={handleSavePrizes}
                                    disabled={isSaving}
                                    className="bg-neonGreen hover:bg-neonGreen/80 text-black font-black px-8"
                                >
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                    Simpan Perubahan
                                </Button>
                            </div>
                        )}
                    </>
                )
            ) : (
                /* Disabled State Placeholder */
                <div className="flex flex-col items-center justify-center py-20 bg-white/5 rounded-2xl border border-dashed border-white/10">
                    <Gift className="w-16 h-16 text-gray-700 mb-4 opacity-20" />
                    <h4 className="text-gray-500 font-bold">Fitur Hadiah Dinonaktifkan</h4>
                    <p className="text-gray-600 text-sm mt-1">Aktifkan status di atas untuk mulai mengatur hadiah turnamen</p>
                </div>
            )}

            <ConfirmationModal
                isOpen={isDistributeModalOpen}
                onClose={() => setIsDistributeModalOpen(false)}
                onConfirm={async () => {
                    setIsDistributing(true);
                    try {
                        const winnersPayload = [];
                        Object.values(prizeSettings.recipients || []).forEach(r => {
                            let pId = null;
                            let autoTarget = null;
                            if (r.isManual) {
                                pId = r.participantId || r.playerId;
                            } else if (getAutomaticWinner) {
                                autoTarget = getAutomaticWinner(r);
                                if (autoTarget) pId = autoTarget.participantId;
                            }

                            let uId = null;
                            if (pId && tournamentData?.participants) {
                                const participant = tournamentData.participants.find(p => p.id === pId);
                                if (participant) uId = participant.user_id;
                            }
                            // Fallback: top scorers may have user_id directly
                            if (!uId && autoTarget?.userId) {
                                uId = autoTarget.userId;
                            }

                            if (uId && r.amount > 0) {
                                winnersPayload.push({
                                    recipient_id: r.id,
                                    user_id: uId,
                                    amount: r.amount
                                });
                            }
                        });

                        const token = localStorage.getItem('token');
                        const res = await fetch(`/api/tournaments/${tournamentData.id}/distribute-prizes`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({ winners: winnersPayload })
                        });

                        if (!res.ok) {
                            const errTxt = await res.text();
                            throw new Error(errTxt || 'Gagal mendistribusikan hadiah');
                        }

                        toast.success("Berhasil! Hadiah telah didistribusikan ke wallet pemenang dan biaya admin ke wallet organizer.");
                        setIsDistributeModalOpen(false);
                        setTimeout(() => window.location.reload(), 1500);
                    } catch (error) {
                        console.error('Distribute error:', error);
                        toast.error(error.message || "Terjadi kesalahan sistem");
                    } finally {
                        setIsDistributing(false);
                    }
                }}
                title="Distribusikan Hadiah?"
                message="Apakah Anda yakin ingin mendistribusikan hadiah ke wallet masing-masing pemenang? Aksi ini tidak dapat dibatalkan dan hadiah akan langsung masuk ke akun mereka."
                confirmText={isDistributing ? "Memproses..." : "Ya, Distribusikan"}
                confirmVariant="primary"
                isLoading={isDistributing}
            />
        </div>
    )
}
