import React from 'react'
import Modal from './Modal'
import Button from './Button'
import { AlertTriangle, HelpCircle } from 'lucide-react'

export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title = 'Konfirmasi',
    message,
    confirmText = 'Ya, Lanjutkan',
    cancelText = 'Batal',
    variant = 'primary', // 'primary' | 'danger'
    isLoading = false
}) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
            <div className="text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${variant === 'danger' ? 'bg-red-500/10 text-red-500' : 'bg-neonGreen/10 text-neonGreen'
                    }`}>
                    {variant === 'danger' ? (
                        <AlertTriangle className="w-8 h-8" />
                    ) : (
                        <HelpCircle className="w-8 h-8" />
                    )}
                </div>

                <p className="text-gray-300 mb-6 leading-relaxed">
                    {message}
                </p>

                <div className="flex gap-3 justify-center">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={isLoading}
                        className="min-w-[100px]"
                    >
                        {cancelText}
                    </Button>
                    <Button
                        variant={variant === 'danger' ? 'danger' : 'primary'}
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`min-w-[100px] ${variant === 'danger' ? 'bg-red-500 hover:bg-red-600 text-white' : ''}`}
                    >
                        {isLoading ? 'Memproses...' : confirmText}
                    </Button>
                </div>
            </div>
        </Modal>
    )
}
