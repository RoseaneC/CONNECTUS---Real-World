/**
 * Sistema de Missões - Gerenciamento de quests no /play
 */
export const MISSIONS = {
  DONA_CIDA_FOOD: {
    id: 'dona_cida_food',
    title: 'Entrega de Comida',
    description: 'Ajude a Dona Cida a entregar a comida no beco azul',
    reward: 20,
    objective: { type: 'reach_zone', zone: 'beco_azul' },
    npc: 'Dona Cida',
    status: 'available' // available, in_progress, completed
  }
}

let currentMission = null

export function getCurrentMission() {
  return currentMission
}

export function startMission(missionId) {
  const mission = MISSIONS[missionId]
  if (mission && mission.status === 'available') {
    mission.status = 'in_progress'
    currentMission = mission
    return true
  }
  return false
}

export function completeMission(missionId) {
  const mission = MISSIONS[missionId]
  if (mission && mission.status === 'in_progress') {
    mission.status = 'completed'
    currentMission = null
    return mission.reward
  }
  return 0
}

export function getMissionReward(missionId) {
  return MISSIONS[missionId]?.reward || 0
}








