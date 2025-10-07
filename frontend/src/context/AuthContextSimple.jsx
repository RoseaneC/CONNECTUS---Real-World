/**
 * Contexto de autenticação simplificado para Connectus
 * Versão sem carregamento infinito
 */

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { api } from '../services/api'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refreshToken'))

  // Verificar se usuário está logado ao carregar a aplicação
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('token')
      if (storedToken) {
        try {
          console.log('🔍 Verificando token existente...')
          const response = await api.get('/auth/me')
          console.log('✅ Usuário autenticado:', response.data)
          setUser(response.data)
          setToken(storedToken)
        } catch (error) {
          console.error('❌ Token inválido:', error)
          localStorage.removeItem('token')
          localStorage.removeItem('refreshToken')
          setToken(null)
          setRefreshToken(null)
          setUser(null)
        }
      }
      setLoading(false)
    }

    checkAuth()
  }, [])

  const login = async (nickname, password) => {
    try {
      setLoading(true)
      console.log('🔍 Tentando fazer login:', { nickname, password: '***' })
      
      const response = await api.post('/auth/login', {
        nickname: nickname.trim().toLowerCase(),
        password
      })

      console.log('✅ Resposta do login:', response.data)
      const { access_token, token_type, expires_in } = response.data
      
      // Salvar token no localStorage
      localStorage.setItem('token', access_token)
      setToken(access_token)
      
      // Buscar dados do usuário
      console.log('🔍 Buscando dados do usuário...')
      const userResponse = await api.get('/auth/me')
      console.log('✅ Dados do usuário:', userResponse.data)
      setUser(userResponse.data)
      
      toast.success('Login realizado com sucesso!')
      return { success: true }
      
    } catch (error) {
      console.error('❌ Erro no login:', error)
      
      let errorMessage = 'Erro ao fazer login'
      
      if (error.response?.status === 401) {
        errorMessage = 'Credenciais inválidas'
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data.detail || 'Dados inválidos'
      } else if (error.response?.status >= 500) {
        errorMessage = 'Erro de conexão com o servidor'
      } else if (!error.response) {
        errorMessage = 'Servidor não está respondendo'
      }
      
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData) => {
    try {
      setLoading(true)
      console.log('🔍 Tentando registrar usuário:', userData)
      
      const response = await api.post('/auth/register', userData)
      console.log('✅ Usuário registrado:', response.data)
      
      toast.success('Usuário registrado com sucesso!')
      return { success: true, user: response.data }
      
    } catch (error) {
      console.error('❌ Erro no registro:', error)
      
      let errorMessage = 'Erro ao registrar usuário'
      
      if (error.response?.status === 400) {
        errorMessage = error.response.data.detail || 'Dados inválidos'
      } else if (error.response?.status >= 500) {
        errorMessage = 'Erro de conexão com o servidor'
      } else if (!error.response) {
        errorMessage = 'Servidor não está respondendo'
      }
      
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    console.log('🔍 Fazendo logout...')
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    setToken(null)
    setRefreshToken(null)
    setUser(null)
    toast.success('Logout realizado com sucesso!')
  }

  const value = {
    user,
    loading,
    token,
    refreshToken,
    login,
    register,
    logout,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

