import { Routes, Route } from 'react-router-dom'
import { AdProvider } from './contexts/AdContext'
import LandingPage from './pages/landing/LandingPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import DashboardLayout from './layouts/DashboardLayout'
import Dashboard from './pages/dashboard/Dashboard'
import TournamentList from './pages/dashboard/TournamentList'
import CreateTournament from './pages/dashboard/CreateTournament'
import TournamentDetail from './pages/dashboard/TournamentDetail'
import Standings from './pages/dashboard/Standings'
import Fixtures from './pages/dashboard/Fixtures'
import Players from './pages/dashboard/Players'
import AddPlayer from './pages/dashboard/AddPlayer'

function App() {
    return (
        <AdProvider>
            <Routes>
                {/* Landing Page */}
                <Route path="/" element={<LandingPage />} />

                {/* Auth Pages */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Dashboard Routes */}
                <Route path="/dashboard" element={<DashboardLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="tournaments" element={<TournamentList />} />
                    <Route path="tournaments/new" element={<CreateTournament />} />
                    <Route path="tournaments/:id" element={<TournamentDetail />} />
                    <Route path="tournaments/:id/standings" element={<Standings />} />
                    <Route path="tournaments/:id/fixtures" element={<Fixtures />} />
                    <Route path="tournaments/:id/players" element={<Players />} />
                    <Route path="tournaments/:id/players/add" element={<AddPlayer />} />
                </Route>
            </Routes>
        </AdProvider>
    )
}

export default App
