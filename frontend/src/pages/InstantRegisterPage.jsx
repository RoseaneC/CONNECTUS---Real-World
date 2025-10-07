import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Wallet, CheckCircle, User, Mail, Calendar } from 'lucide-react'

import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Card from '../components/ui/Card'
import { useAuth } from '../context/AuthContext'

const InstantRegisterPage = () => {
  const navigate = useNavigate()
  const { register: registerUser, loading } = useAuth()
  
  // Estados do formulário
  const [formData, setFormData] = useState({
    publicKey: '',
    stellarAccountId: '',
    nickname: '',
    fullName: '',
    email: '',
    age: ''
  })

  const [step, setStep] = useState(1) // 1: Carteira, 2: Dados

  // Gerar chaves Stellar automaticamente
  const generateStellarKeys = () => {
    const randomString = () => Math.random().toString(36).substring(2, 15)
    const publicKey = 'G' + randomString() + randomString() + randomString() + randomString()
    const accountId = publicKey
    
    setFormData(prev => ({
      ...prev,
      publicKey,
      stellarAccountId: accountId
    }))
    
    toast.success('Carteira Stellar criada!')
    setStep(2)
  }

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
      if (!formData.stellarAccountId || !formData.publicKey || !formData.nickname || !formData.fullName || !formData.age) {
        toast.error('Preencha todos os campos obrigatórios')
        return
      }

      if (!isValidPublicKey(formData.publicKey)) {
        toast.error('Chave pública inválida')
        return
      }

      if (parseInt(formData.age) < 13 || parseInt(formData.age) > 25) {
        toast.error('Idade deve estar entre 13 e 25 anos')
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

      console.log('Enviando dados para registro:', userData)
      
      const result = await registerUser(userData)
      console.log('Resultado do registro:', result)
      
      if (result.success) {
        toast.success('Conta criada com sucesso! Redirecionando...')
        // Aguardar um pouco antes de redirecionar
        setTimeout(() => {
          navigate('/dashboard')
        }, 1000)
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

          {/* Indicador de Passo */}
          <div className="flex items-center justify-center space-x-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= 1 ? 'bg-primary-500 text-white' : 'bg-dark-700 text-dark-400'
            }`}>
              1
            </div>
            <div className={`w-8 h-0.5 ${step > 1 ? 'bg-primary-500' : 'bg-dark-700'}`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= 2 ? 'bg-primary-500 text-white' : 'bg-dark-700 text-dark-400'
            }`}>
              2
            </div>
          </div>

          {/* Passo 1: Carteira */}
          {step === 1 && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto">
                <Wallet className="w-8 h-8 text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">Criar Carteira Stellar</h3>
              <p className="text-dark-400">
                Clique no botão abaixo para criar uma carteira Stellar automaticamente
              </p>
              <Button
                onClick={generateStellarKeys}
                className="w-full"
                variant="primary"
              >
                <Wallet className="w-5 h-5 mr-2" />
                Criar Carteira Stellar
              </Button>
            </div>
          )}

          {/* Passo 2: Dados */}
          {step === 2 && (
            <div className="space-y-6">
              {/* Status da Carteira */}
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-green-400 font-medium">Carteira Stellar Criada</span>
                </div>
                <p className="text-sm text-green-300 mt-1">
                  Chave: {formData.publicKey?.substring(0, 20)}...
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-xl font-semibold text-white">Seus Dados</h3>
                
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
                  required
                />

                {/* Nickname */}
                <Input
                  label="Nickname *"
                  placeholder="Seu nickname único"
                  value={formData.nickname}
                  onChange={(e) => updateField('nickname', e.target.value)}
                  variant="cyber"
                  required
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
                  min="13"
                  max="25"
                  required
                />

                {/* Botões */}
                <div className="flex space-x-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setStep(1)}
                    className="flex-1"
                  >
                    Voltar
                  </Button>
                  
                  <Button
                    type="submit"
                    variant="primary"
                    loading={loading}
                    className="flex-1"
                    disabled={loading}
                  >
                    {loading ? 'Criando Conta...' : 'Criar Conta'}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Links */}
          <div className="text-center space-y-2">
            <p className="text-sm text-dark-400">
              Já tem uma conta?{' '}
              <button
                onClick={() => navigate('/working-login')}
                className="text-primary-400 hover:text-primary-300 font-medium"
              >
                Fazer login
              </button>
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default InstantRegisterPage



