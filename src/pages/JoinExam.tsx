import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Loader2, CheckCircle2, AlertTriangle, ChevronRight } from 'lucide-react'
import { useTeams } from '../teams'
import { useAuth } from '../context/AuthContext'

const JoinExam: React.FC = () => {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const { acceptInvitationByToken } = useTeams()
  const { user, loading: authLoading } = useAuth()
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      // Save the join path to redirect after login
      sessionStorage.setItem('redirectAfterLogin', window.location.pathname)
      navigate('/login')
      return
    }

    if (token) {
      handleJoin()
    }
  }, [token, user, authLoading])

  const handleJoin = async () => {
    try {
      const success = await acceptInvitationByToken(token!)
      if (success) {
        setStatus('success')
        // Automatically redirect after 3 seconds
        setTimeout(() => {
          navigate('/dashboard/equipes')
        }, 3000)
      } else {
        setStatus('error')
        setErrorMessage('Cette invitation est invalide ou a déjà été utilisée.')
      }
    } catch (err) {
      setStatus('error')
      setErrorMessage('Une erreur est survenue lors de l\'acceptation de l\'invitation.')
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="bg-surface border border-border-subtle rounded-[2.5rem] p-10 w-full max-w-md card-shadow text-center">
        {status === 'loading' && (
          <div className="space-y-6">
            <Loader2 className="animate-spin text-primary mx-auto" size={48} />
            <h2 className="text-2xl font-google-bold text-textcol">Traitement de l'invitation...</h2>
            <p className="text-secondary">Veuillez patienter pendant que nous vous ajoutons au projet.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-6 animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="text-2xl font-google-bold text-textcol">Invitation acceptée !</h2>
            <p className="text-secondary text-sm leading-relaxed">
              Félicitations ! Vous avez rejoint l'équipe de collaboration. Vous allez être redirigé vers votre tableau de bord.
            </p>
            <button 
              onClick={() => navigate('/dashboard/equipes')}
              className="w-full py-4 bg-primary text-white rounded-2xl font-google-bold flex items-center justify-center gap-2 hover:brightness-110 transition-all shadow-lg shadow-primary/20"
            >
              Aller aux équipes
              <ChevronRight size={18} />
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-6 animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={40} />
            </div>
            <h2 className="text-2xl font-google-bold text-textcol">Oups !</h2>
            <p className="text-secondary text-sm leading-relaxed">
              {errorMessage}
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => navigate('/dashboard')}
                className="w-full py-4 bg-textcol text-surface rounded-2xl font-google-bold hover:brightness-125 transition-all shadow-lg"
              >
                Retour au tableau de bord
              </button>
              <button 
                onClick={() => navigate('/')}
                className="text-primary text-sm font-google-bold hover:underline"
              >
                Page d'accueil
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default JoinExam
