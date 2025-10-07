import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Zap, 
  Users, 
  Trophy, 
  MessageCircle, 
  Target, 
  ArrowRight,
  Play,
  Star,
  Shield,
  Heart
} from 'lucide-react'

import Button from '../components/ui/Button'
import Card from '../components/ui/Card'

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 via-transparent to-accent-500/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <h1 className="text-5xl md:text-7xl font-bold text-white">
                  <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                    Connectus
                  </span>
                </h1>
                <p className="text-xl md:text-2xl text-dark-300 max-w-3xl mx-auto">
                  A plataforma social gamificada que transforma jovens em agentes de mudança
                </p>
                <p className="text-lg text-dark-400 max-w-2xl mx-auto">
                  Conecte-se, aprenda, cresça e impacte o mundo através de missões, recompensas e uma comunidade vibrante.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register">
                  <Button
                    size="lg"
                    className="px-8 py-4 text-lg"
                    variant="primary"
                  >
                    Começar Jornada
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                
                <Link to="/login">
                  <Button
                    size="lg"
                    className="px-8 py-4 text-lg"
                    variant="secondary"
                  >
                    Já tenho conta
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-dark-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Por que escolher o Connectus?
            </h2>
            <p className="text-xl text-dark-300 max-w-2xl mx-auto">
              Uma plataforma completa que combina gamificação, impacto social e tecnologia para transformar vidas
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Zap className="w-8 h-8 text-primary-400" />,
                title: "Gamificação Inteligente",
                description: "Sistema de XP, níveis, badges e missões que tornam o aprendizado viciante e recompensador."
              },
              {
                icon: <Users className="w-8 h-8 text-accent-400" />,
                title: "Comunidade Vibrante",
                description: "Conecte-se com jovens que compartilham seus sonhos e trabalham juntos para mudar o mundo."
              },
              {
                icon: <Trophy className="w-8 h-8 text-yellow-400" />,
                title: "Ranking e Competições",
                description: "Participe de competições saudáveis e veja seu progresso em rankings globais."
              },
              {
                icon: <MessageCircle className="w-8 h-8 text-green-400" />,
                title: "Chat em Tempo Real",
                description: "Converse com amigos, participe de grupos e construa relacionamentos duradouros."
              },
              {
                icon: <Target className="w-8 h-8 text-blue-400" />,
                title: "Missões de Impacto",
                description: "Complete missões que realmente fazem a diferença na sua comunidade e no mundo."
              },
              {
                icon: <Heart className="w-8 h-8 text-red-400" />,
                title: "Propósito Social",
                description: "Cada ação sua contribui para um mundo melhor, com impacto real e mensurável."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card variant="cyber" className="h-full p-6 hover:scale-105 transition-transform">
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-white">
                      {feature.title}
                    </h3>
                    <p className="text-dark-300">
                      {feature.description}
                    </p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <h2 className="text-4xl font-bold text-white">
                Pronto para começar sua jornada?
              </h2>
              <p className="text-xl text-dark-300">
                Junte-se a milhares de jovens que já estão transformando o mundo através do Connectus
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button
                  size="lg"
                  className="px-8 py-4 text-lg"
                  variant="primary"
                >
                  Criar Conta Gratuita
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              
              <Link to="/login">
                <Button
                  size="lg"
                  className="px-8 py-4 text-lg"
                  variant="ghost"
                >
                  Fazer Login
                </Button>
              </Link>
            </div>

            <div className="flex items-center justify-center space-x-8 text-sm text-dark-400">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4" />
                <span>100% Seguro</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4" />
                <span>Gratuito para sempre</span>
              </div>
              <div className="flex items-center space-x-2">
                <Play className="w-4 h-4" />
                <span>Comece agora</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default HomePage