/**
 * Componente para mostrar status da rede e contrato
 * 
 * Funcionalidades:
 * - Mostra rede atual (nome/chainId)
 * - Status do contrato (endereço válido)
 * - Status da flag VITE_ENABLE_MINT
 * - Botão para trocar para Sepolia se necessário
 */

import React, { useState, useEffect } from 'react';
import { useWallet } from '../useWallet';

const NetworkHealth = () => {
  const { chainId, isSepolia, switchToSepolia } = useWallet();
  const [contractStatus, setContractStatus] = useState('checking');
  const [mintEnabled, setMintEnabled] = useState(false);

  // Verificar status do contrato
  useEffect(() => {
    const checkContract = async () => {
      const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
      
      if (!contractAddress || contractAddress === '0x0000000000000000000000000000000000000000') {
        setContractStatus('invalid');
        return;
      }

      if (!window.ethereum) {
        setContractStatus('no-metamask');
        return;
      }

      try {
        const { ethers } = await import('ethers');
        const provider = new ethers.BrowserProvider(window.ethereum);
        const code = await provider.getCode(contractAddress);
        
        if (code === '0x') {
          setContractStatus('no-contract');
        } else {
          setContractStatus('valid');
        }
      } catch (error) {
        setContractStatus('error');
      }
    };

    checkContract();
  }, []);

  // Verificar flag de mint
  useEffect(() => {
    setMintEnabled(import.meta.env.VITE_ENABLE_MINT === 'true');
  }, []);

  // Obter nome da rede
  const getNetworkName = (chainId) => {
    const networks = {
      1: 'Ethereum Mainnet',
      11155111: 'Sepolia Testnet',
      137: 'Polygon',
      56: 'BSC',
      42161: 'Arbitrum'
    };
    return networks[chainId] || `Chain ID ${chainId}`;
  };

  // Obter status do contrato
  const getContractStatusText = (status) => {
    switch (status) {
      case 'valid':
        return { text: 'Contrato válido', color: 'text-green-600', bg: 'bg-green-50' };
      case 'invalid':
        return { text: 'Endereço inválido', color: 'text-red-600', bg: 'bg-red-50' };
      case 'no-contract':
        return { text: 'Contrato não encontrado', color: 'text-yellow-600', bg: 'bg-yellow-50' };
      case 'no-metamask':
        return { text: 'MetaMask não encontrado', color: 'text-gray-600', bg: 'bg-gray-50' };
      case 'error':
        return { text: 'Erro ao verificar', color: 'text-red-600', bg: 'bg-red-50' };
      default:
        return { text: 'Verificando...', color: 'text-gray-600', bg: 'bg-gray-50' };
    }
  };

  const contractStatusInfo = getContractStatusText(contractStatus);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="text-sm font-medium text-gray-800 mb-3">
        🌐 Status da Rede
      </h3>
      
      <div className="space-y-3">
        {/* Rede Atual */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Rede:</span>
          <div className="flex items-center space-x-2">
            <span className={`text-sm font-medium ${isSepolia ? 'text-green-600' : 'text-orange-600'}`}>
              {getNetworkName(chainId)}
            </span>
            <span className="text-xs text-gray-500">({chainId})</span>
          </div>
        </div>

        {/* Status do Contrato */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Contrato:</span>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${contractStatusInfo.bg} ${contractStatusInfo.color}`}>
            {contractStatusInfo.text}
          </div>
        </div>

        {/* Flag de Mint */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Mint:</span>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            mintEnabled ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-600'
          }`}>
            {mintEnabled ? 'Habilitado' : 'Desabilitado'}
          </div>
        </div>

        {/* Alerta para rede incorreta */}
        {!isSepolia && (
          <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-800 font-medium">
                  Rede incorreta
                </p>
                <p className="text-xs text-orange-600">
                  Troque para Sepolia para usar VEXA tokens
                </p>
              </div>
              <button
                onClick={switchToSepolia}
                className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
              >
                Trocar para Sepolia
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NetworkHealth;


