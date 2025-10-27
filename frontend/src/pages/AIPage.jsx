/**
 * Página de IA Avançada do Connectus
 * Interface completa para chat, estudos, dúvidas e curiosidades
 */

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bot, 
  Send, 
  BookOpen, 
  HelpCircle, 
  Lightbulb, 
  Calculator,
  FileText,
  Star,
  History,
  Settings,
  X,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RefreshCw
} from 'lucide-react'
import { toast } from 'react-hot-toast'

import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import MarkdownMessage from '../components/MarkdownMessage'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const AIPage = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('chat')
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [conversationHistory, setConversationHistory] = useState([])
  const [favorites, setFavorites] = useState([])
  const [showHistory, setShowHistory] = useState(false)
  const [showFavorites, setShowFavorites] = useState(false)
  const [aiStats, setAiStats] = useState(null)
  
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Categorias de IA
  const categories = {
    chat: { name: 'Chat', icon: Bot, color: 'bg-blue-500/20', textColor: 'text-blue-400' },
    estudos: { name: 'Estudos', icon: BookOpen, color: 'bg-green-500/20', textColor: 'text-green-400' },
    duvidas: { name: 'Dúvidas', icon: HelpCircle, color: 'bg-yellow-500/20', textColor: 'text-yellow-400' },
    curiosidades: { name: 'Curiosidades', icon: Lightbulb, color: 'bg-purple-500/20', textColor: 'text-purple-400' },
    exercicios: { name: 'Exercícios', icon: Calculator, color: 'bg-red-500/20', textColor: 'text-red-400' },
    resumos: { name: 'Resumos', icon: FileText, color: 'bg-indigo-500/20', textColor: 'text-indigo-400' }
  }

  // Carregar dados iniciais
  useEffect(() => {
    loadConversationHistory()
    loadFavorites()
    loadAIStats()
  }, [])

  // Auto-scroll para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const loadConversationHistory = async () => {
    try {
      const response = await api.get('/ai/history?limit=50')
      setConversationHistory(response.data.conversations || [])
    } catch (error) {
      const status = error?.response?.status
      if (status === 404) {
        // endpoint não existe no backend atual — ignore silenciosamente
        setConversationHistory([])
        return
      }
      console.error('Erro ao carregar histórico:', error)
    }
  }

  const loadFavorites = async () => {
    try {
      const response = await api.get('/ai/favorites')
      setFavorites(response.data.favorites || [])
    } catch (error) {
      const status = error?.response?.status
      if (status === 404) {
        // endpoint não existe no backend atual — ignore silenciosamente
        setFavorites([])
        return
      }
      console.error('Erro ao carregar favoritos:', error)
    }
  }

  const loadAIStats = async () => {
    try {
      const response = await api.get('/ai/stats')
      setAiStats(response.data)
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    }
  }

  const sendMessage = async (message, category = null) => {
    if (!message.trim() || isLoading) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: message,
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await api.post('/ai/chat-public', {
        message: message,
        category: category || activeTab
      })

      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: response.data.reply,
        category: response.data.category || activeTab,
        suggestions: response.data.suggestions || [],
        timestamp: new Date().toISOString()
      }

      setMessages(prev => [...prev, aiMessage])
      
      // Recarregar histórico
      loadConversationHistory()
      
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      
      // Tratamento específico para erro 503 da VEXA
      if (error.response?.status === 503) {
        toast.error('VEXA indisponível no momento. Verifique a configuração da IA no servidor.')
      } else {
        toast.error('Erro ao enviar mensagem para IA')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    sendMessage(inputMessage)
  }

  const handleSuggestionClick = (suggestion) => {
    setInputMessage(suggestion)
    inputRef.current?.focus()
  }

  const addToFavorites = async (conversationId) => {
    try {
      await api.post(`/ai/favorites/${conversationId}`)
      toast.success('Adicionado aos favoritos!')
      loadFavorites()
    } catch (error) {
      console.error('Erro ao adicionar favorito:', error)
      toast.error('Erro ao adicionar favorito')
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    toast.success('Copiado para a área de transferência!')
  }

  const clearChat = () => {
    setMessages([])
    toast.success('Chat limpo!')
  }

  const quickActions = {
    estudos: [
      "Explicar fotossíntese",
      "Como funciona a mitose?",
      "Resumir a Revolução Francesa",
      "Criar mapa mental sobre ecologia"
    ],
    duvidas: [
      "Não entendi sobre derivadas",
      "Por que o céu é azul?",
      "Como funciona a internet?",
      "Explicar de outra forma"
    ],
    curiosidades: [
      "Curiosidade sobre o espaço",
      "Fato interessante sobre animais",
      "Descoberta científica recente",
      "Por que sonhamos?"
    ],
    exercicios: [
      "Resolver equação de 2º grau",
      "Calcular área do triângulo",
      "Problema de física",
      "Exercício de química"
    ],
    resumos: [
      "Resumir este texto",
      "Pontos principais do capítulo",
      "Síntese do artigo",
      "Criar resumo estruturado"
    ]
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto h-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">VEXA IA</h1>
                <p className="text-dark-400 text-xs sm:text-sm md:text-base">Seu assistente educacional inteligente</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-1 sm:space-x-2 flex-wrap">
              <Button
                variant="ghost"
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm"
              >
                <History className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Histórico</span>
              </Button>
              
              <Button
                variant="ghost"
                onClick={() => setShowFavorites(!showFavorites)}
                className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm"
              >
                <Star className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Favoritos</span>
              </Button>
              
              <Button
                variant="ghost"
                onClick={clearChat}
                className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm"
              >
                <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Limpar</span>
              </Button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1 space-y-4 order-2 lg:order-1"
          >
            {/* Categorias */}
            <Card variant="cyber" className="p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Categorias</h3>
              <div className="space-y-2">
                {Object.entries(categories).map(([key, category]) => {
                  const Icon = category.icon
                  return (
                    <button
                      key={key}
                      onClick={() => setActiveTab(key)}
                      className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all ${
                        activeTab === key
                          ? `${category.color} ${category.textColor}`
                          : 'hover:bg-dark-700/50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{category.name}</span>
                    </button>
                  )
                })}
              </div>
            </Card>

            {/* Ações Rápidas */}
            <Card variant="cyber" className="p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Ações Rápidas</h3>
              <div className="space-y-2">
                {quickActions[activeTab]?.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(action)}
                    className="w-full text-left p-2 text-sm text-dark-300 hover:text-white hover:bg-dark-700/50 rounded transition-all"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </Card>

            {/* Estatísticas */}
            {aiStats && (
              <Card variant="cyber" className="p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Suas Estatísticas</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-dark-400">Conversas:</span>
                    <span className="text-white font-semibold">{aiStats.total_conversations}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dark-400">Favoritos:</span>
                    <span className="text-white font-semibold">{aiStats.total_favorites}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dark-400">Esta semana:</span>
                    <span className="text-white font-semibold">{aiStats.recent_conversations}</span>
                  </div>
                </div>
              </Card>
            )}
          </motion.div>

          {/* Chat Principal */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3 order-1 lg:order-2"
          >
            <Card variant="cyber" className="h-full flex flex-col">
              {/* Header do Chat */}
              <div className="flex items-center justify-between p-4 border-b border-dark-600">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${categories[activeTab].color}`}>
                    {React.createElement(categories[activeTab].icon, { 
                      className: `w-5 h-5 ${categories[activeTab].textColor}` 
                    })}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{categories[activeTab].name}</h3>
                    <p className="text-sm text-dark-400">
                      {activeTab === 'chat' ? 'Conversa geral com IA' : 
                       activeTab === 'estudos' ? 'Assistente de estudos' :
                       activeTab === 'duvidas' ? 'Central de dúvidas' :
                       activeTab === 'curiosidades' ? 'Explorador de curiosidades' :
                       activeTab === 'exercicios' ? 'Resolvedor de exercícios' :
                       'Criador de resumos'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Mensagens */}
              <div className="flex-1 overflow-y-auto px-3 space-y-3">
                {messages.length === 0 && (
                  <div className="text-center py-8">
                    <Bot className="w-16 h-16 text-dark-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Olá! Como posso ajudar?
                    </h3>
                    <p className="text-dark-400">
                      Faça uma pergunta ou escolha uma ação rápida para começar
                    </p>
                  </div>
                )}

                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[800px] w-fit ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                      <div className={`rounded-2xl px-4 py-3 ${
                        message.type === 'user'
                          ? 'bg-sky-600 text-white'
                          : 'bg-slate-700 text-slate-100'
                      }`}>
                        {message.type === 'ai' ? (
                          <MarkdownMessage text={message.content} />
                        ) : (
                          <div className="whitespace-pre-wrap">{message.content}</div>
                        )}
                        
                        {message.type === 'ai' && message.suggestions && (
                          <div className="mt-3 space-y-2">
                            <p className="text-sm opacity-75">Sugestões:</p>
                            <div className="flex flex-wrap gap-2">
                              {message.suggestions.map((suggestion, index) => (
                                <button
                                  key={index}
                                  onClick={() => handleSuggestionClick(suggestion)}
                                  className="px-3 py-1 bg-white/20 rounded-full text-xs hover:bg-white/30 transition-colors"
                                >
                                  {suggestion}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {message.type === 'ai' && (
                        <div className="flex items-center space-x-2 mt-2">
                          <button
                            onClick={() => copyToClipboard(message.content)}
                            className="p-1 text-dark-400 hover:text-white transition-colors"
                            title="Copiar"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => addToFavorites(message.id)}
                            className="p-1 text-dark-400 hover:text-yellow-400 transition-colors"
                            title="Favoritar"
                          >
                            <Star className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}

                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-slate-700 p-4 rounded-2xl">
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-400"></div>
                        <span className="text-slate-300">VEXA está digitando...</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="mt-3 flex gap-2 px-3 border-t border-dark-600 pt-3">
                <form onSubmit={handleSubmit} className="flex gap-2 w-full">
                  <Input
                    ref={inputRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder={`Digite sua ${categories[activeTab].name.toLowerCase()}...`}
                    className="flex-1 text-sm sm:text-base"
                    disabled={isLoading}
                  />
                  <Button
                    type="submit"
                    disabled={!inputMessage.trim() || isLoading}
                    className="px-3 sm:px-6"
                  >
                    <Send className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </form>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default AIPage
