import React, { Component } from 'react'
import { toast } from 'react-hot-toast'

class GlobalErrorHandler extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
    
    // Configurar função global para mostrar toasts
    window.showToast = (message, type = 'info') => {
      if (type === 'error') {
        toast.error(message)
      } else if (type === 'success') {
        toast.success(message)
      } else {
        toast(message)
      }
    }
  }

  static getDerivedStateFromError(error) {
    // Atualizar state para mostrar UI de erro
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    // Log do erro
    console.error('❌ Erro capturado pelo GlobalErrorHandler:', error, errorInfo)
    
    // Mostrar toast de erro
    toast.error('Ocorreu um erro inesperado. Recarregue a página.')
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-white mb-4">
              Ops! Algo deu errado
            </h1>
            <p className="text-gray-300 mb-6">
              Ocorreu um erro inesperado. Não se preocupe, isso pode acontecer.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                🔄 Recarregar Página
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                🏠 Ir para Início
              </button>
            </div>
            {import.meta.env && import.meta.env.MODE === 'development' && (
              <details className="mt-6 text-left">
                <summary className="text-gray-400 cursor-pointer">
                  Detalhes do erro (desenvolvimento)
                </summary>
                <pre className="mt-2 text-xs text-red-400 bg-gray-900 p-2 rounded overflow-auto">
                  {this.state.error?.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default GlobalErrorHandler

