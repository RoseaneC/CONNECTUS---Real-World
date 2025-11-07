/**
 * Componente para conectar e gerenciar carteira MetaMask
 * 
 * Este componente fornece uma interface para:
 * - Conectar à MetaMask
 * - Exibir status da carteira
 * - Mostrar saldo de VEXA tokens
 * - Gerenciar conexão/desconexão
 */

import React, { useState, useEffect } from 'react';
import { useWallet } from '../../web3/useWallet';
import { tokenService } from '../../web3/tokenService';

const WalletConnect = () => {
  const { 
    address, 
    isConnected, 
    isConnecting, 
    error, 
    connectWallet, 
    disconnectWallet, 
    isMetaMaskInstalled 
  } = useWallet();
  
  const [balance, setBalance] = useState('0');
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [tokenInfo, setTokenInfo] = useState(null);

  // Inicializar tokenService quando conectar
  useEffect(() => {
    if (isConnected && address) {
      initializeTokenService();
    }
  }, [isConnected, address]);

  const initializeTokenService = async () => {
    try {
      await tokenService.initialize(address);
      await loadTokenInfo();
      await loadBalance();
    } catch (error) {
      console.error('Erro ao inicializar TokenService:', error);
    }
  };

  const loadTokenInfo = async () => {
    try {
      const info = await tokenService.getTokenInfo();
      setTokenInfo(info);
    } catch (error) {
      console.error('Erro ao carregar informações do token:', error);
    }
  };

  const loadBalance = async () => {
    if (!address) return;
    
    setIsLoadingBalance(true);
    try {
      const tokenBalance = await tokenService.getBalance(address);
      setBalance(tokenBalance);
    } catch (error) {
      console.error('Erro ao carregar saldo:', error);
      setBalance('0');
    } finally {
      setIsLoadingBalance(false);
    }
  };

  const handleConnect = async () => {
    const success = await connectWallet();
    if (success) {
      // Recarregar saldo após conectar
      setTimeout(loadBalance, 1000);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    setBalance('0');
    setTokenInfo(null);
  };

  // Formatar endereço para exibição
  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (!isMetaMaskInstalled) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              MetaMask não instalado
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                Para usar as funcionalidades Web3, instale a extensão MetaMask.
                <a 
                  href="https://metamask.io/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="ml-1 font-medium underline hover:text-yellow-600"
                >
                  Instalar MetaMask
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-blue-800">
              Conectar Carteira Web3
            </h3>
            <p className="mt-1 text-sm text-blue-600">
              Conecte sua MetaMask para receber VEXA tokens
            </p>
          </div>
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {isConnecting ? 'Conectando...' : 'Conectar MetaMask'}
          </button>
        </div>
        {error && (
          <div className="mt-3 text-sm text-red-600">
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-medium text-green-800">
            Carteira Conectada
          </h3>
          <p className="text-sm text-green-600">
            {formatAddress(address)}
          </p>
        </div>
        <button
          onClick={handleDisconnect}
          className="text-green-600 hover:text-green-800 text-sm font-medium"
        >
          Desconectar
        </button>
      </div>

      {/* Informações do Token */}
      {tokenInfo && (
        <div className="mb-3 p-3 bg-white rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">
                {tokenInfo.name} ({tokenInfo.symbol})
              </p>
              <p className="text-xs text-gray-500">
                Total Supply: {tokenInfo.totalSupply} tokens
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-green-600">
                {isLoadingBalance ? '...' : balance} VEXA
              </p>
              <button
                onClick={loadBalance}
                disabled={isLoadingBalance}
                className="text-xs text-blue-600 hover:text-blue-800 disabled:text-gray-400"
              >
                {isLoadingBalance ? 'Atualizando...' : 'Atualizar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status da Rede */}
      <div className="flex items-center text-xs text-green-600">
        <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
        Conectado à Sepolia Testnet
      </div>
    </div>
  );
};

export default WalletConnect;









