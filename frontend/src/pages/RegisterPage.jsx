/**
 * Página de Registro para Connectus
 * Design futurista com validação completa
 */

import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { 
  UserPlus, 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight,
  Mail, 
  FileText,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { toast } from 'react-hot-toast'

import { useAuth } from '../context/AuthContext'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

const RegisterPage = () => {
  const navigate = useNavigate()
  const { register: registerUser, loading, isAuthenticated } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setFocus
  } = useForm({
    defaultValues: {
      nickname: '',
      password: '',
      confirmPassword: '',
      full_name: '',
      email: '',
      bio: ''
    }
  })

  const password = watch('password')

  // Redirecionar se já estiver logado
  useEffect(() => {
    if (isAuthenticated()) {
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
      // Validar confirmação de senha
      if (data.password !== data.confirmPassword) {
        toast.error('As senhas não coincidem')
        return
      }

      const result = await registerUser({
        nickname: data.nickname,
        password: data.password,
        full_name: data.full_name,
        email: data.email,
        bio: data.bio
      })
      
      if (result.success) {
        navigate('/dashboard')
      }
    } catch (error) {
      console.error('Erro no registro:', error)
      toast.error('Erro inesperado ao criar conta')
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
              <UserPlus className="w-8 h-8 text-primary-400" />
            </div>
            <h2 className="text-3xl font-bold text-white">Criar Conta</h2>
            <p className="text-dark-400">
              Junte-se à comunidade Connectus e comece sua jornada
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Nickname */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-dark-200">
                Nickname * <span className="text-xs text-dark-400">(único)</span>
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

            {/* Nome Completo */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-dark-200">
                Nome Completo
              </label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Seu nome completo"
                  {...register('full_name', {
                    maxLength: {
                      value: 100,
                      message: 'Nome deve ter no máximo 100 caracteres'
                    }
                  })}
                  error={errors.full_name?.message}
                  variant="cyber"
                  className="pl-10"
                />
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-dark-400" />
              </div>
            </div>

                {/* Email */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-dark-200">
                Email
              </label>
              <div className="relative">
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  {...register('email', {
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Email inválido'
                    }
                  })}
                  error={errors.email?.message}
                  variant="cyber"
                  className="pl-10"
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-dark-400" />
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
                  placeholder="Mínimo 6 caracteres"
                  {...register('password', {
                    required: 'Senha é obrigatória',
                    minLength: {
                      value: 6,
                      message: 'Senha deve ter pelo menos 6 caracteres'
                    },
                    maxLength: {
                      value: 100,
                      message: 'Senha deve ter no máximo 100 caracteres'
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

            {/* Confirmar Senha */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-dark-200">
                Confirmar Senha *
              </label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirme sua senha"
                  {...register('confirmPassword', {
                    required: 'Confirmação de senha é obrigatória',
                    validate: value => 
                      value === password || 'As senhas não coincidem'
                  })}
                  error={errors.confirmPassword?.message}
                  variant="cyber"
                  className="pl-10 pr-10"
                />
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-dark-400" />
                <button
                    type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-dark-400 hover:text-dark-300 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-dark-200">
                Bio <span className="text-xs text-dark-400">(opcional)</span>
              </label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Conte um pouco sobre você..."
                  {...register('bio', {
                    maxLength: {
                      value: 500,
                      message: 'Bio deve ter no máximo 500 caracteres'
                    }
                  })}
                  error={errors.bio?.message}
                  variant="cyber"
                  className="pl-10"
                />
                <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-dark-400" />
              </div>
            </div>

            {/* Botão de submit */}
                  <Button
              type="submit"
              loading={loading || isSubmitting}
              disabled={loading || isSubmitting}
              className="w-full py-3"
                    variant="primary"
                  >
              {loading || isSubmitting ? 'Criando conta...' : 'Criar Conta'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
              </form>

          {/* Links */}
          <div className="text-center space-y-2">
            <p className="text-sm text-dark-400">
              Já tem uma conta?{' '}
              <Link
                to="/login"
                className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
              >
                Fazer login
              </Link>
            </p>
          </div>

          {/* Dicas */}
          <div className="bg-dark-800/50 rounded-lg p-4 space-y-2">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-primary-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-dark-300">
                <p className="font-medium text-dark-200 mb-1">Dicas de cadastro:</p>
                <ul className="space-y-1">
                  <li>• Nickname deve ser único e sem espaços</li>
                  <li>• Senha deve ter pelo menos 6 caracteres</li>
                  <li>• Email é opcional mas recomendado</li>
                  <li>• Bio ajuda outros usuários a te conhecer</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </Card>
    </div>
  )
}

export default RegisterPage