/**
 * GhostAvatar - Avatar fantasma que reproduz melhor tempo
 */
import { useRef, useEffect, useState } from 'react'
import { useGLTF } from '@react-three/drei'

export default function GhostAvatar({ trajectory, glbUrl }) {
  const group = useRef()
  const [enabled, setEnabled] = useState(true)
  const [currentIdx, setCurrentIdx] = useState(0)

  const { scene } = useGLTF(glbUrl || '/avatars/default.glb')

  // Clone para não afetar o original
  const ghostScene = useRef(scene.clone())
  
  // Animação do ghost
  useEffect(() => {
    if (!trajectory || trajectory.length === 0) return

    let t = 0
    const speed = 100 // ms por frame

    const animate = () => {
      if (!group.current || !enabled) return

      const idx = Math.floor(t / speed)
      if (idx >= trajectory.length) return

      setCurrentIdx(idx)
      const point = trajectory[idx]

      if (point) {
        group.current.position.set(point.position[0], point.position[1], point.position[2])
        group.current.rotation.y = point.rotationY || 0
      }

      t += 16 // ~60fps
      requestAnimationFrame(animate)
    }

    animate()
  }, [trajectory, enabled])

  if (!enabled || !trajectory || trajectory.length === 0) return null

  return (
    <group ref={group} position={[0, 0, 0]}>
      <primitive
        object={ghostScene.current}
        scale={0.9}
        material-transparent
        material-opacity={0.4}
        material-color="#00ffff"
      />
    </group>
  )
}

// Exportar controle de ghost
export function useGhost() {
  const [enabled, setEnabled] = useState(() => {
    return localStorage.getItem('connectus.play.ghost.enabled') !== 'false'
  })

  const [best, setBest] = useState(() => {
    const saved = localStorage.getItem('connectus.play.ghost.best')
    return saved ? JSON.parse(saved) : null
  })

  const toggle = () => {
    const newState = !enabled
    setEnabled(newState)
    localStorage.setItem('connectus.play.ghost.enabled', newState.toString())
  }

  const saveBest = (trajectory) => {
    setBest(trajectory)
    localStorage.setItem('connectus.play.ghost.best', JSON.stringify(trajectory))
  }

  return { enabled, best, toggle, saveBest }
}








