import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'

const SimpleLoginPage = () => {
  const navigate = useNavigate()
  const [publicKey, setPublicKey] = useState('GCUVRSEDHTAVXEYAIAMDU7SNCIMNTRVRWMPSACSHO6NV24E4PX2UA6WE')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    try {
      setLoading(true)
      console.log('Tentando login com:', publicKey)
      
      const response = await fetch(`http://localhost:8000/auth/login?stellar_account_id=${publicKey}&public_key=${publicKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      console.log('Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Login success:', data)
        
        // Salvar token
        localStorage.setItem('token', data.access_token)
        
        toast.success('Login realizado com sucesso!')
        navigate('/dashboard')
      } else {
        const errorData = await response.json()
        console.error('Login error:', errorData)
        toast.error(errorData.detail || 'Erro ao fazer login')
      }
    } catch (error) {
      console.error('Erro no login:', error)
      toast.error('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg w-96">
        <h2 className="text-2xl font-bold text-white mb-6">Login Simples</h2>
        
        <div className="mb-4">
          <label className="block text-white mb-2">Chave Pública:</label>
          <input
            type="text"
            value={publicKey}
            onChange={(e) => setPublicKey(e.target.value)}
            className="w-full p-2 bg-gray-700 text-white rounded"
            placeholder="GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
          />
        </div>
        
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
        
        <div className="mt-4 text-sm text-gray-400">
          <p>Chave pré-preenchida para teste</p>
        </div>
      </div>
    </div>
  )
}

export default SimpleLoginPage



