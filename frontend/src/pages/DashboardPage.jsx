import { motion } from 'framer-motion'
import { 
  Trophy, 
  Target, 
  Coins, 
  TrendingUp,
  Users,
  MessageSquare,
  Star,
  Zap
} from 'lucide-react'

import { isDemo, demoDashboardCards } from '@/utils/demoSeed'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'
// [CONNECTUS PATCH] import para missões v2
import { DailyMissionCard } from '../components/missions/DailyMissionCard'
// [CONNECTUS HACKATHON] import para Web3
import VexaBox from '@/components/web3/VexaBox'

const DashboardPage = () => {
  const { user } = useAuth()
  
  // [CONNECTUS PATCH] verificar feature flag para missões v2
  const featureMissions = String(import.meta.env.VITE_FEATURE_MISSIONS_V2).toLowerCase() === 'true'
  
  const hasUserProgress = Boolean(
    Number(user?.xp || 0) > 0 ||
    Number(user?.tokens_available || 0) > 0 ||
    Number(user?.missions_completed || 0) > 0
  )

  const useDemoMetrics = isDemo && !hasUserProgress

  const metrics = useDemoMetrics
    ? demoDashboardCards
    : {
        totalXP: Number(user?.xp || 0),
        tokensDisponiveis: Number(user?.tokens_available || 0),
        missoesCompletas: Number(user?.missions_completed || 0),
        nivelAtual: Number(user?.level || 1)
      }

  const stats = [
    {
      title: 'XP Total',
      value: Number(metrics.totalXP || 0).toLocaleString('pt-BR'),
      icon: Star,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20',
      change: '+12%'
    },
    {
      title: 'Tokens Disponíveis',
      value: Number(metrics.tokensDisponiveis || 0).toFixed(2),
      icon: Coins,
      color: 'text-accent-400',
      bgColor: 'bg-accent-500/20',
      change: '+5%'
    },
    {
      title: 'Missões Completadas',
      value: Number(metrics.missoesCompletas || 0).toLocaleString('pt-BR'),
      icon: Target,
      color: 'text-primary-400',
      bgColor: 'bg-primary-500/20',
      change: '+3'
    },
    {
      title: 'Nível Atual',
      value: metrics.nivelAtual || 1,
      icon: Trophy,
      color: 'text-secondary-400',
      bgColor: 'bg-secondary-500/20',
      change: '+1'
    }
  ]

  const showDemoBanner = useDemoMetrics

  const quickActions = [
    {
      title: 'Ver Missões',
      description: 'Complete missões e ganhe recompensas',
      icon: Target,
      href: '/missions',
      color: 'from-primary-500 to-primary-600'
    },
    {
      title: 'Timeline',
      description: 'Veja o que está acontecendo',
      icon: MessageSquare,
      href: '/timeline',
      color: 'from-secondary-500 to-secondary-600'
    },
    {
      title: 'Ranking',
      description: 'Veja sua posição no ranking',
      icon: Trophy,
      href: '/ranking',
      color: 'from-accent-500 to-accent-600'
    },
    {
      title: 'Chat',
      description: 'Converse com outros usuários',
      icon: Users,
      href: '/chat',
      color: 'from-purple-500 to-purple-600'
    }
  ]

  return (
    <div className="space-y-6">
      {showDemoBanner && (
        <div className="rounded-lg border border-sky-500/30 bg-sky-500/10 text-sky-100 text-xs px-3 py-2">
          Visualização com <b>dados de demonstração</b>. No ambiente real, estes números vêm das suas ações.
        </div>
      )}
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-4"
      >
        <h1 className="text-3xl font-bold text-white">
          Bem-vindo de volta, {user?.nickname}! 🚀
        </h1>
        <p className="text-dark-400 max-w-2xl mx-auto">
          Continue sua jornada de impacto social. Complete missões, ganhe XP e tokens, 
          e faça a diferença na sua comunidade!
        </p>
      </motion.div>

      {/* Estatísticas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat, index) => (
          <Card key={stat.title} variant="glow" className="relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-dark-400">{stat.title}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </p>
                <p className="text-xs text-green-400 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {stat.change}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
            
            {/* Efeito de partículas */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-xl" />
          </Card>
        ))}
      </motion.div>

      {/* Ações rápidas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {quickActions.map((action, index) => (
          <Card key={action.title} variant="cyber" className="group hover-lift">
            <div className="text-center space-y-4">
              <div className={`w-16 h-16 mx-auto bg-gradient-to-r ${action.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                <action.icon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {action.title}
                </h3>
                <p className="text-sm text-dark-400 mb-4">
                  {action.description}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full group-hover:bg-white/10"
                  onClick={() => window.location.href = action.href}
                >
                  Acessar
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </motion.div>

      {/* [CONNECTUS HACKATHON] Seção Web3 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.25 }}
        className="space-y-6"
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">
            🌐 VEXA Web3
          </h2>
          <p className="text-dark-400">
            Conecte sua carteira e interaja com tokens VEXA na blockchain
          </p>
        </div>

        <VexaBox />
      </motion.div>

      {/* Missões em destaque */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* [CONNECTUS PATCH] Missão do dia - com feature flag */}
        {featureMissions ? (
          <DailyMissionCard />
        ) : (
          <Card variant="glow" className="relative overflow-hidden">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Missão do Dia
                </h3>
                <p className="text-dark-400">
                  Complete missões diárias para ganhar XP e tokens
                </p>
              </div>
              <div className="p-3 bg-primary-500/20 rounded-lg">
                <Zap className="w-6 h-6 text-primary-400" />
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="bg-dark-700/50 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">Ir à escola</h4>
                <p className="text-sm text-dark-400 mb-3">
                  Vá à escola hoje e registre sua presença
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-accent-400 font-medium">
                    +50 XP • +2 Tokens
                  </span>
                  <Button size="sm" variant="primary">
                    Completar
                  </Button>
                </div>
              </div>
            </div>
            
            <Button variant="ghost" className="w-full mt-4">
              Ver Todas as Missões
            </Button>
          </Card>
        )}

        {/* Ranking rápido */}
        <Card variant="glow" className="relative overflow-hidden">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">
                Seu Ranking
              </h3>
              <p className="text-dark-400">
                Veja sua posição na comunidade
              </p>
            </div>
            <div className="p-3 bg-secondary-500/20 rounded-lg">
              <Trophy className="w-6 h-6 text-secondary-400" />
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-dark-700/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center text-sm font-bold text-dark-900">
                  1
                </div>
                <div>
                  <p className="font-semibold text-white">João Silva</p>
                  <p className="text-xs text-dark-400">2,450 XP</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-dark-700/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full flex items-center justify-center text-sm font-bold text-white">
                  2
                </div>
                <div>
                  <p className="font-semibold text-white">Maria Santos</p>
                  <p className="text-xs text-dark-400">2,100 XP</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-primary-500/20 rounded-lg border border-primary-500/30">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-sm font-bold text-white">
                  3
                </div>
                <div>
                  <p className="font-semibold text-white">Você</p>
                  <p className="text-xs text-primary-400">{user?.xp || 0} XP</p>
                </div>
              </div>
            </div>
          </div>
          
          <Button variant="ghost" className="w-full mt-4">
            Ver Ranking Completo
          </Button>
        </Card>
      </motion.div>
    </div>
  )
}

export default DashboardPage


