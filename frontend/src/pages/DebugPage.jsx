import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'

const DebugPage = () => {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  const addResult = (test, status, message, data = null) => {
    setResults(prev => [...prev, { test, status, message, data, timestamp: new Date().toLocaleTimeString() }])
  }

  const testBackendConnection = async () => {
    addResult('Backend Health', 'testing', 'Testando conexão...')
    
    try {
      const response = await fetch('http://localhost:8000/health')
      const data = await response.json()
      
      if (response.ok) {
        addResult('Backend Health', 'success', 'Backend está rodando!', data)
        return true
      } else {
        addResult('Backend Health', 'error', `Erro: ${response.status}`, data)
        return false
      }
    } catch (error) {
      addResult('Backend Health', 'error', `Erro de conexão: ${error.message}`)
      return false
    }
  }

  const testRegistration = async () => {
    addResult('Registro', 'testing', 'Testando registro de usuário...')
    
    const userData = {
      nickname: `teste_${Date.now()}`,
      full_name: 'Usuário Teste',
      email: `teste_${Date.now()}@exemplo.com`,
      password: '123456',
      age: 20
    }

    try {
      const response = await fetch('http://localhost:8000/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      })

      const data = await response.json()
      
      if (response.ok) {
        addResult('Registro', 'success', 'Registro funcionando!', data)
        return true
      } else {
        addResult('Registro', 'error', `Erro: ${data.detail || response.status}`, data)
        return false
      }
    } catch (error) {
      addResult('Registro', 'error', `Erro de requisição: ${error.message}`)
      return false
    }
  }

  const runAllTests = async () => {
    setLoading(true)
    setResults([])
    
    try {
      const healthOk = await testBackendConnection()
      
      if (healthOk) {
        await testRegistration()
      } else {
        addResult('Registro', 'warning', 'Pulado - Backend não está respondendo')
      }
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-400" />
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-400" />
      default:
        return <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'border-green-500/30 bg-green-500/10'
      case 'error':
        return 'border-red-500/30 bg-red-500/10'
      case 'warning':
        return 'border-yellow-500/30 bg-yellow-500/10'
      default:
        return 'border-blue-500/30 bg-blue-500/10'
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        <Card variant="cyber" className="mb-6">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold text-white">Debug Connectus</h1>
            <p className="text-dark-400">
              Página de debug para testar a conexão com o backend
            </p>
            
            <Button
              onClick={runAllTests}
              loading={loading}
              className="px-8 py-3"
              variant="primary"
            >
              {loading ? 'Executando testes...' : 'Executar Todos os Testes'}
            </Button>
          </div>
        </Card>

        {results.length > 0 && (
          <Card variant="cyber">
            <h2 className="text-xl font-bold text-white mb-4">Resultados dos Testes</h2>
            
            <div className="space-y-4">
              {results.map((result, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`border rounded-lg p-4 ${getStatusColor(result.status)}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(result.status)}
                      <span className="font-medium text-white">{result.test}</span>
                    </div>
                    <span className="text-sm text-dark-400">{result.timestamp}</span>
                  </div>
                  
                  <p className="text-dark-200 mb-2">{result.message}</p>
                  
                  {result.data && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm text-dark-400 hover:text-dark-300">
                        Ver dados completos
                      </summary>
                      <pre className="mt-2 p-2 bg-dark-800 rounded text-xs text-dark-300 overflow-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </motion.div>
              ))}
            </div>
          </Card>
        )}

        <Card variant="cyber" className="mt-6">
          <h2 className="text-xl font-bold text-white mb-4">Instruções</h2>
          <div className="space-y-2 text-dark-300">
            <p>1. Certifique-se de que o backend está rodando em <code className="bg-dark-800 px-1 rounded">localhost:8000</code></p>
            <p>2. Execute: <code className="bg-dark-800 px-1 rounded">cd backend && python run.py</code></p>
            <p>3. Se os testes passarem, o problema pode estar no frontend</p>
            <p>4. Abra o console do navegador (F12) para ver logs detalhados</p>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default DebugPage






