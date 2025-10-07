import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  Bell, 
  Search, 
  Settings, 
  Menu,
  X
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useMockNotifications } from '../../hooks/useMockData'

const Header = () => {
  const { user } = useAuth()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  
  const { notifications, fetchNotifications } = useMockNotifications()

  // Carregar notificações ao montar o componente
  useEffect(() => {
    fetchNotifications()
  }, [])
  
  // Fechar dropdowns quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isSearchOpen || isNotificationsOpen || isSettingsOpen) {
        setIsSearchOpen(false)
        setIsNotificationsOpen(false)
        setIsSettingsOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isSearchOpen, isNotificationsOpen, isSettingsOpen])

  return (
    <header className="bg-dark-800/50 backdrop-blur-sm border-b border-dark-700/50 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Lado esquerdo */}
        <div className="flex items-center space-x-4">
          {/* Botão mobile menu */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-dark-700/50 transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-dark-300" />
            ) : (
              <Menu className="w-5 h-5 text-dark-300" />
            )}
          </button>

          {/* Título da página */}
          <h2 className="text-xl font-semibold text-white">
            Bem-vindo de volta, {user?.nickname || 'Usuário'}! 👋
          </h2>
        </div>

        {/* Lado direito */}
        <div className="flex items-center space-x-4">
          {/* Barra de pesquisa */}
          <div className="relative">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 rounded-lg hover:bg-dark-700/50 transition-colors"
              title="Pesquisar"
            >
              <Search className="w-5 h-5 text-dark-300" />
            </button>
            
            {isSearchOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 top-full mt-2 w-80 bg-dark-800 border border-dark-700 rounded-lg shadow-xl z-50"
              >
                <div className="p-4">
                  <input
                    type="text"
                    placeholder="Pesquisar posts, usuários, missões..."
                    className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-2 text-white placeholder-dark-400 focus:outline-none focus:border-primary-500"
                    autoFocus
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        console.log('Pesquisando:', e.target.value);
                        // TODO: Implementar busca
                        setIsSearchOpen(false);
                      }
                    }}
                  />
                  <div className="mt-2 text-xs text-dark-400">
                    Pressione Enter para pesquisar
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Notificações */}
          <div className="relative">
            <button 
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="p-2 rounded-lg hover:bg-dark-700/50 transition-colors relative"
              title="Notificações"
            >
              <Bell className="w-5 h-5 text-dark-300" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs flex items-center justify-center">
                {notifications.filter(n => !n.read).length}
              </span>
            </button>
            
            {isNotificationsOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 top-full mt-2 w-80 bg-dark-800 border border-dark-700 rounded-lg shadow-xl z-50"
              >
                <div className="p-4">
                  <h3 className="text-white font-semibold mb-3">Notificações</h3>
                  <div className="space-y-2">
                    {notifications.map((notification) => (
                      <div 
                        key={notification.id} 
                        className={`p-3 rounded-lg ${notification.read ? 'bg-dark-700/30' : 'bg-dark-700/50'}`}
                      >
                        <p className="text-sm text-white">{notification.title}</p>
                        <p className="text-xs text-dark-400">{notification.time}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Configurações */}
          <div className="relative">
            <button 
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="p-2 rounded-lg hover:bg-dark-700/50 transition-colors"
              title="Configurações"
            >
              <Settings className="w-5 h-5 text-dark-300" />
            </button>
            
            {isSettingsOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 top-full mt-2 w-64 bg-dark-800 border border-dark-700 rounded-lg shadow-xl z-50"
              >
                <div className="p-4">
                  <h3 className="text-white font-semibold mb-3">Configurações</h3>
                  <div className="space-y-2">
                    <button className="w-full text-left p-2 rounded-lg hover:bg-dark-700/50 transition-colors">
                      <span className="text-sm text-white">Perfil</span>
                    </button>
                    <button className="w-full text-left p-2 rounded-lg hover:bg-dark-700/50 transition-colors">
                      <span className="text-sm text-white">Privacidade</span>
                    </button>
                    <button className="w-full text-left p-2 rounded-lg hover:bg-dark-700/50 transition-colors">
                      <span className="text-sm text-white">Notificações</span>
                    </button>
                    <button className="w-full text-left p-2 rounded-lg hover:bg-dark-700/50 transition-colors">
                      <span className="text-sm text-white">Tema</span>
                    </button>
                    <hr className="border-dark-600 my-2" />
                    <button className="w-full text-left p-2 rounded-lg hover:bg-dark-700/50 transition-colors">
                      <span className="text-sm text-red-400">Sair</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Avatar do usuário */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold text-white">
                {user?.nickname?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-white">
                {user?.nickname || 'Usuário'}
              </p>
              <p className="text-xs text-dark-400">
                Nível {user?.level || 1}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Menu mobile */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="lg:hidden mt-4 pt-4 border-t border-dark-700/50"
        >
          <div className="space-y-2">
            <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-dark-300 hover:text-white hover:bg-dark-700/50 transition-all duration-200">
              <Search className="w-5 h-5" />
              <span>Pesquisar</span>
            </button>
            <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-dark-300 hover:text-white hover:bg-dark-700/50 transition-all duration-200">
              <Bell className="w-5 h-5" />
              <span>Notificações</span>
            </button>
            <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-dark-300 hover:text-white hover:bg-dark-700/50 transition-all duration-200">
              <Settings className="w-5 h-5" />
              <span>Configurações</span>
            </button>
          </div>
        </motion.div>
      )}
    </header>
  )
}

export default Header


