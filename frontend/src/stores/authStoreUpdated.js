import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authAPI } from '../services/api'

const useAuthStore = create(
  persist(
    (set, get) => ({
      // Estado
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Ações
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      
      setToken: (token) => set({ token }),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      setError: (error) => set({ error }),
      
      clearError: () => set({ error: null }),

      // Login
      login: async (nickname, password) => {
        try {
          set({ isLoading: true, error: null })
          
          const response = await authAPI.login(nickname, password)
          const { access_token } = response.data
          
          // Salvar token
          set({ token: access_token })
          
          // Obter dados do usuário
          const userResponse = await authAPI.getCurrentUser(access_token)
          set({ 
            user: userResponse.data, 
            isAuthenticated: true,
            isLoading: false 
          })
          
          return { success: true }
        } catch (error) {
          const errorMessage = error.response?.data?.detail || 'Erro ao fazer login'
          set({ 
            error: errorMessage, 
            isLoading: false,
            isAuthenticated: false,
            user: null,
            token: null
          })
          return { success: false, error: errorMessage }
        }
      },

      // Registro
      register: async (userData) => {
        try {
          set({ isLoading: true, error: null })
          
          const response = await authAPI.register(userData)
          
          set({ isLoading: false })
          return { success: true, data: response.data }
        } catch (error) {
          const errorMessage = error.response?.data?.detail || 'Erro ao registrar usuário'
          set({ 
            error: errorMessage, 
            isLoading: false 
          })
          return { success: false, error: errorMessage }
        }
      },

      // Atualizar perfil
      updateProfile: async (profileData) => {
        try {
          set({ isLoading: true, error: null })
          
          const response = await authAPI.updateProfile(profileData)
          
          // Atualizar dados do usuário no store
          set({ 
            user: response.data,
            isLoading: false 
          })
          
          return { success: true, data: response.data }
        } catch (error) {
          const errorMessage = error.response?.data?.detail || 'Erro ao atualizar perfil'
          set({ 
            error: errorMessage, 
            isLoading: false 
          })
          return { success: false, error: errorMessage }
        }
      },

      // Logout
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null
        })
        
        // Limpar localStorage
        localStorage.removeItem('auth-storage')
        
        // Redirecionar para login
        window.location.href = '/login'
      },

      // Verificar autenticação
      checkAuth: async () => {
        const { token } = get()
        if (!token) {
          set({ isAuthenticated: false, user: null })
          return false
        }

        try {
          set({ isLoading: true })
          const response = await authAPI.getCurrentUser(token)
          set({ 
            user: response.data, 
            isAuthenticated: true,
            isLoading: false 
          })
          return true
        } catch (error) {
          set({ 
            isAuthenticated: false, 
            user: null, 
            token: null,
            isLoading: false 
          })
          return false
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token, 
        isAuthenticated: state.isAuthenticated 
      })
    }
  )
)

export default useAuthStore






