import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Wallet, User, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react'

import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Card from '../components/ui/Card'
import { useAuth } from '../context/AuthContext'
import stellarService from '../services/stellarService'

const MainAuthPage = () => {
  const navigate = useNavigate()
  const { login, register, loading, isAuthenticated } = useAuth()
  
  // Estados
  const [mode, setMode] = useState('welcome') // welcome, register, login
  const [formData, setFormData] = useState({
    publicKey: '',
    stellarAccountId: '',
    nickname: '',
    fullName: '',
    email: '',
    age: ''
  })
  const [isConnecting, setIsConnecting] = useState(false)

  // Se já estiver autenticado, vai direto para timeline
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/timeline')
    }
  }, [isAuthenticated, navigate])

  // Conectar com Freighter
  const connectFreighter = async () => {
    if (isConnecting) return
    
    try {
      setIsConnecting(true)
      
      // Verificar se Freighter está disponível
      if (stellarService.isFreighterAvailable()) {
        const { publicKey, accountId } = await stellarService.connectFreighter()
        setFormData(prev => ({
          ...prev,
          publicKey,
          stellarAccountId: accountId
        }))
        toast.success('Conectado com Freighter!')
        setMode('login')
      } else {
        // Simular conexão para demonstração
        const keypair = stellarService.generateKeypair()
        setFormData(prev => ({
          ...prev,
          publicKey: keypair.publicKey,
          stellarAccountId: keypair.publicKey
        }))
        toast.success('Carteira simulada criada!')
        setMode('register')
      }
    } catch (error) {
      console.error('Erro ao conectar Freighter:', error)
      toast.error('Erro ao conectar com Freighter')
    } finally {
      setIsConnecting(false)
    }
  }

  // Gerar chaves automaticamente
  const generateKeys = async () => {
    if (isConnecting) return
    
    try {
      setIsConnecting(true)
      await new Promise(resolve => setTimeout(resolve, 300)) // Simular delay
      
      const keypair = stellarService.generateKeypair()
      setFormData(prev => ({
        ...prev,
        publicKey: keypair.publicKey,
        stellarAccountId: keypair.publicKey
      }))
      toast.success('Carteira criada!')
      setMode('register')
    } catch (error) {
      toast.error('Erro ao criar carteira')
    } finally {
      setIsConnecting(false)
    }
  }

  // Atualizar campo
  const updateField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Fazer login
  const handleLogin = async (e) => {
    e.preventDefault()
    
    if (loading) return
    
    try {
      const result = await login(formData.stellarAccountId, formData.publicKey)
      if (result.success) {
        toast.success('Login realizado! Redirecionando...')
        setTimeout(() => navigate('/timeline'), 1000)
      } else {
        toast.error(result.error || 'Erro ao fazer login')
      }
    } catch (error) {
      console.error('Erro no login:', error)
      toast.error('Erro inesperado ao fazer login')
    }
  }

  // Fazer registro
  const handleRegister = async (e) => {
    e.preventDefault()
    
    if (loading) return
    
    try {
      // Validar dados
      if (!formData.stellarAccountId || !formData.publicKey || !formData.nickname || !formData.fullName || !formData.age) {
        toast.error('Preencha todos os campos obrigatórios')
        return
      }

      if (parseInt(formData.age) < 13 || parseInt(formData.age) > 25) {
        toast.error('Idade deve estar entre 13 e 25 anos')
        return
      }

      const userData = {
        stellar_account_id: formData.stellarAccountId,
        public_key: formData.publicKey,
        nickname: formData.nickname,
        full_name: formData.fullName,
        email: formData.email || '',
        age: parseInt(formData.age)
      }

      const result = await register(userData)
      if (result.success) {
        toast.success('Conta criada! Redirecionando...')
        setTimeout(() => navigate('/timeline'), 1000)
      } else {
        toast.error(result.error || 'Erro ao criar conta')
      }
    } catch (error) {
      console.error('Erro no registro:', error)
      toast.error('Erro inesperado ao criar conta')
    }
  }

  // Tela de boas-vindas
  if (mode === 'welcome') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <Card variant="cyber" className="w-full max-w-md mx-auto">
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto">
              <User className="w-10 h-10 text-primary-400" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-white">Connectus</h1>
              <p className="text-dark-400">
                Plataforma de impacto social para jovens
              </p>
            </div>

            <div className="space-y-4">
              <Button
                onClick={connectFreighter}
                loading={isConnecting}
                className="w-full"
                variant="primary"
                disabled={isConnecting}
              >
                <Wallet className="w-5 h-5 mr-2" />
                {isConnecting ? 'Conectando...' : 'Conectar com Freighter'}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-dark-700" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-900 text-dark-400">ou</span>
                </div>
              </div>

              <Button
                onClick={generateKeys}
                loading={isConnecting}
                className="w-full"
                variant="ghost"
                disabled={isConnecting}
              >
                <User className="w-5 h-5 mr-2" />
                {isConnecting ? 'Criando...' : 'Criar Nova Conta'}
              </Button>
            </div>

            <p className="text-xs text-dark-500">
              Ao continuar, você concorda com nossos termos de uso
            </p>
          </div>
        </Card>
      </div>
    )
  }

  // Tela de login
  if (mode === 'login') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <Card variant="cyber" className="w-full max-w-md mx-auto">
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Conectado!</h2>
              <p className="text-dark-400">
                Sua carteira Freighter está conectada
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                label="Chave Pública"
                value={formData.publicKey}
                readOnly
                variant="cyber"
                className="bg-dark-800"
              />

              <Button
                type="submit"
                variant="primary"
                loading={loading}
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Entrando...' : 'Entrar no Connectus'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>

            <div className="text-center">
              <button
                onClick={() => setMode('welcome')}
                className="text-sm text-dark-400 hover:text-dark-300"
              >
                ← Voltar
              </button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  // Tela de registro
  if (mode === 'register') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <Card variant="cyber" className="w-full max-w-md mx-auto">
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto">
                <User className="w-8 h-8 text-primary-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Criar Conta</h2>
              <p className="text-dark-400">
                Complete seus dados para finalizar
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <Input
                label="Chave Pública"
                value={formData.publicKey}
                readOnly
                variant="cyber"
                className="bg-dark-800"
              />

              <Input
                label="Nome Completo *"
                placeholder="Seu nome completo"
                value={formData.fullName}
                onChange={(e) => updateField('fullName', e.target.value)}
                variant="cyber"
                required
              />

              <Input
                label="Nickname *"
                placeholder="Seu nickname único"
                value={formData.nickname}
                onChange={(e) => updateField('nickname', e.target.value)}
                variant="cyber"
                required
              />

              <Input
                label="Email (Opcional)"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                variant="cyber"
              />

              <Input
                label="Idade *"
                type="number"
                placeholder="18"
                value={formData.age}
                onChange={(e) => updateField('age', e.target.value)}
                variant="cyber"
                min="13"
                max="25"
                required
              />

              <Button
                type="submit"
                variant="primary"
                loading={loading}
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Criando Conta...' : 'Criar Conta'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>

            <div className="text-center">
              <button
                onClick={() => setMode('welcome')}
                className="text-sm text-dark-400 hover:text-dark-300"
              >
                ← Voltar
              </button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return null
}

export default MainAuthPage







