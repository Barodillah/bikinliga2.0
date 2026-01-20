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
import TournamentSettings from './pages/dashboard/TournamentSettings'
import Standings from './pages/dashboard/Standings'
import Fixtures from './pages/dashboard/Fixtures'
import MatchManagement from './pages/dashboard/MatchManagement'
import Players from './pages/dashboard/Players'
import AddPlayer from './pages/dashboard/AddPlayer'
import TopUp from './pages/dashboard/TopUp'
import EClub from './pages/dashboard/EClub'
import CommunityDetail from './pages/dashboard/CommunityDetail'
import Ranking from './pages/dashboard/Ranking'
import Settings from './pages/dashboard/Settings'
import Profile from './pages/dashboard/Profile'
import Competitions from './pages/dashboard/Competitions'
import Stream from './pages/dashboard/Stream'
import StreamDetail from './pages/dashboard/StreamDetail'
import JoinCompetition from './pages/dashboard/JoinCompetition'
import PublicLayout from './layouts/PublicLayout'
import TournamentPublicView from './pages/public/TournamentPublicView'
import MatchPublicView from './pages/public/MatchPublicView'
import UserTournamentDetail from './pages/dashboard/UserTournamentDetail'
import UserMatchDetail from './pages/dashboard/UserMatchDetail'


function App() {
    return (
        <AdProvider>
            <Routes>
                {/* Landing Page */}
                <Route path="/" element={<LandingPage />} />

                {/* Auth Pages */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Public Join Route */}
                <Route path="/join/:id" element={<JoinCompetition />} />

                {/* Public Tournament View (Guest) */}
                <Route path="/t" element={<PublicLayout />}>
                    <Route path=":slug" element={<TournamentPublicView />} />
                    <Route path=":slug/match/:matchId" element={<MatchPublicView />} />
                </Route>

                {/* Dashboard Routes */}
                <Route path="/dashboard" element={<DashboardLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="tournaments" element={<TournamentList />} />
                    <Route path="tournaments/new" element={<CreateTournament />} />
                    <Route path="competitions" element={<Competitions />} />
                    <Route path="competitions/:id/join" element={<JoinCompetition />} />
                    <Route path="stream" element={<Stream />} />
                    <Route path="stream/:id" element={<StreamDetail />} />
                    <Route path="tournaments/:id" element={<TournamentDetail />} />
                    <Route path="tournaments/:id/view" element={<UserTournamentDetail />} />
                    <Route path="tournaments/:id/view/match/:matchId" element={<UserMatchDetail />} />
                    <Route path="tournaments/:id/settings" element={<TournamentSettings />} />
                    <Route path="tournaments/:id/standings" element={<Standings />} />
                    <Route path="tournaments/:id/fixtures" element={<Fixtures />} />
                    <Route path="tournaments/:id/players" element={<Players />} />
                    <Route path="tournaments/:id/players/add" element={<AddPlayer />} />
                    <Route path="tournaments/:id/match/:matchId" element={<MatchManagement />} />
                    <Route path="topup" element={<TopUp />} />
                    <Route path="eclub" element={<EClub />} />
                    <Route path="eclub/community/:id" element={<CommunityDetail />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="ranking" element={<Ranking />} />
                    <Route path="profile/:username" element={<Profile />} />

                </Route>
            </Routes>
        </AdProvider>
    )
}

export default App
