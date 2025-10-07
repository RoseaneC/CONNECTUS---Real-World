import { api } from './api';

export const postService = {
  // Criar post
  createPost: async (postData) => {
    try {
      const response = await api.post('/posts/', postData);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar post:', error);
      throw error;
    }
  },

  // Timeline e posts do usuário
  getTimeline: async (limit = 20, offset = 0) => {
    try {
      const response = await api.get(`/posts/timeline?limit=${limit}&offset=${offset}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar timeline:', error);
      throw error;
    }
  },

  getMyPosts: async (limit = 20, offset = 0) => {
    try {
      const response = await api.get(`/posts/my-posts?limit=${limit}&offset=${offset}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar meus posts:', error);
      throw error;
    }
  },

  // Buscar post específico
  getPost: async (postId) => {
    try {
      const response = await api.get(`/posts/${postId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar post:', error);
      throw error;
    }
  },

  // Atualizar e deletar posts
  updatePost: async (postId, postData) => {
    try {
      const response = await api.put(`/posts/${postId}`, postData);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar post:', error);
      throw error;
    }
  },

  deletePost: async (postId) => {
    try {
      const response = await api.delete(`/posts/${postId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao deletar post:', error);
      throw error;
    }
  },

  // Interações com posts
  likePost: async (postId) => {
    try {
      const response = await api.post(`/posts/${postId}/like`);
      return response.data;
    } catch (error) {
      console.error('Erro ao curtir post:', error);
      throw error;
    }
  },

  commentPost: async (postId, commentData) => {
    try {
      const response = await api.post(`/posts/${postId}/comment`, commentData);
      return response.data;
    } catch (error) {
      console.error('Erro ao comentar post:', error);
      throw error;
    }
  },

  getPostComments: async (postId, limit = 20, offset = 0) => {
    try {
      const response = await api.get(`/posts/${postId}/comments?limit=${limit}&offset=${offset}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar comentários:', error);
      throw error;
    }
  },

  sharePost: async (postId) => {
    try {
      const response = await api.post(`/posts/${postId}/share`);
      return response.data;
    } catch (error) {
      console.error('Erro ao compartilhar post:', error);
      throw error;
    }
  },

  // Busca
  searchPosts: async (query, limit = 20, offset = 0) => {
    try {
      const response = await api.get(`/posts/search?q=${query}&limit=${limit}&offset=${offset}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar posts:', error);
      throw error;
    }
  },

  // Estatísticas
  getPostStats: async (postId) => {
    try {
      const response = await api.get(`/posts/${postId}/stats`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar estatísticas do post:', error);
      throw error;
    }
  }
};




