import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { ThemeToggle } from '../components/LandingPage/ThemeToggle'
import sajeLogo from '../assets/images/logo/logo-white-transparent.png'

const Register: React.FC = () => {
    const navigate = useNavigate()
    const [showPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        acceptTerms: false
    })

    const [errors, setErrors] = useState<{
        fullName?: string
        email?: string
        password?: string
        confirmPassword?: string
        terms?: string
        general?: string
    }>({})

    const validateForm = (): boolean => {
        const newErrors: typeof errors = {}

        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Le nom complet est requis'
        } else if (formData.fullName.trim().split(' ').length < 2) {
            newErrors.fullName = 'Veuillez entrer votre nom et votre prénom'
        }

        if (!formData.email.trim()) {
            newErrors.email = 'L\'email est requis'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Format d\'email invalide'
        }

        if (formData.password.length < 8) {
            newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères'
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
            newErrors.password = 'Il faut une majuscule, une minuscule et un chiffre'
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Les mots de passe ne correspondent pas'
        }

        if (!formData.acceptTerms) {
            newErrors.terms = 'Veuillez accepter les conditions'
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
        if (!validateForm()) return

        setIsLoading(true)
        setErrors({})

        // Séparation du nom et du prénom pour le trigger SQL
        const nameParts = formData.fullName.trim().split(' ')
        const firstName = nameParts[0]
        const lastName = nameParts.slice(1).join(' ')

        try {
            const { data, error } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        nom: lastName || '', // Clé attendue par ton trigger
                        prenom: firstName,   // Clé attendue par ton trigger
                        full_name: formData.fullName // Optionnel
                    },
                },
            })

            if (error) throw error

            if (data.user) {
                // Si la confirmation d'email est activée dans Supabase
                if (data.session === null) {
                    navigate('/login', { 
                        state: { message: 'Veuillez confirmer votre email pour activer votre compte.' } 
                    })
                } else {
                    navigate('/dashboard')
                }
            }
        } catch (error: any) {
            console.error('Erreur inscription:', error)
            setErrors({ general: error.message || "Une erreur est survenue lors de l'inscription." })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className='flex h-screen w-full bg-background text-textcol font-google transition-colors duration-300'>
            
            {/* --- SECTION GAUCHE --- */}
            <div className='hidden lg:flex w-1/2 bg-surface relative overflow-hidden'>
                <div className="absolute inset-0 bg-surface/40 z-10"></div>
                <img 
                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80" 
                    alt="Team work" 
                    className="absolute inset-0 object-cover w-full h-full opacity-40"
                />
                <div className='relative z-20 flex flex-col justify-center px-16 text-white'>
                    <img src={sajeLogo} alt="SAJE" className="w-32 h-32 mb-8 object-contain" />
                    <h1 className="text-5xl text-textcol font-google-bold leading-tight mb-6">
                        Génerer vos projets avec <span className="text-primary">précision</span>.
                    </h1>
                    <p className='text-lg text-textcol opacity-80 max-w-md leading-relaxed'>
                        Rejoignez SAJE et centralisez vos efforts d'équipe dans une plateforme sécurisée et intuitive.
                    </p>
                </div>
            </div>

            {/* --- SECTION DROITE --- */}
            <div className='w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24 relative overflow-y-auto'>
                <div className="absolute top-8 right-8 flex items-center gap-6">
                    <ThemeToggle />
                </div>

                <div className="max-w-md w-full mx-auto py-12">
                    <h2 className='text-4xl font-google-bold mb-2'>Inscription</h2>
                    <p className="opacity-60 mb-8">Créez votre accès collaborateur en quelques secondes.</p>

                    {errors.general && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm flex items-start gap-2">
                             <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <span>{errors.general}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                        <div>
                            <label className="block text-sm font-google-bold mb-2">Nom complet</label>
                            <input 
                                name="fullName"
                                type="text"
                                value={formData.fullName}
                                onChange={handleInputChange}
                                placeholder="Jean Dupont"
                                disabled={isLoading}
                                className={`w-full px-4 py-3 rounded-xl border bg-background transition-all outline-none focus:ring-2 ${errors.fullName ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-200 dark:border-gray-700 focus:ring-primary/20 focus:border-primary'}`}
                            />
                            {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-google-bold mb-2">Email professionnel</label>
                            <input 
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="jean@entreprise.fr"
                                disabled={isLoading}
                                className={`w-full px-4 py-3 rounded-xl border bg-background transition-all outline-none focus:ring-2 ${errors.email ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-200 dark:border-gray-700 focus:ring-primary/20 focus:border-primary'}`}
                            />
                            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-google-bold mb-2">Mot de passe</label>
                                <input 
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    disabled={isLoading}
                                    className={`w-full px-4 py-3 rounded-xl border bg-background focus:ring-2 outline-none ${errors.password ? 'border-red-500' : 'border-gray-200 dark:border-gray-700 focus:border-primary'}`}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-google-bold mb-2">Confirmer</label>
                                <input 
                                    name="confirmPassword"
                                    type={showPassword ? "text" : "password"}
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    disabled={isLoading}
                                    className={`w-full px-4 py-3 rounded-xl border bg-background focus:ring-2 outline-none ${errors.confirmPassword ? 'border-red-500' : 'border-gray-200 dark:border-gray-700 focus:border-primary'}`}
                                />
                            </div>
                        </div>
                        {(errors.password || errors.confirmPassword) && (
                            <p className="text-xs text-red-500 mt-1">{errors.password || errors.confirmPassword}</p>
                        )}

                        <div className="py-2">
                            <label className="flex items-start gap-3 cursor-pointer group">
                                <input 
                                    name="acceptTerms"
                                    type="checkbox"
                                    checked={formData.acceptTerms}
                                    onChange={handleInputChange}
                                    disabled={isLoading}
                                    className="mt-1 w-4 h-4 rounded border-gray-300 accent-primary"
                                />
                                <span className="text-xs opacity-70 group-hover:opacity-100 transition-opacity">
                                    En m'inscrivant, j'accepte les <Link to="/terms" className="text-primary underline">CGU</Link> et la <Link to="/privacy" className="text-primary underline">Politique de confidentialité</Link>.
                                </span>
                            </label>
                            {errors.terms && <p className="mt-1 text-xs text-red-500">{errors.terms}</p>}
                        </div>

                        <button 
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary hover:brightness-110 text-white font-google-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                "Créer mon compte"
                            )}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-sm opacity-60">
                        Déjà membre ? <Link to="/login" className="text-primary font-google-bold hover:underline">Se connecter</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Register