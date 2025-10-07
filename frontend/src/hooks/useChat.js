import { useState, useEffect } from 'react';
import { chatAPI } from '../services/api';

export const useChat = () => {
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [myMessages, setMyMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRooms = async (publicOnly = true) => {
    try {
      setLoading(true);
      setError(null);
      const response = await chatAPI.getRooms(publicOnly);
      setRooms(response.data);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchRoom = async (roomId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await chatAPI.getRoom(roomId);
      setCurrentRoom(response.data);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchRoomMessages = async (roomId, limit = 50, offset = 0) => {
    try {
      setLoading(true);
      setError(null);
      const response = await chatAPI.getRoomMessages(roomId, limit, offset);
      setMessages(response.data);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchMyMessages = async (limit = 50, offset = 0) => {
    try {
      setLoading(true);
      setError(null);
      const response = await chatAPI.getMyMessages(limit, offset);
      setMyMessages(response.data);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createRoom = async (roomData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await chatAPI.createRoom(roomData);
      // Atualizar lista de salas
      await fetchRooms();
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (roomId, messageData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await chatAPI.sendMessage(roomId, messageData);
      // Atualizar mensagens da sala
      await fetchRoomMessages(roomId);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteMessage = async (messageId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await chatAPI.deleteMessage(messageId);
      // Atualizar mensagens
      if (currentRoom) {
        await fetchRoomMessages(currentRoom.id);
      }
      await fetchMyMessages();
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const searchMessages = async (roomId, query, limit = 20) => {
    try {
      setLoading(true);
      setError(null);
      const response = await chatAPI.searchMessages(roomId, query, limit);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Alias para fetchRoomMessages para compatibilidade
  const fetchMessages = fetchRoomMessages;

  return {
    rooms,
    currentRoom,
    messages,
    myMessages,
    loading,
    error,
    fetchRooms,
    fetchRoom,
    fetchRoomMessages,
    fetchMessages, // Alias para compatibilidade
    fetchMyMessages,
    createRoom,
    sendMessage,
    deleteMessage,
    searchMessages,
    setCurrentRoom
  };
};


