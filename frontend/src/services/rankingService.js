import api from './api';

export const rankingService = {
  // Rankings gerais
  getXpRanking: async (page = 1, pageSize = 20) => {
    try {
      const response = await api.get('/ranking');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar ranking de XP:', error);
      throw error;
    }
  },

  getTokenRanking: async (page = 1, pageSize = 20) => {
    try {
      const response = await api.get('/ranking');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar ranking de tokens:', error);
      throw error;
    }
  },

  getMissionRanking: async (page = 1, pageSize = 20) => {
    try {
      const response = await api.get('/ranking');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar ranking de missões:', error);
      throw error;
    }
  },

  // Posição do usuário
  getMyPosition: async (rankingType = 'overall') => {
    try {
      const response = await api.get(`/ranking/my-position?ranking_type=${rankingType}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar minha posição:', error);
      throw error;
    }
  },

  getMyRanking: async () => {
    try {
      const response = await api.get('/ranking/my-ranking');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar meu ranking:', error);
      throw error;
    }
  },

  // Leaderboard e conquistas
  getLeaderboard: async () => {
    try {
      const response = await api.get('/ranking/leaderboard');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar leaderboard:', error);
      throw error;
    }
  },

  getAchievements: async () => {
    try {
      const response = await api.get('/ranking/achievements');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar conquistas:', error);
      throw error;
    }
  },

  // Estatísticas gerais
  getStats: async () => {
    try {
      const response = await api.get('/ranking/stats');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar estatísticas do ranking:', error);
      throw error;
    }
  }
};


