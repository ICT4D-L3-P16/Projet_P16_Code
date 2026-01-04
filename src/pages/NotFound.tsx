import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import sajeLogo from '../assets/images/logo/saje_mini.png'

const NotFound: React.FC = () => {
    const navigate = useNavigate()
    const [countdown, setCountdown] = useState(10)

    useEffect(() => {
        // Décompte automatique avant redirection
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer)
                    navigate('/')
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [navigate])

    return (
        <div className='min-h-screen w-full bg-gradient-to-br from-background via-surface to-background text-textcol font-google flex items-center justify-center p-4 relative overflow-hidden'>
            
            {/* Éléments décoratifs animés */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl animate-pulse delay-500"></div>
            </div>

            <div className='relative z-10 max-w-4xl w-full text-center'>
                
                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <Link to="/" className="hover:scale-110 transition-transform duration-300">
                        <img src={sajeLogo} alt="SAJE Logo" className="w-20 h-20 object-contain" />
                    </Link>
                </div>

                {/* Illustration 404 avec animation */}
                <div className="mb-8 relative">
                    <div className="text-[180px] sm:text-[220px] font-google-bold leading-none text-textcol select-none">
                        404
                    </div>
                    
                    {/* Personnage perdu (emoji animé) */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <div className="text-6xl sm:text-7xl animate-bounce">
                            🔍
                        </div>
                    </div>
                </div>

                {/* Titre et description */}
                <h1 className="text-4xl sm:text-5xl font-google-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    Page introuvable
                </h1>
                
                <p className="text-lg sm:text-xl opacity-70 mb-8 max-w-2xl mx-auto leading-relaxed">
                    Oups ! Il semblerait que cette page se soit égarée dans l'espace digital. 
                    Pas de panique, nous allons vous ramener en terrain connu.
                </p>



                {/* Compteur de redirection */}
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-surface/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-full text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-primary animate-spin">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                    <span className="opacity-70">
                        Redirection automatique dans <span className="font-google-bold text-primary">{countdown}s</span>
                    </span>
                </div>

                {/* Code d'erreur technique */}
                <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
                    <p className="text-xs opacity-40 font-mono">
                        ERROR_CODE: 404 | PAGE_NOT_FOUND | TIMESTAMP: {new Date().toISOString()}
                    </p>
                </div>
            </div>

            {/* Particules flottantes décoratives */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-2 h-2 bg-primary/20 rounded-full animate-float"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${5 + Math.random() * 10}s`
                        }}
                    />
                ))}
            </div>

            <style>{`
                @keyframes float {
                    0%, 100% {
                        transform: translateY(0) translateX(0);
                        opacity: 0;
                    }
                    50% {
                        transform: translateY(-100px) translateX(50px);
                        opacity: 0.5;
                    }
                }
                .animate-float {
                    animation: float linear infinite;
                }
                .delay-500 {
                    animation-delay: 0.5s;
                }
                .delay-1000 {
                    animation-delay: 1s;
                }
            `}</style>
        </div>
    )
}

export default NotFound