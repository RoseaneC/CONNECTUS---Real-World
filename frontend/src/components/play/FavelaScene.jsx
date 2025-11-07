/**
 * FavelaScene - Carrega o cenário da Favela 3D
 * Fallback para plano simples se GLB não existir
 */
import React from 'react'

export default function FavelaScene(props) {
  // TODO: Carregar GLB quando disponível
  // const { scene } = useGLTF('/scenes/favela.glb')

  return (
      <group>
        {/* Chão da favela */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <planeGeometry args={[200, 200]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>

        {/* Plataforma elevada (becos) */}
        <mesh position={[10, 0.3, 10]} castShadow receiveShadow>
          <boxGeometry args={[8, 0.6, 8]} />
          <meshStandardMaterial color="#2a2a2a" />
        </mesh>
        
        <mesh position={[-10, 0.3, -10]} castShadow receiveShadow>
          <boxGeometry args={[8, 0.6, 8]} />
          <meshStandardMaterial color="#2a2a2a" />
        </mesh>
        
        {/* Casas da favela (placeholder) */}
        {[
          { pos: [20, 1.5, 20], color: '#8b4513' },
          { pos: [-20, 1.5, 20], color: '#5d2f1f' },
          { pos: [15, 1.5, -15], color: '#8b4513' },
          { pos: [-15, 1.5, -15], color: '#5d2f1f' }
        ].map((house, i) => (
          <mesh key={i} position={house.pos} castShadow receiveShadow>
            <boxGeometry args={[4, 3, 4]} />
            <meshStandardMaterial color={house.color} />
          </mesh>
        ))}

        {/* Postes de luz (atmosfera) */}
        {[
          [8, 1, 8],
          [-8, 1, -8],
          [12, 1, -12]
        ].map((post, i) => (
          <group key={i}>
            <mesh position={post} castShadow>
              <cylinderGeometry args={[0.1, 0.1, 3, 16]} />
              <meshStandardMaterial color="#666" />
            </mesh>
            {/* Luz do poste */}
            <pointLight
              position={[post[0], post[1] + 2.5, post[2]]}
              intensity={0.5}
              color="#ffd700"
              distance={10}
              decay={2}
            />
          </group>
        ))}
      </group>
    )
}

// TODO: Quando favela.glb existir, descomentar:
// import { useGLTF } from '@react-three/drei'
// const { scene } = useGLTF('/scenes/favela.glb')
// return <primitive object={scene} {...props} />

