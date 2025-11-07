/**
 * API service para Impact Score
 */

import api from './api';
import toast from 'react-hot-toast';

const getScore = async (userId) => {
  try {
    const response = await api.get(`/impact/score/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar score:', error);
    if (error.response) {
      toast.error(error.response.data?.detail || 'Erro ao buscar score');
    } else {
      toast.error('Erro de conexão');
    }
    throw error;
  }
};

const listEvents = async (userId, page = 1, pageSize = 10) => {
  try {
    const response = await api.get(`/impact/events/${userId}?page=${page}&page_size=${pageSize}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao listar eventos:', error);
    if (error.response) {
      toast.error(error.response.data?.detail || 'Erro ao listar eventos');
    } else {
      toast.error('Erro de conexão');
    }
    throw error;
  }
};

const postEvent = async (payload) => {
  try {
    const response = await api.post('/impact/event', payload);
    return response.data;
  } catch (error) {
    console.error('Erro ao criar evento:', error);
    if (error.response) {
      toast.error(error.response.data?.detail || 'Erro ao criar evento');
    } else {
      toast.error('Erro de conexão');
    }
    throw error;
  }
};

const attestMock = async () => {
  try {
    const response = await api.post('/impact/attest');
    return response.data;
  } catch (error) {
    console.error('Erro ao criar attestation:', error);
    if (error.response) {
      toast.error(error.response.data?.detail || 'Erro ao criar attestation');
    } else {
      toast.error('Erro de conexão');
    }
    throw error;
  }
};

export { getScore, listEvents, postEvent, attestMock };


