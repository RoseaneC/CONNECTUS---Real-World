/**
 * Componente para conectar e gerenciar MetaMask
 * 
 * Funcionalidades:
 * - Botão conectar MetaMask
 * - Aviso se não estiver em Sepolia
 * - Botão trocar para Sepolia
 * - Mostrar account e chainId
 */

import React, { useState, useEffect } from 'react';
import { useWallet } from '../useWallet';
import { isOwner } from '../tokenService';

const WalletConnect = () => {
  const {
    account,
    chainId,
    isSepolia,
    isConnecting,
    error,
    connect,
    disconnect,
    switchToSepolia,
    isMetaMaskInstalled
  } = useWallet();
  
  const [isOwnerAccount, setIsOwnerAccount] = useState(false);
  const [isCheckingOwner, setIsCheckingOwner] = useState(false);

  // Verificar se o usuário é owner
  useEffect(() => {
    const checkOwner = async () => {
      if (!account || !isSepolia) {
        setIsOwnerAccount(false);
        return;
      }

      setIsCheckingOwner(true);
      try {
        const ownerResult = await isOwner();
        setIsOwnerAccount(ownerResult);
      } catch (err) {
        console.warn("Erro ao verificar owner:", err);
        setIsOwnerAccount(false);
      } finally {
        setIsCheckingOwner(false);
      }
    };

    checkOwner();
  }, [account, isSepolia]);

  // Formatar endereço para exibição
  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Se MetaMask não estiver instalado
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

  // Se não estiver conectado
  if (!account) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-blue-800">
              Conectar Carteira Web3
            </h3>
            <p className="mt-1 text-sm text-blue-600">
              Conecte sua MetaMask para interagir com VEXA tokens
            </p>
          </div>
          <button
            onClick={connect}
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

  // Se estiver conectado mas não em Sepolia
  if (!isSepolia) {
    return (
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-orange-800">
              Rede Incorreta
            </h3>
            <p className="mt-1 text-sm text-orange-600">
              Conectado: {formatAddress(account)} (Chain ID: {chainId})
            </p>
            <p className="text-sm text-orange-600">
              Troque para Sepolia para usar VEXA tokens
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={switchToSepolia}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Trocar para Sepolia
            </button>
            <button
              onClick={disconnect}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Desconectar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Conectado e em Sepolia
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-green-800">
            Carteira Conectada
          </h3>
          <div className="flex items-center space-x-2">
            <p className="text-sm text-green-600">
              {formatAddress(account)} • Sepolia (Chain ID: {chainId})
            </p>
            {isCheckingOwner && (
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-600"></div>
            )}
            {!isCheckingOwner && isOwnerAccount && (
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                Owner
              </span>
            )}
          </div>
        </div>
        <button
          onClick={disconnect}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Desconectar
        </button>
      </div>
    </div>
  );
};

export default WalletConnect;
