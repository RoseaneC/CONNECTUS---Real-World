import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-dark-900 flex">
      {/* Lado esquerdo - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-900 via-dark-900 to-secondary-900 relative overflow-hidden">
        {/* Efeito de partículas */}
        <div className="absolute inset-0 cyber-grid opacity-20" />
        
        {/* Conteúdo de branding */}
        <div className="relative z-10 flex flex-col justify-center items-center text-center p-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            {/* Logo */}
            <div className="space-y-4">
              <div className="w-24 h-24 mx-auto bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center">
                <span className="text-3xl font-bold text-white">C</span>
              </div>
              <h1 className="text-4xl font-bold neon-text">
                Connectus
              </h1>
              <p className="text-xl text-dark-300 max-w-md">
                Plataforma gamificada de impacto social para jovens em risco de abandono escolar
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4 text-left max-w-md">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary-500 rounded-full" />
                <span className="text-dark-200">Ganhe XP e tokens completando missões</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-secondary-500 rounded-full" />
                <span className="text-dark-200">Conecte-se com outros jovens</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-accent-500 rounded-full" />
                <span className="text-dark-200">Carteira de rendimento para menores</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary-500 rounded-full" />
                <span className="text-dark-200">Integração com blockchain Stellar</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Efeitos visuais */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-primary-500/20 rounded-full blur-xl animate-pulse-slow" />
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-secondary-500/20 rounded-full blur-xl animate-pulse-slow" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent-500/10 rounded-full blur-2xl animate-float" />
      </div>

      {/* Lado direito - Formulário */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md"
        >
          <Outlet />
        </motion.div>
      </div>
    </div>
  )
}

export default AuthLayout










