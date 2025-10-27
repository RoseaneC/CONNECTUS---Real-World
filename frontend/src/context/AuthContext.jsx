/**
 * Contexto de autenticação para Connectus
 * Gerencia login, logout, registro e estado do usuário
 */

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import api from '../services/api'

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
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refreshToken'))

  // Configurar interceptor do Axios para enviar token automaticamente
  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token inválido ou expirado
          logout()
          toast.error('Sessão expirada. Faça login novamente.')
        }
        return Promise.reject(error)
      }
    )

    return () => {
      api.interceptors.request.eject(requestInterceptor)
      api.interceptors.response.eject(responseInterceptor)
    }
  }, [])

  // Verificar se usuário está logado ao carregar a aplicação
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await api.get('/auth/me')
          setUser(response.data)
        } catch (error) {
          console.error('Erro ao verificar autenticação:', error)
          localStorage.removeItem('token')
          setToken(null)
        }
      }
      setLoading(false)
    }

    checkAuth()
  }, [token])

  const login = async (nickname, password) => {
    try {
      setLoading(true)
      console.log('🔍 Tentando fazer login:', { nickname, password: '***' })
      
      const response = await api.post('/auth/login', {
        nickname: nickname.trim().toLowerCase(),
        password
      })

      console.log('✅ Resposta do login:', response.data)
      const { access_token, refresh_token } = response.data
      
      // Salvar tokens no localStorage
      localStorage.setItem('token', access_token)
      localStorage.setItem('refreshToken', refresh_token)
      setToken(access_token)
      setRefreshToken(refresh_token)
      
      // Buscar dados do usuário
      console.log('🔍 Buscando dados do usuário...')
      const userResponse = await api.get('/auth/me')
      console.log('✅ Dados do usuário:', userResponse.data)
      setUser(userResponse.data)
      
      toast.success('Login realizado com sucesso!')
      return { success: true }
      
    } catch (error) {
      console.error('Erro no login:', error)
      
      let errorMessage = 'Erro ao fazer login'
      
      if (error.response?.status === 401) {
        errorMessage = 'Usuário ou senha inválidos. Se for seu 1º acesso, crie sua conta.'
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data.detail || 'Dados inválidos'
      } else if (error.response?.status === 422) {
        errorMessage = 'Dados de login inválidos. Verifique o formato.'
      } else if (error.response?.status >= 500) {
        errorMessage = 'Erro interno do servidor. Tente novamente em alguns minutos.'
      } else if (!error.response) {
        errorMessage = 'Erro de conexão. Verifique se o servidor está rodando.'
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
      
      console.log('🔍 Registrando usuário:', userData.nickname)
      
      const response = await api.post('/auth/register', {
        nickname: userData.nickname.trim().toLowerCase(),
        password: userData.password,
        full_name: userData.full_name,
        email: userData.email,
        bio: userData.bio
      })

      console.log('✅ Registro bem-sucedido:', response.data)
      
      // Após registro bem-sucedido, fazer login automaticamente
      console.log('🔍 Fazendo login automático...')
      const loginResponse = await api.post('/auth/login', {
        nickname: userData.nickname.trim().toLowerCase(),
        password: userData.password
      })

      console.log('✅ Login automático bem-sucedido:', loginResponse.data)
      const { access_token } = loginResponse.data
      
      // Salvar token no localStorage
      localStorage.setItem('token', access_token)
      setToken(access_token)
      
      // Buscar dados do usuário
      console.log('🔍 Buscando dados do usuário...')
      const userResponse = await api.get('/auth/me')
      console.log('✅ Dados do usuário:', userResponse.data)
      setUser(userResponse.data)
      
      toast.success('Conta criada com sucesso!')
      return { success: true }
      
    } catch (error) {
      console.error('❌ Erro no registro:', error)
      console.error('❌ Detalhes do erro:', error.response?.data)
      
      let errorMessage = 'Erro ao criar conta'
      
      if (error.response?.status === 400) {
        const detail = error.response.data.detail
        if (detail === 'Nickname já cadastrado') {
          errorMessage = 'Esse nickname já está em uso'
        } else if (detail === 'Email já cadastrado') {
          errorMessage = 'Esse email já está em uso'
        } else {
          errorMessage = detail || 'Dados inválidos'
        }
      } else if (error.response?.status >= 500) {
        errorMessage = 'Erro de conexão com o servidor'
      }
      
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    // Remover tokens do localStorage
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    setToken(null)
    setRefreshToken(null)
    setUser(null)
    
    // Redirecionar para login
    window.location.href = '/login'
    
    toast.success('Logout realizado com sucesso!')
  }

  const updateUser = (userData) => {
    setUser(prevUser => ({
      ...prevUser,
      ...userData
    }))
  }

  const isAuthenticated = !!token && !!user

  const value = {
    user,
    loading,
    token,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}