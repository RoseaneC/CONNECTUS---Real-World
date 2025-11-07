/**
 * Script para demonstração de mint de tokens VEXA
 * 
 * Uso: npm run web3:mint:demo
 * 
 * Este script:
 * - Conecta à carteira
 * - Tenta fazer mint de tokens (apenas se for owner)
 * - Simula mint se não for owner
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

async function mintDemoTokens() {
  try {
    console.log('🪙 Iniciando demonstração de mint...');
    
    // Verificar MetaMask
    if (!window.ethereum) {
      throw new Error('MetaMask não está instalado');
    }

    // Verificar rede
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    if (chainId !== NETWORK_CONFIG.chainId) {
      throw new Error('Use Sepolia Testnet');
    }

    // Conectar à carteira
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    if (accounts.length === 0) {
      throw new Error('Nenhuma conta conectada');
    }

    const userAddress = accounts[0];
    console.log('✅ Carteira conectada:', userAddress);

    // Verificar endereço do contrato
    if (VEXA_TOKEN_ADDRESS === "0x0000000000000000000000000000000000000000") {
      throw new Error('Endereço do contrato não configurado');
    }

    // Conectar ao contrato
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(VEXA_TOKEN_ADDRESS, VEXA_TOKEN_ABI, signer);

    // Verificar se é owner
    const owner = await contract.owner();
    const isOwner = owner.toLowerCase() === userAddress.toLowerCase();

    console.log('👤 Owner do contrato:', owner);
    console.log('🔑 É owner?', isOwner ? 'Sim' : 'Não');

    // Quantidade de tokens para mint (1 VEXA)
    const amount = ethers.parseEther("1");
    console.log('💰 Quantidade a mintar: 1 VEXA');

    if (isOwner) {
      // Mint real (apenas owner)
      console.log('🚀 Executando mint real...');
      
      const tx = await contract.mint(userAddress, amount);
      console.log('⏳ Aguardando confirmação...');
      
      const receipt = await tx.wait();
      console.log('✅ Mint realizado com sucesso!');
      console.log('📄 Transaction Hash:', receipt.hash);
      console.log('🔗 Etherscan:', `https://sepolia.etherscan.io/tx/${receipt.hash}`);
      
    } else {
      // Simular mint (não é owner)
      console.log('🎭 Simulando mint (não é owner)...');
      
      // Simular delay de transação
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const simulatedTxHash = '0x' + Math.random().toString(16).substr(2, 64);
      console.log('✅ Simulação de mint concluída!');
      console.log('📄 Simulated Hash:', simulatedTxHash);
      console.log('💡 Para mint real, use a conta que fez o deploy do contrato');
    }

    // Verificar saldo final
    const balance = await contract.balanceOf(userAddress);
    const formattedBalance = ethers.formatEther(balance);
    console.log('💰 Saldo final de VEXA:', formattedBalance);

  } catch (error) {
    console.error('❌ Erro na demonstração de mint:', error.message);
    
    if (error.code === 'ACTION_REJECTED') {
      console.log('💡 Transação rejeitada pelo usuário');
    } else if (error.message.includes('insufficient funds')) {
      console.log('💡 Saldo insuficiente para gas. Use faucet de Sepolia');
    } else if (error.message.includes('Ownable: caller is not the owner')) {
      console.log('💡 Apenas o owner pode fazer mint. Use a conta que fez o deploy');
    }
  }
}

// Executar demonstração
mintDemoTokens();









