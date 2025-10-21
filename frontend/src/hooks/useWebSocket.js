import { useState, useEffect, useRef, useCallback } from 'react'
import toast from 'react-hot-toast'

const useWebSocket = (roomId, token) => {
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [messages, setMessages] = useState([])
  const [error, setError] = useState(null)
  const reconnectTimeoutRef = useRef(null)
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 5

  const connect = useCallback(() => {
    if (!roomId || !token) return

    try {
      const wsUrl = `ws://localhost:8000/ws/chat/${roomId}?token=${token}`
      const newSocket = new WebSocket(wsUrl)

      newSocket.onopen = () => {
        console.log('✅ WebSocket conectado')
        setIsConnected(true)
        setError(null)
        reconnectAttempts.current = 0
        toast.success('Chat conectado!')
      }

      newSocket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          setMessages(prev => [...prev, message])
        } catch (err) {
          console.error('Erro ao processar mensagem:', err)
        }
      }

      newSocket.onclose = (event) => {
        console.log('❌ WebSocket desconectado:', event.code, event.reason)
        setIsConnected(false)
        setSocket(null)

        // Tentar reconectar se não foi fechado intencionalmente
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000)
          console.log(`🔄 Tentando reconectar em ${delay}ms...`)
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++
            connect()
          }, delay)
        } else if (reconnectAttempts.current >= maxReconnectAttempts) {
          toast.error('Não foi possível reconectar ao chat')
          setError('Falha na conexão')
        }
      }

      newSocket.onerror = (error) => {
        console.error('❌ Erro no WebSocket:', error)
        setError('Erro de conexão')
        toast.error('Erro no chat')
      }

      setSocket(newSocket)
    } catch (err) {
      console.error('Erro ao criar WebSocket:', err)
      setError('Erro ao conectar')
    }
  }, [roomId, token])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    
    if (socket) {
      socket.close(1000, 'Desconectado pelo usuário')
      setSocket(null)
    }
    setIsConnected(false)
  }, [socket])

  const sendMessage = useCallback((content) => {
    if (socket && isConnected) {
      try {
        socket.send(JSON.stringify({ content }))
        return true
      } catch (err) {
        console.error('Erro ao enviar mensagem:', err)
        toast.error('Erro ao enviar mensagem')
        return false
      }
    }
    return false
  }, [socket, isConnected])

  // Conectar quando roomId ou token mudarem
  useEffect(() => {
    if (roomId && token) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [roomId, token, connect, disconnect])

  // Limpar timeout ao desmontar
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
  }, [])

  return {
    socket,
    isConnected,
    messages,
    error,
    sendMessage,
    connect,
    disconnect
  }
}

export default useWebSocket




