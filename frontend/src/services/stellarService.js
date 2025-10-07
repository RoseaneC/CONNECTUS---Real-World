// Serviço Stellar com integração real do Freighter
class StellarService {
  constructor() {
    this.network = 'testnet'
    this.horizonUrl = 'https://horizon-testnet.stellar.org'
  }

  // Verificar se Freighter está disponível
  isFreighterAvailable() {
    return typeof window !== 'undefined' && 
           window.freighterApi && 
           typeof window.freighterApi.isConnected === 'function' &&
           typeof window.freighterApi.getPublicKey === 'function'
  }

  // Conectar com Freighter - ABRIR EXTENSÃO DIRETAMENTE
  async connectFreighter() {
    if (!this.isFreighterAvailable()) {
      throw new Error('Freighter não está instalado. Instale em: https://freighter.app/')
    }

    try {
      // Verificar se já está conectado
      const isConnected = await window.freighterApi.isConnected()
      
      if (!isConnected) {
        // Solicitar conexão - isso abrirá a extensão do Freighter
        await window.freighterApi.setAllowed(true)
      }

      // Obter dados da carteira
      const publicKey = await window.freighterApi.getPublicKey()
      const accountId = await window.freighterApi.getAccountId()
      
      if (!publicKey || !accountId) {
        throw new Error('Não foi possível obter dados da carteira')
      }

      return {
        publicKey,
        accountId,
        isConnected: true
      }
    } catch (error) {
      console.error('Erro ao conectar com Freighter:', error)
      throw new Error(`Erro ao conectar com Freighter: ${error.message}`)
    }
  }

  // Conectar e abrir Freighter para login
  async connectForLogin() {
    if (!this.isFreighterAvailable()) {
      throw new Error('Freighter não está instalado. Instale em: https://freighter.app/')
    }

    try {
      // Forçar nova conexão
      await window.freighterApi.setAllowed(true)
      
      const publicKey = await window.freighterApi.getPublicKey()
      const accountId = await window.freighterApi.getAccountId()
      
      return {
        publicKey,
        accountId,
        isConnected: true
      }
    } catch (error) {
      throw new Error(`Erro ao conectar para login: ${error.message}`)
    }
  }

  // Obter informações da conta (simulado)
  async getAccountInfo(publicKey) {
    try {
      // Simular resposta da API Stellar
      return {
        accountId: publicKey,
        sequence: '1',
        balances: [{ asset_type: 'native', balance: '10000.0000000' }],
        subentryCount: 0
      }
    } catch (error) {
      console.error('Erro ao obter informações da conta:', error)
      return null
    }
  }

  // Obter saldo (simulado)
  async getBalance(publicKey, assetCode = 'XLM') {
    try {
      // Simular saldo para testes
      return 10000.0
    } catch (error) {
      console.error('Erro ao obter saldo:', error)
      return 0
    }
  }

  // Obter transações (simulado)
  async getTransactions(publicKey, limit = 10) {
    try {
      // Simular transações para testes
      return [
        {
          hash: 'simulated_hash_1',
          createdAt: new Date().toISOString(),
          sourceAccount: publicKey,
          operationCount: 1,
          successful: true
        }
      ]
    } catch (error) {
      console.error('Erro ao obter transações:', error)
      return []
    }
  }

  // Criar conta (usando friendbot para testnet)
  async createAccount(publicKey) {
    try {
      const response = await fetch(`https://friendbot.stellar.org/?addr=${publicKey}`)
      const result = await response.json()
      
      if (result.successful) {
        return {
          success: true,
          message: 'Conta criada com sucesso'
        }
      } else {
        return {
          success: false,
          message: 'Erro ao criar conta'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: `Erro ao criar conta: ${error.message}`
      }
    }
  }

  // Verificar se conta existe
  async accountExists(publicKey) {
    try {
      // Para testes, sempre retornar true se a chave for válida
      if (this.isValidPublicKey(publicKey)) {
        return true
      }
      return false
    } catch (error) {
      return false
    }
  }

  // Obter informações de rede
  getNetworkInfo() {
    return {
      network: 'testnet',
      horizonUrl: 'https://horizon-testnet.stellar.org',
      networkPassphrase: 'Test SDF Network ; September 2015'
    }
  }

  // Validar chave pública (simulado)
  isValidPublicKey(publicKey) {
    // Validação simples: deve começar com 'G' e ter 56 caracteres
    return typeof publicKey === 'string' && 
           publicKey.startsWith('G') && 
           publicKey.length === 56
  }

  // Validar chave secreta (simulado)
  isValidSecretKey(secretKey) {
    // Validação simples: deve começar com 'S' e ter 56 caracteres
    return typeof secretKey === 'string' && 
           secretKey.startsWith('S') && 
           secretKey.length === 56
  }

  // Gerar par de chaves (simulado)
  generateKeypair() {
    // Gerar chaves simuladas para testes
    const randomString = () => Math.random().toString(36).substring(2, 15)
    return {
      publicKey: 'G' + randomString() + randomString() + randomString() + randomString(),
      secretKey: 'S' + randomString() + randomString() + randomString() + randomString()
    }
  }

  // Instalar Freighter
  getFreighterInstallUrl() {
    return 'https://freighter.app/'
  }

  // Verificar se é testnet
  isTestnet() {
    return this.network === 'testnet'
  }

  // Obter URL do laboratório Stellar
  getLaboratoryUrl() {
    return 'https://www.stellar.org/laboratory/#account-creator'
  }
}

// Instância singleton
const stellarService = new StellarService()

export default stellarService


