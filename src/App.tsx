import './App.css'
import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Register from './pages/Register'
import NotFound from './pages/NotFound'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './routes/ProtectedRoute'

// Imports Dashboard
import Dashboard from './pages/Dashboard'
import { Accueil } from './components/Dashboard/Accueil'
import { Examens } from './components/Dashboard/Examen'
import { Statistiques } from './components/Dashboard/Statistiques'
import { Support } from './components/Dashboard/Support'
import { Parametres } from './components/Dashboard/Parametre'
import { Notifications } from './components/Dashboard/Notifications'
import ExamDetail from './pages/ExamDetail'
import CorrectionResults from './pages/CorrectionResults'
import { Equipes } from './components/Dashboard/Equipes'
import { EquipeDetail } from './components/Dashboard/EquipeDetail'
import JoinExam from './pages/JoinExam'
import ExamsProvider from './exams'
import { NotificationsProvider } from './notifications'
import { TeamsProvider } from './teams'

function App() {
  return (
    <AuthProvider> {/* Le provider englobe toute l'application */}
      <NotificationsProvider>
        <ExamsProvider>
          <TeamsProvider>
            <Routes>
              {/* Routes Publiques */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/join/:token" element={<JoinExam />} />

              {/* Routes Privées (Imbriquées) */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              >
                {/* Route par défaut pour /dashboard */}
                <Route index element={<Accueil />} /> 
                
                {/* Routes relatives : /dashboard/examens, etc. */}
                <Route path="examens" element={<Examens />} />
                <Route path="examens/:id" element={<ExamDetail />} />
                <Route path="examens/:id/resultats" element={<CorrectionResults />} />
                <Route path="equipes" element={<Equipes />} />
                <Route path="equipes/:id" element={<EquipeDetail />} />
                <Route path="statistiques" element={<Statistiques />} />
                <Route path="support" element={<Support />} />
                <Route path="parametres" element={<Parametres />} />
                <Route path="notifications" element={<Notifications />} />
              </Route>

              {/* 404 - Toujours en dernier */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TeamsProvider>
        </ExamsProvider>
      </NotificationsProvider>
    </AuthProvider>
  )
}

export default App