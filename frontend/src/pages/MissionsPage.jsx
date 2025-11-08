import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Target, Clock, Star, Trophy, CheckCircle, Calendar, Heart, UserPlus } from 'lucide-react'
import { toast } from 'react-hot-toast'

import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { useMissions } from '../hooks/useMissions'
import { useI18n } from '../i18n/useI18n'
import { t as translations } from '../i18n/t'
import api from '../services/api'

const MissionsPage = () => {
  // [MISSIONS_V2] Verificar feature flag
  const featureMissionsV2 = String(import.meta.env.VITE_FEATURE_MISSIONS_V2).toLowerCase() === 'true'
  
  const { missions, loading, error, fetchMissions, completeMission } = useMissions()
  const { lang } = useI18n()
  const missionsText = translations[lang]?.missions || translations.pt.missions

  // [MISSIONS_V2] Estado para missões v2
  const [missionsV2, setMissionsV2] = useState(null)
  const [loadingV2, setLoadingV2] = useState(false)
  const [summaryV2, setSummaryV2] = useState({ total: 0, completed: 0, successRate: 0 })

  // Carregar missões ao montar o componente
  useEffect(() => {
    if (featureMissionsV2) {
      fetchMissionsV2()
    } else {
      fetchMissions()
    }
  }, [featureMissionsV2])

  // [MISSIONS_V2] Função para buscar missões v2
  const fetchMissionsV2 = async () => {
    try {
      setLoadingV2(true)
      const response = await api.get('/missions/daily', { withCredentials: true })
      setMissionsV2(response.data.missions || [])
      setSummaryV2(response.data.summary || { total: 0, completed: 0, successRate: 0 })
    } catch (error) {
      console.error('Erro ao buscar missões v2:', error)
      // Fallback: não quebrar UI
      setMissionsV2([])
      toast.error('Erro ao carregar missões. Tente novamente.')
    } finally {
      setLoadingV2(false)
    }
  }

  // [MISSIONS_V2] Função para completar missão v2
  const handleCompleteMissionV2 = async (code) => {
    try {
      const response = await api.post('/missions/complete', { code }, { withCredentials: true })
      const result = response.data
      
      if (result.alreadyCompleted) {
        toast.success('Missão já completada hoje!')
      } else {
        toast.success(`✅ +${result.rewards.xp} XP e +${result.rewards.tokens} Tokens!`)
      }
      
      // Atualizar estado local
      setMissionsV2(prev => prev.map(m => 
        m.code === code ? { ...m, completed: true } : m
      ))
      
      // Atualizar summary
      setSummaryV2(prev => ({
        ...prev,
        completed: prev.completed + (result.alreadyCompleted ? 0 : 1),
        successRate: prev.total > 0 ? Math.round(((prev.completed + (result.alreadyCompleted ? 0 : 1)) / prev.total) * 100) : 0
      }))
    } catch (error) {
      console.error('Erro ao completar missão v2:', error)
      const errorMsg = error.response?.data?.detail || 'Erro ao completar missão'
      toast.error(errorMsg)
    }
  }

  // [MISSIONS_V2] Ícone helper
  const getIcon = (iconName) => {
    const icons = {
      'calendar-check': Calendar,
      'heart': Heart,
      'user-plus': UserPlus,
    }
    return icons[iconName] || Target
  }

  const categories = {
    school: { name: lang === 'en' ? 'School' : 'Escola', color: 'bg-blue-500/20', textColor: 'text-blue-400' },
    study: { name: lang === 'en' ? 'Study' : 'Estudos', color: 'bg-green-500/20', textColor: 'text-green-400' },
    environment: { name: lang === 'en' ? 'Environment' : 'Meio Ambiente', color: 'bg-emerald-500/20', textColor: 'text-emerald-400' },
    community: { name: lang === 'en' ? 'Community' : 'Comunidade', color: 'bg-purple-500/20', textColor: 'text-purple-400' },
    default: { name: lang === 'en' ? 'General' : 'Geral', color: 'bg-gray-500/20', textColor: 'text-gray-400' }
  }

  const handleCompleteMission = async (missionId) => {
    try {
      await completeMission(missionId)
      toast.success(missionsText.completeToast)
    } catch (error) {
      toast.error(missionsText.completeError)
    }
  }

  const difficulties = {
    easy: { name: lang === 'en' ? 'Easy' : 'Fácil', color: 'bg-green-500/20', textColor: 'text-green-400' },
    medium: { name: lang === 'en' ? 'Medium' : 'Médio', color: 'bg-yellow-500/20', textColor: 'text-yellow-400' },
    hard: { name: lang === 'en' ? 'Hard' : 'Difícil', color: 'bg-red-500/20', textColor: 'text-red-400' },
    default: { name: lang === 'en' ? 'Medium' : 'Médio', color: 'bg-yellow-500/20', textColor: 'text-yellow-400' }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-4"
      >
        <h1 className="text-3xl font-bold text-white">{missionsText.pageTitle}</h1>
        <p className="text-dark-400 text-base sm:text-sm">
          {missionsText.pageSubtitle}
        </p>
      </motion.div>

      {/* Estatísticas rápidas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <Card variant="glow" className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Target className="w-5 h-5 text-primary-400" aria-hidden="true" />
            <span className="text-sm font-medium text-dark-400">Total de Missões</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {featureMissionsV2 ? summaryV2.total : missions.length}
          </p>
        </Card>
        
        <Card variant="glow" className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-400" aria-hidden="true" />
            <span className="text-sm font-medium text-dark-400">Completadas</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {featureMissionsV2 
              ? summaryV2.completed 
              : missions.filter(m => m.isCompleted).length}
          </p>
        </Card>
        
        <Card variant="glow" className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Trophy className="w-5 h-5 text-accent-400" aria-hidden="true" />
            <span className="text-sm font-medium text-dark-400">Taxa de Sucesso</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {featureMissionsV2 
              ? summaryV2.successRate 
              : (missions.length > 0 ? Math.round((missions.filter(m => m.isCompleted).length / missions.length) * 100) : 0)}%
          </p>
        </Card>
      </motion.div>

      {/* [MISSIONS_V2] Lista de missões v2 ou padrão */}
      {featureMissionsV2 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-4"
        >
          {loadingV2 ? (
            <Card variant="glow" className="p-6 text-center">
              <p className="text-dark-400">Carregando missões...</p>
            </Card>
          ) : missionsV2 && missionsV2.length > 0 ? (
            missionsV2.map((mission) => {
              const IconComponent = getIcon(mission.icon)
              return (
                <Card key={mission.code} variant="glow" className="group hover-lift">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      {/* Header da missão */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-lg bg-primary-500/20">
                            <IconComponent className="w-5 h-5 text-primary-400" aria-hidden="true" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white">
                              {mission.title}
                            </h3>
                            <p className="text-dark-400">{mission.description}</p>
                          </div>
                        </div>
                        
                        {mission.completed && (
                          <div className="flex items-center space-x-1 text-green-400">
                            <CheckCircle className="w-5 h-5" aria-hidden="true" />
                            <span className="text-sm font-medium">Completa</span>
                          </div>
                        )}
                      </div>

                      {/* Recompensas */}
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400" aria-hidden="true" />
                          <span className="text-sm text-yellow-400 font-medium">
                            +{mission.xp_reward} XP
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Trophy className="w-4 h-4 text-accent-400" aria-hidden="true" />
                          <span className="text-sm text-accent-400 font-medium">
                            +{mission.token_reward} Tokens
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="ml-6">
                      {mission.completed ? (
                        <Button variant="ghost" disabled className="opacity-50">
                          <CheckCircle className="w-4 h-4 mr-2" aria-hidden="true" />
                          Completa
                        </Button>
                      ) : (
                        <Button 
                          variant="primary" 
                          size="sm"
                          onClick={() => handleCompleteMissionV2(mission.code)}
                        >
                          Concluir
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              )
            })
          ) : (
            <Card variant="glow" className="p-6 text-center">
              <p className="text-dark-400">Missões em breve</p>
            </Card>
          )}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-4"
        >
          {missions.map((mission, index) => (
          <Card key={mission.id} variant="glow" className="group hover-lift">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-3">
                {/* Header da missão */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${(categories[mission.category] || categories.default).color}`}>
                      <Target className={`w-5 h-5 ${(categories[mission.category] || categories.default).textColor}`} aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {mission.title}
                      </h3>
                      <p className="text-dark-400">{mission.description}</p>
                    </div>
                  </div>
                  
                  {mission.isCompleted && (
                    <div className="flex items-center space-x-1 text-green-400">
                      <CheckCircle className="w-5 h-5" aria-hidden="true" />
                      <span className="text-sm font-medium">Completa</span>
                    </div>
                  )}
                </div>

                {/* Categorias e dificuldade */}
                <div className="flex items-center space-x-4">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${(categories[mission.category] || categories.default).color} ${(categories[mission.category] || categories.default).textColor}`}>
                    {(categories[mission.category] || categories.default).name}
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${(difficulties[mission.difficulty] || difficulties.default).color} ${(difficulties[mission.difficulty] || difficulties.default).textColor}`}>
                    {(difficulties[mission.difficulty] || difficulties.default).name}
                  </div>
                </div>

                {/* Progresso */}
                {!mission.isCompleted && mission.progress > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-dark-400">Progresso</span>
                      <span className="text-white font-medium">{mission.progress}%</span>
                    </div>
                    <div className="w-full bg-dark-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${mission.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Recompensas */}
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400" aria-hidden="true" />
                    <span className="text-sm text-yellow-400 font-medium">
                      +{mission.xpReward} XP
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Trophy className="w-4 h-4 text-accent-400" aria-hidden="true" />
                    <span className="text-sm text-accent-400 font-medium">
                      +{mission.tokenReward} Tokens
                    </span>
                  </div>
                </div>
              </div>

              {/* Ações */}
              <div className="ml-6 flex flex-col space-y-2">
                {mission.isCompleted ? (
                  <Button variant="ghost" disabled className="opacity-50">
                    <CheckCircle className="w-4 h-4 mr-2" aria-hidden="true" />
                    {missionsText.complete}
                  </Button>
                ) : (
                  <>
                    {mission.progress > 0 ? (
                      <Button variant="primary" size="sm">
                        {missionsText.continue}
                      </Button>
                    ) : (
                      <Button variant="primary" size="sm">
                        {missionsText.start}
                      </Button>
                    )}
                    <details className="rounded-lg border border-white/10 bg-white/5 p-3 text-left">
                      <summary className="cursor-pointer text-sm font-medium text-white/80">
                        {missionsText.validationTitle}
                      </summary>
                      <p className="mt-2 text-sm text-white/70">
                        {missionsText.qrHint}
                      </p>
                      <ul className="mt-2 text-sm text-white/70 list-disc pl-5 space-y-1">
                        {missionsText.validationSteps.map((step) => (
                          <li key={step}>{step}</li>
                        ))}
                      </ul>
                    </details>
                  </>
                )}
              </div>
            </div>
          </Card>
        ))}
        </motion.div>
      )}

      {/* Missões diárias - apenas se não for v2 */}
      {!featureMissionsV2 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card variant="cyber">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-white">Missões Diárias</h3>
                <p className="text-dark-400">Resetam a cada 24 horas</p>
              </div>
              <div className="flex items-center space-x-2 text-sm text-dark-400">
                <Clock className="w-4 h-4" aria-hidden="true" />
                <span>Reset em 12h 34m</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {missions.slice(0, 2).map((mission) => (
                <div key={`daily-${mission.id}`} className="bg-dark-700/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-white">{mission.title}</h4>
                    <div className="flex items-center space-x-1 text-xs text-accent-400">
                      <Star className="w-3 h-3" aria-hidden="true" />
                      <span>+{mission.xpReward}</span>
                    </div>
                  </div>
                  <p className="text-sm text-dark-400 mb-3">{mission.description}</p>
                  <Button variant="ghost" size="sm" className="w-full">
                    {missionsText.completeAction}
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  )
}

export default MissionsPage




