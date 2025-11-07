/**
 * AnimatedPlayer - Player animado com WASD e animações Idle/Walk/Run/Turn
 * Sistema robusto de animações com THREE.AnimationMixer e cross-fade suave
 * Usa useLoader com GLTFLoader + DRACOLoader para compatibilidade
 */
import { useEffect, useMemo, useRef, useState, forwardRef } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { useAnimations } from '@react-three/drei'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import * as THREE from 'three'

const FADE = 0.25 // segundos - cross-fade suave
const WALK_SPEED = 2.2 // m/s
const RUN_SPEED = 4.0 // m/s
const TURN_SPEED = 2.4 // rad/s quando parado e virando

/**
 * Tenta mapear nomes variados de animações para chaves canônicas.
 * Ex.: "Idle", "Armature|Idle", "idle", "Idle_01" => idle
 */
function mapActions(actions) {
  if (!actions || Object.keys(actions).length === 0) return {}

  const norm = (s) => s.toLowerCase()
  const byName = Object.fromEntries(Object.entries(actions).map(([k, v]) => [norm(k), v]))

  const find = (...cands) => {
    for (const c of cands) {
      const hit = byName[norm(c)]
      if (hit) return hit
      // procura por includes
      const inc = Object.entries(byName).find(([n]) => n.includes(norm(c)))
      if (inc) return inc[1]
    }
    return null
  }

  return {
    idle: find('Idle', 'idle', 'Idle_01', 'Armature|Idle'),
    walk: find('Walk', 'Walking', 'WalkForward', 'Move', 'Locomotion', 'Armature|Walk'),
    run: find('Run', 'Running', 'Sprint', 'Armature|Run'),
    turnL: find('TurnLeft', 'Turn_L', 'RotateLeft', 'Armature|TurnLeft'),
    turnR: find('TurnRight', 'Turn_R', 'RotateRight', 'Armature|TurnRight')
  }
}

const AnimatedPlayer = ({
  glbUrl,
  position = [0, 0, 0],
  rotation = [0, Math.PI, 0],
  scale = 1,
  ref: forwardedRef
}) => {
  const group = useRef()
  const [current, setCurrent] = useState('idle')
  const velocity = useRef(new THREE.Vector3())
  const facing = useRef(0) // yaw em rad
  const input = useRef({ f: false, b: false, l: false, r: false, run: false })

  // Normaliza URL - evita undefined, espaços, etc.
  const url = useMemo(() => {
    if (!glbUrl) return null
    const u = String(glbUrl).trim()
    if (!u) return null
    // Se já tem protocolo, usa direto; senão assume HTTP
    return u.startsWith('http') ? u : `http://${u}`
  }, [glbUrl])

  // Carrega GLB com DRACO via useLoader (compatível com versões atuais)
  const gltf = useLoader(
    GLTFLoader,
    url || '/placeholder.glb', // fallback que não será usado se url for null
    (loader) => {
      const draco = new DRACOLoader()
      // CDN oficial do DRACO (não precisa copiar arquivos)
      draco.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/')
      loader.setDRACOLoader(draco)
    }
  )

  // Extrai scene e animations do GLTF
  const scene = gltf ? gltf.scene : null
  const animations = gltf ? gltf.animations : []

  const { actions, mixer } = useAnimations(animations, group)

  // Mapeia ações para nomes canônicos
  const mapped = useMemo(() => (actions ? mapActions(actions) : {}), [actions])

  // Helper de cross-fade
  const play = (name) => {
    if (!mapped[name]) return

    Object.values(mapped).forEach((a) => a && (a.enabled = true))
    const next = mapped[name]
    const prev = Object.entries(mapped)
      .filter(([k, a]) => a && k !== name && a.isRunning())
      .map(([, a]) => a)

    if (next) {
      next.reset().fadeIn(FADE).play()
      setCurrent(name)
    }
    if (prev) prev.forEach((a) => a && a.fadeOut(FADE))
  }

  // Input - WASD e Setas
  useEffect(() => {
    const onDown = (e) => {
      switch (e.key) {
        case 'w':
        case 'W':
        case 'ArrowUp':
          input.current.f = true
          break
        case 's':
        case 'S':
        case 'ArrowDown':
          input.current.b = true
          break
        case 'a':
        case 'A':
        case 'ArrowLeft':
          input.current.l = true
          break
        case 'd':
        case 'D':
        case 'ArrowRight':
          input.current.r = true
          break
        case 'Shift':
          input.current.run = true
          break
        default:
          break
      }
    }

    const onUp = (e) => {
      switch (e.key) {
        case 'w':
        case 'W':
        case 'ArrowUp':
          input.current.f = false
          break
        case 's':
        case 'S':
        case 'ArrowDown':
          input.current.b = false
          break
        case 'a':
        case 'A':
        case 'ArrowLeft':
          input.current.l = false
          break
        case 'd':
        case 'D':
        case 'ArrowRight':
          input.current.r = false
          break
        case 'Shift':
          input.current.run = false
          break
        default:
          break
      }
    }

    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)
    return () => {
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup', onUp)
    }
  }, [])

  // Inicializa com Idle
  useEffect(() => {
    if (!mapped || !mixer) return

    if (mapped.idle) {
      mapped.idle.enabled = true
      mapped.idle.play()
    }
  }, [mapped, mixer])

  // Loop principal de animação e movimento
  useFrame((_, delta) => {
    if (!group.current || !mixer) return

    const { f, b, l, r, run } = input.current

    // Atualiza mixer
    mixer.update(delta)

    // Lógica de rotação e movimento
    const moving = f || b
    const turningInPlace = !moving && (l || r)

    // Rotaciona (parado) com Turn anim se existir, senão rotação seca
    if (turningInPlace) {
      const dir = l ? 1 : -1 // esquerda positiva
      facing.current += dir * TURN_SPEED * delta
      group.current.rotation.y = facing.current

      if (mapped.turnL && l && current !== 'turnL') {
        play('turnL')
      } else if (mapped.turnR && r && current !== 'turnR') {
        play('turnR')
      } else if ((!mapped.turnL && l) || (!mapped.turnR && r)) {
        // Sem animação de turn: mantenha Idle mas rotacione
        if (current !== 'idle' && mapped.idle) play('idle')
      }
    }

    // Se estiver movendo pra frente/tras, escolhe Walk ou Run
    if (moving) {
      const target = run && mapped.run ? 'run' : 'walk'
      if (current !== target && mapped[target]) play(target)

      // Direção de rotação enquanto anda (A/D)
      if (l) facing.current += TURN_SPEED * 0.8 * delta
      if (r) facing.current -= TURN_SPEED * 0.8 * delta
      group.current.rotation.y = facing.current

      // Define velocidade
      const speed = target === 'run' ? RUN_SPEED : WALK_SPEED
      const dir = new THREE.Vector3(Math.sin(facing.current), 0, Math.cos(facing.current))

      // Andar para trás inverte o vetor
      if (b && !f) dir.multiplyScalar(-1)

      velocity.current.copy(dir).multiplyScalar(speed * delta)
      group.current.position.add(velocity.current)
    } else if (!turningInPlace) {
      // Parou: volte para Idle
      if (current !== 'idle' && mapped.idle) play('idle')
    }
  })

  // Ajustes básicos de sombra e esqueleto
  useEffect(() => {
    if (!scene) return

    scene.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = true
        obj.receiveShadow = true
        // Garante esqueleto atualizado (alguns GLBs precisam)
        if (obj.skeleton && obj.skeleton.computeBoundingBox) {
          obj.skeleton.computeBoundingBox()
        }
      }
    })
  }, [scene])

  // Se não tiver GLB, não renderiza nada
  if (!glbUrl || !scene) return null

  return (
    <group ref={forwardedRef || group} position={position} rotation={rotation} scale={scale}>
      <primitive object={scene} />
    </group>
  )
}

export default forwardRef((props, ref) => <AnimatedPlayer {...props} forwardedRef={ref} />)
