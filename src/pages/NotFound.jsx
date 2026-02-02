import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ArrowLeft, Home, LayoutDashboard } from 'lucide-react'

export default function NotFound() {
    const { user } = useAuth()

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full text-center">
                {/* Illustration placeholder or Icon */}
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                    <span className="text-4xl">🤔</span>
                    <div className="absolute -bottom-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full border-4 border-gray-50">
                        404
                    </div>
                </div>

                <h1 className="text-4xl font-display font-bold text-gray-900 mb-2">
                    Page Not Found
                </h1>

                <p className="text-gray-500 mb-8">
                    Oops! The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        to={user ? "/dashboard" : "/"}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition shadow-lg shadow-gray-200"
                    >
                        {user ? (
                            <>
                                <LayoutDashboard className="w-5 h-5" />
                                Back to Dashboard
                            </>
                        ) : (
                            <>
                                <Home className="w-5 h-5" />
                                Back to Home
                            </>
                        )}
                    </Link>

                    <button
                        onClick={() => window.history.back()}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition border border-gray-200"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Go Back
                    </button>
                </div>
            </div>

            <div className="mt-12 text-sm text-gray-400">
                &copy; {new Date().getFullYear()} BikinLiga. All rights reserved.
            </div>
        </div>
    )
}
