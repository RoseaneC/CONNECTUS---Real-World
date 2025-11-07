// Hooks que funcionam com dados mockados (sem backend)
import { useState, useEffect } from 'react'
import mockData from '../data/mockData'

export const useMockPosts = () => {
  const [timeline, setTimeline] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchTimeline = async (limit = 20, offset = 0) => {
    try {
      setLoading(true)
      setError(null)
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 500))
      const data = mockData.posts.slice(offset, offset + limit)
      setTimeline(data)
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const createPost = async (postData) => {
    try {
      setLoading(true)
      setError(null)
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const newPost = {
        id: Date.now(),
        content: postData.content,
        image_url: postData.image_url || null,
        author_id: mockData.user.id,
        author_nickname: mockData.user.nickname,
        author_avatar: mockData.user.nickname.charAt(0).toUpperCase(),
        likes_count: 0,
        comments_count: 0,
        is_liked: false,
        created_at: new Date().toISOString()
      }
      
      setTimeline(prev => [newPost, ...prev])
      return newPost
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const likePost = async (postId) => {
    try {
      setLoading(true)
      setError(null)
      await new Promise(resolve => setTimeout(resolve, 300))
      
      setTimeline(prev => prev.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              is_liked: !post.is_liked,
              likes_count: post.is_liked ? post.likes_count - 1 : post.likes_count + 1
            }
          : post
      ))
      
      return { success: true }
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const sharePost = async (postId) => {
    try {
      setLoading(true)
      setError(null)
      await new Promise(resolve => setTimeout(resolve, 300))
      return { success: true }
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deletePost = async (postId) => {
    try {
      setLoading(true)
      setError(null)
      await new Promise(resolve => setTimeout(resolve, 300))
      setTimeline(prev => prev.filter(post => post.id !== postId))
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const searchPosts = async (query, limit = 20, offset = 0) => {
    try {
      setLoading(true)
      setError(null)
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const filtered = mockData.posts.filter(post => 
        post.content.toLowerCase().includes(query.toLowerCase())
      )
      
      return filtered.slice(offset, offset + limit)
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    timeline,
    loading,
    error,
    fetchTimeline,
    createPost,
    likePost,
    sharePost,
    deletePost,
    searchPosts
  }
}

export const useMockMissions = () => {
  const [missions, setMissions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchMissions = async () => {
    try {
      setLoading(true)
      setError(null)
      await new Promise(resolve => setTimeout(resolve, 500))
      setMissions(mockData.missions)
      return mockData.missions
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const completeMission = async (missionId) => {
    try {
      setLoading(true)
      setError(null)
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setMissions(prev => prev.map(mission => 
        mission.id === missionId 
          ? { ...mission, is_completed: true, progress: 100 }
          : mission
      ))
      
      return { success: true, message: "Missão completada!" }
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    missions,
    loading,
    error,
    fetchMissions,
    completeMission
  }
}

export const useMockRanking = () => {
  const [ranking, setRanking] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchRanking = async () => {
    try {
      setLoading(true)
      setError(null)
      await new Promise(resolve => setTimeout(resolve, 500))
      setRanking(mockData.ranking)
      return mockData.ranking
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    ranking,
    loading,
    error,
    fetchRanking
  }
}

export const useMockChat = () => {
  const [rooms, setRooms] = useState([])
  const [messages, setMessages] = useState([])
  const [currentRoom, setCurrentRoom] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchRooms = async () => {
    try {
      setLoading(true)
      setError(null)
      await new Promise(resolve => setTimeout(resolve, 500))
      setRooms(mockData.chatRooms)
      return mockData.chatRooms
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (roomId) => {
    try {
      setLoading(true)
      setError(null)
      await new Promise(resolve => setTimeout(resolve, 500))
      const roomMessages = mockData.chatMessages.filter(msg => msg.room_id === roomId)
      setMessages(roomMessages)
      setCurrentRoom(roomId)
      return roomMessages
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async (roomId, content) => {
    try {
      setLoading(true)
      setError(null)
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const newMessage = {
        id: Date.now(),
        content,
        user_id: mockData.user.id,
        user_nickname: mockData.user.nickname,
        user_avatar: mockData.user.nickname.charAt(0).toUpperCase(),
        user_level: mockData.user.level,
        room_id: roomId,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        is_own: true
      }
      
      setMessages(prev => [...prev, newMessage])
      return newMessage
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    rooms,
    messages,
    currentRoom,
    loading,
    error,
    fetchRooms,
    fetchMessages,
    sendMessage
  }
}

export const useMockNotifications = () => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      setError(null)
      await new Promise(resolve => setTimeout(resolve, 500))
      setNotifications(mockData.notifications)
      return mockData.notifications
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      setLoading(true)
      setError(null)
      await new Promise(resolve => setTimeout(resolve, 300))
      
      setNotifications(prev => prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read: true }
          : notif
      ))
      
      return { success: true }
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    notifications,
    loading,
    error,
    fetchNotifications,
    markAsRead
  }
}













