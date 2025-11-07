import { useState, useEffect } from 'react';
import { userService } from '../services/userService';

export const useUser = () => {
  const [profile, setProfile] = useState(null);
  const [balance, setBalance] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getProfile();
      setProfile(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchBalance = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getBalance();
      setBalance(data);
      return data;
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
      const data = await userService.getStats();
      setStats(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.updateProfile(profileData);
      setProfile(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const transferTokens = async (toPublicKey, amount) => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.transferTokens(toPublicKey, amount);
      // Atualizar saldo após transferência
      await fetchBalance();
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    profile,
    balance,
    stats,
    loading,
    error,
    fetchProfile,
    fetchBalance,
    fetchStats,
    updateProfile,
    transferTokens
  };
};















