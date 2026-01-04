import './App.css'
import { Routes, Route, BrowserRouter } from 'react-router-dom'
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
import ExamDetail from './pages/ExamDetail'
import CorrectionResults from './pages/CorrectionResults'
import ExamsProvider from './exams'

function App() {
  return (
    <AuthProvider> {/* Le provider englobe toute l'application */}
      <ExamsProvider>
        <Routes>
          {/* Routes Publiques */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

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
            <Route path="statistiques" element={<Statistiques />} />
            <Route path="support" element={<Support />} />
            <Route path="parametres" element={<Parametres />} />
          </Route>

          {/* 404 - Toujours en dernier */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ExamsProvider>
        
        
    </AuthProvider>
  )
}

export default App