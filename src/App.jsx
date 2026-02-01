import { Routes, Route } from 'react-router-dom'
import { AdProvider } from './contexts/AdContext'
import { ToastProvider } from './contexts/ToastContext'
import { AuthProvider, RequireAuth, RequireGuest, RequireAdmin } from './contexts/AuthContext'
import LandingPage from './pages/landing/LandingPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import OtpPage from './pages/auth/OtpPage'
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
import MyProfile from './pages/dashboard/MyProfile'
import Competitions from './pages/dashboard/Competitions'
import Stream from './pages/dashboard/Stream'
import StreamDetail from './pages/dashboard/StreamDetail'
import JoinCompetition from './pages/dashboard/JoinCompetition'
import PublicLayout from './layouts/PublicLayout'
import TournamentPublicView from './pages/public/TournamentPublicView'
import MatchPublicView from './pages/public/MatchPublicView'
import UserTournamentDetail from './pages/dashboard/UserTournamentDetail'
import UserMatchDetail from './pages/dashboard/UserMatchDetail'
import UserNewsDetail from './pages/dashboard/UserNewsDetail'
import AdminLayout from './layouts/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminComplaint from './pages/admin/AdminComplaint'
import AdminTransaction from './pages/admin/AdminTransaction'
import AdminAIAnalysis from './pages/admin/AdminAIAnalysis'
import AdminHistory from './pages/admin/AdminHistory'
import UsernameModal from './components/modals/UsernameModal'
import CoinClaimModal from './components/modals/CoinClaimModal'


function App() {
    return (
        <ToastProvider>
            <AuthProvider>
                <AdProvider>
                    <Routes>
                        {/* Landing Page */}
                        <Route path="/" element={<LandingPage />} />

                        {/* Auth Pages - Guest Only */}
                        <Route path="/login" element={
                            <RequireGuest>
                                <LoginPage />
                            </RequireGuest>
                        } />
                        <Route path="/register" element={
                            <RequireGuest>
                                <RegisterPage />
                            </RequireGuest>
                        } />
                        <Route path="/verify-otp" element={<OtpPage />} />

                        {/* Public Join Route */}
                        <Route path="/join/:id" element={<JoinCompetition />} />

                        {/* Public Tournament View (Guest) */}
                        <Route path="/t" element={<PublicLayout />}>
                            <Route path=":slug" element={<TournamentPublicView />} />
                            <Route path=":slug/match/:matchId" element={<MatchPublicView />} />
                        </Route>


                        {/* Admin Routes - Protected (Admin/Superadmin Only) */}
                        <Route path="/admin" element={
                            <RequireAdmin>
                                <AdminLayout />
                            </RequireAdmin>
                        }>
                            <Route index element={<AdminDashboard />} />
                            <Route path="users" element={<AdminUsers />} />
                            <Route path="complaint" element={<AdminComplaint />} />
                            <Route path="transaction" element={<AdminTransaction />} />
                            <Route path="ai-analysis" element={<AdminAIAnalysis />} />
                            <Route path="history" element={<AdminHistory />} />
                        </Route>

                        {/* Dashboard Routes - Protected */}
                        <Route path="/dashboard" element={
                            <RequireAuth>
                                <DashboardLayout />
                            </RequireAuth>
                        }>
                            <Route index element={<Dashboard />} />
                            <Route path="tournaments" element={<TournamentList />} />
                            <Route path="tournaments/new" element={<CreateTournament />} />
                            <Route path="competitions" element={<Competitions />} />
                            <Route path="competitions/:id/join" element={<JoinCompetition />} />
                            <Route path="competitions/:id/view" element={<UserTournamentDetail />} />
                            <Route path="competitions/:id/view/match/:matchId" element={<UserMatchDetail />} />
                            <Route path="stream" element={<Stream />} />
                            <Route path="stream/:id" element={<StreamDetail />} />
                            <Route path="tournaments/:id" element={<TournamentDetail />} />
                            <Route path="tournaments/:id/view" element={<UserTournamentDetail />} />
                            <Route path="tournaments/:id/view/news/:newsId" element={<UserNewsDetail />} />
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
                            <Route path="my-profile" element={<MyProfile />} />

                        </Route>
                    </Routes>

                    {/* Global Modals */}
                    <UsernameModal />
                    <CoinClaimModal />
                </AdProvider>
            </AuthProvider>
        </ToastProvider>
    )
}

export default App
