import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  onRequestDemo?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onRequestDemo }) => {
  // Changement : logout -> signOut
  const { user, isAuthenticated, signOut } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Fonction pour obtenir les initiales
  const getInitials = () => {
    if (!user) return 'U';
    
    // Dans le nouveau contexte, on utilise user_metadata de Supabase
    const nom = user.user_metadata?.nom;
    const prenom = user.user_metadata?.prenom;

    if (nom && prenom) {
      return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
    }
    
    return user.email?.charAt(0).toUpperCase() || 'U';
  };

  const handleLogout = async () => {
    await signOut(); // Utilisation de signOut du contexte
    setShowUserMenu(false);
  };

  const goToDashboard = () => {
    navigate('/dashboard');
    setShowUserMenu(false);
  };

  // On extrait le nom complet pour l'affichage
  const displayName = user?.user_metadata?.prenom 
    ? `${user.user_metadata.prenom} ${user.user_metadata.nom}`
    : user?.email?.split('@')[0];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/80 border-b border-primary/10">
      <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 18c-3.86-.96-7-5.06-7-9V8.3l7-3.12 7 3.12V11c0 3.94-3.14 8.04-7 9z" />
            </svg>
          </div>
          <span className="text-xl font-google-bold text-textcol">SAJE</span>
        </Link>

        {/* Navigation Links - Cachés si connecté */}
        {!isAuthenticated && (
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-textcol/80 hover:text-primary transition-colors">
              Features
            </a>
            <a href="#workflow" className="text-textcol/80 hover:text-primary transition-colors">
              Tutoriel
            </a>
            <a href="#pricing" className="text-textcol/80 hover:text-primary transition-colors">
              Tarifs
            </a>
          </div>
        )}

        {/* Boutons selon l'état d'authentification */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <button
                onClick={goToDashboard}
                className="hidden md:flex items-center gap-2 text-textcol/80 hover:text-primary transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </svg>
                <span className="font-google-bold">Dashboard</span>
              </button>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-surface transition-colors"
                >
                  <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center text-white font-google-bold text-sm">
                    {getInitials()}
                  </div>
                  <span className="hidden md:block text-textcol font-google-bold text-sm">
                    {displayName || 'Mon compte'}
                  </span>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    strokeWidth={2} 
                    stroke="currentColor" 
                    className={`w-4 h-4 text-textcol/60 transition-transform ${showUserMenu ? 'rotate-180' : ''}`}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowUserMenu(false)}
                    />
                    
                    <div className="absolute right-0 mt-2 w-64 bg-surface border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl overflow-hidden z-50">
                      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                        <p className="font-google-bold text-sm text-textcol">
                          {displayName}
                        </p>
                        <p className="text-xs text-textcol/60 truncate">{user?.email}</p>
                      </div>

                      <div className="py-2">
                        <button
                          onClick={goToDashboard}
                          className="w-full px-4 py-2 text-left text-sm text-textcol hover:bg-background transition-colors flex items-center gap-3"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                          </svg>
                          Dashboard
                        </button>

                        <Link
                          to="/dashboard/parametres"
                          onClick={() => setShowUserMenu(false)}
                          className="w-full px-4 py-2 text-left text-sm text-textcol hover:bg-background transition-colors flex items-center gap-3"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Paramètres
                        </Link>
                      </div>

                      <div className="border-t border-gray-200 dark:border-gray-800 py-2">
                        <button
                          onClick={handleLogout}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-3"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                          </svg>
                          Déconnexion
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login">
                <button className="text-textcol/80 hover:text-primary transition-colors hidden md:block">
                  Se Connecter
                </button>
              </Link>

              <button
                onClick={onRequestDemo}
                className="bg-primary text-white px-6 py-2 rounded-lg hover:opacity-90 transition-opacity font-google-bold"
              >
                Demander une démo
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};