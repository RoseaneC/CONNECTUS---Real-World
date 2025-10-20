// frontend/src/services/api.js
import axios from "axios";

const BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export const api = axios.create({
  baseURL: BASE,
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem("token") || null;
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch (e) {
    // ignore if localStorage not available
  }
  return config;
}, (error) => Promise.reject(error));

// Response interceptor com refresh token automático
api.interceptors.response.use(
  (resp) => resp, 
  async (error) => {
    const originalRequest = error.config;
    
    // For easier debugging
    console.error("API response error:", error?.response ?? error);
    
    if (!error.response) {
      console.error("Erro de conexão: verifique backend ou CORS");
      // Mostrar toast de erro de conexão
      if (window.showToast) {
        window.showToast("Erro de conexão. Verifique se o servidor está rodando.", "error");
      }
    } else if (error.response.status === 401 && !originalRequest._retry) {
      // Verificar se é um endpoint tolerante (AI/Ranking GETs)
      const url = originalRequest?.url || '';
      const isTolerantEndpoint = (
        url.includes('/ai/history') || 
        url.includes('/ai/favorites') || 
        url.includes('/ai/stats') || 
        url.includes('/ranking') ||
        url.includes('/missions')
      ) && originalRequest.method === 'get';
      
      if (isTolerantEndpoint) {
        // Para endpoints tolerantes, não redirecionar para login
        console.log("Endpoint tolerante sem auth - continuando normalmente");
        return Promise.reject(error);
      }
      
      // Tentar renovar token se não for login/registro
      if (!url.includes('/auth/login') && !url.includes('/auth/register') && !url.includes('/auth/refresh')) {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          try {
            originalRequest._retry = true;
            const response = await api.post('/auth/refresh', { refresh_token: refreshToken });
            const { access_token } = response.data;
            localStorage.setItem('token', access_token);
            originalRequest.headers.Authorization = `Bearer ${access_token}`;
            return api(originalRequest);
          } catch (refreshError) {
            console.log("Refresh token inválido, redirecionando para login");
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            window.location.href = "/login";
          }
        } else {
          console.log("Sem refresh token, redirecionando para login");
          localStorage.removeItem("token");
          window.location.href = "/login";
        }
      }
    } else if (error.response.status === 422) {
      // Erro de validação - mostrar mensagem amigável
      const detail = error.response.data?.detail || "Erro de validação";
      if (window.showToast) {
        window.showToast(`Erro: ${detail}`, "error");
      }
    } else if (error.response.status >= 500) {
      // Erro do servidor
      if (window.showToast) {
        window.showToast("Erro interno do servidor. Tente novamente.", "error");
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;

// API de Autenticação
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  refreshToken: (refreshToken) => api.post('/auth/refresh', { refresh_token: refreshToken }),
  getMe: () => api.get('/auth/me'),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    return Promise.resolve();
  },
  verifyToken: () => api.get('/auth/verify-token'),
  updateProfile: (profileData) => api.put('/profile', profileData),
  getCurrentUser: (token) => api.get('/auth/me', { headers: { Authorization: `Bearer ${token}` } })
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
  getPostStats: (postId) => api.get(`/posts/${postId}/stats`)
}

// API de Missões
export const missionsAPI = {
  getAllMissions: (activeOnly = true) => 
    api.get('/missions'),
  getMyMissions: () => api.get('/missions'),
  getDailyMissions: () => api.get('/missions'),
  assignMission: (missionId) => api.post(`/missions/${missionId}/complete`),
  updateProgress: (userMissionId, data) => 
    api.put(`/missions/${userMissionId}/complete`, data),
  completeMission: (userMissionId) => 
    api.post(`/missions/${userMissionId}/complete`),
  getMissionStats: () => api.get('/missions'),
  getMissionById: (missionId) => api.get('/missions')
}

// API de Chat
export const chatAPI = {
  getRooms: (publicOnly = true) => 
    api.get('/chat/rooms'),
  createRoom: (data) => api.post('/chat/rooms', data),
  getRoom: (roomId) => api.get(`/chat/rooms/${roomId}`),
  getRoomMessages: (roomId, limit = 50, offset = 0) => 
    api.get(`/chat/rooms/${roomId}/messages?limit=${limit}&offset=${offset}`),
  sendMessage: (roomId, data) => api.post(`/chat/rooms/${roomId}/messages`, data),
  deleteMessage: (messageId) => api.delete(`/chat/messages/${messageId}`),
  getMyMessages: (limit = 50, offset = 0) => 
    api.get(`/chat/my-messages?limit=${limit}&offset=${offset}`),
  searchMessages: (roomId, query, limit = 20) => 
    api.get(`/chat/rooms/${roomId}/search?q=${query}&limit=${limit}`),
  getRoomStats: (roomId) => api.get(`/chat/rooms/${roomId}/stats`),
  getRoomMembers: (roomId) => api.get(`/chat/rooms/${roomId}/members`)
}

// API de AI
export const aiAPI = {
  getHistory: (limit = 50) => api.get(`/ai/history?limit=${limit}`),
  getFavorites: () => api.get('/ai/favorites'),
  getStats: () => api.get('/ai/stats'),
  chatPublic: (message) => api.post('/ai/chat-public', { message })
}

// API de Ranking
export const rankingAPI = {
  getOverallRanking: (page = 1, pageSize = 20) => 
    api.get('/ranking'),
  getXpRanking: (page = 1, pageSize = 20) => 
    api.get('/ranking'),
  getTokenRanking: (page = 1, pageSize = 20) => 
    api.get('/ranking'),
  getMissionRanking: (page = 1, pageSize = 20) => 
    api.get('/ranking'),
  getMyPosition: (rankingType = 'overall') => 
    api.get('/ranking'),
  getMyRanking: () => api.get('/ranking'),
  getLeaderboard: () => api.get('/ranking'),
  getAchievements: () => api.get('/ranking'),
  getStats: () => api.get('/ranking')
}