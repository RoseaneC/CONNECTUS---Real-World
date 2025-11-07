/**
 * MissionPoints - Pontos de missão 3D clicáveis
 * Cada ponto chama POST /wallet/demo/mint ao ser clicado
 */
import { useState, useRef, useEffect } from 'react'
import { Vector2 } from 'three'
import { useThree } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import api from '../../services/api'

const MISSION_POINTS = [
  { position: [5, 0.5, 5], id: 1, label: 'Missão 1', reward: 10 },
  { position: [-5, 0.5, 5], id: 2, label: 'Missão 2', reward: 15 },
  { position: [0, 0.5, -5], id: 3, label: 'Missão 3', reward: 20 }
]

const MissionPoints = () => {
  const [completedMissions, setCompletedMissions] = useState([])
  const { raycaster, camera, scene } = useThree()
  const points = useRef([])

  useEffect(() => {
    if (!raycaster || !camera || !scene) return

    const onPointerDown = (event) => {
      // Raycast para detectar clique
      const pointer = new Vector2()
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1
      pointer.y = -(event.clientY / window.innerHeight) * 2 + 1

      raycaster.setFromCamera(pointer, camera)
      const intersects = raycaster.intersectObjects(points.current)

      if (intersects.length > 0) {
        const mission = intersects[0].object.userData.mission
        handleMissionComplete(mission)
      }
    }

    window.addEventListener('click', onPointerDown)
    return () => window.removeEventListener('click', onPointerDown)
  }, [raycaster, camera, scene])

  const handleMissionComplete = async (mission) => {
    if (completedMissions.includes(mission.id)) {
      console.log('[ConnectUS Play] Missão já completada')
      return
    }

    try {
      // Chamar endpoint de mint
      const response = await api.post('/wallet/demo/mint', {
        amount: mission.reward
      })

      console.log('[ConnectUS Play] Missão completada!', response.data)

      // Adicionar missão às completadas
      setCompletedMissions([...completedMissions, mission.id])

      // Mostrar notificação
      alert(`✅ ${mission.label} completada! +${mission.reward} VEXA Coins`)
    } catch (error) {
      console.error('[ConnectUS Play] Erro ao completar missão:', error)
      alert('Erro ao completar missão. Tente novamente.')
    }
  }

  return (
    <group>
      {MISSION_POINTS.map((mission) => {
        const isCompleted = completedMissions.includes(mission.id)
        return (
          <group key={mission.id} ref={(el) => { if (el) points.current.push(el) }}>
            {/* Base circular */}
            <mesh
              position={[mission.position[0], mission.position[1], mission.position[2]]}
              receiveShadow
              userData={{ mission }}
            >
              <cylinderGeometry args={[0.5, 0.5, 0.1, 32]} />
              <meshStandardMaterial color={isCompleted ? '#10B981' : '#EF4444'} />
            </mesh>

            {/* Pilar */}
            <mesh
              position={[mission.position[0], mission.position[1] + 0.75, mission.position[2]]}
              castShadow
              userData={{ mission }}
            >
              <cylinderGeometry args={[0.15, 0.15, 1.5, 16]} />
              <meshStandardMaterial color={isCompleted ? '#10B981' : '#3B82F6'} />
            </mesh>

            {/* Globo flutuante */}
            <mesh
              position={[mission.position[0], mission.position[1] + 1.5, mission.position[2]]}
              userData={{ mission }}
            >
              <sphereGeometry args={[0.3, 16, 16]} />
              <meshStandardMaterial
                color={isCompleted ? '#10B981' : '#FCD34D'}
                emissive={isCompleted ? '#065F46' : '#FDE047'}
                emissiveIntensity={0.3}
              />
            </mesh>

            {/* Indicador de recompensa */}
            {!isCompleted && (
              <Text
                position={[mission.position[0], mission.position[1] + 1.8, mission.position[2]]}
                fontSize={0.4}
                color="#FCD34D"
                anchorX="center"
                anchorY="middle"
              >
                +{mission.reward} VEXA
              </Text>
            )}
          </group>
        )
      })}
    </group>
  )
}

export default MissionPoints

