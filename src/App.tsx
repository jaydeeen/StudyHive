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
  const { isAuthenticated, loading } = useAuth()
  
  console.log('🔒 ProtectedRoute: Checking authentication:', { isAuthenticated, loading })
  
  if (loading) {
    console.log('🔒 ProtectedRoute: Still loading...')
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }
  
  if (!isAuthenticated) {
    console.log('🔒 ProtectedRoute: Not authenticated, redirecting to login')
    return <Navigate to="/login" />
  }
  
  console.log('🔒 ProtectedRoute: Authenticated, rendering children')
  return <>{children}</>
}

function AppContent() {
  const { isAuthenticated } = useAuth()

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
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
