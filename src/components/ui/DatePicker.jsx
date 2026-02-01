import React, { useState, useEffect, useRef } from 'react'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react'
import Button from './Button'

export default function DatePicker({
    label,
    value,
    onChange,
    minDate,
    maxDate,
    placeholder = 'Pilih tanggal',
    disabled = false,
    className = ''
}) {
    const [isOpen, setIsOpen] = useState(false)
    const [viewDate, setViewDate] = useState(new Date()) // For navigating months
    const [selectedDate, setSelectedDate] = useState(null)
    const modalRef = useRef(null)

    // Parse initial value
    useEffect(() => {
        if (value) {
            const date = new Date(value)
            if (!isNaN(date.getTime())) {
                setSelectedDate(date)
                setViewDate(date)
            }
        }
    }, [value])

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [isOpen])

    const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ]

    const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate()
    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay()

    const handlePrevMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))
    }

    const handleNextMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))
    }

    const handleDateSelect = (day) => {
        const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day)
        // Adjust for timezone offset to ensure YYYY-MM-DD matches local selection.
        // We manually construct formatted string to avoid timezone shifts on simple dates.
        const year = newDate.getFullYear()
        const month = String(newDate.getMonth() + 1).padStart(2, '0')
        const d = String(day).padStart(2, '0')
        const formatted = `${year}-${month}-${d}`

        onChange(formatted)
        setSelectedDate(newDate)
        setIsOpen(false)
    }

    const isToday = (day) => {
        const today = new Date()
        return day === today.getDate() &&
            viewDate.getMonth() === today.getMonth() &&
            viewDate.getFullYear() === today.getFullYear()
    }

    const isSelected = (day) => {
        if (!selectedDate) return false
        return day === selectedDate.getDate() &&
            viewDate.getMonth() === selectedDate.getMonth() &&
            viewDate.getFullYear() === selectedDate.getFullYear()
    }

    const renderCalendarDays = () => {
        const daysInMonth = getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth())
        const firstDay = getFirstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth())
        const calendarDays = []

        // Empty slots for previous month
        for (let i = 0; i < firstDay; i++) {
            calendarDays.push(<div key={`empty-${i}`} className="p-2"></div>)
        }

        // Days
        for (let i = 1; i <= daysInMonth; i++) {
            calendarDays.push(
                <button
                    key={i}
                    type="button"
                    onClick={() => handleDateSelect(i)}
                    className={`
                        w-full aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition relative
                        ${isSelected(i)
                            ? 'bg-neonGreen text-black font-bold shadow-lg shadow-neonGreen/20'
                            : 'text-white hover:bg-white/10'
                        }
                        ${isToday(i) && !isSelected(i) ? 'bg-white/5 border border-white/20' : ''}
                    `}
                >
                    {i}
                    {isToday(i) && !isSelected(i) && (
                        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-neonPink"></div>
                    )}
                </button>
            )
        }

        return calendarDays
    }

    const formatDateDisplay = (dateStr) => {
        if (!dateStr) return null
        const date = new Date(dateStr)
        if (isNaN(date.getTime())) return null
        return date.toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    return (
        <div className={className}>
            {label && (
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    {label}
                </label>
            )}

            {/* Input Trigger */}
            <div
                onClick={() => !disabled && setIsOpen(true)}
                className={`
                    w-full px-4 py-3 rounded-lg border bg-white/5 
                    flex items-center justify-between cursor-pointer transition
                    ${isOpen ? 'border-neonGreen ring-1 ring-neonGreen/20' : 'border-white/10 hover:border-white/30'}
                    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
            >
                <div className="flex items-center gap-3">
                    <CalendarIcon className={`w-5 h-5 ${value ? 'text-neonGreen' : 'text-gray-500'}`} />
                    <span className={value ? 'text-white' : 'text-gray-500'}>
                        {formatDateDisplay(value) || placeholder}
                    </span>
                </div>
            </div>

            {/* Modal / Popover */}
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div
                        ref={modalRef}
                        className="bg-[#1a1b1e] border-t md:border border-white/10 rounded-t-2xl md:rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in slide-in-from-bottom-10 md:zoom-in-95 duration-200"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <CalendarIcon className="w-5 h-5 text-neonGreen" />
                                Pilih Tanggal
                            </h3>
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Calendar Controls */}
                        <div className="p-4">
                            <div className="flex items-center justify-between mb-6">
                                <button
                                    type="button"
                                    onClick={handlePrevMonth}
                                    className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <div className="text-white font-medium text-lg">
                                    {months[viewDate.getMonth()]} {viewDate.getFullYear()}
                                </div>
                                <button
                                    type="button"
                                    onClick={handleNextMonth}
                                    className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Days Header */}
                            <div className="grid grid-cols-7 mb-2">
                                {days.map(day => (
                                    <div key={day} className="text-center text-xs font-bold text-gray-500 py-2 uppercase tracking-wider">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Calendar Grid */}
                            <div className="grid grid-cols-7 gap-1">
                                {renderCalendarDays()}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-white/10 flex justify-end bg-white/5">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsOpen(false)}
                                className="mr-0"
                            >
                                Batal
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
