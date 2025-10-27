import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ethers } from "ethers"
import { 
  Wallet, 
  Coins, 
  TrendingUp,
  Shield,
  ExternalLink,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const VexaPage = () => {
  const navigate = useNavigate()
  const isDemoMode = import.meta.env.VITE_WEB3_DEMO_MODE === 'true'
  
  // [WEB3 DEMO] Redirect /vexa → /wallet when demo is active
  useEffect(() => {
    if (isDemoMode) {
      navigate('/wallet', { replace: true })
    }
  }, [isDemoMode, navigate])
  
  const { user } = useAuth()
  const [status, setStatus] = useState({ 
    onchain_enabled: false, 
    withdrawals_enabled: false, 
    address: null, 
    verified: false 
  })
  const [loading, setLoading] = useState(false)
  const [transfers, setTransfers] = useState([])
  const [flags, setFlags] = useState({})
  const [stakingEnabled, setStakingEnabled] = useState(false)
  const [tiers, setTiers] = useState([])
  const [positions, setPositions] = useState([])

  async function fetchStatus() {
    try {
      const response = await api.get("/wallet/status")
      setStatus(response.data)
    } catch (error) {
      console.warn("Erro ao buscar status da carteira:", error)
      // Não mostrar toast de erro, apenas log silencioso
    }
  }

  async function fetchTransfers() {
    try {
      const response = await api.get("/wallet/transfers")
      setTransfers(response.data.items || [])
    } catch (error) {
      console.warn("Erro ao buscar transferências:", error)
      setTransfers([]) // Garantir que seja uma lista vazia
    }
  }

  async function fetchAll() {
    await Promise.all([fetchStatus(), fetchTransfers()])
  }

  async function fetchFlags() {
    try {
      const { data } = await api.get("/public/feature-flags") // sem auth
      setFlags(data || {})
      setStakingEnabled(!!(data && data.STAKING_ENABLED))
    } catch (e) {
      console.warn("feature-flags fetch failed", e)
      setFlags({})
      setStakingEnabled(false)
    }
  }

  async function fetchStaking() {
    try {
      // Só busca dados se staking estiver habilitado pelas flags
      if (stakingEnabled) {
        const [tiersResponse, positionsResponse] = await Promise.all([
          api.get("/staking/tiers"),
          api.get("/staking/positions")
        ])
        setTiers(tiersResponse.data || [])
        setPositions(positionsResponse.data || [])
      }
    } catch (error) {
      console.warn("Erro ao buscar dados de staking:", error)
      setTiers([]) // Garantir que seja uma lista vazia
      setPositions([]) // Garantir que seja uma lista vazia
    }
  }

  useEffect(() => {
    fetchAll()
    fetchFlags()
  }, [])

  useEffect(() => {
    if (typeof flags.STAKING_ENABLED !== "undefined") {
      if (flags.STAKING_ENABLED && typeof fetchStaking === "function") {
        fetchStaking()
      }
    }
  }, [flags])

  async function connectWallet() {
    if (!window.ethereum) {
      alert("MetaMask não detectada. Instale a extensão MetaMask para continuar.")
      return
    }

    setLoading(true)
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" })
      
      // 1) pedir mensagem
      const { data: req } = await api.post("/wallet/address/request-message")
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const signature = await signer.signMessage(req.message)
      const address = await signer.getAddress()

      // 2) verificar no backend
      await api.post("/wallet/address/verify", {
        address,
        signature,
        nonce: req.nonce
      })

      await fetchStatus()
      alert("Carteira conectada com sucesso!")
    } catch (error) {
      console.error("Erro ao conectar carteira:", error)
      alert("Erro ao conectar carteira. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  async function requestWithdraw() {
    const amt = prompt("Quantidade de VEXA para sacar (stub):")
    if (!amt) return
    const n = parseInt(amt, 10)
    if (!Number.isFinite(n) || n <= 0) {
      alert("Valor inválido.")
      return
    }

    try {
      await api.post("/wallet/withdraw-intent", { amount: n })
      alert("Solicitação registrada (pending).")
      await fetchTransfers()
    } catch (error) {
      console.error("Erro ao solicitar saque:", error)
      alert("Erro ao solicitar saque. Tente novamente.")
    }
  }

  async function openStake(tierId) {
    const amt = prompt("Quantidade de VEXA para stake:")
    if (!amt) return
    const n = parseInt(amt, 10)
    if (!Number.isFinite(n) || n <= 0) {
      alert("Valor inválido.")
      return
    }

    try {
      await api.post("/staking/open", { tier_id: tierId, amount: n })
      await fetchAll()
      alert("Staking aberto!")
    } catch (error) {
      console.error("Erro ao abrir stake:", error)
      alert("Erro ao abrir stake. Tente novamente.")
    }
  }

  async function claimStake(id) {
    try {
      const response = await api.post("/staking/claim", { position_id: id })
      await fetchAll()
      alert(`Claim OK! Recompensa: ${response.data.reward} VEXA`)
    } catch (error) {
      console.error("Erro ao fazer claim:", error)
      alert("Erro ao fazer claim. Tente novamente.")
    }
  }

  async function closeStake(id) {
    try {
      const response = await api.post("/staking/close", { position_id: id })
      await fetchAll()
      alert(`Stake encerrado! +${response.data.returned} principal, recompensa ${response.data.reward}`)
    } catch (error) {
      console.error("Erro ao fechar stake:", error)
      alert("Erro ao fechar stake. Tente novamente.")
    }
  }

  const stats = [
    {
      title: 'Saldo VEXA',
      value: user?.tokens_available ? parseFloat(user.tokens_available).toFixed(2) : '0.00',
      icon: Coins,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20',
      change: '+5%'
    },
    {
      title: 'XP Total',
      value: user?.xp?.toLocaleString() || 0,
      icon: TrendingUp,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      change: '+12%'
    },
    {
      title: 'Nível Atual',
      value: user?.level || 1,
      icon: Shield,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      change: '+1'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-4"
      >
        <h1 className="text-3xl font-bold text-white">
          🌐 VEXA Web3
        </h1>
        <p className="text-dark-400 max-w-2xl mx-auto">
          Conecte sua carteira e interaja com tokens VEXA na blockchain. 
          Sistema seguro com verificação de posse via assinatura.
        </p>
      </motion.div>

      {/* Estatísticas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {stats.map((stat, index) => (
          <Card key={stat.title} variant="glow" className="relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-dark-400">{stat.title}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </p>
                <p className="text-xs text-green-400 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {stat.change}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
            
            {/* Efeito de partículas */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-xl" />
          </Card>
        ))}
      </motion.div>

      {/* Seção de Carteira Web3 */}
      {status.onchain_enabled && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-6"
        >
          <Card variant="cyber" className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center">
                <Wallet className="w-6 h-6 mr-2" />
                Carteira Web3 (testnet)
              </h2>
              {status.verified && (
                <div className="flex items-center text-green-400">
                  <CheckCircle className="w-5 h-5 mr-1" />
                  <span className="text-sm">Conectada</span>
                </div>
              )}
            </div>

            {status.verified ? (
              <div className="space-y-4">
                <div className="bg-dark-700/50 rounded-lg p-4">
                  <div className="text-sm text-dark-400 mb-1">Endereço vinculado:</div>
                  <div className="font-mono text-white break-all">
                    {status.address}
                  </div>
                </div>
                
                {status.withdrawals_enabled ? (
                  <div className="space-y-2">
                    <Button 
                      onClick={requestWithdraw} 
                      className="w-full"
                      variant="primary"
                    >
                      Solicitar saque (stub)
                    </Button>
                    <p className="text-xs text-dark-400 text-center">
                      Esta é uma versão de demonstração. O saque será processado quando ativado.
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center justify-center p-4 bg-dark-700/30 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-yellow-400 mr-2" />
                    <span className="text-sm text-yellow-400">Saques desativados no momento</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <Button 
                  onClick={connectWallet} 
                  className="w-full"
                  variant="primary"
                  disabled={loading}
                >
                  {loading ? "Conectando..." : "Conectar carteira (assinar mensagem)"}
                </Button>
                <p className="text-xs text-dark-400 text-center">
                  Usaremos testnet quando ativado. Você assina uma mensagem para provar a posse da carteira — sem custo de gas.
                </p>
              </div>
            )}
          </Card>
        </motion.div>
      )}

      {/* Seção de Transferências */}
      {status.verified && transfers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="space-y-4"
        >
          <Card variant="glow" className="p-6">
            <h3 className="text-lg font-bold text-white mb-4">
              Histórico de Transferências
            </h3>
            <div className="space-y-2">
              {transfers.map((transfer) => (
                <div key={transfer.id} className="flex items-center justify-between p-3 bg-dark-700/50 rounded-lg">
                  <div>
                    <div className="text-white font-medium">
                      {transfer.amount} VEXA
                    </div>
                    <div className="text-xs text-dark-400">
                      {new Date(transfer.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      transfer.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      transfer.status === 'sent' ? 'bg-green-500/20 text-green-400' :
                      transfer.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {transfer.status}
                    </span>
                    {transfer.tx_hash && (
                      <ExternalLink className="w-4 h-4 text-dark-400" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Badge de DEBUG - Flags */}
      <div className="text-[11px] bg-yellow-100 text-yellow-800 px-2 py-1 rounded inline-block mb-2">
        DEBUG Flags: {JSON.stringify(flags)}
      </div>

      {/* Seção de Staking */}
      {stakingEnabled && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="space-y-4"
        >
          <Card variant="cyber" className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center">
                <TrendingUp className="w-6 h-6 mr-2" />
                Staking (Piloto)
              </h2>
            </div>
            
            <p className="text-sm text-dark-400 mb-6">
              Trave VEXA e ganhe rendimento proporcional ao tempo.
            </p>

            <div className="grid gap-3 mb-6">
              {tiers.map(t => (
                <div key={t.id} className="border border-dark-600 rounded-lg p-4 flex items-center justify-between bg-dark-700/30">
                  <div className="text-sm">
                    <div className="font-medium text-white">{t.name}</div>
                    <div className="text-xs text-dark-400">
                      APY {(t.apy_bps/100).toFixed(2)}% • Lock {t.lock_days}d • Mín {t.min_amount}
                    </div>
                  </div>
                  <Button 
                    onClick={() => openStake(t.id)} 
                    className="px-3 py-1 rounded bg-primary-500 text-white text-sm hover:bg-primary-600"
                  >
                    Aplicar
                  </Button>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <h3 className="font-medium text-white">Minhas posições</h3>
              {positions.length === 0 ? (
                <div className="text-sm text-dark-400 p-4 bg-dark-700/30 rounded-lg">
                  Sem posições de staking no momento.
                </div>
              ) : (
                <div className="divide-y divide-dark-600 rounded-lg border border-dark-600">
                  {positions.map(p => (
                    <div key={p.id} className="p-4 flex items-center justify-between">
                      <div className="text-sm">
                        <div className="font-medium text-white">
                          {p.tier_name || `Tier #${p.id}`}
                        </div>
                        <div className="text-xs text-dark-400">
                          Principal {p.principal} • APY {(p.apy_bps/100).toFixed(2)}% • Status {p.status}
                        </div>
                        <div className="text-xs text-dark-500">
                          Início: {new Date(p.started_at).toLocaleDateString()} • 
                          Fim: {new Date(p.ends_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {p.status === 'open' && (
                          <>
                            <Button 
                              onClick={() => claimStake(p.id)} 
                              className="px-2 py-1 border border-dark-500 rounded text-sm text-dark-300 hover:bg-dark-600"
                            >
                              Claim
                            </Button>
                            <Button 
                              onClick={() => closeStake(p.id)} 
                              className="px-2 py-1 rounded bg-red-500 text-white text-sm hover:bg-red-600"
                            >
                              Fechar
                            </Button>
                          </>
                        )}
                        {p.status === 'closed' && (
                          <span className="text-xs text-dark-500 px-2 py-1 bg-dark-700/50 rounded">
                            Encerrado
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Informações sobre o sistema */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <Card variant="glow" className="p-6">
          <h3 className="text-lg font-bold text-white mb-3 flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Segurança
          </h3>
          <ul className="space-y-2 text-sm text-dark-400">
            <li>• Verificação de posse via assinatura ECDSA</li>
            <li>• Nenhuma chave privada armazenada no servidor</li>
            <li>• Transações off-chain até ativação da testnet</li>
            <li>• Feature flags para controle granular</li>
          </ul>
        </Card>

        <Card variant="glow" className="p-6">
          <h3 className="text-lg font-bold text-white mb-3 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Roadmap
          </h3>
          <ul className="space-y-2 text-sm text-dark-400">
            <li>• ✅ Verificação de carteira (implementado)</li>
            <li>• ✅ Sistema de saques off-chain (implementado)</li>
            <li>• 🔄 Deploy em testnet (preparado)</li>
            <li>• ⏳ Integração com mainnet (futuro)</li>
          </ul>
        </Card>
      </motion.div>
    </div>
  )
}

export default VexaPage
