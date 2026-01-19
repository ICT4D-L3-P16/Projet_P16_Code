import React from 'react'
import { useLocation } from 'react-router-dom'
import { Search, Bell, HelpCircle } from 'lucide-react'

export const TopNavbar: React.FC = () => {
    const location = useLocation()
    
    const getBreadcrumbs = () => {
        const paths = location.pathname.split('/').filter(x => x)
        return paths.map((path, index) => {
            const label = path.charAt(0).toUpperCase() + path.slice(1)
            return (
                <span key={path} className="flex items-center">
                    {index > 0 && <span className="mx-2 text-secondary/40">/</span>}
                    <span className={index === paths.length - 1 ? 'text-textcol font-google-bold' : 'text-secondary font-medium'}>
                        {label === 'Dashboard' ? 'Tableau de bord' : label}
                    </span>
                </span>
            )
        })
    }

    return (
        <header className="h-20 glass-effect border-b border-border-subtle sticky top-0 z-10 px-8 flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center">
                    {getBreadcrumbs()}
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="relative group hidden md:block">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <Search size={16} className="text-secondary/60 group-focus-within:text-primary transition-colors" />
                    </div>
                    <input 
                        type="text" 
                        placeholder="Rechercher..." 
                        className="bg-background/50 border border-border-subtle rounded-xl py-2 pl-10 pr-4 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                </div>

                <div className="flex items-center gap-4">
                    <button className="p-2 text-secondary hover:bg-background rounded-lg transition-colors relative">
                        <Bell size={20} />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-surface"></span>
                    </button>
                    
                    <button className="p-2 text-secondary hover:bg-background rounded-lg transition-colors">
                        <HelpCircle size={20} />
                    </button>
                </div>
            </div>
        </header>
    )
}
