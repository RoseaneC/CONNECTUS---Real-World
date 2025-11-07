/**
 * useUserAvatar - Hook para buscar URL do avatar GLB do usuário
 * Retorna URL do GLB, loading state e error state
 */
import { useEffect, useState } from "react"
import api from "../services/api"

export function useUserAvatar() {
  const [glbUrl, setGlbUrl] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    
    const fetchAvatar = async () => {
      try {
        const { data } = await api.get("/avatars")
        console.log("[PLAY] /avatars raw response:", data)
        
        // Aceitar múltiplas fontes de URL (novo formato com .current)
        const candidates = [
          data?.current?.glb_url,
          data?.current?.avatar_glb_url,
          data?.glb_url,
          data?.avatar_glb_url,
          data?.avatar?.glb_url,
          Array.isArray(data) ? data[0]?.avatar_glb_url : null,
          Array.isArray(data) ? data[0]?.glb_url : null,
        ].filter(Boolean)
        
        // Verificar se tem http/https válido
        const url = candidates.find((u) => u && typeof u === 'string' && /^https?:\/\//i.test(u)) || null
        
        if (!url && candidates.length > 0) {
          console.warn("[PLAY] avatar_glb_url sem http/https:", candidates[0])
        }
        
        if (mounted) {
          setGlbUrl(url || null)
          console.log("[PLAY] ✅ Avatar URL from API:", url || "null (fallback para cubo)")
        }
      } catch (err) {
        if (mounted) {
          setError(err)
          console.error("[PLAY] ❌ /avatars failed:", err)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    fetchAvatar()
    
    return () => {
      mounted = false
    }
  }, [])

  return { glbUrl, loading, error }
}

