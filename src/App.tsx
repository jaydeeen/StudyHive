import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { StudyProvider } from './contexts/StudyContext'
import { SettingsProvider } from './contexts/SettingsContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import CheatSheetGenerator from './pages/CheatSheetGenerator'
import FlashcardsGenerator from './pages/FlashcardsGenerator'
import StudyPlan from './pages/StudyPlan'
import StudyGroups from './pages/StudyGroups'
import Deadlines from './pages/Deadlines'
import Profile from './pages/Profile'

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth()
  
  console.log('🔒 ProtectedRoute: Checking authentication:', { isAuthenticated, loading, user: !!user })
  
  if (loading) {
    console.log('🔒 ProtectedRoute: Still loading...')
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }
  
  if (!isAuthenticated || !user) {
    console.log('🔒 ProtectedRoute: Not authenticated, redirecting to login')
    return <Navigate to="/login" replace />
  }
  
  console.log('🔒 ProtectedRoute: Authenticated, rendering children')
  return <>{children}</>
}

function AppContent() {
  const { isAuthenticated, user } = useAuth()

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={
            isAuthenticated && user ? <Navigate to="/" replace /> : <Login />
          } 
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/cheat-sheet"
          element={
            <ProtectedRoute>
              <Layout>
                <CheatSheetGenerator />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/flashcards"
          element={
            <ProtectedRoute>
              <Layout>
                <FlashcardsGenerator />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/study-plan"
          element={
            <ProtectedRoute>
              <Layout>
                <StudyPlan />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/study-groups"
          element={
            <ProtectedRoute>
              <Layout>
                <StudyGroups />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/deadlines"
          element={
            <ProtectedRoute>
              <Layout>
                <Deadlines />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          }
        />
        {/* Catch all route - redirect to dashboard */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </Router>
  )
}

function App() {
  return (
    <AuthProvider>
      <StudyProvider>
        <SettingsProvider>
          <AppContent />
        </SettingsProvider>
      </StudyProvider>
    </AuthProvider>
  )
}

export default App
