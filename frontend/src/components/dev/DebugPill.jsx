import { Link } from 'react-router-dom'
import { useFeatures } from '../../hooks/useFeatures'

export default function DebugPill() {
  const { FEATURE_IMPACT, debugImpact } = useFeatures()
  if (!debugImpact && !FEATURE_IMPACT) return null

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Link
        to="/impact"
        className="px-3 py-2 rounded-full text-sm bg-white/10 hover:bg-white/20 text-white backdrop-blur border border-white/20"
        title="Ir para Impact Score"
      >
        Impact Score ↗
      </Link>
    </div>
  )
}



