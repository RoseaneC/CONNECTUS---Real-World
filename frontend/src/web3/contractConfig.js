/**
 * Configuração do Smart Contract VEXAToken
 * 
 * Este arquivo contém as configurações necessárias para interagir
 * com o contrato VEXAToken na blockchain Ethereum (Sepolia Testnet)
 */

// Endereço do contrato VEXAToken na Sepolia Testnet
// IMPORTANTE: Substitua pelo endereço real após o deploy
export const VEXA_TOKEN_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000";

// ABI oficial do contrato VEXAToken (pós-verificação)
import VEXA_TOKEN_ABI_RAW from './abi/VEXAToken.json';
export const VEXA_TOKEN_ABI = VEXA_TOKEN_ABI_RAW;

// Configurações da rede Sepolia
export const NETWORK_CONFIG = {
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

// Configurações do contrato
export const CONTRACT_CONFIG = {
  address: VEXA_TOKEN_ADDRESS,
  abi: VEXA_TOKEN_ABI,
  network: NETWORK_CONFIG,
};
