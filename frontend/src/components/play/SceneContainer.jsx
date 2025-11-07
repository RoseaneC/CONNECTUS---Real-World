/**
 * SceneContainer - Container principal da cena 3D
 * Player animado 3ª pessoa + missões + cenário
 */
import React, { Suspense, useEffect, useState, useRef } from 'react'
import { Html, Sky } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import AnimatedPlayer from './AnimatedPlayer'
import MissionPoints from './MissionPoints'
import FavelaScene from './FavelaScene'
import NPC from './NPC'
import ObbyScene from './ObbyScene'

// Componente Fog (fog não existe em drei)
function SceneFog({ color = '#0b1320', near = 20, far = 150 }) {
  const { scene } = useThree()
  useEffect(() => {
    const prev = scene.fog
    scene.fog = new THREE.Fog(color, near, far)
    return () => {
      scene.fog = prev ?? null
    }
  }, [scene, color, near, far])
  return null
}

const SceneContainer = ({ glbUrl, loadingAvatar }) => {
  const [sceneMode] = useState('obby') // 'obby' ou 'favela'
  const playerRef = useRef()
  
  console.log('[ConnectUS Play] glbUrl:', glbUrl)
  console.log('[ConnectUS Play] loadingAvatar:', loadingAvatar)
  console.log('[ConnectUS Play] sceneMode:', sceneMode)

  return (
    <>
      {/* Cenário baseado no modo */}
      {sceneMode === 'obby' ? (
        <Suspense fallback={<Html center>Carregando obby...</Html>}>
          <ObbyScene playerRef={playerRef} />
        </Suspense>
      ) : (
        <>
          {/* Cenário Favela */}
          <Suspense fallback={<Html center>Carregando cenário...</Html>}>
            <FavelaScene />
          </Suspense>

          {/* Pontos de missão interativos */}
          <Suspense fallback={null}>
            <MissionPoints />
          </Suspense>

          {/* Céu e atmosfera */}
          <Sky sunPosition={[100, 20, 100]} turbidity={10} />
          <SceneFog color="#1a1a2e" near={50} far={200} />

          {/* Iluminação ambiente (noite na favela) */}
          <ambientLight intensity={0.3} />
          <directionalLight
            position={[10, 15, 10]}
            intensity={0.6}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <hemisphereLight skyColor="#ff8c00" groundColor="#8B7355" intensity={0.4} />

          {/* NPCs */}
          <Suspense fallback={null}>
            <NPC />
          </Suspense>
        </>
      )}

      {/* Player animado com câmera 3ª pessoa */}
      {!loadingAvatar && glbUrl && (
        <Suspense fallback={<Html center>Carregando player...</Html>}>
          <AnimatedPlayer ref={playerRef} glbUrl={glbUrl} position={[0, 0, 0]} scale={1} />
        </Suspense>
      )}
    </>
  )
}

export default SceneContainer
