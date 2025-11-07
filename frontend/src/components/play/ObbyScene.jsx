/**
 * ObbyScene - Cena principal do obby com checkpoints, obstáculos e detecção de proximidade
 */
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useCheckpointSystem, distanceXZ } from './CheckpointSystem'
import Obstacles from './Obstacles'

export default function ObbyScene({ playerRef }) {
  const checkpointSystem = useCheckpointSystem()
  const { checkpoints, setCheckpointById, onDeathRespawn, currentId } = checkpointSystem
  const lastCheckedCP = useRef('start')

  useFrame(() => {
    if (!playerRef?.current) return

    const playerPos = playerRef.current.position

    // Detecta proximidade de checkpoints
    checkpoints.forEach(cp => {
      const dist = distanceXZ([playerPos.x, playerPos.y, playerPos.z], cp.position)

      // Se chegou perto (raio 1.5) e ainda não ativou esse checkpoint
      if (dist <= 1.5 && lastCheckedCP.current !== cp.id) {
        console.log(`[OBBY] Detectado próximo de: ${cp.label}`)
        setCheckpointById(cp.id)
        lastCheckedCP.current = cp.id
      }
    })
  })

  return (
    <>
      {/* Iluminação */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[10, 15, 10]}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      {/* Chão grande */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* Markers de checkpoint visuais */}
      {checkpoints.map(cp => {
        const isActivated = currentId === cp.id || 
          checkpoints.findIndex(c => c.id === currentId) > 
          checkpoints.findIndex(c => c.id === cp.id)

        return (
          <group key={cp.id}>
            {/* Pilar */}
            <mesh
              position={[...cp.position, 0]}
              castShadow
              receiveShadow
            >
              <cylinderGeometry args={[0.15, 0.15, 2, 16]} />
              <meshStandardMaterial 
                color={isActivated ? cp.color : '#333'} 
              />
            </mesh>

            {/* Globo flutuante */}
            <mesh
              position={[cp.position[0], cp.position[1] + 1.5, cp.position[2]]}
              castShadow
            >
              <sphereGeometry args={[0.3, 16, 16]} />
              <meshStandardMaterial
                color={isActivated ? cp.color : '#666'}
                emissive={isActivated ? cp.color : '#000'}
                emissiveIntensity={isActivated ? 0.5 : 0}
              />
            </mesh>
          </group>
        )
      })}

      {/* Obstáculos */}
      <Obstacles onLavaTouch={() => onDeathRespawn(playerRef)} />
    </>
  )
}







