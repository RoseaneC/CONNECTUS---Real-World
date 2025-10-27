/**
 * Componente para exibir informações do token VEXA
 * 
 * Funcionalidades:
 * - Mostrar metadados do token (name, symbol, decimals, totalSupply)
 * - Mostrar saldo do usuário conectado
 * - Escutar eventos TokenMinted e atualizar automaticamente
 */

import React, { useState, useEffect } from 'react';
import { useWallet } from '../useWallet';
import { tokenService } from '../tokenService';

const TokenPanel = () => {
  const { account, isSepolia } = useWallet();
  const [tokenMeta, setTokenMeta] = useState(null);
  const [userBalance, setUserBalance] = useState('0');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Carregar metadados do token
  const loadTokenMeta = async () => {
    const result = await tokenService.getTokenMeta();
    if (result.ok) {
      setTokenMeta(result.data);
    } else {
      setError(result.error);
    }
  };

  // Carregar saldo do usuário
  const loadUserBalance = async () => {
    if (!account) return;
    
    const result = await tokenService.getBalanceOf(account);
    if (result.ok) {
      setUserBalance(result.data);
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      
      await Promise.all([
        loadTokenMeta(),
        loadUserBalance()
      ]);
      
      setIsLoading(false);
    };

    if (isSepolia) {
      loadData();
    }
  }, [account, isSepolia]);

  // Escutar eventos TokenMinted
  useEffect(() => {
    if (!isSepolia) return;

    const handleTokenMinted = (eventData) => {
      // Atualizar total supply
      loadTokenMeta();
      
      // Se o mint foi para o usuário atual, atualizar saldo
      if (account && eventData.to.toLowerCase() === account.toLowerCase()) {
        loadUserBalance();
      }
    };

    tokenService.onTokenMinted(handleTokenMinted);

    return () => {
      tokenService.offTokenMinted(handleTokenMinted);
    };
  }, [account, isSepolia]);

  // Se não estiver em Sepolia
  if (!isSepolia) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-800 mb-2">
          VEXA Token Info
        </h3>
        <p className="text-sm text-gray-600">
          Conecte à rede Sepolia para ver informações do token
        </p>
      </div>
    );
  }

  // Se estiver carregando
  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-800 mb-4">
          VEXA Token Info
        </h3>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  // Se houver erro
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-red-800 mb-2">
          Erro ao carregar token
        </h3>
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  // Exibir informações do token
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="text-sm font-medium text-gray-800 mb-4">
        VEXA Token Info
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nome do Token */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs text-gray-500 uppercase tracking-wide">Nome</div>
          <div className="text-sm font-medium text-gray-900">{tokenMeta?.name || 'N/A'}</div>
        </div>

        {/* Símbolo */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs text-gray-500 uppercase tracking-wide">Símbolo</div>
          <div className="text-sm font-medium text-gray-900">{tokenMeta?.symbol || 'N/A'}</div>
        </div>

        {/* Decimais */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs text-gray-500 uppercase tracking-wide">Decimais</div>
          <div className="text-sm font-medium text-gray-900">{tokenMeta?.decimals || 'N/A'}</div>
        </div>

        {/* Total Supply */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs text-gray-500 uppercase tracking-wide">Total Supply</div>
          <div className="text-sm font-medium text-gray-900">
            {tokenMeta?.totalSupply ? parseFloat(tokenMeta.totalSupply).toLocaleString() : 'N/A'}
          </div>
        </div>
      </div>

      {/* Saldo do Usuário */}
      {account && (
        <div className="mt-4 bg-blue-50 rounded-lg p-3">
          <div className="text-xs text-blue-500 uppercase tracking-wide">Seu Saldo</div>
          <div className="text-lg font-bold text-blue-900">
            {parseFloat(userBalance).toLocaleString()} {tokenMeta?.symbol || 'VEXA'}
          </div>
        </div>
      )}
    </div>
  );
};

export default TokenPanel;


