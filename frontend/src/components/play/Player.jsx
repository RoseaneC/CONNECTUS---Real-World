/**
 * Player - Componente centralizado para controlar avatar ou cubo
 * Suporta WASD movement e troca entre GLB e fallback
 */
import React, { useRef, useState, useEffect, Suspense } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, useGLTF, useAnimations } from '@react-three/drei'

// Velocidade global do player (controlado externamente)
let playerVelocity = { vx: 0, vz: 0 }

/**
 * Props:
 * - glbUrl?: string | null
 * - speed?: number
 * - onLoaded?: (ok: boolean) => void
 */
export default function Player({ glbUrl, speed = 3, onLoaded }) {
  const group = useRef()
  const [isMoving, setIsMoving] = useState(false)

  // Atualizar posição baseado na velocidade global
  useFrame((_, delta) => {
    if (!group.current) return
    
    group.current.position.x += playerVelocity.vx * speed * delta
    group.current.position.z += playerVelocity.vz * speed * delta
    
    // Detectar se está se movendo
    const moving = Math.abs(playerVelocity.vx) > 0.01 || Math.abs(playerVelocity.vz) > 0.01
    setIsMoving(moving)
  })

  // Expor função global para controle externo
  useEffect(() => {
    Player.setVelocity = (vx, vz) => {
      playerVelocity = { vx, vz }
    }
  }, [])

  // Renderizar avatar ou cubo
  if (glbUrl) {
    return (
      <group ref={group}>
        <Suspense fallback={<Html center>Carregando avatar...</Html>}>
          <Avatar glbUrl={glbUrl} isMoving={isMoving} onLoaded={onLoaded} />
        </Suspense>
      </group>
    )
  }
  
  return (
    <group ref={group}>
      <Cube />
    </group>
  )
}

function Avatar({ glbUrl, isMoving, onLoaded }) {
  const { scene, animations } = useGLTF(glbUrl)
  const groupRef = useRef()
  const { actions } = useAnimations(animations, groupRef)

  // Tentar aplicar animações (Idle ou Walk)
  useEffect(() => {
    if (!actions) {
      onLoaded?.(true)
      return
    }

    try {
      // Tentar animação Walk quando se move, senão Idle
      const animName = isMoving ? 'Walk' : 'Idle'
      const action = actions[animName] || actions['Idle'] || Object.values(actions)[0]
      
      if (action) {
        action.reset().play()
      }
      onLoaded?.(true)
    } catch (e) {
      console.warn('[Player] Falha ao aplicar animação:', e)
      onLoaded?.(true)
    }
  }, [actions, isMoving, onLoaded])

  return (
    <group ref={groupRef} scale={[0.9, 0.9, 0.9]} rotation={[0, Math.PI, 0]}>
      <primitive object={scene} dispose={null} />
    </group>
  )
}

function Cube() {
  return (
    <group>
      {/* Cubo principal */}
      <mesh castShadow receiveShadow position={[0, 0.5, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#c6538c" />
      </mesh>
      {/* Cubo pequeno */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshStandardMaterial color="#2530d6" />
      </mesh>
    </group>
  )
}

// Exportar setVelocity globalmente
Player.setVelocity = (vx, vz) => {
  playerVelocity = { vx, vz }
}

