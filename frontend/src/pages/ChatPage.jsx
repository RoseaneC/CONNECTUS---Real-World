import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageSquare, 
  Send, 
  Users, 
  Search,
  User,
  Clock,
  MoreVertical
} from 'lucide-react'
import { toast } from 'react-hot-toast'

import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import api from '../services/api'

const ChatPage = () => {
  const [rooms, setRooms] = useState([])
  const [currentRoom, setCurrentRoom] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredRooms, setFilteredRooms] = useState([])
  
  const messagesEndRef = useRef(null)

  // Carregar salas de chat
  const fetchRooms = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get('/chat/rooms')
      setRooms(response.data)
      setFilteredRooms(response.data)
      console.log('✅ Salas de chat carregadas:', response.data)
    } catch (error) {
      console.error('❌ Erro ao carregar salas:', error)
      setError('Erro ao carregar salas de chat')
      toast.error('Erro ao carregar salas de chat')
    } finally {
      setLoading(false)
    }
  }

  // Carregar mensagens de uma sala
  const fetchMessages = async (roomId) => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get(`/chat/rooms/${roomId}/messages`)
      setMessages(response.data)
      console.log('✅ Mensagens carregadas:', response.data)
    } catch (error) {
      console.error('❌ Erro ao carregar mensagens:', error)
      setError('Erro ao carregar mensagens')
      toast.error('Erro ao carregar mensagens')
    } finally {
      setLoading(false)
    }
  }

  // Enviar mensagem
  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !currentRoom) return

    try {
      const response = await api.post(`/chat/rooms/${currentRoom.id}/messages`, {
        content: newMessage.trim()
      })
      
      setMessages(prev => [...prev, response.data])
      setNewMessage('')
      toast.success('Mensagem enviada!')
      console.log('✅ Mensagem enviada:', response.data)
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error)
      toast.error('Erro ao enviar mensagem')
    }
  }

  // Selecionar sala
  const handleSelectRoom = (room) => {
    setCurrentRoom(room)
    fetchMessages(room.id)
  }

  // Buscar salas
  const handleSearch = (query) => {
    setSearchQuery(query)
    if (!query.trim()) {
      setFilteredRooms(rooms)
    } else {
      const filtered = rooms.filter(room =>
        room.name.toLowerCase().includes(query.toLowerCase()) ||
        room.description?.toLowerCase().includes(query.toLowerCase())
      )
      setFilteredRooms(filtered)
    }
  }

  // Auto-scroll para última mensagem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Carregar salas ao montar o componente
  useEffect(() => {
    fetchRooms()
  }, [])

  const getAvatarUrl = (avatarId) => {
    return `/static/avatars/${avatarId || 'avatar_1'}.png`
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
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
    <div className="flex h-full bg-dark-900 rounded-lg shadow-lg overflow-hidden">
      {/* Sidebar de Salas */}
      <motion.div
        initial={{ x: -200 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3 }}
        className="w-80 bg-dark-800 border-r border-dark-700 flex flex-col"
      >
        {/* Header */}
        <div className="p-4 border-b border-dark-700">
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <MessageSquare className="w-6 h-6 text-primary-400" />
            <span>Chat</span>
          </h2>
        </div>

        {/* Busca */}
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Buscar salas..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Lista de Salas */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center">
              <div className="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-dark-400 text-sm">Carregando salas...</p>
            </div>
          ) : error ? (
            <div className="p-4 text-center">
              <p className="text-red-400 text-sm mb-2">{error}</p>
              <Button onClick={fetchRooms} variant="outline" size="sm">
                Tentar Novamente
              </Button>
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="p-4 text-center">
              <MessageSquare className="w-8 h-8 text-dark-400 mx-auto mb-2" />
              <p className="text-dark-400 text-sm">
                {searchQuery ? 'Nenhuma sala encontrada' : 'Nenhuma sala disponível'}
              </p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {filteredRooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => handleSelectRoom(room)}
                  className={`w-full p-3 rounded-lg text-left transition-colors ${
                    currentRoom?.id === room.id
                      ? 'bg-primary-600 text-white'
                      : 'hover:bg-dark-700 text-dark-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-500/20 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{room.name}</h3>
                      <p className="text-xs opacity-75 truncate">
                        {room.description || 'Sala de chat'}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Users className="w-3 h-3" />
                        <span className="text-xs">{room.members_count} membros</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Área de Chat Principal */}
      <div className="flex-1 flex flex-col">
        {currentRoom ? (
          <>
            {/* Header da Sala */}
            <div className="p-4 border-b border-dark-700 bg-dark-800">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">{currentRoom.name}</h3>
                  <p className="text-sm text-dark-400">
                    {currentRoom.description || 'Sala de chat'}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-dark-400" />
                  <span className="text-sm text-dark-400">{currentRoom.members_count} membros</span>
                </div>
              </div>
            </div>

            {/* Mensagens */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {loading ? (
                <div className="text-center">
                  <div className="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p className="text-dark-400 text-sm">Carregando mensagens...</p>
                </div>
              ) : error ? (
                <div className="text-center">
                  <p className="text-red-400 text-sm mb-2">{error}</p>
                  <Button onClick={() => fetchMessages(currentRoom.id)} variant="outline" size="sm">
                    Tentar Novamente
                  </Button>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center">
                  <MessageSquare className="w-12 h-12 text-dark-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Nenhuma mensagem ainda</h3>
                  <p className="text-dark-400">Seja o primeiro a enviar uma mensagem!</p>
                </div>
              ) : (
                messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-start space-x-3"
                  >
                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-dark-600 flex-shrink-0">
                      <img
                        src={getAvatarUrl(message.user?.avatar)}
                        alt={message.user?.nickname}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = '/static/avatars/avatar_1.png'
                        }}
                      />
                    </div>

                    {/* Conteúdo da Mensagem */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-semibold text-white text-sm">
                          {message.user?.full_name || message.user?.nickname}
                        </h4>
                        <span className="text-dark-400 text-xs">•</span>
                        <div className="flex items-center space-x-1 text-dark-400 text-xs">
                          <Clock className="w-3 h-3" />
                          <span>{formatTime(message.created_at)}</span>
                        </div>
                      </div>
                      <p className="text-dark-300 text-sm whitespace-pre-wrap">
                        {message.content}
                      </p>
                    </div>
                  </motion.div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input de Mensagem */}
            <div className="p-4 border-t border-dark-700 bg-dark-800">
              <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
                <Input
                  type="text"
                  placeholder="Digite sua mensagem..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1"
                  required
                />
                <Button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          /* Estado Vazio */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 text-dark-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Selecione uma sala</h3>
              <p className="text-dark-400">Escolha uma sala de chat para começar a conversar</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatPage





