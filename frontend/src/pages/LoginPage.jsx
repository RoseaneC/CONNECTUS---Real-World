/**
 * Página de Login para Connectus
 * Design futurista com validação completa
 */

import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { 
  LogIn, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight,
  User,
  AlertCircle
} from 'lucide-react'
import { toast } from 'react-hot-toast'

import { useAuth } from '../context/AuthContext'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

const LoginPage = () => {
  const navigate = useNavigate()
  const { login, loading, isAuthenticated } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setFocus
  } = useForm({
    defaultValues: {
      nickname: '',
      password: ''
    }
  })

  // Redirecionar se já estiver logado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  // Focar no primeiro campo ao carregar
  useEffect(() => {
    setFocus('nickname')
  }, [setFocus])

  // Submeter formulário
  const onSubmit = async (data) => {
    if (isSubmitting) return
    
    setIsSubmitting(true)
    
    try {
      const result = await login(data.nickname, data.password)
      
      if (result.success) {
        navigate('/dashboard')
      }
    } catch (error) {
      console.error('Erro no login:', error)
      toast.error('Erro inesperado ao fazer login')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <Card variant="cyber" className="w-full max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto">
              <LogIn className="w-8 h-8 text-primary-400" />
            </div>
            <h2 className="text-3xl font-bold text-white">Entrar no Connectus</h2>
            <p className="text-dark-400">
              Acesse sua conta e continue sua jornada de impacto social
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Nickname */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-dark-200">
                Nickname *
              </label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="seu_nickname"
                  {...register('nickname', {
                    required: 'Nickname é obrigatório',
                    minLength: {
                      value: 3,
                      message: 'Nickname deve ter pelo menos 3 caracteres'
                    },
                    maxLength: {
                      value: 50,
                      message: 'Nickname deve ter no máximo 50 caracteres'
                    },
                    pattern: {
                      value: /^[a-zA-Z0-9_]+$/,
                      message: 'Nickname deve conter apenas letras, números e _'
                    }
                  })}
                  error={errors.nickname?.message}
                  variant="cyber"
                  className="pl-10"
                />
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-dark-400" />
              </div>
            </div>

            {/* Senha */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-dark-200">
                Senha *
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Sua senha"
                  {...register('password', {
                    required: 'Senha é obrigatória',
                    minLength: {
                      value: 6,
                      message: 'Senha deve ter pelo menos 6 caracteres'
                    }
                  })}
                  error={errors.password?.message}
                  variant="cyber"
                  className="pl-10 pr-10"
                />
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-dark-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-dark-400 hover:text-dark-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Esqueci minha senha */}
            <div className="text-right">
              <a
                href="#"
                className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
              >
                Esqueci minha senha
              </a>
            </div>

            {/* Botão de submit */}
            <Button
              type="submit"
              loading={loading || isSubmitting}
              disabled={loading || isSubmitting}
              className="w-full py-3"
              variant="primary"
            >
              {loading || isSubmitting ? 'Entrando...' : 'Entrar no Connectus'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>

          {/* Links */}
          <div className="text-center space-y-2">
            <p className="text-sm text-dark-400">
              Não tem uma conta?{' '}
              <Link
                to="/register"
                className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
              >
                Criar conta
              </Link>
            </p>
          </div>

          {/* Dicas */}
          <div className="bg-dark-800/50 rounded-lg p-4 space-y-2">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-primary-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-dark-300">
                <p className="font-medium text-dark-200 mb-1">Dicas de login:</p>
                <ul className="space-y-1">
                  <li>• Use seu nickname único</li>
                  <li>• Senha deve ter pelo menos 6 caracteres</li>
                  <li>• Não use espaços no nickname</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </Card>
    </div>
  )
}

export default LoginPage