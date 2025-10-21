import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'

import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

const NotFoundPage = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full"
      >
        <Card variant="cyber" className="text-center">
          <div className="space-y-6">
            {/* Ícone 404 */}
            <div className="relative">
              <div className="w-32 h-32 mx-auto bg-gradient-to-r from-primary-500/20 to-secondary-500/20 rounded-full flex items-center justify-center">
                <span className="text-6xl font-bold text-primary-400">404</span>
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent-500 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-dark-900">!</span>
              </div>
            </div>

            {/* Texto */}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-white">Página não encontrada</h1>
              <p className="text-dark-400">
                Ops! A página que você está procurando não existe ou foi movida.
              </p>
            </div>

            {/* Botões */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="primary"
                onClick={() => navigate('/')}
                className="flex-1"
              >
                <Home className="w-4 h-4 mr-2" />
                Ir para o Dashboard
              </Button>
              
              <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </div>

            {/* Efeito de partículas */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-10 left-10 w-2 h-2 bg-primary-400 rounded-full opacity-60 animate-pulse" />
              <div className="absolute top-20 right-20 w-1 h-1 bg-secondary-400 rounded-full opacity-60 animate-pulse" style={{ animationDelay: '0.5s' }} />
              <div className="absolute bottom-20 left-20 w-1.5 h-1.5 bg-accent-400 rounded-full opacity-60 animate-pulse" style={{ animationDelay: '1s' }} />
              <div className="absolute bottom-10 right-10 w-1 h-1 bg-primary-400 rounded-full opacity-60 animate-pulse" style={{ animationDelay: '1.5s' }} />
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}

export default NotFoundPage








