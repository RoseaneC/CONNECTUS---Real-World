import { api } from './api';

export const missionService = {
  // Buscar missões
  getAllMissions: async (activeOnly = true) => {
    try {
      const response = await api.get('/missions');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar missões:', error);
      throw error;
    }
  },

  getMyMissions: async () => {
    try {
      const response = await api.get('/missions/my-missions');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar minhas missões:', error);
      throw error;
    }
  },

  getDailyMissions: async () => {
    try {
      const response = await api.get('/missions/daily');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar missões diárias:', error);
      throw error;
    }
  },

  getMissionById: async (missionId) => {
    try {
      const response = await api.get(`/missions/${missionId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar missão:', error);
      throw error;
    }
  },

  // Gerenciar missões do usuário
  assignMission: async (missionId) => {
    try {
      const response = await api.post(`/missions/assign/${missionId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao atribuir missão:', error);
      throw error;
    }
  },

  updateProgress: async (userMissionId, progressData) => {
    try {
      const response = await api.put(`/missions/${userMissionId}/progress`, progressData);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar progresso:', error);
      throw error;
    }
  },

  completeMission: async (userMissionId) => {
    try {
      const response = await api.post(`/missions/${userMissionId}/complete`);
      return response.data;
    } catch (error) {
      console.error('Erro ao completar missão:', error);
      throw error;
    }
  },

  // Estatísticas
  getMissionStats: async () => {
    try {
      const response = await api.get('/missions/stats');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar estatísticas de missões:', error);
      throw error;
    }
  }
};


