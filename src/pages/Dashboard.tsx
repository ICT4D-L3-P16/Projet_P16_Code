// ============================================
// 4. Dashboard.tsx - Layout principal
// ============================================
import { Outlet } from 'react-router-dom'
import { useState } from 'react'
import { Sidebar } from '../components/Dashboard/Sidebar'
import { ThemeToggle } from '../components/LandingPage/ThemeToggle'
const Dashboard: React.FC = () => {
    const [isCollapsed, setIsCollapsed] = useState(false)

    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
            <main className="flex-1 overflow-x-hidden">
                <div className="p-8">
                    <Outlet />
                </div>
            </main>
            <ThemeToggle/>
        </div>
    )
}

export default Dashboard