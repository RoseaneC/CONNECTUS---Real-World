import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) { 
    super(props); 
    this.state = { hasError: false, error: null }; 
  }
  
  static getDerivedStateFromError(error) { 
    return { hasError: true, error }; 
  }
  
  componentDidCatch(error, info) { 
    console.error("Unhandled error:", error, info); 
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
          <div className="max-w-md mx-auto bg-red-900/20 border border-red-500/50 rounded-lg p-6">
            <h2 className="text-xl font-bold text-red-400 mb-4">
              ⚠️ Algo deu errado
            </h2>
            <p className="text-red-300 mb-4">
              Ocorreu um erro inesperado. Verifique o console para mais detalhes.
            </p>
            <pre 
              className="text-xs text-red-200 bg-red-900/30 p-3 rounded overflow-auto"
              style={{whiteSpace: "pre-wrap"}}
            >
              {String(this.state.error)}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
            >
              Recarregar Página
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}


