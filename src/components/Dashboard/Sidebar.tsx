import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, FileText, BarChart3, Bell, LifeBuoy, Settings, ChevronLeft, LogOut } from 'lucide-react'
import sajeLogo from '../../assets/images/logo/saje_mini.png'
import { useAuth } from '../../context/AuthContext'
import { useNotifications } from '../../notifications'

interface SidebarProps {
    isCollapsed: boolean
    setIsCollapsed: (value: boolean) => void
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, setIsCollapsed }) => {
    const location = useLocation()
    const { user, signOut } = useAuth()
    const { unreadCount } = useNotifications()

    const menuItems = [
        { name: 'Tableau de bord', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
        { name: 'Mes Examens', path: '/dashboard/examens', icon: <FileText size={20} /> },
        { name: 'Analytiques', path: '/dashboard/statistiques', icon: <BarChart3 size={20} /> },
        { name: 'Notifications', path: '/dashboard/notifications', icon: <Bell size={20} />, badge: unreadCount },
        { name: 'Assistance', path: '/dashboard/support', icon: <LifeBuoy size={20} /> },
        { name: 'Paramètres', path: '/dashboard/parametres', icon: <Settings size={20} /> }
    ]

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
        <aside className={`${isCollapsed ? 'w-20' : 'w-72'} bg-surface border-r border-border-subtle transition-all duration-300 flex flex-col h-screen sticky top-0 sidebar-shadow`}>
            <div className="p-6 flex items-center justify-between mb-4">
                <Link to="/" className="flex items-center gap-3">
                    <img src={sajeLogo} alt="SAJE" className="w-8 h-8 object-contain" />
                    {!isCollapsed && <span className="font-google-bold text-lg tracking-tight text-textcol">SAJE</span>}
                </Link>
                <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-2 hover:bg-background rounded-lg text-secondary dark:hover:bg-surface-dark transition-colors">
                    <ChevronLeft size={18} className={`transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
                </button>
            </div>

            <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path
                    return (
                        <Link 
                            key={item.path} 
                            to={item.path} 
                            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all group relative ${
                                isActive 
                                ? 'bg-primary/10 text-primary shadow-sm' 
                                : 'text-secondary hover:bg-background hover:text-textcol'
                            } ${isCollapsed ? 'justify-center px-0' : ''}`}
                            title={isCollapsed ? item.name : ''}
                        >
                            <div className={`${isActive ? 'text-primary' : 'text-secondary group-hover:text-textcol'}`}>
                                {item.icon}
                            </div>
                            {!isCollapsed && (
                              <>
                                <span className={`font-medium text-[15px] ${isActive ? 'font-google-bold' : ''}`}>{item.name}</span>
                                {item.badge && (
                                  <span className="ml-auto bg-primary text-white text-[10px] font-google-bold px-1.5 py-0.5 rounded-full shadow-lg shadow-primary/20">
                                    {item.badge}
                                  </span>
                                )}
                              </>
                            )}
                            {isCollapsed && item.badge && (
                              <div className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-surface shadow-lg shadow-primary/20" />
                            )}
                            {isActive && !isCollapsed && !item.badge && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                            )}
                        </Link>
                    )
                })}
            </nav>

            <div className="p-4 mt-auto">
                <div className={`flex flex-col gap-4 p-4 rounded-2xl bg-background dark:bg-surface-dark/50 ${isCollapsed ? 'items-center' : ''}`}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary font-google-bold text-sm">
                            {getInitials()}
                        </div>
                        {!isCollapsed && (
                            <div className="flex-1 min-w-0">
                                <p className="font-google-bold text-sm text-textcol truncate">{fullName}</p>
                                <p className="text-xs text-secondary truncate">{user?.email}</p>
                            </div>
                        )}
                    </div>
                    {!isCollapsed && (
                        <button 
                            onClick={signOut} 
                            className="w-full px-4 py-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-400/10 rounded-xl hover:bg-red-100 dark:hover:bg-red-400/20 transition-all flex items-center justify-center gap-2 text-[13px] font-google-bold"
                        >
                            <span>Déconnexion</span>
                            <LogOut size={16} />
                        </button>
                    )}
                    {isCollapsed && (
                        <button onClick={signOut} className="p-2 text-red-600 rounded-lg hover:bg-red-50 transition-colors" title="Déconnexion">
                            <LogOut size={20} />
                        </button>
                    )}
                </div>
            </div>
        </aside>
    )
}

export default Sidebar
