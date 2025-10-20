// [CONNECTUS PATCH] ReadyPlayerMeModal.jsx – versão final segura
import { useEffect, useRef } from 'react'

export default function ReadyPlayerMeModal({ open, onClose, onSaved }) {
  if (!open) return null

  const frameRef = useRef(null)
  const subdomain = import.meta.env.VITE_RPM_SUBDOMAIN || 'demo'
  const src = `https://${subdomain}.readyplayer.me/avatar?frameApi`

  function isRpmOrigin(origin) {
    try {
      const url = new URL(origin)
      return url.hostname.endsWith('.readyplayer.me')
    } catch {
      return false
    }
  }

  useEffect(() => {
    function handleMessage(event) {
      if (!isRpmOrigin(event.origin)) return
      let payload = event.data
      if (!payload) return

      if (import.meta.env.DEV) console.log('[RPM] raw message', payload)

      // Permitir string ou objeto
      if (typeof payload === 'string') {
        try {
          payload = JSON.parse(payload)
        } catch {
          if (payload.includes('v1.avatar.exported')) {
            if (import.meta.env.DEV)
              console.warn('[RPM] Detected exported (string only)')
            onSaved?.({ avatar_glb_url: null, avatar_png_url: null })
          }
          return
        }
      }

      const { eventName, type, data } = payload

      // Frame pronto → subscrever evento
      if (eventName === 'v1.frame.ready' || type === 'v1.frame.ready') {
        if (import.meta.env.DEV)
          console.log('[RPM] frame ready → subscribing')
        frameRef.current?.contentWindow?.postMessage(
          JSON.stringify({
            target: 'readyplayerme',
            type: 'subscribe',
            eventName: 'v1.avatar.exported',
          }),
          '*'
        )
        return
      }

      // Avatar exportado
      const isExported =
        eventName === 'v1.avatar.exported' || type === 'v1.avatar.exported'
      if (isExported && data) {
        const glb =
          data.glb || data.url || data.urls?.glb || data?.avatarUrl || null
        let png =
          data.thumbnail ||
          data.pngUrl ||
          data.urls?.png ||
          data?.imageUrl ||
          null

        // [CONNECTUS PATCH] gerar png automaticamente se faltar
        if (!png && data.avatarId) {
          png = `https://models.readyplayer.me/${data.avatarId}.png`
          if (import.meta.env.DEV)
            console.log('[RPM] thumbnail gerada automaticamente:', png)
        }

        if (import.meta.env.DEV)
          console.log('[RPM] exported avatar', { glb, png })

        if (glb || png) {
          onSaved?.({
            avatar_glb_url: glb ?? null,
            avatar_png_url: png ?? null,
          })
          onClose?.()
        }
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [onSaved, onClose])

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center">
      <div className="bg-[#0F172A] rounded-2xl w-[min(1000px,92vw)] h-[min(85vh,900px)] shadow-xl border border-white/10 overflow-hidden relative">
        {/* Header */}
        <div className="h-12 flex items-center justify-between px-4 border-b border-white/10">
          <h3 className="text-white/90 text-sm">Ready Player Me</h3>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white text-sm"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        {/* Iframe */}
        <iframe
          ref={frameRef}
          allow="camera *; microphone *; clipboard-write"
          title="Ready Player Me"
          src={src}
          className="w-full h-[calc(100%-48px)]"
        />
      </div>
    </div>
  )
}
