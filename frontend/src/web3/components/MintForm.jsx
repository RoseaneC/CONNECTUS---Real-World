/**
 * Componente para executar mint de tokens VEXA
 * 
 * Funcionalidades:
 * - Formulário para quantidade e destinatário
 * - Validação de dados
 * - Execução do mint (apenas owner)
 * - Feedback de sucesso/erro
 */

import React, { useState, useEffect } from 'react';
import { useWallet } from '../useWallet';
import { tokenService, isOwner } from '../tokenService';

const MintForm = () => {
  const { account, isSepolia } = useWallet();
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [isMinting, setIsMinting] = useState(false);
  const [result, setResult] = useState(null);
  const [owner, setOwner] = useState(false);
  const [isCheckingOwner, setIsCheckingOwner] = useState(false);

  // Validar endereço Ethereum
  const isValidAddress = (address) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  // Validar quantidade
  const isValidAmount = (amount) => {
    const num = parseFloat(amount);
    return !isNaN(num) && num > 0 && Number.isInteger(num);
  };

  // Verificar se o usuário é owner
  useEffect(() => {
    const checkOwner = async () => {
      if (!account || !isSepolia) {
        setOwner(false);
        return;
      }

      setIsCheckingOwner(true);
      try {
        const isOwnerResult = await isOwner();
        setOwner(isOwnerResult);
      } catch (err) {
        console.warn("Erro ao verificar owner:", err);
        setOwner(false);
      } finally {
        setIsCheckingOwner(false);
      }
    };

    checkOwner();
  }, [account, isSepolia]);

  // Executar mint
  const handleMint = async (e) => {
    e.preventDefault();
    
    if (!account || !isSepolia) {
      setResult({ type: 'error', message: 'Conecte à rede Sepolia primeiro' });
      return;
    }

    if (!isValidAddress(recipient)) {
      setResult({ type: 'error', message: 'Endereço inválido' });
      return;
    }

    if (!isValidAmount(amount)) {
      setResult({ type: 'error', message: 'Quantidade deve ser um número inteiro positivo' });
      return;
    }

    setIsMinting(true);
    setResult(null);

    try {
      const mintResult = await tokenService.mint(recipient, amount);
      
      if (mintResult.ok) {
        setResult({
          type: 'success',
          message: `Mint realizado com sucesso! Hash: ${mintResult.data.hash}`,
          hash: mintResult.data.hash
        });
        // Limpar formulário
        setAmount('');
        setRecipient('');
      } else {
        setResult({
          type: 'error',
          message: mintResult.error
        });
      }
    } catch (error) {
      setResult({
        type: 'error',
        message: 'Erro inesperado: ' + error.message
      });
    } finally {
      setIsMinting(false);
    }
  };

  // Verificar flag de ambiente
  const isEnabled = import.meta.env.VITE_ENABLE_MINT === "true";
  if (!isEnabled) {
    return null; // Flag desativa o componente
  }

  // Se não estiver conectado ou não em Sepolia
  if (!account || !isSepolia) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-800 mb-2">
          Mint de Tokens
        </h3>
        <p className="text-sm text-gray-600">
          Conecte à rede Sepolia para executar mint
        </p>
      </div>
    );
  }

  // Se estiver verificando owner
  if (isCheckingOwner) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-800 mb-4">
          Mint de Tokens VEXA
        </h3>
        
        {/* Skeleton Loading */}
        <div className="space-y-4">
          {/* Campo Quantidade Skeleton */}
          <div>
            <div className="h-4 bg-gray-200 rounded w-24 mb-2 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
          
          {/* Campo Destinatário Skeleton */}
          <div>
            <div className="h-4 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
          
          {/* Botão Skeleton */}
          <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
        </div>
        
        <div className="mt-4 flex items-center justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-xs text-gray-500">Verificando permissões...</span>
        </div>
      </div>
    );
  }

  // Se não for owner
  if (!owner) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-800 mb-2">
          Mint de Tokens VEXA
        </h3>
        <div className="text-sm text-gray-500 mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          ⚠️ Mint disponível apenas para o proprietário do contrato.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="text-sm font-medium text-gray-800 mb-4">
        Mint de Tokens VEXA
      </h3>
      
      <form onSubmit={handleMint} className="space-y-4">
        {/* Campo Quantidade */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Quantidade (inteiro)
          </label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Ex: 1000"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
            min="1"
            step="1"
          />
        </div>

        {/* Campo Destinatário */}
        <div>
          <label htmlFor="recipient" className="block text-sm font-medium text-gray-700 mb-1">
            Destinatário (endereço)
          </label>
          <input
            type="text"
            id="recipient"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="0x..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        {/* Botão Mint */}
        <button
          type="submit"
          disabled={isMinting}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          {isMinting ? 'Executando Mint...' : 'Executar Mint'}
        </button>
      </form>

      {/* Resultado */}
      {result && (
        <div className={`mt-4 p-3 rounded-lg ${
          result.type === 'success' 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className={`text-sm ${
            result.type === 'success' 
              ? 'text-green-800' 
              : 'text-red-800'
          }`}>
            {result.message}
          </div>
          {result.hash && (
            <div className="mt-2">
              <a
                href={`https://sepolia.etherscan.io/tx/${result.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 underline"
              >
                Ver no Etherscan
              </a>
            </div>
          )}
        </div>
      )}

      {/* Aviso sobre permissões */}
      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="text-xs text-yellow-800">
          <strong>Nota:</strong> Apenas o owner do contrato pode executar mint. 
          Se você não for o owner, a transação falhará com erro "onlyOwner".
        </div>
      </div>
    </div>
  );
};

export default MintForm;
