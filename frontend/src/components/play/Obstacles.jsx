/**
 * Obstacles - Obstáculos do obby: plataformas fixas, móveis e área de lava
 */
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

export default function Obstacles({ onLavaTouch }) {
  const movingPlatformRef = useRef()
  const lavaAreaRef = useRef()

  useFrame((state) => {
    if (movingPlatformRef.current) {
      // Plataforma móvel com movimento senoidal
      const time = state.clock.elapsedTime
      movingPlatformRef.current.position.x = Math.sin(time * 0.8) * 3
    }
  })

  return (
    <group>
      {/* Plataformas fixas */}
      {[
        [4, 0.5, 0],
        [12, 0.5, 0],
        [20, 0.5, 0]
      ].map((pos, i) => (
        <mesh key={`fixed-${i}`} position={pos} castShadow receiveShadow>
          <boxGeometry args={[3, 1, 1]} />
          <meshStandardMaterial color="#4F46E5" />
        </mesh>
      ))}

      {/* Plataforma móvel */}
      <mesh
        ref={movingPlatformRef}
        position={[14, 1, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[3, 1, 1]} />
        <meshStandardMaterial color="#FCD34D" />
      </mesh>

      {/* Área de lava (reset ao tocar) */}
      <mesh
        ref={lavaAreaRef}
        position={[0, -0.1, 0]}
        receiveShadow
        onClick={() => onLavaTouch && onLavaTouch()}
      >
        <boxGeometry args={[30, 0.2, 30]} />
        <meshStandardMaterial 
          color="#DC2626"
          emissive="#991B1B"
          emissiveIntensity={0.5}
        />
      </mesh>
    </group>
  )
}

