import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { LogIn, User } from 'lucide-react'

import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Card from '../components/ui/Card'
import { useAuth } from '../context/AuthContext'

const WorkingLoginPage = () => {
  const navigate = useNavigate()
  const { login, loading } = useAuth()
  
  // Estados do formulário
  const [formData, setFormData] = useState({
    publicKey: '',
    stellarAccountId: ''
  })

  // Atualizar campo do formulário
  const updateField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Validar chave pública
  const isValidPublicKey = (key) => {
    return typeof key === 'string' && key.startsWith('G') && key.length === 56
  }

  // Submeter formulário
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (loading) {
      toast.error('Aguarde o carregamento anterior terminar')
      return
    }
    
    try {
      // Validar dados
      if (!formData.stellarAccountId || !formData.publicKey) {
        toast.error('Preencha todos os campos obrigatórios')
        return
      }

      if (!isValidPublicKey(formData.publicKey)) {
        toast.error('Chave pública inválida')
        return
      }

      console.log('Enviando dados de login:', formData)
      
      const result = await login(formData.stellarAccountId, formData.publicKey)
      console.log('Resultado do login:', result)
      
      if (result.success) {
        toast.success('Login realizado com sucesso! Redirecionando...')
        // Aguardar um pouco antes de redirecionar
        setTimeout(() => {
          navigate('/dashboard')
        }, 1000)
      } else {
        toast.error(result.error || 'Erro ao fazer login')
      }
    } catch (error) {
      console.error('Erro no login:', error)
      toast.error('Erro inesperado ao fazer login')
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <Card variant="cyber" className="w-full max-w-md mx-auto">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto">
              <LogIn className="w-8 h-8 text-primary-400" />
            </div>
            <h2 className="text-3xl font-bold text-white">Entrar no Connectus</h2>
            <p className="text-dark-400">
              Use suas credenciais Stellar para acessar sua conta
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Chave pública */}
            <Input
              label="Chave Pública Stellar *"
              placeholder="GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
              value={formData.publicKey}
              onChange={(e) => updateField('publicKey', e.target.value)}
              variant="cyber"
              required
            />

            {/* ID da conta */}
            <Input
              label="ID da Conta Stellar *"
              placeholder="GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
              value={formData.stellarAccountId}
              onChange={(e) => updateField('stellarAccountId', e.target.value)}
              variant="cyber"
              required
            />

            {/* Botão de submit */}
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar no Connectus'}
            </Button>
          </form>

          {/* Links */}
          <div className="text-center space-y-2">
            <p className="text-sm text-dark-400">
              Não tem uma conta?{' '}
              <button
                onClick={() => navigate('/working-register')}
                className="text-primary-400 hover:text-primary-300 font-medium"
              >
                Criar conta
              </button>
            </p>
            
            <p className="text-xs text-dark-500">
              Precisa de uma chave Stellar?{' '}
              <a
                href="https://laboratory.stellar.org/#account-creator?network=testnet"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-400 hover:text-accent-300"
              >
                Stellar Laboratory
              </a>
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default WorkingLoginPage














