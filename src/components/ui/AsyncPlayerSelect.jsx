import React, { useState, useRef, useEffect } from 'react'
import { Search, ChevronDown, X, Loader2, User, Globe } from 'lucide-react'

export default function AsyncPlayerSelect({
    value,
    onChange,
    placeholder = 'Cari Pemain...',
    label,
    disabled = false
}) {
    const [isOpen, setIsOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [options, setOptions] = useState([])
    const [loading, setLoading] = useState(false)
    const [typingTimeout, setTypingTimeout] = useState(null)

    const containerRef = useRef(null)
    const inputRef = useRef(null)

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Search Function
    const performSearch = async (query) => {
        if (!query) {
            setOptions([])
            return
        }

        setLoading(true)
        try {
            const response = await fetch(`/api/external/players?q=${encodeURIComponent(query)}`)
            const data = await response.json()

            if (data.status && data.data) {
                setOptions(data.data)
            } else {
                setOptions([])
            }
        } catch (err) {
            console.error("Search player error", err)
            setOptions([])
        } finally {
            setLoading(false)
        }
    }

    const handleSearchChange = (e) => {
        const val = e.target.value
        setSearchTerm(val)

        if (typingTimeout) clearTimeout(typingTimeout)

        setTypingTimeout(setTimeout(() => {
            performSearch(val)
        }, 500))
    }

    const handleSelect = (player) => {
        onChange(player.nama) // Return name string
        setIsOpen(false)
        setSearchTerm('')
    }

    const handleManualSelect = () => {
        onChange('MANUAL_INPUT')
        setIsOpen(false)
    }

    const handleClear = (e) => {
        e.stopPropagation()
        onChange('')
        setSearchTerm('')
    }

    return (
        <div className="relative" ref={containerRef}>
            {label && (
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    {label}
                </label>
            )}

            {/* Main Trigger */}
            <div
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`w-full px-4 py-3 rounded-lg border bg-white/5 text-white 
                    flex items-center justify-between cursor-pointer transition
                    ${isOpen ? 'border-neonGreen ring-1 ring-neonGreen/20' : 'border-white/10 hover:border-white/30'}
                    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <span className={value ? 'text-white' : 'text-gray-500'}>
                    {value === 'MANUAL_INPUT' ? 'Input Manual...' : (value || placeholder)}
                </span>
                <div className="flex items-center gap-2">
                    {value && (
                        <button
                            onClick={handleClear}
                            className="p-1 hover:bg-white/10 rounded transition"
                        >
                            <X className="w-4 h-4 text-gray-400" />
                        </button>
                    )}
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </div>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-gray-900 border border-white/10 rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    {/* Search Input */}
                    <div className="p-3 border-b border-white/10">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                ref={inputRef}
                                type="text"
                                value={searchTerm}
                                onChange={handleSearchChange}
                                placeholder="Ketik nama pemain..."
                                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg
                                    text-white placeholder-gray-500 focus:outline-none focus:border-neonGreen
                                    text-sm"
                                autoFocus
                            />
                            {loading && (
                                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neonGreen animate-spin" />
                            )}
                        </div>
                    </div>

                    {/* Results List */}
                    <div className="max-h-60 overflow-y-auto">
                        {options.length > 0 ? (
                            options.map((player) => (
                                <div
                                    key={player.id}
                                    onClick={() => handleSelect(player)}
                                    className="px-4 py-3 cursor-pointer transition border-b border-white/5 last:border-0 hover:bg-white/5"
                                >
                                    <div className="font-bold text-white">{player.nama}</div>
                                    <div className="text-xs text-gray-400 flex items-center gap-2 mt-1">
                                        <span className="bg-white/10 px-1.5 py-0.5 rounded text-neonGreen uppercase">{player.posisi}</span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                            {player.team}
                                        </span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                            <Globe className="w-3 h-3" /> {player.negara}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            !loading && searchTerm && (
                                <div className="px-4 py-3 text-gray-500 text-sm text-center">
                                    Tidak ada pemain dengan nama "{searchTerm}"
                                </div>
                            )
                        )}

                        {/* Manual Option */}
                        <div
                            onClick={handleManualSelect}
                            className="px-4 py-3 cursor-pointer transition border-t border-white/10 flex items-center justify-center gap-2 text-neonGreen hover:bg-neonGreen/10 font-medium"
                        >
                            <User className="w-4 h-4" />
                            Input Manual Pemain
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
