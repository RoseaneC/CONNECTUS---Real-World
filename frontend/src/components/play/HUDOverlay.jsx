/**
 * HUDOverlay - HUD (Head-Up Display) sobreposto na cena 3D
 * Exibe saldo, XP, timer do obby e checkpoints
 */
import { useState, useEffect } from 'react'
import api from '../../services/api'
import { useCheckpointSystem } from './CheckpointSystem'

const HUDOverlay = () => {
  const [balance, setBalance] = useState(0)
  const [xp, setXp] = useState(0)
  const [loading, setLoading] = useState(true)
  const checkpointSystem = useCheckpointSystem()
  const { timer, checkpointLabel, bestTime } = checkpointSystem

  useEffect(() => {
    fetchWalletStatus()
    const interval = setInterval(fetchWalletStatus, 5000) // Atualizar a cada 5s
    return () => clearInterval(interval)
  }, [])

  const fetchWalletStatus = async () => {
    try {
      const { data } = await api.get('/wallet/demo/status')
      setBalance(data.balance || 0)
      setLoading(false)
    } catch (error) {
      // Backend offline - não spamear erro no console, apenas mostrar --
      console.debug('[ConnectUS Play] Backend offline ou /wallet/demo indisponível')
      setBalance(0)
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        background: 'rgba(0, 0, 0, 0.8)',
        border: '2px solid #4F46E5',
        borderRadius: '12px',
        padding: '20px',
        zIndex: 1000,
        color: '#fff',
        fontFamily: 'system-ui, -apple-system'
      }}
    >
      {/* Logo/Header */}
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ margin: 0, color: '#4F46E5' }}>ConnectUS Play</h3>
        <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>Modo Singleplayer Demo</p>
      </div>

      {/* Saldo */}
      <div style={{ marginBottom: '12px' }}>
        <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>Saldo VEXA</p>
        <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#10B981' }}>
          {loading || balance === undefined ? '---' : `${balance.toFixed(2)} ₿`}
        </p>
      </div>

      {/* XP */}
      <div style={{ marginBottom: '12px' }}>
        <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>XP Total</p>
        <p style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#F59E0B' }}>
          {xp.toLocaleString()}
        </p>
      </div>

      {/* Timer Obby */}
      <div style={{ marginBottom: '12px' }}>
        <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>Timer</p>
        <p style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#3B82F6' }}>
          {timer}
        </p>
        <p style={{ margin: 0, fontSize: '10px', color: '#666' }}>
          Best: {bestTime}
        </p>
      </div>

      {/* Checkpoint */}
      <div style={{ marginBottom: '12px' }}>
        <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>Checkpoint</p>
        <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#8B5CF6' }}>
          CP {checkpointLabel}
        </p>
      </div>

      {/* Barra de progresso XP (mock) */}
      <div
        style={{
          width: '200px',
          height: '8px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '4px',
          overflow: 'hidden',
          marginTop: '8px'
        }}
      >
        <div
          style={{
            width: '60%',
            height: '100%',
            background: '#F59E0B',
            transition: 'width 0.3s'
          }}
        />
      </div>

      {/* Separador */}
      <hr style={{ border: 'none', borderTop: '1px solid #333', margin: '16px 0' }} />

      {/* Controles */}
      <div style={{ fontSize: '11px', color: '#999' }}>
        <p style={{ margin: '4px 0' }}>🅆  Move Forward</p>
        <p style={{ margin: '4px 0' }}>◄ ▲ ►  Camera</p>
        <p style={{ margin: '4px 0' }}>🖱️  Interagir</p>
      </div>
    </div>
  )
}

export default HUDOverlay

