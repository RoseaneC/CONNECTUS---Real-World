import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  MessageSquare, 
  Heart, 
  Share2, 
  MoreHorizontal,
  Image as ImageIcon,
  Send,
  Smile,
  Search,
  User,
  Clock,
  Trash2,
  X
} from 'lucide-react'
import { toast } from 'react-hot-toast'

import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

const TimelinePage = () => {
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [newPost, setNewPost] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [showPostMenu, setShowPostMenu] = useState(null)

  // Carregar timeline
  const fetchTimeline = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get('/posts/timeline?limit=20&offset=0')
      setPosts(response.data)
      console.log('✅ Timeline carregada:', response.data)
    } catch (error) {
      console.error('❌ Erro ao carregar timeline:', error)
      setError('Erro ao carregar posts')
      toast.error('Erro ao carregar timeline')
    } finally {
      setLoading(false)
    }
  }

  // Criar novo post
  const handleCreatePost = async (e) => {
    e.preventDefault()
    if (!newPost.trim()) return

    try {
      const response = await api.post('/posts', {
        content: newPost.trim(),
        image_url: null
      })
      
      setPosts(prev => [response.data, ...prev])
      setNewPost('')
      setShowCreateModal(false)
      toast.success('Post criado com sucesso!')
      console.log('✅ Post criado:', response.data)
    } catch (error) {
      console.error('❌ Erro ao criar post:', error)
      toast.error('Erro ao criar post')
    }
  }

  // Buscar posts
  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    try {
      // Por enquanto, filtrar posts localmente
      const filtered = posts.filter(post => 
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.user?.nickname?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setSearchResults(filtered)
      setShowSearchResults(true)
    } catch (error) {
      console.error('❌ Erro na busca:', error)
      toast.error('Erro na busca')
    }
  }

  // Deletar post
  const handleDeletePost = async (postId) => {
    try {
      await api.delete(`/posts/${postId}`)
      setPosts(posts.filter(post => post.id !== postId))
      setShowPostMenu(null)
      toast.success('Post deletado com sucesso!')
    } catch (error) {
      console.error('Erro ao deletar post:', error)
      toast.error('Erro ao deletar post')
    }
  }

  // Curtir post
  const handleLikePost = async (postId) => {
    try {
      // Simular curtida (em produção, fazer chamada para API)
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, likes_count: post.likes_count + 1 }
          : post
      ))
      toast.success('Post curtido!')
    } catch (error) {
      console.error('❌ Erro ao curtir post:', error)
      toast.error('Erro ao curtir post')
    }
  }

  // Compartilhar post
  const handleSharePost = async (postId) => {
    try {
      // Simular compartilhamento
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, shares_count: post.shares_count + 1 }
          : post
      ))
      toast.success('Post compartilhado!')
    } catch (error) {
      console.error('❌ Erro ao compartilhar post:', error)
      toast.error('Erro ao compartilhar post')
    }
  }

  // Carregar timeline ao montar o componente
  useEffect(() => {
    fetchTimeline()
  }, [])

  const getAvatarUrl = (avatarId) => {
    return `/static/avatars/${avatarId || 'avatar_1'}.png`
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Agora mesmo'
    if (minutes < 60) return `${minutes}m`
    if (hours < 24) return `${hours}h`
    return `${days}d`
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
          <h1 className="text-3xl font-bold text-white">Timeline</h1>
          <p className="text-dark-400 mt-1">Veja o que está acontecendo na comunidade</p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-primary-600 hover:bg-primary-700"
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Novo Post
        </Button>
      </motion.div>

      {/* Busca */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="p-4">
          <form onSubmit={handleSearch} className="flex space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Buscar posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" variant="outline">
              Buscar
            </Button>
          </form>
        </Card>
      </motion.div>

      {/* Resultados da Busca */}
      {showSearchResults && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                Resultados da busca: "{searchQuery}"
              </h3>
              <Button
                onClick={() => {
                  setShowSearchResults(false)
                  setSearchQuery('')
                }}
                variant="outline"
                size="sm"
              >
                Limpar
              </Button>
            </div>
            {searchResults.length > 0 ? (
              <div className="space-y-4">
                {searchResults.map((post) => (
                  <div key={post.id} className="p-4 bg-dark-700 rounded-lg">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-dark-600">
                        <img
                          src={getAvatarUrl(post.user?.avatar)}
                          alt={post.user?.nickname}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = '/static/avatars/avatar_1.png'
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">
                          {post.user?.full_name || post.user?.nickname}
                        </p>
                        <p className="text-xs text-dark-400">
                          @{post.user?.nickname} • {formatDate(post.created_at)}
                        </p>
                      </div>
                    </div>
                    <p className="text-dark-300">{post.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-dark-400">Nenhum resultado encontrado.</p>
            )}
          </Card>
        </motion.div>
      )}

      {/* Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-4"
      >
        {loading ? (
          <Card className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-dark-400">Carregando posts...</p>
          </Card>
        ) : error ? (
          <Card className="p-8 text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <Button onClick={fetchTimeline} variant="outline">
              Tentar Novamente
            </Button>
          </Card>
        ) : posts.length === 0 ? (
          <Card className="p-8 text-center">
            <MessageSquare className="w-12 h-12 text-dark-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Nenhum post ainda</h3>
            <p className="text-dark-400 mb-4">Seja o primeiro a compartilhar algo!</p>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-primary-600 hover:bg-primary-700"
            >
              Criar Primeiro Post
            </Button>
          </Card>
        ) : (
          posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="p-6">
                <div className="flex items-start space-x-4">
                  {/* Avatar 3D */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                    {post.user?.avatar && typeof post.user.avatar === 'string' && post.user.avatar.startsWith('{') ? (
                      // Avatar 3D personalizado (JSON)
                      <span className="text-lg">
                        {JSON.parse(post.user.avatar).emoji || post.user?.nickname?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    ) : (
                      // Avatar padrão ou emoji simples
                      <span className="text-sm font-bold text-white">
                        {post.user?.avatar || post.user?.nickname?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>

                  {/* Conteúdo */}
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-white">
                        {post.user?.full_name || post.user?.nickname}
                      </h3>
                      <span className="text-dark-400">•</span>
                      <span className="text-dark-400 text-sm">
                        @{post.user?.nickname}
                      </span>
                      <span className="text-dark-400">•</span>
                      <div className="flex items-center space-x-1 text-dark-400 text-sm">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(post.created_at)}</span>
                      </div>
                    </div>

                    {/* Conteúdo do Post */}
                    <p className="text-dark-300 mb-4 whitespace-pre-wrap">{post.content}</p>

                    {/* Imagem (se houver) */}
                    {post.image_url && (
                      <div className="mb-4 rounded-lg overflow-hidden">
                        <img
                          src={post.image_url}
                          alt="Post image"
                          className="w-full max-h-96 object-cover"
                        />
                      </div>
                    )}

                    {/* Ações */}
                    <div className="flex items-center space-x-6">
                      <button
                        onClick={() => handleLikePost(post.id)}
                        className="flex items-center space-x-2 text-dark-400 hover:text-red-400 transition-colors"
                      >
                        <Heart className="w-4 h-4" />
                        <span>{post.likes_count}</span>
                      </button>
                      <button className="flex items-center space-x-2 text-dark-400 hover:text-blue-400 transition-colors">
                        <MessageSquare className="w-4 h-4" />
                        <span>{post.comments_count}</span>
                      </button>
                      <button
                        onClick={() => handleSharePost(post.id)}
                        className="flex items-center space-x-2 text-dark-400 hover:text-green-400 transition-colors"
                      >
                        <Share2 className="w-4 h-4" />
                        <span>{post.shares_count}</span>
                      </button>
                    </div>
                  </div>

                  {/* Menu */}
                  <div className="relative">
                    <button 
                      onClick={() => setShowPostMenu(showPostMenu === post.id ? null : post.id)}
                      className="text-dark-400 hover:text-white transition-colors"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                    
                    {/* Dropdown Menu */}
                    {showPostMenu === post.id && (
                      <div className="absolute right-0 top-8 bg-dark-700 rounded-lg shadow-lg py-2 w-48 z-10">
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="w-full px-4 py-2 text-left text-red-400 hover:bg-dark-600 transition-colors flex items-center space-x-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Deletar Post</span>
                        </button>
                        <button
                          onClick={() => setShowPostMenu(null)}
                          className="w-full px-4 py-2 text-left text-dark-400 hover:bg-dark-600 transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Modal de Criar Post */}
      {showCreateModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowCreateModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-dark-800 rounded-lg p-6 max-w-2xl w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Criar Novo Post</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-dark-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreatePost}>
              <div className="mb-6">
                <textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder="O que você está pensando?"
                  rows={4}
                  className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  required
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  variant="outline"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={!newPost.trim()}
                  className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Publicar
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}

export default TimelinePage
