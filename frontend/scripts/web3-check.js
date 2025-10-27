/**
 * Script para verificar conexão Web3 e saldo de tokens
 * 
 * Uso: npm run web3:check
 * 
 * Este script:
 * - Verifica se MetaMask está instalado
 * - Conecta à carteira
 * - Lê saldo de VEXA tokens
 * - Retorna status para automação
 */

import { ethers } from 'ethers';
import { VEXA_TOKEN_ADDRESS, VEXA_TOKEN_ABI } from '../src/web3/contractConfig.js';

const NETWORK_CONFIG = {
  chainId: '0xaa36a7', // 11155111 em hex
  chainName: 'Sepolia',
  rpcUrls: ['https://sepolia.infura.io/v3/'],
  blockExplorerUrls: ['https://sepolia.etherscan.io/'],
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
  },
};

async function checkWeb3Connection() {
  try {
    console.log('🔍 CONNECTUS HACKATHON - VERIFICAÇÃO WEB3');
    console.log('=' .repeat(50));
    console.log('🔍 Verificando conexão Web3...');
    
    // Verificar se MetaMask está instalado
    if (!window.ethereum) {
      console.error('❌ MetaMask não está instalado');
      console.log('💡 Instale MetaMask: https://metamask.io/');
      return 0;
    }
    console.log('✅ MetaMask detectado');

    // Verificar se está na rede correta
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    console.log('🌐 Chain ID atual:', chainId);
    console.log('🌐 Chain ID esperado:', NETWORK_CONFIG.chainId);
    
    if (chainId !== NETWORK_CONFIG.chainId) {
      console.error('❌ Rede incorreta. Use Sepolia Testnet');
      console.log('💡 Troque para Sepolia no MetaMask');
      return 0;
    }
    console.log('✅ Rede Sepolia detectada');

    // Conectar à carteira
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    if (accounts.length === 0) {
      console.error('❌ Nenhuma conta conectada');
      console.log('💡 Conecte uma conta no MetaMask');
      return 0;
    }

    const userAddress = accounts[0];
    console.log('✅ Carteira conectada:', userAddress);

    // Verificar endereço do contrato
    console.log('📄 Endereço do contrato:', VEXA_TOKEN_ADDRESS);
    if (VEXA_TOKEN_ADDRESS === "0x0000000000000000000000000000000000000000") {
      console.error('❌ Endereço do contrato não configurado');
      console.log('💡 Configure VITE_CONTRACT_ADDRESS no .env');
      return 0;
    }
    console.log('✅ Endereço do contrato configurado');

    // Conectar ao contrato
    console.log('🔗 Conectando ao contrato...');
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(VEXA_TOKEN_ADDRESS, VEXA_TOKEN_ABI, provider);

    // Ler saldo
    console.log('💰 Lendo saldo de tokens...');
    const balance = await contract.balanceOf(userAddress);
    const formattedBalance = ethers.formatEther(balance);
    
    console.log('✅ Saldo de VEXA tokens:', formattedBalance);
    console.log('✅ Conexão Web3 funcionando perfeitamente!');
    console.log('=' .repeat(50));
    console.log('🎉 VERIFICAÇÃO CONCLUÍDA COM SUCESSO!');
    
    return 1;
  } catch (error) {
    console.error('❌ Erro na verificação Web3:', error.message);
    console.log('💡 Verifique se o contrato foi deployado corretamente');
    return 0;
  }
}

// Executar verificação
checkWeb3Connection().then(status => {
  process.exit(status);
});
