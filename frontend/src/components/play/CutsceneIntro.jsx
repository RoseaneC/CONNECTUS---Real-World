/**
 * CutsceneIntro - Introdução animada com letterbox
 */
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function CutsceneIntro({ onEnd }) {
  const [show, setShow] = useState(true)

  useEffect(() => {
    // Verificar se já foi vista
    const introSeen = localStorage.getItem('connectus.play.introSeen')
    if (introSeen === 'true') {
      setShow(false)
      onEnd?.()
      return
    }

    // Timer 3s ou tecla para pular
    const timer = setTimeout(() => {
      setShow(false)
      localStorage.setItem('connectus.play.introSeen', 'true')
      onEnd?.()
    }, 3000)

    const handleSkip = (e) => {
      if (e.key === 'Enter' || e.type === 'click' || e.touches) {
        setShow(false)
        localStorage.setItem('connectus.play.introSeen', 'true')
        onEnd?.()
      }
    }

    window.addEventListener('keydown', handleSkip)
    window.addEventListener('click', handleSkip)
    window.addEventListener('touchstart', handleSkip, { once: true })

    return () => {
      clearTimeout(timer)
      window.removeEventListener('keydown', handleSkip)
      window.removeEventListener('click', handleSkip)
      window.removeEventListener('touchstart', handleSkip)
    }
  }, [onEnd])

  if (!show) return null

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: '#000',
            zIndex: 10000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {/* Letterbox top */}
          <motion.div
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            transition={{ duration: 0.5 }}
            style={{ width: '100%', height: '15%', background: '#000' }}
          />

          {/* Conteúdo central */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              textAlign: 'center',
              color: '#fff',
              padding: '40px',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <h1 style={{ fontSize: '48px', marginBottom: '20px', fontWeight: 'bold' }}>
              ConnectUS Play
            </h1>
            <p style={{ fontSize: '24px', marginBottom: '10px' }}>Bem-vindo à favela</p>
            <div style={{ marginTop: '40px', fontSize: '18px', color: '#aaa' }}>
              <p>Desktop: WASD mover • Shift correr • Espaço pular</p>
              <p>Mouse direito: girar câmera • Scroll: zoom</p>
              <p style={{ marginTop: '20px' }}>Mobile: joysticks visíveis</p>
              <p style={{ fontSize: '14px', marginTop: '30px', color: '#888' }}>
                Pressione Enter para pular
              </p>
            </div>
          </motion.div>

          {/* Letterbox bottom */}
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ duration: 0.5 }}
            style={{ width: '100%', height: '15%', background: '#000' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}








