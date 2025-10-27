import React from 'react'

const TestSimplePage = () => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#1f2937', 
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
        🚀 Connectus - Teste Simples
      </h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '2rem', textAlign: 'center' }}>
        Se você está vendo esta página, o React está funcionando!
      </p>
      <div style={{ 
        backgroundColor: '#059669', 
        padding: '1rem 2rem', 
        borderRadius: '0.5rem',
        fontSize: '1.1rem'
      }}>
        ✅ Sistema Funcionando
      </div>
      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <p>Backend: <span style={{ color: '#10b981' }}>http://localhost:8000</span></p>
        <p>Frontend: <span style={{ color: '#10b981' }}>http://localhost:5173</span></p>
      </div>
    </div>
  )
}

export default TestSimplePage






