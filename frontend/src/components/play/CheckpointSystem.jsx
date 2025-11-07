/**
 * CheckpointSystem - Sistema de checkpoints, respawn e timer para o obby
 */
import { useState, useEffect, useRef } from 'react'
import { rewardVexa } from './services/obbyRewards'

// Definição dos checkpoints
export const OBBY_CHECKPOINTS = [
  { id: 'start', label: 'Start', position: [0, 0.5, 0], color: '#10B981' },
  { id: 'cp1', label: 'Checkpoint 1', position: [8, 0.5, 0], color: '#3B82F6' },
  { id: 'cp2', label: 'Checkpoint 2', position: [16, 0.5, 0], color: '#8B5CF6' },
  { id: 'goal', label: 'Goal', position: [24, 0.5, 0], color: '#F59E0B' }
]

/**
 * Hook para gerenciar o sistema de checkpoints
 */
export function useCheckpointSystem() {
  const [currentId, setCurrentId] = useState('start')
  const [spawnPos, setSpawnPos] = useState([0, 0, 0])
  const [runStartTime, setRunStartTime] = useState(Date.now())
  const [runElapsed, setRunElapsed] = useState(0)
  const [bestTime, setBestTime] = useState(() => {
    const saved = localStorage.getItem('connectus.obby.bestTime')
    return saved ? parseInt(saved, 10) : null
  })
  const timerIntervalRef = useRef(null)

  // Inicializa spawn no start
  useEffect(() => {
    const startCP = OBBY_CHECKPOINTS.find(cp => cp.id === 'start')
    if (startCP) {
      setSpawnPos(startCP.position)
    }
  }, [])

  // Timer em tempo real
  useEffect(() => {
    timerIntervalRef.current = setInterval(() => {
      setRunElapsed(Date.now() - runStartTime)
    }, 100)

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }
    }
  }, [runStartTime])

  // Função para definir checkpoint atual
  const setCheckpointById = (checkpointId) => {
    const cp = OBBY_CHECKPOINTS.find(c => c.id === checkpointId)
    if (!cp) return

    // Atualiza checkpoint
    setCurrentId(checkpointId)
    setSpawnPos(cp.position)
    console.log(`[OBBY] Checkpoint alcançado: ${cp.label}`)

    // Recompensa (exceto no start)
    if (checkpointId !== 'start') {
      rewardVexa(5)
    }

    // Se chegou no goal
    if (checkpointId === 'goal') {
      finishRun()
    }
  }

  // Finaliza o run e atualiza best time
  const finishRun = () => {
    const elapsed = Date.now() - runStartTime
    console.log(`[OBBY] 🏁 Run concluído em ${formatTime(elapsed)}`)

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
    }

    // Atualiza best time se melhor
    if (!bestTime || elapsed < bestTime) {
      setBestTime(elapsed)
      localStorage.setItem('connectus.obby.bestTime', elapsed.toString())
      console.log(`[OBBY] 🎉 Novo recorde: ${formatTime(elapsed)}`)
    }
  }

  // Respawn ao morrer
  const onDeathRespawn = (playerRef) => {
    if (!playerRef || !playerRef.current) return
    
    console.log('[OBBY] 💀 Respawnando...')
    playerRef.current.position.set(...spawnPos)
    
    // Reseta timer do run
    setRunStartTime(Date.now())
    setRunElapsed(0)
  }

  // Formata tempo (mm:ss)
  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const timer = formatTime(runElapsed)
  const bestTimeFormatted = bestTime ? formatTime(bestTime) : '--:--'

  // Índice do checkpoint atual
  const currentIndex = OBBY_CHECKPOINTS.findIndex(cp => cp.id === currentId)
  const checkpointLabel = `${currentIndex + 1}/${OBBY_CHECKPOINTS.length}`

  return {
    checkpoints: OBBY_CHECKPOINTS,
    currentId,
    spawnPos,
    setCheckpointById,
    onDeathRespawn,
    timer,
    bestTime: bestTimeFormatted,
    checkpointLabel,
    isFinished: currentId === 'goal'
  }
}

/**
 * Helper para calcular distância no plano XZ
 */
export function distanceXZ(pos1, pos2) {
  const dx = pos1[0] - pos2[0]
  const dz = pos1[2] - pos2[2]
  return Math.sqrt(dx * dx + dz * dz)
}







