import { api } from './api';

export const userService = {
  // Perfil do usuário
  getProfile: async () => {
    try {
      const response = await api.get('/users/profile');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      throw error;
    }
  },

  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/users/profile', profileData);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      throw error;
    }
  },

  // Saldo e transações
  getBalance: async () => {
    try {
      const response = await api.get('/users/balance');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar saldo:', error);
      throw error;
    }
  },

  getTransactions: async (limit = 10) => {
    try {
      const response = await api.get(`/users/transactions?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
      throw error;
    }
  },

  transferTokens: async (toPublicKey, amount) => {
    try {
      const response = await api.post('/users/transfer-tokens', {
        to_public_key: toPublicKey,
        amount: amount
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao transferir tokens:', error);
      throw error;
    }
  },

  // Estatísticas
  getStats: async () => {
    try {
      const response = await api.get('/users/stats');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      throw error;
    }
  },

  // Buscar usuário por ID
  getUserById: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      throw error;
    }
  }
};






