// ============================================
// 4. Dashboard.tsx - Layout principal
// ============================================
import { Outlet } from 'react-router-dom'
import { useState } from 'react'
import { Sidebar } from '../components/Dashboard/Sidebar'
import { TopNavbar } from '../components/Dashboard/TopNavbar'
import { ThemeToggle } from '../components/LandingPage/ThemeToggle'
const Dashboard: React.FC = () => {
    const [isCollapsed, setIsCollapsed] = useState(false)

    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
            <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
                <TopNavbar />
                <main className="flex-1 overflow-y-auto">
                    <div className="p-8 max-w-7xl mx-auto w-full">
                        <Outlet />
                    </div>
                </main>
            </div>
            <div className="fixed bottom-8 right-8 z-50">
                <ThemeToggle/>
            </div>
        </div>
    )
}

export default Dashboard