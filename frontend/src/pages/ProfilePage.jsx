import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Mail, Calendar, Coins, Trophy, Target, Edit3, X, Camera, Check } from 'lucide-react'
import { toast } from 'react-hot-toast'

import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { useAuthStore } from '../stores/authStore'
import { api } from '../services/api'

const ProfilePage = () => {
  const { user, updateProfile } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)
  const [showAvatarSelector, setShowAvatarSelector] = useState(false)
  const [avatars, setAvatars] = useState([])
  const [editData, setEditData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    age: user?.age || '',
    avatar: user?.avatar || 'avatar_1'
  })

  // Carregar avatares disponíveis
  useEffect(() => {
    const loadAvatars = async () => {
      try {
        const response = await api.get('/avatars')
        setAvatars(response.data)
      } catch (error) {
        console.error('Erro ao carregar avatares:', error)
      }
    }
    loadAvatars()
  }, [])

  const handleEdit = () => {
    setIsEditing(true)
    setEditData({
      full_name: user?.full_name || '',
      email: user?.email || '',
      bio: user?.bio || '',
      age: user?.age || '',
      avatar: user?.avatar || 'avatar_1'
    })
  }

  const handleSave = async () => {
    try {
      await updateProfile(editData)
      setIsEditing(false)
      setShowAvatarSelector(false)
      toast.success('Perfil atualizado com sucesso!')
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error)
      toast.error('Erro ao atualizar perfil')
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setShowAvatarSelector(false)
    setEditData({
      full_name: user?.full_name || '',
      email: user?.email || '',
      bio: user?.bio || '',
      age: user?.age || '',
      avatar: user?.avatar || 'avatar_1'
    })
  }

  const handleAvatarSelect = (avatarId) => {
    setEditData(prev => ({ ...prev, avatar: avatarId }))
  }

  const getAvatarUrl = (avatarId) => {
    return `/static/avatars/${avatarId}.png`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-white">Perfil</h1>
          <p className="text-dark-400 mt-1">Gerencie suas informações pessoais</p>
        </div>
        {!isEditing && (
          <Button
            onClick={handleEdit}
            className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700"
          >
            <Edit3 className="w-4 h-4" />
            <span>Editar Perfil</span>
          </Button>
        )}
      </motion.div>

      {/* Perfil Principal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="p-8">
          <div className="flex items-start space-x-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-dark-700 border-4 border-primary-500">
                {user?.avatar ? (
                  <img
                    src={getAvatarUrl(user.avatar)}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = '/static/avatars/avatar_1.png'
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary-500">
                    <User className="w-8 h-8 text-white" />
                  </div>
                )}
              </div>
              {isEditing && (
                <button
                  onClick={() => setShowAvatarSelector(true)}
                  className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center hover:bg-primary-700 transition-colors"
                >
                  <Camera className="w-4 h-4 text-white" />
                </button>
              )}
            </div>

            {/* Informações do Usuário */}
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-4">
                <h2 className="text-2xl font-bold text-white">
                  {user?.full_name || user?.nickname || 'Usuário'}
                </h2>
                <span className="px-3 py-1 bg-primary-500/20 text-primary-400 rounded-full text-sm font-medium">
                  @{user?.nickname}
                </span>
              </div>

              {user?.bio && (
                <p className="text-dark-300 mb-4">{user.bio}</p>
              )}

              {/* Estatísticas */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-400">{user?.xp || 0}</div>
                  <div className="text-sm text-dark-400">XP</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">{user?.level || 1}</div>
                  <div className="text-sm text-dark-400">Nível</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{user?.tokens_available || 0}</div>
                  <div className="text-sm text-dark-400">Tokens</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">{user?.tokens_earned || 0}</div>
                  <div className="text-sm text-dark-400">Ganhos</div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Formulário de Edição */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-6">
              <h3 className="text-xl font-bold text-white mb-6">Editar Informações</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    value={editData.full_name}
                    onChange={(e) => setEditData(prev => ({ ...prev, full_name: e.target.value }))}
                    className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Seu nome completo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editData.email}
                    onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="seu@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">
                    Idade
                  </label>
                  <input
                    type="number"
                    value={editData.age}
                    onChange={(e) => setEditData(prev => ({ ...prev, age: parseInt(e.target.value) || '' }))}
                    className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Sua idade"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">
                    Avatar Atual
                  </label>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-dark-700 border-2 border-primary-500">
                      <img
                        src={getAvatarUrl(editData.avatar)}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = '/static/avatars/avatar_1.png'
                        }}
                      />
                    </div>
                    <Button
                      onClick={() => setShowAvatarSelector(true)}
                      variant="outline"
                      className="flex items-center space-x-2"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Trocar Avatar</span>
                    </Button>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Bio
                </label>
                <textarea
                  value={editData.bio}
                  onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  placeholder="Conte um pouco sobre você..."
                />
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>Cancelar</span>
                </Button>
                <Button
                  onClick={handleSave}
                  className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700"
                >
                  <Check className="w-4 h-4" />
                  <span>Salvar</span>
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Seletor de Avatar */}
      <AnimatePresence>
        {showAvatarSelector && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowAvatarSelector(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-dark-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Escolher Avatar</h3>
                <button
                  onClick={() => setShowAvatarSelector(false)}
                  className="text-dark-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-4 gap-4">
                {avatars.map((avatar) => (
                  <button
                    key={avatar.id}
                    onClick={() => handleAvatarSelect(avatar.id)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      editData.avatar === avatar.id
                        ? 'border-primary-500 bg-primary-500/20'
                        : 'border-dark-600 hover:border-primary-400'
                    }`}
                  >
                    <div className="w-16 h-16 mx-auto rounded-full overflow-hidden bg-dark-700 mb-2">
                      <img
                        src={avatar.url}
                        alt={avatar.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = '/static/avatars/avatar_1.png'
                        }}
                      />
                    </div>
                    <p className="text-sm text-dark-300 text-center">{avatar.name}</p>
                  </button>
                ))}
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <Button
                  onClick={() => setShowAvatarSelector(false)}
                  variant="outline"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => setShowAvatarSelector(false)}
                  className="bg-primary-600 hover:bg-primary-700"
                >
                  Confirmar
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ProfilePage

