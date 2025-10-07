import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { LogIn, User, Lock, Eye, EyeOff } from 'lucide-react'

import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Card from '../components/ui/Card'
import { useAuth } from '../context/AuthContextSimple'

const SimpleLoginPageFixed = () => {
  const navigate = useNavigate()
  const { login, loading } = useAuth()
  
  // Estados do formulário
  const [formData, setFormData] = useState({
    nickname: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)

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
    
    if (loading) {
      toast.error('Aguarde o carregamento anterior terminar')
      return
    }
    
    // Validar dados
    if (!formData.nickname || !formData.password) {
      toast.error('Preencha todos os campos')
      return
    }

    if (formData.nickname.length < 3) {
      toast.error('Nickname deve ter pelo menos 3 caracteres')
      return
    }

    if (formData.password.length < 6) {
      toast.error('Senha deve ter pelo menos 6 caracteres')
      return
    }
    
    try {
      console.log('🔍 Enviando dados de login:', { nickname: formData.nickname, password: '***' })
      
      const result = await login(formData.nickname, formData.password)
      console.log('📋 Resultado do login:', result)
      
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
      console.error('❌ Erro no login:', error)
      toast.error('Erro inesperado ao fazer login')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Connectus</h1>
            <p className="text-gray-400">Faça login para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nickname
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Digite seu nickname"
                  value={formData.nickname}
                  onChange={(e) => updateField('nickname', e.target.value)}
                  className="pl-10"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Digite sua senha"
                  value={formData.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  className="pl-10 pr-10"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Entrando...
                </div>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Não tem uma conta?{' '}
              <button
                onClick={() => navigate('/register')}
                className="text-primary-400 hover:text-primary-300 font-medium"
              >
                Cadastre-se
              </button>
            </p>
          </div>

          <div className="mt-4 text-center">
            <p className="text-gray-500 text-xs">
              Versão simplificada - sem carregamento infinito
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default SimpleLoginPageFixed

