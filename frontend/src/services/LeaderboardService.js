/**
 * LeaderboardService - Gerencia leaderboards locais e remotos
 */
import api from './api'

const LOCAL_KEY = 'connectus.play.leaderboard'

export default {
  async submit({ username, timeMs, missionId = 'main' }) {
    try {
      // Tentar backend primeiro
      const response = await api.post('/play/leaderboard', { username, timeMs, missionId })
      return response.data
    } catch (error) {
      console.warn('[Leaderboard] Backend offline, usando local storage')
    }

    // Fallback para localStorage
    const entries = this.getLocal()
    entries.push({ username, timeMs, missionId, date: Date.now() })
    entries.sort((a, b) => a.timeMs - b.timeMs)
    const top = entries.slice(0, 10)
    localStorage.setItem(LOCAL_KEY, JSON.stringify(top))
    return { success: true, local: true }
  },

  async getTop(n = 10) {
    try {
      const response = await api.get(`/play/leaderboard?limit=${n}`)
      return response.data
    } catch (error) {
      console.warn('[Leaderboard] Backend offline, usando local')
    }

    // Fallback
    const entries = this.getLocal()
    return {
      local: true,
      entries: entries.slice(0, n)
    }
  },

  getLocal() {
    try {
      const data = localStorage.getItem(LOCAL_KEY)
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  },

  clearLocal() {
    localStorage.removeItem(LOCAL_KEY)
  }
}








