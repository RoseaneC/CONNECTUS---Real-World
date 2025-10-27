/**
 * Página de debug para verificar problemas de autenticação
 */

import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

const DebugAuthPage = () => {
  const { user, loading, token, isAuthenticated } = useAuth()
  const [backendStatus, setBackendStatus] = useState('Verificando...')
  const [testResults, setTestResults] = useState([])

  useEffect(() => {
    checkBackendStatus()
  }, [])

  const checkBackendStatus = async () => {
    try {
      const response = await fetch('http://localhost:8000/health')
      const data = await response.json()
      setBackendStatus(`✅ Backend OK: ${data.status}`)
    } catch (error) {
      setBackendStatus(`❌ Backend Error: ${error.message}`)
    }
  }

  const testRegister = async () => {
    const testData = {
      nickname: `teste_${Date.now()}`,
      password: '123456',
      full_name: 'Usuário Teste',
      email: `teste_${Date.now()}@exemplo.com`
    }

    try {
      const response = await fetch('http://localhost:8000/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testData)
      })

      const data = await response.json()
      
      if (response.ok) {
        setTestResults(prev => [...prev, `✅ Registro OK: ${data.nickname}`])
        return data
      } else {
        setTestResults(prev => [...prev, `❌ Registro Error: ${data.detail}`])
        return null
      }
    } catch (error) {
      setTestResults(prev => [...prev, `❌ Registro Error: ${error.message}`])
      return null
    }
  }

  const testLogin = async (nickname, password) => {
    try {
      const response = await fetch('http://localhost:8000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nickname, password })
      })

      const data = await response.json()
      
      if (response.ok) {
        setTestResults(prev => [...prev, `✅ Login OK: ${data.token_type}`])
        return data.access_token
      } else {
        setTestResults(prev => [...prev, `❌ Login Error: ${data.detail}`])
        return null
      }
    } catch (error) {
      setTestResults(prev => [...prev, `❌ Login Error: ${error.message}`])
      return null
    }
  }

  const testProtectedRoute = async (token) => {
    try {
      const response = await fetch('http://localhost:8000/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      
      if (response.ok) {
        setTestResults(prev => [...prev, `✅ Rota Protegida OK: ${data.nickname}`])
        return true
      } else {
        setTestResults(prev => [...prev, `❌ Rota Protegida Error: ${data.detail}`])
        return false
      }
    } catch (error) {
      setTestResults(prev => [...prev, `❌ Rota Protegida Error: ${error.message}`])
      return false
    }
  }

  const runAllTests = async () => {
    setTestResults([])
    
    // Teste 1: Registro
    const userData = await testRegister()
    
    if (userData) {
      // Teste 2: Login
      const token = await testLogin(userData.nickname, '123456')
      
      if (token) {
        // Teste 3: Rota Protegida
        await testProtectedRoute(token)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card variant="cyber" className="p-6">
          <h1 className="text-3xl font-bold text-white mb-6">
            🔍 Debug - Sistema de Autenticação
          </h1>
          
          <div className="space-y-4">
            {/* Status do Backend */}
            <div className="bg-dark-800/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-2">
                Status do Backend
              </h3>
              <p className="text-dark-300">{backendStatus}</p>
            </div>

            {/* Status do Frontend */}
            <div className="bg-dark-800/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-2">
                Status do Frontend
              </h3>
              <div className="space-y-2 text-sm">
                <p className="text-dark-300">
                  <span className="text-primary-400">Loading:</span> {loading ? 'Sim' : 'Não'}
                </p>
                <p className="text-dark-300">
                  <span className="text-primary-400">Token:</span> {token ? 'Presente' : 'Ausente'}
                </p>
                <p className="text-dark-300">
                  <span className="text-primary-400">Usuário:</span> {user ? user.nickname : 'Não logado'}
                </p>
                <p className="text-dark-300">
                  <span className="text-primary-400">Autenticado:</span> {isAuthenticated ? 'Sim' : 'Não'}
                </p>
              </div>
            </div>

            {/* Testes */}
            <div className="bg-dark-800/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-2">
                Testes de API
              </h3>
              <Button 
                onClick={runAllTests}
                className="mb-4"
                variant="primary"
              >
                Executar Todos os Testes
              </Button>
              
              <div className="space-y-2">
                {testResults.map((result, index) => (
                  <div key={index} className="text-sm font-mono">
                    {result}
                  </div>
                ))}
              </div>
            </div>

            {/* Informações de Debug */}
            <div className="bg-dark-800/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-2">
                Informações de Debug
              </h3>
              <div className="space-y-2 text-sm">
                <p className="text-dark-300">
                  <span className="text-primary-400">URL Backend:</span> http://localhost:8000
                </p>
                <p className="text-dark-300">
                  <span className="text-primary-400">URL Frontend:</span> http://localhost:5173
                </p>
                <p className="text-dark-300">
                  <span className="text-primary-400">User Agent:</span> {navigator.userAgent}
                </p>
                <p className="text-dark-300">
                  <span className="text-primary-400">Local Storage:</span> {localStorage.getItem('token') ? 'Token presente' : 'Sem token'}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default DebugAuthPage


