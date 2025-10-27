/**
 * Hook para gerenciar conexão com MetaMask
 * 
 * Funcionalidades:
 * - Conectar/desconectar carteira
 * - Detectar mudanças de conta e rede
 * - Validar rede Sepolia
 * - Fornecer provider e signer
 */

import { useState, useEffect, useCallback } from 'react';

const SEPOLIA_CHAIN_ID = '0xaa36a7'; // 11155111 em hex
const SEPOLIA_CHAIN_ID_DECIMAL = 11155111;

export const useWallet = () => {
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  const isSepolia = chainId === SEPOLIA_CHAIN_ID_DECIMAL;

  // Verificar se MetaMask está disponível
  const isMetaMaskInstalled = () => {
    return typeof window !== 'undefined' && window.ethereum && window.ethereum.isMetaMask;
  };

  // Conectar à carteira
  const connect = useCallback(async () => {
    if (!isMetaMaskInstalled()) {
      setError('MetaMask não está instalado');
      return false;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        setAccount(accounts[0]);
        
        // Verificar rede atual
        const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
        setChainId(parseInt(currentChainId, 16));
        
        // Configurar provider e signer
        const { ethers } = await import('ethers');
        const newProvider = new ethers.BrowserProvider(window.ethereum);
        const newSigner = await newProvider.getSigner();
        
        setProvider(newProvider);
        setSigner(newSigner);
        
        return true;
      }
    } catch (err) {
      if (err.code === 4001) {
        setError('Conexão rejeitada pelo usuário');
      } else {
        setError('Erro ao conectar carteira');
      }
      return false;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // Desconectar carteira
  const disconnect = useCallback(() => {
    setAccount(null);
    setChainId(null);
    setProvider(null);
    setSigner(null);
    setError(null);
  }, []);

  // Trocar para Sepolia
  const switchToSepolia = useCallback(async () => {
    if (!isMetaMaskInstalled()) {
      setError('MetaMask não está instalado');
      return false;
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      });
      return true;
    } catch (switchError) {
      // Se a rede não existir, adicionar Sepolia
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: SEPOLIA_CHAIN_ID,
              chainName: 'Sepolia',
              rpcUrls: ['https://sepolia.infura.io/v3/'],
              blockExplorerUrls: ['https://sepolia.etherscan.io/'],
              nativeCurrency: {
                name: 'Ethereum',
                symbol: 'ETH',
                decimals: 18,
              },
            }],
          });
          return true;
        } catch (addError) {
          setError('Erro ao adicionar rede Sepolia');
          return false;
        }
      } else {
        setError('Erro ao trocar para Sepolia');
        return false;
      }
    }
  }, []);

  // Verificar conexão inicial
  const checkConnection = useCallback(async () => {
    if (!isMetaMaskInstalled()) return;

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_accounts',
      });

      if (accounts.length > 0) {
        setAccount(accounts[0]);
        
        const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
        setChainId(parseInt(currentChainId, 16));
        
        const { ethers } = await import('ethers');
        const newProvider = new ethers.BrowserProvider(window.ethereum);
        const newSigner = await newProvider.getSigner();
        
        setProvider(newProvider);
        setSigner(newSigner);
      }
    } catch (err) {
      console.error('Erro ao verificar conexão:', err);
    }
  }, []);

  // Detectar mudanças de conta e rede
  useEffect(() => {
    if (!isMetaMaskInstalled()) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        disconnect();
      } else {
        setAccount(accounts[0]);
      }
    };

    const handleChainChanged = (chainId) => {
      setChainId(parseInt(chainId, 16));
    };

    // Verificar conexão inicial
    checkConnection();

    // Adicionar listeners
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    // Cleanup
    return () => {
      if (window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [checkConnection, disconnect]);

  return {
    account,
    chainId,
    isSepolia,
    provider,
    signer,
    isConnecting,
    error,
    connect,
    disconnect,
    switchToSepolia,
    isMetaMaskInstalled: isMetaMaskInstalled(),
  };
};