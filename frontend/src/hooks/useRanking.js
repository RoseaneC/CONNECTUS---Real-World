import { useState, useEffect } from 'react';
import { rankingAPI } from '../services/api';

export const useRanking = () => {
  const [xpRanking, setXpRanking] = useState([]);
  const [tokenRanking, setTokenRanking] = useState([]);
  const [missionRanking, setMissionRanking] = useState([]);
  const [myPosition, setMyPosition] = useState(null);
  const [myRanking, setMyRanking] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchXpRanking = async (page = 1, pageSize = 20) => {
    try {
      setLoading(true);
      setError(null);
      const response = await rankingAPI.getXpRanking(page, pageSize);
      setXpRanking(response.data);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchTokenRanking = async (page = 1, pageSize = 20) => {
    try {
      setLoading(true);
      setError(null);
      const response = await rankingAPI.getTokenRanking(page, pageSize);
      setTokenRanking(response.data);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchMissionRanking = async (page = 1, pageSize = 20) => {
    try {
      setLoading(true);
      setError(null);
      const response = await rankingAPI.getMissionRanking(page, pageSize);
      setMissionRanking(response.data);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchMyPosition = async (rankingType = 'overall') => {
    try {
      setLoading(true);
      setError(null);
      const response = await rankingAPI.getMyPosition(rankingType);
      setMyPosition(response.data);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchMyRanking = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await rankingAPI.getMyRanking();
      setMyRanking(response.data);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await rankingAPI.getLeaderboard();
      setLeaderboard(response.data);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await rankingAPI.getAchievements();
      setAchievements(response.data);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await rankingAPI.getStats();
      setStats(response.data);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Função principal para buscar ranking (alias para fetchXpRanking)
  const fetchRanking = fetchXpRanking;

  return {
    xpRanking,
    tokenRanking,
    missionRanking,
    myPosition,
    myRanking,
    leaderboard,
    achievements,
    stats,
    loading,
    error,
    fetchXpRanking,
    fetchTokenRanking,
    fetchMissionRanking,
    fetchMyPosition,
    fetchMyRanking,
    fetchLeaderboard,
    fetchAchievements,
    fetchStats,
    fetchRanking // Função principal para compatibilidade
  };
};


