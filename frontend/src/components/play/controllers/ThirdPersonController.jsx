/**
 * ThirdPersonController - Câmera 3ª pessoa estilo Roblox
 * Mouse wheel (zoom), botão direito (rotar), spring follow
 */
import React from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { Raycaster, Vector3 } from 'three'

export default function ThirdPersonController({
  targetRef,
  minDist = 2,
  maxDist = 8,
  zoomStep = 0.5
}) {
  const { camera, gl, scene } = useThree()
  const state = React.useRef({
    dist: 5,
    yaw: 0,
    pitch: 0.3,
    rotating: false,
    lastX: 0,
    lastY: 0
  })
  const ray = React.useRef(new Raycaster())
  const tmp = React.useRef(new Vector3())

  React.useEffect(() => {
    const onDown = (e) => {
      if (e.button === 2) {
        state.current.rotating = true
        state.current.lastX = e.clientX
        state.current.lastY = e.clientY
        gl.domElement.style.cursor = 'grabbing'
      }
    }

    const onUp = (e) => {
      if (e.button === 2) {
        state.current.rotating = false
        gl.domElement.style.cursor = 'grab'
      }
    }

    const onMove = (e) => {
      if (!state.current.rotating) return
      const dx = e.clientX - state.current.lastX
      const dy = e.clientY - state.current.lastY
      state.current.lastX = e.clientX
      state.current.lastY = e.clientY
      state.current.yaw -= dx * 0.005
      state.current.pitch = Math.max(-Math.PI / 6, Math.min(Math.PI / 3, state.current.pitch - dy * 0.003))
    }

    const onWheel = (e) => {
      state.current.dist = Math.max(
        minDist,
        Math.min(maxDist, state.current.dist + Math.sign(e.deltaY) * zoomStep)
      )
    }

    gl.domElement.addEventListener('contextmenu', (e) => e.preventDefault())
    gl.domElement.addEventListener('mousedown', onDown)
    gl.domElement.addEventListener('mouseup', onUp)
    gl.domElement.addEventListener('mousemove', onMove)
    gl.domElement.addEventListener('wheel', onWheel, { passive: true })

    gl.domElement.style.cursor = 'grab'

    return () => {
      gl.domElement.removeEventListener('mousedown', onDown)
      gl.domElement.removeEventListener('mouseup', onUp)
      gl.domElement.removeEventListener('mousemove', onMove)
      gl.domElement.removeEventListener('wheel', onWheel)
      gl.domElement.style.cursor = 'auto'
    }
  }, [gl])

  useFrame(() => {
    const t = targetRef?.current
    if (!t) return

    // Posição alvo (altura do "peito")
    const target = t.getWorldPosition(tmp.current).add({ x: 0, y: 1.4, z: 0 })

    // Pivot esférico
    const cx = Math.sin(state.current.yaw) * Math.cos(state.current.pitch)
    const cy = Math.sin(state.current.pitch)
    const cz = Math.cos(state.current.yaw) * Math.cos(state.current.pitch)

    // Intenção de posição da câmera
    const desired = target.clone().add(new Vector3(cx, cy, cz).multiplyScalar(state.current.dist))

    // Colisão de câmera simples
    ray.current.set(target, desired.clone().sub(target).normalize())
    ray.current.far = state.current.dist
    const hits = ray.current.intersectObjects(scene.children, true)
    const hit = hits.find((i) => !t.children.includes(i.object))

    const camPos = hit
      ? hit.point.add((hit.face?.normal.clone().multiplyScalar(0.2)) || new Vector3())
      : desired

    // Suavização
    camera.position.lerp(camPos, 0.1)
    camera.lookAt(target)
  })

  return null
}








