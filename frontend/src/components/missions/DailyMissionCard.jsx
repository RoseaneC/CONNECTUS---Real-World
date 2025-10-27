// [CONNECTUS PATCH] Card de missão do dia
import { useState, useEffect } from 'react';
import { missionService } from '../../services/missionService';
import Card from '../ui/Card';
// Button removido - usando <button> nativo
import { VerifyQrModal } from './VerifyQrModal';
// [CONNECTUS HACKATHON] Web3 integration
import MissionReward from './MissionReward';
import { useWallet } from '../../web3/useWallet';

export const DailyMissionCard = () => {
  const [missions, setMissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMission, setSelectedMission] = useState(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [message, setMessage] = useState('');
  
  // [CONNECTUS HACKATHON] Web3 wallet state
  const { address, isConnected } = useWallet();

  useEffect(() => {
    loadMissions();
  }, []);

  const loadMissions = async () => {
    try {
      setIsLoading(true);
      const data = await missionService.listMyMissions();
      setMissions(data);
    } catch (error) {
      console.error('Erro ao carregar missões:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteMission = async (mission) => {
    try {
      const result = await missionService.completeMission(mission.id);
      setMessage(`✅ Missão completada! +${result.xp} XP, +${result.tokens} tokens`);
      loadMissions(); // Recarregar lista
      return { success: true, xp: result.xp, tokens: result.tokens };
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Falha ao completar missão';
      setMessage(`❌ Erro: ${errorMsg}`);
      return { success: false, error: errorMsg };
    }
  };

  const handleQrMission = (mission) => {
    setSelectedMission(mission);
    setShowQrModal(true);
  };

  const handleQrSuccess = (result) => {
    setMessage(`✅ QR verificado! +${result.xp} XP, +${result.tokens} tokens`);
    loadMissions(); // Recarregar lista
  };

  const getMissionTypeIcon = (type) => {
    switch (type) {
      case 'CHECKIN_QR':
        return '📱';
      case 'IN_APP_ACTION':
        return '🎯';
      case 'CHECKIN_GEO':
        return '📍';
      default:
        return '📋';
    }
  };

  const getMissionTypeText = (type) => {
    switch (type) {
      case 'CHECKIN_QR':
        return 'QR Code';
      case 'IN_APP_ACTION':
        return 'Ação no App';
      case 'CHECKIN_GEO':
        return 'Localização';
      default:
        return 'Missão';
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </Card>
    );
  }

  if (missions.length === 0) {
    return (
      <Card className="p-6 text-center">
        <h3 className="text-lg font-semibold mb-2">🎉 Missões do Dia</h3>
        <p className="text-gray-600">Parabéns! Você completou todas as missões de hoje.</p>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">🎯 Missões do Dia</h3>
        
        {message && (
          <div className={`mb-4 p-3 rounded ${
            message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {message}
          </div>
        )}

        <div className="space-y-4">
          {missions.map((mission) => (
            <div key={mission.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{getMissionTypeIcon(mission.type)}</span>
                    <h4 className="font-medium">{mission.title}</h4>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {getMissionTypeText(mission.type)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{mission.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>+{mission.xp_reward} XP</span>
                    <span>+{mission.token_reward} VEXA tokens</span>
                  </div>
                </div>
                
                <div className="ml-4">
                  {mission.type === 'CHECKIN_QR' ? (
                    <button
                      onClick={() => handleQrMission(mission)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Verificar QR
                    </button>
                  ) : (
                    <MissionReward
                      mission={mission}
                      onComplete={() => handleCompleteMission(mission)}
                      userAddress={address}
                      isWalletConnected={isConnected}
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <VerifyQrModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        onSuccess={handleQrSuccess}
        mission={selectedMission}
      />
    </>
  );
};
