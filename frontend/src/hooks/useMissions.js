import { useState, useEffect } from 'react';
import { missionsAPI } from '../services/api';

export const useMissions = () => {
  const [missions, setMissions] = useState([]);
  const [myMissions, setMyMissions] = useState([]);
  const [dailyMissions, setDailyMissions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMissions = async (activeOnly = true) => {
    try {
      setLoading(true);
      setError(null);
      const response = await missionsAPI.getAllMissions(activeOnly);
      setMissions(response.data);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchMyMissions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await missionsAPI.getMyMissions();
      setMyMissions(response.data);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchDailyMissions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await missionsAPI.getDailyMissions();
      setDailyMissions(response.data);
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
      const response = await missionsAPI.getMissionStats();
      setStats(response.data);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const assignMission = async (missionId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await missionsAPI.assignMission(missionId);
      // Atualizar minhas missões
      await fetchMyMissions();
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (userMissionId, progressData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await missionsAPI.updateProgress(userMissionId, progressData);
      // Atualizar minhas missões
      await fetchMyMissions();
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const completeMission = async (userMissionId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await missionsAPI.completeMission(userMissionId);
      // Atualizar minhas missões e estatísticas
      await Promise.all([fetchMyMissions(), fetchStats()]);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    missions,
    myMissions,
    dailyMissions,
    stats,
    loading,
    error,
    fetchMissions,
    fetchMyMissions,
    fetchDailyMissions,
    fetchStats,
    assignMission,
    updateProgress,
    completeMission
  };
};


