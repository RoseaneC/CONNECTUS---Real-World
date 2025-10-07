import { motion } from 'framer-motion';
import { Trophy, Star, Target, User } from 'lucide-react';
import { formatRank, formatXP, formatTokens, formatUsername } from '../../utils/formatters';

const RankingCard = ({ 
  user, 
  rank, 
  type = 'overall',
  className = ''
}) => {
  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-400" />;
    if (rank === 2) return <Trophy className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Trophy className="w-6 h-6 text-orange-400" />;
    return <span className="w-6 h-6 flex items-center justify-center text-gray-400 font-bold">{rank}</span>;
  };

  const getRankColor = (rank) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-yellow-500/30';
    if (rank === 2) return 'bg-gradient-to-r from-gray-500/20 to-gray-600/20 border-gray-500/30';
    if (rank === 3) return 'bg-gradient-to-r from-orange-500/20 to-orange-600/20 border-orange-500/30';
    return 'bg-gray-800/50 border-gray-700';
  };

  const getValueByType = (type) => {
    switch (type) {
      case 'xp':
        return { value: user.total_xp, label: 'XP', icon: Star };
      case 'tokens':
        return { value: user.total_tokens, label: 'Tokens', icon: Target };
      case 'missions':
        return { value: user.missions_completed, label: 'Missões', icon: Target };
      default:
        return { value: user.total_xp, label: 'XP', icon: Star };
    }
  };

  const valueInfo = getValueByType(type);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-center space-x-4 p-4 rounded-lg border transition-all duration-200 hover:scale-105 ${getRankColor(rank)} ${className}`}
    >
      {/* Rank */}
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-700">
        {getRankIcon(rank)}
      </div>

      {/* User Info */}
      <div className="flex-1">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">
              {user.user?.nickname || 'Usuário'}
            </h3>
            <p className="text-sm text-gray-400">
              {formatUsername(user.user?.nickname)} • Nível {user.user?.level || 1}
            </p>
          </div>
        </div>
      </div>

      {/* Value */}
      <div className="text-right">
        <div className="flex items-center space-x-2 text-lg font-bold text-white">
          <valueInfo.icon className="w-5 h-5" />
          <span>
            {type === 'tokens' ? formatTokens(valueInfo.value) : valueInfo.value?.toLocaleString('pt-BR') || '0'}
          </span>
        </div>
        <p className="text-sm text-gray-400">{valueInfo.label}</p>
      </div>

      {/* Additional Stats */}
      <div className="text-right text-sm text-gray-400">
        <p>Posts: {user.posts_created || 0}</p>
        <p>Likes: {user.likes_received || 0}</p>
      </div>
    </motion.div>
  );
};

export default RankingCard;




