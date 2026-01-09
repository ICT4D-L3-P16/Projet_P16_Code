import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ThemeToggle } from '../components/LandingPage/ThemeToggle'
import sajeLogo from '../assets/images/logo/logo-white-transparent.png'

const Login: React.FC = () => {
    const navigate = useNavigate()
    const { signIn } = useAuth() // Changement : login -> signIn
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({})
    
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false
    })

    const validateForm = (): boolean => {
        const newErrors: { email?: string; password?: string } = {}

        if (!formData.email.trim()) {
            newErrors.email = 'L\'email est requis'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Format d\'email invalide'
        }

        if (!formData.password) {
            newErrors.password = 'Le mot de passe est requis'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
        
        if (errors[name as keyof typeof errors]) {
            setErrors(prev => ({ ...prev, [name]: undefined }))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErrors({})

        if (!validateForm()) return

        setIsLoading(true)

        try {
            // Utilisation de la méthode signIn du nouveau AuthContext
            const { error } = await signIn(formData.email, formData.password)
            
            if (error) throw error

            // Redirection vers le dashboard après succès
            navigate('/dashboard')

        } catch (error: any) {
            console.error('Erreur de connexion:', error)
            
            // Gestion des erreurs spécifiques de Supabase (AuthApiError)
            if (error.message === 'Invalid login credentials' || error.status === 400) {
                setErrors({ general: 'Email ou mot de passe incorrect.' })
            } else if (error.message === 'Email not confirmed') {
                setErrors({ general: 'Veuillez confirmer votre adresse email avant de vous connecter.' })
            } else {
                setErrors({ 
                    general: error.message || 'Une erreur est survenue lors de la connexion.' 
                })
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className='flex h-screen w-full bg-background text-textcol font-google transition-colors duration-300'>
            
            {/* --- SECTION GAUCHE : Visuel --- */}
            <div className='hidden lg:flex w-1/2 bg-surface relative overflow-hidden'>
                <div className="absolute inset-0 bg-surface/40 z-10"></div>
                
                <img 
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80" 
                    alt="Collaboration" 
                    className="absolute inset-0 object-cover w-full h-full opacity-40"
                />

                <div className='relative z-20 flex flex-col py-10 px-16 text-white'>
                    <div className="mb-8 mt-0">
                        <img src={sajeLogo} alt="SAJE Logo" className="w-40 h-40 object-contain" />
                    </div>

                    <h1 className="text-5xl text-textcol font-google-bold leading-tight mb-6">
                        Optimisez la gestion de vos Examens avec <span className="text-primary">SAJE</span>
                    </h1>
                    <p className='text-lg text-textcol opacity-90 max-w-md leading-relaxed'>
                        La solution tout-en-un pour la gestion, la correction et la collaboration d'équipe pour vos Examens.
                    </p>

                    <div className="mt-12 flex items-center gap-4">
                        <div className="flex -space-x-2">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-surface bg-gray-500 flex items-center justify-center text-[10px]">Img</div>
                            ))}
                        </div>
                        <p className="text-sm text-textcol opacity-80 font-google-bold">Plus de 500 institutions nous font confiance</p>
                    </div>
                </div>
            </div>

            {/* --- SECTION DROITE : Formulaire --- */}
            <div className='w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24 relative'>
                
                <div className="absolute top-8 right-8 flex items-center gap-6">
                    <p className="hidden sm:block text-sm opacity-60">
                        Pas de compte ? 
                        <Link to="/register" className="ml-2 text-primary font-google-bold hover:underline">
                            S'inscrire
                        </Link>
                    </p>
                    <ThemeToggle />
                </div>

                <div className="max-w-md w-full mx-auto">
                    <h2 className='text-4xl font-google-bold mb-2'>Bon retour !</h2>
                    <p className="opacity-60 mb-10">Veuillez vous connecter pour accéder à votre espace.</p>

                    {/* Message d'erreur général */}
                    {errors.general && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm flex items-start gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <span>{errors.general}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                        <div>
                            <label htmlFor="email" className="block text-sm font-google-bold mb-2">
                                Email
                            </label>
                            <input 
                                id="email"
                                name="email"
                                type="email" 
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="ex: contact@saje.fr"
                                disabled={isLoading}
                                className={`w-full px-4 py-3 rounded-xl border ${
                                    errors.email 
                                        ? 'border-red-500 focus:ring-red-500' 
                                        : 'border-gray-200 dark:border-gray-700 focus:ring-primary'
                                } bg-surface text-textcol focus:ring-2 outline-none transition-all placeholder:opacity-50 disabled:opacity-50`}
                            />
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-google-bold mb-2">
                                Mot de passe
                            </label>
                            <div className="relative">
                                <input 
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    placeholder="Entrez votre mot de passe"
                                    disabled={isLoading}
                                    className={`w-full px-4 py-3 rounded-xl border ${
                                        errors.password 
                                            ? 'border-red-500 focus:ring-red-500' 
                                            : 'border-gray-200 dark:border-gray-700 focus:ring-primary'
                                    } bg-surface text-textcol focus:ring-2 outline-none transition-all placeholder:opacity-50 disabled:opacity-50`}
                                />
                                <button 
                                    type="button" 
                                    onClick={() => setShowPassword(!showPassword)}
                                    disabled={isLoading}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
                                >
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.644C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
                            )}
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <label htmlFor="rememberMe" className="flex items-center gap-2 cursor-pointer group">
                                <input 
                                    id="rememberMe"
                                    name="rememberMe"
                                    type="checkbox"
                                    checked={formData.rememberMe}
                                    onChange={handleInputChange}
                                    disabled={isLoading}
                                    className="w-4 h-4 rounded border-gray-300 accent-primary focus:ring-0 focus:ring-offset-0" 
                                />
                                <span className="group-hover:text-primary transition-colors">Se souvenir de moi</span>
                            </label>
                            <Link 
                                to="/forgot-password" 
                                className="text-primary font-google-bold hover:underline"
                            >
                                Mot de passe oublié ?
                            </Link>
                        </div>

                        <button 
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-br from-primary to-accent hover:brightness-110 text-background font-google-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Connexion en cours...</span>
                                </>
                            ) : (
                                <>
                                    <span>Se connecter</span>
                                    <span>→</span>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer d'assistance */}
                    <div className="mt-10 pt-6 border-t border-gray-100 dark:border-gray-800 text-center">
                        <p className="text-sm opacity-60">
                            Un problème d'accès ? 
                            <button 
                                type="button"
                                className="ml-1 text-textcol font-google-bold hover:underline decoration-primary"
                            >
                                Contactez le support
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login