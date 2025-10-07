import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Trophy, 
  Star, 
  Coins, 
  Target,
  Medal,
  Crown,
  Award,
  TrendingUp
} from 'lucide-react'

import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { useRanking } from '../hooks/useRanking'

const RankingPage = () => {
  const [activeTab, setActiveTab] = useState('overall')
  const { ranking, loading, error, fetchRanking } = useRanking()

  // Carregar ranking ao montar o componente
  useEffect(() => {
    fetchRanking()
  }, [])

  // Usar os mesmos dados para todas as abas
  const rankings = {
    overall: ranking,
    xp: ranking,
    tokens: ranking,
    missions: ranking
  }

  const tabs = [
    { id: 'overall', name: 'Geral', icon: Trophy },
    { id: 'xp', name: 'XP', icon: Star },
    { id: 'tokens', name: 'Tokens', icon: Coins },
    { id: 'missions', name: 'Missões', icon: Target }
  ]

  const getPositionIcon = (position) => {
    switch (position) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-400" />
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />
      default:
        return <span className="w-6 h-6 bg-dark-700 rounded-full flex items-center justify-center text-sm font-bold text-white">
          {position}
        </span>
    }
  }

  const getPositionColor = (position) => {
    switch (position) {
      case 1:
        return 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30'
      case 2:
        return 'from-gray-500/20 to-gray-600/20 border-gray-500/30'
      case 3:
        return 'from-amber-500/20 to-amber-600/20 border-amber-500/30'
      default:
        return 'from-dark-700/50 to-dark-800/50 border-dark-700/50'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-4"
      >
        <h1 className="text-3xl font-bold text-white">Ranking</h1>
        <p className="text-dark-400">
          Veja quem está no topo da comunidade Connectus!
        </p>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Card variant="cyber">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                    : 'text-dark-400 hover:text-white hover:bg-dark-700/50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="font-medium">{tab.name}</span>
              </button>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Pódio */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {(rankings[activeTab] || []).slice(0, 3).map((user, index) => (
          <Card 
            key={user.nickname} 
            variant="glow" 
            className={`text-center relative overflow-hidden ${
              index === 0 ? 'md:order-2' : index === 1 ? 'md:order-1' : 'md:order-3'
            }`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${getPositionColor(user.position)} opacity-50`} />
            
            <div className="relative z-10 space-y-4">
              {/* Posição */}
              <div className="flex justify-center">
                {getPositionIcon(user.position)}
              </div>
              
              {/* Avatar */}
              <div className="w-16 h-16 mx-auto bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-white">
                  {user.name.charAt(0)}
                </span>
              </div>
              
              {/* Informações */}
              <div>
                <h3 className="text-lg font-bold text-white">{user.name}</h3>
                <p className="text-sm text-dark-400">@{user.nickname}</p>
                <div className="flex items-center justify-center space-x-2 mt-2">
                  <span className="text-xs text-accent-400 font-medium">
                    Nível {user.level}
                  </span>
                </div>
              </div>
              
              {/* Estatísticas */}
              <div className="space-y-2">
                {activeTab === 'overall' && (
                  <>
                    <div className="flex items-center justify-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm text-yellow-400 font-medium">
                        {user.xp.toLocaleString()} XP
                      </span>
                    </div>
                    <div className="flex items-center justify-center space-x-1">
                      <Coins className="w-4 h-4 text-accent-400" />
                      <span className="text-sm text-accent-400 font-medium">
                        {user.tokens} Tokens
                      </span>
                    </div>
                    <div className="flex items-center justify-center space-x-1">
                      <Target className="w-4 h-4 text-primary-400" />
                      <span className="text-sm text-primary-400 font-medium">
                        {user.missions} Missões
                      </span>
                    </div>
                  </>
                )}
                {activeTab === 'xp' && (
                  <div className="flex items-center justify-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="text-lg text-yellow-400 font-bold">
                      {user.xp.toLocaleString()} XP
                    </span>
                  </div>
                )}
                {activeTab === 'tokens' && (
                  <div className="flex items-center justify-center space-x-1">
                    <Coins className="w-4 h-4 text-accent-400" />
                    <span className="text-lg text-accent-400 font-bold">
                      {user.tokens} Tokens
                    </span>
                  </div>
                )}
                {activeTab === 'missions' && (
                  <div className="flex items-center justify-center space-x-1">
                    <Target className="w-4 h-4 text-primary-400" />
                    <span className="text-lg text-primary-400 font-bold">
                      {user.missions} Missões
                    </span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </motion.div>

      {/* Lista completa do ranking */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Card variant="glow">
          <h3 className="text-xl font-bold text-white mb-6">Ranking Completo</h3>
          
          <div className="space-y-3">
            {(rankings[activeTab] || []).map((user, index) => (
              <div
                key={user.nickname}
                className={`flex items-center justify-between p-4 rounded-lg transition-all duration-200 hover:bg-dark-700/50 ${
                  index < 3 ? `bg-gradient-to-r ${getPositionColor(user.position)}` : 'bg-dark-700/30'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-8">
                    {getPositionIcon(user.position)}
                  </div>
                  
                  <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-white">
                      {user.name.charAt(0)}
                    </span>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-white">{user.name}</h4>
                    <p className="text-sm text-dark-400">@{user.nickname}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <p className="text-sm text-dark-400">Nível</p>
                    <p className="font-bold text-white">{user.level}</p>
                  </div>
                  
                  {activeTab === 'overall' && (
                    <>
                      <div className="text-center">
                        <p className="text-sm text-dark-400">XP</p>
                        <p className="font-bold text-yellow-400">{user.xp.toLocaleString()}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-dark-400">Tokens</p>
                        <p className="font-bold text-accent-400">{user.tokens}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-dark-400">Missões</p>
                        <p className="font-bold text-primary-400">{user.missions}</p>
                      </div>
                    </>
                  )}
                  
                  {activeTab === 'xp' && (
                    <div className="text-center">
                      <p className="text-sm text-dark-400">XP</p>
                      <p className="font-bold text-yellow-400">{user.xp.toLocaleString()}</p>
                    </div>
                  )}
                  
                  {activeTab === 'tokens' && (
                    <div className="text-center">
                      <p className="text-sm text-dark-400">Tokens</p>
                      <p className="font-bold text-accent-400">{user.tokens}</p>
                    </div>
                  )}
                  
                  {activeTab === 'missions' && (
                    <div className="text-center">
                      <p className="text-sm text-dark-400">Missões</p>
                      <p className="font-bold text-primary-400">{user.missions}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Sua posição */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Card variant="cyber">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                <span className="text-lg font-bold text-white">U</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Sua Posição</h3>
                <p className="text-dark-400">Veja como você está se saindo</p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-2xl font-bold text-primary-400">#15</p>
              <p className="text-sm text-dark-400">Posição atual</p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}

export default RankingPage




