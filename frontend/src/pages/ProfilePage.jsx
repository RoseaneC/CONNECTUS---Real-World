import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Mail, Calendar, Coins, Trophy, Target, Edit3, X, Camera, Check, Sparkles } from 'lucide-react'
import { toast } from 'react-hot-toast'

import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { useAuthStore } from '../stores/authStore'
import api, { getAvatar, updateProfileAvatar } from '../services/api'
import { fetchMyAvatar, saveMyAvatar } from '../services/avatarService'
import ReadyPlayerMeModal from '../components/avatar/ReadyPlayerMeModal'
import useFeatureFlags from '../hooks/useFeatureFlags'

const ProfilePage = () => {
  const { user, updateProfile } = useAuthStore()
  const { rpm, rpmSubdomain } = useFeatureFlags()
  const [isEditing, setIsEditing] = useState(false)
  const [showRPM, setShowRPM] = useState(false)
  // [CONNECTUS PATCH] Substituir qualquer "avatars" por currentAvatar (objeto)
  const [currentAvatar, setCurrentAvatar] = useState({ glb_url: null, png_url: null });
  // [CONNECTUS PATCH] Avatar do novo serviço
  const [avatar, setAvatar] = useState({ avatar_url: null, avatar_glb_url: null, avatar_png_url: null });
  const [editData, setEditData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    age: user?.age || '',
    avatar: user?.avatar || 'avatar_1'
  })

  // [CONNECTUS PATCH] Carregar avatar atual do Ready Player Me
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getAvatar(); // retorna {glb_url, png_url} ou null normalizado
        if (mounted && data) {
          setCurrentAvatar({
            glb_url: data.glb_url ?? null,
            png_url: data.png_url ?? null,
          });
        }
      } catch (err) {
        // não quebrar UI
        console.warn('[CONNECTUS PATCH] getAvatar falhou', err);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // [CONNECTUS PATCH] Carregar avatar do novo serviço
  useEffect(() => {
    (async () => {
      try {
        const data = await fetchMyAvatar();
        setAvatar({
          avatar_url: data?.avatar_url ?? null,
          avatar_glb_url: data?.avatar_glb_url ?? null,
          avatar_png_url: data?.avatar_png_url ?? null,
        });
      } catch (e) {
        console.debug("[CONNECTUS] avatar fetch falhou", e);
      }
    })();
  }, []);

  // [CONNECTUS PATCH] Remover carregamento de avatares antigos

  // [CONNECTUS PATCH] Determinar qual avatar usar (priorizando novo serviço)
  const computedAvatarSrc =
    (avatar && (avatar.avatar_png_url || avatar.avatar_url)) ||
    (user && (user.avatar_png_url || user.avatar_url)) ||
    null;

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
      toast.success('Perfil atualizado com sucesso!')
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error)
      toast.error('Erro ao atualizar perfil')
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditData({
      full_name: user?.full_name || '',
      email: user?.email || '',
      bio: user?.bio || '',
      age: user?.age || '',
      avatar: user?.avatar || 'avatar_1'
    })
  }

  // [CONNECTUS PATCH] Handler para salvar avatar do Ready Player Me
  async function handleRPMSaved({ avatar_glb_url, avatar_png_url }) {
    try {
      // [CONNECTUS PATCH] Usar novo serviço de avatar
      await saveMyAvatar({
        avatar_url: null,
        glb: avatar_glb_url,
        png: avatar_png_url
      });
      
      // Cache-buster para evitar cache da CDN do RPM
      const pngUrlWithCacheBuster = avatar_png_url ? `${avatar_png_url}?v=${Date.now()}` : null;
      
      // [CONNECTUS PATCH] Atualizar estado do novo serviço
      setAvatar({
        avatar_url: null,
        avatar_glb_url: avatar_glb_url ?? null,
        avatar_png_url: pngUrlWithCacheBuster,
      });
      
      // [CONNECTUS PATCH] Manter compatibilidade com sistema antigo
      setCurrentAvatar({
        glb_url: avatar_glb_url ?? null,
        png_url: pngUrlWithCacheBuster,
      });
      
      // [CONNECTUS PATCH] Propagar avatar na store do usuário
      const { setUser } = useAuthStore.getState();
      const currentUser = useAuthStore.getState().user;
      if (currentUser) {
        const updatedUser = {
          ...currentUser,
          avatar_png_url: pngUrlWithCacheBuster,
          avatar_glb_url: avatar_glb_url ?? null
        };
        setUser(updatedUser);
        if (import.meta.env.DEV) console.log('[AVATAR] atualizado', updatedUser?.avatar_png_url);
      }
      
      toast.success('Avatar atualizado com sucesso!');
      if (import.meta.env.DEV)
        console.log('[RPM] avatar salvo', { avatar_glb_url, avatar_png_url });
    } catch (err) {
      console.error('[CONNECTUS PATCH] updateProfileAvatar falhou', err);
      toast.error('Não foi possível salvar o avatar.');
    } finally {
      setShowRPM(false);
    }
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
          {import.meta.env.DEV && (
            <span className="ml-2 text-[10px] px-2 py-1 rounded bg-emerald-900/40 text-emerald-200">
              RPM flag: {String(import.meta.env.VITE_FEATURE_RPM)}
            </span>
          )}
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
            {/* [CONNECTUS PATCH] Avatar preview seguro */}
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden ring-2 ring-sky-500">
                {computedAvatarSrc ? (
                  <img src={computedAvatarSrc} alt="Meu avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs text-slate-300">sem avatar</span>
                )}
              </div>

              {rpm && (
                <button
                  type="button"
                  onClick={() => { if (import.meta.env.DEV) console.log('[RPM] abrir modal'); setShowRPM(true); }}
                  className="px-3 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-sm"
                >
                  Criar/Editar meu avatar
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
              
              {/* [CONNECTUS PATCH] Preview do avatar atual */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden ring-2 ring-sky-500">
                  {computedAvatarSrc ? (
                    <img src={computedAvatarSrc} alt="Meu avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs text-slate-300">sem avatar</span>
                  )}
                </div>

                {rpm && (
                  <button
                    type="button"
                    onClick={() => { if (import.meta.env.DEV) console.log('[RPM] abrir modal'); setShowRPM(true); }}
                    className="px-3 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-sm"
                  >
                    Criar/Editar meu avatar
                  </button>
                )}
              </div>
              
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
                    {rpm && (
                      <Button
                        onClick={() => { if (import.meta.env.DEV) console.log('[RPM] abrir modal'); setShowRPM(true); }}
                        variant="outline"
                        className="flex items-center space-x-2"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Criar/Editar meu avatar</span>
                      </Button>
                    )}
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

      {/* [CONNECTUS PATCH] Seção Ready Player Me */}
      {rpm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Meu Avatar (Ready Player Me)</h3>
                  <p className="text-dark-400 text-sm">Crie um avatar personalizado em 3D</p>
                </div>
              </div>
              <Button
                onClick={() => setShowRPM(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Sparkles className="w-4 h-4" />
                <span>Criar/Editar meu avatar</span>
              </Button>
            </div>
            
            {computedAvatarSrc ? (
              <div className="flex items-center space-x-4 p-4 bg-dark-700/50 rounded-lg">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary-500">
                  <img
                    src={computedAvatarSrc}
                    alt="Avatar atual"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-white font-medium">Avatar personalizado ativo</p>
                  <p className="text-dark-400 text-sm">Criado com Ready Player Me</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-dark-400">
                <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum avatar personalizado ainda</p>
                <p className="text-sm">Clique no botão acima para criar o seu!</p>
              </div>
            )}
          </Card>
        </motion.div>
      )}

      {/* [CONNECTUS PATCH] Modal Ready Player Me */}
      {rpm && (
        <ReadyPlayerMeModal
          open={showRPM}
          onClose={() => setShowRPM(false)}
          onSaved={handleRPMSaved}
        />
      )}
    </div>
  )
}

export default ProfilePage

