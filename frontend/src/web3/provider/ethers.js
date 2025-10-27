/**
 * Real Web3 Provider (Ethers.js + Smart Contract)
 * Placeholder for future implementation
 */
const CONTRACT_ADDRESS = import.meta.env?.VITE_CONTRACT_ADDRESS;
const CHAIN_ID = import.meta.env?.VITE_CHAIN_ID || '11155111';

export class EthersProvider {
  constructor() {
    this.isDemo = false;
  }

  async connect() {
    if (!CONTRACT_ADDRESS) {
      return {
        success: false,
        error: 'VITE_CONTRACT_ADDRESS não configurado. Modo demo recomendado.'
      };
    }

    // TODO: Implement real MetaMask connection
    return {
      success: false,
      error: 'Modo real ainda não implementado. Use VITE_WEB3_DEMO_MODE=true para demonstração.'
    };
  }

  async getBalance() {
    return 0;
  }

  async getAddress() {
    return null;
  }

  async mint(amount) {
    return { success: false, error: 'Modo real não disponível' };
  }

  async stake(amount, days) {
    return { success: false, error: 'Modo real não disponível' };
  }

  async unstake(positionId) {
    return { success: false, error: 'Modo real não disponível' };
  }

  async getPositions() {
    return [];
  }
}

