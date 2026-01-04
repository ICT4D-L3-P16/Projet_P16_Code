import { Link, useLocation } from 'react-router-dom'
import sajeLogo from '../../assets/images/logo/saje_mini.png'
import { useAuth } from '../../context/AuthContext'

interface SidebarProps {
    isCollapsed: boolean
    setIsCollapsed: (value: boolean) => void
}

const menuItems = [
    { name: 'Accueil', path: '/dashboard', icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg> },
    { name: 'Examens', path: '/dashboard/examens', icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" /></svg> },
    { name: 'Statistiques', path: '/dashboard/statistiques', icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg> },
    { name: 'Support', path: '/dashboard/support', icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" /></svg> },
    { name: 'Paramètres', path: '/dashboard/parametres', icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M10.35 1.5a1 1 0 011.9 0l.392 1.357a1 1 0 001.242.68l1.357-.392a1 1 0 011.342 1.342l-.392 1.357a1 1 0 00.68 1.242l1.357.392a1 1 0 010 1.9l-1.357.392a1 1 0 00-.68 1.242l.392 1.357a1 1 0 01-1.342 1.342l-1.357-.392a1 1 0 00-1.242.68l-.392 1.357a1 1 0 01-1.9 0l-.392-1.357a1 1 0 00-1.242-.68l-1.357.392a1 1 0 01-1.342-1.342l.392-1.357a1 1 0 00-.68-1.242L1.5 8.25a1 1 0 010-1.9l1.357-.392a1 1 0 00.68-1.242l-.392-1.357a1 1 0 011.342-1.342l1.357.392a1 1 0 001.242-.68L10.35 1.5zM12 15a3 3 0 100-6 3 3 0 000 6z" /></svg> }
]

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, setIsCollapsed }) => {
    const location = useLocation()
    const { user, signOut } = useAuth()

    const getInitials = () => {
        if (!user) return 'U'
        const nom = user.user_metadata?.nom;
        const prenom = user.user_metadata?.prenom;
        if (nom && prenom) return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
        return user.email?.charAt(0).toUpperCase() || 'U'
    }

    const fullName = user?.user_metadata?.prenom 
        ? `${user.user_metadata.prenom} ${user.user_metadata.nom}`
        : user?.email?.split('@')[0]

    return (
        <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-surface border-r border-gray-200 dark:border-gray-800 transition-all duration-300 flex flex-col h-screen sticky top-0`}>
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-3">
                    <img src={sajeLogo} alt="SAJE" className="w-10 h-10" />
                    {!isCollapsed && <span className="font-google-bold text-xl text-textcol">SAJE</span>}
                </Link>
                <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-2 hover:bg-background rounded-lg transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5" />
                    </svg>
                </button>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path
                    return (
                        <Link key={item.path} to={item.path} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive ? 'bg-primary text-white shadow-lg' : 'text-textcol hover:bg-background'} ${isCollapsed ? 'justify-center' : ''}`} title={isCollapsed ? item.name : ''}>
                            {item.icon}
                            {!isCollapsed && <span className="font-google-bold">{item.name}</span>}
                        </Link>
                    )
                })}
            </nav>

            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-google-bold text-sm">
                        {getInitials()}
                    </div>
                    {!isCollapsed && (
                        <div className="flex-1 min-w-0">
                            <p className="font-google-bold text-sm text-textcol truncate">{fullName}</p>
                            <p className="text-xs opacity-60 truncate">{user?.email}</p>
                        </div>
                    )}
                </div>
                {!isCollapsed && (
                    <button onClick={signOut} className="mt-3 w-full px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-2 text-sm font-google-bold">
                        Déconnexion
                    </button>
                )}
            </div>
        </aside>
    )
}