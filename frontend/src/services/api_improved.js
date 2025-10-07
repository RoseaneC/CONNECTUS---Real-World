import axios from 'axios'
import toast from 'react-hot-toast'

// Configuração base da API
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

// Criar instância do Axios
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor de requisição para adicionar token
api.interceptors.request.use(
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

// Interceptor de resposta para tratamento de erros e refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    // Se for erro 401 (não autorizado) e não for uma tentativa de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      const url = error.config?.url || ''
      
      // Não tentar renovar token para login/registro/refresh
      if (!url.includes('/auth/login') && !url.includes('/auth/register') && !url.includes('/auth/refresh')) {
        const refreshToken = localStorage.getItem('refreshToken')
        
        if (refreshToken) {
          try {
            // Tentar renovar token
            const refreshResponse = await axios.post(`${BASE_URL}/auth/refresh`, {
              refresh_token: refreshToken
            })
            
            const { access_token, refresh_token: newRefreshToken } = refreshResponse.data
            
            // Salvar novos tokens
            localStorage.setItem('token', access_token)
            localStorage.setItem('refreshToken', newRefreshToken)
            
            // Atualizar header da requisição original
            originalRequest.headers.Authorization = `Bearer ${access_token}`
            
            // Tentar novamente a requisição original
            return api.request(originalRequest)
          } catch (refreshError) {
            // Se falhar ao renovar, limpar tokens e redirecionar
            localStorage.removeItem('token')
            localStorage.removeItem('refreshToken')
            toast.error('Sessão expirada. Faça login novamente.')
            window.location.href = '/login'
            return Promise.reject(refreshError)
          }
        } else {
          // Sem refresh token, redirecionar para login
          localStorage.removeItem('token')
          toast.error('Sessão expirada. Faça login novamente.')
          window.location.href = '/login'
        }
      }
    }
    
    // Tratamento de outros erros
    if (error.response?.status >= 500) {
      toast.error('Erro interno do servidor. Tente novamente mais tarde.')
    } else if (error.response?.status === 404) {
      toast.error('Recurso não encontrado.')
    } else if (error.response?.status === 403) {
      toast.error('Acesso negado.')
    } else if (error.code === 'NETWORK_ERROR' || !error.response) {
      toast.error('Erro de conexão. Verifique sua internet.')
    } else if (error.response?.data?.detail) {
      toast.error(error.response.data.detail)
    } else {
      toast.error('Ocorreu um erro inesperado.')
    }
    
    console.error('❌ Erro na API:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

export default api

// API de Autenticação
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  refreshToken: (refreshToken) => api.post('/auth/refresh', { refresh_token: refreshToken }),
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    return Promise.resolve()
  },
  verifyToken: () => api.get('/auth/verify-token'),
  updateProfile: (profileData) => api.put('/profile', profileData),
}

// API de Posts
export const postsAPI = {
  createPost: (data) => api.post('/posts/', data),
  getTimeline: (limit = 20, offset = 0) => 
    api.get(`/posts/timeline?limit=${limit}&offset=${offset}`),
  getMyPosts: (limit = 20, offset = 0) => 
    api.get(`/posts/my-posts?limit=${limit}&offset=${offset}`),
  getPost: (postId) => api.get(`/posts/${postId}`),
  updatePost: (postId, data) => api.put(`/posts/${postId}`, data),
  deletePost: (postId) => api.delete(`/posts/${postId}`),
  likePost: (postId) => api.post(`/posts/${postId}/like`),
  commentPost: (postId, data) => api.post(`/posts/${postId}/comment`, data),
  getPostComments: (postId, limit = 20, offset = 0) => 
    api.get(`/posts/${postId}/comments?limit=${limit}&offset=${offset}`),
  sharePost: (postId) => api.post(`/posts/${postId}/share`),
  searchPosts: (query, limit = 20, offset = 0) => 
    api.get(`/posts/search?q=${query}&limit=${limit}&offset=${offset}`),
}

// API de Chat
export const chatAPI = {
  getRooms: () => api.get('/chat/rooms'),
  getRoomMessages: (roomId, limit = 50, offset = 0) => 
    api.get(`/chat/rooms/${roomId}/messages?limit=${limit}&offset=${offset}`),
  sendMessage: (roomId, data) => api.post(`/chat/rooms/${roomId}/messages`, data),
}

// API de Missões
export const missionsAPI = {
  getMissions: () => api.get('/missions'),
  getMyMissions: () => api.get('/missions/my-missions'),
  completeMission: (missionId) => api.post(`/missions/${missionId}/complete`),
}

// API de Ranking
export const rankingAPI = {
  getRanking: () => api.get('/ranking'),
  getMyPosition: () => api.get('/ranking/my-position'),
}

// API de IA
export const aiAPI = {
  chat: (data) => api.post('/ai/chat', data),
  getHistory: (limit = 50) => api.get(`/ai/history?limit=${limit}`),
  getFavorites: () => api.get('/ai/favorites'),
  getStats: () => api.get('/ai/stats'),
  toggleFavorite: (messageId, isFavorite) => 
    api.post('/ai/favorite', { message_id: messageId, is_favorite: isFavorite }),
}


