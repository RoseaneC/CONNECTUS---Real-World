/**
 * ConnectUS Play - Singleplayer Demo
 * Experiência 3D interativa com avatar Ready Player Me e integração Web3 Demo
 */
import { Suspense, useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useUserAvatar } from '../hooks/useUserAvatar'
import SceneContainer from '../components/play/SceneContainer'
import HUDOverlay from '../components/play/HUDOverlay'

const PlayPage = () => {
  const { isAuthenticated } = useAuth()
  const { glbUrl, loading: loadingAvatar } = useUserAvatar()
  const [Canvas, setCanvas] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Dynamic import dos módulos 3D (ESM compatible)
    const load3D = async () => {
      try {
        const [fiber, drei] = await Promise.all([
          import('@react-three/fiber'),
          import('@react-three/drei')
        ])
        
        setCanvas(() => fiber.Canvas)
        
        // Health check de versões (após import)
        console.log('[ConnectUS Play] ✅ Health Check:')
        console.log('  React:', '18.x')
        
        // Proteger log de three.REVISION
        try {
          const three = await import('three')
          if (three && typeof three.REVISION !== 'undefined') {
            console.log('  Three.js REVISION:', three.REVISION)
          } else {
            console.log('  Three.js: loaded')
          }
        } catch (e) {
          console.log('  Three.js: N/A')
        }
        
        console.log('  R3F:', fiber.CONSTANTS?.VERSION || 'installed')
        console.log('  Drei:', drei.CONSTANTS?.VERSION || 'installed')
        console.log('  3D Module: OK')
      } catch (error) {
        console.warn('[ConnectUS Play] ⚠️ Módulos 3D não disponíveis:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    load3D()
  }, [])

  useEffect(() => {
    console.log('[ConnectUS Play] Avatar URL from API:', glbUrl)
  }, [glbUrl])

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Fallback se módulos 3D não disponíveis
  if (!isLoading && !Canvas) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#fff',
        fontFamily: 'system-ui, -apple-system'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '40px',
          background: 'rgba(0, 0, 0, 0.6)',
          borderRadius: '20px',
          maxWidth: '600px'
        }}>
          <h1 style={{ fontSize: '48px', margin: '0 0 20px' }}>🚀</h1>
          <h2 style={{ fontSize: '32px', margin: '0 0 20px' }}>ConnectUS Play</h2>
          <p style={{ fontSize: '18px', margin: '0 0 30px' }}>
            Módulo 3D não disponível — execute os comandos abaixo para instalar as dependências:
          </p>
          <div style={{
            background: '#1a1a1a',
            padding: '20px',
            borderRadius: '10px',
            marginBottom: '30px',
            fontFamily: 'monospace',
            fontSize: '14px'
          }}>
            <p style={{ margin: '0 0 10px' }}>cd frontend</p>
            <p style={{ margin: '0' }}>npm install three @react-three/fiber @react-three/drei</p>
          </div>
          <button
            onClick={() => window.location.href = '/dashboard'}
            style={{
              padding: '14px 28px',
              background: 'rgba(255, 255, 255, 0.2)',
              border: '2px solid #fff',
              color: '#fff',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            ← Voltar ao Dashboard
          </button>
        </div>
      </div>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#1a1a1a',
        color: '#fff',
        fontFamily: 'system-ui'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '48px', margin: '0 0 20px' }}>⏳</h1>
          <p style={{ fontSize: '20px' }}>Carregando ambiente 3D...</p>
        </div>
      </div>
    )
  }

  if (!Canvas) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#fff',
        fontFamily: 'system-ui, -apple-system'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '40px',
          background: 'rgba(0, 0, 0, 0.6)',
          borderRadius: '20px',
          maxWidth: '600px'
        }}>
          <h1 style={{ fontSize: '48px', margin: '0 0 20px' }}>🚀</h1>
          <h2 style={{ fontSize: '32px', margin: '0 0 20px' }}>ConnectUS Play</h2>
          <p style={{ fontSize: '18px', margin: '0 0 30px' }}>
            Módulos 3D não disponíveis — execute:
          </p>
          <div style={{
            background: '#1a1a1a',
            padding: '20px',
            borderRadius: '10px',
            marginBottom: '30px',
            fontFamily: 'monospace',
            fontSize: '14px'
          }}>
            <p style={{ margin: '0 0 10px' }}>cd frontend</p>
            <p style={{ margin: '0' }}>npm install three @react-three/fiber @react-three/drei</p>
          </div>
          <button
            onClick={() => window.location.href = '/dashboard'}
            style={{
              padding: '14px 28px',
              background: 'rgba(255, 255, 255, 0.2)',
              border: '2px solid #fff',
              color: '#fff',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            ← Voltar ao Dashboard
          </button>
        </div>
      </div>
    )
  }

  // Renderizar o Canvas 3D
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* Canvas 3D com componentes dinâmicos */}
      <Canvas shadows camera={{ position: [4, 4, 6], fov: 60 }}>
        <Suspense fallback={<mesh><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color="hotpink" /></mesh>}>
          {/* Iluminação */}
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={0.8} />

          {/* Chão simples */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
            <planeGeometry args={[100, 100]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>

          {/* Cena com player controlado */}
          <SceneContainer glbUrl={glbUrl} loadingAvatar={loadingAvatar} />
        </Suspense>
      </Canvas>

      {/* HUD Overlay (fora do Canvas) */}
      <HUDOverlay />

      {/* Botão Voltar */}
      <button
        onClick={() => window.location.href = '/dashboard'}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          padding: '12px 24px',
          background: 'rgba(0, 0, 0, 0.7)',
          border: '2px solid #fff',
          color: '#fff',
          borderRadius: '8px',
          cursor: 'pointer',
          zIndex: 1000,
          fontSize: '16px',
          fontWeight: 'bold'
        }}
      >
        ← Voltar ao Dashboard
      </button>
    </div>
  )
}

export default PlayPage

