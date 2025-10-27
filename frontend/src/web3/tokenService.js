/**
 * Service para interagir com o contrato VEXAToken
 */

import { ethers, Contract } from 'ethers';
import VEXA_TOKEN_ABI from './abi/VEXAToken.json';

const addr = import.meta.env.VITE_CONTRACT_ADDRESS;

function getContract(providerOrSigner) {
  if (!addr || addr === "0xSEU_CONTRATO_AQUI") return null;
  if (!providerOrSigner) return null;
  try {
    return new Contract(addr, VEXA_TOKEN_ABI, providerOrSigner);
  } catch (_) {
    return null;
  }
}

async function isOwner(provider) {
  const c = getContract(provider);
  if (!c) return false;
  try {
    const [signer] = await provider.listAccounts();
    if (!signer) return false;
    const owner = await c.owner();
    return owner?.toLowerCase?.() === signer?.toLowerCase?.();
  } catch {
    return false;
  }
}

function setupEventListeners(provider, onMint) {
  const c = getContract(provider);
  if (!c) return; // sem contrato, não registra listeners
  try {
    c.on("Transfer", (...args) => onMint?.(...args));
  } catch {}
}

class TokenService {
  constructor() {
    this.contract = null;
    this.provider = null;
    this.signer = null;
    this.eventListeners = new Set();
  }

  async getContract(readonly = true) {
    if (!window.ethereum) {
      throw new Error('MetaMask não está instalado');
    }

    if (readonly) {
      if (!this.provider) {
        this.provider = new ethers.BrowserProvider(window.ethereum);
      }
      if (!this.contract) {
        this.contract = getContract(this.provider);
      }
      return this.contract;
    } else {
      if (!this.signer) {
        this.provider = new ethers.BrowserProvider(window.ethereum);
        this.signer = await this.provider.getSigner();
      }
      if (!this.contract) {
        this.contract = getContract(this.signer);
      }
      return this.contract;
    }
  }

  async getTokenMeta() {
    try {
      const contract = await this.getContract(true);
      if (!contract) {
        return { ok: false, error: 'Token contract not configured' };
      }
      
      const [name, symbol, decimals, totalSupply] = await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.decimals(),
        contract.totalSupply()
      ]);

      return {
        ok: true,
        data: {
          name,
          symbol,
          decimals: Number(decimals),
          totalSupply: ethers.formatUnits(totalSupply, decimals)
        }
      };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }

  async getBalanceOf(address) {
    try {
      const contract = await this.getContract(true);
      if (!contract) {
        return { ok: false, error: 'Token contract not configured' };
      }
      
      const balance = await contract.balanceOf(address);
      const decimals = await contract.decimals();
      
      return {
        ok: true,
        data: ethers.formatUnits(balance, decimals)
      };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }

  async mint(to, amountRaw) {
    try {
      const contract = await this.getContract(false);
      if (!contract) {
        return { ok: false, error: 'Token contract not configured' };
      }
      
      const decimals = await contract.decimals();
      const amount = ethers.parseUnits(amountRaw.toString(), decimals);
      const tx = await contract.mint(to, amount);
      
      return {
        ok: true,
        data: { hash: tx.hash, to, amount: amountRaw }
      };
    } catch (error) {
      let errorMessage = 'Erro ao executar mint';
      if (error.code === 'ACTION_REJECTED') {
        errorMessage = 'Transação rejeitada pelo usuário';
      } else if (error.message.includes('Ownable: caller is not the owner')) {
        errorMessage = 'Apenas o owner pode executar mint';
      } else if (error.message.includes('insufficient funds')) {
        errorMessage = 'Saldo insuficiente para gas';
      }
      return { ok: false, error: errorMessage };
    }
  }

  onTokenMinted(callback) {
    this.eventListeners.add(callback);
    if (this.eventListeners.size === 1) {
      this.setupEventListeners();
    }
  }

  offTokenMinted(callback) {
    this.eventListeners.delete(callback);
  }

  async setupEventListeners() {
    try {
      const contract = await this.getContract(true);
      if (!contract) {
        console.debug('Token contract not configured; skipping listeners');
        return;
      }
      
      contract.on('TokenMinted', (to, amount, event) => {
        const eventData = {
          to,
          amount: ethers.formatUnits(amount, 18),
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash
        };
        
        this.eventListeners.forEach(callback => {
          try {
            callback(eventData);
          } catch (err) {
            console.error('Erro no callback do evento:', err);
          }
        });
      });
    } catch (error) {
      console.error('Erro ao configurar listeners de eventos:', error);
    }
  }

  cleanup() {
    if (this.contract) {
      this.contract.removeAllListeners();
    }
    this.eventListeners.clear();
  }
}

export { getContract, isOwner, setupEventListeners };
export const tokenService = new TokenService();
