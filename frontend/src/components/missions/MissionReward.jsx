/**
 * Componente para exibir recompensas de missões e integrar com blockchain
 * 
 * Este componente:
 * - Exibe recompensas de XP e tokens
 * - Integra com VEXA tokens na blockchain
 * - Mostra notificações de sucesso
 * - Atualiza saldo automaticamente
 */

import React, { useState } from 'react';
import { tokenService } from '../../web3/tokenService';

const MissionReward = ({ 
  mission, 
  onComplete, 
  userAddress, 
  isWalletConnected 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [rewardStatus, setRewardStatus] = useState(null);

  const handleCompleteMission = async () => {
    if (!mission) return;

    setIsProcessing(true);
    setRewardStatus(null);

    try {
      // 1. Completar missão no backend (via API existente)
      const backendResult = await onComplete();
      
      if (!backendResult.success) {
        throw new Error(backendResult.error || 'Erro ao completar missão');
      }

      // 2. Se carteira conectada, mintar VEXA tokens
      if (isWalletConnected && userAddress && mission.token_reward > 0) {
        try {
          await tokenService.initialize(userAddress);
          
          // Converter token_reward para string (assumindo que vem como número)
          const rewardAmount = mission.token_reward.toString();
          
          // Tentar mint real (pode falhar se não for owner)
          try {
            const mintResult = await tokenService.mintTokens(userAddress, rewardAmount);
            setRewardStatus({
              type: 'success',
              message: `🎉 Parabéns! Você recebeu ${rewardAmount} VEXA Tokens pela missão "${mission.title}"!`,
              transactionHash: mintResult.transactionHash
            });
          } catch (mintError) {
            // Se mint falhar, simular (para demonstração)
            console.log('Mint real falhou, simulando...', mintError.message);
            const simulateResult = await tokenService.simulateMint(userAddress, rewardAmount);
            setRewardStatus({
              type: 'simulation',
              message: `🎭 Simulação: Você receberia ${rewardAmount} VEXA Tokens pela missão "${mission.title}"!`,
              transactionHash: simulateResult.transactionHash
            });
          }
        } catch (web3Error) {
          console.error('Erro na integração Web3:', web3Error);
          setRewardStatus({
            type: 'warning',
            message: `✅ Missão completada! (${mission.token_reward} VEXA tokens seriam mintados se você fosse o owner do contrato)`
          });
        }
      } else {
        // Sem carteira conectada, apenas mostrar recompensa
        setRewardStatus({
          type: 'info',
          message: `✅ Missão completada! Recompensa: ${mission.xp_reward} XP + ${mission.token_reward} VEXA tokens`
        });
      }

    } catch (error) {
      console.error('Erro ao completar missão:', error);
      setRewardStatus({
        type: 'error',
        message: `❌ Erro: ${error.message}`
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusIcon = (type) => {
    switch (type) {
      case 'success': return '🎉';
      case 'simulation': return '🎭';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return '✅';
    }
  };

  const getStatusColor = (type) => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200 text-green-800';
      case 'simulation': return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'error': return 'bg-red-50 border-red-200 text-red-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  if (!mission) return null;

  return (
    <div className="space-y-4">
      {/* Informações da Missão */}
      <div className="bg-white rounded-lg border p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {mission.title}
        </h3>
        <p className="text-gray-600 mb-3">
          {mission.description}
        </p>
        
        {/* Recompensas */}
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center text-orange-600">
            <span className="font-medium">XP:</span>
            <span className="ml-1 font-bold">{mission.xp_reward}</span>
          </div>
          <div className="flex items-center text-purple-600">
            <span className="font-medium">VEXA:</span>
            <span className="ml-1 font-bold">{mission.token_reward}</span>
          </div>
          {mission.is_daily && (
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
              Diária
            </span>
          )}
        </div>
      </div>

      {/* Botão de Completar */}
      <button
        onClick={handleCompleteMission}
        disabled={isProcessing}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
      >
        {isProcessing ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Processando...
          </div>
        ) : (
          'Completar Missão'
        )}
      </button>

      {/* Status da Recompensa */}
      {rewardStatus && (
        <div className={`rounded-lg border p-4 ${getStatusColor(rewardStatus.type)}`}>
          <div className="flex items-start">
            <span className="text-lg mr-2">{getStatusIcon(rewardStatus.type)}</span>
            <div className="flex-1">
              <p className="text-sm font-medium">
                {rewardStatus.message}
              </p>
              {rewardStatus.transactionHash && (
                <p className="text-xs mt-1 opacity-75">
                  TX: {rewardStatus.transactionHash}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Dica para Web3 */}
      {!isWalletConnected && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            💡 <strong>Dica:</strong> Conecte sua MetaMask para receber VEXA tokens reais na blockchain!
          </p>
        </div>
      )}
    </div>
  );
};

export default MissionReward;


