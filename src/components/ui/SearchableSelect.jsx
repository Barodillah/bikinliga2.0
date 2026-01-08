import React, { useState, useRef, useEffect } from 'react'
import { Search, ChevronDown, X } from 'lucide-react'

export default function SearchableSelect({
    options = [],
    value,
    onChange,
    placeholder = 'Cari...',
    label,
    disabled = false
}) {
    const [isOpen, setIsOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const containerRef = useRef(null)
    const inputRef = useRef(null)

    // Get current selected option label
    const selectedOption = options.find(opt => opt.value === value)

    // Filter options based on search term
    const filteredOptions = options.filter(opt =>
        opt.value !== '' && // Exclude placeholder
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    )

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

    // Handle option selection
    const handleSelect = (optValue) => {
        onChange({ target: { value: optValue } })
        setIsOpen(false)
        setSearchTerm('')
    }

    // Clear selection
    const handleClear = (e) => {
        e.stopPropagation()
        onChange({ target: { value: '' } })
        setSearchTerm('')
    }

    return (
        <div className="relative" ref={containerRef}>
            {label && (
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    {label}
                </label>
            )}

            {/* Main input/trigger */}
            <div
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`w-full px-4 py-3 rounded-lg border bg-white/5 text-white 
                    flex items-center justify-between cursor-pointer transition
                    ${isOpen ? 'border-neonGreen ring-1 ring-neonGreen/20' : 'border-white/10 hover:border-white/30'}
                    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <span className={selectedOption?.value ? 'text-white' : 'text-gray-500'}>
                    {selectedOption?.label || placeholder}
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
                <div className="absolute z-50 w-full mt-2 bg-gray-900 border border-white/10 rounded-lg shadow-xl overflow-hidden">
                    {/* Search input */}
                    <div className="p-3 border-b border-white/10">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                ref={inputRef}
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Ketik untuk mencari..."
                                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg
                                    text-white placeholder-gray-500 focus:outline-none focus:border-neonGreen
                                    text-sm"
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Options list */}
                    <div className="max-h-60 overflow-y-auto">
                        {filteredOptions.length === 0 ? (
                            <div className="px-4 py-3 text-gray-500 text-sm text-center">
                                Tidak ditemukan hasil untuk "{searchTerm}"
                            </div>
                        ) : (
                            filteredOptions.slice(0, 100).map((opt) => (
                                <div
                                    key={opt.value}
                                    onClick={() => handleSelect(opt.value)}
                                    className={`px-4 py-2.5 cursor-pointer transition text-sm
                                        ${opt.value === value
                                            ? 'bg-neonGreen/20 text-neonGreen'
                                            : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}
                                >
                                    {opt.label}
                                </div>
                            ))
                        )}
                        {filteredOptions.length > 100 && (
                            <div className="px-4 py-2 text-gray-500 text-xs text-center border-t border-white/10">
                                Menampilkan 100 dari {filteredOptions.length} hasil. Ketik untuk mempersempit pencarian.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
