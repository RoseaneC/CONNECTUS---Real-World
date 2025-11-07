/**
 * Checkpoints - Sistema de checkpoint automático na cena
 */
import { useRef, useEffect, useState } from 'react'
import { useThree } from '@react-three/fiber'
import { Html, Text } from '@react-three/drei'
import { Vector3 } from 'three'

const CHECKPOINTS = [
  { pos: [0, 0, 0], id: 0, label: 'Início' },
  { pos: [20, 0, 15], id: 1, label: 'Checkpoint 1' },
  { pos: [35, 0, 30], id: 2, label: 'Checkpoint 2' },
  { pos: [50, 0, 50], id: 3, label: 'Final' }
]

export default function Checkpoints({ playerRef, onCheckpoint }) {
  const [activeCheckpoint, setActiveCheckpoint] = useState(null)
  const startTime = useRef(Date.now())
  const visited = useRef(new Set())

  const { scene } = useThree()

  useEffect(() => {
    if (!playerRef?.current) return

    const checkProximity = () => {
      const playerPos = playerRef.current.position
      
      for (const cp of CHECKPOINTS) {
        if (visited.current.has(cp.id)) continue

        const dist = playerPos.distanceTo(new Vector3(...cp.pos))
        
        if (dist < 1.5) {
          visited.current.add(cp.id)
          setActiveCheckpoint(cp.id)
          
          // Salvar checkpoint
          localStorage.setItem(
            'connectus.play.checkpoint',
            JSON.stringify({ id: cp.id, pos: cp.pos, time: Date.now() })
          )
          
          console.log(`[Checkpoint] Salvo: ${cp.label}`)
          onCheckpoint?.(cp)
        }
      }
    }

    const interval = setInterval(checkProximity, 200)
    return () => clearInterval(interval)
  }, [playerRef, onCheckpoint])

  // Recuperar checkpoint salvo
  useEffect(() => {
    const saved = localStorage.getItem('connectus.play.checkpoint')
    if (saved && playerRef?.current) {
      const { id, pos } = JSON.parse(saved)
      playerRef.current.position.set(...pos)
      console.log('[Checkpoint] Posição recuperada')
    }
  }, [playerRef])

  return (
    <group>
      {CHECKPOINTS.map((cp) => (
        <group key={cp.id} position={cp.pos}>
          {/* Marcador 3D */}
          <mesh visible={!visited.current.has(cp.id)}>
            <cylinderGeometry args={[0.2, 0.2, 0.05, 8]} />
            <meshStandardMaterial color={visited.current.has(cp.id) ? '#10B981' : '#FCD34D'} />
          </mesh>

          {/* Texto flutuante */}
          {!visited.current.has(cp.id) && (
            <Text
              position={[0, 1, 0]}
              fontSize={0.5}
              color="#FCD34D"
              anchorX="center"
              anchorY="middle"
            >
              {cp.label}
            </Text>
          )}
        </group>
      ))}

      {/* Notificação HUD */}
      {activeCheckpoint !== null && (
        <Html center position={[0, 2, 0]}>
          <div
            style={{
              background: 'rgba(0,0,0,0.8)',
              color: '#10B981',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              border: '2px solid #10B981'
            }}
          >
            Checkpoint salvo!
          </div>
        </Html>
      )}
    </group>
  )
}








