import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Home, 
  User, 
  Target, 
  MessageSquare, 
  Trophy, 
  LogOut,
  Bot,
  Coins,
  TrendingUp
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const Sidebar = () => {
  const { user, logout } = useAuth()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Perfil', href: '/profile', icon: User },
    { name: 'VEXA IA', href: '/ai', icon: Bot, special: true, badge: 'AI' },
    {
      name: 'Sua Carteira',
      href: '/vexa',
      icon: Coins,
      special: true,
      badge: 'Demo',
      tooltip: 'Conecte sua carteira real ou use o modo demonstração (sem dinheiro real).'
    },
    { name: 'Missões', href: '/missions', icon: Target },
    { name: 'Impact Score', href: '/impact', icon: TrendingUp },
    { name: 'Timeline', href: '/timeline', icon: MessageSquare },
    { name: 'Ranking', href: '/ranking', icon: Trophy },
    { name: 'Chat', href: '/chat', icon: MessageSquare },
  ]

  return (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5 }}
      className="w-64 bg-dark-800/50 backdrop-blur-sm border-r border-dark-700/50 flex flex-col"
    >
      {/* Logo */}
      <div className="p-6 border-b border-dark-700/50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
            <span className="text-xl font-bold text-white">C</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Connectus</h1>
            <p className="text-xs text-dark-400">Gamificação Social</p>
          </div>
        </div>
      </div>

      {/* Navegação */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            title={item.tooltip}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                item.special
                  ? isActive
                    ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-400 border border-blue-500/30'
                    : 'text-blue-300 hover:text-blue-400 hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-purple-500/10'
                  : isActive
                    ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                    : 'text-dark-300 hover:text-white hover:bg-dark-700/50'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.name}</span>
            {item.special && (
              <span className="ml-auto px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded-full">
                {item.badge || 'AI'}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Perfil do usuário */}
      <div className="p-4 border-t border-dark-700/50">
        <div className="flex items-center space-x-3 mb-4">
          {/* [CONNECTUS PATCH] avatar global */}
          {user?.avatar_png_url ? (
            <img
              src={user.avatar_png_url}
              alt="Avatar"
              className="w-10 h-10 rounded-full object-cover"
              onError={(e) => { e.currentTarget.style.display = 'none'; /* cai no fallback abaixo */ }}
            />
          ) : (
            <div className="w-10 h-10 bg-gradient-to-r from-accent-500 to-accent-600 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold text-dark-900">
                {user?.nickname?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.nickname || 'Usuário'}
            </p>
            <p className="text-xs text-dark-400">
              Nível {user?.level || 1}
            </p>
          </div>
        </div>

        {/* Estatísticas rápidas */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-dark-700/50 rounded-lg p-2 text-center">
            <p className="text-xs text-dark-400">XP</p>
            <p className="text-sm font-bold text-primary-400">
              {user?.xp?.toLocaleString() || 0}
            </p>
          </div>
          <div className="bg-dark-700/50 rounded-lg p-2 text-center">
            <p className="text-xs text-dark-400">Tokens</p>
            <p className="text-sm font-bold text-accent-400">
              {user?.tokens_available ? parseFloat(user.tokens_available).toFixed(2) : '0.00'}
            </p>
          </div>
        </div>

        {/* Botão de logout */}
        <button
          onClick={logout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-dark-300 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 group"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sair</span>
        </button>
      </div>
    </motion.div>
  )
}

export default Sidebar


