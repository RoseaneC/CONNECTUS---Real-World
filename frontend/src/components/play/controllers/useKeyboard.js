/**
 * useKeyboard - Hook para capturar teclas WASD, Shift, Space
 */
import { useEffect, useRef } from 'react'

export function useKeyboard() {
  const keys = useRef({ w: false, a: false, s: false, d: false, shift: false, space: false })

  useEffect(() => {
    const handleKeyDown = (e) => {
      const k = e.key.toLowerCase()
      if ('wasd'.includes(k)) {
        keys.current[k] = true
      } else if (k === 'shift') {
        keys.current.shift = true
      } else if (k === ' ') {
        keys.current.space = true
      }
    }

    const handleKeyUp = (e) => {
      const k = e.key.toLowerCase()
      if ('wasd'.includes(k)) {
        keys.current[k] = false
      } else if (k === 'shift') {
        keys.current.shift = false
      } else if (k === ' ') {
        keys.current.space = false
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








