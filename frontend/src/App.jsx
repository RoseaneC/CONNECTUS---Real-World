import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import GlobalErrorHandler from './components/GlobalErrorHandler'

// Páginas
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ProfilePage from './pages/ProfilePage'
import TimelinePage from './pages/TimelinePage'
import MissionsPage from './pages/MissionsPage'
import RankingPage from './pages/RankingPage'
import ChatPage from './pages/ChatPage'
import TestPage from './pages/TestPage'
import TestSimplePage from './pages/TestSimplePage'
import DebugPage from './pages/DebugPage'
import DebugAuthPage from './pages/DebugAuthPage'
import AIPage from './pages/AIPage'

// Componentes
import MainLayout from './layouts/MainLayout'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <GlobalErrorHandler>
      <Router>
        <AuthProvider>
          <div className="min-h-screen bg-gray-900">
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1f2937',
                color: '#f9fafb',
                border: '1px solid #374151'
              }
            }}
          />
          
          <Routes>
            {/* Rotas públicas */}
            <Route path="/" element={<HomePage />} />
            <Route path="/test-simple" element={<TestSimplePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/test" element={<TestPage />} />
            <Route path="/debug" element={<DebugPage />} />
            <Route path="/debug-auth" element={<DebugAuthPage />} />
            
            {/* Rotas protegidas */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <MainLayout>
                  <DashboardPage />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <MainLayout>
                  <ProfilePage />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/timeline" element={
              <ProtectedRoute>
                <MainLayout>
                  <TimelinePage />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/missions" element={
              <ProtectedRoute>
                <MainLayout>
                  <MissionsPage />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/ranking" element={
              <ProtectedRoute>
                <MainLayout>
                  <RankingPage />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/chat" element={
              <ProtectedRoute>
                <MainLayout>
                  <ChatPage />
                </MainLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/ai" element={
              <ProtectedRoute>
                <MainLayout>
                  <AIPage />
                </MainLayout>
              </ProtectedRoute>
            } />
          </Routes>
        </div>
        </AuthProvider>
      </Router>
    </GlobalErrorHandler>
  )
}

export default App