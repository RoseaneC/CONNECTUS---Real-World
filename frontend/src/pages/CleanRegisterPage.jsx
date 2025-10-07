import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Wallet, ExternalLink, CheckCircle } from 'lucide-react'

import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Card from '../components/ui/Card'
import { useAuth } from '../context/AuthContext'
import stellarService from '../services/stellarService'

const CleanRegisterPage = () => {
  const navigate = useNavigate()
  const { register: registerUser, loading } = useAuth()
  const [isConnecting, setIsConnecting] = useState(false)
  const [walletConnected, setWalletConnected] = useState(false)
  const [walletData, setWalletData] = useState(null)
  
  // Estados do formulário
  const [formData, setFormData] = useState({
    publicKey: '',
    stellarAccountId: '',
    nickname: '',
    fullName: '',
    email: '',
    age: ''
  })

  // Conectar com Freighter
  const connectFreighter = async () => {
    if (isConnecting) return
    
    try {
      setIsConnecting(true)
      const { publicKey, accountId, simulated } = await stellarService.connectFreighter()
      
      setFormData(prev => ({
        ...prev,
        publicKey,
        stellarAccountId: accountId
      }))
      setWalletData({ publicKey, accountId })
      setWalletConnected(true)
      
      if (simulated) {
        toast.success('Carteira simulada criada! Preencha seus dados abaixo.')
      } else {
        toast.success('Conectado com Freighter!')
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsConnecting(false)
    }
  }

  // Atualizar campo do formulário
  const updateField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Submeter formulário
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (loading) return
    
    try {
      // Validar dados
      if (!formData.stellarAccountId || !formData.publicKey || !formData.nickname || !formData.fullName || !formData.age) {
        toast.error('Preencha todos os campos obrigatórios')
        return
      }

      if (!stellarService.isValidPublicKey(formData.publicKey)) {
        toast.error('Chave pública inválida')
        return
      }

      // Converter dados para o formato esperado pelo backend
      const userData = {
        stellar_account_id: formData.stellarAccountId,
        public_key: formData.publicKey,
        nickname: formData.nickname,
        full_name: formData.fullName,
        email: formData.email || '',
        age: parseInt(formData.age)
      }

      const result = await registerUser(userData)
      
      if (result.success) {
        toast.success('Conta criada com sucesso!')
        navigate('/dashboard')
      } else {
        toast.error(result.error || 'Erro ao criar conta')
      }
    } catch (error) {
      console.error('Erro no cadastro:', error)
      toast.error('Erro inesperado ao criar conta')
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <Card variant="cyber" className="w-full max-w-2xl mx-auto">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-white">Criar Conta Connectus</h2>
            <p className="text-dark-400">
              Junte-se à comunidade de impacto social para jovens
            </p>
          </div>

          {/* Status da Carteira */}
          {walletConnected && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-green-400 font-medium">Carteira Conectada</span>
              </div>
              <p className="text-sm text-green-300 mt-1">
                Chave: {formData.publicKey?.substring(0, 20)}...
              </p>
            </div>
          )}

          {/* Conectar Carteira */}
          {!walletConnected && (
            <div className="bg-dark-800/50 rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wallet className="w-8 h-8 text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Conectar Carteira Stellar</h3>
              <p className="text-dark-400 mb-4">
                Clique no botão abaixo para criar uma carteira simulada ou instale o Freighter
              </p>
              <Button
                onClick={connectFreighter}
                loading={isConnecting}
                className="w-full"
                variant="primary"
              >
                <Wallet className="w-5 h-5 mr-2" />
                {isConnecting ? 'Conectando...' : 'Conectar Carteira'}
              </Button>
              <p className="text-xs text-dark-400 mt-2">
                <a
                  href="https://freighter.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-400 hover:text-primary-300 inline-flex items-center"
                >
                  Instalar Freighter <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </p>
            </div>
          )}

          {/* Formulário */}
          {walletConnected && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="text-xl font-semibold text-white mb-4">Seus Dados</h3>
              
              {/* Chave pública */}
              <Input
                label="Chave Pública Stellar *"
                placeholder="GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                value={formData.publicKey}
                onChange={(e) => updateField('publicKey', e.target.value)}
                variant="cyber"
                readOnly
              />

              {/* ID da conta */}
              <Input
                label="ID da Conta Stellar *"
                placeholder="GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                value={formData.stellarAccountId}
                onChange={(e) => updateField('stellarAccountId', e.target.value)}
                variant="cyber"
                readOnly
              />

              {/* Nome completo */}
              <Input
                label="Nome Completo *"
                placeholder="Seu nome completo"
                value={formData.fullName}
                onChange={(e) => updateField('fullName', e.target.value)}
                variant="cyber"
              />

              {/* Nickname */}
              <Input
                label="Nickname *"
                placeholder="Seu nickname único"
                value={formData.nickname}
                onChange={(e) => updateField('nickname', e.target.value)}
                variant="cyber"
              />

              {/* Email */}
              <Input
                label="Email (Opcional)"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                variant="cyber"
              />

              {/* Idade */}
              <Input
                label="Idade *"
                type="number"
                placeholder="18"
                value={formData.age}
                onChange={(e) => updateField('age', e.target.value)}
                variant="cyber"
              />

              {/* Botão de submit */}
              <Button
                type="submit"
                variant="primary"
                loading={loading}
                className="w-full"
                disabled={loading}
              >
                Criar Conta
              </Button>
            </form>
          )}

          {/* Links */}
          <div className="text-center space-y-2">
            <p className="text-sm text-dark-400">
              Já tem uma conta?{' '}
              <Link
                to="/login"
                className="text-primary-400 hover:text-primary-300 font-medium"
              >
                Fazer login
              </Link>
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default CleanRegisterPage



