import React, { useState, useRef } from 'react'
import { Upload, Mail, Send, CheckCircle2, XCircle, FileSpreadsheet, Trash2, Loader2 } from 'lucide-react'
import * as XLSX from 'xlsx'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export default function AdminEmailBlast() {
    const [recipients, setRecipients] = useState([])
    const [subject, setSubject] = useState('')
    const [body, setBody] = useState('')
    const [sending, setSending] = useState(false)
    const [dragActive, setDragActive] = useState(false)
    const fileInputRef = useRef(null)

    const handleFile = (file) => {
        if (!file) return

        const reader = new FileReader()
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result)
                const workbook = XLSX.read(data, { type: 'array' })
                const sheetName = workbook.SheetNames[0]
                const worksheet = workbook.Sheets[sheetName]
                const jsonData = XLSX.utils.sheet_to_json(worksheet)

                // Map data to expected format (nama/name, email)
                const mappedData = jsonData.map((row, index) => ({
                    id: index + 1,
                    name: row.nama || row.Nama || row.name || row.Name || '-',
                    email: row.email || row.Email || row.EMAIL || '',
                    status: 'pending' // pending, sent, failed
                })).filter(r => r.email && r.email.includes('@'))

                setRecipients(mappedData)
            } catch (error) {
                console.error('Error parsing Excel:', error)
                alert('Gagal membaca file Excel. Pastikan format file benar.')
            }
        }
        reader.readAsArrayBuffer(file)
    }

    const handleDrag = (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true)
        } else if (e.type === 'dragleave') {
            setDragActive(false)
        }
    }

    const handleDrop = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0])
        }
    }

    const handleFileInput = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0])
        }
    }

    const removeRecipient = (id) => {
        setRecipients(prev => prev.filter(r => r.id !== id))
    }

    const handleBlast = async () => {
        if (!subject.trim() || !body.trim()) {
            alert('Subject dan isi email wajib diisi!')
            return
        }

        if (recipients.filter(r => r.status === 'pending').length === 0) {
            alert('Tidak ada email yang pending untuk dikirim!')
            return
        }

        setSending(true)

        try {
            const response = await fetch(`${API_URL}/admin/email-blast`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    recipients: recipients.filter(r => r.status === 'pending'),
                    subject,
                    body
                })
            })

            const result = await response.json()

            if (result.success) {
                // Update status based on API response
                setRecipients(prev => prev.map(r => {
                    const resultItem = result.results?.find(res => res.email === r.email)
                    if (resultItem) {
                        return { ...r, status: resultItem.success ? 'sent' : 'failed' }
                    }
                    return r
                }))
            } else {
                alert(result.message || 'Gagal mengirim email')
            }
        } catch (error) {
            console.error('Blast error:', error)
            alert('Terjadi kesalahan saat mengirim email')
        } finally {
            setSending(false)
        }
    }

    const pendingCount = recipients.filter(r => r.status === 'pending').length
    const sentCount = recipients.filter(r => r.status === 'sent').length
    const failedCount = recipients.filter(r => r.status === 'failed').length

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 font-display">Email Blast</h1>
                    <p className="text-sm text-gray-500 mt-1">Kirim email massal ke pengguna</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Upload & Recipients */}
                <div className="space-y-6">
                    {/* Upload Area */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                            Upload Data Penerima
                        </h2>

                        <div
                            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${dragActive
                                ? 'border-emerald-500 bg-emerald-50'
                                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                                }`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".xlsx,.xls"
                                className="hidden"
                                onChange={handleFileInput}
                            />
                            <Upload className={`w-12 h-12 mx-auto mb-4 ${dragActive ? 'text-emerald-500' : 'text-gray-400'}`} />
                            <p className="text-gray-600 font-medium">
                                Drag & drop file Excel atau <span className="text-emerald-600">klik untuk upload</span>
                            </p>
                            <p className="text-sm text-gray-400 mt-2">
                                Format: .xlsx, .xls (Kolom: Nama, Email)
                            </p>
                        </div>
                    </div>

                    {/* Recipients Table */}
                    {recipients.length > 0 && (
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                                <h3 className="font-semibold text-gray-900">
                                    Daftar Penerima ({recipients.length})
                                </h3>
                                <div className="flex gap-3 text-sm">
                                    <span className="flex items-center gap-1 text-gray-500">
                                        <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                                        Pending: {pendingCount}
                                    </span>
                                    <span className="flex items-center gap-1 text-emerald-600">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                        Sent: {sentCount}
                                    </span>
                                    <span className="flex items-center gap-1 text-red-600">
                                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                        Failed: {failedCount}
                                    </span>
                                </div>
                            </div>
                            <div className="max-h-80 overflow-y-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 sticky top-0">
                                        <tr>
                                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Nama</th>
                                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Email</th>
                                            <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                            <th className="w-10"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {recipients.map((recipient) => (
                                            <tr key={recipient.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm text-gray-900">{recipient.name}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600">{recipient.email}</td>
                                                <td className="px-4 py-3 text-center">
                                                    {recipient.status === 'pending' && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                                            Pending
                                                        </span>
                                                    )}
                                                    {recipient.status === 'sent' && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                                                            <CheckCircle2 className="w-3 h-3" />
                                                            Terkirim
                                                        </span>
                                                    )}
                                                    {recipient.status === 'failed' && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                                            <XCircle className="w-3 h-3" />
                                                            Gagal
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-2">
                                                    <button
                                                        onClick={() => removeRecipient(recipient.id)}
                                                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column - Email Content */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Mail className="w-5 h-5 text-blue-600" />
                            Konten Email
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                                <input
                                    type="text"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="Contoh: BikinLiga 2.0 Sudah Hadir! 🎉"
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition text-gray-900"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Isi Email</label>
                                <textarea
                                    value={body}
                                    onChange={(e) => setBody(e.target.value)}
                                    rows={10}
                                    placeholder="Tulis isi email di sini...&#10;&#10;Gunakan {nama} untuk menyapa penerima dengan nama mereka."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition resize-none text-gray-900"
                                />
                                <p className="text-xs text-gray-400 mt-2">
                                    Tip: Gunakan <code className="bg-gray-100 px-1 rounded">{'{nama}'}</code> untuk personalisasi
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Send Button */}
                    <button
                        onClick={handleBlast}
                        disabled={sending || recipients.length === 0 || pendingCount === 0}
                        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-500 disabled:shadow-none"
                    >
                        {sending ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Mengirim Email...
                            </>
                        ) : (
                            <>
                                <Send className="w-5 h-5" />
                                Kirim Email ({pendingCount} penerima)
                            </>
                        )}
                    </button>

                    {/* Preview Card */}
                    {(subject || body) && (
                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 text-white">
                            <p className="text-xs text-gray-400 mb-2">Preview Email</p>
                            <h4 className="font-semibold text-lg mb-3">{subject || '(Subject kosong)'}</h4>
                            <div className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">
                                {body.replace('{nama}', 'John Doe') || '(Isi email kosong)'}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
