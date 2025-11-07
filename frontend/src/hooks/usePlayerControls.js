/**
 * usePlayerControls - Hook para controles WASD do jogador
 * Gerencia estado de teclas pressionadas
 */
import { useState, useEffect } from 'react'

const usePlayerControls = () => {
  const [keys, setKeys] = useState({
    moveForward: false,
    moveBackward: false,
    moveLeft: false,
    moveRight: false
  })

  useEffect(() => {
    const handleKeyDown = (event) => {
      switch (event.code.toLowerCase()) {
        case 'keyw':
          setKeys((prev) => ({ ...prev, moveForward: true }))
          break
        case 'keys':
          setKeys((prev) => ({ ...prev, moveBackward: true }))
          break
        case 'keya':
          setKeys((prev) => ({ ...prev, moveLeft: true }))
          break
        case 'keyd':
          setKeys((prev) => ({ ...prev, moveRight: true }))
          break
      }
    }

    const handleKeyUp = (event) => {
      switch (event.code.toLowerCase()) {
        case 'keyw':
          setKeys((prev) => ({ ...prev, moveForward: false }))
          break
        case 'keys':
          setKeys((prev) => ({ ...prev, moveBackward: false }))
          break
        case 'keya':
          setKeys((prev) => ({ ...prev, moveLeft: false }))
          break
        case 'keyd':
          setKeys((prev) => ({ ...prev, moveRight: false }))
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  return keys
}

export default usePlayerControls








