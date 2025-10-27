/**
 * Demo Wallet Provider (Off-chain simulation)
 */
import api from '../../services/api';

export class DemoProvider {
  constructor() {
    this.isDemo = true;
  }

  async connect() {
    try {
      const { data } = await api.get('/wallet/demo/status');
      return {
        success: true,
        address: data.address,
        balance: data.balance,
        positions: data.positions || []
      };
    } catch (error) {
      console.error('[WEB3 DEMO] Connect failed:', error);
      return { success: false, error: error.message };
    }
  }

  async getBalance() {
    try {
      const { data } = await api.get('/wallet/demo/status');
      return data.balance || 0;
    } catch (error) {
      return 0;
    }
  }

  async getAddress() {
    try {
      const { data } = await api.get('/wallet/demo/status');
      return data.address || 'demo:0';
    } catch (error) {
      return 'demo:0';
    }
  }

  async mint(amount = 100) {
    try {
      const { data } = await api.post('/wallet/demo/mint', { amount });
      return { success: true, ...data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async stake(amount, days) {
    try {
      const { data } = await api.post('/wallet/demo/stake', { amount, days });
      return { success: true, ...data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async unstake(positionId) {
    try {
      const { data } = await api.post('/wallet/demo/unstake', { position_id: positionId });
      return { success: true, ...data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getPositions() {
    try {
      const { data } = await api.get('/wallet/demo/status');
      return data.positions || [];
    } catch (error) {
      return [];
    }
  }
}

