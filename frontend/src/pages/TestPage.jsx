import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  CheckCircle, 
  XCircle, 
  Loader, 
  ExternalLink,
  Wallet,
  Server,
  Database
} from 'lucide-react'

import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const TestPage = () => {
  const { user, isAuthenticated, loading } = useAuth()
  const [testResults, setTestResults] = useState({})
  const [testing, setTesting] = useState(false)

  const runTests = async () => {
    setTesting(true)
    const results = {}

    // Teste 1: Verificar Backend
    try {
      const response = await api.get('/health')
      results.backend = {
        status: response.status === 200 ? 'success' : 'error',
        message: response.status === 200 ? 'Backend funcionando' : 'Backend com problemas'
      }
    } catch (error) {
      results.backend = {
        status: 'error',
        message: `Erro: ${error.message}`
      }
    }

    // Teste 2: Verificar Backend
    try {
      const response = await api.get('/health')
      results.backend = {
        status: 'success',
        message: `Backend OK - ${response.data.status}`
      }
    } catch (error) {
      results.backend = {
        status: 'error',
        message: `Erro: ${error.message}`
      }
    }

    // Teste 3: Verificar Autenticação
    try {
      if (isAuthenticated) {
        results.auth = {
          status: 'success',
          message: `Usuário logado: ${user?.nickname}`
        }
      } else {
        results.auth = {
          status: 'warning',
          message: 'Usuário não logado'
        }
      }
    } catch (error) {
      results.auth = {
        status: 'error',
        message: `Erro: ${error.message}`
      }
    }

    // Teste 4: Verificar APIs
    try {
      const response = await api.get('/posts/timeline?limit=1')
      results.api = {
        status: 'success',
        message: 'APIs funcionando'
      }
    } catch (error) {
      results.api = {
        status: 'error',
        message: `Erro: ${error.message}`
      }
    }

    setTestResults(results)
    setTesting(false)
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'warning':
        return <XCircle className="w-5 h-5 text-yellow-400" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-400" />
      default:
        return <Loader className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'text-green-400'
      case 'warning':
        return 'text-yellow-400'
      case 'error':
        return 'text-red-400'
      default:
        return 'text-gray-400'
    }
  }

  return (
    <div className="min-h-screen bg-dark-900 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl font-bold text-white">Teste do Sistema Connectus</h1>
          <p className="text-dark-400">
            Verificação completa da integração e funcionalidades
          </p>
        </motion.div>

        {/* Status Atual */}
        <Card variant="glow" className="p-6">
          <h2 className="text-xl font-bold text-white mb-4">Status Atual</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <Server className="w-6 h-6 text-primary-400" />
              <div>
                <p className="text-white font-medium">Backend</p>
                <p className="text-sm text-dark-400">FastAPI + SQLite</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Database className="w-6 h-6 text-secondary-400" />
              <div>
                <p className="text-white font-medium">Frontend</p>
                <p className="text-sm text-dark-400">React + Vite</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-accent-400" />
              <div>
                <p className="text-white font-medium">Backend</p>
                <p className="text-sm text-dark-400">API Connectus</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Botão de Teste */}
        <div className="text-center">
          <Button
            onClick={runTests}
            loading={testing}
            variant="primary"
            className="px-8 py-3"
          >
            {testing ? 'Testando...' : 'Executar Testes'}
          </Button>
        </div>

        {/* Resultados dos Testes */}
        {Object.keys(testResults).length > 0 && (
          <Card variant="cyber" className="p-6">
            <h2 className="text-xl font-bold text-white mb-4">Resultados dos Testes</h2>
            <div className="space-y-4">
              {Object.entries(testResults).map(([test, result]) => (
                <div key={test} className="flex items-center justify-between p-4 bg-dark-800/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(result.status)}
                    <div>
                      <p className="text-white font-medium capitalize">{test}</p>
                      <p className={`text-sm ${getStatusColor(result.status)}`}>
                        {result.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Informações do Usuário */}
        {isAuthenticated && user && (
          <Card variant="glow" className="p-6">
            <h2 className="text-xl font-bold text-white mb-4">Usuário Logado</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-dark-400">Nickname</p>
                <p className="text-white font-medium">{user.nickname}</p>
              </div>
              <div>
                <p className="text-dark-400">XP</p>
                <p className="text-white font-medium">{user.xp || 0}</p>
              </div>
              <div>
                <p className="text-dark-400">Nível</p>
                <p className="text-white font-medium">{user.level || 1}</p>
              </div>
              <div>
                <p className="text-dark-400">Tokens</p>
                <p className="text-white font-medium">{user.tokens_available || 0}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Links Úteis */}
        <Card variant="cyber" className="p-6">
          <h2 className="text-xl font-bold text-white mb-4">Links Úteis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-3 p-4 bg-dark-800/50 rounded-lg hover:bg-dark-700/50 transition-colors"
            >
              <ExternalLink className="w-5 h-5 text-primary-400" />
              <div>
                <p className="text-white font-medium">Documentação API</p>
                <p className="text-sm text-dark-400">Swagger UI</p>
              </div>
            </a>
            <a
              href="https://freighter.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-3 p-4 bg-dark-800/50 rounded-lg hover:bg-dark-700/50 transition-colors"
            >
              <ExternalLink className="w-5 h-5 text-accent-400" />
              <div>
                <p className="text-white font-medium">Freighter Wallet</p>
                <p className="text-sm text-dark-400">Instalar extensão</p>
              </div>
            </a>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default TestPage