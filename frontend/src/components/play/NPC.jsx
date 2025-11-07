/**
 * NPC - NPCs interativos na cena (ex: Dona Cida)
 */
import React, { useState } from 'react'
import { Html } from '@react-three/drei'
import { useKeyboard } from './controllers/useKeyboard'
import { startMission, getCurrentMission } from '../../game/missionSystem'

const NPC_DATA = {
  dona_cida: {
    position: [5, 0, 5],
    name: 'Dona Cida',
    mission: 'dona_cida_food',
    dialog: 'Ói! Precisa de trabalho? Quer ganhar um trocadinho?'
  }
}

export default function NPC() {
  const [showDialog, setShowDialog] = useState(false)
  const [playerNear, setPlayerNear] = useState(false)
  const keys = useKeyboard()

  // Verificar se jogador está perto do NPC
  React.useEffect(() => {
    const checkDistance = () => {
      // Lógica simplificada: NPC na posição fixa
      // Em produção, checar distância real do player
      setPlayerNear(true) // placeholder
    }
    const interval = setInterval(checkDistance, 500)
    return () => clearInterval(interval)
  }, [])

  // Interagir com E
  React.useEffect(() => {
    if (keys.current.space && playerNear && !showDialog) {
      setShowDialog(true)
      startMission('DONA_CIDA_FOOD')
    }
  }, [keys.current.space, playerNear, showDialog])

  const mission = getCurrentMission()

  return (
    <group position={NPC_DATA.dona_cida.position}>
      {/* NPC placeholder (cubo pequeno) */}
      <mesh castShadow>
        <boxGeometry args={[0.5, 1, 0.5]} />
        <meshStandardMaterial color="#ff6b9d" />
      </mesh>

      {/* Balão de fala quando perto */}
      {playerNear && !showDialog && (
        <Html center position={[0, 2, 0]}>
          <div
            style={{
              background: 'rgba(0,0,0,0.8)',
              color: 'white',
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '14px',
              whiteSpace: 'nowrap',
              border: '2px solid #ff6b9d'
            }}
          >
            E - Conversar
          </div>
        </Html>
      )}

      {/* Dialog quando aberto */}
      {showDialog && (
        <Html center position={[0, 2.5, 0]}>
          <div
            style={{
              background: 'rgba(0,0,0,0.9)',
              color: 'white',
              padding: '12px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              maxWidth: '300px',
              border: '2px solid #ff6b9d'
            }}
          >
            <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
              {NPC_DATA.dona_cida.name}
            </div>
            <div style={{ marginBottom: '8px' }}>{NPC_DATA.dona_cida.dialog}</div>
            {mission && (
              <div style={{ color: '#4ade80', fontSize: '12px' }}>
                Missão: {mission.title} ({mission.reward} VEXA)
              </div>
            )}
            <button
              onClick={() => setShowDialog(false)}
              style={{
                marginTop: '8px',
                padding: '6px 12px',
                background: '#4ade80',
                border: 'none',
                borderRadius: '4px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Fechar
            </button>
          </div>
        </Html>
      )}
    </group>
  )
}








