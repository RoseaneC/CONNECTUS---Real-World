/**
 * Obby Rewards - Sistema de recompensas VEXA para checkpoints
 */
import api from '../../../services/api'

/**
 * Recompensa o jogador com VEXA coins
 * @param {number} amount - Quantidade de VEXA a recompensar
 */
export async function rewardVexa(amount = 5) {
  try {
    await api.post('/wallet/demo/mint', { amount })
    console.log(`[OBBY] ✅ +${amount} VEXA coins`)
  } catch (error) {
    console.warn('[OBBY] ⚠️ reward failed:', error?.response?.data || error.message)
  }
}







