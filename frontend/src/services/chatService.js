import api from './api';

export const chatService = {
  // Salas de chat
  getRooms: async (publicOnly = true) => {
    try {
      const response = await api.get('/chat/rooms');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar salas:', error);
      throw error;
    }
  },

  createRoom: async (roomData) => {
    try {
      const response = await api.post('/chat/rooms', roomData);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar sala:', error);
      throw error;
    }
  },

  getRoom: async (roomId) => {
    try {
      const response = await api.get(`/chat/rooms/${roomId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar sala:', error);
      throw error;
    }
  },

  // Mensagens
  getRoomMessages: async (roomId, limit = 50, offset = 0) => {
    try {
      const response = await api.get(`/chat/rooms/${roomId}/messages?limit=${limit}&offset=${offset}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
      throw error;
    }
  },

  sendMessage: async (roomId, messageData) => {
    try {
      const response = await api.post(`/chat/rooms/${roomId}/messages`, messageData);
      return response.data;
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      throw error;
    }
  },

  deleteMessage: async (messageId) => {
    try {
      const response = await api.delete(`/chat/messages/${messageId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao deletar mensagem:', error);
      throw error;
    }
  },

  getMyMessages: async (limit = 50, offset = 0) => {
    try {
      const response = await api.get(`/chat/my-messages?limit=${limit}&offset=${offset}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar minhas mensagens:', error);
      throw error;
    }
  },

  // Busca
  searchMessages: async (roomId, query, limit = 20) => {
    try {
      const response = await api.get(`/chat/rooms/${roomId}/search?q=${query}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
      throw error;
    }
  },

  // Estatísticas e membros
  getRoomStats: async (roomId) => {
    try {
      const response = await api.get(`/chat/rooms/${roomId}/stats`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar estatísticas da sala:', error);
      throw error;
    }
  },

  getRoomMembers: async (roomId) => {
    try {
      const response = await api.get(`/chat/rooms/${roomId}/members`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar membros da sala:', error);
      throw error;
    }
  }
};


