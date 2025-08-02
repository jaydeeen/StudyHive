import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  Brain, 
  FileText, 
  CreditCard, 
  Calendar, 
  Users, 
  LogOut,
  Home,
  Bell,
  Settings,
  Menu,
  X,
  AlertCircle
} from 'lucide-react'
import SettingsModal from './SettingsModal'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  React.useEffect(() => {
    if (!user) {
      navigate('/login')
    }
  }, [user, navigate])

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Deadlines', href: '/deadlines', icon: AlertCircle },
    { name: 'Cheat Sheet Generator', href: '/cheat-sheet', icon: FileText },
    { name: 'Flashcards', href: '/flashcards', icon: CreditCard },
    { name: 'Study Plan', href: '/study-plan', icon: Calendar },
    { name: 'Study Groups', href: '/study-groups', icon: Users },
  ]

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // Debug logging
  React.useEffect(() => {
    console.log('Layout: User state:', !!user, 'Current path:', location.pathname)
  }, [user, location.pathname])

  if (!user) {
    console.log('Layout: No user, returning null')
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-xl border-r border-gray-200 dark:border-gray-700 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col`}>
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-6 bg-gradient-to-r from-primary-600 to-primary-700 shadow-sm">
          <div className="flex items-center">
            <Brain className="h-8 w-8 text-white" />
            <span className="ml-3 text-xl font-bold text-white">StudyHive</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-blue-200 hover:text-white transition-colors p-1 rounded-lg hover:bg-blue-300 hover:bg-opacity-30"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 mt-6 px-3 space-y-2 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href
            const isCheatSheet = item.name === 'Cheat Sheet Generator'
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-3 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 shadow-sm border border-primary-200 dark:border-primary-700'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className={`h-5 w-5 mr-3 flex-shrink-0 ${
                  isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'
                }`} />
                <div className="flex-1 min-w-0 text-left">
                  {isCheatSheet ? (
                    <div>
                      <div className="text-sm font-medium">Cheat Sheet</div>
                      <div className="text-sm font-medium">Generator</div>
                    </div>
                  ) : (
                    <span className="text-sm font-medium">{item.name}</span>
                  )}
                </div>
              </Link>
            )
          })}
        </nav>

        {/* Logout Section - Fixed at bottom */}
        <div className="mt-auto border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 p-4">
          <div className="flex items-center mb-2">
            <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Signed in as</span>
            </div>
          </div>
          <div className="flex items-center space-x-2 mb-3">
            <img
              src={user.profile?.profilePicture || user.user_metadata?.profilePicture || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop'}
              alt={user.profile?.name || user.user_metadata?.name || user.email}
              className="h-6 w-6 rounded-full object-cover"
            />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
              {user.profile?.name || user.user_metadata?.name || user.email?.split('@')[0] || 'User'}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-3 text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded-xl transition-all duration-200 group border border-gray-200 dark:border-gray-600"
            title="Logout from StudyHive"
          >
            <LogOut className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400 group-hover:text-red-500" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Top bar */}
        <header className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="flex items-center justify-between h-16 px-4 lg:px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden"
            >
              <Menu className="h-6 w-6 text-gray-600 dark:text-gray-300" />
            </button>

            <div className="flex-1" />

            <div className="flex items-center space-x-3">
              <button className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>
              
              <button 
                onClick={() => setSettingsOpen(true)}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Settings className="h-5 w-5" />
              </button>

              <button 
                onClick={() => navigate('/profile')}
                className="flex items-center space-x-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <img
                  src={user.profile?.profilePicture || user.user_metadata?.profilePicture || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop'}
                  alt={user.profile?.name || user.user_metadata?.name || user.email}
                  className="h-8 w-8 rounded-full object-cover"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">
                  {user.profile?.name || user.user_metadata?.name || user.email}
                </span>
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="max-w-4xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={settingsOpen} 
        onClose={() => setSettingsOpen(false)} 
      />
    </div>
  )
}

export default Layout
