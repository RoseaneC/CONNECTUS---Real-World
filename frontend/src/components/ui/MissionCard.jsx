import { motion } from 'framer-motion';
import { Target, Star, Clock, CheckCircle, Play } from 'lucide-react';
import { formatMissionCategory, formatMissionDifficulty, formatMissionStatus, formatTokens, formatXP } from '../../utils/formatters';

const MissionCard = ({ 
  mission, 
  userMission = null,
  onAssign,
  onUpdateProgress,
  onComplete,
  showActions = true,
  className = ''
}) => {
  const isCompleted = userMission?.is_completed || false;
  const progress = userMission?.progress || 0;
  const canComplete = progress >= 100 && !isCompleted;

  const handleAssign = () => {
    if (onAssign) {
      onAssign(mission.id);
    }
  };

  const handleUpdateProgress = (newProgress) => {
    if (onUpdateProgress && userMission) {
      onUpdateProgress(userMission.id, { progress: newProgress });
    }
  };

  const handleComplete = () => {
    if (onComplete && userMission) {
      onComplete(userMission.id);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400 bg-green-900/20';
      case 'medium': return 'text-yellow-400 bg-yellow-900/20';
      case 'hard': return 'text-red-400 bg-red-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const getStatusColor = (isCompleted, progress) => {
    if (isCompleted) return 'text-green-400 bg-green-900/20';
    if (progress > 0) return 'text-blue-400 bg-blue-900/20';
    return 'text-gray-400 bg-gray-900/20';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors ${className}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-lg">{mission.title}</h3>
            <p className="text-sm text-gray-400">
              {formatMissionCategory(mission.category)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(mission.difficulty)}`}>
            {formatMissionDifficulty(mission.difficulty)}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(isCompleted, progress)}`}>
            {formatMissionStatus(isCompleted, progress)}
          </span>
        </div>
      </div>

      {/* Description */}
      <div className="mb-4">
        <p className="text-gray-300 leading-relaxed">
          {mission.description}
        </p>
      </div>

      {/* Progress Bar */}
      {userMission && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Progresso</span>
            <span className="text-sm text-gray-400">{progress}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Rewards */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-yellow-400">
            <Star className="w-4 h-4" />
            <span className="text-sm font-medium">{formatXP(mission.xp_reward)} XP</span>
          </div>
          <div className="flex items-center space-x-2 text-green-400">
            <Target className="w-4 h-4" />
            <span className="text-sm font-medium">{formatTokens(mission.token_reward)} tokens</span>
          </div>
        </div>
        
        {mission.is_daily && (
          <div className="flex items-center space-x-1 text-blue-400">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Diária</span>
          </div>
        )}
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex items-center justify-between">
          {!userMission ? (
            <button
              onClick={handleAssign}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
            >
              <Play className="w-4 h-4" />
              <span>Atribuir Missão</span>
            </button>
          ) : (
            <div className="flex items-center space-x-3">
              {!isCompleted && (
                <button
                  onClick={() => handleUpdateProgress(Math.min(progress + 25, 100))}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Atualizar Progresso
                </button>
              )}
              
              {canComplete && (
                <button
                  onClick={handleComplete}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Completar</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default MissionCard;




